import type { ReportOutline } from "@/core/report-outline";

/** Server-generated, bounded sample content shared with the public home preview. */
export type DailyHealingReportPreview = Readonly<{
  outline: ReportOutline;
  summary: string;
  nextAction: string;
  calculationBasis: Readonly<{ lifePath: number; birthday: number; attitude: number; personalYear: number }> | null;
}>;
