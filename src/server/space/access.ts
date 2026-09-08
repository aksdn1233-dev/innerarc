import { requireSupabaseUser } from "@/lib/supabase/auth";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { enforceSensitiveRequestLimit } from "@/server/abuse-protection";
import { isSameOriginRequest } from "@/server/same-origin";
import { spaceStorageFetch } from "./storage";
import { spaceEnabled } from "./config";

export class SpaceError extends Error { constructor(public code: string, public status = 400) { super(code); } }
export function spaceResponse(body: unknown, status = 200) { return Response.json(body, { status, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", ...(status === 429 ? { "Retry-After": "60" } : {}) } }); }
export async function spaceAccess(request: Request, options: { write?: boolean; existing?: boolean; costly?: boolean } = {}) {
  if (options.write && !isSameOriginRequest(request)) throw new SpaceError("CROSS_ORIGIN_REQUEST", 403);
  if (!options.existing && !spaceEnabled()) throw new SpaceError("SPACE_DISABLED", 503);
  const auth = await requireSupabaseUser();
  if (!auth.user || !auth.client || auth.error) throw new SpaceError("AUTH_REQUIRED", 401);
  const admin = resolveSupabaseAdminClient(process.env, spaceStorageFetch).client;
  if (!admin) throw new SpaceError("STORAGE_UNAVAILABLE", 503);
  const limit = await enforceSensitiveRequestLimit({ admin, request, userId: auth.user.id,
    endpoint: options.costly ? "space_extract" : options.write ? "space_write" : "space_read",
    accountLimit: options.costly ? 3 : options.write ? 40 : 120,
    ipLimit: options.costly ? 10 : options.write ? 100 : 240, windowSeconds: options.costly ? 3600 : 60 });
  if (!limit.allowed) throw new SpaceError("TOO_MANY_REQUESTS", 429);
  if (!limit.configured && options.write && !options.existing) throw new SpaceError("RATE_LIMIT_UNAVAILABLE", 503);
  return { admin, client: auth.client, owner: auth.user.id };
}
export async function safeSpace(operation: () => Promise<Response>): Promise<Response> {
  try { return await operation(); }
  catch (error) {
    if (error instanceof SpaceError) return spaceResponse({ error: error.code }, error.status);
    // Never expose provider text, storage object paths, identity or database diagnostics.
    return spaceResponse({ error: "INVALID_OR_UNAVAILABLE" }, 400);
  }
}
