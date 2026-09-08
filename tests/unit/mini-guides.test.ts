import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  getMiniGuideAsset,
  MINI_GUIDE_ASSETS,
  MINI_GUIDE_ASSET_VERSION,
  MINI_GUIDE_CHARACTER_IDS,
} from "@/core/mini-guides";
import { buildSpaceGuideNarration, SPACE_GUIDE_NARRATION_VERSION } from "@/core/space/narration";
import { analyzeSpace } from "@/core/space/engine";
import { spaceExample } from "@/core/space/examples";

describe("production miniature guide assets", () => {
  it("keeps native RGBA masters large enough for high-DPI runtime display", async () => {
    const manifest = JSON.parse(await readFile("public/assets/mini-guides/manifest.json", "utf8"));
    expect(manifest.version).toBe(MINI_GUIDE_ASSET_VERSION);
    expect(manifest.assets).toHaveLength(Object.keys(MINI_GUIDE_ASSETS).length);
    expect(new Set(manifest.assets.map((asset: { characterId: string }) => asset.characterId))).toEqual(
      new Set(MINI_GUIDE_CHARACTER_IDS),
    );
    for (const asset of Object.values(MINI_GUIDE_ASSETS)) {
      const png = await readFile(`public${asset.path}`);
      expect(png.subarray(1, 4).toString()).toBe("PNG");
      expect(png.readUInt32BE(16)).toBe(asset.width);
      expect(png.readUInt32BE(20)).toBe(asset.height);
      expect(png[25]).toBe(6); // PNG truecolour with alpha
      expect(asset.width).toBeGreaterThanOrEqual(asset.safeCssWidth * 3);
      expect(asset.path).toMatch(/^\/assets\/mini-guides\/[a-z-]+\/[a-z0-9_-]+\.png$/);
    }
  });

  it("uses the canonical lead guide when an optional runtime variant is missing", () => {
    expect(getMiniGuideAsset("unknown-guide")).toBe(MINI_GUIDE_ASSETS.taeryeongWelcome);
    expect(getMiniGuideAsset("yundo")).toBe(MINI_GUIDE_ASSETS.yundoSpaceExplain);
  });

  it("builds narration only from a validated recommendation and its real object anchor", () => {
    const example = spaceExample("small_bedroom");
    const scene = { ...example, confirmed: true, orientation: { ...example.orientation, confirmed: true } };
    const analysis = analyzeSpace(scene, "rest", "en");
    const recommendation = analysis.recommendations.find(item => item.action.objectId) ?? analysis.recommendations[0];
    const guide = buildSpaceGuideNarration(recommendation, analysis.current, "Bed", "en");
    expect(guide.templateId).toContain(SPACE_GUIDE_NARRATION_VERSION);
    expect(guide.objectId).toBe(recommendation.action.objectId);
    expect(guide.detail).toBe(recommendation.rationale);
    expect(guide.caption.length).toBeLessThan(240);
  });
});
