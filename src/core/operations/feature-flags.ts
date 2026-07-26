import { z } from "zod";
import { PlanTierSchema, type PlanTier } from "@/core/billing";

export const FEATURE_FLAG_SCHEMA_VERSION = "1.0.0" as const;
const opaqueSubject = z.string().regex(/^[A-Za-z0-9_-]{8,120}$/);

export const FeatureFlagSchema = z.object({
  schemaVersion: z.literal(FEATURE_FLAG_SCHEMA_VERSION),
  key: z.string().regex(/^[a-z][a-z0-9_]{2,63}$/),
  enabled: z.boolean(),
  killSwitch: z.boolean(),
  rolloutBasisPoints: z.number().int().min(0).max(10_000),
  allowedTiers: z.array(PlanTierSchema).min(1).max(3).refine((tiers) => new Set(tiers).size === tiers.length),
}).strict();
export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;

export type FeatureFlagDecision = Readonly<{
  enabled: boolean;
  reason: "kill_switch" | "globally_disabled" | "tier_excluded" | "rollout_excluded" | "enabled";
  bucket: number;
}>;

export function stableRolloutBucket(flagKey: string, subjectRef: string): number {
  const source = `${z.string().min(1).parse(flagKey)}:${opaqueSubject.parse(subjectRef)}`;
  let hash = 0x811c9dc5;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) % 10_000;
}

export function evaluateFeatureFlag(candidate: unknown, input: {
  subjectRef: string;
  tier: PlanTier;
}): FeatureFlagDecision {
  const flag = FeatureFlagSchema.parse(candidate);
  const tier = PlanTierSchema.parse(input.tier);
  const bucket = stableRolloutBucket(flag.key, input.subjectRef);
  if (flag.killSwitch) return { enabled: false, reason: "kill_switch", bucket };
  if (!flag.enabled) return { enabled: false, reason: "globally_disabled", bucket };
  if (!flag.allowedTiers.includes(tier)) return { enabled: false, reason: "tier_excluded", bucket };
  if (bucket >= flag.rolloutBasisPoints) return { enabled: false, reason: "rollout_excluded", bucket };
  return { enabled: true, reason: "enabled", bucket };
}
