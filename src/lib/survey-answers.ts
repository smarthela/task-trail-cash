export type SurveyQuestion = { id: string; kind: string; prompt: string; required: boolean; options: unknown };
export type SurveyAnswers = Record<string, string | number | string[]>;

export function surveyOptions(options: unknown): string[] {
  return Array.isArray(options) ? options.filter((x): x is string => typeof x === "string") : [];
}

export function validateSurveyAnswers(questions: SurveyQuestion[], answers: SurveyAnswers): string | null {
  if (!questions.length) return "This survey has no questions.";
  if (Object.keys(answers).some((id) => !questions.some((q) => q.id === id))) return "Unknown question.";
  for (const q of questions) {
    const a = answers[q.id];
    const empty = a === undefined || (typeof a === "string" && !a.trim()) || (Array.isArray(a) && !a.length);
    if (empty) { if (q.required) return `Please answer: ${q.prompt}`; continue; }
    const options = surveyOptions(q.options);
    if (q.kind === "text" && (typeof a !== "string" || a.length > 5000)) return "Invalid text answer.";
    if (q.kind === "rating" && (typeof a !== "number" || !Number.isInteger(a) || a < 1 || a > 5)) return "Choose a rating between 1 and 5.";
    if (q.kind === "single_choice" && (typeof a !== "string" || !options.includes(a))) return "Choose a valid option.";
    if (q.kind === "multiple_choice" && (!Array.isArray(a) || new Set(a).size !== a.length || a.some((v) => !options.includes(v)))) return "Choose valid options.";
    if (!["text", "rating", "single_choice", "multiple_choice"].includes(q.kind)) return "This question is not supported.";
  }
  return null;
}