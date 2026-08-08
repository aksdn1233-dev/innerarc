import { describe, expect, it } from "vitest";
import { calculateNumerologyProfile } from "@/core/numerology";
import {
  accessoryCategoryIds,
  createLifestyleRecommendations,
  createShopPreview,
  LIFESTYLE_RULE_VERSION,
  musicLaneIds,
} from "@/core/lifestyle";

const profile = calculateNumerologyProfile({
  birthDate: "1994-11-04",
  name: "Minji Kim",
  personalYear: 2026,
});

describe("deterministic lifestyle curation", () => {
  it("returns three complete accessory categories and three music lanes", () => {
    const result = createLifestyleRecommendations(profile, "en");
    expect(result.ruleVersion).toBe(LIFESTYLE_RULE_VERSION);
    expect(result.accessories.map(({ categoryId }) => categoryId)).toEqual(accessoryCategoryIds);
    expect(result.music.map(({ laneId }) => laneId)).toEqual(musicLaneIds);
    expect(result.accessories.map(({ rank }) => rank)).toEqual([1, 2, 3]);
    expect(result.music.map(({ rank }) => rank)).toEqual([1, 2, 3]);

    for (const item of result.accessories) {
      expect(item.form).toBeTruthy();
      expect(item.palette).toBeTruthy();
      expect(item.materialDirection).toBeTruthy();
      expect(item.symbolicRationale).toBeTruthy();
      expect(item.tryOnCue).toBeTruthy();
      expect(item.safetyAndCare).toBeTruthy();
      expect(item.shopState).toBe("coming_later");
      expect(item.shopAnchor).toBe(`#${item.categoryId}`);
    }
    for (const item of result.music) {
      expect(item.genreDirection).toBeTruthy();
      expect(item.sonicTraits).toBeTruthy();
      expect(item.useContext).toBeTruthy();
      expect(item.selectionCue).toBeTruthy();
      expect(item.realityCheck).toBeTruthy();
    }
  });

  it("is deterministic and keeps bilingual structure/evidence identical", () => {
    const first = createLifestyleRecommendations(profile, "ko");
    const replay = createLifestyleRecommendations(profile, "ko");
    const en = createLifestyleRecommendations(profile, "en");
    expect(replay).toEqual(first);
    expect(first.accessories.map(({ categoryId, evidenceRefs }) => ({ categoryId, evidenceRefs })))
      .toEqual(en.accessories.map(({ categoryId, evidenceRefs }) => ({ categoryId, evidenceRefs })));
    expect(first.music.map(({ laneId, evidenceRefs }) => ({ laneId, evidenceRefs })))
      .toEqual(en.music.map(({ laneId, evidenceRefs }) => ({ laneId, evidenceRefs })));
  });

  it("uses only canonical date-cycle facts and omits raw identity input", () => {
    const result = createLifestyleRecommendations(profile, "en");
    const evidence = [
      ...result.accessories.flatMap(({ evidenceRefs }) => evidenceRefs),
      ...result.music.flatMap(({ evidenceRefs }) => evidenceRefs),
    ];
    expect(new Set(evidence)).toEqual(new Set([
      `lifePath:${profile.lifePath.value}`,
      `attitude:${profile.attitude.value}`,
      `personalYear:${profile.personalYear.value}`,
    ]));
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("1994-11-04");
    expect(serialized).not.toContain("Minji");
    expect(serialized).not.toContain("birthDate");
    expect(serialized).not.toContain("normalizedName");
  });

  it.each([
    ["1994-11-04", 11],
    ["1980-01-03", 22],
    ["1990-09-05", 33],
  ])("supports master-number profile %s → %i", (birthDate, expected) => {
    const master = calculateNumerologyProfile({ birthDate, personalYear: 2026 });
    expect(master.lifePath.value).toBe(expected);
    expect(createLifestyleRecommendations(master, "en").accessories[0].title).toBeTruthy();
  });

  it("works without name data and makes no positive efficacy claim", () => {
    const unnamed = calculateNumerologyProfile({ birthDate: "2000-02-29", personalYear: 2026 });
    const output = JSON.stringify(createLifestyleRecommendations(unnamed, "en")).toLowerCase();
    expect(output).not.toMatch(
      /will (bring|attract|guarantee|heal|protect|cure)|guaranteed (luck|love|money|success)|treats? (anxiety|depression)|controls? (mood|performance)/,
    );
  });
});

describe("closed shop preview", () => {
  it("exposes allowlisted categories but no commercial capabilities", () => {
    for (const locale of ["ko", "en"] as const) {
      const preview = createShopPreview(locale);
      expect(preview.launchState).toBe("coming_later");
      expect(preview.categories.map(({ id }) => id)).toEqual(accessoryCategoryIds);
      expect(preview.categories.every(({ launchState }) => launchState === "coming_later")).toBe(true);
      expect(preview.unavailableCapabilities).toEqual([
        "products",
        "prices",
        "inventory",
        "cart",
        "checkout",
        "affiliate_links",
      ]);
      const output = JSON.stringify(preview);
      expect(output).not.toMatch(/₩|\$[0-9]|https?:\/\/|affiliateId|birthDate|name/);
    }
  });
});
