import { getRealityCheckStatus } from "./engine";
import type { RealityCheckRecord, RealityCheckStatus } from "./types";

// Surfaces what to look at next instead of leaving every saved reflection in one flat
// list: due outcomes first (earliest review date first, since that one has waited
// longest), then planned, then already-reviewed, so opening the page always puts the
// next real decision at the top.

export const realityCheckQueueFilters = ["all", "due", "planned", "reviewed"] as const;
export type RealityCheckQueueFilter = (typeof realityCheckQueueFilters)[number];

export type RealityCheckQueueItem = Readonly<{
  record: RealityCheckRecord;
  status: RealityCheckStatus;
}>;

export type RealityCheckQueue = Readonly<{
  items: readonly RealityCheckQueueItem[];
  totalCount: number;
  dueCount: number;
  plannedCount: number;
  reviewedCount: number;
  /** The earliest-due record's ID, or null when nothing is ready to review. */
  nextDueId: string | null;
}>;

const STATUS_ORDER: Readonly<Record<RealityCheckStatus, number>> = {
  due: 0,
  planned: 1,
  reviewed: 2,
};

export function createRealityCheckQueue(
  records: readonly RealityCheckRecord[],
  today: string,
  filter: RealityCheckQueueFilter,
): RealityCheckQueue {
  const withStatus = records
    .map((record) => ({ record, status: getRealityCheckStatus(record, today) }))
    .sort((a, b) => {
      const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (byStatus !== 0) return byStatus;
      return a.record.reviewDate.localeCompare(b.record.reviewDate);
    });

  const dueCount = withStatus.filter((entry) => entry.status === "due").length;
  const plannedCount = withStatus.filter((entry) => entry.status === "planned").length;
  const reviewedCount = withStatus.filter((entry) => entry.status === "reviewed").length;
  const nextDueId = withStatus.find((entry) => entry.status === "due")?.record.id ?? null;

  const items = filter === "all"
    ? withStatus
    : withStatus.filter((entry) => entry.status === filter);

  return {
    items,
    totalCount: withStatus.length,
    dueCount,
    plannedCount,
    reviewedCount,
    nextDueId,
  };
}
