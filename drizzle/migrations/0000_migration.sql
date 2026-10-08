
-- ===== ENUMS =====
create type public.app_role as enum ('user','freelancer','advertiser','admin','super_admin');
create type public.task_status as enum ('draft','published','active','paused','completed','expired','rejected');
create type public.submission_status as enum ('started','submitted','under_review','approved','rejected','rewarded');
create type public.txn_type as enum ('TASK_REWARD','SURVEY_REWARD','CAMPAIGN_REWARD','REFERRAL_REWARD','BONUS','FREELANCE_PAYMENT','MARKETPLACE_EARNING','WITHDRAWAL','REFUND','ADJUSTMENT');
create type public.txn_status as enum ('pending','completed','reversed','failed');
create type public.withdrawal_status as enum ('requested','pending_review','approved','processing','paid','rejected','cancelled','failed');
create type public.verification_method as enum ('automatic','upload_proof','text','link','survey','api','manual');

-- ===== PROFILES & ROLES =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  skills text[] not null default '{}',
  location text,
  portfolio jsonb not null default '[]',
  hourly_rate numeric(12,2),
  referral_code text unique not null,
  referred_by uuid,
  xp integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.profiles to authenticated;
grant update (username, full_name, avatar_url, bio, skills, location, portfolio, hourly_rate, updated_at) on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','super_admin'))
$$;

create policy "profiles readable by signed-in users" on public.profiles for select to authenticated using (true);
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "users see own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- ===== SETTINGS =====
create table public.platform_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now()
);
grant select on public.platform_settings to authenticated;
grant all on public.platform_settings to service_role;
alter table public.platform_settings enable row level security;
create policy "settings readable" on public.platform_settings for select to authenticated using (true);

insert into public.platform_settings(key, value, description) values
 ('currency', '"KES"', 'Primary currency'),
 ('min_withdrawal', '100', 'Minimum withdrawal amount (KSh)'),
 ('withdrawal_fee_flat', '0', 'Flat withdrawal fee (KSh)'),
 ('withdrawal_fee_pct', '0', 'Percent withdrawal fee'),
 ('max_daily_withdrawals', '3', 'Max withdrawal requests per user per day'),
 ('payout_methods', '["mpesa"]', 'Supported payout methods'),
 ('referral_reward', '50', 'Reward paid to referrer when referee qualifies (KSh)'),
 ('referral_qualifying_action', '"first_approved_task"', 'What a referee must do to qualify'),
 ('daily_checkin_reward', '2', 'Daily check-in reward (KSh)'),
 ('daily_checkin_xp', '5', 'XP per daily check-in'),
 ('xp_per_task', '10', 'XP granted per approved task'),
 ('max_task_reward', '5000', 'Maximum reward per task (KSh)'),
 ('levels', '[{"name":"Bronze","min_xp":0},{"name":"Silver","min_xp":500},{"name":"Gold","min_xp":2000},{"name":"Platinum","min_xp":6000}]', 'User levels by XP'),
 ('campaign_commission_pct', '10', 'Platform commission on campaign funding'),
 ('marketplace_commission_pct', '15', 'Platform commission on marketplace sales'),
 ('freelance_fee_pct', '8', 'Platform fee on freelance payments'),
 ('campaign_max_budget', '5000000', 'Maximum campaign budget (KSh)'),
 ('spin_wheel_enabled', 'false', 'Spin wheel stays disabled until compliance review'),
 ('spin_daily_limit', '1', 'Free spins per day'),
 ('payout_provider_configured', 'false', 'Set true once an M-Pesa payout provider is connected');

