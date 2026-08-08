import { describe, expect, it, vi } from "vitest";
import {
  getSupabasePublicConfig,
  isPublishableSupabaseKey,
  isSecretSupabaseKey,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import { getSupabaseAdminClient, resolveSupabaseAdminClient } from "@/lib/supabase/admin";

/** A legacy Supabase browser key: an unsigned-in-practice JWT carrying a role claim. */
function legacyKey(role: string): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
  return [
    encode({ alg: "HS256", typ: "JWT" }),
    encode({ iss: "supabase", ref: "example-ref", role, iat: 1_700_000_000 }),
    "c".repeat(43),
  ].join(".");
}

describe("Supabase public configuration", () => {
  it("stays disabled when both public values are absent", () => {
    expect(getSupabasePublicConfig({})).toBeNull();
    expect(isSupabaseConfigured({})).toBe(false);
  });

  it("accepts a path-free Supabase HTTPS origin and publishable key", () => {
    const environment = {
      NEXT_PUBLIC_SUPABASE_URL: "https://example-ref.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"a".repeat(32)}`,
    };
    expect(getSupabasePublicConfig(environment)).toEqual({
      url: "https://example-ref.supabase.co",
      publishableKey: environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    });
  });

  it("rejects partial, secret-like, non-Supabase, and path-bearing values", () => {
    expect(() => getSupabasePublicConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example-ref.supabase.co",
    })).toThrow();
    expect(() => getSupabasePublicConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example-ref.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "service-role-secret",
    })).toThrow();
    expect(() => getSupabasePublicConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.com",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"a".repeat(32)}`,
    })).toThrow();
    expect(() => getSupabasePublicConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example-ref.supabase.co/rest",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"a".repeat(32)}`,
    })).toThrow();
  });

  // Rejecting the legacy shape aborted next.config.ts evaluation, which fails the
  // entire build — so a project holding the anon key most Supabase projects still use
  // could never deploy at all.
  it("accepts the legacy anon key that existing projects still hold", () => {
    const anonKey = legacyKey("anon");
    expect(isPublishableSupabaseKey(anonKey)).toBe(true);
    expect(getSupabasePublicConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example-ref.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: anonKey,
    })).toEqual({
      url: "https://example-ref.supabase.co",
      publishableKey: anonKey,
    });
  });

  it("still refuses a secret in a browser-public variable", () => {
    // The point of the check is to stop a secret being published, so a service-role
    // token is refused for its role rather than for being a JWT.
    expect(isPublishableSupabaseKey(legacyKey("service_role"))).toBe(false);
    expect(isPublishableSupabaseKey(`sb_secret_${"a".repeat(32)}`)).toBe(false);
    expect(isPublishableSupabaseKey(legacyKey("authenticated"))).toBe(false);
    expect(() => getSupabasePublicConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example-ref.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: legacyKey("service_role"),
    })).toThrow(/service-role/);
  });

  it("refuses malformed tokens that are not keys at all", () => {
    expect(isPublishableSupabaseKey("short")).toBe(false);
    expect(isPublishableSupabaseKey("a".repeat(64))).toBe(false);
    expect(isPublishableSupabaseKey(`${"a".repeat(20)}.not-base64-json.${"c".repeat(20)}`))
      .toBe(false);
    expect(isPublishableSupabaseKey(`sb_publishable_${"a".repeat(400)}`)).toBe(false);
  });
});

// The service-role key carried the identical too-narrow format check, so a project
// holding legacy keys could not reach its database at all — every order write, the
// order-pass signature, and the administrator console depend on this client.
describe("Supabase service-role key", () => {
  const publicEnvironment = {
    NEXT_PUBLIC_SUPABASE_URL: "https://example-ref.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: legacyKey("anon"),
  };

  it("accepts both the current secret key and the legacy service_role key", () => {
    expect(isSecretSupabaseKey(`sb_secret_${"a".repeat(32)}`)).toBe(true);
    expect(isSecretSupabaseKey(legacyKey("service_role"))).toBe(true);
    expect(getSupabaseAdminClient({
      ...publicEnvironment,
      SUPABASE_SERVICE_ROLE_KEY: legacyKey("service_role"),
    })).not.toBeNull();
  });

  it("refuses a browser key in the service-role slot", () => {
    // Silently accepting one would not fail loudly — the client would read and write
    // as an anonymous visitor and surface later as orders that never save.
    expect(isSecretSupabaseKey(legacyKey("anon"))).toBe(false);
    expect(isSecretSupabaseKey(`sb_publishable_${"a".repeat(32)}`)).toBe(false);
    expect(resolveSupabaseAdminClient({
      ...publicEnvironment,
      SUPABASE_SERVICE_ROLE_KEY: legacyKey("anon"),
    })).toEqual({ client: null, reason: "MISCONFIGURED" });
  });

  it("stays off entirely when nothing is configured", () => {
    expect(getSupabaseAdminClient({})).toBeNull();
    expect(resolveSupabaseAdminClient({})).toEqual({
      client: null,
      reason: "NOT_CONFIGURED",
    });
  });

  it("reports a missing service-role key as a reason rather than throwing", () => {
    expect(resolveSupabaseAdminClient(publicEnvironment)).toEqual({
      client: null,
      reason: "MISCONFIGURED",
    });
  });
});

// A service-role key pasted into the browser-public variable is a real, correctable
// mistake — but getSupabasePublicConfig() throwing for it was reachable from
// middleware (every request) and getServerSupabaseClient() (nearly every page/route),
// so the mistake 500'd the entire site instead of only breaking login. Each caller now
// catches the throw itself; this pins the exact scenario that took production down.
describe("callers survive a malformed public key instead of crashing", () => {
  const secretInPublicSlot = {
    NEXT_PUBLIC_SUPABASE_URL: "https://example-ref.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: `sb_secret_${"a".repeat(32)}`,
  };

  it("still throws at the source, so the mistake is not silently accepted", () => {
    expect(() => getSupabasePublicConfig(secretInPublicSlot)).toThrow(/service-role/);
  });

  it("getServerSupabaseClient degrades to null instead of throwing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", secretInPublicSlot.NEXT_PUBLIC_SUPABASE_URL);
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      secretInPublicSlot.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
    try {
      const { getServerSupabaseClient } = await import("@/lib/supabase/server");
      await expect(getServerSupabaseClient()).resolves.toBeNull();
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
