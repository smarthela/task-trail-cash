
-- Referral tree integrity
CREATE UNIQUE INDEX IF NOT EXISTS referrals_referee_unique ON public.referrals(referee_id);
CREATE INDEX IF NOT EXISTS profiles_referred_by_idx ON public.profiles(referred_by);

CREATE OR REPLACE FUNCTION public._guard_referred_by() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.referred_by IS DISTINCT FROM OLD.referred_by THEN
    RAISE EXCEPTION 'Referrer link is permanent';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS profiles_guard_referred_by ON public.profiles;
CREATE TRIGGER profiles_guard_referred_by BEFORE UPDATE OF referred_by ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public._guard_referred_by();

ALTER TABLE public.referrals ADD CONSTRAINT referrals_no_self CHECK (referrer_id <> referee_id) NOT VALID;

-- Upline (ancestors) for the signed-in user or admin
CREATE OR REPLACE FUNCTION public.referral_upline(_user uuid, _max_depth int DEFAULT 10)
RETURNS TABLE(user_id uuid, depth int) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH RECURSIVE up AS (
    SELECT p.referred_by AS user_id, 1 AS depth FROM public.profiles p
     WHERE p.id = _user AND p.referred_by IS NOT NULL AND (_user = auth.uid() OR public.is_admin(auth.uid()))
    UNION ALL
    SELECT p.referred_by, up.depth + 1 FROM up JOIN public.profiles p ON p.id = up.user_id
     WHERE p.referred_by IS NOT NULL AND up.depth < least(_max_depth, 20)
  ) SELECT * FROM up;
$$;

