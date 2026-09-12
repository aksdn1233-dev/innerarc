import type { Metadata } from "next";
import "@/app/taeryeong-landing.css";
import "@/app/daily-healing-home.css";
import { notFound } from "next/navigation";
import { TaeryeongLanding } from "@/components/taeryeong-landing";
import { buildReportOutline } from "@/core/report-outline";
import { isLocale } from "@/i18n/config";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { countPublicReviews, listPublicReviews } from "@/server/reviews";
import { getSampleReport } from "@/server/reports/sample-report";
import { dreamEnabled } from "@/server/dreams/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    alternates: {
      canonical: `/${locale}`,
      languages: { ko: "/ko", en: "/en" },
    },
  };
}

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const admin = resolveSupabaseAdminClient().client;
  let reviewCount: number | null = null;
  let reviews = [] as Awaited<ReturnType<typeof listPublicReviews>>["data"];
  if (admin) {
    const [count, publicReviews] = await Promise.all([
      countPublicReviews(admin, locale),
      listPublicReviews(admin, locale, 3),
    ]);
    reviewCount = count;
    reviews = publicReviews.data;
  }
  const sampleReport = getSampleReport("detail", locale);
  const calculationBasis = sampleReport.calculationBasis
    ? {
        lifePath: sampleReport.calculationBasis.lifePath,
        birthday: sampleReport.calculationBasis.birthday,
        attitude: sampleReport.calculationBasis.attitude,
        personalYear: sampleReport.calculationBasis.personalYear,
      }
    : null;
  const reportPreview = {
    outline: buildReportOutline(sampleReport, { openCount: 1, maxEntries: 5, excerptLength: 130 }),
    summary: sampleReport.summary,
    nextAction: sampleReport.actions[0] ?? "",
    calculationBasis,
  };
  return <TaeryeongLanding dreamAvailable={dreamEnabled()} locale={locale} reportPreview={reportPreview} reviewCount={reviewCount} reviews={reviews} />;
}

export const dynamic = "force-dynamic";
