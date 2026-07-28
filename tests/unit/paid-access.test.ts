import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const requireSupabaseUser = vi.fn();
const getSupabaseAdminClient = vi.fn();

vi.mock("@/lib/supabase/auth", () => ({
  requireSupabaseUser: () => requireSupabaseUser(),
}));
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: () => getSupabaseAdminClient(),
}));

const { hasPaidFeatureAccess } = await import("@/server/paid-access");

function adminReturning(row: { tier: string; valid_until: string } | null) {
  const query = {
    select: () => query,
    eq: () => query,
    gt: () => query,
    maybeSingle: async () => ({ data: row, error: null }),
  };
  return { from: () => query };
}

const FUTURE = new Date(Date.now() + 86_400_000).toISOString();

beforeEach(() => {
  requireSupabaseUser.mockResolvedValue({ user: { id: "user-1" } });
});

afterEach(() => vi.clearAllMocks());

describe("paid feature access", () => {
  it("keeps the 19,000 KRW reading out of pro-tier features", async () => {
    getSupabaseAdminClient.mockReturnValue(adminReturning({ tier: "plus", valid_until: FUTURE }));

    expect(await hasPaidFeatureAccess("plus")).toBe(true);
    expect(await hasPaidFeatureAccess("pro")).toBe(false);
  });

  it("lets the 39,000 and 79,000 KRW readings reach every tier", async () => {
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

  it("requires the pro tier on the two-person compatibility route", async () => {
    const page = await readFile("src/app/[locale]/compatibility/page.tsx", "utf8");
    expect(page).toContain('hasPaidFeatureAccess("pro")');
  });
});
