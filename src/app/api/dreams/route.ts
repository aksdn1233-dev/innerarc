import { z } from "zod";
import { DreamEventSchema, assertAllowlistedDreamSourceIds } from "@/core/dreams";
import { DreamAccessError, dreamAccess, dreamResponse, safeDream } from "@/server/dreams/access";

const saveSchema = z.object({ requestId: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/), event: DreamEventSchema }).strict();
const MAX_BODY = 80_000;
async function body(request: Request) { const raw = await request.text(); if (raw.length > MAX_BODY) throw new DreamAccessError("REQUEST_TOO_LARGE", 413); return JSON.parse(raw) as unknown; }

export const dynamic = "force-dynamic";
export const GET = (request: Request) => safeDream(async () => {
  const ctx = await dreamAccess(request);
  const [events, followUps, revisions] = await Promise.all([
    ctx.client.from("dream_events").select("*").eq("owner_user_id", ctx.owner).order("dream_date", { ascending: false }).limit(200),
    ctx.client.from("dream_followups").select("*").eq("owner_user_id", ctx.owner).order("due_date").limit(600),
    ctx.client.from("dream_interpretation_revisions").select("*").eq("owner_user_id", ctx.owner).order("revision").limit(500),
  ]);
  if (events.error || followUps.error || revisions.error) throw new DreamAccessError("STORAGE_UNAVAILABLE", 503);
  return dreamResponse({ events: events.data, followUps: followUps.data, revisions: revisions.data });
});
export const POST = (request: Request) => safeDream(async () => {
  const ctx = await dreamAccess(request, true);
  const input = saveSchema.parse(await body(request));
  assertAllowlistedDreamSourceIds(input.event.initialInterpretation.sourceIds);
  const payload = { id: input.event.id, dreamDate: input.event.dreamDate, rawText: input.event.rawText, rawTextRetained: input.event.rawTextRetained, currentConcern: input.event.currentConcern, normalizedSummary: input.event.initialInterpretation.normalizedSummary, ontology: input.event.initialInterpretation.ontology, categories: input.event.initialInterpretation.categories, initialInterpretation: input.event.initialInterpretation, sourceRefs: input.event.initialInterpretation.sourceIds };
  const saved = await ctx.admin.rpc("dream_create_event", { p_owner: ctx.owner, p_request: input.requestId, p_event: payload });
  if (saved.error) throw new DreamAccessError(saved.error.code === "23505" ? "REQUEST_CONFLICT" : "SAVE_FAILED", saved.error.code === "23505" ? 409 : 503);
  return dreamResponse({ id: saved.data }, 201);
});
export const DELETE = (request: Request) => safeDream(async () => {
  const ctx = await dreamAccess(request, true);
  const removed = await ctx.admin.from("dream_events").delete().eq("owner_user_id", ctx.owner);
  if (removed.error) throw new DreamAccessError("DELETE_FAILED", 503);
  return dreamResponse({ deleted: true });
});
