import { NextResponse } from "next/server";
import { z } from "zod";
import { validateDevicePreferences, DevicePreferencesSchema } from "@/core/privacy";
import { validateRealityCheckRecords } from "@/core/reality-check";
import { validateTarotHistoryRecords } from "@/core/tarot";
import { requireSupabaseUser } from "@/lib/supabase/auth";

const syncBodySchema = z.object({
  preferences: DevicePreferencesSchema.nullable().optional(),
  tarotReadings: z.unknown().optional(),
  realityChecks: z.unknown().optional(),
}).strict();

function unauthorized(error: "SUPABASE_DISABLED" | "AUTH_REQUIRED") {
  return NextResponse.json({ error }, { status: error === "AUTH_REQUIRED" ? 401 : 503 });
}

export async function GET() {
  const auth = await requireSupabaseUser();
  if (auth.error || !auth.client || !auth.user) return unauthorized(auth.error!);

  const [profileResult, consentResult, tarotResult, realityResult] = await Promise.all([
    auth.client.from("profiles").select("locale,time_zone,updated_at").eq("owner_user_id", auth.user.id).maybeSingle(),
    auth.client
      .from("consent_receipts")
      .select("policy_version,accepted_at,privacy_required,ai_personalization,model_training,product_analytics,marketing,raw_journal_retention,created_at")
      .eq("owner_user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    auth.client
      .from("tarot_readings")
      .select("id,client_request_id,question,category,created_at,history_version,snapshot")
      .eq("owner_user_id", auth.user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    auth.client
      .from("reality_checks")
      .select("record")
      .eq("owner_user_id", auth.user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  const error = profileResult.error ?? consentResult.error ?? tarotResult.error ?? realityResult.error;
  if (error) return NextResponse.json({ error: "SYNC_READ_FAILED" }, { status: 500 });

  const consent = consentResult.data;
  const profile = profileResult.data;
  const preferences = profile && consent
    ? validateDevicePreferences({
        version: 1,
        locale: profile.locale,
        timeZone: profile.time_zone,
        consents: {
          privacyRequired: consent.privacy_required,
          aiPersonalization: consent.ai_personalization,
          modelTraining: consent.model_training,
          productAnalytics: consent.product_analytics,
          marketing: consent.marketing,
          rawJournalRetention: consent.raw_journal_retention,
          acceptedAt: consent.accepted_at,
          policyVersion: consent.policy_version,
        },
        updatedAt: profile.updated_at,
      })
    : null;

  const tarotReadings = validateTarotHistoryRecords(
    (tarotResult.data ?? []).map((row) => ({
      id: row.id,
      clientRequestId: row.client_request_id,
      question: row.question,
      category: row.category,
      createdAt: row.created_at,
      historyVersion: row.history_version,
      snapshot: row.snapshot,
    })),
  );
  const realityChecks = validateRealityCheckRecords(
    (realityResult.data ?? []).map((row) => row.record),
  );

  return NextResponse.json({ preferences, tarotReadings, realityChecks });
}

export async function POST(request: Request) {
  const auth = await requireSupabaseUser();
  if (auth.error || !auth.client || !auth.user) return unauthorized(auth.error!);

  let body: z.infer<typeof syncBodySchema>;
  try {
    body = syncBodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "INVALID_SYNC_PAYLOAD" }, { status: 400 });
  }

  try {
    const preferences = body.preferences ? validateDevicePreferences(body.preferences) : null;
    const tarotReadings = body.tarotReadings === undefined
      ? []
      : validateTarotHistoryRecords(body.tarotReadings);
    const realityChecks = body.realityChecks === undefined
      ? []
      : validateRealityCheckRecords(body.realityChecks);

    if (preferences) {
      const { error: profileError } = await auth.client.from("profiles").upsert({
        owner_user_id: auth.user.id,
        locale: preferences.locale,
        time_zone: preferences.timeZone,
        updated_at: preferences.updatedAt,
      }, { onConflict: "owner_user_id" });
      if (profileError) throw profileError;

      const { error: consentError } = await auth.client.from("consent_receipts").upsert({
        owner_user_id: auth.user.id,
        policy_version: preferences.consents.policyVersion,
        accepted_at: preferences.consents.acceptedAt,
        privacy_required: true,
        ai_personalization: preferences.consents.aiPersonalization,
        model_training: preferences.consents.modelTraining,
        product_analytics: preferences.consents.productAnalytics,
        marketing: preferences.consents.marketing,
        raw_journal_retention: preferences.consents.rawJournalRetention,
      }, { onConflict: "owner_user_id,policy_version,accepted_at" });
      if (consentError) throw consentError;
    }

    if (tarotReadings.length) {
      const { error } = await auth.client.from("tarot_readings").upsert(
        tarotReadings.map((record) => ({
          owner_user_id: auth.user!.id,
          id: record.id,
          client_request_id: record.clientRequestId,
          question: record.question,
          category: record.category,
          created_at: record.createdAt,
          history_version: record.historyVersion,
          snapshot: record.snapshot,
          subject: "owner",
          deleted_at: null,
        })),
        { onConflict: "owner_user_id,id" },
      );
      if (error) throw error;
    }

    if (realityChecks.length) {
      const { error } = await auth.client.from("reality_checks").upsert(
        realityChecks.map((record) => ({
          owner_user_id: auth.user!.id,
          id: record.id,
          client_request_id: record.clientRequestId,
          category: record.category,
          record,
          subject: "owner",
          created_at: record.createdAt,
          updated_at: record.updatedAt,
          deleted_at: null,
        })),
        { onConflict: "owner_user_id,id" },
      );
      if (error) throw error;
    }

    return NextResponse.json({
      synced: {
        preferences: preferences ? 1 : 0,
        tarotReadings: tarotReadings.length,
        realityChecks: realityChecks.length,
      },
    });
  } catch {
    return NextResponse.json({ error: "SYNC_WRITE_FAILED" }, { status: 500 });
  }
}
