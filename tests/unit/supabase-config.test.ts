import { describe, expect, it } from "vitest";
import {
  getSupabasePublicConfig,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

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
});
