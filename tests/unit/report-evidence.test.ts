import { describe, expect, it } from "vitest";
import type { PaidReadingInput, PaidReport } from "@/core/paid-reading";
import { createPaidReport } from "@/server/reports/paid-report";
import { auditPaidReportEvidence, verifyPaidReportEvidence } from "@/server/reports/evidence-audit";
import { resolveConcernTopic, topicText } from "@/core/topics/concern-topics";

const base: PaidReadingInput = {
  version: 1, locale: "ko", productCode: "pro_30d", birthDate: "1994-11-04",
  name: "", focusId: "growth", concern: "", createdAt: "2026-10-22T00:00:00.000Z",
};
// Public, synthetic fixtures. No customer records or provider calls.
const dates = ["1994-11-04", "1980-01-03", "1990-09-05", "2000-02-29", "1900-01-01", "2004-12-31", "1969-07-20", "2024-02-29", "2001-01-01"];
const languages = [{ locale: "ko" }, { locale: "en" }, { locale: "ko", displayLocale: "ja" }] as const;
const numerologyCases = dates.flatMap(birthDate => languages.flatMap(language =>
  (["plus_30d", "pro_30d", "premium_pdf"] as const).map(productCode => ({ ...base, ...language, productCode, birthDate }))));
const sajuCases = dates.flatMap(birthDate => languages.flatMap(language =>
  [undefined, "23:35"].map(birthTime => ({ ...base, ...language, productCode: "plus_30d" as const, readingKind: "saju_chart" as const, birthDate, birthTime }))));

