import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateSurveyAnswers } from "@/lib/survey-answers";

export const getSurveys = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("surveys").select("*, tasks!inner(*)").eq("tasks.status", "active").eq("tasks.verification_method", "survey").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const now = Date.now();
  return data.filter((s) => (!s.closes_at || Date.parse(s.closes_at) > now) && (!s.tasks.starts_at || Date.parse(s.tasks.starts_at) <= now) && (!s.tasks.ends_at || Date.parse(s.tasks.ends_at) > now));
});

export const getSurvey = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator(z.object({ taskId: z.string().uuid() })).handler(async ({ context, data }) => {
  const result = await context.supabase.from("surveys").select("*, tasks!inner(*), survey_questions(*)").eq("task_id", data.taskId).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (!result.data) return null;
  const submissions = await context.supabase.from("task_submissions").select("id, status").eq("task_id", data.taskId).eq("user_id", context.userId).order("created_at", { ascending: false });
  if (submissions.error) throw new Error(submissions.error.message);
  return { ...result.data, survey_questions: result.data.survey_questions.sort((a, b) => a.position - b.position), submissions: submissions.data };
});

export const sendSurveyAnswers = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(z.object({ taskId: z.string().uuid(), submissionId: z.string().uuid(), answers: z.record(z.union([z.string().max(5000), z.number(), z.array(z.string())])) })).handler(async ({ context, data }) => {
  const { data: survey, error } = await context.supabase.from("surveys").select("id, survey_questions(*)").eq("task_id", data.taskId).single();
  if (error) throw new Error("Survey unavailable.");
  const invalid = validateSurveyAnswers(survey.survey_questions, data.answers);
  if (invalid) throw new Error(invalid);
  const submission = await context.supabase.from("task_submissions").select("id").eq("id", data.submissionId).eq("task_id", data.taskId).eq("user_id", context.userId).single();
  if (submission.error) throw new Error("Submission unavailable.");
  const result = await context.supabase.rpc("submit_task", { _submission_id: data.submissionId, _answers: data.answers });
  if (result.error) throw new Error(result.error.message);
  return result.data;
});

export const getAdminSurveys = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const role = await context.supabase.rpc("is_admin", { _user_id: context.userId });
  if (role.error || !role.data) throw new Error("Admin access required.");
  const result = await context.supabase.from("surveys").select("*, tasks!inner(*)").order("created_at", { ascending: false });
  if (result.error) throw new Error(result.error.message);
  return result.data;
});