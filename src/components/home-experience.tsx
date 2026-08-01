"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CampaignNotice } from "@/components/campaign-notice";
import type { ProductPricingSnapshot } from "@/core/product-prices";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type Props = {
  locale: Locale;
  dictionary: Dictionary;
  pricing: ProductPricingSnapshot;
};
type ReadingProductId = "comprehensive" | "premium_pdf";

type FocusId = "work" | "relationships" | "health" | "growth" | "money";

// The example has to match the area the person just picked. A relationship prompt
// shown to someone asking about money reads as "this service is not for me".
const concernExamples: Record<Locale, Record<FocusId, string>> = {
  ko: {
    work: "예: 지금 회사에 계속 있는 게 맞을까요, 옮길 준비를 시작해야 할까요?",
    relationships: "예: 그 사람과 다시 잘될 수 있을까요?",
    health: "예: 내 건강 습관과 생활 리듬에서 무엇부터 바꿔야 할까요?",
    growth: "예: 요즘 계속 제자리인 것 같은데, 뭘 먼저 바꿔야 할까요?",
    money: "예: 지금 목돈을 쓰는 게 맞을지 계속 망설여집니다.",
  },
  en: {
    work: "e.g. Should I stay in this job, or start preparing to move?",
    relationships: "e.g. Is there a realistic way back with this person?",
    health: "e.g. What should I change first in my health habits and daily rhythm?",
    growth: "e.g. I feel stuck lately — what should I change first?",
    money: "e.g. I keep hesitating over a large spend right now.",
  },
};

const productCodeByReading: Record<ReadingProductId, "pro_30d" | "premium_pdf"> = {
  comprehensive: "pro_30d",
  premium_pdf: "premium_pdf",
};

const readingProducts = {
  ko: [
    {
      id: "comprehensive",
      name: "상세 리딩",
      description: "직접 결론, 반복 패턴, 상황별 대처와 우선 실행 계획을 정리합니다.",
      // Describes the product, not its sales: nothing has been sold yet, and inventing
      // popularity is exactly what 표시광고법 treats as false advertising.
      badge: "가장 균형 잡힌 선택",
    },
    {
      id: "premium_pdf",
      name: "프리미엄 심층 리딩",
      description: "상세 리딩에 숨은 동기, 세 가지 시나리오, 확인 신호와 6단계 실행 기준을 더합니다.",
      badge: "결정까지 깊게 보고 싶다면",
    },
  ],
  en: [
    {
      id: "comprehensive",
      name: "Detailed reading",
      description: "A consultant-style answer with decision patterns, domain analysis, phased guidance, execution steps, and stop criteria.",
      badge: "Best balance",
    },
    {
      id: "premium_pdf",
      name: "Premium in-depth reading",
      description: "Everything in Detailed, plus root causes, three evidence-based scenarios, signals, a six-step manual, and stop criteria. Complete even without a question.",
      badge: "For a decision-ready view",
    },
  ],
} as const;

