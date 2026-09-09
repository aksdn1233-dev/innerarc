"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { captureConversionEvent } from "@/core/analytics";
import type { Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
  reviewCount: number | null;
};

const GUIDE_SCREENS = ["questions", "intake", "free-result", "report"] as const;

const content = {
  ko: {
    navLabel: "태령당 주요 메뉴",
    services: "서비스",
    guide: "이용 안내",
    analysis: "생년월일 패턴",
    success: "유명인 비교",
    relationship: "궁합",
    space: "3D 공간운",
    reviews: "이용 후기",
    login: "구매 내역",
    start: "무료 사주",
    kicker: "PERSONAL PATTERN INTELLIGENCE",
    title: <>사람의 흐름을 읽어<br /><em>더 나은 오늘을 만듭니다.</em></>,
    heroBody: "사주와 생년월일 패턴의 계산 근거를 바탕으로, 반복되는 성향과 선택을 현실에 맞게 풀어드립니다.",
    heroPrimary: "무료 사주 보기",
    heroSecondary: "서비스 둘러보기",
    heroNote: "무료로 시작 · 계산 과정 확인 · 나중에 다시 보기",
    heroArtNote: "브랜드 연출 이미지 · 생성형 이미지",
    guideCue: "처음이세요? 1분 안내 보기",
    guideEyebrow: "처음 오셨다면",
    guideTitle: "결과를 보는 방법부터 알려드릴게요.",
    guideBody: "실제 화면을 보면서 네 단계만 따라오면 돼요.",
    guideScreenLabel: "실제 이용 화면",
    guideSteps: [
      ["질문 고르기", "지금 궁금한 것을 고릅니다", "관계, 일, 돈, 나 자신 중에서 하나를 골라요."],
      ["생년월일 넣기", "생년월일을 넣습니다", "회원가입 없이 기본 결과를 볼 수 있어요."],
      ["무료 결과 보기", "내 기본 패턴을 확인합니다", "결과와 계산 과정을 함께 보여드려요."],
      ["더 자세히 보기", "필요할 때 상세 리딩을 고릅니다", "가격과 내용을 확인한 뒤 선택할 수 있어요."],
    ],
    guideAction: "결과 예시 보기",
    guideClose: "안내 닫기",
    trustItems: [
      ["정확한 계산", "같은 입력은 같은 결과"],
      ["쉬운 해석", "생활에 맞춘 설명"],
      ["다양한 분석", "사주·나의 패턴·궁합·공간운"],
      ["안전한 이용", "기록과 개인정보 직접 관리"],
    ],
    readEyebrow: "태령당에서 할 수 있는 것",
    readTitle: <>지금 궁금한 걸<br />바로 볼 수 있어요.</>,
    readBody: "나를 알아보고, 둘을 비교하고, 내 방까지 살펴볼 수 있어요.",
    sajuHub: "사주 보기",
    freePattern: "나 알아보기",
    pillars: [
      ["01", "타고난 기질과 흐름", "사주", "명식과 오행을 계산 근거와 함께 살펴봅니다.", "/ko/fortune"],
      ["02", "반복되는 나의 패턴", "생년월일 패턴", "생년월일에 담긴 핵심 수와 선택의 흐름을 봅니다.", "/ko/numerology"],
      ["03", "두 사람의 차이와 조화", "궁합", "연인·가족·동료가 부딪히고 맞는 지점을 비교합니다.", "/ko/compatibility"],
      ["04", "내 방의 흐름", "3D 공간운", "지금 배치와 추천 배치를 실제 3D로 비교합니다.", "/ko/space"],
    ],
    previewEyebrow: "개인 패턴 분석",
    previewTitle: <>왜 같은 선택을 반복하는지<br />한눈에 보여드려요.</>,
    previewBody: "내 강점, 자주 막히는 지점, 지금 바꿔볼 한 가지를 계산 과정과 함께 정리해요.",
    previewCta: "내 결과 보기",
    sample: "예시 결과",
    sampleDate: "1994년 11월 4일",
    sampleHeadline: "깊이 생각하고 사람을 잘 살피지만, 결정할 때 혼자 오래 고민하는 편이에요.",
    samplePoints: ["내가 잘하는 것", "자꾸 반복되는 선택", "지금 바꿔볼 한 가지"],
    chartLabels: ["사고력", "표현력", "실행력", "관계감각", "회복력", "변화적응"],
    successEyebrow: "성공 패턴 비교",
    successTitle: <>성공한 사람과 나는<br />무엇이 다를까요?</>,
    successBody: "공개된 생년월일과 실제 경력 기록을 나란히 봐요. 닮았다고 같은 결과가 생기는 것은 아니에요.",
    successCta: "비교해보기",
    relationshipEyebrow: "관계 보기",
    relationshipTitle: <>둘이 어디서 잘 맞고<br />어디서 부딪힐까요?</>,
    relationshipBody: "연인, 가족, 친구, 동료와 생각하고 행동하는 방식을 비교해요.",
    relationshipCta: "둘의 관계 보기",
    relationshipCompare: "둘의 차이를 나란히 봅니다",
    relationshipAxes: ["말하는 방식", "결정하는 속도", "혼자 필요한 시간"],
    spaceEyebrow: "3D 공간운",
    spaceTitle: <>내 방, 어디를<br /><span>바꾸면 좋을까요?</span></>,
    spaceBody: "방을 찍으면 지금 모습과 바꾼 모습을 3D로 비교해요.",
    spaceSteps: ["방 사진 찍기", "북쪽 알려주기", "바꾼 모습 보기"],
    spaceCta: "내 방 분석하기",
    spaceDemo: "3D 예시 먼저 보기",
    before: "현재 배치",
    after: "추천 배치",
    spaceBubble: "침대 옆 길을 조금 넓혀보세요.",
    spaceDisclosure: "풍수 해석과 생활에 필요한 조언을 따로 보여드려요.",
    realityEyebrow: "다시 확인하기",
    realityTitle: <>나중에 다시 보고,<br />실제로 어땠는지 남겨요.</>,
    realityBody: "한 달 뒤에 돌아와 결과가 맞았는지 간단히 기록할 수 있어요.",
    realityCta: "기록 남기기",
    realitySteps: ["오늘의 해석 저장", "생활에서 확인", "다음 분석에 반영"],
    proportionEyebrow: "사람과 수의 비례",
    proportionTitle: <>숫자는 답이 아니라,<br />나를 살펴보는 기준입니다.</>,
    proportionBody: "레오나르도 다 빈치의 인체 비례 연구에서 영감을 받은 기하학 도판입니다. 태령당은 상징 해석과 계산값을 구분하고, 같은 생년월일은 언제나 같은 값으로 계산합니다.",
    proportionCta: "내 숫자 계산해보기",
    proportionAlt: "직선과 비례선 안에 사람의 신체 비율을 표시한 고전 기하학 연구 도판",
    closeTitle: "궁금한 것부터 시작해보세요.",
    closeBody: "기본 분석은 무료로 바로 볼 수 있어요.",
    closeCta: "무료로 나 알아보기",
    benefits: ["쉽게 시작", "계산 과정 확인", "내 결과 보관", "나중에 다시 보기"],
    footerBody: "나와 관계, 공간의 흐름을 쉽게 살펴보는 곳.",
    footerBoundary: "사주·생년월일 패턴·풍수는 성찰을 위한 상징적 도구이며 과학적 예측, 진단, 치료 또는 결과 보장이 아닙니다.",
    copyright: "별루프 · 대표 박서준 · 사업자등록번호 482-12-03629 · 부산광역시 북구",
  },
  en: {
    navLabel: "Taeryeongdang main navigation",
    services: "Services", guide: "First visit", analysis: "Pattern analysis", success: "Success patterns", relationship: "Relationships", space: "3D Space", reviews: "Reviews", login: "Purchases", start: "Start now",
    kicker: "People, relationships, spaces, and lived experience",
    title: <>There may be a reason<br />the same patterns<br /><em>keep returning.</em></>,
    heroBody: "Taeryeongdang connects symbolic traditions, deterministic calculations, and what you record from real life.",
    heroPrimary: "See my patterns", heroSecondary: "Meet Taeryeongdang", heroNote: "Free foundation · Visible calculations · Reality-checked", heroArtNote: "Brand scene · generated image",
    guideCue: "New here? See the one-minute guide",
    guideEyebrow: "FIRST VISIT",
    guideTitle: "See how a result works before you begin.",
    guideBody: "Follow four short steps using the real product screens.",
    guideScreenLabel: "ACTUAL PRODUCT SCREEN",
    guideSteps: [
      ["Choose a question", "Choose what is on your mind", "Start with relationships, work, money, or yourself."],
      ["Add a birth date", "Enter your birth date", "See the basic result without creating an account."],
      ["Read the free result", "See your basic pattern", "The result and calculation are shown together."],
      ["Go deeper if needed", "Choose a detailed reading only if needed", "Review the contents and price before deciding."],
    ],
    guideAction: "See a sample result",
    guideClose: "Close guide",
    trustItems: [
      ["Auditable calculation", "The same input returns the same result"],
      ["Practical interpretation", "Clear language for everyday choices"],
      ["Connected services", "Saju, personal patterns, compatibility and space"],
      ["Private by design", "You control your records and data"],
    ],
    readEyebrow: "WHAT YOU CAN DO", readTitle: <>Start with what<br />you want to understand.</>, readBody: "Explore yourself, compare two people, and even review your room.", sajuHub: "Open Four Pillars services", freePattern: "View free pattern",
    pillars: [
      ["01", "Read yourself.", "Saju · birth-date patterns", "Calculated evidence and symbolic interpretation stay distinct.", "/en/numerology"],
      ["02", "Compare people.", "Success pattern comparison", "Only structures calculated from public birth dates are compared.", "/en/celebrity"],
      ["03", "Read relationships.", "Compatibility · relationships", "See how two people operate and where friction may arise.", "/en/relationship"],
      ["04", "Read the space.", "3D Space", "Compare room structure and circulation in a real 3D scene.", "/en/space"],
      ["05", "Check real life.", "Reality Check", "Record whether an interpretation held up and revisit it later.", "/en/reality-check"],
    ],
    previewEyebrow: "PERSONAL PATTERN ANALYSIS", previewTitle: <>See why the same choices<br />keep returning.</>, previewBody: "Your strengths, recurring friction, and one practical change are shown with the calculation behind them.", previewCta: "Start free analysis", sample: "Sample result", sampleDate: "4 November 1994", sampleHeadline: "You think deeply and notice people well, but may spend too long deciding alone.", samplePoints: ["What comes naturally", "The choice that repeats", "One thing to try now"], chartLabels: ["Thinking", "Expression", "Action", "Connection", "Recovery", "Adaptation"],
    successEyebrow: "SUCCESS PATTERN COMPARISON", successTitle: <>Look past matching numbers<br />to how lives diverged.</>, successBody: "We use public birth dates and sourced career events. A public figure's life does not determine your future.", successCta: "Compare my success pattern",
    relationshipEyebrow: "RELATIONSHIP INTELLIGENCE", relationshipTitle: <>See where you diverge,<br />not just whether you match.</>, relationshipBody: "Compare how partners, family, friends, coworkers, or business partners operate across eight domains. No score decides whether a relationship is good or bad.", relationshipCta: "Start relationship analysis",
    relationshipCompare: "See the differences side by side",
    relationshipAxes: ["How you communicate", "How quickly you decide", "Time you need alone"],
    spaceEyebrow: "3D SPACE", spaceTitle: <>Your room,<br /><span>what could work better?</span></>, spaceBody: "Add room photos to compare your current and suggested layouts side by side in 3D.", spaceSteps: ["Take 2–6 room photos", "Show which way is north", "Compare the suggested layout"], spaceCta: "Analyze my room", spaceDemo: "Try the 3D example", before: "Current", after: "Suggested", spaceBubble: "Try widening the path beside the bed.", spaceDisclosure: "Traditional feng shui and practical room advice are clearly separated.",
    realityEyebrow: "REALITY CHECK", realityTitle: <>Go beyond interpretation.<br />Check it against real life.</>, realityBody: "A later reflection becomes evidence for the next reading. Results that missed remain visible too.", realityCta: "Start Reality Check", realitySteps: ["Save today's reading", "Check it in daily life", "Use it in the next reading"],
    proportionEyebrow: "HUMAN PROPORTION AND NUMBER",
    proportionTitle: <>Numbers are a reference<br />for reflection, not an answer.</>,
    proportionBody: "This geometric study is inspired by Leonardo da Vinci's work on human proportion. Taeryeongdang separates symbolic interpretation from calculated values, and the same birth date always returns the same calculation.",
    proportionCta: "Calculate my numbers",
    proportionAlt: "A classical geometry study showing human proportions with straight measurement lines",
    closeTitle: "Begin your story today.", closeBody: "Read where you are now, then return to see what matched real life.", closeCta: "Start free", benefits: ["Simple start", "Visible evidence", "Personal report", "Ongoing checks"], footerBody: "Personal Pattern Intelligence that turns symbols into real questions and checks them against lived experience.", footerBoundary: "Saju, birth-date patterns, and feng shui are symbolic reflection tools, not scientific prediction, diagnosis, treatment, or guaranteed outcomes.", copyright: "Byeolloof · Busan, Republic of Korea",
  },
} as const;

