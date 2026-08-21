import { describe, expect, it } from "vitest";
import {
  localizeAccessoryDirection,
  numerologyAccessoryDirections,
  sajuAccessoryDirections,
} from "@/core/commerce/accessory-recommendations";

describe("accessory recommendation directions", () => {
  it("covers five Saju phases and three numerology facts with stable unique ids", () => {
    expect(sajuAccessoryDirections).toHaveLength(5);
    expect(numerologyAccessoryDirections).toHaveLength(3);
    const ids = [...sajuAccessoryDirections, ...numerologyAccessoryDirections].map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps Korean and English fields complete without outcome promises", () => {
    const prohibited = /행운|치유|치료|보장|재물운|연애운|guarantee|heal|luck|protect/iu;
    for (const direction of [...sajuAccessoryDirections, ...numerologyAccessoryDirections]) {
      for (const locale of ["ko", "en"] as const) {
        const localized = localizeAccessoryDirection(direction, locale);
        expect(localized.keyLabel.length).toBeGreaterThan(0);
        expect(localized.title.length).toBeGreaterThan(0);
        expect(localized.form.length).toBeGreaterThan(0);
        expect(localized.palette.length).toBeGreaterThan(0);
        expect(localized.material.length).toBeGreaterThan(0);
        expect(localized.use.length).toBeGreaterThan(0);
        expect([localized.title, localized.form, localized.palette, localized.material, localized.use].join(" ")).not.toMatch(prohibited);
      }
    }
  });
});
