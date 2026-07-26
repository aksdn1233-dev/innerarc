import { z } from "zod";

export const ONBOARDING_CONTEXT_RULE_VERSION = "onboarding-context-1.0.0";

export const onboardingFocusIds = [
  "work",
  "relationships",
  "growth",
  "money",
  "leadership",
] as const;
export type OnboardingFocusId = (typeof onboardingFocusIds)[number];

export const onboardingDepthIds = ["light", "balanced", "deep"] as const;
export type OnboardingDepthId = (typeof onboardingDepthIds)[number];

export const onboardingNextStepTypes = [
  "deep_profile",
  "relationship",
  "reality_check",
] as const;
export type OnboardingNextStepType = (typeof onboardingNextStepTypes)[number];

type Locale = "ko" | "en";
type Localized = Readonly<{ ko: string; en: string }>;

const InputSchema = z.object({
  locale: z.enum(["ko", "en"]),
  focusId: z.enum(onboardingFocusIds),
  depth: z.enum(onboardingDepthIds),
  concern: z.string().max(2_000),
  aiPersonalizationConsent: z.boolean(),
}).strict();

const n = (ko: string, en: string): Localized => ({ ko, en });
const text = (value: Localized, locale: Locale) => value[locale];

type FocusDefinition = Readonly<{
  label: Localized;
  title: Localized;
  contextualInference: Localized;
  practicalAction: Localized;
  realityCheck: Localized;
  nextStepType: OnboardingNextStepType;
  nextStepLabel: Localized;
}>;

