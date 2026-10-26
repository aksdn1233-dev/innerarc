import { describe, expect, it } from "vitest";
import { knownScheduledPrices, resolveProductPricing } from "@/core/product-prices";
import { inspectPaymentReadiness } from "@/server/payments/config";

const environment = {
  PAYMENTS_PROVIDER: "payapp", PAYAPP_USER_ID: "test-seller",
  PAYAPP_LINK_KEY: "test-link-key", PAYAPP_LINK_VALUE: "test-link-value",
  // A deployment must stay open while existing dashboard assertions are retained.
  INNERARC_COMPREHENSIVE_PRICE_KRW: "39000", INNERARC_PREMIUM_PDF_PRICE_KRW: "79000",
};
const boundary = new Date("2026-10-26T15:00:00.000Z"); // 2026-10-27 00:00 KST

describe("owner-authorized report price revision", () => {
  it("changes only Detailed and Premium at the Korea-date boundary", () => {
    expect(resolveProductPricing(new Date(boundary.getTime() - 1)).prices)
      .toEqual({ plus_30d: 5500, pro_30d: 39000, premium_pdf: 79000 });
    expect(resolveProductPricing(boundary)).toEqual({
      prices: { plus_30d: 5500, pro_30d: 9800, premium_pdf: 36000 },
      regularPrices: { plus_30d: 5500, pro_30d: 9800, premium_pdf: 36000 }, campaign: null,
    });
  });

  it("preserves historical campaign comparison amounts and all authorized charge evidence", () => {
    const summer = resolveProductPricing(new Date("2026-08-31T00:00:00.000Z"));
    expect(summer.prices).toEqual({ plus_30d: 1500, pro_30d: 1500, premium_pdf: 79000 });
    expect(summer.regularPrices).toEqual({ plus_30d: 5500, pro_30d: 39000, premium_pdf: 79000 });
    expect(knownScheduledPrices("pro_30d")).toEqual(expect.arrayContaining([9800, 39000, 9600, 1500]));
    expect(knownScheduledPrices("premium_pdf")).toEqual(expect.arrayContaining([36000, 79000, 39000, 1500]));
  });

  it.each([
    ["old dashboard assertions", environment],
    ["new dashboard assertions", { ...environment, INNERARC_COMPREHENSIVE_PRICE_KRW: "9800", INNERARC_PREMIUM_PDF_PRICE_KRW: "36000" }],
  ])("resolves the current server-owned charge with %s", (_, env) => {
    const readiness = inspectPaymentReadiness(env, "production", boundary);
    expect(readiness.enabled).toBe(true);
    if (!readiness.enabled) throw new Error("Expected configured checkout");
    expect(readiness.config.products.pro_30d.amount).toBe(9800);
    expect(readiness.config.products.premium_pdf.amount).toBe(36000);
    expect(readiness.config.products.plus_30d.amount).toBe(5500);
    expect(inspectPaymentReadiness({ ...env, INNERARC_COMPREHENSIVE_PRICE_KRW: "9801" }, "production", boundary))
      .toEqual({ enabled: false, reason: "INVALID" });
  });
});
