import { describe, expect, it } from "vitest";
import {
  ONE_WEEK_EXTENSION_PRODUCT_PRICES_KRW,
  ONE_WEEK_EXTENSION_END,
  ONE_WEEK_EXTENSION_START,
  STANDARD_PRODUCT_PRICES_KRW,
  isCampaignDiscountedProduct,
  knownScheduledPrices,
  resolveProductPricing,
} from "@/core/product-prices";

describe("product pricing", () => {
  it("uses the standard list before the one-week extension", () => {
    expect(resolveProductPricing(new Date("2026-08-30T07:49:59.999Z"))).toEqual({
      prices: STANDARD_PRODUCT_PRICES_KRW,
      regularPrices: STANDARD_PRODUCT_PRICES_KRW,
      campaign: null,
    });
  });

  it("discounts only Four Pillars and Detailed readings for exactly one extended week", () => {
    const pricing = resolveProductPricing(new Date(ONE_WEEK_EXTENSION_START));
    expect(pricing.prices).toEqual(ONE_WEEK_EXTENSION_PRODUCT_PRICES_KRW);
    expect(pricing.prices).toEqual({ plus_30d: 1_500, pro_30d: 1_500, premium_pdf: 79_000 });
    expect(pricing.regularPrices).toEqual(STANDARD_PRODUCT_PRICES_KRW);
    expect(isCampaignDiscountedProduct(pricing, "plus_30d")).toBe(true);
    expect(isCampaignDiscountedProduct(pricing, "pro_30d")).toBe(true);
    expect(isCampaignDiscountedProduct(pricing, "premium_pdf")).toBe(false);
    expect(pricing.campaign).toEqual({
      code: "one_week_extension_1500",
      startsAt: ONE_WEEK_EXTENSION_START,
      endsAt: ONE_WEEK_EXTENSION_END,
    });
    expect(
      new Date(ONE_WEEK_EXTENSION_END).getTime() - new Date(ONE_WEEK_EXTENSION_START).getTime(),
    ).toBe(7 * 24 * 60 * 60 * 1_000);
  });

  it("returns to standard prices at the exact ending instant", () => {
    expect(resolveProductPricing(new Date(ONE_WEEK_EXTENSION_END)).campaign).toBeNull();
    expect(resolveProductPricing(new Date(ONE_WEEK_EXTENSION_END)).prices)
      .toEqual(STANDARD_PRODUCT_PRICES_KRW);
  });

  it("keeps standard prices during the former three-day window after withdrawal", () => {
    const pricing = resolveProductPricing(new Date("2026-08-23T00:00:00.000Z"));
    expect(pricing.prices).toEqual(STANDARD_PRODUCT_PRICES_KRW);
    expect(pricing.regularPrices).toEqual(STANDARD_PRODUCT_PRICES_KRW);
    expect(pricing.campaign).toBeNull();
  });

  // An order authorised during the event carries the amount charged then. Verification
  // checks a charge against this list, so dropping the retired amounts would make those
  // historical orders fail to verify.
  it("still recognises amounts charged during the retired event", () => {
    expect(knownScheduledPrices("pro_30d")).toEqual([39_000, 9_600, 1_500]);
    expect(knownScheduledPrices("premium_pdf")).toEqual([79_000, 39_000, 1_500]);
  });
});
