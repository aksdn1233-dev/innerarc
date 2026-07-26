import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal-document";
import { isLocale } from "@/i18n/config";
import { termsCopy } from "@/i18n/legal-copy";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LegalDocument locale={locale} copy={termsCopy[locale]} kind="terms" />;
}
