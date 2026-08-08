import { describe, expect, it } from "vitest";
import {
  RETIRED_EVENT_PRODUCT_PRICES_KRW,
  STANDARD_PRODUCT_PRICES_KRW,
  knownScheduledPrices,
  resolveProductPricing,
} from "@/core/product-prices";

describe("product pricing", () => {
  it("shows one price list, with no date able to change it", () => {
    expect(resolveProductPricing()).toEqual({
      prices: STANDARD_PRODUCT_PRICES_KRW,
      regularPrices: STANDARD_PRODUCT_PRICES_KRW,
    });
  });

  it("does not charge the retired event price", () => {
    const { prices } = resolveProductPricing();
    expect(prices.pro_30d).toBe(39_000);
    expect(prices.pro_30d).not.toBe(RETIRED_EVENT_PRODUCT_PRICES_KRW.pro_30d);
  });

  // An order authorised during the event carries the amount charged then. Verification
  // checks a charge against this list, so dropping the retired amounts would make those
  // historical orders fail to verify.
  it("still recognises amounts charged during the retired event", () => {
    expect(knownScheduledPrices("pro_30d")).toEqual([39_000, 9_600]);
    expect(knownScheduledPrices("premium_pdf")).toEqual([79_000, 39_000]);
  });
});
