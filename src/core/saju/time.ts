/**
 * Turning a birth certificate's wall-clock time into the instant the pillars are read
 * from.
 *
 * Three things stand between the two, and every one of them can move the hour pillar by a
 * whole branch:
 *
 *  1. Korea has not always kept the same standard time. It ran on the 127°30′ meridian
 *     (UTC+8:30) twice, most recently until August 1961, and on UTC+9 otherwise.
 *  2. Seoul sits near 127°E while its clock runs on 135°E, so the sun is about 32 minutes
 *     behind the clock. 사주 is read from the sun, not from the clock.
 *  3. Summer time has been in force in Korea in several years. A birth inside one of
 *     those windows is an hour off unless it is accounted for.
 *
 * Nothing here is guessed. Where the historical record is not something this module can
 * state precisely — the exact start and end dates of the 1948–1960 summer-time seasons —
 * it returns a flag asking for confirmation instead of inventing dates that would quietly
 * shift someone's hour pillar.
 */

/** 동경 135도, the meridian Korean standard time runs on today. */
const STANDARD_MERIDIAN_DEGREES = 135;

/** Seoul city hall. Used when no birthplace is given, and disclosed when it is used. */
export const DEFAULT_LONGITUDE_DEGREES = 126.978;

type ZonePeriod = { readonly from: number; readonly offsetMinutes: number };

/**
 * Standard-time offsets in minutes east of UTC, by the UTC instant they took effect.
 * Ordered latest first so a scan stops at the first match.
 */
const ZONE_HISTORY: readonly ZonePeriod[] = [
  { from: Date.UTC(1961, 7, 9, 15, 30), offsetMinutes: 540 },
  { from: Date.UTC(1954, 2, 21, 0, 0), offsetMinutes: 510 },
  { from: Date.UTC(1911, 11, 31, 15, 30), offsetMinutes: 540 },
  { from: Date.UTC(1908, 2, 31, 15, 30), offsetMinutes: 510 },
  { from: Number.NEGATIVE_INFINITY, offsetMinutes: 508 },
];

/** Summer-time windows this module can state exactly, as local wall-clock ranges. */
const KNOWN_SUMMER_TIME: readonly { readonly from: number; readonly to: number }[] = [
  { from: Date.UTC(1987, 4, 10), to: Date.UTC(1987, 9, 11) },
  { from: Date.UTC(1988, 4, 8), to: Date.UTC(1988, 9, 9) },
];

/** Years in which summer time ran but whose exact dates this module does not assert. */
const UNCERTAIN_SUMMER_TIME_YEARS = [1948, 1949, 1950, 1951, 1955, 1956, 1957, 1958, 1959, 1960];

export function standardOffsetMinutes(utcInstant: number): number {
  return ZONE_HISTORY.find((period) => utcInstant >= period.from)?.offsetMinutes ?? 540;
}

/**
 * Minutes to subtract so the clock reads the sun over the birthplace rather than the sun
 * over the standard meridian. Four minutes per degree.
 */
export function longitudeCorrectionMinutes(
  longitudeDegrees: number,
  standardOffsetMinutesValue: number,
): number {
  const meridian = standardOffsetMinutesValue === 540
    ? STANDARD_MERIDIAN_DEGREES
    : standardOffsetMinutesValue / 4;
  return (longitudeDegrees - meridian) * 4;
}

export type ResolvedInstant = {
  /**
   * True UTC milliseconds of the birth. A 절기 crossing is an event in the sky, the same
   * instant everywhere, so the month and year pillars are decided by comparing against
   * this — never against the corrected reading below.
   */
  readonly utc: number;
  /**
   * The corrected clock reading, carried as a pseudo-UTC value so date arithmetic on it
   * is plain. The day and hour pillars come from this, because their boundaries are local
   * solar events: midnight and the two-hour branches are where the sun is over the
   * birthplace, not where a national standard meridian says it is.
   */
  readonly apparentLocal: number;
  readonly zoneOffsetMinutes: number;
  readonly longitudeCorrectionMinutes: number;
  /** Local civil date and time after correction, as "YYYY-MM-DD HH:mm". */
  readonly correctedLocalTime: string;
  /** Set when summer time may have been in force and the hour needs confirming. */
  readonly summerTimeWarning: string | null;
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * @param birthDate  "YYYY-MM-DD" as written on the certificate.
 * @param birthTime  "HH:mm" as written, in the clock time then in force.
 * @param longitude  Birthplace longitude east of Greenwich.
 */
export function resolveBirthInstant(
  birthDate: string,
  birthTime: string,
  longitude: number = DEFAULT_LONGITUDE_DEGREES,
): ResolvedInstant {
  const [year, month, day] = birthDate.split("-").map(Number) as [number, number, number];
  const [hour, minute] = birthTime.split(":").map(Number) as [number, number];

  // The offset is looked up from a first guess at the instant, then once more from the
  // result, so a birth within a few hours of a zone change lands on the right side.
  const naive = Date.UTC(year, month - 1, day, hour, minute);
  let offset = standardOffsetMinutes(naive - 540 * 60_000);
  offset = standardOffsetMinutes(naive - offset * 60_000);

  const correction = longitudeCorrectionMinutes(longitude, offset);
  const apparentLocal = naive + correction * 60_000;

  const local = new Date(apparentLocal);
  const correctedLocalTime = [
    `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`,
    `${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`,
  ].join(" ");

  return {
    utc: naive - offset * 60_000,
    apparentLocal,
    zoneOffsetMinutes: offset,
    longitudeCorrectionMinutes: Math.round(correction * 10) / 10,
    correctedLocalTime,
    summerTimeWarning: summerTimeWarningFor(naive, year),
  };
}

function summerTimeWarningFor(naiveLocal: number, year: number): string | null {
  if (year < 1908) {
    return "1908년 이전 출생은 표준시 제정 전 구간입니다. 서울 경도 기준 지방평균시(UTC+8:28)와 역산 그레고리력을 적용했으며, 출생지와 당시 기록 방식에 따라 특히 시주 경계가 달라질 수 있습니다.";
  }
  if (KNOWN_SUMMER_TIME.some(({ from, to }) => naiveLocal >= from && naiveLocal < to)) {
    return "이 날짜에는 서머타임(일광절약시간)이 시행 중이었습니다. 출생 시각이 서머타임 기준으로 기록되었다면 한 시간을 빼야 시주가 맞습니다.";
  }
  if (UNCERTAIN_SUMMER_TIME_YEARS.includes(year)) {
    return `${year}년에는 서머타임이 시행된 기간이 있었습니다. 정확한 시행 구간은 이 계산에 넣지 않았으므로, 여름에 태어나셨다면 시주는 한 시간 차이를 확인해 주세요.`;
  }
  return null;
}
