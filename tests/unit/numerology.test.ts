import { describe, expect, it } from "vitest";
import {
  NUMEROLOGY_RULE_VERSION,
  NumerologyInputError,
  calculateAttitudeNumber,
  calculateBirthdayNumber,
  calculateLifePath,
  calculateNameNumbers,
  calculateNumerologyProfile,
  calculatePersonalYear,
  letterValue,
  parseBirthDate,
  reduceNumber,
} from "@/core/numerology";

describe("number reduction", () => {
  it.each([
    [11, 11],
    [22, 22],
    [33, 33],
    [29, 11],
    [38, 11],
    [99, 9],
    [0, 0],
  ])("reduces %i to %i with master preservation", (input, expected) => {
    expect(reduceNumber(input).value).toBe(expected);
  });

  it("rejects negative, fractional, and unsafe totals", () => {
    expect(() => reduceNumber(-1)).toThrow(TypeError);
    expect(() => reduceNumber(1.5)).toThrow(TypeError);
    expect(() => reduceNumber(Number.MAX_SAFE_INTEGER + 1)).toThrow(TypeError);
  });
});

describe("birth-date calculations", () => {
  it("matches the documented 1994-11-04 vector", () => {
    const lifePath = calculateLifePath("1994-11-04");
    expect(lifePath.initialTotal).toBe(29);
    expect(lifePath.value).toBe(11);
    expect(lifePath.steps).toEqual([
      { input: 29, digits: [2, 9], output: 11, masterPreserved: true },
    ]);
    expect(lifePath.ruleVersion).toBe(NUMEROLOGY_RULE_VERSION);
    expect(calculateBirthdayNumber("1994-11-04").value).toBe(4);
    expect(calculateAttitudeNumber("1994-11-04").value).toBe(6);
    expect(calculatePersonalYear("1994-11-04", 2026).value).toBe(7);
  });

  it.each([
    ["1994-11-04", 11],
    ["1980-01-03", 22],
    ["1990-09-05", 33],
  ])("preserves life-path master vector %s", (date, expected) => {
    expect(calculateLifePath(date).value).toBe(expected);
  });

  it("accepts leap day and century boundaries deterministically", () => {
    expect(parseBirthDate("2000-02-29")).toMatchObject({ year: 2000, month: 2, day: 29 });
    expect(parseBirthDate("2024-02-29")).toMatchObject({ year: 2024, month: 2, day: 29 });
    expect(parseBirthDate("0001-01-01")).toMatchObject({ year: 1, month: 1, day: 1 });
    expect(parseBirthDate("9999-12-31")).toMatchObject({ year: 9999, month: 12, day: 31 });
  });

  it.each(["", "1994/11/04", "04-11-1994", "1994-1-4"])(
    "rejects non-ISO input %j",
    (date) => {
      expect(() => parseBirthDate(date)).toThrowError(
        expect.objectContaining({ code: "INVALID_DATE_FORMAT" }),
      );
    },
  );

  it.each(["1900-02-29", "2023-02-29", "2024-13-01", "2024-00-01", "2024-04-31"])(
    "rejects invalid calendar date %s",
    (date) => {
      expect(() => parseBirthDate(date)).toThrowError(
        expect.objectContaining({ code: "INVALID_CALENDAR_DATE" }),
      );
    },
  );

  it("rejects invalid personal-year values", () => {
    expect(() => calculatePersonalYear("1994-11-04", 0)).toThrow(NumerologyInputError);
    expect(() => calculatePersonalYear("1994-11-04", 2026.5)).toThrow(NumerologyInputError);
  });
});

describe("Pythagorean name calculations", () => {
  it.each([
    ["A", 1],
    ["I", 9],
    ["J", 1],
    ["R", 9],
    ["Z", 8],
  ])("maps %s to %i", (letter, value) => {
    expect(letterValue(letter)).toBe(value);
  });

  it("normalizes accents but preserves auditable values", () => {
    const result = calculateNameNumbers("José");
    expect(result.status).toBe("calculated");
    expect(result.normalizedName).toBe("JOSE");
    expect(result.destiny?.value).toBe(4);
    expect(result.soulUrge?.value).toBe(11);
    expect(result.personality?.value).toBe(2);
  });

  it("ignores separators and calculates Latin letters reproducibly", () => {
    const first = calculateNameNumbers("Anne-Marie O'Neil");
    const second = calculateNameNumbers("ANNE MARIE ONEIL");
    expect(first.status).toBe("calculated");
    expect(first.normalizedName).toBe("ANNEMARIEONEIL");
    expect(first.destiny).toEqual(second.destiny);
  });

  it.each(["김민지", "ミンジ", "山田太郎", "✨—"])(
    "does not invent romanization for unsupported name %s",
    (name) => {
      expect(calculateNameNumbers(name)).toMatchObject({
        status: "unavailable",
        reason: "no_supported_letters",
      });
    },
  );

  it("calculates supported letters in a mixed-script name and reports ignored characters", () => {
    const result = calculateNameNumbers("Minji 김");
    expect(result).toMatchObject({ status: "calculated", normalizedName: "MINJI" });
    expect(result.ignoredCharacters).toContain("김");
  });

  it("handles absent and excessive names without throwing", () => {
    expect(calculateNameNumbers("")).toMatchObject({ reason: "not_provided" });
    expect(calculateNameNumbers("a".repeat(201))).toMatchObject({ reason: "too_long" });
  });

  it("keeps Y as a consonant in rule version 1", () => {
    const result = calculateNameNumbers("Y");
    expect(result.soulUrge?.value).toBe(0);
    expect(result.personality?.value).toBe(7);
  });
});

describe("integrated numerology profile", () => {
  it("is deterministic and retains canonical input", () => {
    const input = { birthDate: "1994-11-04", name: "Minji Kim", personalYear: 2026 };
    const one = calculateNumerologyProfile(input);
    const two = calculateNumerologyProfile(input);
    expect(one).toEqual(two);
    expect(one).toMatchObject({
      birthDate: "1994-11-04",
      system: "pythagorean",
      ruleVersion: NUMEROLOGY_RULE_VERSION,
      lifePath: { value: 11 },
    });
  });
});
