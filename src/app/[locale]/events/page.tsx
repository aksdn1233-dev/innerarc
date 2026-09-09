import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReferralInvite } from "@/components/referral-invite";
import { ServiceShare } from "@/components/service-share";
import {
  ONE_WEEK_EXTENSION_END,
  ONE_WEEK_REVIEW_DRAW_AT,
  resolveProductPricing,
} from "@/core/product-prices";
import { resolvePublicAppUrl } from "@/core/site-url";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "ko" ? "일주일 연장 · 사주 원국·상세 리딩 1,500원 | 태령당" : "One-week extension · two readings at ₩1,500 | 태령당",
    description: locale === "ko" ? "사주 원국과 상세 리딩을 단 일주일 1,500원에. 프리미엄 심층 리딩 79,000원은 행사에서 제외되며 후기 추첨 이벤트는 계속됩니다." : "Four Pillars and Detailed readings are ₩1,500 for one week. The ₩79,000 Premium reading is excluded; the review draw continues.",
  };
}

function formatKst(value: string, locale: "ko" | "en") {
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const baseUrl = resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  const eventUrl = new URL(`/${locale}/events`, baseUrl).toString();
  const pricing = resolveProductPricing();
  const ko = locale === "ko";
  const endLabel = formatKst(ONE_WEEK_EXTENSION_END, locale);
  const drawLabel = formatKst(ONE_WEEK_REVIEW_DRAW_AT, locale);
  const faqs = ko ? [
    ["어떤 상품이 1,500원인가요?", "사주 원국(정상가 5,500원)과 상세 리딩(정상가 39,000원), 두 가지 디지털 리딩이 행사 기간 각각 1회 1,500원입니다. 프리미엄 심층 리딩은 행사에서 제외되어 79,000원이며, 액세서리와 향후 실물 상품도 포함되지 않습니다."],
    ["언제 끝나나요?", `${endLabel}에 자동 종료됩니다. 종료 뒤에는 결제 시점에 표시되는 정상가가 적용됩니다.`],
    ["후기 이벤트에는 어떻게 응모하나요?", "행사 기간 결제가 완료된 리포트 하단의 ‘리딩 후기’에서 후기 이벤트 응모에 별도 동의하고 제출하면 됩니다. 주문당 1회이며, 공개 후기 동의는 필수가 아닙니다."],
    ["공유도 해야 응모되나요?", "공유 버튼은 행사 소식을 원하는 사람에게 직접 보낼 수 있도록 마련했습니다. 외부 앱에서 실제로 전송했는지는 결이 추적하거나 저장하지 않으므로 추첨 응모 조건은 후기 제출과 별도 응모 동의입니다."],
    ["당첨자는 어떻게 확인하나요?", `${drawLabel} 이후 이 페이지에 주문번호 일부를 가려 게시합니다. 당첨자는 게시일로부터 7일 안에 고객지원으로 연락해 해당 리포트의 소유를 확인하면 됩니다. 기한 내 확인되지 않으면 다시 추첨합니다.`],
    ["친구 초대 쿠폰과 같이 쓸 수 있나요?", "1,500원으로 할인된 사주 원국과 상세 리딩에는 중복 적용되지 않습니다. 행사에서 제외된 79,000원 프리미엄 심층 리딩에는 기존 쿠폰 조건을 충족하면 사용할 수 있습니다."],
    ["리딩이 미래를 보장하나요?", "아닙니다. 결의 생년월일 패턴과 사주는 자기 성찰을 돕는 상징적 도구이며 과학적 예측, 진단, 치료, 법률·의료·재무 등 전문적 조언을 대신하지 않습니다."],
  ] : [
    ["Which products are ₩1,500?", "The Four Pillars chart (regular ₩5,500) and Detailed reading (regular ₩39,000) each cost ₩1,500 during the campaign. The Premium in-depth reading is excluded and remains ₩79,000; accessories and physical products are also excluded."],
    ["When does it end?", `The campaign ends automatically at ${endLabel}. The regular price shown at checkout applies afterward.`],
    ["How do I enter the review draw?", "At the bottom of a completed paid report, submit Reading Feedback and separately opt in to the prize draw. Entry is limited to one per order and public-review consent is not required."],
    ["Must I share to enter?", "The share button lets you send the event yourself. 태령당 does not track or store whether an external app completed a share, so eligibility is based on review submission and separate draw consent."],
    ["How is the winner announced?", `After ${drawLabel}, a masked order number will be posted on this page. The winner has seven days to contact support and prove access to that report; otherwise the draw is repeated.`],
    ["Can I combine the referral coupon?", "It cannot stack with the two ₩1,500 prices. A valid coupon can still be used on the non-discounted ₩79,000 Premium reading during the campaign."],
    ["Does a reading guarantee the future?", "No. Numerology and Saju are symbolic reflection tools, not scientific prediction, diagnosis, treatment, or professional advice."],
  ];

  return (
    <main className="shell event-shell" id="main-content">
      <header className="event-topbar">
        <Link className="brand" href={`/${locale}`}><strong>태령당</strong><small>{ko ? "홈으로" : "Home"}</small></Link>
        <nav aria-label={ko ? "이벤트 페이지" : "Event page"}><a href="#discount">{ko ? "할인" : "Discount"}</a><a href="#review-event">{ko ? "후기 이벤트" : "Review event"}</a><a href="#faq">FAQ</a></nav>
      </header>

      <section className="event-hero">
        <p className="eyebrow">ONE WEEK EXTENSION · TWO DIGITAL READINGS</p>
        <h1>{ko ? "딱 일주일 더, 두 리딩 1,500원" : "One more week. Two readings. ₩1,500."}</h1>
        <p>{ko ? "사주 원국과 상세 리딩만 같은 행사 가격으로 열었습니다. 프리미엄 심층 리딩 79,000원은 행사에서 제외되며, 기간이 지나면 두 할인 상품도 자동으로 정상가로 돌아갑니다." : "Four Pillars and Detailed readings share the campaign price. The ₩79,000 Premium reading is excluded, and the two discounted products return to regular prices automatically."}</p>
        <div className="event-countdown-copy"><strong>{pricing.campaign ? (ko ? "지금 연장 할인 중" : "Extension live now") : (ko ? "연장 할인 종료" : "Extension ended")}</strong><span>{ko ? `${endLabel}까지` : `Until ${endLabel}`}</span></div>
        <div className="event-hero-actions"><Link className="primary-button" href={`/${locale}/reading`}>{ko ? "1,500원 리딩 고르기" : "Choose a ₩1,500 reading"}</Link><ServiceShare locale={locale} url={eventUrl} /></div>
      </section>

      <section className="event-offer-grid" id="discount" aria-label={ko ? "행사 혜택" : "Campaign offers"}>
        <article><span>01</span><p className="eyebrow">ONE-WEEK PRICE</p><h2>{ko ? "두 리딩만 1,500원" : "Two readings at ₩1,500"}</h2><p>{ko ? "사주 원국 5,500원 → 1,500원 · 상세 리딩 39,000원 → 1,500원. 프리미엄 심층 리딩 79,000원은 행사 제외입니다. 모든 상품은 1회 결제이며 자동 갱신되지 않습니다." : "Four Pillars ₩5,500 → ₩1,500 · Detailed ₩39,000 → ₩1,500. The ₩79,000 Premium reading is excluded. Every purchase is one-time with no renewal."}</p><Link href={`/${locale}/plans`}>{ko ? "상품별 구성과 가격 보기" : "See products and prices"}</Link></article>

        <article id="review-event"><span>02</span><p className="eyebrow">REVIEW DRAW</p><h2>{ko ? "후기 남기고 15만원 상당 상품권" : "Review draw: ₩150,000 gift certificate"}</h2><p>{ko ? "행사 기간 리포트를 열고 후기를 남겨주세요. 별도 응모에 동의한 후기 중 1명을 추첨해 신세계상품권 15만원 상당을 드립니다. 공개 동의는 필수가 아닙니다." : "Leave feedback from a completed report and opt in separately. One eligible reviewer will be drawn for a Shinsegae gift certificate worth ₩150,000. Public-review consent is not required."}</p><div className="event-card-actions"><Link href={`/${locale}/orders`}>{ko ? "내 리포트 찾아 후기 남기기" : "Find my report and review"}</Link><Link href={`/${locale}/reading#evidence`}>{ko ? "후기 카테고리 보기" : "See review category"}</Link><ServiceShare compact locale={locale} url={eventUrl} /></div></article>

        <article><span>03</span><p className="eyebrow">FRIEND INVITATION</p><h2>{ko ? "친구 초대 5,000원 쿠폰" : "₩5,000 friend coupon"}</h2><p>{ko ? "초대 링크를 직접 공유하면 결제 휴대폰 번호에 연결된 쿠폰이 발급됩니다. 1,500원 할인 상품과는 중복되지 않으며, 행사에서 제외된 79,000원 프리미엄 심층 리딩에는 기존 조건에 따라 사용할 수 있습니다." : "Share an invitation link yourself to receive a coupon bound to your checkout phone. It does not stack with the ₩1,500 prices and remains usable on the non-discounted ₩79,000 Premium reading when its normal conditions are met."}</p><ReferralInvite eventUrl={eventUrl} locale={locale} /></article>
      </section>

      <section className="event-terms" aria-labelledby="event-terms-title">
        <p className="eyebrow">EVENT TERMS</p><h2 id="event-terms-title">{ko ? "응모 전에 확인해 주세요" : "Before you enter"}</h2>
        <ul>
          <li>{ko ? `응모 기간: 행사 시작 시점부터 ${endLabel}까지` : `Entry period: campaign start through ${endLabel}`}</li>
          <li>{ko ? "응모 대상: 기간 내 완료된 결제 리포트에서 후기 제출과 이벤트 응모에 각각 동의한 이용자" : "Eligibility: a completed paid report, submitted feedback, and separate draw consent during the period"}</li>
          <li>{ko ? "당첨: 1명 · 신세계상품권 총 150,000원 상당 · 무작위 추첨" : "Prize: one winner · Shinsegae gift certificate worth ₩150,000 · random draw"}</li>
          <li>{ko ? `추첨 예정: ${drawLabel} · 결과는 이 페이지에 가린 주문번호로 게시` : `Draw: ${drawLabel} · result posted here as a masked order number`}</li>
          <li>{ko ? "부정·중복 응모, 취소·환불된 주문, 행사 종료 후 동의한 후기는 제외됩니다." : "Duplicate or abusive entries, cancelled/refunded orders, and consent after the deadline are excluded."}</li>
          <li>{ko ? "응모를 위해 연락처를 추가 수집하지 않습니다. 당첨 확인 뒤 경품 전달에 필요한 정보는 고객지원에서 별도 안내·동의를 거쳐 받습니다." : "No extra contact details are collected to enter. Fulfilment details are requested through support only after winner verification and separate notice and consent."}</li>
        </ul>
      </section>

      <section className="event-faq" id="faq"><p className="eyebrow">FAQ</p><h2>{ko ? "자주 묻는 질문" : "Frequently asked questions"}</h2>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
      <footer className="event-footer"><Link href={`/${locale}`}>{ko ? "홈으로 돌아가기" : "Back home"}</Link><Link href={`/${locale}/terms`}>{ko ? "이용조건" : "Terms"}</Link><Link href={`/${locale}/privacy`}>{ko ? "개인정보" : "Privacy"}</Link><Link href={`/${locale}/support`}>{ko ? "고객지원" : "Support"}</Link></footer>
    </main>
  );
}
