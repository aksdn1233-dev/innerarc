"use client";

import Image from "next/image";
import Link from "next/link";
import { captureConversionEvent } from "@/core/analytics";
import { HARANG_IMAGES, SITE_NAME } from "@/core/characters/harang";
import { OFFICIAL_NAVER_BLOG_URL } from "@/core/brand-links";
import type { DailyHealingReportPreview } from "@/components/daily-healing-home";
import type { PublicReview } from "@/core/reviews";
import type { Locale } from "@/i18n/config";
import type { HomeFaqEntry } from "@/i18n/home-faq";

type Props = { dreamAvailable: boolean; locale: Locale; reportPreview: DailyHealingReportPreview; reviews: readonly PublicReview[]; reviewCount: number | null; faq: readonly HomeFaqEntry[] };
const Arrow = () => <span aria-hidden="true">↗</span>;

export function HarangLanding({ dreamAvailable, locale, reportPreview, reviews, reviewCount, faq }: Props) {
  const ko = locale === "ko";
  const L = (k: string, e: string) => ko ? k : e;
  const start = L("내 이야기 무료로 풀어보기", "Start my free reading");
  const services = [
    ["numerology", L("나의 패턴", "My patterns"), L("비슷한 선택을 반복하는 이유가 궁금해요.", "Understand the choices you keep repeating."), "01"],
    ["daily-fortune", L("오늘의 흐름", "Daily reflection"), L("오늘 돌아볼 질문 하나를 가볍게 받아봐요.", "Take one small reflection question into today."), "02"],
    ["compatibility", L("두 사람 궁합", "Compatibility"), L("잘 맞는 점과 자주 부딪히는 점을 알아봐요.", "See where two people connect and clash."), "02"],
    ["space", L("풍수학", "Feng Shui"), L("내 방을 3D로 보고, 바꿀 배치를 찾아요.", "See your room in 3D and explore a better layout."), "03"],
    ...(dreamAvailable ? [["dreams", L("꿈 기록", "Dream journal"), L("꿈에서 남은 장면을 현실의 고민과 나눠 봐요.", "Separate dream scenes from your waking concerns."), "04"]] : []),
    ["celebrity", L("유명인과 비교", "Public-life comparison"), L("닮은 패턴을 서로 다른 삶과 나란히 봐요.", "Compare similar patterns across different lives."), dreamAvailable ? "05" : "04"],
  ];
  const track = () => captureConversionEvent("primary_cta_click", locale, { location: "hero" });
  return <main className="harang-renewal" id="main-content" tabIndex={-1}>
    <div className="harang-home-column">
      <header className="harang-topbar">
        <Link href={`/${locale}`} prefetch={false} aria-label={L("결 GYEOL 홈", "GYEOL home")}><strong>結</strong><span>{SITE_NAME[locale]}<small>WITH HARANG</small></span></Link>
        <nav aria-label={L("빠른 메뉴", "Quick links")}><Link href={`/${locale}/orders`} prefetch={false}>{L("구매 내역", "Purchases")}</Link><Link href={`/${ko ? "en" : "ko"}`} prefetch={false}>{ko ? "EN" : "한국어"}</Link></nav>
      </header>

      <section className="harang-cover" aria-labelledby="harang-home-title">
        <Image className="harang-cover-image" alt={L("밤 한옥 마당에서 이야기를 듣는 하랑 법사", "Harang welcomes you in a lantern-lit courtyard")} src={HARANG_IMAGES.baseLarge} fill sizes="(max-width: 600px) 100vw, 560px" priority unoptimized />
        <div className="harang-cover-shade" aria-hidden="true" />
        <p className="harang-cover-note">{L("“그 고민, 하나씩 같이 풀어봐요.”", "“Let’s take your question one step at a time.”")}</p>
        <div className="harang-cover-copy">
          <p className="harang-eyebrow">{L("하랑 법사의 사주 · 나의 패턴", "SAJU & PERSONAL PATTERNS WITH HARANG")}</p>
          <h1 id="harang-home-title">{L("왜 비슷한 일로", "Why do the same things")}<br />{L("자꾸 막힐까요?", "keep getting in the way?")}</h1>
          <p>{L("태어난 날에서 기질을 보고, 반복되는 선택을 짚어요. 사주 원국과 숫자 풀이부터 무료로 만나보세요.", "Explore your temperament and recurring choices from your birth date. Start with your free chart and number reading.")}</p>
          <Link className="harang-primary" href={`/${locale}/saju`} onClick={track} prefetch={false}>{start}<Arrow /></Link>
          <small>{L("회원가입 없이 · 결제 전에 무료 결과부터", "No sign-up · Read the free result before payment")}</small>
        </div>
      </section>

      <nav className="harang-section-nav" aria-label={L("서비스 둘러보기", "Explore the service")}><a href="#guide">{L("어떻게 보나요?", "How it works")}</a><a href="#preview">{L("결과 미리 보기", "Report preview")}</a><a href="#services">{L("다른 고민도 보기", "More to explore")}</a></nav>

      <section className="harang-home-section harang-how" id="guide" aria-labelledby="harang-how-title">
        <p className="harang-eyebrow">{L("처음이라면", "YOUR FIRST VISIT")}</p>
        <h2 id="harang-how-title">{L("질문은 하나씩.", "One question at a time.")}<br />{L("풀이는 내 속도로.", "Read at your own pace.")}</h2>
        <ol>
          {[
            [L("간단히 답해요", "Answer a few questions"), L("이름은 별명도 괜찮아요. 생년월일과 아는 만큼의 출생 시각을 알려주세요.", "A nickname is fine. Add your birth date and your birth time if known.")],
            [L("무료 풀이부터 읽어요", "Read the free chapters"), L("사주 원국, 어린 시절, 숫자로 본 나 등 여섯 장을 먼저 봐요. 계산 과정도 같이 보여드려요.", "Read six chapters, including your chart, childhood and numbers, with the calculation behind them.")],
            [L("더 궁금할 때 깊이 봐요", "Go deeper when you want"), L("상세 리딩에서 무엇을 더 보는지와 가격을 확인한 뒤 골라요.", "Review the added content and price before choosing a detailed reading.")],
          ].map(([title, body], i) => <li key={title}><span>0{i + 1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}
        </ol>
      </section>

      <section className="harang-home-section harang-preview" id="preview" aria-labelledby="harang-preview-title">
        <p className="harang-eyebrow">{L("실제 리포트 구성", "FROM THE ACTUAL REPORT")}</p>
        <h2 id="harang-preview-title">{L("읽고 나면,", "After the reading,")}<br />{L("내 선택이 조금 더 보여요.", "see your choices more clearly.")}</h2>
        <p>{L("상세 리포트 일부예요. 예시 생년월일로 만든 결과이며, 내 결과는 입력한 정보에 따라 달라져요.", "This is part of a detailed report generated from a sample birth date. Your result depends on your own input.")}</p>
        <article className="harang-sample">
          <header><span>{reportPreview.outline.tierLabel}</span><small>{L("예시 · 1994.11.04", "SAMPLE · 4 NOV 1994")}</small></header>
          <h3>{reportPreview.summary}</h3>
          {reportPreview.calculationBasis && <dl aria-label={L("예시 핵심 숫자", "Sample core numbers")}>
            {[
              [L("인생수", "Life Path"), reportPreview.calculationBasis.lifePath, L("삶을 바라보는 큰 방향", "Your broader approach")],
              [L("생일수", "Birthday"), reportPreview.calculationBasis.birthday, L("자연스럽게 드러나는 기질", "An everyday tendency")],
              [L("태도수", "Attitude"), reportPreview.calculationBasis.attitude, L("처음 마주할 때의 반응", "Your first response")],
            ].map(([label, value, help]) => <div key={label}><dt>{label}</dt><dd>{value}<small>{help}</small></dd></div>)}
          </dl>}
          <ol>{reportPreview.outline.entries.slice(0, 3).map(entry => <li key={entry.position}><span>{String(entry.position).padStart(2, "0")}</span><div><strong>{entry.title}</strong>{entry.excerpt && <p>{entry.excerpt}</p>}</div></li>)}</ol>
          <Link href={`/${locale}/samples/detail`} prefetch={false}>{L("상세 리포트 예시 읽어보기", "Read the detailed report sample")}<Arrow /></Link>
          <Link href={`/${locale}/reading#products`} prefetch={false}>{L("가격과 서비스 구성 보기", "Compare the readings and prices")}<Arrow /></Link>
        </article>
      </section>

      <section className="harang-home-section harang-services" id="services" aria-labelledby="harang-services-title">
        <p className="harang-eyebrow">{L("지금 궁금한 것부터", "START WITH YOUR QUESTION")}</p>
        <h2 id="harang-services-title">{L("사람도, 관계도,", "Yourself, your relationships,")}<br />{L("내 공간도 살펴봐요.", "even the space you live in.")}</h2>
        <div>{services.map(([route, title, body], index) => <Link href={`/${locale}/${route}`} key={route} prefetch={false}><small>{String(index + 1).padStart(2, "0")}</small><div><h3>{title}</h3><p>{body}</p></div><Arrow /></Link>)}</div>
      </section>

      <section className="harang-home-section harang-reality" id="reality-check" aria-labelledby="harang-reality-title">
        <p className="harang-eyebrow">REALITY CHECK</p>
        <h2 id="harang-reality-title">{L("그때 들은 말,", "What did the reading say?")}<br />{L("실제로는 어땠나요?", "What actually happened?")}</h2>
        <p>{L("맞은 점과 달랐던 점을 함께 남겨요. 내 삶에서 반복되는 흐름은 기록이 쌓일수록 더 잘 보이니까요.", "Keep both what fit and what did not. Returning to real experience helps you notice your recurring patterns.")}</p>
        <ol><li>{L("지난 풀이", "Past reading")}</li><li>{L("실제 경험", "Real experience")}</li><li>{L("다음 선택", "Next choice")}</li></ol>
        <Link href={`/${locale}/reality-check`} prefetch={false}>{L("내 경험 남기기", "Record my experience")}<Arrow /></Link>
      </section>

      {reviews.length > 0 && <section className="harang-home-section harang-reviews" id="reviews" aria-labelledby="harang-reviews-title"><p className="harang-eyebrow">{L("직접 남겨주신 이야기", "PUBLISHED READER STORIES")}</p><h2 id="harang-reviews-title">{L("읽고, 달라진 점들.", "What readers took away.")}</h2>{reviewCount !== null && reviewCount > 0 && <p>{L(`공개 후기 ${reviewCount}개`, `${reviewCount} published reviews`)}</p>}{reviews.map(review => <blockquote key={review.id}><p>{review.mostUseful}</p><footer>{review.displayName || L("익명", "Anonymous")} · {review.publishedMonth}</footer></blockquote>)}</section>}

      <section className="harang-home-section harang-faq" aria-labelledby="harang-faq-title">
        <h2 id="harang-faq-title">{L("시작하기 전에 궁금한 점", "Before you begin")}</h2>
        {faq.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
      </section>
      <section className="harang-home-section harang-ending">
        <Image src={HARANG_IMAGES.face} alt="" width={256} height={256} unoptimized />
        <h2>{L("마음에 걸렸던 그 질문,", "That question on your mind,")}<br />{L("여기서 시작해요.", "start with it here.")}</h2>
        <Link className="harang-primary" href={`/${locale}/saju`} prefetch={false}>{start}<Arrow /></Link>
        <Link className="harang-records" href={`/${locale}/me`} prefetch={false}>{L("내 기록 보러 가기", "Open my records")}</Link>
      </section>

      <footer className="harang-footer">
        <strong>{SITE_NAME[locale]} · {L("하랑 법사", "WITH HARANG")}</strong>
        <nav aria-label={L("공식 채널 및 법률 안내", "Official channels and legal")}><Link href={`/${locale}/terms`}>{L("이용조건", "Terms")}</Link><Link href={`/${locale}/privacy`}>{L("개인정보", "Privacy")}</Link><Link href={`/${locale}/orders`}>{L("구매 내역", "Purchases")}</Link><Link href={`/${locale}/support`}>{L("결제·환불 문의", "Payment & refunds")}</Link><a href={OFFICIAL_NAVER_BLOG_URL} rel="me noopener noreferrer" target="_blank">{L("공식 블로그", "Official blog")}</a></nav>
        <p>{L("사주·생년월일 패턴·풍수는 나를 돌아보는 상징적 해석이에요. 미래를 보장하거나 진단·치료·전문가의 조언을 대신하지 않아요.", "Saju, birth-date patterns and Feng Shui are symbolic reflection tools. They do not guarantee the future or replace diagnosis, treatment or professional advice.")}</p>
        <small>{L("별루프 · 대표 박서준 · 사업자등록번호 482-12-03629 · 부산광역시 북구", "Byeolloof · Park Seojun · Registration 482-12-03629 · Busan, Republic of Korea")}</small>
      </footer>
    </div>
  </main>;
}
