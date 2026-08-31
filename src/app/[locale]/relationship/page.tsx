import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RelationshipExperience } from "@/components/relationship-experience";
import { isLocale } from "@/i18n/config";
import { relationshipCopy } from "@/i18n/relationship-copy";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en"
    ? {
        title: "Relationship & Compatibility Reflection | 태령당",
        description: "Reflect on partner, coworker, family, friend, or business-partner dynamics without fate scores or guaranteed outcomes.",
        keywords: ["relationship reading", "compatibility reflection", "coworker compatibility"],
        alternates: { canonical: "/en/relationship", languages: { ko: "/ko/relationship", en: "/en/relationship" } },
      }
    : {
        title: "궁합·관계 리딩 | 연인·직장·가족·친구·동업 | 태령당",
        description: "연인·직장 동료·가족·친구·동업 관계의 패턴을 살펴보세요. 운명 점수나 결과 단정 없이 관계 질문을 정리합니다.",
        keywords: ["궁합", "연인 궁합", "직장 동료 궁합", "가족 궁합", "친구 궁합", "동업 궁합"],
        alternates: { canonical: "/ko/relationship", languages: { ko: "/ko/relationship", en: "/en/relationship" } },
      };
}

export const dynamic = "force-dynamic";

export default async function RelationshipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <RelationshipExperience locale={locale} copy={relationshipCopy[locale]} />;
}
