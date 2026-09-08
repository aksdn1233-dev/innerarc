import { z } from "zod";
import { meetingContextIds } from "@/core/relationship/types";
import type { StorageLike } from "./storage";

export const REALITY_CHECK_HANDOFF_VERSION = "relationship-reality-handoff-1.0.0";
export const REALITY_CHECK_HANDOFF_STORAGE_KEY = "innerarc:reality-check-handoff:v1";
export const REALITY_CHECK_HANDOFF_LIFETIME_MS = 30 * 60 * 1_000;
const MAX_FUTURE_CLOCK_SKEW_MS = 5 * 60 * 1_000;

const requiredText = (maximum: number) => z.string().trim().min(1).max(maximum);
const isoDateTime = z.string().datetime({ offset: true });

export const RealityCheckHandoffSchema = z.object({
  version: z.literal(REALITY_CHECK_HANDOFF_VERSION),
  handoffId: z.string().regex(/^handoff:[A-Za-z0-9-]{8,100}$/),
  source: z.enum(["relationship", "success_story"]),
  locale: z.enum(["ko", "en"]),
  category: z.enum(["relationship", "work", "growth"]),
  contextId: z.enum(meetingContextIds).optional(),
  storyId: z.string().regex(/^[a-z0-9-]{3,80}$/).optional(),
  sourceRuleVersion: z.string().regex(/^[A-Za-z0-9._-]{3,80}$/),
  question: requiredText(1_000),
  currentState: requiredText(1_000),
  interpretation: requiredText(2_000),
  choice: requiredText(1_000),
  actionPlan: requiredText(1_000),
  createdAt: isoDateTime,
  expiresAt: isoDateTime,
}).strict().superRefine((handoff, context) => {
  const createdAt = Date.parse(handoff.createdAt);
  const expiresAt = Date.parse(handoff.expiresAt);
  const lifetime = expiresAt - createdAt;
  if (lifetime <= 0 || lifetime > REALITY_CHECK_HANDOFF_LIFETIME_MS) {
    context.addIssue({
      code: "custom",
      path: ["expiresAt"],
      message: "Handoff expiry must be after creation and no more than 30 minutes later",
    });
  }
  if (handoff.source === "relationship" && (handoff.category !== "relationship" || !handoff.contextId || handoff.storyId)) {
    context.addIssue({ code: "custom", path: ["source"], message: "Relationship handoffs require relationship context only" });
  }
  if (handoff.source === "success_story" && (!handoff.storyId || handoff.contextId || handoff.category === "relationship")) {
    context.addIssue({ code: "custom", path: ["source"], message: "Success-story handoffs require a work or growth story only" });
  }
});
export type RealityCheckHandoff = z.infer<typeof RealityCheckHandoffSchema>;

export type RealityCheckHandoffDraft = Readonly<Omit<
  RealityCheckHandoff,
  "version" | "createdAt" | "expiresAt"
>>;

function parseNow(value: string): number {
  const result = isoDateTime.safeParse(value);
  if (!result.success) throw new TypeError("A valid current ISO date-time is required");
  return Date.parse(result.data);
}

export function createRealityCheckHandoff(
  draft: RealityCheckHandoffDraft,
  createdAtInput: string,
): RealityCheckHandoff {
  const createdAt = parseNow(createdAtInput);
  return RealityCheckHandoffSchema.parse({
    ...draft,
    version: REALITY_CHECK_HANDOFF_VERSION,
    createdAt: new Date(createdAt).toISOString(),
    expiresAt: new Date(createdAt + REALITY_CHECK_HANDOFF_LIFETIME_MS).toISOString(),
  });
}

export function parseRealityCheckHandoff(
  raw: string,
  expectedLocale: "ko" | "en",
  nowInput: string,
): RealityCheckHandoff | null {
  const now = parseNow(nowInput);
  try {
    const parsed = RealityCheckHandoffSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    const createdAt = Date.parse(parsed.data.createdAt);
    const expiresAt = Date.parse(parsed.data.expiresAt);
    if (parsed.data.locale !== expectedLocale) return null;
    if (createdAt > now + MAX_FUTURE_CLOCK_SKEW_MS) return null;
    if (expiresAt <= now) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function saveRealityCheckHandoff(
  storage: StorageLike,
  handoff: RealityCheckHandoff,
): void {
  storage.setItem(
    REALITY_CHECK_HANDOFF_STORAGE_KEY,
    JSON.stringify(RealityCheckHandoffSchema.parse(handoff)),
  );
}

export function readRealityCheckHandoff(
  storage: StorageLike,
  expectedLocale: "ko" | "en",
  nowInput: string,
): RealityCheckHandoff | null {
  const raw = storage.getItem(REALITY_CHECK_HANDOFF_STORAGE_KEY);
  return raw ? parseRealityCheckHandoff(raw, expectedLocale, nowInput) : null;
}

export function clearRealityCheckHandoff(storage: StorageLike): void {
  storage.removeItem(REALITY_CHECK_HANDOFF_STORAGE_KEY);
}
