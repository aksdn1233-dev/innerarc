import { describe, expect, it } from "vitest";
import { calculateNumerologyProfile } from "@/core/numerology";
import {
  CELEBRITIES,
  CelebrityDataError,
  findCelebrityMatches,
  validateCelebrityDataset,
  type CelebrityRecord,
} from "@/core/celebrity";

const profile = calculateNumerologyProfile({
  birthDate: "1994-11-04",
  name: "Minji Kim",
  personalYear: 2026,
});

describe("sourced celebrity dataset", () => {
  it("contains unique, validated, HTTPS-sourced public records", () => {
    expect(() => validateCelebrityDataset(CELEBRITIES)).not.toThrow();
    expect(CELEBRITIES).toHaveLength(7);
    expect(new Set(CELEBRITIES.map((item) => item.id)).size).toBe(CELEBRITIES.length);
    for (const celebrity of CELEBRITIES) {
      expect(celebrity.source.url).toMatch(/^https:\/\//);
      expect(celebrity.source.accessedAt).toBe("2026-07-22");
      expect(celebrity.confidence).toBe("confirmed");
      expect(celebrity.careerEvidence.length).toBeGreaterThan(0);
      expect(celebrity.careerEvidence.every(item => item.source.url.startsWith("https://") && item.source.accessedAt === "2026-09-08")).toBe(true);
    }
  });

  it("rejects duplicate IDs, invalid dates, and non-HTTPS sources", () => {
    expect(() => validateCelebrityDataset([CELEBRITIES[0], CELEBRITIES[0]])).toThrow(CelebrityDataError);
    expect(() => validateCelebrityDataset([{ ...CELEBRITIES[0], id: "bad-date", birthDate: "1961-02-30" }]))
      .toThrow();
    expect(() => validateCelebrityDataset([{
      ...CELEBRITIES[0],
      id: "bad-source",
      source: { ...CELEBRITIES[0].source, url: "http://example.com" },
    }])).toThrow(/HTTPS/);
    expect(() => validateCelebrityDataset([{ ...CELEBRITIES[0], id: "missing-evidence", careerEvidence: [] }])).toThrow(/career evidence/);
  });
});

describe("celebrity structural comparison", () => {
  it("returns a deterministic rank with ordinal overlap labels", () => {
    const first = findCelebrityMatches({ profile, locale: "en", limit: 5 });
    const second = findCelebrityMatches({ profile, locale: "en", limit: 5 });
    expect(second).toEqual(first);
    expect(first.matches.map((item) => item.rank)).toEqual([1, 2, 3, 4, 5]);
    expect(first.matches.every((item) => item.tierLabel.length > 0)).toBe(true);
  });

  it("filters by public role field without changing source records", () => {
    const sports = findCelebrityMatches({ profile, locale: "en", field: "sports", limit: 10 });
    expect(sports.matches.map((item) => item.celebrity.id).sort()).toEqual(["serena-williams", "son-heung-min"]);
    expect(sports.matches.every((item) => item.celebrity.fields.includes("sports"))).toBe(true);
  });

  it("filters by localized profession and carries sourced context and transfer limits", () => {
    const science = findCelebrityMatches({ profile, locale: "en", professionQuery: "chemistry", limit: 10 });
    expect(science.matches.map(item => item.celebrity.id)).toEqual(["marie-curie"]);
    expect(science.matches[0].story.evidenceStatus).toBe("supported");
    expect(science.matches[0].story.hiddenConditions.length).toBeGreaterThan(0);
    expect(science.matches[0].story.unknowns.length).toBeGreaterThan(0);
    expect(science.matches[0].story.sources.every(item => item.url.startsWith("https://"))).toBe(true);
    expect(findCelebrityMatches({ profile, locale: "en", professionQuery: "not-in-dataset" }).matches).toEqual([]);
  });

  it("keeps Korean and English rank, structure, and evidence identical", () => {
    const ko = findCelebrityMatches({ profile, locale: "ko" });
    const en = findCelebrityMatches({ profile, locale: "en" });
    expect(ko.matches.map((item) => item.celebrity.id)).toEqual(en.matches.map((item) => item.celebrity.id));
    expect(ko.matches.map((item) => item.sharedStructures)).toEqual(en.matches.map((item) => item.sharedStructures));
    expect(ko.matches.map((item) => item.evidenceRefs)).toEqual(en.matches.map((item) => item.evidenceRefs));
  });

  it("uses birth-date structure only, not either user's or celebrity's name", () => {
    const renamed = calculateNumerologyProfile({
      birthDate: "1994-11-04",
      name: "Completely Different Name",
      personalYear: 2026,
    });
    const first = findCelebrityMatches({ profile, locale: "en" });
    const second = findCelebrityMatches({ profile: renamed, locale: "en" });
    expect(second.matches.map((item) => [item.celebrity.id, item.sharedStructures]))
      .toEqual(first.matches.map((item) => [item.celebrity.id, item.sharedStructures]));
  });

  it("never presents personality identity or a public percentage", () => {
    const output = JSON.stringify(findCelebrityMatches({ profile, locale: "en", limit: 7 })).toLowerCase();
    expect(output).not.toMatch(/%|percent identical|same personality|destined|guaranteed/);
    expect(output).toContain("public birth dates");
  });

  it("fails closed when a supplied dataset is malformed", () => {
    const malformed = [{ ...CELEBRITIES[0], fields: [] }] as CelebrityRecord[];
    expect(() => findCelebrityMatches({ profile, locale: "en", records: malformed })).toThrow(CelebrityDataError);
  });
});
