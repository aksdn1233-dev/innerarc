import type { Metadata } from "next";
import "@/app/taeryeong-landing.css";
import { notFound } from "next/navigation";
import { TaeryeongLanding } from "@/components/taeryeong-landing";
import { isLocale } from "@/i18n/config";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { countPublicReviews } from "@/server/reviews";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    alternates: {
      canonical: `/${locale}`,
      languages: { ko: "/ko", en: "/en" },
    },
  };
}

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const admin = resolveSupabaseAdminClient().client;
  let reviewCount: number | null = null;
  if (admin) {
    reviewCount = await countPublicReviews(admin, locale);
  }
  return <TaeryeongLanding locale={locale} reviewCount={reviewCount} />;
}

export const dynamic = "force-dynamic";
