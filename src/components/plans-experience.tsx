"use client";

import {
  loadTossPayments,
  type TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { PaymentProductCode } from "@/server/payments/config";

type PublicProduct = Readonly<{
  code: PaymentProductCode;
  name: string;
  amount: number | null;
  tier: "Plus" | "Pro";
  features: readonly string[];
}>;

type CheckoutSession = Readonly<{
  orderId: string;
  orderName: string;
  amount: number;
  currency: "KRW";
  clientKey: string;
  customerKey: string;
  customerEmail?: string;
  successUrl: string;
  failUrl: string;
  methodVariantKey: string;
  agreementVariantKey: string;
}>;

const copy = {
  ko: {
    brand: "개인 패턴 인텔리전스",
    eyebrow: "30일 이용권",
    title: "결제 방식은 넓게, 승인 기준은 엄격하게",
    intro: "자동 갱신 없는 30일 이용권입니다. 토스페이먼츠 결제창에서 계약된 카카오페이·토스페이·가상계좌·휴대폰 결제를 선택할 수 있습니다.",
    unavailable: "아직 결제를 받을 준비가 끝나지 않았습니다. 가맹점 계약, 가격, 운영 도메인, 법정 고지를 모두 확정한 뒤 열립니다.",
    signin: "결제 전 이메일 로그인이 필요합니다.",
    signinAction: "로그인하러 가기",
    choose: "결제수단 불러오기",
    loading: "안전한 결제창을 불러오는 중…",
    pay: "결제하기",
    failed: "결제창을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    notice: "결제수단 노출 여부와 한도는 토스페이먼츠 가맹점 계약 및 결제수단 심사 결과에 따라 달라집니다.",
    terms: "결제 전에 이용조건·환불정책·개인정보 처리 안내를 확인해 주세요.",
    duration: "구매일로부터 30일",
  },
  en: {
    brand: "Personal pattern intelligence",
    eyebrow: "30-day access",
    title: "Broad payment choice, strict server-side approval",
    intro: "A one-time 30-day pass with no automatic renewal. Contracted KakaoPay, Toss Pay, virtual-account, and mobile-phone methods can appear in the Toss Payments window.",
    unavailable: "Payments remain closed until merchant review, prices, the production domain, and legal notices are finalized.",
    signin: "Email sign-in is required before payment.",
    signinAction: "Sign in",
    choose: "Load payment methods",
    loading: "Loading the secure payment window…",
    pay: "Pay now",
    failed: "The payment window could not be prepared. Please try again.",
    notice: "Available methods and limits depend on the merchant contract and payment-method review.",
    terms: "Review the terms, refund policy, and privacy notice before payment.",
    duration: "30 days from purchase",
  },
} as const;

function formatWon(amount: number | null, locale: Locale) {
  if (amount === null) return locale === "ko" ? "가격 확정 전" : "Price pending";
  return new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en-US", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PlansExperience({
  locale,
  products,
  signedIn,
  paymentsEnabled,
}: {
  locale: Locale;
  products: readonly PublicProduct[];
  signedIn: boolean;
  paymentsEnabled: boolean;
}) {
  const t = copy[locale];
  const otherLocale = locale === "ko" ? "en" : "ko";
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loadingCode, setLoadingCode] = useState<PaymentProductCode | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);

  useEffect(() => {
    if (!session) return;
    const checkout = session;
    let active = true;

    async function renderWidgets() {
      try {
        // Toss Payments V2 Payment Widget:
        // https://docs.tosspayments.com/guides/v2/payment-widget/integration
        const tossPayments = await loadTossPayments(checkout.clientKey);
        const widgets = tossPayments.widgets({ customerKey: checkout.customerKey });
        await widgets.setAmount({ currency: checkout.currency, value: checkout.amount });
        await Promise.all([
          widgets.renderPaymentMethods({
            selector: "#payment-method",
            variantKey: checkout.methodVariantKey,
          }),
          widgets.renderAgreement({
            selector: "#payment-agreement",
            variantKey: checkout.agreementVariantKey,
          }),
        ]);
        if (active) {
          widgetsRef.current = widgets;
          setReady(true);
        }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoadingCode(null);
      }
    }

    void renderWidgets();
    return () => {
      active = false;
      widgetsRef.current = null;
    };
  }, [session]);

  async function createOrder(productCode: PaymentProductCode) {
    setError(false);
    setReady(false);
    setSession(null);
    setLoadingCode(productCode);
    try {
      const response = await fetch("/api/payments/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productCode, locale }),
      });
      const body: unknown = await response.json();
      if (!response.ok) throw new Error("order failed");
      setSession(body as CheckoutSession);
    } catch {
      setError(true);
      setLoadingCode(null);
    }
  }

  async function requestPayment() {
    if (!session || !widgetsRef.current) return;
    setError(false);
    try {
      await widgetsRef.current.requestPayment({
        orderId: session.orderId,
        orderName: session.orderName,
        successUrl: session.successUrl,
        failUrl: session.failUrl,
        customerEmail: session.customerEmail,
      });
    } catch {
      setError(true);
    }
  }

  return (
    <main className="shell plans-shell" id="main-content" tabIndex={-1}>
      <header className="topbar">
        <Link className="brand" href={`/${locale}`}>
          <strong>InnerArc</strong>
          <small>{t.brand}</small>
        </Link>
        <Link className="locale-switch" href={`/${otherLocale}/plans`}>
          {otherLocale === "ko" ? "한국어" : "English"}
        </Link>
      </header>

      <section className="plans-intro">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </section>

      {!paymentsEnabled && <p className="plans-gate" role="status">{t.unavailable}</p>}
      {paymentsEnabled && !signedIn && (
        <p className="plans-gate">
          {t.signin} <Link href={`/${locale}/me`}>{t.signinAction}</Link>
        </p>
      )}

      <section className="plan-grid" aria-label={locale === "ko" ? "이용권" : "Access plans"}>
        {products.map((product) => (
          <article className="plan-card" key={product.code}>
            <p className="eyebrow">{product.tier}</p>
            <h2>{product.name}</h2>
            <strong className="plan-price">{formatWon(product.amount, locale)}</strong>
            <small>{t.duration}</small>
            <ul>{product.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <button
              className="primary-button"
              type="button"
              disabled={!paymentsEnabled || !signedIn || loadingCode !== null}
              onClick={() => void createOrder(product.code)}
            >
              {loadingCode === product.code ? t.loading : t.choose}
            </button>
          </article>
        ))}
      </section>

      {session && (
        <section className="payment-widget-shell" aria-live="polite">
          <div id="payment-method" />
          <div id="payment-agreement" />
          <button
            className="primary-button"
            type="button"
            disabled={!ready}
            onClick={() => void requestPayment()}
          >
            {t.pay}
          </button>
        </section>
      )}

      {error && <p className="error" role="alert">{t.failed}</p>}
      <p className="plans-notice">{t.notice}</p>
      <p className="plans-notice">
        {t.terms}{" "}
        <Link href={`/${locale}/terms`}>{locale === "ko" ? "이용조건" : "Terms"}</Link>
        {" · "}
        <Link href={`/${locale}/privacy`}>{locale === "ko" ? "개인정보" : "Privacy"}</Link>
      </p>
    </main>
  );
}