const FOCUS: Record<OnboardingFocusId, FocusDefinition> = {
  work: {
    label: n("일·진로", "Work & career"),
    title: n("직업 이름보다 반복 가능한 업무 조건을 보세요", "Compare repeatable work conditions, not job-title destiny"),
    contextualInference: n(
      "숫자 상징은 직업을 확정하지 않습니다. 에너지가 유지되는 과제, 권한, 협업 방식과 회복 조건을 비교하는 질문으로 사용하세요.",
      "Number symbolism does not determine a vocation. Use it to compare tasks, decision rights, collaboration, and recovery conditions that remain workable.",
    ),
    practicalAction: n(
      "관심 직무 하나를 골라 잘 맞을 조건과 맞지 않을 조건을 각각 한 가지씩 실제 종사자에게 확인해 보세요.",
      "Choose one role and ask someone doing it to verify one condition that fits you and one that may not.",
    ),
    realityCheck: n(
      "직무의 이미지가 아니라 지난 4주 동안 집중과 회복이 실제로 유지된 업무 조건은 무엇이었나요?",
      "Which work conditions actually sustained both focus and recovery during the last four weeks, beyond the role’s image?",
    ),
    nextStepType: "deep_profile",
    nextStepLabel: n("직업·리더십 상세 보기", "Open career and leadership detail"),
  },
  relationships: {
    label: n("관계", "Relationships"),
    title: n("상대의 운명보다 반복되는 상호작용을 보세요", "Observe recurring interaction, not another person’s fate"),
    contextualInference: n(
      "관계 상징은 특정 사람이나 만남을 예측하지 않습니다. 편안함, 경계, 속도와 말·행동의 일치를 관찰하는 출발점으로 사용하세요.",
      "Relationship symbolism predicts neither a person nor a meeting. Use it to observe ease, boundaries, pace, and whether words match repeated behavior.",
    ),
    practicalAction: n(
      "최근 관계 하나에서 편안했던 행동과 경계가 흐려졌던 행동을 각각 한 가지 기록해 보세요.",
      "In one recent relationship, record one behavior that supported ease and one that blurred a boundary.",
    ),
    realityCheck: n(
      "호감이나 기대를 제외하고도 신뢰를 보여 주는 반복 행동이 있었나요?",
      "Apart from attraction or hope, what repeated behavior—if any—demonstrated trust?",
    ),
    nextStepType: "relationship",
    nextStepLabel: n("관계 환경과 미래 파트너 성향 보기", "Explore relationship settings and partner qualities"),
  },
  growth: {
    label: n("성장", "Growth"),
    title: n("큰 변화보다 확인 가능한 한 번의 실험을 고르세요", "Choose one observable experiment instead of a total transformation"),
    contextualInference: n(
      "성장 상징은 더 나은 사람이 되어야 한다는 명령이 아닙니다. 반복되는 패턴 하나를 작게 시험하고 결과를 회고하는 렌즈입니다.",
      "Growth symbolism is not an order to become a better person. It is a lens for testing one recurring pattern at a small scale and reviewing the outcome.",
    ),
    practicalAction: n(
      "이번 주에 20분 안에 끝낼 수 있는 행동 하나와 확인 날짜를 정하세요.",
      "Choose one action that takes no more than 20 minutes this week and set a review date.",
    ),
    realityCheck: n(
      "이 행동이 실제 부담을 줄이거나 선택을 명확하게 했는지 나중에 무엇으로 확인할 수 있나요?",
      "What later observation would show whether this action reduced friction or clarified a choice?",
    ),
    nextStepType: "reality_check",
    nextStepLabel: n("Reality Check로 행동 저장하기", "Save an action in Reality Check"),
  },
  money: {
    label: n("돈", "Money"),
    title: n("운보다 실제 돈의 흐름과 책임 조건을 보세요", "Examine real money flows and responsibility, not luck"),
    contextualInference: n(
      "숫자 상징은 투자·수익 또는 재정적 성공을 예측하지 않습니다. 소비 압력, 책임 분담과 의사결정 습관을 관찰하는 질문으로만 사용하세요.",
      "Number symbolism predicts neither investments, returns, nor financial success. Use it only to examine spending pressure, shared responsibility, and decision habits.",
    ),
    practicalAction: n(
      "최근 한 달 지출 중 만족도가 높았던 항목과 후회가 남은 항목을 하나씩 비교해 보세요.",
      "Compare one purchase from the last month that remained worthwhile with one you regretted.",
    ),
    realityCheck: n(
      "감정적 확신을 제외하고 이 선택의 비용, 대안과 감당 가능한 손실을 설명할 수 있나요?",
      "Apart from emotional certainty, can you explain this choice’s cost, alternatives, and affordable downside?",
    ),
    nextStepType: "reality_check",
    nextStepLabel: n("재정 선택을 Reality Check에 기록하기", "Record the decision in Reality Check"),
  },
  leadership: {
    label: n("리더십", "Leadership"),
    title: n("통제력보다 결정 구조와 책임의 균형을 보세요", "Examine decision structure and responsibility, not control"),
    contextualInference: n(
      "리더십 상징은 타고난 우월성을 뜻하지 않습니다. 권한, 정보 공유, 반대 의견과 회복 가능한 책임 구조를 검토하는 렌즈입니다.",
      "Leadership symbolism does not imply innate superiority. Use it to review authority, information sharing, dissent, and a sustainable responsibility structure.",
    ),
    practicalAction: n(
      "현재 결정 하나에서 누가 제안하고, 결정하고, 실행하며, 결과를 검토하는지 적어 보세요.",
      "For one current decision, write down who proposes, decides, executes, and reviews the outcome.",
    ),
    realityCheck: n(
      "책임을 맡은 사람이 필요한 정보와 실제 결정 권한도 갖고 있나요?",
      "Does the person carrying responsibility also have the information and decision authority they need?",
    ),
    nextStepType: "deep_profile",
    nextStepLabel: n("리더십·행동 상세 보기", "Open leadership and action detail"),
  },
};

const DEPTH: Record<OnboardingDepthId, Readonly<{
  label: Localized;
  guidance: Localized;
}>> = {
  light: {
    label: n("가볍게", "Light"),
    guidance: n(
      "핵심 질문과 작은 행동 하나만 먼저 사용하세요. 상세 해석은 필요할 때 펼쳐보면 됩니다.",
      "Start with one core question and one small action. Open detailed interpretation only when useful.",
    ),
  },
  balanced: {
    label: n("균형 있게", "Balanced"),
    guidance: n(
      "핵심 결과와 컨텍스트 카드를 먼저 보고, 계산 근거와 심층 영역은 선택해서 확인하세요.",
      "Review the core result and context card first, then choose whether to open calculation evidence or deeper domains.",
    ),
  },
  deep: {
    label: n("깊이 있게", "Deep"),
    guidance: n(
      "8개 심층 영역을 함께 열어 둡니다. 정보량보다 서로 모순되는 조건과 현실 확인 질문을 우선하세요.",
      "The eight-domain profile opens with the result. Prioritize conflicting conditions and reality checks over the amount of information.",
    ),
  },
};

