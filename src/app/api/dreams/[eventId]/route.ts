import { z } from "zod";
import { dreamAccess, dreamResponse, safeDream, DreamAccessError } from "@/server/dreams/access";

export const DELETE = (request: Request, context: { params: Promise<{ eventId: string }> }) => safeDream(async () => {
  const ctx = await dreamAccess(request, true);
  const { eventId } = await context.params;
  const id = z.uuid().parse(eventId);
  const deleted = await ctx.admin.from("dream_events").delete().eq("id", id).eq("owner_user_id", ctx.owner).select("id").maybeSingle();
  if (deleted.error) throw new DreamAccessError("DELETE_FAILED", 503);
  if (!deleted.data) throw new DreamAccessError("NOT_FOUND", 404);
  return dreamResponse({ deleted: true });
});
