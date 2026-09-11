import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  getWebtoonCharacterImageSources,
  RESTORED_WEBTOON_CHARACTER_ASSETS,
} from "@/components/webtoon";

function webpMetadata(path: string): { hasAlpha: boolean; height: number; width: number } {
  const bytes = readFileSync(path);
  const chunk = bytes.indexOf(Buffer.from("VP8X"));
  if (chunk < 0) throw new Error(`VP8X header missing: ${path}`);
  const read24 = (offset: number) => bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
  return {
    hasAlpha: (bytes[chunk + 8] & 0x10) !== 0,
    width: read24(chunk + 12) + 1,
    height: read24(chunk + 15) + 1,
  };
}

describe("restored webtoon character density", () => {
  it("serves authored 1x, 2x and 3x sources for a restored Saju character", () => {
    const path = "/assets/gyeol-webtoon/characters/sahyeon/sahyeon_assure_confident_01.png";
    expect(getWebtoonCharacterImageSources(path)).toEqual({
      src: path,
      srcSet: `${path} 1x, /assets/gyeol-webtoon/characters/sahyeon/sahyeon_assure_confident_01-hd-v2-2x.webp 2x, /assets/gyeol-webtoon/characters/sahyeon/sahyeon_assure_confident_01-hd-v2-3x.webp 3x`,
    });
  });

  it("keeps an original-only asset free of fake density claims", () => {
    const path = "/assets/gyeol-webtoon/characters/yundo/yundo_smile_warm_01.png";
    expect(getWebtoonCharacterImageSources(path)).toEqual({ src: path });
  });

  it("ships every restored pose as transparent 768px and 1254px canvases", () => {
    expect(RESTORED_WEBTOON_CHARACTER_ASSETS).toHaveLength(11);
    for (const asset of RESTORED_WEBTOON_CHARACTER_ASSETS) {
      const base = `${process.cwd()}/public/assets/gyeol-webtoon/characters/${asset.replace(/\.png$/, "-hd-v2")}`;
      expect(webpMetadata(`${base}-2x.webp`), asset).toEqual({ hasAlpha: true, width: 768, height: 768 });
      expect(webpMetadata(`${base}-3x.webp`), asset).toEqual({ hasAlpha: true, width: 1254, height: 1254 });
    }
  });
});
