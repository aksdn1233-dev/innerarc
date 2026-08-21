"use client";

import { useState } from "react";

export function ReportActions({
  downloadUrl,
  locale,
}: {
  downloadUrl: string;
  locale: "ko" | "en";
}) {
  const [giftConsent, setGiftConsent] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "shared" | "copied" | "failed">("idle");

  const text = locale === "ko"
    ? {
        subject: "결 GYEOL 리딩을 선물로 보냅니다",
        body: "당신을 위해 준비한 결 GYEOL 리딩입니다. 아래 주소에서 확인해 주세요.",
        giftTitle: "이 리딩을 다른 사람에게 선물하기",
        giftBody: "받는 분의 동의를 확인한 뒤 이메일이나 휴대폰 공유창으로 전달할 수 있습니다. 링크를 받은 사람은 리포트의 개인 내용을 볼 수 있으니 신뢰하는 사람에게만 보내 주세요.",
        consent: "받는 분에게 생년월일 등 정보를 입력하고 결과를 전달할 동의를 받았습니다.",
        email: "이메일로 보내기",
        kakao: "카카오톡 등으로 보내기",
        copy: "선물 링크 복사",
        shared: "공유창을 열었습니다.",
        copied: "선물 링크를 복사했습니다.",
        failed: "공유하지 못했습니다. 링크 복사를 이용해 주세요.",
      }
    : {
        subject: "A GYEOL reading for you",
        body: "I prepared this GYEOL reading for you. Open it at the address below.",
        giftTitle: "Gift this reading to someone else",
        giftBody: "Confirm the recipient's consent, then send it by email or your device's share menu. Anyone with an accessible link may see the personal report, so share only with someone you trust.",
        consent: "I have the recipient's consent to enter their birth details and send them this result.",
        email: "Send by email",
        kakao: "Send via KakaoTalk or another app",
        copy: "Copy gift link",
        shared: "The share menu opened.",
        copied: "Gift link copied.",
        failed: "Sharing failed. Try copying the link instead.",
      };

  function sendByEmail() {
    if (!giftConsent) return;
    window.location.href = `mailto:?subject=${encodeURIComponent(text.subject)}&body=${encodeURIComponent(`${text.body}\n\n${window.location.href}`)}`;
  }

  async function shareToApp() {
    if (!giftConsent) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: text.subject, text: text.body, url: window.location.href });
        setShareStatus("shared");
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus("copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus("failed");
    }
  }

  async function copyGiftLink() {
    if (!giftConsent) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus("copied");
    } catch {
      setShareStatus("failed");
    }
  }

  return (
    <>
      <div className="report-actions">
        <a className="primary-button" href={downloadUrl}>
          {locale === "ko" ? "리포트 파일 내려받기" : "Download report"}
        </a>
        <button className="secondary-button" type="button" onClick={() => window.print()}>
          {locale === "ko" ? "인쇄·PDF로 저장" : "Print or save as PDF"}
        </button>
      </div>
      <section className="report-gift-panel" aria-labelledby="report-gift-title">
        <p className="eyebrow">GIFT & SHARE</p>
        <h2 id="report-gift-title">{text.giftTitle}</h2>
        <p>{text.giftBody}</p>
        <label className="report-gift-consent">
          <input
            checked={giftConsent}
            onChange={(event) => { setGiftConsent(event.target.checked); setShareStatus("idle"); }}
            type="checkbox"
          />
          <span>{text.consent}</span>
        </label>
        <div className="report-gift-actions">
          <button className="primary-button" disabled={!giftConsent} onClick={() => void shareToApp()} type="button">{text.kakao}</button>
          <button className="secondary-button" disabled={!giftConsent} onClick={sendByEmail} type="button">{text.email}</button>
          <button className="secondary-button" disabled={!giftConsent} onClick={() => void copyGiftLink()} type="button">{text.copy}</button>
        </div>
        <p aria-live="polite" className="report-gift-status">
          {shareStatus === "shared" ? text.shared : shareStatus === "copied" ? text.copied : shareStatus === "failed" ? text.failed : ""}
        </p>
      </section>
    </>
  );
}
