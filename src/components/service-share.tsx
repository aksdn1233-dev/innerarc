"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";

export function ServiceShare({ locale, url, compact = false }: { locale: Locale; url: string; compact?: boolean }) {
  const [status, setStatus] = useState<"idle" | "shared" | "copied" | "failed">("idle");
  const eventShare = /\/events(?:#|$|\?)/.test(url);
  const title = locale === "ko"
    ? eventShare ? "결 GYEOL 일주일 연장 이벤트" : "결 GYEOL 리딩"
    : eventShare ? "GYEOL one-week extension" : "GYEOL readings";
  const message = locale === "ko"
    ? eventShare
      ? "9월 6일 오후 4시 50분까지 모든 디지털 리딩 1,500원. 후기 작성자 중 1명을 추첨해 신세계상품권 15만원 상당을 드려요."
      : "생년월일로 나의 패턴을 살펴보는 결 GYEOL 리딩을 같이 봐요."
    : eventShare
      ? "Every digital reading is ₩1,500 until Sep 6 at 4:50 PM KST, with one ₩150,000 review prize."
      : "Explore your patterns from your birth date with GYEOL.";

  async function share() {
    try {
      const absoluteUrl = new URL(url, window.location.href).toString();
      if (navigator.share) {
        await navigator.share({ title, text: message, url: absoluteUrl });
        setStatus("shared");
      } else {
        await navigator.clipboard.writeText(absoluteUrl);
        setStatus("copied");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("failed");
    }
  }

  return (
    <div className={compact ? "service-share is-compact" : "service-share"}>
      <button className={compact ? "campaign-share-link" : "secondary-button"} onClick={() => void share()} type="button">
        {locale === "ko" ? (eventShare ? "이벤트 공유하기" : "서비스 공유하기") : (eventShare ? "Share event" : "Share GYEOL")}
      </button>
      <span aria-live="polite">{status === "shared" ? (locale === "ko" ? "공유창을 열었습니다." : "Share menu opened.") : status === "copied" ? (locale === "ko" ? "링크를 복사했습니다." : "Link copied.") : status === "failed" ? (locale === "ko" ? "공유하지 못했습니다." : "Could not share.") : ""}</span>
    </div>
  );
}
