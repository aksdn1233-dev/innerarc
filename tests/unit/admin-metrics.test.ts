import { describe, expect, it } from "vitest";
import { summarizeOrders, type OrderRow } from "@/server/admin-metrics";

const NOW = new Date("2026-07-28T12:00:00.000Z");

function order(overrides: Partial<OrderRow> = {}): OrderRow {
  return {
    product_code: "plus_30d",
    amount: 19_000,
    status: "DONE",
    provider: "payapp",
    created_at: NOW.toISOString(),
    ...overrides,
  };
}

describe("admin metrics", () => {
  it("counts the funnel without double-counting any order", () => {
    const orders = [
      order(),
      order({ amount: 39_000, product_code: "pro_30d" }),
      order({ status: "CANCELED" }),
      order({ status: "WAITING_FOR_DEPOSIT" }),
      order({ status: "READY" }),
    ];
    const metrics = summarizeOrders(orders, { now: NOW, days: 30 });

    expect(metrics.started).toBe(5);
    expect(metrics.paid).toBe(2);
    expect(metrics.cancelled).toBe(1);
    expect(metrics.awaitingDeposit).toBe(1);
    expect(metrics.abandoned).toBe(1);
    expect(metrics.paid + metrics.cancelled + metrics.awaitingDeposit + metrics.abandoned)
      .toBe(metrics.started);
  });

  it("counts money only from orders that were actually paid", () => {
    const metrics = summarizeOrders([
      order(),
      order({ amount: 79_000, product_code: "premium_pdf" }),
      order({ amount: 39_000, status: "CANCELED" }),
      order({ amount: 39_000, status: "READY" }),
    ], { now: NOW, days: 30 });

    expect(metrics.revenue).toBe(98_000);
    expect(metrics.refunded).toBe(39_000);
    expect(metrics.averageOrderValue).toBe(49_000);
  });

  it("reports rates as percentages and never divides by zero", () => {
    const empty = summarizeOrders([], { now: NOW, days: 7 });
    expect(empty.conversionRate).toBe(0);
    expect(empty.cancelRate).toBe(0);
    expect(empty.averageOrderValue).toBe(0);
    expect(empty.daily).toHaveLength(7);

    const metrics = summarizeOrders([
      order(), order(), order({ status: "CANCELED" }), order({ status: "READY" }),
    ], { now: NOW, days: 30 });
    // 2 paid of 4 started; 1 cancelled of 3 settled.
    expect(metrics.conversionRate).toBe(50);
    expect(metrics.cancelRate).toBe(33.3);
  });

  it("ranks products by revenue, not by order count", () => {
    const metrics = summarizeOrders([
      order(), order(), order(),
      order({ amount: 79_000, product_code: "premium_pdf" }),
    ], { now: NOW, days: 30 });

    expect(metrics.products[0].productCode).toBe("premium_pdf");
    expect(metrics.products[0].revenue).toBe(79_000);
    expect(metrics.products[1].paidCount).toBe(3);
  });

  it("builds a continuous timeline with the newest day last", () => {
    const yesterday = new Date(NOW.getTime() - 24 * 60 * 60 * 1_000).toISOString();
    const metrics = summarizeOrders([
      order({ created_at: yesterday }),
      order({ created_at: NOW.toISOString() }),
    ], { now: NOW, days: 5, timeZone: "UTC" });

    expect(metrics.daily).toHaveLength(5);
    expect(metrics.daily.at(-1)?.date).toBe("2026-07-28");
    expect(metrics.daily.at(-1)?.paid).toBe(1);
    expect(metrics.daily.at(-2)?.paid).toBe(1);
    expect(metrics.daily[0].started).toBe(0);
  });

  it("ignores orders outside the window instead of misplacing them", () => {
    const old = new Date(NOW.getTime() - 60 * 24 * 60 * 60 * 1_000).toISOString();
    const metrics = summarizeOrders([order({ created_at: old })], {
      now: NOW,
      days: 7,
      timeZone: "UTC",
    });

    // Still part of the totals it was queried for, but not charted on a wrong day.
    expect(metrics.daily.reduce((sum, day) => sum + day.started, 0)).toBe(0);
  });
});
