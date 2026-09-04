/**
 * Records the four screens the home walkthrough shows.
 *
 * The walkthrough claims to be showing the actual product, so the clips on it are
 * recordings of the actual product being used rather than drawings of it. Re-run this
 * whenever the question list, the free-reading intake, the free result, or the paid
 * report changes visually:
 *
 *   pnpm build
 *   node scripts/serve-production.mjs        # in one shell
 *   node scripts/capture-guide-screens.mjs   # in another
 *
 * Each recording is a scripted run of the real flow inside a phone-sized viewport, so a
 * long screen is read by scrolling exactly as a visitor reads it — nothing is cropped to
 * fit a frame. Frames are grabbed as retina screenshots rather than through Playwright's
 * own video encoder, which never scales a page up and so would leave a 390px page in the
 * corner of a 780px canvas. Output is H.264 MP4 plus a poster frame, in public/images/guide.
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { chromium } from "@playwright/test";

const run = promisify(execFile);
const BASE = process.env.CAPTURE_BASE_URL ?? "http://127.0.0.1:3000";
const OUT = new URL("../public/images/guide/", import.meta.url);
const OUT_DIR = OUT.pathname;
const WORK = new URL("../.guide-recordings/", import.meta.url).pathname;

/** The frame the stage renders, matching the reference's portrait proportion. */
const WIDTH = 390;
const HEIGHT = 531;
/** Recorded at 2x, so the clip is sharp in the stage on a phone screen. */
const SCALE = 2;
const FPS = 20;
const SAMPLE_BIRTH_DATE = "1994-11-04";

/** Collects frames for one clip: every screenshot is one 1/FPS of the finished video. */
class Reel {
  constructor(page, dir) {
    this.page = page;
    this.dir = dir;
    this.count = 0;
    this.last = null;
  }

  async shot() {
    this.last = await this.page.screenshot({ type: "png", animations: "disabled" });
    await this.write(this.last);
  }

  async write(buffer) {
    this.count += 1;
    await writeFile(`${this.dir}/${String(this.count).padStart(5, "0")}.png`, buffer);
  }

  /** Rests on the screen. The picture is not changing, so the frame is simply repeated. */
  async hold(seconds) {
    if (!this.last) await this.shot();
    for (let frame = 1; frame < Math.round(seconds * FPS); frame += 1) await this.write(this.last);
  }

  /** A readable reading pace: fast enough to hold attention, slow enough to follow. */
  async glide(distance, seconds) {
    const steps = Math.round(seconds * FPS);
    for (let step = 1; step <= steps; step += 1) {
      // Eased, so the scroll starts and stops the way a thumb does.
      const before = (step - 1) / steps;
      const now = step / steps;
      const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
      await this.page.mouse.wheel(0, distance * (ease(now) - ease(before)));
      await this.shot();
    }
  }
}

async function silence(page) {
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll("video,audio").forEach((media) => {
        try { media.muted = true; media.pause(); } catch { /* nothing to silence */ }
      });
    });
  });
}

async function record(browser, name, act) {
  const dir = `${WORK}${name}`;
  await mkdir(dir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: SCALE,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await silence(page);
  const reel = new Reel(page, dir);
  await act(page, reel);
  await context.close();
  if (reel.count < FPS * 3) throw new Error(`${name}: only ${reel.count} frames recorded`);

  // H.264 so it plays on iOS Safari, faststart so it can begin before it finishes
  // downloading, and no audio track at all.
  await run("ffmpeg", [
    "-y", "-framerate", String(FPS), "-i", `${dir}/%05d.png`,
    "-an",
    "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-crf", "33", "-preset", "slow", "-movflags", "+faststart",
    `${OUT_DIR}${name}.mp4`,
  ]);
  // The poster is the clip's own first frame, so the still and the moving picture are
  // the same image and nothing jumps when playback starts.
  await run("ffmpeg", [
    "-y", "-i", `${OUT_DIR}${name}.mp4`,
    "-frames:v", "1", "-q:v", "3",
    `${OUT_DIR}${name}.jpg`,
  ]);
  return { name, frames: reel.count };
}

async function dismissCampaign(page) {
  const close = page.getByRole("button", { name: "팝업 닫기" });
  if (await close.count()) await close.click();
}

await rm(WORK, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const captured = [];

/* 01 — choosing a question on the home page. */
captured.push(await record(browser, "questions", async (page, reel) => {
  await page.goto(`${BASE}/ko`, { waitUntil: "load" });
  await page.waitForTimeout(1200);
  await dismissCampaign(page);
  // Start on the section heading and stop at the end of the question list. A fixed
  // distance overshot it and spent half the clip on the section below, which is not the
  // screen the step is naming.
  const questions = await page.evaluate(() => {
    const section = document.querySelector("#questions");
    const grid = document.querySelector("#questions .entry-question-grid");
    const top = section.getBoundingClientRect().top + window.scrollY - 16;
    window.scrollTo(0, top);
    const end = grid.getBoundingClientRect().bottom + window.scrollY - window.innerHeight + 24;
    return Math.max(0, end - top);
  });
  await page.waitForTimeout(900);
  await reel.hold(1.2);
  await reel.glide(questions, 3.4);
  await reel.hold(0.6);
  await page.locator('#questions .entry-question:has-text("돈·사업")').hover();
  await reel.shot();
  await reel.hold(1.6);
}));

/* 02 — the intake, filled in the way a visitor fills it. */
captured.push(await record(browser, "intake", async (page, reel) => {
  await page.goto(`${BASE}/ko/numerology`, { waitUntil: "load" });
  await page.waitForTimeout(1200);
  await page.locator("#onboarding").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await reel.hold(1.2);
  await page.locator("#birthDate").fill(SAMPLE_BIRTH_DATE);
  await reel.shot();
  await reel.hold(1.2);
  await reel.glide(420, 2.2);
  await page.locator('input[name="privacyRequired"]').check();
  await reel.shot();
  await reel.hold(1.6);
}));

/* 03 — the free result, calculated live and then read. */
captured.push(await record(browser, "free-result", async (page, reel) => {
  await page.goto(`${BASE}/ko/numerology`, { waitUntil: "load" });
  await page.waitForTimeout(1000);
  await page.locator("#birthDate").fill(SAMPLE_BIRTH_DATE);
  await page.locator('input[name="privacyRequired"]').check();
  await page.locator('button[type="submit"]').first().click();
  await page.waitForSelector("#result", { timeout: 30_000 });
  await page.waitForTimeout(1500);
  await page.locator("#result .result-card").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await reel.hold(1.2);
  await reel.glide(1500, 5.5);
  await reel.hold(1);
}));

/* 04 — the paid report, read the way a buyer reads it. */
captured.push(await record(browser, "report", async (page, reel) => {
  await page.goto(`${BASE}/ko/samples/detail`, { waitUntil: "load" });
  await page.waitForTimeout(2200);
  await reel.hold(1.2);
  await reel.glide(2100, 6.5);
  await reel.hold(1);
}));

await browser.close();
await rm(WORK, { recursive: true, force: true });
console.log(JSON.stringify({
  base: BASE,
  frame: `${WIDTH * SCALE}x${HEIGHT * SCALE}`,
  fps: FPS,
  captured,
}, null, 2));
