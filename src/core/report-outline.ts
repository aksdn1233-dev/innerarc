import type { PaidReport } from "@/core/paid-reading";

export type ReportOutlineEntry = Readonly<{
  /** 1-based position, rendered as 01, 02, … so the reader can count the chapters. */
  position: number;
  title: string;
  /** Present only on open entries. A real opening from the real generator, trimmed. */
  excerpt?: string;
  locked: boolean;
}>;

export type ReportOutline = Readonly<{
  productCode: PaidReport["productCode"];
  tierLabel: string;
  /** Every chapter the buyer receives, including the ones this outline does not list. */
  totalSections: number;
  entries: readonly ReportOutlineEntry[];
  /** Chapters that exist in the delivered report but are not listed above. */
  remaining: number;
}>;

function trimExcerpt(body: string, maxLength: number): string {
  // The generators write multi-paragraph bodies. The first paragraph is the one written
  // to stand alone, so a preview takes that and nothing after it.
  const paragraph = body.split(/\n{2,}/, 1)[0]?.replace(/\s+/g, " ").trim() ?? "";
  if (paragraph.length <= maxLength) return paragraph;
  const cut = paragraph.slice(0, maxLength);
  // Cutting mid-sentence and adding an ellipsis reads as a truncation bug rather than
  // as a preview, so a sentence boundary inside the window ends the excerpt cleanly.
  const lastStop = cut.lastIndexOf(".");
  if (lastStop > maxLength * 0.5) return cut.slice(0, lastStop + 1);
  return `${cut.trimEnd()}…`;
}

/**
 * The chapter list of a real generated report, with the first few opened.
 *
 * This exists so a buyer can see the thing they are buying before paying for it. It is
 * built from a report the production generator actually produced, so a title shown here
 * is a title that will be delivered — a hand-written mock-up would drift from the
 * generator the first time either one changed.
 */
export function buildReportOutline(
  report: PaidReport,
  options: Readonly<{ openCount: number; maxEntries: number; excerptLength?: number }>,
): ReportOutline {
  const openCount = Math.max(0, options.openCount);
  const maxEntries = Math.max(openCount, options.maxEntries);
  const excerptLength = options.excerptLength ?? 150;
  const listed = report.sections.slice(0, maxEntries);
  const entries = listed.map((section, index) => {
    const open = index < openCount;
    return {
      position: index + 1,
      title: section.title,
      ...(open ? { excerpt: trimExcerpt(section.keySentence ?? section.body, excerptLength) } : {}),
      locked: !open,
    } satisfies ReportOutlineEntry;
  });
  return {
    productCode: report.productCode,
    tierLabel: report.tierLabel ?? "",
    totalSections: report.sections.length,
    entries,
    remaining: Math.max(0, report.sections.length - entries.length),
  };
}
