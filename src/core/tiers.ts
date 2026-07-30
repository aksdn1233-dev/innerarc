import type { PaymentProductCode } from "@/server/payments/config";

// Single source of truth for tier identity and display: 19,000 / 39,000 / 79,000 KRW.
// An earlier, incorrect price for the cheapest tier must never reappear anywhere in
// this codebase — enforced by tests/unit/tiers.test.ts scanning source for it.
//
// `defaultPriceKrw` is a DISPLAY default only. The amount actually charged is decided
// at payment time by src/server/payments/config.ts, which reads it from environment
// variables (INNERARC_QUICK_TAROT_PRICE_KRW etc.) so it can be reconfigured per
// deployment without a code change. In production those env vars are set to exactly
// these same numbers — this module exists so labeling code (report titles, tier
// badges) has one place to read "the tier called what, at roughly what price" instead
// of re-deriving it, not to duplicate payment authority.
export type ContentDepth = "basic" | "detail" | "premium";

export type TierMeta = Readonly<{
  /** The externally-legible name this instruction and any future copy should use. */
  canonicalId: "BASIC_19000" | "DETAIL_39000" | "PREMIUM_79000";
  displayName: Readonly<{ ko: string; en: string }>;
  defaultPriceKrw: number;
  contentDepth: ContentDepth;
  /** How many sharp-insight sentences (see profile/sharp-insights.ts) this tier shows. */
  sharpInsightCount: number;
}>;

export const TIER_META: Readonly<Record<PaymentProductCode, TierMeta>> = {
  plus_30d: {
    canonicalId: "BASIC_19000",
    displayName: { ko: "핵심 리딩", en: "Core reading" },
    defaultPriceKrw: 19_000,
    contentDepth: "basic",
    sharpInsightCount: 2,
  },
  pro_30d: {
    canonicalId: "DETAIL_39000",
    displayName: { ko: "상세 리딩", en: "Detailed reading" },
    defaultPriceKrw: 39_000,
    contentDepth: "detail",
    sharpInsightCount: 5,
  },
  premium_pdf: {
    canonicalId: "PREMIUM_79000",
    displayName: { ko: "프리미엄 심층 리딩", en: "Premium in-depth reading" },
    defaultPriceKrw: 79_000,
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
