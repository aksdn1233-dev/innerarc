import { expect, test } from "@playwright/test";
import { SPACE_EXAMPLES, spaceExample } from "../../src/core/space/examples";
import { isSoftwareRendererName } from "../../src/components/space/frame-timing";
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
test("selection, validated adjustment, undo and same-camera comparison", async ({ page }) => {
  await page.goto("/en/space"); await page.getByRole("combobox", { name: "Select furniture", exact: true }).selectOption("desk_1");
  const view = page.locator("[data-scene-state]"); await expect(view).toHaveAttribute("data-object-count", "6", { timeout: 20000 }); await expect(view).toHaveAttribute("data-triangles", /[1-9]/);
  await expect(view).toHaveAttribute("data-selected-object", "desk_1");
  const camera = await view.getAttribute("data-camera");
  await page.getByRole("button", { name: "Move furniture → 10cm", exact: true }).click();
  await expect(view).toHaveAttribute("data-scene-state", /"x":3.1/);
  await expect(view).toHaveAttribute("data-motion", "settled", { timeout: 10000 });
  await expect(view).toHaveAttribute("data-motion-policy", "offscreen-snap");
  await page.getByRole("button", { name: "Undo edit", exact: true }).click(); await expect(view).toHaveAttribute("data-scene-state", /"x":3,/);
  await page.getByRole("checkbox", { name: "I checked north" }).check();
  await page.getByRole("checkbox", { name: "I compared the room, openings and furniture with the actual space" }).check();
  await page.getByRole("button", { name: "Analyze demo room", exact: true }).click();
  const before = await view.getAttribute("data-scene-state");
  await expect(view).toHaveAttribute("data-motion", "settled");
  await page.getByRole("button", { name: "Suggested layout", exact: true }).click();
  await expect(view).not.toHaveAttribute("data-scene-state", before!); await expect(view).toHaveAttribute("data-camera", camera!);
  await expect(view).toHaveAttribute("data-comparison-changes", /[1-9]/);
  await expect(view).toHaveAttribute("data-motion", "settled", { timeout: 10000 });
  await page.getByRole("button", { name: "Current layout", exact: true }).click(); await expect(view).toHaveAttribute("data-scene-state", before!);
  await expect(view.locator("..")).toHaveScreenshot("current-layout.png", { animations: "disabled", threshold: .10, maxDiffPixelRatio: .01 });
  await view.locator("xpath=../../..").evaluate(element => element.scrollIntoView({ block: "start" }));
  await expect(page).toHaveScreenshot("current-layout-panel.png", { animations: "disabled", threshold: .10, maxDiffPixelRatio: .01 });
  await page.getByRole("button", { name: "Suggested layout", exact: true }).click(); await expect(view).toHaveAttribute("data-motion", "settled", { timeout: 10000 });
  await expect(view).toHaveAttribute("data-camera", camera!);
  await expect(view.locator("..")).toHaveScreenshot("recommended-layout.png", { animations: "disabled", threshold: .10, maxDiffPixelRatio: .01 });
  await expect(page).toHaveScreenshot("recommended-layout-panel.png", { animations: "disabled", threshold: .10, maxDiffPixelRatio: .01 });
});

