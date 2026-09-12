import { describe, expect, it } from "vitest";
import { DREAM_EXTRACTION_JSON_SCHEMA, extractDreamWithFallback, OpenAIDreamUnderstandingProvider, type DreamUnderstandingProvider } from "@/server/dreams/provider";
import { dreamAIConfig } from "@/server/dreams/config";

const input = { requestId: "dream-request-123", locale: "ko" as const, dreamDate: "2026-09-13", rawText: "큰 뱀이 집에 들어왔어요.", context: { currentConcern: "", recentExperience: "", bodyState: "", recurring: false, lucid: false }, retainRawText: false, allowRemoteAI: true };

describe("dream provider fallback", () => {
  it("uses deterministic extraction when no provider is configured", async () => {
    const result = await extractDreamWithFallback(input, null);
    expect(result.fallback).toBe(true);
    expect(result.output.ontology.map((item) => item.code)).toEqual(expect.arrayContaining(["SNAKE", "ENTER", "HOME"]));
  });
  it("caps malformed structured output retries", async () => {
    let calls = 0;
    const provider: DreamUnderstandingProvider = { providerAlias: "test", modelAlias: "verified-test-model", async extract() { calls += 1; return { output: { madeUpSource: "Ancient Book That Does Not Exist" }, usage: { inputTokens: 20, outputTokens: 20, estimatedCostMicros: 20 } }; } };
    const result = await extractDreamWithFallback(input, provider);
    expect(calls).toBe(2);
    expect(result.fallback).toBe(true);
    expect(result.attempts).toBe(2);
    expect(result.usage?.estimatedCostMicros).toBe(40);
  });
  it("rejects output or cost beyond the request cap", async () => {
    const provider: DreamUnderstandingProvider = { providerAlias: "test", modelAlias: "verified-test-model", async extract() { return { output: { ontology: [], categories: ["UNKNOWN"], followUpQuestions: [] }, usage: { inputTokens: 20, outputTokens: 1801, estimatedCostMicros: 60_000 } }; } };
    const result = await extractDreamWithFallback(input, provider, { maxCostMicros: 50_000 });
    expect(result.fallback).toBe(true);
  });
  it("has no model default and requires explicit privacy approval plus cost inputs", () => {
    expect(dreamAIConfig({ DREAM_INTELLIGENCE_ENABLED: "true", DREAM_AI_ENABLED: "true" })).toBeNull();
    expect(dreamAIConfig({ DREAM_INTELLIGENCE_ENABLED: "true", DREAM_AI_ENABLED: "true", DREAM_AI_PRIVACY_APPROVED: "true", OPENAI_API_KEY: "synthetic-key-long-enough", DREAM_AI_MODEL: "account-verified-model", DREAM_AI_INPUT_COST_MICROS_PER_MILLION_TOKENS: "1000000", DREAM_AI_OUTPUT_COST_MICROS_PER_MILLION_TOKENS: "5000000", DREAM_AI_MAX_COST_MICROS: "50000" })?.modelAlias).toBe("account-verified-model");
  });
  it("checks account model access and sends a non-stored strict Responses request", async () => {
    const calls: Array<{ url: string; body?: Record<string, unknown> }> = [];
    const fetchImpl = async (request: string | URL | Request, init?: RequestInit) => {
      const url = String(request); const body = init?.body ? JSON.parse(String(init.body)) as Record<string, unknown> : undefined; calls.push({ url, body });
      if (url.includes("/models/")) return Response.json({ id: "account-verified-model" });
      if (url.endsWith("/responses/input_tokens")) return Response.json({ input_tokens: 100 });
      return Response.json({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify({ ontology: [{ kind: "entity", code: "SNAKE", label: { ko: "뱀", en: "snake" }, evidence: "큰 뱀" }], categories: ["SYMBOLIC"], followUpQuestions: [] }) }] }], usage: { input_tokens: 100, output_tokens: 80 } });
    };
    const config = dreamAIConfig({ DREAM_INTELLIGENCE_ENABLED: "true", DREAM_AI_ENABLED: "true", DREAM_AI_PRIVACY_APPROVED: "true", OPENAI_API_KEY: "synthetic-key-long-enough", DREAM_AI_MODEL: "account-verified-model", DREAM_AI_INPUT_COST_MICROS_PER_MILLION_TOKENS: "1000000", DREAM_AI_OUTPUT_COST_MICROS_PER_MILLION_TOKENS: "5000000", DREAM_AI_MAX_COST_MICROS: "50000" })!;
    const result = await extractDreamWithFallback(input, new OpenAIDreamUnderstandingProvider(config, fetchImpl));
    expect(result.providerUsed).toBe(true);
    expect(calls[0]?.url).toContain("/models/account-verified-model");
    expect(calls[1]?.url).toContain("/responses/input_tokens");
    expect(calls[1]?.body).not.toHaveProperty("store");
    expect(calls[2]?.body).toMatchObject({ model: "account-verified-model", store: false, max_output_tokens: 1800, text: { format: { type: "json_schema", strict: true, schema: DREAM_EXTRACTION_JSON_SCHEMA } } });
  });
  it("halts before generation when the exact request reservation exceeds the cap", async () => {
    const calls: string[] = [];
    const fetchImpl = async (request: string | URL | Request) => {
      const url = String(request); calls.push(url);
      if (url.includes("/models/")) return Response.json({ id: "account-verified-model" });
      if (url.endsWith("/responses/input_tokens")) return Response.json({ input_tokens: 100_000 });
      throw new Error("generation must not run");
    };
    const config = dreamAIConfig({ DREAM_INTELLIGENCE_ENABLED: "true", DREAM_AI_ENABLED: "true", DREAM_AI_PRIVACY_APPROVED: "true", OPENAI_API_KEY: "synthetic-key-long-enough", DREAM_AI_MODEL: "account-verified-model", DREAM_AI_INPUT_COST_MICROS_PER_MILLION_TOKENS: "1000000", DREAM_AI_OUTPUT_COST_MICROS_PER_MILLION_TOKENS: "5000000", DREAM_AI_MAX_COST_MICROS: "50000" })!;
    const result = await extractDreamWithFallback(input, new OpenAIDreamUnderstandingProvider(config, fetchImpl));
    expect(result.fallback).toBe(true);
    expect(result.attempts).toBe(1);
    expect(calls.filter((url) => url.endsWith("/responses"))).toHaveLength(0);
  });
  it("adds retry costs instead of treating each attempt as a new budget", async () => {
    const remaining: number[] = [];
    const provider: DreamUnderstandingProvider = {
      providerAlias: "test", modelAlias: "verified-test-model",
      async extract(_input, _signal, remainingCostMicros) {
        remaining.push(remainingCostMicros ?? -1);
        return { output: { invalid: true }, usage: { inputTokens: 20, outputTokens: 20, estimatedCostMicros: 30_000 } };
      },
    };
    const result = await extractDreamWithFallback(input, provider, { maxCostMicros: 50_000 });
    expect(remaining).toEqual([50_000, 20_000]);
    expect(result.fallback).toBe(true);
    expect(result.usage?.estimatedCostMicros).toBe(60_000);
  });
  it("does not retry an ambiguous provider failure", async () => {
    let calls = 0;
    const provider: DreamUnderstandingProvider = { providerAlias: "test", modelAlias: "verified-test-model", async extract() { calls += 1; throw new Error("transport"); } };
    const result = await extractDreamWithFallback(input, provider);
    expect(calls).toBe(1);
    expect(result.attempts).toBe(1);
    expect(result.fallback).toBe(true);
  });
});
