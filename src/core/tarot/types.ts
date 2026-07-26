export type LocalizedText = {
  readonly ko: string;
  readonly en: string;
};

export type TarotSuit = "wands" | "cups" | "swords" | "pentacles";
export type TarotOrientation = "upright" | "reversed";

export type TarotCard = {
  readonly id: string;
  readonly arcana: "major" | "minor";
  readonly number?: number;
  readonly rank?: string;
  readonly suit?: TarotSuit;
  readonly name: LocalizedText;
  readonly uprightKeywords: LocalizedText;
  readonly reversedKeywords: LocalizedText;
};

export type TarotQuestionCategory =
  | "work"
  | "love"
  | "money"
  | "relationship"
  | "emotion"
  | "daily_choice"
  | "free";

export type TarotSpreadId = "single" | "three" | `question_${TarotQuestionCategory}`;

export type TarotSpread = {
  readonly id: TarotSpreadId;
  readonly cardCount: 1 | 3;
  readonly version: string;
  readonly positions: readonly LocalizedText[];
};

export type TarotDrawnCard = {
  readonly position: LocalizedText;
  readonly card: TarotCard;
  readonly orientation: TarotOrientation;
};

export type TarotAudit = {
  readonly source: "engine" | "manual";
  readonly algorithmVersion: string;
  readonly deckVersion: string;
  readonly spreadVersion: string;
  readonly eventId: string;
  readonly seed?: string;
  readonly allowReversals: boolean;
};

export type TarotReading = {
  readonly spread: TarotSpread;
  readonly cards: readonly TarotDrawnCard[];
  readonly audit: TarotAudit;
};

export type CombinationInsight = {
  readonly majorArcanaCount: number;
  readonly suitCounts: Readonly<Record<TarotSuit, number>>;
  readonly dominantSuit?: TarotSuit;
  readonly repeatedRanks: readonly string[];
  readonly messages: readonly string[];
};

export class TarotInputError extends Error {
  constructor(
    public readonly code:
      | "UNKNOWN_SPREAD"
      | "UNKNOWN_CARD"
      | "DUPLICATE_CARD"
      | "WRONG_CARD_COUNT"
      | "INVALID_REVERSAL_RATE"
      | "INVALID_SEED",
    message: string,
  ) {
    super(message);
    this.name = "TarotInputError";
  }
}
