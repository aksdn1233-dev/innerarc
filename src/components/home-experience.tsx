"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { MeteorTrails, NightHorizon, SceneDivider } from "@/components/brand-visuals";
import { ReviewEvidenceSection } from "@/components/review-evidence-section";
import { captureConversionEvent } from "@/core/analytics";
import type { ProductPricingSnapshot } from "@/core/product-prices";
import type { PublicReview } from "@/core/reviews";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { AdminPageContent } from "@/server/admin-content";

type Props = {
  locale: Locale;
  dictionary: Dictionary;
  pricing: ProductPricingSnapshot;
  pageContent: AdminPageContent;
  /** Approved, still-consented reviews only. Empty is the normal, honest case. */
  reviews: readonly PublicReview[];
  /** Every published review, not just the shown few. Null when the table is unreachable. */
  reviewCount: number | null;
};

type ReadingProductId = "comprehensive" | "premium_pdf";
type FocusId = "work" | "relationships" | "health" | "growth" | "money";
type IntakeError = Readonly<{ field: "birthDate" | "privacy"; message: string }>;

const concernExamples: Record<Locale, Record<FocusId, string>> = {
  ko: {
    work: "예: 지금 회사를 계속 다니는 게 맞을까요, 이직 준비를 시작해야 할까요?",
    relationships: "예: 왜 비슷한 관계 갈등이 반복되는지 알고 싶어요.",
    health: "예: 생활 리듬에서 무엇부터 바꾸는 것이 좋을까요?",
    growth: "예: 요즘 계속 제자리인 것 같아요. 무엇부터 바꿔야 할까요?",
    money: "예: 큰 지출을 앞두고 무엇을 기준으로 판단해야 할까요?",
  },
  en: {
    work: "e.g. Should I stay in this role or begin preparing to move?",
    relationships: "e.g. Why do similar conflicts keep repeating in my relationships?",
    health: "e.g. What should I change first in my daily rhythm?",
    growth: "e.g. I feel stuck lately. What should I change first?",
    money: "e.g. What criteria should I use before a large expense?",
  },
};

const productCodeByReading = {
  comprehensive: "pro_30d",
  premium_pdf: "premium_pdf",
} as const;

const readingProducts = {
  ko: [
    {
      id: "comprehensive",
      name: "상세 리딩",
      description: "현재 가장 궁금한 한 영역을 중심으로 핵심 성향, 반복 패턴, 주의점과 실천 방향을 정리합니다.",
      badge: "한 영역을 선명하게",
      button: "상세 리딩 받기",
    },
    {
      id: "premium_pdf",
      name: "프리미엄 심층 리딩",
      description: "여러 영역을 함께 연결해 숨은 동기, 세 가지 가능 시나리오와 단계별 실행 기준까지 정리합니다.",
      badge: "여러 영역을 깊게",
      button: "심층 리딩 받기",
    },
  ],
  en: [
    {
      id: "comprehensive",
      name: "Detailed reading",
      description: "Focuses on the one area that matters most now, organizing your core tendencies, recurring patterns, cautions, and practical direction.",
      badge: "One area, made clear",
      button: "Get a detailed reading",
    },
    {
      id: "premium_pdf",
      name: "Premium in-depth reading",
      description: "Connects several areas to organize hidden motives, three possible scenarios, and step-by-step criteria for action.",
      badge: "A deeper connected view",
      button: "Get an in-depth reading",
    },
  ],
} as const;

