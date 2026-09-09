"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
    guidesTitle: "보고 싶은 이야기에 맞춰 함께합니다.",
    guidesBody: "캐릭터는 내용을 쉽게 풀어주는 안내자입니다. 계산과 판단은 정해진 기준에 따라 따로 이루어집니다.",
    servicesEyebrow: "천천히 골라보세요",
    servicesTitle: <>지금 필요한 만큼만<br />살펴볼 수 있어요.</>,
    servicesBody: "이름보다 무엇을 알 수 있는지가 먼저 보이도록 정리했습니다.",
    services: [
      ["사주", "타고난 기질과 삶의 큰 흐름", "연·월·일·시 네 기둥과 오행을 계산 근거와 함께 봅니다.", "fortune", "절기와 네 기둥"],
      ["생년월일 패턴", "반복되는 성향과 선택의 이유", "생년월일의 수를 계산해 강점과 자주 막히는 지점을 살펴봅니다.", "numerology", "무료 기본 결과"],
      ["궁합", "두 사람 사이의 관계 패턴", "연인·가족·동료가 생각하고 행동하는 차이를 나란히 봅니다.", "compatibility", "둘의 차이와 조화"],
      ["오늘의 흐름", "오늘 하루를 돌아보는 짧은 질문", "기기 날짜와 생일의 월·일만으로 매일 같은 기준의 질문을 받습니다.", "daily-fortune", "가볍게 매일"],
      ["Reality Check", "해석이 실제로 어땠는지 기록", "맞았던 부분과 달랐던 부분을 남겨 다음 해석에서 다시 봅니다.", "reality-check", "생활에서 확인"],
      ["3D 공간운", "내 방의 배치와 생활 흐름", "방 사진을 바탕으로 현재와 추천 배치를 3D로 비교합니다.", "space", "공간도 하나의 패턴"],
    ] as const,
    serviceAction: "살펴보기",
    realityEyebrow: "태령당이 다른 이유",
    realityTitle: "읽고 끝내지 않습니다.",
    realityLead: "실제로 어땠는지 기록해보세요.",
    realityBody: "한 번의 해석을 정답으로 두지 않습니다. 생활에서 확인한 일을 남기면, 다음에는 무엇을 더 살펴볼지 분명해집니다.",
    realitySteps: ["지난번 해석", "실제로 있었던 일", "맞았던 부분", "달랐던 부분", "새롭게 보이는 패턴"],
    realityAction: "내 기록 남기기",
    transitionEyebrow: "조금씩 알게 되는 것",
    transitionTitle: <>좋은 방향으로<br />흐를 수 있어요.</>,
    transitionBody: "답을 정해주는 것이 아니라, 지금의 나를 조금 더 이해하도록.",
    transitionNote: "결국 중요한 건 지금 어떻게 움직이느냐니까요.",
    reportEyebrow: "실제 리포트 미리보기",
    reportTitle: <>내 이야기는,<br />이렇게 정리됩니다.</>,
    reportBody: "운영 리포트 생성기가 만든 실제 예시에서 일부만 보여드립니다.",
    reportSample: "1994년 11월 4일 예시",
    reportSummary: "핵심 요약",
    reportCalculation: "계산 근거",
    reportChapters: "이어지는 내용",
    reportNext: "지금 해볼 한 가지",
    reportLocked: "상세 리딩에서 보기",
    reportAction: "예시 리포트 보기",
    reviewsEyebrow: "이용자 이야기",
    reviewsTitle: <>태령당과 함께한<br />실제 이야기를 모았습니다.</>,
    reviewsBody: "공개에 동의하고 운영자가 확인한 후기만 보여드립니다.",
    spaceEyebrow: "3D 공간운",
    spaceTitle: <>내 공간도,<br />하나의 생활 패턴입니다.</>,
    spaceBody: "방 사진을 올리면 구조를 확인하고, 현재 배치와 바꾼 모습을 3D로 나란히 보여드려요.",
    spaceFlow: ["사진", "공간 구조", "3D 비교", "배치 제안", "생활에서 확인"],
    spaceAction: "내 방 살펴보기",
    before: "현재 배치",
    after: "추천 배치",
    closeTitle: <>지금,<br />당신의 고민을 이야기해보세요.</>,
    closeBody: "작은 변화가 큰 방향을 만듭니다.",
    closeAction: "무료 기본 리포트 시작하기",
    closeHistory: "내 기록 보기",
    footerBody: "오늘의 고민을 살펴보고, 실제 삶에서 다시 확인하는 개인 패턴 기록.",
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
    guidesTitle: "A different guide for each part of the story.",
    guidesBody: "Characters make the report easier to read. Calculations and decisions still follow their separate, fixed rules.",
    servicesEyebrow: "CHOOSE WHAT YOU NEED",
    servicesTitle: <>Explore only as much<br />as you need today.</>,
    servicesBody: "Each service starts with what it helps you understand.",
    services: [
      ["Four Pillars", "Your natural tendencies and broader rhythm", "See the four pillars and five elements with their calculation evidence.", "fortune", "Seasons and four pillars"],
      ["Birth-date patterns", "Why certain choices keep repeating", "Calculate personal numbers and review strengths and recurring friction.", "numerology", "Free foundation"],
      ["Compatibility", "Patterns between two people", "Compare how partners, family, or coworkers think and act.", "compatibility", "Differences and balance"],
      ["Daily Flow", "One short question for today", "A stable daily prompt based only on your birth month and day and the device date.", "daily-fortune", "A light daily check-in"],
      ["Reality Check", "Record what held up in real life", "Keep both what matched and what differed for the next reflection.", "reality-check", "Check against life"],
      ["3D Space", "Your room layout and daily flow", "Use room photos to compare the current and suggested layouts in 3D.", "space", "Space is a pattern too"],
    ] as const,
    serviceAction: "Explore",
    realityEyebrow: "WHAT MAKES TAERYEONGDANG DIFFERENT",
    realityTitle: "The reading is not the end.",
    realityLead: "Record what actually happened.",
    realityBody: "No single interpretation becomes the answer. What you observe in daily life makes the next question clearer.",
    realitySteps: ["The last reading", "What happened", "What matched", "What differed", "A pattern to revisit"],
    realityAction: "Open my records",
    transitionEyebrow: "WHAT BECOMES CLEARER",
    transitionTitle: <>Things can begin to move<br />in a better direction.</>,
    transitionBody: "The point is not to decide the answer for you, but to understand where you are now.",
    transitionNote: "What matters is how you move from here.",
    reportEyebrow: "REAL REPORT PREVIEW",
    reportTitle: <>Your story,<br />organized clearly.</>,
    reportBody: "This partial preview comes from the same production report generator used for delivered readings.",
    reportSample: "Sample for 4 November 1994",
    reportSummary: "Core summary",
    reportCalculation: "Calculation basis",
    reportChapters: "What follows",
    reportNext: "One thing to try",
    reportLocked: "Open in the detailed reading",
    reportAction: "View sample report",
    reviewsEyebrow: "READER STORIES",
    reviewsTitle: <>Stories shared by<br />people who used Taeryeongdang.</>,
    reviewsBody: "Only consented reviews checked by an operator are shown.",
    spaceEyebrow: "3D SPACE",
    spaceTitle: <>Your space is part<br />of your daily pattern.</>,
    spaceBody: "Add room photos to review its structure and compare the current and suggested layouts in 3D.",
    spaceFlow: ["Photos", "Room structure", "3D comparison", "Layout ideas", "Check in daily life"],
    spaceAction: "Review my room",
    before: "Current",
    after: "Suggested",
    closeTitle: <>Begin with what is<br />on your mind today.</>,
    closeBody: "A small change can shape a larger direction.",
    closeAction: "Start the free report",
    closeHistory: "View my records",
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
    <section className="dh-concerns" id="services" aria-labelledby="dh-concerns-title">
      <div className="dh-section-heading">
        <p className="dh-eyebrow">{t.concernEyebrow}</p>
        <h2 id="dh-concerns-title">{t.concernTitle}</h2>
        <p>{t.concernBody}</p>
      </div>
      <div className="dh-concern-grid" role="group" aria-label={t.concernTitle}>
        {t.concerns.map(([id, label, note]) => <button aria-pressed={selectedConcern === id} key={id} onClick={() => chooseConcern(id)} type="button"><strong>{label}</strong><span>{note}</span></button>)}
      </div>
      <div className="dh-concern-next" aria-live="polite">
        <span>{selected ? `${selected[1]} · ${selected[2]}` : t.concernPrompt}</span>
        {selectedConcern && <Link href={`/${locale}/numerology?focus=${selectedConcern}`} prefetch={false}>{t.concernAction}<Arrow /></Link>}
      </div>
    </section>

    <section className="dh-listening" aria-labelledby="dh-listening-title">
      <div className="dh-listening-scene" aria-hidden="true">
        <div className="dh-window"><span /><span /></div>
        <div className="dh-plant"><i /><b /><b /><b /></div>
        <div className="dh-table"><span className="dh-mug" /><span className="dh-book" /></div>
        <Image src="/assets/gyeol-webtoon/characters/taeryeong/taeryeong_comfort_gentle_01.png" alt="" width={640} height={640} sizes="(max-width: 760px) 72vw, 34vw" />
      </div>
      <div className="dh-listening-copy">
        <p className="dh-eyebrow">{t.listeningEyebrow}</p>
        <h2 id="dh-listening-title">{t.listeningTitle}</h2>
        <p>{t.listeningBody}</p>
        <blockquote>{t.listeningNote}</blockquote>
      </div>
    </section>

    <section className="dh-guides" aria-labelledby="dh-guides-title">
      <header><div><p className="dh-eyebrow">{t.guidesEyebrow}</p><h2 id="dh-guides-title">{t.guidesTitle}</h2></div><p>{t.guidesBody}</p></header>
      <div aria-label={locale === "ko" ? "태령당 안내자 목록" : "Taeryeongdang guide list"} className="dh-guide-strip" tabIndex={0}>
        {NUMEROLOGY_GUIDES.map((guide) => <article key={guide.id}>
          <Image alt={guide.imageAlt[locale]} height={260} src={guide.image} width={260} sizes="(max-width: 600px) 132px, 150px" />
          <div><strong>{guide.name[locale]}</strong><small>{guide.role[locale]}</small><p>{guide.specialties[locale][0]}</p></div>
        </article>)}
      </div>
    </section>

    <section className="dh-services" aria-labelledby="dh-services-title">
      <header><div><p className="dh-eyebrow">{t.servicesEyebrow}</p><h2 id="dh-services-title">{t.servicesTitle}</h2></div><div><p>{t.servicesBody}</p><CelestialThread locale={locale} /></div></header>
      <div className="dh-service-grid">
        {t.services.map(([name, learning, body, route, meta], index) => <Link className={index === 0 ? "is-saju" : undefined} href={`/${locale}/${route}`} key={route} prefetch={false}>
          <span>{String(index + 1).padStart(2, "0")}</span><small>{meta}</small><h3>{name}</h3><strong>{learning}</strong><p>{body}</p><b>{t.serviceAction}<Arrow /></b>
        </Link>)}
      </div>
    </section>

    <section className="dh-reality" aria-labelledby="dh-reality-title">
      <div className="dh-reality-copy"><p className="dh-eyebrow">{t.realityEyebrow}</p><h2 id="dh-reality-title">{t.realityTitle}</h2><strong>{t.realityLead}</strong><p>{t.realityBody}</p><Link href={`/${locale}/reality-check`} prefetch={false}>{t.realityAction}<Arrow /></Link></div>
      <ol>{t.realitySteps.map((step, index) => <li key={step}><small>{String(index + 1).padStart(2, "0")}</small><span>{step}</span>{index < t.realitySteps.length - 1 && <i aria-hidden="true">↓</i>}</li>)}</ol>
    </section>

    <section className="dh-transition" aria-labelledby="dh-transition-title">
      <div className="dh-transition-room" aria-hidden="true"><span className="dh-evening-window" /><span className="dh-floor-line" /><span className="dh-vase"><i /><i /></span></div>
      <div><p className="dh-eyebrow">{t.transitionEyebrow}</p><h2 id="dh-transition-title">{t.transitionTitle}</h2><p>{t.transitionBody}</p><small>{t.transitionNote}</small></div>
    </section>

    <section className="dh-report td2-product-section" aria-labelledby="dh-report-title">
      <div className="dh-report-copy"><p className="dh-eyebrow">{t.reportEyebrow}</p><h2 id="dh-report-title">{t.reportTitle}</h2><p>{t.reportBody}</p><Link href={`/${locale}/samples/detail`} prefetch={false}>{t.reportAction}<Arrow /></Link></div>
      <article className="dh-report-paper">
        <header><div><small>{reportPreview.outline.tierLabel}</small><strong>{t.reportSample}</strong></div><span>{String(reportPreview.outline.totalSections).padStart(2, "0")} CHAPTERS</span></header>
        <section><small>{t.reportSummary}</small><h3>{reportPreview.summary}</h3></section>
        {reportPreview.calculationBasis && <dl aria-label={t.reportCalculation}>
          <div><dt>{locale === "ko" ? "인생수" : "Life Path"}</dt><dd>{reportPreview.calculationBasis.lifePath}</dd></div>
          <div><dt>{locale === "ko" ? "생일수" : "Birthday"}</dt><dd>{reportPreview.calculationBasis.birthday}</dd></div>
          <div><dt>{locale === "ko" ? "태도수" : "Attitude"}</dt><dd>{reportPreview.calculationBasis.attitude}</dd></div>
          <div><dt>{locale === "ko" ? "개인연도" : "Personal year"}</dt><dd>{reportPreview.calculationBasis.personalYear}</dd></div>
        </dl>}
        <div className="dh-report-chapters"><small>{t.reportChapters}</small><ol>{reportPreview.outline.entries.map((entry) => <li key={entry.position}><b>{String(entry.position).padStart(2, "0")}</b><div><strong>{entry.title}</strong>{entry.excerpt && <p>{entry.excerpt}</p>}</div>{entry.locked && <span>{t.reportLocked}</span>}</li>)}</ol></div>
        <footer><small>{t.reportNext}</small><p>{reportPreview.nextAction}</p></footer>
      </article>
    </section>

    {reviews.length > 0 && <section className="dh-reviews" aria-labelledby="dh-reviews-title">
      <header><p className="dh-eyebrow">{t.reviewsEyebrow}</p><h2 id="dh-reviews-title">{t.reviewsTitle}</h2><p>{t.reviewsBody}</p>{showReviewCount && <small>{locale === "ko" ? `공개된 후기 ${reviewCount!.toLocaleString("ko-KR")}개 중 최근 후기입니다.` : `Recent entries from ${reviewCount!.toLocaleString("en-US")} published reviews.`}</small>}</header>
      <div>{reviews.map((review) => <article key={review.id}><small>{reviewTypeLabels[locale][review.reviewType]} · {review.publishedMonth}</small>{review.wantedToUnderstand && <h3>{review.wantedToUnderstand}</h3>}<p>{review.mostUseful}</p><footer><strong>{review.displayName || anonymousFallbackName[locale]}</strong><span>{changedActionLabels[locale][review.changedAction]}</span></footer></article>)}</div>
    </section>}

    <section className="dh-space" aria-labelledby="dh-space-title">
      <div className="dh-space-visual">
        <figure><Image alt={locale === "ko" ? "3D 공간운 현재 배치 예시" : "Current 3D Space example"} height={1082} src="/images/space/previews/bedroom-before-v1.png" width={1354} sizes="(max-width: 760px) 78vw, 34vw" /><figcaption>{t.before}</figcaption></figure>
        <figure><Image alt={locale === "ko" ? "3D 공간운 추천 배치 예시" : "Suggested 3D Space example"} height={1082} src="/images/space/previews/bedroom-after-v1.png" width={1354} sizes="(max-width: 760px) 78vw, 34vw" /><figcaption>{t.after}</figcaption></figure>
      </div>
      <div className="dh-space-copy"><p className="dh-eyebrow">{t.spaceEyebrow}</p><h2 id="dh-space-title">{t.spaceTitle}</h2><p>{t.spaceBody}</p><ol>{t.spaceFlow.map((step, index) => <li key={step}><small>{String(index + 1).padStart(2, "0")}</small>{step}</li>)}</ol><Link href={`/${locale}/space`} prefetch={false}>{t.spaceAction}<Arrow /></Link></div>
    </section>

    <section className="dh-close" aria-labelledby="dh-close-title"><div><p className="dh-eyebrow">TAERYEONGDANG</p><h2 id="dh-close-title">{t.closeTitle}</h2><p>{t.closeBody}</p><div><Link href={`/${locale}/numerology`} prefetch={false}>{t.closeAction}<Arrow /></Link><Link href={`/${locale}/reality-check`} prefetch={false}>{t.closeHistory}</Link></div></div><span aria-hidden="true">太<br />靈<br />堂</span></section>

    <footer className="dh-footer">
      <div><Link href={`/${locale}`} prefetch={false}><strong>태령당</strong><small>TAERYEONGDANG</small></Link><p>{t.footerBody}</p></div>
      <nav aria-label={locale === "ko" ? "공식 채널 및 법률 안내" : "Official channels and legal"}><a href={OFFICIAL_NAVER_BLOG_URL} rel="me noopener noreferrer" target="_blank">{locale === "ko" ? "공식 블로그" : "Official blog"}</a><Link href={`/${locale}/terms`} prefetch={false}>{locale === "ko" ? "이용조건" : "Terms"}</Link><Link href={`/${locale}/privacy`} prefetch={false}>{locale === "ko" ? "개인정보" : "Privacy"}</Link><Link href={`/${locale}/orders`} prefetch={false}>{locale === "ko" ? "구매 내역" : "Purchases"}</Link><Link href={`/${locale}/support`} prefetch={false}>{locale === "ko" ? "결제·환불 문의" : "Payment & refunds"}</Link></nav>
      <p>{t.footerBoundary}</p><small>{t.copyright}</small>
    </footer>
  </div>;
}
