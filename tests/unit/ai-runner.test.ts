import { describe, expect, it } from "vitest";
import {
  createFallbackInterpretation,
  runAIInterpretation,
  type AIProfileRequest,
  type MeteredInterpretationProvider,
  type MeteredProviderResponse,
} from "@/core/ai";
import { calculateNumerologyProfile } from "@/core/numerology";

const numerology = calculateNumerologyProfile({
  birthDate: "1994-11-04",
  name: "Minji Kim",
  personalYear: 2026,
});

const request: AIProfileRequest = {
  locale: "en",
  numerology,
  interest: "career",
  concern: "Should I change roles?",
  depth: "balanced",
  priorPatternRefs: [],
};

function provider(
  interpret: MeteredInterpretationProvider["interpret"],
): MeteredInterpretationProvider {
  return { providerAlias: "test_provider", modelAlias: "model-1", interpret };
}

const metered = (output: unknown): MeteredProviderResponse => ({
  output,
  usage: { inputTokens: 700, outputTokens: 250, estimatedCostMicros: 18_000 },
});

describe("metered AI interpretation runner", () => {
  it("returns the offline fallback when no provider is configured", async () => {
    const result = await runAIInterpretation({ request, provider: null });
    expect(result.interpretation).toEqual(createFallbackInterpretation(numerology, "en"));
    expect(result.audit).toMatchObject({
      providerAlias: "disabled",
      fallback: true,
      failureReason: "provider_disabled",
      estimatedCostMicros: 0,
    });
  });

  it("accepts a schema-valid, fact-bound, non-overclaiming result", async () => {
    const output = createFallbackInterpretation(numerology, "en");
    const result = await runAIInterpretation({
      request,
      provider: provider(async () => metered(output)),
    });
    expect(result.interpretation).toEqual(output);
    expect(result.audit).toMatchObject({
      fallback: false,
      failureReason: null,
      inputTokens: 700,
      outputTokens: 250,
      estimatedCostMicros: 18_000,
    });
  });

  it("falls back on provider errors without inventing usage", async () => {
    const result = await runAIInterpretation({
      request,
      provider: provider(async () => { throw new Error("NETWORK_FAILURE"); }),
    });
    expect(result.audit).toMatchObject({
      fallback: true,
      failureReason: "provider_error",
      inputTokens: 0,
      estimatedCostMicros: 0,
    });
  });

  it("aborts and falls back when the provider exceeds its deadline", async () => {
    const result = await runAIInterpretation({
      request,
      timeoutMs: 10,
      provider: provider((_request, signal) => new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(new Error("ABORTED")), { once: true });
      })),
    });
    expect(result.audit).toMatchObject({ fallback: true, failureReason: "timeout" });
  });

  it("falls back on malformed output and invented facts", async () => {
    const malformed = await runAIInterpretation({
      request,
      provider: provider(async () => metered({ summary: "incomplete" })),
    });
    expect(malformed.audit.failureReason).toBe("schema_or_fact_error");

    const output = createFallbackInterpretation(numerology, "en");
    const invented = await runAIInterpretation({
      request,
      provider: provider(async () => metered({
        ...output,
        evidence_refs: [...output.evidence_refs, { id: "lifePath:7", source: "calculation", label: "invented" }],
      })),
    });
    expect(invented.audit.failureReason).toBe("schema_or_fact_error");
  });

  it("screens prohibited certainty after schema validation", async () => {
    const output = createFallbackInterpretation(numerology, "en");
    const result = await runAIInterpretation({
      request,
      provider: provider(async () => metered({ ...output, summary: "You will definitely succeed" })),
    });
    expect(result.interpretation).toEqual(createFallbackInterpretation(numerology, "en"));
    expect(result.audit.failureReason).toBe("prohibited_overclaim");
  });

  it("emits bounded audit metadata without request or response content", async () => {
    const audits: unknown[] = [];
    await runAIInterpretation({
      request,
      provider: provider(async () => metered(createFallbackInterpretation(numerology, "en"))),
      onAudit: (audit) => { audits.push(audit); },
    });
    expect(audits).toHaveLength(1);
    const serialized = JSON.stringify(audits[0]);
    expect(serialized).not.toContain(request.concern!);
    expect(serialized).not.toContain("Life Path");
    expect(Object.keys(audits[0] as object).sort()).toEqual([
      "estimatedCostMicros",
      "failureReason",
      "fallback",
      "inputTokens",
      "latencyMs",
      "modelAlias",
      "outputTokens",
      "policyVersion",
      "providerAlias",
    ].sort());
  });
});
