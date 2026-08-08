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

export interface CelebrityRecord {
  id: string;
  displayName: LocalizedText;
  birthDate: string;
  fields: CelebrityField[];
  source: {
    title: string;
    publisher: string;
    url: string;
    accessedAt: string;
  };
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
