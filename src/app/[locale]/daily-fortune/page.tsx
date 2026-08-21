import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DailyFortuneExperience } from "@/components/daily-fortune-experience";
import { isLocale } from "@/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en"
    ? { title: "Daily Flow | GYEOL", description: "A free, device-local daily numerology reflection that updates with your local date." }
    : { title: "오늘의 흐름 | 결 GYEOL", description: "현지 날짜에 맞춰 하루 한 번 갱신되는 무료 기기 로컬 수비학 성찰입니다." };
}

export default async function DailyFortunePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <DailyFortuneExperience locale={locale} />;
}
