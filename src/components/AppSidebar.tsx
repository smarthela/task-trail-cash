import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { navGroups, type NavItem } from "@/lib/nav";
import { kes, meQuery, notificationsQuery } from "@/lib/data";
import { cn } from "@/lib/utils";

type Props = { collapsed?: boolean; onToggle?: () => void; onNavigate?: () => void; onClose?: () => void; mobile?: boolean };

export function AppSidebar({ collapsed = false, onToggle, onNavigate, onClose, mobile }: Props) {
  const { data: me, isError: meErr } = useQuery(meQuery);
  const { data: notes } = useQuery(notificationsQuery);
  const unread = (notes ?? []).filter((n) => !n.read_at).length;
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isBusiness = !!me?.roles.some((r: string) => ["advertiser", "campaign_owner", "client", "freelancer"].includes(r));
  const groups = navGroups.filter((g) => !g.access || (g.access === "admin" ? me?.isAdmin : isBusiness || me?.isAdmin));

  const active = (i: NavItem) =>
    i.to ? path === i.to || (i.to !== "/dashboard" && path.startsWith(i.to + "/")) : path === `/explore/${i.slug}`;
  // Only first item per route gets the active highlight to avoid duplicates
  const seen = new Set<string>();

  const renderItem = (i: NavItem) => {
    const key = i.to ?? i.slug!;
    const isActive = active(i) && !seen.has(key);
    if (isActive) seen.add(key);
    const count = i.badge === "notifications" ? unread : 0;
    const cls = cn(
      "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      isActive && "bg-accent !text-accent-foreground font-semibold",
      collapsed && "justify-center px-0",
    );
    const inner = (
      <>
        <span className="relative">
          <i.icon className="h-[18px] w-[18px] shrink-0" />
          {collapsed && count > 0 && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />}
        </span>
        {!collapsed && <span className="flex-1 truncate">{i.label}</span>}
        {!collapsed && count > 0 && <span className="rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">{count}</span>}
      </>
    );
    const link = i.to ? (
      <Link to={i.to} onClick={onNavigate} className={cls} aria-current={isActive ? "page" : undefined}>{inner}</Link>
    ) : (
      <Link to="/explore/$slug" params={{ slug: i.slug! }} onClick={onNavigate} className={cls} aria-current={isActive ? "page" : undefined}>{inner}</Link>
    );
    return (
      <li key={i.label}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{i.label}</TooltipContent>
          </Tooltip>
        ) : link}
      </li>
    );
  };

  const name = me?.profile?.full_name || me?.profile?.username || "My account";

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-full flex-col bg-card">
        <div className={cn("flex h-14 shrink-0 items-center border-b border-border px-3", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <Link to="/dashboard" onClick={onNavigate} className="font-display text-xl font-extrabold tracking-tight">
              Smart<span className="text-brand">HELA</span>
            </Link>
          )}
          {mobile ? (
            <button onClick={onClose} className="rounded-full p-2 hover:bg-muted" aria-label="Close menu"><X className="h-5 w-5" /></button>
          ) : (
            <button onClick={onToggle} className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-3" aria-label="Main navigation">
          {!collapsed && (
            <div className="mb-4 rounded-2xl bg-brand p-4 text-primary-foreground shadow-soft">
              <p className="text-xs opacity-80">Available balance</p>
              {me?.wallet ? (
                <>
                  <p className="font-display text-2xl font-bold">{kes(me.wallet.available)}</p>
                  <p className="text-xs opacity-80">Pending: {kes(me.wallet.pending)}</p>
                </>
              ) : (
                <p className="text-sm font-semibold">{meErr ? "Balance unavailable" : "Loading…"}</p>
              )}
              <div className="mt-3 flex gap-2">
                <Link to="/wallet" onClick={onNavigate} className="flex-1 rounded-full bg-card/20 py-1.5 text-center text-xs font-semibold backdrop-blur hover:bg-card/30">View wallet</Link>
                <Link to="/wallet" hash="withdraw" onClick={onNavigate} className="flex-1 rounded-full bg-card py-1.5 text-center text-xs font-semibold text-primary">Withdraw</Link>
              </div>
            </div>
          )}
          {groups.map((g) => (
            <div key={g.title} className="mb-3">
              {!collapsed ? (
                <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">{g.title}</p>
              ) : <div className="mx-3 mb-1 border-t border-border" />}
              <ul className="space-y-0.5">{g.items.map(renderItem)}</ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-border p-2" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
          <Link to="/profile" onClick={onNavigate} className={cn("flex items-center gap-3 rounded-xl p-2 hover:bg-muted", collapsed && "justify-center")}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
              {name.charAt(0).toUpperCase()}
            </span>
            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{name}</span>
                <span className="block text-xs text-muted-foreground">Profile & settings</span>
              </span>
            )}
          </Link>
        </div>
      </div>
    </TooltipProvider>
  );
}
