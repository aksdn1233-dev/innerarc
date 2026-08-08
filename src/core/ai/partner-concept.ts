import type { NumerologyProfile } from "@/core/numerology";
import type { Locale } from "@/i18n/config";

export type AiPartnerConcept = Readonly<{
  title: string;
  summary: string;
  traits: readonly string[];
  imageSrc: string;
  disclaimer: string;
}>;

const concepts = {
  ko: [
    { title: "차분하게 중심을 잡아주는 동반자", summary: "감정의 속도를 재촉하기보다 약속과 일상을 꾸준히 지키는 사람에게 안정감을 느끼는 조합입니다.", traits: ["말보다 행동", "일관된 연락", "경계 존중"] },
    { title: "대화로 가능성을 넓히는 동반자", summary: "생각을 숨기지 않고 질문과 대화로 풀어가며, 서로의 성장 속도를 존중하는 사람과 호흡이 잘 맞습니다.", traits: ["솔직한 대화", "지적 호기심", "서로의 성장"] },
    { title: "현실과 감정을 함께 돌보는 동반자", summary: "따뜻한 표현뿐 아니라 시간·돈·생활의 책임까지 함께 조율하는 사람에게 관계의 지속성이 높아집니다.", traits: ["생활 감각", "책임 분담", "갈등 뒤 회복"] },
  ],
  en: [
    { title: "A grounding, steady partner", summary: "Consistency, kept plans, and respect for pace matter more than emotional intensity.", traits: ["Actions over words", "Steady contact", "Respected boundaries"] },
    { title: "A partner who grows through dialogue", summary: "Open questions, honest conversation, and respect for each other's growth create the strongest rhythm.", traits: ["Honest dialogue", "Curiosity", "Mutual growth"] },
    { title: "A partner who balances feeling and reality", summary: "Warmth lasts when time, money, daily life, and repair after conflict are shared responsibly.", traits: ["Practical care", "Shared responsibility", "Repair after conflict"] },
  ],
} as const;

export function createAiPartnerConcept(profile: NumerologyProfile, locale: Locale): AiPartnerConcept {
  const index = (profile.lifePath.value + profile.attitude.value + profile.birthday.value) % 3;
  return {
    ...concepts[locale][index]!,
    imageSrc: "/images/ai-partner-archetype-realistic.png",
    disclaimer: locale === "ko"
      ? "AI가 수비학의 관계 성향을 시각화한 콘셉트입니다. 실제 인물의 얼굴이나 미래의 만남을 예측하지 않습니다."
      : "An AI visualization of relationship themes—not a prediction of a real person's face or a future meeting.",
  };
}
