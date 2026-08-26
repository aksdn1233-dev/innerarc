import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReferralInvite } from "@/components/referral-invite";
import { resolvePublicAppUrl } from "@/core/site-url";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "ko" ? "친구 초대 혜택 | 결 GYEOL" : "Friend invitation benefit | GYEOL",
    description: locale === "ko" ? "결 GYEOL 친구 초대 5,000원 쿠폰의 발급·사용 조건 안내." : "Terms for GYEOL's ₩5,000 friend invitation coupon.",
  };
}

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const baseUrl = resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  const eventUrl = new URL(`/${locale}/events`, baseUrl).toString();

  const ko = locale === "ko";
  const faqs = ko ? [
    ["친구 초대 쿠폰은 어떻게 받나요?", "내 결제 휴대폰 번호를 입력하고 초대 링크를 공유하면 5,000원 쿠폰이 표시됩니다. 쿠폰은 해당 번호에 연결되며 39,000원 이상 리딩에 1회 사용할 수 있습니다."],
    ["어떤 상품에 사용할 수 있나요?", "상세 리딩과 프리미엄 심층 리딩에 사용할 수 있습니다. 사주 원국 상품에는 적용되지 않습니다."],
    ["휴대폰 번호가 저장되나요?", "원문 번호는 저장하지 않습니다. 쿠폰을 발급한 번호와 결제 번호가 같은지 확인하기 위한 서명값만 사용합니다."],
    ["결과 리포트를 공유해도 되나요?", "가능합니다. 다만 생년월일과 개인 해석이 포함되므로 결과 화면의 동의 확인 뒤 신뢰하는 사람에게만 보내 주세요."],
    ["운세가 미래를 보장하나요?", "아닙니다. 결의 수비학·사주 리딩은 자기 성찰을 돕는 상징적 도구이며 과학적 예측, 진단, 치료 또는 전문적 조언을 대신하지 않습니다."],
  ] : [
    ["How is the invitation coupon issued?", "Enter your checkout mobile number and share the invitation link. Your ₩5,000 coupon is bound to that number and can be used once on a reading of ₩39,000 or more."],
    ["Which readings are eligible?", "The coupon can be used on Detailed and Premium in-depth readings. It does not apply to the Four Pillars chart product."],
    ["Is the mobile number stored?", "The raw number is not stored. Only a signed value is used to verify that the issuing and checkout numbers match."],
    ["Can I share a result report?", "Yes, after confirming the recipient's consent. Reports contain personal birth details and interpretation, so share only with someone you trust."],
    ["Does a reading guarantee the future?", "No. Numerology and Saju here are symbolic reflection tools, not scientific prediction, diagnosis, treatment, or professional advice."],
  ];

  return (
    <main className="shell event-shell" id="main-content">
      <header className="event-topbar">
        <Link className="brand" href={`/${locale}`}><strong>{ko ? "결 GYEOL" : "GYEOL"}</strong><small>{ko ? "홈으로" : "Home"}</small></Link>
        <nav aria-label={ko ? "친구 초대 안내" : "Friend invitation guide"}><a href="#offers">{ko ? "혜택" : "Benefit"}</a><a href="#faq">FAQ</a></nav>
      </header>
      <section className="event-hero">
        <p className="eyebrow">FRIEND INVITATION</p>
        <h1>{ko ? "친구와 함께 결을 읽어보세요" : "Invite a friend to discover GYEOL"}</h1>
        <p>{ko ? "초대 링크를 공유하면 발급 번호에 연결된 5,000원 쿠폰을 받을 수 있습니다. 메시지 전송은 이용자가 직접 선택합니다." : "Share an invitation link to receive a ₩5,000 coupon bound to the issuing number. You always choose whether and where to send it."}</p>
        <div className="event-hero-actions"><Link className="primary-button" href={`/${locale}/reading`}>{ko ? "리딩 둘러보기" : "Explore readings"}</Link></div>
      </section>
      <section className="event-offer-grid" id="offers" aria-label={ko ? "친구 초대 혜택" : "Friend invitation benefit"}>
        <article><span>01</span><p className="eyebrow">INVITE A FRIEND</p><h2>{ko ? "친구 초대하면 5,000원 쿠폰" : "Invite a friend, get ₩5,000"}</h2><p>{ko ? "초대 링크를 공유하면 결제 휴대폰 번호에 연결된 쿠폰이 발급됩니다. 39,000원 이상 리딩에 1회 사용할 수 있습니다." : "Share an invitation link to receive a coupon bound to your checkout mobile number. Use it once on a reading of ₩39,000 or more."}</p><ReferralInvite eventUrl={eventUrl} locale={locale} /></article>
      </section>
      <section className="event-faq" id="faq"><p className="eyebrow">FAQ</p><h2>{ko ? "자주 묻는 질문" : "Frequently asked questions"}</h2>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
      <footer className="event-footer"><Link href={`/${locale}`}>{ko ? "홈으로 돌아가기" : "Back home"}</Link><Link href={`/${locale}/terms`}>{ko ? "이용조건" : "Terms"}</Link><Link href={`/${locale}/privacy`}>{ko ? "개인정보" : "Privacy"}</Link></footer>
    </main>
  );
}
