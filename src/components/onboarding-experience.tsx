"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type Props = { locale: Locale; dictionary: Dictionary };
type ReadingProductId = "quick" | "comprehensive" | "premium_pdf";

type FocusId = "work" | "relationships" | "growth" | "money";

// The example has to match the area the person just picked. A relationship prompt
// shown to someone asking about money reads as "this service is not for me".
const concernExamples: Record<Locale, Record<FocusId, string>> = {
  ko: {
    work: "예: 지금 회사에 계속 있는 게 맞을까요, 옮길 준비를 시작해야 할까요?",
    relationships: "예: 그 사람과 다시 잘될 수 있을까요?",
    growth: "예: 요즘 계속 제자리인 것 같은데, 뭘 먼저 바꿔야 할까요?",
    money: "예: 지금 목돈을 쓰는 게 맞을지 계속 망설여집니다.",
  },
  en: {
    work: "e.g. Should I stay in this job, or start preparing to move?",
    relationships: "e.g. Is there a realistic way back with this person?",
    growth: "e.g. I feel stuck lately — what should I change first?",
    money: "e.g. I keep hesitating over a large spend right now.",
  },
};

const productCodeByReading: Record<ReadingProductId, "plus_30d" | "pro_30d" | "premium_pdf"> = {
  quick: "plus_30d",
  comprehensive: "pro_30d",
  premium_pdf: "premium_pdf",
};

const readingProducts = {
  ko: [
    {
      id: "quick",
      name: "간단 타로 리딩",
      price: "19,000원",
      description: "한 가지 고민의 현재 흐름, 조심할 점, 다음 행동을 간결하게 정리합니다.",
      badge: "빠른 답변",
    },
    {
      id: "comprehensive",
      name: "타로·생년월일 종합 리딩",
      price: "39,000원",
      description: "연애·관계·진로·재물 중 선택한 영역을 생년월일과 고민에 맞춰 자세히 봅니다.",
      badge: "가장 많이 선택",
    },
    {
      id: "premium_pdf",
      name: "프리미엄 맞춤 PDF",
      price: "79,000원",
      description: "여러 고민을 함께 살펴보고 장문 해석, 실천 지침, 주의사항을 맞춤 리포트로 제공합니다.",
      badge: "가장 깊은 리딩",
    },
  ],
  en: [
    {
      id: "quick",
      name: "Quick tarot reading",
      price: "KRW 19,000",
      description: "A concise reading for one concern, one caution, and one next step.",
      badge: "Quick answer",
    },
    {
      id: "comprehensive",
      name: "Tarot and birth-date reading",
      price: "KRW 39,000",
      description: "A detailed reading for your chosen relationship, career, or money concern.",
      badge: "Most selected",
    },
    {
      id: "premium_pdf",
      name: "Premium custom PDF",
      price: "KRW 79,000",
      description: "A long-form report with several concerns, practical guidance, and cautions.",
      badge: "Deepest reading",
    },
  ],
} as const;

