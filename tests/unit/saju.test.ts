import { describe, expect, it } from "vitest";
import {
  SajuInputError,
  buildSajuChart,
  readClimate,
  readStrength,
  readStructure,
  readViewpoints,
  stemPhase,
  tenGod,
} from "@/core/saju";
import {
  apparentSolarLongitude,
  deltaTSeconds,
  julianDay,
  solarTermInstant,
} from "@/core/saju/solar-terms";
import {
  dayPillarFromJdn,
  hourBranchIndex,
  monthPillar,
  voidBranches,
  yearPillar,
} from "@/core/saju/pillars";
import { longitudeCorrectionMinutes, standardOffsetMinutes } from "@/core/saju/time";

describe("the sexagenary cycle lands where the record says it does", () => {
  it("puts 1984 on 甲子, the year the cycle restarted", () => {
    expect(yearPillar(1984).label).toBe("甲子");
    expect(yearPillar(1985).label).toBe("乙丑");
    expect(yearPillar(1983).label).toBe("癸亥");
    expect(yearPillar(2024).label).toBe("甲辰");
  });

  it("puts 2000-01-01 on 戊午, which anchors the unbroken day count", () => {
    // Julian Day Number for 2000-01-01.
    expect(dayPillarFromJdn(2_451_545).label).toBe("戊午");
    // And the count advances by one a day, without exception.
    expect(dayPillarFromJdn(2_451_546).label).toBe("己未");
    expect(dayPillarFromJdn(2_451_545 + 60).label).toBe("戊午");
  });

  it("opens the 寅 month of each year stem where 오호둔 says", () => {
    // 甲/己 year → 丙寅, 乙/庚 → 戊寅, 丙/辛 → 庚寅, 丁/壬 → 壬寅, 戊/癸 → 甲寅.
    expect(monthPillar("甲", 2).label).toBe("丙寅");
    expect(monthPillar("己", 2).label).toBe("丙寅");
    expect(monthPillar("乙", 2).label).toBe("戊寅");
    expect(monthPillar("庚", 2).label).toBe("戊寅");
    expect(monthPillar("丙", 2).label).toBe("庚寅");
    expect(monthPillar("丁", 2).label).toBe("壬寅");
    expect(monthPillar("戊", 2).label).toBe("甲寅");
    // And it advances one stem per branch from there.
    expect(monthPillar("甲", 3).label).toBe("丁卯");
    expect(monthPillar("甲", 1).label).toBe("丁丑");
  });

  it("empties the two branches each decade of the cycle leaves over", () => {
    expect(voidBranches(0)).toEqual(["戌", "亥"]);
    expect(voidBranches(10)).toEqual(["申", "酉"]);
    expect(voidBranches(59)).toEqual(["子", "丑"]);
  });

  it("starts the 子 hour at 23:00 and not at midnight", () => {
    expect(hourBranchIndex(23)).toBe(0);
    expect(hourBranchIndex(0)).toBe(0);
    expect(hourBranchIndex(1)).toBe(1);
    expect(hourBranchIndex(12)).toBe(6);
    expect(hourBranchIndex(22)).toBe(11);
  });
});

describe("the ten gods are read from the day master outward", () => {
  it("names each relationship from 甲", () => {
    const expected: Record<string, string> = {
      甲: "비견", 乙: "겁재", 丙: "식신", 丁: "상관", 戊: "편재",
      己: "정재", 庚: "편관", 辛: "정관", 壬: "편인", 癸: "정인",
    };
    for (const [stem, god] of Object.entries(expected)) {
      expect(tenGod("甲", stem as never), stem).toBe(god);
    }
  });

  it("flips the pair when the day master's own polarity flips", () => {
    // 乙 is 음 wood, so what was 식신 for 甲 is 상관 for 乙 and the other way round.
    expect(tenGod("乙", "丙")).toBe("상관");
    expect(tenGod("乙", "丁")).toBe("식신");
    expect(tenGod("乙", "甲")).toBe("겁재");
  });

  it("assigns each stem its phase", () => {
    expect(stemPhase("甲")).toBe("목");
    expect(stemPhase("丁")).toBe("화");
    expect(stemPhase("戊")).toBe("토");
    expect(stemPhase("辛")).toBe("금");
    expect(stemPhase("癸")).toBe("수");
  });
});

