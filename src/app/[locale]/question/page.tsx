import { notFound } from "next/navigation";
import { QuestionTarotExperience } from "@/components/question-tarot-experience";
import { isLocale } from "@/i18n/config";
import { questionCopy } from "@/i18n/question-copy";

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <QuestionTarotExperience locale={locale} copy={questionCopy[locale]} />;
}
