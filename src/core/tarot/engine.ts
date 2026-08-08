import {
  TAROT_CARD_BY_ID,
  TAROT_DECK,
  TAROT_DECK_VERSION,
  TAROT_SPREAD_BY_ID,
} from "./data";
import {
  TarotInputError,
  type CombinationInsight,
  type TarotDrawnCard,
  type TarotOrientation,
  type TarotReading,
  type TarotSpreadId,
  type TarotSuit,
} from "./types";

export const TAROT_DRAW_ALGORITHM_VERSION = "mulberry32-fisher-yates-1.0.0";

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createPrng(seed: string): () => number {
  let state = hashSeed(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function secureSeed(): string {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("A cryptographically secure random source is required.");
  }
  const values = new Uint32Array(4);
  globalThis.crypto.getRandomValues(values);
  return [...values].map((value) => value.toString(16).padStart(8, "0")).join("");
}

function getSpread(spreadId: TarotSpreadId) {
  const spread = TAROT_SPREAD_BY_ID.get(spreadId);
  if (!spread) throw new TarotInputError("UNKNOWN_SPREAD", `Unknown spread: ${spreadId}`);
  return spread;
}

export function drawTarot(input: {
  spreadId: TarotSpreadId;
  seed?: string;
  allowReversals?: boolean;
  reversalRate?: number;
}): TarotReading {
  const spread = getSpread(input.spreadId);
  const seed = input.seed ?? secureSeed();
  if (seed.trim().length === 0 || seed.length > 256) {
    throw new TarotInputError("INVALID_SEED", "Seed must contain 1–256 characters.");
  }
  const allowReversals = input.allowReversals ?? true;
  const reversalRate = input.reversalRate ?? 0.5;
  if (!Number.isFinite(reversalRate) || reversalRate < 0 || reversalRate > 1) {
    throw new TarotInputError("INVALID_REVERSAL_RATE", "Reversal rate must be between 0 and 1.");
  }

  const random = createPrng(seed);
  const deck = [...TAROT_DECK];
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }

  const cards: TarotDrawnCard[] = deck.slice(0, spread.cardCount).map((card, index) => ({
    position: spread.positions[index],
    card,
    orientation:
      allowReversals && random() < reversalRate ? "reversed" : "upright",
  }));

  return {
    spread,
    cards,
    audit: {
      source: "engine",
      algorithmVersion: TAROT_DRAW_ALGORITHM_VERSION,
      deckVersion: TAROT_DECK_VERSION,
      spreadVersion: spread.version,
      eventId: `draw-${hashSeed(seed).toString(16).padStart(8, "0")}`,
      seed,
      allowReversals,
    },
  };
}

export function createManualTarotReading(input: {
  spreadId: TarotSpreadId;
  cards: readonly { cardId: string; orientation?: TarotOrientation }[];
  eventId?: string;
}): TarotReading {
  const spread = getSpread(input.spreadId);
  if (input.cards.length !== spread.cardCount) {
    throw new TarotInputError(
      "WRONG_CARD_COUNT",
      `Spread ${spread.id} requires ${spread.cardCount} cards.`,
    );
  }
  const seen = new Set<string>();
  const cards: TarotDrawnCard[] = input.cards.map((selection, index) => {
    const card = TAROT_CARD_BY_ID.get(selection.cardId);
    if (!card) throw new TarotInputError("UNKNOWN_CARD", `Unknown card: ${selection.cardId}`);
    if (seen.has(card.id)) {
      throw new TarotInputError("DUPLICATE_CARD", `Duplicate card: ${selection.cardId}`);
    }
    seen.add(card.id);
    return {
      position: spread.positions[index],
      card,
      orientation: selection.orientation ?? "upright",
    };
  });
  return {
    spread,
    cards,
    audit: {
      source: "manual",
      algorithmVersion: TAROT_DRAW_ALGORITHM_VERSION,
      deckVersion: TAROT_DECK_VERSION,
      spreadVersion: spread.version,
      eventId: input.eventId ?? `manual-${Date.now().toString(36)}`,
      allowReversals: cards.some((card) => card.orientation === "reversed"),
    },
  };
}

export function analyzeCardCombination(
  cards: readonly TarotDrawnCard[],
  locale: "ko" | "en",
): CombinationInsight {
  const suitCounts: Record<TarotSuit, number> = {
    wands: 0,
    cups: 0,
    swords: 0,
    pentacles: 0,
  };
  const ranks = new Map<string, number>();
  let majorArcanaCount = 0;
  for (const drawn of cards) {
    if (drawn.card.arcana === "major") majorArcanaCount += 1;
    if (drawn.card.suit) suitCounts[drawn.card.suit] += 1;
    if (drawn.card.rank) ranks.set(drawn.card.rank, (ranks.get(drawn.card.rank) ?? 0) + 1);
  }
  const dominantEntry = (Object.entries(suitCounts) as [TarotSuit, number][])
    .sort((left, right) => right[1] - left[1])[0];
  const dominantSuit = dominantEntry && dominantEntry[1] >= 2 ? dominantEntry[0] : undefined;
  const repeatedRanks = [...ranks.entries()]
    .filter(([, count]) => count >= 2)
    .map(([rank]) => rank);
  const messages: string[] = [];
  if (majorArcanaCount >= 2) {
    messages.push(
      locale === "ko"
        ? "메이저 아르카나가 많아 질문의 장기적 가치나 전환 주제를 함께 살펴볼 수 있습니다."
        : "Multiple Major Arcana invite reflection on longer-term values or transition themes.",
    );
  }
  if (dominantSuit) {
    messages.push(
      locale === "ko"
        ? `${dominantSuit} 수트가 반복됩니다. 이 영역을 사실 확인과 함께 집중해 보세요.`
        : `The ${dominantSuit} suit repeats; examine that domain alongside real-world evidence.`,
    );
  }
  if (repeatedRanks.length) {
    messages.push(
      locale === "ko"
        ? `반복 계급(${repeatedRanks.join(", ")})은 비슷한 단계의 과제가 여러 영역에 나타날 가능성을 묻습니다.`
        : `Repeated ranks (${repeatedRanks.join(", ")}) ask whether a similar stage is appearing across domains.`,
    );
  }
  return { majorArcanaCount, suitCounts, dominantSuit, repeatedRanks, messages };
}