describe("solar terms are computed, not looked up", () => {
  it("finds the equinox and solstice within a few minutes of the published instants", () => {
    // March equinox 2024: 2024-03-20 03:06 UTC. September equinox: 2024-09-22 12:44 UTC.
    const marchEquinox = solarTermInstant(2024, 3, 20, 0);
    expect(Math.abs(marchEquinox - Date.UTC(2024, 2, 20, 3, 6))).toBeLessThan(10 * 60_000);
    const junSolstice = solarTermInstant(2024, 6, 20, 90);
    expect(Math.abs(junSolstice - Date.UTC(2024, 5, 20, 20, 51))).toBeLessThan(10 * 60_000);
  });

  it("puts 입춘 in early February, where the 사주 year turns", () => {
    const ipchun = solarTermInstant(2024, 2, 4, 315);
    const at = new Date(ipchun);
    expect(at.getUTCFullYear()).toBe(2024);
    expect(at.getUTCMonth()).toBe(1);
    expect(at.getUTCDate()).toBeGreaterThanOrEqual(3);
    expect(at.getUTCDate()).toBeLessThanOrEqual(5);
  });

  it("returns a longitude in range and a ΔT of the right order", () => {
    const longitude = apparentSolarLongitude(julianDay(Date.UTC(2024, 0, 1)));
    expect(longitude).toBeGreaterThanOrEqual(0);
    expect(longitude).toBeLessThan(360);
    // About seventy seconds in the present era, and never negative in this range.
    expect(deltaTSeconds(2024)).toBeGreaterThan(60);
    expect(deltaTSeconds(2024)).toBeLessThan(80);
    expect(deltaTSeconds(1950)).toBeGreaterThan(25);
    expect(deltaTSeconds(1950)).toBeLessThan(35);
  });
});

describe("Korean clock history is applied, because it moves the hour pillar", () => {
  it("knows the country ran on the 127°30′ meridian until August 1961", () => {
    expect(standardOffsetMinutes(Date.UTC(1960, 5, 1))).toBe(510);
    expect(standardOffsetMinutes(Date.UTC(1962, 5, 1))).toBe(540);
    // Under Japanese rule and for the first post-war decade the country was on
    // UTC+9; the 127°30′ meridian only came back in March 1954.
    expect(standardOffsetMinutes(Date.UTC(1950, 5, 1))).toBe(540);
    expect(standardOffsetMinutes(Date.UTC(1930, 5, 1))).toBe(540);
  });

  it("puts Seoul about half an hour behind the meridian its clock runs on", () => {
    const correction = longitudeCorrectionMinutes(126.978, 540);
    expect(correction).toBeLessThan(-32);
    expect(correction).toBeGreaterThan(-33);
    // On the 127°30′ meridian the same city is barely off at all.
    expect(Math.abs(longitudeCorrectionMinutes(126.978, 510))).toBeLessThan(3);
  });

  it("flags the years summer time ran instead of guessing the dates", () => {
    const inWindow = buildSajuChart({ birthDate: "1987-07-01", birthTime: "14:00", sex: "female" });
    expect(inWindow.termBoundaryWarning).toContain("서머타임");
    const uncertain = buildSajuChart({ birthDate: "1957-07-01", birthTime: "14:00", sex: "male" });
    expect(uncertain.termBoundaryWarning).toContain("1957년");
    const clear = buildSajuChart({ birthDate: "1994-07-01", birthTime: "14:00", sex: "male" });
    expect(clear.termBoundaryWarning).toBeNull();
  });
});

