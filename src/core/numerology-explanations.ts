import type { Locale } from "@/i18n/config";
import { describeIntegratedNumber } from "@/core/profile";

export type NumerologyNumberKind = "lifePath" | "birthday" | "attitude" | "personalYear";

const NUMBER_ROLES: Record<NumerologyNumberKind, Record<Locale, string>> = {
  lifePath: {
    ko: "삶 전체에서 반복되는 중심 방향",
    en: "Your recurring direction across life",
  },
  birthday: {
    ko: "행동하고 일을 마무리하는 방식",
    en: "How you act and finish things",
  },
  attitude: {
    ko: "처음 상황을 받아들이고 반응하는 방식",
    en: "How you first meet and respond to situations",
  },
  personalYear: {
    ko: "올해의 선택을 돌아보는 상징적 주제",
    en: "A symbolic theme for reviewing this year's choices",
  },
};

export function describeNumerologyNumber(kind: NumerologyNumberKind, value: number, locale: Locale) {
  const theme = describeIntegratedNumber(value, locale);
  return {
    role: NUMBER_ROLES[kind][locale],
    theme: theme.drive,
    short: `${NUMBER_ROLES[kind][locale]} · ${theme.drive}`,
  } as const;
}
