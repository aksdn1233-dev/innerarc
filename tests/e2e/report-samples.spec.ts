import { expect, test } from "@playwright/test";

const samples = [
  ["detail", "상세 리딩"],
  ["premium", "프리미엄"],
  ["saju", "사주 원국"],
] as const;

test("every public report sample stays readable on desktop and mobile", async ({ page }) => {
  test.slow();
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const [kind, label] of samples) {
      await page.goto(`/ko/samples/${kind}`);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(label);
      await expect(page.locator(".sample-report-notice")).toContainText("결제·주문·저장은 발생하지 않습니다");
      await expect(page.locator(".sample-report-tabs a")).toHaveCount(3);
      await expect(page.locator(`[href="/ko/samples/${kind}"]`)).toHaveAttribute("aria-current", "page");
      expect(await page.locator("[data-webtoon-panel]").count()).toBeGreaterThan(5);
      await expect(page.getByRole("link", { name: "홈으로" })).toBeVisible();

      const quality = await page.evaluate(() => ({
        brokenImages: [...document.images]
          .filter((image) => image.currentSrc && image.complete && image.naturalWidth === 0).length,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
      }));
      expect(quality.brokenImages).toBe(0);
      expect(quality.overflow).toBeLessThanOrEqual(1);
    }
  }
  expect(pageErrors).toEqual([]);
});
