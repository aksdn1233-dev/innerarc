"use client";

import { useEffect } from "react";
import { captureConversionEvent } from "@/core/analytics";
import type { PaidReport } from "@/core/paid-reading";
import type { Locale } from "@/i18n/config";

/**
 * Records that a purchased report was actually opened.
 *
 * A payment that succeeds and a report that is read are different events, and without
 * this one a delivery failure looks exactly like a successful sale. It carries the tier
 * and nothing else — no order id, no birth details, no report content.
 */
export function ReportViewBeacon({
  locale,
  productCode,
}: {
  locale: Locale;
  productCode: PaidReport["productCode"];
}) {
  useEffect(() => {
    captureConversionEvent("report_view", locale, { productCode });
  }, [locale, productCode]);
  return null;
}
