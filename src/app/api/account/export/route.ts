import { NextResponse } from "next/server";
import { decodeAcquisitionSurvey, isAcquisitionSource } from "@/core/acquisition-survey";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { createReportProvenance } from "@/server/report-provenance";

export async function GET() {
  const auth = await requireSupabaseUser();
  if (auth.error || !auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "AUTH_REQUIRED" ? 401 : 503 });
  }

  const [profile, consents, tarot, reality, dataRights, preferences, deliveries] = await Promise.all([
    auth.client.from("profiles").select("*").eq("owner_user_id", auth.user.id).maybeSingle(),
    auth.client.from("consent_receipts").select("*").eq("owner_user_id", auth.user.id).order("created_at"),
    auth.client.from("tarot_readings").select("*").eq("owner_user_id", auth.user.id).is("deleted_at", null).order("created_at"),
    auth.client.from("reality_checks").select("*").eq("owner_user_id", auth.user.id).is("deleted_at", null).order("created_at"),
    auth.client.from("data_rights_requests").select("*").eq("owner_user_id", auth.user.id).order("completed_at"),
    auth.client.from("notification_preferences").select("*").eq("owner_user_id", auth.user.id).maybeSingle(),
    auth.client.from("daily_notification_deliveries").select("*").eq("owner_user_id", auth.user.id).order("delivery_date"),
  ]);
  const error = profile.error ?? consents.error ?? tarot.error ?? reality.error ?? dataRights.error ?? preferences.error ?? deliveries.error;
  if (error) return NextResponse.json({ error: "EXPORT_FAILED" }, { status: 500 });

  const admin = resolveSupabaseAdminClient().client;
  let acquisitionSurveys: unknown[] = [];
  if (admin) {
    const orders = await admin.from("payment_orders").select("order_id").eq("owner_user_id", auth.user.id);
    const orderIds = (orders.data ?? []).map((row) => String(row.order_id));
    if (orderIds.length) {
      const surveys = await admin.from("report_acquisition_surveys").select("*").in("order_id", orderIds);
      if (surveys.error) return NextResponse.json({ error: "EXPORT_FAILED" }, { status: 500 });
      acquisitionSurveys = (surveys.data ?? []).map((row) => {
        if (!isAcquisitionSource(row.source) || typeof row.detail !== "string") return row;
        const answers = decodeAcquisitionSurvey(row.source, row.detail);
        return { ...row, ...answers };
      });
    }
  }

  const optionalPatternTables = [
    "pattern_profiles",
    "pattern_hypotheses",
    "pattern_reality_checks",
    "evidence_events",
    "evidence_hypothesis_links",
    "confidence_revisions",
    "pattern_graph_edges",
    "report_provenance",
    "export_provenance",
  ] as const;
  const patternData: Record<string, unknown[]> = {};
  let patternMigrationPending = false;
  for (const table of optionalPatternTables) {
    const result = await auth.client.from(table).select("*").eq("owner_user_id", auth.user.id).limit(500);
    if (result.error) {
      if (["42P01", "PGRST205"].includes(result.error.code ?? "")) {
        patternMigrationPending = true;
        patternData[table] = [];
        continue;
      }
      return NextResponse.json({ error: "EXPORT_FAILED" }, { status: 500 });
    }
    patternData[table] = result.data ?? [];
  }

  const exportedAt = new Date().toISOString();
  // Keep space data exportable when the feature flag is off. Never silently truncate it.
  const spaceData: Record<string, unknown[]> = {};
  let spaceMigrationPending = false;
  for (const table of ["space_projects", "space_rooms", "space_assets", "space_analysis_runs", "space_applied_changes", "space_reality_checks", "space_template_selections", "space_template_corrections"]) {
    const rows: unknown[] = [];
    for (let offset = 0; ; offset += 500) {
      const select = table === "space_assets" ? "id,project_id,status,byte_size,expires_at,created_at" : "*";
      let query = auth.client.from(table).select(select).eq("owner_user_id", auth.user.id).order(["space_rooms", "space_template_selections"].includes(table) ? "project_id" : table === "space_applied_changes" ? "run_id" : "id");
      if (table === "space_applied_changes") query = query.order("recommendation_id");
      const result = await query.range(offset, offset + 499);
      if (result.error) {
        if (["42P01", "PGRST205"].includes(result.error.code ?? "")) { spaceMigrationPending = true; break; }
        return NextResponse.json({ error: "EXPORT_FAILED" }, { status: 500 });
      }
      rows.push(...(result.data ?? []));
      if ((result.data?.length ?? 0) < 500) break;
      if (offset >= 9500) return NextResponse.json({ error: "EXPORT_TOO_LARGE_CONTACT_SUPPORT" }, { status: 413 });
    }
    spaceData[table] = rows;
  }
  const exportData = {
    space: spaceData,
    profile: profile.data,
    consentReceipts: consents.data ?? [],
    tarotReadings: tarot.data ?? [],
    realityChecks: reality.data ?? [],
    dataRightsRequests: dataRights.data ?? [],
    notificationPreferences: preferences.data,
    dailyNotificationDeliveries: deliveries.data ?? [],
    reportAcquisitionSurveys: acquisitionSurveys,
    patternProfiles: patternData.pattern_profiles,
    patternHypotheses: patternData.pattern_hypotheses,
    patternRealityChecks: patternData.pattern_reality_checks,
    evidenceEvents: patternData.evidence_events,
    evidenceHypothesisLinks: patternData.evidence_hypothesis_links,
    confidenceRevisions: patternData.confidence_revisions,
    patternGraphEdges: patternData.pattern_graph_edges,
    reportProvenance: patternData.report_provenance,
    exportProvenance: patternData.export_provenance,
  };
  const provenance = createReportProvenance({
    reportId: `account-export-${exportedAt.slice(0, 10)}`,
    ownerScope: auth.user.id,
    content: JSON.stringify(exportData),
  });
  if (admin && provenance) {
    await admin.from("export_provenance").insert({
      export_id: provenance.exportId,
      owner_user_id: auth.user.id,
      export_type: "account_json",
      content_fingerprint: provenance.contentFingerprint,
    });
  }
  const body = JSON.stringify({
    product: "태령당",
    schemaVersion: "account-export-1.3.0",
    scope: "authenticated_account",
    exportedAt,
    ownerUserId: auth.user.id,
    patternMigrationPending,
    spaceMigrationPending,
    artifactProvenance: provenance,
    data: exportData,
  }, null, 2);

  return new NextResponse(body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="taeryeongdang-account-export-${exportedAt.slice(0, 10)}.json"`,
      "cache-control": "no-store",
    },
  });
}
