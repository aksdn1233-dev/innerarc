import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DreamIntelligence } from "@/components/dreams/dream-intelligence";
import { isLocale } from "@/i18n/config";
import { dreamEnabled } from "@/server/dreams/config";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ko" ? "꿈 패턴 기록 | 태령당" : "Dream Patterns | Taeryeongdang",
    description: locale === "ko" ? "꿈속 장면과 감정, 최근 현실과 반복 기록을 나누어 살펴보세요." : "Compare dream scenes and feelings with recent life and your own recurring records.",
    robots: { index: false, follow: false, noarchive: true, noimageindex: true },
  };
}

export default async function DreamsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || !dreamEnabled()) notFound();
  return <DreamIntelligence locale={locale} />;
}
