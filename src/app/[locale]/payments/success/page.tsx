import { notFound } from "next/navigation";
import { PaymentSuccessClient } from "@/components/payment-success-client";
import { isLocale } from "@/i18n/config";

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();

  const portOnePaymentId = typeof query.paymentId === "string" ? query.paymentId : "";
  const guestAccessToken = typeof query.access === "string" ? query.access : undefined;
  const reportLocale = query.displayLocale === "ja" ? "ja" : undefined;
  if (/^[A-Za-z0-9]{6,64}$/.test(portOnePaymentId)) {
    return (
      <main className="shell payment-result-shell" id="main-content">
        <PaymentSuccessClient
          locale={locale}
          reportLocale={reportLocale}
          confirmation={{ provider: "portone", paymentId: portOnePaymentId, accessToken: guestAccessToken }}
        />
      </main>
    );
  }

  const paymentKey = typeof query.paymentKey === "string" ? query.paymentKey : "";
  const orderId = typeof query.orderId === "string" ? query.orderId : "";
  const amount = typeof query.amount === "string" ? Number(query.amount) : Number.NaN;
  if (
    paymentKey.length < 10 ||
    !/^[A-Za-z0-9_-]{6,64}$/.test(orderId) ||
    !Number.isInteger(amount) ||
    amount < 100 ||
    amount > 10_000_000
  ) {
    notFound();
  }

  return (
    <main className="shell payment-result-shell" id="main-content">
      <PaymentSuccessClient
        locale={locale}
        reportLocale={reportLocale}
        confirmation={{ provider: "toss", paymentKey, orderId, amount, accessToken: guestAccessToken }}
      />
    </main>
  );
}
