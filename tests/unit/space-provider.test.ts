import { describe, expect, it, vi } from "vitest";
import { manualScene } from "@/core/space/schema";
import { extractSpace, SPACE_OBSERVATION_JSON_SCHEMA } from "@/server/space/provider";
import { spaceAIConfig, spaceEnabled, type SpaceAIConfig } from "@/server/space/config";
const config: SpaceAIConfig = spaceAIConfig({ SPACE_ENABLED: "true", SPACE_AI_ENABLED: "true", OPENAI_API_KEY: "synthetic-test-key-not-live", SPACE_AI_TIMEOUT_MS: "1000", SPACE_AI_MODELS_JSON: JSON.stringify([{ id: "synthetic-primary", inputMicrosPerMillion: 10_000_000, cachedInputMicrosPerMillion: 1_000_000, cacheWriteMicrosPerMillion: 12_500_000, outputMicrosPerMillion: 50_000_000, tier: "strong" }, { id: "synthetic-fallback", inputMicrosPerMillion: 1_000_000, cachedInputMicrosPerMillion: 100_000, cacheWriteMicrosPerMillion: 1_250_000, outputMicrosPerMillion: 2_000_000, tier: "routine" }]) })!;
const images = ["data:image/jpeg;base64,AA==", "data:image/jpeg;base64,AA=="];
const scene = manualScene();
const observation = {
  room: scene.room, doors: scene.doors, windows: scene.windows, objects: scene.objects.map(object => ({ ...object, elevation: null })), confidence: 0.8,
  imageEvidence: [
    { imageIndex: 0, usable: true, view: "overview", observesRoomBoundary: true, observedObjectIds: scene.objects.map(object => object.id) },
    { imageIndex: 1, usable: true, view: "opposite", observesRoomBoundary: true, observedObjectIds: scene.objects.map(object => object.id) },
  ],
  crossView: { matchedViews: 2, geometryConsistency: .9, lightingRisk: .1, perspectiveRisk: .1, occlusionRisk: .1, scaleEvidence: "visual" },
  missing: [],
};
function output(text = JSON.stringify(observation)) { return { status: "completed", output: [{ type: "message", content: [{ type: "output_text", text }] }], usage: { input_tokens: 1000, output_tokens: 100, input_tokens_details: { cached_tokens: 0, cache_write_tokens: 0 }, output_tokens_details: { reasoning_tokens: 0 } } }; }
function transport(generation: (body: Record<string, unknown>, n: number) => Response | Promise<Response> = () => Response.json(output()), count = 1000) {
  let n = 0;
  return vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const address = String(url), body = JSON.parse(String(init?.body ?? "{}"));
    if (address.includes("/models/")) return Response.json({ id: address.split("/").at(-1) });
    if (address.endsWith("input_tokens")) return Response.json({ input_tokens: count });
    return generation(body, ++n);
  });
}
describe("space model boundary", () => {
  it("is off by default and invents no model", async () => { const fetch = transport(); expect(spaceEnabled({})).toBe(false); expect(spaceAIConfig({ SPACE_ENABLED: "true", SPACE_AI_ENABLED: "true" })).toBeNull(); expect((await extractSpace(images, scene.orientation, null, fetch)).reason).toBe("AI_UNAVAILABLE"); expect(fetch).not.toHaveBeenCalled(); });
  it("builds a strict required-fields-only schema recursively", () => {
    const walk = (value: unknown) => { if (!value || typeof value !== "object") return; const v = value as Record<string, unknown>; if (v.type === "object") { expect(v.additionalProperties).toBe(false); expect(v.required).toEqual(Object.keys(v.properties as object)); } Object.values(v).forEach(child => Array.isArray(child) ? child.forEach(walk) : walk(child)); }; walk(SPACE_OBSERVATION_JSON_SCHEMA);
  });
  it("classifies observed plumbing fixtures in deterministic code rather than trusting model movability", async () => {
    const sink={...scene.objects[0],id:"sink_seen",kind:"sink",movable:true,elevation:null};
    const result=await extractSpace(images,scene.orientation,config,transport(()=>Response.json(output(JSON.stringify({...observation,objects:[sink]})))));
    expect(result.scene?.objects[0]).toMatchObject({kind:"sink",movable:false,mobility:"fixed"});
  });
  it("counts exact image input before generation and never stores provider responses", async () => {
    const fetch = transport((body) => { expect(body.store).toBe(false); expect(body.max_output_tokens).toBe(4096); expect(JSON.stringify(body)).not.toContain("image_url\":{\"url"); expect(body).not.toHaveProperty("tools"); return Response.json(output()); });
    const result = await extractSpace(images, scene.orientation, config, fetch); expect(result.scene?.confirmed).toBe(false); expect(result.telemetry.model).toBe("synthetic-fallback"); expect(result.telemetry.costMicros).toBe(1200); expect(fetch.mock.calls[1][0]).toContain("input_tokens");
  });
  it.each([0, 1, 7])("refuses image count %s", async n => { const fetch = transport(); const result = await extractSpace(Array(n).fill(images[0]), scene.orientation, config, fetch); expect(result.reason).toBe("INVALID_IMAGES"); expect(fetch).not.toHaveBeenCalled(); });
  it("rejects remote image URLs", async () => expect((await extractSpace(["https://example.com/private.jpg", images[0]], scene.orientation, config, transport())).reason).toBe("INVALID_IMAGES"));
  it("halts before generation on input token cap", async () => { const fetch = transport(undefined, 16001); expect((await extractSpace(images, scene.orientation, config, fetch)).reason).toBe("INPUT_TOKEN_CAP"); expect(fetch).toHaveBeenCalledTimes(2); });
  it("halts before generation on cost cap", async () => { const fetch = transport(); expect((await extractSpace(images, scene.orientation, { ...config, maxCostMicros: 1 }, fetch)).reason).toBe("COST_CAP"); expect(fetch).not.toHaveBeenCalled(); });
  it("falls back after definite model capability rejection", async () => { const fetch = transport((body, n) => n === 1 ? Response.json({ error: "unsupported" }, { status: 400 }) : Response.json(output())); const result = await extractSpace(images, scene.orientation, config, fetch); expect(result.scene).not.toBeNull(); expect(result.telemetry.model).toBe("synthetic-primary"); expect(result.telemetry.attemptRecords.map(a => a.model)).toEqual(["synthetic-fallback", "synthetic-primary"]); expect(result.telemetry.attempts).toBe(2); expect(result.telemetry.billingUnknown).toBe(false); });
  it.each(["not json", "{}", JSON.stringify({ ...observation, objects: [{ ...scene.objects[0], x: 99 }] }), JSON.stringify({ ...observation, objects: [scene.objects[0], { ...scene.objects[0], id: "overlap" }] })])("caps invalid output retry: %s", async text => { const result = await extractSpace(images, scene.orientation, config, transport(() => Response.json(output(text)))); expect(result.scene).toBeNull(); expect(result.telemetry.attempts).toBe(2); });
  it("routes empty geometry to manual editing", async () => { const result = await extractSpace(images, scene.orientation, config, transport(() => Response.json(output(JSON.stringify({ ...observation, objects: [] }))))); expect(result.reason).toBe("INSUFFICIENT_EVIDENCE"); });
  it.each([
    { imageEvidence: [observation.imageEvidence[0], { ...observation.imageEvidence[1], imageIndex: 0 }] },
    { crossView: { ...observation.crossView, matchedViews: 1 } },
    { crossView: { ...observation.crossView, geometryConsistency: .4 } },
    { crossView: { ...observation.crossView, lightingRisk: .9 } },
  ])("rejects photo evidence that cannot support cross-view geometry", async evidence => {
    const response = output(JSON.stringify({ ...observation, ...evidence }));
    const result = await extractSpace(images, scene.orientation, config, transport(() => Response.json(response)));
    expect(result.reason).toBe("INSUFFICIENT_CAPTURE_EVIDENCE"); expect(result.scene).toBeNull();
  });
  it("does not retry ambiguous transport failure", async () => { const result = await extractSpace(images, scene.orientation, config, transport(() => { throw new Error("transport"); })); expect(result.telemetry.billingUnknown).toBe(true); expect(result.telemetry.attempts).toBe(1); expect(result.telemetry.reservedMicros).toBeGreaterThan(0); });
  it("fails closed on missing usage", async () => { const raw = output(); const result = await extractSpace(images, scene.orientation, config, transport(() => Response.json({ ...raw, usage: null }))); expect(result.scene).toBeNull(); expect(result.telemetry.billingUnknown).toBe(true); });
  it("honors timeout without launching another model", async () => {
    const fetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      if (String(url).includes("/models/")) return Response.json({ id: String(url).split("/").at(-1) });
      if (String(url).endsWith("input_tokens")) return Response.json({ input_tokens: 1000 });
      return new Promise<Response>((_, reject) => init!.signal!.addEventListener("abort", () => reject(new Error("timeout")), { once: true }));
    });
    const result = await extractSpace(images, scene.orientation, { ...config, timeoutMs: 20 }, fetch); expect(result.reason).toBe("TIMEOUT"); expect(result.telemetry.attempts).toBe(1);
  });
  it("does not retry provider 429", async () => { const result = await extractSpace(images, scene.orientation, config, transport(() => Response.json({}, { status: 429 }))); expect(result.reason).toBe("PROVIDER_UNAVAILABLE"); expect(result.telemetry.attempts).toBe(1); });
  it("settles known billed usage before reserving a valid retry", async () => {
    const primaryOnly = { ...config, models: [config.models[0]] };
    const fetch = transport((_body, n) => { const raw = output(n === 1 ? "broken json" : JSON.stringify(observation)); raw.usage.input_tokens = 4000; raw.usage.output_tokens = 500; return Response.json(raw); }, 4000);
    const result = await extractSpace(images, scene.orientation, primaryOnly, fetch);
    expect(result.scene).not.toBeNull(); expect(result.telemetry.attempts).toBe(2); expect(result.telemetry.costMicros).toBe(130000); expect(result.telemetry.reservedMicros).toBeLessThanOrEqual(config.maxCostMicros);
  });
  it("keeps generation-only cache controls out of exact token count", async () => {
    const model = { ...config.models[0], explicitCacheControl: true, capabilityEvidence: { url: "https://developers.openai.com/api/docs/guides/prompt-caching", verifiedAt: "2026-09-07" } };
    const fetch = transport(body => { expect(body.prompt_cache_options).toEqual({ mode: "explicit", ttl: "30m" }); return Response.json(output()); });
    await extractSpace(images, scene.orientation, { ...config, models: [model] }, fetch);
    const countCall = fetch.mock.calls.find(([url]) => String(url).endsWith("input_tokens"))!; expect(JSON.parse(String(countCall[1]?.body))).not.toHaveProperty("prompt_cache_options");
  });
  it("rejects contradictory scale evidence without purchasing another attempt", async () => { const result = await extractSpace(images, scene.orientation, config, transport(() => Response.json(output(JSON.stringify({ ...observation, missing: ["dimensions"] }))))); expect(result.reason).toBe("INSUFFICIENT_EVIDENCE"); expect(result.telemetry.attempts).toBe(1); });
  it("rejects an irregular room rather than inventing a rectangle", async () => { const result = await extractSpace(images, scene.orientation, config, transport(() => Response.json(output(JSON.stringify({ ...observation, missing: ["irregular_room"] }))))); expect(result.scene).toBeNull(); });
  it("accounts for cache reads, writes and output without double charging reasoning", async () => { const raw = output(); raw.usage.input_tokens_details = { cached_tokens: 200, cache_write_tokens: 300 }; raw.usage.output_tokens_details.reasoning_tokens = 30; const result = await extractSpace(images, scene.orientation, config, transport(() => Response.json(raw))); expect(result.telemetry.costMicros).toBe(1095); expect(result.telemetry.attemptRecords[0].reasoningTokens).toBe(30); });
  it("omits unverified reasoning/cache controls", async () => { const fetch = transport(body => { expect(body).not.toHaveProperty("reasoning"); expect(body).not.toHaveProperty("prompt_cache_options"); return Response.json(output()); }); await extractSpace(images, scene.orientation, config, fetch); });
  it("refuses hidden extra instructions/actions in observation", async () => { const result = await extractSpace(images, scene.orientation, config, transport(() => Response.json(output(JSON.stringify({ ...observation, actions: [{ type: "move" }] }))))); expect(result.scene).toBeNull(); });
});
it("reroutes an unpaid exact-cost rejection without escalating the affordable model", async () => {
  const models = [{ ...config.models[1], id: "synthetic-standard", tier: "standard" as const }, { ...config.models[0], id: "synthetic-astra-tier", tier: "astra" as const, inputMicrosPerMillion: 2_000_000, cachedInputMicrosPerMillion: 200_000, cacheWriteMicrosPerMillion: 2_500_000, outputMicrosPerMillion: 10_000_000 }];
  const fetch = transport(() => Response.json(output()), 16000);
  const result = await extractSpace(images, scene.orientation, { ...config, models, maxCostMicros: 30000 }, fetch);
  expect(result.scene).not.toBeNull(); expect(result.telemetry.model).toBe("synthetic-standard");
  expect(fetch.mock.calls.filter(([url]) => String(url).endsWith("/responses"))).toHaveLength(1);
  expect(result.telemetry.attemptRecords.map(a => a.failureReason)).toEqual(["COST_CAP", null]);
  expect(result.telemetry.attemptRecords.every(a => !a.escalated)).toBe(true); expect(result.telemetry.reservedMicros).toBe(28192);
});
it("keeps finalized attempt causes separate from the run outcome", async () => {
  const result = await extractSpace(images, scene.orientation, config, transport(() => Response.json(output(""))));
  expect(result.reason).toBe("INVALID_OR_UNAVAILABLE"); expect(result.telemetry.attemptRecords.map(a => a.failureReason)).toEqual(["EMPTY_RESULT", "EMPTY_RESULT"]);
});
