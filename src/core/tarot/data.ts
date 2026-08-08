import type {
  LocalizedText,
  TarotCard,
  TarotQuestionCategory,
  TarotSpread,
  TarotSpreadId,
  TarotSuit,
} from "./types";

export const TAROT_DECK_VERSION = "rws-reflective-1.0.0";
export const TAROT_SPREAD_VERSION = "spreads-1.0.0";

type MajorSource = readonly [
  number,
  string,
  string,
  string,
  string,
  string,
  string,
];

const MAJOR: readonly MajorSource[] = [
  [0, "The Fool", "바보", "beginnings · openness", "시작 · 열린 태도", "impulsiveness · poor footing", "충동 · 준비 부족"],
  [1, "The Magician", "마법사", "agency · resourcefulness", "주도성 · 자원 활용", "manipulation · scattered skill", "조종 · 분산된 역량"],
  [2, "The High Priestess", "여사제", "intuition · inner knowledge", "직관 · 내적 앎", "withholding · disconnection", "억눌림 · 단절"],
  [3, "The Empress", "여제", "nurture · creation", "돌봄 · 창조", "overgiving · stagnation", "과잉 돌봄 · 정체"],
  [4, "The Emperor", "황제", "structure · responsibility", "구조 · 책임", "rigidity · control", "경직 · 통제"],
  [5, "The Hierophant", "교황", "tradition · shared learning", "전통 · 공동 학습", "dogma · borrowed belief", "교조성 · 빌린 신념"],
  [6, "The Lovers", "연인", "values · conscious choice", "가치 · 의식적 선택", "misalignment · avoidance", "불일치 · 회피"],
  [7, "The Chariot", "전차", "direction · disciplined motion", "방향 · 절제된 추진", "force · competing aims", "강행 · 충돌하는 목표"],
  [8, "Strength", "힘", "courage · gentle influence", "용기 · 부드러운 영향력", "self-doubt · suppression", "자기 의심 · 억압"],
  [9, "The Hermit", "은둔자", "reflection · discernment", "성찰 · 분별", "isolation · overanalysis", "고립 · 과잉 분석"],
  [10, "Wheel of Fortune", "운명의 수레바퀴", "cycles · changing conditions", "순환 · 변하는 조건", "passivity · repeated cycle", "수동성 · 반복 순환"],
  [11, "Justice", "정의", "accountability · evidence", "책임 · 근거", "bias · avoiding consequence", "편향 · 결과 회피"],
  [12, "The Hanged Man", "매달린 사람", "pause · new perspective", "멈춤 · 새로운 관점", "delay · needless sacrifice", "지연 · 불필요한 희생"],
  [13, "Death", "죽음", "ending · transformation", "끝맺음 · 전환", "clinging · delayed change", "집착 · 미뤄진 변화"],
  [14, "Temperance", "절제", "integration · pacing", "통합 · 속도 조절", "imbalance · excess", "불균형 · 과도함"],
  [15, "The Devil", "악마", "attachment · shadow pattern", "집착 · 그림자 패턴", "denial · repeated compulsion", "부정 · 반복 충동"],
  [16, "The Tower", "탑", "disruption · revealed weakness", "급변 · 드러난 취약점", "avoidance · unstable repair", "회피 · 불안정한 수습"],
  [17, "The Star", "별", "hope · renewal", "희망 · 회복", "discouragement · idealization", "낙담 · 이상화"],
  [18, "The Moon", "달", "ambiguity · imagination", "모호함 · 상상", "confusion · projection", "혼란 · 투사"],
  [19, "The Sun", "태양", "clarity · vitality", "명료함 · 활력", "overexposure · forced optimism", "과잉 노출 · 강요된 낙관"],
  [20, "Judgement", "심판", "review · answering a call", "검토 · 응답", "harsh judgment · avoidance", "가혹한 판단 · 회피"],
  [21, "The World", "세계", "completion · integration", "완성 · 통합", "unfinished closure · diffusion", "미완의 마무리 · 분산"],
];

const majorCards: TarotCard[] = MAJOR.map(
  ([number, en, ko, uprightEn, uprightKo, reversedEn, reversedKo]) => ({
    id: `major-${String(number).padStart(2, "0")}`,
    arcana: "major",
    number,
    name: { en, ko },
    uprightKeywords: { en: uprightEn, ko: uprightKo },
    reversedKeywords: { en: reversedEn, ko: reversedKo },
  }),
);

const SUITS: Record<
  TarotSuit,
  { name: LocalizedText; theme: LocalizedText; blocked: LocalizedText }
> = {
  wands: {
    name: { en: "Wands", ko: "완드" },
    theme: { en: "initiative · energy", ko: "주도성 · 에너지" },
    blocked: { en: "scattered drive · burnout", ko: "분산된 추진 · 소진" },
  },
  cups: {
    name: { en: "Cups", ko: "컵" },
    theme: { en: "emotion · connection", ko: "감정 · 연결" },
    blocked: { en: "emotional avoidance · overflow", ko: "감정 회피 · 넘침" },
  },
  swords: {
    name: { en: "Swords", ko: "소드" },
    theme: { en: "thought · truth", ko: "사고 · 진실" },
    blocked: { en: "rumination · harsh conflict", ko: "반추 · 거친 갈등" },
  },
  pentacles: {
    name: { en: "Pentacles", ko: "펜타클" },
    theme: { en: "resources · practice", ko: "자원 · 실행" },
    blocked: { en: "scarcity focus · inertia", ko: "결핍 집착 · 관성" },
  },
};

