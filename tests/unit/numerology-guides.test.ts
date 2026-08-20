import { readFile, stat } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  NUMEROLOGY_GUIDES,
  getDefaultNumerologyGuide,
  numerologyGuideIds,
} from "@/core/numerology-guides";

describe("GYEOL numerology guides", () => {
  it("ships the approved six-guide roster with distinct metadata and local assets", async () => {
    expect(NUMEROLOGY_GUIDES.map((guide) => guide.id)).toEqual(numerologyGuideIds);
    expect(new Set(NUMEROLOGY_GUIDES.map((guide) => guide.name.ko)).size).toBe(6);
    expect(new Set(NUMEROLOGY_GUIDES.map((guide) => guide.image)).size).toBe(6);

    for (const guide of NUMEROLOGY_GUIDES) {
      expect(guide.role.ko).not.toBe("");
      expect(guide.specialties.ko.length).toBeGreaterThanOrEqual(3);
      expect(guide.focusIds).toContain(guide.primaryFocus);
      expect(guide.image).toMatch(/^\/assets\/gyeol-webtoon\/characters\/[a-z]+\/[a-z]+_result-card_confident_01\.png$/);
      const asset = await stat(`public${guide.image}`);
      expect(asset.size).toBeGreaterThan(40_000);
    }
  });

  it("uses the supplied independent transparent character cuts", async () => {
    const taeryeong = await readFile("public/assets/gyeol-webtoon/characters/taeryeong/taeryeong_result-card_confident_01.png");
    expect(taeryeong.subarray(1, 4).toString()).toBe("PNG");
  });

  it("connects each existing focus to a guide without changing the calculation engine", () => {
    expect(getDefaultNumerologyGuide("relationships").id).toBe("yeonhui");
    expect(getDefaultNumerologyGuide("work").id).toBe("sahyeon");
    expect(getDefaultNumerologyGuide("money").id).toBe("hwayeon");
    expect(getDefaultNumerologyGuide("health").id).toBe("yundo");
    expect(getDefaultNumerologyGuide("growth").id).toBe("hoyeon");
    expect(getDefaultNumerologyGuide("leadership").id).toBe("taeryeong");
  });

  it("uses whole-image responsive rendering for the roster and result", async () => {
    const [css, onboarding, sajuHub] = await Promise.all([
      readFile("src/app/globals.css", "utf8"),
      readFile("src/components/onboarding-experience.tsx", "utf8"),
      readFile("src/components/saju-service-hub.tsx", "utf8"),
    ]);
    expect(css).toContain(".numerology-guide-image-frame");
    expect(css).toContain("aspect-ratio: 1");
    expect(css).toContain("object-fit: contain");
    expect(css).toContain("object-position: center center");
    expect(onboarding).not.toContain("NumerologyGuideRoster");
    expect(sajuHub).toContain("NumerologyGuideRoster");
    expect(sajuHub).toContain('surface="saju"');
  });
});
