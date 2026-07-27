import type { Locale } from "./config";
import type { OnboardingFocusId } from "@/core/onboarding";

export type Dictionary = {
  brandTagline: string;
  nav: readonly [string, string, string, string, string];
  eyebrow: string;
  headline: string;
  intro: string;
  start: string;
  birthDate: string;
  birthHelp: string;
  name: string;
  namePlaceholder: string;
  nameHelp: string;
  interest: string;
  interests: readonly { value: OnboardingFocusId; label: string }[];
  concern: string;
  concernPlaceholder: string;
  depth: string;
  depths: readonly { value: "light" | "balanced" | "deep"; label: string }[];
  privacyRequired: string;
  personalize: string;
  aiConsentHelp: string;
  calculate: string;
  invalidDate: string;
  privacyNote: string;
  resultEyebrow: string;
  oneLine: string;
  lifePath: string;
  birthday: string;
  attitude: string;
  personalYear: string;
  archetype: string;
  strengths: string;
  risks: string;
  careers: string;
  relationship: string;
  evidence: string;
  symbolicLabel: string;
  inferenceLabel: string;
  limitationLabel: string;
  integratedProfile: string;
  integratedIntro: string;
  realityCheckLabel: string;
  careerDetails: string;
  fitReason: string;
  adverseCondition: string;
  complementarySkill: string;
  preferredEnvironment: string;
  avoidCondition: string;
  ruleVersion: string;
  restart: string;
  nameUnavailable: string;
  masterReason: string;
  disclaimer: string;
  celebrityCompare: string;
  celebrityIntro: string;
  lifestyleTitle: string;
  lifestyleIntro: string;
  accessoriesTitle: string;
  accessoryForm: string;
  accessoryPalette: string;
  accessoryMaterial: string;
  accessoryRationale: string;
  accessoryTry: string;
  accessorySafety: string;
  shopPreview: string;
  shopComingLater: string;
  musicTitle: string;
  musicGenre: string;
  musicSonic: string;
  musicUse: string;
  musicCue: string;
  musicRealityCheck: string;
  contextEyebrow: string;
  selectedQuestion: string;
  questionBoundary: string;
  aiBoundaryTitle: string;
  smallAction: string;
  invalidContext: string;
};

