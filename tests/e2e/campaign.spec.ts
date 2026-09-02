import { expect, test } from "@playwright/test";

test("one-week extension keeps the popup, event terms, and checkout prices aligned", async ({ page }) => {
  await page.goto("/ko");
  // The offer no longer interrupts on arrival: it waits until the visitor has read the
  // page and reached its closing section, so nothing covers the questions on the way.
  const dialog = page.getByRole("dialog", { name: /사주 원국·상세 리딩, 지금 1,500원/ });
  await expect(dialog).toHaveCount(0);
  await page.locator(".home-close").scrollIntoViewIfNeeded();
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("후기·공유 이벤트 진행 중");
  await expect(dialog).toContainText("신세계상품권 15만원 상당");
  await dialog.getByRole("button", { name: "팝업 닫기" }).click();
  await expect(dialog).toHaveCount(0);
  // The campaign links sit at the top of the page rather than floating over it, so they
  // are checked where they live instead of wherever the reader happens to have stopped.
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.getByRole("link", { name: "이벤트", exact: true })).toBeVisible();
  await expect(page.getByLabel("행사, 후기와 도움말").getByRole("link", { name: "후기" })).toBeVisible();
  expect(await page.evaluate(() =>
    getComputedStyle(document.querySelector(".campaign-utility-nav")!).position)).toBe("static");

  // Dismissal is session-scoped: navigation must not block the visitor again.
  await page.goto("/ko/fortune");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.goto("/ko/events");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("딱 일주일 더, 두 리딩 1,500원");
  await expect(page.getByText("사주 원국 5,500원 → 1,500원", { exact: false })).toBeVisible();
  await expect(page.getByText("프리미엄 심층 리딩 79,000원은 행사 제외", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "후기 남기고 15만원 상당 상품권" })).toBeVisible();
  await expect(page.getByText("당첨: 1명 · 신세계상품권 총 150,000원 상당", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: "내 리포트 찾아 후기 남기기" })).toBeVisible();
  await expect(page.getByRole("link", { name: "후기 카테고리 보기" })).toBeVisible();

  await page.goto("/ko/plans");
  await expect(page.getByText("사주 원국·상세 리딩 · 1,500원", { exact: true })).toBeVisible();
  await expect(page.locator(".plan-card .plan-price")).toHaveCount(3);
  await expect(page.locator(".plan-card .plan-price")).toHaveText(["₩1,500", "₩1,500", "₩79,000"]);
  await expect(page.locator(".plan-card del")).toHaveText(["₩5,500", "₩39,000"]);
  await expect(page.locator('[data-product="premium_pdf"]')).not.toContainText("1주일 연장 할인가");
  // The referral field only exists once a payment provider is configured, so asserting it
  // here failed every default run — and therefore every CI run, and therefore every
  // deploy. It is checked in payments.spec.ts, which runs with the provider shell.
});
