import type { Locale } from "@/i18n/config";

export interface LocalizedSiteMetadata {
  title: string;
  description: string;
  openGraphLocale: "ko_KR" | "en_US";
  alternateOpenGraphLocale: "ko_KR" | "en_US";
}

const SITE_METADATA: Readonly<Record<Locale, LocalizedSiteMetadata>> = {
  ko: {
    title: "결 GYEOL | 사주·수비학으로 보는 나·관계·운세",
    description:
      "생년월일 기반 사주와 수비학을 서로 분리해 성향·관계·운세의 흐름을 정리하는 상징적 자기 성찰 리딩 서비스.",
    openGraphLocale: "ko_KR",
    alternateOpenGraphLocale: "en_US",
  },
  en: {
    title: "GYEOL | Saju, Numerology & Daily Flow",
    description:
      "Separate Saju and Numerology experiences for symbolic reflection on personality, relationships, and daily or yearly flow.",
    openGraphLocale: "en_US",
    alternateOpenGraphLocale: "ko_KR",
  },
};

export function getLocalizedSiteMetadata(locale: Locale): LocalizedSiteMetadata {
  return SITE_METADATA[locale];
}
