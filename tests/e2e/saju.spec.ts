import { expect, test, type Page } from "@playwright/test";
import { resolveProductPricing } from "../../src/core/product-prices";

const pricing = resolveProductPricing();

async function answerIntake(page: Page, options: { hour?: string } = {}) {
  await page.locator("#saju-readingName").fill("결이");
  await page.getByRole("button", { name: /다음/ }).click();
  await page.getByRole("radio", { name: "여성" }).click();
  await page.getByRole("button", { name: /다음/ }).click();
  await page.locator("#saju-birthDate").fill("1994-11-04");
  await page.getByRole("button", { name: /다음/ }).click();
  await page.locator("#saju-birthHour").selectOption(options.hour ?? "사시");
  await page.getByRole("button", { name: /다음/ }).click();
  await page.getByRole("radio", { name: "돈" }).click();
  await page.getByRole("button", { name: /다음/ }).click();
  await page.getByRole("button", { name: "언제쯤 돈이 모일까요?" }).click();
  const consent = page.getByRole("checkbox");
  await consent.check();
  await page.getByRole("button", { name: /무료 풀이 보기/ }).click();
}

test("six questions lead to free chapters before any fee", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ko/saju");
  await expect(page.locator(".saju-intake-heading h1")).toBeVisible();
  const portrait = await page.locator(".saju-intake-heading img").boundingBox();
  expect(portrait?.width).toBe(64);
  expect(portrait?.height).toBe(64);
  await expect(page.locator("#saju-readingName")).toBeInViewport();
  await expect(page.getByText("1/6단계")).toBeVisible();
  await page.getByRole("button", { name: /다음/ }).click();
  await expect(page.locator(".saju-story-bubble")).toContainText("손님,");
  await expect(page.locator(".saju-story-bubble")).not.toContainText("손님님");
  await page.getByRole("button", { name: "이전 단계" }).click();
  await answerIntake(page);

  await expect(page.locator(".saju-story-chapter")).toHaveText("서막");
  await page.getByRole("button", { name: "다음 챕터" }).click();
  await expect(page.locator(".saju-story-pillar")).toHaveCount(4);
  await page.getByRole("button", { name: "다음 챕터" }).click();
  await expect(page.locator(".saju-story-stages li")).toHaveCount(3);
  await expect(page.locator(".saju-story-evidence").first()).toContainText("📐 근거");
  await page.getByRole("button", { name: "다음 챕터" }).click();
  // 1994-11-04: 1+9+9+4+1+1+0+4 = 29 → 2+9 = 11, a master number kept as is.
  await expect(page.locator('.saju-story-numbers [data-main="true"] dd')).toHaveText("11");
  await page.getByRole("button", { name: "다음 챕터" }).click();
  await expect(page.locator(".saju-story-pastlife")).toBeVisible({ timeout: 5_000 });
  await page.getByRole("button", { name: "다음 챕터" }).click();
  await expect(page.locator(".saju-story-meter")).toBeVisible();
  await expect(page.locator(".saju-story-share button")).toBeVisible();
  await expect(page.getByText(/태령/)).toHaveCount(0);
});

test("the fee chapter hands the chosen product to the existing checkout", async ({ page }) => {
  await page.goto("/ko/saju");
  await answerIntake(page);
  await page.getByRole("button", { name: "다음 챕터" }).click();
  await page.getByRole("button", { name: /잠긴 풀이 4개/ }).click();
  await expect(page.locator('[data-product-option="pro_30d"]')).toHaveAttribute("aria-checked", "true");
  await expect(page.locator('[data-product-option="plus_30d"]')).toContainText(pricing.prices.plus_30d.toLocaleString("ko-KR"));
  await page.locator('[data-product-option="plus_30d"]').click();
  await page.getByRole("button", { name: /원국 풀이 열기/ }).click();

  await expect(page).toHaveURL(/\/ko\/plans\?product=plus_30d$/);
  const draft = await page.evaluate(() => JSON.parse(sessionStorage.getItem("innerarc.checkoutDraft.v1") ?? "null"));
  expect(draft.name).toBe("결이");
  expect(draft.readingKind).toBe("saju_chart");
  expect(draft.focusId).toBe("money");
  expect(draft.birthTime).toBe("10:30");
});

test("an unknown birth time leaves the hour pillar empty instead of inventing one", async ({ page }) => {
  await page.goto("/ko/saju");
  await answerIntake(page, { hour: "unknown" });
  await page.getByRole("button", { name: "다음 챕터" }).click();
  await expect(page.getByText("시주는 비워두었습니다")).toBeVisible();
});
