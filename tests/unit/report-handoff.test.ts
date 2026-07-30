import { describe, expect, it } from "vitest";
import {
  guestReportLinkKey,
  guestReportLinkTtlDays,
  pruneGuestReportLinks,
  readGuestReportLink,
  saveGuestReportLink,
  type ReportLinkStorage,
} from "@/core/report-handoff";

const ORIGIN = "https://gyeol.example";
const ORDER = "ia0123456789abcdef";
const REPORT_URL = `${ORIGIN}/ko/reports/${ORDER}?access=token-value`;
const NOW = new Date("2026-07-28T00:00:00.000Z");

function createStorage(seed: Record<string, string> = {}): ReportLinkStorage & {
  entries: Map<string, string>;
} {
  const entries = new Map(Object.entries(seed));
  return {
    entries,
    get length() {
      return entries.size;
    },
    key: (index) => [...entries.keys()][index] ?? null,
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => {
      entries.set(key, value);
    },
    removeItem: (key) => {
      entries.delete(key);
    },
  };
}

function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1_000);
}

describe("guest report handoff", () => {
  it("round-trips a report link across a lost session", () => {
    const storage = createStorage();

    expect(saveGuestReportLink(storage, {
      orderId: ORDER,
      url: REPORT_URL,
      origin: ORIGIN,
      now: NOW,
    })).toBe(true);
    // A virtual-account buyer returns the next day in a brand new browsing context.
    expect(readGuestReportLink(storage, {
      orderId: ORDER,
      origin: ORIGIN,
      now: daysAgo(-1),
    })).toBe(REPORT_URL);
  });

  it("stores only the report URL and its timestamp", () => {
    const storage = createStorage();
    saveGuestReportLink(storage, { orderId: ORDER, url: REPORT_URL, origin: ORIGIN, now: NOW });

    const raw = storage.getItem(guestReportLinkKey(ORDER));
    expect(raw).not.toBeNull();
    expect(Object.keys(JSON.parse(raw as string)).sort()).toEqual(["savedAt", "url"]);
  });

  it("refuses URLs that are not this order's report on this origin", () => {
    const storage = createStorage();
    const rejected = [
      `${ORIGIN}/ko/reports/ia9999999999999999?access=other`,
      "https://attacker.example/ko/reports/" + ORDER,
      `${ORIGIN}/ko/me`,
      "not-a-url",
    ];

    for (const url of rejected) {
      expect(saveGuestReportLink(storage, { orderId: ORDER, url, origin: ORIGIN, now: NOW }))
        .toBe(false);
    }
    expect(storage.entries.size).toBe(0);
  });

  it("rejects malformed order ids", () => {
    const storage = createStorage();
    expect(saveGuestReportLink(storage, {
      orderId: "short",
      url: REPORT_URL,
      origin: ORIGIN,
      now: NOW,
    })).toBe(false);
    expect(readGuestReportLink(storage, { orderId: "short", origin: ORIGIN, now: NOW }))
      .toBeNull();
  });

  it("expires and clears links past the retention window", () => {
    const storage = createStorage({
      [guestReportLinkKey(ORDER)]: JSON.stringify({
        url: REPORT_URL,
        savedAt: daysAgo(guestReportLinkTtlDays + 1).toISOString(),
      }),
    });

    expect(readGuestReportLink(storage, { orderId: ORDER, origin: ORIGIN, now: NOW })).toBeNull();
    expect(storage.entries.size).toBe(0);
  });

  it("clears a link whose origin no longer matches instead of following it", () => {
    const storage = createStorage({
      [guestReportLinkKey(ORDER)]: JSON.stringify({
        url: `https://old-domain.example/ko/reports/${ORDER}?access=token-value`,
        savedAt: NOW.toISOString(),
      }),
    });

    expect(readGuestReportLink(storage, { orderId: ORDER, origin: ORIGIN, now: NOW })).toBeNull();
    expect(storage.entries.size).toBe(0);
  });

  it("ignores unreadable entries without throwing", () => {
    const storage = createStorage({ [guestReportLinkKey(ORDER)]: "{not json" });
    expect(readGuestReportLink(storage, { orderId: ORDER, origin: ORIGIN, now: NOW })).toBeNull();
  });

  it("prunes only its own expired keys and leaves other data alone", () => {
    const storage = createStorage({
      "unrelated.key": "keep me",
      [guestReportLinkKey("ia1111111111111111")]: JSON.stringify({
        url: `${ORIGIN}/ko/reports/ia1111111111111111`,
        savedAt: daysAgo(guestReportLinkTtlDays + 5).toISOString(),
      }),
      [guestReportLinkKey("ia2222222222222222")]: JSON.stringify({
        url: `${ORIGIN}/ko/reports/ia2222222222222222`,
        savedAt: daysAgo(1).toISOString(),
      }),
    });

    expect(pruneGuestReportLinks(storage, NOW)).toBe(1);
    expect([...storage.entries.keys()].sort()).toEqual([
      guestReportLinkKey("ia2222222222222222"),
      "unrelated.key",
    ]);
  });

  it("reports failure instead of throwing when storage refuses writes", () => {
    const storage: ReportLinkStorage = {
      length: 0,
      key: () => null,
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
      removeItem: () => {},
    };

    expect(saveGuestReportLink(storage, {
      orderId: ORDER,
      url: REPORT_URL,
      origin: ORIGIN,
      now: NOW,
    })).toBe(false);
  });
});
