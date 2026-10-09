import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { dealsQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/deals")({
  head: () => ({ meta: [{ title: "Deals — SmartHELA" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dealsQuery),
  component: DealsPage,
});

function DealsPage() {
  const { data: deals } = useSuspenseQuery(dealsQuery);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Deals & offers</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {deals.map((d) => (
          <div key={d.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase text-secondary">{d.provider} · {d.deal_type}</p>
                <h3 className="font-semibold">{d.title}</h3>
              </div>
              <span className="rounded-full bg-accent px-2.5 py-1 text-sm font-bold text-primary">{d.reward_text}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
            <div className="mt-3 flex gap-2">
              {d.promo_code && (
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => { navigator.clipboard.writeText(d.promo_code!); toast.success("Code copied"); }}>
                  Code: {d.promo_code}
                </Button>
              )}
              {d.url && <Button size="sm" asChild className="rounded-full bg-brand"><a href={d.url} target="_blank" rel="noreferrer">Get deal</a></Button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
