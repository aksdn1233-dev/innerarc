import { expect, test } from "@playwright/test";
test("3D assets stay off home and entry transfer sizes are recorded", async ({ page }, testInfo) => {
  await page.goto("/ko");
  expect(await page.evaluate(() => performance.getEntriesByType("resource").filter(item => new URL(item.name).pathname.startsWith("/space/assets/")).length)).toBe(0);
  await page.goto("/en/space");
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-object-count", "6", { timeout: 20000 });
  const budget = await page.evaluate(() => {
    const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const scripts = entries.filter(item => new URL(item.name).pathname.endsWith(".js")), assets = entries.filter(item => new URL(item.name).pathname.startsWith("/space/assets/"));
    const sum = (items: PerformanceResourceTiming[], key: "encodedBodySize" | "decodedBodySize") => items.reduce((total, item) => total + item[key], 0);
    return { scope: "local initial small-bedroom entry; shared scripts may be cached from home", scripts: scripts.length, scriptDecodedBytes: sum(scripts, "decodedBodySize"), scriptEncodedBytes: sum(scripts, "encodedBodySize"), assetFiles: assets.length, assetDecodedBytes: sum(assets, "decodedBodySize"), assetEncodedBytes: sum(assets, "encodedBodySize") };
  });
  expect(budget.assetFiles).toBeGreaterThanOrEqual(10); expect(budget.scriptDecodedBytes).toBeGreaterThan(0);
  await testInfo.attach("space-entry-transfer", { body: JSON.stringify(budget), contentType: "application/json" });
});
