export const OPERATIONAL_EVENT_NAMES = [
  "landing_view",
  "primary_cta_click",
  "sample_section_view",
  "product_view",
  "product_select",
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
  sampleViews: number;
  productViews: number;
  productSelections: number;
  formStarts: number;
  formCompletes: number;
  paymentStarts: number;
  paymentSuccesses: number;
  paymentFailures: number;
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
    sampleViews: sum(rows, "sample_section_view"),
    productViews: sum(rows, "product_view"),
    productSelections: sum(rows, "product_select"),
    formStarts,
    formCompletes,
    paymentStarts,
    paymentSuccesses,
    paymentFailures: sum(rows, "payment_fail"),
    formCompletionRate: percent(formCompletes, formStarts),
    checkoutCompletionRate: percent(paymentSuccesses, paymentStarts),
    daily: [...byDate.values()],
  };
}

export function metricDimension(
  properties: Readonly<Record<string, unknown>>,
): string {
  for (const key of ["productCode", "provider", "location", "stage"] as const) {
    const value = properties[key];
    if (typeof value === "string" && /^[a-z0-9_-]{1,40}$/.test(value)) {
      return `${key}:${value}`;
    }
  }
  return "all";
}
