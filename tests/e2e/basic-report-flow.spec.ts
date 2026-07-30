import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("the 19,000 KRW product accepts a birth date without forcing a question", async ({ page }) => {
  await page.goto("/ko#onboarding");
  await expect(page.getByText("4. 한 가지 궁금한 점 (선택)")).toBeVisible();
  await expect(page.locator("#concern")).not.toHaveAttribute("required", "");

  await page.locator("#birthDate").fill("1994-11-04");
  await page.locator('input[name="privacyRequired"]').check();
  await page.locator(".home-form-section button[type='submit']").click();

  await expect(page).toHaveURL(/\/ko\/plans\?product=plus_30d$/);
  const draft = await page.evaluate(() => {
    const raw = window.sessionStorage.getItem("innerarc.checkoutDraft.v1");
    return raw ? JSON.parse(raw) : null;
  });
  expect(draft).toMatchObject({
    productCode: "plus_30d",
    birthDate: "1994-11-04",
    concern: "",
  });
});
