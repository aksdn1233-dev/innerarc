import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  socialImageAlt,
  socialImageContentType,
  socialImagePath,
  socialImageSize,
} from "@/app/social-image";
import { BRAND_SEARCH_ALIASES, OFFICIAL_NAVER_BLOG_URL } from "@/core/brand-links";
import { getLocalizedSiteMetadata } from "@/i18n/site-metadata";

describe("site sharing metadata", () => {
  it("provides native, non-predictive Korean and English copy", () => {
    const ko = getLocalizedSiteMetadata("ko");
    const en = getLocalizedSiteMetadata("en");
    const combined = [ko.title, ko.description, en.title, en.description].join(" ");

    expect(ko.title).toContain("태령당");
    expect(ko.title).not.toContain("수비학");
    expect(en.title).toContain("Personal Pattern Intelligence");
    expect(en.title).toContain("태령당");

    // This copy is read by someone who has not arrived yet — in a search result, a link
    // preview, a tab. It used to name the machinery ("상징 분석을 가설로 제시", "Reality
    // Check"), which is accurate and means nothing to a person who typed 연애운 into a
    // search box. So: the areas people actually search, in their words, and no vocabulary
    // that has to be explained before it helps.
    for (const areas of [/연애/, /돈|재물/, /일|진로/, /공부|학업|시험/]) {
      expect(ko.description).toMatch(areas);
    }
    expect(ko.description).toMatch(/무료/);
    expect(ko.description).not.toMatch(/Reality Check|시스템|가설|결정론|상징 분석/);
    // Long enough to say something, short enough that the point survives a snippet.
    expect(ko.description.length).toBeGreaterThan(40);
    expect(ko.description.length).toBeLessThan(160);
    expect(ko.description.slice(0, 45)).toMatch(/연애/);
    expect(ko.openGraphLocale).toBe("ko_KR");
    expect(en.openGraphLocale).toBe("en_US");
    expect(combined).not.toMatch(/타로·신점|premium tarot/i);
    expect(combined).not.toMatch(/정확도|정확히 예측|반드시|보장|accuracy|predicts? exactly|guaranteed/i);
  });

  it("keeps the legacy search aliases while connecting the 태령당 official blog", async () => {
    expect(BRAND_SEARCH_ALIASES).toContain("태령당");
    expect(BRAND_SEARCH_ALIASES).toContain("MY GYEOL");
    expect(OFFICIAL_NAVER_BLOG_URL).toBe("https://blog.naver.com/qkrehgus5886");

    const localeLayout = await readFile(join("src", "app", "[locale]", "layout.tsx"), "utf8");
    const homeExperience = await readFile(join("src", "components", "home-experience.tsx"), "utf8");

    expect(localeLayout).toContain("sameAs: [OFFICIAL_NAVER_BLOG_URL]");
    expect(localeLayout).toContain("alternateName: BRAND_SEARCH_ALIASES");
    expect(homeExperience).toContain("태령당 공식 블로그");
  });

  it("ships one bounded first-party PNG with explicit accessible metadata", async () => {
    // The card is served straight from the static asset host, so the shipped file
    // itself is what link-preview crawlers receive. No route handler is involved.
    expect(socialImagePath).toBe("/taeryeongdang-og.png");
    expect(socialImageContentType).toBe("image/png");

    const bytes = new Uint8Array(await readFile(join("public", socialImagePath)));

    expect(bytes.byteLength).toBeLessThan(5 * 1024 * 1024);
    expect(bytes[0]).toBe(0x89);
    expect(String.fromCharCode(...bytes.slice(1, 4))).toBe("PNG");
    expect(new DataView(bytes.buffer).getUint32(16)).toBe(socialImageSize.width);
    expect(new DataView(bytes.buffer).getUint32(20)).toBe(socialImageSize.height);
    expect(socialImageAlt).toContain("태령당");
  });
});
