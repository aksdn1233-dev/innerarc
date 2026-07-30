// Korean particles change with the final consonant of the word in front of them:
// "성장을" but "구조를". Copy that interpolates a data value and then writes a fixed
// particle is therefore wrong for roughly half of its inputs, which is how the paid
// report shipped sentences like "구조을 중심축으로". Sentences that mix template text
// with symbol data must pick the particle from the value at run time.
const HANGUL_FIRST = 0xac00;
const HANGUL_LAST = 0xd7a3;
const JONGSEONG_COUNT = 28;
const JONGSEONG_RIEUL = 8;

export const particlePairs = {
  object: ["을", "를"],
  topic: ["은", "는"],
  subject: ["이", "가"],
  with: ["과", "와"],
  by: ["으로", "로"],
} as const;

export type ParticleKind = keyof typeof particlePairs;

/**
 * Index of the trailing consonant of the last Hangul syllable: 0 means the word ends
 * in a vowel. Returns null when the word does not end in a Hangul syllable, which
 * happens for Latin text and digits.
 */
function finalConsonant(word: string): number | null {
  const trimmed = word.trim();
  const last = [...trimmed].pop();
  if (!last) return null;
  const code = last.codePointAt(0);
  if (code === undefined || code < HANGUL_FIRST || code > HANGUL_LAST) return null;
  return (code - HANGUL_FIRST) % JONGSEONG_COUNT;
}

/** The correct particle to follow `word`. Falls back to the consonant form when the word is not Hangul. */
export function particle(word: string, kind: ParticleKind): string {
  const [afterConsonant, afterVowel] = particlePairs[kind];
  const final = finalConsonant(word);
  if (final === null) return afterConsonant;
  // 으로/로 is the exception: ㄹ behaves like a vowel ending, as in "서울로".
  if (kind === "by") return final === 0 || final === JONGSEONG_RIEUL ? afterVowel : afterConsonant;
  return final === 0 ? afterVowel : afterConsonant;
}

/** `word` with its correct particle appended. */
export function withParticle(word: string, kind: ParticleKind): string {
  return `${word}${particle(word, kind)}`;
}
