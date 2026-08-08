/**
 * Assembling a chart from a birth date, a birth time, and a sex.
 *
 * The whole calculation is deterministic and shows its work: the corrected clock reading,
 * the 절 that opened the month and the one that closes it, the sixty-cycle position of
 * every pillar, and the counted days behind the 대운수. Nothing is smoothed over, and
 * where the arithmetic cannot decide — a birth minutes from a 절 boundary, an hour that
 * was never recorded — the chart says so rather than picking.
 */

import {
  branchTenGod,
  dayPillarFromJdn,
  hiddenStemsOf,
  hourBranchIndex,
  hourPillar,
  monthPillar,
  phaseBalance,
  pillarFromCycle,
  stemPhase,
  stemPolarity,
  tenGod,
  voidBranches,
  yearPillar,
} from "./pillars";
import {
  TERM_UNCERTAINTY_MINUTES,
  governingTerm,
  termsSpanning,
  type ResolvedTerm,
} from "./solar-terms";
import { DEFAULT_LONGITUDE_DEGREES, resolveBirthInstant } from "./time";
import {
  SajuInputError,
  type LuckPillar,
  type Pillar,
  type SajuChart,
  type TermBoundary,
} from "./types";

export const SAJU_RULE_VERSION = "jachyeong-1.0.0";

// This engine's own verified range is 1100 through the current product year. It is kept
// separate from the form policy so historical calculations can remain deterministic while
// visitor input rules continue to live in `@/core/birth-range`.
const MIN_YEAR = 1100;
const MAX_YEAR = 2026;
const DAY_MS = 86_400_000;

export type SajuInput = {
  /** "YYYY-MM-DD" on the Gregorian calendar. 음력 must be converted before this point. */
  readonly birthDate: string;
  /** "HH:mm" in the clock time in force at birth. Omit when it was never recorded. */
  readonly birthTime?: string;
  /** Decides 대운 direction together with the year stem. Classical rule, not a judgement. */
  readonly sex: "female" | "male";
  /** Birthplace longitude east of Greenwich. Defaults to Seoul, and that is disclosed. */
  readonly longitude?: number;
  /** 야자시 moves a birth after 23:00 onto the next day pillar. 조자시 leaves it. */
  readonly midnightConvention?: "야자시" | "조자시";
};

function parseDate(input: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (!match) {
    throw new SajuInputError("INVALID_DATE_FORMAT", "생년월일은 YYYY-MM-DD 형식이어야 합니다.");
  }
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    throw new SajuInputError("INVALID_CALENDAR_DATE", "달력에 없는 날짜입니다.");
  }
  if (year < MIN_YEAR || year > MAX_YEAR) {
    throw new SajuInputError(
      "YEAR_OUT_OF_RANGE",
      `${MIN_YEAR}년부터 ${MAX_YEAR}년 사이의 생년월일만 계산합니다.`,
    );
  }
  return { year, month, day };
}

function parseTime(input: string): { hour: number; minute: number } {
  const match = /^(\d{2}):(\d{2})$/.exec(input);
  if (!match) {
    throw new SajuInputError("INVALID_TIME_FORMAT", "출생 시각은 HH:mm 형식이어야 합니다.");
  }
  const [hour, minute] = [Number(match[1]), Number(match[2])];
  if (hour > 23 || minute > 59) {
    throw new SajuInputError("INVALID_TIME_FORMAT", "존재하지 않는 시각입니다.");
  }
  return { hour, minute };
}

function toBoundary(resolved: ResolvedTerm): TermBoundary {
  return {
    name: resolved.term.name,
    solarLongitude: resolved.term.longitude,
    at: new Date(resolved.at).toISOString(),
  };
}

/** Julian Day Number of a civil date, taken at noon so the integer is unambiguous. */
function julianDayNumberOf(pseudoUtcMs: number): number {
  return Math.floor(pseudoUtcMs / DAY_MS) + 2_440_588;
}

/**
 * 대운(大運). Direction is 순행 for a 양 year stem with a male subject or a 음 year stem
 * with a female one, and 역행 otherwise. The starting age is the distance to the governing
 * 절 — forward to the next one, or back to the one that opened the month — divided by
 * three, one day standing for four months.
 */
function luckCycle(
  birthUtc: number,
  gregorianYear: number,
  yearStemPolarity: "양" | "음",
  sex: "female" | "male",
  monthCycleIndex: number,
  birthCalendarYear: number,
): SajuChart["luck"] {
  const forward = (yearStemPolarity === "양") === (sex === "male");
  const terms = termsSpanning(gregorianYear);
  const index = terms.findLastIndex((entry) => entry.at <= birthUtc);
  const anchor = forward ? terms[index + 1]! : terms[index]!;
  const countedDays = Math.abs(anchor.at - birthUtc) / DAY_MS;

  // Three days to a year is the classical rate. The remainder is kept rather than
  // rounded away, then rounded once at the end, so a birth two and a half days from the
  // 절 does not silently become a whole year early or late.
  const startAge = Math.max(1, Math.round(countedDays / 3));

  const pillars: LuckPillar[] = [];
  for (let step = 1; step <= 8; step += 1) {
    const cycleIndex = monthCycleIndex + (forward ? step : -step);
    pillars.push({
      pillar: pillarFromCycle(cycleIndex),
      startAge: startAge + (step - 1) * 10,
      startYear: birthCalendarYear + startAge + (step - 1) * 10,
    });
  }

  return {
    direction: forward ? "순행" : "역행",
    startAge,
    countedDays: Math.round(countedDays * 100) / 100,
    pillars,
  };
}

