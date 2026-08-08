import { calculateNumerologyProfile } from "@/core/numerology";
import { buildSajuChart, readStrength } from "@/core/saju";
import { readAcrossSystems } from "@/core/synthesis/cross-reading";
import { createCompatibilityInsight } from "@/core/compatibility/engine";
import { createPaidContentPreview } from "@/core/report-preview";
import { auditReportLanguage, deduplicateReportSections } from "@/core/report-quality";
import type { PaidReadingInput, PaidReport } from "@/core/paid-reading";

export function enhancePaidReport(report: PaidReport, input: PaidReadingInput): PaidReport {
  const serviceYear = report.calculationBasis?.serviceYear ?? new Date(input.createdAt).getUTCFullYear();
  const profile = calculateNumerologyProfile({ birthDate: input.birthDate, name: input.name, personalYear: serviceYear });
  const chart = buildSajuChart({
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    sex: input.gender === "male" ? "male" : "female",
  });
  const cross = readAcrossSystems(profile, chart, readStrength(chart));
  const preview = createPaidContentPreview(profile, input.locale);
  const ko = input.locale === "ko";
  const sections = [...report.sections];
  const supplements: string[] = [];
  const crossBody = ko
    ? cross.findings.slice(0, input.productCode === "plus_30d" ? 1 : undefined)
      .map((finding) => `[${finding.agreement}] ${finding.fromNumerology} / ${finding.fromSaju}\n${finding.reading}`)
      .join("\n\n") + (cross.skipped.length ? `\n\n${cross.skipped.join(" ")}` : "")
      + (input.gender === "unstated"
        ? "\n\n성별 미입력으로 대운 방향은 단정하지 않고 원국 구조만 교차했습니다."
        : "")
    : `Life Path ${profile.lifePath.value} and Day Master ${chart.dayMaster} were calculated independently. Their interaction is presented as a reflection on reinforcement, tension, and moderation, not as a guaranteed event prediction.${input.gender === "unstated" ? " Luck-cycle direction is excluded because gender was not supplied." : ""}`;
  supplements.push(`${ko ? "수비학 × 사주 교차분석" : "Numerology × Four Pillars synthesis"}\n${crossBody}`);
  supplements.push(`${preview.unlockedSectionTitle}\n${input.productCode === "plus_30d" ? preview.visible : preview.fullBody}`);

  if (input.productCode === "premium_pdf") {
    const questions = (input.questions?.length ? input.questions : input.concern ? [input.concern] : []).slice(0, 2);
    questions.forEach((question, index) => {
      const anchor = cross.findings[index % Math.max(cross.findings.length, 1)];
      supplements.push(`${ko ? `개인 질문 ${index + 1} 직접 답변` : `Personal question ${index + 1}`}\n${ko
          ? `질문: ${question}\n\n계산 근거: 생명수 ${profile.lifePath.value}, 개인년 ${profile.personalYear.value}${anchor ? `, ${anchor.fromSaju}` : ""}.\n\n답변: ${anchor?.reading ?? preview.fullBody} 이것은 결과를 보장하는 예측이 아니라 선택 조건을 점검하기 위한 해석입니다. 이번 주에는 질문과 관련된 사실, 추측, 다음 행동을 각각 한 문장으로 적어 확인하세요.`
          : `Question: ${question}\n\nBasis: Life Path ${profile.lifePath.value}, Personal Year ${profile.personalYear.value}.\n\nAnswer: ${preview.fullBody} This is a decision reflection, not a guaranteed prediction. Write one observed fact, one assumption, and one next action this week.`}`);
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
    sections: deduplicatedSections,
    paidPreview: {
      visible: preview.visible,
      unlockedSectionTitle: deduplicatedSections.at(-1)?.title ?? preview.unlockedSectionTitle,
      lockedTopics: preview.lockedTopics,
    },
  };
  return { ...enhanced, qualityAudit: auditReportLanguage(enhanced) };
}
