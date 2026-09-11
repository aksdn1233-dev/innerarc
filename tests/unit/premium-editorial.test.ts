import { describe, expect, it } from "vitest";
import { buildDetailEditorialModel, buildPremiumEditorialModel } from "@/core/detail-editorial";
import { recommendAccessoryProductsByBirthDate } from "@/core/commerce/accessory-recommendations";
import { createPaidReport } from "@/server/reports/paid-report";

function premiumReport(birthDate = "1994-11-04") {
  return createPaidReport(`premium${birthDate.replaceAll("-", "")}`, {
    version: 1,
    locale: "ko",
    productCode: "premium_pdf",
    readingKind: "numerology",
    birthDate,
    birthTime: "09:30",
    name: "",
    focusId: "growth",
    concern: "",
    gender: "male",
    createdAt: "2026-08-21T00:00:00.000Z",
  });
}

describe("PREMIUM_79000 editorial model", () => {
  it("reuses the complete deterministic publication model and adds premium-only chapters", () => {
    const report = premiumReport();
    const base = buildDetailEditorialModel(report);
    const premium = buildPremiumEditorialModel(report);

    expect(base?.numbers.map((item) => item.value)).toEqual(["11/2", "4", "6", "23/5"]);
    expect(premium).not.toBeNull();
    expect(Object.values(premium ?? {})).toHaveLength(8);
    expect(new Set(Object.values(premium ?? {}).map((item) => item.title)).size).toBe(8);
    expect(JSON.stringify(premium)).not.toMatch(/undefined|NaN|미래를 정확|반드시 성공/u);
  });

  it("selects three stable accessory concepts without claiming a sale or outcome", () => {
    const report = premiumReport();
    const year = report.calculationBasis?.serviceYear ?? 2026;
    const recommendations = recommendAccessoryProductsByBirthDate("1994-11-04", year);

    expect(recommendations.map(({ fact, product }) => [fact, product.id])).toEqual([
      ["lifePath", "life-modular-bracelet"],
      ["attitude", "attitude-color-card-charm"],
      ["personalYear", "year-cycle-tray"],
    ]);
    expect(JSON.stringify(recommendations)).not.toMatch(/행운|치유|보장|guarantee|heal|luck/iu);
  });
});
