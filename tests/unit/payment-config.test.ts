import { afterEach, describe, expect, it, vi } from "vitest";
import {
  deriveTossCustomerKey,
  inspectPaymentReadiness,
} from "@/server/payments/config";
import {
  confirmTossPayment,
  matchesTossWebhookSecret,
  sanitizeTossSnapshot,
} from "@/server/payments/toss";

const validEnvironment = {
  PAYMENTS_PROVIDER: "toss",
  TOSS_CLIENT_KEY: `test_ck_${"a".repeat(32)}`,
  TOSS_SECRET_KEY: `test_sk_${"b".repeat(32)}`,
  TOSS_CUSTOMER_KEY_SALT: "c".repeat(32),
  TOSS_PAYMENT_METHOD_VARIANT_KEY: "DEFAULT",
  TOSS_AGREEMENT_VARIANT_KEY: "AGREEMENT",
  INNERARC_PLUS_30D_PRICE_KRW: "5900",
  INNERARC_PRO_30D_PRICE_KRW: "12900",
};

describe("payment readiness", () => {
  it("stays closed by default and when configuration is incomplete", () => {
    expect(inspectPaymentReadiness({}, "development")).toEqual({
      enabled: false,
      reason: "DISABLED",
    });
    expect(inspectPaymentReadiness({ PAYMENTS_PROVIDER: "toss" }, "development")).toEqual({
      enabled: false,
      reason: "INCOMPLETE",
    });
  });

  it("validates server-owned products and requires live keys in production", () => {
    const development = inspectPaymentReadiness(validEnvironment, "development");
    expect(development.enabled).toBe(true);
    if (development.enabled) {
      expect(development.config.products.plus_30d.amount).toBe(5900);
      expect(development.config.products.pro_30d.amount).toBe(12900);
    }

    expect(inspectPaymentReadiness(validEnvironment, "production")).toEqual({
      enabled: false,
      reason: "INVALID",
    });
    expect(inspectPaymentReadiness({
      ...validEnvironment,
      TOSS_CLIENT_KEY: `live_ck_${"a".repeat(32)}`,
      TOSS_SECRET_KEY: `live_sk_${"b".repeat(32)}`,
    }, "production").enabled).toBe(true);
  });

  it("derives a non-identifying Toss customer key within the provider length limit", () => {
    const first = deriveTossCustomerKey("user@example.com", "s".repeat(32));
    const second = deriveTossCustomerKey("user@example.com", "s".repeat(32));
    expect(first).toBe(second);
    expect(first).not.toContain("user@example.com");
    expect(first.length).toBeLessThanOrEqual(50);
  });
});

describe("Toss API boundary", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses Basic auth, idempotency, and accepts only a verified payment shape", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      paymentKey: "payment-key-123456",
      orderId: "ia_order_123",
      status: "DONE",
      method: "간편결제",
      currency: "KRW",
      totalAmount: 5900,
      approvedAt: "2026-07-27T12:00:00+09:00",
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const payment = await confirmTossPayment({
      secretKey: "test_sk_secret",
      paymentKey: "payment-key-123456",
      orderId: "ia_order_123",
      amount: 5900,
    });
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(options.headers).toMatchObject({
      Authorization: `Basic ${Buffer.from("test_sk_secret:").toString("base64")}`,
      "Idempotency-Key": "ia_order_123",
    });
    expect(sanitizeTossSnapshot(payment)).not.toHaveProperty("paymentKey");
    expect(sanitizeTossSnapshot(payment)).not.toHaveProperty("virtualAccount");
  });

  it("rejects malformed provider success bodies", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      orderId: "ia_order_123",
      status: "DONE",
      currency: "USD",
      totalAmount: 5900,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })));

    await expect(confirmTossPayment({
      secretKey: "test_sk_secret",
      paymentKey: "payment-key-123456",
      orderId: "ia_order_123",
      amount: 5900,
    })).rejects.toThrow();
  });

  it("compares virtual-account webhook secrets without accepting partial matches", () => {
    expect(matchesTossWebhookSecret("deposit-secret-123", "deposit-secret-123")).toBe(true);
    expect(matchesTossWebhookSecret("deposit-secret-123", "deposit-secret")).toBe(false);
    expect(matchesTossWebhookSecret(null, "deposit-secret-123")).toBe(false);
  });
});
