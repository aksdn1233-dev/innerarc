import { afterEach, describe, expect, it, vi } from "vitest";
import {
  deriveTossCustomerKey,
  inspectPaymentReadiness,
  purchasablePaymentProductCodes,
} from "@/server/payments/config";
import {
  confirmTossPayment,
  matchesTossWebhookSecret,
  sanitizeTossSnapshot,
} from "@/server/payments/toss";
import { toInternalPaymentStatus } from "@/server/payments/portone";
import {
  payAppMethodName,
  requestPayAppPayment,
  securePayAppValueMatches,
  toInternalPayAppStatus,
} from "@/server/payments/payapp";

const strictLaunchApproval = { PAYMENTS_REQUIRE_LAUNCH_APPROVAL: "true" } as const;

const validEnvironment = {
  ...strictLaunchApproval,
  PAYMENTS_PROVIDER: "toss",
  PAYMENTS_LAUNCH_APPROVED: "true",
  TOSS_CLIENT_KEY: `test_ck_${"a".repeat(32)}`,
  TOSS_SECRET_KEY: `test_sk_${"b".repeat(32)}`,
  TOSS_CUSTOMER_KEY_SALT: "c".repeat(32),
  TOSS_PAYMENT_METHOD_VARIANT_KEY: "DEFAULT",
  TOSS_AGREEMENT_VARIANT_KEY: "AGREEMENT",
  INNERARC_PRO_30D_PRICE_KRW: "9600",
  INNERARC_PREMIUM_PDF_PRICE_KRW: "39000",
};

const validPortOneEnvironment = {
  ...strictLaunchApproval,
  PAYMENTS_PROVIDER: "portone",
  PAYMENTS_LAUNCH_APPROVED: "true",
  PORTONE_STORE_ID: "store-4ff4af41-85e3-4559-8eb8-0d08a2c6ceec",
  PORTONE_KPN_CHANNEL_KEY: "channel-key-9987cb87-6458-4888-b94e-68d9a2da896d",
  PORTONE_API_SECRET: `portone-api-${"a".repeat(32)}`,
  PORTONE_WEBHOOK_SECRET: `portone-webhook-${"b".repeat(32)}`,
  INNERARC_PRO_30D_PRICE_KRW: "9600",
  INNERARC_PREMIUM_PDF_PRICE_KRW: "39000",
};

const validManualTransferEnvironment = {
  ...strictLaunchApproval,
  PAYMENTS_PROVIDER: "manual_transfer",
  PAYMENTS_LAUNCH_APPROVED: "true",
  MANUAL_BANK_ACCOUNTS_JSON: JSON.stringify([
    {
      bankName: "테스트은행",
      accountNumber: "123-456-789012",
      accountHolder: "테스트상점",
    },
    {
      bankName: "두번째은행",
      accountNumber: "3333-01-2345678",
      accountHolder: "테스트상점",
    },
  ]),
  MANUAL_DEPOSIT_WINDOW_HOURS: "24",
  INNERARC_PRO_30D_PRICE_KRW: "9600",
  INNERARC_PREMIUM_PDF_PRICE_KRW: "39000",
};

