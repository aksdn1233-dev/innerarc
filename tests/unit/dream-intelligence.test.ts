import { describe, expect, it } from "vitest";
import fixtures from "../fixtures/dream-intelligence-fixtures.json";
import {
  DREAM_SOURCE_CATALOG,
  assertAllowlistedDreamSourceIds,
  buildDreamSignature,
  completeDreamFollowUp,
  createDreamEvent,
  extractDreamOntology,
  hydrateAccountDreamEvents,
  interpretDream,
  loadDreamEvents,
  saveDreamEvents,
} from "@/core/dreams";

const base = (text: string, extra: Record<string, unknown> = {}) => ({ requestId: `request_${crypto.randomUUID()}`, locale: "ko" as const, dreamDate: "2026-09-12", rawText: text, context: { currentConcern: "", recentExperience: "", bodyState: "", recurring: false, lucid: false, ...extra }, retainRawText: false, allowRemoteAI: false });
const event = (text: string, index = 1, extra: Record<string, unknown> = {}) => createDreamEvent(base(text, extra), { id: `dream-event-${index}`, recordedAt: `2026-09-${String(index + 1).padStart(2, "0")}T01:00:00.000Z` });

describe("Dream Intelligence ontology and source safety", () => {
  it.each(fixtures)("extracts action-aware ontology for $id", ({ text, expected }) => {
    const codes = extractDreamOntology(base(text)).map((token) => token.code);
    expect(codes).toEqual(expect.arrayContaining(expected));
  });

  it("does not collapse different pig actions into one interpretation", () => {
    const enters = interpretDream(base("돼지가 집에 들어왔고 저는 바라봤어요."));
    const chases = interpretDream(base("돼지가 저를 쫓아와서 무서웠어요."));
    expect(enters.ontology.map((token) => token.code)).toContain("ENTER");
    expect(chases.ontology.map((token) => token.code)).toContain("CHASE");
    expect(enters.categories).not.toContain("NIGHTMARE");
    expect(chases.categories).toContain("NIGHTMARE");
  });

  it("requires allowlisted sources for every published evidence statement", () => {
    const result = interpretDream(base("큰 뱀이 집에 들어왔어요."));
    const ids = result.layers.tradition.concat(result.layers.modernResearch).flatMap((item) => item.sourceIds);
    expect(DREAM_SOURCE_CATALOG.length).toBeGreaterThanOrEqual(8);
    expect(() => assertAllowlistedDreamSourceIds(ids)).not.toThrow();
    expect(() => assertAllowlistedDreamSourceIds(["dream-source:invented-author"])).toThrow(/UNKNOWN_DREAM_SOURCE/);
  });

  it.each(["암을 뜻하나요", "누가 죽는 꿈", "교통사고가 나요", "임신한 꿈", "복권 당첨 꿈"])("never confirms a dangerous outcome: %s", (text) => {
    const serialized = JSON.stringify(interpretDream(base(text)));
    expect(serialized).toContain("판단할 수 없습니다");
    expect(serialized).not.toMatch(/(암입니다|죽습니다|사고가 납니다|임신했습니다|당첨됩니다)/u);
  });

  it("offers at most three questions only where context is missing", () => {
    const sparse = interpretDream(base("뱀을 봤어요."));
    expect(sparse.followUpQuestions.length).toBeGreaterThan(0);
    expect(sparse.followUpQuestions.length).toBeLessThanOrEqual(3);
    const detailed = interpretDream(base("큰 뱀이 집에 들어와서 가만히 봤고 평온했어요.", { currentConcern: "이직", recentExperience: "새 팀 제안을 받음" }));
    expect(detailed.followUpQuestions.length).toBeLessThan(sparse.followUpQuestions.length);
  });

  it("uses validated provider extraction only as additional structure", () => {
    const input = base("낯선 풍경을 봤어요.");
    const withoutProvider = interpretDream(input);
    const withProvider = interpretDream(input, [], undefined, { ontology: [{ kind: "location", code: "STATION", label: { ko: "역", en: "station" }, evidence: "낯선 역" }], categories: ["DAILY_CONTINUITY"], followUpQuestions: [] });
    expect(withProvider.ontology.map((item) => item.code)).toContain("STATION");
    expect(withProvider.categories).toContain("DAILY_CONTINUITY");
    expect(withProvider.layers.tradition).toEqual(withoutProvider.layers.tradition);
  });
});

