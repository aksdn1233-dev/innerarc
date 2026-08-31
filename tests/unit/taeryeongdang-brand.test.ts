import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { brand, brandInternalId, brandNameForLocale, brandNameKo } from "@/core/brand";

describe("태령당 brand migration", () => {
  it("centralizes the approved public mark without exposing the internal identifier", () => {
    expect(brandNameKo).toBe("태령당");
    expect(brandNameForLocale("ko")).toBe("태령당");
    expect(brandNameForLocale("en")).toBe("태령당");
    expect(brand.currentProductionOrigin).toBe("https://mygyeol.kr");
    expect(brand.legacySearchAliases).toContain("MY GYEOL");
    expect(brandInternalId).toBe("TAERYEONGDANG_INTERNAL");
  });

  it("migrates primary customer surfaces while retaining ordinary Korean uses of 결", async () => {
    const [layout, home, metadata, report] = await Promise.all([
      readFile("src/app/layout.tsx", "utf8"),
      readFile("src/components/home-experience.tsx", "utf8"),
      readFile("src/i18n/site-metadata.ts", "utf8"),
      readFile("src/app/[locale]/reports/[orderId]/page.tsx", "utf8"),
    ]);
    const primary = [layout, home, metadata, report].join("\n");
    expect(primary).toContain("태령당");
    expect(primary).not.toMatch(/결 GYEOL|MY GYEOL 공식 블로그/);
    expect(home).toContain("나의 결은 어떤 특징과 장점을 가지고 있을까요?");
  });
});
