import type { OnboardingFocusId } from "@/core/onboarding";

export const NUMEROLOGY_GUIDE_VERSION = "gyeol-numerology-guides-2.0.0";
export const numerologyGuideIds = ["harang"] as const;
export type NumerologyGuideId = (typeof numerologyGuideIds)[number];
type LocalizedText = Readonly<{ ko: string; en: string }>;
export type NumerologyGuide = Readonly<{
  id: NumerologyGuideId;
  name: LocalizedText;
  romanizedName: string;
  role: LocalizedText;
  specialties: Readonly<{ ko: readonly string[]; en: readonly string[] }>;
  theme: Readonly<{ label: LocalizedText; color: string; symbol: string }>;
  image: string;
  imageAlt: LocalizedText;
  primaryFocus: OnboardingFocusId;
  focusIds: readonly OnboardingFocusId[];
}>;

const HARANG: NumerologyGuide = {
  id: "harang",
  name: { ko: "하랑 법사", en: "Harang" },
  romanizedName: "HARANG",
  role: { ko: "사주와 나의 패턴 안내", en: "Saju and personal pattern guide" },
  specialties: { ko: ["사주 원국", "생년월일 패턴", "관계와 생활의 선택"], en: ["Four Pillars", "Birth-date patterns", "Relationships and daily choices"] },
  theme: { label: { ko: "내 이야기, 하나씩 풀어봐요", en: "Your story, one step at a time" }, color: "#a77d39", symbol: "결" },
  image: "/assets/gyeol-webtoon/characters/harang/harang_result-card_confident_01-hd-v2-3x.webp",
  imageAlt: { ko: "흰 도포와 붉은 띠를 두르고 풀이를 안내하는 하랑 법사", en: "Harang in a white robe and red sash, guiding the reading" },
  primaryFocus: "growth",
  focusIds: ["work", "relationships", "health", "growth", "money", "leadership"],
};

export const NUMEROLOGY_GUIDES: readonly NumerologyGuide[] = [HARANG];

// Historical saved guide values remain readable; presentation now always resolves
// to the current host. No saved calculation or report content is rewritten.
export function getNumerologyGuide(id: string): NumerologyGuide {
  return NUMEROLOGY_GUIDES.find(guide => guide.id === id) ?? HARANG;
}
export function getDefaultNumerologyGuide(focusId: OnboardingFocusId): NumerologyGuide {
  return NUMEROLOGY_GUIDES.find(guide => guide.focusIds.includes(focusId)) ?? HARANG;
}
