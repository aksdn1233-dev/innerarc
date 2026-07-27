"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  calculateNumerologyProfile,
  NumerologyInputError,
  type NumberCalculation,
  type NumerologyProfile,
} from "@/core/numerology";
import { createIntegratedProfile, getRuleBasedProfile } from "@/core/profile";
import { createLifestyleRecommendations } from "@/core/lifestyle";
import {
  createOnboardingReflectionContext,
  OnboardingContextInputError,
  type OnboardingReflectionContext,
} from "@/core/onboarding";
import { buildCoreProfileShare } from "@/core/share";
import { ShareCardPanel } from "@/components/share-card-panel";
import { focusAndScroll, scrollToElement } from "@/components/accessibility";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type Props = { locale: Locale; dictionary: Dictionary };

function evidence(calculation: NumberCalculation): string {
  const reductions = calculation.steps.map((step) => step.output);
  return [`${calculation.expression} = ${calculation.initialTotal}`, ...reductions.map(String)].join(" → ");
}

const landingCopy = {
  ko: {
    navLabel: "홈페이지 탐색",
    nav: [
      { href: "#about", label: "결 소개" },
      { href: "#fields", label: "분석 분야" },
      { href: "#onboarding", label: "무료 분석" },
      { href: "#passes", label: "이용권" },
    ],
    primary: "내 삶의 결 확인하기",
    secondary: "리포트 미리보기",
    heroNote: "회원가입 없이 시작 · 게스트 입력은 브라우저 안에서 계산",
    sampleEyebrow: "리포트 미리보기",
    sampleTitle: "강한 독립성 뒤에, 혼자 감당하려는 반복이 보입니다.",
    sampleBody: "새로운 일을 시작하는 힘은 빠르지만 도움을 요청하는 시점은 늦어질 수 있습니다. 이번 주에는 결정 하나를 혼자 완성하기 전에 신뢰하는 사람에게 조건을 설명해 보세요.",
    sampleTags: ["성향 · 시작하는 힘", "관계 · 도움을 요청하는 시점", "현실 확인 · 작은 행동"],
    sampleLimit: "실제 결과는 입력값과 선택한 관심 분야에 따라 달라집니다.",
    aboutEyebrow: "결이 무엇인가요?",
    aboutTitle: "흩어진 경험을 하나의 운명으로 묶지 않고, 반복을 관찰하는 언어입니다.",
    aboutBody: "InnerArc는 수비학의 계산 결과를 성격의 정답이나 미래 예언으로 제시하지 않습니다. 숫자의 상징을 현실에서 확인할 수 있는 질문으로 바꾸고, 맞았던 부분과 빗나간 부분을 함께 기록합니다.",
    aboutPoints: [
      ["계산", "생년월일에서 동일한 규칙으로 핵심 숫자를 계산합니다."],
      ["해석", "계산 사실과 전통적 상징, 맥락 추론을 분리해 보여줍니다."],
      ["확인", "결과를 실제 선택과 경험에 대조해 다음 판단 기준을 다듬습니다."],
    ],
    fieldsEyebrow: "분석 분야 4개",
    fieldsTitle: "삶의 중요한 장면마다 반복되는 방식을 살펴봅니다.",
    fields: [
      ["01", "나의 기본 결", "에너지를 쓰는 방식, 강점과 과부하 신호를 함께 봅니다."],
      ["02", "관계의 결", "가까워지는 속도, 갈등과 회복, 경계를 세우는 방식을 살펴봅니다."],
      ["03", "일과 돈의 결", "일의 리듬, 책임을 맡는 방식, 재물 판단에서 반복되는 기준을 찾습니다."],
      ["04", "지금의 흐름", "현재 고민을 중심으로 당장 확인할 질문과 작은 행동을 제안합니다."],
    ],
    freeEyebrow: "무료 첫 분석",
    freeTitle: "생년월일부터, 내 삶의 결을 확인해 보세요.",
    freeBody: "기본 결과는 무료이며 브라우저 메모리에서 바로 계산됩니다. 이름과 고민은 선택 입력입니다.",
    passEyebrow: "더 깊은 분석",
    passTitle: "필요할 때만 여는 30일 이용권",
    passBody: "자동 갱신 없이 Plus와 Pro 심층 리포트를 이용하는 구조입니다. 가격과 실제 결제는 판매자 정보·환불 기준·운영 도메인 검토가 끝난 뒤에만 열립니다.",
    passAction: "이용권 구성 보기",
    passPoints: ["30일 단일 이용권", "자동 갱신 없음", "토스페이먼츠 결제 준비"],
    trustEyebrow: "신뢰와 안전",
    trustTitle: "해석보다 먼저, 경계와 근거를 분명히 합니다.",
    trust: [
      ["결정론적 계산", "핵심 수비학 값은 AI가 아니라 공개된 규칙을 구현한 코드로 계산합니다."],
      ["개인정보 최소화", "게스트 입력은 서버로 보내지 않으며, 저장과 계정 동기화는 사용자가 명시적으로 선택할 때만 실행됩니다."],
      ["예측이 아닌 성찰", "과학적 진단이나 미래 보장이 아닙니다. 중요한 결정에는 현실 정보와 전문가 조언을 우선하세요."],
      ["현실 확인", "좋았던 해석뿐 아니라 맞지 않았던 부분도 기록해 개인 관련성을 다시 확인합니다."],
    ],
    footerNote: "숫자를 답으로 믿기보다, 내 경험을 더 정확히 읽기 위해 사용합니다.",
    seller: "별루프 · 대표 박서준 · 사업자등록번호 482-12-03629 · 부산광역시 북구 상학로 36, 207동 1108호",
    footerLinks: [
      { href: "privacy", label: "개인정보 처리 안내" },
      { href: "terms", label: "이용조건" },
      { href: "me", label: "내 데이터" },
    ],
  },
  en: {
    navLabel: "Homepage",
    nav: [
      { href: "#about", label: "The pattern" },
      { href: "#fields", label: "What we explore" },
      { href: "#onboarding", label: "Free reading" },
      { href: "#passes", label: "Passes" },
    ],
    primary: "Discover my life pattern",
    secondary: "Preview the report",
    heroNote: "Start without an account · Guest input is calculated in your browser",
    sampleEyebrow: "Report preview",
    sampleTitle: "Behind strong independence, you may be carrying too much alone.",
    sampleBody: "You may move quickly when starting something new, yet wait too long to ask for support. Before completing one decision alone this week, explain the conditions to someone you trust.",
    sampleTags: ["Self · The power to begin", "Relationships · When to ask", "Reality check · One small action"],
    sampleLimit: "Your result changes with your details and selected focus.",
    aboutEyebrow: "What is a life pattern?",
    aboutTitle: "A language for noticing repetition without turning scattered experiences into fate.",
    aboutBody: "InnerArc does not present numerology as a fixed personality verdict or a prediction. It translates number symbolism into questions you can test against real life, including what fits and what does not.",
    aboutPoints: [
      ["Calculate", "Core numbers follow the same deterministic rules every time."],
      ["Interpret", "Calculated facts, traditional symbolism, and contextual inference stay visibly separate."],
      ["Check", "Compare the reflection with lived choices and refine your next decision criteria."],
    ],
    fieldsEyebrow: "Four fields",
    fieldsTitle: "Notice how your patterns recur across the moments that matter.",
    fields: [
      ["01", "Your core pattern", "Explore how you direct energy, express strengths, and notice overload."],
      ["02", "Relationship patterns", "Look at pacing, conflict and repair, and how you hold boundaries."],
      ["03", "Work and money", "Find recurring rhythms in responsibility, work, and financial judgment."],
      ["04", "Your current flow", "Turn a current concern into questions and one small action to test."],
    ],
    freeEyebrow: "Free first reflection",
    freeTitle: "Start with your date of birth.",
    freeBody: "The core result is free and calculated in browser memory. Your name and current concern are optional.",
    passEyebrow: "Go deeper",
    passTitle: "A 30-day pass, only when you need it",
    passBody: "Plus and Pro are one-time deep-report passes with no automatic renewal. Pricing and checkout remain closed until seller details, refunds, and the production domain pass review.",
    passAction: "See pass details",
    passPoints: ["One-time 30-day pass", "No automatic renewal", "Toss Payments ready"],
    trustEyebrow: "Trust and safety",
    trustTitle: "Clear evidence and boundaries come before interpretation.",
    trust: [
      ["Deterministic calculation", "Core numerology values are calculated by documented code, not selected by AI."],
      ["Data minimization", "Guest input stays off the server. Saving and account sync happen only after an explicit choice."],
      ["Reflection, not prediction", "This is not scientific diagnosis or a future guarantee. Use real evidence and qualified advice for important decisions."],
      ["Reality checks", "Record what missed as well as what fit, then review personal relevance over time."],
    ],
    footerNote: "Use numbers to read your experience more carefully—not as answers to believe.",
    seller: "별루프 · Representative 박서준 · Business registration 482-12-03629 · Busan, Republic of Korea",
    footerLinks: [
      { href: "privacy", label: "Privacy" },
      { href: "terms", label: "Terms" },
      { href: "me", label: "My data" },
    ],
  },
} as const;

