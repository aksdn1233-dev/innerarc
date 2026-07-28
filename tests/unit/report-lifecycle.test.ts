import { describe, expect, it, vi } from "vitest";
import { finalizePaidReport } from "@/server/reports/paid-report";

// Failure modes that only appear with real traffic: a provider retrying a callback it
// never saw succeed, and two callbacks for the same order arriving together.
type Row = { input: unknown; status: string };

const validInput = {
  version: 1,
  locale: "ko",
  productCode: "plus_30d",
  birthDate: "1990-03-15",
  name: "테스트",
  focusId: "work",
  concern: "테스트 고민입니다.",
  createdAt: "2026-07-28T10:00:00.000Z",
};

function adminFor(row: Row | null, updates: Record<string, unknown>[]) {
  const select = {
    select: () => select,
    eq: () => select,
    is: () => select,
    maybeSingle: async () => ({ data: row, error: null }),
  };
  return {
    from: () => ({
      select: select.select,
      update(values: Record<string, unknown>) {
        const chain: Record<string, unknown> = {};
        // Records only writes that survived every filter the caller attached.
        const guard = { statusFilter: null as string | null };
        const api = {
          eq(column: string, value: string) {
            if (column === "status") guard.statusFilter = value;
            return api;
          },
          is: () => api,
          then(resolve: (result: { error: null }) => void) {
            if (guard.statusFilter === null || guard.statusFilter === row?.status) {
              updates.push(values);
            }
            resolve({ error: null });
          },
        };
        Object.assign(chain, api);
        return api;
      },
    }),
  };
}

describe("paid report lifecycle", () => {
  it("does not reopen a revoked report when a late callback arrives", async () => {
    // The provider retries any callback it did not see accepted. That retry can land
    // after a refund, and reviving the report would hand back what was paid back.
    const updates: Record<string, unknown>[] = [];
    const admin = adminFor({ input: validInput, status: "revoked" }, updates);

    await finalizePaidReport(admin as never, null, "iarevoked12345");

    expect(updates).toHaveLength(0);
  });

  it("leaves a failed report for a human instead of silently rebuilding it", async () => {
    const updates: Record<string, unknown>[] = [];
    const admin = adminFor({ input: validInput, status: "failed" }, updates);

    await finalizePaidReport(admin as never, null, "iafailed123456");

    expect(updates).toHaveLength(0);
  });

  it("is a no-op once the report is already readable", async () => {
    const updates: Record<string, unknown>[] = [];
    const admin = adminFor({ input: validInput, status: "ready" }, updates);

    await finalizePaidReport(admin as never, null, "iaready1234567");

    expect(updates).toHaveLength(0);
  });

  it("builds the report exactly once from a draft awaiting payment", async () => {
    const updates: Record<string, unknown>[] = [];
    const admin = adminFor({ input: validInput, status: "pending_payment" }, updates);

    await finalizePaidReport(admin as never, null, "iapending12345");

    expect(updates).toHaveLength(1);
    expect(updates[0]).toMatchObject({ status: "ready" });
  });

  it("guards the write on the draft state so a second writer changes nothing", async () => {
    // Two callbacks can both read pending_payment before either writes; the update is
    // conditional on that state so only one of them takes effect.
    const updates: Record<string, unknown>[] = [];
    const row: Row = { input: validInput, status: "pending_payment" };
    const admin = adminFor(row, updates);

    await finalizePaidReport(admin as never, null, "iarace12345678");
    row.status = "ready";
    await finalizePaidReport(admin as never, null, "iarace12345678");

    expect(updates).toHaveLength(1);
  });

  it("surfaces a missing draft rather than failing quietly", async () => {
    const admin = adminFor(null, []);
    await expect(finalizePaidReport(admin as never, null, "iamissing12345"))
      .rejects.toThrow();
  });
});

describe("request limit", () => {
  // Counted in the database, because consecutive requests can be served by different
  // worker isolates and an in-memory counter simply does not see them.
  function countingAdmin(count: number | null) {
    const query = {
      select: () => query,
      eq: () => query,
      gte: async () => ({ count, error: count === null ? new Error("down") : null }),
    };
    return { from: () => query } as never;
  }

  const NOW = new Date("2026-07-28T00:00:00.000Z");

  it("refuses further checkouts once one phone number has used its allowance", async () => {
    const { checkCheckoutLimit } = await import("@/server/request-limit");

    expect((await checkCheckoutLimit(countingAdmin(4), "a".repeat(64), NOW)).allowed).toBe(true);
    const refused = await checkCheckoutLimit(countingAdmin(5), "a".repeat(64), NOW);
    expect(refused.allowed).toBe(false);
    if (!refused.allowed) expect(refused.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("refuses further inquiries from one contact once it has used its allowance", async () => {
    const { checkInquiryLimit } = await import("@/server/request-limit");

    expect((await checkInquiryLimit(countingAdmin(1), "a@b.com", NOW)).allowed).toBe(true);
    expect((await checkInquiryLimit(countingAdmin(9), "a@b.com", NOW)).allowed).toBe(false);
  });

  it("lets a purchase through when the count cannot be read", async () => {
    // A database hiccup must never stop a paying customer from buying.
    const { checkCheckoutLimit } = await import("@/server/request-limit");
    expect((await checkCheckoutLimit(countingAdmin(null), "a".repeat(64), NOW)).allowed)
      .toBe(true);
  });

  it("does not limit a checkout that carries no phone number", async () => {
    const { checkCheckoutLimit } = await import("@/server/request-limit");
    expect((await checkCheckoutLimit(countingAdmin(99), null, NOW)).allowed).toBe(true);
  });
});

vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdminClient: () => null }));
