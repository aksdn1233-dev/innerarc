import { expect, test } from "@playwright/test";
import { E2E_ORIGIN } from "./test-origin";

const DEFAULT_TRANSFER_BUDGET = 450_000;
const DEFAULT_DECODED_BUDGET = 1_200_000;

/**
 * The home page carries the 태율 hero clip — currently 681 KB of MP4 — plus its poster,
 * which no other route downloads. It is deliberately excluded from render-blocking — `preload="none"`, fetched
 * on idle — but it is still bytes a visitor pays for, so it is written into the budget
 * rather than hidden from it by delaying the fetch past when the test stops measuring.
 * Every other route keeps the original, tighter allowance.
 */
const routes = [
  // Measured: ~385 KB of page + ~681 KB clip + ~80 KB poster. The allowance is set a
  // little above that so a re-encode does not fail the build for a few kilobytes, and
  // low enough that the clip growing by half would still be caught.
  { path: "/en", transfer: 1_400_000, decoded: 2_200_000 },
  { path: "/en/question" },
  { path: "/en/relationship" },
  { path: "/en/compatibility" },
  { path: "/en/celebrity" },
  { path: "/en/reality-check" },
  { path: "/en/shop" },
] as const satisfies readonly { path: string; transfer?: number; decoded?: number }[];

for (const entry of routes) {
  const route = entry.path;
  const transferBudget = "transfer" in entry ? entry.transfer : DEFAULT_TRANSFER_BUDGET;
  const decodedBudget = "decoded" in entry ? entry.decoded : DEFAULT_DECODED_BUDGET;

  test(`${route} stays first-party and within the initial payload budget`, async ({ page, request }) => {
    const response = await request.get(route);
    expect(response.ok()).toBe(true);
    expect((await response.body()).byteLength).toBeLessThan(250_000);

    const unexpectedOrigins = new Set<string>();
    page.on("request", (requestEvent) => {
      const url = new URL(requestEvent.url());
      if (url.origin !== E2E_ORIGIN) unexpectedOrigins.add(url.origin);
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
    expect(metrics.totalTransferBytes).toBeLessThan(transferBudget);
    expect(metrics.totalDecodedBytes).toBeLessThan(decodedBudget);
  });
}
