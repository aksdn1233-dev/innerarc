import { beforeEach, describe, expect, it, vi } from "vitest";
import jpeg from "jpeg-js";
import { analyzeSpace } from "@/core/space/engine";
import { estimatedMeasurements, manualScene } from "@/core/space/schema";
const mocks = vi.hoisted(() => ({ access: vi.fn(), extract: vi.fn(), personal: vi.fn(), cleanup: vi.fn(), routing: vi.fn() }));
vi.mock("@/server/space/access", async importOriginal => ({ ...await importOriginal<typeof import("@/server/space/access")>(), spaceAccess: mocks.access }));
vi.mock("@/server/space/provider", () => ({ extractSpace: mocks.extract }));
vi.mock("@/server/space/personal", () => ({ spacePersonalContext: mocks.personal }));
vi.mock("@/server/space/cleanup", () => ({ cleanSpaceAssets: mocks.cleanup }));
vi.mock("@/server/space/routing-store", () => ({ spaceRoutingState: mocks.routing }));
import { projectOperation, project as deleteProject } from "@/server/space/service";
const owner = "11111111-1111-4111-8111-111111111111", project = "22222222-2222-4222-8222-222222222222", runId = "33333333-3333-4333-8333-333333333333", requestId = "44444444-4444-4444-8444-444444444444";
function query(data: unknown, error: unknown = null) {
  const result = { data, error };
  const q = { select: vi.fn(), eq: vi.fn(), gt: vi.fn(), gte: vi.fn(), order: vi.fn(), update: vi.fn(), delete: vi.fn(), upsert: vi.fn(), maybeSingle: vi.fn(), then: (resolve: (v: typeof result) => unknown) => Promise.resolve(result).then(resolve) };
  for (const key of ["select", "eq", "gt", "gte", "order", "update", "delete", "upsert", "maybeSingle"] as const) q[key].mockReturnValue(q);
  return q;
}
let client: { from: ReturnType<typeof vi.fn> }, admin: { from: ReturnType<typeof vi.fn>; rpc: ReturnType<typeof vi.fn>; storage: { from: ReturnType<typeof vi.fn> } }, storage: { upload: ReturnType<typeof vi.fn>; download: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> };
function req(body: unknown) { return new Request(`https://example.test/api/space/projects/${project}/analyze`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); }
function confirmed() { const scene = manualScene(); scene.confirmed = true; scene.orientation.confirmed = true; return scene; }
const extractBody = () => ({ requestId, orientation: confirmed().orientation, aiConsent: true });
beforeEach(() => {
  vi.clearAllMocks();
  client = { from: vi.fn().mockImplementation(() => query({ id: project, goal: "rest", locale: "en" })) };
  storage = { upload: vi.fn().mockResolvedValue({ error: null }), download: vi.fn().mockResolvedValue({ data: new Blob([new Uint8Array([255, 216, 255, 217])]), error: null }), remove: vi.fn().mockResolvedValue({ error: null }) };
  admin = { from: vi.fn().mockImplementation(() => query({ id: runId })), rpc: vi.fn().mockResolvedValue({ data: { acquired: true, run: { id: runId, status: "pending" } }, error: null }), storage: { from: vi.fn().mockReturnValue(storage) } };
  mocks.routing.mockResolvedValue({ history: [], reuse: null, fingerprint: "synthetic-hash" }); mocks.access.mockResolvedValue({ client, admin, owner }); mocks.personal.mockResolvedValue({ sources: [], symbolicBasis: [], mismatchCount: 0 });
});
describe("space service integration with mocked external boundaries", () => {
  it("denies a foreign room before any privileged operation", async () => { client.from.mockReturnValue(query(null)); await expect(projectOperation(req({}), project, "extract")).rejects.toMatchObject({ code: "PROJECT_NOT_FOUND" }); expect(admin.rpc).not.toHaveBeenCalled(); expect(mocks.extract).not.toHaveBeenCalled(); });
  it("requires consent before reserving or downloading", async () => { await expect(projectOperation(req({ ...extractBody(), aiConsent: false }), project, "extract")).rejects.toThrow(); expect(admin.rpc).not.toHaveBeenCalled(); });
  it("rejects bad coordinates before taking a lease", async () => { const scene = confirmed(); scene.objects[0].x = 19; await expect(projectOperation(req({ requestId, scene, reportId: null, usePatterns: false }), project, "analyze")).rejects.toMatchObject({ code: "INVALID_GEOMETRY" }); expect(admin.rpc).not.toHaveBeenCalled(); });
  it("returns an idempotent pending duplicate without a second model call", async () => { admin.rpc.mockResolvedValue({ data: { acquired: false, run: { id: runId, status: "pending", result: null } } }); const response = await projectOperation(req(extractBody()), project, "extract"); expect(response.status).toBe(202); expect((await response.json()).duplicate).toBe(true); expect(storage.download).not.toHaveBeenCalled(); expect(mocks.extract).not.toHaveBeenCalled(); });
  it.each([0, 1, 7])("rejects %i photos and persists failure without a model call", async count => { const failed = query({ id: runId }); admin.from.mockReturnValueOnce(query(Array.from({ length: count }, (_, i) => ({ object_path: `${i}.jpg` })))).mockReturnValueOnce(failed); await expect(projectOperation(req(extractBody()), project, "extract")).rejects.toMatchObject({ code: "TWO_TO_SIX_IMAGES_REQUIRED" }); expect(failed.update).toHaveBeenCalledWith({ status: "failed" }); expect(mocks.extract).not.toHaveBeenCalled(); });
  it("persists timeout/provider fallback and only sends private image bytes", async () => {
    const assets = query([{ object_path: "private/1.jpg" }, { object_path: "private/2.jpg" }]), saved = query({ id: runId }); admin.from.mockReturnValueOnce(assets).mockReturnValueOnce(query({ id: runId })).mockReturnValueOnce(saved);
    mocks.extract.mockResolvedValue({ scene: null, reason: "PROVIDER_TIMEOUT", telemetry: { attempts: 1, usageUnknown: true } });
    const response = await projectOperation(req(extractBody()), project, "extract"); expect((await response.json()).status).toBe("fallback");
    expect(assets.eq).toHaveBeenCalledWith("owner_user_id", owner); expect(assets.gt).toHaveBeenCalledWith("expires_at", expect.any(String)); expect(mocks.extract).toHaveBeenCalledWith([expect.stringMatching(/^data:image\/jpeg;base64,/), expect.stringMatching(/^data:image\/jpeg;base64,/)], confirmed().orientation, undefined, undefined, []);
    expect(saved.update).toHaveBeenCalledWith(expect.objectContaining({ status: "fallback", telemetry: expect.objectContaining({ attempts: 1, usageUnknown: true }) }));
  });
  it("does not call the model when a stalled download has outlived the run lease", async () => {
    admin.from.mockReturnValueOnce(query([{ object_path: "1.jpg" }, { object_path: "2.jpg" }])).mockReturnValueOnce(query(null));
    await expect(projectOperation(req(extractBody()), project, "extract")).rejects.toMatchObject({ code: "ANALYSIS_LEASE_EXPIRED" });
    expect(storage.download).toHaveBeenCalledWith("1.jpg", {}, { signal: expect.any(AbortSignal) }); expect(mocks.extract).not.toHaveBeenCalled();
  });
  it("fails missing stored photo before calling the model", async () => { admin.from.mockReturnValueOnce(query([{ object_path: "1" }, { object_path: "2" }])); storage.download.mockResolvedValue({ error: { message: "private path" } }); await expect(projectOperation(req(extractBody()), project, "extract")).rejects.toMatchObject({ code: "IMAGE_UNAVAILABLE" }); expect(mocks.extract).not.toHaveBeenCalled(); });
  it("uses the deterministic engine and atomic persistence without model calls", async () => { const scene = confirmed(); const response = await projectOperation(req({ requestId, scene, reportId: null, usePatterns: false }), project, "analyze"); const body = await response.json(); expect(body.status).toBe("complete"); expect(body.result.current).toEqual(scene); expect(admin.rpc).toHaveBeenCalledWith("space_finish_analysis", expect.objectContaining({ p_owner: owner, p_run: runId, p_result: expect.objectContaining({ current: scene }) })); expect(mocks.extract).not.toHaveBeenCalled(); });
  it("cleans an upload racing with project deletion and queues a durable retry", async () => { const path = `${owner}/${project}/asset.jpg`; admin.rpc.mockResolvedValue({ data: { id: requestId, object_path: path } }); admin.from.mockReturnValueOnce(query(null)).mockReturnValueOnce(query(null)); const bytes = jpeg.encode({ width: 16, height: 16, data: new Uint8Array(16 * 16 * 4) }, 75).data; const request = new Request("https://example.test", { method: "POST", headers: { "content-type": "image/jpeg" }, body: new Uint8Array(bytes) }); await expect(projectOperation(request, project, "uploads")).rejects.toMatchObject({ code: "UPLOAD_FAILED" }); expect(storage.remove).toHaveBeenCalledWith([path]); expect(admin.from).toHaveBeenCalledWith("space_cleanup_queue"); });
  it("will not save early feedback as a 30-day Reality Check", async () => { const result = analyzeSpace(confirmed(), "rest", "en"); client.from.mockReturnValueOnce(query({ id: project, goal: "rest", locale: "en" })).mockReturnValueOnce(query({ id: runId, result, created_at: new Date().toISOString(), change_revision: 0 })); await expect(projectOperation(req({ runId, requestId, outcome: "helpful", days: 30, note: "Synthetic test" }), project, "checks")).rejects.toMatchObject({ code: "CHECK_NOT_DUE" }); expect(admin.from).not.toHaveBeenCalled(); });
});

