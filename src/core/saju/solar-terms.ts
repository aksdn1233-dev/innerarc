/**
 * 절기(節氣) instants, computed rather than looked up.
 *
 * A 사주 month does not begin on the first of the month. It begins the moment the sun's
 * apparent longitude crosses a multiple of 30° — 입춘 at 315°, 경칩 at 345°, and so on
 * around the year. The year pillar turns at 입춘 too, not at New Year. Get this wrong and
 * every chart for a birth in the first days of a month is wrong, so it is calculated here
 * from the sun's position instead of copied from a table that would need maintaining.
 *
 * The solar-position series is Meeus, *Astronomical Algorithms*, ch. 25 (low accuracy),
 * which holds the apparent longitude to about 0.01° over the range this site accepts.
 * The sun moves roughly 0.0417° per hour, so that is a worst case of about fifteen
 * minutes on a boundary instant — which is why `TERM_UNCERTAINTY_MINUTES` exists and why
 * a birth inside that window is reported as needing confirmation instead of being
 * silently assigned to one side.
 */

const DEG = Math.PI / 180;

/** Worst-case error of the boundary instants above, in minutes. */
export const TERM_UNCERTAINTY_MINUTES = 15;

/** The twelve 절(節): each opens a month branch. The twelve 중기 do not, so are absent. */
export const MAJOR_TERMS = [
  { name: "입춘", longitude: 315, branchIndex: 2, nominalMonth: 2, nominalDay: 4 },
  { name: "경칩", longitude: 345, branchIndex: 3, nominalMonth: 3, nominalDay: 6 },
  { name: "청명", longitude: 15, branchIndex: 4, nominalMonth: 4, nominalDay: 5 },
  { name: "입하", longitude: 45, branchIndex: 5, nominalMonth: 5, nominalDay: 6 },
  { name: "망종", longitude: 75, branchIndex: 6, nominalMonth: 6, nominalDay: 6 },
  { name: "소서", longitude: 105, branchIndex: 7, nominalMonth: 7, nominalDay: 7 },
  { name: "입추", longitude: 135, branchIndex: 8, nominalMonth: 8, nominalDay: 8 },
  { name: "백로", longitude: 165, branchIndex: 9, nominalMonth: 9, nominalDay: 8 },
  { name: "한로", longitude: 195, branchIndex: 10, nominalMonth: 10, nominalDay: 8 },
  { name: "입동", longitude: 225, branchIndex: 11, nominalMonth: 11, nominalDay: 7 },
  { name: "대설", longitude: 255, branchIndex: 0, nominalMonth: 12, nominalDay: 7 },
  { name: "소한", longitude: 285, branchIndex: 1, nominalMonth: 1, nominalDay: 6 },
] as const;

export type MajorTerm = (typeof MAJOR_TERMS)[number];

/** Julian Day from a UTC instant. */
export function julianDay(utcMilliseconds: number): number {
  return utcMilliseconds / 86_400_000 + 2_440_587.5;
}

/** UTC instant from a Julian Day. */
export function fromJulianDay(jd: number): number {
  return (jd - 2_440_587.5) * 86_400_000;
}

/**
 * ΔT, the gap between Terrestrial Time (which the solar series is written in) and the
 * Universal Time a clock shows. Espenak & Meeus polynomial fits. Around seventy seconds
 * for the present era — far inside the uncertainty above, but the calculation is not
 * defensible with it simply left out.
 */
export function deltaTSeconds(year: number): number {
  if (year < 1600) {
    const u = (year - 1000) / 100;
    return 1574.2 - 556.01 * u + 71.23472 * u ** 2 + 0.319781 * u ** 3
      - 0.8503463 * u ** 4 - 0.005050998 * u ** 5 + 0.0083572073 * u ** 6;
  }
  if (year < 1700) {
    const t = year - 1600;
    return 120 - 0.9808 * t - 0.01532 * t ** 2 + t ** 3 / 7129;
  }
  if (year < 1800) {
    const t = year - 1700;
    return 8.83 + 0.1603 * t - 0.0059285 * t ** 2 + 0.00013336 * t ** 3
      - t ** 4 / 1_174_000;
  }
  if (year < 1860) {
    const t = year - 1800;
    return 13.72 - 0.332447 * t + 0.0068612 * t ** 2 + 0.0041116 * t ** 3
      - 0.00037436 * t ** 4 + 0.0000121272 * t ** 5 - 0.0000001699 * t ** 6
      + 0.000000000875 * t ** 7;
  }
  if (year < 1900) {
    const t = year - 1860;
    return 7.62 + 0.5737 * t - 0.251754 * t ** 2 + 0.01680668 * t ** 3
      - 0.0004473624 * t ** 4 + t ** 5 / 233_174;
  }
  if (year < 1920) {
    const t = year - 1900;
    return -2.79 + 1.494_119 * t - 0.059_393_9 * t * t + 0.000_610_966 * t ** 3
      + 0.000_001_973_46 * t ** 4;
  }
  if (year < 1941) {
    const t = year - 1920;
    return 21.20 + 0.845_493 * t - 0.076_100 * t * t + 0.002_0936 * t ** 3;
  }
  if (year < 1961) {
    const t = year - 1950;
    return 29.07 + 0.407 * t - (t * t) / 233 + (t ** 3) / 2547;
  }
  if (year < 1986) {
    const t = year - 1975;
    return 45.45 + 1.067 * t - (t * t) / 260 - (t ** 3) / 718;
  }
  if (year < 2005) {
    const t = year - 2000;
    return 63.86 + 0.3345 * t - 0.060_374 * t * t + 0.001_7275 * t ** 3
      + 0.000_651_814 * t ** 4 + 0.000_023_73599 * t ** 5;
  }
  if (year < 2050) {
    const t = year - 2000;
    return 62.92 + 0.32217 * t + 0.005_589 * t * t;
  }
  const t = (year - 1820) / 100;
  return -20 + 32 * t * t - 0.5628 * (2150 - year);
}

