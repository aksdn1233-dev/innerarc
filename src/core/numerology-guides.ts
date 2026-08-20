import type { OnboardingFocusId } from "@/core/onboarding";

export const NUMEROLOGY_GUIDE_VERSION = "gyeol-numerology-guides-1.0.0";

export const numerologyGuideIds = [
  "taeryeong",
  "yeonhui",
  "sahyeon",
  "hwayeon",
  "yundo",
  "hoyeon",
] as const;

export type NumerologyGuideId = (typeof numerologyGuideIds)[number];

type LocalizedText = Readonly<{ ko: string; en: string }>;

export type NumerologyGuide = Readonly<{
  id: NumerologyGuideId;
  name: LocalizedText;
  romanizedName: string;
  role: LocalizedText;
  specialties: Readonly<{ ko: readonly string[]; en: readonly string[] }>;
  theme: Readonly<{
    label: LocalizedText;
    color: string;
    symbol: string;
  }>;
  image: string;
  imageAlt: LocalizedText;
  primaryFocus: OnboardingFocusId;
  focusIds: readonly OnboardingFocusId[];
}>;

export const NUMEROLOGY_GUIDES: readonly NumerologyGuide[] = [
  {
    id: "taeryeong",
    name: { ko: "태령", en: "Taeryeong" },
    romanizedName: "TAERYEONG",
    role: { ko: "중심 해석자", en: "Lead interpreter" },
    specialties: {
      ko: ["종합 해석", "핵심 수비학", "질문의 중심 정리"],
      en: ["Integrated reading", "Core numerology", "Central question framing"],
    },
    theme: {
      label: { ko: "본질과 중심", en: "Essence and center" },
      color: "#6f5792",
      symbol: "결 문양",
    },
    // This is the repository's existing supplied reference design. It is intentionally
    // reused instead of replacing Taeryeong with one of the later generated variants.
    image: "/images/numerology-guides/gyeol-taeryeong.jpg",
    imageAlt: {
      ko: "검은 머리와 안경, 흑금·보라 전통복을 입은 중심 해석자 태령",
      en: "Taeryeong, the lead interpreter, in the preserved black, gold, and violet reference design",
    },
    primaryFocus: "growth",
    focusIds: ["growth", "leadership"],
  },
  {
    id: "yeonhui",
    name: { ko: "연희", en: "Yeonhui" },
    romanizedName: "YEONHUI",
    role: { ko: "관계와 마음의 해석자", en: "Relationship and emotion interpreter" },
    specialties: {
      ko: ["관계·궁합", "재회", "감정 흐름"],
      en: ["Relationships and compatibility", "Reconnection", "Emotional flow"],
    },
    theme: {
      label: { ko: "인연과 감정", en: "Connection and emotion" },
      color: "#8063a9",
      symbol: "인연 매듭",
    },
    image: "/images/numerology-guides/gyeol-yeonhui.jpg",
    imageAlt: { ko: "보랏빛 꽃과 붓을 든 관계 해석자 연희", en: "Yeonhui with violet flowers and a brush" },
    primaryFocus: "relationships",
    focusIds: ["relationships"],
  },
  {
    id: "sahyeon",
    name: { ko: "사현", en: "Sahyeon" },
    romanizedName: "SAHYEON",
    role: { ko: "지혜와 통찰의 해석자", en: "Logic and pattern interpreter" },
    specialties: {
      ko: ["수리적 사고", "본질·패턴", "선택 분석"],
      en: ["Numerical reasoning", "Essence and patterns", "Choice analysis"],
    },
    theme: {
      label: { ko: "논리와 구조", en: "Logic and structure" },
      color: "#b98b46",
      symbol: "수리 문양",
    },
    image: "/images/numerology-guides/gyeol-sahyeon.jpg",
    imageAlt: { ko: "은빛 단발과 책을 든 패턴 해석자 사현", en: "Sahyeon with silver hair and an open book" },
    primaryFocus: "work",
    focusIds: ["work", "leadership", "money"],
  },
  {
    id: "hwayeon",
    name: { ko: "화연", en: "Hwayeon" },
    romanizedName: "HWAYEON",
    role: { ko: "운과 변화의 해석자", en: "Timing and change interpreter" },
    specialties: {
      ko: ["운의 흐름", "변화 타이밍", "위기·기회"],
      en: ["Cycle flow", "Timing of change", "Risk and opportunity"],
    },
    theme: {
      label: { ko: "변화와 타이밍", en: "Change and timing" },
      color: "#a63f37",
      symbol: "불꽃 문양",
    },
    image: "/images/numerology-guides/gyeol-hwayeon.jpg",
    imageAlt: { ko: "붉은 부채와 흑적색 전통복의 흐름 해석자 화연", en: "Hwayeon with a red fan and black-red traditional attire" },
    primaryFocus: "money",
    focusIds: ["money", "work", "growth"],
  },
  {
    id: "yundo",
    name: { ko: "윤도", en: "Yundo" },
    romanizedName: "YUNDO",
    role: { ko: "균형과 안정의 해석자", en: "Balance and stability interpreter" },
    specialties: {
      ko: ["감정·에너지", "안정", "균형·조화"],
      en: ["Emotion and energy", "Stability", "Balance and harmony"],
    },
    theme: {
      label: { ko: "안정과 조화", en: "Stability and harmony" },
      color: "#527ea6",
      symbol: "균형 문양",
    },
    image: "/images/numerology-guides/gyeol-yundo.jpg",
    imageAlt: { ko: "은청색 단발과 청백색 전통복의 균형 해석자 윤도", en: "Yundo with short silver-blue hair and blue-white attire" },
    primaryFocus: "health",
    focusIds: ["health", "relationships"],
  },
  {
    id: "hoyeon",
    name: { ko: "호연", en: "Hoyeon" },
    romanizedName: "HOYEON",
    role: { ko: "직관과 방향의 해석자", en: "Intuition and direction interpreter" },
    specialties: {
      ko: ["직관·통찰", "수비학 패턴", "미래 흐름·선택 방향"],
      en: ["Intuition and insight", "Numerology patterns", "Future flow and choice direction"],
    },
    theme: {
      label: { ko: "통찰과 방향", en: "Insight and direction" },
      color: "#b47724",
      symbol: "태양 문양",
    },
    image: "/images/numerology-guides/gyeol-hoyeon.jpg",
    imageAlt: { ko: "갈색 단발과 황금빛 전통복의 직관 해석자 호연", en: "Hoyeon with short brown hair and gold-toned attire" },
    primaryFocus: "growth",
    focusIds: ["growth", "leadership", "relationships"],
  },
] as const;

const GUIDE_BY_ID = new Map(NUMEROLOGY_GUIDES.map((guide) => [guide.id, guide]));

const DEFAULT_GUIDE_BY_FOCUS: Record<OnboardingFocusId, NumerologyGuideId> = {
  work: "sahyeon",
  relationships: "yeonhui",
  health: "yundo",
  growth: "hoyeon",
  money: "hwayeon",
  leadership: "taeryeong",
};

export function getNumerologyGuide(id: NumerologyGuideId): NumerologyGuide {
  const guide = GUIDE_BY_ID.get(id);
  if (!guide) throw new Error(`Unknown numerology guide: ${id}`);
  return guide;
}

export function getDefaultNumerologyGuide(focusId: OnboardingFocusId): NumerologyGuide {
  return getNumerologyGuide(DEFAULT_GUIDE_BY_FOCUS[focusId]);
}

