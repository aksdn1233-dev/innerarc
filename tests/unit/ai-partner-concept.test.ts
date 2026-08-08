import { describe, expect, it } from "vitest";

import { calculateNumerologyProfile } from "@/core/numerology";
import { createAiPartnerConcept } from "@/core/ai/partner-concept";
import { createPaidReport } from "@/server/reports/paid-report";

const profile = calculateNumerologyProfile({ birthDate: "1994-11-04", personalYear: 2026 });

describe("AI partner archetype concept", () => {
  it("creates a bounded concept and explicitly rejects face prediction", () => {
    const concept = createAiPartnerConcept(profile, "ko");

    expect(concept.title).toBeTruthy();
    expect(concept.traits).toHaveLength(3);
    expect(concept.imageSrc).toBe("/images/ai-partner-archetype.png");
    expect(concept.disclaimer).toMatch(/실제 인물.*예측하지 않습니다/u);
  });

  it("adds the concept to a paid report only after optional AI consent", () => {
    const base = {
      version: 1 as const,
      locale: "ko" as const,
      productCode: "pro_30d" as const,
      birthDate: "1994-11-04",
      name: "테스트",
      focusId: "relationships" as const,
      concern: "어떤 관계가 오래 이어질까요?",
      createdAt: "2026-08-09T00:00:00.000Z",
    };
    const withoutAi = createPaidReport("without-ai", base);
    const withAi = createPaidReport("with-ai", {
      ...base,
      consent: {
        privacyRequired: true as const,
        aiPartnerImage: true,
        acceptedAt: "2026-08-09T00:00:00.000Z",
        policyVersion: "checkout-privacy-1.0.0" as const,
      },
    });

    expect(withoutAi.aiPartnerConcept).toBeUndefined();
    expect(withAi.aiPartnerConcept?.imageSrc).toBe("/images/ai-partner-archetype.png");
  });
});
