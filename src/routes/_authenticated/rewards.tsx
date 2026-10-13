import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarCheck, Flame, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { kes, meQuery } from "@/lib/data";

const rewardsQuery = queryOptions({
  queryKey: ["rewards-page"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    const id = u.user!.id;
    const [ch, mine, last, levels, badges, myBadges] = await Promise.all([
      supabase.from("challenges").select("*").eq("active", true).order("target"),
      supabase.from("user_challenges").select("challenge_id").eq("user_id", id),
      supabase.from("rewards").select("*").eq("user_id", id).eq("kind", "daily_checkin").order("claim_date", { ascending: false }).limit(1),
      supabase.from("platform_settings").select("value").eq("key", "levels").maybeSingle(),
      supabase.from("badges").select("*"),
      supabase.from("user_badges").select("badge_id").eq("user_id", id),
    ]);
    if (ch.error) throw ch.error;
    const progress = await Promise.all((ch.data ?? []).map((c) => supabase.rpc("challenge_progress", { _user: id, _metric: c.metric })));
    return {
      challenges: (ch.data ?? []).map((c, i) => ({ ...c, progress: Number(progress[i].data ?? 0), claimed: (mine.data ?? []).some((m) => m.challenge_id === c.id) })),
      last: last.data?.[0],
      levels: (levels.data?.value ?? []) as { name: string; min_xp: number }[],
      badges: badges.data ?? [],
      myBadges: new Set((myBadges.data ?? []).map((b) => b.badge_id)),
    };
  },
});

export const Route = createFileRoute("/_authenticated/rewards")({
  head: () => ({ meta: [{ title: "Rewards & Levels — SmartHELA" }] }),
  component: RewardsPage,
});

function RewardsPage() {
  const q = useQuery(rewardsQuery);
  const me = useQuery(meQuery);
  const qc = useQueryClient();
  const opts = { onSuccess: () => qc.invalidateQueries(), onError: (e: Error) => toast.error(e.message) };
  const checkin = useMutation({
    mutationFn: async () => { const { data, error } = await supabase.rpc("daily_checkin"); if (error) throw error; return data as { amount: number; streak: number }; },
    ...opts, onSuccess: (d) => { toast.success(`Day ${d.streak} streak${d.amount ? ` · ${kes(d.amount)}` : ""}`); qc.invalidateQueries(); },
  });
  const claim = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.rpc("claim_challenge", { _challenge_id: id }); if (error) throw error; },
    ...opts, onSuccess: () => { toast.success("Challenge reward claimed"); qc.invalidateQueries(); },
  });

  if (q.isLoading) return <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />)}</div>;
  if (q.isError || !q.data) return <p className="rounded-2xl border border-border bg-card p-4 text-sm">Couldn't load rewards. <button className="text-secondary" onClick={() => q.refetch()}>Retry</button></p>;
  const d = q.data;
  const today = new Date().toISOString().slice(0, 10);
  const checkedToday = d.last?.claim_date === today;
  const xp = me.data?.profile?.xp ?? 0;
  const lvls = [...d.levels].sort((a, b) => a.min_xp - b.min_xp);
  const cur = lvls.filter((l) => xp >= l.min_xp).pop();
  const next = lvls.find((l) => xp < l.min_xp);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Rewards & levels</h1>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 font-bold"><CalendarCheck className="h-5 w-5 text-primary" />Daily check-in</p>
          <p className="mt-1 text-sm text-muted-foreground"><Flame className="inline h-4 w-4" /> Current streak: {d.last?.streak ?? 0} day(s)</p>
          <Button disabled={checkedToday || checkin.isPending} onClick={() => checkin.mutate()} className="mt-3 w-full rounded-full bg-brand">{checkedToday ? "Checked in today" : "Check in"}</Button>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 font-bold"><Trophy className="h-5 w-5 text-primary" />{cur?.name ?? "Unranked"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{xp} XP{next ? ` · ${next.min_xp - xp} XP to ${next.name}` : ""}</p>
          {next && <div className="mt-3 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-brand" style={{ width: `${Math.min(100, (xp / next.min_xp) * 100)}%` }} /></div>}
        </div>
      </div>
      <section>
        <h2 className="mb-2 font-bold">Challenges</h2>
        {d.challenges.length === 0 && <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">No active challenges right now.</p>}
        <div className="space-y-2">
          {d.challenges.map((c) => {
            const done = c.progress >= Number(c.target);
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-4 text-sm">
                <div className="flex justify-between gap-2"><b>{c.title}</b><span>{kes(c.reward)} · {c.xp} XP</span></div>
                <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-brand" style={{ width: `${Math.min(100, (c.progress / Number(c.target)) * 100)}%` }} /></div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{Math.min(c.progress, Number(c.target))} / {c.target}</span>
                  {c.claimed ? <span className="font-semibold text-success">Claimed</span> : <Button size="sm" disabled={!done || claim.isPending} onClick={() => claim.mutate(c.id)} className="rounded-full">Claim</Button>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section>
        <h2 className="mb-2 font-bold">Badges</h2>
        {d.badges.length === 0 && <p className="text-sm text-muted-foreground">No badges configured yet.</p>}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {d.badges.map((b) => (
            <div key={b.id} className={`rounded-2xl border border-border p-3 text-sm ${d.myBadges.has(b.id) ? "bg-accent" : "bg-card opacity-60"}`}>
              <b>{b.name}</b><p className="text-xs text-muted-foreground">{b.description}</p>
            </div>
          ))}
        </div>
      </section>
      <p className="text-xs text-muted-foreground">Spin & Win is switched off until legal and compliance review is complete.</p>
    </div>
  );
}
