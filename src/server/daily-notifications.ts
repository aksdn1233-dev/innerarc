import { createDailyFortune } from "@/core/daily-fortune";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

type PreferenceRow = Readonly<{
  owner_user_id: string;
  daily_birth_month: number;
  daily_birth_day: number;
  locale: "ko" | "en";
}>;

export type DailyNotificationBatchResult = Readonly<{
  available: boolean;
  dateKey: string;
  eligible: number;
  written: number;
  failed: number;
}>;

export function dateKeyInTimeZone(now: Date, timeZone = "Asia/Seoul"): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

/**
 * Creates the morning in-site notification once per consenting account and day.
 * The unique database key is the retry/idempotency boundary: a repeated cron run
 * updates the same symbolic result instead of multiplying notifications.
 */
export async function runDailyNotificationBatch(
  environment: RuntimeEnvironment,
  now = new Date(),
): Promise<DailyNotificationBatchResult> {
  const dateKey = dateKeyInTimeZone(now);
  const admin = getSupabaseAdminClient(environment);
  if (!admin) return { available: false, dateKey, eligible: 0, written: 0, failed: 0 };

  const { data, error } = await admin
    .from("notification_preferences")
    .select("owner_user_id,daily_birth_month,daily_birth_day,locale")
    .eq("in_app_enabled", true)
    .eq("daily_flow_enabled", true)
    .not("daily_notification_consent_at", "is", null)
    .not("daily_birth_month", "is", null)
    .not("daily_birth_day", "is", null)
    .limit(2_000);
  if (error) return { available: false, dateKey, eligible: 0, written: 0, failed: 1 };

  const rows = (data ?? []) as PreferenceRow[];
  if (!rows.length) return { available: true, dateKey, eligible: 0, written: 0, failed: 0 };

  let written = 0;
  let failed = 0;
  for (const row of rows) {
    try {
      const locale = row.locale === "en" ? "en" : "ko";
      const result = createDailyFortune({
        birthMonth: row.daily_birth_month,
        birthDay: row.daily_birth_day,
        dateKey,
        locale,
      });
      const { error: writeError } = await admin.from("daily_notification_deliveries").upsert({
        owner_user_id: row.owner_user_id,
        delivery_date: dateKey,
        scheduled_for: `${dateKey}T09:00:00+09:00`,
        notification_type: "daily_flow",
        locale,
        title: result.copy.title,
        summary: result.copy.summary,
        action_text: result.copy.action,
        caution_text: result.copy.caution,
        question_text: result.copy.question,
        rule_version: result.ruleVersion,
      }, { onConflict: "owner_user_id,delivery_date,notification_type" });
      if (writeError) failed += 1;
      else written += 1;
    } catch {
      failed += 1;
    }
  }

  return { available: true, dateKey, eligible: rows.length, written, failed };
}
