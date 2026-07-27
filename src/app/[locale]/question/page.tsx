import { notFound, redirect } from "next/navigation";
import { QuestionTarotExperience } from "@/components/question-tarot-experience";
import { isLocale } from "@/i18n/config";
import { questionCopy } from "@/i18n/question-copy";
import { hasPaidFeatureAccess } from "@/server/paid-access";

export const dynamic = "force-dynamic";

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (!await hasPaidFeatureAccess()) redirect(`/${locale}#onboarding`);
  return <QuestionTarotExperience locale={locale} copy={questionCopy[locale]} />;
}
