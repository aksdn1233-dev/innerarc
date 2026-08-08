import type { RealityCheckHandoffDraft } from "@/core/reality-check/handoff";
import type { MeetingContextId, RelationshipInsight } from "./types";

type Locale = "ko" | "en";

export function createRelationshipRealityCheckDraft(input: {
  insight: RelationshipInsight;
  contextId: MeetingContextId;
  locale: Locale;
  handoffId: `handoff:${string}`;
}): RealityCheckHandoffDraft {
  const context = input.insight.meetingContexts.find(({ id }) => id === input.contextId);
  if (!context) throw new TypeError("RELATIONSHIP_CONTEXT_NOT_IN_RESULT");

  return {
    handoffId: input.handoffId,
    source: "relationship",
    locale: input.locale,
    category: "relationship",
    contextId: context.id,
    sourceRuleVersion: input.insight.ruleVersion,
    question: input.locale === "ko"
      ? "이 환경을 실제 관계 가능성으로 해석하기 전에 무엇을 확인할까?"
      : "What should I verify before treating this setting as a real relationship opportunity?",
    currentState: input.locale === "ko"
      ? "예언된 장소가 아니라 반복 접점을 시험할 하나의 환경 가설로 검토 중이다."
      : "I am treating this as one setting hypothesis to test through recurring contact, not a predicted place.",
    interpretation: input.locale === "ko"
      ? `${context.title}: ${context.why} 현실 주의점: ${context.caution}`
      : `${context.title}: ${context.why} Reality caution: ${context.caution}`,
    choice: input.locale === "ko"
      ? "이 환경을 만남 예측이 아니라 한 번의 현실 실험으로 선택한다."
      : "Use this setting as one real-world experiment, not as a predicted meeting.",
    actionPlan: context.tryThis,
  };
}
