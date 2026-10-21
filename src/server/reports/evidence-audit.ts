import { calculateBirthYearNumber, calculateNumerologyProfile } from "@/core/numerology";
import type { PaidReadingInput, PaidReport } from "@/core/paid-reading";
import { buildSajuChart } from "@/core/saju";
import { formatQuestionAnswer, questionTopics, REPORT_QUESTION_POLICY, selectReportQuestions } from "@/core/report-question-guidance";

export const REPORT_EVIDENCE_POLICY_VERSION = "report-evidence:1.0.0";

/** Checks calculation consistency, not the truth of symbolic interpretations. No PII in results. */
export type ReportEvidenceAudit = Readonly<{ passed: boolean; failures: readonly string[] }>;

const numericLabels = {
  lifePath: "생명수|인생수|Life Path|運命数",
  birthday: "생일수|Birthday|誕生日数",
  attitude: "태도수|Attitude|態度数",
  birthYear: "출생연도수|Birth Year|出生年数",
} as const;

function matchesNumber(match: RegExpMatchArray, expected: number): boolean {
  const reductions: Readonly<Partial<Record<number, number>>> = { 11: 2, 22: 4, 33: 6 };
  return Number(match[1]) === expected && (match[2] === undefined || Number(match[2]) === reductions[expected]);
}

