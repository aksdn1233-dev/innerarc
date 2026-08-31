import type { Locale } from "@/i18n/config";
import { brandNameKo, brandProductDescriptor } from "@/core/brand";

export interface LocalizedSiteMetadata {
  title: string;
  description: string;
  openGraphLocale: "ko_KR" | "en_US";
  alternateOpenGraphLocale: "ko_KR" | "en_US";
}

const SITE_METADATA: Readonly<Record<Locale, LocalizedSiteMetadata>> = {
  ko: {
    title: `${brandNameKo} | 실제 삶으로 검증하는 개인 패턴 분석`,
    description:
      "생년월일 기반 상징 분석을 가설로 제시하고, Reality Check와 실제 삶의 기록으로 시간이 갈수록 나를 더 정확하게 이해하는 개인 패턴 분석 시스템입니다.",
    openGraphLocale: "ko_KR",
    alternateOpenGraphLocale: "en_US",
  },
  en: {
    title: `${brandNameKo} | ${brandProductDescriptor}`,
    description:
      "A personal pattern intelligence system that keeps deterministic symbolic analysis separate from lived-experience feedback, evidence, and uncertainty.",
    openGraphLocale: "en_US",
    alternateOpenGraphLocale: "ko_KR",
  },
};

export function getLocalizedSiteMetadata(locale: Locale): LocalizedSiteMetadata {
  return SITE_METADATA[locale];
}
