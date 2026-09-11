import { describe, expect, it } from "vitest";
import { PaidReadingInputSchema } from "@/core/paid-reading";
import { createPaidReport } from "@/server/reports/paid-report";

const base = {
  version: 1 as const,
  locale: "en" as const,
  displayLocale: "ja" as const,
  birthDate: "1994-11-04",
  name: "",
  focusId: "growth" as const,
  concern: "仕事の方向をどう決めればよいですか",
  gender: "male" as const,
  createdAt: "2026-09-12T00:00:00.000Z",
};

describe("Japanese paid reports", () => {
  it("keeps the operational locale bounded while accepting Japanese presentation", () => {
    expect(PaidReadingInputSchema.parse({ ...base, productCode: "pro_30d" }).displayLocale).toBe("ja");
  });

  it("generates Japanese bodies from the same deterministic calculations for every tier", () => {
    const basic = createPaidReport("iajabasic123", { ...base, productCode: "plus_30d" });
    const detail = createPaidReport("iajadetail123", { ...base, productCode: "pro_30d" });
    const premium = createPaidReport("iajapremium123", { ...base, productCode: "premium_pdf" });
    for (const report of [basic, detail, premium]) {
      expect(report.displayLocale).toBe("ja");
      expect(report.calculationBasis).toMatchObject({ birthDate: "1994-11-04", lifePath: 11 });
      expect(report.sections.map((section) => `${section.title}\n${section.body}`).join("\n")).toMatch(/[ぁ-んァ-ヶ一-龯]/u);
      expect(report.disclaimer).toContain("科学的な予測");
    }
    expect(premium.sections.length).toBeGreaterThan(detail.sections.length);
    expect(detail.sections.length).toBeGreaterThanOrEqual(basic.sections.length);
  });

  it("generates a Japanese Four Pillars report without inventing an hour pillar", () => {
    const report = createPaidReport("iajasaju123", { ...base, productCode: "plus_30d", readingKind: "saju_chart", birthTime: undefined });
    expect(report.displayLocale).toBe("ja");
    expect(report.sections[0]?.body).toContain("時柱");
    expect(report.cautions.join(" ")).toContain("出生時刻がない");
    expect(report.contentReferences?.some((entry) => entry.startsWith("saju-rule:"))).toBe(true);
  });
});
