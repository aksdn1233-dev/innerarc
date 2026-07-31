import { afterEach, describe, expect, it, vi } from "vitest";

// The guarantee under test: a configuration mistake or a database that is behind the
// code degrades into a readable answer, never into an exception that takes a visitor's
// page down with it.

const resolveSupabaseAdminClient = vi.fn();
vi.mock("@/lib/supabase/admin", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase/admin")>(
    "@/lib/supabase/admin",
  );
  return {
    ...actual,
    resolveSupabaseAdminClient: () => resolveSupabaseAdminClient(),
  };
});

const { GET } = await import("@/app/api/health/route");
// Imported past the mock above, which only exists so the health route can be driven.
const { resolveSupabaseAdminClient: realResolve, getSupabaseAdminClient } =
  await vi.importActual<typeof import("@/lib/supabase/admin")>("@/lib/supabase/admin");

const HALF_CONFIGURED = {
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"a".repeat(32)}`,
};

describe("supabase admin client resolution", () => {
  it("throws on a half-configured deployment through the strict entry point", () => {
    expect(() => getSupabaseAdminClient(HALF_CONFIGURED)).toThrow();
  });

  it("reports the same mistake as a reason instead of an exception", () => {
    expect(realResolve(HALF_CONFIGURED)).toEqual({ client: null, reason: "MISCONFIGURED" });
    expect(realResolve({})).toEqual({ client: null, reason: "NOT_CONFIGURED" });
  });
});

describe("health endpoint", () => {
  const originalEnvironment = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnvironment };
    vi.clearAllMocks();
  });

  it("answers 200 with a degraded body rather than failing the request", async () => {
    resolveSupabaseAdminClient.mockReturnValue({ client: null, reason: "NOT_CONFIGURED" });
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("degraded");
    expect(body.database).toBe("not_configured");
    expect(body.payments).toBe("closed");
  });

  it("flags an unusable public app URL without throwing", async () => {
    resolveSupabaseAdminClient.mockReturnValue({ client: null, reason: "NOT_CONFIGURED" });
    process.env.NEXT_PUBLIC_APP_URL = "not a url";
    const body = await (await GET()).json();
    expect(body.site).toBe("misconfigured");
  });

  it("reports an open storefront when every condition holds", async () => {
    const gateRow = {
      sales_enabled: true,
      payments_launch_approved: true,
      payments_launch_approved_at: "2026-07-31T00:00:00.000Z",
    };
    resolveSupabaseAdminClient.mockReturnValue({
      client: {
        from: () => {
          const query = {
            select: () => query,
            eq: () => query,
            maybeSingle: async () => ({ data: gateRow, error: null }),
          };
          return query;
        },
      },
      reason: null,
    });
    Object.assign(process.env, {
      NEXT_PUBLIC_APP_URL: "https://gyeol.example",
      PAYMENTS_PROVIDER: "payapp",
      PAYAPP_USER_ID: "gyeol-seller",
      PAYAPP_LINK_KEY: "link-key-secret",
      PAYAPP_LINK_VALUE: "link-value-secret",
    });

    const body = await (await GET()).json();
    expect(body.database).toBe("ok");
    expect(body.payments).toBe("open");
    expect(body.status).toBe("ok");
  });

  it("never reports a secret or a business figure", async () => {
    resolveSupabaseAdminClient.mockReturnValue({ client: null, reason: "NOT_CONFIGURED" });
    const body = await (await GET()).json();
    expect(Object.keys(body).sort()).toEqual([
      "checkedAt",
      "database",
      "durationMs",
      "payments",
      "site",
      "status",
    ]);
  });
});
