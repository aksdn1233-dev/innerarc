import type { Locale } from "@/i18n/config";
import type { OnboardingFocusId } from "@/core/onboarding";

export const PAID_TEASER_RULE_VERSION = "paid-teaser-1.0.0";

type Localized = Readonly<{ ko: string; en: string }>;
const n = (ko: string, en: string): Localized => ({ ko, en });

export type PaidTeaser = Readonly<{
  focusId: OnboardingFocusId;
  /** The sentence that hands the reader from the free result into the paid one. */
  bridge: string;
  /** What the detailed reading adds for this specific concern. Named, not described. */
  lockedTopics: readonly string[];
  /** The action, written as this person's own question rather than a product name. */
  cta: string;
}>;

/**
 * What the paid reading adds, written per concern.
 *
 * The free result answers "what kind of person am I". A visitor who came with a
 * question about money does not convert on "see the detailed reading" — they convert on
 * seeing that the next layer is about money. These are the section subjects the detail
 * and premium generators already produce (work, money, relationships, pressure, the
 * year ahead, stop/hold criteria), named in the reader's own words.
 *
 * They describe what is covered, never what will happen: nothing here promises an
 * outcome, a date, or a person, and nothing crosses into medical, legal, or investment
 * advice.
 */
const TEASERS: Readonly<Record<OnboardingFocusId, Readonly<{
  bridge: Localized;
  lockedTopics: readonly Localized[];
  cta: Localized;
}>>> = {
  relationships: {
    bridge: n(
      "여기서부터는 관계에서 반복되는 부분을 더 구체적으로 봅니다.",
      "From here the reading looks at what repeats in your relationships.",
    ),
    lockedTopics: [
      n("반복되는 연애 패턴", "The pattern that repeats"),
      n("끌리는 상대의 공통점", "What the people you are drawn to have in common"),
      n("갈등이 생기는 방식", "How conflict tends to start"),
      n("관계가 시작되는 환경", "The settings where relationships actually begin"),
      n("피하는 편이 나은 관계 조건", "Conditions worth avoiding"),
      n("올해와 내년의 관계 흐름", "This year and next"),
    ],
    cta: n("내 관계 흐름 자세히 보기", "See my relationship patterns in full"),
  },
  money: {
    bridge: n(
      "여기서부터는 돈과 사업 흐름을 더 구체적으로 봅니다.",
      "From here the reading looks at money and business in more detail.",
    ),
    lockedTopics: [
      n("돈이 새는 지점", "Where money leaks"),
      n("사업형·조직형 적합도", "Whether you run better solo or inside an organisation"),
      n("동업이 맞는 조건", "When a partnership works for you"),
      n("계약과 큰 지출 앞의 주의 패턴", "What to watch before a contract or a large spend"),
      n("올해와 내년의 자금 흐름", "This year and next"),
      n("확장할 때 먼저 막히는 곳", "The bottleneck that appears first when you scale"),
    ],
    cta: n("내 돈·사업 흐름 전체 보기", "See my money and business patterns in full"),
  },
  work: {
    bridge: n(
      "여기서부터는 일과 진로에서 반복되는 부분을 더 구체적으로 봅니다.",
      "From here the reading looks at what repeats in your work.",
    ),
    lockedTopics: [
      n("잘 맞는 역할과 권한의 크기", "The role and the amount of authority that fit"),
      n("반복되는 실패 지점", "The failure that repeats"),
      n("압박을 받을 때 나오는 모습", "What shows up under pressure"),
      n("함께 일하기 어려운 유형", "The working styles that cost you most"),
      n("움직일지 남을지 판단하는 기준", "How to judge staying versus moving"),
      n("올해와 내년의 일 흐름", "This year and next"),
    ],
    cta: n("내 일·진로 흐름 전체 보기", "See my work patterns in full"),
  },
  growth: {
    bridge: n(
      "여기서부터는 같은 선택이 반복되는 이유를 더 구체적으로 봅니다.",
      "From here the reading looks at why the same choice keeps repeating.",
    ),
    lockedTopics: [
      n("나를 멈춰 세우는 반복 조건", "The condition that stops you each time"),
      n("강점이 오히려 발목을 잡는 순간", "When your strength becomes the problem"),
      n("결정을 미루게 되는 지점", "Where decisions stall"),
      n("회복이 되는 조건과 안 되는 조건", "What restores you and what does not"),
      n("보류·중단·재검토 기준", "When to hold, stop, or reconsider"),
      n("올해와 내년의 흐름", "This year and next"),
    ],
    cta: n("내 반복 패턴 전체 보기", "See my recurring patterns in full"),
  },
  health: {
    bridge: n(
      "여기서부터는 하루의 리듬이 어디서 무너지는지 더 구체적으로 봅니다.",
      "From here the reading looks at where your daily rhythm gives way.",
    ),
    lockedTopics: [
      n("하루가 무너지는 지점", "Where the day gives way"),
      n("무리하게 되는 상황", "The situations where you overextend"),
      n("회복이 되는 조건", "The conditions that restore you"),
      n("압박을 받을 때 나오는 모습", "What shows up under pressure"),
      n("생활을 바꿀 때의 순서", "The order to change things in"),
      n("올해와 내년의 흐름", "This year and next"),
    ],
    cta: n("내 생활 리듬 전체 보기", "See my daily patterns in full"),
  },
  leadership: {
    bridge: n(
      "여기서부터는 사람을 이끌 때 반복되는 부분을 더 구체적으로 봅니다.",
      "From here the reading looks at what repeats when you lead.",
    ),
    lockedTopics: [
      n("맡았을 때 잘 되는 조건", "The conditions where you lead well"),
      n("권한을 나누기 어려워지는 지점", "Where delegating breaks down"),
      n("압박을 받을 때 나오는 모습", "What shows up under pressure"),
      n("부딪히기 쉬운 유형", "The people you tend to clash with"),
      n("보류·중단·재검토 기준", "When to hold, stop, or reconsider"),
      n("올해와 내년의 흐름", "This year and next"),
    ],
    cta: n("내 리더십 흐름 전체 보기", "See my leadership patterns in full"),
  },
};

/**
 * The concern-specific bridge from a free result into the paid reading.
 *
 * Deterministic: the same focus always produces the same teaser. It names subjects the
 * paid generators already write and never asserts an outcome.
 */
export function createPaidTeaser(focusId: OnboardingFocusId, locale: Locale): PaidTeaser {
  const entry = TEASERS[focusId];
  return {
    focusId,
    bridge: entry.bridge[locale],
    lockedTopics: entry.lockedTopics.map((topic) => topic[locale]),
    cta: entry.cta[locale],
  };
}