it("reuses an owned validated extraction without downloading or paying again", async () => {
  const scene = { ...manualScene(), measurements: estimatedMeasurements("photo", .7) };
  mocks.routing.mockResolvedValue({ reuse: { sourceRunId: "prior", scene }, history: [], fingerprint: "same-assets" });
  const saved = query({ id: runId });
  admin.from.mockReturnValueOnce(query([{ id: "one" }, { id: "two" }])).mockReturnValueOnce(saved);
  const response = await projectOperation(req(extractBody()), project, "extract");
  const body = await response.json(); expect(body.status).toBe("complete"); expect(body.result.scene).toEqual(scene);
  expect(body.result.telemetry).toMatchObject({ attempts: 0, costMicros: 0, outcome: "reused" });
  expect(saved.eq).toHaveBeenCalledWith("owner_user_id", owner); expect(saved.eq).toHaveBeenCalledWith("status", "pending");
  expect(storage.download).not.toHaveBeenCalled(); expect(mocks.extract).not.toHaveBeenCalled();
});

it("project deletion returns its committed receipt without waiting on global storage cleanup", async () => {
  mocks.cleanup.mockImplementation(() => new Promise(() => {}));
  const response = await deleteProject(new Request(`https://example.test/api/space/projects/${project}`, { method: "DELETE" }), project);
  expect(await response.json()).toEqual({ deleted: true, imageDeletionPending: true });
  expect(mocks.cleanup).not.toHaveBeenCalled(); expect(storage.remove).not.toHaveBeenCalled(); expect(admin.from).toHaveBeenCalledTimes(1);
});
