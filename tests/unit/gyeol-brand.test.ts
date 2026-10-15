import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { brand, brandInternalId, brandNameForLocale, brandNameKo } from "@/core/brand";

describe("결 brand", () => {
  it("centralizes the approved public mark without exposing the internal identifier", () => {
    expect(brandNameKo).toBe("결");
    expect(brandNameForLocale("ko")).toBe("결");
    expect(brandNameForLocale("en")).toBe("결");
    expect(brand.currentProductionOrigin).toBe("https://mygyeol.kr");
    expect(brand.legacySearchAliases).toContain("MY GYEOL");
    expect(brandInternalId).toBe("GYEOL_INTERNAL");
  });

  it("names 결 on the primary customer surfaces and leaves no trace of the retired mark", async () => {
    const [layout, home, metadata, report] = await Promise.all([
      readFile("src/app/layout.tsx", "utf8"),
      readFile("src/components/home-experience.tsx", "utf8"),
      readFile("src/i18n/site-metadata.ts", "utf8"),
      readFile("src/app/[locale]/reports/[orderId]/page.tsx", "utf8"),
    ]);
    const primary = [layout, home, metadata, report].join("\n");
    expect(primary).not.toMatch(/태령|Taeryeong/i);
    // The page's own heading, which is what a crawler and a screen reader read first: it
    // carries the brand and says the areas rather than posing a riddle about 결.
    const heroTitle = /heroTitle: "(.*?)",/.exec(home)?.[1] ?? "";
    expect(heroTitle).toContain("결");
    expect(heroTitle).toMatch(/연애/);
  });
});
