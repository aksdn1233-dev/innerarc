import { notFound } from "next/navigation";
import { PlansExperience } from "@/components/plans-experience";
import { isLocale } from "@/i18n/config";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { inspectPaymentReadiness } from "@/server/payments/config";

export const dynamic = "force-dynamic";

export default async function PlansPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
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
          tier: locale === "ko" ? "빠른 답변" : "Quick",
          name: readiness.config.products.plus_30d.names[locale],
          amount: readiness.config.products.plus_30d.amount,
          features: locale === "ko"
            ? ["한 가지 고민 집중", "핵심 흐름과 다음 행동", "결제 후 열람·다운로드"]
            : ["One focused concern", "Core flow and next action", "Saved and downloadable"],
        },
        {
          code: "pro_30d" as const,
          tier: locale === "ko" ? "종합 분석" : "Comprehensive",
          name: readiness.config.products.pro_30d.names[locale],
          amount: readiness.config.products.pro_30d.amount,
          features: locale === "ko"
            ? ["연애·관계·일·재물 종합", "생년월일 기반 상세 흐름", "결제 후 열람·다운로드"]
            : ["Love, work, and money", "Detailed birth-date flow", "Saved and downloadable"],
        },
        {
          code: "premium_pdf" as const,
          tier: locale === "ko" ? "프리미엄" : "Premium",
          name: readiness.config.products.premium_pdf.names[locale],
          amount: readiness.config.products.premium_pdf.amount,
          features: locale === "ko"
            ? ["여러 고민을 묶은 장문 리포트", "실천 지침과 주의 알림", "결제 후 열람·다운로드"]
            : ["Long-form custom report", "Actions and caution reminders", "Saved and downloadable"],
        },
      ]
    : [
        {
          code: "plus_30d" as const,
          tier: locale === "ko" ? "빠른 답변" : "Quick",
          name: locale === "ko" ? "간단 타로 리딩" : "Quick tarot reading",
          amount: 19_000,
          features: locale === "ko"
            ? ["한 가지 고민 집중", "핵심 흐름과 다음 행동", "결제 후 열람·다운로드"]
            : ["One focused concern", "Core flow and next action", "Saved and downloadable"],
        },
        {
          code: "pro_30d" as const,
          tier: locale === "ko" ? "종합 분석" : "Comprehensive",
          name: locale === "ko" ? "타로·생년월일 종합 리딩" : "Tarot and birth-date reading",
          amount: 39_000,
          features: locale === "ko"
            ? ["연애·관계·일·재물 종합", "생년월일 기반 상세 흐름", "결제 후 열람·다운로드"]
            : ["Love, work, and money", "Detailed birth-date flow", "Saved and downloadable"],
        },
        {
          code: "premium_pdf" as const,
          tier: locale === "ko" ? "프리미엄" : "Premium",
          name: locale === "ko" ? "프리미엄 맞춤 PDF" : "Premium custom PDF",
          amount: 79_000,
          features: locale === "ko"
            ? ["여러 고민을 묶은 장문 리포트", "실천 지침과 주의 알림", "결제 후 열람·다운로드"]
            : ["Long-form custom report", "Actions and caution reminders", "Saved and downloadable"],
        },
      ];

  return (
    <PlansExperience
      locale={locale}
      products={products}
      initialProduct={
        query.product === "plus_30d" ||
        query.product === "pro_30d" ||
        query.product === "premium_pdf"
          ? query.product
          : null
      }
      signedIn={Boolean(auth.user)}
      paymentsEnabled={enabled}
      paymentProvider={readiness.enabled ? readiness.config.provider : null}
    />
  );
}
