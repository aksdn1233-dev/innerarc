import { describe, expect, it } from "vitest";
import { createPaidReport } from "@/server/reports/paid-report";
import { auditPaidReportEvidence } from "@/server/reports/evidence-audit";
import { questionTopics } from "@/core/report-question-guidance";
import { PaidReadingInputSchema } from "@/core/paid-reading";

const base = { version: 1, locale: "ko", productCode: "premium_pdf", birthDate: "1976-04-17",
  name: "", focusId: "relationships", concern: "새 일을 준비하면서 파트너와 자주 다퉈요.", createdAt: "2026-10-22T00:00:00.000Z" } as const;
const text = (report: ReturnType<typeof createPaidReport>) => report.sections.map(s => s.body).join("\n");

describe("live comparison question regressions", () => {
  it("keeps both answers when two questions previously fell into the same fallback", () => {
    const report = createPaidReport("synthetic-c4", { ...base, questions: ["일을 바꾸기 전에 무엇을 확인할까요?", "상대가 다시 마음을 열지 알 수 있나요?"] });
    const parts = report.sections.at(-1)!.body.split(/개인 질문 [12] 직접 답변/u).slice(1);
    expect(parts).toHaveLength(2);
    for (const part of parts) { expect(part).toContain("답변:"); expect(part).toContain("확인할 행동:"); }
    expect(parts[0]).toMatch(/평가 기준|서면|업무 조건/u);
    expect(parts[1]).toContain("상대의 마음");
    expect(text(report)).not.toContain("이 갈등은 풀립니다");
  });

  it("answers master-number evidence and missing-name questions separately", () => {
    const report = createPaidReport("synthetic-c6", { ...base, birthDate: "1989-12-03", focusId: "growth", concern: "33이면 특별한 능력이 입증되나요?",
      questions: ["33이면 특별한 능력이 입증되나요?", "이름 없이 이름 관련 수치를 계산할 수 있나요?"] });
    const parts = report.sections.at(-1)!.body.split(/개인 질문 [12] 직접 답변/u).slice(1);
    expect(parts[0]).toMatch(/입증하지|증명하지/u);
    expect(parts[1]).toMatch(/이름.{0,20}없|이름.{0,20}필요/u);
    expect(parts[1]).not.toContain("선택지를 더 늘리기보다");
  });

  it("answers each Japanese personal question with the relevant boundary and next step", () => {
    const questions = ["転職を決める前に何を確認すべきですか？", "最近疲れています。生年月日だけで病気の原因は分かりますか？"];
    const report = createPaidReport("synthetic-c5", { ...base, displayLocale: "ja", birthDate: "1995-08-13", focusId: "work", questions });
    const body = text(report);
    for (const question of questions) expect(body).toContain(question);
    expect(body).toContain("回答:");
    expect(body).toContain("勤務条件");
    expect(body).toContain("診断");
  });

  it("gives debt and fatigue questions relevant information needs instead of generic ambition advice", () => {
    const debt = createPaidReport("synthetic-debt", { ...base, locale: "en", focusId: "money", concern: "Can I repay my loan before investing?", questions: ["Can I repay my loan before investing?"] });
    expect(debt.sections[0].body).toMatch(/income|expenses|cash flow/i);
    expect(debt.sections.at(-1)!.body).toContain("interest rate");
    const fatigue = createPaidReport("synthetic-fatigue", { ...base, focusId: "health", concern: "잠이 부족하고 피곤해요. 생년월일로 원인이나 병을 알 수 있나요?" });
    expect(fatigue.sections[0].body).toMatch(/진단.{0,10}없|원인.{0,10}없/u);
    expect(text(fatigue)).not.toContain("유지 가능합니다.");
  });

  it("does not accept a new report with a deleted question answer", () => {
    const input = { ...base, questions: ["이직 전 조건은 무엇을 확인할까요?", "이직하려면 무엇을 먼저 확인할까요?"] };
    const report = createPaidReport("synthetic-integrity", input);
    const damaged = { ...report, sections: report.sections.map((s, i) => i === report.sections.length - 1 ? { ...s, body: s.body.split("개인 질문 1 직접 답변")[0] } : s) };
    expect(auditPaidReportEvidence(damaged, input).passed).toBe(false);
  });

  it.each([
    { locale: "ko", questions: ["이직 제안을 비교할 기준은?", "이직 제안을 비교할 기준은?"] },
    { locale: "en", questions: ["How should I compare two job offers?", "How should I compare two job offers?"] },
    { locale: "ko", displayLocale: "ja", questions: ["転職先の勤務条件をどう比べますか？", "転職先の勤務条件をどう比べますか？"] },
  ])("retains two independently complete answers even for repeated questions in $locale $displayLocale", language => {
    const input = { ...base, ...language };
    const report = createPaidReport("synthetic-repeat", input);
    expect(report.questionAnswers).toHaveLength(2);
    for (const answer of report.questionAnswers!) {
      expect(answer.answer.length).toBeGreaterThan(20);
      expect(answer.action.length).toBeGreaterThan(20);
    }
    expect(auditPaidReportEvidence(report, PaidReadingInputSchema.parse(input)).passed).toBe(true);
    expect(report.qualityAudit?.duplicateSentences).toEqual([]);
  });

  it("does not confuse improve with proof, and keeps multiple domains in one question", () => {
    expect(questionTopics("How can I improve my job conditions?")).toEqual(["career"]);
    expect(questionTopics("How can I prove my job experience?")).toEqual(["career"]);
    expect(questionTopics("I am tired and have loan repayments; how do I assess them?")).toEqual(["medical", "money"]);
    const report = createPaidReport("synthetic-mixed", { ...base, locale: "en", questions: ["I am tired and have loan repayments; how do I assess them?"] });
    expect(report.questionAnswers![0].answer).toMatch(/diagnose illness/u);
    expect(report.questionAnswers![0].information).toMatch(/interest rate/u);
  });

  it.each([
    { locale: "ko", question: "죽고 싶어요. 이직 운을 봐주세요." },
    { locale: "en", question: "I want to kill myself. Can you tell my career fortune?" },
    { locale: "ko", displayLocale: "ja", question: "死にたい。転職の運を教えてください。" },
  ])("keeps urgent safety ahead of career interpretation in $locale $displayLocale", language => {
    const { question, ...locale } = language;
    const report = createPaidReport("synthetic-urgent", { ...base, ...locale, concern: question, questions: [question] });
    expect(report.questionAnswers![0].topics).toEqual(["safety"]);
    expect(report.questionAnswers![0].action.length).toBeGreaterThan(20);
  });

  it("uses actual supported name letters and never invents missing transliteration", () => {
    const input = { ...base, locale: "en", questions: ["Can you calculate my name numbers?"], name: "ALICE" };
    const named = createPaidReport("synthetic-name", input);
    expect(named.questionAnswers![0].answer).toContain("3 / 6 / 6");
    const unsupported = createPaidReport("synthetic-name-unsupported", { ...input, name: "김하나" });
    expect(unsupported.questionAnswers![0].answer).toContain("cannot be calculated");
    expect(unsupported.questionAnswers![0].answer).not.toContain("3 / 6 / 6");
  });

  it("does not turn an unsupported primary question into a confident focus fallback", () => {
    const report = createPaidReport("synthetic-unknown", { ...base, concern: "내일 우편함에 편지가 몇 통 올까요?", questions: ["내일 우편함에 편지가 몇 통 올까요?"] });
    expect(report.sections[0].body).toContain("구체적인 답");
    expect(report.questionAnswers![0].topics).toEqual(["unsupported"]);
  });

  it("reports malformed answer metadata without leaking the question or throwing", () => {
    const input = { ...base, questions: ["private-synthetic-marker: 이직 기준은?"] };
    const report = createPaidReport("synthetic-corruption", input);
    const damaged = { ...report, questionAnswers: [{ ...report.questionAnswers![0], topics: undefined }] } as unknown as typeof report;
    const audit = auditPaidReportEvidence(damaged, input);
    expect(audit.passed).toBe(false);
    expect(audit.failures.join(" ")).not.toContain("private-synthetic-marker");
  });
});
