import { createFileRoute, redirect } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { kes, meQuery } from "@/lib/data";
import { AdminEarningLinks } from "@/components/AdminEarningLinks";

const pendingSubs = queryOptions({
  queryKey: ["admin-subs"],
  queryFn: async () => {
    const { data, error } = await supabase.from("task_submissions").select("*, tasks(title)").in("status", ["submitted", "under_review"]).order("submitted_at");
    if (error) throw error;
    return data;
  },
});
const pendingWds = queryOptions({
  queryKey: ["admin-wds"],
  queryFn: async () => {
    const { data, error } = await supabase.from("withdrawal_requests").select("*").in("status", ["requested", "pending_review", "approved"]).order("created_at");
    if (error) throw error;
    return data;
  },
});
const stats = queryOptions({
  queryKey: ["admin-stats"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("admin_stats");
    if (error) throw error;
    return (data ?? {}) as Record<string, number>;
  },
});

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — SmartHELA" }] }),
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQuery);
    if (!me.isAdmin) throw redirect({ to: "/dashboard" });
  },
  loader: ({ context }) => Promise.all([pendingSubs, pendingWds, stats].map((q) => context.queryClient.ensureQueryData(q as typeof stats))),
  component: AdminPage,
});

function AdminPage() {
  const { data: subs } = useSuspenseQuery(pendingSubs);
  const { data: wds } = useSuspenseQuery(pendingWds);
  const { data: st } = useSuspenseQuery(stats);
  const qc = useQueryClient();
  const done = { onSuccess: () => { toast.success("Done"); qc.invalidateQueries(); }, onError: (e: Error) => toast.error(e.message) };
  const review = useMutation({
    mutationFn: async (a: { id: string; ok: boolean }) => {
      const { error } = await supabase.rpc("review_submission", { _submission_id: a.id, _approve: a.ok });
      if (error) throw error;
    }, ...done,
  });
  const wd = useMutation({
    mutationFn: async (a: { id: string; action: string }) => {
      const { error } = await supabase.rpc("review_withdrawal", { _id: a.id, _action: a.action });
      if (error) throw error;
    }, ...done,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Object.entries(st).slice(0, 8).map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs capitalize text-muted-foreground">{k.replaceAll("_", " ")}</p>
            <p className="text-xl font-bold">{typeof v === "number" ? v.toLocaleString() : String(v)}</p>
          </div>
        ))}
      </div>
      <section>
        <h2 className="mb-2 font-bold">Submissions to review ({subs.length})</h2>
        <div className="space-y-2">
          {subs.map((s) => (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-4 text-sm">
              <div className="flex justify-between"><b>{(s.tasks as { title: string } | null)?.title}</b><span>{kes(s.reward)}</span></div>
              <p className="mt-1 whitespace-pre-line text-muted-foreground">{s.content || s.link_url}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" className="rounded-full bg-success" onClick={() => review.mutate({ id: s.id, ok: true })}>Approve</Button>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => review.mutate({ id: s.id, ok: false })}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-2 font-bold">Withdrawals ({wds.length})</h2>
        <div className="space-y-2">
          {wds.map((w) => (
            <div key={w.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card p-4 text-sm">
              <span>{kes(w.amount)} → {w.destination} <span className="capitalize text-muted-foreground">({w.status.replace("_", " ")})</span></span>
              <div className="flex gap-2">
                <Button size="sm" className="rounded-full bg-success" onClick={() => wd.mutate({ id: w.id, action: "approve" })}>Approve</Button>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => wd.mutate({ id: w.id, action: "reject" })}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <AdminEarningLinks />
    </div>
  );
}
