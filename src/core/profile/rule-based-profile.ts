import type { Locale } from "@/i18n/config";

type ProfileCopy = {
  summary: string;
  archetype: string;
  strengths: readonly [string, string, string];
  risks: readonly [string, string];
  careers: string;
  relationship: string;
  symbolic: string;
  inference: string;
  limitation: string;
};

const ARCHETYPES_KO: Record<number, string> = {
  1: "마법사",
  2: "여사제",
  3: "여제",
  4: "황제",
  5: "교황",
  6: "연인",
  7: "전차",
  8: "힘",
  9: "은둔자",
  11: "정의",
  22: "바보",
  33: "연인",
};

const ARCHETYPES_EN: Record<number, string> = {
  1: "The Magician",
  2: "The High Priestess",
  3: "The Empress",
  4: "The Emperor",
  5: "The Hierophant",
  6: "The Lovers",
  7: "The Chariot",
  8: "Strength",
  9: "The Hermit",
  11: "Justice",
  22: "The Fool",
  33: "The Lovers",
};

export function getRuleBasedProfile(lifePath: number, locale: Locale): ProfileCopy {
  const ko = locale === "ko";
  const archetype = (ko ? ARCHETYPES_KO : ARCHETYPES_EN)[lifePath] ??
    (ko ? "성찰자" : "The Reflector");

  if (ko) {
    return {
      summary: `${archetype} 자리에서, 스스로 밀고 나가는 힘과 주변의 말 사이에서 나만의 균형점을 찾아가는 중이에요.`,
      archetype,
      strengths: ["선택을 자기 언어로 정리하는 힘", "새로운 관점을 시도하는 태도", "경험에서 패턴을 찾는 감각"],
      risks: ["상징을 정답처럼 받아들이기", "한 번의 결과로 자신을 고정하기"],
      careers: "전략기획 · 콘텐츠 · 교육·상담",
      relationship: "혼자 생각할 시간과 솔직한 대화를 함께 확보할 때 관계가 안정되는 편으로 해석할 수 있습니다.",
      symbolic: `전통적 생년월일 패턴에서는 라이프 패스 ${lifePath}을(를) ${archetype}의 주제와 연결합니다.`,
      inference: "현재 관심 분야를 실제 선택 기준과 연결해 보면 이 상징의 개인 관련성을 확인할 수 있습니다.",
      limitation: "이 문장은 숫자 상징을 일반화한 출발점이며 성격을 측정하거나 결과를 예측하지 않습니다.",
    };
  }
  return {
    summary: `Through the lens of ${archetype}, you may be exploring a personal balance between initiative and outside feedback.`,
    archetype,
    strengths: ["Putting choices into your own words", "Trying a fresh point of view", "Noticing patterns across experience"],
    risks: ["Treating symbolism as an answer", "Fixing your identity around one result"],
    careers: "Strategy · Content · Education & coaching",
    relationship: "Relationships may feel steadier when you protect both private thinking time and honest conversation.",
    symbolic: `Traditional numerology connects Life Path ${lifePath} with the theme of ${archetype}.`,
    inference: "Connect your current area of interest to a real decision criterion to test whether this symbolism feels personally relevant.",
    limitation: "This is a generalized symbolic starting point; it does not measure personality or predict outcomes.",
  };
}
