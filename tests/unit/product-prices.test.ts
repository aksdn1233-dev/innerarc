import { describe, expect, it } from "vitest";
import {
  STANDARD_PRODUCT_PRICES_KRW,
  THREE_DAY_EVENT_PRODUCT_PRICES_KRW,
  knownScheduledPrices,
  resolveProductPricing,
} from "@/core/product-prices";

describe("product pricing", () => {
  it("uses the standard list outside the scheduled campaign", () => {
    expect(resolveProductPricing(new Date("2026-08-30T00:00:00.000Z"))).toEqual({
      prices: STANDARD_PRODUCT_PRICES_KRW,
      regularPrices: STANDARD_PRODUCT_PRICES_KRW,
      campaign: null,
    });
  });

  it("charges 1,500 won for every paid reading during the three-day campaign", () => {
    const pricing = resolveProductPricing(new Date("2026-08-23T00:00:00.000Z"));
    expect(pricing.prices).toEqual(THREE_DAY_EVENT_PRODUCT_PRICES_KRW);
    expect(pricing.regularPrices).toEqual(STANDARD_PRODUCT_PRICES_KRW);
    expect(pricing.campaign?.code).toBe("three_day_1500");
  });

  // An order authorised during the event carries the amount charged then. Verification
  // checks a charge against this list, so dropping the retired amounts would make those
  // historical orders fail to verify.
  it("still recognises amounts charged during the retired event", () => {
    expect(knownScheduledPrices("pro_30d")).toEqual([39_000, 9_600, 1_500]);
    expect(knownScheduledPrices("premium_pdf")).toEqual([79_000, 39_000, 1_500]);
  });
});
