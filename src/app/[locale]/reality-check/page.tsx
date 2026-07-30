import { notFound } from "next/navigation";
import { RealityCheckExperience } from "@/components/reality-check-experience";
import { isLocale } from "@/i18n/config";
import { realityCheckCopy } from "@/i18n/reality-check-copy";

export const dynamic = "force-dynamic";

export default async function RealityCheckPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <RealityCheckExperience locale={locale} copy={realityCheckCopy[locale]} />;
}
