import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { celebrityCopy } from "@/i18n/celebrity-copy";
import { compatibilityCopy } from "@/i18n/compatibility-copy";
import { dictionaries } from "@/i18n/dictionaries";
import { relationshipCopy } from "@/i18n/relationship-copy";

const paidIntake = await readFile("src/components/home-experience.tsx", "utf8");

describe("birth-date calendar copy", () => {
  it("makes the solar/Gregorian calendar requirement explicit in every birth-date input", () => {
    expect(dictionaries.ko.birthDate).toContain("양력");
    expect(dictionaries.en.birthDate).toContain("Gregorian");
    expect(relationshipCopy.ko.birthDate).toContain("양력");
    expect(relationshipCopy.en.birthDate).toContain("Gregorian");
    expect(compatibilityCopy.ko.birthDate).toContain("양력");
    expect(compatibilityCopy.en.birthDate).toContain("Gregorian");
    expect(celebrityCopy.ko.birthDate).toContain("양력");
    expect(celebrityCopy.en.birthDate).toContain("Gregorian");
  });

  it("labels the paid report intake as solar/Gregorian in both languages", () => {
    expect(paidIntake).toContain("생년월일 (필수 · 양력)");
    expect(paidIntake).toContain("달력에서 선택해 주세요");
    expect(paidIntake).toContain("Birth date (Required · Gregorian)");
    expect(paidIntake).toContain("Choose from the calendar");
  });
});
