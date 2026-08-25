import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import type { PaidReport } from "@/core/paid-reading";
import { createPaidReport } from "@/server/reports/paid-report";

const BASE = {
  version: 1 as const,
  locale: "ko" as const,
  productCode: "pro_30d" as const,
  birthDate: "1994-11-04",
  name: "테스트",
  focusId: "growth" as const,
  concern: "",
  createdAt: "2026-07-30T10:00:00.000Z",
};

function detail(
  concern: string,
  focusId: "work" | "relationships" | "health" | "growth" | "money" = "growth",
) {
  return createPaidReport("iadetail39000", { ...BASE, concern, focusId });
}

function customerContent(report: PaidReport): string {
  return [
    report.title,
    report.summary,
    ...report.sections.flatMap((section) => [section.title, section.body]),
    ...report.actions,
    ...report.cautions,
    report.disclaimer,
  ].join("\n\n");
}

describe("DETAIL_39000 exact 1994-11-04 regression", () => {
  it("builds the required no-question consultant report from deterministic content", () => {
    const report = detail("");
    const whole = customerContent(report);

    expect(report.tierLabel).toBe("상세 리딩 · 39,000원");
    expect(report.sectionPlan).toBe("detail-39000-v2");
    expect(report.calculationBasis).toEqual({
      birthDate: "1994-11-04",
      serviceYear: 2026,
      lifePath: 11,
      birthday: 4,
      attitude: 6,
      birthYear: 5,
      personalYear: 7,
    });
    expect(report.characterLabel).toBe("판을 먼저 읽는 시스템 설계자");
    expect(report.sections).toHaveLength(18);
    expect(report.actions).toHaveLength(5);
    expect(report.sharpInsights).toHaveLength(5);
    expect(report.sections[0]?.title).toBe("핵심 숫자");
    expect(report.sections.at(-1)?.title).toBe("최종 결론");

    expect(whole).toMatch(/사람.*시장|시장.*사람/u);
    expect(whole).toMatch(/자동화 기술.*웹\s*서비스.*플랫폼.*마케팅.*콘텐츠/u);
    expect(whole).toMatch(/직감[\s\S]*근거|근거[\s\S]*직감/u);
    expect(whole).toMatch(/검증하지 않은.*판단|증명하지 않은 미래/u);
    expect(whole).toMatch(/다음 아이디어|현재.*완료/u);
    expect(whole).toMatch(/위임|권한.*책임/u);
    expect(whole).toMatch(/고정비|현금|이익/u);
    expect(whole).toMatch(/안정.*당연|관계.*확인/u);
    expect(whole).toMatch(/일을 다시 가져|통제/u);
    expect(whole).toMatch(/2026.*검증.*전문성/u);
    expect(whole).toMatch(/법률.*개인정보.*기술/u);
    expect(whole).not.toMatch(/2027|2028/u);
    expect(whole).not.toMatch(/타로로 치면|카드가 나왔|AI가 분석했습니다/u);
    expect(whole.length).toBeGreaterThanOrEqual(5_000);
    expect(whole.length).toBeLessThanOrEqual(8_500);
  });

  it("uses each sharp insight and paragraph once", () => {
    const report = detail("");
    const paragraphs = report.sections
      .flatMap((section) => section.body.split(/\n{2,}/u))
      .map((paragraph) => paragraph.trim().replace(/\s+/gu, " "))
      .filter(Boolean);

    expect(new Set(report.sharpInsights).size).toBe(5);
    const duplicates = paragraphs.filter((paragraph, index) => paragraphs.indexOf(paragraph) !== index);
    expect(duplicates).toEqual([]);
    for (const insight of report.sharpInsights ?? []) {
      expect(customerContent(report)).toContain(insight);
    }
  });
});