const copy = {
  ko: {
    navLabel: "홈페이지 탐색",
    nav: [
      ["#preview", "리포트 예시"],
      ["#products", "상품 안내"],
      ["#onboarding", "신청하기"],
    ],
    primary: "내 리딩 선택하기",
    secondary: "무엇을 알 수 있나요",
    heroNote: "한 번만 결제 · 추가 결제 없음 · 자동 갱신 없음",
    sampleEyebrow: "이런 내용을 알려드려요",
    sampleTitle: "결제 전에, 어떤 답을 받는지 확인하세요.",
    sampleBody: "아래는 실제 후기가 아니라 리포트 구성 예시입니다. 막연한 단정보다 내 성향과 현실에서 확인할 방향을 쉽게 설명합니다.",
    sampleCases: [
      ["학업", "나에게 맞는 공부 방식과 집중 조건을 봅니다."],
      ["직업", "강점이 살아나는 업무와 이직 전 확인할 조건을 정리합니다."],
      ["연애", "마음을 표현하는 방식과 반복되는 관계 패턴을 봅니다."],
    ],
    purchaseFacts: ["1회 결제", "비회원 열람", "자동 결제 없음"],
    fields: [
      ["01", "타고난 나의 성향", "강점과 반복하는 선택의 이유를 봅니다."],
      ["02", "학업·직업·연애", "지금 필요한 강점과 주의점을 정리합니다."],
      ["03", "나와 가까운 사람", "잘 맞는 점과 충돌을 줄이는 방법을 봅니다."],
      ["04", "올해의 흐름", "힘을 줄 때와 서두르지 말아야 할 때를 봅니다."],
    ],
    formTitle: "지금 가장 알고 싶은 내용을 선택해 주세요",
    formBody: "상품을 고르고 리딩에 필요한 정보만 입력합니다.",
    submit: "입력 완료하고 결제하러 가기",
    privacy: "입력 정보는 결제 완료 후 구매한 리포트를 만들고 저장하는 데 사용됩니다.",
    productsTitle: "궁금한 만큼, 필요한 깊이로",
    productsBody: "상세 리딩과 프리미엄 심층 리딩 중 필요한 깊이만 고르세요. 모두 1회 결제입니다.",
    trust: [
      ["회원가입 없음", "이름과 비밀번호를 만들 필요가 없습니다. 생년월일과 궁금한 것, 연락받을 번호만 받습니다."],
      ["결제 확인 후 제공", "결제가 실제로 승인된 주문에만 리포트를 엽니다. 취소하시면 열람도 함께 닫힙니다."],
      ["언제든 다시 보기", "결제하신 휴대폰 번호와 주문번호만 있으면 나중에도 같은 리포트를 다시 여실 수 있습니다."],
      ["1회 결제·자동갱신 없음", "구독이 아닙니다. 결제한 그 리포트만 제공되고 다음 달에 다시 청구되지 않습니다."],
    ],
  },
  en: {
    navLabel: "Home navigation",
    nav: [["#products", "Products"], ["#onboarding", "Start"], ["#trust", "Safety"]],
    primary: "Choose a product",
    secondary: "View products",
    heroNote: "Review before payment · one-time purchase · no auto-renewal",
    sampleEyebrow: "How it works",
    sampleTitle: "See the kind of answer you receive before paying.",
    sampleBody: "These are report examples, not customer testimonials. They show how the reading turns a complicated concern into signals to verify and a practical next step, without guaranteed outcomes.",
    sampleCases: [
      ["Love and contact", "Instead of claiming to know another person's mind, the report gives you criteria for comparing words with repeated behavior."],
      ["Career decision", "Instead of simply saying stay or leave, it separates the conditions for staying from the signs that preparation should begin."],
      ["Money and business", "Instead of promising returns, it identifies the responsibility you can carry now and the impulsive decisions to avoid."],
    ],
    purchaseFacts: ["One-time payment", "No account required", "No auto-renewal"],
    fields: [
      ["01", "Love & relationships", "Review recurring behavior, distance, and conversation."],
      ["02", "Work & career", "Clarify sustainable conditions and your next choice."],
      ["03", "Business & money", "Review money flow and decision cautions without promising returns."],
      ["04", "Current direction", "Check the pace of change and one action not to postpone."],
    ],
    formTitle: "Choose your reading first",
    formBody: "Choose a product and enter only the details needed for the reading.",
    submit: "Continue to payment",
    privacy: "Your input is used to create and store the purchased report after payment.",
    productsTitle: "Two clear products",
    productsBody: "Choose Detailed or Premium based on the depth you need. Both are one-time purchases.",
    trust: [
      ["No account needed", "No username or password. Only your birth date, your question, and a contact number."],
      ["Opens after payment", "Reports open only on verified payments, and close again if a payment is cancelled."],
      ["Reopen any time", "Your order number and the phone number used at checkout reopen the same report later."],
      ["One-time purchase", "Not a subscription. You receive the report you paid for and are never billed again."],
    ],
  },
} as const;

