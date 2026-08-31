import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

async function sourceFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(path));
    else if (/\.(?:ts|tsx)$/.test(entry.name)) files.push(path);
  }
  return files;
}

function quotedStrings(source: string): string[] {
  return [...source.matchAll(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/gs)]
    .map((match) => match[0]);
}

describe("customer-facing language", () => {
  it("keeps the technology label out of marketing copy while allowing required legal disclosures", async () => {
    const offenders: string[] = [];
    for (const path of [...await sourceFiles("src"), "worker/index.ts"]) {
      if (["src/i18n/legal-copy.ts", "src/components/content-protection-notice.tsx"].includes(path)) continue;
      const source = await readFile(path, "utf8");
      for (const value of quotedStrings(source)) {
        if (/\bAI\b|인공지능/.test(value)) offenders.push(`${path}: ${value.slice(0, 100)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("renders the free-pattern label on its own opaque high-contrast surface", async () => {
    const [home, css] = await Promise.all([
      readFile("src/components/home-experience.tsx", "utf8"),
      readFile("src/app/globals.css", "utf8"),
    ]);
    expect(home).toContain('freeCta: "무료 패턴 보기"');
    expect(home).toContain('className="cinema-cta-secondary cinema-cta-free"');
    expect(home).toContain("<span>{t.freeCta}</span>");
    expect(css).toMatch(/\.cinema-cta-secondary\.cinema-cta-free\s*\{[^}]*background:\s*linear-gradient/s);
    expect(css).toMatch(/\.cinema-cta-secondary\.cinema-cta-free\s*\{[^}]*text-shadow:\s*none/s);
  });
});
