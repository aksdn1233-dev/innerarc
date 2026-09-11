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

test("compatibility offers the five plain-language relationship choices", async ({ page }) => {
  await page.goto("/ko/compatibility");
  await expect(page.locator("#compatibility-type option")).toHaveText([
    "애인", "직장 동료", "가족", "친구", "동업",
  ]);
});

test("compatibility intake keeps the action label centered and the privacy flow readable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ko/compatibility");

  await expect(page.getByRole("heading", { name: "두 사람의 결을 나란히 놓아보세요" })).toBeVisible();
  await expect(page.getByText("입력 정보는 이 화면에 머뭅니다")).toBeVisible();
  await expect(page.locator(".compatibility-orbit")).toHaveCount(0);

  const personCardRadius = await page.locator(".person-grid fieldset").first().evaluate((fieldset) =>
    getComputedStyle(fieldset).borderRadius,
  );
  expect(personCardRadius).toBe("0px");

  const alignment = await page.getByRole("button", { name: "관계 패턴 비교" }).evaluate((button) => {
    const label = button.querySelector("span");
    if (!label) return null;
    const buttonRect = button.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    return {
      horizontal: Math.abs((buttonRect.left + buttonRect.width / 2) - (labelRect.left + labelRect.width / 2)),
      vertical: Math.abs((buttonRect.top + buttonRect.height / 2) - (labelRect.top + labelRect.height / 2)),
      minHeight: buttonRect.height,
    };
  });

  expect(alignment).not.toBeNull();
  expect(alignment!.horizontal).toBeLessThan(2);
  expect(alignment!.vertical).toBeLessThan(2);
  expect(alignment!.minHeight).toBeGreaterThanOrEqual(44);
});

test("family comparison keeps consent and renders all eight operating areas", async ({ page }) => {
  await page.goto("/ko/compatibility");
  await page.locator("#compatibility-birth-a").fill("1994-11-04");
  await page.locator("#compatibility-birth-b").fill("1988-03-17");
  await page.locator("#compatibility-type").selectOption("family");
  const consent = page.getByRole("checkbox");
  await expect(consent).toBeVisible();
  await consent.evaluate((element: HTMLInputElement) => element.click());
  await expect(consent).toBeChecked();
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
    await expect(page.locator(".sample-report-notice")).toContainText("결제·주문·저장은 발생하지 않습니다");
    const readingPanels = kind === "saju"
      ? await page.locator("[data-webtoon-panel]").count()
      : await page.locator(".ed-paper-section, .ed-ink-section, .ed-reality-section, .ed-closing").count();
    expect(readingPanels).toBeGreaterThan(5);
    await expect(page.getByRole("button", { name: /결제|구매/ })).toHaveCount(0);
  }
});
