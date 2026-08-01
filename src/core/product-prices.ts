export const STANDARD_PRODUCT_PRICES_KRW = {
  plus_30d: 19_000,
  pro_30d: 39_000,
  premium_pdf: 79_000,
} as const;

export const SUMMER_EVENT_PRODUCT_PRICES_KRW = {
  plus_30d: 19_000,
  pro_30d: 9_600,
  premium_pdf: 39_000,
} as const;

export const PURCHASABLE_PRODUCT_CODES = ["pro_30d", "premium_pdf"] as const;

export const SUMMER_EVENT_2026 = {
  id: "summer_2026",
  startsAt: "2026-07-31T15:00:00.000Z",
  endsAt: "2026-08-03T15:00:00.000Z",
  timezone: "Asia/Seoul",
} as const;

export type ProductPriceCode = keyof typeof STANDARD_PRODUCT_PRICES_KRW;
export type ProductPriceSet = Readonly<Record<ProductPriceCode, number>>;

export type ProductPricingSnapshot = Readonly<{
  campaignId: "summer_2026" | "standard";
  campaignActive: boolean;
  campaignEndsAt: string | null;
  timezone: "Asia/Seoul";
  prices: ProductPriceSet;
  regularPrices: ProductPriceSet;
}>;

/**
 * Resolves the amount shown and charged from one clock-based source of truth.
 * The event ends at 2026-08-04 00:00:00 in Korea, so August 3 is fully included.
 */
export function resolveProductPricing(now: Date = new Date()): ProductPricingSnapshot {
  const timestamp = now.getTime();
  if (!Number.isFinite(timestamp)) throw new Error("INVALID_PRICING_DATE");
  const active = timestamp >= Date.parse(SUMMER_EVENT_2026.startsAt) &&
    timestamp < Date.parse(SUMMER_EVENT_2026.endsAt);

  return {
    campaignId: active ? "summer_2026" : "standard",
    campaignActive: active,
    campaignEndsAt: active ? SUMMER_EVENT_2026.endsAt : null,
    timezone: SUMMER_EVENT_2026.timezone,
    prices: active
      ? SUMMER_EVENT_PRODUCT_PRICES_KRW
      : STANDARD_PRODUCT_PRICES_KRW,
    regularPrices: STANDARD_PRODUCT_PRICES_KRW,
  };
}

export function knownScheduledPrices(productCode: ProductPriceCode): readonly number[] {
  return [...new Set([
    STANDARD_PRODUCT_PRICES_KRW[productCode],
    SUMMER_EVENT_PRODUCT_PRICES_KRW[productCode],
  ])];
}
