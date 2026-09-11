"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

export function PaymentStatusWaiting({ locale }: { locale: "ko" | "en" | "ja" }) {
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
      <p className="eyebrow">{locale === "ko" ? "입금 확인 중" : locale === "ja" ? "決済確認中" : "Checking payment"}</p>
      <h1>
        {locale === "ko"
          ? "입금 확인을 기다리고 있습니다."
          : locale === "ja" ? "決済の確認を待っています。" : "Waiting for payment confirmation."}
      </h1>
      <p>
        {locale === "ko"
          ? "관리자가 입금자명과 금액을 확인하면 이 페이지에서 리포트가 자동으로 열립니다."
          : locale === "ja" ? "お名前と金額の確認後、このページでレポートが自動的に開きます。" : "The report will open here after the depositor name and amount are verified."}
      </p>
      <button disabled={isPending} onClick={refreshStatus} type="button">
        {isPending
          ? locale === "ko" ? "확인 중…" : locale === "ja" ? "確認中…" : "Checking…"
          : locale === "ko" ? "입금했어요 · 다시 확인" : locale === "ja" ? "決済しました・もう一度確認" : "I paid · Check again"}
      </button>
      <small>
        {locale === "ko"
          ? "자동으로 10초마다 확인합니다. 확인 전에는 리포트 내용이 공개되지 않습니다."
          : locale === "ja" ? "10秒ごとに自動確認します。確認前はレポートの内容を表示しません。" : "Status refreshes every 10 seconds. Report contents stay locked until verification."}
      </small>
    </section>
  );
}
