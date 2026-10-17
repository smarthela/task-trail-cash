import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SurveyQuestions } from "@/components/SurveyQuestions";
import { supabase } from "@/integrations/supabase/client";
import { kes } from "@/lib/data";
import { surveyQuery } from "@/lib/surveys";
import { sendSurveyAnswers } from "@/lib/surveys.functions";
import { validateSurveyAnswers, type SurveyAnswers } from "@/lib/survey-answers";

export const Route = createFileRoute("/_authenticated/surveys/$id")({
  head: () => ({ meta: [{ title: "Complete a Survey — SmartHELA" }, { name: "description", content: "Submit genuine research answers for reward verification." }, { property: "og:title", content: "Complete a Survey — SmartHELA" }, { property: "og:description", content: "Submit research answers for verification." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  loader: async ({ context, params }) => { if (!await context.queryClient.ensureQueryData(surveyQuery(params.id))) throw notFound(); },
  component: SurveyDetail,
  notFoundComponent: () => <p>This survey is unavailable.</p>,
  errorComponent: ({ reset }) => <div className="space-y-3"><p>The survey could not be loaded.</p><Button onClick={reset}>Try again</Button></div>,
});
function SurveyDetail() {
  const { id } = Route.useParams();
  const { data: survey } = useSuspenseQuery(surveyQuery(id));
  const qc = useQueryClient();
  const send = useServerFn(sendSurveyAnswers);
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [newSubmissionId, setNewSubmissionId] = useState<string | null>(null);
  const start = useMutation({ mutationFn: async () => { const r = await supabase.rpc("start_task", { _task_id: id }); if (r.error) throw r.error; return r.data; }, onSuccess: (result) => setNewSubmissionId(result), onError: (e) => toast.error(e.message) });
  const submit = useMutation({ mutationFn: async () => {
    const submissionId = newSubmissionId ?? survey?.submissions.find((s) => s.status === "started")?.id;
    if (!submissionId || !survey) throw new Error("Start the survey first.");
    const error = validateSurveyAnswers(survey.survey_questions, answers);
    if (error) throw new Error(error);
    return send({ data: { taskId: id, submissionId, answers } });
  }, onSuccess: async () => { toast.success("Answers submitted for verification."); await qc.invalidateQueries(); }, onError: (e) => toast.error(e.message) });
  if (!survey) return null;
  const completed = survey.submissions.find((s) => s.status !== "started");
  const started = newSubmissionId || survey.submissions.some((s) => s.status === "started");
  const closed = survey.tasks.status !== "active" || (survey.closes_at && Date.parse(survey.closes_at) <= Date.now()) || (survey.tasks.ends_at && Date.parse(survey.tasks.ends_at) <= Date.now());
  return <div className="mx-auto max-w-2xl space-y-5"><Link to="/surveys" className="text-sm text-muted-foreground">← Surveys & Research</Link><div><h1 className="text-2xl font-bold">{survey.title}</h1><p className="mt-2 text-muted-foreground">{survey.tasks.description}</p><p className="mt-3 font-bold text-primary">{kes(survey.tasks.reward)} · {survey.tasks.estimated_minutes} min</p></div>
    {completed ? <div className="space-y-3"><p role="status" className="capitalize">{completed.status.replaceAll("_", " ")}</p><Button asChild variant="outline"><Link to="/wallet">View wallet</Link></Button></div> : closed ? <p>This survey is closed.</p> : !survey.survey_questions.length ? <p>This survey is not ready yet.</p> : !started ? <><p className="whitespace-pre-line text-sm">{survey.tasks.instructions}</p><Button className="w-full rounded-full bg-brand" disabled={start.isPending} onClick={() => start.mutate()}>Start survey</Button></> : <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); submit.mutate(); }}><SurveyQuestions questions={survey.survey_questions} answers={answers} onChange={setAnswers} /><Button type="submit" className="w-full rounded-full bg-brand" disabled={submit.isPending}>Submit for verification</Button></form>}
  </div>;
}