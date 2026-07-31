import { describe, expect, it } from "vitest";
import {
  getSupabasePublicConfig,
  isPublishableSupabaseKey,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

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
