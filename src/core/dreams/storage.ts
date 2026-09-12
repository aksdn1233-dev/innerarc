import { z } from "zod";
import { DreamEventSchema, DreamFollowUpSchema, DreamInterpretationSchema, InterpretationRevisionSchema, type DreamEvent } from "./schema";

export const DREAM_STORAGE_KEY = "innerarc:dream-intelligence:v1";
const payload = z.object({ version: z.literal(1), events: z.array(DreamEventSchema).max(200) }).strict();
export interface DreamStorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export function loadDreamEvents(storage: DreamStorageLike): DreamEvent[] { const raw = storage.getItem(DREAM_STORAGE_KEY); if (!raw) return []; try { const parsed = payload.safeParse(JSON.parse(raw)); return parsed.success ? parsed.data.events : []; } catch { return []; } }
export function saveDreamEvents(storage: DreamStorageLike, events: readonly DreamEvent[]): void { storage.setItem(DREAM_STORAGE_KEY, JSON.stringify(payload.parse({ version: 1, events: events.slice(0, 200) }))); }
export function clearDreamEvents(storage: DreamStorageLike): void { storage.removeItem(DREAM_STORAGE_KEY); }
export function exportDreamEvents(events: readonly DreamEvent[], exportedAt: string): string { return JSON.stringify({ product: "태령당", schemaVersion: 1, exportedAt, data: { dreamEvents: payload.parse({ version: 1, events }).events } }, null, 2); }

const accountPayload = z.object({
  events: z.array(z.object({
    id: z.string(), owner_user_id: z.string(), dream_date: z.string(), recorded_at: z.string(), raw_text: z.string().nullable(),
    raw_text_retained: z.boolean(), current_concern: z.string(), initial_interpretation: DreamInterpretationSchema,
    initial_timestamp: z.string(), updated_at: z.string(),
  }).passthrough()).max(200),
  followUps: z.array(z.object({
    id: z.string(), dream_event_id: z.string(), due_days: z.union([z.literal(3), z.literal(7), z.literal(30)]), due_date: z.string(),
    completed_at: z.string().nullable(), outcome: z.string().nullable(), note: z.string(), fit: z.string().nullable(),
  }).passthrough()).max(600),
  revisions: z.array(z.object({
    dream_event_id: z.string(), revision: z.number(), reason: z.string(), interpretation: DreamInterpretationSchema, created_at: z.string(),
  }).passthrough()).max(500),
}).passthrough();

/** Converts the owner-scoped API rows back into the same validated device model. */
export function hydrateAccountDreamEvents(value: unknown): DreamEvent[] {
  const parsed = accountPayload.safeParse(value);
  if (!parsed.success) return [];
  return parsed.data.events.flatMap((row) => {
    const followUps = parsed.data.followUps
      .filter((item) => item.dream_event_id === row.id)
      .sort((a, b) => a.due_days - b.due_days)
      .map((item) => DreamFollowUpSchema.safeParse({ id: item.id, dueDays: item.due_days, dueDate: item.due_date, completedAt: item.completed_at, outcome: item.outcome, note: item.note, fit: item.fit }))
      .flatMap((result) => result.success ? [result.data] : []);
    const revisions = parsed.data.revisions
      .filter((item) => item.dream_event_id === row.id)
      .sort((a, b) => a.revision - b.revision)
      .map((item) => InterpretationRevisionSchema.safeParse({ revision: item.revision, createdAt: item.created_at, reason: item.reason, interpretation: item.interpretation }))
      .flatMap((result) => result.success ? [result.data] : []);
    const event = DreamEventSchema.safeParse({
      schemaVersion: "dream-intelligence-1.0.0", id: row.id, userId: row.owner_user_id, dreamDate: row.dream_date,
      recordedAt: row.recorded_at, rawText: row.raw_text, rawTextRetained: row.raw_text_retained, currentConcern: row.current_concern,
      initialInterpretation: row.initial_interpretation, initialTimestamp: row.initial_timestamp, revisions, followUps, updatedAt: row.updated_at,
    });
    return event.success ? [event.data] : [];
  });
}
