"use client";

import {
  loadTossPayments,
  type TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PaidReadingInputSchema, type PaidReadingInput } from "@/core/paid-reading";
import type { Locale } from "@/i18n/config";
import type { PaymentProductCode } from "@/server/payments/config";

type PublicProduct = Readonly<{
  code: PaymentProductCode;
  name: string;
  amount: number | null;
  tier: string;
  features: readonly string[];
}>;

type TossCheckoutSession = Readonly<{
  provider: "toss";
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

type PortOneCheckoutSession = Readonly<{
  provider: "portone";
  paymentId: string;
  orderName: string;
  amount: number;
  currency: "KRW";
  storeId: string;
  channelKey: string;
  customerId: string;
  customerEmail?: string;
  successUrl: string;
  failUrl: string;
  noticeUrl: string;
}>;

type ManualTransferCheckoutSession = Readonly<{
  provider: "manual_transfer";
  orderId: string;
  orderName: string;
  amount: number;
  currency: "KRW";
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  depositorName: string;
  depositDeadline: string;
  reportUrl: string;
}>;

type CheckoutSession =
  | TossCheckoutSession
  | PortOneCheckoutSession
  | ManualTransferCheckoutSession;
type PortOneMethod = "kakaopay" | "tosspay" | "card" | "virtual_account";

const copy = {
  ko: {
    brand: "프리미엄 타로·신점 리딩",
    eyebrow: "대표 리딩 상품",
    title: "원하는 깊이에 맞춰 먼저 선택하세요",
    intro: "모든 상품은 1회 결제이며 자동 갱신되지 않습니다. 결제 확인 뒤 PC와 휴대폰에서 바로 열고 내려받을 수 있으며, 로그인하면 마이페이지에도 저장됩니다.",
    unavailable: "아직 결제를 받을 준비가 끝나지 않았습니다. 가맹점 계약, 가격, 운영 도메인, 법정 고지를 모두 확정한 뒤 열립니다.",
    signin: "로그인하면 구매 리포트를 마이페이지에 계속 보관하고 이벤트 안내를 받을 수 있습니다.",
    signinAction: "선택 로그인",
    choose: "결제수단 불러오기",
    loading: "안전한 결제창을 불러오는 중…",
    pay: "결제하기",
    methods: {
      kakaopay: "카카오페이",
      tosspay: "토스페이",
      card: "신용·체크카드",
      virtual_account: "가상계좌",
    },
    failed: "결제창을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    missingDraft: "먼저 상품과 리딩 정보를 입력해 주세요.",
    notice: "결제수단 노출 여부와 한도는 포트원·KPN 가맹점 계약 및 각 결제수단 심사 결과에 따라 달라집니다.",
    terms: "결제 전에 이용조건·환불정책·개인정보 처리 안내를 확인해 주세요.",
    duration: "1회 결제 · 자동 갱신 없음",
    depositorName: "입금자명",
    depositorPlaceholder: "실제로 송금할 분의 이름",
    depositorHelp: "입금 확인에 사용됩니다. 계좌에서 표시되는 이름과 같게 입력해 주세요.",
    manualChoose: "입금 계좌 안내 받기",
    manualTitle: "아래 계좌로 정확한 금액을 입금해 주세요",
    manualAmount: "입금 금액",
    manualDeadline: "입금 기한",
    manualStatus: "입금 확인 · 리포트 보기",
    manualNotice: "입금 확인 후 리포트가 자동으로 열립니다. 확인 전에는 대기 화면이 표시됩니다.",
  },
  en: {
    brand: "Personal pattern intelligence",
    eyebrow: "30-day access",
    title: "Broad payment choice, strict server-side approval",
    intro: "A one-time 30-day pass with no automatic renewal. Approved KakaoPay, Toss Pay, card, and virtual-account methods are supported.",
    unavailable: "Payments remain closed until merchant review, prices, the production domain, and legal notices are finalized.",
    signin: "Sign in to keep reports in My Page and receive optional event notices.",
    signinAction: "Optional sign-in",
    choose: "Load payment methods",
    loading: "Loading the secure payment window…",
    pay: "Pay now",
    methods: {
      kakaopay: "KakaoPay",
      tosspay: "Toss Pay",
      card: "Credit / debit card",
      virtual_account: "Virtual account",
    },
    failed: "The payment window could not be prepared. Please try again.",
    missingDraft: "Choose a product and enter the reading information first.",
    notice: "Available methods and limits depend on the PortOne/KPN merchant contract and payment-method review.",
    terms: "Review the terms, refund policy, and privacy notice before payment.",
    duration: "30 days from purchase",
    depositorName: "Depositor name",
    depositorPlaceholder: "Name shown on the bank transfer",
    depositorHelp: "Use the same name that will appear on the receiving account.",
    manualChoose: "Get bank transfer details",
    manualTitle: "Transfer the exact amount to this account",
    manualAmount: "Amount",
    manualDeadline: "Deadline",
    manualStatus: "Check payment and report",
    manualNotice: "Your report opens after the administrator verifies the deposit.",
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
  paymentProvider,
  initialProduct,
}: {
  locale: Locale;
  products: readonly PublicProduct[];
  signedIn: boolean;
  paymentsEnabled: boolean;
  paymentProvider: "toss" | "portone" | "manual_transfer" | null;
  initialProduct: PaymentProductCode | null;
}) {
  const t = copy[locale];
  const otherLocale = locale === "ko" ? "en" : "ko";
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loadingCode, setLoadingCode] = useState<PaymentProductCode | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [depositorName, setDepositorName] = useState("");
  const [portOneMethod, setPortOneMethod] = useState<PortOneMethod>("kakaopay");
  const [readingInput] = useState<PaidReadingInput | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem("innerarc.checkoutDraft.v1");
    if (!raw) return null;
    try {
      const parsed = PaidReadingInputSchema.safeParse(JSON.parse(raw) as unknown);
      return parsed.success ? parsed.data : null;
    } catch {
      window.sessionStorage.removeItem("innerarc.checkoutDraft.v1");
      return null;
    }
  });
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);

  useEffect(() => {
    if (initialProduct && paymentsEnabled) {
      const target = document.querySelector<HTMLElement>(`[data-product="${initialProduct}"]`);
      target?.focus();
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [initialProduct, paymentsEnabled]);

  useEffect(() => {
    if (!session || session.provider !== "toss") return;
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
    if (!readingInput || readingInput.productCode !== productCode) {
      setError(true);
      return;
    }
    if (paymentProvider === "manual_transfer" && depositorName.trim().length < 2) {
      setError(true);
      return;
    }
    setError(false);
    setReady(false);
    setSession(null);
    setLoadingCode(productCode);
    try {
      const response = await fetch("/api/payments/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productCode,
          locale,
          readingInput,
          depositorName: paymentProvider === "manual_transfer"
            ? depositorName.trim()
            : undefined,
        }),
      });
      const body: unknown = await response.json();
      if (!response.ok) throw new Error("order failed");
      const checkout = body as CheckoutSession;
      setSession(checkout);
      if (checkout.provider === "portone" || checkout.provider === "manual_transfer") {
        setReady(true);
        setLoadingCode(null);
      }
    } catch {
      setError(true);
      setLoadingCode(null);
    }
  }

  async function requestPayment() {
    if (!session) return;
    if (session.provider === "manual_transfer") {
      window.location.assign(session.reportUrl);
      return;
    }
    setError(false);
    try {
      if (session.provider === "portone") {
        // PortOne V2 + KPN:
        // https://developers.portone.io/opi/ko/integration/pg/v2/kpn
        const PortOne = await import("@portone/browser-sdk/v2");
        const directEasyPay = portOneMethod === "kakaopay" || portOneMethod === "tosspay";
        const response = await PortOne.requestPayment({
          storeId: session.storeId,
          channelKey: session.channelKey,
          paymentId: session.paymentId,
          orderName: session.orderName,
          totalAmount: session.amount,
          currency: "KRW",
          payMethod: directEasyPay
            ? "EASY_PAY"
            : portOneMethod === "virtual_account"
              ? "VIRTUAL_ACCOUNT"
              : "CARD",
          ...(directEasyPay
            ? {
                easyPay: {
                  easyPayProvider: portOneMethod === "kakaopay" ? "KAKAOPAY" : "TOSSPAY",
                },
              }
            : {}),
          customer: {
            customerId: session.customerId,
            email: session.customerEmail,
          },
          locale: locale === "ko" ? "KO_KR" : "EN_US",
          productType: "DIGITAL",
          redirectUrl: session.successUrl,
          noticeUrls: [session.noticeUrl],
        });
        if (!response) return;
        if (response.code) {
          const failUrl = new URL(session.failUrl);
          failUrl.searchParams.set("code", response.code);
          window.location.assign(failUrl.toString());
          return;
        }
        const successUrl = new URL(session.successUrl);
        successUrl.searchParams.set("paymentId", response.paymentId);
        window.location.assign(successUrl.toString());
        return;
      }

      if (!widgetsRef.current) return;
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
          <strong>{locale === "ko" ? "결 GYEOL" : "GYEOL"}</strong>
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
      {!signedIn && (
        <p className="plans-gate">
          {t.signin} <Link href={`/${locale}/me`}>{t.signinAction}</Link>
        </p>
      )}

      {paymentsEnabled && paymentProvider === "manual_transfer" && (
        <div className="manual-depositor-field">
          <label htmlFor="depositor-name">{t.depositorName}</label>
          <input
            autoComplete="name"
            id="depositor-name"
            maxLength={80}
            onChange={(event) => setDepositorName(event.target.value)}
            placeholder={t.depositorPlaceholder}
            required
            value={depositorName}
          />
          <small>{t.depositorHelp}</small>
        </div>
      )}

      <section className="plan-grid" aria-label={locale === "ko" ? "이용권" : "Access plans"}>
        {products.map((product) => (
          <article
            className={initialProduct === product.code ? "plan-card is-recommended" : "plan-card"}
            data-product={product.code}
            key={product.code}
            tabIndex={-1}
          >
            <p className="eyebrow">{product.tier}</p>
            <h2>{product.name}</h2>
            <strong className="plan-price">{formatWon(product.amount, locale)}</strong>
            <small>{t.duration}</small>
            <ul>{product.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <button
              className="primary-button"
              type="button"
              disabled={!paymentsEnabled || !readingInput || loadingCode !== null}
              onClick={() => void createOrder(product.code)}
            >
              {loadingCode === product.code
                ? t.loading
                : paymentProvider === "manual_transfer"
                  ? t.manualChoose
                  : t.choose}
            </button>
          </article>
        ))}
      </section>

      {session && (
        <section className="payment-widget-shell" aria-live="polite">
          {session.provider === "toss" ? (
            <>
              <div id="payment-method" />
              <div id="payment-agreement" />
            </>
          ) : session.provider === "portone" ? (
            <div className="payment-choice-grid" role="radiogroup" aria-label={locale === "ko" ? "결제수단 선택" : "Choose payment method"}>
              {(Object.keys(t.methods) as PortOneMethod[]).map((method) => (
                <button
                  aria-checked={portOneMethod === method}
                  className={portOneMethod === method ? "payment-choice is-selected" : "payment-choice"}
                  key={method}
                  onClick={() => setPortOneMethod(method)}
                  role="radio"
                  type="button"
                >
                  {t.methods[method]}
                </button>
              ))}
            </div>
          ) : (
            <div className="manual-transfer-card">
              <p className="eyebrow">{t.manualTitle}</p>
              <dl>
                <div><dt>{locale === "ko" ? "은행" : "Bank"}</dt><dd>{session.bankName}</dd></div>
                <div><dt>{locale === "ko" ? "계좌번호" : "Account"}</dt><dd>{session.accountNumber}</dd></div>
                <div><dt>{locale === "ko" ? "예금주" : "Holder"}</dt><dd>{session.accountHolder}</dd></div>
                <div><dt>{t.manualAmount}</dt><dd>{formatWon(session.amount, locale)}</dd></div>
                <div><dt>{t.depositorName}</dt><dd>{session.depositorName}</dd></div>
                <div>
                  <dt>{t.manualDeadline}</dt>
                  <dd>{new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(session.depositDeadline))}</dd>
                </div>
              </dl>
              <p>{t.manualNotice}</p>
            </div>
          )}
          <button
            className="primary-button"
            type="button"
            disabled={!ready}
            onClick={() => void requestPayment()}
          >
            {session.provider === "manual_transfer" ? t.manualStatus : t.pay}
          </button>
        </section>
      )}

      {error && <p className="error" role="alert">{readingInput ? t.failed : t.missingDraft}</p>}
      {!readingInput && (
        <p className="plans-gate">
          {t.missingDraft}{" "}
          <Link href={`/${locale}#onboarding`}>
            {locale === "ko" ? "상품 선택하러 가기" : "Choose a product"}
          </Link>
        </p>
      )}
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
