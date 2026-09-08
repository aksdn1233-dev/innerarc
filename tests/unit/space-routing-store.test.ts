import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { spaceRoutingState } from "@/server/space/routing-store";
import { SPACE_ROUTER_VERSION } from "@/server/space/router";
import { manualScene, estimatedMeasurements } from "@/core/space/schema";
const orientation = { northDegrees: 90, confirmed: true, source: "manual" as const };
const asset = [{ id: "asset-one", content_sha256: "a".repeat(64) }, { id: "asset-two", content_sha256: "b".repeat(64) }];
function setup(scene: unknown = null, rows: unknown[] = [], error: unknown = null) {
  function query(data: unknown, error: unknown, history = false) {
    const q = { select: vi.fn(), eq: vi.fn(), gt: vi.fn(), gte: vi.fn(), order: vi.fn(), limit: vi.fn(), maybeSingle: vi.fn(), then: (resolve: (v: unknown) => unknown) => {
      let actual = data;
      if (history) {
        const typed = data as { telemetry: { routerVersion: string; attempts: number } }[];
        actual = typed.filter(row => !q.eq.mock.calls.some(([key, val]) => key === "telemetry->>routerVersion" && row.telemetry.routerVersion !== val))
          .filter(row => !q.gt.mock.calls.some(([key, val]) => key === "telemetry->>attempts" && row.telemetry.attempts <= val)).slice(0, 200);
      }
      return Promise.resolve({ data: actual, error }).then(resolve);
    } };
    for (const name of ["select", "eq", "gt", "gte", "order", "limit", "maybeSingle"] as const) q[name].mockReturnValue(q);
    return q;
  }
  const prior = query(scene ? { id: "source-run", result: { scene } } : null, error), history = query(rows, null, true);
  const admin = { from: vi.fn().mockReturnValueOnce(prior).mockReturnValueOnce(history) } as unknown as SupabaseClient;
  return { admin, prior, history };
}
const photo = () => ({ ...manualScene(), confirmed: true, measurements: estimatedMeasurements("photo", .7) });
describe("owner-scoped extraction reuse and bounded routing history", () => {
  it("scopes every reuse predicate and refreshes north without claiming measured geometry", async () => {
    const db = setup(photo()); const state = await spaceRoutingState(db.admin, "owner", "project", asset, orientation);
    for (const pair of [["owner_user_id", "owner"], ["project_id", "project"], ["kind", "extract"], ["status", "complete"], ["telemetry->>inputFingerprint", state.fingerprint]]) expect(db.prior.eq).toHaveBeenCalledWith(...pair);
    expect(state.reuse).toMatchObject({ sourceRunId: "source-run", scene: { confirmed: false, orientation, measurements: { origin: "photo", width: { status: "estimated" } } } });
    expect(db.prior.limit).toHaveBeenCalledWith(1); expect(db.history.limit).toHaveBeenCalledWith(200);
  });
  it("fingerprints owner, project, immutable asset identity and sanitized content", async () => {
    const read = (owner: string, project: string, images = asset) => spaceRoutingState(setup().admin, owner, project, images, orientation).then(r => r.fingerprint);
    const values = await Promise.all([read("a", "a"), read("b", "a"), read("a", "b"), read("a", "a", [...asset].reverse()), read("a", "a", [{ ...asset[0], content_sha256: "c".repeat(64) }, asset[1]])]);
    expect(new Set(values).size).toBe(5); expect(values[0]).toBe(await read("a", "a"));
  });
  it.each(["manual", "malformed", "bounds", "db_error"])("never reuses %s output", async kind => {
    const scene = kind === "manual" ? manualScene() : photo(); if (kind === "bounds") scene.objects[0].x = 500;
    const db = setup(kind === "malformed" ? { room: null } : scene, [], kind === "db_error" ? { code: "offline" } : null);
    expect((await spaceRoutingState(db.admin, "owner", "project", asset, orientation)).reuse).toBeNull();
  });
  it("cache hits and incompatible runs cannot evict genuine recent model history", async () => {
    const row = { model: "verified-test", difficulty: "standard", reasoningLevel: null, escalated: false, success: true, latencyMs: 100, inputTokens: 100, outputTokens: 50 };
    const hits = Array.from({ length: 205 }, () => ({ telemetry: { routerVersion: SPACE_ROUTER_VERSION, attempts: 0, attemptRecords: [] } }));
    const incompatible = Array.from({ length: 205 }, () => ({ telemetry: { routerVersion: "old", attempts: 1, attemptRecords: [row] } }));
    const db = setup(null, [...hits, ...incompatible, { telemetry: { routerVersion: SPACE_ROUTER_VERSION, attempts: 1, attemptRecords: [row, { ...row, latencyMs: -1 }] } }]);
    expect((await spaceRoutingState(db.admin, "owner", "project", asset, orientation)).history).toEqual([row]);
  });
});
