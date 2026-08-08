"use client";

import {
  ANALYTICS_SCHEMA_VERSION,
  SafeAnalyticsEventSchema,
  type SafeAnalyticsEvent,
} from "./events";
import type { Locale } from "@/i18n/config";

type ConversionEventName = Extract<
  SafeAnalyticsEvent["name"],
  | "landing_view"
  | "primary_cta_click"
  | "sample_section_view"
  | "product_view"
  | "product_select"
  | "form_start"
  | "form_complete"
  | "payment_start"
  | "payment_success"
  | "payment_fail"
>;

type ConversionEventProperties<Name extends ConversionEventName> = Extract<
  SafeAnalyticsEvent,
  { name: Name }
>["properties"];

const SESSION_KEY = "gyeol.analytics.session.v1";

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (token) => {
    const value = Math.floor(Math.random() * 16);
    return (token === "x" ? value : (value & 0x3) | 0x8).toString(16);
  });
}

function getSessionId() {
  const fallback = `session_${randomId().replaceAll("-", "").slice(0, 24)}`;
  try {
    const stored = window.sessionStorage.getItem(SESSION_KEY);
    if (stored && /^[A-Za-z0-9_-]{8,80}$/.test(stored)) return stored;
    window.sessionStorage.setItem(SESSION_KEY, fallback);
  } catch {
    // Storage is optional. The privacy-safe DOM event still works without it.
  }
  return fallback;
}

/**
 * Privacy-minimized, provider-neutral conversion event interface.
 *
 * The strict schema rejects names, birth dates, questions, and any extra free text.
 * The server stores only a daily aggregate; event/session identifiers are deliberately
 * omitted from the request and no visitor profile is created.
 */
export function captureConversionEvent<Name extends ConversionEventName>(
  name: Name,
  locale: Locale,
  properties: ConversionEventProperties<Name>,
) {
  if (typeof window === "undefined") return false;
  const candidate = {
    schemaVersion: ANALYTICS_SCHEMA_VERSION,
    eventId: randomId(),
    occurredAt: new Date().toISOString(),
    sessionId: getSessionId(),
    locale,
    name,
    properties,
  };
  const parsed = SafeAnalyticsEventSchema.safeParse(candidate);
  if (!parsed.success) return false;
  window.dispatchEvent(new CustomEvent("gyeol:analytics", { detail: parsed.data }));
  const body = JSON.stringify({
    occurredAt: parsed.data.occurredAt,
    locale: parsed.data.locale,
    name: parsed.data.name,
    properties: parsed.data.properties,
  });

  /**
   * `navigator.sendBeacon` hands the request to the browser's own background queue, so
   * it survives the navigation these events usually precede — a visitor clicks the
   * purchase button milliseconds after the click is recorded — and it leaves the page's
   * network activity finished.
   *
   * A `keepalive` fetch does the surviving part but not the second: in Chromium the
   * keepalive loader never reports completion back to the page, so the request sits
   * open in the page's accounting forever. Anything waiting for the network to go quiet
   * therefore waits forever, which is why the /en payload-budget test timed out on
   * every run and every retry rather than flaking.
   *
   * The Blob's type keeps the request `application/json`, so the endpoint parses it
   * exactly as before. The fetch stays as the fallback for a browser without beacon
   * support, and analytics must never interrupt a reading or a payment either way.
   */
  const queued = typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function" &&
    navigator.sendBeacon(
      "/api/analytics/events",
      new Blob([body], { type: "application/json" }),
    );
  if (!queued) {
    void fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body,
    }).catch(() => undefined);
  }
  return true;
}
