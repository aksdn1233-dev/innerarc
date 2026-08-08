/**
 * What a visitor is allowed to enter as their own birth date.
 *
 * This is a product policy, not an engine limit, and the difference matters. The
 * numerology engine calculates any valid date — the celebrity comparison depends on that,
 * since it reads historical public figures. The 사주 engine's verified solar-term series
 * starts at 1100. What a *customer* may submit is stated here once.
 *
 * The upper bound is today rather than the engines' 2100: a birth date in the future is
 * always a typo. The lower bound matches the verified historical calculation window.
 */
export const MIN_BIRTH_YEAR = 1100;
export const MAX_BIRTH_YEAR = 2026;
export const MIN_BIRTH_DATE = `${MIN_BIRTH_YEAR}-01-01`;
export const MAX_BIRTH_DATE = `${MAX_BIRTH_YEAR}-12-31`;

/** Today, in the visitor's own timezone. */
export function currentMaxBirthDate(_now: Date = new Date()): string {
  return MAX_BIRTH_DATE;
}

/**
 * Whether a submitted birth date is one this product will read.
 *
 * The date fields carry `min` and `max`, but those are a convenience, not a guarantee —
 * a form can be submitted without them. This is what catches the typo the engine used to
 * compute straight through: 1994 with a dropped leading digit becomes 0194, which is a
 * valid date and a wrong millennium.
 */
export function isAcceptedBirthDate(value: string, now: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  if (value < MIN_BIRTH_DATE || value > currentMaxBirthDate(now)) return false;
  const [year, month, day] = value.split("-").map(Number) as [number, number, number];
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
}
