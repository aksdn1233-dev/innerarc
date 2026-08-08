import { NextResponse } from "next/server";
import { z } from "zod";
import { ANALYTICS_SCHEMA_VERSION, SafeAnalyticsEventSchema } from "@/core/analytics/events";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { crossOriginRefused, isSameOriginRequest } from "@/server/same-origin";
import { metricDimension, OPERATIONAL_EVENT_NAMES } from "@/server/operational-metrics";
import { recordOperationalMetric } from "@/server/admin-storage";

const bodySchema = z.object({
  occurredAt: z.string().datetime({ offset: true }),
  locale: z.enum(["ko", "en"]),
  name: z.enum(OPERATIONAL_EVENT_NAMES),
  properties: z.record(z.string(), z.unknown()),
}).strict();

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return crossOriginRefused();
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_EVENT" }, { status: 400 });

  const occurredAt = Date.parse(parsed.data.occurredAt);
  const now = Date.now();
  if (!Number.isFinite(occurredAt) || occurredAt < now - 86_400_000 || occurredAt > now + 300_000) {
    return NextResponse.json({ error: "INVALID_EVENT_TIME" }, { status: 400 });
  }

  // Reuse the strict public schema so unexpected free-text properties can never
  // reach the database. The generated identifiers are validation-only and discarded.
  const safe = SafeAnalyticsEventSchema.safeParse({
    schemaVersion: ANALYTICS_SCHEMA_VERSION,
    eventId: crypto.randomUUID(),
    sessionId: "aggregate_only",
    ...parsed.data,
  });
  if (!safe.success) return NextResponse.json({ error: "INVALID_EVENT" }, { status: 400 });

  const admin = getSupabaseAdminClient();
  if (!admin) return new NextResponse(null, { status: 202 });
  const metricDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(occurredAt));
  try {
    await recordOperationalMetric(admin, {
      metricDate,
      locale: parsed.data.locale,
      eventName: parsed.data.name,
      dimension: metricDimension(parsed.data.properties),
    });
  } catch {
    return new NextResponse(null, { status: 202 });
  }

  // Analytics must never interrupt a reading or payment flow. The administrator
  // console exposes an unavailable state if the migration or database is missing.
  return new NextResponse(null, { status: 204 });
}
