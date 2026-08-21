import { expect, test, type Locator } from "@playwright/test";

async function expectConsecutiveCharacterVoicesToVary(panels: Locator) {
  const beats = await panels.evaluateAll((nodes) => nodes.map((node) => ({
    character: node.getAttribute("data-character"),
    voice: node.querySelector(".webtoon-character-voice")?.textContent,
  })));

  for (let index = 1; index < beats.length; index += 1) {
    if (beats[index].character === beats[index - 1].character) {
      expect(beats[index].voice).not.toBe(beats[index - 1].voice);
    }
  }
}

async function expectTaeryeongToUseHonorifics(panels: Locator) {
  const voices = await panels.locator('[data-character="taeryeong"] .webtoon-character-voice').allTextContents();
  expect(voices.length).toBeGreaterThan(0);
  for (const voice of voices) expect(voice).toMatch(/(습니다|겠습니다|입니다|세요)\.”$/);
}

test("compatibility offers the five plain-language relationship choices", async ({ page }) => {
  await page.goto("/ko/compatibility");
  await expect(page.locator("#compatibility-type option")).toHaveText([
    "애인", "직장 동료", "가족", "친구", "동업",
  ]);
});

test("family comparison keeps consent and renders all eight operating areas", async ({ page }) => {
  await page.goto("/ko/compatibility");
  await page.locator("#compatibility-birth-a").fill("1994-11-04");
  await page.locator("#compatibility-birth-b").fill("1988-03-17");
  await page.locator("#compatibility-type").selectOption("family");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "관계 패턴 비교" }).click();

  await expect(page.locator("#compatibility-result")).toContainText("가족");
  await expect(page.locator("#compatibility-result .compatibility-card")).toHaveCount(8);
  await expect(page.locator("#compatibility-result .webtoon-story-character")).toHaveCount(9);
  await expect(page.locator("#compatibility-result .webtoon-story-bubble")).toHaveCount(9);
  await expect(page.locator("#compatibility-result .webtoon-character-voice")).toHaveCount(9);
  await expectConsecutiveCharacterVoicesToVary(page.locator("#compatibility-result .webtoon-story-panel"));
  await expect(page.locator("#compatibility-result .report-context-emphasis").first()).toBeVisible();
  await expect(page.locator("#compatibility-result .report-keyword-emphasis").first()).toBeVisible();
  await expect(page.locator("#compatibility-result")).toContainText("가족이라는 이유만으로");
});

test("fixed 941104 product samples create no checkout controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const kind of ["detail", "premium", "saju"]) {
    await page.goto(`/ko/samples/${kind}`);
    await expect(page.getByText("941104 결과 리포트 예시")).toBeVisible();
    await expect(page.getByText("결제·주문·저장은 발생하지 않습니다.")).toBeVisible();
    await expect(page.locator(".webtoon-story-panel").first()).toBeVisible();
    await expect(page.locator(".webtoon-story-character").first()).toBeVisible();
    const characterImage = await page.locator(".webtoon-story-character").first().evaluate((image) => {
      const element = image as HTMLImageElement;
      return {
        directAsset: !element.currentSrc.includes("/_next/image") && !element.currentSrc.includes("/_vinext/image"),
        naturalWidth: element.naturalWidth,
        renderedWidth: element.getBoundingClientRect().width,
      };
    });
    expect(characterImage.directAsset).toBe(true);
    expect(characterImage.naturalWidth).toBe(384);
    expect(characterImage.renderedWidth).toBeLessThanOrEqual(characterImage.naturalWidth);
    await expect(page.locator(".webtoon-story-bubble").first()).toBeVisible();
    await expect(page.locator(".webtoon-character-voice").first()).toBeVisible();
    await expectConsecutiveCharacterVoicesToVary(page.locator(".webtoon-story-panel"));
    if (kind === "detail") await expectTaeryeongToUseHonorifics(page.locator("main"));
    await expect(page.locator(".report-context-emphasis").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /결제|구매/ })).toHaveCount(0);
  }
});
