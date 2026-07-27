"use client";

import Link from "next/link";
import { useEffect } from "react";

export function PayAppReturnClient({
  locale,
  orderId,
}: {
  locale: "ko" | "en";
  orderId: string;
}) {
  useEffect(() => {
    const key = `gyeol.payappReport.${orderId}`;
    const saved = window.sessionStorage.getItem(key);
    if (!saved) {
      window.location.replace(`/${locale}/me?paymentReturn=missing`);
      return;
    }
    try {
      const destination = new URL(saved);
      const expectedPath = `/${locale}/reports/${orderId}`;
      if (
        destination.origin !== window.location.origin ||
        destination.pathname !== expectedPath
      ) {
        throw new Error("Invalid report handoff");
      }
      window.sessionStorage.removeItem(key);
      window.location.replace(destination.toString());
    } catch {
      window.sessionStorage.removeItem(key);
      window.location.replace(`/${locale}/me?paymentReturn=invalid`);
    }
  }, [locale, orderId]);

  return (
    <main className="shell payment-result-shell" id="main-content">
      <section className="payment-result-card" aria-live="polite">
        <p className="eyebrow">{locale === "ko" ? "결제 확인" : "Payment check"}</p>
        <h1>
          {locale === "ko"
            ? "안전하게 주문 화면으로 이동하고 있습니다."
            : "Returning to your secure order page."}
        </h1>
        <p>
          {locale === "ko"
            ? "자동으로 이동하지 않으면 마이페이지에서 구매 내역을 확인해 주세요."
            : "If the page does not move automatically, check the purchase in My Page."}
        </p>
        <Link className="link-button" href={`/${locale}/me`}>
          {locale === "ko" ? "마이페이지" : "My Page"}
        </Link>
      </section>
    </main>
  );
}
