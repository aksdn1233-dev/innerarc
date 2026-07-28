import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { particle, withParticle } from "@/core/korean-particles";

describe("korean particles", () => {
  it("picks the particle from the final consonant of the word", () => {
    // 성장 ends in ㅇ, 구조 ends in a vowel.
    expect(withParticle("성장", "object")).toBe("성장을");
    expect(withParticle("구조", "object")).toBe("구조를");
    expect(withParticle("받아들이기", "topic")).toBe("받아들이기는");
    expect(withParticle("사람", "topic")).toBe("사람은");
    expect(withParticle("감각", "subject")).toBe("감각이");
    expect(withParticle("태도", "subject")).toBe("태도가");
    expect(withParticle("힘", "with")).toBe("힘과");
    expect(withParticle("감각", "with")).toBe("감각과");
    expect(withParticle("에너지", "with")).toBe("에너지와");
  });

  it("treats ㄹ like a vowel ending for 으로/로", () => {
    expect(withParticle("서울", "by")).toBe("서울로");
    expect(withParticle("구조", "by")).toBe("구조로");
    expect(withParticle("직관", "by")).toBe("직관으로");
  });

  it("uses the last syllable of a phrase, not the first", () => {
    expect(particle("질서와 신뢰 가능한 구조", "object")).toBe("를");
    expect(particle("자율성과 시작", "object")).toBe("을");
    expect(particle("돌봄과 공동 성장", "object")).toBe("을");
  });

  it("does not throw on non-Hangul or empty input", () => {
    expect(() => withParticle("", "object")).not.toThrow();
    expect(() => withParticle("Growth", "object")).not.toThrow();
    expect(() => withParticle("11", "topic")).not.toThrow();
  });

  it("leaves no Korean copy attaching a fixed particle straight to a value", async () => {
    // Guards the whole rule-based copy surface, not just the sentences fixed once.
    const offenders: string[] = [];
    async function scan(directory: string) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
          await scan(path);
        } else if (/\.tsx?$/.test(entry.name)) {
          const source = await readFile(path, "utf8");
          for (const [match] of source.matchAll(
            /\$\{[^}]{1,80}\}(을|를|은|는|이|가|와|과|으로)(?=[\s,.])/g,
          )) {
            offenders.push(`${path}: ${match.trim()}`);
          }
        }
      }
    }
    await scan("src");

    expect(offenders).toEqual([]);
  });
});
