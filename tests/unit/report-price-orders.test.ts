import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const inserts = vi.fn();
const provider = vi.fn();
const admin = {
  from: (table: string) => ({
    insert: async (row: unknown) => { inserts(table, row); return { error: null }; },
    update: () => ({ eq: () => ({ eq: async () => ({ error: null }) }) }),
  }),
};
vi.mock("@/lib/supabase/admin", () => ({ resolveSupabaseAdminClient: () => ({ client: admin }) }));
vi.mock("@/lib/supabase/auth", () => ({ requireSupabaseUser: async () => ({ user: null, error: null }) }));
vi.mock("@/server/payments/gate", () => ({
  readOperationsGate: async () => ({ salesEnabled: true }), recordPaymentSetupEvent: vi.fn(),
}));
vi.mock("@/server/request-limit", () => ({ checkCheckoutLimit: async () => ({ allowed: true }), tooManyRequests: vi.fn() }));
vi.mock("@/server/payments/payapp", async (original) => ({
  ...await original<typeof import("@/server/payments/payapp")>(),
  requestPayAppPayment: (...args: unknown[]) => provider(...args),
}));
const { POST } = await import("@/app/api/payments/orders/route");

function request(productCode: "pro_30d" | "premium_pdf", expectedAmount: number) {
  return new Request("https://example.test/api/payments/orders", {
    method: "POST", headers: { Origin: "https://example.test", "Content-Type": "application/json" },
    body: JSON.stringify({
      productCode, expectedAmount, locale: "ko", customerPhone: "01012345678",
      readingInput: {
        version: 1, locale: "ko", productCode, birthDate: "1994-11-04", name: "",
        focusId: "work", concern: "", createdAt: "2026-10-27T00:00:00.000Z",
      },
    }),
  });
}

beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-27T00:00:00.000Z"));
  inserts.mockClear(); provider.mockReset();
  provider.mockResolvedValue({ requestNumber: "12345678", payUrl: "https://payapp.kr/L/synthetic" });
  for (const [key, value] of Object.entries({
    PAYMENTS_PROVIDER: "payapp", PAYAPP_USER_ID: "test-seller", PAYAPP_LINK_KEY: "test-link-key",
    PAYAPP_LINK_VALUE: "test-link-value", PAYAPP_OPEN_PAY_TYPES: "card,vbank",
    INNERARC_COMPREHENSIVE_PRICE_KRW: "39000", INNERARC_PREMIUM_PDF_PRICE_KRW: "79000",
    SUPABASE_SERVICE_ROLE_KEY: "synthetic-service-role-for-test-only", NEXT_PUBLIC_APP_URL: "https://example.test",
  })) vi.stubEnv(key, value);
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

describe("revised report prices at the real order boundary", () => {
  it.each([["pro_30d", 9800], ["premium_pdf", 36000]] as const)("persists and requests exactly %s / %i", async (product, amount) => {
    const response = await POST(request(product, amount));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ amount, currency: "KRW", provider: "payapp" });
    expect(inserts).toHaveBeenCalledWith("payment_orders", expect.objectContaining({ product_code: product, amount }));
    expect(inserts).toHaveBeenCalledWith("purchased_reports", expect.objectContaining({ product_code: product }));
    expect(provider).toHaveBeenCalledOnce();
    expect(provider).toHaveBeenCalledWith(expect.objectContaining({ productCode: product, amount }));
  });

  it.each([["pro_30d", 39000], ["premium_pdf", 79000], ["pro_30d", 1500], ["premium_pdf", 36001]] as const)("rejects stale or tampered %s / %i before any order/provider write", async (product, amount) => {
    const response = await POST(request(product, amount));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "PRICE_CHANGED" });
    expect(inserts).not.toHaveBeenCalled();
    expect(provider).not.toHaveBeenCalled();
  });
});
