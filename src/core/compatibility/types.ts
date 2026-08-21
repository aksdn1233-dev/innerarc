export const COMPATIBILITY_RULE_VERSION = "compatibility-reflection-1.0.0";

export const relationshipTypes = [
  "romance",
  "marriage",
  "friendship",
  "coworker",
  "cofounder",
  "manager_report",
  "parent_child",
  "family",
] as const;

export type RelationshipType = (typeof relationshipTypes)[number];

/** Five plain-language choices for new comparisons; legacy types remain readable. */
export const selectableRelationshipTypes = [
  "romance",
  "coworker",
  "family",
  "friendship",
  "cofounder",
] as const satisfies readonly RelationshipType[];

export const compatibilitySectionIds = [
  "common_ground",
  "complement",
  "friction",
  "communication",
  "money_responsibility",
  "decision_authority",
  "conflict_repair",
  "maintenance",
] as const;

export type CompatibilitySectionId = (typeof compatibilitySectionIds)[number];

export interface CompatibilitySection {
  id: CompatibilitySectionId;
  title: string;
  observation: string;
  practicalConditions: string[];
  realityCheck: string;
  evidenceRefs: string[];
}

export interface CompatibilityInsight {
  ruleVersion: typeof COMPATIBILITY_RULE_VERSION;
  relationshipType: RelationshipType;
  relationshipLabel: string;
  summary: string;
  roleOrderNote?: string;
  sections: CompatibilitySection[];
  uncertainty: string;
  privacyNote: string;
}
