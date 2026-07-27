import { notFound } from "next/navigation";
import { PlansExperience } from "@/components/plans-experience";
import { isLocale } from "@/i18n/config";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { inspectPaymentReadiness } from "@/server/payments/config";

export const dynamic = "force-dynamic";

export default async function PlansPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [auth, readiness] = await Promise.all([
    requireSupabaseUser(),
    Promise.resolve(inspectPaymentReadiness()),
  ]);
  const enabled = readiness.enabled && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const products = readiness.enabled
    ? [
        {
          code: "plus_30d" as const,
          tier: "Plus" as const,
          name: readiness.config.products.plus_30d.names[locale],
          amount: readiness.config.products.plus_30d.amount,
          features: locale === "ko"
            ? ["심화 해석 이용", "계정 동기화 기반 이용권", "자동 갱신 없음"]
            : ["Deeper reflections", "Account-linked access", "No automatic renewal"],
        },
        {
          code: "pro_30d" as const,
          tier: "Pro" as const,
          name: readiness.config.products.pro_30d.names[locale],
          amount: readiness.config.products.pro_30d.amount,
          features: locale === "ko"
            ? ["Plus 기능 포함", "향후 Pro 기능 이용", "자동 갱신 없음"]
            : ["Includes Plus", "Future Pro features", "No automatic renewal"],
        },
      ]
    : [
        {
          code: "plus_30d" as const,
          tier: "Plus" as const,
          name: locale === "ko" ? "InnerArc Plus 30일 이용권" : "InnerArc Plus 30-day access",
          amount: null,
          features: locale === "ko"
            ? ["심화 해석 이용", "계정 동기화 기반 이용권", "자동 갱신 없음"]
            : ["Deeper reflections", "Account-linked access", "No automatic renewal"],
        },
        {
          code: "pro_30d" as const,
          tier: "Pro" as const,
          name: locale === "ko" ? "InnerArc Pro 30일 이용권" : "InnerArc Pro 30-day access",
          amount: null,
          features: locale === "ko"
            ? ["Plus 기능 포함", "향후 Pro 기능 이용", "자동 갱신 없음"]
            : ["Includes Plus", "Future Pro features", "No automatic renewal"],
        },
      ];

  return (
    <PlansExperience
      locale={locale}
      products={products}
      signedIn={Boolean(auth.user)}
      paymentsEnabled={enabled}
    />
  );
}