function formatWon(amount: number, locale: Locale) {
  if (locale === "ko") return `${amount.toLocaleString("ko-KR")}원`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function HomeExperience({ locale, dictionary: d, pricing }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<ReadingProductId>("comprehensive");
  const [focusId, setFocusId] = useState<FocusId>("relationships");
  const [error, setError] = useState("");
  const t = copy[locale];
  const otherLocale = locale === "ko" ? "en" : "ko";
  const products = readingProducts[locale].map((product) => {
    const productCode = productCodeByReading[product.id];
    return {
      ...product,
      price: formatWon(pricing.prices[productCode], locale),
      regularPrice: formatWon(pricing.regularPrices[productCode], locale),
      discounted: pricing.campaignActive &&
        pricing.prices[productCode] < pricing.regularPrices[productCode],
    };
  });

  function chooseProduct(id: ReadingProductId) {
    setSelectedProduct(id);
    window.requestAnimationFrame(() => {
      document.getElementById("onboarding")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    if (form.get("privacyRequired") !== "on") {
      setError(locale === "ko" ? "개인정보 안내를 확인해 주세요." : "Please review the privacy notice.");
      return;
    }
    const birthDate = String(form.get("birthDate") ?? "").trim();
    const concern = String(form.get("concern") ?? "").trim();
    if (!birthDate) {
      setError(locale === "ko" ? "생년월일을 입력해 주세요." : "Enter a birth date.");
      return;
    }
    const reportFocus = String(form.get("reportFocus") ?? "").trim();
    const payload = {
      version: 1,
      locale,
      productCode: productCodeByReading[selectedProduct],
      birthDate,
      name: String(form.get("name") ?? "").trim(),
      focusId: String(form.get("interest") ?? "relationships"),
      concern: [concern, reportFocus].filter(Boolean).join(" / ").slice(0, 2_000),
      createdAt: new Date().toISOString(),
    };
    window.sessionStorage.setItem("innerarc.checkoutDraft.v1", JSON.stringify(payload));
    window.location.assign(`/${locale}/plans?product=${payload.productCode}`);
  }

  return (
    <>
      <main className="shell home-shell" id="main-content" tabIndex={-1}>
        <header className="topbar home-topbar">
          <Link className="brand" href={`/${locale}`}>
            <strong>{locale === "ko" ? "결" : "GYEOL"}</strong>
            <small>{d.brandTagline}</small>
          </Link>
          <nav className="home-nav" aria-label={t.navLabel}>
            {t.nav.map(([href, label]) => <a href={href} key={href}>{label}</a>)}
          </nav>
          <div className="home-header-actions">
            <a className="header-start-link" href="#onboarding">
              {locale === "ko" ? "상담 시작하기" : "Start reading"}
            </a>
            <Link className="locale-switch" href={`/${otherLocale}`}>
              {otherLocale === "ko" ? "한국어" : "English"}
            </Link>
          </div>
        </header>

        <CampaignNotice locale={locale} pricing={pricing} />

        <section className="hero home-hero" aria-labelledby="hero-title">
          <div className="question-cloud" aria-hidden="true">
            <span className="question-bubble question-bubble-1">나는 왜 같은 선택을 반복할까?</span>
            <span className="question-bubble question-bubble-2">올해, 무엇에 힘을 줘야 할까?</span>
            <span className="question-bubble question-bubble-3">이 관계에서 무엇을 확인해야 할까?</span>
          </div>
          <div className="home-hero-copy">
            <p className="eyebrow">{locale === "ko" ? "나의 성향부터 올해의 흐름까지" : d.eyebrow}</p>
            <h1 id="hero-title">
              {locale === "ko" ? (
                <>나를 이해하면,<br /><span>올해의 선택이<br />조금 더 선명해집니다.</span></>
              ) : d.headline}
            </h1>
            <p className="hero-copy">
              {locale === "ko"
                ? "타고난 나의 성향부터 학업·직업·연애, 가까운 사람과의 관계, 올해의 흐름까지 한 번에 알기 쉽게 정리해드립니다."
                : d.intro}
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#products">{t.primary}</a>
              <a className="secondary-link" href="#preview">{t.secondary}</a>
            </div>
            <p className="locked-note" aria-label={locale === "ko" ? "무료 핵심 패턴 보기 잠금" : "Free core pattern is locked"}>
              {locale === "ko" ? "무료 핵심 패턴 · 잠금" : "Free core pattern · Locked"}
            </p>
            <p className="hero-note">{t.heroNote}</p>
          </div>
        </section>

        <section className="report-preview" id="preview" aria-labelledby="preview-title">
          <div className="section-heading">
            <p className="eyebrow">{t.sampleEyebrow}</p>
            <h2 id="preview-title">{t.sampleTitle}</h2>
            <p className="report-preview-disclosure">{t.sampleBody}</p>
            <div className="purchase-fact-row" aria-label={locale === "ko" ? "구매 핵심 안내" : "Purchase facts"}>
              {t.purchaseFacts.map((fact) => <span key={fact}>✓ {fact}</span>)}
            </div>
          </div>
          <div className="preview-case-grid">
            {t.sampleCases.map(([label, body]) => (
              <article className="preview-reading" key={label}>
                <small>{locale === "ko" ? "리포트 예시" : "Report example"} · {label}</small>
                <p>{body}</p>
              </article>
            ))}
            <a className="primary-button preview-cta" href="#onboarding">
              {locale === "ko" ? "내가 궁금한 영역 살펴보기" : "Explore the area I care about"}
            </a>
          </div>
        </section>

        <section className="pattern-fields" id="fields" aria-labelledby="fields-title">
          <div className="section-heading">
            <p className="eyebrow">{locale === "ko" ? "상담 분야" : "Reading areas"}</p>
            <h2 id="fields-title">
              {locale === "ko" ? "나를 알고, 관계를 이해하고, 올해를 준비합니다" : "Understand yourself, your relationships, and the year ahead"}
            </h2>
          </div>
          <div className="pattern-field-grid">
            {t.fields.map(([index, title, body]) => (
              <article key={index}><span>{index}</span><h3>{title}</h3><p>{body}</p></article>
            ))}
          </div>
        </section>

        <section className="pass-summary" id="products" aria-labelledby="products-title">
          <div className="product-section-heading">
            <p className="eyebrow">{locale === "ko" ? "대표 상품" : "Products"}</p>
            <h2 id="products-title">{t.productsTitle}</h2>
            <p>{t.productsBody}</p>
          </div>
          <div className="editorial-product-grid">
            {products.map((product) => (
              <article className={product.id === "comprehensive" ? "editorial-product is-featured" : "editorial-product"} key={product.id}>
                <small>{product.badge}</small>
                <h3>{product.name}</h3>
                <div className="campaign-price-row">
                  {product.discounted && <del>{product.regularPrice}</del>}
                  <strong>{product.price}</strong>
                  {product.discounted && (
                    <span>{locale === "ko" ? "여름 이벤트가" : "Summer event"}</span>
                  )}
                </div>
                <p>{product.description}</p>
                <button type="button" onClick={() => chooseProduct(product.id)}>
                  {locale === "ko" ? `${product.price} 선택` : `Choose ${product.price}`}
                </button>
              </article>
            ))}
          </div>
          <p className="payment-reassurance">
            {locale === "ko"
              ? "결제 전 주문 내용을 한 번 더 확인합니다. 자동 결제·자동 갱신은 없습니다."
              : "Review your order once more before payment. No recurring charge."}
          </p>
        </section>

        <section className="form-section home-form-section" id="onboarding" aria-labelledby="onboarding-title">
          <header className="form-section-heading">
            <p className="eyebrow">{locale === "ko" ? "나의 흐름 알아보기" : "Understand your personal flow"}</p>
            <h2 id="onboarding-title">{t.formTitle}</h2>
            <p>{t.formBody}</p>
          </header>
          <form className="form-card" onSubmit={submit} noValidate>
            <div className="intake-progress" aria-label={locale === "ko" ? "신청 단계" : "Application steps"}>
              <span className="is-current">{locale === "ko" ? "상품 선택" : "Choose"}</span>
              <span>{locale === "ko" ? "정보 입력" : "Details"}</span>
              <span>{locale === "ko" ? "결제 확인" : "Payment"}</span>
            </div>
            <fieldset className="product-picker field">
              <legend>{locale === "ko" ? "1. 상품 선택" : "1. Product"}</legend>
              <div className="product-picker-grid">
                {products.map((product) => (
                  <label className="product-choice" key={product.id}>
                    <input
                      checked={selectedProduct === product.id}
                      name="readingProduct"
                      onChange={() => setSelectedProduct(product.id)}
                      type="radio"
                      value={product.id}
                    />
                    <span>
                      <small>{product.badge}</small><strong>{product.name}</strong>
                      {product.discounted && <del>{product.regularPrice}</del>}
                      <b>{product.price}</b><em>{product.description}</em>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <section className="intake-panel" aria-labelledby="intake-details-title">
              <header className="intake-panel-header">
                <div>
                  <h3 id="intake-details-title">
                    {locale === "ko" ? "리딩에 필요한 정보" : "Details for your reading"}
                  </h3>
                  <p>
                    {locale === "ko"
                      ? "정확한 리포트 생성에 필요한 최소 정보만 입력합니다."
                      : "Only the minimum details needed to create your report."}
                  </p>
                </div>
              </header>

              <div className="field field-premium">
                <label htmlFor="birthDate">{locale === "ko" ? "2. 리딩할 사람의 생년월일 (양력)" : "2. Birth date (Gregorian calendar)"}</label>
                <input id="birthDate" name="birthDate" type="date" required />
                <small>
                  {locale === "ko"
                    ? "양력 기준으로 입력하세요. 내 질문이면 내 생년월일을, 엄마·아이·배우자에 대한 질문이면 그 사람의 양력 생년월일을 입력하세요."
                    : "Enter the Gregorian-calendar birth date for you, or for the other person when asking about them."}
                </small>
              </div>

              <fieldset className="field simple-topic-picker">
                <legend>{locale === "ko" ? "3. 가장 궁금한 영역" : "3. Main area"}</legend>
                <div className="choice-row">
                  {d.interests.slice(0, 5).map((option) => (
                    <label className="choice" key={option.value}>
                      <input
                        checked={focusId === option.value}
                        name="interest"
                        onChange={() => setFocusId(option.value as FocusId)}
                        type="radio"
                        value={option.value}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="field field-premium">
                <label htmlFor="name">{locale === "ko" ? "이름 또는 부를 이름" : "Name"}</label>
                <input id="name" name="name" type="text" maxLength={200} autoComplete="name" placeholder={locale === "ko" ? "리포트에 표시할 이름" : "Name shown on the report"} />
              </div>

              <div className="field field-premium">
                <label htmlFor="concern">
                  {locale === "ko"
                    ? selectedProduct === "premium_pdf" ? "4. 집중해서 보고 싶은 고민 (선택)" : "4. 한 가지 궁금한 점 (선택)"
                    : selectedProduct === "premium_pdf" ? "4. A question to analyze deeply (optional)" : "4. Your concern (optional)"}
                </label>
                <textarea
                  id="concern"
                  maxLength={1_000}
                  name="concern"
                  placeholder={concernExamples[locale][focusId]}
                />
                <small>
                  {locale === "ko"
                    ? selectedProduct !== "premium_pdf"
                      ? "비워두면 생년월일만으로 상세 성향·직업·돈·관계·2026년 방향을 구성합니다."
                      : "비워도 전체 분석이 완결됩니다. 적으면 그 질문의 시나리오·신호·실행 기준을 더 집중해서 분석합니다."
                    : selectedProduct !== "premium_pdf"
                      ? "Leave blank for a general report covering work, money, relationships, and 2026."
                      : "The full report works without it. Add one to focus the scenarios, signals, and decision criteria."}
                </small>
              </div>

              {selectedProduct === "premium_pdf" && (
                <div className="field field-premium">
                  <label htmlFor="reportFocus">{locale === "ko" ? "리포트에서 꼭 다룰 내용" : "What the report must cover"}</label>
                  <textarea id="reportFocus" name="reportFocus" maxLength={1_000} placeholder={locale === "ko" ? "예: 올해 연애 흐름과 이직 시기를 함께 보고 싶어요." : "Add any other concern."} />
                </div>
              )}
            </section>

            <div className="privacy-assurance">
              <span className="privacy-lock" aria-hidden="true">⌾</span>
              <div>
                <strong>{locale === "ko" ? "입력 정보는 리포트 제작에만 사용됩니다" : "Your details are used only for the report"}</strong>
                <label className="check">
                  <input type="checkbox" name="privacyRequired" required />
                  <span>{t.privacy}</span>
                </label>
                <Link className="legal-inline-link" href={`/${locale}/privacy`}>
                  {locale === "ko" ? "개인정보 처리 기준 자세히 보기" : "Read the privacy notice"}
                </Link>
              </div>
            </div>
            <div className="form-actions">
              <button className="primary-button" type="submit">{t.submit}</button>
              {error && <span className="error" role="alert">{error}</span>}
            </div>
          </form>
        </section>

        <section className="trust-section" id="trust" aria-labelledby="trust-title">
          <div className="section-heading">
            <p className="eyebrow">{locale === "ko" ? "결제·보관 안내" : "Payment and storage"}</p>
            <h2 id="trust-title">{locale === "ko" ? "결제부터 다시 보기까지 어렵지 않게" : "Simple from payment to review"}</h2>
          </div>
          <div className="trust-grid">
            {t.trust.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}
          </div>
        </section>

        <footer className="home-footer">
          <div><strong>{locale === "ko" ? "결 GYEOL" : "GYEOL"}</strong><p>{locale === "ko" ? "나의 성향과 관계, 올해의 흐름을 읽는 리딩" : "Readings for self, relationships, and the year ahead"}</p></div>
          <nav aria-label={locale === "ko" ? "법률 안내" : "Legal"}>
            <Link href={`/${locale}/terms`}>{locale === "ko" ? "이용조건" : "Terms"}</Link>
            <Link href={`/${locale}/privacy`}>{locale === "ko" ? "개인정보" : "Privacy"}</Link>
            <Link href={`/${locale}/orders`}>{locale === "ko" ? "구매 내역" : "Find a purchase"}</Link>
            <Link href={`/${locale}/support`}>{locale === "ko" ? "고객 문의" : "Support"}</Link>
          </nav>
          <small>{locale === "ko" ? "별루프 · 대표 박서준 · 사업자등록번호 482-12-03629 · 부산광역시 북구" : "Byeolloof · Busan, Republic of Korea"}</small>
        </footer>
      </main>
      <a className="mobile-purchase-bar" href="#products">
        <span>
          {pricing.campaignActive && (
            <small>{locale === "ko" ? "여름 이벤트" : "Summer event"}</small>
          )}
          {locale === "ko" ? "상세 리딩" : "Detailed reading"}{" "}
          <strong>{formatWon(pricing.prices.pro_30d, locale)}</strong>
        </span>
        <b>{locale === "ko" ? "선택하기" : "Choose"}</b>
      </a>
    </>
  );
}
