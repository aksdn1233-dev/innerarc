import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { spaceStorageFetch } from "./storage";
import { SPACE_BUCKET } from "./config";

export async function cleanSpaceAssets(admin: SupabaseClient, now = new Date()) {
  // Scheduled background work only. User-facing deletion receipts never wait for this global batch.
  const expired = await admin.from("space_assets").select("id").lt("expires_at", now.toISOString()).limit(100);
  if (expired.error) return { removed: 0, unavailable: true };
  if (expired.data.length) {
    const deletion = await admin.from("space_assets").delete().in("id", expired.data.map(row => row.id));
    if (deletion.error) return { removed: 0, unavailable: true };
  }
  const pending = await admin.from("space_cleanup_queue").select("object_path,attempts,generation,retain_until").lte("next_attempt_at", now.toISOString()).order("next_attempt_at").limit(100);
  if (pending.error) return { removed: 0, unavailable: true };
  let removed = 0;
  for (let offset = 0; offset < pending.data.length; offset += 4) {
    await Promise.all(pending.data.slice(offset, offset + 4).map(async item => {
      const result = await admin.storage.from(SPACE_BUCKET).remove([item.object_path]);
      if (result.error) {
        const delay = Math.min(24, 2 ** Math.min(item.attempts, 5)) * 3600_000;
        await admin.from("space_cleanup_queue").update({ attempts: item.attempts + 1, next_attempt_at: new Date(now.getTime() + delay).toISOString() }).eq("object_path", item.object_path).eq("generation", item.generation);
        return;
      }
      // Retain acknowledgement for 24h to recover a late upload even if its
      // compensating removal AND re-enqueue both fail during a cross-service outage.
      if (Date.parse(item.retain_until) > now.getTime()) {
        await admin.from("space_cleanup_queue").update({ last_removed_at: now.toISOString(), next_attempt_at: new Date(now.getTime() + 3600_000).toISOString() }).eq("object_path", item.object_path).eq("generation", item.generation);
        return;
      }
      // A late upload may enqueue a newer generation while this removal is in flight.
      const deletion = await admin.from("space_cleanup_queue").delete().eq("object_path", item.object_path).eq("generation", item.generation).select("object_path");
      if (!deletion.error) removed += deletion.data?.length ?? 0;
    }));
  }
  return { removed, unavailable: false };
}
export async function runSpaceCleanup(environment: Readonly<Record<string, string | undefined>>) {
  const admin = resolveSupabaseAdminClient(environment, spaceStorageFetch).client;
  if (!admin) return;
  const result = await cleanSpaceAssets(admin);
  if (result.unavailable) return; // Migration may not yet be deployed; preserve daily notification behavior.
  const delayed = await admin.from("space_cleanup_queue").select("object_path", { count: "exact", head: true }).lt("created_at", new Date(Date.now() - 48 * 3600_000).toISOString());
  if ((delayed.count ?? 0) > 0) console.warn("space_cleanup_delayed", { count: delayed.count });
}
