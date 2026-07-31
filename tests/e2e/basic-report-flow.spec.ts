import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("the retired Core product is absent and Detailed becomes the default", async ({ page }) => {
  await page.goto("/ko#onboarding");
  await expect(page.getByText("4. 한 가지 궁금한 점 (선택)")).toBeVisible();
  await expect(page.locator("#concern")).not.toHaveAttribute("required", "");
  await expect(page.locator('[data-product="plus_30d"]')).toHaveCount(0);
  await expect(page.locator(".editorial-product")).toHaveCount(2);
  await expect(page.getByText("9,600원", { exact: true }).first()).toBeVisible();

  await page.locator("#birthDate").fill("1994-11-04");
  await page.locator('input[name="privacyRequired"]').check();
  await page.locator(".home-form-section button[type='submit']").click();

  await expect(page).toHaveURL(/\/ko\/plans\?product=pro_30d$/);
  await expect(page.locator(".plan-card")).toHaveCount(2);
  await expect(page.locator('[data-product="plus_30d"]')).toHaveCount(0);
  const draft = await page.evaluate(() => {
    const raw = window.sessionStorage.getItem("innerarc.checkoutDraft.v1");
    return raw ? JSON.parse(raw) : null;
  });
  expect(draft).toMatchObject({
    productCode: "pro_30d",
    birthDate: "1994-11-04",
    concern: "",
  });
});
