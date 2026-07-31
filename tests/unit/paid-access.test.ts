import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const requireSupabaseUser = vi.fn();
const getSupabaseAdminClient = vi.fn();
const cookieValue = vi.fn<() => string | undefined>();

vi.mock("@/lib/supabase/auth", () => ({
  requireSupabaseUser: () => requireSupabaseUser(),
}));
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: () => getSupabaseAdminClient(),
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => ({ value: cookieValue() }) }),
}));

const { hasPaidFeatureAccess } = await import("@/server/paid-access");

function adminReturning(
  row: { tier: string; valid_until: string } | null,
  orderStatus: string = "DONE",
) {
  const entitlementQuery = {
    select: () => entitlementQuery,
    eq: () => entitlementQuery,
    gt: () => entitlementQuery,
    maybeSingle: async () => ({ data: row, error: null }),
  };
  const orderQuery = {
    select: () => orderQuery,
    eq: () => orderQuery,
    gt: () => orderQuery,
    maybeSingle: async () => ({ data: { status: orderStatus }, error: null }),
  };
  return {
    from: (table: string) => table === "payment_orders" ? orderQuery : entitlementQuery,
  };
}

const FUTURE = new Date(Date.now() + 86_400_000).toISOString();

beforeEach(() => {
  requireSupabaseUser.mockResolvedValue({ user: { id: "user-1" } });
  cookieValue.mockReturnValue(undefined);
});

afterEach(() => vi.clearAllMocks());

describe("paid feature access", () => {
  it("keeps a historical Core reading out of pro-tier features", async () => {
    getSupabaseAdminClient.mockReturnValue(adminReturning({ tier: "plus", valid_until: FUTURE }));

    expect(await hasPaidFeatureAccess("plus")).toBe(true);
    expect(await hasPaidFeatureAccess("pro")).toBe(false);
  });

  it("lets current Detailed and Premium readings reach every tier", async () => {
    getSupabaseAdminClient.mockReturnValue(adminReturning({ tier: "pro", valid_until: FUTURE }));

    expect(await hasPaidFeatureAccess("plus")).toBe(true);
    expect(await hasPaidFeatureAccess("pro")).toBe(true);
  });

  it("denies access without an entitlement, a session, or a database", async () => {
    getSupabaseAdminClient.mockReturnValue(adminReturning(null));
    expect(await hasPaidFeatureAccess("plus")).toBe(false);

    requireSupabaseUser.mockResolvedValue({ user: null });
    expect(await hasPaidFeatureAccess("plus")).toBe(false);

    requireSupabaseUser.mockResolvedValue({ user: { id: "user-1" } });
    getSupabaseAdminClient.mockReturnValue(null);
    expect(await hasPaidFeatureAccess("plus")).toBe(false);
  });

  it("fails closed on an unrecognized tier instead of assuming the highest", async () => {
    getSupabaseAdminClient.mockReturnValue(adminReturning({ tier: "legacy", valid_until: FUTURE }));
    expect(await hasPaidFeatureAccess("plus")).toBe(false);
  });

  it("accepts an order pass from a guest with no account at all", async () => {
    // Purchases are one-off, so the usual proof is the buyer's own paid order.
    const { issueOrderPass } = await import("@/server/order-pass");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_test_key_for_signing_0001");
    const pass = issueOrderPass({
      orderId: "ia0123456789abcdef",
      tier: "pro",
      now: new Date(),
    });
    cookieValue.mockReturnValue(pass ?? undefined);
    requireSupabaseUser.mockResolvedValue({ user: null });
    getSupabaseAdminClient.mockReturnValue(adminReturning(null, "DONE"));

    expect(await hasPaidFeatureAccess("pro")).toBe(true);
    vi.unstubAllEnvs();
  });

  it("stops honouring a pass once its order is refunded", async () => {
    // The pass is valid for thirty days but a refund can happen on day two. Its
    // signature proves who issued it, not that the order is still paid.
    const { issueOrderPass } = await import("@/server/order-pass");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_test_key_for_signing_0001");
    cookieValue.mockReturnValue(issueOrderPass({
      orderId: "ia0123456789abcdef",
      tier: "pro",
      now: new Date(),
    }) ?? undefined);
    requireSupabaseUser.mockResolvedValue({ user: null });

    for (const status of ["CANCELED", "PARTIAL_CANCELED", "READY", "EXPIRED"]) {
      getSupabaseAdminClient.mockReturnValue(adminReturning(null, status));
      expect(await hasPaidFeatureAccess("pro"), `${status} still granted access`)
        .toBe(false);
    }
    vi.unstubAllEnvs();
  });

  it("does not let a plus order pass reach pro features", async () => {
    const { issueOrderPass } = await import("@/server/order-pass");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_test_key_for_signing_0001");
    cookieValue.mockReturnValue(issueOrderPass({
      orderId: "ia0123456789abcdef",
      tier: "plus",
      now: new Date(),
    }) ?? undefined);
    requireSupabaseUser.mockResolvedValue({ user: null });
    getSupabaseAdminClient.mockReturnValue(adminReturning(null, "DONE"));

    expect(await hasPaidFeatureAccess("plus")).toBe(true);
    expect(await hasPaidFeatureAccess("pro")).toBe(false);
    vi.unstubAllEnvs();
  });

  it("does not erase the deterministic Free routes after a failed payment", async () => {
    const routes = ["question", "relationship", "reality-check", "celebrity", "compatibility"];
    for (const route of routes) {
      const page = await readFile(`src/app/[locale]/${route}/page.tsx`, "utf8");
      expect(page, route).not.toContain("hasPaidFeatureAccess");
    }
  });
});
