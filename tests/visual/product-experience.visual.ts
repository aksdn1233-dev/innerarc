import { expect, test } from "@playwright/test";

const widths = [390, 430, 768, 1024, 1440] as const;
const prepareEvidenceCapture = async (page: import("@playwright/test").Page) => {
  // Locator screenshots can focus and reposition fixed skip links while scrolling.
  // Hide only in the disposable evidence page and wait for Chromium's compositor to repaint.
  // The product accessibility control stays present and is tested elsewhere.
  await page.evaluate(async () => {
    const skipLink = document.querySelector<HTMLElement>(".skip-link");
    skipLink?.style.setProperty("display", "none", "important");
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
};
const captureEvidence = async (page: import("@playwright/test").Page, locator: import("@playwright/test").Locator, name: string) => {
  await locator.scrollIntoViewIfNeeded();
  await prepareEvidenceCapture(page);
  await expect.poll(() => locator.locator("img").evaluateAll(images => images.every(node => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)), { timeout: 15000 }).toBe(true);
  const screenshot = await locator.screenshot({ animations: "disabled" });
  expect(screenshot).toMatchSnapshot(name, { threshold: .1, maxDiffPixelRatio: .001 });
};

test.describe("premium product evidence", () => {
  test.beforeEach(({}, testInfo) => { test.skip(testInfo.project.name !== "desktop-space", "One deterministic Chromium evidence set is sufficient; cross-browser 3D coverage runs separately."); });

  for (const width of widths) test(`space and success product views at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 500 ? 844 : width < 1000 ? 900 : 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });

    await page.goto("/ko/space");
    await prepareEvidenceCapture(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await captureEvidence(page, page.locator("section").first(), `premium-${width}-space-landing.png`);
    const view = page.locator("[data-scene-state]"); await expect(view).toHaveAttribute("data-object-count", "8", { timeout: 20_000 });
    await expect(page.getByLabel("실제 3D 렌더 해상도")).toContainText(/실제 렌더 \d+×\d+/);
    for (const name of ["북쪽 방향을 확인했어요", "방과 가구 위치를 확인했어요"]) await page.getByRole("checkbox", { name }).check();
    await page.getByRole("button", { name: "추천 배치 보기", exact: true }).click();
    const analysis = page.getByRole("region", { name: "공간 분석 결과" });
    await expect(analysis).toBeVisible();
    await analysis.scrollIntoViewIfNeeded();
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await captureEvidence(page, analysis, `premium-${width}-space-analysis.png`);
    await expect(view).toHaveAttribute("data-motion", "settled", { timeout: 10_000 });
    await page.getByRole("button", { name: "방 안에서", exact: true }).click();
    await expect(view).toHaveAttribute("data-camera-mode", /hero|interior/);
    await expect(view).toHaveAttribute("data-motion", "settled", { timeout: 10_000 });
    await captureEvidence(page, view.locator(".."), `premium-${width}-space-before.png`);
    await captureEvidence(page, page.getByLabel("3D 공간 안내"), `premium-${width}-space-guide.png`);
    await page.getByRole("button", { name: "추천", exact: true }).click(); await expect(view).toHaveAttribute("data-motion", "settled", { timeout: 10_000 });
    await captureEvidence(page, view.locator(".."), `premium-${width}-space-after.png`);

    await page.goto("/ko/space/workspace");
    await prepareEvidenceCapture(page);
    await captureEvidence(page, page.locator("main"), `premium-${width}-space-workspace.png`);

    await page.goto("/ko/celebrity");
    await prepareEvidenceCapture(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await captureEvidence(page, page.locator(".celebrity-intro"), `premium-${width}-success-landing.png`);
    await page.getByLabel("내 생년월일 (양력)").fill("1994-11-04"); await page.getByRole("button", { name: "공개 구조 비교", exact: true }).click();
    await captureEvidence(page, page.locator('[aria-labelledby="celebrity-feature-title"]'), `premium-${width}-success-result.png`);
    await page.getByRole("button", { name: "이 행동을 Reality Check로 기록" }).click();
    await captureEvidence(page, page.locator("main"), `premium-${width}-reality-check.png`);
  });
});
