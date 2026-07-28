import { notFound } from "next/navigation";
import { AdminLogin } from "@/components/admin-login";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AdminLogin locale={locale} />;
}
