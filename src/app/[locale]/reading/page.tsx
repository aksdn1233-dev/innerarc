import { notFound } from "next/navigation";
import { HomeExperience } from "@/components/home-experience";
import { resolveProductPricing } from "@/core/product-prices";
import { dictionaries } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { resolveConcernHandoff } from "@/core/concern-handoff";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PublicReview } from "@/core/reviews";
import { DEFAULT_ADMIN_PAGE_CONTENT } from "@/server/admin-content";
import { readStoredPageContent } from "@/server/admin-storage";
import { countPublicReviews, listPublicReviews } from "@/server/reviews";
import { buildReportOutline } from "@/core/report-outline";
import { getSampleReport } from "@/server/reports/sample-report";

export default async function LocaleReading({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ focus?: string }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const requestedFocus = resolveConcernHandoff(query.focus);
  const admin = resolveSupabaseAdminClient().client;
  let pageContent = DEFAULT_ADMIN_PAGE_CONTENT;
  // Empty is both the starting state and the failure state, and the section is built to
  // render evidence rather than empty cards, so an unreachable review table costs the
  // home page nothing.
  let reviews: readonly PublicReview[] = [];
  let reviewCount: number | null = null;
  if (admin) {
    const [storedContent, publicReviews, publishedCount] = await Promise.all([
      readStoredPageContent(admin),
      listPublicReviews(admin, locale, 6),
      countPublicReviews(admin, locale),
    ]);
    pageContent = storedContent;
    reviews = publicReviews.data;
    reviewCount = publishedCount;
  }
  return (
    <HomeExperience
      showEverything
      locale={locale}
      dictionary={dictionaries[locale]}
      pageContent={pageContent}
      pricing={resolveProductPricing()}
      reviews={reviews}
      reviewCount={reviewCount}
      reportOutline={buildReportOutline(getSampleReport("detail", locale), { openCount: 2, maxEntries: 6, excerptLength: 110 })}
      initialFocusId={requestedFocus === "leadership" ? undefined : requestedFocus}
    />
  );
}

export const dynamic = "force-dynamic";
