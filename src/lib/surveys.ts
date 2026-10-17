import { queryOptions } from "@tanstack/react-query";
import { getSurveys, getSurvey, getAdminSurveys } from "@/lib/surveys.functions";
export const surveysQuery = queryOptions({ queryKey: ["surveys"], queryFn: () => getSurveys() });
export const surveyQuery = (taskId: string) => queryOptions({ queryKey: ["survey", taskId], queryFn: () => getSurvey({ data: { taskId } }) });
export const adminSurveysQuery = queryOptions({ queryKey: ["admin-surveys"], queryFn: () => getAdminSurveys() });