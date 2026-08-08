import { notFound } from "next/navigation";
import { PayAppReturnClient } from "@/components/payapp-return-client";
import { isLocale } from "@/i18n/config";

export default async function PayAppReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (
    !isLocale(locale) ||
    !query.orderId ||
    !/^[A-Za-z0-9_-]{6,64}$/.test(query.orderId)
  ) {
    notFound();
  }
  return <PayAppReturnClient locale={locale} orderId={query.orderId} />;
}
