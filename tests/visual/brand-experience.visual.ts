import { expect, test } from "@playwright/test";

const widths = [390, 430, 768, 1024, 1440] as const;

async function capture(page: import("@playwright/test").Page, selector: string, name: string) {
  const subject = page.locator(selector);
  await subject.scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    document.querySelector<HTMLElement>(".skip-link")?.style.setProperty("display", "none", "important");
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
  const screenshot = await subject.screenshot({ animations: "disabled" });
  expect(screenshot).toMatchSnapshot(name, { threshold: .1, maxDiffPixelRatio: .001 });
}

test.describe("Taeryeong editorial brand evidence", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-space", "One deterministic Chromium capture set is sufficient.");
  });

  for (const width of widths) {
    test(`landing system at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 500 ? 844 : width < 1000 ? 900 : 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await page.goto("/ko", { waitUntil: "networkidle" });

      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await expect(page.getByRole("heading", { level: 1, name: "당신에게 반복되는 패턴에는 이유가 있을지도 모릅니다." })).toBeVisible();
      await capture(page, ".td2-hero", `brand-${width}-hero.png`);
      await capture(page, ".td2-reading-map", `brand-${width}-services.png`);
      await capture(page, ".td2-product-section", `brand-${width}-personal.png`);
      await capture(page, ".td2-editorial-pair", `brand-${width}-success-relationship.png`);
      await capture(page, ".td2-space", `brand-${width}-space.png`);
      await capture(page, ".td2-reality", `brand-${width}-reality.png`);

      expect(await page.locator(".td2-room-comparison img").count()).toBe(2);
      const previewQuality = await page.locator(".td2-room-comparison img").evaluateAll((images) => images.map((node) => {
        const image = node as HTMLImageElement;
        const box = image.getBoundingClientRect();
        return {
          loaded: image.complete && image.naturalWidth > 0,
          density: image.naturalWidth / box.width,
          sourceRatio: image.naturalWidth / image.naturalHeight,
          displayRatio: box.width / box.height,
        };
      }));
      for (const preview of previewQuality) {
        expect(preview.loaded).toBe(true);
        expect(preview.density).toBeGreaterThanOrEqual(1);
        expect(Math.abs(preview.sourceRatio - preview.displayRatio)).toBeLessThan(.01);
      }
      expect(errors).toEqual([]);
    });
  }
});
