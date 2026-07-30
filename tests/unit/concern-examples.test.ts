import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { locales } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";

// The concern example is what tells a visitor "this service understands my question".
// A relationship prompt shown to someone who picked 돈 reads as the opposite, so the
// five selectable areas must each have their own example in each language.
const FOCUS_IDS = ["work", "relationships", "health", "growth", "money"] as const;

const source = await readFile("src/components/home-experience.tsx", "utf8");

function examplesFor(locale: (typeof locales)[number]): Record<string, string> {
  const block = source.match(
    new RegExp(`\\b${locale}:\\s*\\{([\\s\\S]*?)\\n  \\},`),
  );
  if (!block) throw new Error(`no concernExamples block for ${locale}`);
  const found: Record<string, string> = {};
  for (const focus of FOCUS_IDS) {
    const line = block[1].match(new RegExp(`${focus}:\\s*"([^"]+)"`));
    if (line) found[focus] = line[1];
  }
  return found;
}

describe("concern examples follow the selected area", () => {
  it("offers a distinct example for every selectable area in both languages", () => {
    for (const locale of locales) {
      const examples = examplesFor(locale);

      expect(Object.keys(examples).sort()).toEqual([...FOCUS_IDS].sort());
      expect(new Set(Object.values(examples)).size).toBe(FOCUS_IDS.length);
      for (const text of Object.values(examples)) {
        expect(text.length).toBeGreaterThan(15);
      }
    }
  });

  it("covers exactly the areas the form actually shows", () => {
    for (const locale of locales) {
      // The paid form renders the first five dictionary interests.
      const shown = dictionaries[locale].interests.slice(0, 5).map((option) => option.value);
      expect([...shown].sort()).toEqual([...FOCUS_IDS].sort());
    }
  });

  it("keeps each example anchored to its own area", () => {
    const ko = examplesFor("ko");
    expect(ko.money).toMatch(/돈|목돈|지출|금전/);
    expect(ko.work).toMatch(/회사|직장|이직|진로|일/);
    expect(ko.relationships).toMatch(/사람|관계|연애/);
    expect(ko.health).toMatch(/건강|생활|리듬|습관/);
    expect(ko.growth).toMatch(/제자리|바꿔|성장|변화/);
  });
});
