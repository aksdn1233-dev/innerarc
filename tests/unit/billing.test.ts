import { describe, expect, it } from "vitest";
import {
  BillingOrchestrator,
  CheckoutRequestSchema,
  evaluateEntitlement,
  resolveEffectiveTier,
  SubscriptionLedger,
  type CancellationRequest,
  type CheckoutRequest,
  type CheckoutSession,
  type PaymentProvider,
  type SubscriptionSnapshot,
} from "@/core/billing";

const accountRef = "account_12345678";
const subscriptionRef = "subscription_12345678";
const checkoutRequest: CheckoutRequest = {
  accountRef,
  tier: "plus",
  billingPeriod: "month",
  currency: "USD",
  locale: "en",
  successUrl: "https://innerarc.example/account?checkout=success",
  cancelUrl: "https://innerarc.example/plans",
  idempotencyKey: "checkout_12345678",
};

const checkoutSession: CheckoutSession = {
  provider: "test_provider",
  sessionRef: "session_12345678",
  checkoutUrl: "https://pay.example/session_12345678",
  expiresAt: "2026-08-01T00:00:00.000Z",
};

class FakeProvider implements PaymentProvider {
  checkoutCalls = 0;
  cancellationCalls = 0;
  failCheckout = false;
  failCancellation = false;

  async createCheckout(): Promise<CheckoutSession> {
    this.checkoutCalls += 1;
    if (this.failCheckout) throw new Error("PAYMENT_NETWORK_FAILURE");
    return checkoutSession;
  }

  async cancelSubscription(): Promise<void> {
    this.cancellationCalls += 1;
    if (this.failCancellation) throw new Error("PAYMENT_NETWORK_FAILURE");
  }
}

const snapshot = (overrides: Partial<SubscriptionSnapshot> = {}): SubscriptionSnapshot => ({
  accountRef,
  providerSubscriptionRef: subscriptionRef,
  tier: "plus",
  status: "active",
  currentPeriodEnd: "2026-08-22T00:00:00.000Z",
  cancelAtPeriodEnd: false,
  updatedAt: "2026-07-22T10:00:00.000Z",
  ...overrides,
});

describe("versioned entitlement policy", () => {
  it("keeps first core value free and explains paid-only access", () => {
    expect(evaluateEntitlement({ tier: "free", capability: "core_profile", used: 1 })).toMatchObject({
      allowed: true,
      limit: null,
      reason: "allowed",
    });
    expect(evaluateEntitlement({ tier: "free", capability: "full_profile", used: 0 })).toMatchObject({
      allowed: false,
      reason: "tier_required",
      upgradeTo: "plus",
    });
  });

  it("enforces quota boundaries without off-by-one errors", () => {
    expect(evaluateEntitlement({ tier: "free", capability: "tarot_reading", used: 0 }).allowed).toBe(true);
    expect(evaluateEntitlement({ tier: "free", capability: "tarot_reading", used: 1 })).toMatchObject({
      allowed: false,
      remaining: 0,
      reason: "quota_exhausted",
      upgradeTo: "plus",
    });
    expect(() => evaluateEntitlement({ tier: "free", capability: "tarot_reading", used: -1 })).toThrow();
  });

  it("reserves deep relationship and team/family capabilities for Pro", () => {
    expect(evaluateEntitlement({ tier: "plus", capability: "deep_relationship", used: 0 })).toMatchObject({ allowed: false, upgradeTo: "pro" });
    expect(evaluateEntitlement({ tier: "pro", capability: "deep_relationship", used: 9 })).toMatchObject({ allowed: true, limit: null });
    expect(evaluateEntitlement({ tier: "pro", capability: "team_family", used: 9 }).allowed).toBe(true);
  });
});

describe("subscription state", () => {
  it.each([
    [null, "free"],
    [snapshot({ status: "active" }), "plus"],
    [snapshot({ status: "trialing", tier: "pro" }), "pro"],
    [snapshot({ status: "past_due", currentPeriodEnd: "2026-07-23T00:00:00.000Z" }), "plus"],
    [snapshot({ status: "past_due", currentPeriodEnd: "2026-07-21T00:00:00.000Z" }), "free"],
    [snapshot({ status: "incomplete" }), "free"],
    [snapshot({ status: "canceled" }), "free"],
  ] as const)("resolves paid status safely", (value, expected) => {
    expect(resolveEffectiveTier(value, "2026-07-22T12:00:00.000Z")).toBe(expected);
  });

  it("makes duplicate and stale subscription events harmless", () => {
    const ledger = new SubscriptionLedger();
    const first = { eventRef: "event_12345678", snapshot: snapshot() };
    expect(ledger.apply(first)).toMatchObject({ duplicate: false, stale: false });
    expect(ledger.apply(first)).toMatchObject({ duplicate: true, stale: false });
    const stale = ledger.apply({
      eventRef: "event_87654321",
      snapshot: snapshot({ status: "canceled", updatedAt: "2026-07-21T10:00:00.000Z" }),
    });
    expect(stale).toMatchObject({ duplicate: false, stale: true });
    expect(ledger.get(accountRef)?.status).toBe("active");
  });
});

describe("payment provider boundary", () => {
  it("returns one checkout for a retried idempotency key", async () => {
    const provider = new FakeProvider();
    const billing = new BillingOrchestrator(provider);
    await expect(billing.createCheckout(checkoutRequest)).resolves.toEqual(checkoutSession);
    await expect(billing.createCheckout(checkoutRequest)).resolves.toEqual(checkoutSession);
    expect(provider.checkoutCalls).toBe(1);
  });

  it("does not cache a failed checkout and permits a safe retry", async () => {
    const provider = new FakeProvider();
    const billing = new BillingOrchestrator(provider);
    provider.failCheckout = true;
    await expect(billing.createCheckout(checkoutRequest)).rejects.toThrow("PAYMENT_NETWORK_FAILURE");
    provider.failCheckout = false;
    await expect(billing.createCheckout(checkoutRequest)).resolves.toEqual(checkoutSession);
    expect(provider.checkoutCalls).toBe(2);
  });

  it("deduplicates successful cancellation but retries a failure", async () => {
    const provider = new FakeProvider();
    const billing = new BillingOrchestrator(provider);
    const request: CancellationRequest = {
      accountRef,
      subscriptionRef,
      atPeriodEnd: true,
      idempotencyKey: "cancel_12345678",
    };
    provider.failCancellation = true;
    await expect(billing.cancel(request)).rejects.toThrow();
    provider.failCancellation = false;
    await expect(billing.cancel(request)).resolves.toEqual({ duplicate: false });
    await expect(billing.cancel(request)).resolves.toEqual({ duplicate: true });
    expect(provider.cancellationCalls).toBe(2);
  });

  it("rejects unsafe return URLs and Free checkout", () => {
    expect(() => CheckoutRequestSchema.parse({ ...checkoutRequest, successUrl: "http://evil.example/collect" })).toThrow();
    expect(() => CheckoutRequestSchema.parse({ ...checkoutRequest, tier: "free" })).toThrow();
  });
});
