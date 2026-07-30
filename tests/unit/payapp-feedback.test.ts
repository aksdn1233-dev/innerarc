import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The PayApp feedback callback is the only thing standing between a forged HTTP
// request and a delivered paid report, so it is exercised against a recording
// Supabase double rather than left to manual checks.
const finalizePaidReport = vi.fn<(...args: unknown[]) => Promise<void>>();
const revokeGuestPaidReport = vi.fn<(...args: unknown[]) => Promise<void>>();
const getSupabaseAdminClient = vi.fn();

vi.mock("@/server/reports/paid-report", () => ({
  finalizePaidReport: (...args: unknown[]) => finalizePaidReport(...args),
  revokeGuestPaidReport: (...args: unknown[]) => revokeGuestPaidReport(...args),
}));
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: () => getSupabaseAdminClient(),
}));

const { POST } = await import("@/app/api/payments/payapp/feedback/route");

const USER_ID = "veloop";
const LINK_KEY = "link-key-value-1234";
const LINK_VALUE = "link-value-value-1234";
const ORDER_ID = "ia0123456789abcdef";
const REQUEST_NUMBER = "20004321";

type OrderRow = {
  order_id: string;
  owner_user_id: string | null;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  provider_snapshot: unknown;
};

function defaultOrder(overrides: Partial<OrderRow> = {}): OrderRow {
  return {
    order_id: ORDER_ID,
    owner_user_id: null,
    provider: "payapp",
    amount: 39_000,
    currency: "KRW",
    status: "READY",
    provider_snapshot: { requestNumber: REQUEST_NUMBER },
    ...overrides,
  };
}

type Recorder = {
  rpc: { name: string; args: Record<string, unknown> }[];
  updates: Record<string, unknown>[];
  events: Record<string, unknown>[];
};

function createAdmin(order: OrderRow | null, recorder: Recorder) {
  const orderQuery = {
    select: () => orderQuery,
    eq: () => orderQuery,
    is: () => orderQuery,
    maybeSingle: async () => ({ data: order, error: null }),
  };

  return {
    from(table: string) {
      if (table === "payment_events") {
        return {
          insert: async (row: Record<string, unknown>) => {
            recorder.events.push(row);
            return { error: null };
          },
        };
      }
      return {
        select: orderQuery.select,
        update(row: Record<string, unknown>) {
          recorder.updates.push(row);
          const chain = {
            eq: () => chain,
            is: async () => ({ error: null }),
          };
          return chain;
        },
      };
    },
    async rpc(name: string, args: Record<string, unknown>) {
      recorder.rpc.push({ name, args });
      return { error: null };
    },
  };
}

function feedbackRequest(fields: Record<string, string>) {
  const form = new FormData();
  const body = {
    userid: USER_ID,
    linkkey: LINK_KEY,
    linkval: LINK_VALUE,
    price: "39000",
    pay_state: "4",
    pay_type: "1",
    var1: ORDER_ID,
    mul_no: REQUEST_NUMBER,
    ...fields,
  };
  for (const [key, value] of Object.entries(body)) form.set(key, value);
  return new Request("https://gyeol.example/api/payments/payapp/feedback", {
    method: "POST",
    body: form,
  });
}

let recorder: Recorder;

function stubOrder(order: OrderRow | null) {
  recorder = { rpc: [], updates: [], events: [] };
  getSupabaseAdminClient.mockReturnValue(createAdmin(order, recorder));
  return recorder;
}