const validPayAppEnvironment = {
  ...strictLaunchApproval,
  PAYMENTS_PROVIDER: "payapp",
  PAYMENTS_LAUNCH_APPROVED: "true",
  PAYAPP_USER_ID: "test-seller",
  PAYAPP_LINK_KEY: "link-key-secret",
  PAYAPP_LINK_VALUE: "link-value-secret",
  PAYAPP_OPEN_PAY_TYPES: "card,kakaopay,tosspay,vbank,phone,rbank",
  INNERARC_PRO_30D_PRICE_KRW: "9600",
  INNERARC_PREMIUM_PDF_PRICE_KRW: "39000",
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

  it("requires a separate launch approval for every production provider", () => {
    expect(inspectPaymentReadiness({
      ...validPayAppEnvironment,
      PAYMENTS_LAUNCH_APPROVED: "false",
    }, "production")).toEqual({
      enabled: false,
      reason: "UNAPPROVED",
    });
    expect(inspectPaymentReadiness({
      ...validPayAppEnvironment,
      PAYMENTS_LAUNCH_APPROVED: undefined,
    }, "production")).toEqual({
      enabled: false,
      reason: "UNAPPROVED",
    });
  });

  it("defaults to open in production when strict launch checks are not explicitly enabled", () => {
    expect(
      inspectPaymentReadiness({
        ...validPayAppEnvironment,
        ...strictLaunchApproval,
        NODE_ENV: "production",
        PAYMENTS_REQUIRE_LAUNCH_APPROVAL: "false",
        PAYMENTS_LAUNCH_APPROVED: undefined,
      }, "production").enabled,
    ).toBe(true);
  });

  it("forces readiness when PAYMENTS_FORCE_OPEN is set", () => {
    expect(inspectPaymentReadiness({
      ...validPayAppEnvironment,
      ...strictLaunchApproval,
      PAYMENTS_LAUNCH_APPROVED: "false",
      PAYMENTS_FORCE_OPEN: "1",
    }, "production").enabled).toBe(true);
  });

  it("validates the exact active catalog and requires live keys in production", () => {
    const development = inspectPaymentReadiness(validEnvironment, "development");
    expect(development.enabled).toBe(true);
    if (development.enabled) {
      expect(development.config.products.plus_30d.amount).toBe(19000);
      expect(development.config.products.pro_30d.amount).toBe(9600);
      expect(development.config.products.premium_pdf.amount).toBe(39000);
    }
    expect(purchasablePaymentProductCodes).toEqual(["pro_30d", "premium_pdf"]);
    expect(inspectPaymentReadiness({
      ...validEnvironment,
      INNERARC_PRO_30D_PRICE_KRW: "39000",
      INNERARC_PREMIUM_PDF_PRICE_KRW: "79000",
    }, "development")).toEqual({ enabled: false, reason: "INVALID" });

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

  it("accepts a complete PortOne KPN configuration and rejects malformed channel IDs", () => {
    const readiness = inspectPaymentReadiness(validPortOneEnvironment, "production");
    expect(readiness.enabled).toBe(true);
    if (readiness.enabled) {
      expect(readiness.config.provider).toBe("portone");
      expect(readiness.config.products.plus_30d.amount).toBe(19000);
      expect(readiness.config.products.premium_pdf.amount).toBe(39000);
    }
    expect(inspectPaymentReadiness({
      ...validPortOneEnvironment,
      PORTONE_KPN_CHANNEL_KEY: "wrong-channel",
    }, "production")).toEqual({ enabled: false, reason: "INVALID" });
  });

  it("accepts a complete manual bank-transfer configuration without PG keys", () => {
    const readiness = inspectPaymentReadiness(validManualTransferEnvironment, "production");
    expect(readiness.enabled).toBe(true);
    if (readiness.enabled) {
      expect(readiness.config.provider).toBe("manual_transfer");
      if (readiness.config.provider === "manual_transfer") {
        expect(readiness.config.bankAccounts).toHaveLength(2);
        expect(readiness.config.bankAccounts[0]?.bankName).toBe("테스트은행");
        expect(readiness.config.depositWindowHours).toBe(24);
      }
    }
    expect(inspectPaymentReadiness({
      ...validManualTransferEnvironment,
      MANUAL_BANK_ACCOUNTS_JSON: "not-json",
    }, "production")).toEqual({ enabled: false, reason: "INVALID" });
  });

  it("accepts PayApp secrets and rejects unknown payment methods", () => {
    const readiness = inspectPaymentReadiness(validPayAppEnvironment, "production");
    expect(readiness.enabled).toBe(true);
    if (readiness.enabled && readiness.config.provider === "payapp") {
      expect(readiness.config.userId).toBe("test-seller");
      expect(readiness.config.openPayTypes).toContain("vbank");
      expect(readiness.config.products.plus_30d.amount).toBe(19000);
      expect(readiness.config.products.pro_30d.amount).toBe(9600);
    }
    expect(inspectPaymentReadiness({
      ...validPayAppEnvironment,
      PAYAPP_OPEN_PAY_TYPES: "card,not-a-method",
    }, "production")).toEqual({ enabled: false, reason: "INVALID" });
  });

  it("normalizes PortOne lifecycle states before applying entitlements", () => {
    expect(toInternalPaymentStatus("PAID")).toBe("DONE");
    expect(toInternalPaymentStatus("VIRTUAL_ACCOUNT_ISSUED")).toBe("WAITING_FOR_DEPOSIT");
    expect(toInternalPaymentStatus("CANCELLED")).toBe("CANCELED");
    expect(toInternalPaymentStatus("PARTIAL_CANCELLED")).toBe("PARTIAL_CANCELED");
    expect(toInternalPaymentStatus("FAILED")).toBe("ABORTED");
  });
});

describe("PayApp API boundary", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates a server-side checkout and upgrades a PayApp URL to HTTPS", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      "state=1&errorMessage=&mul_no=20001234&payurl=http%3A%2F%2Fpayapp.kr%2FL%2Fcheckout",
      { status: 200 },
    ));
    vi.stubGlobal("fetch", fetchMock);

    const checkout = await requestPayAppPayment({
      userId: "test-seller",
      orderId: "iaorder123456",
      productCode: "pro_30d",
      orderName: "상세 리딩",
      amount: 9600,
      customerPhone: "01012345678",
      openPayTypes: "card,kakaopay,tosspay,vbank,phone,rbank",
      feedbackUrl: "https://example.com/api/payments/payapp/feedback",
      returnUrl: "https://example.com/api/payments/payapp/return",
    });

    expect(checkout.requestNumber).toBe("20001234");
    expect(checkout.payUrl).toBe("https://payapp.kr/L/checkout");
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const sent = new URLSearchParams(String(options.body));
    expect(sent.get("var1")).toBe("iaorder123456");
    expect(sent.get("price")).toBe("9600");
    expect(sent.get("checkretry")).toBe("y");
    expect(sent.get("reqaddr")).toBe("0");
  });

  it("rejects an off-domain PayApp checkout URL", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      "state=1&errorMessage=&mul_no=20001234&payurl=https%3A%2F%2Fevil.example%2Fcheckout",
      { status: 200 },
    )));

    await expect(requestPayAppPayment({
      userId: "test-seller",
      orderId: "iaorder123456",
      productCode: "pro_30d",
      orderName: "상세 리딩",
      amount: 9600,
      customerPhone: "01012345678",
      openPayTypes: "card",
      feedbackUrl: "https://example.com/api/payments/payapp/feedback",
      returnUrl: "https://example.com/api/payments/payapp/return",
    })).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("validates webhook secrets and normalizes completion states", () => {
    expect(securePayAppValueMatches("same-secret", "same-secret")).toBe(true);
    expect(securePayAppValueMatches("same-secret", "different-secret")).toBe(false);
    expect(toInternalPayAppStatus("10")).toBe("WAITING_FOR_DEPOSIT");
    expect(toInternalPayAppStatus("4")).toBe("DONE");
    expect(toInternalPayAppStatus("16")).toBe("CANCELED");
    expect(toInternalPayAppStatus("31")).toBe("CANCELED");
    expect(toInternalPayAppStatus("64")).toBe("CANCELED");
    expect(payAppMethodName("4")).toBe("FACE_TO_FACE");
    expect(payAppMethodName("7")).toBe("VIRTUAL_ACCOUNT");
    expect(payAppMethodName("17")).toBe("REGISTERED_PAYMENT");
    expect(payAppMethodName("22")).toBe("WECHATPAY");
    expect(payAppMethodName("25")).toBe("TOSSPAY");
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
