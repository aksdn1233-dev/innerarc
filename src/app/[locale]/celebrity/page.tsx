import { notFound } from "next/navigation";
import { CelebrityExperience } from "@/components/celebrity-experience";
import { isLocale } from "@/i18n/config";
import { celebrityCopy } from "@/i18n/celebrity-copy";

export const dynamic = "force-dynamic";

export default async function CelebrityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <CelebrityExperience locale={locale} copy={celebrityCopy[locale]} />;
}
