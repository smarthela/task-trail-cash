import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { kes, meQuery, txnsQuery, withdrawalsQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({ meta: [{ title: "Wallet — SmartHELA" }] }),
  loader: ({ context }) => Promise.all([meQuery, txnsQuery, withdrawalsQuery].map((q) => context.queryClient.ensureQueryData(q as typeof meQuery))),
  component: WalletPage,
});

function WalletPage() {
  const { data: me } = useSuspenseQuery(meQuery);
  const { data: txns } = useSuspenseQuery(txnsQuery);
  const { data: wds } = useSuspenseQuery(withdrawalsQuery);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const qc = useQueryClient();
  const withdraw = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("request_withdrawal", { _amount: Number(amount), _destination: phone, _method: "mpesa" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Withdrawal requested. It will be reviewed shortly."); setAmount(""); qc.invalidateQueries(); },
    onError: (e) => toast.error(e.message),
  });
  const w = me.wallet;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Wallet</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[["Available", w?.available], ["Pending", w?.pending], ["Lifetime earned", w?.lifetime_earned], ["Withdrawn", w?.total_withdrawn]].map(([l, v]) => (
          <div key={l as string} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{l}</p>
            <p className="font-display text-lg font-bold">{kes(v as number)}</p>
          </div>
        ))}
      </div>
      <form id="withdraw" onSubmit={(e) => { e.preventDefault(); withdraw.mutate(); }} className="scroll-mt-20 space-y-3 rounded-3xl border border-border bg-card p-5">
        <h2 className="font-bold">Withdraw to M-Pesa</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label htmlFor="a">Amount (KES)</Label><Input id="a" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} required /></div>
          <div><Label htmlFor="ph">M-Pesa number</Label><Input id="ph" placeholder="07XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
        </div>
        <Button type="submit" disabled={withdraw.isPending} className="w-full rounded-full bg-brand">Request withdrawal</Button>
        <p className="text-xs text-muted-foreground">Withdrawals are reviewed by our team. Automatic M-Pesa payouts will switch on once the payout provider is connected.</p>
      </form>
      {wds.length > 0 && (
        <div>
          <h2 className="mb-2 font-bold">Withdrawals</h2>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {wds.map((x) => (
              <div key={x.id} className="flex justify-between p-3 text-sm">
                <span>{kes(x.amount)} → {x.destination}</span>
                <span className="capitalize text-muted-foreground">{x.status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <h2 className="mb-2 font-bold">Transactions</h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {txns.length === 0 && <p className="p-4 text-sm text-muted-foreground">No transactions yet.</p>}
          {txns.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 text-sm">
              <div>
                <p className="font-medium">{t.description}</p>
                <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()} · {t.reference} · {t.status}</p>
              </div>
              <span className={`font-semibold ${t.amount < 0 ? "text-destructive" : "text-success"}`}>{t.amount > 0 ? "+" : ""}{kes(t.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