const ko: Dictionary = {
  brandTagline: "개인 패턴 인텔리전스",
  nav: ["홈", "나", "관계", "질문", "성장"],
  eyebrow: "3분 자기이해",
  headline: "당신의 삶에는 반복되는 결이 있습니다.",
  intro: "생년월일과 현재의 고민을 바탕으로 성향·관계·직업·재물에서 반복되는 패턴을 구체적으로 분석합니다.",
  start: "내 삶의 결 확인하기",
  birthDate: "생년월일",
  birthHelp: "날짜는 계산에만 사용하며 게스트 입력은 서버로 전송하지 않습니다.",
  name: "이름 또는 로마자 표기 (선택)",
  namePlaceholder: "예: Minji Kim",
  nameHelp: "피타고라스식 이름 수는 A–Z 기준입니다. 비라틴 이름은 임의 음역하지 않습니다.",
  interest: "지금 가장 궁금한 영역",
  interests: [
    { value: "work", label: "일·진로" },
    { value: "relationships", label: "관계" },
    { value: "growth", label: "성장" },
    { value: "money", label: "돈" },
    { value: "leadership", label: "리더십" },
  ],
  concern: "요즘 가장 큰 고민 (선택)",
  concernPlaceholder: "한두 문장으로 적어보세요.",
  depth: "분석 깊이",
  depths: [
    { value: "light", label: "가볍게" },
    { value: "balanced", label: "균형 있게" },
    { value: "deep", label: "깊이 있게" },
  ],
  privacyRequired: "개인정보 처리 안내를 확인했습니다. (필수)",
  personalize: "이 입력을 AI 개인화에 사용하는 데 동의합니다. (선택)",
  aiConsentHelp: "현재 승인된 외부 AI는 연결되어 있지 않으며, 선택 여부와 관계없이 기본 결과는 로컬에서 동일하게 제공됩니다.",
  calculate: "내 핵심 패턴 보기",
  invalidDate: "실제 생년월일을 선택해 주세요.",
  privacyNote: "현재 체험은 브라우저 메모리에서만 계산됩니다. 새로고침하면 입력이 사라집니다.",
  resultEyebrow: "첫 번째 자기이해 지도",
  oneLine: "한 문장 요약",
  lifePath: "라이프 패스",
  birthday: "생일 수",
  attitude: "태도 수",
  personalYear: "개인 연도",
  archetype: "대표 아키타입",
  strengths: "탐색할 강점",
  risks: "살펴볼 위험 패턴",
  careers: "추천 직무군",
  relationship: "관계 방식",
  evidence: "계산 근거 보기",
  symbolicLabel: "전통적 상징",
  inferenceLabel: "맥락 확장",
  limitationLabel: "한계",
  integratedProfile: "8가지 심층 프로필 펼쳐보기",
  integratedIntro: "각 영역은 계산 사실, 전통 상징, 맥락 추론, 현실 확인 질문을 분리해 보여줍니다.",
  realityCheckLabel: "현실 확인",
  careerDetails: "직무군 탐색",
  fitReason: "잘 맞을 수 있는 이유",
  adverseCondition: "맞지 않을 수 있는 조건",
  complementarySkill: "보완 능력",
  preferredEnvironment: "적합한 환경",
  avoidCondition: "피해야 할 환경",
  ruleVersion: "해석 규칙",
  restart: "다른 입력으로 보기",
  nameUnavailable: "이름 수는 로마자 표기가 있을 때만 계산합니다.",
  masterReason: "11·22·33은 이 규칙 버전에서 마스터 넘버로 보존합니다.",
  disclaimer: "이 결과는 과학적 진단이나 미래 예측이 아닌 자기성찰용 상징 해석입니다. 중요한 결정은 현실 정보와 전문가 조언을 우선하세요.",
  celebrityCompare: "나와 구조가 비슷한 유명인 보기",
  celebrityIntro: "공개 생년월일에서 계산한 세 숫자 구조만 비교합니다.",
  lifestyleTitle: "나에게 맞을 수 있는 스타일과 사운드",
  lifestyleIntro: "계산 결과를 취향의 정답이 아니라 직접 시험해 볼 액세서리·음악 방향으로 바꿉니다.",
  accessoriesTitle: "액세서리 방향",
  accessoryForm: "형태",
  accessoryPalette: "색 방향",
  accessoryMaterial: "재료 방향",
  accessoryRationale: "상징 근거",
  accessoryTry: "직접 확인",
  accessorySafety: "안전·관리",
  shopPreview: "상점 카테고리 미리보기",
  shopComingLater: "구매 기능은 차후 오픈",
  musicTitle: "음악 방향",
  musicGenre: "장르 방향",
  musicSonic: "소리 특징",
  musicUse: "들어볼 때",
  musicCue: "곡 선택 기준",
  musicRealityCheck: "듣고 확인할 것",
  contextEyebrow: "내가 선택한 현재 초점",
  selectedQuestion: "내가 적은 질문",
  questionBoundary: "현재 화면 메모리에만 있으며 계산·공유·저장·AI 전송에 사용되지 않습니다.",
  aiBoundaryTitle: "AI 개인화 상태",
  smallAction: "작은 실행",
  invalidContext: "관심 분야, 고민 또는 분석 깊이를 다시 확인해 주세요.",
};

