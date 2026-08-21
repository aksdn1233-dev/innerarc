import { describe, expect, it } from "vitest";
import {
  localizeAccessoryDirection,
  numerologyAccessoryDirections,
  sajuAccessoryDirections,
} from "@/core/commerce/accessory-recommendations";
import { shopCopy } from "@/i18n/shop-copy";

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
        expect(localized.imageAlt.length).toBeGreaterThan(0);
        expect(localized.priceRange).toMatch(/\d/);
        expect(direction.imageSrc).toMatch(/^\/images\/accessory-shop\/[a-z-]+\.jpg$/);
        expect([localized.title, localized.form, localized.palette, localized.material, localized.use].join(" ")).not.toMatch(prohibited);
      }
    }
  });

  it("assigns one pre-generated concept board to every result family", () => {
    const images = [...sajuAccessoryDirections, ...numerologyAccessoryDirections].map(({ imageSrc }) => imageSrc);
    expect(new Set(images).size).toBe(8);
  });

  it("discloses made-to-order stock, collect shipping, and lawful return boundaries", () => {
    expect(shopCopy.ko.stockValue).toContain("1:1 주문 제작");
    expect(shopCopy.ko.shippingValue).toContain("착불");
    expect(shopCopy.ko.returnValue).toContain("단순 변심");
    expect(shopCopy.ko.returnValue).toContain("하자·오배송");
    expect(shopCopy.ko.returnValue).not.toBe("반품 불가");
    expect(shopCopy.ko.conceptNote).toContain("실제 판매품 사진이 아닙니다");
  });
});
