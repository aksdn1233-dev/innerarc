import "server-only";
import { matchResidentialTemplates, residentialTemplateCoverage, type ResidentialMatchInput } from "@/core/space/residential-template";

// Internal review surface only. It deliberately has no customer route.
export function inspectResidentialTemplates(input: ResidentialMatchInput, correctionCounts: Readonly<Record<string, number>> = {}) {
  const match = matchResidentialTemplates(input);
  return {
    coverage: residentialTemplateCoverage(),
    candidates: match.candidates.map(candidate => ({
      templateId: candidate.template.id,
      structuralId: candidate.template.structuralId,
      version: candidate.template.version,
      matchScore: candidate.matchScore,
      verificationLevel: candidate.template.provenance.verificationLevel,
      evidenceStatus: candidate.evidenceStatus,
      conflicts: candidate.conflicts,
      correctionCount: correctionCounts[candidate.template.id] ?? 0,
      provenance: candidate.template.provenance,
    })),
    questions: match.questions,
    scoreNotice: match.note,
  };
}
