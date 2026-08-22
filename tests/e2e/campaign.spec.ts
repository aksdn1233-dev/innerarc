import { expect, test } from "@playwright/test";

test("campaign popup, event FAQ, and all-product price stay aligned", async ({ page }) => {
  const active = Date.now() >= Date.parse("2026-08-22T15:00:00.000Z") && Date.now() < Date.parse("2026-08-25T15:00:00.000Z");
  await page.goto("/ko");
  const popup = page.getByRole("dialog", { name: "모든 리딩, 지금 1,500원" });
  if (active) {
    await expect(popup).toBeVisible();
    await popup.getByRole("button", { name: "계속 둘러보기" }).click();
    await expect(popup).toBeHidden();
  } else {
    await expect(popup).toHaveCount(0);
  }

  await page.goto("/ko/events");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("딱 3일, 모든 리딩 1,500원");
  await page.getByText("정말 모든 리딩이 1,500원인가요?", { exact: true }).click();
  await expect(page.getByText(/사주 원국, 상세 리딩, 프리미엄 심층 리딩 모두/)).toBeVisible();

  await page.goto("/ko/plans");
  await expect(page.locator(".plan-card .plan-price")).toHaveCount(3);
  const expectedPrices = active ? ["₩1,500", "₩1,500", "₩1,500"] : ["₩5,500", "₩39,000", "₩79,000"];
  for (const [index, price] of (await page.locator(".plan-card .plan-price").all()).entries()) {
    await expect(price).toHaveText(expectedPrices[index]);
  }
  if (active) await expect(page.getByRole("link", { name: "이벤트·FAQ 보기" })).toHaveAttribute("href", "/ko/events");
});
