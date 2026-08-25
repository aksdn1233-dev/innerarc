import { z } from "zod";

export const ACQUISITION_SOURCES = [
  "naver_search",
  "google_search",
  "instagram",
  "youtube",
  "other_sns",
  "online_ad",
  "friend",
  "community",
  "other",
] as const;

export type AcquisitionSource = (typeof ACQUISITION_SOURCES)[number];

export function isAcquisitionSource(value: unknown): value is AcquisitionSource {
  return typeof value === "string" && (ACQUISITION_SOURCES as readonly string[]).includes(value);
}

export const SATISFACTION_SCORES = [1, 2, 3, 4, 5] as const;
export type SatisfactionScore = (typeof SATISFACTION_SCORES)[number];

export const RETURN_INTENTS = [
  "very_likely",
  "likely",
  "unsure",
  "unlikely",
  "very_unlikely",
] as const;
export type ReturnIntent = (typeof RETURN_INTENTS)[number];

export const FOLLOW_UP_INTERESTS = [
  "daily_flow",
  "weekly_checkin",
  "monthly_report",
  "relationship",
  "career_money",
  "new_reading",
] as const;
export type FollowUpInterest = (typeof FOLLOW_UP_INTERESTS)[number];

export const PREFERRED_CADENCES = [
  "daily",
  "weekly",
  "monthly",
  "important_only",
  "none",
] as const;
export type PreferredCadence = (typeof PREFERRED_CADENCES)[number];

export const SOURCE_DETAIL_MAX = 40;

const sourceDetail = z.string().trim().max(SOURCE_DETAIL_MAX).refine(
  (value) => !value.includes("|"),
  { message: "Please leave out the vertical bar character." },
);

export const AcquisitionSurveySchema = z.object({
  source: z.enum(ACQUISITION_SOURCES),
  detail: sourceDetail.default(""),
  satisfactionScore: z.number().int().min(1).max(5),
  returnIntent: z.enum(RETURN_INTENTS),
  desiredFollowUp: z.enum(FOLLOW_UP_INTERESTS),
  preferredCadence: z.enum(PREFERRED_CADENCES),
}).strict().superRefine((value, context) => {
  if (value.source === "other" && value.detail.length < 2) {
    context.addIssue({ code: "custom", path: ["detail"], message: "Please add a short detail." });
  }
});

export type AcquisitionSurveyInput = z.infer<typeof AcquisitionSurveySchema>;

export type AcquisitionSurveyAnswers = Readonly<{
  source: AcquisitionSource;
  detail: string;
  satisfactionScore: SatisfactionScore | null;
  returnIntent: ReturnIntent | null;
  desiredFollowUp: FollowUpInterest | null;
  preferredCadence: PreferredCadence | null;
}>;

const RETURN_INTENT_CODES: Record<ReturnIntent, string> = {
  very_likely: "a",
  likely: "b",
  unsure: "c",
  unlikely: "d",
  very_unlikely: "e",
};
const FOLLOW_UP_CODES: Record<FollowUpInterest, string> = {
  daily_flow: "d",
  weekly_checkin: "w",
  monthly_report: "m",
  relationship: "r",
  career_money: "c",
  new_reading: "n",
};
const CADENCE_CODES: Record<PreferredCadence, string> = {
  daily: "d",
  weekly: "w",
  monthly: "m",
  important_only: "i",
  none: "n",
};

function reverseCode<T extends string>(values: Record<T, string>, code: string): T | null {
  return (Object.entries(values).find(([, value]) => value === code)?.[0] as T | undefined) ?? null;
}

/**
 * The live table already has one bounded 80-character detail field. This compact,
 * versioned envelope adds fixed-choice retention answers without a destructive database
 * change or new free-form profile. The optional source detail remains human-readable.
 */
export function encodeAcquisitionSurvey(survey: AcquisitionSurveyInput): string {
  return [
    "v2",
    String(survey.satisfactionScore),
    RETURN_INTENT_CODES[survey.returnIntent],
    FOLLOW_UP_CODES[survey.desiredFollowUp],
    CADENCE_CODES[survey.preferredCadence],
    survey.detail,
  ].join("|");
}

