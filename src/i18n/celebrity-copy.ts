import type { BirthDateConfidence, CelebrityField, EvidenceStatus, Transferability } from "@/core/celebrity";
import type { Locale } from "./config";

export interface CelebrityCopy {
  brandTagline: string;
  eyebrow: string;
  headline: string;
  intro: string;
  birthDate: string;
  field: string;
  professionSearch: string;
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
  careerEvidence: string;
  publicPattern: string;
  hiddenConditions: string;
  unknowns: string;
  transferability: string;
  evidenceStatus: Record<EvidenceStatus, string>;
  transferabilityLabel: Record<Transferability, string>;
  comparisonQuestion: string;
  realityCheck: string;
  handoffUnavailable: string;
  noMatches: string;
  boundaryTitle: string;
  boundaryBody: string;
  practicalTitle: string;
  practicalBody: string;
  reset: string;
  ruleVersion: string;
  nav: readonly [string, string, string, string, string];
}

const ko: CelebrityCopy = {
  brandTagline: "공개 구조 비교",
  eyebrow: "성공 패턴 비교",
  headline: "성공한 사람들은\n원래부터 나와 달랐을까?",
  intro: "공개된 생년월일의 상징적 숫자 구조와 출처가 있는 실제 경력 사건을 나란히 봅니다. 숫자가 성공을 만들었다고 말하지 않고, 환경·교육·기회·노력과 알 수 없는 부분을 분리합니다.",
  birthDate: "내 생년월일 (양력)",
  field: "분야 필터",
  professionSearch: "인물·직업 검색 (선택)",
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
  careerEvidence: "출처가 있는 실제 경력 사건",
  publicPattern: "공개 기록에서 확인한 과정",
  hiddenConditions: "숨은 조건과 환경",
  unknowns: "공개 자료로 알 수 없는 것",
  transferability: "내 상황으로 옮겨 쓰기",
  evidenceStatus: { supported: "근거 충분", partial: "일부 근거", insufficient: "근거 부족" },
  transferabilityLabel: { direct_experiment: "작게 직접 시험 가능", conditional_experiment: "조건을 맞춰 시험", context_specific: "맥락이 달라 그대로 적용 어려움" },
  comparisonQuestion: "내 현실과 비교할 질문",
  realityCheck: "이 행동을 Reality Check로 기록",
  handoffUnavailable: "현재 탭에서 Reality Check 초안을 만들지 못했습니다.",
  noMatches: "이 검색과 분야에 해당하는 공개 인물이 없습니다. 검색어를 지우거나 다른 분야를 선택하세요.",
  boundaryTitle: "생년월일로는 설명할 수 없는 것",
  boundaryBody: "가정환경, 교육, 자본, 건강, 멘토, 팀, 사회적 시기, 시장, 네트워크, 특권과 불이익, 반복한 노력은 이 계산에 들어 있지 않습니다. 공개 자료만으로 알 수 없는 과정도 남아 있습니다.",
  practicalTitle: "내가 가져갈 질문",
  practicalBody: "겹치는 숫자를 성공 공식으로 믿기보다, 이 인물이 실제로 오래 반복한 행동 중 내 상황에서 작게 시험할 수 있는 한 가지를 찾아보세요.",
  reset: "다른 입력 보기",
  ruleVersion: "비교 규칙",
  nav: ["홈", "나", "관계", "질문", "성장"],
};

const en: CelebrityCopy = {
  brandTagline: "Public structure comparison",
  eyebrow: "Success pattern comparison",
  headline: "Were successful people\nalways different from me?",
  intro: "Place symbolic number structures from public birth dates beside sourced career events. The numbers are never presented as a cause of success; environment, education, opportunity, effort, and unknowns remain separate.",
  birthDate: "My date of birth (Gregorian calendar)",
  field: "Field filter",
  professionSearch: "Search person or profession (optional)",
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
  careerEvidence: "Sourced real-world career event",
  publicPattern: "Process supported by public records",
  hiddenConditions: "Conditions and context",
  unknowns: "What public records cannot show",
  transferability: "Transfer to my context",
  evidenceStatus: { supported: "Supported", partial: "Partial evidence", insufficient: "Insufficient evidence" },
  transferabilityLabel: { direct_experiment: "Can be tested at small scale", conditional_experiment: "Test only with matching conditions", context_specific: "Too context-specific to copy directly" },
  comparisonQuestion: "Question for my reality",
  realityCheck: "Save this action to Reality Check",
  handoffUnavailable: "A Reality Check draft could not be created in this tab.",
  noMatches: "No public figure matches this search and field. Clear the search or choose another field.",
  boundaryTitle: "What a birth date cannot explain",
  boundaryBody: "Family environment, education, capital, health, mentors, teams, social timing, markets, networks, privilege, disadvantage, and repeated effort are outside this calculation. Public records also leave parts of the process unknown.",
  practicalTitle: "A question to take with you",
  practicalBody: "Treat overlap as a reflection prompt, not a success formula. Look for one behavior this person repeated that you can test at a small scale in your own context.",
  reset: "Try another input",
  ruleVersion: "Comparison rule",
  nav: ["Home", "Me", "Relations", "Questions", "Growth"],
};

export const celebrityCopy: Record<Locale, CelebrityCopy> = { ko, en };
