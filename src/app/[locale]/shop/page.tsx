import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopExperience } from "@/components/shop-experience";
import { isLocale } from "@/i18n/config";
import { shopCopy } from "@/i18n/shop-copy";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en"
    ? {
        title: "Saju & Numerology Accessory Concepts | 태령당",
        description: "Browse clearly labelled generated accessory concepts organized separately by Saju phase and Numerology result, with checkout closed.",
        keywords: ["Saju accessories", "numerology accessories", "made-to-order accessory concepts"],
        alternates: { canonical: "/en/shop", languages: { ko: "/ko/shop", en: "/en/shop" } },
      }
    : {
        title: "사주·생년월일 패턴 악세서리 콘셉트 상점 | 태령당",
        description: "사주 오행과 생년월일 패턴 결과를 분리해 살펴보는 자동 생성 악세서리 콘셉트 상점입니다. 현재 결제는 열려 있지 않습니다.",
        keywords: ["사주 악세서리", "생년월일 패턴 악세서리", "오행 악세서리", "주문 제작 악세서리"],
        alternates: { canonical: "/ko/shop", languages: { ko: "/ko/shop", en: "/en/shop" } },
      };
}

export default async function ShopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <ShopExperience locale={locale} copy={shopCopy[locale]} />;
}