test("Ultra Preview exposes its real render profile", async ({ page }) => {
  await page.goto("/en/space");
  const view = page.locator("[data-scene-state]"); await expect(view).toHaveAttribute("data-object-count", "6", { timeout: 20000 });
  await page.getByRole("combobox", { name: "Quality", exact: true }).selectOption("ultra");
  await expect(view).toHaveAttribute("data-effective-quality", "ultra");
  await expect(view).toHaveAttribute("data-preview-profile", "ultra-preview");
  await expect(view).toHaveAttribute("data-render-scale", /^(2\.00|2\.50)$/);
  expect(await view.locator("canvas").evaluate(canvas => (canvas as HTMLCanvasElement).width / canvas.getBoundingClientRect().width)).toBeGreaterThanOrEqual(1.99);
  const dimensions = await view.evaluate(element => ({ css: [Number((element as HTMLElement).dataset.cssWidth), Number((element as HTMLElement).dataset.cssHeight)], render: [Number((element as HTMLElement).dataset.renderWidth), Number((element as HTMLElement).dataset.renderHeight)] }));
  expect(dimensions.render[0]).toBeGreaterThanOrEqual(dimensions.css[0] * 1.99); expect(dimensions.render[1]).toBeGreaterThanOrEqual(dimensions.css[1] * 1.99);
  await expect(page.getByLabel("Actual 3D render resolution")).toContainText(/Actual render \d+×\d+/);
  await page.getByRole("button", { name: "Recommended", exact: true }).click();
  await expect(page.getByRole("button", { name: "Recommended", exact: true })).toHaveAttribute("aria-pressed", "true");
  // Ultra deliberately renders at a higher internal resolution. Allow a constrained
  // CI software renderer to finish the same pixel comparison without weakening it.
  await expect(view.locator("..")).toHaveScreenshot("ultra-preview.png", { animations: "disabled", threshold: .10, maxDiffPixelRatio: .01, timeout: 15000 });
});

