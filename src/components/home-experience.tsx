"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { MeteorTrails, NightHorizon, SceneDivider } from "@/components/brand-visuals";
import { ReviewEvidenceSection } from "@/components/review-evidence-section";
import { captureConversionEvent } from "@/core/analytics";
import { OFFICIAL_NAVER_BLOG_URL } from "@/core/brand-links";
import type { ProductPricingSnapshot } from "@/core/product-prices";
import type { PublicReview } from "@/core/reviews";
import { MIN_BIRTH_DATE, currentMaxBirthDate, isAcceptedBirthDate } from "@/core/birth-range";
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
  /**
   * The home page renders the opening screen alone — film, one line, two buttons, and
   * nothing under it to scroll to. `/{locale}/reading` renders the same component with
   * this set, which is where the questions, samples, prices, reviews, method and intake
   * form live.
   */
  showEverything?: boolean;
};

type ReadingProductId = "comprehensive" | "premium_pdf";
type FocusId = "work" | "relationships" | "health" | "growth" | "money";
type IntakeError = Readonly<{ field: "birthDate" | "privacy" | "giftConsent"; message: string }>;

const CAMPAIGN_DISMISS_KEY = "gyeol.campaign.one-week-extension-1500.dismissed.v1";

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
    heroHook: "관계·일·돈에서 반복되는 선택의 이유를 확인하세요",
    freeCta: "무료 패턴 보기",
    sajuHubCta: "사주 서비스로 이동",
    sajuTitle: "사주도 무료로 세워드립니다",
    sajuBody:
      "생년월일과 시각으로 사주 네 기둥과 십신, 오행을 계산해 보여드립니다. 절기와 진태양시까지 보정한 계산 근거를 전부 공개하며, 여기까지는 결제 없이 보실 수 있습니다.",
    sajuCta: "내 사주 원국 보기",
    freeNote: "결제 없이 생년월일만으로 기본 리딩을 볼 수 있어요",
    entryEyebrow: "어떤 게 제일 걸리세요?",
    entryTitle: "요즘 마음에 걸리는 질문을 골라보세요",
    entryBody: "고른 질문이 리딩의 중심이 됩니다.",
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
    freeCardBody: "생년월일만으로 바로 확인. 결제도, 계정도 없이.",
    freeCardButton: "무료로 시작하기",
    sampleEyebrow: "리포트 구성 예시",
    sampleTitle: "내 일상에 연결되는 방식으로 정리합니다",
    sampleBody: "실제 후기가 아닌 리포트 구성 예시입니다.",
    sampleCases: [
      ["성향", "혼자 해결하는 힘은 강하지만, 도움을 늦게 요청해 책임이 한꺼번에 몰릴 수 있습니다."],
      ["관계", "상대의 반응을 오래 확인하다가 표현 시기를 놓치는 패턴이 반복될 수 있습니다."],
      ["일·돈", "능력보다 역할의 경계가 불분명할 때 손해가 커지므로, 책임과 권한을 함께 정하는 것이 중요합니다."],
    ],
    methodTitle: "어떻게 리딩하나요?",
    methodBody: "입력한 생년월일의 수비학적 수치를 계산하고, 성향·관계·일·돈·올해의 흐름을 서로 연결해 해석합니다. 결과는 미래를 단정하는 예언이 아니라, 반복되는 패턴과 현실적인 선택 기준을 정리한 개인 리포트입니다.",
    methodPoints: ["생년월일 기반 계산", "질문 영역을 반영한 개인화", "결제 후 비회원 열람 가능"],
    productsTitle: "필요한 깊이만 고르세요",
    productsBody: "한 영역만 볼지, 여러 영역을 연결해 볼지.",
    paymentFacts: "1회 결제 · 자동 결제 없음 · 비회원 열람 가능",
    paymentAccess: "결제 후 주문번호와 결제 휴대폰 번호로 다시 열람할 수 있습니다.",
    support: "문의하기",
    formTitle: "내 리딩을 준비할게요",
    formBody: "생년월일과 궁금한 한 가지면 됩니다.",
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
    heroHook: "See why the same choices repeat in relationships, work, and money",
    freeCta: "View free pattern",
    sajuHubCta: "Open Saju services",
    sajuTitle: "Your Four Pillars chart, also free",
    sajuBody:
      "A birth date and time give four pillars, the ten gods, and the balance of the five phases — corrected for the solar term and for true solar time, with every step of the derivation shown. All of that is free.",
    sajuCta: "Draw my chart",
    freeNote: "See a basic reading from your birth date alone — no payment",
    entryEyebrow: "What is on your mind?",
    entryTitle: "Pick the question that keeps coming back",
    entryBody: "Your choice becomes the centre of the reading.",
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
    freeCardBody: "Your birth date alone, shown immediately. No payment, no account.",
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
    productsBody: "One area made clear, or several connected in depth.",
    paymentFacts: "One-time payment · No recurring charge · No account required",
    paymentAccess: "Reopen your report with your order number and checkout phone number.",
    support: "Contact support",
    formTitle: "Let's prepare your reading",
    formBody: "Your birth date and one question is all it takes.",
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

