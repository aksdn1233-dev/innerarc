// Operating numbers derived from the orders the site already records. Nothing here
// tracks a visitor: there is no analytics sink connected, and request-level traffic is
// visible in the hosting dashboard without putting a tracker on the page.
export type OrderRow = Readonly<{
  product_code: string;
  amount: number;
  status: string;
  provider: string;
  created_at: string;
}>;

export type ProductBreakdown = Readonly<{
  productCode: string;
  paidCount: number;
  revenue: number;
}>;

export type AdminMetrics = Readonly<{
  /** Orders that reached checkout, whether or not they were paid. */
  started: number;
  paid: number;
  cancelled: number;
  awaitingDeposit: number;
  abandoned: number;
  revenue: number;
  refunded: number;
  /** Paid divided by started, as a percentage rounded to one decimal. */
  conversionRate: number;
  /** Cancelled divided by paid-or-cancelled, as a percentage. */
  cancelRate: number;
  averageOrderValue: number;
  products: readonly ProductBreakdown[];
  /** Newest last, so it reads left to right as a timeline. */
  daily: readonly Readonly<{ date: string; started: number; paid: number; revenue: number }>[];
}>;

const PAID = new Set(["DONE"]);
const CANCELLED = new Set(["CANCELED", "PARTIAL_CANCELED"]);
const WAITING = new Set(["WAITING_FOR_DEPOSIT"]);

function percentage(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1_000) / 10;
}

/** Local calendar day of an ISO timestamp, so a day boundary matches the operator's. */
function dayKey(iso: string, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date(iso));
}

export function summarizeOrders(
  orders: readonly OrderRow[],
  options: Readonly<{ now: Date; days: number; timeZone?: string }>,
): AdminMetrics {
  const timeZone = options.timeZone ?? "Asia/Seoul";
  const started = orders.length;
  const paidOrders = orders.filter((order) => PAID.has(order.status));
  const cancelledOrders = orders.filter((order) => CANCELLED.has(order.status));
  const awaitingDeposit = orders.filter((order) => WAITING.has(order.status)).length;

  const revenue = paidOrders.reduce((total, order) => total + order.amount, 0);
  const refunded = cancelledOrders.reduce((total, order) => total + order.amount, 0);
  const settled = paidOrders.length + cancelledOrders.length;

  const byProduct = new Map<string, { paidCount: number; revenue: number }>();
  for (const order of paidOrders) {
    const entry = byProduct.get(order.product_code) ?? { paidCount: 0, revenue: 0 };
    entry.paidCount += 1;
    entry.revenue += order.amount;
    byProduct.set(order.product_code, entry);
  }

  const daily: { date: string; started: number; paid: number; revenue: number }[] = [];
  const index = new Map<string, number>();
  for (let back = options.days - 1; back >= 0; back -= 1) {
    const day = new Date(options.now.getTime() - back * 24 * 60 * 60 * 1_000);
    const key = dayKey(day.toISOString(), timeZone);
    index.set(key, daily.length);
    daily.push({ date: key, started: 0, paid: 0, revenue: 0 });
  }
  for (const order of orders) {
    const position = index.get(dayKey(order.created_at, timeZone));
    if (position === undefined) continue;
    daily[position].started += 1;
    if (PAID.has(order.status)) {
      daily[position].paid += 1;
      daily[position].revenue += order.amount;
    }
  }

  return {
    started,
    paid: paidOrders.length,
    cancelled: cancelledOrders.length,
    awaitingDeposit,
    // Reached checkout and then neither paid nor cancelled.
    abandoned: started - paidOrders.length - cancelledOrders.length - awaitingDeposit,
    revenue,
    refunded,
    conversionRate: percentage(paidOrders.length, started),
    cancelRate: percentage(cancelledOrders.length, settled),
    averageOrderValue: paidOrders.length > 0
      ? Math.round(revenue / paidOrders.length)
      : 0,
    products: [...byProduct.entries()]
      .map(([productCode, entry]) => ({ productCode, ...entry }))
      .sort((a, b) => b.revenue - a.revenue),
    daily,
  };
}
