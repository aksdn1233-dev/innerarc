import { z } from "zod";
import { DreamInterpretationSchema, assertAllowlistedDreamSourceIds } from "@/core/dreams";
import { DreamAccessError, dreamAccess, dreamResponse, safeDream } from "@/server/dreams/access";

const inputSchema = z.object({
  requestId: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/),
  dueDays: z.union([z.literal(3), z.literal(7), z.literal(30)]),
  outcome: z.enum(["none", "money", "work", "new_person", "relationship", "family", "health", "exam", "business", "move", "other"]),
  note: z.string().trim().max(1_000),
  fit: z.enum(["MATCH", "PARTIAL", "MISMATCH", "CONTEXT_DEPENDENT"]),
  interpretation: DreamInterpretationSchema,
}).strict();

export const POST = (request: Request, context: { params: Promise<{ eventId: string }> }) => safeDream(async () => {
  const ctx = await dreamAccess(request, true);
  const { eventId } = await context.params;
  const event = z.uuid().parse(eventId);
  const raw = await request.text();
  if (raw.length > 60_000) throw new DreamAccessError("REQUEST_TOO_LARGE", 413);
  const input = inputSchema.parse(JSON.parse(raw));
  assertAllowlistedDreamSourceIds(input.interpretation.sourceIds);
  const result = await ctx.admin.rpc("dream_complete_followup", { p_owner: ctx.owner, p_event: event, p_request: input.requestId, p_days: input.dueDays, p_outcome: input.outcome, p_note: input.note, p_fit: input.fit, p_interpretation: input.interpretation });
  if (result.error) throw new DreamAccessError(result.error.code === "P0002" ? "NOT_FOUND" : "SAVE_FAILED", result.error.code === "P0002" ? 404 : 503);
  return dreamResponse({ saved: true });
});
