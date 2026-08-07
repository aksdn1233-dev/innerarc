/**
 * Real audience reactions from the operator's live 사주/타로 broadcasts.
 *
 * These are not website reviews and are never mixed into the review pipeline: they were
 * typed into a live chat during a reading, not by someone who bought and opened a report
 * here. They are kept separate for that reason, shown under their own heading, and the
 * section says plainly where they came from.
 *
 * Rules this list follows, so it stays honest:
 *
 *  - Every line is verbatim from a broadcast screen capture the operator kept, including
 *    the typos, the trailing dots, and the ㅠ. Nothing here was written for the website.
 *  - Nicknames are the pseudonymous handles the platform showed publicly. No real name,
 *    no profile picture, and no way to reach the person is stored or displayed.
 *  - Nothing was added to make a line sound stronger, and no line claims a result.
 *  - The English gloss is a translation shown beside the original, never in place of it.
 *    A reader on either locale sees the words that were actually typed.
 */
export type LiveReaction = {
  /** Public live-chat handle, exactly as the platform displayed it. */
  readonly handle: string;
  /** The message as typed. Korean, unedited. */
  readonly text: string;
  /** Shown under the original for English readers. Never replaces it. */
  readonly gloss: string;
};

/**
 * Ordered by how much each one says on its own, because the section shows the first few
 * on a narrow screen. The bare agreements ("맞아요", "네~") were left out: alone they
 * carry nothing a visitor can weigh, and padding the list with them would be the kind of
 * volume-for-its-own-sake this section exists to avoid.
 */
export const LIVE_REACTIONS: readonly LiveReaction[] = [
  {
    handle: "착한부자",
    text: "정말 딱 맞네요 훌륭하십니다",
    gloss: "That is exactly right. Remarkable.",
  },
  {
    handle: "예감",
    text: "많이 와 닿네요ㅠ",
    gloss: "That lands hard.",
  },
  {
    handle: "익명",
    text: "와 신기하다..",
    gloss: "Wow, that's uncanny…",
  },
  {
    handle: "익명",
    text: "헐 맞아여",
    gloss: "Whoa — that's me.",
  },
  {
    handle: "익명",
    text: "맞아요..참다가 참다가",
    gloss: "Right — I held it in, and held it in.",
  },
  {
    handle: "♡축복♡",
    text: "길가는 사람도 다 챙겨야되는사람이어서..",
    gloss: "I'm the sort who has to look after everyone, even strangers…",
  },
  {
    handle: "♡축복♡",
    text: "잘해줘야겠다..",
    gloss: "I should treat them better…",
  },
] as const;
