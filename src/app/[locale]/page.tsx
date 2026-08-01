import { notFound } from "next/navigation";
import { HomeExperience } from "@/components/home-experience";
import { resolveProductPricing } from "@/core/product-prices";
import { dictionaries } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <HomeExperience
      locale={locale}
      dictionary={dictionaries[locale]}
      pricing={resolveProductPricing(new Date())}
    />
  );
}

export const dynamic = "force-dynamic";
