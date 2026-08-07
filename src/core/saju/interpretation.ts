/**
 * Three ways of reading the same chart.
 *
 * Practitioners do not disagree about the arithmetic — the four pillars are the four
 * pillars. They disagree about what to look at first. One tradition weighs the day
 * master's strength and picks the phase that balances it (억부). One asks whether the
 * chart is too cold or too hot for the season it was born into and warms or cools it
 * (조후). One reads the structure the month branch declares and judges whether the chart
 * serves or breaks it (격국).
 *
 * All three are classical positions, set out in 『자평진전』 and 『궁통보감』 among others.
 * They are offered here as viewpoints a reader can switch between, with the numbers that
 * produced each one shown, because that is honest about a subject where the schools
 * genuinely differ — and because no living practitioner's name is borrowed to sell any of
 * them.
 *
 * Every verdict below is structural. None of them predicts an event, and none says an
 * outcome is fixed.
 */

import { withParticle } from "../korean-particles";
import { branchPhase, hiddenStemsOf, stemPhase, tenGod } from "./pillars";
import type {
  EarthlyBranch,
  FivePhase,
  HeavenlyStem,
  SajuChart,
  TenGod,
} from "./types";

/** 목생화생토생금생수생목. */
const PRODUCES: Readonly<Record<FivePhase, FivePhase>> = {
  목: "화", 화: "토", 토: "금", 금: "수", 수: "목",
};

/** 목극토, 화극금, 토극수, 금극목, 수극화. */
const CONTROLS: Readonly<Record<FivePhase, FivePhase>> = {
  목: "토", 화: "금", 토: "수", 금: "목", 수: "화",
};

function producedBy(phase: FivePhase): FivePhase {
  return (Object.keys(PRODUCES) as FivePhase[]).find((key) => PRODUCES[key] === phase)!;
}

function controlledBy(phase: FivePhase): FivePhase {
  return (Object.keys(CONTROLS) as FivePhase[]).find((key) => CONTROLS[key] === phase)!;
}

/** 비겁 and 인성 hold the day master up; 식상, 재성 and 관살 draw it down. */
const SUPPORTING_GODS: readonly TenGod[] = ["비견", "겁재", "편인", "정인"];

export type StrengthContribution = {
  /** Where in the chart it came from, e.g. "월지 정기". */
  readonly source: string;
  readonly god: TenGod;
  readonly weight: number;
  readonly supports: boolean;
};

export type StrengthReading = {
  readonly viewpoint: "억부";
  /** Support minus drain, as a share of the total weight. −100 to 100. */
  readonly score: number;
  readonly label: "신강" | "중화" | "신약";
  readonly contributions: readonly StrengthContribution[];
  /** 득령: whether the month branch is on the day master's side. The heaviest single fact. */
  readonly hasSeasonalSupport: boolean;
  /** Phases that bring the chart back toward the middle. */
  readonly usefulPhases: readonly FivePhase[];
  readonly straining: readonly FivePhase[];
};

export type ClimateReading = {
  readonly viewpoint: "조후";
  readonly season: "봄" | "여름" | "가을" | "겨울";
  readonly monthBranch: EarthlyBranch;
  /** What the season asks this chart for before anything else. */
  readonly need: "온기" | "냉기" | "습기" | "건조" | "없음";
  /** Whether the chart already carries it. */
  readonly satisfied: boolean;
  readonly usefulPhases: readonly FivePhase[];
  readonly note: string;
};

export type StructureReading = {
  readonly viewpoint: "격국";
  /** e.g. "정관격", "건록격". Named from the month branch, as the tradition does. */
  readonly name: string;
  /** The ten god the structure is built on. */
  readonly god: TenGod;
  /** Whether a stem of the same phase shows on the surface — 투간. */
  readonly revealed: boolean;
  readonly derivedFrom: string;
  readonly note: string;
};

export type SajuViewpoints = {
  readonly strength: StrengthReading;
  readonly climate: ClimateReading;
  readonly structure: StructureReading;
};

/**
 * 억부. The month branch weighs most because a chart born in its own season stands on
 * different ground from one born out of it; the day branch is next, being the seat the
 * day master sits on; the remaining stems and branches weigh least. These are the
 * conventional relative weights, and they are published with the result so a reader can
 * see exactly what produced the verdict rather than being asked to trust it.
 */
