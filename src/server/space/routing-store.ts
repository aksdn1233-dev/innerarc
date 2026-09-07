import type { SupabaseClient } from "@supabase/supabase-js";
import { SceneSchema, SPACE_VERSION, type Scene } from "@/core/space/schema";
import { geometryIssues } from "@/core/space/engine";
import { RoutingObservationSchema, SPACE_ROUTER_VERSION, type RoutingObservation } from "./router";
export async function spaceRoutingState(admin: SupabaseClient, owner: string, project: string, assets: { id: string; content_sha256?: string | null }[], orientation: Scene["orientation"]) {
  const bytes = new TextEncoder().encode(JSON.stringify([owner, project, SPACE_VERSION, "photo-observation-3", assets.map(asset => [asset.id, asset.content_sha256 ?? null])]));
  const fingerprint = Buffer.from(await crypto.subtle.digest("SHA-256", bytes)).toString("hex");
  const [prior, performance] = await Promise.all([
    admin.from("space_analysis_runs").select("id,result").eq("owner_user_id", owner).eq("project_id", project).eq("kind", "extract").eq("status", "complete").eq("telemetry->>inputFingerprint", fingerprint).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    // Telemetry contains no identity, photos, prompts or model prose. Aggregate only compatible runs.
    admin.from("space_analysis_runs").select("telemetry").eq("kind", "extract").eq("telemetry->>routerVersion", SPACE_ROUTER_VERSION).gt("telemetry->>attempts", 0).gte("created_at", new Date(Date.now() - 30 * 86400_000).toISOString()).order("created_at", { ascending: false }).limit(200),
  ]);
  const history: RoutingObservation[] = [];
  if (!performance.error) for (const row of performance.data ?? []) {
    if (row.telemetry?.routerVersion !== SPACE_ROUTER_VERSION || !Array.isArray(row.telemetry.attemptRecords)) continue;
    for (const value of row.telemetry.attemptRecords.slice(0, 2)) { if (["COST_CAP", "INPUT_TOKEN_CAP"].includes(value?.failureReason)) continue; const parsed = RoutingObservationSchema.safeParse(value); if (parsed.success && history.length < 200) history.push(parsed.data); }
  }
  const parsed = SceneSchema.safeParse(prior.data?.result?.scene);
  const reuse = !prior.error && prior.data && parsed.success && parsed.data.measurements?.origin === "photo" && !geometryIssues(parsed.data).length ? { sourceRunId: prior.data.id as string, scene: { ...parsed.data, orientation, confirmed: false } } : null;
  return { history, reuse, fingerprint };
}
