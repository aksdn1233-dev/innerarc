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
      expect(guide.image).toMatch(/^\/images\/numerology-guides\/gyeol-[a-z]+\.jpg$/);
      const asset = await stat(`public${guide.image}`);
      expect(asset.size).toBeGreaterThan(40_000);
    }
  });

  it("keeps the supplied Taeryeong reference art byte-for-byte", async () => {
    const [reference, rosterAsset] = await Promise.all([
      readFile("public/images/taeyul-hero.jpg"),
      readFile("public/images/numerology-guides/gyeol-taeryeong.jpg"),
    ]);
    expect(rosterAsset.equals(reference)).toBe(true);
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
    const [css, onboarding] = await Promise.all([
      readFile("src/app/globals.css", "utf8"),
      readFile("src/components/onboarding-experience.tsx", "utf8"),
    ]);
    expect(css).toContain(".numerology-guide-image-frame");
    expect(css).toContain("aspect-ratio: 2 / 3");
    expect(css).toContain("object-fit: contain");
    expect(css).toContain("object-position: center center");
    expect(onboarding).toContain('routeName === "numerology"');
    expect(onboarding).toContain("getDefaultNumerologyGuide");
  });
});

