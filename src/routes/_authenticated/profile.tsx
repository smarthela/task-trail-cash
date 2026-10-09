import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { meQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — SmartHELA" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(meQuery),
  component: ProfilePage,
});

function ProfilePage() {
  const { data: me } = useSuspenseQuery(meQuery);
  const p = me.profile;
  const [f, setF] = useState({ full_name: p?.full_name ?? "", username: p?.username ?? "", location: p?.location ?? "", bio: p?.bio ?? "", skills: (p?.skills ?? []).join(", ") });
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update({
        full_name: f.full_name, username: f.username || null, location: f.location || null, bio: f.bio || null,
        skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean),
      }).eq("id", me.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profile saved"); qc.invalidateQueries({ queryKey: ["me"] }); },
    onError: (e) => toast.error(e.message),
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand font-display text-2xl font-bold text-primary-foreground">
          {(p?.full_name || "U")[0]}
        </div>
        <div>
          <h1 className="text-xl font-bold">{p?.full_name || "Your profile"}</h1>
          <p className="text-sm capitalize text-muted-foreground">{me.roles.join(" · ").replace("_", " ")} · {p?.xp ?? 0} XP</p>
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-3 rounded-3xl border border-border bg-card p-5">
        <div><Label>Full name</Label><Input value={f.full_name} onChange={set("full_name")} /></div>
        <div><Label>Username</Label><Input value={f.username} onChange={set("username")} /></div>
        <div><Label>Location</Label><Input placeholder="e.g. Nairobi" value={f.location} onChange={set("location")} /></div>
        <div><Label>Skills (comma separated)</Label><Input value={f.skills} onChange={set("skills")} /></div>
        <div><Label>Bio</Label><Textarea value={f.bio} onChange={set("bio")} /></div>
        <Button type="submit" disabled={save.isPending} className="w-full rounded-full bg-brand">Save</Button>
      </form>
      <Link to="/referrals" className="block rounded-2xl border border-border bg-card p-4 font-medium">Referrals →</Link>
    </div>
  );
}
