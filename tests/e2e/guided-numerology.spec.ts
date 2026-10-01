import { expect, test } from "@playwright/test";

for (const locale of ["ko", "en"] as const) {
  test(`${locale} guided entry uses the established deterministic result`, async ({ page }) => {
    await page.goto(`/${locale}/numerology?guide=1&focus=work`);
    await expect(page.locator(".guided-character img")).toHaveJSProperty("naturalWidth", 1254);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    await expect(page.getByRole("progressbar", { name: locale === "ko" ? "진행 단계" : "Progress" })).toHaveAttribute("aria-valuenow", "1");
    await page.getByRole("button", { name: locale === "ko" ? "다음 →" : "Continue →" }).click();
    await page.locator("#guidedBirthDate").fill("1994-11-04");
    await page.getByRole("button", { name: locale === "ko" ? "다음 →" : "Continue →" }).click();
    await page.locator('input[name="privacyRequired"]').check();
    await page.getByRole("button", { name: locale === "ko" ? "무료 결과 보기 →" : "See free result →" }).click();
    await expect(page.locator(".number-tile").first()).toContainText("11");
    await expect(page.locator("#result")).toBeVisible();
  });
}

test("guided entry rejects an invalid date before progressing", async ({ page }) => {
  await page.goto("/ko/numerology?guide=1");
  await page.getByRole("button", { name: "다음 →" }).click();
  await page.getByRole("button", { name: "다음 →" }).click();
  await expect(page.locator(".guided-form-card .error[role=alert]")).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "진행 단계" })).toHaveAttribute("aria-valuenow", "2");
});
