import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_OPERATIONS_GATE,
  readOperationsGate,
  readRecentPaymentSetupEvents,
  recordPaymentSetupEvent,
} from "@/server/payments/gate";
import { PayAppApiError, requestPayAppPayment } from "@/server/payments/payapp";

const MISSING_COLUMN = {
  code: "42703",
  message: 'column admin_settings.payments_launch_approved does not exist',
};

/**
 * A double that answers each `select(columns)` from a script keyed by the exact column
 * list, which is what lets these tests describe a database that is one migration behind
 * the deployed code.
 */
function createAdmin(
  responses: Record<string, { data: unknown; error: unknown }>,
  seen: string[] = [],
): SupabaseClient {
  return {
    from: () => ({
      select: (columns: string) => {
        seen.push(columns);
        const answer = responses[columns] ?? { data: null, error: { code: "42P01" } };
        const query = {
          eq: () => query,
          order: () => query,
          limit: async () => answer,
          maybeSingle: async () => answer,
        };
        return query;
      },
    }),
  } as unknown as SupabaseClient;
}

const FULL_COLUMNS = "sales_enabled,payments_launch_approved,payments_launch_approved_at";

describe("operations gate", () => {
  it("reads the sales switch and owner approval when both columns exist", async () => {
    const gate = await readOperationsGate(createAdmin({
      [FULL_COLUMNS]: {
        data: {
          sales_enabled: true,
          payments_launch_approved: true,
          payments_launch_approved_at: "2026-07-31T00:00:00.000Z",
        },
        error: null,
      },
    }));
    expect(gate).toEqual({
      salesEnabled: true,
      launchApprovedByOwner: true,
      approvedAt: "2026-07-31T00:00:00.000Z",
      reachable: true,
      error: null,
      migrated: true,
    });
  });

  it("keeps serving orders when the approval column has not been migrated yet", async () => {
    const seen: string[] = [];
    const gate = await readOperationsGate(createAdmin({
      [FULL_COLUMNS]: { data: null, error: MISSING_COLUMN },
      sales_enabled: { data: { sales_enabled: true }, error: null },
    }, seen));
    expect(seen).toEqual([FULL_COLUMNS, "sales_enabled"]);
    expect(gate.salesEnabled).toBe(true);
    expect(gate.reachable).toBe(true);
    expect(gate.migrated).toBe(false);
    // An unreadable approval is never an approval.
    expect(gate.launchApprovedByOwner).toBe(false);
  });

  it("still honours a paused sales switch on the pre-migration path", async () => {
    const gate = await readOperationsGate(createAdmin({
      [FULL_COLUMNS]: { data: null, error: MISSING_COLUMN },
      sales_enabled: { data: { sales_enabled: false }, error: null },
    }));
    expect(gate.salesEnabled).toBe(false);
  });

  it("falls back to the safe default when the settings table cannot be read", async () => {
    const gate = await readOperationsGate(createAdmin({}));
    expect(gate).toEqual({ ...DEFAULT_OPERATIONS_GATE, error: "42P01" });
    // Sales open, approval closed: a database hiccup must not stop a paying customer,
    // and must not open a checkout the owner never approved.
    expect(gate.salesEnabled).toBe(true);
    expect(gate.launchApprovedByOwner).toBe(false);
  });

  // The failure that cost a full debugging round: the key was well-formed and the
  // table existed, but Supabase refused the key outright. "unreachable" alone said
  // nothing an operator could act on, so the database's own words are carried out.
  it("carries the database's own refusal message out to the caller", async () => {
    const gate = await readOperationsGate(createAdmin({
      [FULL_COLUMNS]: {
        data: null,
        error: { code: "PGRST301", message: "Invalid authentication credentials" },
      },
      sales_enabled: {
        data: null,
        error: { code: "PGRST301", message: "Invalid authentication credentials" },
      },
    }));
    expect(gate.reachable).toBe(false);
    expect(gate.error).toBe("PGRST301: Invalid authentication credentials");
  });

  it("returns the safe default without a database client at all", async () => {
    await expect(readOperationsGate(null)).resolves.toEqual(DEFAULT_OPERATIONS_GATE);
  });

  it("gives up on an unresponsive database instead of hanging the page", async () => {
    vi.useFakeTimers();
    try {
      const hanging = {
        from: () => {
          const query = {
            select: () => query,
            eq: () => query,
            maybeSingle: () => new Promise(() => {}),
          };
          return query;
        },
      } as unknown as SupabaseClient;

      const pending = readOperationsGate(hanging);
      await vi.advanceTimersByTimeAsync(3_100);
      const gate = await pending;
      expect(gate.reachable).toBe(false);
      expect(gate.salesEnabled).toBe(true);
      expect(gate.error).toContain("3초");
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("provider failure record", () => {
  it("bounds what it stores and never throws at the caller", async () => {
    const inserts: Record<string, unknown>[] = [];
    const admin = {
      from: () => ({
        insert: async (row: Record<string, unknown>) => {
          inserts.push(row);
          return { error: null };
        },
      }),
    } as unknown as SupabaseClient;

    await recordPaymentSetupEvent(admin, {
      provider: "payapp",
      stage: "provider_request",
      code: "INVALID_RESPONSE",
      message: "가".repeat(900),
      orderId: "ia0123456789",
    });
    expect(inserts[0]?.provider).toBe("payapp");
    expect(String(inserts[0]?.message)).toHaveLength(500);
  });

  it("swallows a missing table so checkout keeps its own error handling", async () => {
    const admin = {
      from: () => ({
        insert: async () => {
          throw new Error("relation payment_setup_events does not exist");
        },
      }),
    } as unknown as SupabaseClient;
    await expect(recordPaymentSetupEvent(admin, {
      provider: "payapp",
      stage: "provider_request",
      code: "REQUEST_FAILED",
    })).resolves.toBeUndefined();
    await expect(readRecentPaymentSetupEvents(null)).resolves.toEqual([]);
  });
});

describe("PayApp rejection wording", () => {
  it("carries the provider's own message out of the API boundary", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      "state=0&errorMessage=%EB%93%B1%EB%A1%9D%EB%90%98%EC%A7%80%20%EC%95%8A%EC%9D%80%20%ED%8C%90%EB%A7%A4%EC%9E%90",
      { status: 200 },
    )));
    try {
      await requestPayAppPayment({
        userId: "gyeol-seller",
        orderId: "ia0123456789",
        productCode: "pro_30d",
        orderName: "상세 리딩",
        amount: 9_600,
        customerPhone: "01012345678",
        openPayTypes: "card",
        feedbackUrl: "https://gyeol.example/api/payments/payapp/feedback",
        returnUrl: "https://gyeol.example/api/payments/payapp/return",
      });
      throw new Error("expected the request to be rejected");
    } catch (cause) {
      expect(cause).toBeInstanceOf(PayAppApiError);
      expect((cause as PayAppApiError).code).toBe("INVALID_RESPONSE");
      expect((cause as PayAppApiError).providerMessage).toBe("등록되지 않은 판매자");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("explains a transport failure instead of leaving an empty message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    try {
      await requestPayAppPayment({
        userId: "gyeol-seller",
        orderId: "ia0123456789",
        productCode: "pro_30d",
        orderName: "상세 리딩",
        amount: 9_600,
        customerPhone: "01012345678",
        openPayTypes: "card",
        feedbackUrl: "https://gyeol.example/api/payments/payapp/feedback",
        returnUrl: "https://gyeol.example/api/payments/payapp/return",
      });
      throw new Error("expected the request to be rejected");
    } catch (cause) {
      expect((cause as PayAppApiError).code).toBe("REQUEST_FAILED");
      expect((cause as PayAppApiError).providerMessage).not.toBe("");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
