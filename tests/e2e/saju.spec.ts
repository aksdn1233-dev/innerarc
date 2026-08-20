import { expect, test } from "@playwright/test";
import { E2E_ORIGIN } from "./test-origin";

test("the free chart is given away, and the reading is what costs", async ({ page }) => {
  await page.goto("/ko/saju");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("사주 원국");

  await page.locator("#saju-birthDate").fill("1994-11-04");
  await page.locator("#saju-birthTime").fill("09:30");
  await page.getByRole("button", { name: "사주 세우기" }).click();

  // Four pillars, in the shape every almanac uses, calculated in the page.
  const chart = page.locator(".saju-chart");
  await expect(chart).toBeVisible();
  await expect(chart).toContainText("甲");
  await expect(chart).toContainText("戌");
  await expect(chart).toContainText("午");

  // The corrections are published, because they changed the answer.
  await page.getByText("이 결과가 나온 과정").click();
  await expect(page.locator(".saju-derivation")).toContainText("1994-11-04 08:57");
  await expect(page.locator(".saju-derivation")).toContainText("야자시");
  await expect(page.locator(".saju-derivation")).toContainText("saju-core-1.1.0");

  // Three viewpoints, each with its own derivation on demand.
  await expect(page.locator(".saju-viewpoint")).toHaveCount(3);
  await expect(page.locator(".saju-viewpoint h3").nth(0)).toHaveText("억부");
  await expect(page.locator(".saju-viewpoint h3").nth(1)).toHaveText("조후");
  await expect(page.locator(".saju-viewpoint h3").nth(2)).toHaveText("격국");
  await page.locator(".saju-viewpoint-open").first().click();
  await expect(page.locator(".saju-viewpoint-derivation").first()).toContainText("월지");

  // Paying is offered, never required to see the calculation.
  await expect(page.locator(".saju-upsell-honest")).toContainText("결제하지 않으셔도");
  await expect(page.locator(".saju-upsell-cta")).toHaveAttribute("href", "/ko/plans?product=pro_30d");

  // No living practitioner leaned on, and no claim of a fixed future. The pattern is
  // affirmative on purpose — the page's own disclaimer contains "보장하지 않습니다", and a
  // bare "보장" would flag the very sentence that makes the promise it is checking for.
  await expect(page.locator("main")).not.toContainText(
    /박성준|반드시 |보장합니다|보장해|운명이 정해|틀림없/,
  );
  await expect(page.locator(".saju-limits")).toContainText("미래를 확정해");
  expect(page.url()).toBe(`${E2E_ORIGIN}/ko/saju`);
});

test("an unknown birth time leaves the hour pillar empty instead of inventing one", async ({ page }) => {
  await page.goto("/ko/saju");
  await page.locator("#saju-birthDate").fill("1994-11-04");
  await page.getByRole("button", { name: "사주 세우기" }).click();

  await expect(page.locator(".saju-note")).toContainText("시주는 비워두었습니다");
  // The hour column is dashes, and the three pillars that can be read still are.
  await expect(page.locator(".saju-chart tbody tr").first().locator("td").first()).toHaveText("—");
  await expect(page.locator(".saju-chart")).toContainText("甲");
});

test("a date the engine will not stand behind is refused, not answered", async ({ page }) => {
  await page.goto("/ko/saju");
  await page.locator("#saju-birthDate").fill("1099-01-01");
  await page.getByRole("button", { name: "사주 세우기" }).click();
  // Scoped to the form's own error: `role="alert"` alone also matches Next's route
  // announcer, which is empty.
  await expect(page.locator(".saju-error")).toContainText("1100");
  await expect(page.locator(".saju-chart")).toHaveCount(0);
});

test("the English page shows the Korean chart with an English derivation", async ({ page }) => {
  await page.goto("/en/saju");
  await page.locator("#saju-birthDate").fill("1994-11-04");
  await page.locator("#saju-birthTime").fill("09:30");
  await page.getByRole("button", { name: "Build the chart" }).click();
  await expect(page.locator(".saju-chart")).toContainText("甲");
  await expect(page.getByText("How this result was reached")).toBeVisible();
  await expect(page.locator(".saju-limits")).toContainText("promises no luck");
});