describe("new report evidence gate", () => {
  it.each([...numerologyCases, ...sajuCases])("checks $productCode $locale $displayLocale $birthDate $birthTime against its engine", input => {
    const report = createPaidReport("synthetic-quality", input);
    expect(auditPaidReportEvidence(report, input)).toEqual({ passed: true, failures: [] });
    expect(report.contentReferences).toContain("report-evidence:1.0.0");
  });

  it.each([
    ["1994-11-04", 11, 4, 6, 5, 7],
    ["1980-01-03", 22, 3, 4, 9, 5],
    ["1990-09-05", 33, 5, 5, 1, 6],
  ])("retains independently specified golden numbers for %s", (birthDate, lifePath, birthday, attitude, birthYear, personalYear) => {
    const report = createPaidReport("golden-quality", { ...base, birthDate });
    expect(report.calculationBasis).toMatchObject({ lifePath, birthday, attitude, birthYear, personalYear });
  });

  it("rejects wrong calculated facts, including a correct-looking body with corrupt metadata", () => {
    const report = createPaidReport("synthetic-quality", base);
    const corrupt = { ...report, calculationBasis: { ...report.calculationBasis!, lifePath: 9 } };
    expect(auditPaidReportEvidence(corrupt, base).failures).toContain("basis.lifePath");
    expect(() => verifyPaidReportEvidence(corrupt, base)).toThrow("REPORT_EVIDENCE_MISMATCH");
    expect(auditPaidReportEvidence({ ...report, calculationBasis: undefined }, base).passed).toBe(false);
    expect(auditPaidReportEvidence(report, { ...base, birthDate: "2000-02-29" }).passed).toBe(false);
  });

  it("rejects incorrect printed numbers even when metadata is correct", () => {
    const report = createPaidReport("synthetic-quality", base);
    for (const replacement of ["생명수 9", "생명수 11/9"]) {
      const corrupt = { ...report, sections: report.sections.map(section => section.title === "핵심 숫자"
        ? { ...section, body: section.body.replace("생명수 11/2", replacement) } : section) };
      expect(auditPaidReportEvidence(corrupt, base).failures).toContain("printed.lifePath");
    }
  });

  it("does not treat numbers quoted in a customer's concern as calculation evidence", () => {
    const input = { ...base, concern: "생명수 9라고 들었는데 이직 고민도 함께 봐주세요." };
    expect(auditPaidReportEvidence(createPaidReport("synthetic-question", input), input).passed).toBe(true);
  });

  it("rejects a wrong printed personal year and a mismatched edition year", () => {
    const report = createPaidReport("synthetic-quality", base);
    for (const [from, to, failure] of [["2026 개인년 7", "2026 개인년 8", "printed.personalYear"], ["2026 개인년", "2025 개인년", "printed.serviceYear"]]) {
      const corrupt = { ...report, sections: report.sections.map(section => section.title === "핵심 숫자"
        ? { ...section, body: section.body.replace(from!, to!) } : section) };
      expect(auditPaidReportEvidence(corrupt, base).failures).toContain(failure);
    }
    expect(auditPaidReportEvidence({ ...report, calculationBasis: { ...report.calculationBasis!, serviceYear: NaN } }, base).failures).toContain("basis.serviceYear");
  });

  it("separates the calculation from the hypothesis without repeating its notice", () => {
    const report = createPaidReport("synthetic-quality", base);
    expect(report.disclaimer).toContain("상징적 가설");
    expect(verifyPaidReportEvidence(report, base).disclaimer).toBe(report.disclaimer);
  });

  it.each(["ko", "en"] as const)("answers each premium question through its own topic in %s", locale => {
    const questions = locale === "ko"
      ? ["이직을 고민 중인데 어떻게 판단할까요?", "대출이 있는데 돈 관리를 어떻게 시작할까요?"]
      : ["How should I decide about changing jobs?", "How should I manage money while repaying a loan?"];
    const report = createPaidReport("synthetic-two-questions", { ...base, locale, productCode: "premium_pdf", questions });
    const body = report.sections.at(-1)!.body;
    const marker = locale === "ko" ? /개인 질문 [12] 직접 답변/u : /Personal question [12]/u;
    const parts = body.split(marker);
    expect(parts).toHaveLength(3);
    expect(parts[1]).toContain(locale === "ko" ? "평가 기준" : "next role");
    expect(parts[2]).toContain(locale === "ko" ? "현금" : "repayment capacity");
    expect(parts[1]).not.toContain(locale === "ko" ? "첫 세 번의 만남" : "first three meetings");
    expect(parts[2]).not.toContain(locale === "ko" ? "첫 세 번의 만남" : "first three meetings");
    expect(parts[2]).not.toContain("manageable shape");
  });

  it.each(["ko", "en"] as const)("does not assert repayment capacity without financial facts in %s", locale => {
    const concern = locale === "ko" ? "대출을 어떻게 상환해야 할까요?" : "How can I repay a loan?";
    const report = createPaidReport("synthetic-debt", { ...base, locale, productCode: "plus_30d", concern });
    // A professional-first safety response is also correct; never force a financial
    // interpretation to replace that valid boundary just to match one sentence.
    expect(report.sections[0]!.body).toMatch(locale === "ko" ? /판단할 수는? 없어요|전문가나 공식 기관/u : /cannot establish repayment capacity/u);
    expect(report.sections[0]!.body).not.toMatch(/정리 가능한 규모|manageable shape/u);
    const { topic } = resolveConcernTopic(concern, "growth");
    expect(topic.id).toBe("debt");
    expect(topicText(topic.verdict, locale)).toContain(locale === "ko" ? "판단할 수는 없어요" : "cannot establish repayment capacity");
  });

  it("does not accept a forged hour pillar when birth time is unknown", () => {
    const input = { ...base, readingKind: "saju_chart" as const, productCode: "plus_30d" as const };
    const report = createPaidReport("synthetic-saju", input);
    const corrupt = { ...report, sections: report.sections.map(section => section.title === "원국 네 기둥"
      ? { ...section, body: section.body.replace("시주 미입력", "甲子") } : section) };
    expect(auditPaidReportEvidence(corrupt, input).failures).toContain("saju.pillars");
  });

  it("rejects empty output, lost limitations and wrong product without leaking inputs", () => {
    const report = createPaidReport("synthetic-quality", base);
    const corruptions: PaidReport[] = [{ ...report, sections: [] }, { ...report, disclaimer: "완벽히 적중합니다" }, { ...report, productCode: "plus_30d" }];
    for (const corrupt of corruptions) {
      const audit = auditPaidReportEvidence(corrupt, base);
      expect(audit.passed).toBe(false);
      expect(JSON.stringify(audit)).not.toContain(base.birthDate);
    }
  });
});
