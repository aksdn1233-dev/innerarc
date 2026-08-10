import { notFound } from "next/navigation";
import { OnboardingExperience } from "@/components/onboarding-experience";
import { dictionaries } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CoreProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <OnboardingExperience locale={locale} dictionary={dictionaries[locale]} />;
}