-- Downline counts per level for the signed-in user
CREATE OR REPLACE FUNCTION public.my_referral_network(_max_depth int DEFAULT 5)
RETURNS TABLE(depth int, members bigint, qualified bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH RECURSIVE down AS (
    SELECT p.id, 1 AS depth FROM public.profiles p WHERE p.referred_by = auth.uid()
    UNION ALL
    SELECT p.id, down.depth + 1 FROM down JOIN public.profiles p ON p.referred_by = down.id
     WHERE down.depth < least(_max_depth, 10)
  )
  SELECT d.depth, count(*), count(r.id) FILTER (WHERE r.status = 'rewarded')
  FROM down d LEFT JOIN public.referrals r ON r.referee_id = d.id
  GROUP BY d.depth ORDER BY d.depth;
$$;

-- Earning links (Post Earning Links + Crypto Clicks)
CREATE TABLE public.earning_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL DEFAULT 'earn' CHECK (section IN ('earn','crypto')),
  kind text NOT NULL CHECK (kind IN ('affiliate','app_referral','banking','promo','crypto_offer','crypto_quest','testnet','education','other')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  instructions text NOT NULL DEFAULT '',
  url text NOT NULL,
  reward numeric NOT NULL DEFAULT 0 CHECK (reward >= 0),
  verification text NOT NULL DEFAULT 'manual' CHECK (verification IN ('manual','proof','link','text','api')),
  verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified','verified','flagged')),
  risk_note text,
  max_completions integer,
  completions_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','expired')),
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.earning_links TO authenticated;
GRANT ALL ON public.earning_links TO service_role;
ALTER TABLE public.earning_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active links visible" ON public.earning_links FOR SELECT TO authenticated
  USING (status = 'active' OR public.is_admin(auth.uid()));
CREATE POLICY "Admins insert links" ON public.earning_links FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins update links" ON public.earning_links FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins delete links" ON public.earning_links FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE INDEX earning_links_section_status_idx ON public.earning_links(section, status);

CREATE TABLE public.earning_link_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.earning_links(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.earning_link_clicks TO authenticated;
GRANT ALL ON public.earning_link_clicks TO service_role;
ALTER TABLE public.earning_link_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own or admin clicks" ON public.earning_link_clicks FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE INDEX earning_link_clicks_link_idx ON public.earning_link_clicks(link_id);

CREATE TABLE public.earning_link_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.earning_links(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  proof_text text,
  proof_url text,
  reward numeric NOT NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','approved','rejected')),
  transaction_id uuid,
  reviewer_id uuid,
  review_note text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (link_id, user_id)
);
GRANT SELECT ON public.earning_link_submissions TO authenticated;
GRANT ALL ON public.earning_link_submissions TO service_role;
ALTER TABLE public.earning_link_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own or admin link submissions" ON public.earning_link_submissions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE INDEX earning_link_submissions_status_idx ON public.earning_link_submissions(status);

-- Record a click (no money involved)
CREATE OR REPLACE FUNCTION public.record_link_click(_link_id uuid) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE l public.earning_links;
BEGIN
  PERFORM public._require_active();
  SELECT * INTO l FROM public.earning_links WHERE id = _link_id AND status = 'active';
  IF l.id IS NULL THEN RAISE EXCEPTION 'Offer not available'; END IF;
  INSERT INTO public.earning_link_clicks(link_id, user_id) VALUES (_link_id, auth.uid());
  RETURN l.url;
END $$;

-- Submit completion: reward goes to pending only, once per user per link
CREATE OR REPLACE FUNCTION public.submit_link_completion(_link_id uuid, _proof_text text DEFAULT NULL, _proof_url text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE l public.earning_links; sid uuid; tx uuid;
BEGIN
  PERFORM public._require_active();
  SELECT * INTO l FROM public.earning_links WHERE id = _link_id FOR UPDATE;
  IF l.id IS NULL OR l.status <> 'active' OR (l.expires_at IS NOT NULL AND now() > l.expires_at) THEN
    RAISE EXCEPTION 'Offer not available'; END IF;
  IF l.max_completions IS NOT NULL AND l.completions_count >= l.max_completions THEN RAISE EXCEPTION 'This offer is full'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.earning_link_clicks WHERE link_id = _link_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Open the offer before submitting'; END IF;
  IF EXISTS (SELECT 1 FROM public.earning_link_submissions WHERE link_id = _link_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'You have already submitted this offer'; END IF;
  IF coalesce(trim(_proof_text),'') = '' AND coalesce(trim(_proof_url),'') = '' THEN
    RAISE EXCEPTION 'Please provide proof of completion'; END IF;

  INSERT INTO public.earning_link_submissions(link_id, user_id, proof_text, proof_url, reward)
  VALUES (_link_id, auth.uid(), _proof_text, _proof_url, l.reward) RETURNING id INTO sid;
  UPDATE public.earning_links SET completions_count = completions_count + 1 WHERE id = _link_id;
  IF l.reward > 0 THEN
    INSERT INTO public.wallet_transactions(user_id, amount, type, status, source, description, related_id)
    VALUES (auth.uid(), l.reward, 'TASK_REWARD', 'pending', CASE WHEN l.section = 'crypto' THEN 'crypto_click' ELSE 'earning_link' END,
            l.title || ' — awaiting verification', sid) RETURNING id INTO tx;
    UPDATE public.earning_link_submissions SET transaction_id = tx WHERE id = sid;
    UPDATE public.wallets SET pending = pending + l.reward, updated_at = now() WHERE user_id = auth.uid();
  END IF;
  RETURN sid;
END $$;

-- Admin review: approve moves pending -> available, reject reverses
CREATE OR REPLACE FUNCTION public.review_link_submission(_id uuid, _approve boolean, _note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.earning_link_submissions; l public.earning_links;
BEGIN
  PERFORM public._require_admin();
  SELECT * INTO s FROM public.earning_link_submissions WHERE id = _id FOR UPDATE;
  IF s.id IS NULL THEN RAISE EXCEPTION 'Submission not found'; END IF;
  IF s.status <> 'submitted' THEN RAISE EXCEPTION 'Already reviewed'; END IF;
  SELECT * INTO l FROM public.earning_links WHERE id = s.link_id;
  IF _approve THEN
    IF s.transaction_id IS NOT NULL THEN
      UPDATE public.wallet_transactions SET status = 'completed', description = l.title, updated_at = now()
       WHERE id = s.transaction_id AND status = 'pending';
      UPDATE public.wallets SET pending = pending - s.reward, available = available + s.reward,
        lifetime_earned = lifetime_earned + s.reward, updated_at = now() WHERE user_id = s.user_id;
    END IF;
    UPDATE public.earning_link_submissions SET status = 'approved', reviewer_id = auth.uid(), review_note = _note, reviewed_at = now() WHERE id = _id;
    PERFORM public._notify(s.user_id, 'task_approved', 'Earnings verified', '+KSh ' || s.reward || ' from ' || l.title || ' is now available.', '/wallet');
  ELSE
    IF s.transaction_id IS NOT NULL THEN
      UPDATE public.wallet_transactions SET status = 'reversed', updated_at = now() WHERE id = s.transaction_id AND status = 'pending';
      UPDATE public.wallets SET pending = pending - s.reward, updated_at = now() WHERE user_id = s.user_id;
    END IF;
    UPDATE public.earning_links SET completions_count = greatest(completions_count - 1, 0) WHERE id = s.link_id;
    UPDATE public.earning_link_submissions SET status = 'rejected', reviewer_id = auth.uid(), review_note = _note, reviewed_at = now() WHERE id = _id;
    PERFORM public._notify(s.user_id, 'task_rejected', 'Submission not approved', l.title || coalesce(': ' || _note, ''), '/wallet');
  END IF;
  PERFORM public._log_admin(CASE WHEN _approve THEN 'approve_link_submission' ELSE 'reject_link_submission' END, 'earning_link_submission', _id, jsonb_build_object('note', _note));
END $$;

REVOKE EXECUTE ON FUNCTION public.record_link_click(uuid), public.submit_link_completion(uuid, text, text),
  public.review_link_submission(uuid, boolean, text), public.referral_upline(uuid, int), public.my_referral_network(int) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.record_link_click(uuid), public.submit_link_completion(uuid, text, text),
  public.review_link_submission(uuid, boolean, text), public.referral_upline(uuid, int), public.my_referral_network(int) TO authenticated;
