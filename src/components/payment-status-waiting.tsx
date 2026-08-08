"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

export function PaymentStatusWaiting({ locale }: { locale: "ko" | "en" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function refreshStatus() {
    startTransition(() => router.refresh());
  }

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, 10_000);

    return () => window.clearInterval(interval);
  }, [router]);

  return (
    <section className="payment-waiting-card" aria-live="polite">
      <p className="eyebrow">{locale === "ko" ? "입금 확인 중" : "Checking payment"}</p>
      <h1>
        {locale === "ko"
          ? "입금 확인을 기다리고 있습니다."
          : "Waiting for payment confirmation."}
      </h1>
      <p>
        {locale === "ko"
          ? "관리자가 입금자명과 금액을 확인하면 이 페이지에서 리포트가 자동으로 열립니다."
          : "The report will open here after the depositor name and amount are verified."}
      </p>
      <button disabled={isPending} onClick={refreshStatus} type="button">
        {isPending
          ? locale === "ko" ? "확인 중…" : "Checking…"
          : locale === "ko" ? "입금했어요 · 다시 확인" : "I paid · Check again"}
      </button>
      <small>
        {locale === "ko"
          ? "자동으로 10초마다 확인합니다. 확인 전에는 리포트 내용이 공개되지 않습니다."
          : "Status refreshes every 10 seconds. Report contents stay locked until verification."}
      </small>
    </section>
  );
}
