import type { Locale } from "@/i18n/config";

// The personal year cycles 1→9 (and preserves 11/22/33 like every other value in this
// system) on a nine-year rhythm computed from birth month/day and the calendar year.
// It answers "why this year specifically" without naming a card or forecasting an
// event — the same deterministic-number pattern as the rest of the profile.
type Bilingual = Readonly<{ ko: string; en: string }>;

function n(ko: string, en: string): Bilingual {
  return { ko, en };
}

export type PersonalYearTheme = Readonly<{
  /** Short label for the cycle, e.g. "시작의 해". */
  phase: Bilingual;
  /** One to two sentences on what this year favors and what tends to misfire in it. */
  timing: Bilingual;
}>;

const PERSONAL_YEAR_THEME: Record<number, PersonalYearTheme> = {
  1: {
    phase: n("시작의 해", "a year of beginnings"),
    timing: n(
      "올해는 벌이는 쪽이 미루는 쪽보다 유리합니다. 작년까지 망설이던 일을 작게라도 이번 해 안에 시작해두면, 다음 해에 그 결과를 회수하는 흐름이 됩니다.",
      "Starting outperforms waiting this year. Whatever was postponed pays off faster begun now, even in a small form, than held for the next cycle.",
    ),
  },
  2: {
    phase: n("관계·조율의 해", "a year of partnership"),
    timing: n(
      "올해는 혼자 밀어붙이는 일보다 함께 맞추는 일이 더 잘 풀립니다. 서두르면 오히려 어긋나고, 상대의 속도에 한 박자 맞추는 쪽이 결과를 앞당깁니다.",
      "Coordinating with someone else works better than pushing alone this year. Rushing tends to misalign it; matching the other person's pace actually moves it faster.",
    ),
  },
  3: {
    phase: n("표현·확장의 해", "a year of expression"),
    timing: n(
      "올해는 드러내고 알리는 쪽이 유리합니다. 준비만 하고 묵히면 기회가 지나가고, 완벽하지 않아도 보여주는 쪽이 실제 반응을 만듭니다.",
      "Putting things out gets more return than perfecting them quietly this year. Waiting for polish tends to miss the opening; showing an imperfect version earlier draws the real response.",
    ),
  },
  4: {
    phase: n("기반을 다지는 해", "a year of groundwork"),
    timing: n(
      "올해는 새로 벌이기보다 지금 있는 것을 정리하고 다지는 편이 유리합니다. 화려한 확장은 다음 해로 미루고, 반복 가능한 절차를 이번 해에 만들어두세요.",
      "Consolidating what already exists outperforms starting something new this year. Save the expansion for the next cycle and use this one to build a process you can repeat.",
    ),
  },
  5: {
    phase: n("변화의 해", "a year of change"),
    timing: n(
      "올해는 계획대로만 가지 않을 가능성이 높습니다. 예정에 없던 제안이나 변수가 끼어들 수 있는 해라, 계획을 느슨하게 잡아두는 쪽이 실제로 유리합니다.",
      "Plans are less likely to hold exactly as drawn this year. Unplanned offers or shifts tend to enter, so keeping the plan loose is actually the safer version of it.",
    ),
  },
  6: {
    phase: n("책임과 돌봄의 해", "a year of responsibility"),
    timing: n(
      "올해는 가족이나 가까운 사람과 관련된 결정이 자주 끼어드는 해입니다. 내 일정만으로 정하기 어려운 시기이니, 주변 사정을 먼저 확인하고 움직이는 편이 낫습니다.",
      "Decisions tied to family or people close to you tend to intrude on this year's plans. It is harder to schedule by your calendar alone, so checking their situation first pays off.",
    ),
  },
  7: {
    phase: n("성찰의 해", "a year of reflection"),
    timing: n(
      "올해는 밖으로 벌이기보다 안으로 점검하는 쪽에 유리한 해입니다. 성과가 더디게 느껴져도 실패가 아니라, 다음 확장을 준비하는 구간에 가깝습니다.",
      "This year favors checking inward over expanding outward. Slower visible progress is not failure here — it reads more as the year that prepares the next expansion.",
    ),
  },
  8: {
    phase: n("결실의 해", "a year of results"),
    timing: n(
      "올해는 그동안 쌓아온 것이 숫자로 드러나기 쉬운 해입니다. 다만 성과에 쫓겨 무리하게 확장하면 다음 해에 그 무리를 되갚게 됩니다.",
      "What has been building tends to show up in measurable results this year. Overreaching under that momentum, though, usually gets paid back in the next cycle.",
    ),
  },
  9: {
    phase: n("마무리의 해", "a year of closing"),
    timing: n(
      "올해는 새로 시작하기보다 끝맺는 일이 먼저 풀리는 해입니다. 오래 붙잡고 있던 것을 정리하면, 다음 해의 시작이 훨씬 가벼워집니다.",
      "Closing something tends to move before starting something new does this year. Letting go of what has been held too long makes the next cycle's start noticeably lighter.",
    ),
  },
  11: {
    phase: n("통찰의 해", "a year of insight"),
    timing: n(
      "올해는 감이 유난히 날카로워지는 해입니다. 다만 그 감을 근거 없이 확신으로 바꾸면 오히려 어긋나니, 감으로 알아챈 것을 사실로 한 번 더 확인하는 절차를 두세요.",
      "Intuition runs unusually sharp this year. Turning a hunch into certainty without checking it is where it tends to misfire, so add one step that verifies the hunch against fact.",
    ),
  },
  22: {
    phase: n("구축의 해", "a year of building at scale"),
    timing: n(
      "올해는 작은 시도보다 구조를 갖춘 큰 계획이 더 잘 맞는 해입니다. 다만 혼자 감당하려 하면 규모에 눌리니, 역할을 나눌 사람을 먼저 구하세요.",
      "A structured, larger plan fits better than a small trial this year. Carrying the scale alone tends to overwhelm it, so find people to share roles with first.",
    ),
  },
  33: {
    phase: n("헌신의 해", "a year of service"),
    timing: n(
      "올해는 나보다 주변을 돌보는 역할이 두드러지는 해입니다. 다만 돌봄이 나를 갉아먹지 않도록, 내 몫을 챙기는 기준 하나는 남겨두세요.",
      "A role caring for others more than yourself stands out this year. Keep at least one standard that protects your own share, so the caretaking does not erode you.",
    ),
  },
};

const FALLBACK = PERSONAL_YEAR_THEME[1];

export type PersonalYearDescription = Readonly<{ phase: string; timing: string }>;

export function describePersonalYear(value: number, locale: Locale): PersonalYearDescription {
  const theme = PERSONAL_YEAR_THEME[value] ?? FALLBACK;
  return { phase: theme.phase[locale], timing: theme.timing[locale] };
}
