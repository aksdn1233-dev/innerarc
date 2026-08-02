import { notFound } from "next/navigation";
import { HomeExperience } from "@/components/home-experience";
import { resolveProductPricing } from "@/core/product-prices";
import { dictionaries } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_ADMIN_PAGE_CONTENT, resolveAdminPageContent } from "@/server/admin-content";

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
    const settings = await admin
      .from("admin_settings")
      .select("page_content")
      .eq("id", 1)
      .maybeSingle();
    pageContent = resolveAdminPageContent(settings.data?.page_content);
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
