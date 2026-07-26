import type { Locale } from "./config";
import type { NextAnalysisSignal } from "@/core/reality-check";

export type RelationshipCopy = {
  eyebrow: string;
  headline: string;
  intro: string;
  birthDate: string;
  birthHelp: string;
  name: string;
  namePlaceholder: string;
  nameHelp: string;
  submit: string;
  invalidDate: string;
  privacyNote: string;
  compareTwo: string;
  compareIntro: string;
  summary: string;
  energySources: string;
  meetingContexts: string;
  meetingIntro: string;
  why: string;
  tryThis: string;
  caution: string;
  continueRealityCheck: string;
  handoffUnavailable: string;
  partnerPortrait: string;
  attraction: string;
  friction: string;
  greenFlags: string;
  cycleLens: string;
  realityChecks: string;
  outcomeBridgeTitle: string;
  outcomeBridgeIntro: string;
  useSavedOutcomes: string;
  outcomeUnavailable: string;
  outcomeContextEyebrow: string;
  outcomeSignals: Record<NextAnalysisSignal, string>;
  reviewedOutcomes: string;
  relevantOutcomes: string;
  uncertainOutcomes: string;
  notRelevantOutcomes: string;
  savedLearnings: string;
  outcomePrivacy: string;
  contextRule: string;
  evidence: string;
  reset: string;
  disclaimer: string;
  nav: readonly [string, string, string, string, string];
};

const ko: RelationshipCopy = {
  eyebrow: "연애 패턴 인사이트",
  headline: "사람을 예언하기보다,\n만남이 자랄 조건을 찾기",
  intro: "어디서 접점이 생기기 쉬운지, 어떤 관계 특성이 나를 살리는지 수비학 상징을 현실 행동 가설로 바꿔봅니다.",
  birthDate: "생년월일",
  birthHelp: "결정론적 계산에만 사용하며 이 게스트 화면에서는 서버로 전송하지 않습니다.",
  name: "이름 또는 로마자 표기 (선택)",
  namePlaceholder: "예: Minji Kim",
  nameHelp: "이름 수는 A–Z 로마자만 계산합니다. 입력하지 않아도 전체 분석을 볼 수 있습니다.",
  submit: "내 연애 패턴 보기",
  invalidDate: "실제 생년월일을 선택해 주세요.",
  privacyNote: "분석은 현재 브라우저 메모리에서만 유지되며 타인의 정보는 필요하지 않습니다.",
  compareTwo: "두 사람 관계 패턴 보기",
  compareIntro: "연애·결혼·친구·동료·공동창업자·상사·부하·부모·자녀 관계의 실제 운영 조건을 비교합니다.",
  summary: "관계 방향 요약",
  energySources: "연애 에너지가 살아나는 조건",
  meetingContexts: "접점이 생기기 쉬운 환경 가설",
  meetingIntro: "통계적 확률이나 예정된 장소가 아닙니다. 반복 참여로 실제 접점을 늘려볼 수 있는 환경 제안입니다.",
  why: "왜 이 환경인가",
  tryThis: "작은 실행",
  caution: "현실 주의점",
    continueRealityCheck: "Reality Check로 이어가기",
  handoffUnavailable: "현재 탭에 일회성 Reality Check 초안을 안전하게 만들지 못했습니다.",
  partnerPortrait: "미래 배우자상",
  attraction: "끌림 패턴",
  friction: "반복될 수 있는 마찰",
  greenFlags: "실제로 확인할 그린 플래그",
  cycleLens: "현재 주기의 성찰 렌즈",
  realityChecks: "관계 현실 체크",
  outcomeBridgeTitle: "이전 결과를 이번 성찰에 반영하기",
  outcomeBridgeIntro: "기기에 저장하기로 선택한 관계 Reality Check만 불러와, 반복적으로 맞았던 관점과 맞지 않았던 관점을 별도 층으로 확인합니다.",
  useSavedOutcomes: "저장한 관계 결과 불러오기",
  outcomeUnavailable: "이 기기에서 저장된 Reality Check를 안전하게 불러오지 못했습니다.",
  outcomeContextEyebrow: "Outcome review layer",
  outcomeSignals: {
    insufficient_evidence: "아직 개인화하지 않음",
    repeatedly_relevant: "반복적으로 관련성 있음",
    mixed_or_uncertain: "결과가 섞여 있음",
    repeatedly_not_relevant: "반복적으로 맞지 않음",
  },
  reviewedOutcomes: "검토 결과",
  relevantOutcomes: "관련성 있음",
  uncertainOutcomes: "불확실·일부",
  notRelevantOutcomes: "맞지 않음",
  savedLearnings: "사용자가 기록한 다음 확인사항",
  outcomePrivacy: "버튼을 누르기 전에는 저장 기록을 읽지 않습니다. 불러온 내용은 이 기기에서만 처리되며 외부 AI로 전송되지 않습니다.",
  contextRule: "컨텍스트 규칙",
  evidence: "사용한 계산 근거",
  reset: "다른 입력으로 보기",
  disclaimer: "이 결과는 만날 장소·시기·인물·결혼 여부를 예측하지 않습니다. 상호 호감, 동의, 행동의 일관성과 현실 조건이 항상 우선입니다.",
  nav: ["홈", "나", "관계", "질문", "성장"],
};

