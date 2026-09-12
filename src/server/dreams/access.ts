import { requireSupabaseUser } from "@/lib/supabase/auth";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { enforceSensitiveRequestLimit } from "@/server/abuse-protection";
import { isSameOriginRequest } from "@/server/same-origin";
import { dreamEnabled } from "./config";

export class DreamAccessError extends Error { constructor(public code: string, public status = 400) { super(code); } }
export function dreamResponse(body: unknown, status = 200) { return Response.json(body, { status, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", ...(status === 429 ? { "Retry-After": "60" } : {}) } }); }
export async function dreamAccess(request: Request, write = false) {
  if (!dreamEnabled()) throw new DreamAccessError("DREAMS_DISABLED", 503);
  if (write && !isSameOriginRequest(request)) throw new DreamAccessError("CROSS_ORIGIN_REQUEST", 403);
  const auth = await requireSupabaseUser();
  if (!auth.user || !auth.client || auth.error) throw new DreamAccessError("AUTH_REQUIRED", 401);
  const admin = resolveSupabaseAdminClient().client;
  if (!admin) throw new DreamAccessError("STORAGE_UNAVAILABLE", 503);
  const limit = await enforceSensitiveRequestLimit({ admin, request, userId: auth.user.id, endpoint: write ? "dream_write" : "dream_read", accountLimit: write ? 20 : 120, ipLimit: write ? 60 : 240, windowSeconds: 60 });
  if (!limit.allowed) throw new DreamAccessError("TOO_MANY_REQUESTS", 429);
  if (!limit.configured && write) throw new DreamAccessError("RATE_LIMIT_UNAVAILABLE", 503);
  return { admin, client: auth.client, owner: auth.user.id };
}
export async function safeDream(run: () => Promise<Response>) { try { return await run(); } catch (error) { return error instanceof DreamAccessError ? dreamResponse({ error: error.code }, error.status) : dreamResponse({ error: "INVALID_OR_UNAVAILABLE" }, 400); } }
