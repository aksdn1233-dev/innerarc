import { writeFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { createPaidReport } from "../src/server/reports/paid-report";

const base = {
  version: 1 as const, locale: "ko" as const, birthDate: "1994-11-04", birthTime: "09:30",
  name: "1994-11-04 테스트", focusId: "relationships" as const,
  concern: "관계와 일의 우선순위를 어떻게 정할까요?", gender: "female" as const,
  createdAt: "2026-08-08T00:00:00.000Z",
};
describe("1994-11-04 tier sample artifact", () => {
  it("generates the three actual reports", async () => {
    const tiers = ["plus_30d", "pro_30d", "premium_pdf"] as const;
    const reports = tiers.map((productCode) => createPaidReport(`iasample${productCode}`, {
      ...base,
      productCode,
      questions: productCode === "premium_pdf" ? ["이직 판단 기준은?", "관계에서 피할 패턴은?"] : undefined,
      companion: productCode === "premium_pdf"
        ? { name: "동반자", birthDate: "1992-03-17", relationshipType: "romance" as const }
        : undefined,
    }));
    const summary = reports.map((report) => ({
      productCode: report.productCode,
      sections: report.sections.length,
      bodyCharacters: report.sections.reduce((sum, section) => sum + section.body.length, 0),
      languageQaPassed: report.qualityAudit?.passed ?? false,
      languageAudit: report.qualityAudit,
    }));
    const markdown = ["# 1994-11-04 상품별 실제 산출물", "", ...reports.flatMap((report) => [
      `## ${report.tierLabel ?? report.productCode}`, "",
      `- 섹션 수: ${report.sections.length}`,
      `- 본문 글자 수: ${report.sections.reduce((sum, section) => sum + section.body.length, 0)}`,
      `- 언어 QA 통과: ${report.qualityAudit?.passed ?? false}`, "",
      ...report.sections.map((section) => `### ${section.title}\n\n${section.body}\n`),
    ])].join("\n");
    await writeFile("docs/Tier-Sample-1994-11-04.md", markdown, "utf8");
    console.info("TIER_SAMPLE_SUMMARY", JSON.stringify(summary));
    expect(reports).toHaveLength(3);
  });
});