const copy = {
  ko: {
    navLabel: "홈페이지 탐색",
    nav: [
      ["#about", "서비스 소개"],
      ["#fields", "상담 분야"],
      ["#products", "상품 안내"],
      ["#voices", "후기"],
    ],
    primary: "지금 상담 시작하기",
    secondary: "상담 사례 보기",
    heroNote: "결제 전 정보 확인 · 1회 결제 · 자동 갱신 없음",
    sampleEyebrow: "리딩 방식",
    sampleTitle: "막연한 예언보다, 지금 필요한 선택과 주의사항을 분명하게.",
    sampleBody: "질문과 생년월일을 바탕으로 현재 흐름을 정리하고, 오늘부터 확인할 행동과 조심할 상황을 이해하기 쉬운 말로 안내합니다.",
    aboutEyebrow: "결 GYEOL",
    aboutTitle: "답이 흐릿한 순간, 지금 보아야 할 흐름을 선명하게 읽습니다.",
    aboutBody: "타로의 상징과 현재의 고민을 연결해 연애·관계·진로·재물의 흐름을 구체적인 언어로 풀어냅니다. 겁을 주는 말이나 결과 보장 대신 현실에서 확인할 선택에 집중합니다.",
    fields: [
      ["01", "연애·관계", "상대의 마음을 단정하기보다 반복되는 행동, 거리, 대화의 흐름을 봅니다."],
      ["02", "일·진로", "직업 이름보다 오래 유지할 수 있는 업무 조건과 다음 선택을 정리합니다."],
      ["03", "사업·재물", "수익을 보장하지 않고 돈의 흐름, 책임, 조심할 결정을 살펴봅니다."],
      ["04", "지금의 흐름", "현재 변화의 속도와 미루지 말아야 할 작은 행동을 확인합니다."],
    ],
    formTitle: "원하는 상품을 먼저 선택해 주세요",
    formBody: "선택한 상품에 필요한 정보만 받습니다. 입력 후 결제 페이지로 이동하며, 결제 확인 뒤 비회원도 전용 주소에서 리포트를 볼 수 있습니다.",
    submit: "입력 완료하고 결제하러 가기",
    privacy: "입력 정보는 결제 완료 후 구매한 리포트를 만들고 저장하는 데 사용됩니다.",
    productsTitle: "대표 상품 3가지",
    productsBody: "빠른 한 가지 답변부터 장문 맞춤 리포트까지 필요한 깊이만 선택하세요.",
    trust: [
      ["결제 후 제공", "자동결제가 승인되거나 계좌입금이 확인된 주문에만 전체 리포트를 제공합니다."],
      ["언제든 다시 보기", "비회원은 전용 주소에서, 로그인한 회원은 마이페이지에서도 리포트를 다시 볼 수 있습니다."],
      ["다운로드 가능", "리포트를 파일로 내려받거나 인쇄 메뉴에서 PDF로 저장할 수 있습니다."],
      ["알림 직접 설정", "마이페이지에서 주의사항 알림과 이메일 알림을 켜거나 끌 수 있습니다."],
    ],
    voices: [
      "복잡한 말을 줄이고 지금 할 일을 먼저 알려줘서 좋았어요.",
      "휴대폰에서도 글자가 커서 천천히 읽기 편했어요.",
      "겁주는 말보다 조심할 상황을 현실적으로 설명해 줬어요.",
      "결과를 마이페이지에서 다시 볼 수 있어 편했어요.",
    ],
  },
  en: {
    navLabel: "Home navigation",
    nav: [["#products", "Products"], ["#onboarding", "Start"], ["#trust", "Safety"]],
    primary: "Choose a product",
    secondary: "View products",
    heroNote: "Review before payment · one-time purchase · no auto-renewal",
    sampleEyebrow: "How it works",
    sampleTitle: "Clear choices and cautions instead of vague prediction.",
    sampleBody: "Your question and birth date shape a plain-language report with a current theme, a practical next step, and situations to watch.",
    aboutEyebrow: "GYEOL reading",
    aboutTitle: "When the answer feels unclear, make the next decision easier to see.",
    aboutBody: "Tarot symbolism is connected to your present concern across relationships, career, and money. The service focuses on practical reflection rather than guaranteed outcomes.",
    fields: [
      ["01", "Love & relationships", "Review recurring behavior, distance, and conversation."],
      ["02", "Work & career", "Clarify sustainable conditions and your next choice."],
      ["03", "Business & money", "Review money flow and decision cautions without promising returns."],
      ["04", "Current direction", "Check the pace of change and one action not to postpone."],
    ],
    formTitle: "Choose your reading first",
    formBody: "Only the information needed for that product is requested. The full report is created after verified payment and saved to your account.",
    submit: "Continue to payment",
    privacy: "Your input is used to create and store the purchased report after payment.",
    productsTitle: "Three clear products",
    productsBody: "Choose only the depth you need, from one quick answer to a long custom report.",
    trust: [
      ["After payment", "Full reports open only after verified payment or virtual-account deposit."],
      ["Available again", "Purchased reports stay in your signed-in account on phone and desktop."],
      ["Downloadable", "Download the report or save it as a PDF from the print menu."],
      ["Your notification choice", "Turn caution and email notifications on or off in My Page."],
    ],
    voices: [
      "It helped to see one practical step first.",
      "The large type was comfortable to read on my phone.",
      "The cautions felt grounded rather than frightening.",
      "I liked being able to reopen the report later.",
    ],
  },
} as const;

