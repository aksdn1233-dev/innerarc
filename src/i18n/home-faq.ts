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
    "태령당은 무엇을 해주는 곳인가요?",
    "생년월일로 연애·돈·일·공부에서 반복되는 흐름을 찾아 글로 정리해 드립니다. 오늘 무엇을 하라고 정해주는 곳이 아니라, 왜 늘 같은 자리에서 막히는지 그 이유를 짚어드리는 쪽에 가깝습니다.",
  ],
  [
    "무료로 어디까지 볼 수 있나요?",
    "양력 생년월일만 넣으면 핵심 숫자와 기본 성향, 반복되는 지점까지 결제 없이 보실 수 있습니다. 사주 네 기둥도 무료로 세워드리고, 회원가입은 필요 없습니다.",
  ],
  [
    "점집이나 사주와는 무엇이 다른가요?",
    "누가 더 잘 맞히는지를 겨루지 않습니다. 대신 숫자가 어떤 계산으로 나왔는지 근거를 전부 열어두고, 결과를 글로 남겨 다시 읽고 실제 삶과 대조하실 수 있게 합니다. 미래를 예측하거나 진단하지 않습니다.",
  ],
  [
    "연애나 돈 말고 공부·시험도 되나요?",
    "됩니다. 질문 목록에 없는 고민은 생년월일을 넣는 화면에서 직접 적으시면, 상세 리딩에 그 주제를 다루는 장이 따로 만들어집니다.",
  ],
  [
    "결제는 어떻게 되나요?",
    `1회 결제이고 자동 갱신이 없습니다. 상세 리딩은 ${detailPrice}이며, 결제 뒤에는 회원가입 없이 링크로 열어보실 수 있습니다.`,
  ],
];

const EN = (detailPrice: string): readonly HomeFaqEntry[] => [
  [
    "What is this?",
    "From your birth date it finds the patterns that keep repeating in love, money, work and study, and writes them down. It does not tell you what to do today; it names why you keep getting stuck in the same place.",
  ],
  [
    "How much can I see for free?",
    "A birth date is enough to see the core numbers, your basic tendencies and what repeats, with no payment. The Four Pillars chart is free too, and no account is needed.",
  ],
  [
    "How is this different from a fortune teller?",
    "It does not compete on who guesses better. Every number is shown with the calculation that produced it, and the reading stays in writing so you can read it again and check it against what actually happens. It does not predict or diagnose.",
  ],
  [
    "Does it cover study and exams as well?",
    "Yes. A concern that is not on the question list can be written in on the birth-date screen, and the detailed reading gets a chapter of its own on that subject.",
  ],
  [
    "How does payment work?",
    `One payment, no renewal. The detailed reading is ${detailPrice}, and it opens from a link afterwards without an account.`,
  ],
];

export function getHomeFaq(locale: Locale, detailPriceKrw: number): readonly HomeFaqEntry[] {
  const detailPrice = formatWon(detailPriceKrw, locale);
  return locale === "ko" ? KO(detailPrice) : EN(detailPrice);
}
