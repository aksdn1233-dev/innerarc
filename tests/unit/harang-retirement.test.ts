import { readdir, readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { getWebtoonManifest, selectWebtoonScene } from "@/core/webtoon-scenes";

describe("retired character boundary", () => {
  it("does not publish the retired character files", async () => {
    const files = await readdir("public", { recursive: true });
    expect(files.filter(file => /taeyul|taeryeong|yeonhui|sahyeon|hwayeon|yundo|hoyeon|siuryeong/i.test(file))).toEqual([]);
    expect(files.some(file => file.startsWith("images/guide/"))).toBe(false);
  });
  it("uses Harang on every report section and exposes only the new host", () => {
    expect(Object.keys(getWebtoonManifest().characters)).toEqual(["harang"]);
    for (const sectionType of ["summary", "numbers", "relationship", "decision", "warning", "balance", "encouragement"] as const) {
      const scene = selectWebtoonScene({ seed: "retirement", sectionType });
      expect(scene.character).toBe("harang");
      expect(scene.assetPath).toContain("/characters/harang/");
    }
  });
  it("does not revive an old narrator through the main entry or paid report", async () => {
    for (const file of ["src/components/onboarding-experience.tsx", "src/components/home-experience.tsx", "src/components/detail-editorial-report.tsx", "src/components/japanese-report-sample.tsx"]) {
      expect(await readFile(file, "utf8")).not.toMatch(/taeyul|taeryeong|night-hero-v3|\/images\/guide\//i);
    }
  });
});
