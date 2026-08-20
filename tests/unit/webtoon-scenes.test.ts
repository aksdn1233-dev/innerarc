import { stat } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { calculateNumerologyProfile } from "@/core/numerology";
import {
  getWebtoonManifest,
  selectWebtoonScene,
  selectWebtoonSequence,
  WEBTOON_ASSET_ROOT,
} from "@/core/webtoon-scenes";

describe("GYEOL webtoon scene selector", () => {
  it("is deterministic and maps the six product themes to the approved guides", () => {
    const input = { seed: "1994-11-04:11:summary", theme: "core", emphasis: "medium" } as const;
    expect(selectWebtoonScene(input)).toEqual(selectWebtoonScene(input));
    expect(selectWebtoonScene(input).character).toBe("taeryeong");
    expect(selectWebtoonScene({ seed: "relationship", theme: "relationship" }).character).toBe("yeonhui");
    expect(selectWebtoonScene({ seed: "analysis", theme: "analysis" }).character).toBe("sahyeon");
    expect(selectWebtoonScene({ seed: "warning", theme: "warning" }).character).toBe("hwayeon");
    expect(selectWebtoonScene({ seed: "healing", theme: "healing" }).character).toBe("yundo");
    expect(selectWebtoonScene({ seed: "possibility", theme: "possibility" }).character).toBe("hoyeon");
  });

  it("falls back by section and emotion, then to Taeryeong", () => {
    expect(selectWebtoonScene({ seed: "x", theme: "unknown", sectionType: "warning" }).character).toBe("hwayeon");
    expect(selectWebtoonScene({ seed: "x", theme: "unknown", emotion: "gentle" }).character).toBe("yundo");
    expect(selectWebtoonScene({ seed: "x" }).character).toBe("taeryeong");
  });

  it("avoids repeating the same character, pose, and expression across recent panels", () => {
    const first = selectWebtoonScene({ seed: "same", theme: "core", emphasis: "medium" });
    const second = selectWebtoonScene({ seed: "same", theme: "core", emphasis: "medium" }, [first]);
    expect(`${second.character}:${second.pose}:${second.expression}`).not.toBe(
      `${first.character}:${first.pose}:${first.expression}`,
    );
  });

  it("keeps the 1994-11-04 calculation byte-for-byte unchanged", () => {
    const before = calculateNumerologyProfile({ birthDate: "1994-11-04", personalYear: 2026 });
    selectWebtoonSequence([
      { seed: "1994-11-04:summary", theme: "core" },
      { seed: "1994-11-04:numbers", theme: "analysis" },
    ]);
    const after = calculateNumerologyProfile({ birthDate: "1994-11-04", personalYear: 2026 });
    expect(after).toEqual(before);
    expect(after.lifePath.value).toBe(11);
    expect(after.birthday.value).toBe(4);
    expect(after.attitude.value).toBe(6);
  });

  it("has unique manifest assets and every returned local path exists", async () => {
    const manifest = getWebtoonManifest();
    const seen = new Set<string>();
    for (const [id, character] of Object.entries(manifest.characters)) {
      expect(character.assets).toHaveLength(32);
      for (const asset of character.assets) {
        expect(asset.file).toMatch(new RegExp(`^${id}_[a-z0-9-]+_[a-z0-9-]+_01\\.png$`));
        const path = `${WEBTOON_ASSET_ROOT}/characters/${id}/${asset.file}`;
        expect(seen.has(path)).toBe(false);
        seen.add(path);
        expect((await stat(`public${path}`)).size).toBeGreaterThan(40_000);
      }
    }
    expect(seen.size).toBe(192);

    const scenes = ["core", "relationship", "analysis", "warning", "healing", "possibility"]
      .map((theme) => selectWebtoonScene({ seed: theme, theme }));
    for (const scene of scenes) {
      for (const path of [scene.assetPath, scene.backgroundPath, scene.propPath, scene.effectPath]) {
        expect(path).toBeTruthy();
        expect((await stat(`public${path}`)).size).toBeGreaterThan(40_000);
      }
    }
  });

  it("keeps redesigned Yundo and Hoyeon metadata free of the rejected traits", () => {
    const manifest = getWebtoonManifest();
    for (const id of ["yundo", "hoyeon"] as const) {
      const serialized = JSON.stringify(manifest.characters[id]).toLowerCase();
      expect(serialized).not.toContain("glasses");
      expect(serialized).not.toContain("long-hair");
    }
  });
});
