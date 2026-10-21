import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, describe, expect, it } from "vitest";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createPaidReport } from "@/server/reports/paid-report";
import { ReportQuestionGuidance } from "@/components/report-question-guidance";

const base = { version: 1, locale: "ko", productCode: "premium_pdf", birthDate: "1995-08-13", name: "", focusId: "work", concern: "", createdAt: "2026-10-22T00:00:00.000Z" };
const fixtures: { language: string; questions: readonly string[]; html: string }[] = [];
afterAll(() => {
  if (fixtures.length !== 3) return;
  // Playwright transforms TSX into its component-testing descriptors. Produce real
  // React SSR here, then let browser tests exercise that exact output with live CSS.
  const digest = createHash("sha256").update(readFileSync("src/components/report-question-guidance.tsx")).digest("hex");
  mkdirSync("artifacts/report-quality", { recursive: true });
  writeFileSync("artifacts/report-quality/question-browser-fixtures.json", JSON.stringify({ digest, fixtures }));
});
describe("generated questions reach the actual editorial report", () => {
  it.each([
    { language: "ko", locale: "ko", questions: ["이직 기준은?", "이름 없이 이름 수치를 계산할까요?"] },
    { language: "en", locale: "en", questions: ["Should I resign?", "Can I calculate name numbers without a name?"] },
    { language: "ja", locale: "ko", displayLocale: "ja", questions: ["転職先の勤務条件は？", "名前なしで名前の数値を計算できますか？"] },
  ] as const)("renders both $language questions, information, actions and review conditions", language => {
    const report = createPaidReport("synthetic-render", { ...base, locale: language.locale, ...("displayLocale" in language ? { displayLocale: language.displayLocale } : {}), questions: [...language.questions] });
    const html = renderToStaticMarkup(createElement(ReportQuestionGuidance, { report, language: language.language }));
    for (const question of language.questions) expect(html).toContain(question);
    expect(html.match(/<article>/gu)).toHaveLength(2);
    expect(html.match(/<dt>/gu)).toHaveLength(6);
    expect(html).toContain(`lang="${language.language}"`);
    fixtures.push({ language: language.language, questions: language.questions, html });
  });

  it("escapes untrusted question text and leaves unversioned historical reports unchanged", () => {
    const report = createPaidReport("synthetic-xss", { ...base, questions: ["<script>alert('synthetic')</script> 이직 기준은?"] });
    const html = renderToStaticMarkup(createElement(ReportQuestionGuidance, { report, language: "ko" }));
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(renderToStaticMarkup(createElement(ReportQuestionGuidance, { report: { ...report, contentReferences: [] }, language: "ko" }))).toBe("");
  });

  it("is wired into the paid editorial renderer without replacing report or payment actions", () => {
    const source = readFileSync("src/components/detail-editorial-report.tsx", "utf8");
    expect(source).toContain("<ReportQuestionGuidance report={report} language={locale} />");
    expect(source).toContain("#ed-question-answers");
  });
});
