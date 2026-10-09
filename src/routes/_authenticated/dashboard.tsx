import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarCheck, ArrowRight, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { kes, meQuery, tasksQuery } from "@/lib/data";
import { TaskCard } from "./tasks.index";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SmartHELA" }] }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(meQuery), context.queryClient.ensureQueryData(tasksQuery)]),
  component: Dashboard,
});

function Dashboard() {
  const { data: me } = useSuspenseQuery(meQuery);
  const { data: tasks } = useSuspenseQuery(tasksQuery);
  const qc = useQueryClient();
  const checkin = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("daily_checkin");
      if (error) throw error;
      return data as { amount: number; xp: number; streak: number };
    },
    onSuccess: (d) => {
      toast.success(`Day ${d.streak} streak! +${d.xp} XP${d.amount ? ` · ${kes(d.amount)}` : ""}`);
      qc.invalidateQueries();
    },
    onError: (e) => toast.error(e.message),
  });
  const w = me.wallet;
  const name = me.profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Hello, {name} 👋</p>
        <h1 className="text-2xl font-bold">Your earnings</h1>
      </div>
      <div className="rounded-3xl bg-brand p-5 text-primary-foreground shadow-soft">
        <p className="text-sm opacity-90">Available balance</p>
        <p className="font-display text-4xl font-extrabold">{kes(w?.available)}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div><p className="opacity-80">Pending</p><p className="font-semibold">{kes(w?.pending)}</p></div>
          <div><p className="opacity-80">Lifetime</p><p className="font-semibold">{kes(w?.lifetime_earned)}</p></div>
          <div><p className="opacity-80">XP</p><p className="font-semibold">{me.profile?.xp ?? 0}</p></div>
        </div>
        <Button asChild variant="secondary" className="mt-4 rounded-full bg-card text-foreground hover:bg-card/90">
          <Link to="/wallet">Withdraw <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => checkin.mutate()} disabled={checkin.isPending} className="rounded-2xl border border-border bg-card p-4 text-left">
          <CalendarCheck className="h-6 w-6 text-primary" />
          <p className="mt-2 font-semibold">Daily check-in</p>
          <p className="text-xs text-muted-foreground">Keep your streak alive</p>
        </button>
        <Link to="/referrals" className="rounded-2xl border border-border bg-card p-4">
          <Users className="h-6 w-6 text-secondary" />
          <p className="mt-2 font-semibold">Invite friends</p>
          <p className="text-xs text-muted-foreground">Code: {me.profile?.referral_code}</p>
        </Link>
      </div>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recommended tasks</h2>
          <Link to="/tasks" className="text-sm font-medium text-secondary">See all</Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {tasks.slice(0, 4).map((t) => <TaskCard key={t.id} task={t} />)}
          {tasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks right now. Check back soon.</p>}
        </div>
      </div>
    </div>
  );
}
