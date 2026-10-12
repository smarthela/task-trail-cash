import { useState } from "react";
import { queryOptions, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { kes } from "@/lib/data";

const linksQ = queryOptions({
  queryKey: ["admin-earning-links"],
  queryFn: async () => {
    const { data, error } = await supabase.from("earning_links").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});
const subsQ = queryOptions({
  queryKey: ["admin-link-subs"],
  queryFn: async () => {
    const { data, error } = await supabase.from("earning_link_submissions").select("*, earning_links(title, section)").eq("status", "submitted").order("created_at");
    if (error) throw error;
    return data;
  },
});

const KINDS = ["affiliate", "app_referral", "banking", "promo", "crypto_offer", "crypto_quest", "testnet", "education", "other"] as const;
const empty = { section: "earn", kind: "affiliate", title: "", description: "", instructions: "", url: "", reward: "", verification_status: "unverified" };

export function AdminEarningLinks() {
  const qc = useQueryClient();
  const links = useQuery(linksQ);
  const subs = useQuery(subsQ);
  const [f, setF] = useState(empty);
  const done = { onSuccess: () => { toast.success("Saved"); qc.invalidateQueries(); }, onError: (e: Error) => toast.error(e.message) };

  const create = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("earning_links").insert({
        ...f, reward: Number(f.reward || 0), status: "draft", created_by: u.user?.id,
      });
      if (error) throw error;
      setF(empty);
    }, ...done,
  });
  const setStatus = useMutation({
    mutationFn: async (a: { id: string; status: string }) => {
      const { error } = await supabase.from("earning_links").update({ status: a.status, updated_at: new Date().toISOString() }).eq("id", a.id);
      if (error) throw error;
    }, ...done,
  });
  const review = useMutation({
    mutationFn: async (a: { id: string; ok: boolean }) => {
      const { error } = await supabase.rpc("review_link_submission", { _id: a.id, _approve: a.ok });
      if (error) throw error;
    }, ...done,
  });

  const sel = "h-10 rounded-md border border-input bg-background px-2 text-sm";
  return (
    <section className="space-y-4">
      <h2 className="font-bold">Earning links & crypto offers</h2>
      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="grid gap-2 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2">
        <select className={sel} value={f.section} onChange={(e) => setF({ ...f, section: e.target.value })}>
          <option value="earn">Earning link</option><option value="crypto">Crypto click</option>
        </select>
        <select className={sel} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
          {KINDS.map((k) => <option key={k} value={k}>{k.replace("_", " ")}</option>)}
        </select>
        <Input placeholder="Title" required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <Input placeholder="https://link" type="url" required value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} />
        <Input placeholder="Description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <Input placeholder="Instructions" value={f.instructions} onChange={(e) => setF({ ...f, instructions: e.target.value })} />
        <Input placeholder="Reward (KSh)" type="number" min={0} value={f.reward} onChange={(e) => setF({ ...f, reward: e.target.value })} />
        <select className={sel} value={f.verification_status} onChange={(e) => setF({ ...f, verification_status: e.target.value })}>
          <option value="unverified">Unverified</option><option value="verified">Verified</option><option value="flagged">Flagged</option>
        </select>
        <Button type="submit" disabled={create.isPending} className="rounded-full bg-brand sm:col-span-2">Save as draft</Button>
      </form>
      <div className="space-y-2">
        {links.data?.length === 0 && <p className="text-sm text-muted-foreground">No links posted yet.</p>}
        {links.data?.map((l) => (
          <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card p-3 text-sm">
            <span><b>{l.title}</b> <span className="text-muted-foreground">· {l.section} · {l.kind} · {kes(l.reward)} · {l.status} · {l.verification_status}</span></span>
            <div className="flex gap-2">
              {l.status !== "active" && <Button size="sm" className="rounded-full" onClick={() => setStatus.mutate({ id: l.id, status: "active" })}>Publish</Button>}
              {l.status === "active" && <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus.mutate({ id: l.id, status: "paused" })}>Pause</Button>}
            </div>
          </div>
        ))}
      </div>
      <h3 className="font-bold">Link completions to verify ({subs.data?.length ?? 0})</h3>
      <div className="space-y-2">
        {subs.data?.map((s) => (
          <div key={s.id} className="rounded-2xl border border-border bg-card p-3 text-sm">
            <div className="flex justify-between"><b>{(s.earning_links as { title: string } | null)?.title}</b><span>{kes(s.reward)}</span></div>
            <p className="mt-1 whitespace-pre-line text-muted-foreground">{s.proof_text || s.proof_url}</p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" className="rounded-full bg-success" onClick={() => review.mutate({ id: s.id, ok: true })}>Approve</Button>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => review.mutate({ id: s.id, ok: false })}>Reject</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
