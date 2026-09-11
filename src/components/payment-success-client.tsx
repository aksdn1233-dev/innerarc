"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { captureConversionEvent } from "@/core/analytics";
import type { Locale } from "@/i18n/config";

type State = "confirming" | "done" | "waiting" | "failed";

export function PaymentSuccessClient({
  locale,
  reportLocale,
  confirmation,
}: {
  locale: Locale;
  reportLocale?: "ja";
  confirmation:
    | Readonly<{ provider: "toss"; paymentKey: string; orderId: string; amount: number; accessToken?: string }>
    | Readonly<{ provider: "portone"; paymentId: string; accessToken?: string }>;
}) {
  const [state, setState] = useState<State>("confirming");
  const orderId = confirmation.provider === "toss"
    ? confirmation.orderId
    : confirmation.paymentId;

  useEffect(() => {
    let active = true;
    async function confirm() {
      try {
        const response = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            confirmation.provider === "toss"
              ? confirmation
              : {
                  provider: "portone",
                  paymentId: confirmation.paymentId,
                  accessToken: confirmation.accessToken,
                },
          ),
        });
        const body = await response.json() as { payment?: { status?: string } };
        if (!active) return;
        if (!response.ok) {
          captureConversionEvent("payment_fail", locale, {
            provider: confirmation.provider,
            stage: "confirmation",
          });
          setState("failed");
        } else if (body.payment?.status === "WAITING_FOR_DEPOSIT") {
          setState("waiting");
        } else {
          captureConversionEvent("payment_success", locale, {
            provider: confirmation.provider,
          });
          setState("done");
        }
      } catch {
        if (active) {
          captureConversionEvent("payment_fail", locale, {
            provider: confirmation.provider,
            stage: "confirmation",
          });
          setState("failed");
        }
      }
    }
    void confirm();
    return () => { active = false; };
  }, [confirmation, locale]);

  const messages = locale === "ko"
    ? {
        confirming: "결제를 서버에서 확인하고 있습니다.",
        done: "결제가 확인되어 이용권이 반영되었습니다.",
        waiting: "가상계좌 입금을 기다리고 있습니다. 입금이 확인되면 이용권이 자동 반영됩니다.",
        failed: "결제 확인을 완료하지 못했습니다. 중복 결제를 시도하지 말고 고객지원에 주문번호를 알려 주세요.",
        home: "리포트 열기",
      }
    : {
        confirming: "Confirming the payment on the server.",
        done: "Payment confirmed and access applied.",
        waiting: "Waiting for the virtual-account deposit. Access will be applied after verification.",
        failed: "Payment verification could not finish. Do not retry payment; contact support with the order ID.",
        home: "Open report",
      };
  const visibleMessages = reportLocale === "ja" ? {
    confirming: "決済を確認しています。",
    done: "決済が確認され、レポートを開けます。",
    waiting: "入金の確認を待っています。確認後にレポートが開きます。",
    failed: "決済確認を完了できませんでした。再決済せず、注文番号を添えてお問い合わせください。",
    home: "結果レポートを開く",
  } : messages;

  return (
    <section className="payment-result-card" aria-live="polite">
      <h1>{visibleMessages[state]}</h1>
      <p>{reportLocale === "ja" ? "注文番号" : locale === "ko" ? "주문번호" : "Order ID"}: <code>{orderId}</code></p>
      <Link
        className="primary-button link-button"
        href={`/${reportLocale ?? locale}/reports/${orderId}${
          confirmation.accessToken
            ? `?access=${encodeURIComponent(confirmation.accessToken)}`
            : ""
        }`}
      >
        {visibleMessages.home}
      </Link>
    </section>
  );
}
