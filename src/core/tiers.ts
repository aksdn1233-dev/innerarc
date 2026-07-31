import type { PaymentProductCode } from "@/server/payments/config";
import { PRODUCT_PRICES_KRW } from "@/core/product-prices";

// Single source of truth for current product availability, identity, and price.
// Legacy canonical IDs retain their original price suffixes so historical orders and
// stored report schemas remain compatible. Payment configuration fails closed when
// active deployment prices disagree with this catalog.
export type ContentDepth = "basic" | "detail" | "premium";

export type TierMeta = Readonly<{
  /** The externally-legible name this instruction and any future copy should use. */
  canonicalId: "BASIC_19000" | "DETAIL_39000" | "PREMIUM_79000";
  displayName: Readonly<{ ko: string; en: string }>;
  defaultPriceKrw: number;
  availability: "available" | "temporarily_retired";
  contentDepth: ContentDepth;
  /** How many sharp-insight sentences (see profile/sharp-insights.ts) this tier shows. */
  sharpInsightCount: number;
}>;

export const TIER_META: Readonly<Record<PaymentProductCode, TierMeta>> = {
  plus_30d: {
    canonicalId: "BASIC_19000",
    displayName: { ko: "핵심 리딩", en: "Core reading" },
    defaultPriceKrw: PRODUCT_PRICES_KRW.plus_30d,
    availability: "temporarily_retired",
    contentDepth: "basic",
    sharpInsightCount: 2,
  },
  pro_30d: {
    canonicalId: "DETAIL_39000",
    displayName: { ko: "상세 리딩", en: "Detailed reading" },
    defaultPriceKrw: PRODUCT_PRICES_KRW.pro_30d,
    availability: "available",
    contentDepth: "detail",
    sharpInsightCount: 5,
  },
  premium_pdf: {
    canonicalId: "PREMIUM_79000",
    displayName: { ko: "프리미엄 심층 리딩", en: "Premium in-depth reading" },
    defaultPriceKrw: PRODUCT_PRICES_KRW.premium_pdf,
    availability: "available",
    contentDepth: "premium",
    sharpInsightCount: 8,
  },
};

export function tierBadgeLabel(productCode: PaymentProductCode, locale: "ko" | "en"): string {
  const meta = TIER_META[productCode];
  const price = meta.defaultPriceKrw.toLocaleString(locale === "ko" ? "ko-KR" : "en-US");
  return locale === "ko"
    ? `${meta.displayName.ko} · ${price}원`
    : `${meta.displayName.en} · ₩${price}`;
}
