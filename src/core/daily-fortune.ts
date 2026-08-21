import { z } from "zod";
import type { Locale } from "@/i18n/config";
import type { NumerologyGuideId } from "@/core/numerology-guides";

export const DAILY_FORTUNE_RULE_VERSION = "daily-fortune-1.0.0";
export const DAILY_FORTUNE_STORAGE_KEY = "innerarc:daily-fortune:v1";

export interface DailyFortuneStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const DailyFortunePreferenceSchema = z.object({
  version: z.literal(1),
  birthMonth: z.number().int().min(1).max(12),
  birthDay: z.number().int().min(1).max(31),
  enabledAt: z.string().datetime({ offset: true }),
}).strict().superRefine((value, context) => {
  if (!isValidMonthDay(value.birthMonth, value.birthDay)) {
    context.addIssue({ code: "custom", message: "Invalid month and day" });
  }
});

export type DailyFortunePreference = z.infer<typeof DailyFortunePreferenceSchema>;

type DailyFortuneCopy = Readonly<{
  title: string;
  summary: string;
  action: string;
  caution: string;
  question: string;
}>;

export type DailyFortuneResult = Readonly<{
  dateKey: string;
  personalYear: number;
  personalMonth: number;
  personalDay: number;
  guideId: NumerologyGuideId;
  copy: DailyFortuneCopy;
  ruleVersion: typeof DAILY_FORTUNE_RULE_VERSION;
}>;

const guideByNumber: Record<number, NumerologyGuideId> = {
  1: "taeryeong",
  2: "yeonhui",
  3: "hoyeon",
  4: "yundo",
  5: "hwayeon",
  6: "yeonhui",
  7: "sahyeon",
  8: "taeryeong",
  9: "hoyeon",
};

const copyByNumber: Record<number, Record<Locale, DailyFortuneCopy>> = {
  1: {
    ko: { title: "첫걸음을 정하는 날", summary: "새로운 일을 크게 벌이기보다 오늘 시작할 한 가지를 분명히 해보세요.", action: "미뤄둔 일 하나의 첫 15분을 시작하세요.", caution: "속도를 내기 위해 주변 의견을 무시하지 마세요.", question: "오늘 내가 먼저 움직이면 달라질 한 가지는 무엇인가요?" },
    en: { title: "Choose the first step", summary: "Instead of opening several new fronts, make one beginning clear today.", action: "Give the first 15 minutes to one delayed task.", caution: "Do not ignore useful feedback just to move faster.", question: "What could change if I move first today?" },
  },
  2: {
    ko: { title: "속도를 맞추는 날", summary: "혼자 결론 내리기보다 상대의 리듬을 듣고 조율할 때 실마리가 보일 수 있어요.", action: "중요한 사람 한 명에게 확인 질문을 건네세요.", caution: "눈치를 보느라 내 기준을 지우지 마세요.", question: "지금 더 필요한 것은 주장인가요, 경청인가요?" },
    en: { title: "Match the pace", summary: "A useful clue may appear when you listen and coordinate instead of deciding alone.", action: "Ask one clarifying question of someone important.", caution: "Do not erase your own standard while reading the room.", question: "Do I need to speak up or listen more right now?" },
  },
  3: {
    ko: { title: "표현해보는 날", summary: "머릿속 생각을 짧게 말하거나 적어보면 막혀 있던 흐름이 가벼워질 수 있어요.", action: "아이디어 하나를 세 문장으로 정리해 공유하세요.", caution: "분위기만 띄우고 약속을 늘리지는 마세요.", question: "오늘 밖으로 꺼내야 할 생각은 무엇인가요?" },
    en: { title: "Put it into words", summary: "A short note or conversation can loosen an idea that has stayed stuck in your head.", action: "Share one idea in three clear sentences.", caution: "Do not add commitments just to keep the mood bright.", question: "What thought needs to leave my head today?" },
  },
  4: {
    ko: { title: "기초를 다지는 날", summary: "눈에 띄는 성과보다 순서와 기준을 정리하는 일이 오늘의 안정감을 만들어요.", action: "반복 업무 하나의 체크리스트를 정리하세요.", caution: "완벽하게 준비될 때까지 시작을 미루지 마세요.", question: "지금 가장 먼저 바로잡을 작은 구조는 무엇인가요?" },
    en: { title: "Strengthen the foundation", summary: "Order and clear standards can create more stability today than visible wins.", action: "Tidy the checklist for one recurring task.", caution: "Do not delay action until everything feels perfect.", question: "Which small structure needs attention first?" },
  },
  5: {
    ko: { title: "변화를 시험하는 날", summary: "고정된 방식을 조금 바꿔보되, 되돌릴 수 있는 작은 실험으로 확인해보세요.", action: "익숙한 선택 하나를 안전한 대안과 비교하세요.", caution: "답답함을 피하려는 충동으로 큰 결정을 서두르지 마세요.", question: "오늘 작게 시험해볼 변화는 무엇인가요?" },
    en: { title: "Test a change", summary: "Adjust one fixed routine through a small experiment that is easy to reverse.", action: "Compare one familiar choice with a safe alternative.", caution: "Do not rush a major decision simply to escape restlessness.", question: "What change can I test at a small scale today?" },
  },
  6: {
    ko: { title: "돌봄의 경계를 보는 날", summary: "나와 가까운 사람을 챙기되, 책임의 범위를 분명히 할수록 관계가 편안해질 수 있어요.", action: "도울 일과 대신하지 않을 일을 한 가지씩 정하세요.", caution: "모두를 만족시키려다 내 회복 시간을 놓치지 마세요.", question: "오늘 내가 책임질 부분은 어디까지인가요?" },
    en: { title: "Notice the boundary of care", summary: "Care can feel steadier when you make the limits of your responsibility clear.", action: "Name one thing you will help with and one you will not take over.", caution: "Do not lose recovery time trying to satisfy everyone.", question: "Where does my responsibility end today?" },
  },
  7: {
    ko: { title: "한 걸음 물러서 보는 날", summary: "즉시 답을 내기보다 자료와 감정을 분리해 살펴보면 더 정확한 판단에 가까워질 수 있어요.", action: "결정 전 확인할 사실을 세 가지 적으세요.", caution: "생각이 많다는 이유로 대화까지 피하지 마세요.", question: "내 해석과 실제 사실은 어떻게 다른가요?" },
    en: { title: "Step back and examine", summary: "Separating facts from feelings can support a more grounded decision than an immediate answer.", action: "List three facts to verify before deciding.", caution: "Do not avoid a needed conversation because you need time to think.", question: "How is my interpretation different from the facts?" },
  },
  8: {
    ko: { title: "우선순위를 세우는 날", summary: "시간·돈·권한처럼 한정된 자원을 어디에 쓸지 분명히 정하면 추진력이 생겨요.", action: "오늘 끝낼 일 하나와 미룰 일 하나를 정하세요.", caution: "결과를 만들려다 과정의 부담을 과소평가하지 마세요.", question: "오늘 가장 가치 있게 써야 할 자원은 무엇인가요?" },
    en: { title: "Set the priority", summary: "Momentum can grow when you decide clearly where limited time, money, or authority should go.", action: "Choose one task to finish and one to defer.", caution: "Do not underestimate the cost of the process while chasing an outcome.", question: "Which resource deserves the clearest priority today?" },
  },
  9: {
    ko: { title: "정리하고 놓아주는 날", summary: "새것을 더하기보다 끝낼 일과 내려놓을 기대를 구분하면 다음 선택의 자리가 생겨요.", action: "더 이어가지 않을 일 하나를 명확히 정리하세요.", caution: "아쉬움 때문에 이미 끝난 선택을 반복하지 마세요.", question: "오늘 마무리해야 다음으로 갈 수 있는 것은 무엇인가요?" },
    en: { title: "Close and release", summary: "Separating what needs completion from what needs release can make room for the next choice.", action: "Clearly close one task you will not continue.", caution: "Do not repeat a finished choice only because letting go feels difficult.", question: "What needs closure before I can move on?" },
  },
};

