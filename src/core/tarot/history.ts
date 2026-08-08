import { z } from "zod";
import {
  TAROT_CARD_BY_ID,
  TAROT_DECK_VERSION,
  TAROT_SPREAD_BY_ID,
} from "./data";
import { TAROT_DRAW_ALGORITHM_VERSION } from "./engine";
import type {
  TarotOrientation,
  TarotQuestionCategory,
  TarotReading,
  TarotSpreadId,
} from "./types";

export const TAROT_HISTORY_VERSION = "tarot-history-1.0.0";
export const TAROT_HISTORY_STORAGE_KEY = "innerarc:tarot-history:v1";

export type TarotReadingSnapshot = {
  snapshotVersion: 1;
  spreadId: TarotSpreadId;
  cards: Array<{ cardId: string; orientation: TarotOrientation }>;
  audit: TarotReading["audit"];
};

export type SavedTarotReading = {
  id: string;
  clientRequestId: string;
  question: string;
  category: TarotQuestionCategory;
  createdAt: string;
  historyVersion: typeof TAROT_HISTORY_VERSION;
  snapshot: TarotReadingSnapshot;
};

export interface TarotHistoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class TarotHistoryError extends Error {
  constructor(public readonly code: "INVALID_RECORD" | "INCOMPATIBLE_VERSION" | "CONFLICT", message: string) {
    super(message);
    this.name = "TarotHistoryError";
  }
}

const QUESTION_CATEGORIES: readonly TarotQuestionCategory[] = [
  "work", "love", "money", "relationship", "emotion", "daily_choice", "free",
];

function isoDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || !/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    throw new TarotHistoryError("INVALID_RECORD", "A valid ISO creation time is required.");
  }
  return date.toISOString();
}

function requestId(value: string): string {
  const cleaned = value.trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/.test(cleaned)) {
    throw new TarotHistoryError("INVALID_RECORD", "A valid client request ID is required.");
  }
  return cleaned;
}

export function snapshotTarotReading(reading: TarotReading): TarotReadingSnapshot {
  return {
    snapshotVersion: 1,
    spreadId: reading.spread.id,
    cards: reading.cards.map((drawn) => ({ cardId: drawn.card.id, orientation: drawn.orientation })),
    audit: { ...reading.audit },
  };
}

export function restoreTarotReading(snapshot: TarotReadingSnapshot): TarotReading {
  const spread = TAROT_SPREAD_BY_ID.get(snapshot.spreadId);
  if (!spread) throw new TarotHistoryError("INVALID_RECORD", "Saved spread is unknown.");
  if (
    snapshot.snapshotVersion !== 1 ||
    snapshot.audit.deckVersion !== TAROT_DECK_VERSION ||
    snapshot.audit.spreadVersion !== spread.version ||
    snapshot.audit.algorithmVersion !== TAROT_DRAW_ALGORITHM_VERSION
  ) {
    throw new TarotHistoryError("INCOMPATIBLE_VERSION", "Saved reading uses an incompatible rule version.");
  }
  if (snapshot.cards.length !== spread.cardCount) {
    throw new TarotHistoryError("INVALID_RECORD", "Saved reading has the wrong card count.");
  }
  const seen = new Set<string>();
  const cards = snapshot.cards.map((selection, index) => {
    const card = TAROT_CARD_BY_ID.get(selection.cardId);
    if (!card || seen.has(selection.cardId)) {
      throw new TarotHistoryError("INVALID_RECORD", "Saved reading contains an unknown or duplicate card.");
    }
    if (selection.orientation !== "upright" && selection.orientation !== "reversed") {
      throw new TarotHistoryError("INVALID_RECORD", "Saved reading contains an invalid orientation.");
    }
    seen.add(selection.cardId);
    return { position: spread.positions[index], card, orientation: selection.orientation };
  });
  if (snapshot.audit.source === "engine" && !snapshot.audit.seed) {
    throw new TarotHistoryError("INVALID_RECORD", "Engine readings require a replay seed.");
  }
  if (snapshot.audit.source === "manual" && snapshot.audit.seed) {
    throw new TarotHistoryError("INVALID_RECORD", "Manual readings cannot claim a replay seed.");
  }
  return { spread, cards, audit: { ...snapshot.audit } };
}

