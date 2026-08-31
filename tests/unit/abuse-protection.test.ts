import { describe, expect, it } from "vitest";
import { pseudonymousSecurityRef, summarizeUserAgent } from "@/server/abuse-protection";

describe("minimal abuse telemetry", () => {
  it("fails to create persistent references without a server secret", () => {
    expect(pseudonymousSecurityRef("ip", "203.0.113.1", {})).toBeNull();
  });

  it("creates scoped pseudonymous references without retaining the raw value", () => {
    const environment = { ABUSE_HASH_SECRET: "a".repeat(32) };
    const account = pseudonymousSecurityRef("account", "owner@example.com", environment)!;
    const ip = pseudonymousSecurityRef("ip", "203.0.113.1", environment)!;
    expect(account).toMatch(/^account_[a-f0-9]{32}$/);
    expect(ip).toMatch(/^ip_[a-f0-9]{32}$/);
    expect(account).not.toContain("owner@example.com");
    expect(ip).not.toContain("203.0.113.1");
    expect(account).not.toBe(ip);
  });

  it("bounds and strips control characters from user-agent summaries", () => {
    const summary = summarizeUserAgent(`Browser\u0000 ${"x".repeat(300)}`);
    expect(summary.length).toBeLessThanOrEqual(160);
    expect(summary).not.toContain("\u0000");
  });
});
