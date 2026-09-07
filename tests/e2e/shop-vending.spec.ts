import { expect, test } from "@playwright/test";

test("accessory concept vending switches locally without leaking result variables", async ({ page }) => {
  await page.goto("/ko/shop");

  const result = page.locator(".shop-vending-result");
  await expect(result.getByRole("img")).toHaveAttribute("src", /saju-wood\.jpg/);
  await expect(result.getByText("자동 생성 콘셉트 이미지", { exact: true })).toBeVisible();

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
  await expect(page.getByRole("link", { name: "상품 상세보기" })).toHaveCount(24);
  await expect(page.locator(".shop-product-card").first().getByRole("img", { name: /솔잎 결 펜던트/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "사주 오행 상품 15개" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "수비학 결과 상품 9개" })).toBeVisible();
  expect(new URL(page.url()).search).toBe("");
});

test("birth date curation recommends three products without persisting or changing the URL", async ({ page }) => {
  await page.goto("/ko/shop");
  await page.getByLabel("생년월일 (양력)").fill("1994-11-04");
  await page.getByRole("button", { name: "내 상품 추천 보기" }).evaluate((element: HTMLButtonElement) => element.click());

  const edit = page.locator(".shop-personal-edit");
  await expect(edit.locator("article")).toHaveCount(3, { timeout: 10_000 });
  await expect(edit.getByText("시그니처 모듈 팔찌", { exact: true })).toBeVisible();
  await expect(edit.getByText("컬러 블록 카드 참", { exact: true })).toBeVisible();
  await expect(edit.getByText("사이클 라인 트레이", { exact: true })).toBeVisible();
  await expect(edit.getByText(/수비학 상징을 상품 형태와 연결한 선택 가이드/)).toBeVisible();
  expect(new URL(page.url()).search).toBe("");

  await page.reload();
  await expect(page.locator(".shop-personal-edit")).toHaveCount(0);
});

test("each concept has an ecommerce-style detail page with three product-specific viewpoints", async ({ page }) => {
  await page.goto("/ko/shop/wood-leaf-pendant");

  await expect(page.getByRole("heading", { level: 1, name: "솔잎 결 펜던트" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "여러 시점에서 형태 확인하기" })).toBeVisible();
  await expect(page.locator(".shop-detail-gallery figure")).toHaveCount(3);
  await expect(page.getByText("정면 콘셉트", { exact: true })).toBeVisible();
  await expect(page.getByText("사선 콘셉트", { exact: true })).toBeVisible();
  await expect(page.getByText("측면·뒷면 구조 콘셉트", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /솔잎 결 펜던트 · 정면 콘셉트 · 이미지를 눌러 크게 보기/ }).first().click();
  const zoomDialog = page.getByRole("dialog", { name: "상품 콘셉트 확대 보기" });
  await expect(zoomDialog).toBeVisible();
  await zoomDialog.getByRole("button", { name: "확대", exact: true }).click();
  await expect(zoomDialog.getByLabel("현재 확대율")).toHaveText("150%");
  await zoomDialog.getByRole("button", { name: "측면·뒷면 구조 콘셉트" }).click();
  await expect(zoomDialog.getByRole("button", { name: "측면·뒷면 구조 콘셉트" })).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(zoomDialog).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "이 상품을 선택하기 전에" })).toBeVisible();
  await expect(page.getByText(/실제 판매품 사진이 아니며/)).toBeVisible();
  await expect(page.getByRole("button", { name: /결제|구매|장바구니/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "전체 상품으로 돌아가기" })).toHaveAttribute("href", "/ko/shop");
});

test("English product details preserve route and concept-only truth", async ({ page }) => {
  await page.goto("/en/shop/metal-precision-brooch");
  await expect(page.getByRole("heading", { level: 1, name: "Precision Square Brooch" })).toBeVisible();
  await expect(page.locator(".shop-detail-gallery figure")).toHaveCount(3);
  await expect(page.getByText(/They are not photographs of a delivered item/)).toBeVisible();
  await expect(page.getByRole("button", { name: /checkout|buy|cart/i })).toHaveCount(0);
});