const copy = {
  ko: {
    navLabel: "홈페이지 탐색",
    nav: [["#questions", "질문 고르기"], ["#preview", "리포트 예시"], ["#products", "가격"], ["#evidence", "후기"], ["#method", "리딩 방식"]],
    heroKicker: "사주명리와는 다른, 현실 선택 중심의 리딩",
    heroTitle: "왜 나는 같은 선택을 반복할까요?",
    heroBody: "타고난 성향과 반복되는 관계·일·돈의 패턴을 살펴보고, 올해 어떤 선택에 힘을 주어야 할지 정리해드립니다.",
    primary: "내 패턴 확인하기",
    heroNote: "생년월일 기반 · 1회 결제 · 자동 갱신 없음",
    freeCta: "먼저 무료로 확인",
    freeNote: "결제 없이 생년월일만으로 기본 리딩을 볼 수 있어요",
    entryEyebrow: "어떤 게 제일 걸리세요?",
    entryTitle: "요즘 마음에 걸리는 질문을 골라보세요",
    entryBody: "고른 질문이 리딩의 중심이 됩니다. 지금 정하지 않아도 나중에 바꿀 수 있어요.",
    entryQuestions: [
      ["relationships", "왜 늘 비슷한 사람에게 마음이 갈까요?", "관계"],
      ["work", "지금 이 일, 계속 가는 게 맞을까요?", "일·진로"],
      ["money", "돈 앞에서 나는 어떤 결정을 반복하나요?", "돈"],
      ["growth", "무엇이 나를 자꾸 멈춰 세우나요?", "성장"],
      ["health", "내 하루는 어디에서 무너지나요?", "건강·생활"],
    ],
    freeCardBadge: "무료",
    freeCardName: "기본 리딩",
    freeCardPrice: "0원",
    freeCardBody: "생년월일만으로 타고난 성향과 기본 수를 계산해 바로 보여드립니다. 결제도, 계정도 필요하지 않아요.",
    freeCardButton: "무료로 시작하기",
    sampleEyebrow: "리포트 구성 예시",
    sampleTitle: "내 일상에 연결되는 방식으로 정리합니다",
    sampleBody: "아래 문장은 실제 후기가 아닌 리포트 구성 예시입니다.",
    sampleCases: [
      ["성향", "혼자 해결하는 힘은 강하지만, 도움을 늦게 요청해 책임이 한꺼번에 몰릴 수 있습니다."],
      ["관계", "상대의 반응을 오래 확인하다가 표현 시기를 놓치는 패턴이 반복될 수 있습니다."],
      ["일·돈", "능력보다 역할의 경계가 불분명할 때 손해가 커지므로, 책임과 권한을 함께 정하는 것이 중요합니다."],
    ],
    methodTitle: "어떻게 리딩하나요?",
    methodBody: "입력한 생년월일의 수비학적 수치를 계산하고, 성향·관계·일·돈·올해의 흐름을 서로 연결해 해석합니다. 결과는 미래를 단정하는 예언이 아니라, 반복되는 패턴과 현실적인 선택 기준을 정리한 개인 리포트입니다.",
    methodPoints: ["생년월일 기반 계산", "질문 영역을 반영한 개인화", "결제 후 비회원 열람 가능"],
    productsTitle: "필요한 깊이만 고르세요",
    productsBody: "한 영역을 선명하게 볼지, 여러 영역을 깊게 연결할지에 따라 선택할 수 있습니다.",
    paymentFacts: "1회 결제 · 자동 결제 없음 · 비회원 열람 가능",
    paymentAccess: "결제 후 주문번호와 결제 휴대폰 번호로 다시 열람할 수 있습니다.",
    support: "문의하기",
    formTitle: "내 리딩을 준비할게요",
    formBody: "생년월일과 가장 궁금한 한 가지를 입력하면 선택한 영역을 중심으로 리포트를 구성합니다.",
    submit: "입력 완료하고 결제하러 가기",
    privacy: "입력 정보는 결제한 개인 리포트를 만들고 다시 열람할 수 있게 저장하는 데 사용됩니다.",
    trust: [
      ["회원가입 없음", "이름과 비밀번호를 만들 필요 없이 필요한 정보만 입력합니다."],
      ["결제 확인 후 제공", "실제로 승인된 주문에만 리포트가 열리며 취소되면 열람도 함께 종료됩니다."],
      ["언제든 다시 보기", "주문번호와 결제 휴대폰 번호로 같은 리포트를 다시 열 수 있습니다."],
      ["1회 결제", "구독 상품이 아니며 자동으로 다시 청구하지 않습니다."],
    ],
  },
  en: {
    navLabel: "Home navigation",
    nav: [["#questions", "Pick a question"], ["#preview", "Report examples"], ["#products", "Pricing"], ["#evidence", "Reviews"], ["#method", "Method"]],
    heroKicker: "A different kind of reading, centered on real-life choices",
    heroTitle: "Why do I keep making the same choices?",
    heroBody: "Explore your natural tendencies and recurring patterns in relationships, work, and money—then clarify where to place your energy this year.",
    primary: "See my patterns",
    heroNote: "Birth-date based · One-time payment · No auto-renewal",
    freeCta: "Try it free first",
    freeNote: "See a basic reading from your birth date alone — no payment",
    entryEyebrow: "What is on your mind?",
    entryTitle: "Pick the question that keeps coming back",
    entryBody: "Your choice becomes the centre of the reading. You can change it later.",
    entryQuestions: [
      ["relationships", "Why am I drawn to the same kind of person?", "Relationships"],
      ["work", "Is staying in this work still the right call?", "Work"],
      ["money", "What decision do I keep repeating about money?", "Money"],
      ["growth", "What keeps stopping me short?", "Growth"],
      ["health", "Where does my day fall apart?", "Daily life"],
    ],
    freeCardBadge: "Free",
    freeCardName: "Basic reading",
    freeCardPrice: "₩0",
    freeCardBody: "Your birth date alone calculates your core numbers and natural tendencies, shown immediately. No payment, no account.",
    freeCardButton: "Start free",
    sampleEyebrow: "Report format examples",
    sampleTitle: "Patterns connected to real, everyday choices",
    sampleBody: "These are report format examples, not customer testimonials.",
    sampleCases: [
      ["Tendencies", "You handle things independently, but asking for help too late can cause responsibility to pile up all at once."],
      ["Relationships", "Waiting too long to read the other person's response can make you miss the right moment to express yourself."],
      ["Work & money", "Unclear role boundaries can cost more than a lack of ability, so responsibility and authority need to be agreed together."],
    ],
    methodTitle: "How does the reading work?",
    methodBody: "We calculate numerological values from your birth date, then connect tendencies, relationships, work, money, and the year ahead. This is not a prediction that fixes your future. It is a personal report that organizes recurring patterns and practical criteria for your choices.",
    methodPoints: ["Birth-date based calculation", "Personalized around your chosen area", "Open after payment without an account"],
    productsTitle: "Choose only the depth you need",
    productsBody: "Choose between making one area clearer or connecting several areas in greater depth.",
    paymentFacts: "One-time payment · No recurring charge · No account required",
    paymentAccess: "Reopen your report with your order number and checkout phone number.",
    support: "Contact support",
    formTitle: "Let's prepare your reading",
    formBody: "Enter your birth date and the one thing you most want to understand. Your report will focus on the area you choose.",
    submit: "Continue to payment",
    privacy: "Your input is used to create, store, and reopen the personal report you purchase.",
    trust: [
      ["No account needed", "Enter only the information needed for the reading—no username or password."],
      ["Opens after payment", "Reports open only for verified payments and close if payment is cancelled."],
      ["Reopen any time", "Use your order number and checkout phone number to open the same report later."],
      ["One-time purchase", "This is not a subscription and there is no recurring charge."],
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

function isValidGregorianDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export function HomeExperience({ locale, dictionary: d, pricing, pageContent, reviews, reviewCount }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<ReadingProductId>("comprehensive");
  const [focusId, setFocusId] = useState<FocusId>("relationships");
  const [error, setError] = useState<IntakeError | null>(null);
  const [intakeVisible, setIntakeVisible] = useState(false);
  // The opening screen already carries the same action at thumb height. Showing the
  // sticky bar there would cover it, so the bar waits until the hero has scrolled away.
  const [heroVisible, setHeroVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const trackedRef = useRef(new Set<string>());
  const sampleRef = useRef<HTMLElement>(null);
  const productsRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLElement>(null);
  const content = pageContent[locale];
  const t = {
    ...copy[locale],
    heroKicker: content.heroKicker,
    heroTitle: content.heroTitle,
    heroBody: content.heroBody,
    primary: content.primaryCta,
  };
  const otherLocale = locale === "ko" ? "en" : "ko";
  const products = readingProducts[locale].map((product) => {
    const productCode = productCodeByReading[product.id];
    return {
      ...product,
      price: formatWon(pricing.prices[productCode], locale),
    };
  });

  useEffect(() => {
    if (!trackedRef.current.has("landing")) {
      trackedRef.current.add("landing");
      captureConversionEvent("landing_view", locale, {});
    }

    const sample = sampleRef.current;
    const productSection = productsRef.current;
    const form = formRef.current;
    const observers: IntersectionObserver[] = [];

    if (sample) {
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting || trackedRef.current.has("sample")) return;
        trackedRef.current.add("sample");
        captureConversionEvent("sample_section_view", locale, {});
      }, { threshold: 0.25 });
      observer.observe(sample);
      observers.push(observer);
    }

    if (productSection) {
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting || trackedRef.current.has("products")) return;
        trackedRef.current.add("products");
        captureConversionEvent("product_view", locale, { productCode: "pro_30d" });
        captureConversionEvent("product_view", locale, { productCode: "premium_pdf" });
      }, { threshold: 0.2 });
      observer.observe(productSection);
      observers.push(observer);
    }

    if (form) {
      const observer = new IntersectionObserver(([entry]) => {
        setIntakeVisible(Boolean(entry?.isIntersecting));
      }, { threshold: 0.05, rootMargin: "0px 0px -8% 0px" });
      observer.observe(form);
      observers.push(observer);
    }

    const hero = heroRef.current;
    if (hero) {
      const observer = new IntersectionObserver(([entry]) => {
        setHeroVisible(Boolean(entry?.isIntersecting));
      }, { threshold: 0.12 });
      observer.observe(hero);
      observers.push(observer);
    }

    return () => observers.forEach((observer) => observer.disconnect());
  }, [locale]);

  // The hero clip is fetched after first paint, so it never competes with the page for
  // the first bytes and never counts against the initial payload. If no clip is published
  // the load simply fails and the poster stays — which is the intended state until one is.
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      video.load();
      // Autoplay is allowed for a muted, inline video; a rejection is not an error worth
      // surfacing, it just leaves the poster showing.
      void video.play().catch(() => {});
    };

    // Safari has no requestIdleCallback, so a timeout stands in for it there.
    const canIdle = typeof window.requestIdleCallback === "function";
    const handle = canIdle
      ? window.requestIdleCallback(start, { timeout: 2_500 })
      : window.setTimeout(start, 1_200);
    return () => {
      cancelled = true;
      if (canIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, []);

  function trackFormStart() {
    if (trackedRef.current.has("form-start")) return;
    trackedRef.current.add("form-start");
    captureConversionEvent("form_start", locale, {});
  }

  function chooseProduct(id: ReadingProductId, location: "product_card" | "form") {
    setSelectedProduct(id);
    captureConversionEvent("product_select", locale, {
      productCode: productCodeByReading[id],
      location,
    });
    if (location === "product_card") {
      window.requestAnimationFrame(() => {
        document.getElementById("onboarding")?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  // A visitor who has not decided anything yet will not fill in a birth date, but they
  // will answer "which of these is bothering me". Answering that is the cheapest possible
  // first commitment, and it carries straight into the form as the reading's focus.
  function chooseQuestion(focus: FocusId) {
    setFocusId(focus);
    captureConversionEvent("form_start", locale, {});
    window.requestAnimationFrame(() => {
      document.getElementById("onboarding")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const birthDate = String(form.get("birthDate") ?? "").trim();
    if (!birthDate) {
      setError({ field: "birthDate", message: locale === "ko" ? "생년월일을 선택해 주세요." : "Choose your birth date." });
      return;
    }
    if (!isValidGregorianDate(birthDate)) {
      setError({ field: "birthDate", message: locale === "ko" ? "달력에서 올바른 날짜를 선택해 주세요." : "Choose a valid date from the calendar." });
      return;
    }
    if (form.get("privacyRequired") !== "on") {
      setError({ field: "privacy", message: locale === "ko" ? "개인정보 사용 안내를 확인해 주세요." : "Please review the privacy notice." });
      return;
    }

    const concern = String(form.get("concern") ?? "").trim();
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
    captureConversionEvent("form_complete", locale, { productCode: payload.productCode });
    window.sessionStorage.setItem("innerarc.checkoutDraft.v1", JSON.stringify(payload));
    window.location.assign(`/${locale}/plans?product=${payload.productCode}`);
  }

  return (
    <>
      <main className="shell home-shell" id="main-content" tabIndex={-1}>
        {/* Over the opening screen the header is chrome, not content: it goes transparent
            and hands its links to a panel, so nothing competes with the title. */}
        <header className="topbar home-topbar is-over-cinema">
          <Link className="brand" href={`/${locale}`}><strong>{locale === "ko" ? "결 GYEOL" : "GYEOL"}</strong><small>{d.brandTagline}</small></Link>
          <nav className="home-nav" aria-label={t.navLabel}>{t.nav.map(([href, label]) => <a href={href} key={href}>{label}</a>)}</nav>
          <div className="home-header-actions">
            <a className="header-start-link" href="#onboarding">{locale === "ko" ? "리딩 시작하기" : "Start reading"}</a>
            <Link className="locale-switch" href={`/${otherLocale}`}>{otherLocale === "ko" ? "한국어" : "English"}</Link>
          </div>
          <button
            aria-controls="home-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? (locale === "ko" ? "메뉴 닫기" : "Close menu") : (locale === "ko" ? "메뉴 열기" : "Open menu")}
            className="cinema-menu-button"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </header>

        <div className={menuOpen ? "cinema-menu is-open" : "cinema-menu"} id="home-menu" hidden={!menuOpen}>
          <button
            className="cinema-menu-close"
            onClick={() => setMenuOpen(false)}
            type="button"
          >
            {locale === "ko" ? "닫기" : "Close"}
          </button>
          <nav aria-label={t.navLabel}>
            {t.nav.map(([href, label]) => (
              <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
            <Link href={`/${locale}/profile`} onClick={() => setMenuOpen(false)}>{t.freeCardButton}</Link>
            <Link href={`/${locale}/orders`} onClick={() => setMenuOpen(false)}>{locale === "ko" ? "구매 내역" : "Find a purchase"}</Link>
            <Link href={`/${locale}/support`} onClick={() => setMenuOpen(false)}>{locale === "ko" ? "고객 문의" : "Support"}</Link>
            <Link href={`/${otherLocale}`} onClick={() => setMenuOpen(false)}>{otherLocale === "ko" ? "한국어" : "English"}</Link>
          </nav>
        </div>

        {/* A full-height opening screen rather than a band of text above more text: the
            art fills the viewport, the title carries it, and one action sits under the
            thumb. Everything explanatory has moved below the fold, where it belongs. */}
        <section className="cinema-hero" aria-labelledby="hero-title" ref={heroRef}>
          <NightHorizon className="cinema-hero-scene" />
          {/* 태율(太律), the numerology guide from the supplied character sheet.
              Decorative: the title beside it carries the meaning, so it is not announced
              again.

              This plays a looping clip of him when one exists at the paths below, and
              shows the still portrait as its poster until then — so dropping the file in
              is the whole installation, with no code change and no broken frame while it
              is missing. `preload="none"` keeps the clip out of the initial payload; the
              effect below starts it once the page is idle, and never when the visitor has
              asked for reduced motion. */}
          <video
            aria-hidden="true"
            className="cinema-hero-portrait"
            disablePictureInPicture
            loop
            muted
            playsInline
            poster="/images/taeyul-hero.jpg"
            preload="none"
            ref={heroVideoRef}
            tabIndex={-1}
          >
            <source src="/videos/taeyul-hero.webm" type="video/webm" />
            <source src="/videos/taeyul-hero.mp4" type="video/mp4" />
          </video>
          <MeteorTrails className="cinema-hero-meteors" />
          <div className="cinema-hero-veil" aria-hidden="true" />

          <div className="cinema-hero-copy">
            <p className="cinema-kicker">{t.heroKicker}</p>
            <h1 className="cinema-title" id="hero-title">{t.heroTitle}</h1>
            <p className="cinema-quote">{t.heroBody}</p>
          </div>

          <div className="cinema-hero-actions">
            <a
              className="cinema-cta"
              href="#onboarding"
              onClick={() => captureConversionEvent("primary_cta_click", locale, { location: "hero" })}
            >
              {t.primary}
            </a>
            {/* The free calculation at /profile existed but nothing on this page linked to
                it, so a visitor who was not ready to pay had no next step but to leave. */}
            <Link
              className="cinema-cta-secondary"
              href={`/${locale}/profile`}
              onClick={() => captureConversionEvent("primary_cta_click", locale, { location: "hero_free" })}
            >
              {t.freeCta}
            </Link>
            <p className="cinema-note">{t.heroNote}</p>
          </div>
        </section>

        <section className="entry-questions" id="questions" aria-labelledby="questions-title">
          <div className="section-heading">
            <p className="eyebrow">{t.entryEyebrow}</p>
            <h2 id="questions-title">{t.entryTitle}</h2>
            <p>{t.entryBody}</p>
          </div>
          <ul className="entry-question-grid">
            {t.entryQuestions.map(([focus, question, label]) => (
              <li key={focus}>
                <button
                  type="button"
                  className={focusId === focus ? "entry-question is-chosen" : "entry-question"}
                  aria-pressed={focusId === focus}
                  onClick={() => chooseQuestion(focus as FocusId)}
                >
                  <small>{label}</small>
                  <strong>{question}</strong>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="report-preview" id="preview" aria-labelledby="preview-title" ref={sampleRef}>
          <div className="section-heading">
            <p className="eyebrow">{t.sampleEyebrow}</p>
            <h2 id="preview-title">{t.sampleTitle}</h2>
            <p className="report-preview-disclosure">{t.sampleBody}</p>
          </div>
          <div className="preview-case-grid">
            {t.sampleCases.map(([label, body]) => (
              <article className="preview-reading" key={label}><small>{t.sampleEyebrow} · {label}</small><p>{body}</p></article>
            ))}
          </div>
        </section>

        <section className="pass-summary" id="products" aria-labelledby="products-title" ref={productsRef}>
          <div className="product-section-heading">
            <p className="eyebrow">{locale === "ko" ? "두 가지 리딩" : "Two reading depths"}</p>
            <h2 id="products-title">{t.productsTitle}</h2>
            <p>{t.productsBody}</p>
          </div>
          <div className="editorial-product-grid has-free-tier">
            {/* Naming the free reading as a tier, beside the paid ones and with its price
                written as a price, is what makes the paid tiers legible as a step up
                rather than as the only thing on offer. */}
            <article className="editorial-product is-free">
              <small>{t.freeCardBadge}</small>
              <h3>{t.freeCardName}</h3>
              <div className="campaign-price-row"><strong>{t.freeCardPrice}</strong></div>
              <p>{t.freeCardBody}</p>
              <Link href={`/${locale}/profile`} onClick={() => captureConversionEvent("primary_cta_click", locale, { location: "product_free" })}>{t.freeCardButton}</Link>
            </article>
            {products.map((product) => (
              <article className={product.id === "comprehensive" ? "editorial-product is-featured" : "editorial-product"} key={product.id}>
                <small>{product.badge}</small>
                <h3>{product.name}</h3>
                <div className="campaign-price-row">
                  <strong>{product.price}</strong>
                </div>
                <p>{product.description}</p>
                <button type="button" onClick={() => chooseProduct(product.id, "product_card")}>{product.button} · {product.price}</button>
              </article>
            ))}
          </div>
          <p className="payment-reassurance"><strong>{t.paymentFacts}</strong><br />{t.paymentAccess} <Link href={`/${locale}/support`}>{t.support}</Link></p>
        </section>

        <ReviewEvidenceSection locale={locale} reviews={reviews} reviewCount={reviewCount} />

        {/* How the numbers are derived is reassurance, not a hook: it answers a doubt the
            visitor only has once they are already interested, so it sits after the offer
            and the reviews rather than in front of them. */}
        <section className="pattern-fields reading-method" id="method" aria-labelledby="method-title">
          <SceneDivider className="method-divider" />
          <div className="section-heading">
            <p className="eyebrow">{locale === "ko" ? "계산과 해석" : "Calculation and interpretation"}</p>
            <h2 id="method-title">{t.methodTitle}</h2>
            <p className="reading-method-body">{t.methodBody}</p>
          </div>
          <div className="reading-method-points" aria-label={locale === "ko" ? "리딩 방식 요약" : "Reading method summary"}>
            {t.methodPoints.map((point) => <span key={point}>{point}</span>)}
          </div>
        </section>

        <section className="form-section home-form-section" id="onboarding" aria-labelledby="onboarding-title" ref={formRef}>
          <header className="form-section-heading">
            <p className="eyebrow">{locale === "ko" ? "개인 리딩 입력" : "Personal reading details"}</p>
            <h2 id="onboarding-title">{t.formTitle}</h2>
            <p>{t.formBody}</p>
          </header>
          <form className="form-card" onSubmit={submit} onFocusCapture={trackFormStart} noValidate>
            <div className="intake-progress" aria-label={locale === "ko" ? "신청 단계" : "Application steps"}>
              <span className="is-current">{locale === "ko" ? "상품 선택" : "Choose"}</span><span>{locale === "ko" ? "정보 입력" : "Details"}</span><span>{locale === "ko" ? "결제 확인" : "Payment"}</span>
            </div>
            <fieldset className="product-picker field">
              <legend>{locale === "ko" ? "1. 리딩 상품 (필수)" : "1. Reading product (Required)"}</legend>
              <div className="product-picker-grid">
                {products.map((product) => (
                  <label className="product-choice" key={product.id}>
                    <input checked={selectedProduct === product.id} name="readingProduct" onChange={() => chooseProduct(product.id, "form")} type="radio" value={product.id} />
                    <span><small>{product.badge}</small><strong>{product.name}</strong><b>{product.price}</b><em>{product.description}</em></span>
                  </label>
                ))}
              </div>
            </fieldset>

            <section className="intake-panel" aria-labelledby="intake-details-title">
              <header className="intake-panel-header"><div><h3 id="intake-details-title">{locale === "ko" ? "리딩에 필요한 정보" : "Details for your reading"}</h3><p>{locale === "ko" ? "필수와 선택 항목을 구분해 필요한 정보만 받습니다." : "Required and optional fields are clearly separated."}</p></div></header>
              <div className="field field-premium">
                <label htmlFor="birthDate">{locale === "ko" ? "2. 생년월일 (필수 · 양력)" : "2. Birth date (Required · Gregorian)"}</label>
                <input id="birthDate" name="birthDate" type="date" required aria-invalid={error?.field === "birthDate"} aria-describedby="birthDate-help birthDate-error" />
                <small id="birthDate-help">{locale === "ko" ? "예: 1994년 11월 4일 → 1994-11-04 · 달력에서 선택해 주세요." : "Example: November 4, 1994 → 1994-11-04 · Choose from the calendar."}</small>
                {error?.field === "birthDate" && <span className="field-error" id="birthDate-error" role="alert">{error.message}</span>}
              </div>
              <fieldset className="field simple-topic-picker">
                <legend>{locale === "ko" ? "3. 가장 궁금한 영역 (필수)" : "3. Main area (Required)"}</legend>
                <div className="choice-row">{d.interests.slice(0, 5).map((option) => (
                  <label className="choice" key={option.value}><input checked={focusId === option.value} name="interest" onChange={() => setFocusId(option.value as FocusId)} type="radio" value={option.value} /><span>{option.label}</span></label>
                ))}</div>
              </fieldset>
              <div className="field field-premium">
                <label htmlFor="name">{locale === "ko" ? "이름 또는 부를 이름 (선택)" : "Name shown on the report (Optional)"}</label>
                <input id="name" name="name" type="text" maxLength={200} autoComplete="name" placeholder={locale === "ko" ? "입력하지 않아도 리딩할 수 있어요" : "You can leave this blank"} />
              </div>
              <div className="field field-premium">
                <label htmlFor="concern">{locale === "ko" ? "가장 궁금한 한 가지 (선택)" : "The one thing you most want to understand (Optional)"}</label>
                <textarea id="concern" maxLength={1_000} name="concern" placeholder={concernExamples[locale][focusId]} />
                <small>{locale === "ko" ? "비워두면 선택한 영역과 생년월일을 중심으로 구성합니다." : "Leave blank for a report centered on your birth date and chosen area."}</small>
              </div>
              {selectedProduct === "premium_pdf" && (
                <div className="field field-premium"><label htmlFor="reportFocus">{locale === "ko" ? "함께 연결해서 볼 내용 (선택)" : "Anything else to connect (Optional)"}</label><textarea id="reportFocus" name="reportFocus" maxLength={1_000} placeholder={locale === "ko" ? "예: 올해의 연애 흐름과 이직 시기를 함께 보고 싶어요" : "e.g. Connect relationship patterns with a career change"} /></div>
              )}
            </section>

            <div className="privacy-assurance">
              <span className="privacy-lock" aria-hidden="true">✓</span>
              <div>
                <strong>{locale === "ko" ? "입력 정보는 개인 리포트 제작에만 사용합니다" : "Your details are used only for your personal report"}</strong>
                <label className="check"><input type="checkbox" name="privacyRequired" required aria-invalid={error?.field === "privacy"} /><span>{t.privacy}</span></label>
                {error?.field === "privacy" && <span className="field-error" role="alert">{error.message}</span>}
                <Link className="legal-inline-link" href={`/${locale}/privacy`}>{locale === "ko" ? "개인정보 처리 기준 자세히 보기" : "Read the privacy notice"}</Link>
              </div>
            </div>
            <div className="form-actions"><button className="primary-button" type="submit">{t.submit}</button></div>
          </form>
        </section>

        <section className="trust-section" id="trust" aria-labelledby="trust-title">
          <div className="section-heading"><p className="eyebrow">{locale === "ko" ? "결제·보관 안내" : "Payment and access"}</p><h2 id="trust-title">{locale === "ko" ? "결제부터 다시 보기까지 어렵지 않게" : "Simple from payment to reopening"}</h2></div>
          <div className="trust-grid">{t.trust.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div>
        </section>

        <footer className="home-footer">
          <div><strong>{locale === "ko" ? "결 GYEOL" : "GYEOL"}</strong><p>{locale === "ko" ? "나의 성향과 관계, 올해의 흐름을 읽는 리딩" : "Readings for your tendencies, relationships, and year ahead"}</p></div>
          <nav aria-label={locale === "ko" ? "법률 안내" : "Legal"}><Link href={`/${locale}/terms`}>{locale === "ko" ? "이용조건" : "Terms"}</Link><Link href={`/${locale}/privacy`}>{locale === "ko" ? "개인정보" : "Privacy"}</Link><Link href={`/${locale}/orders`}>{locale === "ko" ? "구매 내역" : "Find a purchase"}</Link><Link href={`/${locale}/support`}>{locale === "ko" ? "고객 문의" : "Support"}</Link></nav>
          <small>{locale === "ko" ? "별루프 · 대표 박서준 · 사업자등록번호 482-12-03629 · 부산광역시 북구" : "Byeolloof · Busan, Republic of Korea"}</small>
        </footer>
      </main>
      {!intakeVisible && !heroVisible && (
        <a className="mobile-purchase-bar" href="#onboarding" onClick={() => {
          captureConversionEvent("primary_cta_click", locale, { location: "sticky" });
          captureConversionEvent("product_select", locale, { productCode: "pro_30d", location: "product_card" });
        }}>
          <span><small>{locale === "ko" ? "상세 리딩" : "Detailed reading"}</small><strong>{formatWon(pricing.prices.pro_30d, locale)}</strong></span>
          <b>{locale === "ko" ? "리딩 받기" : "Get reading"}</b>
        </a>
      )}
    </>
  );
}
