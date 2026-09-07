import { expect, test } from "@playwright/test";
import { SPACE_EXAMPLES, spaceExample } from "../../src/core/space/examples";
for (const example of SPACE_EXAMPLES) test(`visual geometry fixture: ${example}`, async ({ page }, testInfo) => {
  const loadStarted = Date.now();
  const failures: string[] = []; page.on("console", msg => { if (msg.type() === "error") failures.push(msg.text()); }); page.on("pageerror", error => failures.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/en/space");
  await page.getByRole("combobox", { name: "Example space", exact: true }).selectOption(example);
  const view = page.locator("[data-scene-state]"); await expect(view).toHaveAttribute("data-scene-state", JSON.stringify(spaceExample(example).objects.map(o => ({ id: o.id, x: o.x, z: o.z, rotation: o.rotation }))), { timeout: 20000 });
  await expect(view).toHaveAttribute("data-triangles", /[1-9]\d*/);
  const metrics = { readyMs: Date.now() - loadStarted, ...await view.evaluate(element => ({ calls: Number((element as HTMLElement).dataset.drawCalls), triangles: Number((element as HTMLElement).dataset.triangles), textureCount: Number((element as HTMLElement).dataset.textureCount) })) };
  expect(metrics.triangles).toBeGreaterThan(1000); expect(metrics.calls).toBeLessThan(180); expect(metrics.triangles).toBeLessThan(400_000);
  await testInfo.attach("scene-render-budget", { body: JSON.stringify(metrics), contentType: "application/json" });
  expect(failures).toEqual([]);
  await expect(view.locator("..")).toHaveScreenshot(`${example}.png`, { animations: "disabled", threshold: .10, maxDiffPixelRatio: .01 });
});
test("selection, validated adjustment, undo and same-camera comparison", async ({ page }, testInfo) => {
  await page.goto("/en/space"); await page.getByRole("combobox", { name: "Select furniture", exact: true }).selectOption("desk_1");
  const view = page.locator("[data-scene-state]"); await expect(view).toHaveAttribute("data-object-count", "6", { timeout: 20000 }); await expect(view).toHaveAttribute("data-triangles", /[1-9]/);
  await expect(view).toHaveAttribute("data-selected-object", "desk_1");
  const camera = await view.getAttribute("data-camera");
  await page.getByRole("button", { name: "Move furniture → 10cm", exact: true }).click();
  await expect(view).toHaveAttribute("data-scene-state", /"x":3.1/);
  await expect(view).toHaveAttribute("data-motion", "settled", { timeout: 10000 });
  await page.getByRole("button", { name: "Undo edit", exact: true }).click(); await expect(view).toHaveAttribute("data-scene-state", /"x":3,/);
  await page.getByRole("checkbox", { name: "I checked north" }).check();
  await page.getByRole("checkbox", { name: "I compared the room, openings and furniture with the actual space" }).check();
  await page.getByRole("button", { name: "Analyze demo room", exact: true }).click();
  const before = await view.getAttribute("data-scene-state");
  await expect(view).toHaveAttribute("data-motion", "settled");
  await page.getByRole("button", { name: "Suggested layout", exact: true }).click();
  await expect(view).not.toHaveAttribute("data-scene-state", before!); await expect(view).toHaveAttribute("data-camera", camera!);
  await expect(view).toHaveAttribute("data-motion", "settled", { timeout: 10000 });
  await page.getByRole("button", { name: "Current layout", exact: true }).click(); await expect(view).toHaveAttribute("data-scene-state", before!);
  // Measure the settled adaptive tier after initial shader/quality warm-up; retain the
  // pre-fallback measurement separately. This is browser timing, not physical-device evidence.
  for (let i = 0; i < 8; i++) {
    await page.getByRole("button", { name: "Move furniture → 10cm", exact: true }).click();
    await expect(view).toHaveAttribute("data-scene-state", /"x":3.1/); await expect(view).toHaveAttribute("data-motion", "settled", { timeout: 10000 });
    await page.getByRole("button", { name: "Undo edit", exact: true }).click(); await expect(view).toHaveAttribute("data-scene-state", /"x":3,/); await expect(view).toHaveAttribute("data-motion", "settled", { timeout: 10000 });
    if (i >= 1 && Number(await view.getAttribute("data-sampled-frames")) >= 12) break;
  }
  await expect(view).toHaveAttribute("data-sampled-frames", /[1-9]/);
  const measured = await view.evaluate(element => ({ p90Ms: Number((element as HTMLElement).dataset.frameP90), cpuRenderP90Ms: Number((element as HTMLElement).dataset.renderMsP90), textureCount: Number((element as HTMLElement).dataset.textureCount), quality: (element as HTMLElement).dataset.quality, beforeFallbackFrameP90Ms: Number((element as HTMLElement).dataset.beforeFallbackFrameP90 || 0) }));
  await testInfo.attach("active-frame-timing", { body: JSON.stringify(measured), contentType: "application/json" });
  const gpu = await view.locator("canvas").evaluate(canvas => { const gl = (canvas as HTMLCanvasElement).getContext("webgl2"); const extension = gl?.getExtension("WEBGL_debug_renderer_info"); return gl && extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) as string : "unavailable"; });
  await testInfo.attach("renderer-backend", { body: gpu, contentType: "text/plain" });
  await testInfo.attach("performance-environment", { body: JSON.stringify(await view.evaluate(element => {
    const canvas = element.querySelector("canvas")!, rect = element.getBoundingClientRect();
    return { visibility: document.visibilityState, viewport: [innerWidth, innerHeight], pixelRatio: devicePixelRatio, canvasPixels: [canvas.width, canvas.height], canvasRect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, hardwareConcurrency: navigator.hardwareConcurrency, userAgent: navigator.userAgent };
  })), contentType: "application/json" });
  // Keep the same blocking threshold, but retain backend evidence and comparison
  // captures even when a runner cannot meet it. A soft failure still fails the test.
  expect.soft(measured.p90Ms).toBeLessThan(100);
  // Direct corrections deliberately invalidate analysis. Re-analyze the restored
  // scene before capturing a fresh current/recommended pair at the warmed tier.
  await page.getByRole("checkbox", { name: "I compared the room, openings and furniture with the actual space" }).check();
  await page.getByRole("button", { name: "Analyze demo room", exact: true }).click();
  const tier = await view.getAttribute("data-quality");
  await expect(view.locator("..")).toHaveScreenshot("current-layout.png", { animations: "disabled", threshold: .10, maxDiffPixelRatio: .01 });
  await page.getByRole("button", { name: "Suggested layout", exact: true }).click(); await expect(view).toHaveAttribute("data-motion", "settled", { timeout: 10000 });
  await expect(view).toHaveAttribute("data-quality", tier!); await expect(view).toHaveAttribute("data-camera", camera!);
  await expect(view.locator("..")).toHaveScreenshot("recommended-layout.png", { animations: "disabled", threshold: .10, maxDiffPixelRatio: .01 });
});
test("irregular room is explicitly unsupported and never silently reshaped", async ({ page }) => {
  await page.goto("/en/space"); const view = page.locator("[data-scene-state]"); await expect(view).toHaveAttribute("data-object-count", "6", { timeout: 20000 }); await expect(view).toHaveAttribute("data-triangles", /[1-9]/); const before = await view.getAttribute("data-scene-state");
  await page.getByRole("combobox", { name: "Example space", exact: true }).selectOption("irregular_room"); await expect(page.locator("main").getByRole("alert")).toContainText("Irregular rooms are not supported"); await expect(view).toHaveAttribute("data-scene-state", before!);
});

