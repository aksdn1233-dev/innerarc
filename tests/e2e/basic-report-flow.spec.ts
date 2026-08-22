import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("the retired Core product is absent and Detailed becomes the default", async ({ page }) => {
  // The intake form lives on the reading page now; the home page is the film alone.
  await page.goto("/ko/reading#onboarding");
  await expect(page.getByText("가장 궁금한 한 가지 (선택)")).toBeVisible();
  await expect(page.locator("#concern")).not.toHaveAttribute("required", "");
  await expect(page.locator('[data-product="plus_30d"]')).toHaveCount(0);
  // Three cards now: the free reading is named as a tier beside the two paid ones. What
  // this test guards is the paid line-up, so it counts the paid cards rather than every
  // card, and reads the price off the first paid one instead of whatever comes first.
  await expect(page.locator(".editorial-product.is-free")).toHaveCount(1);
  await expect(page.locator(".editorial-product:not(.is-free)")).toHaveCount(2);
  await expect(
    page.locator(".editorial-product:not(.is-free)").first().locator(".campaign-price-row strong"),
  ).toContainText(/1,500|9,600|39,000/);

  await page.locator("#birthDate").fill("1994-11-04");
  await page.locator('input[name="privacyRequired"]').check();
  await page.locator(".home-form-section button[type='submit']").click();

  await expect(page).toHaveURL(/\/ko\/plans\?product=pro_30d$/);
  await expect(page.locator(".plan-card")).toHaveCount(3);
  await expect(page.locator('[data-product="plus_30d"]')).toContainText("사주 원국");
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
