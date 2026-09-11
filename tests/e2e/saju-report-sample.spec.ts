import { expect, test } from "@playwright/test";

test("the 941104 Saju sample reads as long-form character webtoon dialogue", async ({ page }) => {
  await page.goto("/ko/samples/saju");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("사주 원국");
  await expect(page.getByRole("heading", { name: "원국이 먼저 보여주는 당신의 중심" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "어릴 때, 먼저 맡았던 역할" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "가족이 기대했을 수 있는 모습" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "친구와 사람들 사이에서 보이는 모습" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "돈과 자원을 다루는 습관" })).toBeVisible();
  await expect(page.getByText(/가족은 당신이.*기대했을 수 있습니다/)).toBeVisible();
  await expect(page.getByText(/출생 시각이 없어 시주를 만들지 않았습니다/)).toBeVisible();

  const storyPanels = page.locator("[data-webtoon-panel][data-character]");
  await expect(storyPanels).toHaveCount(19);
  await expect(storyPanels.first().locator(".webtoon-story-character")).toBeVisible();
  const characterImages = storyPanels.locator(".webtoon-story-character");
  await expect(characterImages).toHaveCount(19);
  await expect(characterImages.first()).toHaveAttribute("srcset", /-hd-v2-2x\.webp 2x, .*-hd-v2-3x\.webp 3x/);
  const densityCoverage = await characterImages.evaluateAll((images) =>
    images.filter((image) => image.getAttribute("srcset")?.includes("-hd-v2-3x.webp 3x")).length);
  expect(densityCoverage).toBe(19);
  const selectedDensity = await characterImages.first().evaluate((image: HTMLImageElement) => ({
    currentSrc: image.currentSrc,
    devicePixelRatio,
  }));
  if (selectedDensity.devicePixelRatio > 1) expect(selectedDensity.currentSrc).toContain("-hd-v2-");
  else expect(selectedDensity.currentSrc).toMatch(/\.png$/);
  const coreBubble = page.getByRole("heading", { name: "원국이 먼저 보여주는 당신의 중심" }).locator("..");
  await expect(coreBubble).toContainText("큰 나무처럼");
  const keySentences = page.locator(".report-key-sentence");
  await expect(keySentences).toHaveCount(11);
  await expect(keySentences.first()).toContainText("당신의 강점은 더 오래 버티는 데 있지 않고");
  const keyStyle = await keySentences.first().evaluate((element) => {
    const style = getComputedStyle(element);
    return { fontSize: Number.parseFloat(style.fontSize), fontWeight: Number(style.fontWeight) };
  });
  const bodySize = await coreBubble.locator(".sample-report-body").evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).fontSize));
  expect(keyStyle.fontWeight).toBeGreaterThanOrEqual(700);
  expect(keyStyle.fontSize).toBeGreaterThan(bodySize);

  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflows).toBe(false);
});