export function readStrength(chart: SajuChart): StrengthReading {
  const self = chart.dayMaster;
  const contributions: StrengthContribution[] = [];

  const add = (source: string, stem: HeavenlyStem, weight: number) => {
    const god = tenGod(self, stem);
    contributions.push({ source, god, weight, supports: SUPPORTING_GODS.includes(god) });
  };

  add("연간", chart.year.stem, 10);
  add("월간", chart.month.stem, 20);
  if (chart.hour) add("시간", chart.hour.stem, 10);

  // A branch is weighed through the stem that governs it, and the month branch is
  // weighed three times over — the season is the ground everything else stands on.
  const principal = (branch: EarthlyBranch) =>
    hiddenStemsOf(branch).find(({ role }) => role === "정기")!.stem;

  add("연지", principal(chart.year.branch), 10);
  add("월지", principal(chart.month.branch), 30);
  add("일지", principal(chart.day.branch), 20);
  if (chart.hour) add("시지", principal(chart.hour.branch), 10);

  const total = contributions.reduce((sum, entry) => sum + entry.weight, 0);
  const supporting = contributions
    .filter(({ supports }) => supports)
    .reduce((sum, entry) => sum + entry.weight, 0);
  const score = Math.round(((supporting * 2 - total) / total) * 100);

  const label = score >= 15 ? "신강" : score <= -15 ? "신약" : "중화";
  const selfPhase = chart.dayMasterPhase;
  const hasSeasonalSupport = contributions
    .find(({ source }) => source === "월지")!.supports;

  // A strong day master is served by what drains or checks it; a weak one by what feeds
  // or joins it. A balanced chart is not told it needs fixing.
  const usefulPhases: FivePhase[] = label === "신강"
    ? [PRODUCES[selfPhase], CONTROLS[selfPhase], controlledBy(selfPhase)]
    : label === "신약"
      ? [producedBy(selfPhase), selfPhase]
      : [];
  const straining: FivePhase[] = label === "신강"
    ? [producedBy(selfPhase), selfPhase]
    : label === "신약"
      ? [CONTROLS[selfPhase], controlledBy(selfPhase)]
      : [];

  return {
    viewpoint: "억부",
    score,
    label,
    contributions,
    hasSeasonalSupport,
    usefulPhases,
    straining,
  };
}

const SEASON_OF: Readonly<Record<EarthlyBranch, ClimateReading["season"]>> = {
  寅: "봄", 卯: "봄", 辰: "봄",
  巳: "여름", 午: "여름", 未: "여름",
  申: "가을", 酉: "가을", 戌: "가을",
  亥: "겨울", 子: "겨울", 丑: "겨울",
};

/**
 * 조후. The 궁통보감 position: a chart born in deep winter wants warmth before it wants
 * anything else, and one born in high summer wants water, whatever its strength says.
 * This reads the season, names what it asks for, and then checks whether the chart
 * already has it — which is the whole of the method's first move.
 */
export function readClimate(chart: SajuChart): ClimateReading {
  const monthBranch = chart.month.branch;
  const season = SEASON_OF[monthBranch];

  const need: ClimateReading["need"] =
    season === "겨울" ? "온기"
      : season === "여름" ? "냉기"
        : monthBranch === "戌" || monthBranch === "未" ? "습기"
          : monthBranch === "辰" || monthBranch === "丑" ? "건조"
            : "없음";

  const usefulPhases: FivePhase[] =
    need === "온기" ? ["화"]
      : need === "냉기" ? ["수"]
        : need === "습기" ? ["수"]
          : need === "건조" ? ["화"]
            : [];

  const present = new Set<FivePhase>();
  const pillars = chart.hour
    ? [chart.year, chart.month, chart.day, chart.hour]
    : [chart.year, chart.month, chart.day];
  for (const { stem, branch } of pillars) {
    present.add(stemPhase(stem));
    present.add(branchPhase(branch));
  }
  const satisfied = usefulPhases.length === 0
    || usefulPhases.every((phase) => present.has(phase));

  const note = need === "없음"
    ? `${monthBranch}월은 계절이 한쪽으로 치우치지 않은 달이라, 조후 관점에서 먼저 채워야 할 것이 따로 없습니다.`
    : satisfied
      ? `${season}에 태어난 사주가 필요로 하는 ${withParticle(need, "subject")} 원국 안에 이미 있습니다.`
      : `${season}에 태어난 사주가 필요로 하는 ${withParticle(need, "subject")} 원국 안에 보이지 않습니다. 조후 관점은 이것을 먼저 봅니다.`;

  return { viewpoint: "조후", season, monthBranch, need, satisfied, usefulPhases, note };
}

/** 비견 and 겁재 in the month give the two structures named for the seat, not for the god. */
const SEAT_STRUCTURES: Readonly<Partial<Record<TenGod, string>>> = {
  비견: "건록격",
  겁재: "양인격",
};

/**
 * 격국. The structure is named from the month branch: normally after the ten god of the
 * stem that governs it, and after the seat itself when that god is 비견 or 겁재. A stem of
 * the same phase standing openly in the chart is 투간, which the tradition treats as the
 * structure being visible rather than merely implied.
 */
export function readStructure(chart: SajuChart): StructureReading {
  const monthPrincipal = hiddenStemsOf(chart.month.branch)
    .find(({ role }) => role === "정기")!.stem;
  const god = tenGod(chart.dayMaster, monthPrincipal);
  const name = SEAT_STRUCTURES[god] ?? `${god}격`;

  const surfaceStems = [chart.year.stem, chart.month.stem, ...(chart.hour ? [chart.hour.stem] : [])];
  const revealed = surfaceStems.some((stem) => stemPhase(stem) === stemPhase(monthPrincipal));

  return {
    viewpoint: "격국",
    name,
    god,
    revealed,
    derivedFrom: `월지 ${chart.month.branch}의 정기 ${monthPrincipal}, 일간 ${chart.dayMaster} 기준 ${god}`,
    note: revealed
      ? `${withParticle(name, "subject")} 천간에 드러나 있어, 격국 관점에서는 이 구조를 사주의 중심으로 봅니다.`
      : `${withParticle(name, "topic")} 천간에 드러나지 않아, 격국 관점에서는 구조가 잠겨 있다고 봅니다.`,
  };
}

export function readViewpoints(chart: SajuChart): SajuViewpoints {
  return {
    strength: readStrength(chart),
    climate: readClimate(chart),
    structure: readStructure(chart),
  };
}
