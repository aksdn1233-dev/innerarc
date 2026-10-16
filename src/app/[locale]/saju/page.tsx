import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SajuExperience } from "@/components/saju-experience";
import { isLocale } from "@/i18n/config";
import { resolveProductPricing } from "@/core/product-prices";
import type { PublicReview } from "@/core/reviews";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { countPublicReviews, listPublicReviews } from "@/server/reviews";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en"
    ? {
        title: "Free Saju Reading with Harang | GYEOL",
        description: "Create a free Saju chart and review its deterministic Four Pillars evidence as a symbolic reflection tool, not a guaranteed prediction.",
        keywords: ["Saju", "Four Pillars", "free Saju chart", "birth chart"],
        alternates: { canonical: "/en/saju", languages: { ko: "/ko/saju", en: "/en/saju" } },
      }
    : {
        title: "하랑 법사의 무료 사주 풀이 | 결 GYEOL",
        description: "하랑 법사가 생년월일과 출생 시각으로 사주 원국·어린 시절·운명수를 계산 근거와 함께 짚어드리는 무료 상징적 자기 성찰 풀이입니다.",
        keywords: ["사주", "무료 사주", "사주 원국", "사주팔자", "만세력"],
        alternates: { canonical: "/ko/saju", languages: { ko: "/ko/saju", en: "/en/saju" } },
      };
}

export default async function SajuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  // Only published reviews and their real count are shown. An unreachable review table
  // leaves both empty and the fee chapter simply omits the section.
  let reviews: readonly PublicReview[] = [];
  let reviewCount: number | null = null;
  const admin = resolveSupabaseAdminClient().client;
  if (admin) {
    const [published, count] = await Promise.all([
      listPublicReviews(admin, locale, 3),
      countPublicReviews(admin, locale),
    ]);
    reviews = published.data;
    reviewCount = count;
  }
  return (
    <SajuExperience
      locale={locale}
      prices={resolveProductPricing().prices}
      reviewCount={reviewCount}
      reviews={reviews}
    />
  );
}

export const dynamic = "force-dynamic";
