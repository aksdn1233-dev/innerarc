import { expect, test } from "@playwright/test";
import { resolveProductPricing } from "../../src/core/product-prices";
// Assert the server-authoritative schedule; the September 6 campaign has an end.
const pricing = resolveProductPricing();
const krw = (value: number) => value.toLocaleString("en-US");

test("main and free-pattern screens route to the separate Saju service hub", async ({ page }) => {
  await page.goto("/ko");
  await expect(page.getByRole("link", { name: "사주 보기", exact: true })).toHaveAttribute("href", "/ko/fortune");
  await expect(page.locator(".td2-nav").getByRole("link", { name: "수비학", exact: true })).toHaveAttribute(
    "href",
    "/ko/numerology",
  );
  await expect(page.getByRole("button", { name: "내 패턴 확인하기" })).toHaveCount(0);
  await expect(page.getByText("반복되는 선택엔, 이유가 있습니다")).toHaveCount(0);

  await page.goto("/ko/numerology");
  await expect(page.getByRole("link", { name: "사주 서비스로 이동" })).toHaveAttribute("href", "/ko/fortune");
  await expect(page.getByRole("heading", { name: "지금 필요한 관점의 해석자를 고르세요" })).toHaveCount(0);
});

test("the Saju service hub exposes real routes and labels unfinished services", async ({ page }) => {
  await page.goto("/ko/fortune");

  await expect(page.getByRole("heading", { level: 1, name: "오늘, 무엇이 가장 궁금하세요?" })).toBeVisible();
  await expect(page.locator("main")).toContainText("태령당 · FOUR PILLARS EDITION");
  await expect(page.locator("main")).toContainText("계산 근거 공개");
  await expect(page.locator("main")).toContainText("지금 곁에 선 해석자");
  await expect(page.locator("[data-phase]")).toHaveCount(5);
  await expect(page.getByRole("heading", { name: "지금 필요한 관점의 해석자를 고르세요" })).toBeVisible();
  await expect(page.locator(".numerology-guide-card")).toHaveCount(6);
  await expect(page.getByRole("link", { name: /먼저 내 사주 원국 만들기/ })).toHaveAttribute("href", "/ko/saju");
  await expect(page.getByRole("link", { name: /먼저 내 사주 원국 만들기/ })).toContainText(`1회 ${krw(pricing.prices.plus_30d)}원`);
  await expect(page.getByRole("link", { name: /상세 리딩/ })).toHaveAttribute("href", "/ko/plans");
  await expect(page.getByRole("link", { name: /상세 리딩/ })).toContainText(`상세 · ${krw(pricing.prices.pro_30d)}원`);
  await expect(page.getByRole("link", { name: /상세 리딩/ })).not.toContainText("상세 · 상세");
  await expect(page.getByRole("link", { name: /두 사람 궁합/ })).toHaveAttribute("href", "/ko/compatibility");
  await expect(page.getByRole("link", { name: /오늘의 흐름/ })).toHaveAttribute("href", "/ko/daily-fortune");
  await expect(page.getByRole("link", { name: /오늘의 흐름/ })).toContainText("무료");
  await expect(page.getByRole("link", { name: /내 기록/ })).toHaveAttribute("href", "/ko/me");
  await expect(page.locator("article[data-state='unavailable']")).toHaveCount(1);
  await expect(page.locator("[class*='grid'] [class*='serviceCharacter']")).toHaveCount(6);
  await expect(page.locator("main")).toContainText("자기 성찰 도구");
  await expect(page.locator("main")).not.toContainText(/[四⌂◉□♡○]/);
  const navigation = page.getByRole("navigation", { name: "사주 서비스 탐색" });
  await expect(navigation.getByRole("link")).toHaveCount(4);
  await expect(navigation.getByRole("link", { name: "궁합" })).toHaveCount(0);
});

test("the Saju service hub preserves English route truth", async ({ page }) => {
  await page.goto("/en/fortune");
  await expect(page.getByRole("heading", { level: 1, name: "What are you most curious about today?" })).toBeVisible();
  await expect(page.locator("main")).toContainText("Visible derivation");
  await expect(page.getByRole("link", { name: /Create my Four Pillars chart/ })).toHaveAttribute("href", "/en/saju");
  await expect(page.getByRole("link", { name: /Detailed reading/ })).toContainText(`Deep · ₩${krw(pricing.prices.pro_30d)}`);
  await expect(page.getByRole("link", { name: "한국어" })).toHaveAttribute("href", "/ko/fortune");
});

test("the Saju journey stays within a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ko/fortune");
  await expect(page.getByRole("link", { name: "English" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    await page.evaluate(() => document.documentElement.clientWidth),
  );

  await page.goto("/ko/saju");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});
