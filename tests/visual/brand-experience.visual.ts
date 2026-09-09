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
      await expect(page.getByRole("dialog", { name: "결과를 보는 방법부터 알려드릴게요." })).toBeVisible();
      await capture(page, ".td2-walkthrough", `brand-${width}-guide.png`);
      await page.getByRole("button", { name: "안내 닫기" }).click();
      await expect(page.getByRole("heading", { level: 1, name: "사람의 흐름을 읽어 더 나은 오늘을 만듭니다." })).toBeVisible();
      await capture(page, ".td2-hero", `brand-${width}-hero.png`);
      const heroQuality = await page.locator(".td2-hero-image").evaluate(async (node) => {
        const image = node as HTMLImageElement;
        const box = image.getBoundingClientRect();
        const response = await fetch(image.currentSrc);
        const bitmap = await createImageBitmap(await response.blob());
        const density = bitmap.width / box.width;
        bitmap.close();
        return {
          density,
          transform: getComputedStyle(image).transform,
        };
      });
      expect(heroQuality.density).toBeGreaterThanOrEqual(1);
      expect(heroQuality.transform).toBe("none");
      await capture(page, ".td2-reading-map", `brand-${width}-services.png`);
      await capture(page, ".td2-product-section", `brand-${width}-personal.png`);
      await capture(page, ".td2-editorial-pair", `brand-${width}-success-relationship.png`);
      await capture(page, ".td2-space", `brand-${width}-space.png`);
      await capture(page, ".td2-reality", `brand-${width}-reality.png`);
      await capture(page, ".td2-celestial", `brand-${width}-celestial.png`);

      await expect(page.locator(".td2-orbits, .td2-reality-orbit, .td2-radar")).toHaveCount(0);
      await expect(page.locator(".td2-celestial img")).toHaveCount(0);
      await expect(page.locator(".td2-celestial-study circle")).toHaveCount(0);
      await expect(page.locator(".td2-celestial-study")).toContainText("年柱");
      await expect(page.locator(".td2-celestial-study")).toContainText("月柱");
      await expect(page.locator(".td2-celestial-study")).toContainText("日柱");
      await expect(page.locator(".td2-celestial-study")).toContainText("時柱");
      const celestialStudy = await page.locator(".td2-celestial-study svg").evaluate((node) => {
        const svg = node as SVGSVGElement;
        const box = svg.getBoundingClientRect();
        return {
          height: box.height,
          detailCount: svg.querySelectorAll("path, line, rect, text").length,
          viewBox: svg.getAttribute("viewBox"),
          width: box.width,
        };
      });
      expect(celestialStudy.width).toBeGreaterThan(280);
      expect(celestialStudy.height).toBeGreaterThan(220);
      expect(celestialStudy.detailCount).toBeGreaterThan(60);
      expect(celestialStudy.viewBox).toBe("0 0 680 560");

      expect(await page.locator(".td2-room-comparison img").count()).toBe(2);
      await page.getByRole("link", { name: "이용 안내" }).click();
      await expect(page.locator(".td2-guide-screen")).toHaveCount(1);
      const guideFrame = await page.locator(".td2-walkthrough .guide-stage").boundingBox();
      expect(guideFrame?.width ?? 0).toBeLessThanOrEqual(780);
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
