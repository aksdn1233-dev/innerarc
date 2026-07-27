import { notFound } from "next/navigation";
import { MeExperience } from "@/components/me-experience";
import { isLocale } from "@/i18n/config";
import { meCopy } from "@/i18n/me-copy";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const configured = isSupabaseConfigured();
  const client = configured ? await getServerSupabaseClient() : null;
  const userResult = client ? await client.auth.getUser() : null;
  const user = userResult?.data.user;
  return (
    <MeExperience
      locale={locale}
      copy={meCopy[locale]}
      account={user ? { email: user.email ?? null } : null}
      accountSyncConfigured={configured}
    />
  );
}
