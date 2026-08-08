import { describe, expect, it } from "vitest";
import {
  clearTarotHistory,
  createManualTarotReading,
  createSavedTarotReading,
  drawTarot,
  exportTarotHistory,
  InMemoryTarotHistoryRepository,
  loadTarotHistory,
  restoreTarotReading,
  saveTarotHistory,
  snapshotTarotReading,
  TAROT_HISTORY_STORAGE_KEY,
  TarotHistoryError,
  type SavedTarotReading,
  type TarotHistoryStorage,
  type TarotReadingSnapshot,
} from "@/core/tarot";

function saved(id = "saved-1", request = "save:req-0001"): SavedTarotReading {
  return createSavedTarotReading({
    id,
    clientRequestId: request,
    question: "What should I verify?",
    category: "work",
    createdAt: "2026-07-22T10:00:00.000Z",
    reading: drawTarot({ spreadId: "question_work", seed: `seed-${id}` }),
  });
}

class FakeStorage implements TarotHistoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

describe("tarot reading snapshots", () => {
  it("restores engine cards, orientations, source, and replay seed", () => {
    const reading = drawTarot({ spreadId: "question_love", seed: "history-fixed-seed" });
    const restored = restoreTarotReading(snapshotTarotReading(reading));
    expect(restored.cards.map((item) => [item.card.id, item.orientation]))
      .toEqual(reading.cards.map((item) => [item.card.id, item.orientation]));
    expect(restored.audit.source).toBe("engine");
    expect(restored.audit.seed).toBe("history-fixed-seed");
  });

  it("preserves manual source without inventing a seed", () => {
    const reading = createManualTarotReading({
      spreadId: "three",
      cards: [
        { cardId: "major-00", orientation: "upright" },
        { cardId: "major-01", orientation: "reversed" },
        { cardId: "major-02", orientation: "upright" },
      ],
      eventId: "manual-event-1",
    });
    const restored = restoreTarotReading(snapshotTarotReading(reading));
    expect(restored.audit.source).toBe("manual");
    expect(restored.audit.seed).toBeUndefined();
    expect(restored.cards[1].orientation).toBe("reversed");
  });

  it("rejects incompatible versions and duplicate cards", () => {
    const snapshot = snapshotTarotReading(drawTarot({ spreadId: "three", seed: "tamper-seed" }));
    expect(() => restoreTarotReading({
      ...snapshot,
      audit: { ...snapshot.audit, deckVersion: "unknown" },
    })).toThrow(/incompatible/);
    expect(() => restoreTarotReading({
      ...snapshot,
      cards: [snapshot.cards[0], snapshot.cards[0], snapshot.cards[2]],
    })).toThrow(/unknown or duplicate/);
  });

  it("rejects engine snapshots without a seed and manual snapshots with one", () => {
    const engine = snapshotTarotReading(drawTarot({ spreadId: "single", seed: "seed-required" }));
    expect(() => restoreTarotReading({ ...engine, audit: { ...engine.audit, seed: undefined } }))
      .toThrow(/require a replay seed/);
    const manual = snapshotTarotReading(createManualTarotReading({
      spreadId: "single",
      cards: [{ cardId: "major-00" }],
    }));
    expect(() => restoreTarotReading({ ...manual, audit: { ...manual.audit, seed: "fake" } }))
      .toThrow(/cannot claim a replay seed/);
  });
});

describe("tarot history repository and storage", () => {
  it("deduplicates a retried save request", () => {
    const repository = new InMemoryTarotHistoryRepository();
    const first = repository.create(saved("first"));
    const retry = repository.create(saved("different", "save:req-0001"));
    expect(retry.id).toBe(first.id);
    expect(repository.list()).toHaveLength(1);
  });

  it("deletes records and rejects duplicate imports", () => {
    const repository = new InMemoryTarotHistoryRepository([saved()]);
    expect(repository.remove("saved-1")).toBe(true);
    expect(repository.remove("saved-1")).toBe(false);
    expect(() => repository.replace([saved("one"), saved("two")])).toThrow(TarotHistoryError);
  });

  it("round-trips, exports, and clears valid history", () => {
    const storage = new FakeStorage();
    const records = [saved()];
    saveTarotHistory(storage, records);
    expect(loadTarotHistory(storage)).toEqual(records);
    const exported = JSON.parse(exportTarotHistory(records, "2026-07-22T11:00:00.000Z"));
    expect(exported.data.tarotReadings).toHaveLength(1);
    clearTarotHistory(storage);
    expect(storage.values.has(TAROT_HISTORY_STORAGE_KEY)).toBe(false);
  });

  it("fails closed for corrupt and version-incompatible device data", () => {
    const storage = new FakeStorage();
    storage.setItem(TAROT_HISTORY_STORAGE_KEY, "{broken");
    expect(loadTarotHistory(storage)).toEqual([]);
    const invalid = saved();
    const incompatible: SavedTarotReading = {
      ...invalid,
      snapshot: {
        ...invalid.snapshot,
        audit: { ...invalid.snapshot.audit, deckVersion: "future-version" },
      } as TarotReadingSnapshot,
    };
    storage.setItem(TAROT_HISTORY_STORAGE_KEY, JSON.stringify({ version: 1, records: [incompatible] }));
    expect(loadTarotHistory(storage)).toEqual([]);
  });
});
