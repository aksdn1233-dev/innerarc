"use client";

import Image from "next/image";
import Link from "next/link";
import { captureConversionEvent } from "@/core/analytics";
import type { Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
  reviewCount: number | null;
  spaceAvailable: boolean;
};

const content = {
  ko: {
    navLabel: "태령당 주요 메뉴",
    services: "서비스 소개",
    analysis: "패턴 분석",
    success: "성공 패턴",
    relationship: "관계 분석",
    space: "3D 공간운",
    reviews: "이용 후기",
    login: "구매 내역",
    start: "지금 시작하기",
    kicker: "사람, 관계, 공간, 그리고 삶까지",
    title: <>당신에게<br />반복되는 패턴에는<br /><em>이유가 있을지도 모릅니다.</em></>,
    heroBody: "태령당은 동양의 상징 체계와 계산 가능한 패턴, 그리고 실제 삶의 기록을 함께 읽습니다.",
    heroPrimary: "내 패턴 확인하기",
    heroSecondary: "태령당 알아보기",
    heroNote: "무료 기본 분석 · 계산 근거 공개 · 결과를 직접 검증",
    heroArtNote: "브랜드 연출 이미지 · 생성형 이미지",
    readEyebrow: "태령당이 읽는 것",
    readTitle: <>하나의 생년월일로,<br />삶의 여러 장면을 연결합니다.</>,
    readBody: "서로 다른 답을 늘어놓기보다, 같은 사람이 여러 상황에서 반복하는 선택을 한 흐름으로 봅니다.",
    sajuHub: "사주 서비스로 이동",
    freePattern: "무료 패턴 보기",
    pillars: [
      ["01", "나를 읽습니다.", "사주 · 수비학 · 타로", "계산 근거와 상징 해석을 나누어 보여줍니다.", "/ko/numerology"],
      ["02", "사람을 비교합니다.", "성공 패턴 비교", "공개 생년월일에서 계산한 구조만 비교합니다.", "/ko/celebrity"],
      ["03", "관계를 읽습니다.", "궁합 · 관계 분석", "두 사람의 운영 방식과 마찰 지점을 살펴봅니다.", "/ko/relationship"],
      ["04", "공간까지 읽습니다.", "3D 공간운", "방 구조와 생활 동선을 실제 3D 장면으로 비교합니다.", "/ko/space"],
      ["05", "삶에서 확인합니다.", "Reality Check", "해석이 실제로 맞았는지 기록하고 다시 봅니다.", "/ko/reality-check"],
    ],
    previewEyebrow: "개인 패턴 분석",
    previewTitle: <>복잡한 이론을 숨기지 않고,<br />읽을 수 있는 근거로 바꿉니다.</>,
    previewBody: "아래는 태령당의 실제 결과 구조를 단순화한 예시입니다. 숫자는 결정론적 계산으로 만들고, 해석과 현실 확인을 구분합니다.",
    previewCta: "무료 분석 시작하기",
    sample: "예시 결과",
    sampleDate: "1994년 11월 4일",
    sampleHeadline: "깊이 파고들면서도, 사람의 온도를 놓치지 않는 유형",
    chartLabels: ["사고력", "표현력", "실행력", "관계감각", "회복력", "변화적응"],
    successEyebrow: "성공 패턴 비교",
    successTitle: <>닮은 숫자보다,<br />다르게 살아낸 방식을 봅니다.</>,
    successBody: "공개된 생년월일과 출처가 있는 경력 사건만 사용합니다. 유명인의 삶이 당신의 미래를 정한다는 뜻은 아닙니다.",
    successCta: "내 성공 패턴 비교하기",
    relationshipEyebrow: "관계 인텔리전스",
    relationshipTitle: <>마음이 맞는지보다,<br />어디에서 어긋나는지 선명하게.</>,
    relationshipBody: "연인, 가족, 친구, 동료, 사업 파트너의 선택 방식을 여덟 영역에서 비교합니다. 점수로 관계의 좋고 나쁨을 단정하지 않습니다.",
    relationshipCta: "관계 분석 시작하기",
    spaceEyebrow: "태령당 공간 인텔리전스",
    spaceTitle: <>공간까지 읽습니다.<br /><span>사진에서 실제 3D 장면으로.</span></>,
    spaceBody: "서로 다른 방향의 사진을 교차 확인하고, 실측 한 곳으로 비율을 보정합니다. 가구 배치는 같은 시점과 실제 렌더 해상도로 비교합니다.",
    spaceCta: "내 공간 분석하기",
    spaceDemo: "3D 예시 직접 보기",
    before: "현재 배치",
    after: "추천 배치",
    spaceBubble: "침대 옆 통로를 먼저 확보해 보세요.",
    spaceDisclosure: "전통 풍수 해석 · 공간·생활 분석 · 개인 패턴 추천을 구분해 표시합니다.",
    realityEyebrow: "REALITY CHECK",
    realityTitle: <>해석에서 끝내지 않습니다.<br />실제 삶에서 맞았는지 확인합니다.</>,
    realityBody: "한 달 뒤의 기록이 다음 해석의 근거가 됩니다. 맞지 않은 결과도 지우지 않고 함께 남깁니다.",
    realityCta: "Reality Check 시작하기",
    realityOrbit: "현실에서\n검증된 해석",
    closeTitle: "지금, 당신의 이야기를 시작해보세요.",
    closeBody: "오늘의 나를 읽고, 시간이 지나며 실제 삶과 맞는지 확인하세요.",
    closeCta: "무료로 시작하기",
    benefits: ["간단한 시작", "계산 근거 공개", "개인 맞춤 리포트", "지속적인 확인"],
    footerBody: "상징을 현실의 질문으로 바꾸고, 실제 삶으로 확인하는 개인 패턴 분석.",
    footerBoundary: "사주·수비학·타로·풍수는 성찰을 위한 상징적 도구이며 과학적 예측, 진단, 치료 또는 결과 보장이 아닙니다.",
    copyright: "별루프 · 대표 박서준 · 사업자등록번호 482-12-03629 · 부산광역시 북구",
  },
  en: {
    navLabel: "Taeryeongdang main navigation",
    services: "Services", analysis: "Pattern analysis", success: "Success patterns", relationship: "Relationships", space: "3D Space", reviews: "Reviews", login: "Purchases", start: "Start now",
    kicker: "People, relationships, spaces, and lived experience",
    title: <>There may be a reason<br />the same patterns<br /><em>keep returning.</em></>,
    heroBody: "Taeryeongdang connects symbolic traditions, deterministic calculations, and what you record from real life.",
    heroPrimary: "See my patterns", heroSecondary: "Meet Taeryeongdang", heroNote: "Free foundation · Visible calculations · Reality-checked", heroArtNote: "Brand scene · generated image",
    readEyebrow: "WHAT WE READ", readTitle: <>One birth date,<br />connected across real life.</>, readBody: "Rather than scatter unrelated answers, we trace the choices one person repeats across different settings.", sajuHub: "Open Four Pillars services", freePattern: "View free pattern",
    pillars: [
      ["01", "Read yourself.", "Saju · numerology · tarot", "Calculated evidence and symbolic interpretation stay distinct.", "/en/numerology"],
      ["02", "Compare people.", "Success pattern comparison", "Only structures calculated from public birth dates are compared.", "/en/celebrity"],
      ["03", "Read relationships.", "Compatibility · relationships", "See how two people operate and where friction may arise.", "/en/relationship"],
      ["04", "Read the space.", "3D Space", "Compare room structure and circulation in a real 3D scene.", "/en/space"],
      ["05", "Check real life.", "Reality Check", "Record whether an interpretation held up and revisit it later.", "/en/reality-check"],
    ],
    previewEyebrow: "PERSONAL PATTERN ANALYSIS", previewTitle: <>Complex ideas become<br />evidence you can read.</>, previewBody: "This simplified sample follows the actual result structure. Deterministic code produces the numbers; interpretation and lived evidence stay separate.", previewCta: "Start free analysis", sample: "Sample result", sampleDate: "4 November 1994", sampleHeadline: "A person who goes deep without losing sight of human warmth", chartLabels: ["Thinking", "Expression", "Action", "Connection", "Recovery", "Adaptation"],
    successEyebrow: "SUCCESS PATTERN COMPARISON", successTitle: <>Look past matching numbers<br />to how lives diverged.</>, successBody: "We use public birth dates and sourced career events. A public figure's life does not determine your future.", successCta: "Compare my success pattern",
    relationshipEyebrow: "RELATIONSHIP INTELLIGENCE", relationshipTitle: <>See where you diverge,<br />not just whether you match.</>, relationshipBody: "Compare how partners, family, friends, coworkers, or business partners operate across eight domains. No score decides whether a relationship is good or bad.", relationshipCta: "Start relationship analysis",
    spaceEyebrow: "TAERYEONGDANG SPACE INTELLIGENCE", spaceTitle: <>Read the space.<br /><span>From photos to a real 3D scene.</span></>, spaceBody: "Cross-check different views and calibrate proportions with one measured wall. Compare furniture in the same camera view at real render resolution.", spaceCta: "Analyze my space", spaceDemo: "Try the 3D example", before: "Current", after: "Suggested", spaceBubble: "Try clearing the passage beside the bed first.", spaceDisclosure: "Traditional interpretation, practical space analysis, and personal pattern suggestions are labelled separately.",
    realityEyebrow: "REALITY CHECK", realityTitle: <>Go beyond interpretation.<br />Check it against real life.</>, realityBody: "A later reflection becomes evidence for the next reading. Results that missed remain visible too.", realityCta: "Start Reality Check", realityOrbit: "Tested in\nreal life",
    closeTitle: "Begin your story today.", closeBody: "Read where you are now, then return to see what matched real life.", closeCta: "Start free", benefits: ["Simple start", "Visible evidence", "Personal report", "Ongoing checks"], footerBody: "Personal Pattern Intelligence that turns symbols into real questions and checks them against lived experience.", footerBoundary: "Saju, numerology, tarot, and feng shui are symbolic reflection tools, not scientific prediction, diagnosis, treatment, or guaranteed outcomes.", copyright: "Byeolloof · Busan, Republic of Korea",
  },
} as const;

