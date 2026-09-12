import { expect, test } from "@playwright/test";

test("1994-11-04 keeps its calculation and gains selectable webtoon dialogue", async ({ page }) => {
  await page.goto("/ko/numerology");
  await page.locator("#birthDate").fill("1994-11-04");
  await page.locator('input[name="privacyRequired"]').check();
  await page.getByRole("button", { name: "내 핵심 패턴 보기" }).click();

  await expect(page.locator("[data-character]")).toHaveCount(5);
  await expect(page.locator("[data-character='taeryeong']").first()).toBeVisible();
  await expect(page.getByText("숫자는 이렇게 나왔어요")).toBeVisible();
  await expect(page.locator("[data-character] img[alt*='생년월일 패턴 결과']")).toHaveCount(5);
  await expect(page.locator(".number-tile").first()).toContainText("11");
  await expect(page.locator(".number-tile small")).toHaveCount(4);
  await expect(page.locator(".number-tile").first()).toContainText("삶 전체에서 반복되는 중심 방향");
  await expect(page.locator(".number-tile").first()).toContainText("직관과 균형 감각");
  await expect(page.locator("[data-character]").nth(1).locator("dl small")).toHaveCount(4);
  await expect(page.getByText("인생수").first()).toBeVisible();
  await expect(page.locator("main")).toContainText("과학적 예측·진단·치료");
});

test("the home and pattern guides each have one audible narration source", async ({ page }) => {
  await page.goto("/ko/numerology?focus=work");
  const readMedia = async (selector: string) => page.locator(selector).evaluate((element) => {
    const video = element.querySelector("video") as HTMLVideoElement;
    const audio = element.querySelector("audio") as HTMLAudioElement;
    return {
      audioAutoplay: audio.autoplay,
      audioMuted: audio.muted,
      videoMuted: video.muted,
    };
  });
  await expect.poll(() => readMedia(".hero-guide")).toEqual({
    audioAutoplay: false,
    audioMuted: false,
    videoMuted: true,
  });

  await page.goto("/ko/reading");
  await expect.poll(() => readMedia(".cinema-hero")).toEqual({
    audioAutoplay: false,
    audioMuted: false,
    videoMuted: true,
  });
});

test("English results explain the same four calculated numbers", async ({ page }) => {
  await page.goto("/en/numerology?focus=work");
  await page.locator("#birthDate").fill("1994-11-04");
  await page.locator('input[name="privacyRequired"]').check();
  await page.getByRole("button", { name: "Show my core pattern" }).click();

  await expect(page.locator(".number-tile small")).toHaveCount(4);
  await expect(page.locator(".number-tile").first()).toContainText("Your recurring direction across life");
  await expect(page.locator(".number-tile").first()).toContainText("intuition and balance");
});

test("the character panels stay inside all supported phone widths", async ({ page }) => {
  for (const width of [320, 360, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/ko/numerology");
    await page.locator("#birthDate").fill("1994-11-04");
    await page.locator('input[name="privacyRequired"]').check();
    await page.getByRole("button", { name: "내 핵심 패턴 보기" }).click();
    await expect(page.locator("[data-character]").first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(await page.locator("[data-character]").first().evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  }
});
