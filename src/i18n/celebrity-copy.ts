import type { BirthDateConfidence, CelebrityField } from "@/core/celebrity";
import type { Locale } from "./config";

export interface CelebrityCopy {
  brandTagline: string;
  eyebrow: string;
  headline: string;
  intro: string;
  birthDate: string;
  field: string;
  allFields: string;
  fields: Record<CelebrityField, string>;
  submit: string;
  invalid: string;
  privacyNote: string;
  result: string;
  shared: string;
  different: string;
  source: string;
  accessed: string;
  confidence: Record<BirthDateConfidence, string>;
  evidence: string;
  reset: string;
  ruleVersion: string;
  nav: readonly [string, string, string, string, string];
}

const ko: CelebrityCopy = {
  brandTagline: "공개 구조 비교",
  eyebrow: "유명인 수비학 구조",
  headline: "성격이 같다는 말 대신,\n숫자 구조의 겹침만 보기",
  intro: "공식·권위 출처에 공개된 생년월일로 라이프 패스, 생일 수, 태도 수를 계산해 비교합니다. 인물의 성격이나 삶을 추측하지 않습니다.",
  birthDate: "내 생년월일 (양력)",
  field: "분야 필터",
  allFields: "전체 분야",
  fields: { public_leadership: "공공·리더십", science: "과학·연구", sports: "스포츠", arts_entertainment: "예술·엔터테인먼트", education_advocacy: "교육·사회활동" },
  submit: "공개 구조 비교",
  invalid: "실제 생년월일을 선택해 주세요.",
  privacyNote: "내 생년월일은 현재 브라우저 메모리에서만 계산되며 출처 사이트로 전송되지 않습니다.",
  result: "공개 생년월일 구조 비교 결과",
  shared: "겹치는 구조",
  different: "다른 구조",
  source: "생년월일 출처",
  accessed: "확인일",
  confidence: { confirmed: "공식 출처 확인", reported: "공개 보도", uncertain: "날짜 불확실" },
  evidence: "계산 근거",
  reset: "다른 입력 보기",
  ruleVersion: "비교 규칙",
  nav: ["홈", "나", "관계", "질문", "성장"],
};

const en: CelebrityCopy = {
  brandTagline: "Public structure comparison",
  eyebrow: "Public-figure numerology structures",
  headline: "Do not claim the same personality.\nCompare number-structure overlap only.",
  intro: "Calculate Life Path, Birthday, and Attitude from birth dates published by official or authoritative sources. No personality or life-story inference is added.",
  birthDate: "My date of birth (Gregorian calendar)",
  field: "Field filter",
  allFields: "All fields",
  fields: { public_leadership: "Public leadership", science: "Science & research", sports: "Sports", arts_entertainment: "Arts & entertainment", education_advocacy: "Education & advocacy" },
  submit: "Compare public structures",
  invalid: "Choose a real date of birth.",
  privacyNote: "Your birth date is calculated only in current browser memory and is never sent to the source sites.",
  result: "Public birth-date structure results",
  shared: "Shared structures",
  different: "Different structures",
  source: "Birth-date source",
  accessed: "Accessed",
  confidence: { confirmed: "Confirmed by official source", reported: "Publicly reported", uncertain: "Date uncertain" },
  evidence: "Calculation evidence",
  reset: "Try another input",
  ruleVersion: "Comparison rule",
  nav: ["Home", "Me", "Relations", "Questions", "Growth"],
};

export const celebrityCopy: Record<Locale, CelebrityCopy> = { ko, en };
