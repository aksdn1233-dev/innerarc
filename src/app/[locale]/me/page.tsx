import { notFound } from "next/navigation";
import { MeExperience } from "@/components/me-experience";
import { customerAccountsEnabled } from "@/core/customer-accounts";
import { isLocale } from "@/i18n/config";
import { meCopy } from "@/i18n/me-copy";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import type { PaidReport } from "@/core/paid-reading";
import { isAdminEmail } from "@/server/admin-access";

export const dynamic = "force-dynamic";

export default async function MePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const configured = isSupabaseConfigured();
  const client = configured ? await getServerSupabaseClient() : null;
  const userResult = client ? await client.auth.getUser() : null;
  const user = userResult?.data.user;
  const [reportsResult, preferencesResult, deliveriesResult] = user && client
    ? await Promise.all([
        client
          .from("purchased_reports")
          .select("order_id,product_code,status,report,created_at")
          .eq("owner_user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30),
        client
          .from("notification_preferences")
          .select("in_app_enabled,caution_reminders,email_enabled,daily_flow_enabled,daily_notification_consent_at,daily_birth_month,daily_birth_day,paid_auto_enable,time_zone")
          .eq("owner_user_id", user.id)
          .maybeSingle(),
        client
          .from("daily_notification_deliveries")
          .select("id,delivery_date,title,summary,action_text,caution_text,question_text,read_at")
          .eq("owner_user_id", user.id)
          .order("delivery_date", { ascending: false })
          .limit(7),
      ])
    : [{ data: [] }, { data: null }, { data: [] }];
  const reports = (reportsResult.data ?? []).map((item) => ({
    orderId: String(item.order_id),
    productCode: String(item.product_code),
    status: String(item.status),
    createdAt: String(item.created_at),
    report: (item.report ?? null) as PaidReport | null,
  }));
  const preferences = preferencesResult.data;
  return (
    <MeExperience
      locale={locale}
      copy={meCopy[locale]}
      account={user ? { email: user.email ?? null } : null}
      accountSyncConfigured={configured && customerAccountsEnabled}
      reports={reports}
      notificationPreferences={{
        inAppEnabled: preferences?.in_app_enabled ?? true,
        cautionReminders: preferences?.caution_reminders ?? true,
        emailEnabled: preferences?.email_enabled ?? false,
        dailyFlowEnabled: preferences?.daily_flow_enabled ?? false,
        dailyConsentAccepted: Boolean(preferences?.daily_notification_consent_at),
        dailyBirthMonth: preferences?.daily_birth_month ?? null,
        dailyBirthDay: preferences?.daily_birth_day ?? null,
        paidAutoEnable: preferences?.paid_auto_enable ?? true,
        timeZone: preferences?.time_zone ?? "Asia/Seoul",
      }}
      dailyNotifications={(deliveriesResult.data ?? []).map((item) => ({
        id: String(item.id),
        deliveryDate: String(item.delivery_date),
        title: String(item.title),
        summary: String(item.summary),
        action: String(item.action_text),
        caution: String(item.caution_text),
        question: String(item.question_text),
        readAt: item.read_at ? String(item.read_at) : null,
      }))}
      adminAccess={isAdminEmail(user?.email)}
    />
  );
}
