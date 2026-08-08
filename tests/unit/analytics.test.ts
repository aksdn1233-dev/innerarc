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

  it("allowlists the conversion funnel without accepting personal reading input", () => {
    const events = [
      { name: "landing_view", properties: {} },
      { name: "primary_cta_click", properties: { location: "hero" } },
      { name: "sample_section_view", properties: {} },
      { name: "product_view", properties: { productCode: "pro_30d" } },
      { name: "product_select", properties: { productCode: "premium_pdf", location: "product_card" } },
      { name: "form_start", properties: {} },
      { name: "form_complete", properties: { productCode: "pro_30d" } },
      { name: "payment_start", properties: { productCode: "pro_30d", provider: "payapp" } },
      { name: "payment_success", properties: { provider: "payapp" } },
      { name: "payment_fail", properties: { provider: "payapp", stage: "checkout" } },
    ] as const;

    for (const conversionEvent of events) {
      expect(SafeAnalyticsEventSchema.parse({ ...base, ...conversionEvent }).name).toBe(conversionEvent.name);
    }
    expect(() => SafeAnalyticsEventSchema.parse({
      ...base,
      name: "form_complete",
      properties: {
        productCode: "pro_30d",
        birthDate: "1994-11-04",
        name: "private name",
        question: "private question",
      },
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

/**
 * The browser beacon. A `keepalive` fetch never reports completion back to the page in
 * Chromium, so the page's network never goes quiet and every measurement that waits for
 * it hangs — that is what made the /en payload-budget test time out on every run. These
 * tests pin the transport that fixes it, and the payload that must not change with it.
 */
describe("the conversion beacon leaves the page's network quiet", () => {
  type BeaconCall = Readonly<{ url: string; type: string; body: string }>;

  async function captureWithStubbedBrowser(sendBeaconResult: boolean | null) {
    const beacons: BeaconCall[] = [];
    const fetches: string[] = [];
    const dispatched: string[] = [];
    const store = new Map<string, string>();

    // `navigator` is getter-only on globalThis in Node, so each stub goes in through a
    // property descriptor and the original descriptor is put back afterwards.
    const originals = new Map<string, PropertyDescriptor | undefined>();
    const stub = (key: string, value: unknown) => {
      originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
      Object.defineProperty(globalThis, key, {
        value,
        configurable: true,
        writable: true,
      });
    };

    stub("window", {
      sessionStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => void store.set(key, value),
      },
      dispatchEvent: (event: { type: string }) => void dispatched.push(event.type),
    });
    stub("navigator", sendBeaconResult === null ? {} : {
      sendBeacon: (url: string, blob: Blob) => {
        beacons.push({ url, type: blob.type, body: "" });
        return sendBeaconResult;
      },
    });
    stub("fetch", async (url: string) => {
      fetches.push(String(url));
      return new Response(null, { status: 204 });
    });

    try {
      const { captureConversionEvent } = await import("@/core/analytics");
      const accepted = captureConversionEvent("form_complete", "ko", {
        productCode: "pro_30d",
      });
      return { accepted, beacons, fetches, dispatched };
    } finally {
      for (const [key, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete (globalThis as Record<string, unknown>)[key];
      }
    }
  }

  it("hands the event to sendBeacon as JSON and makes no page-held request", async () => {
    const result = await captureWithStubbedBrowser(true);
    expect(result.accepted).toBe(true);
    expect(result.beacons).toEqual([
      { url: "/api/analytics/events", type: "application/json", body: "" },
    ]);
    // No fetch at all: nothing stays open in the page's own network accounting.
    expect(result.fetches).toEqual([]);
    expect(result.dispatched).toEqual(["gyeol:analytics"]);
  });

  it("still delivers the event when the browser has no beacon support", async () => {
    const result = await captureWithStubbedBrowser(null);
    expect(result.accepted).toBe(true);
    expect(result.beacons).toEqual([]);
    expect(result.fetches).toEqual(["/api/analytics/events"]);
  });

  it("falls back to fetch when the browser refuses to queue the beacon", async () => {
    const result = await captureWithStubbedBrowser(false);
    expect(result.beacons).toHaveLength(1);
    expect(result.fetches).toEqual(["/api/analytics/events"]);
  });
});
