import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  socialImageAlt,
  socialImageContentType,
  socialImagePath,
  socialImageSize,
} from "@/app/social-image";
import { getLocalizedSiteMetadata } from "@/i18n/site-metadata";

describe("site sharing metadata", () => {
  it("provides native, non-predictive Korean and English copy", () => {
    const ko = getLocalizedSiteMetadata("ko");
    const en = getLocalizedSiteMetadata("en");
    const combined = [ko.title, ko.description, en.title, en.description].join(" ");

    expect(ko.title).toContain("나·관계·올해의 흐름");
    expect(en.title).toContain("Self, Relationships & Yearly Flow");
    expect(ko.openGraphLocale).toBe("ko_KR");
    expect(en.openGraphLocale).toBe("en_US");
    expect(combined).not.toMatch(/타로·신점|수비학|premium tarot/i);
    expect(combined).not.toMatch(/정확도|정확히 예측|반드시|보장|accuracy|predicts? exactly|guaranteed/i);
  });

  it("ships one bounded first-party PNG with explicit accessible metadata", async () => {
    // The card is served straight from the static asset host, so the shipped file
    // itself is what link-preview crawlers receive. No route handler is involved.
    expect(socialImagePath).toBe("/gyeol-og.png");
    expect(socialImageContentType).toBe("image/png");

    const bytes = new Uint8Array(await readFile(join("public", socialImagePath)));

    expect(bytes.byteLength).toBeLessThan(5 * 1024 * 1024);
    expect(bytes[0]).toBe(0x89);
    expect(String.fromCharCode(...bytes.slice(1, 4))).toBe("PNG");
    expect(new DataView(bytes.buffer).getUint32(16)).toBe(socialImageSize.width);
    expect(new DataView(bytes.buffer).getUint32(20)).toBe(socialImageSize.height);
    expect(socialImageAlt).toContain("GYEOL");
  });
});
