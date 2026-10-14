import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/AppShell";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — SmartHELA" },
      { name: "description", content: "Choose a new password for your SmartHELA account." },
      { property: "og:title", content: "Reset password — SmartHELA" },
      { property: "og:description", content: "Choose a new password for your SmartHELA account." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const [pw, setPw] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((e) => { if (e === "PASSWORD_RECOVERY" || e === "SIGNED_IN") setReady(true); });
    supabase.auth.getSession().then(({ data: s }) => s.session && setReady(true));
    return () => data.subscription.unsubscribe();
  }, []);
  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated.");
    navigate({ to: "/dashboard" });
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-soft">
        <Link to="/"><Logo /></Link>
        <h1 className="mt-4 text-2xl font-bold">Set a new password</h1>
        {!ready ? (
          <p className="mt-3 text-sm text-muted-foreground">Open this page from the reset link in your email. If the link expired, <Link to="/auth" className="text-secondary">request a new one</Link>.</p>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-3">
            <div><Label htmlFor="np">New password</Label><Input id="np" type="password" minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} required /></div>
            <Button type="submit" disabled={busy} className="w-full rounded-full bg-brand">Update password</Button>
          </form>
        )}
      </div>
    </div>
  );
}
