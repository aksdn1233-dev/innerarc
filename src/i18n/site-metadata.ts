import type { Locale } from "@/i18n/config";
import { brandNameKo, brandProductDescriptor } from "@/core/brand";

export interface LocalizedSiteMetadata {
  title: string;
  description: string;
  openGraphLocale: "ko_KR" | "en_US";
  alternateOpenGraphLocale: "ko_KR" | "en_US";
}

/*
 * What a stranger sees before they ever reach the page: the search result, the link
 * preview, the tab.
 *
 * The previous line was "생년월일 기반 상징 분석을 가설로 제시하고, Reality Check와 실제 삶의
 * 기록으로…". Every word of that is accurate and none of it means anything to someone who
 * typed 연애운 into a search box. It named the machinery instead of the question the
 * reader arrived with.
 *
 * So this says the areas in the words people use for them, says what is different about
 * the answer — the calculation is shown and the reading stays in writing — and says the
 * price of finding out, which is nothing. What it does not do is claim to know something
 * other readers cannot: that would be an unprovable comparison, and it would contradict
 * the notice this product carries on every screen.
 */
const SITE_METADATA: Readonly<Record<Locale, LocalizedSiteMetadata>> = {
  ko: {
    title: `${brandNameKo} | 연애·돈·일·공부, 반복되는 흐름 찾기`,
    description:
      "연애·돈·일·공부에서 왜 늘 같은 자리에서 막히는지 생년월일만으로 찾아드립니다. "
      + "그렇게 나온 계산 근거를 전부 공개하고, 결과는 글로 남아 언제든 다시 읽을 수 있습니다. "
      + "회원가입 없이 무료로 먼저 보세요.",
    openGraphLocale: "ko_KR",
    alternateOpenGraphLocale: "en_US",
  },
  en: {
    title: `${brandNameKo} | ${brandProductDescriptor}`,
    description:
      "Find why you keep getting stuck in the same place in love, money, work and study, "
      + "from your birth date alone. Every calculation is shown, the reading stays in writing, "
      + "and the first one is free with no account.",
    openGraphLocale: "en_US",
    alternateOpenGraphLocale: "ko_KR",
  },
};

export function getLocalizedSiteMetadata(locale: Locale): LocalizedSiteMetadata {
  return SITE_METADATA[locale];
}
