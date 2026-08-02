import { z } from "zod";

export const ANALYTICS_SCHEMA_VERSION = "1.0.0" as const;

const common = {
  schemaVersion: z.literal(ANALYTICS_SCHEMA_VERSION),
  eventId: z.string().uuid(),
  occurredAt: z.string().datetime({ offset: true }),
  sessionId: z.string().regex(/^[A-Za-z0-9_-]{8,80}$/),
  locale: z.enum(["ko", "en"]),
};

const event = <Name extends string, Shape extends z.ZodRawShape>(name: Name, shape: Shape) =>
  z.object({
    ...common,
    name: z.literal(name),
    properties: z.object(shape).strict(),
  }).strict();

export const SafeAnalyticsEventSchema = z.discriminatedUnion("name", [
  event("landing_view", {}),
  event("primary_cta_click", { location: z.enum(["hero", "sticky"]) }),
  event("sample_section_view", {}),
  event("product_view", { productCode: z.enum(["plus_30d", "pro_30d", "premium_pdf"]) }),
  event("product_select", {
    productCode: z.enum(["plus_30d", "pro_30d", "premium_pdf"]),
    location: z.enum(["product_card", "form"]),
  }),
  event("form_start", {}),
  event("form_complete", { productCode: z.enum(["plus_30d", "pro_30d", "premium_pdf"]) }),
  event("payment_start", {
    productCode: z.enum(["plus_30d", "pro_30d", "premium_pdf"]),
    provider: z.enum(["payapp", "toss", "portone", "manual_transfer", "unknown"]),
  }),
  event("payment_success", {
    provider: z.enum(["payapp", "toss", "portone", "manual_transfer", "unknown"]),
  }),
  event("payment_fail", {
    provider: z.enum(["payapp", "toss", "portone", "manual_transfer", "unknown"]),
    stage: z.enum(["order", "checkout", "confirmation", "redirect"]),
  }),
  event("onboarding_completed", { depth: z.enum(["light", "balanced", "deep"]) }),
  event("tarot_reading_created", { cardCount: z.union([z.literal(1), z.literal(3)]), source: z.enum(["engine", "manual"]) }),
  event("relationship_result_viewed", { mode: z.enum(["personal", "comparison"]) }),
  event("celebrity_comparison_viewed", { field: z.enum(["all", "leadership", "science", "sports", "arts", "social_impact"]), resultCount: z.number().int().min(0).max(20) }),
  event("reality_check_saved", { devicePersistence: z.boolean() }),
  event("outcome_reviewed", { fit: z.enum(["accurate", "mostly_relevant", "partly_relevant", "hard_to_tell", "not_relevant"]) }),
  event("share_downloaded", { kind: z.enum(["core_profile", "romantic_pattern", "compatibility", "celebrity_match"]) }),
  event("paywall_viewed", { source: z.enum(["result", "feature_limit", "settings"]) }),
  event("checkout_started", { tier: z.enum(["plus", "pro"]), billingPeriod: z.enum(["month", "year"]), currency: z.enum(["KRW", "USD"]) }),
  event("subscription_status_changed", { tier: z.enum(["free", "plus", "pro"]), status: z.enum(["trialing", "active", "past_due", "canceled", "incomplete"]) }),
  event("deletion_completed", { scope: z.enum(["account", "all_data", "third_party", "device_only"]) }),
  event("ai_run_completed", {
    providerAlias: z.string().regex(/^[a-z0-9_-]{2,40}$/),
    modelAlias: z.string().regex(/^[a-z0-9_.-]{2,80}$/),
    inputTokens: z.number().int().min(0).max(10_000_000),
    outputTokens: z.number().int().min(0).max(10_000_000),
    latencyMs: z.number().int().min(0).max(600_000),
    estimatedCostMicros: z.number().int().min(0).max(100_000_000),
    fallback: z.boolean(),
  }),
]);

export type SafeAnalyticsEvent = z.infer<typeof SafeAnalyticsEventSchema>;
export type SafeAnalyticsEventName = SafeAnalyticsEvent["name"];