create or replace function public.setting_num(_key text)
returns numeric language sql stable security definer set search_path = public as $$
  select coalesce((select (value #>> '{}')::numeric from public.platform_settings where key = _key), 0)
$$;

-- ===== WALLET & LEDGER =====
create table public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  available numeric(14,2) not null default 0 check (available >= 0),
  pending numeric(14,2) not null default 0 check (pending >= 0),
  lifetime_earned numeric(14,2) not null default 0,
  total_withdrawn numeric(14,2) not null default 0,
  updated_at timestamptz not null default now()
);
grant select on public.wallets to authenticated;
grant all on public.wallets to service_role;
alter table public.wallets enable row level security;
create policy "own wallet" on public.wallets for select to authenticated using (auth.uid() = user_id or public.is_admin(auth.uid()));

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(14,2) not null,
  type public.txn_type not null,
  status public.txn_status not null default 'pending',
  source text not null,
  reference text not null default ('TX-' || upper(substr(md5(random()::text), 1, 10))),
  description text not null,
  related_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.wallet_transactions(user_id, created_at desc);
grant select on public.wallet_transactions to authenticated;
grant all on public.wallet_transactions to service_role;
alter table public.wallet_transactions enable row level security;
create policy "own txns" on public.wallet_transactions for select to authenticated using (auth.uid() = user_id or public.is_admin(auth.uid()));

create table public.platform_ledger (
  id uuid primary key default gen_random_uuid(),
  amount numeric(14,2) not null,
  kind text not null,
  source text not null,
  reference text,
  description text,
  related_id uuid,
  created_at timestamptz not null default now()
);
grant select on public.platform_ledger to authenticated;
grant all on public.platform_ledger to service_role;
alter table public.platform_ledger enable row level security;
create policy "admins read platform ledger" on public.platform_ledger for select to authenticated using (public.is_admin(auth.uid()));

-- ===== NOTIFICATIONS / AUDIT / FRAUD =====
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.notifications(user_id, created_at desc);
grant select, delete on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own notifications" on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "mark own read" on public.notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on public.notifications for delete to authenticated using (auth.uid() = user_id);

create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null,
  action text not null,
  target_type text not null,
  target_id uuid,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
grant select on public.admin_actions to authenticated;
grant all on public.admin_actions to service_role;
alter table public.admin_actions enable row level security;
create policy "admins read audit" on public.admin_actions for select to authenticated using (public.is_admin(auth.uid()));

create table public.fraud_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  kind text not null,
  severity text not null default 'medium',
  details jsonb not null default '{}',
  status text not null default 'open',
  resolved_by uuid,
  created_at timestamptz not null default now()
);
grant select, update on public.fraud_flags to authenticated;
grant all on public.fraud_flags to service_role;
alter table public.fraud_flags enable row level security;
create policy "admins manage fraud" on public.fraud_flags for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ===== CAMPAIGNS =====
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text not null default '',
  objective text,
  campaign_type text not null default 'awareness',
  target_audience text,
  participants_target integer,
  reward_per_action numeric(12,2) not null default 0,
  budget numeric(14,2) not null default 0,
  funded numeric(14,2) not null default 0,
  allocated numeric(14,2) not null default 0,
  spent numeric(14,2) not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  instructions text,
  verification_requirements text,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.campaigns to authenticated;
grant update (name, description, objective, campaign_type, target_audience, participants_target, reward_per_action, budget, starts_at, ends_at, instructions, verification_requirements, status) on public.campaigns to authenticated;
grant all on public.campaigns to service_role;
alter table public.campaigns enable row level security;
create policy "view campaigns" on public.campaigns for select to authenticated using (status in ('active','funded') or owner_id = auth.uid() or public.is_admin(auth.uid()));
create policy "create own campaigns" on public.campaigns for insert to authenticated with check (owner_id = auth.uid() and status in ('draft','pending_review') and funded = 0 and allocated = 0 and spent = 0);
create policy "edit own draft campaigns" on public.campaigns for update to authenticated using (owner_id = auth.uid() and status in ('draft','pending_review')) with check (owner_id = auth.uid() and status in ('draft','pending_review'));
create policy "delete own draft campaigns" on public.campaigns for delete to authenticated using (owner_id = auth.uid() and status = 'draft' and funded = 0);

create table public.campaign_participants (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  actions_completed integer not null default 0,
  joined_at timestamptz not null default now(),
  unique (campaign_id, user_id)
);
grant select on public.campaign_participants to authenticated;
grant all on public.campaign_participants to service_role;
alter table public.campaign_participants enable row level security;
create policy "view participation" on public.campaign_participants for select to authenticated using (
  user_id = auth.uid() or public.is_admin(auth.uid()) or exists (select 1 from public.campaigns c where c.id = campaign_id and c.owner_id = auth.uid()));

-- ===== TASKS =====
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  instructions text not null default '',
  category text not null default 'quick',
  reward numeric(12,2) not null check (reward >= 0),
  estimated_minutes integer not null default 5,
  requirements text,
  max_participants integer,
  per_user_limit integer not null default 1,
  starts_at timestamptz,
  ends_at timestamptz,
  verification_method public.verification_method not null default 'manual',
  status public.task_status not null default 'draft',
  sponsor text,
  budget numeric(14,2),
  campaign_id uuid references public.campaigns(id) on delete set null,
  eligibility jsonb not null default '{}',
  min_seconds integer not null default 0,
  external_url text,
  completions_count integer not null default 0,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.tasks(status, category);
grant select, insert, update, delete on public.tasks to authenticated;
grant all on public.tasks to service_role;
alter table public.tasks enable row level security;
create policy "view live tasks" on public.tasks for select to authenticated using (status in ('active','published') or created_by = auth.uid() or public.is_admin(auth.uid()));
create policy "admins manage tasks" on public.tasks for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "campaign owners draft tasks" on public.tasks for insert to authenticated with check (
  status = 'draft' and created_by = auth.uid() and campaign_id is not null and
  exists (select 1 from public.campaigns c where c.id = campaign_id and c.owner_id = auth.uid()));

create table public.task_submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.submission_status not null default 'started',
  content text,
  link_url text,
  proof_path text,
  answers jsonb,
  reward numeric(12,2) not null default 0,
  transaction_id uuid,
  flagged boolean not null default false,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewer_id uuid,
  review_note text,
  created_at timestamptz not null default now()
);
create index on public.task_submissions(user_id, created_at desc);
create index on public.task_submissions(task_id, status);
grant select on public.task_submissions to authenticated;
grant all on public.task_submissions to service_role;
alter table public.task_submissions enable row level security;
create policy "own submissions" on public.task_submissions for select to authenticated using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- ===== SURVEYS =====
create table public.surveys (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null unique references public.tasks(id) on delete cascade,
  title text not null,
  closes_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.survey_questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  position integer not null default 0,
  kind text not null default 'single',
  prompt text not null,
  options jsonb not null default '[]',
  required boolean not null default true
);
create table public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  submission_id uuid references public.task_submissions(id) on delete set null,
  answers jsonb not null,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  unique (survey_id, user_id)
);
grant select, insert, update, delete on public.surveys, public.survey_questions to authenticated;
grant select on public.survey_responses to authenticated;
grant all on public.surveys, public.survey_questions, public.survey_responses to service_role;
alter table public.surveys enable row level security;
alter table public.survey_questions enable row level security;
alter table public.survey_responses enable row level security;
create policy "read surveys" on public.surveys for select to authenticated using (true);
create policy "admin surveys" on public.surveys for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "read questions" on public.survey_questions for select to authenticated using (true);
create policy "admin questions" on public.survey_questions for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "own responses" on public.survey_responses for select to authenticated using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- ===== FREELANCE =====
create table public.freelance_jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null default 'other',
  skills text[] not null default '{}',
  budget_min numeric(12,2),
  budget_max numeric(12,2) not null,
  budget_type text not null default 'fixed',
  deadline date,
  status text not null default 'open',
  funded boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.freelance_jobs to authenticated;
grant update (title, description, category, skills, budget_min, budget_max, budget_type, deadline, status) on public.freelance_jobs to authenticated;
grant all on public.freelance_jobs to service_role;
alter table public.freelance_jobs enable row level security;
create policy "read jobs" on public.freelance_jobs for select to authenticated using (true);
create policy "post jobs" on public.freelance_jobs for insert to authenticated with check (client_id = auth.uid() and funded = false);
create policy "edit own jobs" on public.freelance_jobs for update to authenticated using (client_id = auth.uid() or public.is_admin(auth.uid()));
create policy "delete own jobs" on public.freelance_jobs for delete to authenticated using (client_id = auth.uid() and status = 'open');

create table public.freelance_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.freelance_jobs(id) on delete cascade,
  freelancer_id uuid not null references public.profiles(id) on delete cascade,
  cover_letter text not null,
  proposed_amount numeric(12,2) not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (job_id, freelancer_id)
);
grant select, insert on public.freelance_applications to authenticated;
grant update (status) on public.freelance_applications to authenticated;
grant all on public.freelance_applications to service_role;
alter table public.freelance_applications enable row level security;
create policy "view applications" on public.freelance_applications for select to authenticated using (
  freelancer_id = auth.uid() or public.is_admin(auth.uid()) or exists (select 1 from public.freelance_jobs j where j.id = job_id and j.client_id = auth.uid()));
create policy "apply" on public.freelance_applications for insert to authenticated with check (
  freelancer_id = auth.uid() and status = 'pending' and not exists (select 1 from public.freelance_jobs j where j.id = job_id and j.client_id = auth.uid()));
