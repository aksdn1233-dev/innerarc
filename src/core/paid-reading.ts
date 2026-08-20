import { z } from "zod";
import { isAcceptedBirthDate } from "@/core/birth-range";
import { relationshipTypes } from "@/core/compatibility/types";
import type { ReportLanguageAudit } from "@/core/report-quality";
import type {
  EnrichmentAuditEntry,
  ReportCoverageCategory,
  TierComparisonAudit,
} from "@/core/tier-inheritance";

export const paidReadingProductCodes = ["plus_30d", "pro_30d", "premium_pdf"] as const;
export const paidReadingFocusIds = ["work", "relationships", "health", "growth", "money"] as const;

const optionalBirthTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional();
const companionSchema = z.object({
  name: z.string().max(200),
  birthDate: z.string().refine(isAcceptedBirthDate, "UNSUPPORTED_BIRTH_DATE"),
  birthTime: optionalBirthTime,
  gender: z.enum(["female", "male", "unstated"]).optional(),
  relationshipType: z.enum(relationshipTypes),
}).strict();

export const PaidReadingInputSchema = z.object({
  version: z.literal(1),
  locale: z.enum(["ko", "en"]),
  productCode: z.enum(paidReadingProductCodes),
  readingKind: z.enum(["numerology", "saju_chart"]).optional(),
  birthDate: z.string().refine(isAcceptedBirthDate, "UNSUPPORTED_BIRTH_DATE"),
  birthTime: optionalBirthTime,
  name: z.string().max(200),
  focusId: z.enum(paidReadingFocusIds),
  concern: z.string().max(2_000),
  // Asked for on the opening screen. Optional because a draft written before this
  // existed is still a valid draft, and the reading does not require it.
  gender: z.enum(["female", "male", "unstated"]).optional(),
  midnightConvention: z.enum(["야자시", "조자시"]).optional(),
  questions: z.array(z.string().trim().min(1).max(1_000)).max(2).optional(),
  companion: companionSchema.optional(),
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
  /**
   * New BASIC_19000 reports carry a compact calculation basis and an explicit
   * layout marker. Both remain optional so reports bought before this composition
   * update continue to render with their original structure.
   */
  sectionPlan?: "basic-19000-v2" | "detail-39000-v2" | "premium-79000-v2";
  calculationBasis?: Readonly<{
    birthDate: string;
    serviceYear: number;
    lifePath: number;
    birthday: number;
    attitude: number;
    birthYear: number;
    personalYear: number;
  }>;
  /** Internal provenance for audits. Renderers must not expose these identifiers. */
  contentReferences?: readonly string[];
  /** Machine-readable tier inheritance evidence used by regression audits. */
  coverageCategories?: readonly ReportCoverageCategory[];
  enrichmentAudit?: readonly EnrichmentAuditEntry[];
  tierComparisonAudit?: TierComparisonAudit;
  paidPreview?: Readonly<{
    visible: string;
    unlockedSectionTitle: string;
    lockedTopics: readonly string[];
  }>;
  qualityAudit?: ReportLanguageAudit;
}>;
