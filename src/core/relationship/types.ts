export const meetingContextIds = [
  "creative_social",
  "learning_community",
  "purpose_service",
  "movement_exploration",
  "structured_projects",
  "quiet_depth",
  "leadership_networks",
  "trusted_circles",
] as const;
export type MeetingContextId = (typeof meetingContextIds)[number];

export type PartnerQualityKey =
  | "respects_independence"
  | "emotionally_attuned"
  | "expressive_warmth"
  | "reliable"
  | "adaptable"
  | "responsible_care"
  | "intellectually_deep"
  | "ethically_ambitious"
  | "compassionate"
  | "grounded_intuition"
  | "long_term_builder"
  | "kind_with_boundaries";

export type RelationshipEvidenceRef = {
  readonly id: string;
  readonly label: string;
};

export type MeetingContextInsight = {
  readonly id: MeetingContextId;
  readonly title: string;
  readonly why: string;
  readonly tryThis: string;
  readonly caution: string;
  readonly evidenceRefs: readonly string[];
};

export type PartnerQualityInsight = {
  readonly key: PartnerQualityKey;
  readonly label: string;
  readonly why: string;
  readonly evidenceRefs: readonly string[];
};

export type RelationshipInsight = {
  readonly ruleVersion: string;
  readonly summary: string;
  readonly energySources: readonly string[];
  readonly meetingContexts: readonly MeetingContextInsight[];
  readonly futurePartnerPortrait: {
    readonly label: string;
    readonly description: string;
    readonly qualities: readonly PartnerQualityInsight[];
  };
  readonly attractionPattern: string;
  readonly frictionPattern: string;
  readonly greenFlags: readonly string[];
  readonly currentCycleLens: string;
  readonly realityChecks: readonly string[];
  readonly uncertainty: string;
  readonly evidenceRefs: readonly RelationshipEvidenceRef[];
};
