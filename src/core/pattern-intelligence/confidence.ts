import type { ConfidenceLabel, PatternRealityCheckResponse } from "./types";

export type ConfidenceRevisionInput = Readonly<{
  previousConfidence: number;
  evidenceCount: number;
  response: PatternRealityCheckResponse | "EVIDENCE_SUPPORT" | "EVIDENCE_CONTRADICT" | "EVIDENCE_AMBIGUOUS";
}>;

const DELTA = {
  MATCH: 0.04,
  PARTIAL: 0.01,
  MISMATCH: -0.08,
  CONTEXT_DEPENDENT: 0,
  EVIDENCE_SUPPORT: 0.06,
  EVIDENCE_CONTRADICT: -0.1,
  EVIDENCE_AMBIGUOUS: 0,
} as const;

/** Transparent P0 heuristic. It is a learning state, not statistical probability. */
export function revisePatternConfidence(input: ConfidenceRevisionInput): number {
  const previous = Math.min(0.9, Math.max(0.1, input.previousConfidence));
  const evidenceCount = Math.max(0, Math.trunc(input.evidenceCount));
  const sparseCap = evidenceCount + 1 < 5 ? 0.74 : 0.9;
  const next = Math.min(sparseCap, Math.max(0.1, previous + DELTA[input.response]));
  return Math.round(next * 100) / 100;
}
export function confidenceLabel(score: number, evidenceCount: number): ConfidenceLabel {
  if (evidenceCount < 2) return "검증 중";
  if (score < 0.4) return "낮음";
  if (score < 0.7) return "보통";
  return "높음";
}

export function confidenceRevisionReason(input: ConfidenceRevisionInput): string {
  return ({
    MATCH: "reality_check_match_small_increase",
    PARTIAL: "reality_check_partial_very_small_increase",
    MISMATCH: "reality_check_mismatch_decrease",
    CONTEXT_DEPENDENT: "reality_check_context_increases_uncertainty",
    EVIDENCE_SUPPORT: "confirmed_evidence_support_increase",
    EVIDENCE_CONTRADICT: "confirmed_evidence_contradiction_decrease",
    EVIDENCE_AMBIGUOUS: "confirmed_evidence_ambiguous_uncertainty",
  } as const)[input.response];
}
