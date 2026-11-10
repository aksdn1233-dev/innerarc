import { describe, expect, it } from "vitest";
import { createPaidReport } from "@/server/reports/paid-report";
import { buildSajuChart } from "@/core/saju";
import { identifyBranchSinsal, identifySinsal } from "@/core/saju/sinsal";

describe("explicit symbolic sinsal conventions", () => {
  it("does not invent an hour match when birth time is missing", () => {
    const chart = buildSajuChart({ birthDate: "1994-11-04", sex: "female" });
    const result = identifySinsal(chart);
    expect(result.hourUnknown).toBe(true);
    expect(result.hongyeom.positions).not.toContain("hour");
  });
  it("recognizes the seven specified day pillars without changing the chart", () => {
    const chart = buildSajuChart({ birthDate: "1994-11-04", sex: "female" });
    for (const pair of ["甲辰", "乙未", "丙戌", "丁丑", "戊辰", "壬戌", "癸丑"] as const) {
      const result = identifySinsal({ ...chart, day: { ...chart.day, stem: pair[0] as typeof chart.day.stem, branch: pair[1] as typeof chart.day.branch } });
      expect(result.baekho.matched).toBe(true);
    }
    expect(identifySinsal({ ...chart, day: { ...chart.day, stem: "甲", branch: "子" } }).baekho.matched).toBe(false);
  });
});


describe("sinsal in newly generated reports", () => {
  for (const productCode of ["pro_30d", "premium_pdf"] as const) {
    for (const language of ["ko", "en", "ja"] as const) {
      it(`${productCode} ${language} includes explicit evidence and unknown hour`, () => {
        const report = createPaidReport("synthetic-sinsal", { version: 1, locale: language === "ko" ? "ko" : "en", ...(language === "ja" ? { displayLocale: "ja" } : {}), productCode, birthDate: "1994-11-04", name: "", focusId: "growth", concern: "", createdAt: "2026-10-26T00:00:00.000Z" });
        expect(report.sinsal?.ruleVersion).toBe("sinsal:1.1.0");
        for (const marker of language === "ko" ? ["화개살", "괴강살", "천을귀인"] : language === "ja" ? ["華蓋殺", "魁罡殺", "天乙貴人"] : ["Hwagae", "Goegang", "Cheoneul"]) expect(report.sinsal?.body).toContain(marker);
        expect(report.sinsal?.body).toMatch(language === "ko" ? /백호살[\s\S]*홍염살[\s\S]*도화살[\s\S]*역마살[\s\S]*시지는 확인하지/u : language === "ja" ? /白虎殺[\s\S]*紅艶殺[\s\S]*桃花殺[\s\S]*駅馬殺[\s\S]*時支は確認できません/u : /Baekho[\s\S]*Hongyeom[\s\S]*Dohwa[\s\S]*Yeokma[\s\S]*hour branch was not checked/u);
      });
    }
  }
  it("uses day-branch mappings for peach blossom and travel", () => {
    const chart = buildSajuChart({ birthDate: "1994-11-04", sex: "female" });
    const sample = { ...chart, day: { ...chart.day, branch: "子" as const }, month: { ...chart.month, branch: "酉" as const }, year: { ...chart.year, branch: "寅" as const }, hour: null };
    expect(identifyBranchSinsal(sample)).toMatchObject({ dohwa: ["month"], yeokma: ["year"] });
  });
});


describe("declared matching tables", () => {
  it.each([
    ["甲", "午"], ["乙", "午"], ["丙", "寅"], ["丁", "未"], ["戊", "辰"],
    ["己", "辰"], ["庚", "戌"], ["辛", "酉"], ["壬", "子"], ["癸", "申"],
  ] as const)("matches Hongyeom %s to %s at a known hour", (stem, target) => {
    const chart = buildSajuChart({ birthDate: "1994-11-04", sex: "female", birthTime: "10:00" });
    const result = identifySinsal({ ...chart, dayMaster: stem, hour: { ...chart.hour!, branch: target } });
    expect(result.hongyeom.positions).toContain("hour");
    expect(result.hourUnknown).toBe(false);
  });
  it.each([
    ["子", "酉", "寅"], ["午", "卯", "申"], ["酉", "午", "亥"], ["卯", "子", "巳"],
  ] as const)("matches day branch %s to Dohwa %s and Yeokma %s", (basis, peach, travel) => {
    const chart = buildSajuChart({ birthDate: "1994-11-04", sex: "female" });
    const result = identifyBranchSinsal({ ...chart, day: { ...chart.day, branch: basis }, month: { ...chart.month, branch: peach }, year: { ...chart.year, branch: travel }, hour: null });
    expect(result.dohwa).toContain("month");
    expect(result.yeokma).toContain("year");
  });
});


describe("additional traditional markers", () => {
  it.each([["子", "辰"], ["午", "戌"], ["酉", "丑"], ["卯", "未"]] as const)("finds Hwagae for %s at %s", (basis, target) => {
    const chart = buildSajuChart({ birthDate: "1994-11-04", sex: "female" });
    const result = identifyBranchSinsal({ ...chart, day: { ...chart.day, branch: basis }, month: { ...chart.month, branch: target } });
    expect(result.hwagae).toContain("month");
  });
  it.each(["庚辰", "庚戌", "壬辰", "壬戌"] as const)("finds Goegang day pillar %s", pair => {
    const chart = buildSajuChart({ birthDate: "1994-11-04", sex: "female" });
    expect(identifySinsal({ ...chart, day: { ...chart.day, stem: pair[0] as typeof chart.day.stem, branch: pair[1] as typeof chart.day.branch } }).goegang.matched).toBe(true);
  });
  it.each([["甲", "丑"], ["戊", "未"], ["庚", "丑"], ["乙", "申"], ["己", "子"], ["丙", "酉"], ["丁", "亥"], ["壬", "巳"], ["癸", "卯"], ["辛", "午"]] as const)("finds Cheoneul for day stem %s and known branch %s", (stem, branch) => {
    const chart = buildSajuChart({ birthDate: "1994-11-04", sex: "female" });
    const result = identifySinsal({ ...chart, dayMaster: stem, month: { ...chart.month, branch } });
    expect(result.cheoneul.positions).toContain("month");
    expect(result.cheoneul.positions).not.toContain("hour");
  });
});