export function buildSajuChart(input: SajuInput): SajuChart {
  // Only the year is needed here — the month and day reach the pillars through the
  // corrected instant, not through the calendar fields. Parsing still validates all three.
  const { year } = parseDate(input.birthDate);
  const hourUnknown = !input.birthTime;
  // With no recorded time the chart is built at noon, which is the middle of the 午 hour
  // and the least wrong place to stand for the day pillar. The hour pillar is then left
  // out entirely rather than filled in from that placeholder.
  const { hour, minute } = input.birthTime ? parseTime(input.birthTime) : { hour: 12, minute: 0 };
  const midnightConvention = input.midnightConvention ?? "야자시";
  const longitude = input.longitude ?? DEFAULT_LONGITUDE_DEGREES;

  const resolved = resolveBirthInstant(
    input.birthDate,
    `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    longitude,
  );

  const { current, next } = governingTerm(resolved.utc, year);

  // The year pillar turns at 입춘, not at New Year. Counting 입춘 crossings up to the
  // birth is what decides which 사주 year it falls in, and it is why a birth on 2 February
  // carries the previous year's stem and branch.
  const spring = termsSpanning(year).filter(({ term }) => term.name === "입춘");
  const lastSpring = spring.findLast((entry) => entry.at <= resolved.utc)!;
  const sajuYear = new Date(lastSpring.at).getUTCFullYear();

  const yearP = yearPillar(sajuYear);
  const monthP = monthPillar(yearP.stem, current.term.branchIndex);

  // 야자시: the 子 hour opens at 23:00, and under this convention the day pillar turns
  // with it, so a birth at 23:30 already belongs to the following day.
  const rollsOver = midnightConvention === "야자시"
    && !hourUnknown
    && new Date(resolved.apparentLocal).getUTCHours() === 23;
  const dayJdn = julianDayNumberOf(resolved.apparentLocal) + (rollsOver ? 1 : 0);
  const dayP = dayPillarFromJdn(dayJdn);

  const hourP: Pillar | null = hourUnknown
    ? null
    : hourPillar(dayP.stem, hourBranchIndex(new Date(resolved.apparentLocal).getUTCHours()));

  const minutesFromBoundary = Math.min(
    Math.abs(resolved.utc - current.at),
    Math.abs(next.at - resolved.utc),
  ) / 60_000;
  const termBoundaryWarning = minutesFromBoundary <= TERM_UNCERTAINTY_MINUTES
    ? `출생 시각이 절기(${current.term.name}/${next.term.name}) 경계에서 ${Math.round(minutesFromBoundary)}분 이내입니다. 이 계산의 절기 정밀도는 약 ${TERM_UNCERTAINTY_MINUTES}분이므로, 월주가 앞뒤 어느 쪽인지 만세력으로 한 번 더 확인해 주세요.`
    : null;

  const present = hourP ? [yearP, monthP, dayP, hourP] : [yearP, monthP, dayP];

  return {
    ruleVersion: SAJU_RULE_VERSION,
    birthDate: input.birthDate,
    time: {
      wallClock: input.birthTime ?? "",
      zoneOffsetMinutes: resolved.zoneOffsetMinutes,
      longitudeCorrectionMinutes: resolved.longitudeCorrectionMinutes,
      correctedLocalTime: resolved.correctedLocalTime,
      midnightConvention,
      hourUnknown,
    },
    year: yearP,
    month: monthP,
    day: dayP,
    hour: hourP,
    dayMaster: dayP.stem,
    dayMasterPhase: stemPhase(dayP.stem),
    dayMasterPolarity: stemPolarity(dayP.stem),
    monthTerm: toBoundary(current),
    nextTerm: toBoundary(next),
    termBoundaryWarning: termBoundaryWarning ?? resolved.summerTimeWarning,
    tenGods: {
      yearStem: tenGod(dayP.stem, yearP.stem),
      monthStem: tenGod(dayP.stem, monthP.stem),
      hourStem: hourP ? tenGod(dayP.stem, hourP.stem) : null,
      yearBranch: branchTenGod(dayP.stem, yearP.branch),
      monthBranch: branchTenGod(dayP.stem, monthP.branch),
      dayBranch: branchTenGod(dayP.stem, dayP.branch),
      hourBranch: hourP ? branchTenGod(dayP.stem, hourP.branch) : null,
    },
    hiddenStems: {
      year: hiddenStemsOf(yearP.branch),
      month: hiddenStemsOf(monthP.branch),
      day: hiddenStemsOf(dayP.branch),
      hour: hourP ? hiddenStemsOf(hourP.branch) : null,
    },
    phaseBalance: phaseBalance(present),
    voidBranches: voidBranches(dayP.cycleIndex),
    luck: luckCycle(
      resolved.utc,
      year,
      stemPolarity(yearP.stem),
      input.sex,
      monthP.cycleIndex,
      year,
    ),
  };
}
