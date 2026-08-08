"use client";

import { useEffect } from "react";
import { captureConversionEvent } from "@/core/analytics";
import type { Locale } from "@/i18n/config";

export function PaymentFailBeacon({ locale }: { locale: Locale }) {
  useEffect(() => {
    captureConversionEvent("payment_fail", locale, {
      provider: "unknown",
      stage: "redirect",
    });
  }, [locale]);
  return null;
}
