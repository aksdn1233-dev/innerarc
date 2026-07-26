import { describe, expect, it } from "vitest";
import {
  createOnboardingReflectionContext,
  onboardingDepthIds,
  onboardingFocusIds,
  ONBOARDING_CONTEXT_RULE_VERSION,
  OnboardingContextInputError,
} from "@/core/onboarding";
import { buildCoreProfileShare } from "@/core/share";

function create(overrides: Record<string, unknown> = {}) {
  return createOnboardingReflectionContext({
    locale: "en",
    focusId: "work",
    depth: "balanced",
    concern: "",
    aiPersonalizationConsent: false,
    ...overrides,
  });
}

describe("onboarding reflection context", () => {
  it("covers every focus and depth without adding calculated facts", () => {
    const expectedNextSteps = {
      work: "deep_profile",
      relationships: "relationship",
      growth: "reality_check",
      money: "reality_check",
      leadership: "deep_profile",
    };

    for (const focusId of onboardingFocusIds) {
      for (const depth of onboardingDepthIds) {
        const result = create({ focusId, depth });
        expect(result.ruleVersion).toBe(ONBOARDING_CONTEXT_RULE_VERSION);
        expect(result.source).toBe("user_selected_context");
        expect(result.focusId).toBe(focusId);
        expect(result.depth).toBe(depth);
        expect(result.nextStep.type).toBe(expectedNextSteps[focusId]);
        expect(result.showDeepProfileByDefault).toBe(depth === "deep");
        expect(result.title).toBeTruthy();
        expect(result.contextualInference).toBeTruthy();
        expect(result.practicalAction).toBeTruthy();
        expect(result.realityCheck).toBeTruthy();
      }
    }

    expect(Object.keys(create())).not.toEqual(expect.arrayContaining([
      "birthDate",
      "name",
      "lifePath",
      "birthday",
      "attitude",
      "personalYear",
      "evidenceRefs",
    ]));
  });

  it("keeps Korean and English structural meaning identical", () => {
    for (const focusId of onboardingFocusIds) {
      for (const depth of onboardingDepthIds) {
        const ko = createOnboardingReflectionContext({
          locale: "ko",
          focusId,
          depth,
          concern: "",
          aiPersonalizationConsent: false,
        });
        const en = create({ focusId, depth });
        expect({
          focusId: ko.focusId,
          depth: ko.depth,
          nextStep: ko.nextStep.type,
          deep: ko.showDeepProfileByDefault,
          source: ko.source,
          provider: ko.aiBoundary.providerStatus,
          requestMade: ko.aiBoundary.requestMade,
        }).toEqual({
          focusId: en.focusId,
          depth: en.depth,
          nextStep: en.nextStep.type,
          deep: en.showDeepProfileByDefault,
          source: en.source,
          provider: en.aiBoundary.providerStatus,
          requestMade: en.aiBoundary.requestMade,
        });
      }
    }
  });

  it("normalizes and labels an optional concern as page-memory-only untrusted text", () => {
    const result = create({ concern: "  Cafe\u0301 choice  \r\n  second   line  " });
    expect(result.concern).toEqual({
      text: "Café choice\nsecond line",
      source: "untrusted_user_input",
      retention: "page_memory_only",
    });
  });

  it("counts Unicode code points and rejects control characters", () => {
    expect(create({ concern: "🧭".repeat(1_000) }).concern?.text).toHaveLength(2_000);
    expect(() => create({ concern: "🧭".repeat(1_001) }))
      .toThrow(OnboardingContextInputError);
    expect(() => create({ concern: "safe\u0000hidden" }))
      .toThrow(OnboardingContextInputError);
  });

  it("fails closed on unsupported IDs, types, and extra fields", () => {
    expect(() => create({ focusId: "health" })).toThrow(OnboardingContextInputError);
    expect(() => create({ depth: "unlimited" })).toThrow(OnboardingContextInputError);
    expect(() => create({ aiPersonalizationConsent: "yes" }))
      .toThrow(OnboardingContextInputError);
    expect(() => createOnboardingReflectionContext({
      locale: "en",
      focusId: "work",
      depth: "balanced",
      concern: "",
      aiPersonalizationConsent: false,
      birthDate: "1994-11-04",
    })).toThrow(OnboardingContextInputError);
  });

  it("states the provider boundary for both consent choices without making a request", () => {
    const off = create();
    const selected = create({ aiPersonalizationConsent: true });
    expect(off.aiBoundary).toMatchObject({
      consentSelected: false,
      providerStatus: "disconnected",
      requestMade: false,
    });
    expect(selected.aiBoundary).toMatchObject({
      consentSelected: true,
      providerStatus: "disconnected",
      requestMade: false,
    });
    expect(selected.aiBoundary.message).toContain("No provider request was made");
  });

  it("keeps the raw concern out of a core share payload", () => {
    const uniqueConcern = "PRIVATE-CONTEXT-DO-NOT-SHARE";
    const context = create({ concern: uniqueConcern });
    const share = buildCoreProfileShare({
      locale: "en",
      lifePath: 11,
      archetype: "Justice",
      summary: "Balance principles with lived evidence.",
      strengths: ["Nuance", "Fairness", "Translation"],
    });
    expect(context.concern?.text).toBe(uniqueConcern);
    expect(JSON.stringify(share)).not.toContain(uniqueConcern);
  });

  it("keeps money and relationship copy non-predictive and non-prescriptive", () => {
    const combined = [
      create({ focusId: "money" }),
      create({ focusId: "relationships" }),
    ].map((item) => JSON.stringify(item).toLowerCase()).join(" ");
    expect(combined).not.toMatch(
      /guaranteed|will marry|soulmate|buy this|sell this|specific stock|lucky number|prediction accuracy/,
    );
  });
});
