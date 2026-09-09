import type { RelationshipType } from "@/core/compatibility";
import type { Locale } from "./config";

export interface CompatibilityCopy {
  brandTagline: string;
  eyebrow: string;
  headline: string;
  intro: string;
  formEyebrow: string;
  formTitle: string;
  formIntro: string;
  personA: string;
  personB: string;
  personAHelp: string;
  personBHelp: string;
  birthDate: string;
  name: string;
  namePlaceholder: string;
  relationshipType: string;
  relationshipHelp: string;
  types: Record<RelationshipType, string>;
  thirdPartyConsent: string;
  privacyHelp: string;
  privacyTitle: string;
  submit: string;
  submitNote: string;
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
  intro: "두 생년월일 패턴 구조의 공통점과 차이를 대화·책임·권한·회복 조건으로 번역합니다. 성공률이나 운명적 결론은 제공하지 않습니다.",
  formEyebrow: "관계 입력",
  formTitle: "두 사람의 결을 나란히 놓아보세요",
  formIntro: "누가 더 좋은 사람인지가 아니라, 서로 다른 방식이 어디에서 만나고 어긋나는지 살펴봅니다.",
  personA: "첫 번째 사람",
  personB: "두 번째 사람",
  personAHelp: "나를 기준으로 입력해 주세요.",
  personBHelp: "함께 살펴볼 상대를 입력해 주세요.",
  birthDate: "생년월일 (양력)",
  name: "이름 또는 로마자 표기 (선택)",
  namePlaceholder: "예: Minji Kim",
  relationshipType: "관계 유형",
  relationshipHelp: "관계에 따라 책임과 거리의 기준을 다르게 해석합니다.",
  types: { romance: "애인", marriage: "결혼·장기 동반", friendship: "친구", coworker: "직장 동료", cofounder: "동업", manager_report: "상사·부하", parent_child: "부모·자녀", family: "가족" },
  thirdPartyConsent: "타인의 생년월일을 사적으로만 사용하고 동의 없이 공유하지 않겠습니다. (필수)",
  privacyHelp: "이 게스트 비교는 현재 브라우저 메모리에서만 계산되며 입력을 저장하지 않습니다.",
  privacyTitle: "입력 정보는 이 화면에 머뭅니다",
  submit: "관계 패턴 비교",
  submitNote: "두 사람을 점수로 평가하거나 미래를 단정하지 않습니다.",
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
  formEyebrow: "Relationship intake",
  formTitle: "Place both patterns side by side",
  formIntro: "This is not about who is better. It looks at where two different ways of moving through life meet and misalign.",
  personA: "First person",
  personB: "Second person",
  personAHelp: "Enter yourself as the reference point.",
  personBHelp: "Enter the person you want to reflect with.",
  birthDate: "Date of birth (Gregorian calendar)",
  name: "Name or romanization (optional)",
  namePlaceholder: "e.g. Minji Kim",
  relationshipType: "Relationship type",
  relationshipHelp: "Responsibility and distance are interpreted in the context of this relationship.",
  types: { romance: "Partner", marriage: "Marriage & long-term partnership", friendship: "Friend", coworker: "Coworker", cofounder: "Business partner", manager_report: "Manager & report", parent_child: "Parent & child", family: "Family" },
  thirdPartyConsent: "I will use the other person's birth date privately and will not share it without consent. (Required)",
  privacyHelp: "This guest comparison calculates only in current browser memory and saves no input.",
  privacyTitle: "Your input stays on this screen",
  submit: "Compare relationship patterns",
  submitNote: "No score, ranking, or fixed prediction is produced.",
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
