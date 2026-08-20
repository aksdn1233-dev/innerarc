export const STANDARD_PRODUCT_PRICES_KRW = {
  plus_30d: 5_500,
  pro_30d: 39_000,
  premium_pdf: 79_000,
} as const;

/**
 * Amounts charged during the 2026 summer event, which has ended and will not run again.
 *
 * These are kept for one reason: a payment placed while the event was live was authorised
 * at these amounts, and verification checks a charge against the amounts this code knows.
 * Dropping them would make those historical orders fail to verify. Nothing reads this to
 * decide a price — `resolveProductPricing` no longer has a discounted branch.
 */
export const RETIRED_EVENT_PRODUCT_PRICES_KRW = {
  plus_30d: 19_000,
  pro_30d: 9_600,
  premium_pdf: 39_000,
} as const;

export const PURCHASABLE_PRODUCT_CODES = ["plus_30d", "pro_30d", "premium_pdf"] as const;

export type ProductPriceCode = keyof typeof STANDARD_PRODUCT_PRICES_KRW;
export type ProductPriceSet = Readonly<Record<ProductPriceCode, number>>;

export type ProductPricingSnapshot = Readonly<{
  prices: ProductPriceSet;
  regularPrices: ProductPriceSet;
}>;

/**
 * Resolves the amount shown and charged. There is one price list and no clock: what a
 * visitor sees is what every visitor sees, today and tomorrow. It takes no date because
 * there is no longer anything for a date to change.
 */
export function resolveProductPricing(): ProductPricingSnapshot {
  return {
    prices: STANDARD_PRODUCT_PRICES_KRW,
    regularPrices: STANDARD_PRODUCT_PRICES_KRW,
  };
}

/**
 * Every amount a charge for this product may legitimately carry: the current price, plus
 * the retired event price so an order taken during the event still verifies.
 */
export function knownScheduledPrices(productCode: ProductPriceCode): readonly number[] {
  return [...new Set([
    STANDARD_PRODUCT_PRICES_KRW[productCode],
    RETIRED_EVENT_PRODUCT_PRICES_KRW[productCode],
  ])];
}
