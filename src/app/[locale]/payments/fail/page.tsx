import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { PaymentFailBeacon } from "@/components/payment-fail-beacon";

const visibleCodes = new Set([
  "PAY_PROCESS_CANCELED",
  "PAY_PROCESS_ABORTED",
  "REJECT_CARD_COMPANY",
  "INVALID_CARD_EXPIRATION",
  "INVALID_STOPPED_CARD",
  "EXCEED_MAX_DAILY_PAYMENT_COUNT",
]);

export default async function PaymentFailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const rawCode = typeof query.code === "string" ? query.code : "";
  const code = visibleCodes.has(rawCode) ? rawCode : "PAYMENT_FAILED";

  return (
    <main className="shell payment-result-shell" id="main-content">
      <PaymentFailBeacon locale={locale} />
      <section className="payment-result-card">
        <h1>{locale === "ko" ? "결제가 완료되지 않았습니다." : "Payment was not completed."}</h1>
        <p>{locale === "ko" ? "오류 코드" : "Error code"}: <code>{code}</code></p>
        <p>
          {locale === "ko"
            ? "승인 여부가 불확실하면 바로 다시 결제하지 말고 결제내역을 먼저 확인해 주세요."
            : "If approval is uncertain, check your payment history before trying again."}
        </p>
        <Link className="primary-button link-button" href={`/${locale}/plans`}>
          {locale === "ko" ? "이용권으로 돌아가기" : "Back to plans"}
        </Link>
      </section>
    </main>
  );
}
