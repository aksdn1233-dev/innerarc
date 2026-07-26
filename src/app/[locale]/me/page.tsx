import { notFound } from "next/navigation";
import { MeExperience } from "@/components/me-experience";
import { isLocale } from "@/i18n/config";
import { meCopy } from "@/i18n/me-copy";

export default async function MePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <MeExperience locale={locale} copy={meCopy[locale]} />;
}
