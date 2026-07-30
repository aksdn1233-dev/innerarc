"use client";

import {
  loadTossPayments,
  type TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PaidReadingInputSchema, type PaidReadingInput } from "@/core/paid-reading";
import {
  checkoutErrorFromResponse,
  selectCheckoutReadingInput,
  type CheckoutErrorCode,
} from "@/core/checkout-ui";
import { saveGuestReportLink } from "@/core/report-handoff";
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
  bankAccounts: readonly Readonly<{
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }>[];
  depositorName: string;
  depositDeadline: string;
  reportUrl: string;
}>;

type PayAppCheckoutSession = Readonly<{
  provider: "payapp";
  orderId: string;
  orderName: string;
  amount: number;
  currency: "KRW";
  payUrl: string;
  reportUrl: string;
}>;

type CheckoutSession =
  | TossCheckoutSession
  | PortOneCheckoutSession
  | ManualTransferCheckoutSession
  | PayAppCheckoutSession;
type PortOneMethod = "kakaopay" | "tosspay" | "card" | "virtual_account";

const copy = {
  ko: {
    brand: "나·관계·올해의 흐름 리딩",
    eyebrow: "대표 리딩 상품",
    title: "원하는 깊이에 맞춰 먼저 선택하세요",
    intro: "모든 상품은 1회 결제이며 자동 갱신되지 않습니다. 회원가입 없이 바로 구매하고, 결제 확인 뒤 PC와 휴대폰에서 열거나 내려받을 수 있습니다.",
    unavailable: "아직 결제를 받을 준비가 끝나지 않았습니다. 가맹점 계약, 가격, 운영 도메인, 법정 고지를 모두 확정한 뒤 열립니다.",
    signin: "이미 구매하셨나요? 주문번호와 결제하신 휴대폰 번호로 리포트를 다시 여실 수 있어요.",
    signinAction: "구매 내역 확인",
    choose: "결제수단 불러오기",
    loading: "안전한 결제창을 불러오는 중…",
    pay: "결제하기",
    methods: {
      kakaopay: "카카오페이",
      tosspay: "토스페이",
      card: "신용·체크카드",
      virtual_account: "가상계좌",
    },
    errors: {
      missing_draft: "먼저 상품과 리딩 정보를 입력해 주세요.",
      invalid_depositor: "실제 입금 내역에 표시될 입금자명을 두 글자 이상 입력해 주세요.",
      invalid_phone: "결제 안내를 받을 국내 휴대폰 번호를 확인해 주세요.",
      temporarily_unavailable: "현재 결제를 잠시 멈춘 상태입니다. 입력 내용은 그대로 있으니 잠시 후 다시 확인해 주세요.",
      rate_limited: "짧은 시간에 결제 요청이 반복되었습니다. 잠시 후 다시 시도해 주세요.",
      order_failed: "주문을 만들지 못했습니다. 입력 내용을 유지했으니 잠시 후 다시 시도해 주세요.",
      widget_failed: "결제수단 화면을 불러오지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.",
      payment_failed: "결제 요청을 완료하지 못했습니다. 승인 여부를 확인한 뒤 다시 시도해 주세요.",
    },
    notice: "결제수단 노출 여부와 한도는 페이앱 판매자 설정 및 각 결제수단 심사 결과에 따라 달라집니다.",
    terms: "환불은 고객지원 이메일로 접수하며 접수일로부터 7일 이내 처리합니다. 결제 전에 이용조건·환불정책·개인정보 처리 안내를 확인해 주세요.",
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
    customerPhone: "휴대폰 번호",
    customerPhonePlaceholder: "010-1234-5678",
    customerPhoneHelp: "결제 안내와 가상계좌 발급에 사용됩니다. 주소는 받지 않습니다.",
    payAppNotice: "다음 화면에서 카카오페이·토스페이·카드·가상계좌·휴대폰 결제 중 하나를 선택할 수 있습니다.",
    keepLinkTitle: "이 주소를 먼저 저장해 주세요",
    keepLinkBody: "결제가 끝나면 이 주소에서 리포트를 보실 수 있습니다. 이 브라우저에도 자동으로 저장되지만, 가상계좌로 나중에 입금하시거나 다른 기기에서 여실 계획이라면 직접 복사해 두시는 편이 안전합니다.",
    keepLinkCopy: "주소 복사",
    keepLinkCopied: "복사했습니다",
    orderNumber: "주문번호",
  },
  en: {
    brand: "Personal pattern intelligence",
    eyebrow: "30-day access",
    title: "Broad payment choice, strict server-side approval",
    intro: "A one-time purchase with no automatic renewal. Approved KakaoPay, Toss Pay, card, mobile, bank-transfer, and virtual-account methods are supported.",
    unavailable: "Payments remain closed until merchant review, prices, the production domain, and legal notices are finalized.",
    signin: "Already purchased? Reopen your report with your order number and the phone number used at checkout.",
    signinAction: "Find a purchase",
    choose: "Load payment methods",
    loading: "Loading the secure payment window…",
    pay: "Pay now",
    methods: {
      kakaopay: "KakaoPay",
      tosspay: "Toss Pay",
      card: "Credit / debit card",
      virtual_account: "Virtual account",
    },
    errors: {
      missing_draft: "Choose a product and enter the reading information first.",
      invalid_depositor: "Enter at least two characters matching the depositor name on the transfer.",
      invalid_phone: "Check the Korean mobile number used for payment instructions.",
      temporarily_unavailable: "Checkout is temporarily paused. Your reading details are still here; please try again shortly.",
      rate_limited: "Too many checkout attempts were made in a short time. Please wait and try again.",
      order_failed: "The order could not be created. Your input is still here; please try again shortly.",
      widget_failed: "Payment methods could not be loaded. Check your connection and try again.",
      payment_failed: "The payment request did not finish. Check whether it was approved before trying again.",
    },
    notice: "Available methods and limits depend on PayApp merchant settings and payment-method review.",
    terms: "Refund requests are accepted by support email and processed within seven days after receipt. Review the terms, refund policy, and privacy notice before payment.",
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
    customerPhone: "Mobile phone",
    customerPhonePlaceholder: "010-1234-5678",
    customerPhoneHelp: "Used only for payment instructions and virtual-account issuance.",
    payAppNotice: "Choose KakaoPay, Toss Pay, card, virtual account, mobile, or bank transfer on the next screen.",
    keepLinkTitle: "Save this address first",
    keepLinkBody: "Your report opens at this address once payment completes. It is also saved in this browser, but copy it yourself if you plan to deposit to a virtual account later or open the report on another device.",
    keepLinkCopy: "Copy address",
    keepLinkCopied: "Copied",
    orderNumber: "Order number",
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
  paymentProvider: "toss" | "portone" | "manual_transfer" | "payapp" | null;
  initialProduct: PaymentProductCode | null;
}) {
  const t = copy[locale];
  const otherLocale = locale === "ko" ? "en" : "ko";
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loadingCode, setLoadingCode] = useState<PaymentProductCode | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<CheckoutErrorCode | null>(null);
  const [depositorName, setDepositorName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [portOneMethod, setPortOneMethod] = useState<PortOneMethod>("kakaopay");
  const [linkCopied, setLinkCopied] = useState(false);
  const checkoutInFlightRef = useRef(false);
  const paymentInFlightRef = useRef(false);
  const [readingInput, setReadingInput] = useState<PaidReadingInput | null>(() => {
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
        if (active) setError("widget_failed");
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
    if (checkoutInFlightRef.current) return;
    if (!readingInput) {
      setError("missing_draft");
      return;
    }
    if (paymentProvider === "manual_transfer" && depositorName.trim().length < 2) {
      setError("invalid_depositor");
      return;
    }
    if (
      paymentProvider === "payapp" &&
      !/^01[016789]-?\d{3,4}-?\d{4}$/.test(customerPhone.trim())
    ) {
      setError("invalid_phone");
      return;
    }
    checkoutInFlightRef.current = true;
    const selectedReadingInput = selectCheckoutReadingInput(readingInput, productCode);
    setReadingInput(selectedReadingInput);
    try {
      window.sessionStorage.setItem(
        "innerarc.checkoutDraft.v1",
        JSON.stringify(selectedReadingInput),
      );
    } catch {
      // The in-memory draft is sufficient for this checkout attempt.
    }
    setError(null);
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
          readingInput: selectedReadingInput,
          depositorName: paymentProvider === "manual_transfer"
            ? depositorName.trim()
            : undefined,
          customerPhone: paymentProvider === "payapp"
            ? customerPhone.trim()
            : undefined,
        }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        setError(checkoutErrorFromResponse(response.status, body));
        setLoadingCode(null);
        return;
      }
      const checkout = body as CheckoutSession;
      setSession(checkout);
      if (
        checkout.provider === "portone" ||
        checkout.provider === "manual_transfer" ||
        checkout.provider === "payapp"
      ) {
        setReady(true);
        setLoadingCode(null);
      }
    } catch {
      setError("order_failed");
      setLoadingCode(null);
    } finally {
      checkoutInFlightRef.current = false;
    }
  }

  async function copyReportLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
    } catch {
      // Clipboard access can be denied; the address stays selectable in the field.
      setLinkCopied(false);
    }
  }

  async function requestPayment() {
    if (!session || paymentInFlightRef.current) return;
    paymentInFlightRef.current = true;
    if (session.provider === "manual_transfer") {
      saveGuestReportLink(window.localStorage, {
        orderId: session.orderId,
        url: session.reportUrl,
        origin: window.location.origin,
        now: new Date(),
      });
      window.location.assign(session.reportUrl);
      return;
    }
    if (session.provider === "payapp") {
      // Durable, because the provider can return through a different browsing context
      // (app hand-off) or hours later (virtual-account deposit). The link is also shown
      // on screen above, so a failed write here does not strand a paying guest.
      saveGuestReportLink(window.localStorage, {
        orderId: session.orderId,
        url: session.reportUrl,
        origin: window.location.origin,
        now: new Date(),
      });
      window.location.assign(session.payUrl);
      return;
    }
    setError(null);
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
      setError("payment_failed");
    } finally {
      paymentInFlightRef.current = false;
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
          {t.signin} <Link href={`/${locale}/orders`}>{t.signinAction}</Link>
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

      {paymentsEnabled && paymentProvider === "payapp" && (
        <div className="manual-depositor-field">
          <label htmlFor="customer-phone">{t.customerPhone}</label>
          <input
            autoComplete="tel"
            id="customer-phone"
            inputMode="tel"
            maxLength={13}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder={t.customerPhonePlaceholder}
            required
            type="tel"
            value={customerPhone}
          />
          <small>{t.customerPhoneHelp}</small>
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
          {(session.provider === "payapp" || session.provider === "manual_transfer") && (
            <div className="report-link-card">
              <p className="eyebrow">{t.keepLinkTitle}</p>
              <p>{t.keepLinkBody}</p>
              <p className="report-link-order">
                {t.orderNumber} <code>{session.orderId}</code>
              </p>
              <div className="report-link-row">
                <input
                  aria-label={t.keepLinkTitle}
                  className="report-link-value"
                  onFocus={(event) => event.currentTarget.select()}
                  readOnly
                  value={session.reportUrl}
                />
                <button
                  className="secondary-button"
                  onClick={() => void copyReportLink(session.reportUrl)}
                  type="button"
                >
                  {linkCopied ? t.keepLinkCopied : t.keepLinkCopy}
                </button>
              </div>
              <p aria-live="polite" className="visually-hidden">
                {linkCopied ? t.keepLinkCopied : ""}
              </p>
            </div>
          )}
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
          ) : session.provider === "payapp" ? (
            <div className="payapp-payment-card">
              <p className="eyebrow">{locale === "ko" ? "안전한 결제" : "Secure checkout"}</p>
              <strong>{formatWon(session.amount, locale)}</strong>
              <p>{t.payAppNotice}</p>
            </div>
          ) : (
            <div className="manual-transfer-card">
              <p className="eyebrow">{t.manualTitle}</p>
              <dl>
                {session.bankAccounts.map((account) => (
                  <div className="manual-bank-account" key={`${account.bankName}-${account.accountNumber}`}>
                    <dt>{account.bankName}</dt>
                    <dd>
                      <strong>{account.accountNumber}</strong>
                      <small>{locale === "ko" ? "예금주" : "Holder"} {account.accountHolder}</small>
                    </dd>
                  </div>
                ))}
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

      {error && <p className="error" role="alert">{t.errors[error]}</p>}
      {!readingInput && (
        <p className="plans-gate">
          {t.errors.missing_draft}{" "}
          <Link href={`/${locale}#onboarding`}>
            {locale === "ko" ? "상품 선택하러 가기" : "Choose a product"}
          </Link>
        </p>
      )}
      <p className="plans-notice">{t.notice}</p>
      <p className="plans-notice payment-retry-notice">
        {locale === "ko"
          ? "결제창이 닫히거나 응답이 늦어져도 승인 여부를 확인하기 전 같은 주문을 다시 결제하지 마세요. 주문번호와 결제 휴대폰 번호로 구매 내역을 먼저 확인할 수 있습니다."
          : "If the payment window closes or responds slowly, do not pay the same order again before checking its status. Use the order number and payment phone number to look up the purchase first."}{" "}
        <Link href={`/${locale}/orders`}>
          {locale === "ko" ? "결제 상태 확인" : "Check payment status"}
        </Link>
      </p>
      <p className="plans-notice">
        {t.terms}{" "}
        <Link href={`/${locale}/terms`}>{locale === "ko" ? "이용조건" : "Terms"}</Link>
        {" · "}
        <Link href={`/${locale}/privacy`}>{locale === "ko" ? "개인정보" : "Privacy"}</Link>
      </p>
    </main>
  );
}
