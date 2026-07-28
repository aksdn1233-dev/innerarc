import { notFound } from "next/navigation";
import { OrderLookupExperience } from "@/components/order-lookup-experience";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function OrderLookupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <OrderLookupExperience locale={locale} />;
}
