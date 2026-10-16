import { describe, expect, it } from "vitest";
import { buildHarangFreeReading, buildSajuChart, buildSajuStory, formulaOf } from "@/core/saju";
import { calculateLifePath } from "@/core/numerology";

const chart = buildSajuChart({ birthDate: "1994-11-04", birthTime: "10:30", sex: "female" });

describe("하랑 free chapters", () => {
  it("is deterministic for the same chart", () => {
    expect(buildHarangFreeReading(chart, "ko")).toEqual(buildHarangFreeReading(chart, "ko"));
  });

  it("reads the life path the numerology engine calculated and shows every step", () => {
    const reading = buildHarangFreeReading(chart, "ko");
    expect(reading.numbers.lifePath.value).toBe(calculateLifePath("1994-11-04").value);
    expect(reading.numbers.lifePath.formula).toBe("1+9+9+4+1+1+0+4 = 29 → 2+9 = 11");
    expect(formulaOf(calculateLifePath("2000-01-01"))).toBe("2+0+0+0+0+1+0+1 = 4");
  });

  it("names the pillar each section was read from", () => {
    const reading = buildHarangFreeReading(chart, "ko");
    expect(reading.childhood.stages.map((stage) => stage.ages)).toEqual(["0~7세", "8~13세", "14~19세"]);
    expect(reading.childhood.evidence).toContain(`연간 ${chart.year.stem}(${chart.tenGods.yearStem}`);
    expect(reading.childhood.evidence).toContain(`월간 ${chart.month.stem}(${chart.tenGods.monthStem}`);
    expect(reading.lens.evidence).toContain(`일간 ${chart.dayMaster}`);
    for (const evidence of [reading.childhood.evidence, reading.lens.evidence, reading.numbers.evidence]) {
      expect(evidence.startsWith("📐 근거")).toBe(true);
    }
  });

  it("follows every sharp line with what to do", () => {
    const reading = buildHarangFreeReading(chart, "ko");
    expect(reading.lens.fix.startsWith("그래서 이렇게 하면 됩니다.")).toBe(true);
    expect(reading.numbers.fix.startsWith("그래서 이렇게 하면 됩니다.")).toBe(true);
    expect(reading.lens.poke).toMatch(/\?$/);
  });

  it("produces a complete free reading for every birth date from 1900 through 2026", () => {
    const day = new Date(Date.UTC(1900, 0, 1));
    const end = Date.UTC(2026, 11, 31);
    let count = 0;
    while (day.getTime() <= end) {
      const birthDate = day.toISOString().slice(0, 10);
      const built = buildSajuChart({ birthDate, sex: count % 2 ? "male" : "female" });
      const story = buildSajuStory(built, "ko");
      const reading = buildHarangFreeReading(built, "ko");
      if (!story.pastLife.title || !reading.lens.title || !reading.numbers.title || reading.childhood.stages.some((stage) => !stage.body)) {
        throw new Error(`incomplete free reading for ${birthDate}`);
      }
      count += 1;
      day.setUTCDate(day.getUTCDate() + 1);
    }
    expect(count).toBe(46_386);
  }, 120_000);

  it("speaks politely, calls the visitor 님, and never predicts misfortune", () => {
    const text = JSON.stringify(buildHarangFreeReading(chart, "ko"));
    expect(text).not.toMatch(/반드시|무조건|100%|운명이 정해|당신|너는|네가|불행|죽/);
    expect(buildHarangFreeReading(chart, "en").lens.title).toMatch(/[a-z]/);
  });
});
