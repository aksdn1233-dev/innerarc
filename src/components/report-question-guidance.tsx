import React from "react";
import type { PaidReport } from "@/core/paid-reading";
import { REPORT_QUESTION_POLICY, type QuestionLanguage } from "@/core/report-question-guidance";

/** Plain report prose; questions are text, never interpreted as markup. */
export function ReportQuestionGuidance({ report, language }: { report: PaidReport; language: QuestionLanguage }) {
  if (!report.contentReferences?.includes(REPORT_QUESTION_POLICY)) return null;
  const answers = report.questionAnswers ?? [];
  const direct = report.sections.find(section => ["질문에 대한 직접 결론", "Direct answer", "ご相談への回答"].includes(section.title));
  if (!answers.length && !direct) return null;
  const labels = language === "ko"
    ? { title: "궁금했던 것부터 살펴봐요", question: "질문", info: "확인할 정보", action: "지금 해볼 일", review: "다시 판단할 때" }
    : language === "ja"
      ? { title: "気になることから確認しましょう", question: "質問", info: "確認する情報", action: "次の行動", review: "見直すとき" }
      : { title: "Start with what you wanted to know", question: "Question", info: "Information to check", action: "Next step", review: "Reconsider when" };
  const paragraphs = (value: string) => value.split(/\n+/u).filter(Boolean).map((line, index) => <p key={index}>{line}</p>);
  return <section className="ed-paper-section ed-question-guidance" id="ed-question-answers" aria-labelledby="ed-question-answers-title" lang={language}>
    <h2 id="ed-question-answers-title">{labels.title}</h2>
    {answers.length ? answers.map((answer, index) => <article key={index}>
      <h3>{labels.question} {index + 1}</h3>
      <blockquote>{answer.question}</blockquote>
      {paragraphs(answer.answer)}
      <dl>
        <dt>{labels.info}</dt><dd>{paragraphs(answer.information)}</dd>
        <dt>{labels.action}</dt><dd>{paragraphs(answer.action)}</dd>
        <dt>{labels.review}</dt><dd>{paragraphs(answer.reconsider)}</dd>
      </dl>
    </article>) : <>{report.concern && <blockquote>{report.concern}</blockquote>}{paragraphs(direct!.body)}</>}
  </section>;
}
