import {
  fitRatings,
  MONTHLY_PATTERN_RULE_VERSION,
  NEXT_ANALYSIS_CONTEXT_VERSION,
  REALITY_CHECK_RULE_VERSION,
  RealityCheckInputError,
  reflectionCategories,
  type FitRating,
  type MonthlyPatternReport,
  type NextAnalysisContext,
  type NextAnalysisSignal,
  type NextAnalysisTreatment,
  type OutcomeReviewDraft,
  type PatternCategorySummary,
  type PatternFitGroup,
  type RealityCheckDraft,
  type RealityCheckRecord,
  type RealityCheckStatus,
  type ReflectionCategory,
} from "./types";

type Locale = "ko" | "en";

const LIMITS = {
  question: 1_000,
  currentState: 1_000,
  interpretation: 2_000,
  choice: 1_000,
  actionPlan: 1_000,
  outcome: 2_000,
  learning: 1_000,
} as const;

function cleanText(value: string, field: keyof typeof LIMITS): string {
  const cleaned = value.trim();
  if (!cleaned) throw new RealityCheckInputError(field, `${field} is required.`);
  if (cleaned.length > LIMITS[field]) {
    throw new RealityCheckInputError(field, `${field} must be ${LIMITS[field]} characters or fewer.`);
  }
  return cleaned;
}

function assertRequestId(value: string): string {
  const cleaned = value.trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/.test(cleaned)) {
    throw new RealityCheckInputError("clientRequestId", "A valid client request ID is required.");
  }
  return cleaned;
}

function parseIsoDate(value: string, field: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new RealityCheckInputError(field, `${field} must use YYYY-MM-DD.`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new RealityCheckInputError(field, `${field} must be a real date.`);
  }
  return date;
}

function parseIsoDateTime(value: string, field: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || !/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    throw new RealityCheckInputError(field, `${field} must be an ISO date-time.`);
  }
  return date;
}

function assertIsoMonth(value: string, field = "month"): string {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    throw new RealityCheckInputError(field, `${field} must use YYYY-MM.`);
  }
  return value;
}

function assertCategory(value: ReflectionCategory): ReflectionCategory {
  if (!reflectionCategories.includes(value)) {
    throw new RealityCheckInputError("category", "Unsupported reflection category.");
  }
  return value;
}

export function createRealityCheckRecord(
  draft: RealityCheckDraft,
  meta: { id: string; createdAt: string; createdDate?: string },
): RealityCheckRecord {
  const createdAt = parseIsoDateTime(meta.createdAt, "createdAt");
  const reviewDate = parseIsoDate(draft.reviewDate, "reviewDate");
  const utcCreatedDay = new Date(`${createdAt.toISOString().slice(0, 10)}T00:00:00.000Z`);
  const createdDay = meta.createdDate
    ? parseIsoDate(meta.createdDate, "createdDate")
    : utcCreatedDay;
  if (Math.abs(createdDay.getTime() - utcCreatedDay.getTime()) > 86_400_000) {
    throw new RealityCheckInputError(
      "createdDate",
      "Local creation date is inconsistent with createdAt.",
    );
  }
  if (reviewDate < createdDay) {
    throw new RealityCheckInputError("reviewDate", "Review date cannot be before the record date.");
  }
  if (!meta.id.trim()) throw new RealityCheckInputError("id", "Record ID is required.");

  return {
    id: meta.id.trim(),
    clientRequestId: assertRequestId(draft.clientRequestId),
    category: assertCategory(draft.category),
    question: cleanText(draft.question, "question"),
    currentState: cleanText(draft.currentState, "currentState"),
    interpretation: cleanText(draft.interpretation, "interpretation"),
    choice: cleanText(draft.choice, "choice"),
    actionPlan: cleanText(draft.actionPlan, "actionPlan"),
    reviewDate: draft.reviewDate,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
    ruleVersion: REALITY_CHECK_RULE_VERSION,
  };
}

export function addOutcomeReview(
  record: RealityCheckRecord,
  draft: OutcomeReviewDraft,
  reviewedAtInput: string,
  reviewedMonthInput?: string,
): RealityCheckRecord {
  const reviewedAt = parseIsoDateTime(reviewedAtInput, "reviewedAt").toISOString();
  const reviewedMonth = assertIsoMonth(
    reviewedMonthInput ?? reviewedAt.slice(0, 7),
    "reviewedMonth",
  );
  if (!fitRatings.includes(draft.fit as FitRating)) {
    throw new RealityCheckInputError("fit", "Unsupported reflection-fit rating.");
  }
  const review = {
    clientRequestId: assertRequestId(draft.clientRequestId),
    outcome: cleanText(draft.outcome, "outcome"),
    fit: draft.fit,
    learning: cleanText(draft.learning, "learning"),
    reviewedAt,
    reviewedMonth,
  };
  return { ...record, review, updatedAt: reviewedAt };
}

