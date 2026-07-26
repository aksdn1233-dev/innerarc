import { expect, test } from "@playwright/test";

const routes = [
  "/en",
  "/en/question",
  "/en/relationship",
  "/en/compatibility",
  "/en/celebrity",
  "/en/reality-check",
  "/en/shop",
] as const;

for (const route of routes) {
  test(`${route} stays first-party and within the initial payload budget`, async ({ page, request }) => {
    const response = await request.get(route);
    expect(response.ok()).toBe(true);
    expect((await response.body()).byteLength).toBeLessThan(250_000);

    const unexpectedOrigins = new Set<string>();
    page.on("request", (requestEvent) => {
      const url = new URL(requestEvent.url());
      if (url.origin !== "http://127.0.0.1:3000") unexpectedOrigins.add(url.origin);
    });
    await page.goto(route, { waitUntil: "networkidle" });
    const metrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const matching = (suffix: string) => resources
        .filter(({ name }) => new URL(name).pathname.endsWith(suffix));
      return {
        resourceCount: resources.length,
        jsDecodedBytes: matching(".js").reduce((sum, resource) => sum + resource.decodedBodySize, 0),
        jsTransferBytes: matching(".js").reduce((sum, resource) => sum + resource.transferSize, 0),
        cssDecodedBytes: matching(".css").reduce((sum, resource) => sum + resource.decodedBodySize, 0),
        totalDecodedBytes: resources.reduce((sum, resource) => sum + resource.decodedBodySize, 0),
        totalTransferBytes: resources.reduce((sum, resource) => sum + resource.transferSize, 0),
      };
    });
    expect([...unexpectedOrigins]).toEqual([]);
    expect(metrics.resourceCount).toBeLessThan(40);
    expect(metrics.jsTransferBytes).toBeLessThan(350_000);
    expect(metrics.jsDecodedBytes).toBeLessThan(1_050_000);
    expect(metrics.cssDecodedBytes).toBeLessThan(120_000);
    expect(metrics.totalTransferBytes).toBeLessThan(450_000);
    expect(metrics.totalDecodedBytes).toBeLessThan(1_200_000);
  });
}
