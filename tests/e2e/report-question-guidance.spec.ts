import { expect, test } from "@playwright/test";
import axe from "axe-core";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

// Run test:report-quality first (CI runs the full unit suite). Real React SSR is
// generated there; this file must not import TSX through Playwright's JSX transform.
// This isolated component test does not claim paid-order/database coverage.
for (const language of ["ko", "en", "ja"] as const) {
  test(`question answers stay readable and accessible in ${language}`, async ({ page }) => {
    const capture = JSON.parse(readFileSync("artifacts/report-quality/question-browser-fixtures.json", "utf8")) as {
      digest: string; fixtures: { language: string; questions: string[]; html: string }[];
    };
    expect(capture.digest).toBe(createHash("sha256").update(readFileSync("src/components/report-question-guidance.tsx")).digest("hex"));
    expect(capture.fixtures).toHaveLength(3);
    const example = capture.fixtures.find(item => item.language === language)!;
    expect(example).toBeDefined();
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/ko/samples/premium");
    const styles = await page.locator('link[rel="stylesheet"]').evaluateAll(links => links.map(link => (link as HTMLLinkElement).href));
    const root = await page.locator("html").evaluate(element => ({ className: element.className, style: element.getAttribute("style") ?? "" }));
    expect(styles.length).toBeGreaterThan(0);
    const fixture = `<!doctype html><html lang="${language}" class="${root.className}" style="${root.style.replaceAll('"', '&quot;')}"><head><meta charset="utf-8"><title>Question section verification</title>${styles.map(href => `<link rel="stylesheet" href="${href}">`).join("")}</head><body><main class="editorial-report">${example.html}</main></body></html>`;
    await page.route("**/__report-question-fixture", route => route.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: fixture }));
    // A fresh document drops the sample's React runtime; production styles and
    // fonts keep their real same-origin URLs. No test endpoint is shipped.
    await page.goto("/__report-question-fixture");
    for (const width of [1440, 390, 360]) {
      await page.setViewportSize({ width, height: 900 });
      const section = page.locator("#ed-question-answers");
      for (const question of example.questions) await expect(section).toContainText(question);
      await expect(section.locator("article")).toHaveCount(2);
      await expect(section.locator("dt")).toHaveCount(6);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      await page.addScriptTag({ content: axe.source });
      const violations = await page.evaluate(async () => {
        const browserAxe = (window as unknown as { axe: typeof axe }).axe;
        return (await browserAxe.run("#ed-question-answers")).violations.filter(item => item.impact === "critical" || item.impact === "serious").map(item => item.id);
      });
      expect(violations).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}
