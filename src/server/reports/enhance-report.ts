import { calculateNumerologyProfile } from "@/core/numerology";
import { createCompatibilityInsight } from "@/core/compatibility/engine";
import { createPaidContentPreview } from "@/core/report-preview";
import { auditReportLanguage, deduplicateReportSections } from "@/core/report-quality";
import type { PaidReadingInput, PaidReport } from "@/core/paid-reading";
import { createDetailPaidReport } from "@/server/reports/detail-report";

export function enhancePaidReport(report: PaidReport, input: PaidReadingInput): PaidReport {
  const serviceYear = report.calculationBasis?.serviceYear ?? new Date(input.createdAt).getUTCFullYear();
  const profile = calculateNumerologyProfile({ birthDate: input.birthDate, name: input.name, personalYear: serviceYear });
  const preview = createPaidContentPreview(profile, input.locale);
  const ko = input.locale === "ko";
  const sections = [...report.sections];
  const supplements: string[] = [];
  const references = [...(report.contentReferences ?? [])];
  supplements.push(`${preview.unlockedSectionTitle}\n${input.productCode === "plus_30d" ? preview.visible : preview.fullBody}`);

  if (input.productCode === "premium_pdf") {
    const questions = (input.questions?.length ? input.questions : input.concern ? [input.concern] : []).map(question => question.trim()).filter(Boolean).slice(0, 2);
    questions.forEach((question, index) => {
      // Reuse the existing question/topic and safety routing instead of giving every
      // question the same relationship preview. This does not invoke an AI provider.
      const answer = createDetailPaidReport(report.orderId, { ...input, productCode: "pro_30d", concern: question });
      references.push(...(answer.contentReferences ?? []));
      // The numeric context already has its own line below; duplicating that full
      // paragraph here makes the deduplicator remove it from the opening answer.
      const directAnswer = answer.sections[0]!.body.split(/\n\s*\n/u)[0]!;
      supplements.push(`${ko ? `개인 질문 ${index + 1} 직접 답변` : `Personal question ${index + 1}`}\n${ko
          ? `질문: ${question}\n\n생년월일 패턴 계산 근거: 생명수 ${profile.lifePath.value}, 개인년 ${profile.personalYear.value}.\n\n답변: ${directAnswer}\n\n확인할 행동: ${answer.actions[0] ?? "질문과 관련된 사실과 추측을 나눠 적어보세요."}`
          : `Question: ${question}\n\nBasis: Life Path ${profile.lifePath.value}, Personal Year ${profile.personalYear.value}.\n\nAnswer: ${directAnswer}\n\nNext step: ${answer.actions[0] ?? "Write down the observed facts separately from assumptions."}`}`);
    });
    if (input.companion) {
      const companion = calculateNumerologyProfile({
        birthDate: input.companion.birthDate,
        name: input.companion.name,
        personalYear: serviceYear,
      });
      const compatibility = createCompatibilityInsight({
        personA: profile,
        personB: companion,
        relationshipType: input.companion.relationshipType,
        locale: input.locale,
      });
      supplements.push(`${ko ? `동반자 궁합 · ${compatibility.relationshipLabel}` : `Companion compatibility · ${compatibility.relationshipLabel}`}\n${[compatibility.summary, compatibility.roleOrderNote, ...compatibility.sections.map((section) =>
          `${section.title}\n${section.observation}\n${section.practicalConditions.join(" · ")}\n${section.realityCheck}`), compatibility.uncertainty]
          .filter(Boolean).join("\n\n")}`);
    }
  }

  const lastIndex = sections.length - 1;
  if (lastIndex >= 0) {
    const last = sections[lastIndex]!;
    sections[lastIndex] = { ...last, body: `${last.body}\n\n${supplements.join("\n\n")}` };
  }

  const deduplicatedSections = deduplicateReportSections(report.summary, sections);
  const enhanced: PaidReport = {
    ...report,
    contentReferences: [...new Set(references)],
    sections: deduplicatedSections,
    paidPreview: {
      visible: preview.visible,
      unlockedSectionTitle: deduplicatedSections.at(-1)?.title ?? preview.unlockedSectionTitle,
      lockedTopics: preview.lockedTopics,
    },
  };
  return { ...enhanced, qualityAudit: auditReportLanguage(enhanced) };
}
