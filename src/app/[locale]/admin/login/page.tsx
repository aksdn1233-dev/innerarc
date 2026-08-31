import { notFound } from "next/navigation";
import { AdminLogin } from "@/components/admin-login";
import { isLocale } from "@/i18n/config";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  let supabaseConfig: ReturnType<typeof getSupabasePublicConfig>;
  try {
    // NEXT_PUBLIC values are public credentials, but a Cloudflare runtime binding is
    // not automatically compiled into a browser chunk. Serialize the validated pair
    // from the request environment so direct deployments keep magic-link auth working.
    supabaseConfig = getSupabasePublicConfig();
  } catch {
    supabaseConfig = null;
  }
  return <AdminLogin locale={locale} supabaseConfig={supabaseConfig} />;
}
