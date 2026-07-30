import { notFound } from "next/navigation";
import { SupportExperience } from "@/components/support-experience";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function SupportPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const orderId = query.orderId && /^[A-Za-z0-9_-]{6,64}$/.test(query.orderId)
    ? query.orderId
    : undefined;
  return <SupportExperience initialOrderId={orderId} locale={locale} />;
}
