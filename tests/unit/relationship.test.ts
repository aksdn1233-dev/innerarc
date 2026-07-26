import { describe, expect, it } from "vitest";
import { calculateNumerologyProfile } from "@/core/numerology";
import {
  RELATIONSHIP_INSIGHT_RULE_VERSION,
  createRelationshipInsight,
} from "@/core/relationship";

const sampleProfile = calculateNumerologyProfile({
  birthDate: "1994-11-04",
  name: "Minji Kim",
  personalYear: 2026,
});

describe("relationship reflection engine", () => {
  it("is deterministic, versioned, and returns unique ranked contexts", () => {
    const first = createRelationshipInsight(sampleProfile, "ko");
    const second = createRelationshipInsight(sampleProfile, "ko");
    expect(first).toEqual(second);
    expect(first.ruleVersion).toBe(RELATIONSHIP_INSIGHT_RULE_VERSION);
    expect(first.meetingContexts).toHaveLength(3);
    expect(new Set(first.meetingContexts.map((context) => context.id)).size).toBe(3);
    expect(first.futurePartnerPortrait.qualities.length).toBeGreaterThanOrEqual(2);
  });

  it("keeps Korean and English structure and evidence aligned", () => {
    const ko = createRelationshipInsight(sampleProfile, "ko");
    const en = createRelationshipInsight(sampleProfile, "en");
    expect(ko.meetingContexts.map((context) => context.id)).toEqual(
      en.meetingContexts.map((context) => context.id),
    );
    expect(ko.futurePartnerPortrait.qualities.map((quality) => quality.key)).toEqual(
      en.futurePartnerPortrait.qualities.map((quality) => quality.key),
    );
    expect(ko.evidenceRefs.map((ref) => ref.id)).toEqual(en.evidenceRefs.map((ref) => ref.id));
  });

  it("works without a name and does not invent name-number evidence", () => {
    const profile = calculateNumerologyProfile({
      birthDate: "1994-11-04",
      personalYear: 2026,
    });
    const insight = createRelationshipInsight(profile, "en");
    expect(insight.meetingContexts).toHaveLength(3);
    expect(insight.evidenceRefs.some((ref) => ref.id.startsWith("soulUrge:"))).toBe(false);
    expect(insight.futurePartnerPortrait.qualities.length).toBeGreaterThanOrEqual(2);
  });

  it("handles a non-Latin optional name without fabricating romanization", () => {
    const profile = calculateNumerologyProfile({
      birthDate: "1994-11-04",
      name: "김민지",
      personalYear: 2026,
    });
    expect(profile.name.status).toBe("unavailable");
    const insight = createRelationshipInsight(profile, "ko");
    expect(insight.evidenceRefs.some((ref) => ref.id.startsWith("destiny:"))).toBe(false);
  });

  it("changes meeting hypotheses when the canonical profile changes", () => {
    const builder = calculateNumerologyProfile({
      birthDate: "1980-01-03",
      personalYear: 2026,
    });
    expect(createRelationshipInsight(sampleProfile, "en").meetingContexts[0].id).not.toBe(
      createRelationshipInsight(builder, "en").meetingContexts[0].id,
    );
  });

  it.each([
    ["1994-11-04", 11],
    ["1980-01-03", 22],
    ["1990-09-05", 33],
  ])("supports master-number profile %s → %i", (birthDate, expected) => {
    const profile = calculateNumerologyProfile({ birthDate, personalYear: 2026 });
    expect(profile.lifePath.value).toBe(expected);
    expect(createRelationshipInsight(profile, "ko").summary.length).toBeGreaterThan(20);
  });

  it("does not emit probability, certainty, or destined-marriage claims", () => {
    for (const locale of ["ko", "en"] as const) {
      const serialized = JSON.stringify(createRelationshipInsight(sampleProfile, locale));
      expect(serialized).not.toMatch(/\d+%|확률|반드시\s*(만나|결혼)|운명적\s*배우자/i);
      expect(serialized).not.toMatch(/probability|will definitely|destined spouse|you will meet/i);
    }
  });

  it("includes consent, consistency, boundaries, and outcome review checks", () => {
    const en = createRelationshipInsight(sampleProfile, "en");
    expect(en.realityChecks.join(" ")).toMatch(/mutual/i);
    expect(en.realityChecks.join(" ")).toMatch(/consistent/i);
    expect(en.realityChecks.join(" ")).toMatch(/boundaries/i);
    expect(en.realityChecks.join(" ")).toMatch(/one month/i);
  });
});
