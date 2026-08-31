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
      "원국이 먼저 보여주는 당신의 중심",
      "어릴 때, 먼저 맡았던 역할",
      "가족이 기대했을 수 있는 모습",
      "그 과정에서 익힌 대응 방식",
      "친구와 사람들 사이에서 보이는 모습",
      "가까운 관계에서 반복되는 장면",
      "일과 책임에서 힘이 살아나는 순간",
      "돈과 자원을 다루는 습관",
      "마음이 메마를 때 회복하는 환경",
      "시간이 흐르며 더 중요해질 방향",
      "이 원국을 읽고 남겨야 할 한 문장",
      "원국 네 기둥",
      "오행과 절기",
      "계산·보정 근거",
      "억부 관점",
      "조후 관점",
      "격국 관점",
    ]);
    const section = (title: string) => report.sections.find((item) => item.title === title)?.body ?? "";
    expect(section("원국 네 기둥")).toContain("甲戌");
    expect(section("원국이 먼저 보여주는 당신의 중심")).toContain("큰 나무처럼");
    expect(section("어릴 때, 먼저 맡았던 역할")).toMatch(/어릴 때.*내 몫은 내가 해내는 아이/s);
    expect(section("어릴 때, 먼저 맡았던 역할")).toContain("연간 비견과 연지 편재");
    expect(section("가족이 기대했을 수 있는 모습")).toMatch(/가족은 당신이.*기대했을 수 있습니다/s);
    expect(section("가족이 기대했을 수 있는 모습")).toContain("월간 비견과 월지 편재");
    expect(section("그 과정에서 익힌 대응 방식")).toContain("억부 신약");
    expect(section("가까운 관계에서 반복되는 장면")).toContain("일지 상관");
    expect(section("돈과 자원을 다루는 습관")).toContain("수익을 사주로 예측할 수는 없으며");
    expect(section("계산·보정 근거")).toContain("saju-core-1.1.0");
    const narrativeSections = report.sections.filter((item) => item.keySentence);
    expect(narrativeSections).toHaveLength(11);
    expect(new Set(narrativeSections.map((item) => item.keySentence)).size).toBe(11);
    for (const item of narrativeSections) {
      expect(item.keySentence?.length, item.title).toBeGreaterThan(20);
      expect(item.body.split(/\n{2,}/u).length, item.title).toBeGreaterThanOrEqual(3);
    }
    // Eleven distinct three-paragraph scenes should remain a substantial reading even
    // when a particular chart produces shorter conditional branches.
    expect(narrativeSections.reduce((total, item) => total + item.body.length, 0))
      .toBeGreaterThan(7_000);
    expect(report.sections.map((section) => section.body).join(" ")).not.toMatch(/반드시|확실히|틀림없이|운명이 정해/);
    expect(report.contentVersion).toBe("saju-chart-report-1.2.0");
    expect(report.contentReferences).toContain("saju-life-narrative:1.1.0");
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
    const future = report.sections.find((section) => section.title === "출생 시각이 없어 비워 둔 장면");
    const derivation = report.sections.find((section) => section.title === "계산·보정 근거");
    expect(future?.body).toContain("이야기도 지어내지 않습니다");
    expect(derivation?.body).toContain("시주: 산출하지 않음");
    expect(derivation?.body).not.toContain("보정 시각:");
    expect(derivation?.body).not.toContain("11:27");
  });

  it("uses an optional name in the long-form webtoon narration", () => {
    const report = createPaidReport("iasaju5500named", {
      version: 1,
      locale: "ko",
      productCode: "plus_30d",
      readingKind: "saju_chart",
      birthDate: "1994-11-04",
      birthTime: "09:30",
      name: "결이",
      focusId: "growth",
      concern: "",
      gender: "female",
      midnightConvention: "야자시",
      createdAt: "2026-08-21T00:00:00.000Z",
    });

    expect(report.customerName).toBe("결이");
    expect(report.sections.find((section) => section.title === "원국이 먼저 보여주는 당신의 중심")?.body)
      .toMatch(/^결이님의 일간/);
    expect(report.sections.find((section) => section.title === "원국이 먼저 보여주는 당신의 중심")?.keySentence)
      .toMatch(/^결이님의 강점/);
    expect(report.sections.find((section) => section.title === "가족이 기대했을 수 있는 모습")?.body)
      .toContain("결이님이");
  });
});
