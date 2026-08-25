import { describe, expect, it } from "vitest";
import { PaidReadingInputSchema, type PaidReport } from "@/core/paid-reading";
import { createPaidReport } from "@/server/reports/paid-report";

const BASE = {
  version: 1 as const,
  locale: "ko" as const,
  productCode: "plus_30d" as const,
  birthDate: "1994-11-04",
  name: "테스트",
  focusId: "growth" as const,
  concern: "",
  createdAt: "2026-07-30T10:00:00.000Z",
};

function totalKoreanContent(report: PaidReport): string {
  return [
    report.summary,
    ...report.sections.flatMap((section) => [section.title, section.body]),
    ...report.actions,
    report.disclaimer,
  ].join("\n");
}

describe("BASIC_19000 complete report", () => {
  it("builds the documented 1994-11-04 general report from deterministic facts", () => {
    const report = createPaidReport("iabasicgeneral123", BASE);
    const whole = totalKoreanContent(report);

    expect(report).toMatchObject({
      title: "나의 핵심 리딩",
      productCode: "plus_30d",
      sectionPlan: "basic-19000-v2",
      characterLabel: "가능성을 구조로 만드는 설계자",
      calculationBasis: {
        birthDate: "1994-11-04",
        serviceYear: 2026,
        lifePath: 11,
        birthday: 4,
        attitude: 6,
        birthYear: 5,
        personalYear: 7,
      },
    });
    expect(report.sections.map((section) => section.title)).toEqual([
      "핵심 숫자",
      "캐릭터 한 문장",
      "핵심 성향",
      "주요 강점",
      "반복되는 약점",
      "직업·사업 방향",
      "돈의 흐름",
      "관계 성향",
      "2026년 흐름",
      "최종 결론",
    ]);
    expect(whole).toMatch(/사람과 시장.*변화/u);
    expect(whole).toMatch(/아이디어.*구조/u);
    expect(whole).toMatch(/자동화 기술.*웹 서비스.*플랫폼.*콘텐츠.*마케팅/u);
    expect(whole).toMatch(/여러 프로젝트.*동시에/u);
    expect(whole).toMatch(/완성되기 직전.*새/u);
    expect(whole).toMatch(/증명되지 않은 가능성.*실제 역량/u);
    expect(whole).toMatch(/확장.*자금/u);
    expect(whole).toMatch(/가까운 사람/u);
    expect(whole).toMatch(/2026년.*검증.*완성/u);
    expect(whole).toMatch(/유료 고객/u);
    expect(report.actions).toHaveLength(3);
    expect(new Set(report.actions).size).toBe(3);
    expect(report.sharpInsights?.length).toBeGreaterThanOrEqual(2);
    expect(whole.length).toBeGreaterThanOrEqual(2_500);
    expect(whole.length).toBeLessThanOrEqual(4_000);
    expect(report.sections.at(-1)?.body).toMatch(/끝까지 현실로 만들 때 시작됩니다/u);
  });

  it.each([
    ["business", "work", "AI 웹서비스 사업을 해도 될까?", "사업·웹서비스"],
    ["career", "work", "이직 방향이 맞을까?", "직업·진로"],
    ["money", "money", "올해 돈 흐름과 대출을 어떻게 볼까?", "돈·현금흐름"],
    ["love", "relationships", "그 사람과 관계가 이어질까?", "연애·관계"],
    ["reconciliation", "relationships", "헤어진 사람과 다시 연락이 올까?", "재회·연락"],
    ["child", "growth", "우리 아이 성향과 진로가 궁금해", "자녀 성향·진로"],
    ["lesson", "work", "바이올린 레슨 수강생이 생길까?", "레슨·교육 사업"],
    ["health", "health", "내 건강 습관과 생활 리듬은 무엇부터 바꿀까?", "건강·생활 리듬"],
    ["housing", "money", "주택 대출과 이사를 진행해도 될까?", "주거·대출·이사"],
    ["private", "relationships", "그 사람이 CCTV로 나를 보고 있나?", "확인할 수 없는 타인의 사실"],
    ["compatibility", "relationships", "두 사람 궁합을 보고 싶어", "두 사람의 관계 방식"],
  ] as const)(
    "answers the %s question in one focused, complete composition",
    (_caseName, focusId, concern, domainLabel) => {
      const report = createPaidReport(`iabasic${_caseName}123`, {
        ...BASE,
        focusId,
        concern,
      });
      const whole = totalKoreanContent(report);
      const focusedSections = report.sections.filter((section) =>
        section.title.startsWith("질문 분야 분석 ·"));

      expect(report.sections[0]?.title).toBe("질문에 대한 직접 결론");
      expect(report.sections.length).toBeGreaterThanOrEqual(8);
      expect(report.sections.length).toBeLessThanOrEqual(11);
      expect(focusedSections).toHaveLength(1);
      expect(focusedSections[0]?.title).toBe(`질문 분야 분석 · ${domainLabel}`);
      expect(report.sections.at(-1)?.title).toBe("최종 결론");
      expect(report.actions).toHaveLength(3);
      expect(new Set(report.actions).size).toBe(3);
      expect(report.sharpInsights?.length).toBeGreaterThanOrEqual(2);
      expect(whole.length).toBeGreaterThanOrEqual(2_500);
      expect(whole.length).toBeLessThanOrEqual(4_000);
      expect(whole).not.toMatch(/\{\{|\}\}|undefined|NaN|\[object/u);
      expect(whole).not.toMatch(/타로|뽑힌 카드|2027년|2028년/u);
      for (const section of report.sections) {
        expect(section.title.trim().length).toBeGreaterThan(0);
        expect(section.body.trim().length).toBeGreaterThan(20);
      }
    },
  );

  it("handles health, private-fact, and compatibility questions safely", () => {
    const health = totalKoreanContent(createPaidReport("iabasichealthsafe", {
      ...BASE,
      focusId: "health",
      concern: "내 건강 습관과 생활 리듬은 무엇부터 바꿀까?",
    }));
    expect(health).not.toMatch(/진단|치료합니다|완치|2주 안에 체중 5%/u);

    const privateFact = totalKoreanContent(createPaidReport("iabasicprivatefact", {
      ...BASE,
      focusId: "relationships",
      concern: "그 사람이 CCTV로 나를 보고 있나?",
    }));
    expect(privateFact).toMatch(/확인할 수 없/u);
    expect(privateFact).toMatch(/반복 행동.*접근 권한|접근 권한.*반복 행동/u);

    const compatibility = totalKoreanContent(createPaidReport("iabasiccompatibility", {
      ...BASE,
      focusId: "relationships",
      concern: "두 사람 궁합을 보고 싶어",
    }));
    expect(compatibility).toMatch(/상대 생년월일/u);
  });

  it("allows the general report without a question and keeps legacy stored reports valid", () => {
    expect(() => PaidReadingInputSchema.parse(BASE)).not.toThrow();

    const legacy: PaidReport = {
      version: 1,
      orderId: "ialegacy123",
      productCode: "plus_30d",
      locale: "ko",
      title: "기존 리포트",
      customerName: null,
      createdAt: "2026-07-01T10:00:00.000Z",
      concern: "기존 질문",
      summary: "기존 요약",
      sections: [{ title: "기존 섹션", body: "기존 저장 콘텐츠는 새 필드 없이도 표시됩니다." }],
      actions: ["기존 행동"],
      cautions: ["기존 주의"],
      disclaimer: "기존 고지",
    };
    expect(legacy.sectionPlan).toBeUndefined();
    expect(legacy.calculationBasis).toBeUndefined();
  });
});