function Arrow() {
  return <span aria-hidden="true">→</span>;
}

function ProportionStudy({ label, locale }: { label: string; locale: Locale }) {
  return <figure className="td2-proportion-study">
    <svg aria-label={label} role="img" viewBox="0 0 680 560">
      <title>{label}</title>
      <g className="td2-study-grid" aria-hidden="true">
        {[100, 160, 220, 280, 340, 400, 460, 520, 580].map((x) => <line key={`x-${x}`} x1={x} x2={x} y1="42" y2="510" />)}
        {[50, 110, 170, 230, 290, 350, 410, 470].map((y) => <line key={`y-${y}`} x1="80" x2="600" y1={y} y2={y} />)}
      </g>
      <g className="td2-study-frame" aria-hidden="true">
        <rect height="460" width="440" x="120" y="50" />
        <path d="M120 510 340 50 560 510Z" />
        <path d="M120 50 560 510M560 50 120 510" />
        <line x1="340" x2="340" y1="34" y2="526" />
        <line x1="100" x2="580" y1="276" y2="276" />
      </g>
      <g className="td2-study-figure" aria-hidden="true">
        <ellipse cx="340" cy="127" rx="27" ry="34" />
        <path d="M326 158 315 177 291 198 280 285 299 351 340 369 381 351 400 285 389 198 365 177 354 158" />
        <path d="M315 177 340 194 365 177M291 198 340 216 389 198M300 351 340 333 380 351" />
        <path d="M291 201 216 228 126 276M389 201 464 228 554 276" />
        <path d="M291 204 205 180 132 120M389 204 475 180 548 120" />
        <path d="M299 350 272 420 235 508M381 350 408 420 445 508" />
        <path d="M310 358 301 430 299 510M370 358 379 430 381 510" />
        <path d="M324 211 316 282 325 334M356 211 364 282 355 334M316 282 364 282" />
      </g>
      <g className="td2-study-measures" aria-hidden="true">
        <path d="M92 50H108M92 110H108M92 170H108M92 230H108M92 290H108M92 350H108M92 410H108M92 470H108M92 510H108" />
        <path d="M120 526V542M180 526V542M240 526V542M300 526V542M360 526V542M420 526V542M480 526V542M540 526V542M560 526V542" />
      </g>
      <text className="td2-study-label" x="82" y="30">HUMAN PROPORTION · 01</text>
      <text className="td2-study-label" x="478" y="30">1 : √2</text>
      <text className="td2-study-label" x="82" y="552">BODY / LINE / MEASURE</text>
    </svg>
    <figcaption>{locale === "ko" ? "고전 인체 비례 연구에서 영감을 받은 벡터 도판" : "A vector study inspired by classical research on human proportion"}</figcaption>
  </figure>;
}

