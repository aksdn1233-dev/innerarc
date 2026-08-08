import { describe, expect, it } from "vitest";
import {
  createRealityCheckQueue,
  REALITY_CHECK_RULE_VERSION,
  RealityCheckInputError,
  type FitRating,
  type RealityCheckQueueFilter,
  type RealityCheckRecord,
} from "@/core/reality-check";

function record(
  id: string,
  reviewDate: string,
  options: {
    createdAt?: string;
    reviewedAt?: string;
    fit?: FitRating;
  } = {},
): RealityCheckRecord {
  const createdAt = options.createdAt ?? "2026-07-01T10:00:00.000Z";
  const reviewedAt = options.reviewedAt;
  return {
    id,
    clientRequestId: `create:${id}:request`,
    category: "relationship",
    question: `Question ${id}`,
    currentState: "A bounded current state.",
    interpretation: "A symbolic hypothesis.",
    choice: "Observe before concluding.",
    actionPlan: "Record one observable result.",
    reviewDate,
    createdAt,
    updatedAt: reviewedAt ?? createdAt,
    ruleVersion: REALITY_CHECK_RULE_VERSION,
    ...(reviewedAt
      ? {
          review: {
            clientRequestId: `review:${id}:request`,
            outcome: `Outcome ${id}`,
            fit: options.fit ?? "mostly_relevant",
            learning: `Learning ${id}`,
            reviewedAt,
            reviewedMonth: reviewedAt.slice(0, 7),
          },
        }
      : {}),
  };
}

describe("Reality Check review queue", () => {
  it("counts every status and sorts the next action before later work", () => {
    const queue = createRealityCheckQueue([
      record("reviewed-older", "2026-07-02", { reviewedAt: "2026-07-20T10:00:00.000Z" }),
      record("planned-later", "2026-08-12"),
      record("due-later", "2026-07-26"),
      record("reviewed-newer", "2026-07-03", { reviewedAt: "2026-07-22T10:00:00.000Z" }),
      record("due-first", "2026-07-24"),
      record("planned-first", "2026-08-02"),
    ], "2026-07-27");

    expect(queue).toMatchObject({
      totalCount: 6,
      dueCount: 2,
      plannedCount: 2,
      reviewedCount: 2,
      nextDueId: "due-first",
    });
    expect(queue.items.map(({ record: item }) => item.id)).toEqual([
      "due-first",
      "due-later",
      "planned-first",
      "planned-later",
      "reviewed-newer",
      "reviewed-older",
    ]);
  });

  it("treats the local review date itself as ready", () => {
    const queue = createRealityCheckQueue([record("same-day", "2026-07-27")], "2026-07-27");
    expect(queue.dueCount).toBe(1);
    expect(queue.items[0]?.status).toBe("due");
  });

  it.each(["due", "planned", "reviewed"] as const)(
    "filters to %s while preserving totals and next-ready context",
    (filter) => {
      const records = [
        record("due", "2026-07-20"),
        record("planned", "2026-08-20"),
        record("reviewed", "2026-07-10", { reviewedAt: "2026-07-21T10:00:00.000Z" }),
      ];
      const queue = createRealityCheckQueue(records, "2026-07-27", filter);

      expect(queue.items).toHaveLength(1);
      expect(queue.items[0]?.status).toBe(filter);
      expect(queue).toMatchObject({
        totalCount: 3,
        dueCount: 1,
        plannedCount: 1,
        reviewedCount: 1,
        nextDueId: "due",
      });
    },
  );

  it("uses creation time and ID as deterministic ties without mutating input", () => {
    const records = [
      record("z-id", "2026-07-25", { createdAt: "2026-07-02T10:00:00.000Z" }),
      record("b-id", "2026-07-25", { createdAt: "2026-07-01T10:00:00.000Z" }),
      record("a-id", "2026-07-25", { createdAt: "2026-07-01T10:00:00.000Z" }),
    ];
    const before = JSON.stringify(records);

    const queue = createRealityCheckQueue(records, "2026-07-27");

    expect(queue.items.map(({ record: item }) => item.id)).toEqual(["a-id", "b-id", "z-id"]);
    expect(JSON.stringify(records)).toBe(before);
  });

  it("rejects invalid dates, filters, and more than 500 records", () => {
    expect(() => createRealityCheckQueue([], "2026-02-30")).toThrow(RealityCheckInputError);
    expect(() => createRealityCheckQueue(
      [],
      "2026-07-27",
      "unknown" as RealityCheckQueueFilter,
    )).toThrow(RealityCheckInputError);
    expect(() => createRealityCheckQueue(
      Array.from({ length: 501 }, (_, index) => record(`item-${index}`, "2026-07-27")),
      "2026-07-27",
    )).toThrow(RealityCheckInputError);
  });
});
