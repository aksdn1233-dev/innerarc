import { describe, expect, it } from "vitest";
import { isAdminEmail } from "@/server/admin-access";
import { createPaidReport } from "@/server/reports/paid-report";

const baseInput = {
  version: 1 as const,
  locale: "ko" as const,
  birthDate: "1980-01-01",
  name: "테스트",
  focusId: "relationships" as const,
  concern: "관계에서 지금 조심할 점이 궁금합니다.",
  createdAt: "2026-07-27T10:00:00.000Z",
};

describe("paid report delivery", () => {
  it("creates a concise quick report and a longer premium report", () => {
    const quick = createPaidReport("iaquick123", {
      ...baseInput,
      productCode: "plus_30d",
    });
    const premium = createPaidReport("iapremium123", {
      ...baseInput,
      productCode: "premium_pdf",
    });

    expect(quick.title).toBe("나의 핵심 리딩");
    expect(quick.sections.length).toBeLessThan(premium.sections.length);
    expect(premium.title).toBe("프리미엄 심층 리딩");
    expect(premium.actions.length).toBeGreaterThan(1);
    expect(premium.cautions.length).toBeGreaterThan(1);
  });

  it("tells even the cheapest buyer something about themselves", () => {
    for (const productCode of ["plus_30d", "pro_30d", "premium_pdf"] as const) {
      const report = createPaidReport(`ia${productCode}9999`, { ...baseInput, productCode });
      const expectedTitle = productCode === "plus_30d"
        ? "핵심 성향"
        : productCode === "pro_30d"
          ? "핵심 성향과 기질"
          : "핵심 성향과 기질";
      const core = report.sections.find((section) => section.title === expectedTitle);

      expect(core, `${productCode} is missing the core pattern section`).toBeDefined();
      // The raw numbers moved to the premium tier's calculation section; what every
      // buyer gets here is the character label and the strengths behind it.
      expect(core?.body.length).toBeGreaterThan(60);
      expect(core?.body, productCode).toMatch(/자|사람|설계|관리|연결|통역/);
    }
  });

  it("describes different birth dates differently, not just under a different label", () => {
    // getRuleBasedProfile returns one hard-coded strength list for every life path, so
    // a core-pattern section sourced from it would read identically for every buyer.
    const bodies = [
      "1980-01-01", "1985-06-11", "1990-03-15", "1993-11-27", "2001-08-08",
    ].map((birthDate) => {
      const report = createPaidReport("iavariety123", {
        ...baseInput,
        birthDate,
        productCode: "plus_30d",
      });
      return report.sections.find((section) => section.title === "핵심 성향")?.body ?? "";
    });

    expect(bodies.every((body) => body.length > 0)).toBe(true);
    expect(new Set(bodies).size).toBe(bodies.length);
  });

  it("returns the same reading for the same person every time", () => {
    // Variety must come from the person's own numbers, never from randomness: a buyer
    // who reopens their report has to see what they paid for.
    const twice = [1, 2].map(() =>
      createPaidReport("iastable123", { ...baseInput, productCode: "pro_30d" }).sections);
    expect(JSON.stringify(twice[0])).toBe(JSON.stringify(twice[1]));
  });

  it("keeps the core pattern free of guarantees in both languages", () => {
    for (const locale of ["ko", "en"] as const) {
      const report = createPaidReport("iacore123", {
        ...baseInput,
        locale,
        productCode: "plus_30d",
      });
      const core = report.sections.find((section) =>
        section.title === (locale === "ko" ? "핵심 성향" : "Core temperament"));

      expect(core?.body).toBeDefined();
      expect(core?.body).not.toMatch(/반드시|보장|틀림없|guaranteed|will definitely/i);
      expect(core?.body).not.toContain("undefined");
      // Korean 은/는 depends on the final consonant of the preceding word, and the
      // risk phrase is data, so no sentence may attach a particle straight to it.
      if (locale === "ko") expect(core?.body).not.toMatch(/[가-힣]기은\s|하기은\s/);
    }
  });

  it("does not repeat the same opening across the long report's sections", () => {
    // Five of eight domains once led with the life-path number and shared one sentence
    // frame, so the Premium report read as the same paragraph eight times.
    const premium = createPaidReport("iarepeat123", {
      ...baseInput,
      birthDate: "1994-11-04",
      productCode: "premium_pdf",
    });
    const domainBodies = premium.sections
      .filter((section) => !["지금의 핵심 흐름", "당신은 어떤 사람인가"].includes(section.title))
      .filter((section) => !section.title.includes("일과 역할"))
      .map((section) => section.body);

    expect(domainBodies.length).toBeGreaterThanOrEqual(8);
    const openings = domainBodies.map((body) => body.slice(0, 24));
    expect(new Set(openings).size).toBe(openings.length);
  });

  it("lays the career roles out one per line instead of running them together", () => {
    const premium = createPaidReport("iacareer123", {
      ...baseInput,
      birthDate: "1994-11-04",
      productCode: "premium_pdf",
    });
    const career = premium.sections.find((section) => section.title.includes("일과 역할"));

    expect(career?.body).toContain("잘 맞는 자리 —");
    expect(career?.body).toContain("피할 자리 —");
    expect(career?.body.split("\n").length).toBeGreaterThan(5);
  });

  it("answers every floating example from the entered birth date", () => {
    const questions = [
      ["이번 시험, 잘 볼 수 있을까?", "work"],
      ["그 사람은 지금 잘 지낼까?", "relationships"],
      ["우리 엄마는 왜 그럴까?", "relationships"],
      ["우리 아이는 어떤 사람일까?", "growth"],
      ["남편은 왜 저렇게 생각할까?", "relationships"],
      ["올해 이직해도 괜찮을까?", "work"],
      ["내 건강 습관, 어디부터 바꿀까?", "health"],
      ["올해 돈 흐름은 어떨까?", "money"],
      ["지금 시작해도 괜찮을까?", "growth"],
    ] as const;

    for (const [concern, focusId] of questions) {
      const first = createPaidReport("iaquestiona123", {
        ...baseInput,
        birthDate: "1994-11-04",
        productCode: "pro_30d",
        concern,
        focusId,
      }).sections.find((section) => section.title === "질문에 대한 직접 결론")?.body;
      const second = createPaidReport("iaquestionb123", {
        ...baseInput,
        birthDate: "1988-03-17",
        productCode: "pro_30d",
        concern,
        focusId,
      }).sections.find((section) => section.title === "질문에 대한 직접 결론")?.body;

      expect(first, concern).toMatch(/생명수.*2026 개인년/u);
      expect(second, concern).toMatch(/생명수.*2026 개인년/u);
      expect(first, concern).not.toBe(second);
    }
  });

  it("shows how the three prices deepen the same 941104 health answer", () => {
    const reports = (["plus_30d", "pro_30d", "premium_pdf"] as const).map((productCode) =>
      createPaidReport(`ia941104${productCode}`, {
        ...baseInput,
        birthDate: "1994-11-04",
        productCode,
        focusId: "health",
        concern: "내 건강 습관, 어디부터 바꿀까?",
      }));

    const sectionCounts = reports.map((report) => report.sections.length);
    const totalLengths = reports.map((report) =>
      report.sections.reduce((total, section) => total + section.body.length, 0));

    expect(reports[0].calculationBasis).toMatchObject({
      lifePath: 11,
      birthday: 4,
      attitude: 6,
      birthYear: 5,
      personalYear: 7,
    });
    expect(reports.slice(1).every((report) =>
      report.sections[0]?.body.match(/생명수 11.*개인년/u))).toBe(true);
    expect(reports.every((report) =>
      report.sections.some((section) =>
        section.title.includes(report.productCode === "plus_30d" ? "건강·생활 리듬" : "건강 습관"),
      ))).toBe(true);
    expect(sectionCounts[0]).toBeLessThan(sectionCounts[1]);
    expect(sectionCounts[1]).toBeGreaterThanOrEqual(13);
    expect(totalLengths[0]).toBeGreaterThan(2_500);
    expect(totalLengths[1]).toBeGreaterThan(4_000);
    expect(totalLengths[2]).toBeGreaterThan(totalLengths[0]);
    expect(reports[1].sections.filter((section) =>
      section.title.startsWith("질문 분야 상세 분석 ·")).length).toBe(1);
    expect(reports[2].sections.some((section) =>
      section.title.includes("일과 역할"))).toBe(true);
  });

  it("uses an environment allowlist instead of a hard-coded admin password", () => {
    const environment = { ADMIN_EMAILS: "owner@example.com, second@example.com" };
    expect(isAdminEmail("OWNER@example.com", environment)).toBe(true);
    expect(isAdminEmail("visitor@example.com", environment)).toBe(false);
  });
});
