import { describe, expect, it } from "vitest";
import { calculateNumerologyProfile } from "@/core/numerology";
import {
  createRelationshipInsight,
  createRelationshipRealityCheckDraft,
  meetingContextIds,
} from "@/core/relationship";
import {
  clearRealityCheckHandoff,
  createRealityCheckHandoff,
  parseRealityCheckHandoff,
  readRealityCheckHandoff,
  REALITY_CHECK_HANDOFF_LIFETIME_MS,
  REALITY_CHECK_HANDOFF_STORAGE_KEY,
  RealityCheckHandoffSchema,
  saveRealityCheckHandoff,
  type StorageLike,
} from "@/core/reality-check";

class FakeSessionStorage implements StorageLike {
  values = new Map<string, string>();
  failWrite = false;

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    if (this.failWrite) throw new Error("SESSION_STORAGE_UNAVAILABLE");
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const profile = calculateNumerologyProfile({
  birthDate: "1994-11-04",
  name: "Minji Kim",
  personalYear: 2026,
});
const insight = createRelationshipInsight(profile, "en");
const contextId = insight.meetingContexts[0].id;
const draft = createRelationshipRealityCheckDraft({
  insight,
  contextId,
  locale: "en",
  handoffId: "handoff:12345678-abcd",
});
const createdAt = "2026-07-26T10:00:00.000Z";

describe("relationship to Reality Check handoff", () => {
  it("accepts a strict success-story draft without relationship context", () => {
    const handoff = createRealityCheckHandoff({
      handoffId: "handoff:success-story-1234",
      source: "success_story",
      locale: "en",
      category: "work",
      storyId: "marie-curie",
      sourceRuleVersion: "celebrity-date-structure-1.0.0",
      question: "What small observation can I repeat?",
      currentState: "I am choosing one bounded experiment.",
      interpretation: "Public evidence supports a long research path, while private help remains unknown.",
      choice: "Test only the transferable behavior.",
      actionPlan: "Record one observation three times this week.",
    }, createdAt);
    expect(handoff.source).toBe("success_story");
    expect(handoff).not.toHaveProperty("contextId");
    expect(() => createRealityCheckHandoff({ ...handoff, contextId, createdAt: undefined, expiresAt: undefined } as never, createdAt)).toThrow();
  });
  it("builds a purpose-limited draft from only the selected context", () => {
    const selected = insight.meetingContexts[0];
    expect(draft).toMatchObject({
      source: "relationship",
      locale: "en",
      category: "relationship",
      contextId: selected.id,
      sourceRuleVersion: insight.ruleVersion,
      actionPlan: selected.tryThis,
    });
    expect(draft.interpretation).toContain(selected.title);
    expect(draft.interpretation).toContain(selected.caution);
    expect(draft.choice).toMatch(/not as a predicted meeting/i);

    const keys = Object.keys(draft);
    expect(keys).not.toEqual(expect.arrayContaining([
      "birthDate",
      "name",
      "lifePath",
      "attitude",
      "personalYear",
      "partner",
      "location",
    ]));
    expect(JSON.stringify(draft)).not.toContain("1994-11-04");
    expect(JSON.stringify(draft)).not.toContain("Minji Kim");
  });

  it("creates a strict versioned payload with a 30-minute lifetime", () => {
    const handoff = createRealityCheckHandoff(draft, createdAt);
    expect(handoff.version).toBe("relationship-reality-handoff-1.0.0");
    expect(Date.parse(handoff.expiresAt) - Date.parse(handoff.createdAt))
      .toBe(REALITY_CHECK_HANDOFF_LIFETIME_MS);
    expect(RealityCheckHandoffSchema.parse(handoff)).toEqual(handoff);
  });

  it("round-trips through the session key and clears independently", () => {
    const storage = new FakeSessionStorage();
    const handoff = createRealityCheckHandoff(draft, createdAt);
    saveRealityCheckHandoff(storage, handoff);
    expect(storage.values.size).toBe(1);
    expect(readRealityCheckHandoff(storage, "en", "2026-07-26T10:01:00.000Z")).toEqual(handoff);
    clearRealityCheckHandoff(storage);
    expect(storage.values.has(REALITY_CHECK_HANDOFF_STORAGE_KEY)).toBe(false);
  });

  it("rejects expired, future-inconsistent, and wrong-locale handoffs", () => {
    const handoff = createRealityCheckHandoff(draft, createdAt);
    const raw = JSON.stringify(handoff);
    expect(parseRealityCheckHandoff(raw, "en", "2026-07-26T10:29:59.999Z")).toEqual(handoff);
    expect(parseRealityCheckHandoff(raw, "en", "2026-07-26T10:30:00.000Z")).toBeNull();
    expect(parseRealityCheckHandoff(raw, "ko", "2026-07-26T10:01:00.000Z")).toBeNull();

    const future = createRealityCheckHandoff(draft, "2026-07-26T10:10:00.000Z");
    expect(parseRealityCheckHandoff(
      JSON.stringify(future),
      "en",
      "2026-07-26T10:00:00.000Z",
    )).toBeNull();
  });

  it("fails closed on extra fields, unsupported contexts, and extended lifetime", () => {
    const handoff = createRealityCheckHandoff(draft, createdAt);
    expect(parseRealityCheckHandoff(
      JSON.stringify({ ...handoff, birthDate: "1994-11-04" }),
      "en",
      "2026-07-26T10:01:00.000Z",
    )).toBeNull();
    expect(parseRealityCheckHandoff(
      JSON.stringify({ ...handoff, contextId: "private_location" }),
      "en",
      "2026-07-26T10:01:00.000Z",
    )).toBeNull();
    expect(parseRealityCheckHandoff(
      JSON.stringify({ ...handoff, expiresAt: "2026-07-26T10:31:00.000Z" }),
      "en",
      "2026-07-26T10:01:00.000Z",
    )).toBeNull();
  });

  it("rejects overlong generated text and malformed current time", () => {
    expect(() => createRealityCheckHandoff({
      ...draft,
      question: "x".repeat(1_001),
    }, createdAt)).toThrow();
    expect(() => parseRealityCheckHandoff(
      JSON.stringify(createRealityCheckHandoff(draft, createdAt)),
      "en",
      "not-a-time",
    )).toThrow(/current ISO/);
  });

  it("does not fall back to another store when session storage is unavailable", () => {
    const storage = new FakeSessionStorage();
    storage.failWrite = true;
    expect(() => saveRealityCheckHandoff(
      storage,
      createRealityCheckHandoff(draft, createdAt),
    )).toThrow("SESSION_STORAGE_UNAVAILABLE");
    expect(storage.values.size).toBe(0);
  });

  it("rejects a context that was not part of the displayed result", () => {
    const missingContext = meetingContextIds.find(
      (candidate) => !insight.meetingContexts.some(({ id }) => id === candidate),
    );
    expect(missingContext).toBeDefined();
    expect(() => createRelationshipRealityCheckDraft({
      insight,
      contextId: missingContext!,
      locale: "en",
      handoffId: "handoff:87654321-dcba",
    })).toThrow("RELATIONSHIP_CONTEXT_NOT_IN_RESULT");
  });
});
