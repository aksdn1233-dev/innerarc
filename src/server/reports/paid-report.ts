import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateNumerologyProfile } from "@/core/numerology";
import { createOnboardingReflectionContext } from "@/core/onboarding";
import type { PaidReadingInput, PaidReport } from "@/core/paid-reading";
import { PaidReadingInputSchema } from "@/core/paid-reading";
import { createIntegratedProfile, getRuleBasedProfile } from "@/core/profile";
import { assessQuestionSafety } from "@/core/ai/safety";
import { resolveConcernTopic, topicText } from "@/core/topics/concern-topics";

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
  // The sentence the buyer actually wrote. Read it, answer that situation, and route
  // it to reality-first handling when it belongs to a clinician, a lawyer, or a
  // helpline rather than to symbolism.
  const safety = assessQuestionSafety(input.concern);
  const { topic, matched } = resolveConcernTopic(input.concern, input.focusId);
  const topicSection = safety.requiresRealityFirstGuidance
    ? {
        title: ko ? "먼저 확인해야 할 것" : "What comes first",
        body: ko
          ? "적어주신 내용은 상징으로 답할 수 있는 범위를 넘어섭니다. 의료·법률·금전·안전에 관한 판단은 해당 분야의 자격을 갖춘 곳에서 확인하셔야 하고, 이 리포트는 그 결정을 대신하지 않습니다. 아래 내용은 그 확인을 마친 뒤 참고용으로만 보시기 바랍니다."
          : "What you wrote goes beyond what symbolism can answer. Medical, legal, financial, and safety questions belong to a qualified professional, and this report does not stand in for that decision. Read the rest only as reflection once that is done.",
      }
    : {
        title: ko ? `이 고민에서 확인할 것 · ${topic.label.ko}` : `On your question · ${topic.label.en}`,
        body: [
          topicText(topic.framing, input.locale),
          topicText(topic.observe, input.locale),
          topicText(topic.caution, input.locale),
          matched
            ? ""
            : ko
              ? "적어주신 내용에서 구체적인 상황을 특정하지 못해, 선택하신 관심 영역을 기준으로 정리했습니다. 다음에는 상황을 한 문장 더 적어주시면 더 좁혀 드릴 수 있어요."
              : "The situation could not be identified from what you wrote, so this follows the area you selected. One more sentence next time lets it narrow further.",
        ].filter(Boolean).join(" "),
      };
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
    // Every tier includes this. Even the cheapest reading is bought by someone who
    // wants to hear something about themselves, not only about their one question.
    {
      title: ko ? "당신의 핵심 성향" : "Your core pattern",
      body: ko
        // Strengths and risks come from the integrated profile, which derives them from
        // the life-path, attitude, and birthday numbers together. getRuleBasedProfile
        // returns the same three strengths for every life path, so reading from it here
        // would hand every buyer an identical description under a different label.
        //
        // The phrases are data and can end in either a vowel or a consonant, so they are
        // followed by a fixed noun rather than an 은/는 particle.
        ? `생명수 ${profile.lifePath.value}, 타로로 치면 '${overview.archetype}' 자리예요. ${integrated.summary} ` +
          `${integrated.strengths.join(", ")} — 이런 면이 특히 잘 드러나는 편이에요. ` +
          `다만 ${integrated.risks.join(", ")} 같은 순간이 올 수 있어요. ` +
          `이 부분만 한 번 살펴보시면 좋겠어요.`
        : `Life path ${profile.lifePath.value}, read through the ${overview.archetype} pattern. ${integrated.summary} ` +
          `Strengths that tend to show up: ${integrated.strengths.join(", ")}. ` +
          `The counterweights worth watching in yourself: ${integrated.risks.join(", ")}.`,
    },
    // Placed before the domain sections: the buyer came for this, not for the profile.
    topicSection,
    ...domainOrder.map((domain) => ({
      title: domain.title,
      body: `${domain.personalizedInference} ${domain.realityCheck}`,
    })),
  ];
  if (input.productCode === "premium_pdf") {
    sections.push({
      title: ko ? "일과 역할에서 확인할 조건" : "Conditions to check in work",
      // One role per line with its two halves labelled. Joined with a space these ran
      // together into a single wall of text where each role's fit and its warning were
      // indistinguishable.
      body: integrated.careerRecommendations
        .map((role) => ko
          ? `· ${role.title}\n  잘 맞는 자리 — ${role.fitReason}\n  피할 자리 — ${role.avoidCondition}`
          : `· ${role.title}\n  Fits — ${role.fitReason}\n  Avoid — ${role.avoidCondition}`)
        .join("\n\n"),
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
      // The topic's own step leads, because it answers the question that was asked.
      ...(safety.requiresRealityFirstGuidance ? [] : [topicText(topic.action, input.locale)]),
      context.practicalAction,
      ...integrated.practicalActions.slice(0, input.productCode === "plus_30d" ? 1 : 3),
    ],
    cautions: [
      ...(safety.requiresRealityFirstGuidance ? [] : [topicText(topic.caution, input.locale)]),
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
  // A revoked report follows a cancellation or refund. The provider retries a callback
  // whose response it did not accept, so a delivery confirmation can land after the
  // money has already gone back — reopening a report the buyer no longer paid for.
  // Only a draft awaiting payment may become readable.
  if (data.status !== "pending_payment") return;

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
      .eq("order_id", orderId)
      // Concurrent callbacks for the same order both pass the read above; the writer
      // that loses this condition changes nothing instead of writing a second time.
      .eq("status", "pending_payment");
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
