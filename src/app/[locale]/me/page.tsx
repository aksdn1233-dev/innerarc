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
  const [reportsResult, preferencesResult] = user && client
    ? await Promise.all([
        client
          .from("purchased_reports")
          .select("order_id,product_code,status,report,created_at")
          .eq("owner_user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30),
        client
          .from("notification_preferences")
          .select("in_app_enabled,caution_reminders,email_enabled")
          .eq("owner_user_id", user.id)
          .maybeSingle(),
      ])
    : [{ data: [] }, { data: null }];
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
      }}
      adminAccess={isAdminEmail(user?.email)}
    />
  );
}
