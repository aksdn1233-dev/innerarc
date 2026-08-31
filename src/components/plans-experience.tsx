"use client";

import {
  loadTossPayments,
  type TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { captureConversionEvent } from "@/core/analytics";
import type { ProductPricingSnapshot } from "@/core/product-prices";
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
  regularAmount: number | null;
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

type InteractiveCheckoutSession =
  | TossCheckoutSession
  | PortOneCheckoutSession
  | ManualTransferCheckoutSession;
type CheckoutResponse = InteractiveCheckoutSession | PayAppCheckoutSession;
type PortOneMethod = "kakaopay" | "tosspay" | "card" | "virtual_account";

const copy = {
  ko: {
    brand: "나·관계·올해의 흐름 리딩",
    eyebrow: "대표 리딩 상품",
    title: "필요한 깊이만 선택하세요",
    intro: "회원가입 없이 한 번만 결제합니다. 결제 후 PC와 휴대폰에서 같은 리포트를 볼 수 있습니다.",
    unavailable: "아직 결제를 받을 준비가 끝나지 않았습니다. 가맹점 계약, 가격, 운영 도메인, 법정 고지를 모두 확정한 뒤 열립니다.",
    signin: "이미 구매하셨나요? 주문번호와 결제하신 휴대폰 번호로 리포트를 다시 여실 수 있어요.",
    signinAction: "구매 내역 확인",
    choose: "바로 결제하기",
    loading: "결제 화면으로 이동 중…",
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
      invalid_coupon: "쿠폰 번호, 결제 휴대폰 번호, 사용 기간을 확인해 주세요. 1,500원 할인 상품에는 중복 적용되지 않으며, 행사 중에는 프리미엄 심층 리딩에만 사용할 수 있습니다.",
      temporarily_unavailable: "현재 결제를 잠시 멈춘 상태입니다. 입력 내용은 그대로 있으니 잠시 후 다시 확인해 주세요.",
      rate_limited: "짧은 시간에 결제 요청이 반복되었습니다. 잠시 후 다시 시도해 주세요.",
      order_failed: "주문을 만들지 못했습니다. 입력 내용을 유지했으니 잠시 후 다시 시도해 주세요.",
      widget_failed: "결제수단 화면을 불러오지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.",
      payment_failed: "결제 요청을 완료하지 못했습니다. 승인 여부를 확인한 뒤 다시 시도해 주세요.",
      price_changed: "가격이 변경되었습니다. 현재 금액을 확인한 뒤 다시 결제해 주세요.",
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
    keepLinkTitle: "이 주소를 먼저 저장해 주세요",
    keepLinkBody: "결제가 끝나면 이 주소에서 리포트를 보실 수 있습니다. 이 브라우저에도 자동으로 저장되지만, 가상계좌로 나중에 입금하시거나 다른 기기에서 여실 계획이라면 직접 복사해 두시는 편이 안전합니다.",
    keepLinkCopy: "주소 복사",
    keepLinkCopied: "복사했습니다",
    orderNumber: "주문번호",
  },
  en: {
    brand: "Personal pattern intelligence",
    eyebrow: "One-time readings",
    title: "Choose only the depth you need",
    intro: "Pay once without creating an account. Open the same report on mobile or desktop after payment.",
    unavailable: "Payments remain closed until merchant review, prices, the production domain, and legal notices are finalized.",
    signin: "Already purchased? Reopen your report with your order number and the phone number used at checkout.",
    signinAction: "Find a purchase",
    choose: "Pay now",
    loading: "Opening secure checkout…",
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
      invalid_coupon: "Check the coupon, checkout mobile number, and validity period. It does not stack with a ₩1,500 price and applies only to the Premium reading during the campaign.",
      temporarily_unavailable: "Checkout is temporarily paused. Your reading details are still here; please try again shortly.",
      rate_limited: "Too many checkout attempts were made in a short time. Please wait and try again.",
      order_failed: "The order could not be created. Your input is still here; please try again shortly.",
      widget_failed: "Payment methods could not be loaded. Check your connection and try again.",
      payment_failed: "The payment request did not finish. Check whether it was approved before trying again.",
      price_changed: "The price has changed. Review the current amount and try checkout again.",
    },
    notice: "Available methods and limits depend on PayApp merchant settings and payment-method review.",
    terms: "Refund requests are accepted by support email and processed within seven days after receipt. Review the terms, refund policy, and privacy notice before payment.",
    duration: "One-time payment · no renewal",
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
    keepLinkTitle: "Save this address first",
    keepLinkBody: "Your report opens at this address once payment completes. It is also saved in this browser, but copy it yourself if you plan to deposit to a virtual account later or open the report on another device.",
    keepLinkCopy: "Copy address",
    keepLinkCopied: "Copied",
    orderNumber: "Order number",
  },
  ja: {
    brand: "自分・関係・一年の流れを読む",
    eyebrow: "代表リーディング",
    title: "必要な深さだけ選べます",
    intro: "会員登録なしの一回払いです。決済後はパソコンとスマートフォンで同じレポートを確認できます。",
    unavailable: "現在、決済準備中です。加盟店審査、価格、運用ドメイン、法定表示の確認後に開始します。",
    signin: "購入済みですか？注文番号と決済時の携帯電話番号でレポートを開けます。",
    signinAction: "購入履歴を確認",
    choose: "決済へ進む",
    loading: "決済画面を開いています…",
    pay: "支払う",
    methods: { kakaopay: "KakaoPay", tosspay: "Toss Pay", card: "クレジット・デビットカード", virtual_account: "仮想口座" },
    errors: {
      missing_draft: "先に商品とリーディング情報を入力してください。",
      invalid_depositor: "振込名義を2文字以上で入力してください。",
      invalid_phone: "決済案内を受け取る韓国の携帯電話番号を確認してください。",
      invalid_coupon: "クーポン番号、決済時の携帯電話番号、有効期間をご確認ください。1,500ウォンの割引商品とは併用できず、イベント期間中はプレミアム詳細リーディングにのみ使用できます。",
      temporarily_unavailable: "現在、決済を一時停止しています。入力内容は保持されていますので、しばらくしてからお試しください。",
      rate_limited: "短時間に決済リクエストが繰り返されました。しばらくしてからお試しください。",
      order_failed: "注文を作成できませんでした。入力内容は保持されています。",
      widget_failed: "決済手段を読み込めませんでした。通信状態を確認してください。",
      payment_failed: "決済を完了できませんでした。承認状況を確認してください。",
      price_changed: "価格が変更されました。新しい価格を確認してからもう一度お進みください。",
    },
    notice: "表示される決済手段と利用限度は、決済代行会社の審査・設定により異なります。",
    terms: "返金はサポートメールで受け付け、受付日から7日以内に処理します。決済前に利用条件、返金方針、個人情報の取扱いをご確認ください。",
    duration: "一回払い・自動更新なし",
    depositorName: "振込名義",
    depositorPlaceholder: "実際に振り込む方のお名前",
    depositorHelp: "入金確認に使います。口座に表示される名前と同じ表記を入力してください。",
    manualChoose: "振込先を確認",
    manualTitle: "下記口座へ正確な金額をお振り込みください",
    manualAmount: "振込金額",
    manualDeadline: "振込期限",
    manualStatus: "入金確認・レポートを見る",
    manualNotice: "入金確認後にレポートが開きます。確認前は待機画面が表示されます。",
    customerPhone: "携帯電話番号",
    customerPhonePlaceholder: "010-1234-5678",
    customerPhoneHelp: "決済案内と仮想口座の発行にのみ使います。住所は収集しません。",
    keepLinkTitle: "このアドレスを先に保存してください",
    keepLinkBody: "決済完了後、このアドレスでレポートを確認できます。別の端末で開く場合はコピーして保管してください。",
    keepLinkCopy: "アドレスをコピー",
    keepLinkCopied: "コピーしました",
    orderNumber: "注文番号",
  },
} as const;

