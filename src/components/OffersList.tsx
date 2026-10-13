import { useState } from "react";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { kes } from "@/lib/data";

export const offersQuery = (section: "earn" | "crypto") =>
  queryOptions({
    queryKey: ["offers", section],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const [links, subs] = await Promise.all([
        supabase.from("earning_links").select("*").eq("section", section).eq("status", "active").order("created_at", { ascending: false }),
        supabase.from("earning_link_submissions").select("link_id, status").eq("user_id", u.user?.id ?? ""),
      ]);
      if (links.error) throw links.error;
      const mine = new Map((subs.data ?? []).map((s) => [s.link_id, s.status]));
      return (links.data ?? []).filter((l) => !l.expires_at || new Date(l.expires_at) > new Date()).map((l) => ({ ...l, myStatus: mine.get(l.id) }));
    },
  });

export function OffersList({ section, title, intro }: { section: "earn" | "crypto"; title: string; intro: string }) {
  const q = useQuery(offersQuery(section));
  const [open, setOpen] = useState<string | null>(null);
  const [proof, setProof] = useState({ text: "", url: "" });
  const qc = useQueryClient();
  const click = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc("record_link_click", { _link_id: id });
      if (error) throw error;
      return data as string;
    },
    onSuccess: (url) => { if (url) window.open(url, "_blank", "noopener,noreferrer"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const submit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("submit_link_completion", { _link_id: id, _proof_text: proof.text || undefined, _proof_url: proof.url || undefined });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Proof sent. You'll be paid once it's verified."); setOpen(null); setProof({ text: "", url: "" }); qc.invalidateQueries({ queryKey: ["offers"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{intro}</p>
      </div>
      {section === "crypto" && (
        <p className="flex gap-2 rounded-2xl border border-border bg-accent p-3 text-xs text-accent-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0" /> Crypto is risky. These are quests and learning tasks — no offer here guarantees profit. Never share your seed phrase or private keys.
        </p>
      )}
      {q.isLoading && <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />)}</div>}
      {q.isError && (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm">
          Couldn't load offers. <Button size="sm" variant="outline" className="ml-2 rounded-full" onClick={() => q.refetch()}>Retry</Button>
        </div>
      )}
      {q.data?.length === 0 && <p className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">No offers are live right now. New ones appear here as soon as they're published.</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {q.data?.map((l) => (
          <div key={l.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">{l.kind.replace("_", " ")}</span>
                <h3 className="font-semibold">{l.title}</h3>
              </div>
              <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-sm font-bold text-primary">{kes(l.reward)}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{l.description}</p>
            {l.instructions && <p className="mt-2 whitespace-pre-line text-sm">{l.instructions}</p>}
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />{l.verification_status === "verified" ? "Verified partner" : "Not yet verified by our team"}
              {l.max_completions != null && <> · {Math.max(0, l.max_completions - l.completions_count)} spots left</>}
            </p>
            {l.risk_note && <p className="mt-1 text-xs text-destructive">{l.risk_note}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => click.mutate(l.id)}><ExternalLink className="mr-1 h-4 w-4" />Open</Button>
              {l.myStatus ? (
                <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold capitalize">{l.myStatus}</span>
              ) : (
                <Button size="sm" className="rounded-full bg-brand" onClick={() => setOpen(open === l.id ? null : l.id)}>I've completed it</Button>
              )}
            </div>
            {open === l.id && (
              <form className="mt-3 space-y-2" onSubmit={(e) => { e.preventDefault(); submit.mutate(l.id); }}>
                <Input placeholder="What did you do? (e.g. username, order ID)" value={proof.text} onChange={(e) => setProof({ ...proof, text: e.target.value })} required />
                <Input placeholder="Proof link (optional)" type="url" value={proof.url} onChange={(e) => setProof({ ...proof, url: e.target.value })} />
                <Button type="submit" size="sm" disabled={submit.isPending} className="w-full rounded-full bg-brand">Send for verification</Button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
