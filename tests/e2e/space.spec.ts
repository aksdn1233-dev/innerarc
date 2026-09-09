import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
const axe = readFileSync(path.resolve("node_modules/axe-core/axe.min.js"), "utf8");

test("space demo confirms, analyzes, compares, applies and invalidates edits", async ({ page }) => {
  // This integration case boots the real WebGL scene and then exercises the full
  // state flow. Parallel CI runners can spend most of the default budget compiling
  // shaders, so keep the product assertions unchanged and give this one case the
  // documented slow-test allowance instead of relying on a retry.
  test.slow();
  const remote: string[] = [];
  page.on("request", request => { if (request.url().includes("api.openai.com") || request.url().includes("/api/space")) remote.push(request.url()); });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ko/space");
  await expect(page.locator("fieldset[data-ready]")).toHaveAttribute("data-ready", "true", { timeout: 10_000 });
  await expect(page.getByRole("heading", { name: "내 방을 찍고, 더 편한 배치를 찾아보세요.", exact: true })).toBeVisible();
  const analyze = page.getByRole("button", { name: "추천 배치 보기", exact: true });
  await expect(analyze).toBeDisabled();
  for (const name of ["북쪽 방향을 확인했어요", "방과 가구 위치를 확인했어요"]) {
    const checkbox = page.getByRole("checkbox", { name });
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  }
  await expect(analyze).toBeEnabled();
  await analyze.click();
  await expect(page.getByRole("region", { name: "공간 분석 결과" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("전통 풍수 해석", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("공간·생활 분석", { exact: true })).toBeVisible();
  const guide = page.getByLabel("3D 공간 안내");
  await expect(guide).toBeVisible({ timeout: 15_000 });
  await expect(guide).toHaveAttribute("data-anchor-object", /^(bed|desk|sofa|object|room)/);
  await expect(page.getByRole("button", { name: "다시 듣기", exact: true })).toBeDisabled();
  const unmute = page.getByRole("button", { name: "음성 켜기", exact: true });
  await unmute.click();
  await expect(page.getByRole("button", { name: "음소거", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "다시 듣기", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "자막", exact: true }).click();
  await expect(page.getByRole("button", { name: "자막", exact: true })).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "한눈에 비교", exact: true }).click();
  await expect(page.getByRole("button", { name: "한눈에 비교", exact: true })).toHaveAttribute("aria-pressed", "true");
  const compare = page.getByRole("button", { name: "추천", exact: true });
  await compare.click(); await expect(compare).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("region", { name: "공간 분석 결과" }).locator("article")).toHaveCount(3);
  await page.getByRole("button", { name: "3D에서 안내 보기", exact: true }).first().click();
  await expect(page.getByRole("button", { name: "3D에서 안내 보기", exact: true }).first()).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "실제로 적용했어요", exact: true }).first().click();
  await expect(page.getByText("연습 표시입니다. 저장하지 않습니다.", { exact: true })).toBeVisible();
  await page.getByText("방 크기와 가구 직접 고치기 (선택)", { exact: true }).click();
  await page.getByLabel("방 가로 (m)", { exact: true }).fill("4.5");
  await expect(page.getByRole("region", { name: "공간 분석 결과" })).toHaveCount(0);
  await expect(analyze).toBeDisabled(); expect(remote).toEqual([]);
});
test("invalid north and bounds block the room and explain the error", async ({ page }) => {
  await page.goto("/ko/space");
  await page.getByLabel("북쪽 각도 (0~359°)").fill("360");
  await expect(page.getByText(/크기·위치 또는 겹침을 확인하세요/)).toBeVisible();
  await expect(page.getByRole("button", { name: "추천 배치 보기", exact: true })).toBeDisabled();
  await page.getByLabel("북쪽 각도 (0~359°)").fill("0");
  await page.getByText("방 크기와 가구 직접 고치기 (선택)", { exact: true }).click();
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
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/ko/space");
  const typography = await page.evaluate(async () => {
    await document.fonts.ready;
    return {
      loaded: document.fonts.check('16px "Pretendard Local"'),
      family: getComputedStyle(document.querySelector(".pretendard-locale")!).fontFamily,
    };
  });
  expect(typography.loaded).toBe(true);
  expect(typography.family).toContain("Pretendard Local");
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-object-count", "8", { timeout: 20_000 });
  await expect(page.getByRole("button", { name: "전체 보기", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "방 안에서", exact: true }).click();
  await expect(page.locator("[data-camera-mode]")).toHaveAttribute("data-camera-mode", /hero|interior|overview_fallback/);
  await expect(page.getByRole("button", { name: "위에서", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "가구 자세히", exact: true }).click();
  await expect(page.locator("[data-camera-mode]")).toHaveAttribute("data-camera-mode", "detail");
  await page.getByRole("button", { name: "저녁", exact: true }).click();
  await expect(page.locator("[data-lighting-mode]" )).toHaveAttribute("data-lighting-mode", "evening");
  await page.getByRole("button", { name: "낮", exact: true }).click();
  await page.getByRole("button", { name: "위에서", exact: true }).click();
  await page.getByRole("button", { name: "확대", exact: true }).click();
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
  await page.getByRole("checkbox", { name: "I checked the room and furniture" }).check();
  await page.getByRole("button", { name: "See suggested layout", exact: true }).click();
  await expect(page.getByRole("region", { name: "Space analysis results" })).toBeVisible();
});

test("device speech failure keeps the anchored guide readable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: undefined });
  });
  await page.goto("/en/space");
  await expect(page.locator("fieldset[data-ready]")).toHaveAttribute("data-ready", "true", { timeout: 10_000 });
  for (const name of ["I checked north", "I checked the room and furniture"]) {
    const checkbox = page.getByRole("checkbox", { name });
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  }
  await page.getByRole("button", { name: "See suggested layout", exact: true }).click();
  await expect(page.getByLabel("3D space guide")).toBeVisible();
  await page.getByRole("button", { name: "Unmute", exact: true }).click();
  const replay = page.getByRole("button", { name: "Replay", exact: true });
  await expect(replay).toBeEnabled();
  await replay.click();
  await expect(page.getByLabel("3D space guide").getByRole("status")).toContainText("Device speech is unavailable");
  await expect(page.getByLabel("3D space guide").locator("p").first()).toBeVisible();
});