export function getRealityCheckStatus(record: RealityCheckRecord, today: string): RealityCheckStatus {
  if (record.review) return "reviewed";
  const current = parseIsoDate(today, "today");
  return parseIsoDate(record.reviewDate, "reviewDate") <= current ? "due" : "planned";
}

function fitBucket(fit: FitRating): Exclude<PatternFitGroup, "repeatedly_relevant"> | "relevant" {
  if (fit === "accurate" || fit === "mostly_relevant") return "relevant";
  if (fit === "not_relevant") return "not_relevant";
  return "uncertain";
}

const NEXT_ANALYSIS_EXCLUDED_FIELDS = [
  "question",
  "currentState",
  "interpretation",
  "choice",
  "actionPlan",
  "outcome",
  "birthDate",
  "name",
] as const;

function contextLearning(value: string): string {
  const withoutControls = value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u202A-\u202E\u2066-\u2069]/gu, "")
    .trim();
  return Array.from(withoutControls).slice(0, 280).join("");
}

function nextAnalysisLanguage(
  signal: NextAnalysisSignal,
  locale: Locale,
): Pick<NextAnalysisContext, "guidance" | "uncertainty"> {
  const guidance: Record<NextAnalysisSignal, Record<Locale, string>> = {
    insufficient_evidence: {
      ko: "검토된 관계 결과가 두 건 미만이라 다음 분석에 개인화 가정을 적용하지 않습니다.",
      en: "Fewer than two relationship outcomes have been reviewed, so no personalization assumption is applied to the next analysis.",
    },
    repeatedly_relevant: {
      ko: "이전 관계 회고에서 반복적으로 관련성이 있었던 관점은 결론이 아니라 다시 확인할 가설로 유지합니다.",
      en: "A perspective that was repeatedly relevant in prior relationship reviews is retained as a hypothesis to test again, not a conclusion.",
    },
    mixed_or_uncertain: {
      ko: "이전 결과가 섞여 있거나 판단하기 어려웠으므로 강한 가정을 피하고 어떤 조건에서 달라졌는지 구체적으로 확인합니다.",
      en: "Prior outcomes were mixed or hard to judge, so the next analysis avoids a strong assumption and asks which conditions changed the fit.",
    },
    repeatedly_not_relevant: {
      ko: "이전 관계 회고에서 반복적으로 맞지 않았던 추론은 약화하고, 사용자가 기록한 실제 조건과 행동을 우선합니다.",
      en: "An inference that was repeatedly not relevant in prior relationship reviews is de-emphasized, while recorded real conditions and behavior take priority.",
    },
  };
  return {
    guidance: guidance[signal][locale],
    uncertainty: locale === "ko"
      ? "이 층은 생년월일 패턴의 정확도를 높이거나 미래를 예측하지 않습니다. 저장된 개인 관련성 평가를 다음 성찰에서 어떻게 다룰지만 정합니다."
      : "This layer does not improve numerology accuracy or predict the future. It only determines how saved personal-relevance feedback should be treated in the next reflection.",
  };
}

