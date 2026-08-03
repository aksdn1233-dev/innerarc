import { notFound } from "next/navigation";
import { HomeExperience } from "@/components/home-experience";
import { resolveProductPricing } from "@/core/product-prices";
import { dictionaries } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PublicReview } from "@/core/reviews";
import { DEFAULT_ADMIN_PAGE_CONTENT } from "@/server/admin-content";
import { readStoredPageContent } from "@/server/admin-storage";
import { listPublicReviews } from "@/server/reviews";

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const admin = resolveSupabaseAdminClient().client;
  let pageContent = DEFAULT_ADMIN_PAGE_CONTENT;
  // Empty is both the starting state and the failure state, and the section is built to
  // render evidence rather than empty cards, so an unreachable review table costs the
  // home page nothing.
  let reviews: readonly PublicReview[] = [];
  if (admin) {
    const [storedContent, publicReviews] = await Promise.all([
      readStoredPageContent(admin),
      listPublicReviews(admin, locale, 6),
    ]);
    pageContent = storedContent;
    reviews = publicReviews.data;
  }
  return (
    <HomeExperience
      locale={locale}
      dictionary={dictionaries[locale]}
      pageContent={pageContent}
      pricing={resolveProductPricing(new Date())}
      reviews={reviews}
    />
  );
}

export const dynamic = "force-dynamic";
