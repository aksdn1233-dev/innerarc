import { expect, test } from "@playwright/test";
import axe from "axe-core";

const samples = [
  ["detail", "개인 패턴"],
  ["premium", "프리미엄"],
  ["saju", "사주 원국"],
] as const;

test("every public report sample stays readable on desktop and mobile", async ({ page }) => {
  test.slow();
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const [kind, label] of samples) {
      await page.goto(`/ko/samples/${kind}`);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(label);
      await expect(page.locator(".sample-report-notice")).toContainText("결제·주문·저장은 발생하지 않습니다");
      await expect(page.locator(".sample-report-tabs a")).toHaveCount(3);
      await expect(page.locator(`[href="/ko/samples/${kind}"]`)).toHaveAttribute("aria-current", "page");
      const readingPanels = kind === "detail" || kind === "premium"
        ? await page.locator(".ed-paper-section, .ed-ink-section, .ed-reality-section, .ed-closing").count()
        : await page.locator("[data-webtoon-panel]").count();
      expect(readingPanels).toBeGreaterThan(5);
      await expect(page.getByRole("link", { name: "홈으로" })).toBeVisible();

      const quality = await page.evaluate(() => ({
        brokenImages: [...document.images]
          .filter((image) => image.currentSrc && image.complete && image.naturalWidth === 0).length,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
      }));
      expect(quality.brokenImages).toBe(0);
      expect(quality.overflow).toBeLessThanOrEqual(1);
    }
  }
  expect(pageErrors).toEqual([]);
});

test("79,000원 premium sample uses the editorial report and deterministic accessory edit", async ({ page }) => {
  await page.goto("/ko/samples/premium");
  await expect(page.locator(".editorial-report-premium")).toBeVisible();
  await expect(page.locator(".ed-cover h1")).toContainText("프리미엄");
  await expect(page.locator(".ed-premium-feature")).toHaveCount(10);
  await expect(page.locator(".ed-premium-body")).toHaveCount(10);
  await expect(page.locator(".ed-premium-feature details")).toHaveCount(0);
  await expect(page.locator(".editorial-report-premium")).not.toContainText("프리미엄 확장");
  await expect(page.locator(".editorial-report-premium")).not.toContainText("을(를)");
  await expect(page.locator(".editorial-report-premium")).not.toContainText("이(가)");
  await expect(page.locator(".ed-accessory-grid > article")).toHaveCount(3);
  await expect(page.locator(".ed-accessory-grid > article small")).toContainText(["운명수 11", "태도수 6", "개인년 7"]);
  await expect(page.locator(".ed-accessory-grid a")).toHaveCount(3);
  await expect(page.locator(".ed-accessory-boundary")).toContainText("주문이나 결제는 진행되지 않습니다");
  await expect(page.locator(".ed-paper-section, .ed-ink-section, .ed-reality-section, .ed-closing")).toHaveCount(25);

  const quality = await page.evaluate(() => ({
    brokenImages: [...document.images].filter((image) => image.currentSrc && image.complete && image.naturalWidth === 0).length,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    longestPremiumParagraph: Math.max(...[...document.querySelectorAll(".ed-premium-feature p")].map((node) => node.textContent?.trim().length ?? 0)),
    duplicatePremiumParagraphs: (() => {
      const texts = [...document.querySelectorAll(".ed-premium-feature p")]
        .map((node) => node.textContent?.replace(/\s+/gu, " ").trim() ?? "")
        // Short evidence signals intentionally recur between the scenario and verification chapters.
        // Catch duplicated explanatory copy while allowing those shared facts to stay consistent.
        .filter((text) => text.length >= 60);
      return texts.filter((text, index) => texts.indexOf(text) !== index);
    })(),
  }));
  expect(quality.brokenImages).toBe(0);
  expect(quality.overflow).toBe(0);
  expect(quality.longestPremiumParagraph).toBeLessThanOrEqual(190);
  expect(quality.duplicatePremiumParagraphs).toEqual([]);
});

test("39,000원 editorial sample keeps its reading and accessibility contract", async ({ page }) => {
  await page.goto("/ko/samples/detail");
  await expect(page.locator(".ed-cover-facts dd")).toContainText(["1994-11-04", "남성"]);
  await expect(page.locator(".ed-strength-list > li")).toHaveCount(5);
  await expect(page.locator(".ed-shadow-list > article")).toHaveCount(5);
  await expect(page.locator(".ed-year-grid > article")).toHaveCount(3);
  await expect(page.locator(".ed-reality-section > ol > li")).toHaveCount(6);
  await expect(page.locator(".ed-action-list > li")).toHaveCount(3);
  await expect(page.locator(".ed-paper-section, .ed-ink-section, .ed-reality-section, .ed-closing")).toHaveCount(20);
  await expect(page.locator(".ed-closing h2")).not.toBeEmpty();

  const copyQuality = await page.evaluate(() => {
    const text = (selector: string) => [...document.querySelectorAll(selector)]
      .map((node) => node.textContent?.replace(/\s+/gu, " ").trim() ?? "")
      .filter(Boolean);
    const money = text(".ed-money-grid > article > p");
    const love = text(".ed-love-grid > article > p");
    const shadows = text(".ed-shadow-list > article p");
    const yearFocus = text(".ed-year-grid > article dd");
    const yearActions = text(".ed-year-action");
    const substantive = text(".editorial-report p, .editorial-report h3, .editorial-report dd, .editorial-report blockquote")
      .map((item) => item.replace(/^[“”"]+|[“”"]+$/gu, ""))
      .filter((item) => item.length >= 20);
    const substantiveCounts = new Map<string, number>();
    substantive.forEach((item) => substantiveCounts.set(item, (substantiveCounts.get(item) ?? 0) + 1));
    const patternDetails = [...document.querySelectorAll(".ed-pattern-block dl")].map((list) =>
      [...list.querySelectorAll("dd")].map((node) => node.textContent?.replace(/\s+/gu, " ").trim() ?? "").filter(Boolean),
    );
    return {
      moneyDistinct: new Set(money).size === money.length,
      loveDistinct: new Set(love).size === love.length,
      shadowsDistinct: new Set(shadows).size === shadows.length,
      yearFocusDistinct: new Set(yearFocus).size === yearFocus.length,
      yearActionsDistinct: new Set(yearActions).size === yearActions.length,
      patternDetailsDistinct: patternDetails.every((items) => new Set(items).size === items.length),
      futureCardsSayThisYear: text(".ed-year-grid > article").slice(1).filter((item) => item.includes("올해는")).length,
      duplicateSubstantive: [...substantiveCounts].filter(([, count]) => count > 1).map(([item]) => item),
    };
  });
  expect(copyQuality).toEqual({
    moneyDistinct: true,
    loveDistinct: true,
    shadowsDistinct: true,
    yearFocusDistinct: true,
    yearActionsDistinct: true,
    patternDetailsDistinct: true,
    futureCardsSayThisYear: 0,
    duplicateSubstantive: [],
  });

  await page.addScriptTag({ content: axe.source });
  const violations = await page.locator(".editorial-report").evaluate(async (context) => {
    const result = await (window as unknown as { axe: { run: (root: Element, options: object) => Promise<{ violations: { id: string; impact: string | null }[] }> } }).axe.run(context, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    });
    return result.violations.filter((item) => item.impact === "serious" || item.impact === "critical");
  });
  expect(violations).toEqual([]);
});