function reduceToDigit(value: number): number {
  let current = Math.abs(Math.trunc(value));
  while (current > 9) {
    current = String(current).split("").reduce((sum, digit) => sum + Number(digit), 0);
  }
  return current;
}

export function isValidMonthDay(month: number, day: number): boolean {
  if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1) return false;
  const days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1];
}

export function localDateKey(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createDailyFortune(input: Readonly<{ birthMonth: number; birthDay: number; dateKey: string; locale: Locale }>): DailyFortuneResult {
  if (!isValidMonthDay(input.birthMonth, input.birthDay)) throw new Error("Invalid birth month and day");
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.dateKey);
  if (!match) throw new Error("Invalid local date key");
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const verified = new Date(Date.UTC(year, month - 1, day));
  if (verified.getUTCFullYear() !== year || verified.getUTCMonth() !== month - 1 || verified.getUTCDate() !== day) {
    throw new Error("Invalid local date key");
  }
  const calendarYear = reduceToDigit(year);
  const personalYear = reduceToDigit(input.birthMonth + input.birthDay + calendarYear);
  const personalMonth = reduceToDigit(personalYear + month);
  const personalDay = reduceToDigit(personalMonth + day);
  return {
    dateKey: input.dateKey,
    personalYear,
    personalMonth,
    personalDay,
    guideId: guideByNumber[personalDay],
    copy: copyByNumber[personalDay][input.locale],
    ruleVersion: DAILY_FORTUNE_RULE_VERSION,
  };
}

export function saveDailyFortunePreference(storage: DailyFortuneStorage, candidate: unknown): DailyFortunePreference {
  const value = DailyFortunePreferenceSchema.parse(candidate);
  storage.setItem(DAILY_FORTUNE_STORAGE_KEY, JSON.stringify(value));
  return value;
}

export function loadDailyFortunePreference(storage: DailyFortuneStorage): DailyFortunePreference | null {
  const raw = storage.getItem(DAILY_FORTUNE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return DailyFortunePreferenceSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearDailyFortunePreference(storage: DailyFortuneStorage): void {
  storage.removeItem(DAILY_FORTUNE_STORAGE_KEY);
}
