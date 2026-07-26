import { notFound } from "next/navigation";
import { RelationshipExperience } from "@/components/relationship-experience";
import { isLocale } from "@/i18n/config";
import { relationshipCopy } from "@/i18n/relationship-copy";

export default async function RelationshipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <RelationshipExperience locale={locale} copy={relationshipCopy[locale]} />;
}
