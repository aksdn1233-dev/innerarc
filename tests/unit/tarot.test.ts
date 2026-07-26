import { describe, expect, it } from "vitest";
import {
  TAROT_DECK,
  TAROT_DRAW_ALGORITHM_VERSION,
  TAROT_SPREADS,
  TarotInputError,
  analyzeCardCombination,
  createManualTarotReading,
  drawTarot,
} from "@/core/tarot";

describe("canonical tarot data", () => {
  it("contains 22 Major and 56 Minor Arcana with unique stable IDs", () => {
    expect(TAROT_DECK).toHaveLength(78);
    expect(TAROT_DECK.filter((card) => card.arcana === "major")).toHaveLength(22);
    expect(TAROT_DECK.filter((card) => card.arcana === "minor")).toHaveLength(56);
    expect(new Set(TAROT_DECK.map((card) => card.id)).size).toBe(78);
  });

  it("has bilingual names and upright/reversed keywords for every card", () => {
    for (const card of TAROT_DECK) {
      expect(card.name.ko.length).toBeGreaterThan(0);
      expect(card.name.en.length).toBeGreaterThan(0);
      expect(card.uprightKeywords.ko.length).toBeGreaterThan(0);
      expect(card.reversedKeywords.en.length).toBeGreaterThan(0);
    }
  });

  it("defines one-card, three-card, and every question spread", () => {
    expect(TAROT_SPREADS).toHaveLength(9);
    expect(TAROT_SPREADS.find((spread) => spread.id === "single")?.cardCount).toBe(1);
    expect(TAROT_SPREADS.find((spread) => spread.id === "question_money")?.cardCount).toBe(3);
  });
});

describe("auditable engine draw", () => {
  it("replays exactly from a fixed seed", () => {
    const input = { spreadId: "three" as const, seed: "regression-seed-001" };
    expect(drawTarot(input)).toEqual(drawTarot(input));
  });

  it("draws within the deck without duplicates", () => {
    for (let index = 0; index < 100; index += 1) {
      const reading = drawTarot({ spreadId: "question_work", seed: `seed-${index}` });
      expect(reading.cards).toHaveLength(3);
      expect(new Set(reading.cards.map((drawn) => drawn.card.id)).size).toBe(3);
      expect(reading.cards.every((drawn) => TAROT_DECK.includes(drawn.card))).toBe(true);
    }
  });

  it("records an auditable algorithm, deck, spread, event, and seed", () => {
    const reading = drawTarot({ spreadId: "single", seed: "audit-me" });
    expect(reading.audit).toMatchObject({
      source: "engine",
      algorithmVersion: TAROT_DRAW_ALGORITHM_VERSION,
      seed: "audit-me",
      allowReversals: true,
    });
    expect(reading.audit.eventId).toMatch(/^draw-[0-9a-f]{8}$/);
  });

  it("supports disabling reversals and boundary reversal rates", () => {
    expect(
      drawTarot({ spreadId: "three", seed: "upright", allowReversals: false }).cards.every(
        (drawn) => drawn.orientation === "upright",
      ),
    ).toBe(true);
    expect(
      drawTarot({ spreadId: "three", seed: "all-reversed", reversalRate: 1 }).cards.every(
        (drawn) => drawn.orientation === "reversed",
      ),
    ).toBe(true);
  });

  it.each([-0.1, 1.1, Number.NaN])("rejects reversal rate %s", (reversalRate) => {
    expect(() => drawTarot({ spreadId: "single", seed: "x", reversalRate })).toThrowError(
      expect.objectContaining({ code: "INVALID_REVERSAL_RATE" }),
    );
  });

  it("rejects empty and excessive seeds", () => {
    expect(() => drawTarot({ spreadId: "single", seed: "" })).toThrow(TarotInputError);
    expect(() => drawTarot({ spreadId: "single", seed: "x".repeat(257) })).toThrow(TarotInputError);
  });
});

describe("manual physical-card input", () => {
  it("stores manual cards and orientation without pretending they were engine-drawn", () => {
    const reading = createManualTarotReading({
      spreadId: "three",
      eventId: "manual-test",
      cards: [
        { cardId: "major-11", orientation: "upright" },
        { cardId: "minor-cups-two", orientation: "reversed" },
        { cardId: "minor-wands-ace" },
      ],
    });
    expect(reading.audit).toMatchObject({ source: "manual", eventId: "manual-test" });
    expect(reading.audit.seed).toBeUndefined();
    expect(reading.cards.map((drawn) => drawn.orientation)).toEqual([
      "upright",
      "reversed",
      "upright",
    ]);
  });

  it("rejects wrong counts, unknown cards, and duplicates", () => {
    expect(() => createManualTarotReading({ spreadId: "three", cards: [] })).toThrowError(
      expect.objectContaining({ code: "WRONG_CARD_COUNT" }),
    );
    expect(() =>
      createManualTarotReading({
        spreadId: "single",
        cards: [{ cardId: "not-a-card" }],
      }),
    ).toThrowError(expect.objectContaining({ code: "UNKNOWN_CARD" }));
    expect(() =>
      createManualTarotReading({
        spreadId: "three",
        cards: [
          { cardId: "major-00" },
          { cardId: "major-00" },
          { cardId: "major-01" },
        ],
      }),
    ).toThrowError(expect.objectContaining({ code: "DUPLICATE_CARD" }));
  });
});

describe("non-predictive combination rules", () => {
  it("detects major density, dominant suit, and repeated ranks", () => {
    const reading = createManualTarotReading({
      spreadId: "three",
      cards: [
        { cardId: "major-00" },
        { cardId: "major-01" },
        { cardId: "minor-wands-ace" },
      ],
    });
    const insight = analyzeCardCombination(reading.cards, "en");
    expect(insight.majorArcanaCount).toBe(2);
    expect(insight.messages[0]).toContain("Major Arcana");
  });

  it("returns no invented combination message when no repeat rule applies", () => {
    const reading = createManualTarotReading({
      spreadId: "three",
      cards: [
        { cardId: "minor-wands-ace" },
        { cardId: "minor-cups-two" },
        { cardId: "minor-swords-three" },
      ],
    });
    expect(analyzeCardCombination(reading.cards, "ko").messages).toEqual([]);
  });
});