describe("personal history, Reality Check, and privacy", () => {
  it("keeps global tradition identical but changes personal evidence for different histories", () => {
    const current = base("큰 뱀이 집 안으로 들어왔고 무섭지 않았어요.");
    const userA = [event("뱀이 집에 들어왔어요. 새 동료를 만났습니다.", 1), event("뱀이 들어오는 꿈. 관계가 걱정됐어요.", 2)];
    const userB = [event("뱀에게 쫓겼고 직장 갈등이 있었어요.", 3)];
    const a = interpretDream(current, userA), b = interpretDream(current, userB);
    expect(a.layers.tradition).toEqual(b.layers.tradition);
    expect(a.layers.personalHistory).not.toEqual(b.layers.personalHistory);
    expect(a.confidence.personalHistory).toBe("initial");
  });

  it("never mutates the initial interpretation after a follow-up", () => {
    const original = event("시험에 늦어서 불안했어요.");
    const snapshot = structuredClone(original.initialInterpretation);
    const revised = completeDreamFollowUp(original, { dueDays: 7, outcome: "exam", note: "시험 일정이 실제로 바뀌었다", fit: "PARTIAL", completedAt: "2026-09-20T02:00:00.000Z" });
    expect(revised.initialInterpretation).toEqual(snapshot);
    expect(revised.revisions).toHaveLength(1);
    expect(revised.revisions[0]?.reason).toContain("+7d");
  });

  it("does not accept a Reality Check before its scheduled date", () => {
    const original = event("시험에 늦어서 불안했어요.");
    expect(() => completeDreamFollowUp(original, { dueDays: 30, outcome: "exam", note: "too early", fit: "PARTIAL", completedAt: "2026-09-10T02:00:00.000Z" })).toThrow("DREAM_FOLLOWUP_NOT_DUE");
  });

  it("waits for three samples before creating a signature and detects time clusters", () => {
    expect(buildDreamSignature([event("학교에 늦었어요.", 1), event("학교에서 지각했어요.", 2)], "ko").status).toBe("insufficient");
    const events = [event("학교에 늦었어요.", 1), event("학교에서 지각했어요.", 2), event("학교 시험에 늦었고 불안했어요.", 3)];
    const signature = buildDreamSignature(events, "ko");
    expect(signature.status).toBe("initial");
    expect(signature.recurringActions.some((item) => item.code === "LATE")).toBe(true);
    expect(signature.temporalClusters.some((item) => item.code === "SCHOOL" && item.windowDays === 30)).toBe(true);
  });

  it("does not retain raw text without explicit consent and safely rejects corrupted storage", () => {
    const privateEvent = event("집에 물이 차올랐어요.");
    expect(privateEvent.rawText).toBeNull();
    const memory = new Map<string, string>();
    const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => { memory.set(key, value); }, removeItem: (key: string) => { memory.delete(key); } };
    saveDreamEvents(storage, [privateEvent]);
    expect(loadDreamEvents(storage)).toHaveLength(1);
    memory.set("innerarc:dream-intelligence:v1", "not-json");
    expect(loadDreamEvents(storage)).toEqual([]);
  });

  it("hydrates owner-scoped account rows into the same validated event model", () => {
    const source = event("학교에 늦어서 불안했어요.");
    const ownerId = "11111111-1111-4111-8111-111111111111";
    const hydrated = hydrateAccountDreamEvents({
      events: [{ id: source.id, owner_user_id: ownerId, dream_date: source.dreamDate, recorded_at: source.recordedAt, raw_text: source.rawText, raw_text_retained: source.rawTextRetained, current_concern: source.currentConcern, initial_interpretation: source.initialInterpretation, initial_timestamp: source.initialTimestamp, updated_at: source.updatedAt }],
      followUps: source.followUps.map((item) => ({ id: item.id, dream_event_id: source.id, due_days: item.dueDays, due_date: item.dueDate, completed_at: item.completedAt, outcome: item.outcome, note: item.note, fit: item.fit })),
      revisions: [],
    });
    expect(hydrated).toHaveLength(1);
    expect(hydrated[0]).toMatchObject({ id: source.id, userId: ownerId, followUps: source.followUps });
    expect(hydrateAccountDreamEvents({ events: "corrupted" })).toEqual([]);
  });
});
