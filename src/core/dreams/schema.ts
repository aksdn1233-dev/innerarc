import { z } from "zod";

export const DREAM_SCHEMA_VERSION = "dream-intelligence-1.0.0" as const;
export const DREAM_ENGINE_VERSION = "dream-engine-1.0.0" as const;

const boundedText = (maximum: number) => z.string().trim().min(1).max(maximum);
const optionalText = (maximum: number) => z.string().trim().max(maximum).default("");
const opaqueId = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/);

export const DreamLocaleSchema = z.enum(["ko", "en"]);
export const SourceTierSchema = z.enum(["A", "B", "C", "D", "X"]);
export const ConfidenceLevelSchema = z.enum(["low", "medium", "high"]);
export const PersonalEvidenceLevelSchema = z.enum(["none", "initial", "repeated", "strong"]);
export const OutcomeEvidenceLevelSchema = z.enum(["unconfirmed", "partial", "repeated"]);
export const OverallPatternLevelSchema = z.enum(["reference", "possible", "strong_personal_pattern"]);

export const DreamSourceSchema = z.object({
  sourceId: z.string().regex(/^dream-source:[a-z0-9._-]{3,80}$/),
  title: boundedText(240),
  author: boundedText(180),
  period: boundedText(120),
  culture: boundedText(120),
  sourceType: z.enum(["primary_text", "scholarly_edition", "peer_reviewed", "museum", "clinical_guideline", "folklore_record"]),
  primaryOrSecondary: z.enum(["primary", "secondary"]),
  academicQuality: SourceTierSchema,
  historicalAuthenticity: z.enum(["established", "qualified", "contested", "not_applicable"]),
  translationQuality: z.enum(["original_language", "scholarly", "institutional", "qualified", "not_applicable"]),
  citation: z.url(),
  notes: boundedText(500),
}).strict();
export type DreamSource = z.infer<typeof DreamSourceSchema>;

export const OntologyKindSchema = z.enum(["entity", "action", "state", "emotion", "relation", "context", "location"]);
export const OntologyTokenSchema = z.object({
  kind: OntologyKindSchema,
  code: z.string().regex(/^[A-Z][A-Z0-9_]{1,63}$/),
  label: z.object({ ko: boundedText(60), en: boundedText(80) }).strict(),
  evidence: boundedText(160),
}).strict();

export const DreamCategorySchema = z.enum([
  "DAILY_CONTINUITY",
  "EMOTIONAL_PROCESSING",
  "REPEATING_PATTERN",
  "SYMBOLIC",
  "NIGHTMARE",
  "BODY_STATE_RELATED",
  "TRAUMA_RELATED_POSSIBLE",
  "TRADITIONAL_INTERPRETABLE",
  "LUCID_DREAM",
  "UNKNOWN",
]);

export const DreamContextSchema = z.object({
  currentConcern: optionalText(500),
  recentExperience: optionalText(800),
  bodyState: optionalText(300),
  recurring: z.boolean().default(false),
  lucid: z.boolean().default(false),
}).strict();

export const DreamInputSchema = z.object({
  requestId: opaqueId,
  locale: DreamLocaleSchema,
  dreamDate: z.string().date(),
  rawText: boundedText(4_000),
  context: DreamContextSchema.default({ currentConcern: "", recentExperience: "", bodyState: "", recurring: false, lucid: false }),
  retainRawText: z.boolean().default(false),
  allowRemoteAI: z.boolean().default(false),
}).strict();
export type DreamInput = z.infer<typeof DreamInputSchema>;

export const FollowUpQuestionSchema = z.object({
  id: z.string().regex(/^followup:[a-z0-9_-]{3,50}$/),
  question: boundedText(180),
  reason: boundedText(240),
}).strict();

export const InterpretationEvidenceSchema = z.object({
  evidenceType: z.enum(["traditional", "modern_research", "personal_context", "symbolic_system", "personal_history", "ai_inference"]),
  statement: boundedText(900),
  sourceIds: z.array(z.string().regex(/^dream-source:[a-z0-9._-]{3,80}$/)).max(8),
  confidence: ConfidenceLevelSchema,
  limitation: boundedText(500),
}).strict().superRefine((value, ctx) => {
  if (["traditional", "modern_research"].includes(value.evidenceType) && value.sourceIds.length === 0) {
    ctx.addIssue({ code: "custom", path: ["sourceIds"], message: "Published evidence requires an allowlisted source ID." });
  }
  if (["personal_context", "personal_history", "ai_inference"].includes(value.evidenceType) && value.sourceIds.length > 0) {
    ctx.addIssue({ code: "custom", path: ["sourceIds"], message: "Personal or inferred evidence cannot impersonate published evidence." });
  }
});

