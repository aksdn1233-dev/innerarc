import { NextResponse } from "next/server";
import { ReportRealityCheckInputSchema } from "@/core/pattern-intelligence";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { enforceSensitiveRequestLimit } from "@/server/abuse-protection";
import { crossOriginRefused, isSameOriginRequest } from "@/server/same-origin";
import { getOwnedReportSection, inferLifeDomain } from "@/server/pattern-intelligence";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return crossOriginRefused();
  const auth = await requireSupabaseUser();
  if (auth.error || !auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "AUTH_REQUIRED" ? 401 : 503 });
  }
  const parsed = ReportRealityCheckInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_REALITY_CHECK" }, { status: 400 });
  const admin = resolveSupabaseAdminClient().client;
  if (!admin) return NextResponse.json({ error: "PATTERN_STORAGE_UNAVAILABLE" }, { status: 503 });
  const limit = await enforceSensitiveRequestLimit({
    admin,
    request,
    userId: auth.user.id,
    endpoint: "pattern_reality_check_write",
    accountLimit: 30,
    ipLimit: 60,
    windowSeconds: 60,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "TOO_MANY_REQUESTS" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }
  const owned = await getOwnedReportSection({
    admin,
    ownerUserId: auth.user.id,
    orderId: parsed.data.orderId,
    sectionIndex: parsed.data.sectionIndex,
  });
  if (!owned) return NextResponse.json({ error: "REPORT_NOT_FOUND" }, { status: 404 });

  const { data, error } = await auth.client.rpc("record_pattern_reality_check", {
    p_client_request_id: parsed.data.clientRequestId,
    p_source_system: owned.sourceSystem,
    p_source_reference: owned.sourceReference,
    p_life_domain: inferLifeDomain(owned.section.title),
    p_hypothesis_type: "report_section",
    p_hypothesis_text: owned.section.keySentence || owned.section.title,
    p_response: parsed.data.response,
    p_note: parsed.data.note || null,
    p_context: { reportId: parsed.data.orderId, sectionIndex: parsed.data.sectionIndex },
    p_deterministic_basis: owned.report.calculationBasis ?? {
      contentVersion: owned.report.contentVersion ?? "legacy",
      contentReferences: owned.report.contentReferences ?? [],
    },
    p_traditional_basis: {
      sectionPlan: owned.report.sectionPlan ?? "legacy",
      contentVersion: owned.report.contentVersion ?? "legacy",
    },
    p_personalization_basis: { concernUsed: Boolean(owned.report.concern) },
    p_provenance: {
      calculationFact: true,
      traditionalInterpretation: true,
      personalizedInference: Boolean(owned.report.concern),
      aiGeneratedWording: false,
      userConfirmedEvidence: true,
      derivedPatternInference: false,
    },
  });
  if (error) return NextResponse.json({ error: "PATTERN_STORAGE_UNAVAILABLE" }, { status: 503 });
  return NextResponse.json({ saved: true, learning: data, limitConfigured: limit.configured });
}
