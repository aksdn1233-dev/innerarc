import { expect, test } from "@playwright/test";

test("compatibility offers the five plain-language relationship choices", async ({ page }) => {
  await page.goto("/ko/compatibility");
  await expect(page.locator("#compatibility-type option")).toHaveText([
    "애인", "직장 동료", "가족", "친구", "동업",
  ]);
});

test("family comparison keeps consent and renders all eight operating areas", async ({ page }) => {
  await page.goto("/ko/compatibility");
  await page.locator("#compatibility-birth-a").fill("1994-11-04");
  await page.locator("#compatibility-birth-b").fill("1988-03-17");
  await page.locator("#compatibility-type").selectOption("family");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "관계 패턴 비교" }).click();

  await expect(page.locator("#compatibility-result")).toContainText("가족");
  await expect(page.locator("#compatibility-result .compatibility-card")).toHaveCount(8);
  await expect(page.locator("#compatibility-result")).toContainText("가족이라는 이유만으로");
});

test("fixed 941104 product samples create no checkout controls", async ({ page }) => {
  for (const kind of ["detail", "premium", "saju"]) {
    await page.goto(`/ko/samples/${kind}`);
    await expect(page.getByText("941104 결과 리포트 예시")).toBeVisible();
    await expect(page.getByText("결제·주문·저장은 발생하지 않습니다.")).toBeVisible();
    await expect(page.getByRole("button", { name: /결제|구매/ })).toHaveCount(0);
  }
});
