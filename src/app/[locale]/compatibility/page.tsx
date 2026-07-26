import { notFound } from "next/navigation";
import { CompatibilityExperience } from "@/components/compatibility-experience";
import { isLocale } from "@/i18n/config";
import { compatibilityCopy } from "@/i18n/compatibility-copy";

export default async function CompatibilityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <CompatibilityExperience locale={locale} copy={compatibilityCopy[locale]} />;
}
