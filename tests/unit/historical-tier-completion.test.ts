import { describe, expect, it } from "vitest";
import { buildSajuChart } from "@/core/saju";
import { deltaTSeconds } from "@/core/saju/solar-terms";
import { createPaidReport } from "@/server/reports/paid-report";

const base = {
  version: 1 as const,
  locale: "ko" as const,
  birthDate: "1994-11-04",
  birthTime: "09:30",
  name: "테스트",
  focusId: "relationships" as const,
  concern: "올해 관계와 이직을 어떻게 함께 판단할까요?",
  gender: "female" as const,
  createdAt: "2026-08-08T00:00:00.000Z",
};

describe("1900-2100 historical and tier completion", () => {
  it("calculates every supported year and rejects outside boundaries", () => {
    // 1900 is where the Korean standard-time record in `saju/time.ts` begins; earlier
    // births would be given a zone this module cannot vouch for, and a solar-term series
    // nobody has checked against a 만세력. The engine refuses rather than guessing.
    for (let year = 1900; year <= 2100; year += 1) {
      expect(() => buildSajuChart({ birthDate: `${year}-06-15`, birthTime: "12:00", sex: "female" })).not.toThrow();
    }
    expect(() => buildSajuChart({ birthDate: "1899-12-31", sex: "female" })).toThrow();
    expect(() => buildSajuChart({ birthDate: "2101-01-01", sex: "female" })).toThrow();
  });

  it("uses historical delta-T and discloses pre-standard-time uncertainty", () => {
    // ΔT is a pure function of the year and stays correct well outside the window the
    // chart builder accepts; the eleventh century is where it is large enough to be an
    // unambiguous check that the historical polynomial is wired up at all.
    expect(deltaTSeconds(1100)).toBeGreaterThan(900);
    // 1900–1907 predates the 1908 standard-time proclamation. Those births are inside the
    // supported window and are told so rather than being silently given a modern zone.
    const chart = buildSajuChart({ birthDate: "1900-01-01", birthTime: "12:00", sex: "female" });
    expect(chart.termBoundaryWarning).toContain("1908년 이전");
    expect(Math.abs(chart.time.longitudeCorrectionMinutes)).toBeLessThan(1);
  });

  it("creates differentiated 1994-11-04 tiers with real preview, questions and compatibility", () => {
    const basic = createPaidReport("iahistoricalbasic", { ...base, productCode: "plus_30d" });
    const detail = createPaidReport("iahistoricaldetail", { ...base, productCode: "pro_30d" });
    const premium = createPaidReport("iahistoricalpremium", {
      ...base,
      productCode: "premium_pdf",
      questions: ["이직을 결정할 기준은?", "연애와 일의 우선순위는?"],
      companion: { name: "동반자", birthDate: "1992-03-17", relationshipType: "romance" },
    });
    expect(basic.sections.length).toBeLessThan(detail.sections.length);
    expect(detail.sections.some((section) => section.body.includes("수비학 × 사주 교차분석"))).toBe(true);
    expect(premium.sections.at(-1)?.body.match(/개인 질문 [12] 직접 답변/g)).toHaveLength(2);
    expect(premium.sections.at(-1)?.body).toContain("동반자 궁합");
    expect(premium.sections.at(-1)?.body).toContain(premium.paidPreview?.visible);
    expect(premium.qualityAudit).toBeDefined();
  });
});
