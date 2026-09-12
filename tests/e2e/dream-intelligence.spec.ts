import { expect, test } from "@playwright/test";
import axe from "axe-core";

async function seriousAccessibilityViolations(page: import("@playwright/test").Page) {
  await page.addScriptTag({ content: axe.source });
  return page.evaluate(async () => {
    const result = await (window as unknown as { axe: { run(options: object): Promise<{ violations: { id: string; impact: string | null }[] }> } }).axe.run({
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
    });
    return result.violations.filter((item) => item.impact === "serious" || item.impact === "critical");
  });
}

test("Dream Intelligence completes the journal, report and personal-pattern loop", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto("/ko/dreams");
  await expect(page).toHaveTitle(/꿈 패턴 기록/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.getByRole("textbox", { name: /^꿈 내용/ }).fill("어제 큰 뱀이 집 안으로 들어왔어요. 무섭지는 않았고 가만히 바라봤어요.");
  await page.getByLabel("요즘 가장 마음에 걸리는 일").fill("이직 제안을 받아 고민 중이에요.");
  await page.getByRole("button", { name: "꿈 살펴보기" }).click();
  for (const heading of ["전통에서는", "현대 연구에서는", "지금의 나에게는", "사주·생년월일 패턴과 비교", "나의 지난 꿈과 비교"]) await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  await expect(page.getByText("참고 수준", { exact: true })).toBeVisible();
  await expect(page.getByText(/과학적 검증과 별개의/)).toBeVisible();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("innerarc:dream-intelligence:v1")!));
  expect(stored.events[0].rawText).toBeNull();
  expect(stored.events[0].initialInterpretation.sourceIds.length).toBeGreaterThan(0);

  for (const text of ["학교 시험에 늦어서 불안한 꿈을 또 꿨어요.", "학교에 늦었고 시험을 놓칠까 불안했어요."]) {
    await page.getByRole("button", { name: "다른 꿈 기록하기" }).click();
    await page.getByLabel("꿈 내용").fill(text);
    await page.getByRole("button", { name: "꿈 살펴보기" }).click();
  }
  await expect(page.getByRole("heading", { name: /3개의 꿈에서 반복된 장면/ })).toBeVisible();
  await page.getByText("Reality Check", { exact: true }).first().click();
  await expect(page.getByText(/3일 · .*열려요/).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  expect(await seriousAccessibilityViolations(page)).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("English Dream Intelligence keeps the evidence and safety wording clear", async ({ page }) => {
  await page.goto("/en/dreams");
  await expect(page.getByRole("heading", { name: /Look for what repeats/ })).toBeVisible();
  await page.getByRole("textbox", { name: /^Dream 0/ }).fill("I dreamed that a recent movie scene appeared exactly as I watched it.");
  await page.getByRole("button", { name: "Explore this dream" }).click();
  await expect(page.getByRole("heading", { name: "Modern dream research" })).toBeVisible();
  await expect(page.getByText(/not prediction, diagnosis, treatment/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  expect(await seriousAccessibilityViolations(page)).toEqual([]);
});