function Arrow() {
  return <span aria-hidden="true">→</span>;
}

export function TaeryeongLanding({ locale, reviewCount, spaceAvailable }: Props) {
  const t = content[locale];
  const pillars = spaceAvailable ? t.pillars : t.pillars.filter((item) => item[4] !== `/${locale}/space`);
  const reviewLabel = reviewCount && reviewCount > 0
    ? `${t.reviews} ${reviewCount}`
    : t.reviews;

  const track = () => captureConversionEvent("primary_cta_click", locale, { location: "hero" });

  return <main className="td2" id="main-content" tabIndex={-1}>
    <header className="td2-nav-shell">
      <Link className="td2-brand" href={`/${locale}`} aria-label={locale === "ko" ? "태령당 홈" : "Taeryeongdang home"}>
        <strong>태령당</strong><small>TAERYEONGDANG</small>
      </Link>
      <nav className="td2-nav" aria-label={t.navLabel}>
        <a href="#services">{t.services}</a>
        <Link href={`/${locale}/numerology`}>{t.analysis}</Link>
        <Link href={`/${locale}/celebrity`}>{t.success}</Link>
        <Link href={`/${locale}/relationship`}>{t.relationship}</Link>
        {spaceAvailable && <Link href={`/${locale}/space`} prefetch={false}>{t.space}</Link>}
        <Link href={`/${locale}/reading#evidence`} prefetch={false}>{reviewLabel}</Link>
      </nav>
      <div className="td2-nav-actions">
        <Link className="td2-login" href={`/${locale}/orders`}>{t.login}</Link>
        <Link className="td2-pill" href={`/${locale}/numerology`} onClick={track}>{t.start}<Arrow /></Link>
        <Link className="td2-language" href={`/${locale === "ko" ? "en" : "ko"}`} prefetch={false}>{locale === "ko" ? "EN" : "한국어"}</Link>
      </div>
    </header>

    <section className="td2-hero" aria-labelledby="td2-hero-title">
      <Image className="td2-hero-image" src="/images/brand/taeryeong-editorial-hero-v2.png" alt="" fill priority sizes="100vw" />
      <div className="td2-hero-wash" aria-hidden="true" />
      <div className="td2-hero-copy">
        <p className="td2-kicker">{t.kicker}</p>
        <h1 id="td2-hero-title">{t.title}</h1>
        <p className="td2-lead">{t.heroBody}</p>
        <div className="td2-actions">
          <Link className="td2-primary" href={`/${locale}/numerology`} onClick={track}>{t.heroPrimary}<Arrow /></Link>
          <a className="td2-secondary" href="#services">{t.heroSecondary}<Arrow /></a>
        </div>
        <p className="td2-note">{t.heroNote.split(" · ").map((part, index) => <span key={part}>{index > 0 ? " · " : ""}{part}</span>)}</p>
      </div>
      <div className="td2-hero-signature" aria-hidden="true"><span>태</span><span>령</span><span>당</span></div>
      <small className="td2-hero-art-note">{t.heroArtNote}</small>
    </section>

    <section className="td2-section td2-reading-map" id="services" aria-labelledby="td2-services-title">
      <header className="td2-heading">
        <div><p>{t.readEyebrow}</p><h2 id="td2-services-title">{t.readTitle}</h2></div>
        <span>{t.readBody}</span>
      </header>
      <div className="td2-service-bridges">
        <Link href={`/${locale}/fortune`}>{t.sajuHub}<Arrow /></Link>
        <Link href={`/${locale}/numerology`}>{t.freePattern}<Arrow /></Link>
      </div>
      <div className="td2-pillar-grid">
        {pillars.map(([number, title, label, body, href]) => <Link href={href} className="td2-pillar" key={number} prefetch={false}>
          <small>{number}</small><h3>{title}</h3><strong>{label}</strong><p>{body}</p><Arrow />
        </Link>)}
      </div>
    </section>

    <section className="td2-section td2-product-section" aria-labelledby="td2-preview-title">
      <div className="td2-copy-column">
        <p className="td2-eyebrow">{t.previewEyebrow}</p>
        <h2 id="td2-preview-title">{t.previewTitle}</h2>
        <p>{t.previewBody}</p>
        <Link className="td2-text-link" href={`/${locale}/numerology`} onClick={track}>{t.previewCta}<Arrow /></Link>
      </div>
      <article className="td2-report-preview" aria-label={t.sample}>
        <header><div><small>{t.sample}</small><strong>{t.sampleDate}</strong></div><span aria-hidden="true">⌁</span></header>
        <nav aria-label={locale === "ko" ? "예시 리포트 목차" : "Sample report sections"}><b>{locale === "ko" ? "전체 성향" : "Overview"}</b><span>{locale === "ko" ? "강점" : "Strengths"}</span><span>{locale === "ko" ? "주의점" : "Cautions"}</span><span>{locale === "ko" ? "인생 흐름" : "Rhythm"}</span></nav>
        <h3>{t.sampleHeadline}</h3>
        <div className="td2-radar-row">
          <div className="td2-radar" role="img" aria-label={t.chartLabels.map((label, index) => `${label} ${[82,72,64,88,76,69][index]}`).join(", ")}>
            <span /><span /><span /><i />
          </div>
          <dl>{t.chartLabels.map((label, index) => <div key={label}><dt>{label}</dt><dd><span style={{ width: `${[82,72,64,88,76,69][index]}%` }} /></dd></div>)}</dl>
        </div>
        <footer><span>{locale === "ko" ? "계산 근거" : "Calculation"}<b>11 · 4 · 6 · 7</b></span><span>{locale === "ko" ? "해석 구분" : "Evidence labels"}<b>{locale === "ko" ? "계산 · 상징 · 현실" : "fact · symbol · reality"}</b></span></footer>
      </article>
    </section>

    <section className="td2-editorial-pair">
      <article className="td2-success" aria-labelledby="td2-success-title">
        <div className="td2-copy-column">
          <p className="td2-eyebrow">{t.successEyebrow}</p><h2 id="td2-success-title">{t.successTitle}</h2><p>{t.successBody}</p>
          <Link className="td2-text-link" href={`/${locale}/celebrity`}>{t.successCta}<Arrow /></Link>
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
          <Link className="td2-text-link" href={`/${locale}/relationship`}>{t.relationshipCta}<Arrow /></Link>
        </div>
        <div className="td2-orbits" aria-hidden="true"><i /><i /><i /><div><span>A</span><span>B</span></div></div>
      </article>
    </section>

    {spaceAvailable && <section className="td2-space" aria-labelledby="td2-space-title">
      <div className="td2-space-copy">
        <p className="td2-eyebrow">{t.spaceEyebrow}</p><h2 id="td2-space-title">{t.spaceTitle}</h2><p>{t.spaceBody}</p>
        <div className="td2-actions"><Link className="td2-primary" href={`/${locale}/space/workspace`} prefetch={false}>{t.spaceCta}<Arrow /></Link><Link className="td2-space-link" href={`/${locale}/space#space-demo`} prefetch={false}>{t.spaceDemo}</Link></div>
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
    </section>}

    <section className="td2-reality" aria-labelledby="td2-reality-title">
      <div><p className="td2-eyebrow">{t.realityEyebrow}</p><h2 id="td2-reality-title">{t.realityTitle}</h2><p>{t.realityBody}</p><Link className="td2-light-button" href={`/${locale}/reality-check`}>{t.realityCta}<Arrow /></Link></div>
      <div className="td2-reality-orbit" aria-hidden="true"><i /><i /><span>{t.realityOrbit.split("\n").map(part => <b key={part}>{part}</b>)}</span><em /><em /></div>
    </section>

    <section className="td2-close" aria-labelledby="td2-close-title">
      <div><h2 id="td2-close-title">{t.closeTitle}</h2><p>{t.closeBody}</p><Link className="td2-primary" href={`/${locale}/numerology`} onClick={track}>{t.closeCta}<Arrow /></Link></div>
      <ul>{t.benefits.map((item, index) => <li key={item}><span>{["♙", "⌁", "◴", "△"][index]}</span>{item}</li>)}</ul>
      <div className="td2-mountain" aria-hidden="true" />
      <div className="td2-close-signature" aria-hidden="true"><span>태</span><span>령</span><span>당</span></div>
    </section>

    <footer className="td2-footer">
      <div><Link className="td2-brand" href={`/${locale}`}><strong>태령당</strong><small>TAERYEONGDANG</small></Link><p>{t.footerBody}</p></div>
      <nav aria-label={locale === "ko" ? "법률 및 고객 지원" : "Legal and support"}><Link href={`/${locale}/terms`}>{locale === "ko" ? "이용조건" : "Terms"}</Link><Link href={`/${locale}/privacy`}>{locale === "ko" ? "개인정보" : "Privacy"}</Link><Link href={`/${locale}/orders`}>{t.login}</Link><Link href={`/${locale}/support`}>{locale === "ko" ? "고객 문의" : "Support"}</Link></nav>
      <p className="td2-footer-boundary">{t.footerBoundary}</p><small>{t.copyright}</small>
    </footer>
  </main>;
}
