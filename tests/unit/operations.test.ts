import { describe, expect, it } from "vitest";
import {
  evaluateFeatureFlag,
  FEATURE_FLAG_SCHEMA_VERSION,
  InMemoryRateLimiter,
  stableRolloutBucket,
} from "@/core/operations";

const flag = {
  schemaVersion: FEATURE_FLAG_SCHEMA_VERSION,
  key: "deep_reports",
  enabled: true,
  killSwitch: false,
  rolloutBasisPoints: 10_000,
  allowedTiers: ["plus", "pro"],
} as const;

describe("feature flags", () => {
  it("gives a stable anonymous rollout bucket", () => {
    const first = stableRolloutBucket("deep_reports", "subject_12345678");
    expect(stableRolloutBucket("deep_reports", "subject_12345678")).toBe(first);
    expect(first).toBeGreaterThanOrEqual(0);
    expect(first).toBeLessThan(10_000);
  });

  it("applies kill switch before global, tier, or rollout settings", () => {
    expect(evaluateFeatureFlag({ ...flag, killSwitch: true }, {
      subjectRef: "subject_12345678",
      tier: "pro",
    })).toMatchObject({ enabled: false, reason: "kill_switch" });
  });

  it("enforces global and tier gates", () => {
    expect(evaluateFeatureFlag({ ...flag, enabled: false }, {
      subjectRef: "subject_12345678",
      tier: "pro",
    }).reason).toBe("globally_disabled");
    expect(evaluateFeatureFlag(flag, {
      subjectRef: "subject_12345678",
      tier: "free",
    }).reason).toBe("tier_excluded");
  });

  it("handles zero and full rollouts at exact boundaries", () => {
    expect(evaluateFeatureFlag({ ...flag, rolloutBasisPoints: 0 }, {
      subjectRef: "subject_12345678",
      tier: "plus",
    }).reason).toBe("rollout_excluded");
    expect(evaluateFeatureFlag(flag, {
      subjectRef: "subject_12345678",
      tier: "plus",
    })).toMatchObject({ enabled: true, reason: "enabled" });
  });

  it("rejects duplicate tiers, PII-shaped subjects, and malformed keys", () => {
    expect(() => evaluateFeatureFlag({ ...flag, allowedTiers: ["plus", "plus"] }, {
      subjectRef: "subject_12345678",
      tier: "plus",
    })).toThrow();
    expect(() => evaluateFeatureFlag(flag, {
      subjectRef: "person@example.com",
      tier: "plus",
    })).toThrow();
    expect(() => evaluateFeatureFlag({ ...flag, key: "Bad Flag" }, {
      subjectRef: "subject_12345678",
      tier: "plus",
    })).toThrow();
  });
});

describe("retry-safe rate limiting", () => {
  it("does not charge an allowed retry twice and denies after the exact limit", () => {
    const limiter = new InMemoryRateLimiter();
    const base = { scopeKey: "account_12345678", policyId: "checkout_create" as const, nowMs: 60_000 };
    const first = limiter.consume({ ...base, requestId: "request_00000001" });
    expect(first).toMatchObject({ allowed: true, duplicate: false, remaining: 2 });
    expect(limiter.consume({ ...base, requestId: "request_00000001" })).toMatchObject({
      allowed: true,
      duplicate: true,
      remaining: 2,
    });
    expect(limiter.consume({ ...base, requestId: "request_00000002" }).allowed).toBe(true);
    expect(limiter.consume({ ...base, requestId: "request_00000003" }).allowed).toBe(true);
    const denied = limiter.consume({ ...base, requestId: "request_00000004" });
    expect(denied).toMatchObject({ allowed: false, remaining: 0, duplicate: false });
    expect(limiter.consume({ ...base, requestId: "request_00000004" })).toMatchObject({
      allowed: false,
      duplicate: true,
    });
  });

  it("resets exactly at the next window and isolates policies", () => {
    const limiter = new InMemoryRateLimiter();
    const scopeKey = "account_12345678";
    for (let index = 0; index < 3; index += 1) {
      limiter.consume({ scopeKey, policyId: "checkout_create", requestId: `request_old0000${index}`, nowMs: 599_999 });
    }
    expect(limiter.consume({ scopeKey, policyId: "checkout_create", requestId: "request_denied01", nowMs: 599_999 }).allowed).toBe(false);
    expect(limiter.consume({ scopeKey, policyId: "checkout_create", requestId: "request_new00001", nowMs: 600_000 })).toMatchObject({
      allowed: true,
      remaining: 2,
      resetAtMs: 1_200_000,
    });
    expect(limiter.consume({ scopeKey, policyId: "data_export", requestId: "request_export01", nowMs: 600_000 })).toMatchObject({
      allowed: true,
      limit: 2,
    });
  });

  it("keeps separate subject scopes and rejects unsafe or invalid inputs", () => {
    const limiter = new InMemoryRateLimiter();
    expect(limiter.consume({
      scopeKey: "account_12345678",
      policyId: "ai_generation",
      requestId: "request_12345678",
      nowMs: 0,
    }).allowed).toBe(true);
    expect(limiter.consume({
      scopeKey: "account_87654321",
      policyId: "ai_generation",
      requestId: "request_12345678",
      nowMs: 0,
    }).remaining).toBe(4);
    expect(() => limiter.consume({
      scopeKey: "person@example.com",
      policyId: "ai_generation",
      requestId: "request_12345678",
      nowMs: 0,
    })).toThrow();
    expect(() => limiter.consume({
      scopeKey: "account_12345678",
      policyId: "ai_generation",
      requestId: "request_12345678",
      nowMs: -1,
    })).toThrow();
  });
});
