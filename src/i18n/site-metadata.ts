import type { Locale } from "@/i18n/config";

export interface LocalizedSiteMetadata {
  title: string;
  description: string;
  openGraphLocale: "ko_KR" | "en_US";
  alternateOpenGraphLocale: "ko_KR" | "en_US";
}

const SITE_METADATA: Readonly<Record<Locale, LocalizedSiteMetadata>> = {
  ko: {
    title: "결 GYEOL | 나·관계·올해의 흐름 리딩",
    description:
      "생년월일을 바탕으로 나의 성향과 학업·직업·연애, 가까운 사람과의 관계, 올해의 흐름을 알기 쉽게 정리하는 개인 리딩 서비스.",
    openGraphLocale: "ko_KR",
    alternateOpenGraphLocale: "en_US",
  },
  en: {
    title: "GYEOL | Self, Relationships & Yearly Flow",
    description:
      "A personal reading that makes your traits, study, work, love, close relationships, and the year ahead easier to understand.",
    openGraphLocale: "en_US",
    alternateOpenGraphLocale: "ko_KR",
  },
};

export function getLocalizedSiteMetadata(locale: Locale): LocalizedSiteMetadata {
  return SITE_METADATA[locale];
}
