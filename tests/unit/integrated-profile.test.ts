import { describe, expect, it } from "vitest";
import { calculateNumerologyProfile } from "@/core/numerology";
import {
  careerRoleIds,
  createIntegratedProfile,
  INTEGRATED_PROFILE_RULE_VERSION,
  profileDomainIds,
} from "@/core/profile";

const named = calculateNumerologyProfile({
  birthDate: "1994-11-04",
  name: "Minji Kim",
  personalYear: 2026,
});

describe("integrated profile fallback", () => {
  it("returns every required domain in a stable order", () => {
    const result = createIntegratedProfile(named, "en");
    expect(result.ruleVersion).toBe(INTEGRATED_PROFILE_RULE_VERSION);
    expect(result.domains.map((domain) => domain.id)).toEqual(profileDomainIds);
    for (const domain of result.domains) {
      expect(domain.calculatedFacts.length).toBeGreaterThanOrEqual(2);
      expect(domain.traditionalInterpretation).toBeTruthy();
      expect(domain.personalizedInference).toBeTruthy();
      expect(domain.realityCheck).toBeTruthy();
      expect(domain.uncertainty).toBeTruthy();
    }
  });

  it("uses only canonical calculation evidence", () => {
    const allowed = new Set([
      `lifePath:${named.lifePath.value}`,
      `birthday:${named.birthday.value}`,
      `attitude:${named.attitude.value}`,
      `personalYear:${named.personalYear.value}`,
      `destiny:${named.name.destiny?.value}`,
      `soulUrge:${named.name.soulUrge?.value}`,
      `personality:${named.name.personality?.value}`,
    ]);
    const result = createIntegratedProfile(named, "en");
    const refs = [
      ...result.domains.flatMap((domain) => domain.evidenceRefs),
      ...result.careerRecommendations.flatMap((role) => role.evidenceRefs),
    ];
    expect(refs.every((ref) => allowed.has(ref))).toBe(true);
  });

  it("falls back to date evidence when a name is absent", () => {
    const unnamed = calculateNumerologyProfile({
      birthDate: "1994-11-04",
      personalYear: 2026,
    });
    const result = createIntegratedProfile(unnamed, "en");
    const refs = result.domains.flatMap((domain) => domain.evidenceRefs);
    expect(refs.some((ref) => /destiny|soulUrge|personality/.test(ref))).toBe(false);
    expect(result.domains).toHaveLength(8);
  });

  it("returns three unique, fully explained career role families", () => {
    const result = createIntegratedProfile(named, "en");
    expect(result.careerRecommendations).toHaveLength(3);
    expect(new Set(result.careerRecommendations.map((item) => item.roleId)).size).toBe(3);
    expect(result.careerRecommendations.map((item) => item.rank)).toEqual([1, 2, 3]);
    for (const item of result.careerRecommendations) {
      expect(careerRoleIds).toContain(item.roleId);
      expect(item.fitReason).toBeTruthy();
      expect(item.adverseCondition).toBeTruthy();
      expect(item.complementarySkill).toBeTruthy();
      expect(item.preferredEnvironment).toBeTruthy();
      expect(item.avoidCondition).toBeTruthy();
    }
  });

  it("keeps Korean and English structure and rank order identical", () => {
    const ko = createIntegratedProfile(named, "ko");
    const en = createIntegratedProfile(named, "en");
    expect(ko.domains.map((domain) => domain.id)).toEqual(en.domains.map((domain) => domain.id));
    expect(ko.domains.map((domain) => domain.evidenceRefs)).toEqual(en.domains.map((domain) => domain.evidenceRefs));
    expect(ko.careerRecommendations.map((item) => item.roleId)).toEqual(en.careerRecommendations.map((item) => item.roleId));
    expect(ko.careerRecommendations.map((item) => item.evidenceRefs)).toEqual(en.careerRecommendations.map((item) => item.evidenceRefs));
  });

  it("keeps the money section reflective rather than prescriptive", () => {
    const money = createIntegratedProfile(named, "en").domains.find((domain) => domain.id === "money")!;
    const combined = Object.values(money).flat().join(" ").toLowerCase();
    expect(combined).not.toMatch(/buy|sell|stock|crypto|guaranteed return/);
    expect(money.realityCheck).toContain("expense");
  });
});
