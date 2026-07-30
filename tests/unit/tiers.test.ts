import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TIER_META, tierBadgeLabel } from "@/core/tiers";
import { createPaidReport } from "@/server/reports/paid-report";
import { pickSharpInsights } from "@/core/profile/sharp-insights";

describe("tier pricing is centralized and correct", () => {
  it("has exactly the three correct prices, nowhere else defined", () => {
    expect(TIER_META.plus_30d.defaultPriceKrw).toBe(19_000);
    expect(TIER_META.pro_30d.defaultPriceKrw).toBe(39_000);
    expect(TIER_META.premium_pdf.defaultPriceKrw).toBe(79_000);
  });

  it("never contains a stray 17,000 price anywhere in source", async () => {
    const offenders: string[] = [];
    async function scan(directory: string) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
          await scan(path);
        } else if (/\.(tsx?|json|md)$/.test(entry.name)) {
          const source = await readFile(path, "utf8");
          if (/17[,_]?000/.test(source)) offenders.push(path);
        }
      }
    }
    await scan("src");
    expect(offenders).toEqual([]);
  }, 15_000);

  it("renders a visible tier badge with the correct price", () => {
    expect(tierBadgeLabel("plus_30d", "ko")).toBe("핵심 리딩 · 19,000원");
    expect(tierBadgeLabel("pro_30d", "ko")).toBe("상세 리딩 · 39,000원");
    expect(tierBadgeLabel("premium_pdf", "ko")).toBe("프리미엄 심층 리딩 · 79,000원");
  });

  it("attaches the tier badge and character label to every generated report", () => {
    const base = {
      version: 1 as const,
      locale: "ko" as const,
      birthDate: "1990-05-14",
      name: "테스트",
      focusId: "growth" as const,
      concern: "요즘 방향을 잘 모르겠어요",
      createdAt: "2026-07-30T10:00:00.000Z",
    };
    for (const productCode of ["plus_30d", "pro_30d", "premium_pdf"] as const) {
      const report = createPaidReport(`iatier${productCode}`, { ...base, productCode });
      expect(report.tierLabel, productCode).toContain(String(TIER_META[productCode].defaultPriceKrw).replace(/(\d)(?=(\d{3})+$)/g, "$1,"));
      expect(report.characterLabel, productCode).toBeTruthy();
      expect(report.contentVersion, productCode).toBeTruthy();
    }
  });
});

describe("sharp insight sentences meet the per-tier minimum", () => {
  it("gives every tier at least its required count, growing without repetition", () => {
    const minimums = { plus_30d: 2, pro_30d: 5, premium_pdf: 8 } as const;
    for (const [productCode, min] of Object.entries(minimums) as [keyof typeof minimums, number][]) {
      const report = createPaidReport(`iasharp${productCode}`, {
        version: 1,
        locale: "ko",
        productCode,
        birthDate: "1988-07-19",
        name: "테스트",
        focusId: "work",
        concern: "이직해도 될까요",
        createdAt: "2026-07-30T10:00:00.000Z",
      });
      expect(report.sharpInsights!.length, productCode).toBeGreaterThanOrEqual(min);
      expect(new Set(report.sharpInsights).size, productCode).toBe(report.sharpInsights!.length);
    }
  });

  it("gives every one of the twelve life-path numbers a full set of eight, with no duplicates", () => {
    for (const lifePath of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]) {
      const insights = pickSharpInsights(lifePath, 8, "ko");
      expect(insights.length, String(lifePath)).toBe(8);
      expect(new Set(insights).size, String(lifePath)).toBe(8);
      for (const sentence of insights) {
        expect(sentence.length, `${lifePath}: "${sentence}"`).toBeGreaterThan(20);
        expect(sentence, String(lifePath)).not.toMatch(/반드시|보장|틀림없|100%/);
      }
    }
  });

  it("keeps a higher tier's insights as a prefix of a lower tier's — never a swap", () => {
    const base = {
      version: 1 as const,
      locale: "ko" as const,
      birthDate: "1988-07-19",
      name: "테스트",
      focusId: "work" as const,
      concern: "이직해도 될까요",
      createdAt: "2026-07-30T10:00:00.000Z",
    };
    const basic = createPaidReport("iaprefix1", { ...base, productCode: "plus_30d" }).sharpInsights!;
    const detail = createPaidReport("iaprefix2", { ...base, productCode: "pro_30d" }).sharpInsights!;
    const premium = createPaidReport("iaprefix3", { ...base, productCode: "premium_pdf" }).sharpInsights!;
    expect(detail.slice(0, basic.length)).toEqual(basic);
    expect(premium.slice(0, detail.length)).toEqual(detail);
  });
});
