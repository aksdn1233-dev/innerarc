import { z } from "zod";
import { analyzeSpace, applyAction, geometryIssues } from "@/core/space/engine";
import { AnalyzeInputSchema, AnalysisSchema, ChangeInputSchema, CheckInputSchema, ExtractInputSchema, ProjectInputSchema } from "@/core/space/schema";
import { spacePersonalContext } from "./personal";
import { SpaceError, spaceAccess, spaceResponse } from "./access";
import { SPACE_BUCKET, SPACE_IMAGE_MAX_BYTES } from "./config";
import { readBounded, readJson, sanitizeJpeg } from "./io";
import { spaceRoutingState } from "./routing-store";
import { extractSpace } from "./provider";

export async function projects(request: Request) {
  const ctx = await spaceAccess(request, { write: request.method === "POST", existing: request.method === "GET" });
  if (request.method === "GET") {
    const result = await ctx.client.from("space_projects").select("id,title,goal,locale,created_at").eq("owner_user_id", ctx.owner).order("created_at", { ascending: false }).limit(20);
    if (result.error) throw new SpaceError("STORAGE_UNAVAILABLE", 503);
    return spaceResponse({ projects: result.data });
  }
  const body = ProjectInputSchema.parse(await readJson(request));
  const result = await ctx.admin.rpc("space_create_project", { p_owner: ctx.owner, p_title: body.title, p_goal: body.goal, p_locale: body.locale });
  if (result.error) throw new SpaceError("PROJECT_LIMIT_OR_UNAVAILABLE", 409);
  return spaceResponse({ project: result.data }, 201);
}
export async function project(request: Request, projectId: string) {
  z.uuid().parse(projectId);
  const ctx = await spaceAccess(request, { write: request.method === "DELETE", existing: true });
  const owned = await ctx.client.from("space_projects").select("id,title,goal,locale,created_at").eq("id", projectId).eq("owner_user_id", ctx.owner).maybeSingle();
  if (owned.error) throw new SpaceError("STORAGE_UNAVAILABLE", 503);
  if (!owned.data) throw new SpaceError("PROJECT_NOT_FOUND", 404);
  if (request.method === "DELETE") {
    const result = await ctx.admin.from("space_projects").delete().eq("id", projectId).eq("owner_user_id", ctx.owner);
    if (result.error) throw new SpaceError("DELETE_FAILED", 503);
    // Cascading asset deletes enqueue physical removal in the same transaction.
    // The scheduled worker owns cleanup; never drain other owners' queue in this response.
    return spaceResponse({ deleted: true, imageDeletionPending: true });
  }
  const [room, assets, runs, changes, checks, reports] = await Promise.all([
    ctx.client.from("space_rooms").select("scene").eq("project_id", projectId).eq("owner_user_id", ctx.owner).maybeSingle(),
    ctx.client.from("space_assets").select("id,status,expires_at").eq("project_id", projectId).eq("owner_user_id", ctx.owner).gt("expires_at", new Date().toISOString()),
    ctx.client.from("space_analysis_runs").select("id,kind,status,result,telemetry,created_at").eq("project_id", projectId).eq("owner_user_id", ctx.owner).order("created_at", { ascending: false }).limit(20),
    ctx.client.from("space_applied_changes").select("run_id,recommendation_id,applied").eq("project_id", projectId).eq("owner_user_id", ctx.owner),
    ctx.client.from("space_reality_checks").select("id,run_id,outcome,note,days,created_at").eq("project_id", projectId).eq("owner_user_id", ctx.owner).limit(100),
    ctx.admin.from("purchased_reports").select("order_id,report").eq("owner_user_id", ctx.owner).eq("status", "ready").limit(20),
  ]);
  if (room.error || assets.error || runs.error || changes.error || checks.error) throw new SpaceError("STORAGE_UNAVAILABLE", 503);
  return spaceResponse({ project: owned.data, scene: room.data?.scene ?? null, assets: assets.data, runs: runs.data, changes: changes.data, checks: checks.data,
    reports: (reports.data ?? []).map(r => ({ id: r.order_id, title: typeof r.report?.title === "string" ? r.report.title : "Report" })) });
}
export async function projectOperation(request: Request, projectId: string, operation: string) {
  z.uuid().parse(projectId);
  if (!["uploads", "extract", "analyze", "changes", "checks"].includes(operation)) throw new SpaceError("NOT_FOUND", 404);
  const ctx = await spaceAccess(request, { write: true, costly: operation === "extract" });
  const owned = await ctx.client.from("space_projects").select("id,goal,locale").eq("id", projectId).eq("owner_user_id", ctx.owner).maybeSingle();
  if (owned.error) throw new SpaceError("STORAGE_UNAVAILABLE", 503);
  if (!owned.data) throw new SpaceError("PROJECT_NOT_FOUND", 404);
  const owner = ctx.owner;
  if (operation === "uploads") {
    // One bounded file/request; never buffer a 6-file multipart body in a Worker.
    const bytes = sanitizeJpeg(await readBounded(request.body, SPACE_IMAGE_MAX_BYTES), request.headers.get("content-type"));
    const reservation = await ctx.admin.rpc("space_reserve_asset", { p_owner: owner, p_project: projectId });
    if (reservation.error || !reservation.data) throw new SpaceError("UPLOAD_LIMIT", 409);
    const asset = reservation.data;
    const stored = await ctx.admin.storage.from(SPACE_BUCKET).upload(asset.object_path, bytes, { contentType: "image/jpeg", upsert: false, cacheControl: "0" });
    if (stored.error) {
      await ctx.admin.from("space_assets").delete().eq("id", asset.id).eq("owner_user_id", owner);
      throw new SpaceError("UPLOAD_FAILED", 503);
    }
    const ready = await ctx.admin.from("space_assets").update({ status: "ready", byte_size: bytes.length, content_sha256: Buffer.from(await crypto.subtle.digest("SHA-256", new Uint8Array(bytes))).toString("hex") }).eq("id", asset.id).eq("owner_user_id", owner).select("id").maybeSingle();
    if (ready.error || !ready.data) {
      // The project may have been deleted while the upload was in flight.
      await ctx.admin.storage.from(SPACE_BUCKET).remove([asset.object_path]);
      await ctx.admin.from("space_cleanup_queue").upsert({ object_path: asset.object_path, generation: crypto.randomUUID(), attempts: 0, next_attempt_at: new Date().toISOString(), retain_until: new Date(Date.now() + 86400_000).toISOString(), last_removed_at: null });
      throw new SpaceError("UPLOAD_FAILED", 503);
    }
    return spaceResponse({ asset: { id: asset.id, status: "ready", expires_at: asset.expires_at } }, 201);
  }
  const body = await readJson(request);
  if (operation === "extract" || operation === "analyze") {
    const extract = operation === "extract" ? ExtractInputSchema.parse(body) : null;
    const analyze = operation === "analyze" ? AnalyzeInputSchema.parse(body) : null;
    // Validate scene before taking a durable lease; no retry can bypass geometry validation.
    if (analyze && (!analyze.scene.confirmed || !analyze.scene.orientation.confirmed || geometryIssues(analyze.scene).length)) throw new SpaceError("INVALID_GEOMETRY");
    const lease = await ctx.admin.rpc("space_reserve_run", { p_owner: owner, p_project: projectId, p_request: (extract ?? analyze)!.requestId, p_kind: operation });
    if (lease.error || !lease.data) throw new SpaceError("ANALYSIS_IN_PROGRESS", 409);
    const { run, acquired } = lease.data;
    if (!acquired) return spaceResponse({ runId: run.id, status: run.status, result: run.result, duplicate: true }, run.status === "pending" ? 202 : 200);
    try {
      if (extract) {
        const assets = await ctx.admin.from("space_assets").select("id,object_path,content_sha256").eq("project_id", projectId).eq("owner_user_id", owner).eq("status", "ready").gt("expires_at", new Date().toISOString()).order("created_at");
        if (assets.error || assets.data.length < 2 || assets.data.length > 6) throw new SpaceError("TWO_TO_SIX_IMAGES_REQUIRED");
        const routing = await spaceRoutingState(ctx.admin, owner, projectId, assets.data, extract.orientation);
        if (routing.reuse) {
          const result = { scene: routing.reuse.scene, reason: null, telemetry: { provider: "manual", model: null, attempts: 0, inputTokens: 0, outputTokens: 0, costMicros: 0, reservedMicros: 0, billingUnknown: false, outcome: "reused", routerVersion: "space-router-1", attemptRecords: [], inputFingerprint: routing.fingerprint, reuse: { hit: true, sourceRunId: routing.reuse.sourceRunId } } };
          const saved = await ctx.admin.from("space_analysis_runs").update({ status: "complete", result: { scene: result.scene, reason: null }, telemetry: { ...result.telemetry, inputFingerprint: routing.fingerprint } }).eq("id", run.id).eq("owner_user_id", owner).eq("status", "pending").select("id").maybeSingle();
          if (saved.error || !saved.data) throw new SpaceError("SAVE_FAILED", 503);
          return spaceResponse({ runId: run.id, status: "complete", result });
        }
        const images: string[] = [];
        const downloadSignal = AbortSignal.timeout(45_000);
        for (const asset of assets.data) {
          const stored = await ctx.admin.storage.from(SPACE_BUCKET).download(asset.object_path, {}, { signal: downloadSignal });
          if (stored.error || !stored.data || stored.data.size > SPACE_IMAGE_MAX_BYTES) throw new SpaceError("IMAGE_UNAVAILABLE", 503);
          images.push(`data:image/jpeg;base64,${Buffer.from(await stored.data.arrayBuffer()).toString("base64")}`);
        }
        // A stale storage read must never resume into a newly paid request after its lease expired.
        const live = await ctx.admin.from("space_analysis_runs").select("id").eq("id", run.id).eq("owner_user_id", owner).eq("status", "pending").gte("created_at", new Date(Date.now() - 90_000).toISOString()).maybeSingle();
        if (downloadSignal.aborted || live.error || !live.data) throw new SpaceError("ANALYSIS_LEASE_EXPIRED", 409);
        const result = await extractSpace(images, extract.orientation, undefined, undefined, routing.history);
        const status = result.scene ? "complete" : "fallback";
        const saved = await ctx.admin.from("space_analysis_runs").update({ status, result: { scene: result.scene, reason: result.reason }, telemetry: { ...result.telemetry, inputFingerprint: routing.fingerprint } }).eq("id", run.id).eq("owner_user_id", owner).eq("status", "pending").select("id").maybeSingle();
        if (saved.error || !saved.data) throw new SpaceError("SAVE_FAILED", 503);
        return spaceResponse({ runId: run.id, status, result });
      }
      const personal = await spacePersonalContext(ctx.admin, ctx.client, owner, analyze!.reportId, analyze!.usePatterns, owned.data.locale);
      const result = analyzeSpace(analyze!.scene, owned.data.goal, owned.data.locale, personal);
      const saved = await ctx.admin.rpc("space_finish_analysis", { p_owner: owner, p_project: projectId, p_run: run.id, p_result: result });
      if (saved.error) throw new SpaceError("SAVE_FAILED", 503);
      return spaceResponse({ runId: run.id, status: "complete", result });
    } catch (error) {
      await ctx.admin.from("space_analysis_runs").update({ status: "failed" }).eq("id", run.id).eq("owner_user_id", owner).eq("status", "pending");
      throw error;
    }
  }
  const change = operation === "changes" ? ChangeInputSchema.parse(body) : null;
  const check = operation === "checks" ? CheckInputSchema.parse(body) : null;
  const runId = (change ?? check)!.runId;
  const run = await ctx.client.from("space_analysis_runs").select("id,result,created_at,change_revision").eq("id", runId).eq("project_id", projectId).eq("owner_user_id", owner).eq("kind", "analyze").eq("status", "complete").maybeSingle();
  if (run.error || !run.data) throw new SpaceError("RUN_NOT_FOUND", 404);
  const result = AnalysisSchema.parse(run.data.result);
  if (change) {
    if (!result.recommendations.some(rec => rec.id === change.recommendationId)) throw new SpaceError("RECOMMENDATION_NOT_FOUND", 404);
    const existing = await ctx.client.from("space_applied_changes").select("recommendation_id,applied").eq("run_id", runId).eq("owner_user_id", owner);
    if (existing.error) throw new SpaceError("STORAGE_UNAVAILABLE", 503);
    const selected = new Set(existing.data.filter(row => row.applied).map(row => row.recommendation_id));
    if (change.applied) selected.add(change.recommendationId); else selected.delete(change.recommendationId);
    let scene = result.current;
    for (const rec of result.recommendations) if (selected.has(rec.id)) scene = applyAction(scene, rec.action);
    const saved = await ctx.admin.rpc("space_save_change", { p_owner: owner, p_project: projectId, p_run: runId, p_revision: run.data.change_revision, p_recommendation: change.recommendationId, p_applied: change.applied });
    if (saved.error) throw new SpaceError("CHANGE_CONFLICT_RELOAD", 409);
    return spaceResponse({ saved: true, appliedScene: scene });
  }
  const elapsed = (Date.now() - Date.parse(run.data.created_at)) / 86400_000;
  if (elapsed < check!.days) throw new SpaceError("CHECK_NOT_DUE", 409);
  const saved = await ctx.admin.from("space_reality_checks").upsert({ run_id: runId, project_id: projectId, owner_user_id: owner, request_id: check!.requestId, outcome: check!.outcome, note: check!.note, days: check!.days }, { onConflict: "owner_user_id,request_id", ignoreDuplicates: true });
  if (saved.error) throw new SpaceError("SAVE_FAILED", 503);
  return spaceResponse({ saved: true });
}