const en: Dictionary = {
  brandTagline: "Personal pattern intelligence",
  nav: ["Home", "Me", "Relations", "Questions", "Growth"],
  eyebrow: "A 3-minute reflection",
  headline: "Your life has patterns that repeat.",
  intro: "Using your date of birth and current concerns, explore recurring patterns across self, relationships, work, and money.",
  start: "Discover my life pattern",
  birthDate: "Date of birth",
  birthHelp: "Your date is used only for calculation; guest input is not sent to a server.",
  name: "Name or romanization (optional)",
  namePlaceholder: "e.g. Minji Kim",
  nameHelp: "Pythagorean name numbers use A–Z. We never invent a romanization for non-Latin names.",
  interest: "What are you exploring now?",
  interests: [
    { value: "work", label: "Work & career" },
    { value: "relationships", label: "Relationships" },
    { value: "growth", label: "Growth" },
    { value: "money", label: "Money" },
    { value: "leadership", label: "Leadership" },
  ],
  concern: "Your biggest question right now (optional)",
  concernPlaceholder: "Write one or two sentences.",
  depth: "Reflection depth",
  depths: [
    { value: "light", label: "Light" },
    { value: "balanced", label: "Balanced" },
    { value: "deep", label: "Deep" },
  ],
  privacyRequired: "I have read the privacy notice. (Required)",
  personalize: "I agree to use this input for AI personalization. (Optional)",
  aiConsentHelp: "No approved external AI is connected. The same local core result remains available whether this is selected or not.",
  calculate: "Show my core pattern",
  invalidDate: "Choose a real date of birth.",
  privacyNote: "This preview calculates in browser memory only. Refreshing clears your input.",
  resultEyebrow: "Your first reflection map",
  oneLine: "In one line",
  lifePath: "Life Path",
  birthday: "Birthday",
  attitude: "Attitude",
  personalYear: "Personal Year",
  archetype: "Core archetype",
  strengths: "Strengths to explore",
  risks: "Risk patterns to notice",
  careers: "Suggested role families",
  relationship: "Relationship style",
  evidence: "See calculation evidence",
  symbolicLabel: "Traditional symbolism",
  inferenceLabel: "Contextual extension",
  limitationLabel: "Limit",
  integratedProfile: "Open the eight-domain deep profile",
  integratedIntro: "Each domain keeps calculated facts, traditional symbolism, contextual inference, and a reality check visibly separate.",
  realityCheckLabel: "Reality check",
  careerDetails: "Role-family exploration",
  fitReason: "Why it may fit",
  adverseCondition: "When it may not fit",
  complementarySkill: "Complementary skill",
  preferredEnvironment: "Preferred environment",
  avoidCondition: "Environment to avoid",
  ruleVersion: "Interpretation rule",
  restart: "Try different details",
  nameUnavailable: "Name numbers are calculated only when a romanized name is provided.",
  masterReason: "11, 22, and 33 are preserved as master numbers in this rule version.",
  disclaimer: "This is symbolic material for self-reflection, not scientific diagnosis or future prediction. Prioritize real-world evidence and qualified advice for important decisions.",
  celebrityCompare: "Find public figures with similar structures",
  celebrityIntro: "Compare only three number structures calculated from sourced public birth dates.",
  lifestyleTitle: "Style and sound directions that may fit",
  lifestyleIntro: "Turn calculated patterns into accessory and music directions to test—not answers about your taste.",
  accessoriesTitle: "Accessory directions",
  accessoryForm: "Form",
  accessoryPalette: "Palette",
  accessoryMaterial: "Material direction",
  accessoryRationale: "Symbolic rationale",
  accessoryTry: "Try and observe",
  accessorySafety: "Safety and care",
  shopPreview: "Preview shop categories",
  shopComingLater: "Purchasing opens later",
  musicTitle: "Music directions",
  musicGenre: "Genre direction",
  musicSonic: "Sonic traits",
  musicUse: "When to try it",
  musicCue: "Track-selection cue",
  musicRealityCheck: "Listening reality check",
  contextEyebrow: "Your selected focus",
  selectedQuestion: "Your own question",
  questionBoundary: "Kept only in this page’s memory; it is not used in calculations, sharing, storage, or an AI request.",
  aiBoundaryTitle: "AI personalization status",
  smallAction: "Small action",
  invalidContext: "Check the selected focus, question, and reflection depth.",
};

export const dictionaries: Record<Locale, Dictionary> = { ko, en };
