import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { kes, mySubmissionsQuery, tasksQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/tasks/")({
  head: () => ({ meta: [{ title: "Earn — SmartHELA" }] }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(tasksQuery), context.queryClient.ensureQueryData(mySubmissionsQuery)]),
  component: TasksPage,
});

export function TaskCard({ task }: { task: Tables<"tasks"> }) {
  return (
    <Link to="/tasks/$id" params={{ id: task.id }} className="block rounded-2xl border border-border bg-card p-4 transition hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">{task.category}</span>
          <h3 className="mt-0.5 font-semibold leading-snug">{task.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-sm font-bold text-primary">{kes(task.reward)}</span>
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{task.estimated_minutes} min</span>
        {task.sponsor && <span>by {task.sponsor}</span>}
      </div>
    </Link>
  );
}

const statusColor: Record<string, string> = {
  approved: "text-success", rewarded: "text-success", rejected: "text-destructive",
};

function TasksPage() {
  const { data: tasks } = useSuspenseQuery(tasksQuery);
  const { data: subs } = useSuspenseQuery(mySubmissionsQuery);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Earn</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {tasks.map((t) => <TaskCard key={t.id} task={t} />)}
      </div>
      <div>
        <h2 className="mb-2 text-lg font-bold">My submissions</h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {subs.length === 0 && <p className="p-4 text-sm text-muted-foreground">You haven't started any tasks yet.</p>}
          {subs.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 text-sm">
              <span className="font-medium">{(s.tasks as { title: string } | null)?.title}</span>
              <span className={`capitalize ${statusColor[s.status] ?? "text-muted-foreground"}`}>{s.status.replace("_", " ")} · {kes(s.reward)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
