import { notFound } from "next/navigation";
import { HomeExperience } from "@/components/home-experience";
import { resolveProductPricing } from "@/core/product-prices";
import { dictionaries } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_ADMIN_PAGE_CONTENT } from "@/server/admin-content";
import { readStoredPageContent } from "@/server/admin-storage";

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const admin = resolveSupabaseAdminClient().client;
  let pageContent = DEFAULT_ADMIN_PAGE_CONTENT;
  if (admin) {
    pageContent = await readStoredPageContent(admin);
  }
  return (
    <HomeExperience
      locale={locale}
      dictionary={dictionaries[locale]}
      pageContent={pageContent}
      pricing={resolveProductPricing(new Date())}
    />
  );
}

export const dynamic = "force-dynamic";