/**
 * Apparent geocentric longitude of the sun, in degrees, for a Julian Ephemeris Day.
 * Meeus ch. 25: mean longitude, equation of centre, then the nutation-and-aberration
 * correction that turns true longitude into apparent.
 */
export function apparentSolarLongitude(jde: number): number {
  const t = (jde - 2_451_545) / 36_525;
  const meanLongitude = 280.466_46 + 36_000.769_83 * t + 0.000_303_2 * t * t;
  const meanAnomaly = 357.529_11 + 35_999.050_29 * t - 0.000_153_7 * t * t;
  const m = meanAnomaly * DEG;
  const centre =
    (1.914_602 - 0.004_817 * t - 0.000_014 * t * t) * Math.sin(m) +
    (0.019_993 - 0.000_101 * t) * Math.sin(2 * m) +
    0.000_289 * Math.sin(3 * m);
  const omega = (125.04 - 1934.136 * t) * DEG;
  const apparent = meanLongitude + centre - 0.005_69 - 0.004_78 * Math.sin(omega);
  return ((apparent % 360) + 360) % 360;
}

/** Signed difference between two longitudes, wrapped into (-180, 180]. */
function longitudeGap(from: number, to: number): number {
  return ((from - to + 540) % 360) - 180;
}

/**
 * The UTC instant at which the sun reaches `targetLongitude`, near the given calendar
 * date. Newton's method on a function whose slope is the sun's own motion, about
 * 0.9856° per day; three passes are enough from a seed a few days out.
 */
export function solarTermInstant(
  year: number,
  month: number,
  day: number,
  targetLongitude: number,
): number {
  let jd = julianDay(Date.UTC(year, month - 1, day, 12));
  for (let pass = 0; pass < 8; pass += 1) {
    const jde = jd + deltaTSeconds(year) / 86_400;
    const gap = longitudeGap(apparentSolarLongitude(jde), targetLongitude);
    if (Math.abs(gap) < 1e-8) break;
    jd -= gap / 0.985_647_36;
  }
  return fromJulianDay(jd);
}

export type ResolvedTerm = {
  readonly term: MajorTerm;
  /** UTC milliseconds. */
  readonly at: number;
};

/**
 * Every 절 of the given Gregorian year, in order. 소한 sits in January, so the list a
 * caller needs to span one 사주 year always crosses a Gregorian boundary — which is why
 * `termsSpanning` below reaches into the neighbouring years rather than this being used
 * on its own.
 */
export function termsOfYear(year: number): readonly ResolvedTerm[] {
  return MAJOR_TERMS.map((term) => ({
    term,
    at: solarTermInstant(year, term.nominalMonth, term.nominalDay, term.longitude),
  })).sort((left, right) => left.at - right.at);
}

/** The 절 of the year before, the year itself, and the year after, in one sorted list. */
export function termsSpanning(year: number): readonly ResolvedTerm[] {
  return [...termsOfYear(year - 1), ...termsOfYear(year), ...termsOfYear(year + 1)]
    .sort((left, right) => left.at - right.at);
}

/**
 * The 절 that governs `instant`, and the one that ends it. The governing term is the last
 * one at or before the instant — a birth on the morning of 입춘 but before the crossing
 * still belongs to the previous month, and to the previous year pillar.
 */
export function governingTerm(instant: number, year: number): {
  readonly current: ResolvedTerm;
  readonly next: ResolvedTerm;
} {
  const terms = termsSpanning(year);
  const index = terms.findLastIndex((entry) => entry.at <= instant);
  if (index < 0 || index + 1 >= terms.length) {
    throw new RangeError("Birth instant falls outside the computed term range.");
  }
  return { current: terms[index]!, next: terms[index + 1]! };
}