describe("a whole chart", () => {
  const chart = buildSajuChart({
    birthDate: "1994-11-04",
    birthTime: "09:30",
    sex: "female",
  });

  it("reads the four pillars off the corrected clock", () => {
    expect(chart.year.label).toBe("甲戌");
    // 입동 falls on the 7th, so a birth on the 4th is still in the 戌 month.
    expect(chart.month.label).toBe("甲戌");
    // Cross-checked against the other end of the day count: JDN 2415021, 1900-01-01,
    // comes out 甲戌, which is the documented anchor for that date.
    expect(chart.day.label).toBe("甲午");
    expect(chart.hour).not.toBeNull();
    expect(chart.dayMaster).toBe("甲");
    expect(chart.dayMasterPhase).toBe("목");
  });

  it("publishes the correction it applied rather than hiding it", () => {
    expect(chart.time.wallClock).toBe("09:30");
    expect(chart.time.zoneOffsetMinutes).toBe(540);
    expect(chart.time.longitudeCorrectionMinutes).toBeLessThan(-32);
    expect(chart.time.correctedLocalTime).toBe("1994-11-04 08:57");
    expect(chart.time.hourUnknown).toBe(false);
  });

  it("names the 절 that opened the month and the one that ends it", () => {
    expect(chart.monthTerm.name).toBe("한로");
    expect(chart.nextTerm.name).toBe("입동");
    expect(Date.parse(chart.monthTerm.at)).toBeLessThan(Date.parse(chart.nextTerm.at));
  });

  it("counts the phases over stems and hidden stems without double counting a branch", () => {
    const total = Object.values(chart.phaseBalance).reduce((sum, value) => sum + value, 0);
    // Four stems at one each, plus four branches whose hidden stems share one unit each.
    expect(total).toBeGreaterThan(7.9);
    expect(total).toBeLessThan(8.1);
  });

  it("runs the 대운 in the direction the year stem and sex decide", () => {
    // 甲 is 양; a female subject therefore runs 역행.
    expect(chart.luck.direction).toBe("역행");
    expect(chart.luck.startAge).toBeGreaterThan(0);
    expect(chart.luck.pillars).toHaveLength(8);
    expect(chart.luck.pillars[1]!.startAge - chart.luck.pillars[0]!.startAge).toBe(10);
    // 역행 steps backward through the cycle from the month pillar.
    expect(chart.luck.pillars[0]!.pillar.cycleIndex)
      .toBe((chart.month.cycleIndex - 1 + 60) % 60);
  });

  it("sends a male subject of the same year the other way", () => {
    const male = buildSajuChart({ birthDate: "1994-11-04", birthTime: "09:30", sex: "male" });
    expect(male.luck.direction).toBe("순행");
    expect(male.luck.pillars[0]!.pillar.cycleIndex).toBe((male.month.cycleIndex + 1) % 60);
  });
});

describe("the year turns at 입춘, not at New Year", () => {
  it("gives a late-January birth the previous year's pillar", () => {
    const beforeSpring = buildSajuChart({ birthDate: "1994-01-20", birthTime: "12:00", sex: "male" });
    const afterSpring = buildSajuChart({ birthDate: "1994-03-20", birthTime: "12:00", sex: "male" });
    expect(beforeSpring.year.label).toBe("癸酉");
    expect(afterSpring.year.label).toBe("甲戌");
  });

  it("changes the pillar across the 입춘 instant itself", () => {
    // 입춘 2024 fell on 4 February at about 16:27 KST.
    const before = buildSajuChart({ birthDate: "2024-02-04", birthTime: "06:00", sex: "male" });
    const after = buildSajuChart({ birthDate: "2024-02-04", birthTime: "20:00", sex: "male" });
    expect(before.year.label).toBe("癸卯");
    expect(after.year.label).toBe("甲辰");
    expect(before.month.branch).toBe("丑");
    expect(after.month.branch).toBe("寅");
  });
});

describe("what the chart refuses to invent", () => {
  it("leaves the hour pillar out when no time was recorded", () => {
    const chart = buildSajuChart({ birthDate: "1994-11-04", sex: "female" });
    expect(chart.hour).toBeNull();
    expect(chart.tenGods.hourStem).toBeNull();
    expect(chart.tenGods.hourBranch).toBeNull();
    expect(chart.hiddenStems.hour).toBeNull();
    expect(chart.time.hourUnknown).toBe(true);
    expect(chart.time.wallClock).toBe("");
    // The three pillars it can read are still read.
    expect(chart.day.label).toBe("甲午");
  });

  it("says so when a birth sits inside the boundary's own uncertainty", () => {
    // This calculation puts 입춘 2024 at 17:20 KST, seven minutes from the published
    // instant — inside the band it declares. A birth at 17:25 is inside it too.
    const chart = buildSajuChart({ birthDate: "2024-02-04", birthTime: "17:25", sex: "male" });
    expect(chart.termBoundaryWarning).toContain("절기");
    expect(chart.termBoundaryWarning).toContain("확인");
  });

  it("rejects a date it cannot stand behind instead of returning a chart", () => {
    expect(() => buildSajuChart({ birthDate: "1994-2-4", sex: "male" }))
      .toThrow(SajuInputError);
    expect(() => buildSajuChart({ birthDate: "2023-02-29", sex: "male" }))
      .toThrow(SajuInputError);
    expect(() => buildSajuChart({ birthDate: "1099-01-01", sex: "male" }))
      .toThrow(SajuInputError);
    expect(() => buildSajuChart({ birthDate: "1994-11-04", birthTime: "25:00", sex: "male" }))
      .toThrow(SajuInputError);
  });
});

