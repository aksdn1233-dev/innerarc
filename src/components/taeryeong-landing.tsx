"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DailyHealingHome, type DailyHealingReportPreview } from "@/components/daily-healing-home";
import { captureConversionEvent } from "@/core/analytics";
import type { PublicReview } from "@/core/reviews";
import type { Locale } from "@/i18n/config";

type Props = {
  dreamAvailable: boolean;
  locale: Locale;
  reportPreview: DailyHealingReportPreview;
  reviews: readonly PublicReview[];
  reviewCount: number | null;
};

const GUIDE_SCREENS = ["questions", "intake", "free-result", "report", "dreams", "space"] as const;
const GUIDE_STEP_DURATION_MS = 6_000;

const content = {
  ko: {
    navLabel: "태령당 주요 메뉴",
    services: "서비스",
    guide: "이용 안내",
    analysis: "생년월일 패턴",
    success: "유명인 비교",
    relationship: "궁합",
    space: "풍수학",
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
    guideTitle: "결과 보는 법부터 같이 볼게요.",
    guideBody: "6초마다 다음 장면으로 넘어가요. 궁금한 기능은 눌러서 다시 볼 수 있어요.",
    guideScreenLabel: "실제 이용 화면",
    guideSteps: [
      ["질문 고르기", "지금 궁금한 걸 골라봐요", "관계, 일, 돈, 나 자신 중에서 하나를 골라요."],
      ["생년월일 넣기", "생년월일을 넣어봐요", "회원가입 없이 기본 결과를 볼 수 있어요."],
      ["무료 결과 보기", "내 기본 패턴을 확인해요", "결과와 계산 과정을 함께 보여드려요."],
      ["더 자세히 보기", "필요할 때 상세 리딩을 골라봐요", "가격과 내용을 확인한 뒤 선택할 수 있어요."],
      ["꿈 패턴 보기", "꿈을 적고 반복을 찾아봐요", "장면·감정·현실을 나눠 보고 3·7·30일 뒤 다시 확인해요."],
      ["방을 3D로 보기", "사진으로 내 방을 3D로 살펴봐요", "동서남북과 가구를 확인하고 현재 배치와 추천 배치를 비교해요."],
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
      ["04", "내 방의 흐름", "풍수학", "지금 배치와 추천 배치를 실제 3D로 비교합니다.", "/ko/space"],
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
    spaceEyebrow: "풍수학 · 3D 공간 분석",
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
    celestialEyebrow: "천문 · 절기 · 사주",
    celestialTitle: <>하늘의 절기와<br />태어난 때를 함께 봅니다.</>,
    celestialBody: "사주는 태어난 날짜와 시간을 절기 기준으로 계산해 연·월·일·시 네 기둥을 세웁니다. 전통 해석과 계산 근거를 나눠 보여드려요.",
    celestialCta: "내 사주 계산해보기",
    celestialAlt: "북두칠성과 절기선, 연월일시 네 기둥을 함께 표시한 고전 천문 도판",
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
    services: "Services", guide: "First visit", analysis: "Pattern analysis", success: "Success patterns", relationship: "Relationships", space: "Feng Shui", reviews: "Reviews", login: "Purchases", start: "Start now",
    kicker: "People, relationships, spaces, and lived experience",
    title: <>There may be a reason<br />the same patterns<br /><em>keep returning.</em></>,
    heroBody: "Taeryeongdang connects symbolic traditions, deterministic calculations, and what you record from real life.",
    heroPrimary: "See my patterns", heroSecondary: "Meet Taeryeongdang", heroNote: "Free foundation · Visible calculations · Reality-checked", heroArtNote: "Brand scene · generated image",
    guideCue: "New here? See the one-minute guide",
    guideEyebrow: "FIRST VISIT",
    guideTitle: "See how a result works before you begin.",
    guideBody: "Six scenes advance every six seconds. Select any feature to replay it.",
    guideScreenLabel: "ACTUAL PRODUCT SCREEN",
    guideSteps: [
      ["Choose a question", "Choose what is on your mind", "Start with relationships, work, money, or yourself."],
      ["Add a birth date", "Enter your birth date", "See the basic result without creating an account."],
      ["Read the free result", "See your basic pattern", "The result and calculation are shown together."],
      ["Go deeper if needed", "Choose a detailed reading only if needed", "Review the contents and price before deciding."],
      ["Read dream patterns", "Record a dream and find repetition", "Separate scenes, feelings, and real life, then check again after 3, 7, and 30 days."],
      ["See the room in 3D", "Turn room photos into a 3D space", "Confirm directions and furniture, then compare the current and suggested layouts."],
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
      ["04", "Read the space.", "Feng Shui", "Compare room structure and circulation in a real 3D scene.", "/en/space"],
      ["05", "Check real life.", "Reality Check", "Record whether an interpretation held up and revisit it later.", "/en/reality-check"],
    ],
    previewEyebrow: "PERSONAL PATTERN ANALYSIS", previewTitle: <>See why the same choices<br />keep returning.</>, previewBody: "Your strengths, recurring friction, and one practical change are shown with the calculation behind them.", previewCta: "Start free analysis", sample: "Sample result", sampleDate: "4 November 1994", sampleHeadline: "You think deeply and notice people well, but may spend too long deciding alone.", samplePoints: ["What comes naturally", "The choice that repeats", "One thing to try now"], chartLabels: ["Thinking", "Expression", "Action", "Connection", "Recovery", "Adaptation"],
    successEyebrow: "SUCCESS PATTERN COMPARISON", successTitle: <>Look past matching numbers<br />to how lives diverged.</>, successBody: "We use public birth dates and sourced career events. A public figure's life does not determine your future.", successCta: "Compare my success pattern",
    relationshipEyebrow: "RELATIONSHIP INTELLIGENCE", relationshipTitle: <>See where you diverge,<br />not just whether you match.</>, relationshipBody: "Compare how partners, family, friends, coworkers, or business partners operate across eight domains. No score decides whether a relationship is good or bad.", relationshipCta: "Start relationship analysis",
    relationshipCompare: "See the differences side by side",
    relationshipAxes: ["How you communicate", "How quickly you decide", "Time you need alone"],
    spaceEyebrow: "FENG SHUI · 3D ROOM", spaceTitle: <>Your room,<br /><span>what could work better?</span></>, spaceBody: "Add room photos to compare your current and suggested layouts side by side in 3D.", spaceSteps: ["Take 2–6 room photos", "Show which way is north", "Compare the suggested layout"], spaceCta: "Analyze my room", spaceDemo: "Try the 3D example", before: "Current", after: "Suggested", spaceBubble: "Try widening the path beside the bed.", spaceDisclosure: "Traditional feng shui and practical room advice are clearly separated.",
    realityEyebrow: "REALITY CHECK", realityTitle: <>Go beyond interpretation.<br />Check it against real life.</>, realityBody: "A later reflection becomes evidence for the next reading. Results that missed remain visible too.", realityCta: "Start Reality Check", realitySteps: ["Save today's reading", "Check it in daily life", "Use it in the next reading"],
    celestialEyebrow: "SKY · SEASONS · FOUR PILLARS",
    celestialTitle: <>We read the season of the sky<br />with the moment you were born.</>,
    celestialBody: "Four Pillars uses your birth date and time with the seasonal calendar to establish the year, month, day, and hour pillars. Traditional interpretation and calculation evidence stay clearly separated.",
    celestialCta: "Calculate my Four Pillars",
    celestialAlt: "A classical celestial chart showing the Big Dipper, seasonal markers, and the four pillars of year, month, day, and hour",
    closeTitle: "Begin your story today.", closeBody: "Read where you are now, then return to see what matched real life.", closeCta: "Start free", benefits: ["Simple start", "Visible evidence", "Personal report", "Ongoing checks"], footerBody: "Personal Pattern Intelligence that turns symbols into real questions and checks them against lived experience.", footerBoundary: "Saju, birth-date patterns, and feng shui are symbolic reflection tools, not scientific prediction, diagnosis, treatment, or guaranteed outcomes.", copyright: "Byeolloof · Busan, Republic of Korea",
  },
} as const;

function Arrow() {
  return <span aria-hidden="true">→</span>;
}

function GuideScreenPreview({ locale, step, label }: { locale: Locale; step: number; label: string }) {
  const ko = locale === "ko";
  return <div aria-label={label} className="td2-guide-screen" role="group">
    <header><span>태령당</span><small>{ko ? `이용 안내 ${step + 1}/${GUIDE_SCREENS.length}` : `QUICK GUIDE ${step + 1}/${GUIDE_SCREENS.length}`}</small></header>
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
    {step === 4 && <div className="td2-guide-dream">
      <div className="td2-guide-dream-input">
        <small>{ko ? "꿈 기록" : "DREAM RECORD"}</small>
        <p>{ko ? "큰 뱀이 집에 들어왔어요. 무섭지는 않았고 가만히 바라봤어요." : "A large snake entered my home. I was calm and watched it."}</p>
      </div>
      <div className="td2-guide-dream-flow" aria-hidden="true"><span>뱀</span><b>→</b><span>{ko ? "들어옴" : "Entering"}</span><b>→</b><span>{ko ? "평온" : "Calm"}</span></div>
      <article>
        <small>{ko ? "오늘의 꿈" : "TODAY'S DREAM"}</small>
        <strong>{ko ? "상징 하나보다, 지금의 선택과 감정을 먼저 살펴볼 꿈이에요." : "Look first at your current choices and feelings, rather than one symbol."}</strong>
        <div><span>{ko ? "전통" : "Tradition"}</span><span>{ko ? "현대 연구" : "Research"}</span><span>{ko ? "나의 기록" : "My history"}</span></div>
      </article>
      <footer><b>+3</b><b>+7</b><b>+30</b><span>{ko ? "일 뒤 실제로 어땠는지 확인" : "days · check what actually happened"}</span></footer>
    </div>}
    {step === 5 && <div className="td2-guide-space">
      <div className="td2-guide-room-pair">
        <figure><Image alt="" fill sizes="(max-width: 640px) 42vw, 250px" src="/images/space/previews/bedroom-before-v1.png" /><figcaption>{ko ? "현재 배치" : "CURRENT"}</figcaption></figure>
        <b aria-hidden="true">→</b>
        <figure><Image alt="" fill sizes="(max-width: 640px) 42vw, 250px" src="/images/space/previews/bedroom-after-v1.png" /><figcaption>{ko ? "추천 배치" : "SUGGESTED"}</figcaption></figure>
      </div>
      <div className="td2-guide-compass" aria-label={ko ? "동서남북 방향" : "Cardinal directions"}><span>{ko ? "북" : "N"}</span><span>{ko ? "동" : "E"}</span><span>{ko ? "남" : "S"}</span><span>{ko ? "서" : "W"}</span></div>
      <p><b>{ko ? "먼저 바꿔볼 한 가지" : "ONE CHANGE TO TRY"}</b>{ko ? "침대 옆 동선을 넓히고 거울과 전자기기 위치를 함께 확인해요." : "Widen the path beside the bed and review mirror and device placement."}</p>
    </div>}
  </div>;
}

export function TaeryeongLanding({ dreamAvailable, locale, reportPreview, reviews, reviewCount }: Props) {
  const t = content[locale];
  const reviewLabel = reviewCount && reviewCount > 0
    ? `${t.reviews} ${reviewCount}`
    : t.reviews;

  const track = () => captureConversionEvent("primary_cta_click", locale, { location: "hero" });
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [guideElapsedMs, setGuideElapsedMs] = useState(0);
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

  useEffect(() => {
    if (!guideOpen) return;
    const startedAt = Date.now();
    const progressTimer = window.setInterval(() => {
      setGuideElapsedMs(Math.min(GUIDE_STEP_DURATION_MS, Date.now() - startedAt));
    }, 100);
    const timer = window.setTimeout(() => {
      if (guideStep === GUIDE_SCREENS.length - 1) {
        setGuideOpen(false);
        return;
      }
      setGuideElapsedMs(0);
      setGuideStep(guideStep + 1);
    }, GUIDE_STEP_DURATION_MS);
    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(timer);
    };
  }, [guideOpen, guideStep]);

  function openGuide() {
    setGuideElapsedMs(0);
    setGuideStep(0);
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
        {dreamAvailable && <Link href={`/${locale}/dreams`} prefetch={false}>{locale === "ko" ? "꿈 기록" : "Dream journal"}</Link>}
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
            setGuideElapsedMs(0);
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
            onClick={() => { setGuideElapsedMs(0); setGuideStep(index); }}
            role="tab"
            tabIndex={guideStep === index ? 0 : -1}
            type="button"
          ><small aria-hidden="true">{String(index + 1).padStart(2, "0")}</small><span>{label}</span></button>)}
        </div>
        <p className="guide-stage-eyebrow">{t.guideScreenLabel}</p>
        <div className="td2-guide-timer">
          <div
            aria-label={locale === "ko" ? "다음 화면까지 남은 시간" : "Time until the next screen"}
            aria-valuemax={GUIDE_STEP_DURATION_MS}
            aria-valuemin={0}
            aria-valuenow={guideElapsedMs}
            className="td2-guide-progress"
            role="progressbar"
          ><span style={{ width: `${Math.min(100, (guideElapsedMs / GUIDE_STEP_DURATION_MS) * 100)}%` }} /></div>
          <small aria-live="polite">
            {locale === "ko"
              ? `${Math.max(1, Math.ceil((GUIDE_STEP_DURATION_MS - guideElapsedMs) / 1_000))}초 뒤 ${guideStep === GUIDE_SCREENS.length - 1 ? "안내가 닫혀요" : "다음 화면"}`
              : `${Math.max(1, Math.ceil((GUIDE_STEP_DURATION_MS - guideElapsedMs) / 1_000))}s until ${guideStep === GUIDE_SCREENS.length - 1 ? "the guide closes" : "the next screen"}`}
          </small>
        </div>
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

    <DailyHealingHome locale={locale} reportPreview={reportPreview} reviewCount={reviewCount} reviews={reviews} />
  </main>;
}
