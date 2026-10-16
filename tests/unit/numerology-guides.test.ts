import { stat } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { NUMEROLOGY_GUIDES, getNumerologyGuide, getDefaultNumerologyGuide, numerologyGuideIds } from "@/core/numerology-guides";

describe("current reading host", () => {
  it("publishes only Harang with an authored high-density local image", async () => {
    expect(numerologyGuideIds).toEqual(["harang"]);
    expect(NUMEROLOGY_GUIDES.map(guide => guide.id)).toEqual(numerologyGuideIds);
    const guide = NUMEROLOGY_GUIDES[0];
    expect(guide.name.ko).toBe("하랑 법사");
    expect(guide.image).toContain("-hd-v2-3x.webp");
    expect((await stat(`public${guide.image}`)).size).toBeGreaterThan(40_000);
    expect(guide.specialties.ko.length).toBeGreaterThanOrEqual(3);
  });

  it("keeps every existing focus available through the same host", () => {
    for (const focus of ["relationships", "work", "money", "health", "growth", "leadership"] as const) {
      expect(getDefaultNumerologyGuide(focus).id).toBe("harang");
      expect(getDefaultNumerologyGuide(focus).focusIds).toContain(focus);
    }
  });

  it("resolves historical optional guide values without reviving retired art", () => {
    expect(getNumerologyGuide("yundo")).toBe(getNumerologyGuide("harang"));
    expect(getNumerologyGuide("unknown")).toBe(getNumerologyGuide("harang"));
  });
});
