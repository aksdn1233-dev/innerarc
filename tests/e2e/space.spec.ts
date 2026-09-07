import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
const axe = readFileSync(path.resolve("node_modules/axe-core/axe.min.js"), "utf8");

test("space demo confirms, analyzes, compares, applies and invalidates edits", async ({ page }) => {
  const remote: string[] = [];
  page.on("request", request => { if (request.url().includes("api.openai.com") || request.url().includes("/api/space")) remote.push(request.url()); });
  await page.goto("/ko/space");
  await expect(page.locator("fieldset[data-ready]")).toHaveAttribute("data-ready", "true", { timeout: 10_000 });
  await expect(page.getByRole("heading", { name: "내 방을, 움직여 보기 전에.", exact: true })).toBeVisible();
  const analyze = page.getByRole("button", { name: "예시 방 분석", exact: true });
  await expect(analyze).toBeDisabled();
  for (const name of ["북쪽 방향을 확인했어요", "방·문·창·가구의 크기와 위치를 실제 공간과 비교했어요"]) {
    const checkbox = page.getByRole("checkbox", { name });
    await checkbox.evaluate((element: HTMLInputElement) => element.click());
    await expect(checkbox).toBeChecked();
  }
  await expect(analyze).toBeEnabled();
  await analyze.evaluate((element: HTMLButtonElement) => element.click());
  await expect(page.getByRole("region", { name: "공간 분석 결과" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("전통 풍수 해석", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("공간·생활 분석", { exact: true })).toBeVisible();
  const compare = page.getByRole("button", { name: "추천 배치", exact: true });
  await compare.click(); await expect(compare).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("region", { name: "공간 분석 결과" }).locator("article")).toHaveCount(3);
  await page.getByRole("button", { name: "실제로 적용했어요", exact: true }).first().click();
  await expect(page.getByText("연습 표시입니다. 저장하지 않습니다.", { exact: true })).toBeVisible();
  await page.getByLabel("방 가로 (m)", { exact: true }).fill("4.5");
  await expect(page.getByRole("region", { name: "공간 분석 결과" })).toHaveCount(0);
  await expect(analyze).toBeDisabled(); expect(remote).toEqual([]);
});
test("invalid north and bounds block the room and explain the error", async ({ page }) => {
  await page.goto("/ko/space");
  await page.getByLabel("북쪽 각도 (0~359°)").fill("360");
  await expect(page.getByText(/크기·위치 또는 겹침을 확인하세요/)).toBeVisible();
  await expect(page.getByRole("button", { name: "예시 방 분석", exact: true })).toBeDisabled();
  await page.getByLabel("북쪽 각도 (0~359°)").fill("0");
  await page.getByLabel("방 가로 (m)", { exact: true }).fill("2");
  await expect(page.getByText(/OUT_OF_BOUNDS/)).toBeVisible();
});
test("private workspace is login-gated and noindex; shared footer remains", async ({ page }) => {
  const response = await page.goto("/ko/space/workspace");
  expect(response?.headers()["x-robots-tag"]).toContain("noindex");
  await expect(page.getByRole("heading", { name: "내 방을 안전하게 보관하려면 로그인해 주세요" })).toBeVisible();
  await expect(page.getByText(/콘텐츠 보호 안내/)).toBeVisible();
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
});
test("space mobile layout, reduced motion and accessibility stay usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/en/space");
  await expect(page.getByRole("button", { name: "Top", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Top", exact: true }).click();
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.addScriptTag({ content: axe });
  const violations = await page.evaluate(async () => {
    const result = await (window as unknown as { axe: { run(options: unknown): Promise<{ violations: { id: string; impact: string }[] }> } }).axe.run({ runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } });
    return result.violations;
  });
  expect(violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
test("WebGL failure retains text analysis and offers retry", async ({ page }) => {
  await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, kind: string, ...args: unknown[]) { if (kind.includes("webgl")) return null; return Reflect.apply(original, this, [kind, ...args]); } as typeof original; });
  await page.goto("/en/space"); await expect(page.getByRole("button", { name: "Retry 3D" })).toBeVisible();
  await page.getByRole("checkbox", { name: "I checked north" }).check();
  await page.getByRole("checkbox", { name: "I compared the room, openings and furniture with the actual space" }).check();
  await page.getByRole("button", { name: "Analyze demo room", exact: true }).click();
  await expect(page.getByRole("region", { name: "Space analysis results" })).toBeVisible();
});

test("independent home menu follows the feature flag without changing reading links", async ({ page }) => {
  await page.goto("/ko");
  const menu = page.getByRole("navigation").getByRole("link", { name: "3D 공간운", exact: true });
  if (process.env.SPACE_ENABLED === "true") { await expect(menu).toBeVisible(); await menu.click(); await expect(page).toHaveURL(/\/ko\/space$/); }
  else await expect(menu).toHaveCount(0);
});
