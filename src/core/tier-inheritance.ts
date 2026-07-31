export const DETAIL_COVERAGE_CATEGORIES = [
  "direct_answer",
  "core_numbers",
  "character",
  "temperament",
  "contradiction",
  "decision_pattern",
  "strongest_ability",
  "failure_mechanisms",
  "main_domain",
  "work_business",
  "money_resources",
  "people_collaboration",
  "close_relationships",
  "stress_response",
  "current_year",
  "phased_direction",
  "situational_response",
  "prioritized_action",
  "stop_hold_boundary",
  "strong_conclusion",
  "grounded_advice",
] as const;

export const PREMIUM_ONLY_CATEGORIES = [
  "cross_number_synthesis",
  "hidden_motivation",
  "defense_mechanism",
  "strength_failure_paradox",
  "root_cause",
  "three_scenarios",
  "observable_signals",
  "decision_framework",
  "expanded_manual",
  "detailed_strategy",
  "risk_checklist",
  "five_stop_conditions",
  "long_term_strategy",
  "consultant_verdict",
] as const;

export type DetailCoverageCategory = (typeof DETAIL_COVERAGE_CATEGORIES)[number];
export type PremiumOnlyCategory = (typeof PREMIUM_ONLY_CATEGORIES)[number];
export type ReportCoverageCategory = DetailCoverageCategory | PremiumOnlyCategory;

export type EnrichmentAuditEntry = Readonly<{
  detailCategory: DetailCoverageCategory;
  premiumStatus: "preserved" | "deepened" | "synthesized";
  addedDimensions: readonly PremiumOnlyCategory[];
}>;

export type TierComparisonAudit = Readonly<{
  missingFromDetail: readonly string[];
  missingFromPremium: readonly string[];
  duplicatedWithoutEnrichment: readonly string[];
  logicalContradictions: readonly string[];
  calculationDifferences: readonly string[];
}>;

export const TIER_INHERITANCE_CONTRACT = {
  BASIC_19000: {
    inherits: [] as const,
    customerLabel: "핵심 리딩 · 판매 중지",
  },
  DETAIL_39000: {
    inherits: ["BASIC_19000"] as const,
    customerLabel: "상세 리딩 · 9,600원",
    required: DETAIL_COVERAGE_CATEGORIES,
  },
  PREMIUM_79000: {
    inherits: ["BASIC_19000", "DETAIL_39000"] as const,
    customerLabel: "프리미엄 심층 리딩 · 39,000원",
    required: [...DETAIL_COVERAGE_CATEGORIES, ...PREMIUM_ONLY_CATEGORIES] as const,
  },
} as const;

type AuditableReport = Readonly<{
  characterLabel?: string;
  calculationBasis?: Readonly<Record<string, string | number>>;
  sections: readonly Readonly<{ title: string; body: string }>[];
  coverageCategories?: readonly ReportCoverageCategory[];
  enrichmentAudit?: readonly EnrichmentAuditEntry[];
}>;

function normalized(value: string): string {
  return value.trim().replace(/\s+/gu, " ");
}

export function auditTierComparison(
  detail: AuditableReport,
  premium: AuditableReport,
): TierComparisonAudit {
  const detailCoverage = new Set(detail.coverageCategories ?? DETAIL_COVERAGE_CATEGORIES);
  const premiumCoverage = new Set(premium.coverageCategories ?? []);
  const enriched = new Set((premium.enrichmentAudit ?? []).map((entry) => entry.detailCategory));
  const detailBodies = new Set(detail.sections.map((section) => normalized(section.body)));
  const premiumBodies = new Set(premium.sections.map((section) => normalized(section.body)));

  const calculationDifferences: string[] = [];
  const detailCalculation = detail.calculationBasis ?? {};
  const premiumCalculation = premium.calculationBasis ?? {};
  for (const key of Object.keys(detailCalculation)) {
    if (detailCalculation[key] !== premiumCalculation[key]) {
      calculationDifferences.push(key);
    }
  }

  const logicalContradictions: string[] = [];
  if (
    detail.characterLabel &&
    premium.characterLabel &&
    detail.characterLabel !== premium.characterLabel
  ) {
    logicalContradictions.push("characterLabel");
  }

  return {
    missingFromDetail: DETAIL_COVERAGE_CATEGORIES.filter((item) => !detailCoverage.has(item)),
    missingFromPremium: TIER_INHERITANCE_CONTRACT.PREMIUM_79000.required.filter(
      (item) => !premiumCoverage.has(item),
    ),
    duplicatedWithoutEnrichment: DETAIL_COVERAGE_CATEGORIES.filter((item) => {
      if (enriched.has(item)) return false;
      return [...detailBodies].some((body) => premiumBodies.has(body));
    }),
    logicalContradictions,
    calculationDifferences,
  };
}