export function HomeExperience({ locale, dictionary: d, pricing, pageContent, reviews, reviewCount, showEverything = false }: Props) {
  // Bounded here rather than in the module so a long-lived tab still refuses tomorrow.
  const maxBirthDate = currentMaxBirthDate();
  const [selectedProduct, setSelectedProduct] = useState<ReadingProductId>("comprehensive");
  const [focusId, setFocusId] = useState<FocusId>("relationships");
  const [error, setError] = useState<IntakeError | null>(null);
  const [intakeVisible, setIntakeVisible] = useState(false);
  // The opening screen already carries the same action at thumb height. Showing the
  // sticky bar there would cover it, so the bar waits until the hero has scrolled away.
  const [heroVisible, setHeroVisible] = useState(true);
  // Pressing the primary action opens the intake over the film, in place. It is not a
  // page to scroll to and not a place to navigate to — the character stays on screen.
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [intakeStep, setIntakeStep] = useState<1 | 2>(1);
  const [gender, setGender] = useState<"female" | "male" | "unstated">("unstated");
  const [readingFor, setReadingFor] = useState<"self" | "gift">("self");
  const [campaignOpen, setCampaignOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const heroAudioRef = useRef<HTMLAudioElement>(null);
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
      regularPrice: formatWon(pricing.regularPrices[productCode], locale),
    };
  });

  const campaignEndLabel = pricing.campaign
    ? new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Seoul",
      }).format(new Date(pricing.campaign.endsAt))
    : "";

  useEffect(() => {
    if (showEverything || !pricing.campaign) return;
    const frame = window.requestAnimationFrame(() => {
      try {
        setCampaignOpen(window.sessionStorage.getItem(CAMPAIGN_DISMISS_KEY) !== "1");
      } catch {
        setCampaignOpen(false);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pricing.campaign, showEverything]);

  function closeCampaign() {
    setCampaignOpen(false);
    try { window.sessionStorage.setItem(CAMPAIGN_DISMISS_KEY, "1"); } catch { /* session-only fallback */ }
  }

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
    const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIOS) {
      void heroAudioRef.current?.play().catch(() => {});
      return;
    }
    video.muted = false;
    void video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => {});
    });
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
    if (!isValidGregorianDate(birthDate) || !isAcceptedBirthDate(birthDate)) {
      setError({ field: "birthDate", message: locale === "ko" ? "달력에서 올바른 날짜를 선택해 주세요." : "Choose a valid date from the calendar." });
      return;
    }
    if (form.get("privacyRequired") !== "on") {
      setError({ field: "privacy", message: locale === "ko" ? "개인정보 사용 안내를 확인해 주세요." : "Please review the privacy notice." });
      return;
    }
    if (readingFor === "gift" && form.get("giftConsent") !== "on") {
      setError({
        field: "giftConsent",
        message: locale === "ko"
          ? "당사자에게 정보 입력과 결과 전달 동의를 받았는지 확인해 주세요."
          : "Confirm that the recipient agreed to the use of their details and delivery of the result.",
      });
      return;
    }

    const concern = String(form.get("concern") ?? "").trim();
    const reportFocus = String(form.get("reportFocus") ?? "").trim();
    const companionBirthDate = String(form.get("companionBirthDate") ?? "").trim();
    if (companionBirthDate && !isAcceptedBirthDate(companionBirthDate)) {
      setError({ field: "birthDate", message: locale === "ko" ? "동반자 생년월일을 1100~2026년의 올바른 날짜로 입력해 주세요." : "Enter a valid companion date from 1100 through 2026." });
      return;
    }
    const payload = {
      version: 1,
      locale,
      productCode: productCodeByReading[selectedProduct],
      birthDate,
      birthTime: String(form.get("birthTime") ?? "").trim() || undefined,
      name: String(form.get("name") ?? "").trim(),
      focusId: String(form.get("interest") ?? "relationships"),
      concern: [concern, reportFocus].filter(Boolean).join(" / ").slice(0, 2_000),
      questions: [concern, reportFocus].filter(Boolean).slice(0, 2),
      companion: companionBirthDate ? {
        name: String(form.get("companionName") ?? "").trim(),
        birthDate: companionBirthDate,
        birthTime: String(form.get("companionBirthTime") ?? "").trim() || undefined,
        gender: String(form.get("companionGender") ?? "unstated"),
        relationshipType: String(form.get("relationshipType") ?? "romance"),
      } : undefined,
      gender,
      createdAt: new Date().toISOString(),
    };
    captureConversionEvent("form_complete", locale, { productCode: payload.productCode });
    window.sessionStorage.setItem("innerarc.checkoutDraft.v1", JSON.stringify(payload));
    window.location.assign(`/${locale}/plans?product=${payload.productCode}`);
  }

  return (
    <>
      {campaignOpen && pricing.campaign && (
        <div className="campaign-modal-backdrop" role="presentation" onKeyDown={(event) => {
          if (event.key === "Escape") closeCampaign();
        }} onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeCampaign();
        }}>
          <section aria-labelledby="campaign-modal-title" aria-modal="true" className="campaign-modal" role="dialog">
            <button autoFocus aria-label={locale === "ko" ? "팝업 닫기" : "Close"} className="campaign-modal-close" onClick={closeCampaign} type="button">×</button>
            <p className="eyebrow">ONE WEEK EXTENSION</p>
            <h2 id="campaign-modal-title">{locale === "ko" ? "정상가 최대 79,000원, 지금은 1,500원" : "Regular price up to ₩79,000, now ₩1,500"}</h2>
            <p>{locale === "ko"
              ? `요청이 많아 할인 기간을 단 일주일 연장했습니다. 모든 디지털 리딩은 ${campaignEndLabel}까지 1회 1,500원입니다.`
              : `The discount has been extended for one week. Every digital reading is ₩1,500 until ${campaignEndLabel} KST.`}</p>
            <div className="campaign-prize-callout">
              <strong>{locale === "ko" ? "후기·공유 이벤트 진행 중" : "Review & share event"}</strong>
              <span>{locale === "ko" ? "후기 작성자 중 1명을 추첨해 신세계상품권 15만원 상당 제공" : "One reviewer will be drawn for a Shinsegae gift certificate worth ₩150,000"}</span>
            </div>
            <div className="campaign-modal-actions">
              <Link className="primary-button" href={`/${locale}/reading`} prefetch={false} onClick={closeCampaign}>{locale === "ko" ? "1,500원 리딩 보기" : "See ₩1,500 readings"}</Link>
              <Link className="secondary-button" href={`/${locale}/events#review-event`} prefetch={false} onClick={closeCampaign}>{locale === "ko" ? "후기 이벤트 보기" : "See review event"}</Link>
            </div>
            <small>{locale === "ko" ? "액세서리 제외 · 친구 초대 쿠폰과 중복 적용 불가 · 상세 조건은 이벤트 페이지에서 확인" : "Accessories excluded · referral coupons do not stack · see event terms for details"}</small>
          </section>
        </div>
      )}
      <main className="shell home-shell" id="main-content" tabIndex={-1}>
        {/* Over the opening screen the header is chrome, not content: it goes transparent
            and hands its links to a panel, so nothing competes with the title. */}
        <header className="topbar home-topbar is-over-cinema">
          <Link className="brand" href={`/${locale}`}><strong>{locale === "ko" ? "결 GYEOL" : "GYEOL"}</strong><small>{d.brandTagline}</small></Link>
          <nav className="home-nav" aria-label={t.navLabel}>{t.nav.map(([href, label]) => <a href={href} key={href}>{label}</a>)}</nav>
          <div className="home-header-actions">
            <a className="header-start-link" href="#onboarding">{locale === "ko" ? "리딩 시작하기" : "Start reading"}</a>
            <Link className="locale-switch" href={`/${otherLocale}`}>{otherLocale === "ko" ? "한국어" : "English"}</Link>
            <Link className="locale-switch" href="/ja">日本語</Link>
          </div>
        </header>


        {/* A full-height opening screen rather than a band of text above more text: the
            art fills the viewport, the title carries it, and one action sits under the
            thumb. Everything explanatory has moved below the fold, where it belongs. */}
        <section className="cinema-hero" aria-labelledby="hero-title" ref={heroRef}>
          <NightHorizon className="cinema-hero-scene" />
          {/* 태율(太律), the numerology guide from the supplied character sheet.
              Decorative: the title beside it carries the meaning, so it is not announced
              again.

              A seven-second loop of him, watermark removed and cross-faded at the seam so
              it repeats without a cut. The poster is the clip's own first frame, so the
              still and the moving picture are the same image and nothing jumps when
              playback starts. `preload="none"` keeps it out of the initial payload; the
              effect below starts it once the page is idle, and never when the visitor has
              asked for reduced motion. */}
          <img
            alt=""
            aria-hidden="true"
            className="cinema-hero-portrait inline-video-fallback"
            fetchPriority="high"
            loading="eager"
            src="/videos/taeyul-hero-ios-mini.webp?v=20260815-mini1"
          />
          <video
            {...{ "webkit-playsinline": "true", "x-webkit-airplay": "deny" }}
            aria-hidden="true"
            className="cinema-hero-portrait inline-video-source"
            controls={false}
            controlsList="nofullscreen noremoteplayback"
            disablePictureInPicture
            disableRemotePlayback
            loop
            muted
            onLoadedMetadata={(event) => {
              const video = event.currentTarget;
              video.setAttribute("playsinline", "");
              video.setAttribute("webkit-playsinline", "");
              video.controls = false;
              video.addEventListener("webkitbeginfullscreen", () => {
                (video as HTMLVideoElement & { webkitExitFullscreen?: () => void })
                  .webkitExitFullscreen?.();
              }, { once: true });
            }}
            playsInline
            poster="/images/taeyul-hero.jpg"
            preload="auto"
            ref={heroVideoRef}
            tabIndex={-1}
          >
            <source src="/videos/taeyul-hero.mp4?v=20260815-fluid1" type="video/mp4" />
          </video>
          <audio autoPlay className="inline-video-audio" loop preload="auto" ref={heroAudioRef}>
            <source src="/videos/taeyul-hero-audio.m4a?v=20260810-ios1" type="audio/mp4" />
          </audio>
          <MeteorTrails className="cinema-hero-meteors" />
          <div className="cinema-hero-veil" aria-hidden="true" />

          {/* Nothing competes with him on the first screen. The heading still exists —
              a page needs one, and a screen reader has nothing to announce without it —
              but it is read, not displayed, and the words themselves reappear in full at
              the top of the page below. */}
          <h1 className="visually-hidden" id="hero-title">{t.heroTitle}</h1>

          {intakeOpen && (
            <div className="hero-intake" role="dialog" aria-modal="true" aria-label={t.formTitle}>
              <form className="hero-intake-panel" onSubmit={submit} noValidate>
                <button
                  aria-label={locale === "ko" ? "닫기" : "Close"}
                  className="hero-intake-close"
                  onClick={() => { setIntakeOpen(false); setIntakeStep(1); }}
                  type="button"
                >
                  ×
                </button>

                <p className="hero-intake-step">{intakeStep} / 2</p>

                <div hidden={intakeStep !== 1}>
                  <h2>{locale === "ko" ? "먼저, 당신을 알려주세요" : "First, tell it who you are"}</h2>

                  <label htmlFor="hero-birthDate">{locale === "ko" ? "생년월일 (양력)" : "Birth date"}</label>
                  <input id="hero-birthDate" name="birthDate" type="date" max={maxBirthDate} min={MIN_BIRTH_DATE} required />
                  <label htmlFor="hero-birthTime">{locale === "ko" ? "출생 시각 (선택)" : "Birth time (optional)"}</label>
                  <input id="hero-birthTime" name="birthTime" type="time" />
                  {error?.field === "birthDate" && <span className="field-error" role="alert">{error.message}</span>}

                  <span className="hero-intake-label">{locale === "ko" ? "성별" : "Gender"}</span>
                  <div className="hero-intake-choices">
                    {([["female", locale === "ko" ? "여성" : "Female"],
                       ["male", locale === "ko" ? "남성" : "Male"],
                       ["unstated", locale === "ko" ? "밝히지 않음" : "Prefer not to say"]] as const).map(([value, label]) => (
                      <button
                        aria-pressed={gender === value}
                        className={gender === value ? "is-chosen" : undefined}
                        key={value}
                        onClick={() => setGender(value)}
                        type="button"
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <label htmlFor="hero-name">{locale === "ko" ? "이름 (선택)" : "Name (optional)"}</label>
                  <input id="hero-name" name="name" type="text" maxLength={200} autoComplete="name" />

                  <button className="cinema-cta" onClick={() => setIntakeStep(2)} type="button">
                    {locale === "ko" ? "다음으로" : "Next"}
                  </button>
                </div>

                <div hidden={intakeStep !== 2}>
                  <h2>{locale === "ko" ? "무엇이 가장 궁금하세요?" : "What do you most want to know?"}</h2>

                  <div className="hero-intake-choices is-wrap">
                    {d.interests.slice(0, 5).map((option) => (
                      <label className={focusId === option.value ? "is-chosen" : undefined} key={option.value}>
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

                  <label htmlFor="hero-concern">{locale === "ko" ? "궁금한 한 가지 (선택)" : "The one thing (optional)"}</label>
                  <textarea id="hero-concern" name="concern" maxLength={1_000} placeholder={concernExamples[locale][focusId]} />

                  <label className="check">
                    <input name="privacyRequired" required type="checkbox" />
                    <span>{t.privacy}</span>
                  </label>
                  {error?.field === "privacy" && <span className="field-error" role="alert">{error.message}</span>}

                  <button className="cinema-cta" type="submit">{t.submit}</button>
                  <button className="hero-intake-back" onClick={() => setIntakeStep(1)} type="button">
                    {locale === "ko" ? "뒤로" : "Back"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="cinema-hero-actions">
            {showEverything ? (
              <>
                <p className="cinema-hook">{t.heroHook}</p>
                <a
                  className="cinema-cta"
                  href="#onboarding"
                  onClick={() => captureConversionEvent("primary_cta_click", locale, { location: "hero" })}
                >
                  {t.primary}
                </a>
              </>
            ) : null}
            {/* Numerology has its own named menu. `/profile` remains a compatible historical
                route, while new visitors enter through the product-shaped URL. */}
            <Link
              className="cinema-cta-secondary cinema-cta-free"
              href={`/${locale}/numerology`}
              onClick={() => captureConversionEvent("primary_cta_click", locale, { location: "hero_free" })}
            >
              <span>{t.freeCta}</span>
            </Link>
            <Link
              className="cinema-cta-secondary"
              href={`/${locale}/fortune`}
              onClick={() => captureConversionEvent("primary_cta_click", locale, { location: "saju_crosslink" })}
            >
              {t.sajuHubCta}
            </Link>
          </div>
        </section>

        {/* The opening screen is the whole home page: the film and two route buttons.
            Everything that used to sit under it — the questions, the samples, the prices,
            the reviews, the method, the intake form — now lives at /{locale}/reading, so
            scrolling the home page finds nothing, which is the point. */}
        {showEverything && (
          <>
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
              <Link href={`/${locale}/numerology`} onClick={() => captureConversionEvent("primary_cta_click", locale, { location: "product_free" })}>{t.freeCardButton}</Link>
            </article>
            {products.map((product) => (
              <article className={product.id === "comprehensive" ? "editorial-product is-featured" : "editorial-product"} key={product.id}>
                <small>{product.badge}</small>
                <h3>{product.name}</h3>
                <div className="campaign-price-row">
                  {pricing.campaign && <del>{product.regularPrice}</del>}
                  <strong>{product.price}</strong>
                  {pricing.campaign && <span>{locale === "ko" ? "1주일 연장 할인가" : "One-week extension"}</span>}
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
              <fieldset className="field reading-recipient-picker">
                <legend>{locale === "ko" ? "누구를 위한 리딩인가요?" : "Who is this reading for?"}</legend>
                <div className="choice-row">
                  <label className="choice"><input checked={readingFor === "self"} name="readingFor" onChange={() => setReadingFor("self")} type="radio" value="self" /><span>{locale === "ko" ? "나를 위한 리딩" : "For me"}</span></label>
                  <label className="choice"><input checked={readingFor === "gift"} name="readingFor" onChange={() => setReadingFor("gift")} type="radio" value="gift" /><span>{locale === "ko" ? "다른 사람을 위한 선물 리딩" : "A gift for someone else"}</span></label>
                </div>
                {readingFor === "gift" && (
                  <label className="check gift-intake-consent">
                    <input aria-invalid={error?.field === "giftConsent"} name="giftConsent" required type="checkbox" />
                    <span>{locale === "ko" ? "당사자에게 생년월일 등 정보를 입력하고 완성된 결과를 전달할 동의를 받았습니다." : "The recipient agreed to the use of their birth details and to receive the completed result."}</span>
                  </label>
                )}
                {error?.field === "giftConsent" && <span className="field-error" role="alert">{error.message}</span>}
              </fieldset>
              <div className="field field-premium">
                <label htmlFor="birthDate">{locale === "ko" ? "2. 생년월일 (필수 · 양력)" : "2. Birth date (Required · Gregorian)"}</label>
                <input id="birthDate" name="birthDate" type="date" max={maxBirthDate} min={MIN_BIRTH_DATE} required aria-invalid={error?.field === "birthDate"} aria-describedby="birthDate-help birthDate-error" />
                <label htmlFor="birthTime">{locale === "ko" ? "출생 시각 (선택)" : "Birth time (optional)"}</label>
                <input id="birthTime" name="birthTime" type="time" />
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
                <>
                  <div className="field field-premium"><label htmlFor="reportFocus">{locale === "ko" ? "두 번째 개인 질문 (선택)" : "Second personal question (optional)"}</label><textarea id="reportFocus" name="reportFocus" maxLength={1_000} placeholder={locale === "ko" ? "예: 올해의 연애 흐름과 이직 시기를 함께 보고 싶어요" : "e.g. Connect relationship patterns with a career change"} /></div>
                  <fieldset className="field field-premium companion-intake">
                    <legend>{locale === "ko" ? "동반자 1인 궁합 (선택)" : "One companion analysis (optional)"}</legend>
                    <label htmlFor="companionName">{locale === "ko" ? "동반자 이름" : "Companion name"}</label><input id="companionName" name="companionName" maxLength={200} />
                    <label htmlFor="companionBirthDate">{locale === "ko" ? "동반자 생년월일" : "Companion birth date"}</label><input id="companionBirthDate" name="companionBirthDate" type="date" min={MIN_BIRTH_DATE} max={maxBirthDate} />
                    <label htmlFor="companionBirthTime">{locale === "ko" ? "동반자 출생 시각 (선택)" : "Companion birth time (optional)"}</label><input id="companionBirthTime" name="companionBirthTime" type="time" />
                    <label htmlFor="companionGender">{locale === "ko" ? "동반자 성별" : "Companion gender"}</label><select id="companionGender" name="companionGender" defaultValue="unstated"><option value="unstated">{locale === "ko" ? "밝히지 않음" : "Unstated"}</option><option value="female">{locale === "ko" ? "여성" : "Female"}</option><option value="male">{locale === "ko" ? "남성" : "Male"}</option></select>
                    <label htmlFor="relationshipType">{locale === "ko" ? "관계 유형" : "Relationship type"}</label><select id="relationshipType" name="relationshipType" defaultValue="romance"><option value="romance">{locale === "ko" ? "연애" : "Romance"}</option><option value="marriage">{locale === "ko" ? "결혼·장기 동반" : "Marriage"}</option><option value="friendship">{locale === "ko" ? "친구" : "Friendship"}</option><option value="coworker">{locale === "ko" ? "동료" : "Coworker"}</option><option value="cofounder">{locale === "ko" ? "공동창업" : "Cofounder"}</option><option value="manager_report">{locale === "ko" ? "상사·부하" : "Manager/report"}</option><option value="parent_child">{locale === "ko" ? "부모·자녀" : "Parent/child"}</option></select>
                  </fieldset>
                </>
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
          <nav aria-label={locale === "ko" ? "공식 채널 및 법률 안내" : "Official channels and legal"}><a href={OFFICIAL_NAVER_BLOG_URL} rel="me noopener noreferrer" target="_blank">{locale === "ko" ? "MY GYEOL 공식 블로그" : "MY GYEOL official blog"}</a><Link href={`/${locale}/terms`}>{locale === "ko" ? "이용조건" : "Terms"}</Link><Link href={`/${locale}/privacy`}>{locale === "ko" ? "개인정보" : "Privacy"}</Link><Link href={`/${locale}/orders`}>{locale === "ko" ? "구매 내역" : "Find a purchase"}</Link><Link href={`/${locale}/support`}>{locale === "ko" ? "고객 문의" : "Support"}</Link></nav>
          <small>{locale === "ko" ? "별루프 · 대표 박서준 · 사업자등록번호 482-12-03629 · 부산광역시 북구" : "Byeolloof · Busan, Republic of Korea"}</small>
        </footer>
          </>
        )}
      </main>
      {showEverything && !intakeVisible && !heroVisible && (
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
