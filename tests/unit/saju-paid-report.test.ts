import { describe, expect, it } from "vitest";
import { createPaidReport } from "@/server/reports/paid-report";

describe("SAJU_5500 one-time report", () => {
  it("creates an auditable Four Pillars report without changing the legacy calculation", () => {
    const report = createPaidReport("iasaju5500test", {
      version: 1,
      locale: "ko",
      productCode: "plus_30d",
      readingKind: "saju_chart",
      birthDate: "1994-11-04",
      birthTime: "09:30",
      name: "",
      focusId: "growth",
      concern: "",
      gender: "female",
      midnightConvention: "야자시",
      createdAt: "2026-08-21T00:00:00.000Z",
    });

    expect(report.title).toBe("나의 사주 원국");
    expect(report.tierLabel).toBe("사주 원국 · 5,500원 · 1회");
    expect(report.sections.map((section) => section.title)).toEqual([
      "원국 네 기둥",
      "오행과 절기",
      "계산·보정 근거",
      "억부 관점",
      "조후 관점",
      "격국 관점",
    ]);
    expect(report.sections[0]?.body).toContain("甲戌");
    expect(report.sections[2]?.body).toContain("saju-core-1.1.0");
    expect(report.contentReferences).toContain("product:SAJU_5500");
  });

  it("keeps an unknown birth time explicit", () => {
    const report = createPaidReport("iasaju5500notime", {
      version: 1,
      locale: "ko",
      productCode: "plus_30d",
      readingKind: "saju_chart",
      birthDate: "1994-11-04",
      name: "",
      focusId: "growth",
      concern: "",
      gender: "female",
      midnightConvention: "야자시",
      createdAt: "2026-08-21T00:00:00.000Z",
    });

    expect(report.summary).toContain("시주 미입력");
    expect(report.cautions).toContain("출생 시각이 없어 시주는 비워 두었습니다.");
    expect(report.sections[2]?.body).toContain("시주: 산출하지 않음");
    expect(report.sections[2]?.body).not.toContain("보정 시각:");
    expect(report.sections[2]?.body).not.toContain("11:27");
  });
});