create policy "withdraw own or client shortlist" on public.freelance_applications for update to authenticated using (
  freelancer_id = auth.uid() or exists (select 1 from public.freelance_jobs j where j.id = job_id and j.client_id = auth.uid()))
  with check (status in ('pending','shortlisted','rejected','withdrawn'));

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.freelance_jobs(id) on delete cascade,
  application_id uuid references public.freelance_applications(id) on delete set null,
  client_id uuid not null references public.profiles(id),
  freelancer_id uuid not null references public.profiles(id),
  amount numeric(12,2) not null,
  status text not null default 'pending_funding',
  created_at timestamptz not null default now()
);
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null,
  due_date date,
  status text not null default 'pending',
  submission text,
  created_at timestamptz not null default now()
);
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id),
  reviewee_id uuid not null references public.profiles(id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (contract_id, reviewer_id)
);
grant select on public.contracts, public.milestones to authenticated;
grant select, insert on public.reviews to authenticated;
grant all on public.contracts, public.milestones, public.reviews to service_role;
alter table public.contracts enable row level security;
alter table public.milestones enable row level security;
alter table public.reviews enable row level security;
create policy "parties view contracts" on public.contracts for select to authenticated using (client_id = auth.uid() or freelancer_id = auth.uid() or public.is_admin(auth.uid()));
create policy "parties view milestones" on public.milestones for select to authenticated using (exists (select 1 from public.contracts c where c.id = contract_id and (c.client_id = auth.uid() or c.freelancer_id = auth.uid() or public.is_admin(auth.uid()))));
create policy "read reviews" on public.reviews for select to authenticated using (true);
create policy "parties review completed" on public.reviews for insert to authenticated with check (
  reviewer_id = auth.uid() and exists (select 1 from public.contracts c where c.id = contract_id and c.status = 'completed'
    and ((c.client_id = auth.uid() and c.freelancer_id = reviewee_id) or (c.freelancer_id = auth.uid() and c.client_id = reviewee_id))));

-- ===== MARKETPLACE =====
create table public.marketplace_products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null default 'other',
  price numeric(12,2) not null check (price >= 0),
  preview_url text,
  file_path text,
  status text not null default 'pending_review',
  sales_count integer not null default 0,
  created_at timestamptz not null default now()
);
create table public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.marketplace_products(id),
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  amount numeric(12,2) not null,
  commission numeric(12,2) not null default 0,
  status text not null default 'pending_payment',
  created_at timestamptz not null default now()
);
create table public.marketplace_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.marketplace_products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
grant select, insert, delete on public.marketplace_products to authenticated;
grant update (title, description, category, price, preview_url, file_path) on public.marketplace_products to authenticated;
grant select on public.marketplace_orders to authenticated;
grant select, insert on public.marketplace_reviews to authenticated;
grant all on public.marketplace_products, public.marketplace_orders, public.marketplace_reviews to service_role;
alter table public.marketplace_products enable row level security;
alter table public.marketplace_orders enable row level security;
alter table public.marketplace_reviews enable row level security;
create policy "view products" on public.marketplace_products for select to authenticated using (status = 'approved' or seller_id = auth.uid() or public.is_admin(auth.uid()));
create policy "list products" on public.marketplace_products for insert to authenticated with check (seller_id = auth.uid() and status = 'pending_review' and sales_count = 0);
create policy "edit own products" on public.marketplace_products for update to authenticated using (seller_id = auth.uid());
create policy "delete own products" on public.marketplace_products for delete to authenticated using (seller_id = auth.uid() and sales_count = 0);
create policy "order parties" on public.marketplace_orders for select to authenticated using (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin(auth.uid()));
create policy "read product reviews" on public.marketplace_reviews for select to authenticated using (true);
create policy "buyers review" on public.marketplace_reviews for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from public.marketplace_orders o where o.product_id = marketplace_reviews.product_id and o.buyer_id = auth.uid() and o.status = 'paid'));

-- ===== DEALS =====
create table public.deals (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  title text not null,
  description text not null default '',
  deal_type text not null default 'discount',
  reward_text text not null,
  requirements text,
  promo_code text,
  url text,
  verification text,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.deal_clicks (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.deals to authenticated;
grant select, insert on public.deal_clicks to authenticated;
grant all on public.deals, public.deal_clicks to service_role;
alter table public.deals enable row level security;
alter table public.deal_clicks enable row level security;
create policy "view active deals" on public.deals for select to authenticated using (active or public.is_admin(auth.uid()));
create policy "admin deals" on public.deals for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "track own clicks" on public.deal_clicks for insert to authenticated with check (user_id = auth.uid());
create policy "view own clicks" on public.deal_clicks for select to authenticated using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- ===== REFERRALS =====
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referee_id uuid not null unique references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  qualified_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.referrals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null,
  transaction_id uuid,
  created_at timestamptz not null default now()
);
grant select on public.referrals, public.referral_rewards to authenticated;
grant all on public.referrals, public.referral_rewards to service_role;
alter table public.referrals enable row level security;
alter table public.referral_rewards enable row level security;
create policy "view own referrals" on public.referrals for select to authenticated using (referrer_id = auth.uid() or referee_id = auth.uid() or public.is_admin(auth.uid()));
create policy "view own referral rewards" on public.referral_rewards for select to authenticated using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- ===== REWARDS / GAMIFICATION =====
create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  amount numeric(12,2) not null default 0,
  xp integer not null default 0,
  claim_date date not null default current_date,
  streak integer not null default 0,
  created_at timestamptz not null default now()
);
create unique index rewards_daily_once on public.rewards(user_id, claim_date) where kind = 'daily_checkin';
create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  metric text not null,
  target numeric not null,
  reward numeric(12,2) not null default 0,
  xp integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.user_challenges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  claimed_at timestamptz not null default now(),
  primary key (user_id, challenge_id)
);
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  icon text
);
create table public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);
create table public.spin_wheel_segments (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  amount numeric(12,2) not null default 0,
  probability numeric not null default 0,
  active boolean not null default true
);
grant select on public.rewards, public.user_challenges, public.user_badges to authenticated;
grant select, insert, update, delete on public.challenges, public.badges, public.spin_wheel_segments to authenticated;
grant all on public.rewards, public.challenges, public.user_challenges, public.badges, public.user_badges, public.spin_wheel_segments to service_role;
alter table public.rewards enable row level security;
alter table public.challenges enable row level security;
alter table public.user_challenges enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.spin_wheel_segments enable row level security;
create policy "own rewards" on public.rewards for select to authenticated using (user_id = auth.uid() or public.is_admin(auth.uid()));
create policy "own claimed challenges" on public.user_challenges for select to authenticated using (user_id = auth.uid());
create policy "read badges earned" on public.user_badges for select to authenticated using (true);
create policy "read challenges" on public.challenges for select to authenticated using (active or public.is_admin(auth.uid()));
create policy "admin challenges" on public.challenges for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "read badges" on public.badges for select to authenticated using (true);
create policy "admin badges" on public.badges for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "read wheel" on public.spin_wheel_segments for select to authenticated using (true);
create policy "admin wheel" on public.spin_wheel_segments for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

