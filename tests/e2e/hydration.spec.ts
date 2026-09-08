import { expect, test } from "@playwright/test";

for (const route of ["profile", "saju", "celebrity"]) {
  test(`${route} personal data stays inert until local submit handling is ready`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    const outgoing: string[] = [];
    page.on("request", request => outgoing.push(request.url()));
    await page.goto(`${baseURL}/en/${route}`);
    const form = page.locator("form").filter({ has: page.locator('input[type="date"]') }).first();
    await expect(form.locator('button[type="submit"]')).toBeDisabled();
    await expect(form.locator('input[type="date"]').first()).toBeDisabled();
    expect(outgoing.some(url => /birthDate=|birth-date=|privacyRequired=/.test(url))).toBe(false);
    await context.close();
  });
}