test("the home always shows a simple path to 3D room analysis", async ({ page }) => {
  await page.goto("/ko");
  await page.getByRole("button", { name: "안내 닫기" }).click();
  const menu = page.getByRole("navigation").getByRole("link", { name: "3D 공간운", exact: true });
  await expect(menu).toBeVisible();
  await expect(page.getByRole("heading", { name: "내 방, 어디를 바꾸면 좋을까요?", exact: true })).toBeVisible();
  await expect(page.getByText("방 사진 찍기", { exact: true })).toBeVisible();
  const roomLinks = page.getByRole("link", { name: "내 방 분석하기", exact: true });
  await expect(roomLinks).toHaveCount(1);
  await expect(roomLinks).toBeVisible();
  await menu.click();
  await expect(page).toHaveURL(/\/ko\/space$/);
});

test("speech exceptions retain captions and guide marker follows the camera", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: {
      cancel() {}, speak() { if ((window as unknown as { speechThrows?: boolean }).speechThrows) throw new Error("synthetic speech failure"); },
    } });
  });
  await page.goto("/en/space");
  await page.getByRole("checkbox", { name: "I checked north" }).check();
  await page.getByRole("checkbox", { name: "I checked the room and furniture" }).check();
  await page.getByRole("button", { name: "See suggested layout", exact: true }).click();
  const guide = page.getByLabel("3D space guide");
  await guide.getByRole("button", { name: "Unmute", exact: true }).click();
  await guide.getByRole("button", { name: "Replay", exact: true }).click();
  await expect(guide.getByRole("button", { name: "Speaking…", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Show guide in 3D", exact: true }).nth(1).click();
  await expect(guide.getByRole("button", { name: "Replay", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Show guide in 3D", exact: true }).first().click();
  await expect(guide.getByRole("button", { name: "Replay", exact: true })).toBeEnabled();
  await page.evaluate(() => { (window as unknown as { speechThrows: boolean }).speechThrows = true; });
  await guide.getByRole("button", { name: "Replay", exact: true }).click();
  await expect(guide.getByRole("status")).toContainText("Device speech is unavailable");
  await expect(guide.getByRole("button", { name: "Captions", exact: true })).toBeDisabled();
  await expect(guide.getByRole("button", { name: "Replay", exact: true })).toBeEnabled();
  const visibleScene = page.locator("[data-scene-state]");
  await expect(visibleScene).toHaveAttribute("data-motion", "settled");
  await expect.poll(async () => {
    const objects = JSON.parse((await visibleScene.getAttribute("data-scene-state"))!) as { id: string; x: number; z: number }[];
    const id = await guide.getAttribute("data-anchor-object");
    const object = objects.find(object => object.id === id);
    return !!object && (await guide.textContent())!.includes(`${object.x.toFixed(1)} metres from the left and ${object.z.toFixed(1)} metres from the top`);
  }).toBe(true);
  const marker = page.locator('span[data-anchor-object]');
  await expect(marker).toBeVisible();
  const before = await marker.getAttribute("style");
  await page.getByRole("button", { name: "Top", exact: true }).click();
  await expect(marker).not.toHaveAttribute("style", before!);
  await expect(marker).toHaveAttribute("data-anchor-object", (await guide.getAttribute("data-anchor-object"))!);
});

test("finishing 3D loading does not move mobile confirmation controls", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "This touch-layout stability case requires the configured coarse-pointer mobile device; desktop 390px uses the intentionally heavier desktop renderer.");
  await page.setViewportSize({ width: 390, height: 844 });
  let release!: () => void;
  const assetGate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/space/assets/oak-floor-color.jpg", async route => { await assetGate; await route.continue(); });
  try {
    await page.goto("/en/space");
    await expect(page.locator("[data-space-loading]")).toBeVisible();
    await page.getByRole("checkbox", { name: "I checked north" }).check();
    const confirmation = page.getByRole("checkbox", { name: "I checked the room and furniture" });
    await confirmation.scrollIntoViewIfNeeded();
    const before = await confirmation.evaluate(element => element.getBoundingClientRect().top + scrollY);
    release();
    await expect(page.locator("[data-space-loading]")).toHaveCount(0, { timeout: 30000 });
    const after = await confirmation.evaluate(element => element.getBoundingClientRect().top + scrollY);
    expect(Math.abs(after - before)).toBeLessThan(1);
    for (let i = 0; i < 3; i++) {
      await confirmation.check();
      await expect(confirmation).toBeChecked();
      await confirmation.uncheck();
      await expect(confirmation).not.toBeChecked();
    }
  } finally { release(); }
});
