import { expect, test } from "@playwright/test";

test("1994-11-04 keeps its calculation and gains selectable webtoon dialogue", async ({ page }) => {
  await page.goto("/ko/numerology");
  await page.locator("#birthDate").fill("1994-11-04");
  await page.locator('input[name="privacyRequired"]').check();
  await page.getByRole("button", { name: "내 핵심 패턴 보기" }).click();

  await expect(page.locator("[data-character]")).toHaveCount(5);
  await expect(page.locator("[data-character='taeryeong']").first()).toBeVisible();
  await expect(page.getByText("숫자는 이렇게 나왔어요")).toBeVisible();
  await expect(page.locator("[data-character] img[alt*='생년월일 패턴 결과']")).toHaveCount(5);
  await expect(page.locator(".number-tile").first()).toContainText("11");
  await expect(page.getByText("인생수").first()).toBeVisible();
  await expect(page.locator("main")).toContainText("과학적 예측·진단·치료");
});

test("the character panels stay inside all supported phone widths", async ({ page }) => {
  for (const width of [320, 360, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/ko/numerology");
    await page.locator("#birthDate").fill("1994-11-04");
    await page.locator('input[name="privacyRequired"]').check();
    await page.getByRole("button", { name: "내 핵심 패턴 보기" }).click();
    await expect(page.locator("[data-character]").first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(await page.locator("[data-character]").first().evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  }
});
