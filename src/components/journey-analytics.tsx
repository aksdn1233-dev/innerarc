"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  captureConversionEvent,
  INTERNAL_TRAFFIC_KEY,
} from "@/core/analytics/browser";
import { JOURNEY_SOURCES } from "@/core/analytics/events";
import {
  classifyJourneyRoute,
  classifyJourneySource,
  type JourneySource,
} from "@/core/analytics/traffic-attribution";
import type { Locale } from "@/i18n/config";

const SOURCE_KEY = "gyeol.analytics.source.v1";
const VIEWED_KEY = "gyeol.analytics.routes.v1";

function readStoredSource(): JourneySource | null {
  try {
    const value = window.sessionStorage.getItem(SOURCE_KEY);
    return JOURNEY_SOURCES.includes(value as JourneySource) ? value as JourneySource : null;
  } catch {
    return null;
  }
}

export function JourneyAnalytics({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.includes("/admin")) return;
    const route = classifyJourneyRoute(pathname);
    const query = new URLSearchParams(window.location.search);
    if (query.get("internal_preview") === "1") {
      try { window.localStorage.setItem(INTERNAL_TRAFFIC_KEY, "1"); } catch { /* optional */ }
      return;
    }
    const campaignSource = query.get("utm_source");
    const source = campaignSource
      ? classifyJourneySource({ utmSource: campaignSource })
      : readStoredSource() ?? classifyJourneySource({ referrer: document.referrer });

    try {
      window.sessionStorage.setItem(SOURCE_KEY, source);
      const viewed = new Set((window.sessionStorage.getItem(VIEWED_KEY) ?? "").split(",").filter(Boolean));
      if (viewed.has(route)) return;
      viewed.add(route);
      window.sessionStorage.setItem(VIEWED_KEY, [...viewed].join(","));
    } catch {
      // A storage-denying browser still contributes one aggregate route event per render.
    }

    captureConversionEvent("journey_view", locale, { route, source });
  }, [locale, pathname]);

  return null;
}
