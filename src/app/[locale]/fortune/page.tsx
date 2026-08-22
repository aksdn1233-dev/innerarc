import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SajuServiceHub } from "@/components/saju-service-hub";
import { isLocale } from "@/i18n/config";
import { resolveProductPricing } from "@/core/product-prices";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en"
    ? {
        title: "Saju & Fortune Reflection Services | GYEOL",
        description: "Compare a free Four Pillars chart with separate Saju reflection services. Symbolic guidance, not guaranteed fortune prediction.",
        keywords: ["Saju", "fortune reflection", "Four Pillars", "birth chart"],
        alternates: { canonical: "/en/fortune", languages: { ko: "/ko/fortune", en: "/en/fortune" } },
      }
    : {
        title: "사주·운세 리딩 안내 | 결 GYEOL",
        description: "무료 사주 원국과 사주 리딩 상품을 비교해 보세요. 운명을 단정하지 않고 계산 근거와 성찰 질문을 함께 제공합니다.",
        keywords: ["사주", "운세", "사주 리딩", "사주 풀이", "무료 사주"],
        alternates: { canonical: "/ko/fortune", languages: { ko: "/ko/fortune", en: "/en/fortune" } },
      };
}

export default async function FortunePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <SajuServiceHub locale={locale} pricing={resolveProductPricing()} />;
}
