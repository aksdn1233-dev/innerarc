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
 * Dropping them would make those historical orders fail to verify. They never decide the
 * active price; only the bounded schedule in `resolveProductPricing` can do that.
 */
export const RETIRED_EVENT_PRODUCT_PRICES_KRW = {
  plus_30d: 19_000,
  pro_30d: 9_600,
  premium_pdf: 39_000,
} as const;

/** Historical 1,500 KRW charges remain verification evidence for already-created orders. */
export const HISTORICAL_1500_PRODUCT_PRICES_KRW = {
  plus_30d: 1_500,
  pro_30d: 1_500,
  premium_pdf: 1_500,
} as const;

/**
 * Owner-authorized prices for the one-week extension. Premium remains at its 79,000 KRW
 * list price and is deliberately outside the 1,500 KRW discount.
 */
export const ONE_WEEK_EXTENSION_PRODUCT_PRICES_KRW = {
  plus_30d: 1_500,
  pro_30d: 1_500,
  premium_pdf: 79_000,
} as const;

export const ONE_WEEK_EXTENSION_START = "2026-08-30T07:50:00.000Z";
export const ONE_WEEK_EXTENSION_END = "2026-09-06T07:50:00.000Z";
export const ONE_WEEK_REVIEW_DRAW_AT = "2026-09-08T09:00:00.000Z";

export const PURCHASABLE_PRODUCT_CODES = ["plus_30d", "pro_30d", "premium_pdf"] as const;

export type ProductPriceCode = keyof typeof STANDARD_PRODUCT_PRICES_KRW;
export type ProductPriceSet = Readonly<Record<ProductPriceCode, number>>;

export type ProductPricingSnapshot = Readonly<{
  prices: ProductPriceSet;
  regularPrices: ProductPriceSet;
  campaign: null | Readonly<{
    code: "one_week_extension_1500";
    startsAt: string;
    endsAt: string;
  }>;
}>;

/** Resolves the single server-authoritative amount shown, ordered, and charged. */
export function resolveProductPricing(now: Date = new Date()): ProductPricingSnapshot {
  const startsAt = new Date(ONE_WEEK_EXTENSION_START);
  const endsAt = new Date(ONE_WEEK_EXTENSION_END);
  const campaignActive = now >= startsAt && now < endsAt;
  return {
    prices: campaignActive
      ? ONE_WEEK_EXTENSION_PRODUCT_PRICES_KRW
      : STANDARD_PRODUCT_PRICES_KRW,
    regularPrices: STANDARD_PRODUCT_PRICES_KRW,
    campaign: campaignActive
      ? {
          code: "one_week_extension_1500",
          startsAt: ONE_WEEK_EXTENSION_START,
          endsAt: ONE_WEEK_EXTENSION_END,
        }
      : null,
  };
}

/** True only when this product, not merely some product, is discounted by the live campaign. */
export function isCampaignDiscountedProduct(
  pricing: ProductPricingSnapshot,
  productCode: ProductPriceCode,
): boolean {
  return Boolean(
    pricing.campaign && pricing.prices[productCode] < pricing.regularPrices[productCode],
  );
}

/**
 * Every amount a charge for this product may legitimately carry, including bounded and
 * retired campaigns so historical provider callbacks still verify.
 */
export function knownScheduledPrices(productCode: ProductPriceCode): readonly number[] {
  return [...new Set([
    STANDARD_PRODUCT_PRICES_KRW[productCode],
    RETIRED_EVENT_PRODUCT_PRICES_KRW[productCode],
    HISTORICAL_1500_PRODUCT_PRICES_KRW[productCode],
    ONE_WEEK_EXTENSION_PRODUCT_PRICES_KRW[productCode],
  ])];
}
