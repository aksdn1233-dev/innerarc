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
  it("is deterministic and maps every product theme to the current host", () => {
    const input = { seed: "1994-11-04:11:summary", theme: "core", emphasis: "medium" } as const;
    expect(selectWebtoonScene(input)).toEqual(selectWebtoonScene(input));
    expect(selectWebtoonScene(input).character).toBe("harang");
    expect(selectWebtoonScene({ seed: "relationship", theme: "relationship" }).character).toBe("harang");
    expect(selectWebtoonScene({ seed: "analysis", theme: "analysis" }).character).toBe("harang");
    expect(selectWebtoonScene({ seed: "warning", theme: "warning" }).character).toBe("harang");
    expect(selectWebtoonScene({ seed: "healing", theme: "healing" }).character).toBe("harang");
    expect(selectWebtoonScene({ seed: "possibility", theme: "possibility" }).character).toBe("harang");
  });

  it("falls back by section and emotion, then to Harang", () => {
    expect(selectWebtoonScene({ seed: "x", theme: "unknown", sectionType: "warning" }).character).toBe("harang");
    expect(selectWebtoonScene({ seed: "x", theme: "unknown", emotion: "gentle" }).character).toBe("harang");
    expect(selectWebtoonScene({ seed: "x" }).character).toBe("harang");
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
      expect(character.assets).toHaveLength(3);
      for (const asset of character.assets) {
        expect(asset.file).toMatch(new RegExp(`^${id}_[a-z0-9-]+_[a-z0-9-]+_01\\.png$`));
        const path = `${WEBTOON_ASSET_ROOT}/characters/${id}/${asset.file}`;
        expect(seen.has(path)).toBe(false);
        seen.add(path);
        expect((await stat(`public${path}`)).size).toBeGreaterThan(40_000);
      }
    }
    expect(seen.size).toBe(3);

    const scenes = ["core", "relationship", "analysis", "warning", "healing", "possibility"]
      .map((theme) => selectWebtoonScene({ seed: theme, theme }));
    for (const scene of scenes) {
      for (const path of [scene.assetPath, scene.backgroundPath, scene.propPath, scene.effectPath]) {
        expect(path).toBeTruthy();
        expect((await stat(`public${path}`)).size).toBeGreaterThan(40_000);
      }
    }
  });

  it("exposes only the current host in its public manifest", () => {
    expect(Object.keys(getWebtoonManifest().characters)).toEqual(["harang"]);
  });
});
