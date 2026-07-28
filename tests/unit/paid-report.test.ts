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

    expect(quick.title).toBe("간단 타로 리딩");
    expect(quick.sections.length).toBeLessThan(premium.sections.length);
    expect(premium.title).toBe("프리미엄 맞춤 리포트");
    expect(premium.actions.length).toBeGreaterThan(1);
    expect(premium.cautions.length).toBeGreaterThan(1);
  });

  it("tells even the cheapest buyer something about themselves", () => {
    for (const productCode of ["plus_30d", "pro_30d", "premium_pdf"] as const) {
      const report = createPaidReport(`ia${productCode}9999`, { ...baseInput, productCode });
      const core = report.sections.find((section) => section.title === "당신의 핵심 성향");

      expect(core, `${productCode} is missing the core pattern section`).toBeDefined();
      // Life path for 1980-01-01 is a stable fixed vector for this engine.
      expect(core?.body).toContain("생명수");
      expect(core?.body.length).toBeGreaterThan(60);
    }
  });

  it("keeps the core pattern free of guarantees in both languages", () => {
    for (const locale of ["ko", "en"] as const) {
      const report = createPaidReport("iacore123", {
        ...baseInput,
        locale,
        productCode: "plus_30d",
      });
      const core = report.sections.find((section) =>
        section.title === (locale === "ko" ? "당신의 핵심 성향" : "Your core pattern"));

      expect(core?.body).toBeDefined();
      expect(core?.body).not.toMatch(/반드시|보장|틀림없|guaranteed|will definitely/i);
      expect(core?.body).not.toContain("undefined");
      // Korean 은/는 depends on the final consonant of the preceding word, and the
      // risk phrase is data, so no sentence may attach a particle straight to it.
      if (locale === "ko") expect(core?.body).not.toMatch(/[가-힣]기은\s|하기은\s/);
    }
  });

  it("uses an environment allowlist instead of a hard-coded admin password", () => {
    const environment = { ADMIN_EMAILS: "owner@example.com, second@example.com" };
    expect(isAdminEmail("OWNER@example.com", environment)).toBe(true);
    expect(isAdminEmail("visitor@example.com", environment)).toBe(false);
  });
});