const RANKS = [
  ["ace", "Ace", "에이스", "opening", "가능성의 시작", "unused potential", "쓰지 않은 가능성"],
  ["two", "Two", "2", "balance", "균형", "indecision", "우유부단"],
  ["three", "Three", "3", "development", "전개", "misalignment", "엇갈림"],
  ["four", "Four", "4", "stability", "안정", "stagnation", "정체"],
  ["five", "Five", "5", "friction", "마찰", "unprocessed conflict", "다루지 않은 갈등"],
  ["six", "Six", "6", "adjustment", "조정", "unequal exchange", "불균형한 교환"],
  ["seven", "Seven", "7", "assessment", "점검", "avoidance", "회피"],
  ["eight", "Eight", "8", "movement", "움직임", "blocked momentum", "막힌 추진"],
  ["nine", "Nine", "9", "culmination", "무르익음", "strain", "긴장"],
  ["ten", "Ten", "10", "completion", "완결", "overload", "과부하"],
  ["page", "Page", "페이지", "curiosity", "호기심", "inexperience", "경험 부족"],
  ["knight", "Knight", "나이트", "pursuit", "추구", "rash pursuit", "성급한 추구"],
  ["queen", "Queen", "퀸", "embodied care", "체화된 돌봄", "overidentification", "과잉 동일시"],
  ["king", "King", "킹", "responsible direction", "책임 있는 방향", "domination", "지배"],
] as const;

const minorCards: TarotCard[] = (Object.keys(SUITS) as TarotSuit[]).flatMap((suit) =>
  RANKS.map(([rank, rankEn, rankKo, upEn, upKo, revEn, revKo]) => ({
    id: `minor-${suit}-${rank}`,
    arcana: "minor" as const,
    rank,
    suit,
    name: {
      en: `${rankEn} of ${SUITS[suit].name.en}`,
      ko: `${SUITS[suit].name.ko} ${rankKo}`,
    },
    uprightKeywords: {
      en: `${SUITS[suit].theme.en} · ${upEn}`,
      ko: `${SUITS[suit].theme.ko} · ${upKo}`,
    },
    reversedKeywords: {
      en: `${SUITS[suit].blocked.en} · ${revEn}`,
      ko: `${SUITS[suit].blocked.ko} · ${revKo}`,
    },
  })),
);

export const TAROT_DECK: readonly TarotCard[] = [...majorCards, ...minorCards];
export const TAROT_CARD_BY_ID = new Map(TAROT_DECK.map((card) => [card.id, card]));

const t = (en: string, ko: string): LocalizedText => ({ en, ko });

const QUESTION_POSITIONS: Record<TarotQuestionCategory, readonly LocalizedText[]> = {
  work: [t("Current work context", "현재 일의 맥락"), t("Leverage or tension", "활용점 또는 긴장"), t("Practical next step", "현실적인 다음 단계")],
  love: [t("Your present stance", "현재 나의 태도"), t("What needs honest attention", "솔직히 볼 부분"), t("A caring next step", "배려 있는 다음 단계")],
  money: [t("Current resource pattern", "현재 자원 패턴"), t("Risk to verify", "확인할 위험"), t("Grounded action", "현실적인 행동")],
  relationship: [t("Shared dynamic", "함께 만드는 역학"), t("Friction or boundary", "마찰 또는 경계"), t("Repair condition", "회복 조건")],
  emotion: [t("Feeling asking for space", "자리를 필요로 하는 감정"), t("Underlying need", "그 아래의 필요"), t("Small act of care", "작은 돌봄 행동")],
  daily_choice: [t("What matters today", "오늘 중요한 것"), t("Trade-off to notice", "살펴볼 상충"), t("Reversible next move", "되돌릴 수 있는 다음 행동")],
  free: [t("Context", "맥락"), t("Tension", "긴장"), t("Constructive next step", "건설적인 다음 단계")],
};

const baseSpreads: TarotSpread[] = [
  {
    id: "single",
    cardCount: 1,
    version: TAROT_SPREAD_VERSION,
    positions: [t("Focus", "초점")],
  },
  {
    id: "three",
    cardCount: 3,
    version: TAROT_SPREAD_VERSION,
    positions: QUESTION_POSITIONS.free,
  },
];

const questionSpreads: TarotSpread[] = (
  Object.keys(QUESTION_POSITIONS) as TarotQuestionCategory[]
).map((category) => ({
  id: `question_${category}` as TarotSpreadId,
  cardCount: 3,
  version: TAROT_SPREAD_VERSION,
  positions: QUESTION_POSITIONS[category],
}));

export const TAROT_SPREADS: readonly TarotSpread[] = [...baseSpreads, ...questionSpreads];
export const TAROT_SPREAD_BY_ID = new Map(TAROT_SPREADS.map((spread) => [spread.id, spread]));
