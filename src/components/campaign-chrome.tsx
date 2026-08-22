"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";

const DISMISS_KEY = "gyeol.campaign.three-day-1500.dismissed.v1";

export function CampaignChrome({ locale, endsAt }: { locale: Locale; endsAt: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const isHomeEntry = window.location.pathname === `/${locale}` || window.location.pathname === `/${locale}/`;
        setOpen(isHomeEntry && window.sessionStorage.getItem(DISMISS_KEY) !== "1");
      } catch {
        setOpen(false);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [locale]);

  function close() {
    setOpen(false);
    try { window.sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* session-only fallback */ }
  }

  const endLabel = new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(new Date(endsAt));

  return (
    <>
      <nav className="campaign-utility-nav" aria-label={locale === "ko" ? "행사와 도움말" : "Campaign and help"}>
        <Link href={`/${locale}/events`}>{locale === "ko" ? "이벤트" : "Events"}</Link>
        <Link href={`/${locale}/events#faq`}>FAQ</Link>
      </nav>
      {open && (
        <div className="campaign-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) close();
        }}>
          <section aria-labelledby="campaign-modal-title" aria-modal="true" className="campaign-modal" role="dialog">
            <button aria-label={locale === "ko" ? "팝업 닫기" : "Close"} className="campaign-modal-close" onClick={close} type="button">×</button>
            <p className="eyebrow">3 DAYS ONLY</p>
            <h2 id="campaign-modal-title">{locale === "ko" ? "모든 리딩, 지금 1,500원" : "Every reading is ₩1,500"}</h2>
            <p>{locale === "ko"
              ? `단 3일 동안 사주 원국부터 프리미엄 심층 리딩까지 같은 행사 가격으로 이용하세요. ${endLabel} 종료됩니다.`
              : `For three days only, every paid reading is the same campaign price. Ends ${endLabel} (KST).`}</p>
            <div className="campaign-modal-actions">
              <Link className="primary-button" href={`/${locale}/events`} onClick={close}>{locale === "ko" ? "행사 자세히 보기" : "See campaign"}</Link>
              <button className="secondary-button" onClick={close} type="button">{locale === "ko" ? "계속 둘러보기" : "Keep browsing"}</button>
            </div>
            <small>{locale === "ko" ? "친구 초대 쿠폰과 중복 적용되지 않습니다." : "Cannot be combined with the referral coupon."}</small>
          </section>
        </div>
      )}
    </>
  );
}
