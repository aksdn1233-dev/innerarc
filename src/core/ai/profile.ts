import { z } from "zod";
import type { NumerologyProfile } from "@/core/numerology";
import type { PersonalizationContextEnvelope } from "./context";

export const EvidenceRefSchema = z.object({
  id: z.string().min(1),
  source: z.enum(["calculation", "symbolic_tradition", "user_context", "outcome_review"]),
  label: z.string().min(1),
});

export const AIInterpretationSchema = z.object({
  summary: z.string().min(1).max(600),
  calculated_facts: z.array(z.string().min(1)).max(20),
  traditional_interpretation: z.array(z.string().min(1)).max(20),
  personalized_inference: z.array(z.string().min(1)).max(20),
  strengths: z.array(z.string().min(1)).min(1).max(8),
  risks: z.array(z.string().min(1)).max(8),
  practical_actions: z.array(z.string().min(1)).min(1).max(8),
  uncertainty: z.string().min(1).max(500),
  safety_note: z.string().min(1).max(500),
  evidence_refs: z.array(EvidenceRefSchema).max(30),
});

export type AIInterpretation = z.infer<typeof AIInterpretationSchema>;

export type AIProfileRequest = {
  readonly locale: "ko" | "en";
  readonly numerology: NumerologyProfile;
  readonly interest: string;
  readonly concern?: string;
  readonly depth: "light" | "balanced" | "deep";
  readonly priorPatternRefs: readonly string[];
  readonly personalizationContext?: PersonalizationContextEnvelope;
};

const canonicalFactTokens = (profile: NumerologyProfile): Set<string> =>
  new Set([
    `lifePath:${profile.lifePath.value}`,
    `birthday:${profile.birthday.value}`,
    `attitude:${profile.attitude.value}`,
    `personalYear:${profile.personalYear.value}`,
    ...(profile.name.status === "calculated"
      ? [
          `destiny:${profile.name.destiny?.value}`,
          `soulUrge:${profile.name.soulUrge?.value}`,
          `personality:${profile.name.personality?.value}`,
        ]
      : []),
  ]);

export function validateInterpretation(
  candidate: unknown,
  canonicalProfile: NumerologyProfile,
): AIInterpretation {
  const parsed = AIInterpretationSchema.parse(candidate);
  const allowed = canonicalFactTokens(canonicalProfile);
  const calculationRefs = parsed.evidence_refs.filter((ref) => ref.source === "calculation");
  for (const ref of calculationRefs) {
    if (!allowed.has(ref.id)) {
      throw new Error(`AI_CALCULATION_MISMATCH:${ref.id}`);
    }
  }
  return parsed;
}

export function createFallbackInterpretation(
  profile: NumerologyProfile,
  locale: "ko" | "en",
): AIInterpretation {
  const lifePath = profile.lifePath.value;
  const ko = locale === "ko";
  return {
    summary: ko
      ? `라이프 패스 ${lifePath}의 상징을 현재 선택을 돌아보는 출발점으로 활용해 보세요.`
      : `Use the symbolism of Life Path ${lifePath} as a starting point for reflecting on your current choices.`,
    calculated_facts: [
      ko ? `계산된 라이프 패스: ${lifePath}` : `Calculated Life Path: ${lifePath}`,
      ko
        ? `계산된 태도 수: ${profile.attitude.value}`
        : `Calculated Attitude Number: ${profile.attitude.value}`,
    ],
    traditional_interpretation: [
      ko
        ? "숫자는 전통적 상징 체계의 언어이며 과학적 성격 진단이 아닙니다."
        : "Numbers are part of a traditional symbolic system, not a scientific personality diagnosis.",
    ],
    personalized_inference: [
      ko
        ? "외부 AI 연결 없이 제공되는 기본 해석이라 개인 맥락 추론을 제한했습니다."
        : "This offline fallback limits personal inference because no external AI is connected.",
    ],
    strengths: [ko ? "자신의 선택을 언어화하는 계기" : "A prompt to articulate your choices"],
    risks: [ko ? "상징을 사실이나 예측으로 받아들이는 것" : "Treating symbolism as fact or prediction"],
    practical_actions: [
      ko
        ? "오늘 중요하게 여기는 선택 기준을 한 문장으로 적어보세요."
        : "Write one sentence describing the criterion that matters most in your decision today.",
    ],
    uncertainty: ko
      ? "이 해석은 상징적 자기성찰 자료이며 실제 적합성은 사용자의 경험으로 확인해야 합니다."
      : "This is symbolic reflection material; its personal fit must be checked against lived experience.",
    safety_note: ko
      ? "중요한 의료·법률·재정 결정은 자격 있는 전문가와 현실 정보를 우선하세요."
      : "For important medical, legal, or financial decisions, prioritize qualified professionals and real-world information.",
    evidence_refs: [
      {
        id: `lifePath:${lifePath}`,
        source: "calculation",
        label: ko ? "결정론적 수비학 계산" : "Deterministic numerology calculation",
      },
    ],
  };
}
