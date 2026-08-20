import { expect, test } from "@playwright/test";

test("main and free-pattern screens route to the separate Saju service hub", async ({ page }) => {
  await page.goto("/ko");
  await expect(page.getByRole("link", { name: "사주 서비스로 이동" })).toHaveAttribute("href", "/ko/fortune");
  await expect(page.getByRole("link", { name: "먼저 무료로 확인" })).toHaveAttribute("href", "/ko/numerology");
  await expect(page.getByRole("button", { name: "내 패턴 확인하기" })).toHaveCount(0);
  await expect(page.getByText("반복되는 선택엔, 이유가 있습니다")).toHaveCount(0);

  await page.goto("/ko/numerology");
  await expect(page.getByRole("link", { name: "사주 서비스로 이동" })).toHaveAttribute("href", "/ko/fortune");
  await expect(page.getByRole("heading", { name: "지금 필요한 관점의 해석자를 고르세요" })).toHaveCount(0);
});

test("the Saju service hub exposes real routes and labels unfinished services", async ({ page }) => {
  await page.goto("/ko/fortune");

  await expect(page.getByRole("heading", { level: 1, name: "오늘, 무엇이 가장 궁금하세요?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "지금 필요한 관점의 해석자를 고르세요" })).toBeVisible();
  await expect(page.locator(".numerology-guide-card")).toHaveCount(6);
  await expect(page.getByRole("link", { name: /먼저 내 사주 원국 만들기/ })).toHaveAttribute("href", "/ko/saju");
  await expect(page.getByRole("link", { name: /상세 리딩/ })).toHaveAttribute("href", "/ko/plans");
  await expect(page.getByRole("link", { name: /두 사람 궁합/ })).toHaveAttribute("href", "/ko/compatibility");
  await expect(page.getByRole("link", { name: /내 기록/ })).toHaveAttribute("href", "/ko/me");
  await expect(page.locator("article[data-state='unavailable']")).toHaveCount(2);
  await expect(page.locator("main")).toContainText("자기 성찰 도구");
  await expect(page.locator("main")).not.toContainText(/[四⌂◉□♡○]/);
  const navigation = page.getByRole("navigation", { name: "사주 서비스 탐색" });
  await expect(navigation.getByRole("link")).toHaveCount(4);
  await expect(navigation.getByRole("link", { name: "궁합" })).toHaveCount(0);
});

test("the Saju service hub preserves English route truth", async ({ page }) => {
  await page.goto("/en/fortune");
  await expect(page.getByRole("heading", { level: 1, name: "What are you most curious about today?" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Create my Four Pillars chart/ })).toHaveAttribute("href", "/en/saju");
  await expect(page.getByRole("link", { name: "한국어" })).toHaveAttribute("href", "/ko/fortune");
});
