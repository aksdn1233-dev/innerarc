import { describe, expect, it } from "vitest";
import { SpaceModelSchema } from "@/server/space/config";
import { routeSpaceTask, selectSpaceModel, type RoutingObservation } from "@/server/space/router";
const cheap = SpaceModelSchema.parse({ id: "synthetic-routine", inputMicrosPerMillion: 1_000_000, cachedInputMicrosPerMillion: 100_000, cacheWriteMicrosPerMillion: 1_250_000, outputMicrosPerMillion: 2_000_000, tier: "routine" });
const strong = SpaceModelSchema.parse({ id: "synthetic-strong", inputMicrosPerMillion: 10_000_000, cachedInputMicrosPerMillion: 1_000_000, cacheWriteMicrosPerMillion: 12_500_000, outputMicrosPerMillion: 50_000_000, tier: "strong" });
function history(model: string, passed: number, tested: number, difficulty: "standard" | "complex" = "standard"): RoutingObservation[] { return Array.from({ length: tested }, (_, i) => ({ model, difficulty, reasoningLevel: null, escalated: false, success: i < passed, latencyMs: 2000, inputTokens: 1000, outputTokens: 500 })); }
describe("expected-total-cost task routing", () => {
  it("keeps coordinates, analysis, CRUD and rendering off model paths", () => { for (const task of ["geometry", "analysis", "save", "render"] as const) expect(routeSpaceTask(task)).toBe("deterministic"); });
  it("uses the cheaper model after sustained matched successes", () => { const selected = selectSpaceModel([strong, cheap], "standard", [...history(cheap.id, 50, 50), ...history(strong.id, 50, 50)], 16000, 4096, 500000); expect(selected?.model.id).toBe(cheap.id); expect(selected?.decisionBasis).toBe("observed"); });
  it("starts strong when repeated cheaper failures make retries more expensive", () => { const selected = selectSpaceModel([cheap, strong], "complex", [...history(cheap.id, 0, 50, "complex"), ...history(strong.id, 50, 50, "complex")], 16000, 4096, 500000); expect(selected?.model.id).toBe(strong.id); });
  it("labels sparse history as cold-start assumptions", () => { const selected = selectSpaceModel([cheap], "standard", history(cheap.id, 1, 1), 16000, 4096, 500000); expect(selected?.decisionBasis).toBe("cold_start"); });
  it("does not pick a plan outside the remaining budget", () => { expect(selectSpaceModel([strong], "complex", [], 16000, 4096, 1)).toBeNull(); });
  it("refuses unsupported reasoning or undocumented cache settings", () => { expect(SpaceModelSchema.safeParse({ ...cheap, normalEffort: "max" }).success).toBe(false); expect(SpaceModelSchema.safeParse({ ...cheap, explicitCacheControl: true }).success).toBe(false); });
  it("uses only a configured, documented reasoning escalation", () => { const model = SpaceModelSchema.parse({ ...strong, capabilityEvidence: { url: "https://developers.openai.com/api/docs/models/verified-placeholder", verifiedAt: "2026-09-07" }, reasoningEfforts: ["low", "medium"], normalEffort: "low", escalationEffort: "medium" }); expect(selectSpaceModel([model], "complex", [], 16000, 4096, 500000, model.id)?.reasoningLevel).toBe("medium"); });
});
