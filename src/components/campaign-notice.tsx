import type { ProductPricingSnapshot } from "@/core/product-prices";
import type { Locale } from "@/i18n/config";

export function CampaignNotice({
  locale,
  pricing,
}: {
  locale: Locale;
  pricing: ProductPricingSnapshot;
}) {
  if (!pricing.campaignActive) return null;

  return (
    <aside className="campaign-notice" role="status">
      <strong>{locale === "ko" ? "여름 이벤트" : "Summer event"}</strong>
      <span>
        {locale === "ko"
          ? "8월 3일 밤 11:59까지 · 상세 리딩 9,600원 · 프리미엄 39,000원"
          : "Through Aug 3, 11:59 PM Korea time · Detailed ₩9,600 · Premium ₩39,000"}
      </span>
    </aside>
  );
}
