import { describe, expect, it } from "vitest";
import {
  DETAIL_COVERAGE_CATEGORIES,
  PREMIUM_ONLY_CATEGORIES,
  TIER_INHERITANCE_CONTRACT,
} from "@/core/tier-inheritance";
import { createPaidReport } from "@/server/reports/paid-report";

const BASE = {
  version: 1 as const,
  locale: "ko" as const,
  birthDate: "1968-06-23",
  name: "테스트",
  focusId: "work" as const,
  concern: "올해 사업을 더 키워도 될까요?",
  createdAt: "2026-07-31T00:00:00.000Z",
};

function premium(overrides: Partial<Omit<typeof BASE, "focusId">> & {
  focusId?: "work" | "relationships" | "growth" | "money" | "health";
} = {}) {
  return createPaidReport("iapremium79000", {
    ...BASE,
    ...overrides,
    productCode: "premium_pdf",
  });
}

describe("PREMIUM_79000 strict tier inheritance", () => {
  it("uses the exact public label and keeps every DETAIL category with enrichment", () => {
    const report = premium();

    expect(report.title).toBe("프리미엄 심층 리딩");
    expect(report.tierLabel).toBe("프리미엄 심층 리딩 · 39,000원");
    expect(report.sectionPlan).toBe("premium-79000-v2");
    expect(report.coverageCategories).toEqual([
      ...DETAIL_COVERAGE_CATEGORIES,
      ...PREMIUM_ONLY_CATEGORIES,
    ]);
    expect(report.enrichmentAudit).toHaveLength(DETAIL_COVERAGE_CATEGORIES.length);
    expect(report.tierComparisonAudit).toEqual({
      missingFromDetail: [],
      missingFromPremium: [],
      duplicatedWithoutEnrichment: [],
      logicalContradictions: [],
      calculationDifferences: [],
    });
    expect(TIER_INHERITANCE_CONTRACT.PREMIUM_79000.inherits).toEqual([
      "BASIC_19000",
      "DETAIL_39000",
    ]);
  });

  it("calculates the 1968-06-23 fixture correctly and explains the four-number interaction", () => {
    const report = premium();
    expect(report.calculationBasis).toMatchObject({
      serviceYear: 2026,
      lifePath: 8,
      birthday: 5,
      attitude: 11,
      birthYear: 6,
      personalYear: 3,
    });
    const synthesis = report.sections.find((section) =>
      section.title === "네 숫자를 하나로 읽는 종합 해석")?.body ?? "";
    expect(synthesis).toContain("생명수 8");
    expect(synthesis).toContain("생일수 23/5");
    expect(synthesis).toContain("태도수 29/11/2");
    expect(synthesis).toContain("출생연도수 24/6");
    expect(synthesis).toMatch(/성과|자원 운영/u);
    expect(synthesis).toMatch(/적응력|기동성/u);
    expect(synthesis).toMatch(/사람|분위기/u);
    expect(synthesis).toMatch(/책임|보호/u);
  });

  it("is complete without a question and becomes more focused when a question exists", () => {
    const general = premium({ birthDate: "1994-11-04", concern: "" });
    const focused = premium({ birthDate: "1994-11-04", concern: "이번 시험 준비에서 무엇부터 바꿔야 하나요?" });

    expect(general.summary).toContain("질문 없이도");
    expect(general.sections.some((section) => section.title === "직업·사업 방향")).toBe(true);
    expect(general.sections.some((section) => section.title === "재물 흐름")).toBe(true);
    expect(general.sections.some((section) => section.title === "인간관계와 협업")).toBe(true);
    expect(general.sections.some((section) => section.title === "연애와 가까운 관계")).toBe(true);
    expect(focused.sections[0].title).toBe("질문에 대한 직접 결론");
    expect(focused.sections.some((section) => section.title.includes("학업·시험"))).toBe(true);
    expect(general.sections.reduce((sum, section) => sum + section.body.length, 0)).toBeGreaterThan(9_000);
  });

  it("contains eight sharp insights, three complete scenarios, gated actions, and six stop conditions", () => {
    const report = premium({ birthDate: "1994-11-04" });
    const scenarios = report.sections.find((section) => section.title === "최선·현실·위험 시나리오")?.body ?? "";
    const manual = report.sections.find((section) => section.title === "6단계 실행 매뉴얼")?.body ?? "";
    const stops = report.sections.find((section) => section.title === "보류·중단·전환 기준 6가지")?.body ?? "";

    expect(report.sharpInsights).toHaveLength(8);
    expect(scenarios).toMatch(/최선 시나리오[\s\S]*가장 현실적인 시나리오[\s\S]*위험 시나리오/u);
    expect((scenarios.match(/촉발 조건:/gu) ?? [])).toHaveLength(3);
    expect((scenarios.match(/전환 기준:/gu) ?? [])).toHaveLength(3);
    expect((manual.match(/목표:/gu) ?? [])).toHaveLength(6);
    expect((manual.match(/완료 기준:/gu) ?? [])).toHaveLength(6);
    expect((manual.match(/다음 관문:/gu) ?? [])).toHaveLength(6);
    expect((stops.match(/\d\./gu) ?? [])).toHaveLength(6);
  });

  it("routes sensitive domains safely without guarantees or private-fact invention", () => {
    const health = premium({
      focusId: "health",
      concern: "이 증상이 큰 병인지 약을 끊어도 되는지 알려줘",
    });
    const privateFact = premium({
      focusId: "relationships",
      concern: "그 사람이 다른 사람을 만나는지 정확히 알려줘",
    });
    const all = [...health.sections, ...privateFact.sections].map((section) => section.body).join(" ");

    expect(health.sections[0].body).toMatch(/전문가|사실 확인/u);
    expect(all).not.toMatch(/반드시|틀림없이|확실히 합격|수익을 보장/u);
    expect(all).not.toMatch(/다른 사람을 만나고 있습니다|바람을 피우고 있습니다/u);
    expect(all).not.toMatch(/2027|2028|2029/u);
  });

  it("survives the full question-domain matrix with complete inheritance", () => {
    const cases = [
      ["사업을 시작해도 될까요?", "work", "business"],
      ["올해 이직해도 될까요?", "work", "career"],
      ["이번 인사평가에서 승진 준비를 어떻게 할까요?", "work", "promotion"],
      ["지금 목돈을 써도 될까요?", "money", "money"],
      ["이 관계를 계속해도 될까요?", "relationships", "love"],
      ["헤어진 사람과 재회해도 될까요?", "relationships", "reconciliation"],
      ["두 사람 궁합과 갈등 방식을 보고 싶어요", "relationships", "compatibility"],
      ["우리 아이 성향과 진로가 궁금해요", "growth", "child"],
      ["이번 시험 공부에서 무엇부터 바꿀까요?", "work", "study"],
      ["개인레슨 학생 모집을 어떻게 시작할까요?", "work", "education"],
      ["건강 습관을 어디부터 바꿀까요?", "health", "health"],
      ["주택 대출과 이사를 진행해도 될까요?", "money", "housing"],
      ["그 사람 마음과 다른 사람을 만나는지 알려줘", "relationships", "private_fact"],
      ["올해 삶의 방향을 어떻게 정할까요?", "growth", "growth"],
    ] as const;

    for (const [concern, focusId, domain] of cases) {
      const report = premium({ concern, focusId });
      expect(report.contentReferences, concern).toContain(`premium-domain:${domain}`);
      expect(report.sections.length, concern).toBeGreaterThanOrEqual(27);
      expect(report.tierComparisonAudit, concern).toEqual({
        missingFromDetail: [],
        missingFromPremium: [],
        duplicatedWithoutEnrichment: [],
        logicalContradictions: [],
        calculationDifferences: [],
      });
      expect(report.sections.map((section) => section.body).join(" "), concern)
        .not.toMatch(/undefined|NaN|\{\{|\}\}/u);
    }
  });
});
