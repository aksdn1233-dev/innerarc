import { notFound } from "next/navigation";
import { HomeExperience } from "@/components/home-experience";
import { dictionaries } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <HomeExperience locale={locale} dictionary={dictionaries[locale]} />;
}
