/**
 * Captures the four screens the home walkthrough shows.
 *
 * The walkthrough claims to be showing the actual product, so the pictures on it are
 * taken from the actual product rather than drawn. Re-run this whenever the question
 * list, the free-reading intake, the free result, or the paid report changes visually:
 *
 *   node scripts/serve-production.mjs        # in one shell, after `pnpm build`
 *   node scripts/capture-guide-screens.mjs   # in another
 *
 * Every capture ends on an element boundary measured in the page, never at a fixed
 * pixel height, so no screen is cut through a line of Korean text.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const BASE = process.env.CAPTURE_BASE_URL ?? "http://127.0.0.1:3000";
const OUT = new URL("../public/images/guide/", import.meta.url);
const WIDTH = 390;
/** Retina, so the screenshots stay legible when the frame scales them down. */
const SCALE = 2;
const SAMPLE_BIRTH_DATE = "1994-11-04";

/**
 * Page-coordinate box of an element.
 *
 * Everything here works in page coordinates, because `screenshot({ fullPage, clip })`
 * does. Playwright's own `boundingBox()` is viewport-relative, and mixing the two is
 * how the first version of this script ended up clipping outside the image.
 */
async function pageBox(page, selector) {
  return page.evaluate((sel) => {
    const node = document.querySelector(sel);
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    return {
      x: Math.round(rect.left + window.scrollX),
      y: Math.round(rect.top + window.scrollY),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  }, selector);
}

/** Bottom of the last element that fits within `limit`, so nothing is sliced. */
async function boundaryBelow(page, selector, limit) {
  return page.evaluate(([sel, max]) => {
    let bottom = 0;
    for (const node of document.querySelectorAll(sel)) {
      const rect = node.getBoundingClientRect();
      const nodeBottom = rect.top + window.scrollY + rect.height;
      if (nodeBottom <= max) bottom = Math.max(bottom, nodeBottom);
    }
    return Math.round(bottom);
  }, [selector, limit]);
}

async function shoot(page, name, clip) {
  const buffer = await page.screenshot({ fullPage: true, clip, type: "jpeg", quality: 88 });
  await writeFile(new URL(`${name}.jpg`, OUT), buffer);
  return { name, height: Math.round(clip.height), bytes: buffer.byteLength };
}

async function quietMedia(page) {
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll("video,audio").forEach((media) => {
        try { media.muted = true; media.pause(); } catch { /* nothing to silence */ }
      });
    });
  });
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: WIDTH, height: 2400 },
  deviceScaleFactor: SCALE,
  reducedMotion: "reduce",
});
await quietMedia(page);
await mkdir(OUT, { recursive: true });
const captured = [];

/* 01 — the question list, as it stands on the home page. */
await page.goto(`${BASE}/ko`, { waitUntil: "load" });
await page.waitForTimeout(1200);
const closeCampaign = page.getByRole("button", { name: "팝업 닫기" });
if (await closeCampaign.count()) await closeCampaign.click();
await page.locator("#questions").scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
{
  const box = await pageBox(page, "#questions .entry-question-grid");
  captured.push(await shoot(page, "questions", {
    x: 0,
    y: Math.max(0, box.y - 14),
    width: WIDTH,
    height: box.height + 28,
  }));
}

/* 02 — the free-reading intake, exactly as a visitor first meets it. */
await page.goto(`${BASE}/ko/numerology`, { waitUntil: "load" });
await page.waitForTimeout(1200);
await page.locator("#birthDate").fill(SAMPLE_BIRTH_DATE);
await page.locator('input[name="privacyRequired"]').check();
await page.locator("#onboarding").scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
{
  const form = await pageBox(page, "#onboarding .form-card");
  const limit = form.y + Math.min(form.height, 1100);
  const bottom = await boundaryBelow(page, "#onboarding .form-card > *", limit);
  if (bottom <= form.y) throw new Error("intake: no element boundary inside the limit");
  captured.push(await shoot(page, "intake", {
    x: 0,
    y: Math.max(0, form.y - 12),
    width: WIDTH,
    height: bottom - form.y + 24,
  }));
}

/* 03 — the free result, calculated by the engine for the sample date. */
await page.locator('button[type="submit"]').first().click();
await page.waitForSelector("#result", { timeout: 30_000 });
await page.waitForTimeout(2500);
{
  const card = await pageBox(page, "#result .result-card");
  const limit = card.y + 1400;
  const bottom = await boundaryBelow(page, "#result .result-card > *", limit);
  if (bottom <= card.y) throw new Error("free result: no element boundary inside the limit");
  captured.push(await shoot(page, "free-result", {
    x: 0,
    y: Math.max(0, card.y - 12),
    width: WIDTH,
    height: bottom - card.y + 24,
  }));
}

/* 04 — the paid report itself, from the published sample the generator produces. */
await page.goto(`${BASE}/ko/samples/detail`, { waitUntil: "load" });
await page.waitForTimeout(2500);
{
  const head = await pageBox(page, ".sample-report-head");
  const limit = head.y + 1500;
  const bottom = await boundaryBelow(page, ".webtoon-story-panel, .sample-report-head", limit);
  if (bottom <= head.y) throw new Error("report: no element boundary inside the limit");
  captured.push(await shoot(page, "report", {
    x: 0,
    y: Math.max(0, head.y - 12),
    width: WIDTH,
    height: bottom - head.y + 24,
  }));
}

console.log(JSON.stringify({ base: BASE, width: WIDTH, scale: SCALE, captured }, null, 2));
await browser.close();
