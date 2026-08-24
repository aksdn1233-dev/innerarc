import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";

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
      acquisitionSurveys = surveys.data ?? [];
    }
  }

  const exportedAt = new Date().toISOString();
  const body = JSON.stringify({
    product: "InnerArc",
    schemaVersion: "account-export-1.1.0",
    scope: "authenticated_account",
    exportedAt,
    ownerUserId: auth.user.id,
    data: {
      profile: profile.data,
      consentReceipts: consents.data ?? [],
      tarotReadings: tarot.data ?? [],
      realityChecks: reality.data ?? [],
      dataRightsRequests: dataRights.data ?? [],
      notificationPreferences: preferences.data,
      dailyNotificationDeliveries: deliveries.data ?? [],
      reportAcquisitionSurveys: acquisitionSurveys,
    },
  }, null, 2);

  return new NextResponse(body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="innerarc-account-export-${exportedAt.slice(0, 10)}.json"`,
      "cache-control": "no-store",
    },
  });
}