export function createSavedTarotReading(input: {
  id: string;
  clientRequestId: string;
  question: string;
  category: TarotQuestionCategory;
  createdAt: string;
  reading: TarotReading;
}): SavedTarotReading {
  const question = input.question.trim();
  if (!input.id.trim() || !question || question.length > 2_000) {
    throw new TarotHistoryError("INVALID_RECORD", "A record ID and a 1–2000 character question are required.");
  }
  if (!QUESTION_CATEGORIES.includes(input.category)) {
    throw new TarotHistoryError("INVALID_RECORD", "Saved reading category is unsupported.");
  }
  const snapshot = snapshotTarotReading(input.reading);
  restoreTarotReading(snapshot);
  return {
    id: input.id.trim(),
    clientRequestId: requestId(input.clientRequestId),
    question,
    category: input.category,
    createdAt: isoDateTime(input.createdAt),
    historyVersion: TAROT_HISTORY_VERSION,
    snapshot,
  };
}

export class InMemoryTarotHistoryRepository {
  private records = new Map<string, SavedTarotReading>();
  private requests = new Map<string, string>();

  constructor(initial: SavedTarotReading[] = []) {
    this.replace(initial);
  }

  list(): SavedTarotReading[] {
    return [...this.records.values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((record) => structuredClone(record));
  }

  create(record: SavedTarotReading): SavedTarotReading {
    const priorId = this.requests.get(record.clientRequestId);
    if (priorId) return structuredClone(this.records.get(priorId)!);
    if (this.records.has(record.id)) throw new TarotHistoryError("CONFLICT", "Reading ID already exists.");
    restoreTarotReading(record.snapshot);
    this.records.set(record.id, structuredClone(record));
    this.requests.set(record.clientRequestId, record.id);
    return structuredClone(record);
  }

  remove(id: string): boolean {
    const record = this.records.get(id);
    if (!record) return false;
    this.records.delete(id);
    this.requests.delete(record.clientRequestId);
    return true;
  }

  replace(records: SavedTarotReading[]): void {
    this.records.clear();
    this.requests.clear();
    for (const record of records) {
      if (this.records.has(record.id) || this.requests.has(record.clientRequestId)) {
        throw new TarotHistoryError("CONFLICT", "Imported readings contain duplicate IDs or request IDs.");
      }
      restoreTarotReading(record.snapshot);
      this.records.set(record.id, structuredClone(record));
      this.requests.set(record.clientRequestId, record.id);
    }
  }
}

const auditSchema = z.object({
  source: z.enum(["engine", "manual"]),
  algorithmVersion: z.string(),
  deckVersion: z.string(),
  spreadVersion: z.string(),
  eventId: z.string(),
  seed: z.string().optional(),
  allowReversals: z.boolean(),
});

const snapshotSchema = z.object({
  snapshotVersion: z.literal(1),
  spreadId: z.string(),
  cards: z.array(z.object({ cardId: z.string(), orientation: z.enum(["upright", "reversed"]) })).min(1).max(3),
  audit: auditSchema,
});

const recordSchema = z.object({
  id: z.string(),
  clientRequestId: z.string(),
  question: z.string().min(1).max(2_000),
  category: z.enum(["work", "love", "money", "relationship", "emotion", "daily_choice", "free"]),
  createdAt: z.string().datetime(),
  historyVersion: z.literal(TAROT_HISTORY_VERSION),
  snapshot: snapshotSchema,
});

const payloadSchema = z.object({ version: z.literal(1), records: z.array(recordSchema).max(200) });

export function validateTarotHistoryRecords(candidate: unknown): SavedTarotReading[] {
  const records = payloadSchema.parse({ version: 1, records: candidate }).records as SavedTarotReading[];
  const repository = new InMemoryTarotHistoryRepository();
  repository.replace(records);
  return repository.list();
}

export function saveTarotHistory(storage: TarotHistoryStorage, records: SavedTarotReading[]): void {
  storage.setItem(
    TAROT_HISTORY_STORAGE_KEY,
    JSON.stringify({ version: 1, records: validateTarotHistoryRecords(records) }),
  );
}

export function loadTarotHistory(storage: TarotHistoryStorage): SavedTarotReading[] {
  const raw = storage.getItem(TAROT_HISTORY_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = payloadSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return [];
    for (const record of parsed.data.records) restoreTarotReading(record.snapshot as TarotReadingSnapshot);
    return parsed.data.records as SavedTarotReading[];
  } catch {
    return [];
  }
}

export function clearTarotHistory(storage: TarotHistoryStorage): void {
  storage.removeItem(TAROT_HISTORY_STORAGE_KEY);
}

export function exportTarotHistory(records: SavedTarotReading[], exportedAt: string): string {
  return JSON.stringify({ product: "InnerArc", schemaVersion: 1, exportedAt, data: { tarotReadings: records } }, null, 2);
}