export function OnboardingExperience({ locale, dictionary: d }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<ReadingProductId>("quick");
  const [focusId, setFocusId] = useState<FocusId>("relationships");
  const [error, setError] = useState("");
  const t = copy[locale];
  const otherLocale = locale === "ko" ? "en" : "ko";

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
    if (!birthDate || !concern) {
      setError(locale === "ko" ? "생년월일과 궁금한 내용을 입력해 주세요." : "Enter your birth date and concern.");
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

        <section className="hero home-hero" aria-labelledby="hero-title">
          <div className="home-hero-copy">
            <p className="eyebrow">{d.eyebrow}</p>
            <h1 id="hero-title">
              {locale === "ko" ? (
                <>막막한 순간,<br /><span>결이 답의 방향을<br />밝혀드립니다.</span></>
              ) : d.headline}
            </h1>
            <p className="hero-copy">{d.intro}</p>
            <div className="hero-actions">
              <a className="primary-button" href="#onboarding">{t.primary}</a>
              <a className="secondary-link" href="#voices">{t.secondary}</a>
            </div>
            <p className="hero-note">{t.heroNote}</p>
          </div>
          <div className="gyeol-motif" aria-hidden="true">
            <span className="gyeol-index">ARC</span>
            <div className="gyeol-lines"><i /><i /><i /><i /><i /></div>
            <span className="gyeol-caption">TAROT · INTUITION · CLARITY</span>
          </div>
        </section>

        <section className="report-preview" aria-labelledby="preview-title">
          <div className="section-heading">
            <p className="eyebrow">{t.sampleEyebrow}</p>
            <h2 id="preview-title">{t.sampleTitle}</h2>
          </div>
          <div className="preview-reading"><p>{t.sampleBody}</p></div>
        </section>

        <section className="about-gyeol" id="about" aria-labelledby="about-title">
          <div className="section-heading">
            <p className="eyebrow">{t.aboutEyebrow}</p>
            <h2 id="about-title">{t.aboutTitle}</h2>
          </div>
          <div className="about-gyeol-body"><p>{t.aboutBody}</p></div>
        </section>

        <section className="pattern-fields" id="fields" aria-labelledby="fields-title">
          <div className="section-heading">
            <p className="eyebrow">{locale === "ko" ? "상담 분야" : "Reading areas"}</p>
            <h2 id="fields-title">
              {locale === "ko" ? "지금 가장 답이 필요한 분야를 선택하세요" : "Choose the area that needs clarity now"}
            </h2>
          </div>
          <div className="pattern-field-grid">
            {t.fields.map(([index, title, body]) => (
              <article key={index}><span>{index}</span><h3>{title}</h3><p>{body}</p></article>
            ))}
          </div>
        </section>

        <section className="pass-summary" id="products" aria-labelledby="products-title">
          <div>
            <p className="eyebrow">{locale === "ko" ? "대표 상품" : "Products"}</p>
            <h2 id="products-title">{t.productsTitle}</h2>
            <p>{t.productsBody}</p>
          </div>
          <ul>
            {readingProducts[locale].map((product) => (
              <li key={product.id}><strong>{product.name} · {product.price}</strong><br />{product.description}</li>
            ))}
          </ul>
        </section>

        <section className="form-section home-form-section" id="onboarding" aria-labelledby="onboarding-title">
          <header className="form-section-heading">
            <p className="eyebrow">{locale === "ko" ? "유료 리딩 신청" : "Paid reading"}</p>
            <h2 id="onboarding-title">{t.formTitle}</h2>
            <p>{t.formBody}</p>
          </header>
          <form className="form-card" onSubmit={submit} noValidate>
            <fieldset className="product-picker field">
              <legend>{locale === "ko" ? "1. 상품 선택" : "1. Product"}</legend>
              <div className="product-picker-grid">
                {readingProducts[locale].map((product) => (
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
                      <b>{product.price}</b><em>{product.description}</em>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="field">
              <label htmlFor="birthDate">{locale === "ko" ? "2. 생년월일" : "2. Birth date"}</label>
              <input id="birthDate" name="birthDate" type="date" required />
            </div>

            <fieldset className="field simple-topic-picker">
              <legend>{locale === "ko" ? "3. 가장 궁금한 영역" : "3. Main area"}</legend>
              <div className="choice-row">
                {d.interests.slice(0, 4).map((option) => (
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

            {selectedProduct !== "quick" && (
              <div className="field">
                <label htmlFor="name">{locale === "ko" ? "이름 또는 부를 이름" : "Name"}</label>
                <input id="name" name="name" type="text" maxLength={200} autoComplete="name" />
              </div>
            )}

            <div className="field">
              <label htmlFor="concern">
                {locale === "ko"
                  ? selectedProduct === "quick" ? "4. 한 가지 궁금한 것" : "4. 자세히 보고 싶은 고민"
                  : "4. Your concern"}
              </label>
              <textarea
                id="concern"
                maxLength={1_000}
                name="concern"
                placeholder={concernExamples[locale][focusId]}
                required
              />
            </div>

            {selectedProduct === "premium_pdf" && (
              <div className="field">
                <label htmlFor="reportFocus">{locale === "ko" ? "리포트에서 꼭 다룰 내용" : "What the report must cover"}</label>
                <textarea id="reportFocus" name="reportFocus" maxLength={1_000} placeholder={locale === "ko" ? "예: 올해 연애 흐름과 이직 시기를 함께 보고 싶어요." : "Add any other concern."} />
              </div>
            )}

            <label className="check">
              <input type="checkbox" name="privacyRequired" required />
              <span>{t.privacy}</span>
            </label>
            <Link className="legal-inline-link" href={`/${locale}/privacy`}>
              {locale === "ko" ? "개인정보 안내 보기" : "Privacy notice"}
            </Link>
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

        <section className="voice-stream" id="voices" aria-labelledby="voices-title">
          <div className="section-heading">
            <p className="eyebrow">{locale === "ko" ? "이용 경험 예시" : "Experience examples"}</p>
            <h2 id="voices-title">{locale === "ko" ? "읽기 쉽고, 다시 보기 편하게" : "Readable and easy to revisit"}</h2>
            <p className="voice-stream-note">{locale === "ko" ? "아래 문구는 실제 후기 인용이 아닌 서비스 이용 경험 예시입니다." : "Illustrative examples, not customer testimonials."}</p>
          </div>
          <div className="voice-marquee">
            <div className="voice-track">
              {[...t.voices, ...t.voices].map((voice, index) => (
                <blockquote className="voice-card" key={`${voice}-${index}`}>
                  <p>{voice}</p>
                  <footer>{locale === "ko" ? "서비스 이용 경험 예시" : "Illustrative experience"}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <footer className="home-footer">
          <div><strong>{locale === "ko" ? "결 GYEOL" : "GYEOL"}</strong><p>{locale === "ko" ? "타로·신점 상담 서비스" : "Reflective tarot readings"}</p></div>
          <nav aria-label={locale === "ko" ? "법률 안내" : "Legal"}>
            <Link href={`/${locale}/terms`}>{locale === "ko" ? "이용조건" : "Terms"}</Link>
            <Link href={`/${locale}/privacy`}>{locale === "ko" ? "개인정보" : "Privacy"}</Link>
            <Link href={`/${locale}/orders`}>{locale === "ko" ? "구매 내역" : "Find a purchase"}</Link>
            <Link href={`/${locale}/support`}>{locale === "ko" ? "고객 문의" : "Support"}</Link>
          </nav>
          <small>{locale === "ko" ? "별루프 · 대표 박서준 · 사업자등록번호 482-12-03629 · 부산광역시 북구" : "Byeolloof · Busan, Republic of Korea"}</small>
        </footer>
      </main>
    </>
  );
}
