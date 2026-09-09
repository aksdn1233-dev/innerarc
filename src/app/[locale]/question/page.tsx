import { notFound, permanentRedirect } from "next/navigation";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function RetiredQuestionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  permanentRedirect(`/${locale}/numerology`);
}
