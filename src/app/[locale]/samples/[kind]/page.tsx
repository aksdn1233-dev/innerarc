import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportSampleExperience } from "@/components/report-sample-experience";
import { isLocale } from "@/i18n/config";
import { getSampleReport, isSampleReportKind } from "@/server/reports/sample-report";

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
    : "A 태령당 product sample calculated for 1994-11-04.";
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
  if (!isLocale(locale) || !isSampleReportKind(kind)) notFound();
  return <ReportSampleExperience locale={locale} kind={kind} report={getSampleReport(kind, locale)} />;
}