export function auditPaidReportEvidence(report: PaidReport, input: PaidReadingInput): ReportEvidenceAudit {
  const failures: string[] = [];
  const check = (id: string, passed: boolean) => { if (!passed) failures.push(id); };
  check("product", report.productCode === input.productCode);
  check("locale", report.locale === (input.displayLocale === "ja" ? "en" : input.locale) && report.displayLocale === input.displayLocale);
  check("sections", report.sections.length > 0 && report.sections.every(section => !!section.title.trim() && !!section.body.trim()));
  check("limits", /보장하지|미래를 보장하거나[^.\n]{0,80}대신하지 않습니다|does not guarantee|保証せず|保証ではありません/iu.test(report.disclaimer));

  // These checks concern new composition only, not stored purchases. A compact
  // closed-set code must never include the customer's question or personal data.
  if (input.readingKind !== "saju_chart") {
    check("questions.policy", report.contentReferences?.includes(REPORT_QUESTION_POLICY) === true);
    const expectedQuestions = input.productCode === "premium_pdf" ? selectReportQuestions(input.questions, input.concern) : [];
    check("questions.count", report.questionAnswers?.length === expectedQuestions.length);
    expectedQuestions.forEach((question, index) => {
      const answer = report.questionAnswers?.[index];
      check("questions.input", answer?.question === question);
      check("questions.routing", JSON.stringify(answer?.topics) === JSON.stringify(questionTopics(question)));
      check("questions.complete", !!answer && [answer.answer, answer.information, answer.action, answer.reconsider].every(value => typeof value === "string" && !!value.trim()) && Array.isArray(answer.topics) && answer.topics.length > 0);
      if (answer) check("questions.printed", report.sections.some(section => section.body.includes(formatQuestionAnswer(answer, index, input.displayLocale ?? input.locale))));
    });
  }

  if (input.productCode === "plus_30d" && input.readingKind === "saju_chart") {
    const chart = buildSajuChart({
      birthDate: input.birthDate, birthTime: input.birthTime,
      sex: input.gender === "male" ? "male" : "female",
      midnightConvention: input.midnightConvention ?? "야자시",
    });
    const ja = input.displayLocale === "ja";
    const missing = ja ? "未入力" : input.locale === "ko" ? "시주 미입력" : "Hour not provided";
    const pillar = (value: typeof chart.hour) => value ? `${value.stem}${value.branch}` : missing;
    const expected = [chart.hour, chart.day, chart.month, chart.year].map(pillar).join(ja ? "・" : " · ");
    const body = report.sections.find(section => ["원국 네 기둥", "The four pillars", "命式の四柱"].includes(section.title))?.body ?? "";
    const printed = body.split("\n")[0]!.split(/[:：]/u).at(-1) ?? "";
    check("saju.pillars", printed.replace(/\s/gu, "") === expected.replace(/\s/gu, ""));
  } else {
    const basis = report.calculationBasis;
    check("basis.present", !!basis);
    if (basis) {
      check("basis.birthDate", basis.birthDate === input.birthDate);
      // The existing product declares its edition year. Never silently substitute today's year.
      if (!Number.isInteger(basis.serviceYear) || basis.serviceYear < 1 || basis.serviceYear > 9999) {
        check("basis.serviceYear", false);
      } else {
        const profile = calculateNumerologyProfile({ birthDate: input.birthDate, name: input.name, personalYear: basis.serviceYear });
        const expected = {
          lifePath: profile.lifePath.value, birthday: profile.birthday.value,
          attitude: profile.attitude.value, birthYear: calculateBirthYearNumber(input.birthDate).value,
          personalYear: profile.personalYear.value,
        };
        for (const key of Object.keys(expected) as Array<keyof typeof expected>) {
          check(`basis.${key}`, basis[key] === expected[key]);
        }
        // Inspect only the calculation chapter: user questions may quote arbitrary numbers.
        const body = report.sections.find(section => ["핵심 숫자", "Core numbers", "4つの数字が示す基本構造"].includes(section.title))?.body ?? "";
        for (const key of Object.keys(numericLabels) as Array<keyof typeof numericLabels>) {
          const matches = [...body.matchAll(new RegExp(`(?:${numericLabels[key]})\\s+(\\d+)(?:/(\\d+))?(?![\\p{L}\\p{N}/])`, "giu"))];
          check(`printed.${key}`, matches.length > 0 && matches.every(match => matchesNumber(match, expected[key])));
        }
        const annual = input.displayLocale === "ja"
          ? report.sections.find(section => section.title === `${basis.serviceYear}年の流れ`)?.body ?? ""
          : body;
        const annualNumbers = [...annual.matchAll(/(?:개인년|Personal Year|個人年)\s+(\d+)(?:\/(\d+))?(?![\p{L}\p{N}/])/giu)];
        check("printed.personalYear", annualNumbers.length > 0 && annualNumbers.every(match => matchesNumber(match, expected.personalYear)));
        check("printed.serviceYear", input.displayLocale === "ja" ? !!annual : new RegExp(`${basis.serviceYear}\\s+(?:개인년|Personal Year)`, "iu").test(body));
      }
    }
  }
  return { passed: failures.length === 0, failures };
}

/** Only new generation is gated. Stored reports and historical entitlements are never rewritten. */
export function verifyPaidReportEvidence(report: PaidReport, input: PaidReadingInput): PaidReport {
  const audit = auditPaidReportEvidence(report, input);
  if (!audit.passed) throw new Error(`REPORT_EVIDENCE_MISMATCH:${audit.failures.join(",")}`);
  const note = input.displayLocale === "ja"
    ? "計算値は規則に基づく結果ですが、性格や人生の説明は検証が必要な象徴的な仮説です。合わない部分は、解釈より実際の経験を優先してください。"
    : input.locale === "ko"
      ? "계산값은 규칙에 따른 결과지만, 성향과 삶에 대한 설명은 확인이 필요한 상징적 가설이에요. 맞지 않는 부분은 풀이보다 실제 경험을 우선해 주세요."
      : "Calculations follow defined rules; descriptions of personality and life are symbolic hypotheses to check. Where they do not fit, trust lived experience over the interpretation.";
  return {
    ...report,
    disclaimer: report.disclaimer.endsWith(note) ? report.disclaimer : `${report.disclaimer} ${note}`,
    contentReferences: [...new Set([...(report.contentReferences ?? []), REPORT_EVIDENCE_POLICY_VERSION])],
  };
}
