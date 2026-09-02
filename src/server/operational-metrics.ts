export const OPERATIONAL_EVENT_NAMES = [
  "landing_view",
  "journey_view",
  "primary_cta_click",
  "sample_section_view",
  "product_view",
  "product_select",
  "concern_selected",
  "free_start",
  "birth_input_complete",
  "free_result_view",
  "paid_teaser_view",
  "paid_teaser_click",
  "report_view",
  "form_start",
  "form_complete",
  "payment_start",
  "payment_success",
  "payment_fail",
] as const;

export type OperationalEventName = (typeof OPERATIONAL_EVENT_NAMES)[number];

export type OperationalMetricRow = Readonly<{
  metric_date: string;
  locale: "ko" | "en";
  event_name: OperationalEventName;
  dimension: string;
  count: number;
}>;

export type OperationalMetrics = Readonly<{
  pageViews: number;
  ctaClicks: number;
  concernSelections: number;
  freeStarts: number;
  birthInputCompletes: number;
  freeResultViews: number;
  paidTeaserViews: number;
  paidTeaserClicks: number;
  reportViews: number;
  /** Concern category totals, so a step loss can be read per real-life question. */
  concernViews: readonly Readonly<{ key: string; count: number }>[];
  sampleViews: number;
  productViews: number;
  productSelections: number;
  formStarts: number;
  formCompletes: number;
  paymentStarts: number;
  paymentSuccesses: number;
  paymentFailures: number;
  routeViews: readonly Readonly<{ key: string; count: number }>[];
  sourceViews: readonly Readonly<{ key: string; count: number }>[];
  formCompletionRate: number;
  checkoutCompletionRate: number;
  daily: readonly Readonly<{ date: string; pageViews: number; formStarts: number; payments: number }>[];
}>;

function sum(rows: readonly OperationalMetricRow[], name: OperationalEventName) {
  return rows
    .filter((row) => row.event_name === name)
    .reduce((total, row) => total + Number(row.count || 0), 0);
}

function percent(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 1_000) / 10 : 0;
}

function concernBreakdown(rows: readonly OperationalMetricRow[]) {
  const values = new Map<string, number>();
  for (const row of rows) {
    if (row.event_name !== "free_result_view") continue;
    const match = /^concern:([a-z0-9_]+)$/.exec(row.dimension);
    if (!match) continue;
    const key = match[1]!;
    values.set(key, (values.get(key) ?? 0) + Number(row.count || 0));
  }
  return [...values.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function journeyBreakdown(rows: readonly OperationalMetricRow[], segment: "route" | "source") {
  const values = new Map<string, number>();
  for (const row of rows) {
    if (row.event_name !== "journey_view") continue;
    const match = /^route:([a-z0-9_]+):source:([a-z0-9_]+)$/.exec(row.dimension);
    if (!match) continue;
    const key = segment === "route" ? match[1] : match[2];
    values.set(key, (values.get(key) ?? 0) + Number(row.count || 0));
  }
  return [...values.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export function summarizeOperationalMetrics(
  rows: readonly OperationalMetricRow[],
  dates: readonly string[],
): OperationalMetrics {
  const formStarts = sum(rows, "form_start");
  const formCompletes = sum(rows, "form_complete");
  const paymentStarts = sum(rows, "payment_start");
  const paymentSuccesses = sum(rows, "payment_success");
  const byDate = new Map(dates.map((date) => [date, { date, pageViews: 0, formStarts: 0, payments: 0 }]));

  for (const row of rows) {
    const day = byDate.get(row.metric_date);
    if (!day) continue;
    if (row.event_name === "landing_view") day.pageViews += Number(row.count || 0);
    if (row.event_name === "form_start") day.formStarts += Number(row.count || 0);
    if (row.event_name === "payment_success") day.payments += Number(row.count || 0);
  }

  return {
    pageViews: sum(rows, "landing_view"),
    ctaClicks: sum(rows, "primary_cta_click"),
    concernSelections: sum(rows, "concern_selected"),
    freeStarts: sum(rows, "free_start"),
    birthInputCompletes: sum(rows, "birth_input_complete"),
    freeResultViews: sum(rows, "free_result_view"),
    paidTeaserViews: sum(rows, "paid_teaser_view"),
    paidTeaserClicks: sum(rows, "paid_teaser_click"),
    reportViews: sum(rows, "report_view"),
    concernViews: concernBreakdown(rows),
    sampleViews: sum(rows, "sample_section_view"),
    productViews: sum(rows, "product_view"),
    productSelections: sum(rows, "product_select"),
    formStarts,
    formCompletes,
    paymentStarts,
    paymentSuccesses,
    paymentFailures: sum(rows, "payment_fail"),
    routeViews: journeyBreakdown(rows, "route"),
    sourceViews: journeyBreakdown(rows, "source"),
    formCompletionRate: percent(formCompletes, formStarts),
    checkoutCompletionRate: percent(paymentSuccesses, paymentStarts),
    daily: [...byDate.values()],
  };
}

export function metricDimension(
  properties: Readonly<Record<string, unknown>>,
): string {
  const route = properties.route;
  const source = properties.source;
  if (
    typeof route === "string" && /^[a-z0-9_]{1,40}$/.test(route) &&
    typeof source === "string" && /^[a-z0-9_]{1,40}$/.test(source)
  ) {
    return `route:${route}:source:${source}`;
  }
  for (const key of ["concern", "surface", "productCode", "provider", "location", "stage"] as const) {
    const value = properties[key];
    if (typeof value === "string" && /^[a-z0-9_-]{1,40}$/.test(value)) {
      return `${key}:${value}`;
    }
  }
  return "all";
}
