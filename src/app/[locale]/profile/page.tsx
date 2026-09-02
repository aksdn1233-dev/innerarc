import { notFound } from "next/navigation";
import { OnboardingExperience } from "@/components/onboarding-experience";
import { dictionaries } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { resolveConcernHandoff } from "@/core/concern-handoff";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CoreProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ focus?: string }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  return (
    <OnboardingExperience
      locale={locale}
      dictionary={dictionaries[locale]}
      initialFocusId={resolveConcernHandoff(query.focus)}
    />
  );
}
