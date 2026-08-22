import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isPrivatePath, robotsTagFor } from "@/core/security/headers";
import { crossOriginRefused, isSameOriginRequest } from "@/server/same-origin";
import {
  createImageSitemapXml,
  createRobotsDocument,
  createSitemapDocument,
} from "@/core/site-documents";

function post(headers: Record<string, string>): Request {
  return new Request("https://gyeol.example/api/admin/settings", {
    method: "POST",
    headers,
  });
}

describe("cross-site request refusal", () => {
  it("accepts a request the site itself made", () => {
    expect(isSameOriginRequest(post({ origin: "https://gyeol.example" }))).toBe(true);
    expect(isSameOriginRequest(post({ referer: "https://gyeol.example/ko/admin" }))).toBe(true);
  });

  it("refuses a request another site made with the operator's session", () => {
    // The browser sends the session cookie either way; the origin is what differs.
    expect(isSameOriginRequest(post({ origin: "https://evil.example" }))).toBe(false);
    expect(isSameOriginRequest(post({ referer: "https://evil.example/trap" }))).toBe(false);
  });

  it("is not fooled by an origin that merely looks similar", () => {
    for (const origin of [
      "https://gyeol.example.evil.com",
      "http://gyeol.example",
      "https://gyeol.example:8443",
      "null",
      "not-a-url",
    ]) {
      expect(isSameOriginRequest(post({ origin })), `${origin} was accepted`).toBe(false);
    }
  });

  it("refuses a request that declares no origin at all", () => {
    expect(isSameOriginRequest(post({}))).toBe(false);
  });

  it("answers a refusal without saying anything about the target", async () => {
    const response = crossOriginRefused();
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "CROSS_ORIGIN_REQUEST" });
  });

  it("guards every browser-facing state-changing route", async () => {
    // The payment provider's own callbacks are excluded on purpose: they are server to
    // server with no origin, and the return redirect comes from the provider's domain.
    const unguarded: string[] = [];
    async function scan(directory: string) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
          await scan(path);
          continue;
        }
        if (entry.name !== "route.ts") continue;
        const posix = path.replaceAll("\\", "/");
        if (posix.includes("/payments/payapp/")) continue;
        if (posix.includes("/payments/portone/")) continue;
        if (posix.includes("/payments/toss/")) continue;
        const source = await readFile(path, "utf8");
        const mutates = /export async function (POST|PUT|PATCH|DELETE)\b/.test(source);
        if (mutates && !source.includes("isSameOriginRequest(request)")) {
          unguarded.push(posix);
        }
      }
    }
    await scan("src/app/api");

    expect(unguarded).toEqual([]);
  }, 30_000);
});

describe("keeping private pages out of indexes", () => {
  it("marks purchased readings, order lookup, and the console as private", () => {
    for (const path of [
      "/ko/reports/ia0123456789abcdef",
      "/en/reports/ia0123456789abcdef",
      "/ko/admin",
      "/ko/admin/login",
      "/ko/orders",
      "/ko/me",
      "/ko/payments/payapp-return",
      "/api/payments/orders",
      "/auth/callback",
    ]) {
      expect(isPrivatePath(path), `${path} was treated as public`).toBe(true);
      expect(robotsTagFor(path)).toContain("noindex");
    }
  });

  it("leaves the pages customers must be able to find alone", () => {
    for (const path of ["/ko", "/en", "/ko/plans", "/ko/support", "/ko/privacy", "/ko/terms"]) {
      expect(isPrivatePath(path), `${path} was hidden from search`).toBe(false);
      expect(robotsTagFor(path)).toBeNull();
    }
  });
});

describe("robots.txt", () => {
  const rules = createRobotsDocument().rules as {
    userAgent?: string;
    disallow?: string | string[];
  }[];

  it("refuses the crawlers that collect pages for models", () => {
    const refused = new Set(
      rules.filter((rule) => rule.disallow === "/").map((rule) => rule.userAgent),
    );
    for (const agent of ["GPTBot", "ClaudeBot", "Google-Extended", "PerplexityBot", "CCBot", "Bytespider"]) {
      expect(refused.has(agent), `${agent} is not refused`).toBe(true);
    }
  });

  it("still lets search engines reach the pages that sell", () => {
    // Customers arrive through search, so the catch-all rule must not block the site.
    const catchAll = rules.find((rule) => rule.userAgent === "*");
    expect(catchAll).toBeDefined();
    expect(catchAll?.disallow).not.toBe("/");
    expect(catchAll?.disallow).toEqual(expect.arrayContaining(["/ko/reports/", "/ko/admin"]));
  });

  it("publishes both page and image sitemap locations", () => {
    const sitemap = createRobotsDocument({ NEXT_PUBLIC_APP_URL: "https://gyeol.example" }).sitemap;
    expect(sitemap).toEqual([
      "https://gyeol.example/sitemap.xml",
      "https://gyeol.example/image-sitemap.xml",
    ]);
  });
});

describe("search discovery documents", () => {
  const environment = { NEXT_PUBLIC_APP_URL: "https://gyeol.example" };

  it("includes the public Saju route and excludes private result routes", () => {
    const urls = createSitemapDocument(environment).map(({ url }) => url);
    expect(urls).toContain("https://gyeol.example/ko/saju");
    expect(urls).toContain("https://gyeol.example/en/saju");
    expect(urls.some((url) => url.includes("/reports/"))).toBe(false);
  });

  it("maps each localized product page to first-party concept imagery", () => {
    const xml = createImageSitemapXml(environment);
    expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
    expect(xml).toContain("https://gyeol.example/ko/shop/wood-leaf-pendant");
    expect(xml).toContain("https://gyeol.example/images/accessory-shop/details/saju-wood.jpg");
    expect(xml).not.toMatch(/https:\/\/(?!gyeol\.example)/);
  });
});
