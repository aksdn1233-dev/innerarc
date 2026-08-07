import { describe, expect, it } from "vitest";
import { calculateNumerologyProfile } from "@/core/numerology";
import { buildSajuChart, readStrength } from "@/core/saju";
import { readAcrossSystems, type CrossReading } from "@/core/synthesis";

function read(birthDate: string, birthTime?: string, sex: "female" | "male" = "female"): CrossReading {
  const numerology = calculateNumerologyProfile({ birthDate, name: "Minji Kim", personalYear: 2026 });
  const chart = buildSajuChart({ birthDate, birthTime, sex });
  return readAcrossSystems(numerology, chart, readStrength(chart));
}

describe("the two systems are read against each other, not printed side by side", () => {
  it("always names both sources in every finding", () => {
    const result = read("1994-11-04", "09:30");
    expect(result.findings.length).toBeGreaterThan(0);
    for (const finding of result.findings) {
      expect(finding.fromNumerology.length).toBeGreaterThan(0);
      expect(finding.fromSaju.length).toBeGreaterThan(0);
      expect(finding.reading.length).toBeGreaterThan(20);
      expect(["reinforcement", "tension", "moderation"]).toContain(finding.agreement);
    }
  });

  it("is deterministic — the same birth data gives the same reading", () => {
    expect(read("1994-11-04", "09:30")).toEqual(read("1994-11-04", "09:30"));
    expect(read("1988-03-17", "14:00", "male")).toEqual(read("1988-03-17", "14:00", "male"));
  });

  it("gives different people different findings", () => {
    const a = read("1994-11-04", "09:30");
    const b = read("1988-03-17", "14:00", "male");
    expect(JSON.stringify(a.findings)).not.toBe(JSON.stringify(b.findings));
  });

  it("reaches every agreement kind across a spread of birth dates", () => {
    const kinds = new Set<string>();
    for (const date of [
      "1990-01-15", "1991-04-02", "1992-07-19", "1993-10-08", "1994-11-04",
      "1995-02-25", "1996-05-30", "1997-08-12", "1998-12-01", "1999-06-21",
      "2000-03-03", "2001-09-09", "1985-11-11", "1987-01-29", "1989-06-06",
    ]) {
      for (const finding of read(date, "09:30").findings) kinds.add(finding.agreement);
    }
    expect(kinds).toContain("reinforcement");
    expect(kinds).toContain("tension");
    expect(kinds).toContain("moderation");
  });

  it("never crashes on any calendar date across a decade, with or without a time", () => {
    for (let year = 1990; year <= 2000; year += 1) {
      for (const day of ["01-01", "02-04", "02-05", "06-15", "11-04", "12-31"]) {
        expect(() => read(`${year}-${day}`, "09:30")).not.toThrow();
        expect(() => read(`${year}-${day}`)).not.toThrow();
      }
    }
  });
});

describe("what it refuses to guess", () => {
  it("skips the hour comparison and says so when no birth time was given", () => {
    const result = read("1994-11-04");
    expect(result.skipped.join(" ")).toContain("시주가 없어");
    // The comparisons that do not need an hour still ran.
    expect(result.findings.length).toBeGreaterThan(0);
  });

  it("warns that the reading moves with the month pillar near a term boundary", () => {
    // 입춘 2026 falls in early February; a birth minutes away is flagged upstream.
    const result = read("2024-02-04", "17:25");
    expect(result.skipped.join(" ")).toContain("절기");
  });

  it("carries no promise, no fixed outcome, and no percentage", () => {
    for (const date of ["1994-11-04", "1988-03-17", "2001-09-09"]) {
      const spoken = read(date, "09:30").findings
        .map((f) => `${f.reading} ${f.fromNumerology} ${f.fromSaju}`).join(" ");
      expect(spoken).not.toMatch(/\d+\s*%|반드시|틀림없|보장|운명이 정해|성공한다|실패한다/);
    }
  });

  it("states the number-to-phase mapping as a convention rather than hiding it", () => {
    const result = read("1994-11-04", "09:30");
    const phaseFinding = result.findings.find((f) => f.id.startsWith("phase_"))!;
    // The reader is shown which number produced which phase, so they can disagree.
    expect(phaseFinding.fromNumerology).toMatch(/생명수 \d+ → [목화토금수]/);
    expect(phaseFinding.fromSaju).toMatch(/일간 .+ → [목화토금수]/);
  });
});
