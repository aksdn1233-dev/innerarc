"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { captureConversionEvent } from "@/core/analytics";
import { OFFICIAL_NAVER_BLOG_URL } from "@/core/brand-links";
import { NUMEROLOGY_GUIDES } from "@/core/numerology-guides";
import type { OnboardingFocusId } from "@/core/onboarding";
import type { ReportOutline } from "@/core/report-outline";
import type { PublicReview } from "@/core/reviews";
import type { Locale } from "@/i18n/config";
import { anonymousFallbackName, changedActionLabels, reviewTypeLabels } from "@/i18n/review-copy";

export type DailyHealingReportPreview = Readonly<{
  outline: ReportOutline;
  summary: string;
  nextAction: string;
  calculationBasis: Readonly<{
    lifePath: number;
    birthday: number;
    attitude: number;
    personalYear: number;
  }> | null;
}>;

type Props = Readonly<{
  locale: Locale;
  reportPreview: DailyHealingReportPreview;
  reviews: readonly PublicReview[];
  reviewCount: number | null;
}>;

const TRANSPARENT_PIXEL = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

function DeferredImage({ alt, src, unoptimized, ...props }: ComponentProps<typeof Image>) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    const Observer = (window as Window & { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver;
    if (!Observer) {
      const timer = globalThis.setTimeout(() => setIsVisible(true), 0);
      return () => globalThis.clearTimeout(timer);
    }
    const target = image.closest(".dh-conversation, .dh-guides") ?? image;
    const observer = new Observer(([entry]) => {
      if (!entry?.isIntersecting) return;
      setIsVisible(true);
      observer.disconnect();
    }, { rootMargin: "200px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return <Image {...props} alt={alt} data-deferred={isVisible ? "false" : "true"} ref={imageRef} src={isVisible ? src : TRANSPARENT_PIXEL} unoptimized={!isVisible || unoptimized} />;
}

function DeferredClosingVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const Observer = (window as Window & { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver;
    if (!Observer) return;
    const observer = new Observer(([entry]) => {
      if (!entry?.isIntersecting) return;
      setShouldLoad(true);
      observer.disconnect();
    }, { rootMargin: "300px 0px" });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video autoPlay={shouldLoad} className="dh-close-video" loop muted playsInline poster="/images/taeyul-hero.jpg" preload="none" ref={videoRef}>
      {shouldLoad && <source src="/videos/taeyul-hero.mp4?v=20260815-fluid1" type="video/mp4" />}
    </video>
  );
}

const copy = {
  ko: {
    concernEyebrow: "오늘의 고민",
    concernTitle: "오늘, 어떤 고민이 있으신가요?",
    concernBody: <>지금 마음에 걸리는 것부터<br />천천히 이야기해보세요.</>,
    concerns: [
      ["relationships", "연애·관계", "마음과 거리"],
      ["work", "일·진로", "계속할지 바꿀지"],
      ["money", "돈·사업", "선택과 책임"],
      ["health", "건강·생활", "하루의 리듬"],
      ["growth", "나 자신", "반복되는 습관"],
      ["leadership", "리더십", "결정과 역할"],
    ] as const,
    concernPrompt: "하나를 고르면 그 고민에 맞춰 기본 결과를 보여드려요.",
    concernAction: "이 고민부터 살펴보기",
    listeningEyebrow: "잠시 쉬어가도 괜찮아요",
    listeningTitle: <>지친 하루에도,<br />당신의 이야기는 소중하니까요.</>,
    listeningBody: "오늘의 고민을 정리하고, 지금의 흐름을 조금 더 차분하게 바라보세요.",
    listeningNote: "답을 서두르기보다, 무엇이 계속 마음에 남는지부터 들어볼게요.",
    guidesEyebrow: "태령당의 안내자들",
    guidesTitle: "태령당에는 각기 다른 시선이 있습니다.",
    guidesBody: "여섯 안내자가 저마다 잘 보는 부분을 쉬운 말로 전합니다. 계산과 판단은 정해진 기준에 따라 따로 이루어집니다.",
    servicesEyebrow: "지금 알고 싶은 것",
    servicesTitle: <>궁금한 답을<br />바로 골라보세요.</>,
    servicesBody: "내 성향부터 관계, 오늘의 흐름, 방 배치까지 필요한 것만 볼 수 있어요.",
    services: [
      ["사주", "나는 어떤 기질을 타고났을까?", "연·월·일·시 네 기둥과 오행을 계산해 삶의 큰 흐름을 봅니다.", "fortune", "절기와 네 기둥", "내 사주 보기"],
      ["생년월일 패턴", "왜 비슷한 선택을 되풀이할까?", "생년월일의 수로 내 강점과 자주 막히는 지점을 확인합니다.", "numerology", "무료 기본 결과", "무료로 내 패턴 보기"],
      ["궁합", "우리는 어디서 잘 맞고 부딪힐까?", "연인·가족·동료가 생각하고 행동하는 차이를 나란히 봅니다.", "compatibility", "둘의 차이와 조화", "둘의 궁합 보기"],
      ["오늘의 흐름", "오늘, 무엇부터 돌아보면 좋을까?", "생일의 월·일을 기준으로 오늘 나에게 필요한 질문을 받습니다.", "daily-fortune", "가볍게 매일", "오늘의 질문 받기"],
      ["Reality Check", "지난 해석, 실제로도 맞았을까?", "맞았던 점과 달랐던 점을 남겨 반복되는 흐름을 다시 봅니다.", "reality-check", "생활에서 확인", "지난 해석 확인하기"],
      ["풍수학", "침대와 책상, 어디를 바꾸면 편할까?", "방 사진으로 현재 배치와 바꿔볼 배치를 3D로 비교합니다.", "space", "공간도 하나의 패턴", "내 방 분석하기"],
    ] as const,
    realityEyebrow: "해석보다 중요한 것",
    realityTitle: <>그때 읽은 말,<br />실제로 맞았을까요?</>,
    realityLead: "기억이 흐려지기 전에 남겨보세요.",
    realityBody: "맞은 점과 다른 점을 함께 적으면, 나에게 정말 반복되는 흐름이 무엇인지 더 분명해집니다.",
    realitySteps: ["지난번 해석", "실제로 있었던 일", "맞았던 부분", "달랐던 부분", "새롭게 보이는 패턴"],
    realityAction: "실제로 어땠는지 남기기",
    transitionEyebrow: "알고 나면 달라지는 것",
    transitionTitle: <>막연했던 고민이,<br />움직일 방향이 됩니다.</>,
    transitionBody: "답을 대신 정하지는 않아요. 지금 왜 망설이는지 알면 다음 선택은 조금 선명해집니다.",
    transitionNote: "내가 바꿀 수 있는 한 가지부터 찾습니다.",
    reportEyebrow: "결과가 궁금하다면",
    reportTitle: <>결제 전에,<br />실제 리포트를 먼저 보세요.</>,
    reportBody: "어떤 계산을 쓰고 무엇을 알려주는지 예시 리포트에서 먼저 확인할 수 있어요.",
    reportSample: "1994년 11월 4일 예시",
    reportSummary: "핵심 요약",
    reportCalculation: "계산 근거",
    reportChapters: "이어지는 내용",
    reportNext: "지금 해볼 한 가지",
    reportLocked: "상세 리딩에서 보기",
    reportAction: "실제 예시 리포트 보기",
    reviewsEyebrow: "먼저 써본 사람들의 이야기",
    reviewsTitle: <>다른 사람들은<br />무엇을 확인했을까요?</>,
    reviewsBody: "공개에 동의하고 운영자가 확인한 후기만 그대로 보여드립니다.",
    spaceEyebrow: "풍수학 · 3D 공간 분석",
    spaceTitle: <>침대와 책상,<br />지금 자리가 맞을까요?</>,
    spaceBody: "방 사진을 올리면 걸어 다니는 길과 가구 간격을 확인해, 현재 배치와 바꿔볼 배치를 3D로 비교해드려요.",
    spaceFlow: ["사진 올리기", "방 구조 확인", "현재·추천 비교", "바꿀 자리 보기", "써보고 기록"],
    spaceAction: "내 방 3D로 확인하기",
    before: "현재 배치",
    after: "추천 배치",
    closeTitle: "지금 가장 궁금한 것 하나만 골라보세요.",
    closeBody: "회원가입 없이 기본 분석과 사주 원국을 무료로 바로 볼 수 있어요.",
    closeAction: "무료로 내 패턴 보기",
    closeSajuAction: "무료 사주 원국 보기",
    footerBody: "오늘의 고민을 읽고, 실제 삶에서 확인하며, 나만의 반복 패턴을 쌓아가는 곳.",
    footerBoundary: "사주·생년월일 패턴·풍수는 성찰을 위한 상징적 도구이며 과학적 예측, 진단, 치료 또는 결과 보장이 아닙니다.",
    copyright: "별루프 · 대표 박서준 · 사업자등록번호 482-12-03629 · 부산광역시 북구",
  },
  en: {
    concernEyebrow: "WHAT IS ON YOUR MIND",
    concernTitle: "What has been weighing on you today?",
    concernBody: <>Begin with what keeps returning<br />and take it slowly.</>,
    concerns: [
      ["relationships", "Love & relationships", "Closeness and distance"],
      ["work", "Work & direction", "Stay or change"],
      ["money", "Money & business", "Choices and responsibility"],
      ["health", "Health & daily life", "Your daily rhythm"],
      ["growth", "Myself", "Recurring habits"],
      ["leadership", "Leadership", "Decisions and roles"],
    ] as const,
    concernPrompt: "Choose one to shape the focus of your free result.",
    concernAction: "Start with this concern",
    listeningEyebrow: "TAKE A QUIET MOMENT",
    listeningTitle: <>Even after a tiring day,<br />your story still matters.</>,
    listeningBody: "Put today's concern into words and look at the current pattern with a little more calm.",
    listeningNote: "We begin with what keeps staying on your mind, without rushing to an answer.",
    guidesEyebrow: "YOUR GUIDES",
    guidesTitle: "Taeryeongdang holds six different points of view.",
    guidesBody: "Each guide explains a different part of the story in plain words. Calculations and decisions still follow their separate, fixed rules.",
    servicesEyebrow: "WHAT DO YOU WANT TO KNOW",
    servicesTitle: <>Choose the answer<br />you need right now.</>,
    servicesBody: "Go straight to your patterns, relationships, daily reflection, or room layout.",
    services: [
      ["Four Pillars", "What tendencies did I begin with?", "Calculate the four pillars and five elements to review your broader rhythm.", "fortune", "Seasons and four pillars", "View my Four Pillars"],
      ["Birth-date patterns", "Why do I keep making similar choices?", "Use your birth date to see strengths and recurring friction.", "numerology", "Free foundation", "View my pattern free"],
      ["Compatibility", "Where do we connect and clash?", "Compare how partners, family, or coworkers think and act.", "compatibility", "Differences and balance", "View our compatibility"],
      ["Daily Flow", "What should I reflect on today?", "Receive one question based on your birth month and day.", "daily-fortune", "A light daily check-in", "Get today's question"],
      ["Reality Check", "Did the last reading hold up?", "Keep what matched and what differed to revisit the recurring pattern.", "reality-check", "Check against life", "Check my last reading"],
      ["Feng Shui", "Would another bed or desk position feel better?", "Use room photos to compare your current layout with a practical alternative in 3D.", "space", "Space is a pattern too", "Analyze my room"],
    ] as const,
    realityEyebrow: "WHAT MATTERS AFTER A READING",
    realityTitle: <>Did the last reading<br />hold up in real life?</>,
    realityLead: "Record it before the details fade.",
    realityBody: "Keeping both what matched and what differed makes the patterns that truly repeat easier to see.",
    realitySteps: ["The last reading", "What happened", "What matched", "What differed", "A pattern to revisit"],
    realityAction: "Record what really happened",
    transitionEyebrow: "WHAT CHANGES WHEN YOU SEE THE PATTERN",
    transitionTitle: <>A vague concern becomes<br />a direction you can use.</>,
    transitionBody: "We do not choose for you. Seeing why you hesitate can make the next step clearer.",
    transitionNote: "Start with one thing you can change.",
    reportEyebrow: "SEE THE RESULT FIRST",
    reportTitle: <>Preview the real report<br />before you pay.</>,
    reportBody: "See which calculations are used and what the report actually explains before deciding.",
    reportSample: "Sample for 4 November 1994",
    reportSummary: "Core summary",
    reportCalculation: "Calculation basis",
    reportChapters: "What follows",
    reportNext: "One thing to try",
    reportLocked: "Open in the detailed reading",
    reportAction: "View the real sample report",
    reviewsEyebrow: "FROM PEOPLE WHO TRIED IT",
    reviewsTitle: <>What did other readers<br />recognize in their lives?</>,
    reviewsBody: "Only consented reviews checked by an operator are shown as written.",
    spaceEyebrow: "FENG SHUI · 3D ROOM",
    spaceTitle: <>Are your bed and desk<br />in the right place?</>,
    spaceBody: "Add room photos to check walking paths and furniture spacing, then compare the current and suggested layouts in 3D.",
    spaceFlow: ["Add photos", "Check structure", "Compare layouts", "See what to move", "Try and record"],
    spaceAction: "Check my room in 3D",
    before: "Current",
    after: "Suggested",
    closeTitle: "Choose the one thing you want to understand now.",
    closeBody: "View your basic pattern and Four Pillars chart free, without creating an account.",
    closeAction: "View my pattern free",
    closeSajuAction: "View my Four Pillars free",
    footerBody: "A place to reflect on today's concern and check it again against real life.",
    footerBoundary: "Saju, birth-date patterns, and feng shui are symbolic reflection tools, not scientific prediction, diagnosis, treatment, or guaranteed outcomes.",
    copyright: "Byeolloof · Busan, Republic of Korea",
  },
} as const;

function Arrow() {
  return <span aria-hidden="true">→</span>;
}

function CelestialThread({ locale }: { locale: Locale }) {
  const stars = [[24, 55], [70, 34], [116, 59], [158, 28], [204, 16], [246, 36], [282, 8]] as const;
  return <svg aria-label={locale === "ko" ? "북두칠성과 사주 네 기둥을 이은 선 도판" : "Line study connecting the Big Dipper and Four Pillars"} className="dh-celestial-thread" role="img" viewBox="0 0 320 96">
    <title>{locale === "ko" ? "절기와 네 기둥" : "Seasons and Four Pillars"}</title>
    <path d="M24 55 70 34 116 59 158 28 204 16 246 36 282 8" />
    {stars.map(([x, y]) => <path className="dh-star" d={`M${x} ${y - 4} ${x + 4} ${y} ${x} ${y + 4} ${x - 4} ${y}Z`} key={`${x}-${y}`} />)}
    <path className="dh-pillars-line" d="M32 79H288M48 72V88M112 72V88M176 72V88M240 72V88" />
    <text x="48" y="95">年</text><text x="112" y="95">月</text><text x="176" y="95">日</text><text x="240" y="95">時</text>
  </svg>;
}

const concernScenes: Record<OnboardingFocusId, Readonly<{ image: string; ko: string; en: string }>> = {
  relationships: { image: "/assets/gyeol-webtoon/characters/yeonhui/yeonhui_comfort_gentle_01.png", ko: "자꾸 같은 관계에서 마음이 지치나요?", en: "Do the same relationship patterns keep wearing you down?" },
  work: { image: "/assets/gyeol-webtoon/characters/sahyeon/sahyeon_ponder_thoughtful_01.png", ko: "지금 가는 길이 나와 맞는지 궁금한가요?", en: "Are you wondering whether this path still fits you?" },
  money: { image: "/assets/gyeol-webtoon/characters/hwayeon/hwayeon_analyze_focused_01.png", ko: "돈과 일의 선택이 자꾸 마음에 남나요?", en: "Do choices around money and work keep returning?" },
  health: { image: "/assets/gyeol-webtoon/characters/yundo/yundo_comfort_gentle_01.png", ko: "요즘 내 생활 리듬을 다시 보고 싶나요?", en: "Would you like to look again at your daily rhythm?" },
  growth: { image: "/assets/gyeol-webtoon/characters/hoyeon/hoyeon_explain_calm_01.png", ko: "이상하게 반복되는 습관이 있나요?", en: "Is there a habit that keeps repeating?" },
  leadership: { image: "/assets/gyeol-webtoon/characters/taeryeong/taeryeong_assure_confident_01.png", ko: "결정해야 하는데 자꾸 망설여지나요?", en: "Is a decision becoming harder to make?" },
};

const serviceScenes = [
  "/assets/gyeol-webtoon/characters/sahyeon/sahyeon_read-book_focused_01.png",
  "/assets/gyeol-webtoon/characters/taeryeong/taeryeong_read-chart_focused_01.png",
  "/assets/gyeol-webtoon/characters/yeonhui/yeonhui_comfort_gentle_01.png",
  "/assets/gyeol-webtoon/characters/hoyeon/hoyeon_smile_warm_01.png",
  "/assets/gyeol-webtoon/characters/taeryeong/taeryeong_write_focused_01.png",
  "/assets/gyeol-webtoon/characters/yundo/yundo_explain_calm_01.png",
] as const;

export function DailyHealingHome({ locale, reportPreview, reviews, reviewCount }: Props) {
  const t = copy[locale];
  const [selectedConcern, setSelectedConcern] = useState<OnboardingFocusId | null>(null);
  const selected = t.concerns.find(([id]) => id === selectedConcern);
  const showReviewCount = reviewCount !== null && reviewCount >= 5 && reviewCount > reviews.length;

  function chooseConcern(focus: OnboardingFocusId) {
    setSelectedConcern(focus);
    captureConversionEvent("concern_selected", locale, { concern: focus, surface: "home" });
  }

  return <div className="dh-flow">
    <section className="dh-character-entry dh-concerns" id="services" aria-labelledby="dh-listening-title">
      <div className="dh-entry-copy">
        <p className="dh-eyebrow">{t.listeningEyebrow}</p>
        <h2 id="dh-listening-title">{t.listeningTitle}</h2>
        <p>{locale === "ko" ? "오늘 마음에 걸리는 일이 있다면 태령당과 천천히 이야기해보세요." : "If something is weighing on you today, take your time and tell Taeryeongdang."}</p>
        <div className="dh-entry-question"><h3>{t.concernTitle}</h3><div className="dh-concern-grid" role="group" aria-label={t.concernTitle}>{t.concerns.map(([id, label]) => <button aria-pressed={selectedConcern === id} key={id} onClick={() => chooseConcern(id)} type="button">{label}</button>)}</div><div className="dh-concern-next" aria-live="polite"><span>{selected ? `${selected[1]} · ${selected[2]}` : t.concernPrompt}</span>{selectedConcern && <Link href={`/${locale}/numerology?focus=${selectedConcern}`} prefetch={false}>{t.concernAction}<Arrow /></Link>}</div></div>
      </div>
      <div className="dh-entry-scene" aria-hidden="true"><span className="dh-entry-sun" /><span className="dh-entry-curtain" /><span className="dh-entry-table" /><span className="dh-entry-cup" /><span className="dh-entry-book" /><span className="dh-entry-plant" /><Image src="/images/numerology-guides/gyeol-hoyeon-daily.webp" alt="" className="dh-entry-photo" fill sizes="(max-width: 760px) 100vw, 55vw" priority={false} unoptimized /><p><strong>{locale === "ko" ? "호연" : "Hoyeon"}</strong>{t.listeningNote}</p></div>
    </section>

    <section className="dh-conversation" aria-labelledby="dh-conversation-title"><header><p className="dh-eyebrow">{t.concernEyebrow}</p><h2 id="dh-conversation-title">{locale === "ko" ? "무슨 이야기가 제일 마음에 걸리세요?" : "Which story is weighing on you most?"}</h2><p>{t.concernBody}</p></header><div aria-label={locale === "ko" ? "고민별 안내" : "Guidance by concern"} tabIndex={0}>{t.concerns.map(([id, label]) => <Link href={`/${locale}/numerology?focus=${id}`} key={id} onClick={() => captureConversionEvent("concern_selected", locale, { concern: id, surface: "home" })} prefetch={false}><DeferredImage alt="" height={384} src={concernScenes[id].image} width={384} sizes="384px" /><span><small>{label}</small><strong>{concernScenes[id][locale]}</strong></span><Arrow /></Link>)}</div></section>

    <section className="dh-guides" aria-labelledby="dh-guides-title">
      <header><div><p className="dh-eyebrow">{t.guidesEyebrow}</p><h2 id="dh-guides-title">{t.guidesTitle}</h2></div><p>{t.guidesBody}</p></header>
      <div aria-label={locale === "ko" ? "태령당 안내자 목록" : "Taeryeongdang guide list"} className="dh-guide-strip" tabIndex={0}>
        {NUMEROLOGY_GUIDES.map((guide) => <article key={guide.id}>
          <div><DeferredImage alt={guide.imageAlt[locale]} height={384} src={guide.image} width={384} sizes="384px" /></div>
          <footer><small>{guide.role[locale]}</small><strong>{guide.name[locale]}</strong><p>{guide.specialties[locale][0]}</p></footer>
        </article>)}
      </div>
    </section>

    <section className="dh-services" aria-labelledby="dh-services-title">
      <header><div><p className="dh-eyebrow">{t.servicesEyebrow}</p><h2 id="dh-services-title">{t.servicesTitle}</h2></div><div><p>{t.servicesBody}</p><CelestialThread locale={locale} /></div></header>
      <div className="dh-service-grid">
        {t.services.map(([name, learning, body, route, meta, action], index) => <Link className={index === 0 ? "is-saju" : undefined} href={`/${locale}/${route}`} key={route} prefetch={false}>
          <Image alt="" height={384} src={serviceScenes[index]!} width={384} sizes="384px" />
          <div><span>{String(index + 1).padStart(2, "0")} · {meta}</span><h3>{name}</h3><strong>{learning}</strong><p>{body}</p><b>{action}<Arrow /></b></div>
        </Link>)}
      </div>
    </section>

    <section className="dh-transition" aria-labelledby="dh-transition-title">
      <div><p className="dh-eyebrow">{t.transitionEyebrow}</p><h2 id="dh-transition-title">{t.transitionTitle}</h2><p>{t.transitionBody}</p><small>{t.transitionNote}</small></div>
      <div className="dh-transition-art" aria-hidden="true"><Image alt="" fill sizes="(max-width: 760px) 100vw, 58vw" src="/images/numerology-guides/gyeol-hoyeon-daily.webp" unoptimized /></div>
    </section>

    <section className="dh-reality" aria-labelledby="dh-reality-title"><div className="dh-reality-copy"><p className="dh-eyebrow">{t.realityEyebrow}</p><h2 id="dh-reality-title">{t.realityTitle}</h2><strong>{t.realityLead}</strong><p>{t.realityBody}</p><Link href={`/${locale}/reality-check`} prefetch={false}>{t.realityAction}<Arrow /></Link></div><div className="dh-reality-story"><ol>{t.realitySteps.map((step, index) => <li key={step}><small>{String(index + 1).padStart(2, "0")}</small><span>{step}</span></li>)}</ol><aside><Image alt="" height={384} src="/assets/gyeol-webtoon/characters/taeryeong/taeryeong_write_focused_01.png" width={384} sizes="384px" /><p>{locale === "ko" ? <>맞았던 말보다,<br />반복된 이유가 더 중요하니까요.</> : <>The reason it repeated matters<br />more than whether every word matched.</>}</p></aside></div></section>

    <section className="dh-report" aria-labelledby="dh-report-title">
      <div className="dh-report-copy"><p className="dh-eyebrow">{t.reportEyebrow}</p><h2 id="dh-report-title">{t.reportTitle}</h2><p>{t.reportBody}</p><Link href={`/${locale}/samples/detail`} prefetch={false}>{t.reportAction}<Arrow /></Link></div>
      <article className="dh-report-book"><div className="dh-report-page is-left"><header><small>{reportPreview.outline.tierLabel}</small><strong>{t.reportSample}</strong></header><section><small>{t.reportSummary}</small><h3>{reportPreview.summary}</h3></section>{reportPreview.calculationBasis && <dl aria-label={t.reportCalculation}><div><dt>{locale === "ko" ? "인생수" : "Life Path"}</dt><dd>{reportPreview.calculationBasis.lifePath}</dd></div><div><dt>{locale === "ko" ? "생일수" : "Birthday"}</dt><dd>{reportPreview.calculationBasis.birthday}</dd></div><div><dt>{locale === "ko" ? "태도수" : "Attitude"}</dt><dd>{reportPreview.calculationBasis.attitude}</dd></div><div><dt>{locale === "ko" ? "개인연도" : "Personal year"}</dt><dd>{reportPreview.calculationBasis.personalYear}</dd></div></dl>}<svg aria-label={locale === "ko" ? "반복 패턴 흐름 예시" : "Example recurring pattern line"} className="dh-pattern-line" role="img" viewBox="0 0 360 90"><path d="M5 67C55 70 63 28 112 39S173 76 215 50 278 17 355 27" /><circle cx="112" cy="39" r="5" /><circle cx="215" cy="50" r="5" /><circle cx="355" cy="27" r="5" /></svg></div><div className="dh-report-page is-right"><header><small>{t.reportChapters}</small><span>{String(reportPreview.outline.totalSections).padStart(2, "0")} CHAPTERS</span></header><ol>{reportPreview.outline.entries.map((entry) => <li key={entry.position}><b>{String(entry.position).padStart(2, "0")}</b><div><strong>{entry.title}</strong>{entry.excerpt && <p>{entry.excerpt}</p>}</div></li>)}</ol><footer><small>{t.reportNext}</small><p>{reportPreview.nextAction}</p></footer></div><span className="dh-bookmark" aria-hidden="true" /></article>
    </section>

    {reviews.length > 0 ? <section className="dh-reviews" aria-labelledby="dh-reviews-title">
      <header><p className="dh-eyebrow">{t.reviewsEyebrow}</p><h2 id="dh-reviews-title">{t.reviewsTitle}</h2><p>{t.reviewsBody}</p>{showReviewCount && <small>{locale === "ko" ? `공개된 후기 ${reviewCount!.toLocaleString("ko-KR")}개 중 최근 후기입니다.` : `Recent entries from ${reviewCount!.toLocaleString("en-US")} published reviews.`}</small>}</header>
      <div>{reviews.map((review) => <article key={review.id}><small>{reviewTypeLabels[locale][review.reviewType]} · {review.publishedMonth}</small>{review.wantedToUnderstand && <h3>{review.wantedToUnderstand}</h3>}<p>{review.mostUseful}</p><footer><strong>{review.displayName || anonymousFallbackName[locale]}</strong><span>{changedActionLabels[locale][review.changedAction]}</span></footer></article>)}</div>
    </section> : <section className="dh-common-concerns" aria-labelledby="dh-common-title"><p className="dh-eyebrow">{locale === "ko" ? "지금 고를 수 있는 고민" : "CHOOSE A CONCERN"}</p><h2 id="dh-common-title">{locale === "ko" ? "가장 자주 떠오르는 한 가지부터 눌러보세요." : "Tap the one concern that keeps returning."}</h2><div>{t.concerns.map(([id, label]) => <Link href={`/${locale}/numerology?focus=${id}`} key={id} prefetch={false}><small>{label}</small><strong>{concernScenes[id][locale]}</strong><Arrow /></Link>)}</div></section>}

    <section className="dh-space" aria-labelledby="dh-space-title">
      <div className="dh-space-visual">
        <figure><Image alt={locale === "ko" ? "풍수학 현재 배치 예시" : "Current Feng Shui layout example"} height={1082} src="/images/space/previews/bedroom-before-v1.png" width={1354} sizes="(max-width: 760px) 100vw, 50vw" /><figcaption>{t.before}</figcaption></figure>
        <figure><Image alt={locale === "ko" ? "풍수학 추천 배치 예시" : "Suggested Feng Shui layout example"} height={1082} src="/images/space/previews/bedroom-after-v1.png" width={1354} sizes="(max-width: 760px) 100vw, 50vw" /><figcaption>{t.after}</figcaption></figure>
        <Image alt="" className="dh-space-guide" height={384} src="/assets/gyeol-webtoon/characters/yundo/yundo_explain_calm_01.png" width={384} sizes="384px" />
      </div>
      <div className="dh-space-copy"><p className="dh-eyebrow">{t.spaceEyebrow}</p><h2 id="dh-space-title">{t.spaceTitle}</h2><p>{t.spaceBody}</p><ol>{t.spaceFlow.map((step, index) => <li key={step}><small>{String(index + 1).padStart(2, "0")}</small>{step}</li>)}</ol><Link href={`/${locale}/space`} prefetch={false}>{t.spaceAction}<Arrow /></Link></div>
    </section>

    <section className="dh-close" aria-labelledby="dh-close-title">
      <div className="dh-close-art" aria-hidden="true">
        <Image alt="" className="dh-close-video-fallback" fill sizes="(max-width: 760px) 100vw, 48vw" src="/images/taeyul-hero.jpg" />
        <DeferredClosingVideo />
      </div>
      <div className="dh-close-copy">
        <p className="dh-eyebrow">TAERYEONGDANG</p>
        <h2 id="dh-close-title">{t.closeTitle}</h2>
        <p>{t.closeBody}</p>
        <div>
          <Link href={`/${locale}/numerology`} onClick={() => captureConversionEvent("primary_cta_click", locale, { location: "product_free" })} prefetch={false}>{t.closeAction}<Arrow /></Link>
          <Link href={`/${locale}/fortune`} onClick={() => captureConversionEvent("primary_cta_click", locale, { location: "saju_crosslink" })} prefetch={false}>{t.closeSajuAction}<Arrow /></Link>
        </div>
      </div>
    </section>

    <footer className="dh-footer">
      <div><Link href={`/${locale}`} prefetch={false}><strong>태령당</strong><small>TAERYEONGDANG</small></Link><p>{t.footerBody}</p></div>
      <nav aria-label={locale === "ko" ? "공식 채널 및 법률 안내" : "Official channels and legal"}><a href={OFFICIAL_NAVER_BLOG_URL} rel="me noopener noreferrer" target="_blank">{locale === "ko" ? "공식 블로그" : "Official blog"}</a><Link href={`/${locale}/terms`} prefetch={false}>{locale === "ko" ? "이용조건" : "Terms"}</Link><Link href={`/${locale}/privacy`} prefetch={false}>{locale === "ko" ? "개인정보" : "Privacy"}</Link><Link href={`/${locale}/orders`} prefetch={false}>{locale === "ko" ? "구매 내역" : "Purchases"}</Link><Link href={`/${locale}/support`} prefetch={false}>{locale === "ko" ? "결제·환불 문의" : "Payment & refunds"}</Link></nav>
      <p>{t.footerBoundary}</p><small>{t.copyright}</small>
    </footer>
  </div>;
}
