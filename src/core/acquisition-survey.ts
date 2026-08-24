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

export const AcquisitionSurveySchema = z.object({
  source: z.enum(ACQUISITION_SOURCES),
  detail: z.string().trim().max(80).default(""),
}).strict().superRefine((value, context) => {
  if (value.source === "other" && value.detail.length < 2) {
    context.addIssue({ code: "custom", path: ["detail"], message: "Please add a short detail." });
  }
});

export type AcquisitionSurveyInput = z.infer<typeof AcquisitionSurveySchema>;

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
