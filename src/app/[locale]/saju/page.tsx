import { notFound } from "next/navigation";
import { SajuExperience } from "@/components/saju-experience";
import { isLocale } from "@/i18n/config";

export default async function SajuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <SajuExperience locale={locale} />;
}
