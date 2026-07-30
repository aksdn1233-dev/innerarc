import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const page = await readFile("src/app/[locale]/reports/[orderId]/page.tsx", "utf8");
const css = await readFile("src/app/globals.css", "utf8");
const download = await readFile("src/app/api/reports/[orderId]/download/route.ts", "utf8");
const intake = await readFile("src/components/home-experience.tsx", "utf8");

describe("DETAIL_39000 renderer", () => {
  it("puts the paid tier, question, answer, and character before calculation disclosure", () => {
    const detailBranch = page.slice(
      page.indexOf('<section className={`paid-report-summary detail-report-summary'),
      page.indexOf(") : (", page.indexOf('<section className={`paid-report-summary detail-report-summary')),
    );

    expect(page.indexOf("report.tierLabel")).toBeLessThan(page.indexOf("detail-report-summary"));
    expect(detailBranch.indexOf("report.concern && <blockquote")).toBeLessThan(
      detailBranch.indexOf("detail-direct-answer"),
    );
    expect(detailBranch.indexOf("detail-direct-answer")).toBeLessThan(
      detailBranch.indexOf("paid-report-character-label"),
    );
    expect(detailBranch.indexOf("paid-report-character-label")).toBeLessThan(
      detailBranch.indexOf("detail-number-details"),
    );
    expect(page).toContain('section.title === "캐릭터 한 문장" || section.title === "캐릭터 한 줄"');
    expect(detailBranch).toContain("<details");
  });

  it("uses mobile-readable typography and compact cards", () => {
    const mobile = css.slice(
      css.indexOf("@media (max-width: 640px)"),
      css.indexOf("@media", css.indexOf("@media (max-width: 640px)") + 1),
    );

    expect(mobile).toContain(".detail-report-shell");
    expect(mobile).toMatch(/padding:\s*20px/u);
    expect(mobile).toMatch(/font-size:\s*1rem/u);
    expect(mobile).toMatch(/line-height:\s*1\.72/u);
    expect(css).toContain(".detail-report-actions");
    expect(css).toContain(".detail-report-stop");
    expect(css).toContain(".detail-report-final");
  });

  it("keeps action, stop, conclusion, and safety order in saved downloads", () => {
    const htmlTemplate = download.slice(download.indexOf("const html ="));
    expect(htmlTemplate.indexOf("${sections}")).toBeLessThan(htmlTemplate.indexOf("${actionTitle}"));
    expect(htmlTemplate.indexOf("${actionTitle}")).toBeLessThan(htmlTemplate.indexOf("${stop}"));
    expect(htmlTemplate.indexOf("${stop}")).toBeLessThan(htmlTemplate.indexOf("${final}"));
    expect(htmlTemplate.indexOf("${final}")).toBeLessThan(htmlTemplate.indexOf("${cautions}"));
    expect(download).toContain('report.sectionPlan === "detail-39000-v2"');
  });

  it("allows every tier to produce a complete birth-date-only report", () => {
    expect(intake).not.toContain('selectedProduct === "premium_pdf" && !concern');
    expect(intake).not.toContain('required={selectedProduct === "premium_pdf"}');
    expect(intake).toContain("비워도 전체 분석이 완결됩니다");
  });
});
