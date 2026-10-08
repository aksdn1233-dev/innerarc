import { expect, test } from "@playwright/test";

for (const route of ["profile", "saju", "celebrity"]) {
  test(`${route} personal data stays inert until local submit handling is ready`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    const outgoing: string[] = [];
    page.on("request", request => outgoing.push(request.url()));
    await page.goto(`${baseURL}/en/${route}`);
    // Saju now asks one question per screen and opens on the name, so its first
    // personal field is not the date. Any personal field in the form must be inert.
    const personalField = 'input[type="date"], input[name="readingName"]';
    const form = page.locator("form").filter({ has: page.locator(personalField) }).first();
    await expect(form.locator('button[type="submit"]')).toBeDisabled();
    await expect(form.locator(personalField).first()).toBeDisabled();
    expect(outgoing.some(url => /birthDate=|birth-date=|privacyRequired=/.test(url))).toBe(false);
    await context.close();
  });
}
