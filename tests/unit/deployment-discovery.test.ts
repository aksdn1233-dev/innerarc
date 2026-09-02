import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("production discovery deployment", () => {
  it("compiles and verifies public discovery documents against the production origin", async () => {
    const workflow = await readFile(".github/workflows/deploy.yml", "utf8");
    const viteConfig = await readFile("vite.config.ts", "utf8");

    expect(workflow).toContain("NEXT_PUBLIC_APP_URL: https://mygyeol.kr");
    expect(workflow).toContain("https://mygyeol.kr/sitemap.xml");
    expect(workflow).toContain("the sitemap does not use the production origin");
    expect(workflow).toContain("the production sitemap contains a loopback origin");
    expect(viteConfig).toContain('vars: { NEXT_PUBLIC_APP_URL: "https://mygyeol.kr" }');
  });

  it("declares both Worker bindings the image route needs", async () => {
    const viteConfig = await readFile("vite.config.ts", "utf8");
    // A deploy replaces the Worker's bindings with whatever this config declares.
    // `worker/index.ts` reads env.IMAGES *and* env.ASSETS, and falls back to a 307 to
    // the unoptimized original if either is missing — which is what the live site did
    // until 2026-09-02, because only the images binding was named here.
    expect(viteConfig).toContain('images: { binding: "IMAGES" }');
    expect(viteConfig).toContain('assets: { binding: "ASSETS" }');
  });
});
