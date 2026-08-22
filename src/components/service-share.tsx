"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";

export function ServiceShare({ locale, url, compact = false }: { locale: Locale; url: string; compact?: boolean }) {
  const [status, setStatus] = useState<"idle" | "shared" | "copied" | "failed">("idle");
  const title = locale === "ko" ? "결 GYEOL 리딩" : "GYEOL readings";
  const message = locale === "ko"
    ? "생년월일로 나의 패턴을 살펴보는 결 GYEOL 리딩을 같이 봐요."
    : "Explore your patterns from your birth date with GYEOL.";

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: message, url });
        setStatus("shared");
      } else {
        await navigator.clipboard.writeText(url);
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
        {locale === "ko" ? "서비스 공유하기" : "Share GYEOL"}
      </button>
      <span aria-live="polite">{status === "shared" ? (locale === "ko" ? "공유창을 열었습니다." : "Share menu opened.") : status === "copied" ? (locale === "ko" ? "링크를 복사했습니다." : "Link copied.") : status === "failed" ? (locale === "ko" ? "공유하지 못했습니다." : "Could not share.") : ""}</span>
    </div>
  );
}
