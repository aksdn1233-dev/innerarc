import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateNumerologyProfile } from "@/core/numerology";
import { createOnboardingReflectionContext } from "@/core/onboarding";
import type { PaidReadingInput, PaidReport } from "@/core/paid-reading";
import { PaidReadingInputSchema } from "@/core/paid-reading";
import { createIntegratedProfile, getRuleBasedProfile } from "@/core/profile";
import { buildCharacterLabel } from "@/core/profile/character-label";
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
          // For a situation with a working formal channel, the channel belongs in the
          // section itself rather than further down a list the reader may not reach.
          topic.escalate ? topicText(topic.action, input.locale) : "",
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
  const character = buildCharacterLabel(
    profile.lifePath.value,
    profile.attitude.value,
    input.locale,
  );
  const sections = [
    // The verdict comes first. A reading that opens by explaining what it cannot tell
    // you has already lost the reader; the limitation belongs at the end, if anywhere.
    {
      title: ko ? "질문에 대한 답" : "The answer",
      body: safety.requiresRealityFirstGuidance
        ? (ko
            ? "적어주신 내용은 상징으로 답할 수 있는 범위를 넘어섭니다. 의료·법률·금전·안전에 관한 판단은 해당 분야의 자격을 갖춘 곳에서 확인하셔야 하고, 이 리포트는 그 결정을 대신하지 않습니다."
            : "What you wrote goes beyond what symbolism can answer. Medical, legal, financial, and safety questions belong to a qualified professional, and this report does not stand in for that decision.")
        : topicText(topic.verdict, input.locale),
    },
    // Named from the numbers that were actually calculated. No tarot card is referenced
    // because none was drawn for this product.
    {
      title: ko ? "당신은 어떤 사람인가" : "Who you are",
      body: ko
        ? `${character.label}. ${integrated.summary} ` +
          `${integrated.strengths.join(", ")} — 이런 면이 특히 잘 드러나는 편이에요. ` +
          `다만 ${integrated.risks.join(", ")} 같은 순간이 올 수 있어요.`
        : `You read as ${character.label}. ${integrated.summary} ` +
          `Strengths that tend to show up: ${integrated.strengths.join(", ")}. ` +
          `The counterweights worth watching: ${integrated.risks.join(", ")}.`,
    },
    // Placed before the domain sections: the buyer came for this, not for the profile.
    topicSection,
    ...domainOrder.map((domain) => ({
      title: domain.title,
      body: `${domain.personalizedInference} ${domain.realityCheck}`,
    })),
  ];

  // Tiers differ in what they explain, not only in how many domain sections they carry.
  // The quick reading answers the question; the detailed one explains why the pattern
  // occurs and what changes it; the premium one adds the numbers behind it and the
  // conditions under which each direction holds.
  if (input.productCode !== "plus_30d") {
    sections.push({
      title: ko ? "왜 이런 흐름이 나오나" : "Why this pattern",
      body: `${context.contextualInference} ${overview.summary}`.trim(),
    });
    sections.push({
      title: ko ? "잘될 조건과 어긋나는 조건" : "What makes it work, and what does not",
      body: ko
        ? `${integrated.strengths[0] ?? ""}이(가) 살아나는 조건에서 이 방향은 잘 굴러갑니다. ` +
          `반대로 ${integrated.risks[0] ?? ""} 상황이 이어지면 같은 노력을 해도 결과가 잘 남지 않습니다. ` +
          `${topicText(topic.observe, input.locale)}`
        : `This direction runs well where ${integrated.strengths[0] ?? ""} is available. ` +
          `Where ${integrated.risks[0] ?? ""} persists, the same effort leaves less behind. ` +
          `${topicText(topic.observe, input.locale)}`,
    });
  }
  if (input.productCode === "premium_pdf") {
    sections.push({
      title: ko ? "계산 근거" : "The numbers behind this",
      body: ko
        // A digit takes its particle from how it is read aloud, which the template
        // cannot know, so the sentence ends on a fixed noun instead.
        ? `생명수 ${profile.lifePath.value}, 태도수 ${profile.attitude.value}, 생일수 ${profile.birthday.value} — 이 세 값을 함께 놓고 본 결과입니다. ` +
          `${character.qualifier} 성향과 ${character.noun}의 기질이 만나는 지점에서 위 해석이 나옵니다. ` +
          `계산 자체는 생년월일에서 결정론적으로 나오며, 같은 생일이면 같은 값이 나옵니다.`
        : `This reads life path ${profile.lifePath.value}, attitude ${profile.attitude.value}, and birthday ${profile.birthday.value} together. ` +
          `The interpretation sits where a ${character.qualifier} approach meets the temperament of ${character.noun}. ` +
          `The calculation is deterministic: the same birth date always yields the same values.`,
    });
    sections.push({
      title: ko ? "이렇게 갈 수 있습니다" : "How this can go",
      body: ko
        ? `가장 잘 풀리는 경우는 ${topicText(topic.action, input.locale)} 이 방향이 자리를 잡을 때입니다. ` +
          `가장 흔한 경우는 방향은 맞지만 속도가 붙지 않는 상태이고, 이때는 확인할 것을 하나로 줄이면 다시 움직입니다. ` +
          `주의해야 할 경우는 ${topicText(topic.caution, input.locale)}`
        : `The best case is where this takes hold: ${topicText(topic.action, input.locale)} ` +
          `The likeliest case is the right direction without momentum, which moves again once you narrow what to check to one thing. ` +
          `The case to watch: ${topicText(topic.caution, input.locale)}`,
    });
  }
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
