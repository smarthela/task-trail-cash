import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const pmQuery = queryOptions({
  queryKey: ["payment-methods"],
  queryFn: async () => {
    const { data, error } = await supabase.from("payment_methods").select("*").order("created_at");
    if (error) throw error;
    return data;
  },
});

export const Route = createFileRoute("/_authenticated/payment-methods")({
  head: () => ({ meta: [{ title: "Payment Methods — SmartHELA" }] }),
  component: PaymentMethods,
});

function PaymentMethods() {
  const q = useQuery(pmQuery);
  const qc = useQueryClient();
  const [f, setF] = useState({ name: "", number: "" });
  const done = () => qc.invalidateQueries({ queryKey: ["payment-methods"] });
  const add = useMutation({
    mutationFn: async () => {
      const num = f.number.replace(/\s/g, "");
      if (!/^(\+?254|0)(7|1)\d{8}$/.test(num)) throw new Error("Enter a valid Kenyan M-Pesa number, e.g. 0712345678");
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("payment_methods").insert({ user_id: u.user!.id, method: "mpesa", account_name: f.name, account_number: num, is_default: (q.data ?? []).length === 0 });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved"); setF({ name: "", number: "" }); done(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("payment_methods").delete().eq("id", id); if (error) throw error; },
    onSuccess: done, onError: (e: Error) => toast.error(e.message),
  });
  const makeDefault = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("payment_methods").update({ is_default: false }).neq("id", id);
      const { error } = await supabase.from("payment_methods").update({ is_default: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: done, onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Payment methods</h1>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card">
        {q.isLoading && <div className="h-16 animate-pulse bg-muted" />}
        {q.isError && <p className="p-4 text-sm">Couldn't load. <button className="text-secondary" onClick={() => q.refetch()}>Retry</button></p>}
        {q.data?.length === 0 && <p className="p-4 text-sm text-muted-foreground">No saved methods yet.</p>}
        {q.data?.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-2 p-3 text-sm">
            <div><p className="font-medium">M-Pesa · {m.account_number}</p><p className="text-xs text-muted-foreground">{m.account_name}{m.is_default && " · Default"}</p></div>
            <div className="flex gap-1">
              {!m.is_default && <Button size="sm" variant="outline" className="rounded-full" onClick={() => makeDefault.mutate(m.id)}>Make default</Button>}
              <Button size="icon" variant="ghost" aria-label="Remove" onClick={() => del.mutate(m.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); add.mutate(); }} className="space-y-3 rounded-3xl border border-border bg-card p-5">
        <h2 className="font-bold">Add M-Pesa number</h2>
        <div><Label htmlFor="pn">Registered name</Label><Input id="pn" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></div>
        <div><Label htmlFor="pnum">M-Pesa number</Label><Input id="pnum" inputMode="tel" placeholder="07XX XXX XXX" value={f.number} onChange={(e) => setF({ ...f, number: e.target.value })} required /></div>
        <Button type="submit" disabled={add.isPending} className="w-full rounded-full bg-brand">Save</Button>
      </form>
    </div>
  );
}
