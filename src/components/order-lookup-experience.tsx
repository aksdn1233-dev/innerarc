"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";

const copy = {
  ko: {
    eyebrow: "구매 내역 확인",
    title: "리포트를 다시 열어드릴게요",
    intro: "결제하실 때 입력한 휴대폰 번호와 주문번호를 넣어주시면 리포트를 바로 열어드립니다. 회원가입이나 로그인은 필요 없어요.",
    orderId: "주문번호",
    orderIdHelp: "결제 화면과 결제 완료 안내에 있던 ia로 시작하는 번호예요.",
    phone: "휴대폰 번호",
    phoneHelp: "결제하실 때 입력하신 번호를 그대로 넣어주세요.",
    submit: "리포트 찾기",
    searching: "찾는 중…",
    notFound: "일치하는 주문을 찾지 못했어요. 주문번호와 휴대폰 번호를 다시 확인해 주세요.",
    failed: "잠시 문제가 생겼어요. 조금 뒤에 다시 시도해 주세요.",
    invalid: "주문번호와 휴대폰 번호를 모두 입력해 주세요.",
    found: "주문을 찾았어요.",
    open: "리포트 열기",
    pending: "아직 결제가 확인되지 않았어요. 무통장으로 입금하셨다면 확인 뒤에 리포트가 열립니다.",
    lost: "주문번호를 잃어버리셨다면 아래로 문의해 주세요.",
    home: "홈으로",
  },
  en: {
    eyebrow: "Find your purchase",
    title: "Reopen your report",
    intro: "Enter the phone number you used at checkout together with your order number. No account or sign-in is needed.",
    orderId: "Order number",
    orderIdHelp: "The number starting with ia shown on the payment and confirmation screens.",
    phone: "Phone number",
    phoneHelp: "Use the same number you entered at checkout.",
    submit: "Find my report",
    searching: "Searching…",
    notFound: "No matching order. Please check the order number and phone number.",
    failed: "Something went wrong. Please try again shortly.",
    invalid: "Enter both the order number and the phone number.",
    found: "Order found.",
    open: "Open report",
    pending: "Payment is not confirmed yet. A bank transfer opens the report once it is verified.",
    lost: "If you lost your order number, please contact support below.",
    home: "Home",
  },
} as const;

type Found = Readonly<{ reportUrl: string; reportStatus: string; paymentStatus: string }>;

export function OrderLookupExperience({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [status, setStatus] = useState<"idle" | "searching" | "notFound" | "failed" | "invalid">("idle");
  const [found, setFound] = useState<Found | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const orderId = String(form.get("orderId") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    if (!orderId || !phone) {
      setFound(null);
      setStatus("invalid");
      return;
    }
    setFound(null);
    setStatus("searching");
    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, phone, locale }),
      });
      if (response.status === 404) {
        setStatus("notFound");
        return;
      }
      if (!response.ok) throw new Error("lookup failed");
      const body = await response.json() as Found;
      setFound(body);
      setStatus("idle");
    } catch {
      setStatus("failed");
    }
  }

  const ready = found?.reportStatus === "ready";

  return (
    <main className="shell" id="main-content">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1>{t.title}</h1>
      <p>{t.intro}</p>

      <form className="order-lookup-form" onSubmit={(event) => void submit(event)}>
        <div className="field">
          <label htmlFor="lookup-order">{t.orderId}</label>
          <input autoComplete="off" id="lookup-order" name="orderId" required type="text" />
          <small>{t.orderIdHelp}</small>
        </div>
        <div className="field">
          <label htmlFor="lookup-phone">{t.phone}</label>
          <input autoComplete="tel" id="lookup-phone" name="phone" required type="tel" />
          <small>{t.phoneHelp}</small>
        </div>
        <button className="primary-button" disabled={status === "searching"} type="submit">
          {status === "searching" ? t.searching : t.submit}
        </button>
      </form>

      <div aria-live="polite">
        {status === "notFound" && <p className="error" role="alert">{t.notFound}</p>}
        {status === "failed" && <p className="error" role="alert">{t.failed}</p>}
        {status === "invalid" && <p className="error" role="alert">{t.invalid}</p>}
        {found && (
          <section className="report-link-card">
            <p className="eyebrow">{t.found}</p>
            <p className="report-link-order">{t.orderId} <code>{found.reportUrl.split("/").pop()?.split("?")[0]}</code></p>
            {ready
              ? <a className="primary-button" href={found.reportUrl}>{t.open}</a>
              : <p>{t.pending}</p>}
          </section>
        )}
      </div>

      <p className="plans-notice">{t.lost}</p>
      <p className="payment-result-links">
        <Link className="link-button" href={`/${locale}`}>{t.home}</Link>
      </p>
    </main>
  );
}