beforeEach(() => {
  vi.stubEnv("PAYMENTS_PROVIDER", "payapp");
  vi.stubEnv("PAYAPP_USER_ID", USER_ID);
  vi.stubEnv("PAYAPP_LINK_KEY", LINK_KEY);
  vi.stubEnv("PAYAPP_LINK_VALUE", LINK_VALUE);
  vi.stubEnv("INNERARC_QUICK_TAROT_PRICE_KRW", "19000");
  vi.stubEnv("INNERARC_COMPREHENSIVE_PRICE_KRW", "39000");
  vi.stubEnv("INNERARC_PREMIUM_PDF_PRICE_KRW", "79000");
  finalizePaidReport.mockResolvedValue(undefined);
  revokeGuestPaidReport.mockResolvedValue(undefined);
  stubOrder(defaultOrder());
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("PayApp feedback callback", () => {
  it("opens the report only for an approved, order-bound callback", async () => {
    const recorded = stubOrder(defaultOrder());
    const response = await POST(feedbackRequest({}));

    expect(response.status).toBe(200);
    // PayApp retries any body that is not exactly SUCCESS.
    expect(await response.text()).toBe("SUCCESS");
    expect(finalizePaidReport).toHaveBeenCalledTimes(1);
    expect(recorded.updates[0]).toMatchObject({ status: "DONE", method: "CARD" });
    expect(recorded.events[0]).toMatchObject({ event_type: "PAY_STATE_4", provider: "payapp" });
  });

  it("rejects a forged callback whose secrets do not match", async () => {
    const forgeries: Record<string, string>[] = [
      { linkkey: "wrong-link-key-value" },
      { linkval: "wrong-link-value-value" },
      { userid: "someone-else" },
    ];
    for (const forged of forgeries) {
      const recorded = stubOrder(defaultOrder());
      const response = await POST(feedbackRequest(forged));

      expect(response.status).toBe(401);
      expect(finalizePaidReport).not.toHaveBeenCalled();
      expect(recorded.updates).toHaveLength(0);
    }
  });

  it("rejects a callback whose amount does not match the server-owned order", async () => {
    const recorded = stubOrder(defaultOrder({ amount: 79_000 }));
    const response = await POST(feedbackRequest({ price: "39000" }));

    expect(response.status).toBe(400);
    expect(finalizePaidReport).not.toHaveBeenCalled();
    expect(recorded.updates).toHaveLength(0);
  });

  it("rejects a callback bound to a different payment request", async () => {
    const recorded = stubOrder(defaultOrder({ provider_snapshot: { requestNumber: "19999999" } }));
    const response = await POST(feedbackRequest({ mul_no: REQUEST_NUMBER }));

    expect(response.status).toBe(400);
    expect(recorded.updates).toHaveLength(0);
  });

  it("rejects callbacks for unknown orders and other providers", async () => {
    expect((await POST(feedbackRequest({}))).status).toBe(200);

    stubOrder(null);
    expect((await POST(feedbackRequest({}))).status).toBe(400);

    stubOrder(defaultOrder({ provider: "portone" }));
    expect((await POST(feedbackRequest({}))).status).toBe(400);
  });

  it("holds the report closed while a virtual account is unpaid", async () => {
    const recorded = stubOrder(defaultOrder());
    const response = await POST(feedbackRequest({ pay_state: "10", pay_type: "7" }));

    expect(response.status).toBe(200);
    expect(finalizePaidReport).not.toHaveBeenCalled();
    expect(recorded.updates[0]).toMatchObject({ status: "WAITING_FOR_DEPOSIT" });
  });

  it("ignores a late pre-payment event for an already approved order", async () => {
    const recorded = stubOrder(defaultOrder({ status: "DONE" }));
    const response = await POST(feedbackRequest({ pay_state: "10", pay_type: "7" }));

    expect(response.status).toBe(200);
    expect(recorded.updates).toHaveLength(0);
    expect(finalizePaidReport).not.toHaveBeenCalled();
  });

  it.each(["8", "9", "16", "31", "32", "64"] as const)(
    "withdraws a delivered guest report for PayApp cancellation state %s",
    async (payState) => {
      const recorded = stubOrder(defaultOrder({ status: "DONE" }));
      const response = await POST(feedbackRequest({ pay_state: payState }));

      expect(response.status).toBe(200);
      expect(recorded.updates[0]).toMatchObject({ status: "CANCELED" });
      expect(revokeGuestPaidReport).toHaveBeenCalledTimes(1);
      expect(finalizePaidReport).not.toHaveBeenCalled();
    },
  );

  it("routes a signed-in buyer through the atomic entitlement function", async () => {
    const recorded = stubOrder(defaultOrder({ owner_user_id: "11111111-2222-3333-4444-555555555555" }));
    const response = await POST(feedbackRequest({}));

    expect(response.status).toBe(200);
    expect(recorded.rpc[0]?.name).toBe("apply_verified_payment");
    expect(recorded.rpc[0]?.args).toMatchObject({ p_status: "DONE", p_order_id: ORDER_ID });
    // The owner path revokes inside the database function, not in the route.
    expect(revokeGuestPaidReport).not.toHaveBeenCalled();
  });

  it("derives one stable event id so retried callbacks stay idempotent", async () => {
    const first = stubOrder(defaultOrder());
    await POST(feedbackRequest({ pay_date: "2026-07-28 10:00:00" }));
    const second = stubOrder(defaultOrder());
    await POST(feedbackRequest({ pay_date: "2026-07-28 10:00:00" }));

    expect(first.events[0]?.transmission_id).toBe(second.events[0]?.transmission_id);
  });

  it("stays closed when payments are disabled", async () => {
    vi.stubEnv("PAYMENTS_PROVIDER", "disabled");
    const response = await POST(feedbackRequest({}));

    expect(response.status).toBe(503);
    expect(finalizePaidReport).not.toHaveBeenCalled();
  });

  it("rejects a malformed callback body", async () => {
    const response = await POST(feedbackRequest({ pay_state: "999", price: "abc" }));
    expect(response.status).toBe(400);
  });
});
