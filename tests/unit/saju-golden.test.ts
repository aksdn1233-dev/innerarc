import { describe, expect, it } from "vitest";
import fixtureFile from "../fixtures/saju-golden-fixtures.json";
import {
  SAJU_CALCULATION_POLICY_VERSION,
  SAJU_ENGINE_VERSION,
  SajuInputError,
  buildSajuChart,
  planSajuNarrative,
  validateSajuNarrative,
  type SajuInput,
} from "@/core/saju";

type Fixture = (typeof fixtureFile.fixtures)[number];

describe("versioned Saju golden fixtures", () => {
  for (const fixture of fixtureFile.fixtures as Fixture[]) {
    it(fixture.id, () => {
      if (fixture.expected.status === "rejected") {
        try {
          buildSajuChart(fixture.input as SajuInput);
          throw new Error("expected fixture to be rejected");
        } catch (error) {
          expect(error).toBeInstanceOf(SajuInputError);
          expect((error as SajuInputError).code).toBe(fixture.expected.errorCode);
        }
        return;
      }

      const chart = buildSajuChart(fixture.input as SajuInput);
      if ("year" in fixture.expected) expect(chart.year.label).toBe(fixture.expected.year);
      if ("month" in fixture.expected) expect(chart.month.label).toBe(fixture.expected.month);
      if ("day" in fixture.expected) expect(chart.day.label).toBe(fixture.expected.day);
      if ("hour" in fixture.expected) expect(chart.hour?.label ?? null).toBe(fixture.expected.hour);
      if ("warning" in fixture.expected) expect(chart.warnings.length > 0).toBe(fixture.expected.warning);
      if ("policy" in fixture.expected) expect(chart.policy.lateZiHourPolicy).toBe(fixture.expected.policy);
      expect(chart.versions.engineVersion).toBe(SAJU_ENGINE_VERSION);
      expect(chart.versions.calculationPolicyVersion).toBe(SAJU_CALCULATION_POLICY_VERSION);
    });
  }

  it("changes the day under the two explicitly recorded late-Zi policies", () => {
    const nextDay = buildSajuChart({
      birthDate: "2000-01-01", birthTime: "23:50", sex: "male", midnightConvention: "야자시",
    });
    const sameDay = buildSajuChart({
      birthDate: "2000-01-01", birthTime: "23:50", sex: "male", midnightConvention: "조자시",
    });
    expect(nextDay.day.cycleIndex).toBe((sameDay.day.cycleIndex + 1) % 60);
  });
});

describe("Saju invariants and AI boundary", () => {
  it("advances exactly one sexagenary day across a stable 60-day interval", () => {
    const start = new Date(Date.UTC(2001, 2, 1));
    let previous: number | null = null;
    for (let offset = 0; offset < 60; offset += 1) {
      const date = new Date(start.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
      const chart = buildSajuChart({ birthDate: date, birthTime: "12:00", sex: "female" });
      if (previous !== null) expect(chart.day.cycleIndex).toBe((previous + 1) % 60);
      previous = chart.day.cycleIndex;
    }
  });

  it("round-trips canonical calculation evidence through JSON", () => {
    const chart = buildSajuChart({ birthDate: "1994-11-04", birthTime: "09:30", sex: "female" });
    const restored = JSON.parse(JSON.stringify(chart)) as typeof chart;
    expect(restored.pillars).toEqual(chart.pillars);
    expect(restored.policy).toEqual(chart.policy);
    expect(restored.versions).toEqual(chart.versions);
    expect(restored.derivedFacts).toEqual(chart.derivedFacts);
  });

  it("rejects unsupported facts, invented pillars, duplicate prose, and certainty claims", () => {
    const chart = buildSajuChart({ birthDate: "1994-11-04", birthTime: "09:30", sex: "female" });
    const plan = planSajuNarrative(chart, "work");
    const invalid = validateSajuNarrative(plan, {
      paragraphs: [
        { text: "乙丑이므로 반드시 성공합니다.", factIds: ["not-a-fact"] },
        { text: "乙丑이므로 반드시 성공합니다.", factIds: ["day-master"] },
      ],
    });
    expect(invalid.ok).toBe(false);
    expect(invalid.errors).toEqual(expect.arrayContaining([
      "paragraph-0:unsupported-fact",
      "paragraph-0:prohibited-claim",
      "paragraph-0:hallucinated-pillar",
      "paragraph-1:duplicate",
    ]));
  });

  it("accepts prose that cites only supported facts and preserves the symbolic boundary", () => {
    const chart = buildSajuChart({ birthDate: "1994-11-04", birthTime: "09:30", sex: "female" });
    const plan = planSajuNarrative(chart, "core");
    expect(validateSajuNarrative(plan, {
      paragraphs: [{ text: "이 구조는 성찰을 위한 상징적 관점으로 살펴볼 수 있습니다.", factIds: ["day-master"] }],
    })).toEqual({ ok: true, errors: [] });
  });
});
