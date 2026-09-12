import { z } from "zod";

export const ANALYTICS_SCHEMA_VERSION = "1.0.0" as const;

const common = {
  schemaVersion: z.literal(ANALYTICS_SCHEMA_VERSION),
  eventId: z.string().uuid(),
  occurredAt: z.string().datetime({ offset: true }),
  sessionId: z.string().regex(/^[A-Za-z0-9_-]{8,80}$/),
  locale: z.enum(["ko", "en"]),
};

export const JOURNEY_ROUTES = [
  "home",
  "fortune",
  "saju",
  "numerology",
  "reading",
  "plans",
  "events",
  "sample_saju",
  "report",
  "shop",
  "dreams",
  "other",
] as const;

/**
 * The real-life concerns a reading can be centred on. Five are offered as entry points
 * on the home page; leadership is reachable only inside the free reading's own focus
 * list. They are categories, never the sentence the visitor wrote — the free-text
 * question stays on the device.
 */
export const CONCERN_CATEGORIES = [
  "work",
  "relationships",
  "health",
  "growth",
  "money",
  "leadership",
] as const;

/** Where in the product a funnel step was reached, so a step can be attributed. */
export const FUNNEL_SURFACES = [
  "home",
  "reading",
  "numerology",
  "profile",
  "fortune",
  "other",
] as const;

export const JOURNEY_SOURCES = [
  "direct",
  "naver_blog",
  "naver_search",
  "google_search",
  "instagram",
  "disquiet",
  "seenthis",
  "other_campaign",
  "other_referral",
] as const;

const event = <Name extends string, Shape extends z.ZodRawShape>(name: Name, shape: Shape) =>
  z.object({
    ...common,
    name: z.literal(name),
    properties: z.object(shape).strict(),
  }).strict();

export const SafeAnalyticsEventSchema = z.discriminatedUnion("name", [
  event("landing_view", {}),
  event("journey_view", {
    route: z.enum(JOURNEY_ROUTES),
    source: z.enum(JOURNEY_SOURCES),
  }),
  // `hero_free`, `product_free` and `saju_crosslink` are the free-reading entry points.
  // They are additional values on an existing property, not a new event or a new
  // property, so a consumer written against the older set still parses every event it
  // knew about.
  event("primary_cta_click", {
    location: z.enum(["hero", "sticky", "hero_free", "product_free", "saju_crosslink"]),
  }),
  event("sample_section_view", {}),
  event("product_view", { productCode: z.enum(["plus_30d", "pro_30d", "premium_pdf"]) }),
  event("product_select", {
    productCode: z.enum(["plus_30d", "pro_30d", "premium_pdf"]),
    location: z.enum(["product_card", "form"]),
  }),
  // The free reading is the middle of the funnel and used to emit nothing at all, so a
  // visitor who left between the free result and checkout was invisible. These carry a
  // concern category and a surface — never a birth date, a name, or the written question.
  event("concern_selected", {
    concern: z.enum(CONCERN_CATEGORIES),
    surface: z.enum(FUNNEL_SURFACES),
  }),
  event("free_start", { surface: z.enum(FUNNEL_SURFACES) }),
  event("birth_input_complete", { surface: z.enum(FUNNEL_SURFACES) }),
  event("free_result_view", { concern: z.enum(CONCERN_CATEGORIES) }),
  event("paid_teaser_view", { concern: z.enum(CONCERN_CATEGORIES) }),
  event("paid_teaser_click", { concern: z.enum(CONCERN_CATEGORIES) }),
  event("report_view", { productCode: z.enum(["plus_30d", "pro_30d", "premium_pdf"]) }),
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
  event("dream_recorded", { retainedRawText: z.boolean() }),
  event("dream_interpreted", { mode: z.enum(["deterministic", "provider"]) }),
  event("reality_check_completed", { dueDays: z.union([z.literal(3), z.literal(7), z.literal(30)]) }),
  event("dream_return_7d", {}),
  event("dream_return_30d", {}),
  event("pattern_view_opened", {}),
  event("personal_signature_created", { sampleBand: z.enum(["3-4", "5-9", "10+"]) }),
  event("paid_conversion_from_dream", { productCode: z.enum(["plus_30d", "pro_30d", "premium_pdf"]) }),
  event("dream_followup_conversion", { dueDays: z.union([z.literal(3), z.literal(7), z.literal(30)]) }),
]);

export type SafeAnalyticsEvent = z.infer<typeof SafeAnalyticsEventSchema>;
export type SafeAnalyticsEventName = SafeAnalyticsEvent["name"];
