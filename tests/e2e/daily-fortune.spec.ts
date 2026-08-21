import { expect, test } from "@playwright/test";

test("a guest can view today's reflection without saving and explicitly enable daily updates", async ({ page }) => {
  await page.goto("/ko/daily-fortune");
  await page.getByLabel("태어난 달").selectOption("11");
  await page.getByLabel("태어난 날").selectOption("4");
  await page.getByRole("checkbox", { name: "개인정보 처리 안내를 확인했습니다. (필수)" }).check();

  await page.getByRole("button", { name: "오늘만 보기" }).click();
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
  await expect(page.getByText("오늘의 작은 행동")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("innerarc:daily-fortune:v1"))).toBeNull();

  await page.getByRole("button", { name: "매일 업데이트 켜기" }).click();
  await expect(page.getByRole("status")).toContainText("매일 업데이트가 켜져 있습니다");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("innerarc:daily-fortune:v1")!))).toMatchObject({
    version: 1,
    birthMonth: 11,
    birthDay: 4,
  });

  await page.reload();
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
  await expect(page.getByRole("button", { name: "매일 업데이트 끄기" })).toBeVisible();
  await page.getByRole("button", { name: "매일 업데이트 끄기" }).click();
  expect(await page.evaluate(() => localStorage.getItem("innerarc:daily-fortune:v1"))).toBeNull();
});

test("daily flow stays within supported phone widths and keeps its boundary visible", async ({ page }) => {
  for (const width of [320, 360, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/ko/daily-fortune");
    await page.getByLabel("태어난 달").selectOption("11");
    await page.getByLabel("태어난 날").selectOption("4");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "오늘만 보기" }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    await expect(page.locator("main")).toContainText("미래를 예측하거나 결과를 보장하지 않으며");
  }
});

test("the English daily flow preserves route and privacy truth", async ({ page }) => {
  await page.goto("/en/daily-fortune");
  await expect(page.getByRole("heading", { level: 1, name: "Pause for a short reflection on today's choices" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Saju menu/ })).toHaveAttribute("href", "/en/fortune");
  await expect(page.locator("main")).toContainText("never sent to a server or outside service");
});
