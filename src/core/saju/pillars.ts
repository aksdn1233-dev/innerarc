/**
 * The four pillars themselves, and the classical tables they are read against.
 *
 * Every table here is centuries-old public material. The 오호둔(五虎遁) rule for the month
 * stem, the 오서둔(五鼠遁) rule for the hour stem, the hidden stems of each branch, and the
 * void branches of each decade are all standard and appear in the same form in every
 * primer on the subject.
 */

import {
  EARTHLY_BRANCHES,
  FIVE_PHASES,
  HEAVENLY_STEMS,
  TEN_GODS,
  type EarthlyBranch,
  type FivePhase,
  type HeavenlyStem,
  type HiddenStem,
  type PhaseCount,
  type Pillar,
  type Polarity,
  type TenGod,
} from "./types";

/** Phase of each stem, in stem order. 甲乙 wood, 丙丁 fire, 戊己 earth, 庚辛 metal, 壬癸 water. */
const STEM_PHASES: readonly FivePhase[] = [
  "목", "목", "화", "화", "토", "토", "금", "금", "수", "수",
];

/** Phase of each branch, in branch order from 子. */
const BRANCH_PHASES: readonly FivePhase[] = [
  "수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수",
];

/** 지장간(支藏干) with the classical thirty-day division of each month branch. */
const HIDDEN_STEMS: Readonly<Record<EarthlyBranch, readonly HiddenStem[]>> = {
  子: [{ stem: "壬", role: "여기", days: 10 }, { stem: "癸", role: "정기", days: 20 }],
  丑: [{ stem: "癸", role: "여기", days: 9 }, { stem: "辛", role: "중기", days: 3 }, { stem: "己", role: "정기", days: 18 }],
  寅: [{ stem: "戊", role: "여기", days: 7 }, { stem: "丙", role: "중기", days: 7 }, { stem: "甲", role: "정기", days: 16 }],
  卯: [{ stem: "甲", role: "여기", days: 10 }, { stem: "乙", role: "정기", days: 20 }],
  辰: [{ stem: "乙", role: "여기", days: 9 }, { stem: "癸", role: "중기", days: 3 }, { stem: "戊", role: "정기", days: 18 }],
  巳: [{ stem: "戊", role: "여기", days: 7 }, { stem: "庚", role: "중기", days: 7 }, { stem: "丙", role: "정기", days: 16 }],
  午: [{ stem: "丙", role: "여기", days: 10 }, { stem: "己", role: "중기", days: 9 }, { stem: "丁", role: "정기", days: 11 }],
  未: [{ stem: "丁", role: "여기", days: 9 }, { stem: "乙", role: "중기", days: 3 }, { stem: "己", role: "정기", days: 18 }],
  申: [{ stem: "戊", role: "여기", days: 7 }, { stem: "壬", role: "중기", days: 7 }, { stem: "庚", role: "정기", days: 16 }],
  酉: [{ stem: "庚", role: "여기", days: 10 }, { stem: "辛", role: "정기", days: 20 }],
  戌: [{ stem: "辛", role: "여기", days: 9 }, { stem: "丁", role: "중기", days: 3 }, { stem: "戊", role: "정기", days: 18 }],
  亥: [{ stem: "戊", role: "여기", days: 7 }, { stem: "甲", role: "중기", days: 7 }, { stem: "壬", role: "정기", days: 16 }],
};

export function stemPhase(stem: HeavenlyStem): FivePhase {
  return STEM_PHASES[HEAVENLY_STEMS.indexOf(stem)]!;
}

export function branchPhase(branch: EarthlyBranch): FivePhase {
  return BRANCH_PHASES[EARTHLY_BRANCHES.indexOf(branch)]!;
}

/** Even-indexed stems and branches are 양, odd are 음. */
export function stemPolarity(stem: HeavenlyStem): Polarity {
  return HEAVENLY_STEMS.indexOf(stem) % 2 === 0 ? "양" : "음";
}

export function hiddenStemsOf(branch: EarthlyBranch): readonly HiddenStem[] {
  return HIDDEN_STEMS[branch];
}

export function pillarFromCycle(cycleIndex: number): Pillar {
  const normalized = ((cycleIndex % 60) + 60) % 60;
  const stem = HEAVENLY_STEMS[normalized % 10]!;
  const branch = EARTHLY_BRANCHES[normalized % 12]!;
  return { stem, branch, cycleIndex: normalized, label: `${stem}${branch}` };
}

/**
 * The one slot in the sixty-cycle carrying both a given stem and a given branch. Only
 * pairs of matching parity occur, which is what makes the cycle sixty long and not a
 * hundred and twenty.
 */
function cycleIndexOf(stemIndex: number, branchIndex: number): number {
  for (let step = 0; step < 6; step += 1) {
    const candidate = stemIndex + 10 * step;
    if (candidate % 12 === branchIndex) return candidate;
  }
  throw new RangeError("Stem and branch of opposite polarity never pair.");
}

