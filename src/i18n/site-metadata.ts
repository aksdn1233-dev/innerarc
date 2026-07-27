import type { Locale } from "@/i18n/config";

export interface LocalizedSiteMetadata {
  title: string;
  description: string;
  openGraphLocale: "ko_KR" | "en_US";
  alternateOpenGraphLocale: "ko_KR" | "en_US";
}

const SITE_METADATA: Readonly<Record<Locale, LocalizedSiteMetadata>> = {
  ko: {
    title: "InnerArc | 당신의 삶에 반복되는 결",
    description:
      "생년월일과 현재의 고민을 바탕으로 성향·관계·직업·재물에서 반복되는 패턴을 구체적으로 분석하는 자기이해 서비스.",
    openGraphLocale: "ko_KR",
    alternateOpenGraphLocale: "en_US",
  },
  en: {
    title: "InnerArc | The Patterns That Repeat in Your Life",
    description:
      "A premium self-understanding service for exploring recurring patterns across self, relationships, work, and money.",
    openGraphLocale: "en_US",
    alternateOpenGraphLocale: "ko_KR",
  },
};

export function getLocalizedSiteMetadata(locale: Locale): LocalizedSiteMetadata {
  return SITE_METADATA[locale];
}
