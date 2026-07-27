import type { Locale } from "@/i18n/config";

export interface LocalizedSiteMetadata {
  title: string;
  description: string;
  openGraphLocale: "ko_KR" | "en_US";
  alternateOpenGraphLocale: "ko_KR" | "en_US";
}

const SITE_METADATA: Readonly<Record<Locale, LocalizedSiteMetadata>> = {
  ko: {
    title: "InnerArc | 프리미엄 타로·신점 리딩",
    description:
      "타로의 상징과 현재의 고민을 연결해 연애·관계·진로·재물의 흐름을 깊고 구체적으로 읽는 프리미엄 타로신점 서비스.",
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
