import type { Locale } from "@/i18n/config";

export const concernFocusIds = ["work", "relationships", "health", "growth", "money"] as const;
export type ConcernFocusId = (typeof concernFocusIds)[number];

export type Bilingual = Readonly<{ ko: string; en: string }>;

export type ConcernTopic = Readonly<{
  id: string;
  focus: ConcernFocusId;
  label: Bilingual;
  /**
   * The verdict, written as the first thing the buyer reads. It commits to a direction
   * — "해볼 만합니다", "지금은 아닙니다", "순서를 바꾸셔야 합니다" — and names the
   * condition that decides it. A reading that opens by explaining what it cannot do has
   * already lost the reader, so this must never begin with a limitation.
   */
  verdict: Bilingual;
  /** How to look at this particular situation. */
  framing: Bilingual;
  /** What to observe, phrased so the buyer can actually check it. */
  observe: Bilingual;
  /** One thing to do this week. */
  action: Bilingual;
  /** What tends to go wrong in this situation specifically. */
  caution: Bilingual;
  /**
   * True when the situation belongs to a professional or a formal channel rather than
   * to a reading. The report then leads with that instead of offering reflection.
   */
  escalate?: boolean;
  patterns: readonly RegExp[];
}>;

export function n(ko: string, en: string): Bilingual {
  return { ko, en };
}

export function topicText(value: Bilingual, locale: Locale): string {
  return value[locale];
}
