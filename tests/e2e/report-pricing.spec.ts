import { expect, test } from "@playwright/test";
import { resolveProductPricing } from "../../src/core/product-prices";

const pricing = resolveProductPricing();
const won = (amount: number) => `₩${amount.toLocaleString("en-US")}`;

for (const locale of ["ko", "en", "ja"]) {
  test(`current report prices match the server catalog in ${locale}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/${locale}/plans`);
    await expect(page.locator(".plan-card .plan-price")).toHaveText([
      pricing.prices.plus_30d, pricing.prices.pro_30d, pricing.prices.premium_pdf,
    ].map(won));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("Japanese intake shows the same prices as checkout", async ({ page }) => {
  await page.goto("/ja/reading");
  const choices = page.locator(".japanese-reading-form fieldset").first();
  for (const price of Object.values(pricing.prices)) {
    await expect(choices).toContainText(`${price.toLocaleString("ja-JP")}ウォン`);
  }
});

test("home FAQ and Saju service entry use the current Detailed price", async ({ page }) => {
  await page.goto("/ko");
  const paymentFaq = page.locator(".harang-faq details").filter({ hasText: "결제는 어떻게" });
  await paymentFaq.locator("summary").click();
  await expect(paymentFaq).toContainText(`${pricing.prices.pro_30d.toLocaleString("ko-KR")}원`);
  await page.goto("/ko/fortune");
  await expect(page.locator('a[href="/ko/plans"]').filter({ hasText: "상세 리딩" }))
    .toContainText(`${pricing.prices.pro_30d.toLocaleString("ko-KR")}원`);
});
