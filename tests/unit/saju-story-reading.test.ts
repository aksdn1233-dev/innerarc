import { describe, expect, it } from "vitest";
import { HEAVENLY_STEMS, buildSajuChart, buildSajuStory, socialMaskScore } from "@/core/saju";

const chart = buildSajuChart({ birthDate: "1994-11-04", birthTime: "09:30", sex: "female" });

describe("free saju story chapters", () => {
  it("is deterministic for the same chart", () => {
    expect(buildSajuStory(chart, "ko")).toEqual(buildSajuStory(chart, "ko"));
  });

  it("names the day master the engine computed", () => {
    const story = buildSajuStory(chart, "ko");
    expect(story.dayMaster.stem).toBe(chart.dayMaster);
    expect(story.pastLife.hashtag.startsWith("#")).toBe(true);
    expect(story.pastLife.story.length).toBeGreaterThan(0);
  });

  it("only calls a phase missing when the chart really has none of it", () => {
    const story = buildSajuStory(chart, "ko");
    for (const entry of story.phases.low) expect(chart.phaseBalance[entry.phase]).toBe(0);
    for (const entry of story.phases.high) expect(chart.phaseBalance[entry.phase]).toBeGreaterThanOrEqual(3);
  });

  it("keeps the mask score inside its published range", () => {
    for (const date of ["1970-01-01", "1988-03-17", "2001-07-30", "2012-12-12"]) {
      const score = socialMaskScore(buildSajuChart({ birthDate: date, sex: "male" }));
      expect(score).toBeGreaterThanOrEqual(35);
      expect(score).toBeLessThanOrEqual(92);
    }
  });

  it("speaks politely and plainly, with no fate guarantees", () => {
    const dates = ["1990-01-05", "1991-02-14", "1992-03-21", "1993-04-30", "1994-05-09", "1995-06-18", "1996-07-27", "1997-08-06", "1998-09-15", "1999-10-24", "2000-11-03", "2001-12-12"];
    const seen = new Set<string>();
    for (const date of dates) {
      const story = buildSajuStory(buildSajuChart({ birthDate: date, sex: "female" }), "ko");
      seen.add(story.dayMaster.stem);
      const text = [story.pastLife.title, ...story.pastLife.story, story.pastLife.echo, story.pastLife.lesson, story.mask.outer, story.mask.inner, story.closing].join(" ");
      expect(text).not.toMatch(/반드시|무조건|100%|운명이 정해|이놈|너는|네가/);
    }
    expect(seen.size).toBeGreaterThan(1);
    expect(HEAVENLY_STEMS.length).toBe(10);
  });

  it("has an English version for every chapter string", () => {
    const story = buildSajuStory(chart, "en");
    expect(story.pastLife.title).toMatch(/[a-z]/);
    expect(story.mask.inner).toMatch(/[a-z]/);
  });
});
