export const REALITY_CHECK_RULE_VERSION = "reality-check-1.0.0";
export const NEXT_ANALYSIS_CONTEXT_VERSION = "next-analysis-context-1.0.0";
export const MONTHLY_PATTERN_RULE_VERSION = "monthly-pattern-1.1.0";

export const reflectionCategories = [
  "work",
  "relationship",
  "money",
  "emotion",
  "daily_choice",
  "growth",
  "other",
] as const;

export type ReflectionCategory = (typeof reflectionCategories)[number];

export const fitRatings = [
  "accurate",
  "mostly_relevant",
  "partly_relevant",
  "hard_to_tell",
  "not_relevant",
] as const;

export type FitRating = (typeof fitRatings)[number];
export type RealityCheckStatus = "planned" | "due" | "reviewed";
export type PatternFitGroup = "repeatedly_relevant" | "uncertain" | "not_relevant";
export type NextAnalysisSignal =
  | "insufficient_evidence"
  | "repeatedly_relevant"
  | "mixed_or_uncertain"
  | "repeatedly_not_relevant";
export type NextAnalysisTreatment =
  | "no_personalization"
  | "retain_as_hypothesis"
  | "ask_for_specific_conditions"
  | "deemphasize_prior_inference";

export interface RealityCheckDraft {
  clientRequestId: string;
  category: ReflectionCategory;
  question: string;
  currentState: string;
  interpretation: string;
  choice: string;
  actionPlan: string;
  reviewDate: string;
}

export interface OutcomeReviewDraft {
  clientRequestId: string;
  outcome: string;
  fit: FitRating;
  learning: string;
}

export interface OutcomeReview extends OutcomeReviewDraft {
  reviewedAt: string;
  reviewedMonth?: string;
}

export interface RealityCheckRecord extends RealityCheckDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
  ruleVersion: typeof REALITY_CHECK_RULE_VERSION;
  review?: OutcomeReview;
}

export interface PatternCategorySummary {
  category: ReflectionCategory;
  reviewedCount: number;
  relevantCount: number;
  uncertainCount: number;
  notRelevantCount: number;
  group: PatternFitGroup;
}

export interface MonthlyPatternReport {
  month: string;
  reviewedCount: number;
  legacyMonthCount: number;
  repeatedlyRelevant: PatternCategorySummary[];
  uncertain: PatternCategorySummary[];
  notRelevant: PatternCategorySummary[];
  insufficientEvidence: boolean;
  languageNote: string;
  ruleVersion: typeof MONTHLY_PATTERN_RULE_VERSION;
}

export interface NextAnalysisContext {
  contextVersion: typeof NEXT_ANALYSIS_CONTEXT_VERSION;
  source: "outcome_review";
  trust: "untrusted_user_data";
  category: ReflectionCategory;
  signal: NextAnalysisSignal;
  treatment: NextAnalysisTreatment;
  reviewedCount: number;
  relevantCount: number;
  uncertainCount: number;
  notRelevantCount: number;
  userLearnings: readonly string[];
  evidenceRefs: readonly `outcomeReview:${number}`[];
  excludedRawFields: readonly [
    "question",
    "currentState",
    "interpretation",
    "choice",
    "actionPlan",
    "outcome",
    "birthDate",
    "name",
  ];
  guidance: string;
  uncertainty: string;
}

export class RealityCheckInputError extends Error {
  constructor(
    public readonly field: string,
    message: string,
  ) {
    super(message);
    this.name = "RealityCheckInputError";
  }
}

export class RealityCheckConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RealityCheckConflictError";
  }
}
