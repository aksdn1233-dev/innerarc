import { z } from "zod";
import { PlanTierSchema, type PlanTier } from "./entitlements";

const opaqueRef = z.string().regex(/^[A-Za-z0-9_-]{8,120}$/);
export const SubscriptionStatusSchema = z.enum(["trialing", "active", "past_due", "canceled", "incomplete"]);

export const SubscriptionSnapshotSchema = z.object({
  accountRef: opaqueRef,
  providerSubscriptionRef: opaqueRef,
  tier: PlanTierSchema.exclude(["free"]),
  status: SubscriptionStatusSchema,
  currentPeriodEnd: z.string().datetime({ offset: true }),
  cancelAtPeriodEnd: z.boolean(),
  updatedAt: z.string().datetime({ offset: true }),
}).strict();
export type SubscriptionSnapshot = z.infer<typeof SubscriptionSnapshotSchema>;

export const SubscriptionEventSchema = z.object({
  eventRef: opaqueRef,
  snapshot: SubscriptionSnapshotSchema,
}).strict();
export type SubscriptionEvent = z.infer<typeof SubscriptionEventSchema>;

export function resolveEffectiveTier(snapshot: SubscriptionSnapshot | null, now: string): PlanTier {
  if (!snapshot) return "free";
  const parsed = SubscriptionSnapshotSchema.parse(snapshot);
  const nowMs = Date.parse(z.string().datetime({ offset: true }).parse(now));
  if (parsed.status === "active" || parsed.status === "trialing") return parsed.tier;
  if (parsed.status === "past_due" && nowMs < Date.parse(parsed.currentPeriodEnd)) return parsed.tier;
  return "free";
}

export type SubscriptionApplyResult = Readonly<{
  duplicate: boolean;
  stale: boolean;
  snapshot: SubscriptionSnapshot;
}>;

export class SubscriptionLedger {
  readonly #snapshots = new Map<string, SubscriptionSnapshot>();
  readonly #eventRefs = new Set<string>();

  apply(candidate: unknown): SubscriptionApplyResult {
    const event = SubscriptionEventSchema.parse(candidate);
    const existing = this.#snapshots.get(event.snapshot.accountRef);
    if (this.#eventRefs.has(event.eventRef)) {
      if (!existing) throw new Error("SUBSCRIPTION_EVENT_STATE_MISSING");
      return { duplicate: true, stale: false, snapshot: existing };
    }
    this.#eventRefs.add(event.eventRef);
    if (existing && Date.parse(event.snapshot.updatedAt) <= Date.parse(existing.updatedAt)) {
      return { duplicate: false, stale: true, snapshot: existing };
    }
    this.#snapshots.set(event.snapshot.accountRef, event.snapshot);
    return { duplicate: false, stale: false, snapshot: event.snapshot };
  }

  get(accountRef: string): SubscriptionSnapshot | null {
    return this.#snapshots.get(opaqueRef.parse(accountRef)) ?? null;
  }
}