insert into public.badges(code, name, description, icon) values
 ('first_task','First Task','Completed your first verified task','sparkles'),
 ('ten_tasks','10 Tasks','Ten verified tasks completed','target'),
 ('first_withdrawal','First Withdrawal','Received your first payout','banknote'),
 ('top_freelancer','Top Freelancer','Consistently top-rated freelance work','briefcase'),
 ('survey_master','Survey Master','Completed 10 verified surveys','clipboard'),
 ('referral_milestone','Referral Milestone','5 qualified referrals','users');

insert into public.challenges(title, description, metric, target, reward, xp) values
 ('Complete 5 tasks','Get 5 tasks verified','tasks_completed',5,20,50),
 ('Complete 3 surveys','Get 3 surveys verified','surveys_completed',3,15,30),
 ('Earn KSh 500','Reach KSh 500 in verified earnings','earned_amount',500,25,60),
 ('Complete a campaign','Get one campaign action verified','campaigns_completed',1,10,25);

-- ===== PAYOUTS =====
create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  method text not null default 'mpesa',
  account_name text not null,
  account_number text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.payment_methods to authenticated;
grant all on public.payment_methods to service_role;
alter table public.payment_methods enable row level security;
create policy "own payment methods" on public.payment_methods for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  fee numeric(14,2) not null default 0,
  method text not null,
  destination text not null,
  status public.withdrawal_status not null default 'pending_review',
  transaction_id uuid,
  payout_reference text,
  provider_response jsonb,
  review_note text,
  reviewed_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.withdrawal_requests(status, created_at desc);
grant select on public.withdrawal_requests to authenticated;
grant all on public.withdrawal_requests to service_role;
alter table public.withdrawal_requests enable row level security;
create policy "own withdrawals" on public.withdrawal_requests for select to authenticated using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- ===== HELPERS =====
create or replace function public._notify(_user uuid, _kind text, _title text, _body text, _link text default null)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications(user_id, kind, title, body, link) values (_user, _kind, _title, _body, _link);
$$;

create or replace function public._award_badge(_user uuid, _code text)
returns void language plpgsql security definer set search_path = public as $$
declare b uuid;
begin
  select id into b from public.badges where code = _code;
  if b is null then return; end if;
  insert into public.user_badges(user_id, badge_id) values (_user, b) on conflict do nothing;
  if found then perform public._notify(_user, 'badge', 'Badge unlocked', (select name from public.badges where id = b), '/profile'); end if;
end $$;

create or replace function public._log_admin(_action text, _type text, _id uuid, _details jsonb default '{}')
returns void language sql security definer set search_path = public as $$
  insert into public.admin_actions(admin_id, action, target_type, target_id, details) values (auth.uid(), _action, _type, _id, _details);
$$;

create or replace function public._require_admin()
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin(auth.uid()) then raise exception 'Admin access required'; end if;
end $$;

create or replace function public._require_active()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if exists (select 1 from public.profiles where id = auth.uid() and status <> 'active') then
    raise exception 'Your account is not active. Contact support.';
  end if;
end $$;

-- ===== SIGNUP =====
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _code text;
  _uname text := nullif(lower(trim(new.raw_user_meta_data->>'username')), '');
  _ref text := nullif(upper(trim(new.raw_user_meta_data->>'referral_code')), '');
  _referrer uuid;
