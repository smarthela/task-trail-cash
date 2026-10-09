import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Home, ListChecks, Wallet, Tag, User, Bell, Shield, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { meQuery, notificationsQuery } from "@/lib/data";

const nav = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/tasks", label: "Earn", icon: ListChecks },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/deals", label: "Deals", icon: Tag },
  { to: "/profile", label: "Me", icon: User },
] as const;

export function Logo() {
  return (
    <span className="font-display text-xl font-extrabold tracking-tight">
      Smart<span className="text-brand">HELA</span>
    </span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { data: me } = useQuery(meQuery);
  const { data: notes } = useQuery(notificationsQuery);
  const unread = (notes ?? []).filter((n) => !n.read_at).length;
  const qc = useQueryClient();
  const navigate = useNavigate();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/dashboard"><Logo /></Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-accent !text-accent-foreground" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            {me?.isAdmin && (
              <Link to="/admin" className="rounded-full p-2 text-secondary hover:bg-muted" aria-label="Admin">
                <Shield className="h-5 w-5" />
              </Link>
            )}
            <Link to="/notifications" className="relative rounded-full p-2 hover:bg-muted" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {unread > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-primary" />}
            </Link>
            <button onClick={signOut} className="rounded-full p-2 hover:bg-muted" aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-5">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card md:hidden">
        <div className="grid grid-cols-5">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-muted-foreground" activeProps={{ className: "!text-primary" }}>
              <n.icon className="h-5 w-5" />
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
