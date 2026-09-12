import { describe, expect, it } from "vitest";
import { describeNumerologyNumber, type NumerologyNumberKind } from "@/core/numerology-explanations";

const kinds: NumerologyNumberKind[] = ["lifePath", "birthday", "attitude", "personalYear"];
const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

describe("numerology number explanations", () => {
  it.each(["ko", "en"] as const)("gives every displayed number a concise %s explanation", (locale) => {
    for (const kind of kinds) {
      for (const value of values) {
        const explanation = describeNumerologyNumber(kind, value, locale);
        expect(explanation.role).toBeTruthy();
        expect(explanation.theme).toBeTruthy();
        expect(explanation.short).toContain(" · ");
        expect(explanation.short.length).toBeLessThan(100);
      }
    }
  });

  it("keeps explanations reflective instead of certain", () => {
    const copy = kinds.flatMap((kind) => values.map((value) => (
      describeNumerologyNumber(kind, value, "ko").short
    ))).join(" ");
    expect(copy).not.toMatch(/반드시|보장|100%|예언|진단/);
  });
});
