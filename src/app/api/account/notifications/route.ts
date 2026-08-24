import { crossOriginRefused, isSameOriginRequest } from "@/server/same-origin";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { isValidMonthDay } from "@/core/daily-fortune";

const bodySchema = z.object({
  inAppEnabled: z.boolean(),
  cautionReminders: z.boolean(),
  emailEnabled: z.boolean(),
  dailyFlowEnabled: z.boolean(),
  dailyConsentAccepted: z.boolean(),
  dailyBirthMonth: z.number().int().min(1).max(12).nullable(),
  dailyBirthDay: z.number().int().min(1).max(31).nullable(),
  paidAutoEnable: z.boolean(),
  locale: z.enum(["ko", "en"]),
  timeZone: z.string().trim().min(1).max(100),
}).strict().superRefine((value, context) => {
  const hasValidBirthDay = value.dailyBirthMonth !== null && value.dailyBirthDay !== null &&
    isValidMonthDay(value.dailyBirthMonth, value.dailyBirthDay);
  if ((value.dailyFlowEnabled || value.paidAutoEnable) && (!value.dailyConsentAccepted || !hasValidBirthDay)) {
    context.addIssue({ code: "custom", path: ["dailyFlowEnabled"], message: "Daily notification consent and a valid month/day are required." });
  }
  if (value.dailyFlowEnabled && !value.inAppEnabled) {
    context.addIssue({ code: "custom", path: ["inAppEnabled"], message: "In-app notifications must be enabled." });
  }
});

export async function PUT(request: Request) {
  if (!isSameOriginRequest(request)) return crossOriginRefused();
  const auth = await requireSupabaseUser();
  if (auth.error || !auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "AUTH_REQUIRED" ? 401 : 503 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_NOTIFICATION_SETTINGS" }, { status: 400 });
  }
  const previous = await auth.client
    .from("notification_preferences")
    .select("daily_notification_consent_at")
    .eq("owner_user_id", auth.user.id)
    .maybeSingle();
  const consentAt = parsed.data.dailyConsentAccepted
    ? previous.data?.daily_notification_consent_at ?? new Date().toISOString()
    : null;
  const { error } = await auth.client.from("notification_preferences").upsert({
    owner_user_id: auth.user.id,
    in_app_enabled: parsed.data.inAppEnabled,
    caution_reminders: parsed.data.cautionReminders,
    email_enabled: parsed.data.emailEnabled,
    daily_flow_enabled: parsed.data.dailyConsentAccepted && parsed.data.dailyFlowEnabled,
    daily_notification_consent_at: consentAt,
    daily_birth_month: parsed.data.dailyConsentAccepted ? parsed.data.dailyBirthMonth : null,
    daily_birth_day: parsed.data.dailyConsentAccepted ? parsed.data.dailyBirthDay : null,
    paid_auto_enable: parsed.data.dailyConsentAccepted && parsed.data.paidAutoEnable,
    locale: parsed.data.locale,
    time_zone: parsed.data.timeZone,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    return NextResponse.json({ error: "NOTIFICATION_SETTINGS_FAILED" }, { status: 500 });
  }
  return NextResponse.json({ saved: true });
}
