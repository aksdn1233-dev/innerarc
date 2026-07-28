import { notFound, redirect } from "next/navigation";
import { CompatibilityExperience } from "@/components/compatibility-experience";
import { isLocale } from "@/i18n/config";
import { compatibilityCopy } from "@/i18n/compatibility-copy";
import { hasPaidFeatureAccess } from "@/server/paid-access";

export const dynamic = "force-dynamic";

export default async function CompatibilityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  // Two-person compatibility needs the partner's birth date and produces a
  // relationship-length reading, so it belongs to the 39,000 KRW tier and above.
  if (!await hasPaidFeatureAccess("pro")) redirect(`/${locale}#onboarding`);
  return <CompatibilityExperience locale={locale} copy={compatibilityCopy[locale]} />;
}
