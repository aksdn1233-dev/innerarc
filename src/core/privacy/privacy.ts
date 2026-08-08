import { z } from "zod";

export const ConsentStateSchema = z.object({
  privacyRequired: z.literal(true),
  aiPersonalization: z.boolean(),
  modelTraining: z.boolean(),
  productAnalytics: z.boolean(),
  marketing: z.boolean(),
  rawJournalRetention: z.boolean(),
  acceptedAt: z.string().datetime(),
  policyVersion: z.string().min(1),
});

export type ConsentState = z.infer<typeof ConsentStateSchema>;

const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const ISO_DATE = /\b\d{4}-\d{2}-\d{2}\b/g;

export function maskSensitiveLog(value: string): string {
  return value
    .replace(EMAIL, "[REDACTED_EMAIL]")
    .replace(ISO_DATE, "[REDACTED_DATE]")
    .slice(0, 2_000);
}
