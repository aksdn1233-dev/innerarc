import { z } from "zod";

export const paidReadingProductCodes = ["plus_30d", "pro_30d", "premium_pdf"] as const;
export const paidReadingFocusIds = ["work", "relationships", "growth", "money"] as const;

export const PaidReadingInputSchema = z.object({
  version: z.literal(1),
  locale: z.enum(["ko", "en"]),
  productCode: z.enum(paidReadingProductCodes),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.string().max(200),
  focusId: z.enum(paidReadingFocusIds),
  concern: z.string().min(1).max(2_000),
  createdAt: z.string().datetime(),
}).strict();

export type PaidReadingInput = z.infer<typeof PaidReadingInputSchema>;

export type PaidReport = Readonly<{
  version: 1;
  orderId: string;
  productCode: PaidReadingInput["productCode"];
  locale: PaidReadingInput["locale"];
  title: string;
  customerName: string | null;
  createdAt: string;
  concern: string;
  summary: string;
  sections: readonly Readonly<{
    title: string;
    body: string;
  }>[];
  actions: readonly string[];
  cautions: readonly string[];
  disclaimer: string;
  /**
   * Additive fields introduced after the first reports were sold. Optional because
   * reports stored before this change do not have them — the renderer must not assume
   * they exist. New reports always populate all four.
   */
  tierLabel?: string;
  characterLabel?: string;
  sharpInsights?: readonly string[];
  contentVersion?: string;
}>;
