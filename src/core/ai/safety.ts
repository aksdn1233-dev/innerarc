export type SafetyCategory =
  | "general"
  | "medical"
  | "legal"
  | "financial"
  | "self_harm"
  | "violence"
  | "crime";

export type SafetyAssessment = {
  readonly category: SafetyCategory;
  readonly allowSymbolicReflection: boolean;
  readonly requiresRealityFirstGuidance: boolean;
  readonly requiresUrgentSafetyResponse: boolean;
  readonly matchedTerms: readonly string[];
};

const CATEGORY_TERMS: Record<Exclude<SafetyCategory, "general">, readonly RegExp[]> = {
  medical: [/diagnos/i, /medicine/i, /cancer/i, /임신|진단|질병|약을?\s*끊/u],
  legal: [/lawsuit/i, /legal advice/i, /arrest/i, /소송|법률|구속|계약서/u],
  financial: [/stock/i, /crypto/i, /invest/i, /주식|코인|투자|대출/u],
  self_harm: [
    /suicid/i,
    /kill myself/i,
    /self.?harm/i,
    /자살|죽고\s*싶/u,
    /(?:^|\s)자해(?:$|\s|[?.!,]|를|하다|하고|했|할)/u,
  ],
  violence: [/kill (him|her|them)/i, /attack/i, /폭행|살해|보복/u],
  crime: [/hide (a )?body/i, /evade police/i, /범죄|증거\s*인멸|도주/u],
};

const PRIORITY: readonly Exclude<SafetyCategory, "general">[] = [
  "self_harm",
  "violence",
  "crime",
  "medical",
  "legal",
  "financial",
];

export function assessQuestionSafety(question: string): SafetyAssessment {
  const normalized = question.normalize("NFKC").slice(0, 4_000);
  for (const category of PRIORITY) {
    const matchedTerms = CATEGORY_TERMS[category]
      .filter((pattern) => pattern.test(normalized))
      .map((pattern) => pattern.source);
    if (matchedTerms.length) {
      return {
        category,
        allowSymbolicReflection: !["self_harm", "violence", "crime"].includes(category),
        requiresRealityFirstGuidance: true,
        requiresUrgentSafetyResponse: category === "self_harm" || category === "violence",
        matchedTerms,
      };
    }
  }
  return {
    category: "general",
    allowSymbolicReflection: true,
    requiresRealityFirstGuidance: false,
    requiresUrgentSafetyResponse: false,
    matchedTerms: [],
  };
}

const OVERCLAIM_PATTERNS = [
  /accuracy\s*\d+%/i,
  /will definitely/i,
  /must (break up|invest)/i,
  /정확도\s*\d+%/u,
  /반드시\s*(성공|헤어|투자)/u,
  /미래를\s*정확히\s*예측/u,
];

export function containsProhibitedOverclaim(text: string): boolean {
  return OVERCLAIM_PATTERNS.some((pattern) => pattern.test(text));
}

export function normalizeUntrustedContext(value: string, maxLength = 2_000): string {
  return value.normalize("NFKC").replaceAll("\u0000", "").trim().slice(0, maxLength);
}
