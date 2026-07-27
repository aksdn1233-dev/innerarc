import { notFound, redirect } from "next/navigation";
import { CompatibilityExperience } from "@/components/compatibility-experience";
import { isLocale } from "@/i18n/config";
import { compatibilityCopy } from "@/i18n/compatibility-copy";
import { hasPaidFeatureAccess } from "@/server/paid-access";

export const dynamic = "force-dynamic";

export default async function CompatibilityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (!await hasPaidFeatureAccess()) redirect(`/${locale}#onboarding`);
  return <CompatibilityExperience locale={locale} copy={compatibilityCopy[locale]} />;
}
