import type { Locale } from "@/i18n/config";

// The reading used to name a tarot card — "타로로 치면 '정의' 자리예요" — for a result
// in which no card was ever drawn. That is a claim about an input the buyer did not
// give, and it reads as decoration rather than analysis.
//
// This replaces it with a label built from the numbers that were actually calculated:
// the life path supplies the noun (what kind of person), the attitude number supplies
// the qualifier (how they come at things). Deterministic, so the same birth date always
// produces the same label.
type Bilingual = Readonly<{ ko: string; en: string }>;

function n(ko: string, en: string): Bilingual {
  return { ko, en };
}

/** What the person fundamentally is, from the life path. */
const NOUN: Record<number, Bilingual> = {
  1: n("설계자", "architect"),
  2: n("조율자", "mediator"),
  3: n("전달자", "communicator"),
  4: n("관리자", "builder"),
  5: n("개척자", "explorer"),
  6: n("보호자", "steward"),
  7: n("탐구자", "investigator"),
  8: n("운영자", "operator"),
  9: n("연결자", "connector"),
  11: n("통역자", "interpreter"),
  22: n("건축가", "systems builder"),
  33: n("스승", "mentor"),
};

/** How they approach things, from the attitude number. */
const QUALIFIER: Record<number, Bilingual> = {
  1: n("먼저 움직이는", "first-moving"),
  2: n("분위기를 읽는", "room-reading"),
  3: n("말로 문을 여는", "door-opening"),
  4: n("절차를 세우는", "process-setting"),
  5: n("판을 넓히는", "range-widening"),
  6: n("사람을 챙기는", "people-minding"),
  7: n("끝까지 파는", "deep-digging"),
  8: n("숫자로 판단하는", "numbers-first"),
  9: n("멀리 내다보는", "far-seeing"),
  11: n("가능성을 먼저 보는", "possibility-first"),
  22: n("크게 그리는", "large-scale"),
  33: n("오래 받쳐주는", "long-supporting"),
};

const FALLBACK_NOUN = n("관찰자", "observer");
const FALLBACK_QUALIFIER = n("천천히 확인하는", "slow-checking");

export type CharacterLabel = Readonly<{
  /** Two to five Korean word units, e.g. "가능성을 먼저 보는 설계자". */
  label: string;
  noun: string;
  qualifier: string;
}>;

export function buildCharacterLabel(
  lifePath: number,
  attitude: number,
  locale: Locale,
): CharacterLabel {
  const noun = (NOUN[lifePath] ?? FALLBACK_NOUN)[locale];
  const qualifier = (QUALIFIER[attitude] ?? FALLBACK_QUALIFIER)[locale];
  return {
    label: locale === "ko" ? `${qualifier} ${noun}` : `the ${qualifier} ${noun}`,
    noun,
    qualifier,
  };
}
