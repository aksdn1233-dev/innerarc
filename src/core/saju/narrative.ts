import type { SajuChart } from "./types";

export type SajuInterpretationFact = {
  readonly id: string;
  readonly topic: "core" | "wealth" | "work" | "relationship" | "timing";
  readonly statement: string;
  readonly supportingRuleIds: readonly string[];
  readonly confidence: number;
  readonly allowedClaims: readonly string[];
  readonly prohibitedClaims: readonly string[];
};

export type SajuNarrativePlan = {
  readonly chartEngineVersion: string;
  readonly interpretationRuleVersion: string;
  readonly canonicalPillars: readonly string[];
  readonly topic: SajuInterpretationFact["topic"];
  readonly facts: readonly SajuInterpretationFact[];
};

export type SajuNarrativeOutput = {
  readonly paragraphs: readonly {
    readonly text: string;
    readonly factIds: readonly string[];
  }[];
};

const PROHIBITED_CERTAINTY = /반드시|확실히|틀림없이|100%|운명(?:이|은)? 정해|치료|진단|투자해야|이혼할|죽을|병에 걸릴/;

/**
 * Rule evaluation emits a bounded fact packet. An AI writer may rephrase this packet,
 * but it receives no authority to add pillars, relationships, or fixed-life claims.
 */
export function planSajuNarrative(
  chart: SajuChart,
  topic: SajuNarrativePlan["topic"],
): SajuNarrativePlan {
  const facts: SajuInterpretationFact[] = [
    {
      id: "day-master",
      topic: "core",
      statement: `일간은 ${chart.dayMaster}이고 오행은 ${chart.dayMasterPhase}입니다.`,
      supportingRuleIds: ["saju.fact.day-master.v1"],
      confidence: 1,
      allowedClaims: ["calculated-structure", "symbolic-reflection"],
      prohibitedClaims: ["scientific-personality-diagnosis", "guaranteed-outcome"],
    },
    {
      id: "element-balance",
      topic,
      statement: `오행 분포는 ${Object.entries(chart.elements).map(([key, value]) => `${key} ${value}`).join(", ")}입니다.`,
      supportingRuleIds: ["saju.fact.element-balance.v1"],
      confidence: 1,
      allowedClaims: ["relative-symbolic-balance"],
      prohibitedClaims: ["medical-deficiency", "financial-prediction"],
    },
  ];

  if (chart.relationships.length > 0) {
    facts.push({
      id: "stable-relationships",
      topic,
      statement: `원국에서 공개 규칙으로 확인한 합·충 관계는 ${chart.relationships.length}개입니다.`,
      supportingRuleIds: chart.relationships.map(({ ruleId }) => ruleId),
      confidence: 1,
      allowedClaims: ["calculated-structure", "interaction-reflection"],
      prohibitedClaims: ["event-prediction", "relationship-verdict"],
    });
  }

  return {
    chartEngineVersion: chart.versions.engineVersion,
    interpretationRuleVersion: chart.versions.interpretationRuleVersion,
    canonicalPillars: Object.values(chart.pillars)
      .filter((pillar): pillar is NonNullable<typeof pillar> => pillar !== null)
      .map(({ label }) => label),
    topic,
    facts,
  };
}

export type SajuNarrativeValidation = {
  readonly ok: boolean;
  readonly errors: readonly string[];
};

/** Fail closed on unsupported facts, duplicated prose, and certainty/high-stakes claims. */
export function validateSajuNarrative(
  plan: SajuNarrativePlan,
  output: SajuNarrativeOutput,
): SajuNarrativeValidation {
  const knownFactIds = new Set(plan.facts.map(({ id }) => id));
  const errors: string[] = [];
  const normalizedParagraphs = new Set<string>();

  for (const [index, paragraph] of output.paragraphs.entries()) {
    if (paragraph.factIds.length === 0 || paragraph.factIds.some((id) => !knownFactIds.has(id))) {
      errors.push(`paragraph-${index}:unsupported-fact`);
    }
    const normalized = paragraph.text.replace(/\s+/g, " ").trim().toLocaleLowerCase("ko");
    if (!normalized) errors.push(`paragraph-${index}:empty`);
    if (normalizedParagraphs.has(normalized)) errors.push(`paragraph-${index}:duplicate`);
    normalizedParagraphs.add(normalized);
    if (PROHIBITED_CERTAINTY.test(paragraph.text)) errors.push(`paragraph-${index}:prohibited-claim`);

    for (const pillarLabel of paragraph.text.match(/[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]/g) ?? []) {
      if (!plan.canonicalPillars.includes(pillarLabel)) errors.push(`paragraph-${index}:hallucinated-pillar`);
    }
  }

  return { ok: errors.length === 0, errors };
}
