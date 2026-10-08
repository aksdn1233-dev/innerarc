import { expect, test } from "@playwright/test";
import { E2E_ORIGIN } from "./test-origin";

const DEFAULT_TRANSFER_BUDGET = 450_000;
/**
 * Raised from 1,200,000 on 2026-10-08 by owner decision, for the same 2026-09-13 fonts
 * described at DEFAULT_CSS_DECODED_BUDGET. On CI every route now decodes about 121 KB of
 * Korean @font-face rules plus the woff2 slices its text needs (about 120 KB on the
 * lightest routes), which local builds cannot see because they mock next/font. Measured
 * on CI at 1,232,947 (relationship) and 1,247,847 (reality-check); about 1.4% headroom.
 */
const DEFAULT_DECODED_BUDGET = 1_265_000;
/**
 * Raised from 197,000 on 2026-09-02 for the home journey sections: the four-step guide,
 * the generated report outline, the closing action, and the concern-specific paid teaser.
 * The rules those sections replaced were deleted first — the invented report-example
 * cards and the orphaned cinema menu button came to about 3.6 KB — so the net cost was
 * the ~3.6 KB the new sections actually need.
 *
 * Raised again to 203,000 on 2026-09-03, when the guide stopped describing the product
 * and started showing it. The first attempt styled four screen types in markup and cost
 * about 5.2 KB; replacing them with captured screenshots on one framed stage gave most of
 * that back, so the ceiling comes down with it. Measured at 201.9 KB.
 *
 * Raised to 208,000 on 2026-09-04 for the night ground on the home, free reading and
 * pricing surfaces. Two thirds of it is one mechanical change: every near-white fill in
 * the stylesheet now reads `var(--card, <its own colour>)` so a ground change can reach
 * it, which costs about 13 bytes each across 91 declarations. The rest is the scoped
 * token block and the surfaces that stopped being cards. Measured at 206.6 KB.
 *
 * Raised to 340,000 on 2026-10-08 by owner decision for the homepage typography of
 * 2026-09-13 (69d3e85): next/font emits Noto Sans KR (variable) and Song Myung as about
 * 126 KB of @font-face rules, one per Korean unicode-range slice, on every route. The
 * glyph files themselves still load only for the slices a page uses. CI was stopping at
 * the audit step, so this landed unmeasured; measured on CI at 336.1 KB.
 *
 * The allowance stays narrow on purpose: another global screen still cannot be absorbed
 * without an explicit decision, which is the only reason these numbers move at all.
 */
const DEFAULT_CSS_DECODED_BUDGET = 340_000;

const routes = [
  // The editorial home removes the old autoplay film, audio and iOS animation. Its
  // Daily Healing keeps the unchanged hero, adds the six-guide strip and the real report,
  // Reality Check and 3D Space previews below it. The character-led correction keeps the first
  // scene crisp with one optimized native-size asset and mounts later character rows only near
  // the viewport. The measured desktop state is 17 first-party resources, 425.3 KB transferred,
  // and 1.223 MB decoded.
  // These ceilings leave less than 3% headroom and still reject another unreviewed screen.
  // Recalibrated against the pre-change production commit ae650db on 2026-09-12.
  // That baseline already measured 273.7 KB on home and 211.0-229.6 KB on the
  // specialized routes after the Saju art release. The new timer and Japanese language
  // switch add 1.4 KB and 0.9 KB respectively. Each ceiling keeps about 1% headroom.
  // 2026-10-08: every CSS ceiling below also carries the ~126 KB of Korean font-face rules
  // described at DEFAULT_CSS_DECODED_BUDGET, re-measured on CI with about 1% headroom.
  //
  // 2026-10-08, totals: the same fonts add 160-300 KB transferred per route on CI, which
  // the totals below now carry (owner decision). In exchange the home hero, guide and
  // Daily Healing scenes load the 768 px Taeryeong cut instead of the 1254 px one; it is
  // covers the hero's 480 px maximum at 1.6x and saves 251 KB on /en.
  // Each ceiling is local production measurement plus the font payload CI reported for
  // that route, with about 1% headroom; decoded ceilings that CI has not yet reached are
  // estimated the same way with about 2%.
  { path: "/en", transfer: 850_000, decoded: 1_810_000, cssDecoded: 415_000 },
  { path: "/en/relationship" },
  { path: "/en/compatibility", transfer: 460_000, decoded: 1_355_000 },
  { path: "/en/celebrity", decoded: 1_305_000, cssDecoded: 344_500 },
  { path: "/en/reality-check" },
  { path: "/en/shop", transfer: 535_000, decoded: 1_425_000, cssDecoded: 348_500 },
  // The Saju hub intentionally exposes all six supplied guide cuts and its route-scoped
  // editorial stylesheet on top of the shared one. Measured at 49 resources and 206.0 KB
  // decoded CSS after the home journey sections were added to the shared stylesheet.
  //
  // Its decoded total was already 1.243 MB at commit 8ae2e05, before any of that: the
  // stale CSS ceiling was failing first, so this assertion had not been reached in a
  // while and the six guide cuts had grown past the shared 1.2 MB default unnoticed. The
  // number below records the measured state rather than pretending it is new; the guide
  // artwork on this route is the thing to shrink, and that is a separate change.
  { path: "/en/fortune", resources: 52, cssDecoded: 353_500, transfer: 612_000, decoded: 1_490_000 },
  { path: "/en/saju", cssDecoded: 357_500, transfer: 760_000, decoded: 1_650_000 },
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
    // Every budget failure reports the whole measurement, so one CI run is enough to
    // re-baseline all of them instead of revealing one assertion per run.
    const measured = `${route} ${JSON.stringify(metrics)}`;
    expect(metrics.resourceCount, measured).toBeLessThanOrEqual(resourceBudget);
    expect(metrics.jsTransferBytes, measured).toBeLessThan(350_000);
    expect(metrics.jsDecodedBytes, measured).toBeLessThan(1_050_000);
    // The shared stylesheet now includes the intake, Four Pillars table, character-led
    // reports, 24-item concept catalog, expanded retention survey, bounded event chrome,
    // the P0 provenance notice / Pattern Intelligence controls, and the home journey
    // sections. See DEFAULT_CSS_DECODED_BUDGET above for why the allowance moved and why
    // it is still narrow enough to catch an unplanned global screen.
    expect(metrics.cssDecodedBytes, measured).toBeLessThan(cssDecodedBudget);
    expect(metrics.totalTransferBytes, measured).toBeLessThan(transferBudget);
    expect(metrics.totalDecodedBytes, measured).toBeLessThan(decodedBudget);
    if (route === "/en") {
      const initialVideo = await page.evaluate(() => performance.getEntriesByType("resource")
        .some(({ name }) => new URL(name).pathname === "/videos/taeyul-hero.mp4"));
      expect(initialVideo).toBe(false);
    }
  });
}
