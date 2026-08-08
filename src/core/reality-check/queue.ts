import { getRealityCheckStatus } from "./engine";
import {
  RealityCheckInputError,
  type RealityCheckRecord,
  type RealityCheckStatus,
} from "./types";

export const realityCheckQueueFilters = ["all", "due", "planned", "reviewed"] as const;
export type RealityCheckQueueFilter = (typeof realityCheckQueueFilters)[number];

export interface RealityCheckQueueItem {
  record: RealityCheckRecord;
  status: RealityCheckStatus;
}

export interface RealityCheckQueue {
  filter: RealityCheckQueueFilter;
  totalCount: number;
  dueCount: number;
  plannedCount: number;
  reviewedCount: number;
  nextDueId: string | null;
  items: readonly RealityCheckQueueItem[];
}

function assertDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new RealityCheckInputError("today", "today must use YYYY-MM-DD.");
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new RealityCheckInputError("today", "today must be a real date.");
  }
  return value;
}

function assertFilter(value: RealityCheckQueueFilter): RealityCheckQueueFilter {
  if (!realityCheckQueueFilters.includes(value)) {
    throw new RealityCheckInputError("filter", "Unsupported Reality Check queue filter.");
  }
  return value;
}

function compareQueueItems(left: RealityCheckQueueItem, right: RealityCheckQueueItem): number {
  const priority: Record<RealityCheckStatus, number> = {
    due: 0,
    planned: 1,
    reviewed: 2,
  };
  const priorityDifference = priority[left.status] - priority[right.status];
  if (priorityDifference) return priorityDifference;

  if (left.status === "reviewed" && right.status === "reviewed") {
    const leftReviewedAt = left.record.review?.reviewedAt ?? left.record.updatedAt;
    const rightReviewedAt = right.record.review?.reviewedAt ?? right.record.updatedAt;
    return rightReviewedAt.localeCompare(leftReviewedAt)
      || right.record.createdAt.localeCompare(left.record.createdAt)
      || left.record.id.localeCompare(right.record.id);
  }

  return left.record.reviewDate.localeCompare(right.record.reviewDate)
    || left.record.createdAt.localeCompare(right.record.createdAt)
    || left.record.id.localeCompare(right.record.id);
}

export function createRealityCheckQueue(
  records: readonly RealityCheckRecord[],
  today: string,
  filter: RealityCheckQueueFilter = "all",
): RealityCheckQueue {
  if (!Array.isArray(records) || records.length > 500) {
    throw new RealityCheckInputError("records", "At most 500 Reality Check records are supported.");
  }
  const checkedToday = assertDate(today);
  const checkedFilter = assertFilter(filter);
  const ordered = records
    .map((record) => ({
      record,
      status: getRealityCheckStatus(record, checkedToday),
    }))
    .sort(compareQueueItems);

  const due = ordered.filter(({ status }) => status === "due");
  const items = checkedFilter === "all"
    ? ordered
    : ordered.filter(({ status }) => status === checkedFilter);

  return {
    filter: checkedFilter,
    totalCount: ordered.length,
    dueCount: due.length,
    plannedCount: ordered.filter(({ status }) => status === "planned").length,
    reviewedCount: ordered.filter(({ status }) => status === "reviewed").length,
    nextDueId: due[0]?.record.id ?? null,
    items,
  };
}
