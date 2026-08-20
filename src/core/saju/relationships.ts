import type { EarthlyBranch, HeavenlyStem, Pillar } from "./types";

export type SajuRelationship = {
  readonly kind: "stem-combination" | "branch-combination" | "branch-clash";
  readonly members: readonly [HeavenlyStem, HeavenlyStem] | readonly [EarthlyBranch, EarthlyBranch];
  readonly locations: readonly string[];
  readonly ruleId: string;
};

const STEM_COMBINATIONS = ["甲己", "乙庚", "丙辛", "丁壬", "戊癸"] as const;
const BRANCH_COMBINATIONS = ["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"] as const;
const BRANCH_CLASHES = ["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"] as const;

type LocatedPillar = { readonly location: "year" | "month" | "day" | "hour"; readonly pillar: Pillar };

function pairMatches(pair: string, left: string, right: string): boolean {
  return pair === `${left}${right}` || pair === `${right}${left}`;
}

/**
 * Only the broadly stable pair relationships are calculated here. 형·파·해, 삼합,
 * 신살 and 용신 remain explicit extension points because their inclusion and weighting
 * differ by school; silently mixing those conventions would make the result irreproducible.
 */
export function findStableRelationships(pillars: readonly LocatedPillar[]): readonly SajuRelationship[] {
  const relationships: SajuRelationship[] = [];
  for (let left = 0; left < pillars.length; left += 1) {
    for (let right = left + 1; right < pillars.length; right += 1) {
      const a = pillars[left]!;
      const b = pillars[right]!;
      const locations = [a.location, b.location];
      if (STEM_COMBINATIONS.some((pair) => pairMatches(pair, a.pillar.stem, b.pillar.stem))) {
        relationships.push({
          kind: "stem-combination",
          members: [a.pillar.stem, b.pillar.stem],
          locations,
          ruleId: "saju.relationship.stem-combination.v1",
        });
      }
      if (BRANCH_COMBINATIONS.some((pair) => pairMatches(pair, a.pillar.branch, b.pillar.branch))) {
        relationships.push({
          kind: "branch-combination",
          members: [a.pillar.branch, b.pillar.branch],
          locations,
          ruleId: "saju.relationship.branch-combination.v1",
        });
      }
      if (BRANCH_CLASHES.some((pair) => pairMatches(pair, a.pillar.branch, b.pillar.branch))) {
        relationships.push({
          kind: "branch-clash",
          members: [a.pillar.branch, b.pillar.branch],
          locations,
          ruleId: "saju.relationship.branch-clash.v1",
        });
      }
    }
  }
  return relationships;
}