export const DreamConfidenceSchema = z.object({
  tradition: ConfidenceLevelSchema,
  modernResearch: ConfidenceLevelSchema,
  currentContext: ConfidenceLevelSchema,
  personalHistory: PersonalEvidenceLevelSchema,
  outcomeEvidence: OutcomeEvidenceLevelSchema,
  overall: OverallPatternLevelSchema,
}).strict();

export const DreamInterpretationSchema = z.object({
  schemaVersion: z.literal(DREAM_SCHEMA_VERSION),
  engineVersion: z.literal(DREAM_ENGINE_VERSION),
  title: boundedText(120),
  headline: boundedText(240),
  normalizedSummary: boundedText(800),
  ontology: z.array(OntologyTokenSchema).max(40),
  categories: z.array(DreamCategorySchema).min(1).max(10),
  followUpQuestions: z.array(FollowUpQuestionSchema).max(3),
  layers: z.object({
    tradition: z.array(InterpretationEvidenceSchema).max(5),
    modernResearch: z.array(InterpretationEvidenceSchema).max(5),
    personalContext: z.array(InterpretationEvidenceSchema).max(5),
    symbolicSystems: z.array(InterpretationEvidenceSchema).max(5),
    personalHistory: z.array(InterpretationEvidenceSchema).max(5),
  }).strict(),
  watchAreas: z.array(boundedText(120)).max(5),
  confidence: DreamConfidenceSchema,
  safetyNotices: z.array(boundedText(500)).max(5),
  sourceIds: z.array(z.string().regex(/^dream-source:[a-z0-9._-]{3,80}$/)).max(20),
}).strict();
export type DreamInterpretation = z.infer<typeof DreamInterpretationSchema>;

export const DreamOutcomeKindSchema = z.enum(["none", "money", "work", "new_person", "relationship", "family", "health", "exam", "business", "move", "other"]);
export const DreamFollowUpSchema = z.object({
  id: opaqueId,
  dueDays: z.union([z.literal(3), z.literal(7), z.literal(30)]),
  dueDate: z.string().date(),
  completedAt: z.string().datetime({ offset: true }).nullable(),
  outcome: DreamOutcomeKindSchema.nullable(),
  note: z.string().trim().max(1_000),
  fit: z.enum(["MATCH", "PARTIAL", "MISMATCH", "CONTEXT_DEPENDENT"]).nullable(),
}).strict();

export const InterpretationRevisionSchema = z.object({
  revision: z.number().int().min(1).max(100),
  createdAt: z.string().datetime({ offset: true }),
  reason: boundedText(500),
  interpretation: DreamInterpretationSchema,
}).strict();

export const DreamEventSchema = z.object({
  schemaVersion: z.literal(DREAM_SCHEMA_VERSION),
  id: opaqueId,
  userId: opaqueId.nullable(),
  dreamDate: z.string().date(),
  recordedAt: z.string().datetime({ offset: true }),
  rawText: z.string().max(4_000).nullable(),
  rawTextRetained: z.boolean(),
  currentConcern: z.string().max(500),
  initialInterpretation: DreamInterpretationSchema,
  initialTimestamp: z.string().datetime({ offset: true }),
  revisions: z.array(InterpretationRevisionSchema).max(100),
  followUps: z.array(DreamFollowUpSchema).length(3),
  updatedAt: z.string().datetime({ offset: true }),
}).strict().superRefine((value, ctx) => {
  if (!value.rawTextRetained && value.rawText !== null) ctx.addIssue({ code: "custom", path: ["rawText"], message: "Raw text requires explicit retention consent." });
  if (value.initialTimestamp !== value.recordedAt) ctx.addIssue({ code: "custom", path: ["initialTimestamp"], message: "Initial timestamp must be immutable." });
  value.revisions.forEach((revision, index) => {
    if (revision.revision !== index + 1) ctx.addIssue({ code: "custom", path: ["revisions", index, "revision"], message: "Revisions must be contiguous." });
  });
});
export type DreamEvent = z.infer<typeof DreamEventSchema>;

export const DreamSignatureSchema = z.object({
  status: z.enum(["insufficient", "initial", "established"]),
  sampleSize: z.number().int().min(0).max(500),
  minimumRequired: z.number().int().min(3).max(10),
  recurringEntities: z.array(z.object({ code: z.string(), label: z.string(), count: z.number().int().positive() }).strict()).max(10),
  recurringEmotions: z.array(z.object({ code: z.string(), label: z.string(), count: z.number().int().positive() }).strict()).max(10),
  recurringActions: z.array(z.object({ code: z.string(), label: z.string(), count: z.number().int().positive() }).strict()).max(10),
  temporalClusters: z.array(z.object({ code: z.string(), occurrences: z.number().int().min(2), windowDays: z.union([z.literal(30), z.literal(90)]) }).strict()).max(20),
  note: boundedText(300),
}).strict();
export type DreamSignature = z.infer<typeof DreamSignatureSchema>;
