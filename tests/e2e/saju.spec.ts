import { expect, test } from "@playwright/test";
test("the Four Pillars chart moves into the current one-time checkout", async ({ page }) => {
  await page.goto("/ko/saju");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("사주 원국");

  await page.locator("#saju-birthDate").fill("1994-11-04");
  await page.locator("#saju-birthTime").fill("09:30");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /원 결제로 원국 받기/ }).click();

  await expect(page).toHaveURL(/\/ko\/plans\?product=plus_30d$/);
  const product = page.locator('[data-product="plus_30d"]');
  await expect(product).toContainText("사주 원국");
  await expect(product).toContainText(/₩1,500|₩5,500/);
  await expect(product).toContainText("이메일로 보관하기");
});

test("an unknown birth time leaves the hour pillar empty instead of inventing one", async ({ page }) => {
  await page.goto("/ko/saju");
  await page.locator("#saju-birthDate").fill("1994-11-04");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /원 결제로 원국 받기/ }).click();

  const draft = await page.evaluate(() => JSON.parse(sessionStorage.getItem("innerarc.checkoutDraft.v1") ?? "null"));
  expect(draft.birthTime).toBeUndefined();
  expect(draft.readingKind).toBe("saju_chart");
});

test("a date the engine will not stand behind is refused, not answered", async ({ page }) => {
  await page.goto("/ko/saju");
  await page.locator("#saju-birthDate").fill("1099-01-01");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /원 결제로 원국 받기/ }).click();
  // Scoped to the form's own error: `role="alert"` alone also matches Next's route
  // announcer, which is empty.
  await expect(page.locator(".saju-error")).toContainText("1100");
  await expect(page.locator(".saju-chart")).toHaveCount(0);
});

test("the English page shows the Korean chart with an English derivation", async ({ page }) => {
  await page.goto("/en/saju");
  await page.locator("#saju-birthDate").fill("1994-11-04");
  await page.locator("#saju-birthTime").fill("09:30");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Get the chart for ₩(1,500|5,500)/ }).click();
  await expect(page).toHaveURL(/\/en\/plans\?product=plus_30d$/);
  await expect(page.locator('[data-product="plus_30d"]')).toContainText("Four Pillars chart");
});
