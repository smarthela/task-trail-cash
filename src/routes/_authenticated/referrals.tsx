import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { meQuery, referralsQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/referrals")({
  head: () => ({ meta: [{ title: "Referrals — SmartHELA" }] }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(meQuery), context.queryClient.ensureQueryData(referralsQuery)]),
  component: ReferralsPage,
});

function ReferralsPage() {
  const { data: me } = useSuspenseQuery(meQuery);
  const { data: refs } = useSuspenseQuery(referralsQuery);
  const code = me.profile?.referral_code ?? "";
  const qualified = refs.filter((r) => r.status === "qualified").length;
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Invite friends</h1>
      <div className="rounded-3xl bg-brand p-5 text-primary-foreground shadow-soft">
        <p className="text-sm opacity-90">Your referral code</p>
        <p className="font-display text-3xl font-extrabold tracking-widest">{code}</p>
        <Button variant="secondary" className="mt-3 rounded-full bg-card text-foreground hover:bg-card/90" onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied"); }}>Copy code</Button>
        <p className="mt-3 text-xs opacity-90">You earn when invited friends become genuinely active — not just for signing up.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Invited</p><p className="text-2xl font-bold">{refs.length}</p></div>
        <div className="rounded-2xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Qualified</p><p className="text-2xl font-bold">{qualified}</p></div>
      </div>
    </div>
  );
}
