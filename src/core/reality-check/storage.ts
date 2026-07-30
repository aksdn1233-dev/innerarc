import { z } from "zod";
import { fitRatings, REALITY_CHECK_RULE_VERSION, reflectionCategories, type RealityCheckRecord } from "./types";

export const REALITY_CHECK_STORAGE_KEY = "innerarc:reality-check:v1";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const requestIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/);
const recordIdSchema = z.string().trim().min(1).max(120);
const requiredText = (maximum: number) => z.string().trim().min(1).max(maximum);
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
});
const isoDateTimeSchema = z.string().datetime({ offset: true });
const isoMonthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

const reviewSchema = z.object({
  clientRequestId: requestIdSchema,
  outcome: requiredText(2_000),
  fit: z.enum(fitRatings),
  learning: requiredText(1_000),
  reviewedAt: isoDateTimeSchema,
  reviewedMonth: isoMonthSchema.optional(),
}).strict();

const recordSchema = z.object({
  id: recordIdSchema,
  clientRequestId: requestIdSchema,
  category: z.enum(reflectionCategories),
  question: requiredText(1_000),
  currentState: requiredText(1_000),
  interpretation: requiredText(2_000),
  choice: requiredText(1_000),
  actionPlan: requiredText(1_000),
  reviewDate: isoDateSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
  ruleVersion: z.literal(REALITY_CHECK_RULE_VERSION),
  review: reviewSchema.optional(),
}).strict().superRefine((record, context) => {
  if (Date.parse(record.updatedAt) < Date.parse(record.createdAt)) {
    context.addIssue({ code: "custom", path: ["updatedAt"], message: "updatedAt cannot precede createdAt" });
  }
  if (record.review && Date.parse(record.review.reviewedAt) < Date.parse(record.createdAt)) {
    context.addIssue({
      code: "custom",
      path: ["review", "reviewedAt"],
      message: "reviewedAt cannot precede createdAt",
    });
  }
});

const payloadSchema = z.object({
  version: z.literal(1),
  records: z.array(recordSchema).max(500),
}).strict().superRefine((payload, context) => {
  const recordIds = new Set<string>();
  const createRequestIds = new Set<string>();
  const reviewRequestIds = new Set<string>();
  payload.records.forEach((record, index) => {
    if (recordIds.has(record.id)) {
      context.addIssue({ code: "custom", path: ["records", index, "id"], message: "Duplicate record ID" });
    }
    if (createRequestIds.has(record.clientRequestId)) {
      context.addIssue({
        code: "custom",
        path: ["records", index, "clientRequestId"],
        message: "Duplicate create request ID",
      });
    }
    if (record.review && reviewRequestIds.has(record.review.clientRequestId)) {
      context.addIssue({
        code: "custom",
        path: ["records", index, "review", "clientRequestId"],
        message: "Duplicate review request ID",
      });
    }
    recordIds.add(record.id);
    createRequestIds.add(record.clientRequestId);
    if (record.review) reviewRequestIds.add(record.review.clientRequestId);
  });
});

export function validateRealityCheckRecords(candidate: unknown): RealityCheckRecord[] {
  return payloadSchema.parse({ version: 1, records: candidate }).records;
}

export function saveRealityChecks(storage: StorageLike, records: RealityCheckRecord[]): void {
  storage.setItem(
    REALITY_CHECK_STORAGE_KEY,
    JSON.stringify({ version: 1, records: validateRealityCheckRecords(records) }),
  );
}

export function loadRealityChecks(storage: StorageLike): RealityCheckRecord[] {
  const raw = storage.getItem(REALITY_CHECK_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = payloadSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.records : [];
  } catch {
    return [];
  }
}

export function clearRealityChecks(storage: StorageLike): void {
  storage.removeItem(REALITY_CHECK_STORAGE_KEY);
}

export function exportRealityChecks(records: RealityCheckRecord[], exportedAt: string): string {
  return JSON.stringify(
    {
      product: "InnerArc",
      schemaVersion: 1,
      exportedAt,
      data: { realityChecks: records },
    },
    null,
    2,
  );
}