for (const example of ["small_bedroom", "living_room"] as const) test(`interior material and asset review: ${example}`, async ({ page }) => {
  const failures: string[] = []; page.on("console", msg => { if (msg.type() === "error") failures.push(msg.text()); }); page.on("pageerror", error => failures.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/en/space");
  await page.getByRole("combobox", { name: "Example space", exact: true }).selectOption(example);
  const view = page.locator("[data-scene-state]"); await expect(view).toHaveAttribute("data-object-count", example === "small_bedroom" ? "6" : "7", { timeout: 20000 }); await expect(view).toHaveAttribute("data-triangles", /[1-9]/);
  await page.getByRole("button", { name: "Recommended view", exact: true }).click();
  await expect(view.locator("..")).toHaveScreenshot(`${example}-interior.png`, { animations: "disabled", threshold: .10, maxDiffPixelRatio: .01 });
  expect(failures).toEqual([]);
});
test("failed material load releases the canvas and retry restores one renderer", async ({ page }) => {
  await page.route("**/space/assets/oak-floor-color.jpg", route => route.fulfill({ status: 503, body: "synthetic outage" })); await page.goto("/en/space");
  await expect(page.getByRole("button", { name: "Retry 3D" })).toBeVisible({ timeout: 20000 }); expect(await page.locator("canvas").count()).toBe(0);
  await page.unroute("**/space/assets/oak-floor-color.jpg"); await page.getByRole("button", { name: "Retry 3D" }).click();
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-object-count", "6", { timeout: 20000 }); expect(await page.locator("canvas").count()).toBe(1);
});

test("a stalled asset reaches retry without leaving a half-mounted renderer", async ({ page }) => {
  let release: (() => void) | undefined;
  await page.route("**/space/assets/oak-floor-color.jpg", async route => { await new Promise<void>(resolve => { release = resolve; }); await route.abort().catch(() => {}); });
  try {
    await page.goto("/en/space");
    await expect(page.getByRole("button", { name: "Retry 3D" })).toBeVisible({ timeout: 22000 }); expect(await page.locator("canvas").count()).toBe(0);
  } finally { release?.(); }
});
test("a GPU draw exception releases the frozen scene and exposes retry", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      const context = original.apply(this, args);
      if (context && "drawElements" in context) {
        const gl = context as WebGLRenderingContext, draw = gl.drawElements.bind(gl);
        gl.drawElements = (...values) => { if (document.documentElement.dataset.syntheticDrawFailure === "1") { delete document.documentElement.dataset.syntheticDrawFailure; throw new Error("synthetic GPU draw failure"); } draw(...values); };
      }
      return context;
    } as typeof original;
  });
  await page.goto("/en/space"); await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-object-count", "6", { timeout: 20000 });
  await page.evaluate(() => { document.documentElement.dataset.syntheticDrawFailure = "1"; });
  await page.getByRole("button", { name: "Rotate view", exact: true }).click();
  await expect(page.getByRole("button", { name: "Retry 3D", exact: true })).toBeVisible(); expect(await page.locator("canvas").count()).toBe(0);
  await page.getByRole("button", { name: "Retry 3D", exact: true }).click(); await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-object-count", "6", { timeout: 20000 });
});