function GuideScreenPreview({ locale, step, label }: { locale: Locale; step: number; label: string }) {
  const ko = locale === "ko";
  return <div aria-label={label} className="td2-guide-screen" role="img">
    <header><span>태령당</span><small>{ko ? `이용 안내 ${step + 1}/4` : `QUICK GUIDE ${step + 1}/4`}</small></header>
    {step === 0 && <div className="td2-guide-questions">
      <p>{ko ? "어떤 게 제일 궁금한가요?" : "What is on your mind?"}</p>
      {[ko ? "연애·관계" : "Love & relationships", ko ? "일·진로" : "Work & direction", ko ? "돈·사업" : "Money & business"].map((item, index) => <div className={index === 0 ? "is-picked" : undefined} key={item}><b>{String(index + 1).padStart(2, "0")}</b><span>{item}</span><Arrow /></div>)}
    </div>}
    {step === 1 && <div className="td2-guide-intake">
      <small>{ko ? "생년월일" : "BIRTH DATE"}</small><strong>1994. 11. 04</strong>
      <div><span>{ko ? "양력" : "SOLAR"}</span><span>{ko ? "태어난 시간 모름" : "TIME UNKNOWN"}</span></div>
      <label><i>✓</i>{ko ? "분석을 위해 입력한 정보를 확인했어요." : "I reviewed the information for this analysis."}</label>
      <button type="button" tabIndex={-1}>{ko ? "무료 결과 보기" : "See free result"}<Arrow /></button>
    </div>}
    {step === 2 && <div className="td2-guide-result">
      <small>{ko ? "나의 핵심 패턴" : "MY CORE PATTERN"}</small><div className="td2-guide-number">11</div>
      <h3>{ko ? "깊이 보고, 의미를 연결하는 사람" : "You look deeper and connect meaning."}</h3>
      <div className="td2-guide-metrics"><span><b>82</b>{ko ? "사고력" : "Thinking"}</span><span><b>88</b>{ko ? "관계감각" : "Connection"}</span><span><b>76</b>{ko ? "회복력" : "Recovery"}</span></div>
      <p>{ko ? "계산 근거와 상징 해석을 나눠서 보여드려요." : "Calculations and symbolic interpretation stay separate."}</p>
    </div>}
    {step === 3 && <div className="td2-guide-report">
      <div className="td2-guide-report-nav"><b>{ko ? "핵심 요약" : "Summary"}</b><span>{ko ? "강점" : "Strengths"}</span><span>{ko ? "주의점" : "Cautions"}</span></div>
      <h3>{ko ? "결과를 생활에서 어떻게 써볼지 정리했어요." : "See how to use the result in daily life."}</h3>
      {[ko ? "자주 반복되는 선택" : "Recurring choices", ko ? "지금 바꿔볼 한 가지" : "One change to try", ko ? "나중에 확인할 질문" : "A question to revisit"].map((item, index) => <div className="td2-guide-report-row" key={item}><b>0{index + 1}</b><span>{item}</span><i style={{ width: `${82 - index * 13}%` }} /></div>)}
      <footer><span>{ko ? "계산" : "FACT"}</span><span>{ko ? "상징" : "SYMBOL"}</span><span>{ko ? "현실 확인" : "REALITY"}</span></footer>
    </div>}
  </div>;
}

