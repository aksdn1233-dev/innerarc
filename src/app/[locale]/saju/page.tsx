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
        title: "Free Saju Chart & Four Pillars Reflection | 태령당",
        description: "Create a free Saju chart and review its deterministic Four Pillars evidence as a symbolic reflection tool, not a guaranteed prediction.",
        keywords: ["Saju", "Four Pillars", "free Saju chart", "birth chart"],
        alternates: { canonical: "/en/saju", languages: { ko: "/ko/saju", en: "/en/saju" } },
      }
    : {
        title: "무료 사주 원국 보기 | 태령당",
        description: "생년월일과 출생 정보를 바탕으로 사주 원국과 계산 근거를 확인하는 무료 상징적 자기 성찰 도구입니다.",
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
