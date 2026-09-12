import { z } from "zod";

export const PATTERN_INTELLIGENCE_SCHEMA_VERSION = "pattern-intelligence-1.0.0" as const;

export const patternSourceSystems = [
  "saju",
  "numerology",
  "tarot",
  "dream",
  "relationship",
  "behavioral",
  "user_reported",
  "derived",
] as const;
export const PatternSourceSystemSchema = z.enum(patternSourceSystems);

export const realityCheckResponses = [
  "MATCH",
  "PARTIAL",
  "MISMATCH",
  "CONTEXT_DEPENDENT",
] as const;
export const PatternRealityCheckResponseSchema = z.enum(realityCheckResponses);
export type PatternRealityCheckResponse = z.infer<typeof PatternRealityCheckResponseSchema>;

export const evidenceOutcomes = ["positive", "negative", "mixed", "neutral", "unresolved"] as const;
export const EvidenceOutcomeSchema = z.enum(evidenceOutcomes);

export const evidenceRelations = ["SUPPORT", "CONTRADICT", "AMBIGUOUS"] as const;
export const EvidenceRelationSchema = z.enum(evidenceRelations);

export const LifeDomainSchema = z.enum([
  "relationship",
  "work",
  "money",
  "family",
  "health_lifestyle",
  "decision",
  "education",
  "move",
  "growth",
  "other",
]);

const boundedText = (max: number) => z.string().trim().min(1).max(max);
const clientRequestId = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/);

export const ReportRealityCheckInputSchema = z.object({
  orderId: z.string().regex(/^[A-Za-z0-9_-]{6,64}$/),
  sectionIndex: z.number().int().min(0).max(200),
  response: PatternRealityCheckResponseSchema,
  note: z.string().trim().max(500).optional().default(""),
  clientRequestId,
}).strict();

export const EvidenceEventInputSchema = z.object({
  eventType: z.enum([
    "relationship",
    "breakup",
    "reunion",
    "job_change",
    "employment",
    "business",
    "large_purchase",
    "investment_result",
    "family_conflict",
    "social_relationship",
    "health_lifestyle_change",
    "important_decision",
    "exam_result",
    "move",
    "financial_change",
    "other",
  ]),
  lifeDomain: LifeDomainSchema,
  eventDate: z.string().date(),
  approximateDate: z.boolean().default(false),
  shortDescription: boundedText(500),
  outcome: EvidenceOutcomeSchema.default("unresolved"),
  orderId: z.string().regex(/^[A-Za-z0-9_-]{6,64}$/).optional(),
  sectionIndex: z.number().int().min(0).max(200).optional(),
  relation: EvidenceRelationSchema.optional(),
  relationshipContext: z.string().trim().max(200).optional().default(""),
  clientRequestId,
}).strict().superRefine((value, context) => {
  const linked = value.orderId !== undefined || value.sectionIndex !== undefined || value.relation !== undefined;
  if (linked && (value.orderId === undefined || value.sectionIndex === undefined || value.relation === undefined)) {
    context.addIssue({
      code: "custom",
      path: ["orderId"],
      message: "orderId, sectionIndex, and relation must be supplied together",
    });
  }
});

export type ConfidenceLabel = "검증 중" | "낮음" | "보통" | "높음";