begin
  loop
    _code := upper(substr(md5(random()::text || new.id::text), 1, 8));
    exit when not exists (select 1 from public.profiles where referral_code = _code);
  end loop;
  if _uname is not null and exists (select 1 from public.profiles where username = _uname) then _uname := null; end if;
  if _ref is not null then select id into _referrer from public.profiles where referral_code = _ref; end if;

  insert into public.profiles(id, username, full_name, avatar_url, referral_code, referred_by)
  values (new.id, _uname, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
          new.raw_user_meta_data->>'avatar_url', _code, _referrer);
  insert into public.wallets(user_id) values (new.id);
  insert into public.user_roles(user_id, role) values (new.id, 'user');
  if not exists (select 1 from public.user_roles where role = 'super_admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'super_admin'), (new.id, 'admin');
  end if;
  if _referrer is not null then
    insert into public.referrals(referrer_id, referee_id) values (_referrer, new.id);
    perform public._notify(_referrer, 'referral', 'New referral joined', 'Someone signed up with your code. You earn when they complete their first verified task.', '/referrals');
  end if;
  perform public._notify(new.id, 'welcome', 'Welcome to SmartHELA', 'Complete your profile and start your first task.', '/profile');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.enable_capability(_role public.app_role)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_active();
  if _role not in ('freelancer','advertiser') then raise exception 'This capability cannot be self-enabled'; end if;
  insert into public.user_roles(user_id, role) values (auth.uid(), _role) on conflict do nothing;
end $$;

-- ===== TASK ENGINE =====
create or replace function public.user_level_index(_xp integer)
returns integer language sql stable security definer set search_path = public as $$
  select coalesce(max(ord - 1), 0)::int from public.platform_settings s,
    jsonb_array_elements(s.value) with ordinality as l(lvl, ord)
  where s.key = 'levels' and (l.lvl->>'min_xp')::int <= _xp
$$;

create or replace function public.start_task(_task_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare t public.tasks; p public.profiles; existing uuid; cnt int;
begin
  perform public._require_active();
  select * into t from public.tasks where id = _task_id;
  if t.id is null or t.status <> 'active' then raise exception 'This task is not available'; end if;
  if t.starts_at is not null and now() < t.starts_at then raise exception 'This task has not started yet'; end if;
  if t.ends_at is not null and now() > t.ends_at then raise exception 'This task has ended'; end if;
  if t.max_participants is not null and t.completions_count >= t.max_participants then raise exception 'This task is full'; end if;
  select * into p from public.profiles where id = auth.uid();
  if (t.eligibility ? 'min_level') and public.user_level_index(p.xp) < (t.eligibility->>'min_level')::int then
    raise exception 'Reach a higher level to unlock this task'; end if;
  if (t.eligibility ? 'locations') and jsonb_array_length(t.eligibility->'locations') > 0
     and not (t.eligibility->'locations') ? coalesce(p.location, '') then
    raise exception 'This task is not available in your location'; end if;
  select id into existing from public.task_submissions where task_id = _task_id and user_id = auth.uid() and status = 'started' limit 1;
  if existing is not null then return existing; end if;
  select count(*) into cnt from public.task_submissions where task_id = _task_id and user_id = auth.uid() and status <> 'rejected';
  if cnt >= t.per_user_limit then raise exception 'You have already completed this task'; end if;
  insert into public.task_submissions(task_id, user_id, reward) values (_task_id, auth.uid(), t.reward) returning id into existing;
  return existing;
end $$;

create or replace function public._approve_submission(_sub uuid, _note text)
returns void language plpgsql security definer set search_path = public as $$
declare s public.task_submissions; t public.tasks; r public.referrals; amt numeric; rtx uuid; done int;
begin
  select * into s from public.task_submissions where id = _sub for update;
  select * into t from public.tasks where id = s.task_id;
  update public.wallet_transactions set status = 'completed', updated_at = now() where id = s.transaction_id and status = 'pending';
  update public.wallets set pending = pending - s.reward, available = available + s.reward,
    lifetime_earned = lifetime_earned + s.reward, updated_at = now() where user_id = s.user_id;
  update public.task_submissions set status = 'rewarded', reviewed_at = now(), reviewer_id = auth.uid(), review_note = _note where id = _sub;
  if t.campaign_id is not null then
    update public.campaigns set allocated = allocated - s.reward, spent = spent + s.reward where id = t.campaign_id;
    update public.campaign_participants set actions_completed = actions_completed + 1 where campaign_id = t.campaign_id and user_id = s.user_id;
  end if;
  update public.profiles set xp = xp + public.setting_num('xp_per_task')::int where id = s.user_id;
  perform public._notify(s.user_id, 'task_approved', 'Earnings verified', '+KSh ' || s.reward || ' from ' || t.title || ' is now available.', '/wallet');

  select count(*) into done from public.task_submissions where user_id = s.user_id and status = 'rewarded';
  if done = 1 then perform public._award_badge(s.user_id, 'first_task'); end if;
  if done = 10 then perform public._award_badge(s.user_id, 'ten_tasks'); end if;

  select * into r from public.referrals where referee_id = s.user_id and status = 'pending' for update;
  if r.id is not null then
    amt := public.setting_num('referral_reward');
    update public.referrals set status = 'rewarded', qualified_at = now() where id = r.id;
    if amt > 0 and exists (select 1 from public.profiles where id = r.referrer_id and status = 'active') then
      insert into public.wallet_transactions(user_id, amount, type, status, source, description, related_id)
      values (r.referrer_id, amt, 'REFERRAL_REWARD', 'completed', 'referral', 'Referral reward — friend completed first verified task', r.id) returning id into rtx;
      update public.wallets set available = available + amt, lifetime_earned = lifetime_earned + amt, updated_at = now() where user_id = r.referrer_id;
      insert into public.referral_rewards(referral_id, user_id, amount, transaction_id) values (r.id, r.referrer_id, amt, rtx);
      perform public._notify(r.referrer_id, 'referral_reward', 'Referral reward earned', '+KSh ' || amt || ' — your referral completed a verified task.', '/referrals');
      if (select count(*) from public.referrals where referrer_id = r.referrer_id and status = 'rewarded') = 5 then
        perform public._award_badge(r.referrer_id, 'referral_milestone'); end if;
    end if;
  end if;
  if t.category = 'surveys' and (select count(*) from public.task_submissions ss join public.tasks tt on tt.id = ss.task_id
      where ss.user_id = s.user_id and ss.status = 'rewarded' and tt.category = 'surveys') = 10 then
    perform public._award_badge(s.user_id, 'survey_master'); end if;
end $$;

create or replace function public._reject_submission(_sub uuid, _note text)
returns void language plpgsql security definer set search_path = public as $$
declare s public.task_submissions; t public.tasks;
begin
  select * into s from public.task_submissions where id = _sub for update;
  select * into t from public.tasks where id = s.task_id;
  update public.wallet_transactions set status = 'reversed', updated_at = now() where id = s.transaction_id and status = 'pending';
  update public.wallets set pending = pending - s.reward, updated_at = now() where user_id = s.user_id;
  if t.campaign_id is not null then update public.campaigns set allocated = allocated - s.reward where id = t.campaign_id; end if;
  update public.tasks set completions_count = greatest(completions_count - 1, 0) where id = t.id;
  update public.task_submissions set status = 'rejected', reviewed_at = now(), reviewer_id = auth.uid(), review_note = _note where id = _sub;
  perform public._notify(s.user_id, 'task_rejected', 'Submission not approved', t.title || coalesce(': ' || _note, ''), '/earn/' || t.id);
end $$;

create or replace function public.submit_task(_submission_id uuid, _content text default null, _link text default null, _proof_path text default null, _answers jsonb default null)
returns public.submission_status language plpgsql security definer set search_path = public as $$
declare s public.task_submissions; t public.tasks; c public.campaigns; secs int; txtype public.txn_type; tx uuid; sv uuid; is_flag boolean := false;
begin
  perform public._require_active();
  select * into s from public.task_submissions where id = _submission_id and user_id = auth.uid() for update;
  if s.id is null then raise exception 'Submission not found'; end if;
  if s.status <> 'started' then raise exception 'Already submitted'; end if;
  select * into t from public.tasks where id = s.task_id for update;
  if t.status <> 'active' or (t.ends_at is not null and now() > t.ends_at) then raise exception 'This task is no longer accepting submissions'; end if;
  if t.max_participants is not null and t.completions_count >= t.max_participants then raise exception 'This task is full'; end if;
  if t.verification_method = 'link' and coalesce(trim(_link), '') = '' then raise exception 'Please provide a link'; end if;
  if t.verification_method = 'text' and coalesce(length(trim(_content)), 0) < 10 then raise exception 'Please write at least 10 characters'; end if;
  if t.verification_method = 'upload_proof' and coalesce(_proof_path, '') = '' then raise exception 'Please upload proof'; end if;
  if t.verification_method = 'survey' and _answers is null then raise exception 'Please answer the survey'; end if;

  secs := extract(epoch from (now() - s.started_at))::int;
  if t.min_seconds > 0 and secs < t.min_seconds then
    is_flag := true;
    insert into public.fraud_flags(user_id, kind, severity, details) values (auth.uid(), 'fast_completion', 'medium',
      jsonb_build_object('task_id', t.id, 'seconds', secs, 'minimum', t.min_seconds));
  end if;

  if t.campaign_id is not null then
    select * into c from public.campaigns where id = t.campaign_id for update;
    if c.status <> 'active' then raise exception 'This campaign is not active'; end if;
    if c.funded - c.allocated - c.spent < t.reward then raise exception 'This campaign has reached its budget'; end if;
    update public.campaigns set allocated = allocated + t.reward where id = c.id;
    insert into public.campaign_participants(campaign_id, user_id) values (c.id, auth.uid()) on conflict do nothing;
  end if;

  if t.verification_method = 'survey' then
    select id into sv from public.surveys where task_id = t.id;
    if sv is not null then
      begin
        insert into public.survey_responses(survey_id, user_id, submission_id, answers, duration_seconds) values (sv, auth.uid(), s.id, _answers, secs);
      exception when unique_violation then
        insert into public.fraud_flags(user_id, kind, severity, details) values (auth.uid(), 'duplicate_survey', 'high', jsonb_build_object('survey_id', sv));
        raise exception 'You have already responded to this survey';
      end;
    end if;
  end if;

  txtype := case when t.campaign_id is not null then 'CAMPAIGN_REWARD'::public.txn_type
                 when t.category = 'surveys' then 'SURVEY_REWARD'::public.txn_type else 'TASK_REWARD'::public.txn_type end;
  insert into public.wallet_transactions(user_id, amount, type, status, source, description, related_id)
  values (auth.uid(), t.reward, txtype, 'pending', t.category, t.title, s.id) returning id into tx;
  update public.wallets set pending = pending + t.reward, updated_at = now() where user_id = auth.uid();
  update public.tasks set completions_count = completions_count + 1 where id = t.id;
  update public.task_submissions set status = 'under_review', content = _content, link_url = _link, proof_path = _proof_path,
    answers = _answers, submitted_at = now(), transaction_id = tx, reward = t.reward, flagged = is_flag where id = s.id;

  if t.verification_method = 'automatic' and not is_flag then
    perform public._approve_submission(s.id, 'Automatically verified');
    return 'rewarded';
  end if;
  perform public._notify(auth.uid(), 'task_submitted', 'Submission received', 'KSh ' || t.reward || ' is pending verification for ' || t.title || '.', '/wallet');
  return 'under_review';
end $$;

create or replace function public.review_submission(_submission_id uuid, _approve boolean, _note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare st public.submission_status;
begin
  perform public._require_admin();
  select status into st from public.task_submissions where id = _submission_id;
  if st is distinct from 'under_review' then raise exception 'Submission is not awaiting review'; end if;
  if _approve then perform public._approve_submission(_submission_id, _note);
  else perform public._reject_submission(_submission_id, _note); end if;
  perform public._log_admin(case when _approve then 'approve_submission' else 'reject_submission' end, 'task_submission', _submission_id, jsonb_build_object('note', _note));
end $$;

-- ===== WITHDRAWALS =====
create or replace function public.request_withdrawal(_amount numeric, _method text, _destination text)
returns uuid language plpgsql security definer set search_path = public as $$
declare w public.wallets; fee numeric; tx uuid; wid uuid; today_count int; methods jsonb;
begin
  perform public._require_active();
  select value into methods from public.platform_settings where key = 'payout_methods';
  if not (methods ? _method) then raise exception 'Unsupported withdrawal method'; end if;
  if _amount is null or _amount < public.setting_num('min_withdrawal') then
    raise exception 'Minimum withdrawal is KSh %', public.setting_num('min_withdrawal'); end if;
  if _method = 'mpesa' and _destination !~ '^(\+?254|0)(7|1)[0-9]{8}$' then raise exception 'Enter a valid M-Pesa phone number'; end if;
  select count(*) into today_count from public.withdrawal_requests where user_id = auth.uid() and created_at > now() - interval '24 hours';
  if today_count >= public.setting_num('max_daily_withdrawals') then
    insert into public.fraud_flags(user_id, kind, severity, details) values (auth.uid(), 'excessive_withdrawals', 'medium', jsonb_build_object('count_24h', today_count));
    raise exception 'Daily withdrawal limit reached. Try again tomorrow.';
  end if;
  select * into w from public.wallets where user_id = auth.uid() for update;
  if w.available < _amount then raise exception 'Insufficient available balance'; end if;
  fee := round(public.setting_num('withdrawal_fee_flat') + _amount * public.setting_num('withdrawal_fee_pct') / 100, 2);
  insert into public.wallet_transactions(user_id, amount, type, status, source, description)
  values (auth.uid(), -_amount, 'WITHDRAWAL', 'pending', _method, case when _method = 'mpesa' then 'M-Pesa Withdrawal' else initcap(_method) || ' Withdrawal' end) returning id into tx;
  update public.wallets set available = available - _amount, updated_at = now() where user_id = auth.uid();
  insert into public.withdrawal_requests(user_id, amount, fee, method, destination, transaction_id)
  values (auth.uid(), _amount, fee, _method, _destination, tx) returning id into wid;
  update public.wallet_transactions set related_id = wid where id = tx;
  perform public._notify(auth.uid(), 'withdrawal_requested', 'Withdrawal requested', 'KSh ' || _amount || ' is reserved and pending review.', '/wallet');
  return wid;
end $$;

create or replace function public._refund_withdrawal(_id uuid, _status public.withdrawal_status, _note text)
returns void language plpgsql security definer set search_path = public as $$
declare r public.withdrawal_requests;
begin
  select * into r from public.withdrawal_requests where id = _id for update;
  if r.status not in ('requested','pending_review','approved') then raise exception 'This withdrawal can no longer be reversed'; end if;
  update public.wallet_transactions set status = 'reversed', updated_at = now() where id = r.transaction_id;
  insert into public.wallet_transactions(user_id, amount, type, status, source, description, related_id)
  values (r.user_id, r.amount, 'REFUND', 'completed', r.method, 'Withdrawal ' || _status::text || ' — funds returned', r.id);
  update public.wallets set available = available + r.amount, updated_at = now() where user_id = r.user_id;
  update public.withdrawal_requests set status = _status, review_note = _note, reviewed_by = auth.uid(), updated_at = now() where id = _id;
  perform public._notify(r.user_id, 'withdrawal_' || _status::text, 'Withdrawal ' || _status::text, 'KSh ' || r.amount || ' has been returned to your available balance.' || coalesce(' ' || _note, ''), '/wallet');
end $$;

create or replace function public.cancel_my_withdrawal(_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.withdrawal_requests where id = _id and user_id = auth.uid() and status in ('requested','pending_review')) then
    raise exception 'This withdrawal cannot be cancelled'; end if;
  perform public._refund_withdrawal(_id, 'cancelled', 'Cancelled by you');
end $$;

create or replace function public.review_withdrawal(_id uuid, _action text, _note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare r public.withdrawal_requests;
begin
  perform public._require_admin();
  select * into r from public.withdrawal_requests where id = _id for update;
  if r.id is null then raise exception 'Not found'; end if;
  if _action = 'approve' then
    if r.status not in ('requested','pending_review') then raise exception 'Only pending withdrawals can be approved'; end if;
    update public.withdrawal_requests set status = 'approved', review_note = _note, reviewed_by = auth.uid(), updated_at = now() where id = _id;
    perform public._notify(r.user_id, 'withdrawal_approved', 'Withdrawal approved', 'KSh ' || r.amount || ' is approved and queued for payout.', '/wallet');
  elsif _action = 'reject' then perform public._refund_withdrawal(_id, 'rejected', _note);
  elsif _action = 'cancel' then perform public._refund_withdrawal(_id, 'cancelled', _note);
  else raise exception 'Unknown action'; end if;
  perform public._log_admin(_action || '_withdrawal', 'withdrawal', _id, jsonb_build_object('note', _note));
end $$;

-- Only the payout provider integration (service role) may confirm payment.
create or replace function public.confirm_withdrawal_paid(_id uuid, _payout_reference text, _provider_response jsonb default '{}')
returns void language plpgsql security definer set search_path = public as $$
declare r public.withdrawal_requests;
begin
  select * into r from public.withdrawal_requests where id = _id for update;
  if r.status not in ('approved','processing') then raise exception 'Withdrawal not approved'; end if;
  update public.withdrawal_requests set status = 'paid', payout_reference = _payout_reference, provider_response = _provider_response, updated_at = now() where id = _id;
  update public.wallet_transactions set status = 'completed', reference = _payout_reference, updated_at = now() where id = r.transaction_id;
  update public.wallets set total_withdrawn = total_withdrawn + r.amount, updated_at = now() where user_id = r.user_id;
  if r.fee > 0 then insert into public.platform_ledger(amount, kind, source, reference, description, related_id) values (r.fee, 'withdrawal_fee', r.method, _payout_reference, 'Withdrawal fee', r.id); end if;
  perform public._award_badge(r.user_id, 'first_withdrawal');
  perform public._notify(r.user_id, 'withdrawal_paid', 'Withdrawal paid', 'KSh ' || (r.amount - r.fee) || ' sent to ' || r.destination || '. Ref ' || _payout_reference, '/wallet');
end $$;
create or replace function public.mark_withdrawal_failed(_id uuid, _provider_response jsonb default '{}')
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.withdrawal_requests set status = 'approved' where id = _id and status = 'processing';
  perform public._refund_withdrawal(_id, 'failed', 'Payout provider reported a failure');
  update public.withdrawal_requests set provider_response = _provider_response where id = _id;
end $$;

-- ===== REWARDS FUNCTIONS =====
create or replace function public.daily_checkin()
returns json language plpgsql security definer set search_path = public as $$
declare last_streak int; amt numeric := public.setting_num('daily_checkin_reward'); xpv int := public.setting_num('daily_checkin_xp')::int; st int;
begin
  perform public._require_active();
  if exists (select 1 from public.rewards where user_id = auth.uid() and kind = 'daily_checkin' and claim_date = current_date) then
    raise exception 'Already checked in today'; end if;
  select streak into last_streak from public.rewards where user_id = auth.uid() and kind = 'daily_checkin' and claim_date = current_date - 1;
  st := coalesce(last_streak, 0) + 1;
  insert into public.rewards(user_id, kind, amount, xp, streak) values (auth.uid(), 'daily_checkin', amt, xpv, st);
  if amt > 0 then
    insert into public.wallet_transactions(user_id, amount, type, status, source, description) values (auth.uid(), amt, 'BONUS', 'completed', 'daily_checkin', 'Daily check-in · day ' || st);
    update public.wallets set available = available + amt, lifetime_earned = lifetime_earned + amt, updated_at = now() where user_id = auth.uid();
  end if;
  update public.profiles set xp = xp + xpv where id = auth.uid();
  return json_build_object('amount', amt, 'xp', xpv, 'streak', st);
end $$;

create or replace function public.challenge_progress(_user uuid, _metric text)
returns numeric language sql stable security definer set search_path = public as $$
  select case _metric
    when 'tasks_completed' then (select count(*) from public.task_submissions where user_id = _user and status = 'rewarded')
    when 'surveys_completed' then (select count(*) from public.task_submissions s join public.tasks t on t.id = s.task_id where s.user_id = _user and s.status = 'rewarded' and t.category = 'surveys')
    when 'campaigns_completed' then (select count(*) from public.task_submissions s join public.tasks t on t.id = s.task_id where s.user_id = _user and s.status = 'rewarded' and t.campaign_id is not null)
    when 'earned_amount' then (select coalesce(sum(amount), 0) from public.wallet_transactions where user_id = _user and status = 'completed' and amount > 0 and type not in ('REFUND','ADJUSTMENT'))
    else 0 end::numeric
$$;

create or replace function public.claim_challenge(_challenge_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare c public.challenges;
begin
  perform public._require_active();
  select * into c from public.challenges where id = _challenge_id and active;
  if c.id is null then raise exception 'Challenge not found'; end if;
  if public.challenge_progress(auth.uid(), c.metric) < c.target then raise exception 'Challenge not complete yet'; end if;
  insert into public.user_challenges(user_id, challenge_id) values (auth.uid(), c.id);
  if c.reward > 0 then
    insert into public.wallet_transactions(user_id, amount, type, status, source, description, related_id) values (auth.uid(), c.reward, 'BONUS', 'completed', 'challenge', 'Challenge: ' || c.title, c.id);
    update public.wallets set available = available + c.reward, lifetime_earned = lifetime_earned + c.reward, updated_at = now() where user_id = auth.uid();
  end if;
  update public.profiles set xp = xp + c.xp where id = auth.uid();
exception when unique_violation then raise exception 'Already claimed';
end $$;

-- ===== FREELANCE FUNCTIONS =====
create or replace function public.hire_applicant(_application_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare a public.freelance_applications; j public.freelance_jobs; cid uuid;
begin
  perform public._require_active();
  select * into a from public.freelance_applications where id = _application_id for update;
  select * into j from public.freelance_jobs where id = a.job_id for update;
  if j.client_id <> auth.uid() then raise exception 'Only the client can hire'; end if;
  if j.status <> 'open' then raise exception 'This job is no longer open'; end if;
  update public.freelance_applications set status = 'hired' where id = a.id;
  update public.freelance_jobs set status = 'in_progress' where id = j.id;
  insert into public.contracts(job_id, application_id, client_id, freelancer_id, amount) values (j.id, a.id, j.client_id, a.freelancer_id, a.proposed_amount) returning id into cid;
  insert into public.milestones(contract_id, title, amount) values (cid, 'Full delivery', a.proposed_amount);
  perform public._notify(a.freelancer_id, 'hired', 'You were hired', 'You were hired for "' || j.title || '". Work starts once the client funds the contract.', '/work');
  return cid;
end $$;

-- ===== ADMIN FUNCTIONS =====
create or replace function public.admin_fund_campaign(_id uuid, _amount numeric, _reference text)
returns void language plpgsql security definer set search_path = public as $$
declare c public.campaigns; comm numeric;
begin
  perform public._require_admin();
  if _amount <= 0 or coalesce(trim(_reference), '') = '' then raise exception 'Amount and payment reference are required'; end if;
  select * into c from public.campaigns where id = _id for update;
  comm := round(_amount * public.setting_num('campaign_commission_pct') / 100, 2);
  update public.campaigns set funded = funded + (_amount - comm), status = case when status in ('draft','pending_review') then 'funded' else status end where id = _id;
  if comm > 0 then insert into public.platform_ledger(amount, kind, source, reference, description, related_id) values (comm, 'campaign_commission', 'campaign', _reference, 'Commission on ' || c.name, c.id); end if;
  perform public._log_admin('fund_campaign', 'campaign', _id, jsonb_build_object('amount', _amount, 'commission', comm, 'reference', _reference));
  perform public._notify(c.owner_id, 'campaign_update', 'Campaign funded', 'KSh ' || (_amount - comm) || ' added to "' || c.name || '" budget.', '/campaigns');
end $$;

create or replace function public.admin_set_campaign_status(_id uuid, _status text)
returns void language plpgsql security definer set search_path = public as $$
declare c public.campaigns;
begin
  perform public._require_admin();
  if _status not in ('draft','pending_review','funded','active','paused','completed','rejected') then raise exception 'Invalid status'; end if;
  select * into c from public.campaigns where id = _id;
  if _status = 'active' and c.funded <= 0 then raise exception 'Campaign must be funded before it can go live'; end if;
  update public.campaigns set status = _status where id = _id;
  if _status in ('paused','completed','rejected') then update public.tasks set status = 'paused' where campaign_id = _id and status = 'active'; end if;
  perform public._log_admin('campaign_status', 'campaign', _id, jsonb_build_object('status', _status));
  perform public._notify(c.owner_id, 'campaign_update', 'Campaign ' || _status, '"' || c.name || '" is now ' || _status || '.', '/campaigns');
end $$;

create or replace function public.admin_adjust_wallet(_user uuid, _amount numeric, _note text)
returns void language plpgsql security definer set search_path = public as $$
declare w public.wallets;
begin
  perform public._require_admin();
  if coalesce(trim(_note), '') = '' then raise exception 'A reason is required'; end if;
  select * into w from public.wallets where user_id = _user for update;
  if w.available + _amount < 0 then raise exception 'Adjustment would make balance negative'; end if;
  insert into public.wallet_transactions(user_id, amount, type, status, source, description) values (_user, _amount, 'ADJUSTMENT', 'completed', 'admin', 'Adjustment: ' || _note);
  update public.wallets set available = available + _amount, updated_at = now() where user_id = _user;
  perform public._log_admin('wallet_adjustment', 'user', _user, jsonb_build_object('amount', _amount, 'note', _note));
end $$;

create or replace function public.admin_set_user_status(_user uuid, _status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  if _status not in ('active','suspended') then raise exception 'Invalid status'; end if;
  if public.has_role(_user, 'super_admin') then raise exception 'Cannot change a super admin'; end if;
  update public.profiles set status = _status where id = _user;
  perform public._log_admin('user_status', 'user', _user, jsonb_build_object('status', _status));
  if _status = 'suspended' then perform public._notify(_user, 'security', 'Account suspended', 'Your account has been suspended pending review.', null); end if;
end $$;

create or replace function public.admin_set_role(_user uuid, _role public.app_role, _grant boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  if _role in ('admin','super_admin') and not public.has_role(auth.uid(), 'super_admin') then raise exception 'Super admin required'; end if;
  if _grant then insert into public.user_roles(user_id, role) values (_user, _role) on conflict do nothing;
  else delete from public.user_roles where user_id = _user and role = _role and role <> 'user'; end if;
  perform public._log_admin(case when _grant then 'grant_role' else 'revoke_role' end, 'user', _user, jsonb_build_object('role', _role));
end $$;

create or replace function public.admin_update_setting(_key text, _value jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  update public.platform_settings set value = _value, updated_at = now() where key = _key;
  if not found then raise exception 'Unknown setting'; end if;
  perform public._log_admin('update_setting', 'setting', null, jsonb_build_object('key', _key, 'value', _value));
end $$;

create or replace function public.admin_set_product_status(_id uuid, _status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  update public.marketplace_products set status = _status where id = _id;
  perform public._log_admin('product_status', 'product', _id, jsonb_build_object('status', _status));
end $$;

create or replace function public.admin_stats()
returns json language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_admin();
  return json_build_object(
    'total_users', (select count(*) from public.profiles),
    'active_users', (select count(distinct user_id) from public.task_submissions where created_at > now() - interval '30 days'),
    'tasks_completed', (select count(*) from public.task_submissions where status = 'rewarded'),
    'pending_reviews', (select count(*) from public.task_submissions where status = 'under_review'),
    'user_earnings', (select coalesce(sum(lifetime_earned), 0) from public.wallets),
    'pending_withdrawals', (select count(*) from public.withdrawal_requests where status in ('requested','pending_review','approved','processing')),
    'pending_withdrawal_amount', (select coalesce(sum(amount), 0) from public.withdrawal_requests where status in ('requested','pending_review','approved','processing')),
    'completed_withdrawals', (select coalesce(sum(amount), 0) from public.withdrawal_requests where status = 'paid'),
    'campaign_budgets', (select coalesce(sum(funded), 0) from public.campaigns),
    'platform_revenue', (select coalesce(sum(amount), 0) from public.platform_ledger),
    'freelance_jobs', (select count(*) from public.freelance_jobs),
    'survey_responses', (select count(*) from public.survey_responses),
    'fraud_alerts', (select count(*) from public.fraud_flags where status = 'open')
  );
end $$;

-- lock down internal helpers & provider-only functions
revoke execute on function public._approve_submission(uuid, text), public._reject_submission(uuid, text), public._refund_withdrawal(uuid, public.withdrawal_status, text),
  public._notify(uuid, text, text, text, text), public._award_badge(uuid, text), public._log_admin(text, text, uuid, jsonb),
  public.confirm_withdrawal_paid(uuid, text, jsonb), public.mark_withdrawal_failed(uuid, jsonb), public.handle_new_user() from public, anon, authenticated;
grant execute on function public.confirm_withdrawal_paid(uuid, text, jsonb), public.mark_withdrawal_failed(uuid, jsonb) to service_role;

-- ===== REALTIME =====
alter publication supabase_realtime add table public.wallets, public.wallet_transactions, public.notifications, public.withdrawal_requests, public.tasks, public.campaigns;
