import { NextResponse } from "next/server";
import { EvidenceEventInputSchema } from "@/core/pattern-intelligence";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { enforceSensitiveRequestLimit } from "@/server/abuse-protection";
import { crossOriginRefused, isSameOriginRequest } from "@/server/same-origin";
import { getOwnedReportSection } from "@/server/pattern-intelligence";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return crossOriginRefused();
  const auth = await requireSupabaseUser();
  if (auth.error || !auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "AUTH_REQUIRED" ? 401 : 503 });
  }
  const parsed = EvidenceEventInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_EVIDENCE_EVENT" }, { status: 400 });
  const admin = resolveSupabaseAdminClient().client;
  if (!admin) return NextResponse.json({ error: "PATTERN_STORAGE_UNAVAILABLE" }, { status: 503 });
  const limit = await enforceSensitiveRequestLimit({
    admin,
    request,
    userId: auth.user.id,
    endpoint: "pattern_evidence_write",
    accountLimit: 20,
    ipLimit: 40,
    windowSeconds: 60,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "TOO_MANY_REQUESTS" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let sourceReference: string | null = null;
  let sourceSystem: "saju" | "numerology" | null = null;
  let hypothesisText: string | null = null;
  if (parsed.data.orderId !== undefined && parsed.data.sectionIndex !== undefined) {
    const owned = await getOwnedReportSection({
      admin,
      ownerUserId: auth.user.id,
      orderId: parsed.data.orderId,
      sectionIndex: parsed.data.sectionIndex,
    });
    if (!owned) return NextResponse.json({ error: "REPORT_NOT_FOUND" }, { status: 404 });
    sourceReference = owned.sourceReference;
    sourceSystem = owned.sourceSystem;
    hypothesisText = owned.section.keySentence || owned.section.title;
  }
  const { data, error } = await auth.client.rpc("record_pattern_evidence_event", {
    p_client_request_id: parsed.data.clientRequestId,
    p_event_type: parsed.data.eventType,
    p_life_domain: parsed.data.lifeDomain,
    p_event_date: parsed.data.eventDate,
    p_approximate_date: parsed.data.approximateDate,
    p_short_description: parsed.data.shortDescription,
    p_outcome: parsed.data.outcome,
    p_relationship_context: parsed.data.relationshipContext || null,
    p_source_reference: sourceReference,
    p_relation: parsed.data.relation ?? null,
    p_source_system: sourceSystem,
    p_hypothesis_text: hypothesisText,
  });
  if (error) return NextResponse.json({ error: "PATTERN_STORAGE_UNAVAILABLE" }, { status: 503 });
  return NextResponse.json({ saved: true, evidence: data, limitConfigured: limit.configured });
}
