import { expect, test } from "@playwright/test";

const widths = [360, 390, 430, 768, 1024, 1280, 1440] as const;

test.describe("Harang reading-room homepage", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== "desktop-space", "One Chromium capture set covers every layout width.");
  });
  for (const width of widths) {
    test(`focused home at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width <= 430 ? 844 : 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const errors: string[] = [];
      page.on("pageerror", e => errors.push(e.message));
      page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
      await page.goto("/ko", { waitUntil: "networkidle" });
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await page.evaluate(() => document.fonts.ready);
      for (const [selector, name] of [
        [".harang-cover", "hero"], [".harang-how", "guide"], [".harang-preview", "preview"],
        [".harang-services", "services"], [".harang-reality", "reality"], [".harang-footer", "footer"],
      ]) {
        const section = page.locator(selector);
        await section.scrollIntoViewIfNeeded();
        await expect(section).toHaveScreenshot(`harang-${width}-${name}.png`, { animations: "disabled", maxDiffPixelRatio: .001 });
      }
      const quality = await page.locator(".harang-cover-image").evaluate(node => {
        const image = node as HTMLImageElement;
        return { density: image.naturalWidth / image.getBoundingClientRect().width, transform: getComputedStyle(image).transform, loaded: image.complete };
      });
      expect(quality.loaded).toBe(true);
      expect(quality.density).toBeGreaterThanOrEqual(1.9);
      expect(quality.transform).toBe("none");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }
  test("links, sample truth and legal details stay reachable", async ({ page, request }) => {
    await page.goto("/ko");
    const paths = await page.locator(".harang-services a").evaluateAll(links => links.map(link => new URL((link as HTMLAnchorElement).href).pathname));
    expect(paths).toEqual(expect.arrayContaining(["/ko/numerology", "/ko/daily-fortune", "/ko/compatibility", "/ko/space", "/ko/celebrity"]));
    for (const path of paths) expect((await request.get(path)).status(), path).toBeLessThan(400);
    for (const link of await page.locator('.harang-section-nav a').all()) {
      const href = await link.getAttribute("href");
      expect(href).toBeTruthy();
      await expect(page.locator(href!)).toHaveCount(1);
    }
    await expect(page.locator(".harang-sample ol li")).toHaveCount(3);
    await expect(page.locator(".harang-sample")).toContainText("1994.11.04");
    await expect(page.locator(".harang-footer")).toContainText("482-12-03629");
    await expect(page.locator(".harang-renewal")).not.toContainText(/태령|윤도|호연|연희|사현|화연|시우령|120만|98%|★★★★★/);
    await page.locator(".harang-cover .harang-primary").click();
    await expect(page).toHaveURL(/\/ko\/saju$/);
    await expect(page.locator(".saju-intake-heading")).toBeVisible();
  });
});
