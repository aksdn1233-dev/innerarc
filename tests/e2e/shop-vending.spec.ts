import { expect, test } from "@playwright/test";

test("accessory concept vending switches locally without leaking result variables", async ({ page }) => {
  await page.goto("/ko/shop");

  const result = page.locator(".shop-vending-result");
  await expect(result.getByRole("img")).toHaveAttribute("src", /saju-wood\.jpg/);
  await expect(result.getByText("AI 콘셉트 이미지", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "금(金)" }).click();
  await expect(result.getByRole("img")).toHaveAttribute("src", /saju-metal\.jpg/);
  await expect(result.getByText("49,000~99,000원", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "수비학 계산값" }).click();
  await page.getByRole("button", { name: "태도 수" }).click();
  await expect(result.getByRole("img")).toHaveAttribute("src", /numerology-attitude\.jpg/);
  await expect(result.getByText("19,000~35,000원", { exact: true })).toBeVisible();

  await expect(page.getByText("완제품 재고 없음 · 1:1 주문 제작", { exact: true })).toBeVisible();
  await expect(page.getByText(/착불 · 실제 택배사 운임 적용/)).toBeVisible();
  await expect(page.getByText(/하자·오배송·표시 내용 또는 계약과 다른 경우/)).toBeVisible();
  await expect(page.locator(".shop-product-card")).toHaveCount(24);
  await expect(page.locator(".shop-product-card dt")).toHaveCount(96);
  await expect(page.getByRole("heading", { name: "사주 오행 상품 15개" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "수비학 결과 상품 9개" })).toBeVisible();
  expect(new URL(page.url()).search).toBe("");
});