export function decodeAcquisitionSurvey(
  source: AcquisitionSource,
  storedDetail: string,
): AcquisitionSurveyAnswers {
  const parts = storedDetail.split("|");
  if (parts.length !== 6 || parts[0] !== "v2") {
    return {
      source,
      detail: storedDetail,
      satisfactionScore: null,
      returnIntent: null,
      desiredFollowUp: null,
      preferredCadence: null,
    };
  }
  const score = Number(parts[1]);
  const returnIntent = reverseCode(RETURN_INTENT_CODES, parts[2]);
  const desiredFollowUp = reverseCode(FOLLOW_UP_CODES, parts[3]);
  const preferredCadence = reverseCode(CADENCE_CODES, parts[4]);
  if (!SATISFACTION_SCORES.includes(score as SatisfactionScore) || !returnIntent || !desiredFollowUp || !preferredCadence) {
    return {
      source,
      detail: storedDetail,
      satisfactionScore: null,
      returnIntent: null,
      desiredFollowUp: null,
      preferredCadence: null,
    };
  }
  return {
    source,
    detail: parts[5],
    satisfactionScore: score as SatisfactionScore,
    returnIntent,
    desiredFollowUp,
    preferredCadence,
  };
}

export const acquisitionSourceLabels: Record<"ko" | "en", Record<AcquisitionSource, string>> = {
  ko: {
    naver_search: "네이버 검색",
    google_search: "구글 검색",
    instagram: "인스타그램",
    youtube: "유튜브",
    other_sns: "다른 SNS",
    online_ad: "온라인 광고",
    friend: "지인 추천",
    community: "커뮤니티",
    other: "기타",
  },
  en: {
    naver_search: "Naver search",
    google_search: "Google search",
    instagram: "Instagram",
    youtube: "YouTube",
    other_sns: "Other social media",
    online_ad: "Online ad",
    friend: "Friend referral",
    community: "Community",
    other: "Other",
  },
};

export const satisfactionLabels: Record<"ko" | "en", Record<SatisfactionScore, string>> = {
  ko: { 1: "도움이 적었어요", 2: "조금 아쉬웠어요", 3: "보통이에요", 4: "도움이 됐어요", 5: "매우 도움이 됐어요" },
  en: { 1: "Not useful", 2: "A little lacking", 3: "Neutral", 4: "Useful", 5: "Very useful" },
};

export const returnIntentLabels: Record<"ko" | "en", Record<ReturnIntent, string>> = {
  ko: {
    very_likely: "꼭 다시 이용하고 싶어요",
    likely: "다시 이용할 것 같아요",
    unsure: "아직 모르겠어요",
    unlikely: "당분간은 어려워요",
    very_unlikely: "다시 이용할 생각이 없어요",
  },
  en: {
    very_likely: "Definitely",
    likely: "Probably",
    unsure: "Not sure yet",
    unlikely: "Probably not soon",
    very_unlikely: "No plans to return",
  },
};

export const followUpInterestLabels: Record<"ko" | "en", Record<FollowUpInterest, string>> = {
  ko: {
    daily_flow: "매일 짧게 보는 오늘의 흐름",
    weekly_checkin: "일주일에 한 번 보는 점검",
    monthly_report: "한 달 흐름을 정리한 리포트",
    relationship: "연애·가족·직장 관계 리딩",
    career_money: "일·커리어·재물 주제",
    new_reading: "새로운 리딩 상품과 콘텐츠",
  },
  en: {
    daily_flow: "A short daily flow",
    weekly_checkin: "A weekly check-in",
    monthly_report: "A monthly flow report",
    relationship: "Relationship readings",
    career_money: "Work, career, and money themes",
    new_reading: "New readings and content",
  },
};

export const preferredCadenceLabels: Record<"ko" | "en", Record<PreferredCadence, string>> = {
  ko: {
    daily: "매일",
    weekly: "일주일에 한 번",
    monthly: "한 달에 한 번",
    important_only: "중요한 변화가 있을 때만",
    none: "정기적인 안내는 원하지 않아요",
  },
  en: {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    important_only: "Only for important updates",
    none: "I do not want regular updates",
  },
};
