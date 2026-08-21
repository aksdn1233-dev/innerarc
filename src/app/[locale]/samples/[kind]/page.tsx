import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportSampleExperience } from "@/components/report-sample-experience";
import type { PaidReadingInput } from "@/core/paid-reading";
import { isLocale } from "@/i18n/config";
import { createPaidReport } from "@/server/reports/paid-report";

const sampleKinds = ["detail", "premium", "saju"] as const;
type SampleKind = (typeof sampleKinds)[number];

function isSampleKind(value: string): value is SampleKind {
  return sampleKinds.includes(value as SampleKind);
}

function sampleReport(kind: SampleKind, locale: "ko" | "en") {
  const base: PaidReadingInput = {
    version: 1,
    locale,
    productCode: kind === "premium" ? "premium_pdf" : kind === "detail" ? "pro_30d" : "plus_30d",
    readingKind: kind === "saju" ? "saju_chart" : "numerology",
    birthDate: "1994-11-04",
    name: "",
    focusId: "growth",
    concern: "",
    gender: "female",
    midnightConvention: "야자시",
    createdAt: "2026-08-21T00:00:00.000Z",
  };
  return createPaidReport(`sample941104${kind}`, base);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; kind: string }>;
}): Promise<Metadata> {
  const { locale, kind } = await params;
  const ko = locale === "ko";
  const label = kind === "premium" ? (ko ? "프리미엄 심층 리딩" : "Premium reading")
    : kind === "saju" ? (ko ? "사주 원국" : "Four Pillars chart")
      : (ko ? "상세 리딩" : "Detailed reading");
  const title = `${label} · 941104 ${ko ? "결과 예시" : "sample"}`;
  const description = ko
    ? "1994년 11월 4일 기준으로 실제 계산한 결 상품 결과 예시입니다."
    : "A GYEOL product sample calculated for 1994-11-04.";
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, images: [] },
    twitter: { title, description, images: [] },
  };
}

export default async function SampleReportPage({
  params,
}: {
  params: Promise<{ locale: string; kind: string }>;
}) {
  const { locale, kind } = await params;
  if (!isLocale(locale) || !isSampleKind(kind)) notFound();
  return <ReportSampleExperience locale={locale} kind={kind} report={sampleReport(kind, locale)} />;
}