export class OnboardingContextInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OnboardingContextInputError";
  }
}

export interface OnboardingReflectionContext {
  ruleVersion: typeof ONBOARDING_CONTEXT_RULE_VERSION;
  source: "user_selected_context";
  focusId: OnboardingFocusId;
  focusLabel: string;
  depth: OnboardingDepthId;
  depthLabel: string;
  depthGuidance: string;
  showDeepProfileByDefault: boolean;
  title: string;
  contextualInference: string;
  practicalAction: string;
  realityCheck: string;
  nextStep: {
    type: OnboardingNextStepType;
    label: string;
  };
  concern: null | {
    text: string;
    source: "untrusted_user_input";
    retention: "page_memory_only";
  };
  aiBoundary: {
    consentSelected: boolean;
    providerStatus: "disconnected";
    requestMade: false;
    message: string;
  };
  uncertainty: string;
}

function normalizeConcern(value: string): string | null {
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(value)) {
    throw new OnboardingContextInputError("Concern contains unsupported control characters");
  }
  const normalized = value
    .normalize("NFC")
    .replace(/\r\n?/gu, "\n")
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/gu, " ").trim())
    .join("\n")
    .trim();
  if (Array.from(normalized).length > 1_000) {
    throw new OnboardingContextInputError("Concern exceeds 1,000 Unicode code points");
  }
  return normalized || null;
}

export function createOnboardingReflectionContext(
  input: unknown,
): OnboardingReflectionContext {
  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) {
    throw new OnboardingContextInputError("Invalid onboarding context");
  }
  const definition = FOCUS[parsed.data.focusId];
  const depth = DEPTH[parsed.data.depth];
  const concern = normalizeConcern(parsed.data.concern);
  const locale = parsed.data.locale;
  const consentSelected = parsed.data.aiPersonalizationConsent;

  return {
    ruleVersion: ONBOARDING_CONTEXT_RULE_VERSION,
    source: "user_selected_context",
    focusId: parsed.data.focusId,
    focusLabel: text(definition.label, locale),
    depth: parsed.data.depth,
    depthLabel: text(depth.label, locale),
    depthGuidance: text(depth.guidance, locale),
    showDeepProfileByDefault: parsed.data.depth === "deep",
    title: text(definition.title, locale),
    contextualInference: text(definition.contextualInference, locale),
    practicalAction: text(definition.practicalAction, locale),
    realityCheck: text(definition.realityCheck, locale),
    nextStep: {
      type: definition.nextStepType,
      label: text(definition.nextStepLabel, locale),
    },
    concern: concern
      ? {
          text: concern,
          source: "untrusted_user_input",
          retention: "page_memory_only",
        }
      : null,
    aiBoundary: {
      consentSelected,
      providerStatus: "disconnected",
      requestMade: false,
      message: consentSelected
        ? text(n(
            "AI 개인화 사용에 동의했지만 승인된 외부 AI가 연결되지 않아 요청은 전송되지 않았습니다. 현재 결과는 로컬 규칙 기반입니다.",
            "You allowed AI personalization, but no approved external AI is connected. No provider request was made; this result remains local and rule-based.",
          ), locale)
        : text(n(
            "AI 개인화가 꺼져 있으며 외부 AI 요청은 없었습니다. 결정론적 계산과 로컬 규칙 기반 결과는 그대로 제공됩니다.",
            "AI personalization is off and no external AI request was made. Deterministic calculations and the local rule-based result remain fully available.",
          ), locale),
    },
    uncertainty: text(n(
      "선택한 관심 분야와 고민은 해석의 초점을 정할 뿐 계산 사실이나 미래 가능성을 바꾸지 않습니다.",
      "Your selected focus and question change only the reflection lens; they do not alter calculated facts or future likelihood.",
    ), locale),
  };
}