describe("DETAIL_39000 question-domain coverage", () => {
  const cases = [
    ["business", "웹사업을 시작해도 될까요? 유료 고객과 반복 사용이 걱정됩니다.", "work", "domain:business"],
    ["career", "현재 직장에서 이직하는 게 맞을까요?", "work", "domain:career"],
    ["promotion", "올해 승진에서 계속 밀리지 않을까요?", "work", "domain:promotion"],
    ["money", "대출과 고정비가 있는데 돈 흐름을 어떻게 잡아야 할까요?", "money", "domain:money"],
    ["love", "연애 중인데 관계를 계속 이어가도 될까요?", "relationships", "domain:love"],
    ["reconciliation", "헤어진 사람과 재회하고 다시 연락할 수 있을까요?", "relationships", "domain:reconciliation"],
    ["compatibility", "두 사람 궁합과 반복되는 갈등이 궁금합니다.", "relationships", "domain:compatibility"],
    ["child", "우리 아이 성향과 진로, 공부 압박을 어떻게 봐야 할까요?", "growth", "domain:child"],
    ["education", "바이올린 개인레슨 학생을 모집하려면 무엇부터 해야 하나요?", "work", "domain:education"],
    ["health", "건강을 단정하지 말고 수면과 운동 습관부터 어떻게 바꿀지 알려주세요.", "health", "domain:health"],
    ["housing", "전세대출과 입주 일정이 있는 이사를 진행해도 될까요?", "money", "domain:housing"],
    ["private fact", "상대에게 다른 사람이 있는지, 나를 생각하는지 궁금합니다.", "relationships", "domain:private_fact"],
    ["two-person relationship", "남편과 대화가 자꾸 어긋나는데 관계를 어떻게 풀까요?", "relationships", "domain:love"],
  ] as const;

  it.each(cases)("%s routes to a single detailed module with complete decision support", (
    _name,
    concern,
    focusId,
    contentRef,
  ) => {
    const report = detail(concern, focusId);
    const whole = customerContent(report);
    const titles = report.sections.map((section) => section.title);
    const paragraphs = report.sections
      .flatMap((section) => section.body.split(/\n{2,}/u))
      .map((paragraph) => paragraph.trim().replace(/\s+/gu, " "))
      .filter(Boolean);

    expect(report.sections[0]?.title).toBe("질문에 대한 직접 결론");
    expect(report.sections[0]?.body.length).toBeGreaterThan(80);
    expect(report.sections).toHaveLength(16);
    expect(titles).toContain("숫자 조합 안의 모순");
    expect(titles).toContain("생각하고 결정하는 방식");
    expect(titles).toContain("반복되는 실패 패턴");
    expect(titles.some((title) =>
      title.startsWith("질문 분야 상세 분석 ·") ||
      title.startsWith("먼저 확인해야 할 것 ·"))).toBe(true);
    expect(titles).toContain("2026년 핵심 흐름");
    expect(titles).toContain("상황별 대처");
    expect(titles).toContain("보류·중단·재검토 기준");
    expect(titles.at(-1)).toBe("최종 결론");
    expect(report.actions).toHaveLength(5);
    expect(report.sharpInsights).toHaveLength(5);
    expect(report.contentReferences).toContain(contentRef);
    const duplicates = paragraphs.filter((paragraph, index) => paragraphs.indexOf(paragraph) !== index);
    expect(duplicates).toEqual([]);
    expect(whole).not.toMatch(/2027|2028|타로로 치면|카드가 나왔|AI가 분석했습니다/u);
    expect(whole).not.toMatch(/다른 (여자|남자|사람)가?\s*(생겼|있습니다|있어요)/u);
    expect(whole).not.toMatch(/\{\{|\}\}|undefined|NaN|\[object/u);
  });

  it("keeps medical outcomes behind a qualified reality check", () => {
    const report = detail("암 진단을 받았는데 완치될 수 있을까요?", "health");
    const whole = customerContent(report);

    expect(report.sections[0]?.body).toContain("자격을 갖춘 전문가");
    expect(report.sections.some((section) =>
      section.title.startsWith("먼저 확인해야 할 것 ·"))).toBe(true);
    expect(whole).not.toMatch(/완치(합니다|됩니다)|반드시 낫/u);
  });

  it("does not leak content provenance into the customer renderer", async () => {
    const renderer = await readFile("src/app/[locale]/reports/[orderId]/page.tsx", "utf8");
    const download = await readFile("src/app/api/reports/[orderId]/download/route.ts", "utf8");

    expect(renderer).not.toContain("contentReferences");
    expect(download).not.toContain("contentReferences");
  });

  it("keeps legacy stored report fields optional", () => {
    const legacy: PaidReport = {
      version: 1,
      orderId: "ialegacy39000",
      productCode: "pro_30d",
      locale: "ko",
      title: "기존 상세 리딩",
      customerName: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      concern: "기존 질문",
      summary: "기존 요약",
      sections: [{ title: "기존 섹션", body: "기존에 저장된 리포트 본문입니다." }],
      actions: ["기존 행동"],
      cautions: [],
      disclaimer: "기존 안내",
    };

    expect(JSON.parse(JSON.stringify(legacy))).toEqual(legacy);
  });
});

describe("DETAIL_39000 English compatibility", () => {
  it("does not mix Korean domain-plan copy into an English report", () => {
    const report = createPaidReport("iadetailenglish", {
      ...BASE,
      locale: "en",
      concern: "Should I launch this web business this year?",
      focusId: "work",
    });
    const whole = customerContent(report);

    expect(report.sections[0]?.title).toBe("Direct answer");
    expect(whole).not.toMatch(/[가-힣]/u);
    expect(whole).toContain("2026");
  });
});
