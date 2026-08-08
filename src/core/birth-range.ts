/**
 * What a visitor is allowed to enter as their own birth date.
 *
 * This is a product policy, not an engine limit, and the difference matters. The
 * numerology engine calculates any valid date — the celebrity comparison depends on that,
 * since it reads public figures born well before 1900. The 사주 engine stops at 1900
 * because the Korean standard-time history it encodes does not reach further back. What
 * a *customer* may submit is narrower than either, and is stated here once.
 *
 * The upper bound is today rather than the engines' 2100: a birth date in the future is
 * always a typo. The lower bound is 1900, past the oldest year anyone alive was born in.
 */
export const MIN_BIRTH_YEAR = 1900;
export const MIN_BIRTH_DATE = `${MIN_BIRTH_YEAR}-01-01`;

/** Today, in the visitor's own timezone. */
export function currentMaxBirthDate(now: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
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
  return value >= MIN_BIRTH_DATE && value <= currentMaxBirthDate(now);
}
