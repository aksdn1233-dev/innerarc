import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DailyFortuneExperience } from "@/components/daily-fortune-experience";
import { isLocale } from "@/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en"
    ? {
        title: "Free Daily Numerology Flow | 태령당",
        description: "A free, device-local daily numerology reflection that updates with your local date and does not claim to predict outcomes.",
        keywords: ["daily numerology", "daily flow", "free daily reflection"],
        alternates: { canonical: "/en/daily-fortune", languages: { ko: "/ko/daily-fortune", en: "/en/daily-fortune" } },
      }
    : {
        title: "오늘의 운세·하루 흐름 | 태령당",
        description: "현지 날짜에 맞춰 하루 한 번 갱신되는 무료 생년월일 패턴 성찰입니다. 결과를 예언하지 않고 오늘의 흐름과 질문을 제안합니다.",
        keywords: ["오늘의 운세", "무료 운세", "하루 운세", "생년월일 패턴", "오늘의 흐름"],
        alternates: { canonical: "/ko/daily-fortune", languages: { ko: "/ko/daily-fortune", en: "/en/daily-fortune" } },
      };
}

export default async function DailyFortunePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <DailyFortuneExperience locale={locale} />;
}
