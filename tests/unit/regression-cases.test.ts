import { describe, expect, it } from "vitest";
import { createPaidReport } from "@/server/reports/paid-report";

// The four regression cases from the mid-project correction instruction. Case A (the
// 1994-11-04 web-business question) is already covered in reading-quality.test.ts —
// these are the remaining three.

const TIERS = ["plus_30d", "pro_30d", "premium_pdf"] as const;

describe("case B — attracting students for a lesson business", () => {
  const base = {
    version: 1 as const,
    locale: "ko" as const,
    birthDate: "1979-02-21",
    name: "테스트",
    focusId: "work" as const,
    concern: "올해 바이올린 개인레슨 학생이 생길까요? 지금은 학생이 없습니다.",
    createdAt: "2026-07-30T10:00:00.000Z",
  };

  it("routes to the client-acquisition topic, not a generic fallback", () => {
    for (const tier of TIERS) {
      const report = createPaidReport("iacaseb1234567", { ...base, productCode: tier });
      const topicSection = report.sections.find((s) => s.title.includes("이 고민에서 확인할 것"));
      expect(topicSection?.title, tier).toContain("고객·수강생 확보");
    }
  });

  it("answers directly and names the real lever — visibility, not just skill", () => {
    const report = createPaidReport("iacaseb1234567", { ...base, productCode: "pro_30d" });
    expect(report.sections[0].title).toBe("질문에 대한 답");
    expect(report.sections[0].body).not.toMatch(/^알 수 없|^수비학으로.*알 수 없/);
    const whole = report.sections.map((s) => s.body).join(" ");
    expect(whole).toMatch(/증거|보여|눈에 보이/);
  });

  it("carries a character label distinct from a generic archetype", () => {
    const report = createPaidReport("iacaseb1234567", { ...base, productCode: "pro_30d" });
    expect(report.characterLabel).toBeDefined();
    expect(report.characterLabel!.length).toBeGreaterThan(4);
  });
});

describe("case C — whether contact resumes after a move abroad", () => {
  // The paid-report product takes one birth date and one free-text question — there is
  // no second-person input in this schema. A genuine two-person reading belongs to the
  // separate compatibility feature (src/core/compatibility); this case is tested here
  // exactly as a real buyer would use this product: their own birth date plus the
  // question as written, including the other person implicitly.
  const base = {
    version: 1 as const,
    locale: "ko" as const,
    birthDate: "1980-02-26",
    name: "테스트",
    focusId: "relationships" as const,
    concern: "해외에 나간 뒤 연락이 뜸한데 귀국하면 다시 연락이 올까요?",
    createdAt: "2026-07-30T10:00:00.000Z",
  };

  it("routes to the reunion/contact topic and gives a direct opening", () => {
    const report = createPaidReport("iacasec1234567", { ...base, productCode: "pro_30d" });
    const topicSection = report.sections.find((s) => s.title.includes("이 고민에서 확인할 것"));
    expect(topicSection?.title).toContain("재회");
    expect(report.sections[0].title).toBe("질문에 대한 답");
    expect(report.sections[0].body.length).toBeGreaterThan(30);
  });

  it("never fabricates a private fact such as another partner", () => {
    for (const tier of TIERS) {
      const report = createPaidReport("iacasec1234567", { ...base, productCode: tier });
      const whole = report.sections.map((s) => s.body).join(" ");
      expect(whole, tier).not.toMatch(/다른 (여자|남자|사람)가?\s*(생겼|있습니다|있어요)/);
      expect(whole, tier).not.toMatch(/반드시 연락|틀림없이 연락/);
    }
  });
});

describe("case D — a child's temperament and direction", () => {
  const base = {
    version: 1 as const,
    locale: "ko" as const,
    birthDate: "2015-03-02",
    name: "테스트",
    focusId: "growth" as const,
    concern: "아이 성향과 진로",
    createdAt: "2026-07-30T10:00:00.000Z",
  };

  it("routes to the child-temperament topic, not the generic child-worry one", () => {
    const report = createPaidReport("iacased1234567", { ...base, productCode: "pro_30d" });
    const topicSection = report.sections.find((s) => s.title.includes("이 고민에서 확인할 것"));
    expect(topicSection?.title).toContain("자녀 성향·진로");
  });

  it("never locks the child into one occupation and drops the adult career-role section", () => {
    const premium = createPaidReport("iacased1234567", { ...base, productCode: "premium_pdf" });
    expect(premium.sections.some((s) => s.title.includes("일과 역할"))).toBe(false);
    const whole = premium.sections.map((s) => s.body).join(" ");
    expect(whole).not.toMatch(/전략기획|마케팅·콘텐츠|영업\b/);
  });

  it("covers learning style and pressure response rather than a career prediction", () => {
    const report = createPaidReport("iacased1234567", { ...base, productCode: "pro_30d" });
    const topicSection = report.sections.find((s) => s.title.includes("이 고민에서 확인할 것"));
    expect(topicSection?.body).toMatch(/학습|몰입|배우는 방식/);
  });
});

describe("premium is not detail with adjectives", () => {
  it("grows meaningfully in both length and exclusive content, not just tone", () => {
    const base = {
      version: 1 as const,
      locale: "ko" as const,
      birthDate: "1994-11-04",
      name: "테스트",
      focusId: "work" as const,
      concern: "사업 준비 중인데 웹사업 잘될까 올해",
      createdAt: "2026-07-30T10:00:00.000Z",
    };
    const detail = createPaidReport("iacasee1234567", { ...base, productCode: "pro_30d" });
    const premium = createPaidReport("iacasee1234567", { ...base, productCode: "premium_pdf" });
    const detailLen = detail.sections.reduce((sum, s) => sum + s.body.length, 0);
    const premiumLen = premium.sections.reduce((sum, s) => sum + s.body.length, 0);
    expect(premiumLen).toBeGreaterThan(detailLen * 1.3);

    const detailTitles = new Set(detail.sections.map((s) => s.title));
    const premiumOnlyTitles = premium.sections.filter((s) => !detailTitles.has(s.title));
    expect(premiumOnlyTitles.length).toBeGreaterThanOrEqual(2);
  });
});
