import { describe, expect, it } from "vitest";
import {
  metricDimension,
  summarizeOperationalMetrics,
  type OperationalMetricRow,
} from "@/server/operational-metrics";
import { parseOperationalMetricFile } from "@/server/admin-storage";

const dates = ["2026-08-01", "2026-08-02"];

function row(
  event_name: OperationalMetricRow["event_name"],
  count: number,
  metric_date = dates[1],
): OperationalMetricRow {
  return { event_name, count, metric_date, locale: "ko", dimension: "all" };
}

describe("privacy-minimized operational metrics", () => {
  it("summarizes the requested landing-to-payment funnel", () => {
    const result = summarizeOperationalMetrics([
      row("landing_view", 20),
      row("primary_cta_click", 10),
      row("form_start", 8),
      row("form_complete", 4),
      row("payment_start", 4),
      row("payment_success", 3),
      row("payment_fail", 1),
    ], dates);

    expect(result.pageViews).toBe(20);
    expect(result.formCompletionRate).toBe(50);
    expect(result.checkoutCompletionRate).toBe(75);
    expect(result.daily).toEqual([
      { date: "2026-08-01", pageViews: 0, formStarts: 0, payments: 0 },
      { date: "2026-08-02", pageViews: 20, formStarts: 8, payments: 3 },
    ]);
  });

  it("keeps only allowlisted categorical dimensions", () => {
    expect(metricDimension({ productCode: "pro_30d", question: "private" }))
      .toBe("productCode:pro_30d");
    expect(metricDimension({ question: "private", birthDate: "1994-11-04" }))
      .toBe("all");
  });

  it("never divides by zero", () => {
    const empty = summarizeOperationalMetrics([], dates);
    expect(empty.formCompletionRate).toBe(0);
    expect(empty.checkoutCompletionRate).toBe(0);
  });

  it("accepts only generated allowlisted marker names", () => {
    expect(parseOperationalMetricFile(
      "2026-08-02",
      "ko--landing_view--all--11111111-1111-4111-8111-111111111111.evt",
    )).toMatchObject({
      metric_date: "2026-08-02",
      locale: "ko",
      event_name: "landing_view",
      dimension: "all",
      count: 1,
    });
    expect(parseOperationalMetricFile(
      "2026-08-02",
      "ko--private_question--all--11111111-1111-4111-8111-111111111111.evt",
    )).toBeNull();
  });
});
