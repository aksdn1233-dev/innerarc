import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import { buildContentSecurityPolicy, buildSecurityHeaders } from "@/core/security";

describe("security and install metadata", () => {
  it("locks the production browser boundary to required first-party capabilities", () => {
    const policy = buildContentSecurityPolicy("production", true);
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("connect-src 'self'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("upgrade-insecure-requests");
    expect(policy).not.toContain("https:");
    expect(policy).not.toContain("*");
    expect(policy).not.toContain("'unsafe-eval'");
  });

  it("allows development evaluation without weakening production", () => {
    expect(buildContentSecurityPolicy("development")).toContain("'unsafe-eval'");
    expect(buildContentSecurityPolicy("test")).not.toContain("'unsafe-eval'");
  });

  it("sets clickjacking, sniffing, capability, referrer, and transport controls", () => {
    const headers = Object.fromEntries(buildSecurityHeaders("production", true).map(({ key, value }) => [key, value]));
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Cross-Origin-Opener-Policy"]).toBe("same-origin");
    expect(headers["Cross-Origin-Resource-Policy"]).toBe("same-origin");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
    expect(headers["Permissions-Policy"]).toContain("payment=()");
    expect(headers["Strict-Transport-Security"]).toContain("max-age=63072000");
    expect(buildSecurityHeaders("development").some(({ key }) => key === "Strict-Transport-Security")).toBe(false);
    expect(buildSecurityHeaders("production").some(({ key }) => key === "Strict-Transport-Security")).toBe(false);
    expect(buildContentSecurityPolicy("production")).not.toContain("upgrade-insecure-requests");
  });

  it("declares install metadata without offline background capabilities", () => {
    const value = manifest();
    expect(value.start_url).toBe("/ko");
    expect(value.display).toBe("standalone");
    expect(value.icons).toHaveLength(2);
    expect(value).not.toHaveProperty("share_target");
    expect(value).not.toHaveProperty("protocol_handlers");
  });
});
