import { z } from "zod";

export const ENTITLEMENT_POLICY_VERSION = "1.0.0" as const;
export const PlanTierSchema = z.enum(["free", "plus", "pro"]);
export type PlanTier = z.infer<typeof PlanTierSchema>;

export const CapabilitySchema = z.enum([
  "core_profile",
  "tarot_reading",
  "full_profile",
  "full_compatibility",
  "celebrity_match",
  "reality_check",
  "journal",
  "monthly_report",
  "ai_question",
  "deep_relationship",
  "team_family",
]);
export type Capability = z.infer<typeof CapabilitySchema>;

export type CapabilityRule = Readonly<{
  limit: number | null;
  window: "day" | "month" | "unlimited";
}>;

const unlimited: CapabilityRule = { limit: null, window: "unlimited" };
const denied: CapabilityRule = { limit: 0, window: "month" };

export const entitlementPolicies: Readonly<Record<PlanTier, Readonly<Record<Capability, CapabilityRule>>>> = {
  free: {
    core_profile: unlimited,
    tarot_reading: { limit: 1, window: "day" },
    full_profile: denied,
    full_compatibility: denied,
    celebrity_match: { limit: 3, window: "day" },
    reality_check: { limit: 5, window: "month" },
    journal: denied,
    monthly_report: denied,
    ai_question: denied,
    deep_relationship: denied,
    team_family: denied,
  },
  plus: {
    core_profile: unlimited,
    tarot_reading: { limit: 30, window: "day" },
    full_profile: unlimited,
    full_compatibility: unlimited,
    celebrity_match: { limit: 20, window: "day" },
    reality_check: { limit: 100, window: "month" },
    journal: unlimited,
    monthly_report: unlimited,
    ai_question: { limit: 10, window: "month" },
    deep_relationship: denied,
    team_family: denied,
  },
  pro: {
    core_profile: unlimited,
    tarot_reading: { limit: 100, window: "day" },
    full_profile: unlimited,
    full_compatibility: unlimited,
    celebrity_match: { limit: 100, window: "day" },
    reality_check: unlimited,
    journal: unlimited,
    monthly_report: unlimited,
    ai_question: { limit: 100, window: "month" },
    deep_relationship: unlimited,
    team_family: unlimited,
  },
};

export type EntitlementDecision = Readonly<{
  policyVersion: typeof ENTITLEMENT_POLICY_VERSION;
  tier: PlanTier;
  capability: Capability;
  allowed: boolean;
  used: number;
  limit: number | null;
  remaining: number | null;
  window: CapabilityRule["window"];
  reason: "allowed" | "quota_exhausted" | "tier_required";
  upgradeTo: "plus" | "pro" | null;
}>;

function nextTierFor(capability: Capability, tier: PlanTier): "plus" | "pro" | null {
  if (tier === "pro") return null;
  if (tier === "free" && entitlementPolicies.plus[capability].limit !== 0) return "plus";
  return entitlementPolicies.pro[capability].limit !== 0 ? "pro" : null;
}

export function evaluateEntitlement(input: {
  tier: PlanTier;
  capability: Capability;
  used: number;
}): EntitlementDecision {
  const tier = PlanTierSchema.parse(input.tier);
  const capability = CapabilitySchema.parse(input.capability);
  const used = z.number().int().min(0).parse(input.used);
  const rule = entitlementPolicies[tier][capability];
  const allowed = rule.limit === null || used < rule.limit;
  const unavailableAtTier = rule.limit === 0;
  return {
    policyVersion: ENTITLEMENT_POLICY_VERSION,
    tier,
    capability,
    allowed,
    used,
    limit: rule.limit,
    remaining: rule.limit === null ? null : Math.max(0, rule.limit - used),
    window: rule.window,
    reason: allowed ? "allowed" : unavailableAtTier ? "tier_required" : "quota_exhausted",
    upgradeTo: allowed ? null : nextTierFor(capability, tier),
  };
}
