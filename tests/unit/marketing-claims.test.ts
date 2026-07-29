import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { createPaidReport } from "@/server/reports/paid-report";

const baseInput = {
  version: 1 as const,
  locale: "ko" as const,
  birthDate: "1990-03-15",
  name: "테스트",
  focusId: "relationships" as const,
  concern: "지금 관계에서 조심할 점이 궁금합니다.",
  createdAt: "2026-07-28T10:00:00.000Z",
};

const homepage = await readFile("src/components/onboarding-experience.tsx", "utf8");
const plansPage = await readFile("src/app/[locale]/plans/page.tsx", "utf8");
const dictionaries = await readFile("src/i18n/dictionaries.ts", "utf8");

describe("what the copy promises matches what the reader gets", () => {
  it("gives every tier the core pattern the product copy advertises", () => {
    for (const productCode of ["plus_30d", "pro_30d", "premium_pdf"] as const) {
      const report = createPaidReport("iaclaims123", { ...baseInput, productCode });
      expect(
        report.sections.some((section) => section.title === "당신은 어떤 사람인가"),
        `${productCode} promises a core pattern but does not include one`,
      ).toBe(true);
    }
  });

  it("delivers more depth at each step up in price", () => {
    const [quick, comprehensive, premium] = (["plus_30d", "pro_30d", "premium_pdf"] as const)
      .map((productCode) => createPaidReport("iaclaims123", { ...baseInput, productCode }));

    expect(quick.sections.length).toBeLessThan(comprehensive.sections.length);
    expect(comprehensive.sections.length).toBeLessThan(premium.sections.length);
    expect(premium.sections.some((section) => section.title.includes("일과 역할"))).toBe(true);
  });

  it("advertises compatibility only where the tier gate actually allows it", async () => {
    // Compatibility requires the pro tier, which plus_30d does not grant.
    const gate = await readFile("src/app/[locale]/compatibility/page.tsx", "utf8");
    expect(gate).toContain('hasPaidFeatureAccess("pro")');

    const quickBlock = plansPage.slice(
      plansPage.indexOf('code: "plus_30d"'),
      plansPage.indexOf('code: "pro_30d"'),
    );
    expect(quickBlock).not.toContain("궁합");
  });
});

describe("advertising claims stay defensible", () => {
  it("claims no popularity while nothing has been sold", () => {
    for (const source of [homepage, plansPage]) {
      expect(source).not.toMatch(/가장 많이 (선택|구매|찾)/);
      expect(source).not.toMatch(/Most (selected|popular|purchased)/i);
      expect(source).not.toMatch(/\d+\s*(명|건)\s*(이|가)?\s*(선택|구매)/);
    }
  });

  it("presents no invented customer testimonial", () => {
    // The situations block is labelled as situations, not quotes from buyers.
    expect(homepage).toMatch(/실제 후기가 아니라/);
    expect(homepage).not.toMatch(/후기\s*[:：]/);
    expect(homepage).not.toMatch(/(님|씨)\s*·\s*\d/);
  });

  it("never claims to be more accurate than another assessment", () => {
    // Symbolic reflection cannot claim comparative accuracy, and an unsupported
    // comparison is exactly what 표시광고법 treats as unfair comparative advertising.
    for (const source of [homepage, dictionaries]) {
      expect(source).not.toMatch(/보다\s*(더\s*)?정확/);
      expect(source).not.toMatch(/적중률|명중률|(百|백)발백중/);
      expect(source).not.toMatch(/more accurate than/i);
    }
  });

  it("promises no outcome it cannot control", () => {
    for (const source of [homepage, plansPage, dictionaries]) {
      expect(source).not.toMatch(/반드시\s*(이루|성공|좋아)/);
      expect(source).not.toMatch(/합격|당첨|완치|수익\s*보장/);
    }
  });
});
