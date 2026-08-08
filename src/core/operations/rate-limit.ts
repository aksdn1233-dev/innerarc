import { z } from "zod";

export const RATE_LIMIT_POLICY_VERSION = "1.0.0" as const;
export const RateLimitPolicyIdSchema = z.enum([
  "guest_calculation",
  "tarot_draw",
  "ai_generation",
  "checkout_create",
  "data_export",
  "auth_attempt",
]);
export type RateLimitPolicyId = z.infer<typeof RateLimitPolicyIdSchema>;

export type RateLimitPolicy = Readonly<{ limit: number; windowMs: number }>;
export const rateLimitPolicies: Readonly<Record<RateLimitPolicyId, RateLimitPolicy>> = {
  guest_calculation: { limit: 30, windowMs: 60_000 },
  tarot_draw: { limit: 10, windowMs: 60_000 },
  ai_generation: { limit: 5, windowMs: 60_000 },
  checkout_create: { limit: 3, windowMs: 10 * 60_000 },
  data_export: { limit: 2, windowMs: 60 * 60_000 },
  auth_attempt: { limit: 5, windowMs: 15 * 60_000 },
};

const opaqueKey = z.string().regex(/^[A-Za-z0-9_-]{8,160}$/);

export type RateLimitDecision = Readonly<{
  policyVersion: typeof RATE_LIMIT_POLICY_VERSION;
  policyId: RateLimitPolicyId;
  allowed: boolean;
  duplicate: boolean;
  limit: number;
  remaining: number;
  resetAtMs: number;
  retryAfterMs: number;
}>;

type WindowState = {
  windowStartMs: number;
  count: number;
  requestDecisions: Map<string, RateLimitDecision>;
};

export class InMemoryRateLimiter {
  readonly #windows = new Map<string, WindowState>();

  consume(candidate: {
    scopeKey: string;
    policyId: RateLimitPolicyId;
    requestId: string;
    nowMs: number;
  }): RateLimitDecision {
    const scopeKey = opaqueKey.parse(candidate.scopeKey);
    const policyId = RateLimitPolicyIdSchema.parse(candidate.policyId);
    const requestId = opaqueKey.parse(candidate.requestId);
    const nowMs = z.number().int().min(0).parse(candidate.nowMs);
    const policy = rateLimitPolicies[policyId];
    const windowStartMs = Math.floor(nowMs / policy.windowMs) * policy.windowMs;
    const storageKey = `${policyId}:${scopeKey}`;
    let state = this.#windows.get(storageKey);
    if (!state || state.windowStartMs !== windowStartMs) {
      state = { windowStartMs, count: 0, requestDecisions: new Map() };
      this.#windows.set(storageKey, state);
    }
    const previous = state.requestDecisions.get(requestId);
    if (previous) return { ...previous, duplicate: true };

    const allowed = state.count < policy.limit;
    if (allowed) state.count += 1;
    const resetAtMs = windowStartMs + policy.windowMs;
    const decision: RateLimitDecision = {
      policyVersion: RATE_LIMIT_POLICY_VERSION,
      policyId,
      allowed,
      duplicate: false,
      limit: policy.limit,
      remaining: Math.max(0, policy.limit - state.count),
      resetAtMs,
      retryAfterMs: allowed ? 0 : Math.max(0, resetAtMs - nowMs),
    };
    state.requestDecisions.set(requestId, decision);
    return decision;
  }
}
