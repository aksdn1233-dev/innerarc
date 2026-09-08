/** Supported product input range, including historical comparison dates.
 * Saju keeps its own narrower engine range. These are policy bounds, not a
 * statement about today's date; keep them aligned with the bilingual form copy.
 */
export const MIN_BIRTH_YEAR = 1100;
export const MAX_BIRTH_YEAR = 2026;
export const MIN_BIRTH_DATE = `${MIN_BIRTH_YEAR}-01-01`;
export const MAX_BIRTH_DATE = `${MAX_BIRTH_YEAR}-12-31`;

/** Fixed product upper bound; legacy date argument retained for callers. */
export function currentMaxBirthDate(_now: Date = new Date()): string {
  void _now;
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
