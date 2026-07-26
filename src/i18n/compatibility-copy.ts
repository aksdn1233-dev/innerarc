import type { RelationshipType } from "@/core/compatibility";
import type { Locale } from "./config";

export interface CompatibilityCopy {
  brandTagline: string;
  eyebrow: string;
  headline: string;
  intro: string;
  personA: string;
  personB: string;
  birthDate: string;
  name: string;
  namePlaceholder: string;
  relationshipType: string;
  types: Record<RelationshipType, string>;
  thirdPartyConsent: string;
  privacyHelp: string;
  submit: string;
  invalid: string;
  summary: string;
  facts: string;
  practicalConditions: string;
  realityCheck: string;
  evidence: string;
  reset: string;
  ruleVersion: string;
  nav: readonly [string, string, string, string, string];
}

const ko: CompatibilityCopy = {
  brandTagline: "관계 패턴 인텔리전스",
  eyebrow: "두 사람 관계 성찰",
  headline: "궁합을 판정하지 않고,\n관계를 운영할 조건을 찾기",
  intro: "두 수비학 구조의 공통점과 차이를 대화·책임·권한·회복 조건으로 번역합니다. 성공률이나 운명적 결론은 제공하지 않습니다.",
  personA: "첫 번째 사람",
  personB: "두 번째 사람",
  birthDate: "생년월일",
  name: "이름 또는 로마자 표기 (선택)",
  namePlaceholder: "예: Minji Kim",
  relationshipType: "관계 유형",
  types: { romance: "연애", marriage: "결혼·장기 동반", friendship: "친구", coworker: "동료", cofounder: "공동창업자", manager_report: "상사·부하", parent_child: "부모·자녀" },
  thirdPartyConsent: "타인의 생년월일을 사적으로만 사용하고 동의 없이 공유하지 않겠습니다. (필수)",
  privacyHelp: "이 게스트 비교는 현재 브라우저 메모리에서만 계산되며 입력을 저장하지 않습니다.",
  submit: "관계 패턴 비교",
  invalid: "두 사람의 실제 생년월일과 개인정보 사용 확인을 입력해 주세요.",
  summary: "관계 운영 요약",
  facts: "계산 구조",
  practicalConditions: "현실 조건",
  realityCheck: "현실 확인 질문",
  evidence: "근거",
  reset: "다른 관계 비교",
  ruleVersion: "비교 규칙",
  nav: ["홈", "나", "관계", "질문", "성장"],
};

const en: CompatibilityCopy = {
  brandTagline: "Relationship pattern intelligence",
  eyebrow: "Two-person relationship reflection",
  headline: "Do not grade compatibility.\nFind conditions that help a relationship work.",
  intro: "Translate shared and contrasting numerology structures into communication, responsibility, authority, and repair conditions. No success odds or destined verdicts.",
  personA: "First person",
  personB: "Second person",
  birthDate: "Date of birth",
  name: "Name or romanization (optional)",
  namePlaceholder: "e.g. Minji Kim",
  relationshipType: "Relationship type",
  types: { romance: "Romance", marriage: "Marriage & long-term partnership", friendship: "Friendship", coworker: "Coworkers", cofounder: "Cofounders", manager_report: "Manager & report", parent_child: "Parent & child" },
  thirdPartyConsent: "I will use the other person's birth date privately and will not share it without consent. (Required)",
  privacyHelp: "This guest comparison calculates only in current browser memory and saves no input.",
  submit: "Compare relationship patterns",
  invalid: "Enter two real birth dates and confirm the private-use notice.",
  summary: "Relationship operating summary",
  facts: "Calculated structures",
  practicalConditions: "Practical conditions",
  realityCheck: "Reality-check question",
  evidence: "Evidence",
  reset: "Compare another relationship",
  ruleVersion: "Comparison rule",
  nav: ["Home", "Me", "Relations", "Questions", "Growth"],
};

export const compatibilityCopy: Record<Locale, CompatibilityCopy> = { ko, en };
