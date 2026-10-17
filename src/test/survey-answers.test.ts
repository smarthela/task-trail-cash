import { describe, expect, it } from "vitest";
import { validateSurveyAnswers, type SurveyQuestion } from "@/lib/survey-answers";
const question = (kind: string, required = true): SurveyQuestion => ({ id: "q", kind, prompt: "Question", required, options: ["A", "B"] });
describe("Survey response validation", () => {
  it("rejects missing required responses", () => expect(validateSurveyAnswers([question("text")], {})).not.toBeNull());
  it("accepts omitted optional responses", () => expect(validateSurveyAnswers([question("text", false)], {})).toBeNull());
  it("rejects choices outside the published options", () => expect(validateSurveyAnswers([question("single_choice")], { q: "C" })).not.toBeNull());
  it("rejects repeated multiple choices", () => expect(validateSurveyAnswers([question("multiple_choice")], { q: ["A", "A"] })).not.toBeNull());
  it("accepts valid multiple choices", () => expect(validateSurveyAnswers([question("multiple_choice")], { q: ["A", "B"] })).toBeNull());
  it("rejects unknown question IDs", () => expect(validateSurveyAnswers([question("text")], { q: "Answer", extra: "Forged" })).not.toBeNull());
  it("accepts complete genuine answers", () => expect(validateSurveyAnswers([question("text")], { q: "My answer" })).toBeNull());
});