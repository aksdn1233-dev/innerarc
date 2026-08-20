import { notFound } from "next/navigation";
import { OnboardingExperience } from "@/components/onboarding-experience";
import { dictionaries } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * The public, named entry for GYEOL numerology.
 *
 * `/profile` remains available for historical links and existing purchases. This route
 * gives the already-verified deterministic experience an explicit product home without
 * forking its calculator, interpretation rules, privacy behavior, or result UI.
 */
export default async function NumerologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <OnboardingExperience
      locale={locale}
      dictionary={dictionaries[locale]}
      routeName="numerology"
    />
  );
}