export function TaeryeongLanding({ locale, reviewCount }: Props) {
  const t = content[locale];
  const pillars = t.pillars;
  const reviewLabel = reviewCount && reviewCount > 0
    ? `${t.reviews} ${reviewCount}`
    : t.reviews;

  const track = () => captureConversionEvent("primary_cta_click", locale, { location: "hero" });
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const guideRef = useRef<HTMLElement>(null);
  const guideTabsRef = useRef<HTMLDivElement>(null);
  const guideCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setGuideOpen(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!guideOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => guideCloseRef.current?.focus(), 0);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeGuide();
      if (event.key !== "Tab") return;
      const controls = [...(guideRef.current?.querySelectorAll<HTMLElement>("button, a[href], [tabindex='0']") ?? [])]
        .filter((control) => !control.hasAttribute("disabled") && control.offsetParent !== null);
      const first = controls[0];
      const last = controls.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [guideOpen]);

  function openGuide() {
    setGuideOpen(true);
  }

  function closeGuide() {
    setGuideOpen(false);
  }

  return <main className="td2" id="main-content" tabIndex={-1}>
    <header className="td2-nav-shell">
      <Link className="td2-brand" href={`/${locale}`} prefetch={false} aria-label={locale === "ko" ? "태령당 홈" : "Taeryeongdang home"}>
        <strong>태령당</strong><small>PERSONAL PATTERN INTELLIGENCE</small>
      </Link>
      <nav className="td2-nav" aria-label={t.navLabel}>
        <a href="#guide" onClick={(event) => { event.preventDefault(); openGuide(); }}>{t.guide}</a>
        <Link href={`/${locale}/numerology`} prefetch={false}>{t.analysis}</Link>
        <Link href={`/${locale}/celebrity`} prefetch={false}>{t.success}</Link>
        <Link href={`/${locale}/compatibility`} prefetch={false}>{t.relationship}</Link>
        <Link href={`/${locale}/space`} prefetch={false}>{t.space}</Link>
        <Link href={`/${locale}/reading#evidence`} prefetch={false}>{reviewLabel}</Link>
      </nav>
      <div className="td2-nav-actions">
        <Link className="td2-login" href={`/${locale}/orders`} prefetch={false}>{t.login}</Link>
        <Link className="td2-pill" href={`/${locale}/fortune`} prefetch={false}>{t.start}<Arrow /></Link>
        <Link className="td2-language" href={`/${locale === "ko" ? "en" : "ko"}`} prefetch={false}>{locale === "ko" ? "EN" : "한국어"}</Link>
      </div>
    </header>

    <section className="td2-hero" aria-labelledby="td2-hero-title">
      <Image className="td2-hero-image" src="/images/brand/taeryeong-night-hero-v3.jpg" alt="" fill priority quality={92} sizes="100vw" />
      <div className="td2-hero-wash" aria-hidden="true" />
      <div className="td2-hero-copy">
        <p className="td2-kicker">{t.kicker}</p>
        <h1 id="td2-hero-title">{t.title}</h1>
        <p className="td2-lead">{t.heroBody}</p>
        <div className="td2-actions">
          <Link className="td2-primary" href={`/${locale}/fortune`} prefetch={false} onClick={track}>{t.heroPrimary}<Arrow /></Link>
          <a className="td2-secondary" href="#services">{t.heroSecondary}<Arrow /></a>
        </div>
        <p className="td2-note">{t.heroNote.split(" · ").map((part, index) => <span key={part}>{index > 0 ? " · " : ""}{part}</span>)}</p>
        <button className="td2-guide-cue" onClick={openGuide} type="button">{t.guideCue}<Arrow /></button>
      </div>
      <div className="td2-hero-signature" aria-hidden="true"><span>태</span><span>령</span><span>당</span></div>
      <small className="td2-hero-art-note">{t.heroArtNote}</small>
    </section>

    <section className="td2-trust-strip" aria-label={locale === "ko" ? "태령당 이용 원칙" : "Taeryeongdang service principles"}>
      {t.trustItems.map(([title, body]) => <div key={title}><strong>{title}</strong><span>{body}</span></div>)}
    </section>

    <nav className="td2-story-nav" aria-label={locale === "ko" ? "메인 소개 바로가기" : "Home story navigation"}>
      <a className="is-current" href="#main-content">{locale === "ko" ? "태령당" : "Home"}</a>
      <a href="#services">{locale === "ko" ? "살펴보기" : "Explore"}</a>
      <a href="#guide">{locale === "ko" ? "경험하기" : "Try it"}</a>
    </nav>

    <section className="td2-section td2-reading-map" id="services" aria-labelledby="td2-services-title">
      <header className="td2-heading">
        <div><p>{t.readEyebrow}</p><h2 id="td2-services-title">{t.readTitle}</h2></div>
        <span>{t.readBody}</span>
      </header>
      <div className="td2-service-bridges">
        <Link href={`/${locale}/fortune`} prefetch={false}>{t.sajuHub}<Arrow /></Link>
        <Link href={`/${locale}/numerology`} prefetch={false}>{t.freePattern}<Arrow /></Link>
      </div>
      <div className="td2-pillar-grid">
        {pillars.map(([number, title, label, body, href]) => <Link href={href} className="td2-pillar" key={number} prefetch={false}>
          <small>{number}</small><h3>{title}</h3><strong>{label}</strong><p>{body}</p><Arrow />
        </Link>)}
      </div>
    </section>

    {guideOpen && <div className="td2-guide-modal" onMouseDown={(event) => { if (event.target === event.currentTarget) closeGuide(); }}>
    <section aria-modal="true" className="td2-walkthrough" id="guide" aria-labelledby="td2-guide-title" ref={guideRef} role="dialog">
      <button aria-label={t.guideClose} className="td2-guide-close" onClick={closeGuide} ref={guideCloseRef} type="button">×</button>
      <header>
        <p className="td2-eyebrow">{t.guideEyebrow}</p>
        <h2 id="td2-guide-title">{t.guideTitle}</h2>
        <p>{t.guideBody}</p>
      </header>
      <div className="guide-walk">
        <div
          className="guide-steps-tabs"
          role="tablist"
          aria-label={t.guideTitle}
          ref={guideTabsRef}
          onKeyDown={(event) => {
            const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
            if (!delta) return;
            event.preventDefault();
            const next = (guideStep + delta + GUIDE_SCREENS.length) % GUIDE_SCREENS.length;
            setGuideStep(next);
            guideTabsRef.current?.querySelectorAll("button")[next]?.focus();
          }}
        >
          {t.guideSteps.map(([label], index) => <button
            aria-controls="td2-guide-stage"
            aria-selected={guideStep === index}
            className={guideStep === index ? "is-current" : undefined}
            id={`td2-guide-tab-${index}`}
            key={label}
            onClick={() => setGuideStep(index)}
            role="tab"
            tabIndex={guideStep === index ? 0 : -1}
            type="button"
          ><small aria-hidden="true">{String(index + 1).padStart(2, "0")}</small><span>{label}</span></button>)}
        </div>
        <p className="guide-stage-eyebrow">{t.guideScreenLabel}</p>
        <div
          aria-labelledby={`td2-guide-tab-${guideStep}`}
          className="guide-walk-body"
          id="td2-guide-stage"
          role="tabpanel"
          tabIndex={0}
        >
          <div className="guide-stage-title"><strong>{t.guideSteps[guideStep]![1]}</strong><span>{t.guideSteps[guideStep]![2]}</span></div>
          <div className="guide-stage">
            <GuideScreenPreview label={t.guideSteps[guideStep]![1]} locale={locale} step={guideStep} />
          </div>
        </div>
      </div>
      <button className="journey-guide-action" onClick={() => { closeGuide(); window.setTimeout(() => document.querySelector(".td2-product-section")?.scrollIntoView({ behavior: "smooth" }), 0); }} type="button">{t.guideAction}<Arrow /></button>
    </section>
    </div>}

    <section className="td2-section td2-product-section" aria-labelledby="td2-preview-title">
      <div className="td2-copy-column">
        <p className="td2-eyebrow">{t.previewEyebrow}</p>
        <h2 id="td2-preview-title">{t.previewTitle}</h2>
        <p>{t.previewBody}</p>
        <Link className="td2-text-link" href={`/${locale}/numerology`} prefetch={false} onClick={track}>{t.previewCta}<Arrow /></Link>
      </div>
      <article className="td2-report-preview" aria-label={t.sample}>
        <header><div><small>{t.sample}</small><strong>{t.sampleDate}</strong></div></header>
        <nav aria-label={locale === "ko" ? "예시 리포트 목차" : "Sample report sections"}><b>{locale === "ko" ? "전체 성향" : "Overview"}</b><span>{locale === "ko" ? "강점" : "Strengths"}</span><span>{locale === "ko" ? "주의점" : "Cautions"}</span><span>{locale === "ko" ? "인생 흐름" : "Rhythm"}</span></nav>
        <h3>{t.sampleHeadline}</h3>
        <ol className="td2-report-points">
          {t.samplePoints.map((point, index) => <li key={point}><small>{String(index + 1).padStart(2, "0")}</small><strong>{point}</strong></li>)}
        </ol>
        <div className="td2-score-row">
          <div className="td2-score-summary" aria-hidden="true"><small>{locale === "ko" ? "핵심 항목" : "CORE AREAS"}</small><strong>6</strong><span>{locale === "ko" ? "계산값을 나란히 비교" : "calculated values compared"}</span></div>
          <dl>{t.chartLabels.map((label, index) => <div key={label}><dt>{label}</dt><dd><span style={{ width: `${[82,72,64,88,76,69][index]}%` }} /></dd></div>)}</dl>
        </div>
        <footer><span>{locale === "ko" ? "계산 근거" : "Calculation"}<b>11 · 4 · 6 · 7</b></span><span>{locale === "ko" ? "해석 구분" : "Evidence labels"}<b>{locale === "ko" ? "계산 · 상징 · 현실" : "fact · symbol · reality"}</b></span></footer>
      </article>
    </section>

    <section className="td2-editorial-pair">
      <article className="td2-success" aria-labelledby="td2-success-title">
        <div className="td2-copy-column">
          <p className="td2-eyebrow">{t.successEyebrow}</p><h2 id="td2-success-title">{t.successTitle}</h2><p>{t.successBody}</p>
          <Link className="td2-text-link" href={`/${locale}/celebrity`} prefetch={false}>{t.successCta}<Arrow /></Link>
        </div>
        <div className="td2-success-canvas" aria-hidden="true">
          <span className="td2-rank">01</span>
          <div><small>{locale === "ko" ? "공공 리더십" : "PUBLIC LEADERSHIP"}</small><strong>{locale === "ko" ? "버락 오바마" : "Barack Obama"}</strong><p>{locale === "ko" ? "두드러진 구조 겹침" : "Strong structural overlap"}</p></div>
          <aside><small>{locale === "ko" ? "출처가 있는 실제 경력 사건" : "Sourced career event"}</small><time>2009-01-20</time><p>{locale === "ko" ? "미국 제44대 대통령으로 취임했습니다." : "Inaugurated as the 44th U.S. President."}</p></aside>
        </div>
      </article>

      <article className="td2-relationship" aria-labelledby="td2-relationship-title">
        <div className="td2-copy-column">
          <p className="td2-eyebrow">{t.relationshipEyebrow}</p><h2 id="td2-relationship-title">{t.relationshipTitle}</h2><p>{t.relationshipBody}</p>
          <Link className="td2-text-link" href={`/${locale}/relationship`} prefetch={false}>{t.relationshipCta}<Arrow /></Link>
        </div>
        <div className="td2-relationship-compare" aria-hidden="true">
          <header><span>{locale === "ko" ? "나" : "ME"}</span><b>{t.relationshipCompare}</b><span>{locale === "ko" ? "상대" : "THEM"}</span></header>
          {t.relationshipAxes.map((axis, index) => <div key={axis}><strong>{axis}</strong><span style={{ width: `${74 - index * 9}%` }} /><i /><span style={{ width: `${48 + index * 12}%` }} /></div>)}
        </div>
      </article>
    </section>

    <section className="td2-space" aria-labelledby="td2-space-title">
      <div className="td2-space-copy">
        <p className="td2-eyebrow">{t.spaceEyebrow}</p><h2 id="td2-space-title">{t.spaceTitle}</h2><p>{t.spaceBody}</p>
        <ol className="td2-space-steps">{t.spaceSteps.map((step, index) => <li key={step}><b>{index + 1}</b><span>{step}</span></li>)}</ol>
        <div className="td2-actions"><Link className="td2-primary" href={`/${locale}/space`} prefetch={false}>{t.spaceCta}<Arrow /></Link><Link className="td2-space-link" href={`/${locale}/space#space-demo`} prefetch={false}>{t.spaceDemo}</Link></div>
        <small>{t.spaceDisclosure}</small>
      </div>
      <div className="td2-space-stage">
        <div className="td2-space-tabs" aria-hidden="true"><b>{locale === "ko" ? "전체 분석" : "Overview"}</b><span>{locale === "ko" ? "가구 배치" : "Layout"}</span><span>{locale === "ko" ? "채광·환기" : "Light"}</span><span>{locale === "ko" ? "생활 동선" : "Flow"}</span></div>
        <div className="td2-room-comparison">
          <figure><Image src="/images/space/previews/bedroom-before-v1.png" alt={locale === "ko" ? "태령당 3D 예시 방의 현재 배치" : "Current layout in the real 3D room example"} width={1354} height={1082} sizes="(max-width: 760px) 100vw, (max-width: 1100px) 46vw, 34vw" /><figcaption>{t.before}</figcaption></figure>
          <figure><Image src="/images/space/previews/bedroom-after-v1.png" alt={locale === "ko" ? "태령당 3D 예시 방의 추천 배치" : "Suggested layout in the real 3D room example"} width={1354} height={1082} sizes="(max-width: 760px) 100vw, (max-width: 1100px) 46vw, 34vw" /><figcaption>{t.after}</figcaption></figure>
          <span className="td2-compare-arrow" aria-hidden="true">→</span>
        </div>
        <div className="td2-guide">
          <Image src="/assets/gyeol-webtoon/characters/taeryeong/taeryeong_explain_calm_01.png" alt="" width={130} height={130} />
          <p>{t.spaceBubble}</p>
        </div>
      </div>
    </section>

    <section className="td2-reality" aria-labelledby="td2-reality-title">
      <div><p className="td2-eyebrow">{t.realityEyebrow}</p><h2 id="td2-reality-title">{t.realityTitle}</h2><p>{t.realityBody}</p><Link className="td2-light-button" href={`/${locale}/reality-check`} prefetch={false}>{t.realityCta}<Arrow /></Link></div>
      <ol className="td2-reality-steps">{t.realitySteps.map((step, index) => <li key={step}><small>0{index + 1}</small><strong>{step}</strong></li>)}</ol>
    </section>

    <section className="td2-proportion" aria-labelledby="td2-proportion-title">
      <div className="td2-proportion-copy"><p className="td2-eyebrow">{t.proportionEyebrow}</p><h2 id="td2-proportion-title">{t.proportionTitle}</h2><p>{t.proportionBody}</p><Link className="td2-primary" href={`/${locale}/numerology`} prefetch={false}>{t.proportionCta}<Arrow /></Link></div>
      <ProportionStudy label={t.proportionAlt} locale={locale} />
    </section>

    <section className="td2-close" aria-labelledby="td2-close-title">
      <div><h2 id="td2-close-title">{t.closeTitle}</h2><p>{t.closeBody}</p><Link className="td2-primary" href={`/${locale}/numerology`} prefetch={false} onClick={track}>{t.closeCta}<Arrow /></Link></div>
      <ul>{t.benefits.map((item, index) => <li key={item}><span>{["♙", "⌁", "◴", "△"][index]}</span>{item}</li>)}</ul>
      <div className="td2-mountain" aria-hidden="true" />
      <div className="td2-close-signature" aria-hidden="true"><span>태</span><span>령</span><span>당</span></div>
    </section>

    <footer className="td2-footer">
      <div><Link className="td2-brand" href={`/${locale}`} prefetch={false}><strong>태령당</strong><small>TAERYEONGDANG</small></Link><p>{t.footerBody}</p></div>
      <nav aria-label={locale === "ko" ? "법률 및 고객 지원" : "Legal and support"}><Link href={`/${locale}/terms`} prefetch={false}>{locale === "ko" ? "이용조건" : "Terms"}</Link><Link href={`/${locale}/privacy`} prefetch={false}>{locale === "ko" ? "개인정보" : "Privacy"}</Link><Link href={`/${locale}/orders`} prefetch={false}>{t.login}</Link><Link href={`/${locale}/support`} prefetch={false}>{locale === "ko" ? "고객 문의" : "Support"}</Link></nav>
      <p className="td2-footer-boundary">{t.footerBoundary}</p><small>{t.copyright}</small>
    </footer>
  </main>;
}
