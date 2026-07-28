"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";

const copy = {
  ko: {
    eyebrow: "고객 문의",
    title: "무엇을 도와드릴까요?",
    intro: "결제, 환불, 리포트에 대해 궁금한 점을 남겨주시면 확인 후 답변드립니다. 회원가입 없이 남기실 수 있어요.",
    category: "문의 종류",
    categories: {
      payment: "결제가 안 돼요",
      report: "리포트가 안 보여요",
      refund: "환불하고 싶어요",
      other: "그 밖의 문의",
    },
    orderId: "주문번호 (있으시면)",
    orderIdHelp: "ia로 시작하는 번호예요. 모르시면 비워두셔도 됩니다.",
    contact: "답변받을 연락처",
    contactHelp: "이메일 주소나 휴대폰 번호를 남겨주세요.",
    message: "문의 내용",
    messageHelp: "언제, 어떤 화면에서, 무슨 일이 있었는지 적어주시면 더 빨리 확인할 수 있어요.",
    submit: "문의 남기기",
    sending: "보내는 중…",
    doneTitle: "문의가 접수되었습니다.",
    doneBody: "남겨주신 연락처로 답변드리겠습니다. 확인까지 조금 시간이 걸릴 수 있어요.",
    failed: "문의를 보내지 못했습니다. 잠시 후 다시 시도해 주세요.",
    invalid: "연락처와 문의 내용을 5자 이상 적어주세요.",
    findOrder: "구매 내역 확인",
    home: "홈으로",
    notice: "환불은 결제하신 수단으로 처리되며, 반영까지 며칠 걸릴 수 있습니다.",
  },
  en: {
    eyebrow: "Support",
    title: "How can we help?",
    intro: "Ask about a payment, a refund, or a report and we will reply. No account needed.",
    category: "Topic",
    categories: {
      payment: "Payment did not work",
      report: "I cannot see my report",
      refund: "I would like a refund",
      other: "Something else",
    },
    orderId: "Order number (if you have it)",
    orderIdHelp: "It starts with ia. Leave blank if you do not have it.",
    contact: "Where should we reply?",
    contactHelp: "An email address or phone number.",
    message: "Your question",
    messageHelp: "Telling us when it happened and what you saw helps us answer faster.",
    submit: "Send",
    sending: "Sending…",
    doneTitle: "We received your message.",
    doneBody: "We will reply to the contact you left. It may take a little time.",
    failed: "The message could not be sent. Please try again shortly.",
    invalid: "Please enter a contact and at least a few words.",
    findOrder: "Find a purchase",
    home: "Home",
    notice: "Refunds return to the original payment method and can take a few days.",
  },
} as const;

type Category = "payment" | "report" | "refund" | "other";
const CATEGORIES: readonly Category[] = ["payment", "report", "refund", "other"];

export function SupportExperience({
  locale,
  initialOrderId,
}: {
  locale: Locale;
  initialOrderId?: string;
}) {
  const t = copy[locale];
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "failed" | "invalid">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const contact = String(form.get("contact") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const orderId = String(form.get("orderId") ?? "").trim();
    if (contact.length < 5 || message.length < 5) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: String(form.get("category") ?? "other"),
          contact,
          message,
          ...(orderId ? { orderId } : {}),
        }),
      });
      if (!response.ok) throw new Error("send failed");
      setStatus("done");
    } catch {
      setStatus("failed");
    }
  }

  if (status === "done") {
    return (
      <main className="shell" id="main-content">
        <section className="report-link-card">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.doneTitle}</h1>
          <p>{t.doneBody}</p>
        </section>
        <p className="payment-result-links">
          <Link className="link-button" href={`/${locale}/orders`}>{t.findOrder}</Link>
          <Link className="link-button" href={`/${locale}`}>{t.home}</Link>
        </p>
      </main>
    );
  }

  return (
    <main className="shell" id="main-content">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1>{t.title}</h1>
      <p>{t.intro}</p>

      <form className="order-lookup-form" onSubmit={(event) => void submit(event)}>
        <div className="field">
          <label htmlFor="support-category">{t.category}</label>
          <select defaultValue="payment" id="support-category" name="category">
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>{t.categories[value]}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="support-order">{t.orderId}</label>
          <input
            defaultValue={initialOrderId ?? ""}
            id="support-order"
            name="orderId"
            type="text"
          />
          <small>{t.orderIdHelp}</small>
        </div>
        <div className="field">
          <label htmlFor="support-contact">{t.contact}</label>
          <input id="support-contact" name="contact" required type="text" />
          <small>{t.contactHelp}</small>
        </div>
        <div className="field">
          <label htmlFor="support-message">{t.message}</label>
          <textarea id="support-message" maxLength={2_000} name="message" required rows={6} />
          <small>{t.messageHelp}</small>
        </div>
        <button className="primary-button" disabled={status === "sending"} type="submit">
          {status === "sending" ? t.sending : t.submit}
        </button>
      </form>

      <div aria-live="polite">
        {status === "failed" && <p className="error" role="alert">{t.failed}</p>}
        {status === "invalid" && <p className="error" role="alert">{t.invalid}</p>}
      </div>

      <p className="plans-notice">{t.notice}</p>
      <p className="payment-result-links">
        <Link className="link-button" href={`/${locale}/orders`}>{t.findOrder}</Link>
        <Link className="link-button" href={`/${locale}`}>{t.home}</Link>
      </p>
    </main>
  );
}
