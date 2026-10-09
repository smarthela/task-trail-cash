import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { kes, taskQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/tasks/$id")({
  head: () => ({ meta: [{ title: "Task — SmartHELA" }] }),
  loader: async ({ context, params }) => {
    const t = await context.queryClient.ensureQueryData(taskQuery(params.id));
    if (!t) throw notFound();
  },
  component: TaskDetail,
  notFoundComponent: () => <p className="text-muted-foreground">This task no longer exists.</p>,
  errorComponent: ({ error }) => <p className="text-destructive">{(error as Error).message}</p>,
});

function TaskDetail() {
  const { id } = Route.useParams();
  const { data: task } = useSuspenseQuery(taskQuery(id));
  const [subId, setSubId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const qc = useQueryClient();
  const navigate = useNavigate();
  if (!task) return null;
  const needsLink = task.verification_method === "link";

  const start = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("start_task", { _task_id: id });
      if (error) throw error;
      return data;
    },
    onSuccess: (s) => { setSubId(s); if (task.external_url) window.open(task.external_url, "_blank"); },
    onError: (e) => toast.error(e.message),
  });
  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("submit_task", { _submission_id: subId!, ...(content ? { _content: content } : {}), ...(link ? { _link: link } : {}) });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Submitted! We'll review it shortly.");
      qc.invalidateQueries();
      navigate({ to: "/tasks" });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="rounded-3xl border border-border bg-card p-5">
        <span className="text-xs font-semibold uppercase text-accent-foreground">{task.category}</span>
        <h1 className="mt-1 text-2xl font-bold">{task.title}</h1>
        <p className="mt-2 text-muted-foreground">{task.description}</p>
        <div className="mt-4 flex gap-3">
          <span className="rounded-full bg-accent px-3 py-1 font-bold text-primary">{kes(task.reward)}</span>
          <span className="rounded-full bg-muted px-3 py-1 text-sm">~{task.estimated_minutes} min</span>
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-5">
        <h2 className="font-bold">Instructions</h2>
        <p className="mt-2 whitespace-pre-line text-sm">{task.instructions || "Follow the description above."}</p>
        {task.requirements && <p className="mt-2 text-sm text-muted-foreground">Requirements: {task.requirements}</p>}
      </div>
      {!subId ? (
        <Button onClick={() => start.mutate()} disabled={start.isPending} size="lg" className="w-full rounded-full bg-brand">
          Start task {task.external_url && <ExternalLink className="ml-1 h-4 w-4" />}
        </Button>
      ) : (
        <div className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <h2 className="font-bold">Submit your proof</h2>
          {needsLink ? (
            <Input placeholder="https://…" value={link} onChange={(e) => setLink(e.target.value)} />
          ) : (
            <Textarea rows={5} placeholder="Describe what you did…" value={content} onChange={(e) => setContent(e.target.value)} />
          )}
          <Button onClick={() => submit.mutate()} disabled={submit.isPending || (!content && !link)} className="w-full rounded-full bg-brand">Submit for review</Button>
        </div>
      )}
    </div>
  );
}
