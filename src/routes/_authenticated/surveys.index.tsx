import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Clock, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { kes } from "@/lib/data";
import { surveysQuery } from "@/lib/surveys";

export const Route = createFileRoute("/_authenticated/surveys/")({
  head: () => ({ meta: [{ title: "Surveys & Research — SmartHELA" }, { name: "description", content: "Available research surveys with rewards verified before withdrawal." }, { property: "og:title", content: "Surveys & Research — SmartHELA" }, { property: "og:description", content: "Research opportunities and verified rewards." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(surveysQuery),
  component: SurveysPage,
  errorComponent: ({ reset }) => <div className="space-y-3"><p>Surveys could not be loaded.</p><Button onClick={reset}>Try again</Button></div>,
});
function SurveysPage() {
  const { data } = useSuspenseQuery(surveysQuery);
  return <div className="space-y-5"><h1 className="text-2xl font-bold">Surveys & Research</h1>{!data.length && <div className="py-12 text-center text-muted-foreground"><ClipboardList className="mx-auto mb-3 h-8 w-8" /><p>No surveys are available right now.</p></div>}<div className="grid gap-3 md:grid-cols-2">{data.map((s) => <Link key={s.id} to="/surveys/$id" params={{ id: s.task_id }} className="space-y-3 rounded-2xl border border-border bg-card p-4 transition hover:shadow-soft"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-semibold">{s.title}</h2><span className="font-bold text-primary">{kes(s.tasks.reward)}</span></div><p className="text-sm text-muted-foreground">{s.tasks.description}</p><span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" />{s.tasks.estimated_minutes} min</span></Link>)}</div></div>;
}