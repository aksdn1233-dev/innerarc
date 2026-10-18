import type { Locale } from "@/i18n/config";

/**
 * The five questions a stranger who found this page in a search result actually asks.
 *
 * They live here rather than in the page because two things have to say them identically:
 * the section a reader sees, and the FAQPage structured data a crawler reads. Google only
 * honours that markup when the same words are on the page, and a second copy of a string
 * is a copy that drifts.
 *
 * The answers stay inside what this product can stand behind — what it finds, what it
 * costs, and that it shows its working — and outside what it cannot: no comparison of who
 * guesses better, no prediction, no diagnosis.
 */
export type HomeFaqEntry = readonly [question: string, answer: string];

/**
 * The price is formatted here rather than passed in already formatted, because the page and
 * the structured data must quote the same figure and the only way to be sure of that is for
 * one function to write it.
 */
function formatWon(amount: number, locale: Locale): string {
  if (locale === "ko") return `${amount.toLocaleString("ko-KR")}원`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

const KO = (detailPrice: string): readonly HomeFaqEntry[] => [
  [
    "어떤 서비스인가요?",
    "생년월일로 성향과 반복되는 선택을 살펴봐요. 미래를 정해주는 풀이는 아니에요.",
  ],
  [
    "무료로 어디까지 볼 수 있나요?",
    "사주 네 기둥과 핵심 숫자, 기본 성향을 무료로 봐요. 회원가입은 필요 없어요.",
  ],
  [
    "풀이의 근거도 볼 수 있나요?",
    "계산 과정을 확인하고 실제 경험과 비교할 수 있어요. 예측이나 진단은 아니에요.",
  ],
  [
    "다른 고민도 물어볼 수 있나요?",
    "공부·시험 등 다른 고민도 입력해요. 상세 리딩에서 함께 다뤄요.",
  ],
  [
    "결제는 어떻게 되나요?",
    `상세 리딩은 ${detailPrice}, 한 번만 결제해요. 자동 갱신 없이 링크로 다시 볼 수 있어요.`,
  ],
];

const EN = (detailPrice: string): readonly HomeFaqEntry[] => [
  [
    "What is this?",
    "Explore tendencies and recurring choices from your birth date. The reading does not determine your future.",
  ],
  [
    "How much can I see for free?",
    "Your Four Pillars chart, core numbers and basic tendencies are free. No account needed.",
  ],
  [
    "Can I check the reasoning?",
    "See the calculations and compare the reading with real experience. It is not prediction or diagnosis.",
  ],
  [
    "Can I ask about other concerns?",
    "Add a concern such as study or exams to include it in your detailed reading.",
  ],
  [
    "How does payment work?",
    `The detailed reading is ${detailPrice}, paid once. No renewal; revisit it through your link.`,
  ],
];

export function getHomeFaq(locale: Locale, detailPriceKrw: number): readonly HomeFaqEntry[] {
  const detailPrice = formatWon(detailPriceKrw, locale);
  return locale === "ko" ? KO(detailPrice) : EN(detailPrice);
}
