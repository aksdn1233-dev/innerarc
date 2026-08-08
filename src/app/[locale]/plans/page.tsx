import { notFound } from "next/navigation";
import { PlansExperience } from "@/components/plans-experience";
import { resolveProductPricing } from "@/core/product-prices";
import { isLocale } from "@/i18n/config";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { inspectPaymentReadiness } from "@/server/payments/config";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { readOperationsGate } from "@/server/payments/gate";

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
  const now = new Date();
  const pricing = resolveProductPricing();

  // Reads the same incident pause switch the order API enforces, so the product page
  // never advertises a checkout the server would refuse.
  const admin = resolveSupabaseAdminClient().client;
  const [auth, gate] = await Promise.all([
    requireSupabaseUser(),
    readOperationsGate(admin),
  ]);
  const readiness = inspectPaymentReadiness(process.env, undefined, now);
  const enabled = readiness.enabled &&
    gate.salesEnabled &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const paymentProvider = readiness.enabled ? readiness.config.provider : null;
  const products = readiness.enabled
    ? [
        {
          code: "pro_30d" as const,
          tier: locale === "ko" ? "상세 분석" : "Detailed",
          name: readiness.config.products.pro_30d.names[locale],
          amount: readiness.config.products.pro_30d.amount,
          regularAmount: pricing.regularPrices.pro_30d,
          features: locale === "ko"
            ? ["5가지 핵심 숫자와 성향의 모순", "한 질문 분야 상세 분석 또는 일반 상세 리포트", "선택 동의 시 AI 배우자상 콘셉트", "두 사람 궁합 이용", "상황별 대처 4~5가지", "우선 실행 계획 5단계", "중단·재검토 기준", "결제 후 열람·다운로드"]
            : ["Five calculated facts and internal contradiction", "Detailed question or general report", "Two-person compatibility", "Situation guidance", "Five-step execution plan", "Stop criteria", "Saved and downloadable"],
        },
        {
          code: "premium_pdf" as const,
          tier: locale === "ko" ? "프리미엄" : "Premium",
          name: readiness.config.products.premium_pdf.names[locale],
          amount: readiness.config.products.premium_pdf.amount,
          regularAmount: pricing.regularPrices.premium_pdf,
          features: locale === "ko"
            ? ["상세 리딩의 모든 분석 포함", "질문이 없어도 완결되는 전체 리포트", "선택 동의 시 AI 배우자상 콘셉트", "숨은 동기·실패의 뿌리", "최선·현실·위험 시나리오 3가지", "확인·반박 신호와 재평가 시점", "6단계 실행과 6가지 중단 기준", "결제 후 열람·다운로드"]
            : ["Everything in Detailed", "Complete with or without a question", "Hidden motivation and root causes", "Three scenarios and observable signals", "Six-step execution and six stop criteria", "Saved and downloadable"],
        },
      ]
    : [
        {
          code: "pro_30d" as const,
          tier: locale === "ko" ? "상세 분석" : "Detailed",
          name: locale === "ko" ? "상세 리딩" : "Detailed reading",
          amount: pricing.prices.pro_30d,
          regularAmount: pricing.regularPrices.pro_30d,
          features: locale === "ko"
            ? ["5가지 핵심 숫자와 성향의 모순", "한 질문 분야 상세 분석 또는 일반 상세 리포트", "선택 동의 시 AI 배우자상 콘셉트", "두 사람 궁합 이용", "상황별 대처 4~5가지", "우선 실행 계획 5단계", "중단·재검토 기준", "결제 후 열람·다운로드"]
            : ["Five calculated facts and internal contradiction", "Detailed question or general report", "Two-person compatibility", "Situation guidance", "Five-step execution plan", "Stop criteria", "Saved and downloadable"],
        },
        {
          code: "premium_pdf" as const,
          tier: locale === "ko" ? "프리미엄" : "Premium",
          name: locale === "ko" ? "프리미엄 심층 리딩" : "Premium in-depth reading",
          amount: pricing.prices.premium_pdf,
          regularAmount: pricing.regularPrices.premium_pdf,
          features: locale === "ko"
            ? ["상세 리딩의 모든 분석 포함", "질문이 없어도 완결되는 전체 리포트", "선택 동의 시 AI 배우자상 콘셉트", "숨은 동기·실패의 뿌리", "최선·현실·위험 시나리오 3가지", "확인·반박 신호와 재평가 시점", "6단계 실행과 6가지 중단 기준", "결제 후 열람·다운로드"]
            : ["Everything in Detailed", "Complete with or without a question", "Hidden motivation and root causes", "Three scenarios and observable signals", "Six-step execution and six stop criteria", "Saved and downloadable"],
        },
      ];

  return (
    <PlansExperience
      locale={locale}
      products={products}
      initialProduct={
        query.product === "pro_30d" ||
        query.product === "premium_pdf"
          ? query.product
          : null
      }
      signedIn={Boolean(auth.user)}
      paymentsEnabled={enabled}
      paymentProvider={paymentProvider}
      pricing={pricing}
    />
  );
}
