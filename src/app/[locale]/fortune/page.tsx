import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SajuServiceHub } from "@/components/saju-service-hub";
import { isLocale } from "@/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en"
    ? { title: "Saju services | GYEOL", description: "Explore a free Four Pillars chart and InnerArc reflection services in one place." }
    : { title: "사주 서비스 | 결 GYEOL", description: "무료 사주 원국과 InnerArc의 성찰 서비스를 한곳에서 살펴보세요." };
}

export default async function FortunePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <SajuServiceHub locale={locale} />;
}