/**
 * 연주(年柱). The year turns at 입춘, so the caller passes the 사주 year — a birth in
 * January or early February belongs to the year before the one on the certificate.
 * 1984 comes out 甲子, which anchors the whole cycle.
 */
export function yearPillar(sajuYear: number): Pillar {
  return pillarFromCycle(sajuYear - 4);
}

/**
 * 월주(月柱) by 오호둔(五虎遁): the 寅 month of a 甲 or 己 year opens with 丙, of a 乙 or 庚
 * year with 戊, and so on — which is exactly `(yearStem × 2 + 2) mod 10`, then one stem
 * per month from there.
 *
 * @param monthBranchIndex Branch index of the month, 寅 = 2, as the governing 절 gives it.
 */
export function monthPillar(yearStem: HeavenlyStem, monthBranchIndex: number): Pillar {
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem);
  const monthsFromYin = ((monthBranchIndex - 2) % 12 + 12) % 12;
  const stemIndex = (yearStemIndex * 2 + 2 + monthsFromYin) % 10;
  const branchIndex = ((monthBranchIndex % 12) + 12) % 12;
  return pillarFromCycle(cycleIndexOf(stemIndex, branchIndex));
}

/**
 * 일주(日柱). The sexagenary day count runs unbroken since antiquity, so it is taken
 * straight from the Julian Day Number: `(JDN + 49) mod 60`, anchored so that 2000-01-01
 * comes out 戊午 — which it did.
 */
export function dayPillarFromJdn(julianDayNumber: number): Pillar {
  return pillarFromCycle(julianDayNumber + 49);
}

/** Branch of a two-hour period. 子 spans 23:00–01:00, so the hour is shifted before halving. */
export function hourBranchIndex(hour: number): number {
  return Math.floor(((hour + 1) % 24) / 2) % 12;
}

/**
 * 시주(時柱) by 오서둔(五鼠遁): the 子 hour of a 甲 or 己 day opens with 甲, of a 乙 or 庚 day
 * with 丙, and so on — `(dayStem × 2) mod 10`, then one stem per branch.
 */
export function hourPillar(dayStem: HeavenlyStem, branchIndex: number): Pillar {
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem);
  const stemIndex = (dayStemIndex * 2 + branchIndex) % 10;
  return pillarFromCycle(cycleIndexOf(stemIndex, branchIndex));
}

/**
 * 공망(空亡). Each run of ten in the sixty-cycle leaves two branches without a stem to
 * pair with; those two are the day pillar's void.
 */
export function voidBranches(dayCycleIndex: number): readonly [EarthlyBranch, EarthlyBranch] {
  const decadeStart = dayCycleIndex - (dayCycleIndex % 10);
  const first = (decadeStart + 10) % 12;
  return [EARTHLY_BRANCHES[first]!, EARTHLY_BRANCHES[(first + 1) % 12]!];
}

/**
 * The ten gods, read from the day master outward.
 *
 * The relationship is the phase's — what the day master produces, what produces it, what
 * it controls, what controls it, and its own kind — and the polarity decides which of the
 * pair applies: same polarity gives the "편/비견" side, different gives the "정/겁재" side.
 */
export function tenGod(dayMaster: HeavenlyStem, other: HeavenlyStem): TenGod {
  const selfPhase = stemPhase(dayMaster);
  const otherPhase = stemPhase(other);
  const samePolarity = stemPolarity(dayMaster) === stemPolarity(other);

  const order = FIVE_PHASES;
  const selfIndex = order.indexOf(selfPhase);
  const otherIndex = order.indexOf(otherPhase);
  // Distance around the generating cycle 목→화→토→금→수→목.
  const step = ((otherIndex - selfIndex) % 5 + 5) % 5;

  switch (step) {
    case 0: return samePolarity ? "비견" : "겁재";
    case 1: return samePolarity ? "식신" : "상관";
    case 2: return samePolarity ? "편재" : "정재";
    case 3: return samePolarity ? "편관" : "정관";
    default: return samePolarity ? "편인" : "정인";
  }
}

/** The ten god a branch carries, taken from its 정기 — the stem that governs it outright. */
export function branchTenGod(dayMaster: HeavenlyStem, branch: EarthlyBranch): TenGod {
  const principal = hiddenStemsOf(branch).find(({ role }) => role === "정기")!;
  return tenGod(dayMaster, principal.stem);
}

/**
 * Phase totals across the chart. Visible stems and branches count one each; the stems
 * hidden in a branch are counted by their share of the month, so a branch never
 * contributes more than the one unit it is.
 */
export function phaseBalance(pillars: readonly Pillar[]): PhaseCount {
  const totals: Record<FivePhase, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const { stem, branch } of pillars) {
    totals[stemPhase(stem)] += 1;
    for (const hidden of hiddenStemsOf(branch)) {
      totals[stemPhase(hidden.stem)] += hidden.days / 30;
    }
  }
  for (const phase of FIVE_PHASES) {
    totals[phase] = Math.round(totals[phase] * 100) / 100;
  }
  return totals;
}

export { TEN_GODS };
