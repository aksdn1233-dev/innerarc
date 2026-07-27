import type { Locale } from "@/i18n/config";

export interface LocalizedSiteMetadata {
  title: string;
  description: string;
  openGraphLocale: "ko_KR" | "en_US";
  alternateOpenGraphLocale: "ko_KR" | "en_US";
}

const SITE_METADATA: Readonly<Record<Locale, LocalizedSiteMetadata>> = {
  ko: {
    title: "InnerArc | 숫자와 카드에서 현실의 패턴으로",
    description:
      "수비학과 타로의 상징을 자기성찰 질문으로 바꾸고, 선택과 실제 결과를 기록해 개인 관련성을 확인하는 자기이해 플랫폼.",
    openGraphLocale: "ko_KR",
    alternateOpenGraphLocale: "en_US",
  },
  en: {
    title: "InnerArc | From Symbols to Lived Patterns",
    description:
      "A self-discovery platform that turns numerology and tarot symbolism into reflection questions, then reviews choices against lived outcomes.",
    openGraphLocale: "en_US",
    alternateOpenGraphLocale: "ko_KR",
  },
};

export function getLocalizedSiteMetadata(locale: Locale): LocalizedSiteMetadata {
  return SITE_METADATA[locale];
}

