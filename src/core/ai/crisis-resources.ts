import type { Locale } from "@/i18n/config";

export const CRISIS_RESOURCE_REGISTRY_VERSION = "2026-07-23.1";
export const CRISIS_RESOURCE_LAST_VERIFIED = "2026-07-23";

export type CrisisResource = Readonly<{
  regionCode: "KR" | "US";
  service: Readonly<Record<Locale, string>>;
  availability: Readonly<Record<Locale, string>>;
  contactLabel: Readonly<Record<Locale, string>>;
  contactHref: `tel:${string}`;
  officialUrl: `https://${string}`;
  publisher: Readonly<Record<Locale, string>>;
  verifiedAt: string;
}>;

export const CRISIS_RESOURCES: readonly CrisisResource[] = [
  {
    regionCode: "KR",
    service: { ko: "대한민국 자살예방상담전화", en: "Korea Suicide Prevention Hotline" },
    availability: { ko: "24시간 상담", en: "24-hour support" },
    contactLabel: { ko: "109 전화", en: "Call 109" },
    contactHref: "tel:109",
    officialUrl: "https://www.mohw.go.kr/menu.es?mid=a10716040000",
    publisher: { ko: "보건복지부", en: "Korea Ministry of Health and Welfare" },
    verifiedAt: CRISIS_RESOURCE_LAST_VERIFIED,
  },
  {
    regionCode: "US",
    service: { ko: "미국·미국령 988 자살·위기 라이프라인", en: "U.S. and territories 988 Suicide & Crisis Lifeline" },
    availability: { ko: "24시간 전화·문자·채팅", en: "24/7 call, text, or chat" },
    contactLabel: { ko: "988 전화", en: "Call 988" },
    contactHref: "tel:988",
    officialUrl: "https://988lifeline.org/get-help/",
    publisher: { ko: "988 Suicide & Crisis Lifeline", en: "988 Suicide & Crisis Lifeline" },
    verifiedAt: CRISIS_RESOURCE_LAST_VERIFIED,
  },
];

export function getCrisisResourceCopy(locale: Locale) {
  return {
    title: locale === "ko" ? "현재 위치에 맞는 즉시 지원" : "Immediate support for your actual location",
    locationCaution: locale === "ko"
      ? "언어만으로 현재 국가를 추정하지 않습니다. 아래 번호는 해당 지역에 있을 때만 사용하고, 다른 지역에서는 현지 응급전화나 공식 위기지원 서비스를 이용하세요."
      : "We do not infer your country from language. Use a number below only if you are in that region; elsewhere contact local emergency services or an official local crisis line.",
    emergency: locale === "ko"
      ? "지금 당장 생명이 위험하거나 행동할 가능성이 있다면 현지 응급전화에 연락하고, 혼자 있지 말고 믿을 수 있는 사람에게 현재 상황을 알리세요."
      : "If life is in immediate danger or you may act now, contact local emergency services, do not stay alone, and tell someone you trust what is happening.",
    officialSource: locale === "ko" ? "공식 정보" : "Official information",
  } as const;
}
