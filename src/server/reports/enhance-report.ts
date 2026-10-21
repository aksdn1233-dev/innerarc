import { calculateNumerologyProfile } from "@/core/numerology";
import { createCompatibilityInsight } from "@/core/compatibility/engine";
import { createPaidContentPreview } from "@/core/report-preview";
import { deduplicateReportSections } from "@/core/report-quality";
import type { PaidReadingInput, PaidReport } from "@/core/paid-reading";

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
    // Personal answers are composed after narrative deduplication, in independent
    // contexts. Shared safety/decision advice must not erase an earlier answer.
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
  // The final question composition audits the completed narrative once. Auditing
  // here as well would repeat the quadratic prose comparison before changing it.
  return enhanced;
}
