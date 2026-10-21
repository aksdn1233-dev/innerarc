import { calculateNameNumbers } from "@/core/numerology";
import type { PaidReadingInput, PaidReport } from "@/core/paid-reading";
import { auditReportLanguage, type ReportLanguageAudit } from "@/core/report-quality";
import { buildQuestionAnswer, formatQuestionAnswer, REPORT_QUESTION_POLICY, selectReportQuestions } from "@/core/report-question-guidance";
import { resolveConcernTopic } from "@/core/topics/concern-topics";

const display = (value: number) => [11, 22, 33].includes(value) ? `${value}/${value === 11 ? 2 : value === 22 ? 4 : 6}` : String(value);

/** No model calls, storage, inferred personal facts or changes to calculation rules. */
export function applyQuestionGuidance(report: PaidReport, input: PaidReadingInput): PaidReport {
  if (input.readingKind === "saju_chart") return report;
  const language = input.displayLocale ?? input.locale;
  const name = calculateNameNumbers(input.name);
  const questions = input.productCode === "premium_pdf" ? selectReportQuestions(input.questions, input.concern) : [];
  const answers = questions.map(question => buildQuestionAnswer(question, language, name));
  const sections = report.sections.map(section => ({ ...section }));
  const primaryQuestion = input.concern.trim();
  if (primaryQuestion) {
    const primary = buildQuestionAnswer(primaryQuestion, language, name);
    if (!primary.topics.includes("unsupported") || !resolveConcernTopic(primaryQuestion, input.focusId).matched) {
      const b = report.calculationBasis;
      const basis = b && language === "ko"
        ? `계산 확인: 생명수 ${display(b.lifePath)}, 생일수 ${display(b.birthday)}, 태도수 ${display(b.attitude)}, 출생연도수 ${display(b.birthYear)}, ${b.serviceYear} 개인년 ${display(b.personalYear)}. 이 값은 계산 규칙의 결과이며 질문의 결론을 증명하지 않아요.`
        : language === "ja" ? "計算値は規則の結果です。ここでの判断材料は実際の情報であり、数字が結論を証明するわけではありません。"
          : "Calculated values follow defined rules. The decision aids here depend on real information; birth numbers do not prove the conclusion.";
      const title = language === "ko" ? "질문에 대한 직접 결론" : language === "ja" ? "ご相談への回答" : "Direct answer";
      const opening = { title, body: `${primary.answer}\n\n${basis}\n\n${primary.information}\n\n${primary.action}\n\n${primary.reconsider}` };
      if (["질문에 대한 직접 결론", "Direct answer"].includes(sections[0]?.title)) sections[0] = opening;
      else sections.unshift(opening);
    }
  }
  // Audit ordinary prose globally, but each independent answer in its own context.
  // Repeating essential safety conditions in two answers is intentional, not filler.
  const audits = [auditReportLanguage({ ...report, sections }), ...answers.map((answer, index) =>
    auditReportLanguage({ summary: "", sections: [{ title: "", body: formatQuestionAnswer(answer, index, language) }] }))];
  const qualityAudit: ReportLanguageAudit = {
    passed: audits.every(audit => audit.passed),
    duplicateSentences: audits.flatMap(audit => audit.duplicateSentences),
    nearDuplicateParagraphs: audits.flatMap(audit => audit.nearDuplicateParagraphs),
    repeatedOpenings: audits.flatMap(audit => audit.repeatedOpenings),
    genericPhrases: audits.flatMap(audit => audit.genericPhrases),
  };
  const lastIndex = sections.length - 1;
  if (answers.length && lastIndex >= 0) sections[lastIndex] = { ...sections[lastIndex], body: `${sections[lastIndex].body}\n\n${answers.map((answer, index) => formatQuestionAnswer(answer, index, language)).join("\n\n")}` };
  return {
    ...report, sections, questionAnswers: answers, qualityAudit,
    contentReferences: [...new Set([...(report.contentReferences ?? []), REPORT_QUESTION_POLICY,
      ...answers.flatMap(answer => answer.topics.map(topic => `question-topic:${topic}`))])],
  };
}
