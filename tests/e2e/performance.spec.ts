import { expect, test } from "@playwright/test";
import { E2E_ORIGIN } from "./test-origin";

const DEFAULT_TRANSFER_BUDGET = 450_000;
const DEFAULT_DECODED_BUDGET = 1_200_000;
const DEFAULT_CSS_DECODED_BUDGET = 197_000;

/**
 * The home page carries the 태율 hero clip, its iOS animated fallback, audio, and poster,
 * which no other route downloads. The browser selects playback behavior at runtime, so
 * the initial-page budget records the full current transfer instead of hiding media bytes.
 * Every other route keeps the original, tighter allowance.
 */
const routes = [
  // Measured at 3.59–3.61 MB with the 2.1 MB iOS fallback and 942 KB MP4 represented.
  // The allowance remains narrow enough that another large media asset cannot slip in.
  { path: "/en", transfer: 4_000_000, decoded: 4_500_000 },
  { path: "/en/question" },
  { path: "/en/relationship" },
  { path: "/en/compatibility" },
  { path: "/en/celebrity" },
  { path: "/en/reality-check" },
  { path: "/en/shop" },
  // The Saju hub intentionally exposes all six supplied guide cuts and its route-scoped
  // editorial stylesheet. Measured at 49 resources and 195.4 KB decoded CSS.
  { path: "/en/fortune", resources: 52, cssDecoded: 202_000 },
  { path: "/en/saju" },
] as const satisfies readonly { path: string; transfer?: number; decoded?: number; resources?: number; cssDecoded?: number }[];

for (const entry of routes) {
  const route = entry.path;
  const transferBudget = "transfer" in entry ? entry.transfer : DEFAULT_TRANSFER_BUDGET;
  const decodedBudget = "decoded" in entry ? entry.decoded : DEFAULT_DECODED_BUDGET;
  const resourceBudget = "resources" in entry ? entry.resources : 40;
  const cssDecodedBudget = "cssDecoded" in entry ? entry.cssDecoded : DEFAULT_CSS_DECODED_BUDGET;

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
    expect(metrics.resourceCount).toBeLessThanOrEqual(resourceBudget);
    expect(metrics.jsTransferBytes).toBeLessThan(350_000);
    expect(metrics.jsDecodedBytes).toBeLessThan(1_050_000);
    // The shared stylesheet now includes the intake, Four Pillars table, character-led
    // reports, 24-item concept catalog, expanded retention survey, bounded event chrome,
    // and the P0 provenance notice / Pattern Intelligence controls. Measured below 196 KB;
    // this narrow allowance
    // still prevents another global screen from being absorbed without an explicit decision.
    expect(metrics.cssDecodedBytes).toBeLessThan(cssDecodedBudget);
    expect(metrics.totalTransferBytes).toBeLessThan(transferBudget);
    expect(metrics.totalDecodedBytes).toBeLessThan(decodedBudget);
  });
}