const en: RelationshipCopy = {
  eyebrow: "Romantic pattern insight",
  headline: "Do not predict a person.\nFind conditions where connection can grow.",
  intro: "Translate numerology symbolism into practical hypotheses about social contact and relationship qualities that may help you thrive.",
  birthDate: "Date of birth",
  birthHelp: "Used only for deterministic calculation and not sent to a server in this guest screen.",
  name: "Name or romanization (optional)",
  namePlaceholder: "e.g. Minji Kim",
  nameHelp: "Name numbers use A–Z romanization. The complete date-based insight works without a name.",
  submit: "Show my romantic pattern",
  invalidDate: "Choose a real date of birth.",
  privacyNote: "The result stays in browser memory, and no other person's information is required.",
  compareTwo: "Compare two relationship patterns",
  compareIntro: "Explore real operating conditions across romance, marriage, friendship, work, cofounding, hierarchy, and parent-child relationships.",
  summary: "Relationship direction",
  energySources: "Conditions that energize connection",
  meetingContexts: "Meeting-context hypotheses",
  meetingIntro: "These are not statistical odds or scheduled places. They are environments where recurring participation can create authentic contact.",
  why: "Why this setting",
  tryThis: "Small action",
  caution: "Reality caution",
    continueRealityCheck: "Test this in Reality Check",
  handoffUnavailable: "A one-time Reality Check draft could not be created safely in this tab.",
  partnerPortrait: "Future spouse portrait",
  attraction: "Attraction pattern",
  friction: "Possible repeating friction",
  greenFlags: "Green flags to verify",
  cycleLens: "Current-cycle reflection",
  realityChecks: "Relationship reality checks",
  outcomeBridgeTitle: "Bring prior outcomes into this reflection",
  outcomeBridgeIntro: "Load only relationship Reality Checks you chose to save on this device, then review repeatedly relevant and repeatedly missed perspectives as a separate layer.",
  useSavedOutcomes: "Use saved relationship outcomes",
  outcomeUnavailable: "Saved Reality Checks could not be loaded safely on this device.",
  outcomeContextEyebrow: "Outcome review layer",
  outcomeSignals: {
    insufficient_evidence: "No personalization yet",
    repeatedly_relevant: "Repeatedly relevant",
    mixed_or_uncertain: "Mixed or uncertain",
    repeatedly_not_relevant: "Repeatedly not relevant",
  },
  reviewedOutcomes: "Reviewed",
  relevantOutcomes: "Relevant",
  uncertainOutcomes: "Uncertain or partial",
  notRelevantOutcomes: "Not relevant",
  savedLearnings: "Checks you recorded for next time",
  outcomePrivacy: "Saved history is not read until you press the button. Loaded context stays on this device and is not sent to an external AI provider.",
  contextRule: "Context rule",
  evidence: "Calculated evidence used",
  reset: "Try different details",
  disclaimer: "This does not predict a meeting place, time, person, or marriage outcome. Mutual interest, consent, consistent behavior, and real conditions always come first.",
  nav: ["Home", "Me", "Relations", "Questions", "Growth"],
};

export const relationshipCopy: Record<Locale, RelationshipCopy> = { ko, en };