export function createNextAnalysisContext(
  records: readonly RealityCheckRecord[],
  category: ReflectionCategory,
  locale: Locale,
): NextAnalysisContext {
  const checkedCategory = assertCategory(category);
  if (!Array.isArray(records) || records.length > 500) {
    throw new RealityCheckInputError("records", "At most 500 Reality Check records are supported.");
  }

  const reviewed = records
    .filter((record) => record.category === checkedCategory && record.review)
    .map((record) => {
      const review = record.review!;
      if (!fitRatings.includes(review.fit)) {
        throw new RealityCheckInputError("fit", "Unsupported reflection-fit rating.");
      }
      const reviewedAt = parseIsoDateTime(review.reviewedAt, "reviewedAt").toISOString();
      return {
        fit: review.fit,
        learning: contextLearning(review.learning),
        reviewedAt,
        stableOrder: `${reviewedAt}:${record.id}`,
      };
    })
    .sort((left, right) =>
      right.reviewedAt.localeCompare(left.reviewedAt)
      || left.stableOrder.localeCompare(right.stableOrder));

  const relevantCount = reviewed.filter(({ fit }) => fitBucket(fit) === "relevant").length;
  const uncertainCount = reviewed.filter(({ fit }) => fitBucket(fit) === "uncertain").length;
  const notRelevantCount = reviewed.filter(({ fit }) => fitBucket(fit) === "not_relevant").length;
  const reviewedCount = reviewed.length;
  let signal: NextAnalysisSignal = "insufficient_evidence";
  let treatment: NextAnalysisTreatment = "no_personalization";

  if (reviewedCount >= 2) {
    if (relevantCount / reviewedCount >= 2 / 3) {
      signal = "repeatedly_relevant";
      treatment = "retain_as_hypothesis";
    } else if (notRelevantCount / reviewedCount >= 2 / 3) {
      signal = "repeatedly_not_relevant";
      treatment = "deemphasize_prior_inference";
    } else {
      signal = "mixed_or_uncertain";
      treatment = "ask_for_specific_conditions";
    }
  }

  const userLearnings = signal === "insufficient_evidence"
    ? []
    : reviewed.reduce<string[]>((items, { learning }) => {
        if (learning && !items.includes(learning) && items.length < 3) items.push(learning);
        return items;
      }, []);
  const language = nextAnalysisLanguage(signal, locale);

  return {
    contextVersion: NEXT_ANALYSIS_CONTEXT_VERSION,
    source: "outcome_review",
    trust: "untrusted_user_data",
    category: checkedCategory,
    signal,
    treatment,
    reviewedCount,
    relevantCount,
    uncertainCount,
    notRelevantCount,
    userLearnings,
    evidenceRefs: reviewed.map((_, index) => `outcomeReview:${index + 1}` as const),
    excludedRawFields: NEXT_ANALYSIS_EXCLUDED_FIELDS,
    ...language,
  };
}

function groupCategory(
  category: ReflectionCategory,
  fits: FitRating[],
): PatternCategorySummary {
  const relevantCount = fits.filter((fit) => fitBucket(fit) === "relevant").length;
  const uncertainCount = fits.filter((fit) => fitBucket(fit) === "uncertain").length;
  const notRelevantCount = fits.filter((fit) => fitBucket(fit) === "not_relevant").length;
  const threshold = fits.length >= 2 ? 2 / 3 : Number.POSITIVE_INFINITY;
  const group: PatternFitGroup =
    relevantCount / fits.length >= threshold
      ? "repeatedly_relevant"
      : notRelevantCount / fits.length >= threshold
        ? "not_relevant"
        : "uncertain";
  return {
    category,
    reviewedCount: fits.length,
    relevantCount,
    uncertainCount,
    notRelevantCount,
    group,
  };
}

export function createMonthlyPatternReport(
  records: RealityCheckRecord[],
  month: string,
): MonthlyPatternReport {
  const checkedMonth = assertIsoMonth(month);
  const reviewed = records.filter((record) => {
    if (!record.review) return false;
    const reviewMonth = record.review.reviewedMonth
      ? assertIsoMonth(record.review.reviewedMonth, "reviewedMonth")
      : parseIsoDateTime(record.review.reviewedAt, "reviewedAt").toISOString().slice(0, 7);
    return reviewMonth === checkedMonth;
  });
  const legacyMonthCount = reviewed.filter((record) => !record.review?.reviewedMonth).length;
  const byCategory = new Map<ReflectionCategory, FitRating[]>();
  for (const record of reviewed) {
    const existing = byCategory.get(record.category) ?? [];
    existing.push(record.review!.fit);
    byCategory.set(record.category, existing);
  }
  const summaries = [...byCategory.entries()]
    .map(([category, fits]) => groupCategory(category, fits))
    .sort((a, b) => b.reviewedCount - a.reviewedCount || a.category.localeCompare(b.category));
  return {
    month: checkedMonth,
    reviewedCount: reviewed.length,
    legacyMonthCount,
    repeatedlyRelevant: summaries.filter((summary) => summary.group === "repeatedly_relevant"),
    uncertain: summaries.filter((summary) => summary.group === "uncertain"),
    notRelevant: summaries.filter((summary) => summary.group === "not_relevant"),
    insufficientEvidence: reviewed.length < 3,
    languageNote:
      "This report summarizes personal relevance in recorded outcomes; it does not measure predictive accuracy.",
    ruleVersion: MONTHLY_PATTERN_RULE_VERSION,
  };
}

export function listMonthlyReportMonths(
  records: RealityCheckRecord[],
  currentMonth: string,
): string[] {
  const months = new Set<string>([assertIsoMonth(currentMonth, "currentMonth")]);
  for (const record of records) {
    if (!record.review) continue;
    months.add(
      record.review.reviewedMonth
        ? assertIsoMonth(record.review.reviewedMonth, "reviewedMonth")
        : parseIsoDateTime(record.review.reviewedAt, "reviewedAt").toISOString().slice(0, 7),
    );
  }
  return [...months].sort((left, right) => right.localeCompare(left));
}