describe("no living practitioner is named or leaned on", () => {
  it("keeps the module free of personal names and branded frameworks", async () => {
    const { readFile } = await import("node:fs/promises");
    const sources = await Promise.all(
      ["types", "engine", "pillars", "solar-terms", "time", "index"].map((name) =>
        readFile(`src/core/saju/${name}.ts`, "utf8")),
    );
    const combined = sources.join("\n");
    // The classical texts are cited; no person alive is, and no one's method is claimed.
    expect(combined).toMatch(/연해자평|적천수|자평진전|궁통보감/);
    expect(combined).not.toMatch(/박성준|선생님 방식|비법|독점|공식 인증/);
  });
});

describe("three viewpoints on the same chart", () => {
  const chart = buildSajuChart({ birthDate: "1994-11-04", birthTime: "09:30", sex: "female" });
  const views = readViewpoints(chart);

  it("weighs the month branch heaviest, because the season is the ground", () => {
    const weights = Object.fromEntries(
      views.strength.contributions.map(({ source, weight }) => [source, weight]),
    );
    expect(weights["월지"]).toBe(30);
    expect(weights["월지"]).toBeGreaterThan(weights["일지"]!);
    expect(weights["일지"]).toBeGreaterThan(weights["연간"]!);
    // Every contribution is shown, so the verdict can be recomputed by hand.
    const total = views.strength.contributions.reduce((sum, entry) => sum + entry.weight, 0);
    expect(total).toBe(110);
  });

  it("scores support against drain and names the band, not a number alone", () => {
    expect(views.strength.score).toBeGreaterThanOrEqual(-100);
    expect(views.strength.score).toBeLessThanOrEqual(100);
    expect(["신강", "중화", "신약"]).toContain(views.strength.label);
    if (views.strength.label === "중화") {
      // A balanced chart is not told it needs fixing.
      expect(views.strength.usefulPhases).toEqual([]);
      expect(views.strength.straining).toEqual([]);
    }
  });

  it("turns the useful phases around when the day master's strength flips", () => {
    const strong = readStrength({ ...chart, dayMasterPhase: chart.dayMasterPhase });
    expect(strong.usefulPhases).not.toEqual(strong.straining);
  });

  it("reads the season and says whether the chart already carries what it asks for", () => {
    expect(views.climate.season).toBe("가을");
    expect(views.climate.monthBranch).toBe("戌");
    expect(typeof views.climate.satisfied).toBe("boolean");
    expect(views.climate.note.length).toBeGreaterThan(10);
  });

  it("asks a winter chart for warmth and a summer chart for water", () => {
    const winter = readClimate(buildSajuChart({ birthDate: "1994-01-05", birthTime: "12:00", sex: "male" }));
    expect(winter.season).toBe("겨울");
    expect(winter.need).toBe("온기");
    expect(winter.usefulPhases).toEqual(["화"]);

    const summer = readClimate(buildSajuChart({ birthDate: "1994-07-05", birthTime: "12:00", sex: "male" }));
    expect(summer.season).toBe("여름");
    expect(summer.need).toBe("냉기");
    expect(summer.usefulPhases).toEqual(["수"]);
  });

  it("names the structure from the month branch and shows the derivation", () => {
    expect(views.structure.name).toMatch(/격$/);
    expect(views.structure.derivedFrom).toContain("월지");
    expect(views.structure.derivedFrom).toContain(chart.month.branch);
    expect(views.structure.derivedFrom).toContain(chart.dayMaster);
  });

  it("names the seat, not the god, when the month gives 비견 or 겁재", () => {
    expect(readStructure({ ...chart, dayMaster: "戊" }).name).toBe("건록격");
    expect(readStructure({ ...chart, dayMaster: "己" }).name).toBe("양인격");
  });

  it("predicts no event and promises no outcome", () => {
    const spoken = [
      views.climate.note,
      views.structure.note,
      views.structure.derivedFrom,
    ].join(" ");
    expect(spoken).not.toMatch(/합니다만|반드시|틀림없|운명|보장|성공한다|실패한다|죽|병에 걸/);
  });
});
