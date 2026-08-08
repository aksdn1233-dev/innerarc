/**
 * 사주명리(四柱命理) domain types.
 *
 * Everything here is classical material: the ten heavenly stems and twelve earthly
 * branches, the five phases, the ten gods, and the hidden stems of each branch appear in
 * 『연해자평』, 『적천수』, 『자평진전』 and 『궁통보감』. No living practitioner's proprietary
 * framework, branding, or interpretive text is reproduced anywhere in this module, and
 * no one's name is attached to any of it.
 */

/** 십천간(十天干). Index order is canonical — every rule below counts on it. */
export const HEAVENLY_STEMS = [
  "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸",
] as const;
export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];

/** 십이지지(十二地支). 子 first, as the sexagenary cycle requires. */
export const EARTHLY_BRANCHES = [
  "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥",
] as const;
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];

/** 오행(五行). */
export const FIVE_PHASES = ["목", "화", "토", "금", "수"] as const;
export type FivePhase = (typeof FIVE_PHASES)[number];

/** 음양(陰陽). */
export type Polarity = "양" | "음";

/** 십신(十神), named from the day stem's point of view. */
export const TEN_GODS = [
  "비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인",
] as const;
export type TenGod = (typeof TEN_GODS)[number];

/** One of the four pillars: a stem over a branch. */
export type Pillar = {
  readonly stem: HeavenlyStem;
  readonly branch: EarthlyBranch;
  /** 0–59 position in the sexagenary cycle, 甲子 = 0. */
  readonly cycleIndex: number;
  /** 갑자 표기, e.g. "甲子". */
  readonly label: string;
};

/** 지장간(支藏干): the stems concealed in a branch, with their share of the month. */
export type HiddenStem = {
  readonly stem: HeavenlyStem;
  /** 여기(餘氣) / 중기(中氣) / 정기(正氣). */
  readonly role: "여기" | "중기" | "정기";
  /** Days of the month-branch this stem governs, by the common 30-day division. */
  readonly days: number;
};

/**
 * How the birth instant was resolved into a clock time the pillars can be read from.
 *
 * This is published rather than hidden because it changes the answer. A birth at 23:40
 * belongs to a different day pillar depending on the 자시 convention, and Seoul sits
 * about 32 minutes behind the meridian its clock runs on — so an hour pillar computed
 * from the wall clock alone is wrong for a large share of births near a branch boundary.
 */
export type TimeResolution = {
  /** What the certificate said, as given. */
  readonly wallClock: string;
  /** Standard-meridian offset in force at that date, in minutes east of UTC. */
  readonly zoneOffsetMinutes: number;
  /** Longitude correction applied, in minutes. Negative west of the meridian. */
  readonly longitudeCorrectionMinutes: number;
  /** The instant the pillars were actually read from, after correction. */
  readonly correctedLocalTime: string;
  /** 야자시 splits the 子 hour across two days; 조자시 keeps it on one. */
  readonly midnightConvention: "야자시" | "조자시";
  /** True when no time was given and the hour pillar is therefore absent. */
  readonly hourUnknown: boolean;
};

/** A 절기 boundary instant, and how far the birth sits from it. */
export type TermBoundary = {
  /** 입춘, 경칩, 청명 … — one of the twelve 절(節) that start a month branch. */
  readonly name: string;
  /** Sun's apparent longitude at the boundary, in degrees. */
  readonly solarLongitude: number;
  /** ISO instant in the birth's own standard time. */
  readonly at: string;
};

export type LuckPillar = {
  readonly pillar: Pillar;
  /** Age in years at which this 대운 begins. */
  readonly startAge: number;
  /** Calendar year it begins, for orientation. */
  readonly startYear: number;
};

export type LuckCycle = {
  /** 순행(順行) or 역행(逆行), decided by the year stem's polarity and the sex given. */
  readonly direction: "순행" | "역행";
  /** 대운수: the age at which the first 대운 takes over. */
  readonly startAge: number;
  /** Days counted to the governing 절, before division by three. */
  readonly countedDays: number;
  readonly pillars: readonly LuckPillar[];
};

export type PhaseCount = Readonly<Record<FivePhase, number>>;

export type SajuChart = {
  readonly ruleVersion: string;
  readonly birthDate: string;
  readonly time: TimeResolution;
  readonly year: Pillar;
  readonly month: Pillar;
  readonly day: Pillar;
  /** Absent when no birth time was given. Guessing one would be inventing the answer. */
  readonly hour: Pillar | null;
  /** 일간(日干) — the self, and the reference every ten-god label is relative to. */
  readonly dayMaster: HeavenlyStem;
  readonly dayMasterPhase: FivePhase;
  readonly dayMasterPolarity: Polarity;
  /** The 절 that opened the birth month, and the one that closed it. */
  readonly monthTerm: TermBoundary;
  readonly nextTerm: TermBoundary;
  /**
   * Set when the birth falls close enough to a 절 boundary that the solar-longitude
   * calculation cannot settle which side it is on. The chart is still returned; the
   * caller is told to confirm rather than shown a confident wrong month.
   */
  readonly termBoundaryWarning: string | null;
  readonly tenGods: {
    readonly yearStem: TenGod;
    readonly monthStem: TenGod;
    readonly hourStem: TenGod | null;
    readonly yearBranch: TenGod;
    readonly monthBranch: TenGod;
    readonly dayBranch: TenGod;
    readonly hourBranch: TenGod | null;
  };
  readonly hiddenStems: {
    readonly year: readonly HiddenStem[];
    readonly month: readonly HiddenStem[];
    readonly day: readonly HiddenStem[];
    readonly hour: readonly HiddenStem[] | null;
  };
  /** Phase totals over the visible stems and branches, hidden stems included. */
  readonly phaseBalance: PhaseCount;
  /** 공망(空亡): the two branches empty for this day pillar's decade. */
  readonly voidBranches: readonly [EarthlyBranch, EarthlyBranch];
  readonly luck: LuckCycle;
};

export class SajuInputError extends Error {
  constructor(
    public readonly code:
      | "INVALID_DATE_FORMAT"
      | "INVALID_CALENDAR_DATE"
      | "INVALID_TIME_FORMAT"
      | "YEAR_OUT_OF_RANGE",
    message: string,
  ) {
    super(message);
    this.name = "SajuInputError";
  }
}
