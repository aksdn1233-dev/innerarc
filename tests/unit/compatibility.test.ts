import { describe, expect, it } from "vitest";
import { calculateNumerologyProfile } from "@/core/numerology";
import {
  compatibilitySectionIds,
  createCompatibilityInsight,
  relationshipTypes,
  selectableRelationshipTypes,
} from "@/core/compatibility";

const personA = calculateNumerologyProfile({
  birthDate: "1994-11-04",
  name: "Minji Kim",
  personalYear: 2026,
});
const personB = calculateNumerologyProfile({
  birthDate: "1988-03-17",
  name: "Alex Lee",
  personalYear: 2026,
});

describe("two-person compatibility reflection", () => {
  it("shows exactly the five owner-requested relationship choices", () => {
    expect(selectableRelationshipTypes).toEqual([
      "romance", "coworker", "family", "friendship", "cofounder",
    ]);
  });

  it.each(relationshipTypes)("returns all required sections for %s", (relationshipType) => {
    const result = createCompatibilityInsight({ personA, personB, relationshipType, locale: "en" });
    expect(result.sections.map((section) => section.id)).toEqual(compatibilitySectionIds);
    for (const section of result.sections) {
      expect(section.observation).toBeTruthy();
      expect(section.practicalConditions.length).toBeGreaterThan(0);
      expect(section.realityCheck).toBeTruthy();
      expect(section.evidenceRefs.length).toBeGreaterThan(0);
    }
  });

  it("preserves symmetric structural observations when people are swapped", () => {
    const first = createCompatibilityInsight({ personA, personB, relationshipType: "romance", locale: "en" });
    const swapped = createCompatibilityInsight({ personA: personB, personB: personA, relationshipType: "romance", locale: "en" });
    expect(swapped.sections).toEqual(first.sections);
    expect(swapped.summary).toEqual(first.summary);
  });

  it("keeps Korean and English IDs and evidence structurally identical", () => {
    const ko = createCompatibilityInsight({ personA, personB, relationshipType: "cofounder", locale: "ko" });
    const en = createCompatibilityInsight({ personA, personB, relationshipType: "cofounder", locale: "en" });
    expect(ko.sections.map((section) => section.id)).toEqual(en.sections.map((section) => section.id));
    expect(ko.sections.map((section) => section.evidenceRefs)).toEqual(en.sections.map((section) => section.evidenceRefs));
  });

  it("gives family its own boundaries instead of treating every family as parent-child", () => {
    const family = createCompatibilityInsight({ personA, personB, relationshipType: "family", locale: "ko" });
    expect(family.relationshipLabel).toBe("가족");
    expect(family.sections.find((section) => section.id === "money_responsibility")?.practicalConditions.join(" "))
      .toContain("가족이라는 이유만으로");
  });

  it("works without either person's name and omits name-number evidence", () => {
    const unnamedA = calculateNumerologyProfile({ birthDate: "1994-11-04", personalYear: 2026 });
    const unnamedB = calculateNumerologyProfile({ birthDate: "1988-03-17", name: "김민지", personalYear: 2026 });
    const result = createCompatibilityInsight({ personA: unnamedA, personB: unnamedB, relationshipType: "friendship", locale: "en" });
    expect(result.sections).toHaveLength(8);
    expect(result.sections.flatMap((section) => section.evidenceRefs).join(" ")).not.toContain("soulUrge");
  });

  it("makes role order and power caution explicit for asymmetric relationships", () => {
    const manager = createCompatibilityInsight({ personA, personB, relationshipType: "manager_report", locale: "en" });
    const parent = createCompatibilityInsight({ personA, personB, relationshipType: "parent_child", locale: "en" });
    expect(manager.roleOrderNote).toContain("First input: manager");
    expect(manager.sections.find((section) => section.id === "decision_authority")?.practicalConditions.join(" ")).toContain("power gap");
    expect(parent.roleOrderNote).toContain("First input: parent");
    expect(parent.sections.find((section) => section.id === "decision_authority")?.practicalConditions.join(" ")).toContain("autonomy");
  });

  it("never emits a compatibility percentage or fate verdict", () => {
    for (const relationshipType of relationshipTypes) {
      const result = createCompatibilityInsight({ personA, personB, relationshipType, locale: "en" });
      const output = JSON.stringify(result).toLowerCase();
      expect(output).not.toMatch(/%|\bpercent\b|destined|guaranteed|must stay|must leave|soulmate score/);
    }
  });
});
