import { z } from "zod";
import type { SpaceModel } from "./config";
export const SPACE_ROUTER_VERSION = "space-router-1";
export type Difficulty = "standard" | "complex";
export const RoutingObservationSchema = z.object({ model: z.string().max(120), difficulty: z.enum(["standard", "complex"]), reasoningLevel: z.string().nullable(), escalated: z.boolean(), success: z.boolean(), latencyMs: z.number().min(0).max(180_000), inputTokens: z.number().int().nonnegative(), outputTokens: z.number().int().nonnegative() });
export type RoutingObservation = z.infer<typeof RoutingObservationSchema>;
// Explicit cold-start operating assumptions, not measured reconstruction accuracy.
export const ROUTING_POLICY = { targetSuccess: .8, unresolvedPenaltyMicros: 250_000, latencyPenaltyMicrosPerSecond: 500, historyLimit: 200, minimumSamples: 10 } as const;
const priors = { routine: [.72, .48], standard: [.82, .66], strong: [.90, .84], astra: [.94, .91] } as const;
export function routeSpaceTask(task: "extract" | "geometry" | "render" | "analysis" | "save") { return task === "extract" ? "model_router" : "deterministic"; }
export function selectSpaceModel(models: SpaceModel[], difficulty: Difficulty, history: RoutingObservation[], inputEstimate: number, maxOutput: number, remainingCost: number, previousModel: string | null = null) {
  const escalated = previousModel !== null;
  const variantsFor = (escalated: boolean) => models.map(model => {
    const effort = escalated ? model.escalationEffort ?? model.normalEffort : model.normalEffort;
    const records = history.slice(0, ROUTING_POLICY.historyLimit).filter(row => row.model === model.id && row.difficulty === difficulty && row.escalated === escalated && row.reasoningLevel === effort);
    const p = priors[model.tier][difficulty === "complex" ? 1 : 0] - (escalated ? .07 : 0);
    const success = records.length >= ROUTING_POLICY.minimumSamples ? Math.max(.1, (records.filter(row => row.success).length + 2 * p) / (records.length + 2) - .25 / Math.sqrt(records.length)) : p;
    const output = records.length >= 10 ? Math.min(maxOutput, Math.ceil(records.reduce((sum, r) => sum + r.outputTokens, 0) / records.length * 1.15)) : Math.min(maxOutput, 1800);
    const input = records.length >= 10 ? Math.min(inputEstimate, Math.ceil(records.reduce((sum, r) => sum + r.inputTokens, 0) / records.length * 1.15)) : Math.min(inputEstimate, difficulty === "complex" ? 10000 : 4000);
    const cost = Math.ceil((input * Math.max(model.inputMicrosPerMillion, model.cacheWriteMicrosPerMillion, model.cachedInputMicrosPerMillion) + output * model.outputMicrosPerMillion) / 1e6);
    const latency = records.length >= 10 ? records.reduce((sum, r) => sum + r.latencyMs, 0) / records.length / 1000 : difficulty === "complex" ? 35 : 20;
    return { model, effort, success, cost, latency, basis: records.length >= 10 ? "observed" as const : "cold_start" as const };
  }).filter(variant => variant.cost <= remainingCost);
  const variants = variantsFor(escalated);
  const fallbacks = variantsFor(true).filter(v => v.success >= ROUTING_POLICY.targetSuccess);
  const plans: { first: typeof variants[number]; second: typeof variants[number] | null; score: number; success: number }[] = [];
  for (const first of variants) for (const second of escalated ? [null] : [null, ...fallbacks]) {
    if (second && first.cost + second.cost > remainingCost) continue;
    // Fallback uses the exact same conditional history, effort and quality gate as runtime.
    const nextSuccess = second?.success ?? 0;
    const success = first.success + (1 - first.success) * nextSuccess;
    const score = first.cost + (1 - first.success) * (second?.cost ?? 0) + (1 - success) * ROUTING_POLICY.unresolvedPenaltyMicros + (first.latency + (1 - first.success) * (second?.latency ?? 0)) * ROUTING_POLICY.latencyPenaltyMicrosPerSecond;
    plans.push({ first, second, score, success });
  }
  const qualityPlans = plans.filter(p => p.success >= ROUTING_POLICY.targetSuccess);
  const candidates = qualityPlans.length ? qualityPlans : plans;
  candidates.sort((a, b) => (qualityPlans.length ? a.score - b.score : b.success - a.success) || a.first.model.id.localeCompare(b.first.model.id));
  const selected = candidates[0];
  if (!selected) return null;
  return { model: selected.first.model, reasoningLevel: selected.first.effort, decisionBasis: selected.first.basis, expectedCostMicros: Math.ceil(selected.score), expectedSuccess: selected.success, qualityTargetMet: selected.success >= ROUTING_POLICY.targetSuccess, plannedFallback: selected.second?.model.id ?? null };
}
