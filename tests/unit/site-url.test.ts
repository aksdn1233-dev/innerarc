import { describe, expect, it } from "vitest";
import { resolvePublicAppUrl } from "@/core/site-url";

describe("public application URL", () => {
  it("uses a stable loopback origin when no deployment URL exists", () => {
    expect(resolvePublicAppUrl(undefined).href).toBe("http://localhost:3000/");
    expect(resolvePublicAppUrl(" http://127.0.0.1:3000 ").href).toBe("http://127.0.0.1:3000/");
  });

  it("accepts a path-free HTTPS production origin", () => {
    expect(resolvePublicAppUrl("https://app.example.com").href).toBe("https://app.example.com/");
  });

  it.each([
    "not-a-url",
    "ftp://app.example.com",
    "http://app.example.com",
    "https://user:pass@app.example.com",
    "https://app.example.com/path",
    "https://app.example.com?campaign=private",
    "https://app.example.com#preview",
  ])("rejects unsafe or ambiguous deployment base %s", (value) => {
    expect(() => resolvePublicAppUrl(value)).toThrow(/NEXT_PUBLIC_APP_URL/);
  });
});

