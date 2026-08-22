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

export const THREE_DAY_EVENT_PRODUCT_PRICES_KRW = {
  plus_30d: 1_500,
  pro_30d: 1_500,
  premium_pdf: 1_500,
} as const;

export const THREE_DAY_EVENT_START = "2026-08-22T15:00:00.000Z";
export const THREE_DAY_EVENT_END = "2026-08-25T15:00:00.000Z";

export const PURCHASABLE_PRODUCT_CODES = ["plus_30d", "pro_30d", "premium_pdf"] as const;

export type ProductPriceCode = keyof typeof STANDARD_PRODUCT_PRICES_KRW;
export type ProductPriceSet = Readonly<Record<ProductPriceCode, number>>;

export type ProductPricingSnapshot = Readonly<{
  prices: ProductPriceSet;
  regularPrices: ProductPriceSet;
  campaign: null | Readonly<{
    code: "three_day_1500";
    startsAt: string;
    endsAt: string;
  }>;
}>;

/** Resolves the single server-authoritative amount shown, ordered, and charged. */
export function resolveProductPricing(now: Date = new Date()): ProductPricingSnapshot {
  const startsAt = new Date(THREE_DAY_EVENT_START);
  const endsAt = new Date(THREE_DAY_EVENT_END);
  const campaignActive = now >= startsAt && now < endsAt;
  return {
    prices: campaignActive
      ? THREE_DAY_EVENT_PRODUCT_PRICES_KRW
      : STANDARD_PRODUCT_PRICES_KRW,
    regularPrices: STANDARD_PRODUCT_PRICES_KRW,
    campaign: campaignActive
      ? {
          code: "three_day_1500",
          startsAt: THREE_DAY_EVENT_START,
          endsAt: THREE_DAY_EVENT_END,
        }
      : null,
  };
}

/**
 * Every amount a charge for this product may legitimately carry, including bounded and
 * retired campaigns so historical provider callbacks still verify.
 */
export function knownScheduledPrices(productCode: ProductPriceCode): readonly number[] {
  return [...new Set([
    STANDARD_PRODUCT_PRICES_KRW[productCode],
    RETIRED_EVENT_PRODUCT_PRICES_KRW[productCode],
    THREE_DAY_EVENT_PRODUCT_PRICES_KRW[productCode],
  ])];
}
