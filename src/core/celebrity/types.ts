import type { LocalizedText } from "@/core/tarot";

export const CELEBRITY_COMPARISON_RULE_VERSION = "celebrity-date-structure-1.0.0";

export const celebrityFields = [
  "public_leadership",
  "science",
  "sports",
  "arts_entertainment",
  "education_advocacy",
] as const;

export type CelebrityField = (typeof celebrityFields)[number];
export type BirthDateConfidence = "confirmed" | "reported" | "uncertain";
export type StructuralOverlapTier = "strong_overlap" | "some_overlap" | "contrast_forward";
export type DateStructureId = "lifePath" | "birthday" | "attitude";
export type EvidenceStatus = "supported" | "partial" | "insufficient";
export type Transferability = "direct_experiment" | "conditional_experiment" | "context_specific";
export interface PublicSource { title: string; publisher: string; url: string; accessedAt: string }
export interface CareerEvidence { date: string; category: "milestone" | "award" | "public_service" | "debut"; claim: LocalizedText; source: PublicSource }
export interface SuccessStory {
  evidenceStatus: EvidenceStatus;
  publicPattern: LocalizedText;
  hiddenConditions: readonly LocalizedText[];
  unknowns: readonly LocalizedText[];
  transferability: Transferability;
  transferableAction: LocalizedText;
  comparisonQuestion: LocalizedText;
  sources: readonly PublicSource[];
}

export interface CelebrityRecord {
  id: string;
  displayName: LocalizedText;
  profession: LocalizedText;
  birthDate: string;
  fields: CelebrityField[];
  source: PublicSource;
  careerEvidence: readonly CareerEvidence[];
  confidence: BirthDateConfidence;
}

export interface CelebrityStructureItem {
  id: DateStructureId;
  userValue: number;
  celebrityValue: number;
}

export interface CelebrityMatch {
  rank: number;
  celebrity: CelebrityRecord;
  tier: StructuralOverlapTier;
  tierLabel: string;
  sharedStructures: CelebrityStructureItem[];
  differentStructures: CelebrityStructureItem[];
  similarNote: string;
  differentNote: string;
  evidenceRefs: string[];
  story: SuccessStory;
}

export interface CelebrityComparisonResult {
  ruleVersion: typeof CELEBRITY_COMPARISON_RULE_VERSION;
  scopeLabel: string;
  matches: CelebrityMatch[];
  uncertainty: string;
}

export class CelebrityDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CelebrityDataError";
  }
}
