import { describe, expect, it } from "vitest";
import { calculateNumerologyProfile } from "@/core/numerology";
import { buildSajuChart, readStrength } from "@/core/saju";
import { readAcrossSystems, type CrossReading } from "@/core/synthesis";
import { MIN_BIRTH_DATE, currentMaxBirthDate, isAcceptedBirthDate } from "@/core/birth-range";

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

describe("what a visitor may enter, versus what the engines can calculate", () => {
  // These are three different limits and conflating them broke the celebrity comparison
  // once already: narrowing the numerology engine to the product's range stopped it
  // reading public figures born before 1900.
  const trySaju = (birthDate: string) => {
    try { buildSajuChart({ birthDate, sex: "female" }); return "ok"; }
    catch { return "rejected"; }
  };
  const tryNumerology = (birthDate: string) => {
    try { calculateNumerologyProfile({ birthDate, name: "", personalYear: 2026 }); return "ok"; }
    catch { return "rejected"; }
  };

  it("keeps the numerology engine wide enough for historical public figures", () => {
    // Marie Curie, 1867, is in the celebrity dataset.
    expect(tryNumerology("1867-11-07")).toBe("ok");
  });

  it("keeps the 사주 engine inside the supported 1900-2100 window", () => {
    // Below 1900 the Korean standard-time history in `saju/time.ts` does not apply and
    // the solar-term series has not been checked, so the engine refuses rather than
    // producing a confident chart nobody has verified.
    expect(trySaju("1899-12-31")).toBe("rejected");
    expect(trySaju("1900-01-01")).toBe("ok");
    expect(trySaju("2100-12-31")).toBe("ok");
    expect(trySaju("2101-01-01")).toBe("rejected");
  });

  it("bounds a visitor's own birth date to 1900 through today", () => {
    const now = new Date("2026-08-07T12:00:00Z");
    expect(isAcceptedBirthDate("1900-01-01", now)).toBe(true);
    expect(isAcceptedBirthDate("1994-11-04", now)).toBe(true);
    expect(isAcceptedBirthDate("1899-12-31", now)).toBe(false);
    expect(isAcceptedBirthDate("2026-08-07", now)).toBe(true);
    expect(isAcceptedBirthDate("2026-08-08", now)).toBe(false);
    expect(isAcceptedBirthDate("2100-01-01", now)).toBe(false);
  });

  it("catches the dropped-digit typo that used to be calculated straight through", () => {
    // 1994 mistyped as 0194 is a valid date and the wrong millennium. The engine will
    // still compute it; the product refuses to accept it from a visitor.
    expect(tryNumerology("0194-11-04")).toBe("ok");
    expect(isAcceptedBirthDate("0194-11-04")).toBe(false);
    expect(isAcceptedBirthDate("194-11-04")).toBe(false);
    expect(isAcceptedBirthDate("1994-11-04")).toBe(true);
  });

  it("offers the picker exactly that window", () => {
    expect(MIN_BIRTH_DATE).toBe("1900-01-01");
    expect(isAcceptedBirthDate("1900-01-01")).toBe(true);
    expect(isAcceptedBirthDate("1899-12-31")).toBe(false);
    expect(isAcceptedBirthDate("2026-02-30")).toBe(false);
    expect(isAcceptedBirthDate("2023-02-29")).toBe(false);
    expect(isAcceptedBirthDate("2024-02-29")).toBe(true);
  });

  it("moves the ceiling with the calendar instead of freezing it into a constant", () => {
    // The bug this replaces: the maximum was the literal string "2026-12-31", so on
    // 2027-01-01 the form would have refused every visitor alive.
    const localDay = (now: Date) =>
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    for (const iso of ["2026-08-07T12:00:00Z", "2027-01-01T12:00:00Z", "2031-03-09T12:00:00Z"]) {
      const now = new Date(iso);
      expect(currentMaxBirthDate(now)).toBe(localDay(now));
      expect(isAcceptedBirthDate(localDay(now), now)).toBe(true);
    }

    // A birth date one day past "today" is a typo at every point on the calendar.
    // Both neighbours are derived from `now` so the assertion does not depend on the
    // timezone the test runner happens to be in.
    const now = new Date("2027-01-01T12:00:00Z");
    const dayOffset = (days: number) =>
      localDay(new Date(now.getTime() + days * 86_400_000));
    expect(isAcceptedBirthDate(dayOffset(1), now)).toBe(false);
    expect(isAcceptedBirthDate(dayOffset(-1), now)).toBe(true);
  });
});
