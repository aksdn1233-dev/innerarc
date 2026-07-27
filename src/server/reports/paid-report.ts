import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateNumerologyProfile } from "@/core/numerology";
import { createOnboardingReflectionContext } from "@/core/onboarding";
import type { PaidReadingInput, PaidReport } from "@/core/paid-reading";
import { PaidReadingInputSchema } from "@/core/paid-reading";
import { createIntegratedProfile, getRuleBasedProfile } from "@/core/profile";

function reportName(productCode: PaidReadingInput["productCode"], locale: PaidReadingInput["locale"]) {
  const names = locale === "ko"
    ? {
        plus_30d: "간단 타로 리딩",
        pro_30d: "타로·생년월일 종합 리딩",
        premium_pdf: "프리미엄 맞춤 리포트",
      }
    : {
        plus_30d: "Quick tarot reading",
        pro_30d: "Tarot and birth-date reading",
        premium_pdf: "Premium custom report",
      };
  return names[productCode];
}

export function createPaidReport(orderId: string, rawInput: unknown): PaidReport {
  const input = PaidReadingInputSchema.parse(rawInput);
  const profile = calculateNumerologyProfile({
    birthDate: input.birthDate,
    name: input.name,
    personalYear: new Date().getFullYear(),
  });
  const overview = getRuleBasedProfile(profile.lifePath.value, input.locale);
  const integrated = createIntegratedProfile(profile, input.locale);
  const context = createOnboardingReflectionContext({
    locale: input.locale,
    focusId: input.focusId,
    depth: input.productCode === "plus_30d" ? "light" : "deep",
    concern: input.concern.slice(0, 1_000),
    aiPersonalizationConsent: false,
  });
  const ko = input.locale === "ko";
  const domainOrder = input.productCode === "plus_30d"
    ? integrated.domains.slice(0, 1)
    : input.productCode === "pro_30d"
      ? integrated.domains.slice(0, 4)
      : integrated.domains;
  const sections = [
    {
      title: ko ? "지금의 핵심 흐름" : "Current theme",
      body: `${context.contextualInference} ${overview.summary}`,
    },
    ...domainOrder.map((domain) => ({
      title: domain.title,
      body: `${domain.personalizedInference} ${domain.realityCheck}`,
    })),
  ];
  if (input.productCode === "premium_pdf") {
    sections.push({
      title: ko ? "일과 역할에서 확인할 조건" : "Conditions to check in work",
      body: integrated.careerRecommendations
        .map((role) => `${role.title}: ${role.fitReason} ${role.avoidCondition}`)
        .join(" "),
    });
  }

  return {
    version: 1,
    orderId,
    productCode: input.productCode,
    locale: input.locale,
    title: reportName(input.productCode, input.locale),
    customerName: input.name || null,
    createdAt: new Date().toISOString(),
    concern: input.concern,
    summary: context.title,
    sections,
    actions: [
      context.practicalAction,
      ...integrated.practicalActions.slice(0, input.productCode === "plus_30d" ? 1 : 3),
    ],
    cautions: [
      context.realityCheck,
      ...integrated.risks.slice(0, input.productCode === "premium_pdf" ? 3 : 2),
    ],
    disclaimer: ko
      ? "이 리포트는 자기이해와 선택 정리를 위한 참고 자료이며 미래, 건강, 투자 수익 또는 타인의 마음을 보장하지 않습니다."
      : "This report supports reflection and decision-making. It does not guarantee the future, health outcomes, investment returns, or another person's feelings.",
  };
}

export async function revokeGuestPaidReport(
  admin: SupabaseClient,
  orderId: string,
): Promise<void> {
  const { error } = await admin
    .from("purchased_reports")
    .update({ status: "revoked", updated_at: new Date().toISOString() })
    .eq("order_id", orderId)
    .is("owner_user_id", null);
  if (error) throw error;
}

export async function finalizePaidReport(
  admin: SupabaseClient,
  ownerUserId: string | null,
  orderId: string,
): Promise<void> {
  let selectQuery = admin
    .from("purchased_reports")
    .select("input,status")
    .eq("order_id", orderId);
  selectQuery = ownerUserId
    ? selectQuery.eq("owner_user_id", ownerUserId)
    : selectQuery.is("owner_user_id", null);
  const { data, error } = await selectQuery.maybeSingle();
  if (error || !data) throw error ?? new Error("REPORT_DRAFT_NOT_FOUND");
  if (data.status === "ready") return;

  try {
    const report = createPaidReport(orderId, data.input);
    let updateQuery = admin
      .from("purchased_reports")
      .update({
        report,
        status: "ready",
        ready_at: report.createdAt,
        updated_at: report.createdAt,
      })
      .eq("order_id", orderId);
    updateQuery = ownerUserId
      ? updateQuery.eq("owner_user_id", ownerUserId)
      : updateQuery.is("owner_user_id", null);
    const { error: updateError } = await updateQuery;
    if (updateError) throw updateError;
  } catch (error) {
    let failureQuery = admin
      .from("purchased_reports")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("order_id", orderId);
    failureQuery = ownerUserId
      ? failureQuery.eq("owner_user_id", ownerUserId)
      : failureQuery.is("owner_user_id", null);
    await failureQuery;
    throw error;
  }
}
