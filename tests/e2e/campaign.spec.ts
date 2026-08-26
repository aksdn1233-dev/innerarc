import { expect, test } from "@playwright/test";

test("withdrawn three-day campaign stays absent and standard prices remain authoritative", async ({ page }) => {
  await page.goto("/ko");
  await expect(page.getByText("모든 리딩, 지금 1,500원", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "이벤트" })).toHaveCount(0);

  await page.goto("/ko/events");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("친구와 함께 결을 읽어보세요");
  await expect(page.getByText(/1,500원|딱 3일/)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "친구 초대하면 5,000원 쿠폰" })).toBeVisible();

  await page.goto("/ko/plans");
  await expect(page.locator(".plan-card .plan-price")).toHaveCount(3);
  const expectedPrices = ["₩5,500", "₩39,000", "₩79,000"];
  for (const [index, price] of (await page.locator(".plan-card .plan-price").all()).entries()) {
    await expect(price).toHaveText(expectedPrices[index]);
  }
  await expect(page.getByText(/3일 한정 이벤트가|전 상품 1,500원/)).toHaveCount(0);
});
