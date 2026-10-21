import type { Locale } from "@/i18n/config";

export const concernFocusIds = ["work", "relationships", "health", "growth", "money"] as const;
export type ConcernFocusId = (typeof concernFocusIds)[number];

export type Bilingual = Readonly<{ ko: string; en: string }>;

export type ConcernTopic = Readonly<{
  id: string;
  focus: ConcernFocusId;
  label: Bilingual;
  /**
   * Answer the user's question directly and name the conditions to check. A direction
   * is not a guaranteed outcome. When information is insufficient, saying so is a
   * valid answer and should be followed by a useful next step rather than false certainty.
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