test("lightweight tier stays within the active-frame budget", async ({ page }, testInfo) => {
  await page.goto("/en/space");
  const view = page.locator("[data-scene-state]"); await expect(view).toHaveAttribute("data-object-count", "6", { timeout: 20000 }); await expect(view).toHaveAttribute("data-triangles", /[1-9]/);
  const setSelect = async (name: string, value: string) => page.getByRole("combobox", { name, exact: true }).evaluate((element, next) => {
    const select = element as HTMLSelectElement; select.value = next; select.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
  // The fixed-tier benchmark is not a select actionability test. Dispatch the same
  // change event without Playwright scrolling the canvas and waiting for it to settle.
  await setSelect("Select furniture", "desk_1"); await setSelect("Quality", "performance");
  await expect(view).toHaveAttribute("data-effective-quality", "performance");
  await expect(view).toHaveAttribute("data-shadow-mode", "performance-unshadowed");
  const gpu = await view.locator("canvas").evaluate(canvas => { const gl = (canvas as HTMLCanvasElement).getContext("webgl2"); const extension = gl?.getExtension("WEBGL_debug_renderer_info"); return gl && extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) as string : "unavailable"; });
  await testInfo.attach("renderer-backend", { body: gpu, contentType: "text/plain" });
  const software = isSoftwareRendererName(gpu);
  // Every backend is compared under the same render policy; the automatic threshold
  // is covered by unit tests. Keep the canvas visible because browsers throttle
  // requestAnimationFrame for fully offscreen content, which is a power policy rather
  // than renderer throughput. Programmatic click avoids scrolling back to the editor.
  await view.scrollIntoViewIfNeeded();
  await expect.poll(() => view.evaluate(element => {
    const rect = element.getBoundingClientRect(); return rect.bottom > 0 && rect.top < innerHeight;
  })).toBe(true);
  const move = page.getByRole("button", { name: "Move furniture → 10cm", exact: true });
  const undo = page.getByRole("button", { name: "Undo edit", exact: true });
  const commit = async (button: typeof move, expected: string) => button.evaluate((element: HTMLButtonElement, state) => new Promise<number>(resolve => {
    const scene = document.querySelector<HTMLElement>("[data-scene-state]")!, started = performance.now();
    const observer = new MutationObserver(() => { if (scene.dataset.sceneState?.includes(state)) { observer.disconnect(); resolve(performance.now() - started); } });
    observer.observe(scene, { attributes: true, attributeFilter: ["data-scene-state"] }); element.click();
  }), expected);
  let responseMs = 0, adaptive = false;
  if (software) {
    responseMs = Math.max(await commit(move, '"x":3.1'), await commit(undo, '"x":3,'));
    await expect(view).toHaveAttribute("data-motion-policy", "software-snap");
  } else {
    for (let i = 0; i < 8; i++) {
      const moveMs = await commit(move, '"x":3.1'); const movePolicy = await view.getAttribute("data-motion-policy");
      if (movePolicy === "adaptive-snap") { adaptive = true; responseMs = Math.max(responseMs, moveMs); }
      else { expect(movePolicy).toBe("animated"); await expect(view).toHaveAttribute("data-motion", "settled", { timeout: 10000 }); }
      const undoMs = await commit(undo, '"x":3,'); const undoPolicy = await view.getAttribute("data-motion-policy");
      if (undoPolicy === "adaptive-snap") { adaptive = true; responseMs = Math.max(responseMs, undoMs); }
      else { expect(undoPolicy).toBe("animated"); await expect(view).toHaveAttribute("data-motion", "settled", { timeout: 10000 }); }
      if (adaptive || (i >= 1 && Number(await view.getAttribute("data-sampled-frames")) >= 12)) break;
    }
    if (adaptive) { await expect(view).toHaveAttribute("data-scheduler-policy", "immediate"); await expect(view).toHaveAttribute("data-motion-policy", "adaptive-snap"); }
    else await expect(view).toHaveAttribute("data-sampled-frames", /[1-9]/);
  }
  const measured = await view.evaluate((element, snapMs) => { const canvas = element.querySelector("canvas")!, rect = canvas.getBoundingClientRect(); return { p90Ms: Number((element as HTMLElement).dataset.frameP90), responseMs: snapMs, cpuRenderP90Ms: Number((element as HTMLElement).dataset.renderMsP90), drawCalls: Number((element as HTMLElement).dataset.drawCalls), triangles: Number((element as HTMLElement).dataset.triangles), textureCount: Number((element as HTMLElement).dataset.textureCount), textureBytesEstimate: Number((element as HTMLElement).dataset.textureBytesEstimate), quality: (element as HTMLElement).dataset.quality, shadowMode: (element as HTMLElement).dataset.shadowMode, motionPolicy: (element as HTMLElement).dataset.motionPolicy, schedulerPolicy: (element as HTMLElement).dataset.schedulerPolicy, canvasScale: canvas.width / rect.width, beforeFallbackFrameP90Ms: Number((element as HTMLElement).dataset.beforeFallbackFrameP90 || 0) }; }, responseMs);
  await testInfo.attach("active-frame-timing", { body: JSON.stringify(measured), contentType: "application/json" });
  expect(measured.shadowMode).toBe("performance-unshadowed");
  expect(measured.canvasScale).toBeLessThanOrEqual(.71);
  await testInfo.attach("performance-environment", { body: JSON.stringify(await view.evaluate(element => {
    const canvas = element.querySelector("canvas")!, rect = element.getBoundingClientRect();
    return { visibility: document.visibilityState, viewport: [innerWidth, innerHeight], pixelRatio: devicePixelRatio, canvasPixels: [canvas.width, canvas.height], canvasRect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, hardwareConcurrency: navigator.hardwareConcurrency, userAgent: navigator.userAgent };
  })), contentType: "application/json" });
  // Smooth hardware motion and evidence-driven immediate response share the same ceiling.
  expect.soft(software || measured.motionPolicy === "adaptive-snap" ? measured.responseMs : measured.p90Ms).toBeLessThan(100);
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
  await page.getByRole("button", { name: "Recommended", exact: true }).click();
  await expect(view.locator("..")).toHaveScreenshot(`${example}-interior.png`, { animations: "disabled", threshold: .10, maxDiffPixelRatio: .01, timeout: 15_000 });
  expect(failures).toEqual([]);
});
test("failed material load releases the canvas and retry restores one renderer", async ({ page }) => {
  await page.route("**/space/assets/oak-floor-color.jpg", route => route.fulfill({ status: 503, body: "synthetic outage" })); await page.goto("/en/space");
  await expect(page.getByRole("button", { name: "Retry 3D" })).toBeVisible({ timeout: 20000 }); expect(await page.locator("canvas").count()).toBe(0);
  await page.unroute("**/space/assets/oak-floor-color.jpg"); await page.getByRole("button", { name: "Retry 3D" }).click();
  // A fresh WebGL context and all bounded assets are rebuilt after disposal. Allow
  // the constrained WebKit runner its 15s download ceiling plus context setup time.
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-object-count", "6", { timeout: 30000 }); expect(await page.locator("canvas").count()).toBe(1);
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
