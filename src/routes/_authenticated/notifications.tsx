import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { notificationsQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — SmartHELA" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(notificationsQuery),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { data } = useSuspenseQuery(notificationsQuery);
  const qc = useQueryClient();
  useEffect(() => {
    const ids = data.filter((n) => !n.read_at).map((n) => n.id);
    if (ids.length)
      supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids).then(() => qc.invalidateQueries({ queryKey: ["notifications"] }));
  }, [data, qc]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card">
        {data.length === 0 && <p className="p-4 text-sm text-muted-foreground">You're all caught up.</p>}
        {data.map((n) => (
          <div key={n.id} className="p-4">
            <p className="font-medium">{n.title}</p>
            {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
            <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
