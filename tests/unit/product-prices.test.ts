import { describe, expect, it } from "vitest";
import {
  STANDARD_PRODUCT_PRICES_KRW,
  SUMMER_EVENT_PRODUCT_PRICES_KRW,
  knownScheduledPrices,
  resolveProductPricing,
} from "@/core/product-prices";

describe("scheduled product pricing", () => {
  it("uses standard pricing before the event begins", () => {
    expect(resolveProductPricing(new Date("2026-07-31T14:59:59.999Z"))).toMatchObject({
      campaignActive: false,
      prices: STANDARD_PRODUCT_PRICES_KRW,
    });
  });

  it("includes all of August 3 in Korea and ends exactly at midnight", () => {
    expect(resolveProductPricing(new Date("2026-08-03T14:59:59.999Z"))).toMatchObject({
      campaignActive: true,
      prices: SUMMER_EVENT_PRODUCT_PRICES_KRW,
    });
    expect(resolveProductPricing(new Date("2026-08-03T15:00:00.000Z"))).toMatchObject({
      campaignActive: false,
      prices: STANDARD_PRODUCT_PRICES_KRW,
    });
  });

  it("accepts only known scheduled assertions", () => {
    expect(knownScheduledPrices("pro_30d")).toEqual([39_000, 9_600]);
    expect(knownScheduledPrices("premium_pdf")).toEqual([79_000, 39_000]);
  });

  it("rejects an invalid clock", () => {
    expect(() => resolveProductPricing(new Date("invalid"))).toThrow("INVALID_PRICING_DATE");
  });
});
