import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceShare } from "@/components/service-share";
import { ReferralInvite } from "@/components/referral-invite";
import { resolveProductPricing, THREE_DAY_EVENT_END } from "@/core/product-prices";
import { resolvePublicAppUrl } from "@/core/site-url";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "ko" ? "3일간 전 상품 1,500원 · 친구 초대 이벤트 | 결 GYEOL" : "Three-day ₩1,500 campaign | GYEOL",
    description: locale === "ko" ? "결 GYEOL 전 상품 1,500원 행사와 친구 초대 5,000원 쿠폰 안내." : "GYEOL's three-day campaign and ₩5,000 referral coupon.",
  };
}

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const baseUrl = resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  const eventUrl = new URL(`/${locale}/events`, baseUrl).toString();
  const pricing = resolveProductPricing();
  const endLabel = new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    dateStyle: "long", timeStyle: "short", timeZone: "Asia/Seoul",
  }).format(new Date(THREE_DAY_EVENT_END));

  const ko = locale === "ko";
  const faqs = ko ? [
    ["정말 모든 리딩이 1,500원인가요?", "행사 기간에는 사주 원국, 상세 리딩, 프리미엄 심층 리딩 모두 1회 1,500원입니다. 액세서리 상품은 포함되지 않습니다."],
    ["언제 끝나나요?", `${endLabel}에 자동 종료되며, 종료 뒤에는 결제 시점의 정상가가 적용됩니다.`],
    ["친구 초대 쿠폰은 어떻게 받나요?", "내 결제 휴대폰 번호를 입력하고 초대 링크를 공유하면 5,000원 쿠폰이 바로 표시됩니다. 쿠폰은 해당 번호에 연결되며 행사 종료 뒤 정상가 39,000원 이상 리딩에 1회 사용할 수 있습니다."],
    ["행사 가격과 쿠폰을 같이 쓸 수 있나요?", "아니요. 1,500원 행사와 친구 초대 쿠폰은 중복 적용되지 않습니다. 쿠폰은 정상가 결제에서 사용할 수 있습니다."],
    ["결과 리포트를 공유해도 되나요?", "가능합니다. 다만 생년월일과 개인 해석이 포함되므로 결과 화면의 동의 확인 뒤 신뢰하는 사람에게만 보내 주세요."],
    ["운세가 미래를 보장하나요?", "아닙니다. 결의 수비학·사주 리딩은 자기 성찰을 돕는 상징적 도구이며 과학적 예측, 진단, 치료 또는 전문적 조언을 대신하지 않습니다."],
  ] : [
    ["Is every reading really ₩1,500?", "During the campaign, the Four Pillars chart, Detailed reading, and Premium in-depth reading each cost ₩1,500. Accessories are excluded."],
    ["When does it end?", `It ends automatically at ${endLabel}. The regular price shown at checkout applies afterward.`],
    ["How is the referral coupon issued?", "Enter your checkout mobile number and share the invite link. Your ₩5,000 coupon appears immediately, bound to that number, and can be used once on a regular-price reading of ₩39,000 or more after the campaign."],
    ["Can I combine both offers?", "No. The referral coupon cannot be combined with the ₩1,500 campaign and is used against a regular-price checkout."],
    ["Can I share a result report?", "Yes, after confirming the recipient's consent. Reports contain personal birth details and interpretation, so share only with someone you trust."],
    ["Does a reading guarantee the future?", "No. Numerology and Saju here are symbolic reflection tools, not scientific prediction, diagnosis, treatment, or professional advice."],
  ];

  return (
    <main className="shell event-shell" id="main-content">
      <header className="event-topbar">
        <Link className="brand" href={`/${locale}`}><strong>{ko ? "결 GYEOL" : "GYEOL"}</strong><small>{ko ? "홈으로" : "Home"}</small></Link>
        <nav aria-label={ko ? "이벤트 페이지" : "Event page"}><a href="#offers">{ko ? "혜택" : "Offers"}</a><a href="#faq">FAQ</a></nav>
      </header>
      <section className="event-hero">
        <p className="eyebrow">THREE DAYS · ALL READINGS</p>
        <h1>{ko ? "딱 3일, 모든 리딩 1,500원" : "Three days. Every reading. ₩1,500."}</h1>
        <p>{ko ? "궁금했던 리딩을 가격 때문에 미루지 않도록, 세 가지 유료 리딩을 같은 가격으로 열었습니다." : "All three paid readings are open at one simple campaign price."}</p>
        <div className="event-countdown-copy"><strong>{pricing.campaign ? (ko ? "지금 행사 중" : "Live now") : (ko ? "행사 종료" : "Campaign ended")}</strong><span>{ko ? `${endLabel}까지` : `Until ${endLabel}`}</span></div>
        <div className="event-hero-actions"><Link className="primary-button" href={`/${locale}/reading`}>{ko ? "리딩 고르기" : "Choose a reading"}</Link><ServiceShare locale={locale} url={eventUrl} /></div>
      </section>
      <section className="event-offer-grid" id="offers" aria-label={ko ? "이벤트 혜택" : "Campaign offers"}>
        <article><span>01</span><p className="eyebrow">3-DAY PRICE</p><h2>{ko ? "전 상품 1,500원" : "All readings ₩1,500"}</h2><p>{ko ? "사주 원국, 상세 리딩, 프리미엄 심층 리딩을 각각 1,500원에 이용할 수 있습니다." : "Four Pillars, Detailed, and Premium in-depth readings each cost ₩1,500."}</p><Link href={`/${locale}/plans`}>{ko ? "상품과 가격 보기" : "See plans and prices"}</Link></article>
        <article><span>02</span><p className="eyebrow">INVITE A FRIEND</p><h2>{ko ? "친구 초대하면 5,000원 쿠폰" : "Invite a friend, get ₩5,000"}</h2><p>{ko ? "초대 링크를 공유하면 내 결제 휴대폰 번호에 연결된 쿠폰이 바로 발급됩니다. 행사 종료 뒤 정상가 39,000원 이상 리딩에 1회 사용하세요." : "Share an invite link and receive a coupon bound to your checkout mobile number. Use it once on a regular-price reading of ₩39,000 or more after the campaign."}</p><ReferralInvite eventUrl={eventUrl} locale={locale} /></article>
      </section>
      <section className="event-faq" id="faq"><p className="eyebrow">FAQ</p><h2>{ko ? "자주 묻는 질문" : "Frequently asked questions"}</h2>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
      <footer className="event-footer"><Link href={`/${locale}`}>{ko ? "홈으로 돌아가기" : "Back home"}</Link><Link href={`/${locale}/terms`}>{ko ? "이용조건" : "Terms"}</Link><Link href={`/${locale}/privacy`}>{ko ? "개인정보" : "Privacy"}</Link></footer>
    </main>
  );
}
