"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";

type State = "confirming" | "done" | "waiting" | "failed";

export function PaymentSuccessClient({
  locale,
  paymentKey,
  orderId,
  amount,
}: {
  locale: Locale;
  paymentKey: string;
  orderId: string;
  amount: number;
}) {
  const [state, setState] = useState<State>("confirming");

  useEffect(() => {
    let active = true;
    async function confirm() {
      try {
        const response = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });
        const body = await response.json() as { payment?: { status?: string } };
        if (!active) return;
        if (!response.ok) {
          setState("failed");
        } else if (body.payment?.status === "WAITING_FOR_DEPOSIT") {
          setState("waiting");
        } else {
          setState("done");
        }
      } catch {
        if (active) setState("failed");
      }
    }
    void confirm();
    return () => { active = false; };
  }, [amount, orderId, paymentKey]);

  const messages = locale === "ko"
    ? {
        confirming: "결제를 서버에서 확인하고 있습니다.",
        done: "결제가 확인되어 이용권이 반영되었습니다.",
        waiting: "가상계좌 입금을 기다리고 있습니다. 입금이 확인되면 이용권이 자동 반영됩니다.",
        failed: "결제 확인을 완료하지 못했습니다. 중복 결제를 시도하지 말고 고객지원에 주문번호를 알려 주세요.",
        home: "내 페이지로",
      }
    : {
        confirming: "Confirming the payment on the server.",
        done: "Payment confirmed and access applied.",
        waiting: "Waiting for the virtual-account deposit. Access will be applied after verification.",
        failed: "Payment verification could not finish. Do not retry payment; contact support with the order ID.",
        home: "Go to Me",
      };

  return (
    <section className="payment-result-card" aria-live="polite">
      <h1>{messages[state]}</h1>
      <p>{locale === "ko" ? "주문번호" : "Order ID"}: <code>{orderId}</code></p>
      <Link className="primary-button link-button" href={`/${locale}/me`}>{messages.home}</Link>
    </section>
  );
}
