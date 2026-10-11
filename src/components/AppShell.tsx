import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Home, ListChecks, Wallet, Briefcase, User, Bell, Shield, LogOut, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { meQuery, notificationsQuery } from "@/lib/data";
import { AppSidebar } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/tasks", label: "Earn", icon: ListChecks },
  { to: "/explore/$slug", params: { slug: "freelance" }, label: "Work", icon: Briefcase },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/profile", label: "Profile", icon: User },
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
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("sidebar-collapsed") === "1");
  }, []);
  const toggle = () => setCollapsed((c) => { localStorage.setItem("sidebar-collapsed", c ? "0" : "1"); return !c; });

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className={cn("sticky top-0 hidden h-screen shrink-0 border-r border-border transition-[width] duration-200 md:block", collapsed ? "w-[72px]" : "w-72")}>
        <AppSidebar collapsed={collapsed} onToggle={toggle} />
      </aside>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-50 md:hidden", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
        <div onClick={() => setOpen(false)} className={cn("absolute inset-0 bg-foreground/40 transition-opacity", open ? "opacity-100" : "opacity-0")} />
        <div role="dialog" aria-modal="true" aria-label="Menu"
          className={cn("absolute inset-y-0 left-0 w-[85%] max-w-xs shadow-2xl transition-transform duration-300", open ? "translate-x-0" : "-translate-x-full")}
          style={{ paddingTop: "env(safe-area-inset-top)" }}>
          {open && <AppSidebar mobile onClose={() => setOpen(false)} onNavigate={() => setOpen(false)} />}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col pb-24 md:pb-8">
        <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <div className="flex items-center gap-1">
              <button onClick={() => setOpen(true)} className="-ml-2 rounded-full p-2 hover:bg-muted md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </button>
              <Link to="/dashboard" className="md:hidden"><Logo /></Link>
            </div>
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
        <main className="mx-auto w-full max-w-5xl px-4 py-5">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="grid grid-cols-5">
          {nav.map((n) => (
            <Link key={n.label} to={n.to} params={"params" in n ? n.params : undefined} className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-muted-foreground" activeProps={{ className: "!text-primary" }}>
              <n.icon className="h-5 w-5" />
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
