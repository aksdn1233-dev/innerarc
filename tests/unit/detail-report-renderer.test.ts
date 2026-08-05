import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const page = await readFile("src/app/[locale]/reports/[orderId]/page.tsx", "utf8");
const css = await readFile("src/app/globals.css", "utf8");
const download = await readFile("src/app/api/reports/[orderId]/download/route.ts", "utf8");
const intake = await readFile("src/components/home-experience.tsx", "utf8");

describe("DETAIL_39000 renderer", () => {
  it("puts the paid tier, question, answer, and character before calculation disclosure", () => {
    const tier = page.indexOf("report.tierLabel");
    const question = page.indexOf("{report.concern && <blockquote>{report.concern}</blockquote>}");
    const answer = page.indexOf("{directSection && (");
    const character = page.indexOf("{report.characterLabel && (");
    const numbers = page.indexOf('title={locale === "ko" ? "핵심 숫자" : "Core numbers"}');

    expect(tier).toBeGreaterThan(-1);
    expect(numbers).toBeGreaterThan(-1);
    expect(tier).toBeLessThan(question);
    expect(question).toBeLessThan(answer);
    expect(answer).toBeLessThan(character);
    // Someone who just opened a report they paid for wants the reading. The arithmetic
    // behind it comes afterwards, and stays folded away until they ask for it.
    expect(character).toBeLessThan(numbers);
    expect(page.slice(numbers)).toContain("<details>");
    expect(page).toContain('section.title === "캐릭터 한 문장" || section.title === "캐릭터 한 줄"');
  });

  it("alternates panel grounds and keeps mobile-readable typography", () => {
    expect(css).toMatch(/\.webtoon-panel p,[\s\S]*?font-size: clamp\(1\.02rem/u);
    expect(css).toMatch(/\.webtoon-title \{[\s\S]*?clamp\(1\.85rem/u);
    // Four grounds in rotation: without them every beat looks the same and the column
    // stops reading as a sequence.
    expect(css).toContain(".webtoon-night");
    expect(css).toContain(".webtoon-paper");
    expect(css).toContain(".webtoon-gold");
    expect(css).toContain(".webtoon-warn");
  });

  it("keeps the persistent call to action clear of transformed panels", () => {
    // A revealed panel carries a transform, and a fixed child of a transformed element
    // positions against that element rather than the viewport. The bar therefore lives
    // outside <main>, as a sibling.
    const cta = page.indexOf("<WebtoonCta");
    expect(cta).toBeGreaterThan(page.indexOf("</main>"));
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
    expect(intake).toContain("비워두면 선택한 영역과 생년월일을 중심으로 구성합니다");
  });
});
