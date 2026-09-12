import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { roomMiniatureGuide, SPACE_MINIATURE_ASSET_VERSION, SPACE_MINIATURE_GUIDES } from "@/core/space/miniature-guides";

describe("Feng Shui miniature guides", () => {
  it("ships the four storyboard beats with canonical characters and localized lines", async () => {
    const manifest = JSON.parse(await readFile("public/assets/space-miniatures/manifest.json", "utf8"));
    expect(manifest.version).toBe(SPACE_MINIATURE_ASSET_VERSION);
    expect(Object.keys(SPACE_MINIATURE_GUIDES)).toEqual(["photo", "direction", "objects", "compare"]);
    expect(manifest.assets.map((asset: { characterId: string }) => asset.characterId)).toEqual(["yundo", "hoyeon", "sahyeon", "taeryeong"]);
    for (const guide of Object.values(SPACE_MINIATURE_GUIDES)) {
      expect(guide.line.ko.length).toBeGreaterThan(10);
      expect(guide.line.en.length).toBeGreaterThan(10);
      expect(guide.path).toMatch(/^\/assets\/space-miniatures\/[a-z0-9-]+\.webp$/);
      expect(guide.sourcePath).toMatch(/^\/assets\/space-miniatures\/[a-z0-9-]+\.png$/);
    }
  });

  it("uses native 1254px PNGs with a real alpha channel", async () => {
    for (const guide of Object.values(SPACE_MINIATURE_GUIDES)) {
      const png = await readFile(`public${guide.sourcePath}`);
      expect(png.readUInt32BE(16)).toBe(1254);
      expect(png.readUInt32BE(20)).toBe(1254);
      expect(png[25]).toBe(6);
      const runtime = await readFile(`public${guide.path}`);
      expect(runtime.subarray(0, 4).toString()).toBe("RIFF");
      expect(runtime.subarray(8, 12).toString()).toBe("WEBP");
    }
  });

  it("changes the room companion with the comparison state", () => {
    expect(roomMiniatureGuide("current").characterId).toBe("yundo");
    expect(roomMiniatureGuide("compare").characterId).toBe("sahyeon");
    expect(roomMiniatureGuide("recommended").characterId).toBe("taeryeong");
  });
});
