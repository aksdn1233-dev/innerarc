// A guest buyer's only proof of purchase is the access token inside their report
// URL. Holding that in sessionStorage loses it whenever the payment provider returns
// through a fresh browsing context — which is exactly what a virtual-account deposit
// hours later, or a KakaoPay/Toss app hand-off, produces. The buyer has then paid and
// has no way back to the report.
//
// This keeps the link in durable per-order storage instead. Only the report URL is
// written: no birth date, name, question, or payment detail. Entries expire, are
// validated against the current origin on read, and are pruned on every save.
const KEY_PREFIX = "gyeol.reportLink.";
const TTL_DAYS = 45;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1_000;
const ORDER_ID_PATTERN = /^[A-Za-z0-9_-]{6,64}$/;

export const guestReportLinkTtlDays = TTL_DAYS;

// Only the handful of Storage members used here, so callers can pass localStorage
// directly and tests can pass a plain in-memory double.
export type ReportLinkStorage = Readonly<{
  length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}>;

type StoredLink = Readonly<{ url: string; savedAt: string }>;

export function guestReportLinkKey(orderId: string): string {
  return `${KEY_PREFIX}${orderId}`;
}

function parseStoredLink(raw: string | null): StoredLink | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { url, savedAt } = parsed as Record<string, unknown>;
    if (typeof url !== "string" || typeof savedAt !== "string") return null;
    if (Number.isNaN(Date.parse(savedAt))) return null;
    return { url, savedAt };
  } catch {
    return null;
  }
}

function isExpired(savedAt: string, now: Date): boolean {
  return now.getTime() - Date.parse(savedAt) > TTL_MS;
}

function matchesOrder(url: string, orderId: string, origin: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.origin === origin && parsed.pathname.endsWith(`/reports/${orderId}`);
  } catch {
    return false;
  }
}

/** Drops expired or unreadable entries. Returns how many were removed. */
export function pruneGuestReportLinks(storage: ReportLinkStorage, now: Date): number {
  const stale: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key?.startsWith(KEY_PREFIX)) continue;
    const stored = parseStoredLink(storage.getItem(key));
    if (!stored || isExpired(stored.savedAt, now)) stale.push(key);
  }
  for (const key of stale) storage.removeItem(key);
  return stale.length;
}

/**
 * Stores the report link for a paid order. Returns false when the input is not a
 * report URL for this order, or when storage refuses the write (private-mode quota),
 * so the caller can fall back to showing the link on screen.
 */
export function saveGuestReportLink(
  storage: ReportLinkStorage,
  input: Readonly<{ orderId: string; url: string; origin: string; now: Date }>,
): boolean {
  if (!ORDER_ID_PATTERN.test(input.orderId)) return false;
  if (!matchesOrder(input.url, input.orderId, input.origin)) return false;
  try {
    pruneGuestReportLinks(storage, input.now);
    const record: StoredLink = { url: input.url, savedAt: input.now.toISOString() };
    storage.setItem(guestReportLinkKey(input.orderId), JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns the stored report link, or null when it is missing, expired, unreadable, or
 * points somewhere other than this order on this origin. Invalid entries are cleared
 * rather than retried.
 */
export function readGuestReportLink(
  storage: ReportLinkStorage,
  input: Readonly<{ orderId: string; origin: string; now: Date }>,
): string | null {
  if (!ORDER_ID_PATTERN.test(input.orderId)) return null;
  const key = guestReportLinkKey(input.orderId);
  let stored: StoredLink | null;
  try {
    stored = parseStoredLink(storage.getItem(key));
  } catch {
    return null;
  }
  if (!stored) return null;
  if (
    isExpired(stored.savedAt, input.now) ||
    !matchesOrder(stored.url, input.orderId, input.origin)
  ) {
    try {
      storage.removeItem(key);
    } catch {
      // A storage that cannot be written to also cannot hold a stale entry open.
    }
    return null;
  }
  return stored.url;
}
