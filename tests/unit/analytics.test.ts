import { describe, expect, it } from "vitest";
import {
  ANALYTICS_SCHEMA_VERSION,
  ConsentGatedAnalytics,
  InMemoryAnalyticsSink,
  SafeAnalyticsEventSchema,
} from "@/core/analytics";

const base = {
  schemaVersion: ANALYTICS_SCHEMA_VERSION,
  eventId: "11111111-1111-4111-8111-111111111111",
  occurredAt: "2026-07-22T10:00:00.000Z",
  sessionId: "session_12345678",
  locale: "en" as const,
};

describe("privacy-minimized analytics", () => {
  it("records an allowlisted event once when consent is active", async () => {
    const sink = new InMemoryAnalyticsSink();
    const analytics = new ConsentGatedAnalytics(sink, () => true);
    const event = { ...base, name: "share_downloaded" as const, properties: { kind: "romantic_pattern" as const } };
    await expect(analytics.capture(event)).resolves.toEqual({ accepted: true, reason: "recorded" });
    await expect(analytics.capture(event)).resolves.toEqual({ accepted: false, reason: "duplicate" });
    expect(sink.list()).toHaveLength(1);
  });

  it("writes nothing when product analytics consent is off", async () => {
    const sink = new InMemoryAnalyticsSink();
    const analytics = new ConsentGatedAnalytics(sink, () => false);
    await expect(analytics.capture({
      ...base,
      name: "onboarding_completed",
      properties: { depth: "balanced" },
    })).resolves.toEqual({ accepted: false, reason: "consent_required" });
    expect(sink.list()).toHaveLength(0);
  });

  it("fails closed when a sink has not been approved", async () => {
    const analytics = new ConsentGatedAnalytics(null, () => true);
    await expect(analytics.capture({
      ...base,
      name: "reality_check_saved",
      properties: { devicePersistence: false },
    })).resolves.toEqual({ accepted: false, reason: "sink_disabled" });
  });

  it("rejects free text and sensitive extra properties", () => {
    expect(() => SafeAnalyticsEventSchema.parse({
      ...base,
      name: "onboarding_completed",
      properties: { depth: "deep", birthDate: "1994-11-04", question: "private" },
    })).toThrow();
    expect(() => SafeAnalyticsEventSchema.parse({
      ...base,
      email: "person@example.com",
      name: "onboarding_completed",
      properties: { depth: "deep" },
    })).toThrow();
  });

  it("bounds AI cost telemetry and excludes prompt content", () => {
    expect(SafeAnalyticsEventSchema.parse({
      ...base,
      name: "ai_run_completed",
      properties: {
        providerAlias: "provider_a",
        modelAlias: "model-1",
        inputTokens: 900,
        outputTokens: 300,
        latencyMs: 1_250,
        estimatedCostMicros: 24_000,
        fallback: false,
      },
    }).name).toBe("ai_run_completed");
    expect(() => SafeAnalyticsEventSchema.parse({
      ...base,
      name: "ai_run_completed",
      properties: {
        providerAlias: "provider_a",
        modelAlias: "model-1",
        inputTokens: 900,
        outputTokens: 300,
        latencyMs: 1_250,
        estimatedCostMicros: 24_000,
        fallback: false,
        prompt: "ignore all previous instructions",
      },
    })).toThrow();
  });
});