type PlansLocale = Locale | "ja";

function formatWon(amount: number | null, locale: PlansLocale) {
  if (amount === null) return locale === "ko" ? "가격 확정 전" : locale === "ja" ? "価格未定" : "Price pending";
  return new Intl.NumberFormat(locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US", {
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
  pricing,
}: {
  locale: PlansLocale;
  products: readonly PublicProduct[];
  signedIn: boolean;
  paymentsEnabled: boolean;
  paymentProvider: "toss" | "portone" | "manual_transfer" | "payapp" | null;
  initialProduct: PaymentProductCode | null;
  pricing: ProductPricingSnapshot;
}) {
  const t = copy[locale];
  const systemLocale: Locale = locale === "ja" ? "en" : locale;
  const routeLocale = locale === "ja" ? "en" : locale;
  const [session, setSession] = useState<InteractiveCheckoutSession | null>(null);
  const [loadingCode, setLoadingCode] = useState<PaymentProductCode | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<CheckoutErrorCode | null>(null);
  const [depositorName, setDepositorName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [couponCode, setCouponCode] = useState("");
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
    const selectedProduct = products.find((product) => product.code === productCode);
    if (selectedProduct?.amount === null || selectedProduct?.amount === undefined) {
      setError("temporarily_unavailable");
      return;
    }
    const campaignDiscounted = Boolean(
      pricing.campaign && selectedProduct.regularAmount !== null &&
      selectedProduct.amount < selectedProduct.regularAmount,
    );
    if (paymentProvider === "manual_transfer" && depositorName.trim().length < 2) {
      setError("invalid_depositor");
      return;
    }
    if (
      (paymentProvider === "payapp" || couponCode.trim()) &&
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
    captureConversionEvent("payment_start", systemLocale, {
      productCode,
      provider: paymentProvider ?? "unknown",
    });
    try {
      const response = await fetch("/api/payments/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productCode,
          expectedAmount: selectedProduct.amount - (!campaignDiscounted && couponCode.trim() ? 5_000 : 0),
          locale: systemLocale,
          readingInput: selectedReadingInput,
          depositorName: paymentProvider === "manual_transfer"
            ? depositorName.trim()
            : undefined,
          customerPhone: paymentProvider === "payapp" || couponCode.trim()
            ? customerPhone.trim()
            : undefined,
          couponCode: couponCode.trim() || undefined,
        }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        captureConversionEvent("payment_fail", systemLocale, {
          provider: paymentProvider ?? "unknown",
          stage: "order",
        });
        setError(checkoutErrorFromResponse(response.status, body));
        setLoadingCode(null);
        return;
      }
      const checkout = body as CheckoutResponse;
      if (checkout.provider === "payapp") {
        saveGuestReportLink(window.localStorage, {
          orderId: checkout.orderId,
          url: checkout.reportUrl,
          origin: window.location.origin,
          now: new Date(),
        });
        setLoadingCode(null);
        window.location.assign(checkout.payUrl);
        return;
      }
      setSession(checkout);
      if (checkout.provider === "portone" || checkout.provider === "manual_transfer") {
        setReady(true);
        setLoadingCode(null);
      }
    } catch {
      captureConversionEvent("payment_fail", systemLocale, {
        provider: paymentProvider ?? "unknown",
        stage: "order",
      });
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
          captureConversionEvent("payment_fail", systemLocale, {
            provider: "portone",
            stage: "checkout",
          });
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
      captureConversionEvent("payment_fail", systemLocale, {
        provider: session.provider,
        stage: "checkout",
      });
      setError("payment_failed");
    } finally {
      paymentInFlightRef.current = false;
    }
  }

  return (
    <main className="shell plans-shell" id="main-content" tabIndex={-1}>
      <header className="topbar">
        <Link className="brand" href={`/${locale}`}>
            <strong>태령당</strong>
          <small>{t.brand}</small>
        </Link>
        <nav className="plans-language-switcher" aria-label="Language">
          {locale !== "ko" && <Link href="/ko/plans">한국어</Link>}
          {locale !== "en" && <Link href="/en/plans">English</Link>}
          {locale !== "ja" && <Link href="/ja/plans">日本語</Link>}
        </nav>
      </header>


      <section className="plans-intro">
        <div className="plans-intro-copy">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
          <div className="plans-trust-strip" aria-label={locale === "ko" ? "구매 조건" : locale === "ja" ? "購入条件" : "Purchase terms"}>
            <span>{locale === "ko" ? "한 번만 결제" : locale === "ja" ? "一回払い" : "Pay once"}</span>
            <span>{locale === "ko" ? "회원가입 불필요" : locale === "ja" ? "会員登録不要" : "No account needed"}</span>
            <span>{locale === "ko" ? "선물·공유 가능" : locale === "ja" ? "ギフト・共有対応" : "Gift and share"}</span>
          </div>
        </div>
        <div className="plans-guide" aria-hidden="true">
          <span>{locale === "ko" ? "지금 필요한 만큼만, 제가 차분히 안내해 드릴게요." : locale === "ja" ? "今必要な深さだけ、落ち着いてご案内します。" : "Choose the depth you need. I will guide you through it."}</span>
          <Image alt="" height={1280} priority src="/images/numerology-guides/gyeol-taeryeong.jpg" width={720} />
        </div>
      </section>

      {pricing.campaign && (
        <aside className="plans-campaign-banner">
          <span><strong>{locale === "ko" ? "사주 원국·상세 리딩 · 1,500원" : locale === "ja" ? "四柱原局・詳細リーディング・1,500ウォン" : "Four Pillars & Detailed readings · ₩1,500"}</strong><small>{locale === "ko" ? "프리미엄 심층 리딩 79,000원은 행사 제외 · 9월 6일 오후 4:50 종료" : locale === "ja" ? "プレミアム詳細リーディング79,000ウォンは対象外・9月6日16:50終了" : "₩79,000 Premium reading excluded · ends Sep 6 at 4:50 PM KST"}</small></span>
          <Link href={`/${routeLocale}/events`}>{locale === "ko" ? "후기 이벤트·FAQ 보기" : locale === "ja" ? "イベント・FAQを見る" : "Review event & FAQ"}</Link>
        </aside>
      )}

      {!paymentsEnabled && <p className="plans-gate" role="status">{t.unavailable}</p>}
      {!signedIn && (
        <p className="plans-gate">
          {t.signin} <Link href={`/${routeLocale}/orders`}>{t.signinAction}</Link>
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

      {paymentsEnabled && (
        <div className="manual-depositor-field">
          <label htmlFor="referral-coupon">{locale === "ko" ? "친구 초대 쿠폰 (선택)" : locale === "ja" ? "友達紹介クーポン（任意）" : "Referral coupon (optional)"}</label>
          <input id="referral-coupon" maxLength={300} onChange={(event) => setCouponCode(event.target.value)} placeholder="GY5-…" value={couponCode} />
          <small>{locale === "ko" ? "발급받은 휴대폰 번호와 같은 번호로 결제해야 합니다. 행사 기간에는 할인이 적용되지 않은 프리미엄 심층 리딩에만 사용할 수 있습니다." : locale === "ja" ? "発行時と同じ携帯電話番号が必要です。イベント期間中は割引対象外のプレミアム詳細リーディングにのみ使用できます。" : "Use the same mobile number used to issue the coupon. During the campaign it applies only to the non-discounted Premium reading."}</small>
        </div>
      )}

      <section className="plan-grid" aria-label={locale === "ko" ? "이용권" : locale === "ja" ? "商品プラン" : "Access plans"}>
        {products.map((product, index) => (
          <article
            className={`${initialProduct === product.code || (!initialProduct && product.code === "pro_30d") ? "plan-card is-recommended" : "plan-card"} plan-card-${index + 1}`}
            data-product={product.code}
            key={product.code}
            tabIndex={-1}
          >
            {(initialProduct === product.code || (!initialProduct && product.code === "pro_30d")) && (
              <span className="plan-recommendation">{locale === "ko" ? "가장 많이 선택" : locale === "ja" ? "一番人気" : "Most selected"}</span>
            )}
            <p className="eyebrow">{product.tier}</p>
            <h2>{product.name}</h2>
            <div className="plan-price-stack">
              {pricing.campaign && product.regularAmount !== product.amount && (
                <del>{formatWon(product.regularAmount, locale)}</del>
              )}
              <strong className="plan-price">{formatWon(product.amount, locale)}</strong>
              {pricing.campaign && product.regularAmount !== product.amount && (
                <span>{locale === "ko" ? "1주일 연장 할인가" : locale === "ja" ? "1週間延長価格" : "One-week extension price"}</span>
              )}
            </div>
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
            <p className="plan-card-footnote">{locale === "ko" ? "결제 후 바로 열람 · 링크로 선물 가능" : locale === "ja" ? "決済後すぐ閲覧・ギフト共有対応" : "Open after payment · share as a gift"}</p>
          </article>
        ))}
      </section>

      {session && (
        <section className="payment-widget-shell" aria-live="polite">
          {session.provider === "manual_transfer" && (
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
            <div className="payment-choice-grid" role="radiogroup" aria-label={locale === "ko" ? "결제수단 선택" : locale === "ja" ? "決済手段を選択" : "Choose payment method"}>
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
                {session.bankAccounts.map((account) => (
                  <div className="manual-bank-account" key={`${account.bankName}-${account.accountNumber}`}>
                    <dt>{account.bankName}</dt>
                    <dd>
                      <strong>{account.accountNumber}</strong>
                      <small>{locale === "ko" ? "예금주" : locale === "ja" ? "口座名義" : "Holder"} {account.accountHolder}</small>
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
          <Link href={`/${routeLocale}/fortune`}>
            {locale === "ko" ? "사주 서비스로 가기" : locale === "ja" ? "四柱推命サービスへ" : "Open Saju services"}
          </Link>
        </p>
      )}
      <p className="plans-notice payment-retry-notice">
        {locale === "ko"
          ? "결제창이 닫히거나 응답이 늦어져도 승인 여부를 확인하기 전 같은 주문을 다시 결제하지 마세요. 주문번호와 결제 휴대폰 번호로 구매 내역을 먼저 확인할 수 있습니다."
          : locale === "ja"
            ? "決済画面が閉じたり応答が遅れたりしても、承認状況を確認する前に同じ注文を再決済しないでください。注文番号と決済時の携帯電話番号で購入履歴を確認できます。"
            : "If the payment window closes or responds slowly, do not pay the same order again before checking its status. Use the order number and payment phone number to look up the purchase first."}{" "}
        <Link href={`/${routeLocale}/orders`}>
          {locale === "ko" ? "결제 상태 확인" : locale === "ja" ? "決済状況を確認" : "Check payment status"}
        </Link>
      </p>
      <details className="plans-details">
        <summary>{locale === "ko" ? "결제·환불 안내" : locale === "ja" ? "決済・返金について" : "Payment and refund details"}</summary>
        <p className="plans-notice">{t.notice}</p>
        <p className="plans-notice">
          {t.terms}{" "}
          <Link href={`/${routeLocale}/terms`}>{locale === "ko" ? "이용조건" : locale === "ja" ? "利用条件" : "Terms"}</Link>
          {" · "}
          <Link href={`/${routeLocale}/privacy`}>{locale === "ko" ? "개인정보" : locale === "ja" ? "個人情報" : "Privacy"}</Link>
        </p>
      </details>
    </main>
  );
}