export function OnboardingExperience({ locale, dictionary: d }: Props) {
  const [result, setResult] = useState<NumerologyProfile | null>(null);
  const [context, setContext] = useState<OnboardingReflectionContext | null>(null);
  const [error, setError] = useState("");
  const deepProfileRef = useRef<HTMLDetailsElement>(null);
  const profile = result ? getRuleBasedProfile(result.lifePath.value, locale) : null;
  const integratedProfile = result ? createIntegratedProfile(result, locale) : null;
  const lifestyle = result ? createLifestyleRecommendations(result, locale) : null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    if (form.get("privacyRequired") !== "on") {
      setResult(null);
      setContext(null);
      setError(d.privacyRequired);
      return;
    }
    try {
      const nextContext = createOnboardingReflectionContext({
        locale,
        focusId: String(form.get("interest") ?? ""),
        depth: String(form.get("depth") ?? ""),
        concern: String(form.get("concern") ?? ""),
        aiPersonalizationConsent: form.get("aiPersonalization") === "on",
      });
      const next = calculateNumerologyProfile({
        birthDate: String(form.get("birthDate") ?? ""),
        name: String(form.get("name") ?? ""),
        personalYear: new Date().getFullYear(),
      });
      setResult(next);
      setContext(nextContext);
      focusAndScroll("#result");
    } catch (caught) {
      setResult(null);
      setContext(null);
      setError(caught instanceof OnboardingContextInputError
        ? d.invalidContext
        : caught instanceof NumerologyInputError
          ? d.invalidDate
          : d.invalidDate);
    }
  }

  function openDeepProfile() {
    if (!deepProfileRef.current) return;
    deepProfileRef.current.open = true;
    focusAndScroll("#deep-profile");
  }

  function restart() {
    setResult(null);
    setContext(null);
    scrollToElement("#onboarding");
  }

  const otherLocale = locale === "ko" ? "en" : "ko";
  const home = landingCopy[locale];
  const labels = result
    ? [
        [d.lifePath, result.lifePath],
        [d.birthday, result.birthday],
        [d.attitude, result.attitude],
        [d.personalYear, result.personalYear],
      ] as const
    : [];

  return (
    <>
      <main className="shell" id="main-content" tabIndex={-1}>
        <header className="topbar home-topbar">
          <Link className="brand" href={`/${locale}`}>
            <strong>InnerArc</strong>
            <small>{d.brandTagline}</small>
          </Link>
          <nav className="home-nav" aria-label={home.navLabel}>
            {home.nav.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
          </nav>
          <div className="home-header-actions">
            <Link className="header-account-link" href={`/${locale}/me`}>
              {locale === "ko" ? "내 정보" : "My data"}
            </Link>
            <Link className="locale-switch" href={`/${otherLocale}`}>
              {otherLocale === "ko" ? "한국어" : "English"}
            </Link>
          </div>
        </header>

        <section className="hero home-hero" aria-labelledby="hero-title">
          <div className="home-hero-copy">
            <p className="eyebrow">{d.eyebrow}</p>
            <h1 id="hero-title">{d.headline}</h1>
            <p className="hero-copy">{d.intro}</p>
            <div className="hero-actions">
              <button
                className="primary-button"
                type="button"
                onClick={() => scrollToElement("#onboarding")}
              >
                {home.primary}
              </button>
              <a className="secondary-link" href="#report-preview">{home.secondary}</a>
            </div>
            <p className="hero-note">{home.heroNote}</p>
          </div>
          <div className="gyeol-motif" aria-hidden="true">
            <span className="gyeol-index">11</span>
            <div className="gyeol-lines">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <span className="gyeol-caption">INNER · PATTERN · OUTER</span>
          </div>
        </section>

        <section className="report-preview" id="report-preview" aria-labelledby="preview-title">
          <div className="section-heading">
            <p className="eyebrow">{home.sampleEyebrow}</p>
            <h2 id="preview-title">{home.sampleTitle}</h2>
          </div>
          <div className="preview-reading">
            <p>{home.sampleBody}</p>
            <ul aria-label={home.sampleEyebrow}>
              {home.sampleTags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
            <small>{home.sampleLimit}</small>
          </div>
        </section>

        <section className="about-gyeol" id="about" aria-labelledby="about-title">
          <div className="section-heading">
            <p className="eyebrow">{home.aboutEyebrow}</p>
            <h2 id="about-title">{home.aboutTitle}</h2>
          </div>
          <div className="about-gyeol-body">
            <p>{home.aboutBody}</p>
            <dl>
              {home.aboutPoints.map(([term, description]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="pattern-fields" id="fields" aria-labelledby="fields-title">
          <div className="section-heading">
            <p className="eyebrow">{home.fieldsEyebrow}</p>
            <h2 id="fields-title">{home.fieldsTitle}</h2>
          </div>
          <div className="pattern-field-grid">
            {home.fields.map(([index, title, body]) => (
              <article key={index}>
                <span>{index}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="form-section home-form-section" id="onboarding" aria-labelledby="onboarding-title">
          <header className="form-section-heading">
            <p className="eyebrow">{home.freeEyebrow}</p>
            <h2>{home.freeTitle}</h2>
            <p>{home.freeBody}</p>
          </header>
          <form className="form-card" onSubmit={submit} noValidate>
            <h3 id="onboarding-title">{d.start}</h3>

            <div className="field">
              <label htmlFor="birthDate">{d.birthDate}</label>
              <input id="birthDate" name="birthDate" type="date" required />
              <small>{d.birthHelp}</small>
            </div>

            <div className="field">
              <label htmlFor="name">{d.name}</label>
              <input id="name" name="name" type="text" maxLength={200} placeholder={d.namePlaceholder} />
              <small>{d.nameHelp}</small>
            </div>

            <fieldset className="field">
              <legend>{d.interest}</legend>
              <div className="choice-row">
                {d.interests.map((option, index) => (
                  <label className="choice" key={option.value}>
                    <input
                      type="radio"
                      name="interest"
                      value={option.value}
                      defaultChecked={index === 0}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="field">
              <label htmlFor="concern">{d.concern}</label>
              <textarea
                id="concern"
                name="concern"
                maxLength={2_000}
                placeholder={d.concernPlaceholder}
                aria-describedby="concern-help"
              />
              <small id="concern-help">{d.questionBoundary}</small>
            </div>

            <fieldset className="field">
              <legend>{d.depth}</legend>
              <div className="choice-row">
                {d.depths.map((depth, index) => (
                  <label className="choice" key={depth.value}>
                    <input
                      type="radio"
                      name="depth"
                      value={depth.value}
                      defaultChecked={index === 1}
                    />
                    <span>{depth.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="check">
              <input type="checkbox" name="privacyRequired" required />
              <span>{d.privacyRequired}</span>
            </label>
            <Link className="legal-inline-link" href={`/${locale}/privacy`}>
              {locale === "ko" ? "개인정보 처리 안내 읽기" : "Read the privacy information"}
            </Link>
            <label className="check">
              <input type="checkbox" name="aiPersonalization" />
              <span>{d.personalize}</span>
            </label>
            <p className="privacy-note">{d.aiConsentHelp}</p>

            <div className="form-actions">
              <button className="primary-button" type="submit">{d.calculate}</button>
              {error && <span className="error" role="alert">{error}</span>}
            </div>
            <p className="privacy-note">{d.privacyNote}</p>
            <p className="legal-note">
              <Link href={`/${locale}/terms`}>{locale === "ko" ? "출시 전 이용조건" : "Pre-release terms"}</Link>
            </p>
          </form>
        </section>

        {result && profile && integratedProfile && lifestyle && context && (
          <section className="result-section" id="result" aria-live="polite" tabIndex={-1}>
            <article className="result-card">
              <header className="result-header">
                <p className="eyebrow">{d.resultEyebrow}</p>
                <p className="archetype">{d.archetype} · {profile.archetype}</p>
                <h2>{d.oneLine}</h2>
                <p className="summary">{profile.summary}</p>
              </header>

              <section className="onboarding-context-card" aria-labelledby="context-title">
                <p className="eyebrow">{d.contextEyebrow} · {context.focusLabel}</p>
                <h3 id="context-title">{context.title}</h3>
                <p>{context.contextualInference}</p>
                {context.concern && (
                  <div className="context-question">
                    <strong>{d.selectedQuestion}</strong>
                    <blockquote>{context.concern.text}</blockquote>
                    <small>{d.questionBoundary}</small>
                  </div>
                )}
                <dl>
                  <div>
                    <dt>{d.depth}</dt>
                    <dd><strong>{context.depthLabel}</strong> · {context.depthGuidance}</dd>
                  </div>
                  <div>
                    <dt>{d.smallAction}</dt>
                    <dd>{context.practicalAction}</dd>
                  </div>
                  <div>
                    <dt>{d.realityCheckLabel}</dt>
                    <dd>{context.realityCheck}</dd>
                  </div>
                </dl>
                <aside className="ai-boundary" aria-label={d.aiBoundaryTitle}>
                  <strong>{d.aiBoundaryTitle}</strong>
                  <span>{context.aiBoundary.message}</span>
                </aside>
                {context.nextStep.type === "deep_profile" ? (
                  <button className="secondary-button" type="button" onClick={openDeepProfile}>
                    {context.nextStep.label}
                  </button>
                ) : (
                  <Link
                    className="secondary-button context-next-link"
                    href={`/${locale}/${context.nextStep.type === "relationship" ? "relationship" : "reality-check"}`}
                  >
                    {context.nextStep.label}
                  </Link>
                )}
                <small className="context-uncertainty">{context.uncertainty}</small>
                <code className="rule-version">{d.ruleVersion}: {context.ruleVersion}</code>
              </section>

              <div className="number-grid">
                {labels.map(([label, calculation]) => (
                  <div className="number-tile" key={label}>
                    <strong>{calculation.value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <Link className="celebrity-result-link" href={`/${locale}/celebrity`}>
                <strong>{d.celebrityCompare}</strong>
                <span>{d.celebrityIntro}</span>
              </Link>

              <div className="insight-grid">
                <section className="insight">
                  <h3>{d.strengths}</h3>
                  <ul>{profile.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
                <section className="insight">
                  <h3>{d.risks}</h3>
                  <ul>{profile.risks.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
                <section className="insight">
                  <h3>{d.careers}</h3>
                  <p>{profile.careers}</p>
                </section>
                <section className="insight">
                  <h3>{d.relationship}</h3>
                  <p>{profile.relationship}</p>
                </section>
              </div>

              <div className="layer">
                <strong>{d.symbolicLabel}</strong>
                <p>{profile.symbolic}</p>
              </div>
              <div className="layer">
                <strong>{d.inferenceLabel}</strong>
                <p>{profile.inference}</p>
              </div>
              <div className="layer">
                <strong>{d.limitationLabel}</strong>
                <p>{profile.limitation}</p>
              </div>

              <details className="lifestyle-profile" id="lifestyle-recommendations">
                <summary>{d.lifestyleTitle}</summary>
                <p className="lifestyle-intro">{d.lifestyleIntro}</p>

                <section className="lifestyle-group">
                  <header className="lifestyle-group-heading">
                    <div>
                      <p className="eyebrow">Style reflection</p>
                      <h3>{d.accessoriesTitle}</h3>
                    </div>
                    <Link href={`/${locale}/shop`} className="shop-preview-link">
                      <strong>{d.shopPreview}</strong>
                      <span>{d.shopComingLater}</span>
                    </Link>
                  </header>
                  <div className="lifestyle-grid">
                    {lifestyle.accessories.map((item) => (
                      <article className="lifestyle-card accessory-card" key={item.categoryId}>
                        <span className="lifestyle-rank">0{item.rank}</span>
                        <p className="lifestyle-kicker">{item.categoryLabel}</p>
                        <h4>{item.title}</h4>
                        <dl>
                          <div><dt>{d.accessoryForm}</dt><dd>{item.form}</dd></div>
                          <div><dt>{d.accessoryPalette}</dt><dd>{item.palette}</dd></div>
                          <div><dt>{d.accessoryMaterial}</dt><dd>{item.materialDirection}</dd></div>
                          <div><dt>{d.accessoryRationale}</dt><dd>{item.symbolicRationale}</dd></div>
                          <div><dt>{d.accessoryTry}</dt><dd>{item.tryOnCue}</dd></div>
                          <div><dt>{d.accessorySafety}</dt><dd>{item.safetyAndCare}</dd></div>
                        </dl>
                        <Link href={`/${locale}/shop${item.shopAnchor}`}>
                          {d.shopComingLater}
                        </Link>
                        <small>{item.evidenceRefs.join(" · ")}</small>
                      </article>
                    ))}
                  </div>
                  <p className="lifestyle-safety">{lifestyle.accessorySafetyNote}</p>
                </section>

                <section className="lifestyle-group">
                  <header className="lifestyle-group-heading">
                    <div>
                      <p className="eyebrow">Listening reflection</p>
                      <h3>{d.musicTitle}</h3>
                    </div>
                  </header>
                  <div className="lifestyle-grid">
                    {lifestyle.music.map((item) => (
                      <article className="lifestyle-card music-card" key={item.laneId}>
                        <span className="lifestyle-rank">0{item.rank}</span>
                        <p className="lifestyle-kicker">{item.laneLabel}</p>
                        <h4>{item.title}</h4>
                        <dl>
                          <div><dt>{d.musicGenre}</dt><dd>{item.genreDirection}</dd></div>
                          <div><dt>{d.musicSonic}</dt><dd>{item.sonicTraits}</dd></div>
                          <div><dt>{d.musicUse}</dt><dd>{item.useContext}</dd></div>
                          <div><dt>{d.musicCue}</dt><dd>{item.selectionCue}</dd></div>
                          <div><dt>{d.musicRealityCheck}</dt><dd>{item.realityCheck}</dd></div>
                        </dl>
                        <small>{item.evidenceRefs.join(" · ")}</small>
                      </article>
                    ))}
                  </div>
                  <p className="lifestyle-safety">{lifestyle.musicSafetyNote}</p>
                </section>

                <p className="disclaimer">{lifestyle.uncertainty}</p>
                <code className="rule-version">{d.ruleVersion}: {lifestyle.ruleVersion}</code>
              </details>

              <details
                className="deep-profile"
                id="deep-profile"
                key={`${context.focusId}:${context.depth}`}
                ref={deepProfileRef}
                open={context.showDeepProfileByDefault}
              >
                <summary>{d.integratedProfile}</summary>
                <p className="deep-profile-intro">{d.integratedIntro}</p>
                <p className="summary">{integratedProfile.summary}</p>
                <div className="domain-grid">
                  {integratedProfile.domains.map((domain) => (
                    <article className="domain-card" key={domain.id}>
                      <h3>{domain.title}</h3>
                      <div className="domain-facts">
                        {domain.calculatedFacts.map((item) => <span key={item}>{item}</span>)}
                      </div>
                      <div><strong>{d.symbolicLabel}</strong><p>{domain.traditionalInterpretation}</p></div>
                      <div><strong>{d.inferenceLabel}</strong><p>{domain.personalizedInference}</p></div>
                      <div className="domain-check"><strong>{d.realityCheckLabel}</strong><p>{domain.realityCheck}</p></div>
                      <small>{domain.uncertainty}</small>
                    </article>
                  ))}
                </div>

                <section className="career-details">
                  <h3>{d.careerDetails}</h3>
                  <div className="career-grid">
                    {integratedProfile.careerRecommendations.map((role) => (
                      <article key={role.roleId}>
                        <span className="career-rank">{role.rank}</span>
                        <h4>{role.title}</h4>
                        <dl>
                          <div><dt>{d.fitReason}</dt><dd>{role.fitReason}</dd></div>
                          <div><dt>{d.adverseCondition}</dt><dd>{role.adverseCondition}</dd></div>
                          <div><dt>{d.complementarySkill}</dt><dd>{role.complementarySkill}</dd></div>
                          <div><dt>{d.preferredEnvironment}</dt><dd>{role.preferredEnvironment}</dd></div>
                          <div><dt>{d.avoidCondition}</dt><dd>{role.avoidCondition}</dd></div>
                        </dl>
                      </article>
                    ))}
                  </div>
                </section>

                <p className="disclaimer">{integratedProfile.uncertainty}</p>
                <code className="rule-version">{d.ruleVersion}: {integratedProfile.ruleVersion}</code>
              </details>

              <details>
                <summary>{d.evidence}</summary>
                {labels.map(([label, calculation]) => (
                  <div className="evidence-row" key={label}>
                    <span>{label}</span>
                    <code>{evidence(calculation)}</code>
                  </div>
                ))}
                {result.name.status === "calculated" ? (
                  <>
                    <div className="evidence-row"><span>Expression / Destiny</span><strong>{result.name.destiny?.value}</strong></div>
                    <div className="evidence-row"><span>Soul Urge</span><strong>{result.name.soulUrge?.value}</strong></div>
                    <div className="evidence-row"><span>Personality</span><strong>{result.name.personality?.value}</strong></div>
                  </>
                ) : (
                  <p>{d.nameUnavailable}</p>
                )}
                <p>{d.masterReason}</p>
              </details>

              <ShareCardPanel payload={buildCoreProfileShare({
                locale,
                lifePath: result.lifePath.value,
                archetype: profile.archetype,
                summary: profile.summary,
                strengths: profile.strengths,
              })} />

              <p className="disclaimer">{d.disclaimer}</p>
              <button className="text-button" type="button" onClick={restart}>
                {d.restart}
              </button>
            </article>
          </section>
        )}

        <section className="pass-summary" id="passes" aria-labelledby="passes-title">
          <div>
            <p className="eyebrow">{home.passEyebrow}</p>
            <h2 id="passes-title">{home.passTitle}</h2>
            <p>{home.passBody}</p>
            <Link className="secondary-button pass-link" href={`/${locale}/plans`}>
              {home.passAction}
            </Link>
          </div>
          <ul>
            {home.passPoints.map((point) => <li key={point}>{point}</li>)}
          </ul>
        </section>

        <section className="trust-section" aria-labelledby="trust-title">
          <div className="section-heading">
            <p className="eyebrow">{home.trustEyebrow}</p>
            <h2 id="trust-title">{home.trustTitle}</h2>
          </div>
          <div className="trust-grid">
            {home.trust.map(([title, body]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="home-footer">
          <div>
            <Link className="brand" href={`/${locale}`}>
              <strong>InnerArc</strong>
              <small>{d.brandTagline}</small>
            </Link>
            <p>{home.footerNote}</p>
            <p className="seller-line">{home.seller}</p>
          </div>
          <nav aria-label={locale === "ko" ? "정책 및 데이터" : "Policy and data"}>
            {home.footerLinks.map((item) => (
              <Link href={`/${locale}/${item.href}`} key={item.href}>{item.label}</Link>
            ))}
          </nav>
        </footer>
      </main>

      <nav className="bottom-nav home-bottom-nav" aria-label={locale === "ko" ? "주요 탐색" : "Primary navigation"}>
        {d.nav.map((item, index) =>
          index === 1 ? (
            <Link href={`/${locale}/me`} prefetch={false} key={item}>{item}</Link>
          ) : index === 2 ? (
            <Link href={`/${locale}/relationship`} key={item}>{item}</Link>
          ) : index === 3 ? (
            <Link href={`/${locale}/question`} key={item}>{item}</Link>
          ) : index === 4 ? (
            <Link href={`/${locale}/reality-check`} key={item}>{item}</Link>
          ) : (
            <span key={item}>{item}</span>
          ),
        )}
      </nav>
    </>
  );
}
