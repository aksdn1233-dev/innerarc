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
  });

  it("reads as one vertical column of panels rather than a stack of cards", () => {
    expect(page).toContain("webtoon-shell");
    expect(page).toContain("<WebtoonReveal />");
    // A panel is a full-width band with the reading measure rebuilt inside it. Lose either
    // half and the report is back to being a column of boxes.
    expect(css).toMatch(/\.webtoon-panel \{[\s\S]*?padding: clamp\(/u);
    expect(css).toMatch(/\.webtoon-inner \{[\s\S]*?width: min\(100% - 44px, 40rem\);/u);
  });

  it("keeps actions before the strong final conclusion on screen and download", () => {
    expect(page.indexOf('"지금 해볼 일"')).toBeLessThan(page.indexOf("{finalSection && ("));
    expect(download).toMatch(/\$\{sections\}<section>.*\$\{final\}/s);
  });

  it("sets readable mobile type and draws the five core numbers as one group", () => {
    expect(page).toContain("<WebtoonOrbs");
    expect(css).toContain(".webtoon-orbs");
    expect(css).toMatch(/\.webtoon-panel p,[\s\S]*?line-height: 1\.95;/u);
  });

  it("reveals panels by moving them, never by fading the text", () => {
    // Text part-way through an opacity transition is text at reduced contrast. A block
    // caught at 0.91 measured 3.73:1 against its own background and failed the axe AA
    // gate, so the reveal moves panels and leaves their opacity alone.
    const reveal = css.slice(css.indexOf(".webtoon-js [data-webtoon-panel]"));
    const revealRules = reveal.slice(0, reveal.indexOf("/* ---- Persistent"));
    expect(revealRules).toContain("transform: translate3d");
    expect(revealRules).not.toContain("opacity");
  });

  it("never hides a paid reading behind a script that may not run", () => {
    // The reveal animation starts from opacity 0, and that starting state is gated on a
    // class only the reveal component sets. If the stylesheet ever hides panels on its
    // own, a blocked or slow script leaves the buyer staring at an empty page.
    expect(css).toMatch(/\.webtoon-js \[data-webtoon-panel\]/u);
    expect(css).not.toMatch(/^\[data-webtoon-panel\] \{[\s\S]*?opacity: 0;/mu);
  });
});
