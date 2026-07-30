import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const page = await readFile("src/app/[locale]/reports/[orderId]/page.tsx", "utf8");
const download = await readFile("src/app/api/reports/[orderId]/download/route.ts", "utf8");
const css = await readFile("src/app/globals.css", "utf8");

describe("BASIC_19000 renderer", () => {
  it("uses the new layout only for the explicit basic section plan", () => {
    expect(page).toContain('report.sectionPlan === "basic-19000-v2"');
    expect(page).toContain('" basic-report-shell"');
    expect(page).toContain("report.calculationBasis");
    expect(page).toContain("paid-report-summary basic-report-summary");
  });

  it("keeps actions before the strong final conclusion on screen and download", () => {
    expect(page.indexOf("basic-report-actions")).toBeLessThan(page.indexOf("basic-report-final"));
    expect(download).toMatch(/\$\{sections\}<section>.*\$\{final\}/s);
  });

  it("sets readable mobile type, spacing, and a compact five-number strip", () => {
    expect(css).toContain(".basic-number-strip");
    expect(css).toMatch(/@media \(max-width: 640px\)[\s\S]*\.basic-report-shell \.paid-report-section p,[\s\S]*font-size: 1rem;[\s\S]*line-height: 1\.72;/);
    expect(css).toMatch(/\.basic-report-shell \.paid-report-summary,[\s\S]*padding: 20px;/);
  });
});
