import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { surveyOptions, type SurveyAnswers, type SurveyQuestion } from "@/lib/survey-answers";

export function SurveyQuestions({ questions, answers, onChange }: { questions: SurveyQuestion[]; answers: SurveyAnswers; onChange: (answers: SurveyAnswers) => void }) {
  return <div className="space-y-6">{questions.map((q, i) => {
    const options = surveyOptions(q.options);
    const value = answers[q.id];
    const set = (next: string | number | string[]) => onChange({ ...answers, [q.id]: next });
    return <fieldset key={q.id} className="space-y-3"><legend className="mb-3 font-semibold">{i + 1}. {q.prompt}{q.required && <span className="text-destructive"> *</span>}</legend>
      {q.kind === "text" && <Textarea aria-label={q.prompt} maxLength={5000} required={q.required} value={typeof value === "string" ? value : ""} onChange={(e) => set(e.target.value)} />}
      {(q.kind === "single_choice" || q.kind === "rating") && <RadioGroup aria-label={q.prompt} value={value === undefined ? "" : String(value)} onValueChange={(v) => set(q.kind === "rating" ? Number(v) : v)}>{(q.kind === "rating" ? ["1", "2", "3", "4", "5"] : options).map((option, index) => <label key={option} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2"><RadioGroupItem id={`${q.id}-${index}`} value={option} />{option}</label>)}</RadioGroup>}
      {q.kind === "multiple_choice" && options.map((option) => <label key={option} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2"><Checkbox checked={Array.isArray(value) && value.includes(option)} onCheckedChange={(checked) => { const current = Array.isArray(value) ? value : []; set(checked === true ? [...current, option] : current.filter((v) => v !== option)); }} />{option}</label>)}
    </fieldset>;
  })}</div>;
}