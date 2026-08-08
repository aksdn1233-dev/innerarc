/**
 * Reading the numerology profile and the 사주 chart against each other.
 *
 * Two readings printed side by side are two readings. The value is in what happens where
 * they meet: where they say the same thing from different directions, where they pull
 * against each other, and where one qualifies the other. That is what this produces —
 * a small set of findings, each naming both sources and what it concluded.
 *
 * Everything here is derived from values the two deterministic engines already computed.
 * Nothing is invented, nothing is random, and the same birth data always yields the same
 * findings. When a chart has no hour pillar the comparisons that need it are skipped
 * rather than guessed, and the result says which ones were skipped.
 *
 * The findings describe structure. None of them predicts an event or fixes an outcome.
 */

import type { NumerologyProfile } from "@/core/numerology";
import { withParticle } from "@/core/korean-particles";
import type { FivePhase, SajuChart } from "@/core/saju";
import type { StrengthReading } from "@/core/saju/interpretation";

export const CROSS_READING_RULE_VERSION = "cross-1.0.0" as const;

/** What the meeting of the two systems produced. */
export type CrossAgreement =
  /** Both point the same way. The trait is doubly grounded. */
  | "reinforcement"
  /** They pull against each other. The person carries both, in tension. */
  | "tension"
  /** One softens or bounds what the other asserts. */
  | "moderation";

export type CrossFinding = {
  readonly id: string;
  readonly agreement: CrossAgreement;
  /** What numerology contributed, named so a reader can check it. */
  readonly fromNumerology: string;
  /** What the chart contributed, likewise. */
  readonly fromSaju: string;
  /** The reading that follows from the two together. */
  readonly reading: string;
};

export type CrossReading = {
  readonly ruleVersion: string;
  readonly findings: readonly CrossFinding[];
  /** Comparisons that could not run, and why. Never silently dropped. */
  readonly skipped: readonly string[];
};

/**
 * Which phase a life-path number sits closest to.
 *
 * This is a mapping between two systems that never agreed on one, so it is stated as a
 * convention rather than dressed up as a discovery: the traditional 낙서(洛書) placement
 * of the numbers one through nine on the five phases, with master numbers folded to their
 * root. It is published in the finding text so a reader can disagree with it knowingly.
 */
const LIFE_PATH_PHASE: Readonly<Record<number, FivePhase>> = {
  1: "수", 2: "토", 3: "목", 4: "목", 5: "토", 6: "금", 7: "금", 8: "토", 9: "화",
};

function rootNumber(value: number): number {
  let current = value;
  while (current > 9) {
    current = String(current).split("").reduce((sum, digit) => sum + Number(digit), 0);
  }
  return current;
}

function lifePathPhase(lifePath: number): FivePhase {
  return LIFE_PATH_PHASE[rootNumber(lifePath)]!;
}

/** 목생화생토생금생수생목. */
const PRODUCES: Readonly<Record<FivePhase, FivePhase>> = {
  목: "화", 화: "토", 토: "금", 금: "수", 수: "목",
};
const CONTROLS: Readonly<Record<FivePhase, FivePhase>> = {
  목: "토", 화: "금", 토: "수", 금: "목", 수: "화",
};

/** Numbers whose traditional reading leans toward acting alone. */
const SELF_DIRECTED_LIFE_PATHS = new Set([1, 5, 8, 22]);
/** Numbers whose traditional reading leans toward carrying others. */
const OTHER_DIRECTED_LIFE_PATHS = new Set([2, 6, 9, 33]);

export function readAcrossSystems(
  numerology: NumerologyProfile,
  chart: SajuChart,
  strength: StrengthReading,
): CrossReading {
  const findings: CrossFinding[] = [];
  const skipped: string[] = [];
  const lifePath = numerology.lifePath.value;
  const numberPhase = lifePathPhase(lifePath);
  const masterPhase = chart.dayMasterPhase;

  // 1 — the two systems' idea of the person's own element, compared directly.
  if (numberPhase === masterPhase) {
    findings.push({
      id: "phase_match",
      agreement: "reinforcement",
      fromNumerology: `생명수 ${lifePath} → ${numberPhase}`,
      fromSaju: `일간 ${chart.dayMaster} → ${masterPhase}`,
      reading: `두 체계가 같은 오행(${numberPhase})을 가리킵니다. 성향이 한쪽으로 뚜렷하게 모이는 편이라, 잘 맞는 상황에서는 남들보다 빨리 자리를 잡고 안 맞는 상황에서는 버티기가 유독 어렵습니다.`,
    });
  } else if (PRODUCES[numberPhase] === masterPhase) {
    findings.push({
      id: "phase_feeds_master",
      agreement: "reinforcement",
      fromNumerology: `생명수 ${lifePath} → ${numberPhase}`,
      fromSaju: `일간 ${chart.dayMaster} → ${masterPhase}`,
      reading: `${withParticle(numberPhase, "subject")} ${withParticle(masterPhase, "object")} 살리는 관계입니다. 타고난 기질을 숫자 쪽 성향이 밀어주는 구조라, 준비 기간이 길어도 결국 같은 방향으로 갑니다.`,
    });
  } else if (CONTROLS[numberPhase] === masterPhase || CONTROLS[masterPhase] === numberPhase) {
    findings.push({
      id: "phase_conflict",
      agreement: "tension",
      fromNumerology: `생명수 ${lifePath} → ${numberPhase}`,
      fromSaju: `일간 ${chart.dayMaster} → ${masterPhase}`,
      reading: `두 체계가 서로 극(剋)하는 오행을 가리킵니다. 하고 싶은 방식과 편한 방식이 어긋나는 순간이 반복되고, 그래서 남들보다 결정에 시간이 걸립니다. 결함이 아니라 구조입니다.`,
    });
  } else {
    findings.push({
      id: "phase_indirect",
      agreement: "moderation",
      fromNumerology: `생명수 ${lifePath} → ${numberPhase}`,
      fromSaju: `일간 ${chart.dayMaster} → ${masterPhase}`,
      reading: `두 오행이 직접 부딪히지도, 밀어주지도 않습니다. 한쪽이 다른 쪽을 심하게 눌러버리는 일이 적어, 상황에 따라 다른 얼굴이 나오는 편입니다.`,
    });
  }

  // 2 — independence, from the number, weighed against how much support the chart gives.
  const selfDirected = SELF_DIRECTED_LIFE_PATHS.has(lifePath);
  const otherDirected = OTHER_DIRECTED_LIFE_PATHS.has(lifePath);
  if (selfDirected && strength.label === "신강") {
    findings.push({
      id: "independence_reinforced",
      agreement: "reinforcement",
      fromNumerology: `생명수 ${lifePath} — 혼자 결정하는 쪽`,
      fromSaju: `억부 ${strength.label} (${strength.score > 0 ? "+" : ""}${strength.score})`,
      reading: "혼자 판단하고 밀어붙이는 성향을 사주 구조가 받쳐줍니다. 실행력이 강점이 되는 대신, 주변 의견이 늦게 들어오는 자리라 되돌리는 비용이 큽니다.",
    });
  } else if (selfDirected && strength.label === "신약") {
    findings.push({
      id: "independence_unsupported",
      agreement: "tension",
      fromNumerology: `생명수 ${lifePath} — 혼자 결정하는 쪽`,
      fromSaju: `억부 ${strength.label} (${strength.score})`,
      reading: "혼자 하려는 성향은 뚜렷한데 그것을 지탱할 힘이 원국에서 약합니다. 시작은 스스로 하되 유지는 사람이나 체계에 기대는 편이 실제로 결과가 좋았을 가능성이 높습니다.",
    });
  } else if (otherDirected && strength.label === "신강") {
    findings.push({
      id: "care_with_strength",
      agreement: "moderation",
      fromNumerology: `생명수 ${lifePath} — 주변을 챙기는 쪽`,
      fromSaju: `억부 ${strength.label} (+${strength.score})`,
      reading: "남을 챙기는 성향이지만 자기 자리를 잃을 만큼은 아닙니다. 챙기면서도 선을 그을 수 있는 구조라, 문제는 대개 선을 안 그은 쪽에서 생깁니다.",
    });
  } else if (otherDirected && strength.label === "신약") {
    findings.push({
      id: "care_without_reserve",
      agreement: "reinforcement",
      fromNumerology: `생명수 ${lifePath} — 주변을 챙기는 쪽`,
      fromSaju: `억부 ${strength.label} (${strength.score})`,
      reading: "챙기려는 성향과 힘이 부족한 구조가 같이 있습니다. 거절이 늦어지면 손해가 한꺼번에 몰리는 자리라, 무엇을 안 할지를 먼저 정하는 편이 낫습니다.",
    });
  }

  // 3 — the season the chart was born into, against the year the numbers are in.
  const personalYear = numerology.personalYear.value;
  const climateNeedsWarmth = chart.month.branch === "亥" || chart.month.branch === "子"
    || chart.month.branch === "丑";
  if (climateNeedsWarmth && (personalYear === 1 || personalYear === 3 || personalYear === 5)) {
    findings.push({
      id: "cold_chart_active_year",
      agreement: "tension",
      fromNumerology: `개인년 ${personalYear} — 벌리는 해`,
      fromSaju: `${chart.month.branch}월 — 온기가 필요한 계절`,
      reading: "판을 벌리기 좋은 해인데, 원국은 따뜻하게 데워야 움직이는 구조입니다. 속도보다 조건을 먼저 갖추는 쪽이 같은 해를 훨씬 낫게 씁니다.",
    });
  }

  // 4 — the hour pillar, or its absence, stated rather than papered over.
  if (chart.hour === null) {
    skipped.push("시주가 없어 하루의 리듬과 관련된 대조는 하지 않았습니다. 출생 시각을 아시면 이 부분이 채워집니다.");
  }
  if (numerology.name.status !== "calculated") {
    skipped.push("이름 수치가 없어 표현 방식과 관련된 대조는 하지 않았습니다.");
  }
  if (chart.termBoundaryWarning) {
    skipped.push("절기 경계 또는 서머타임 확인이 필요한 출생 시각이라, 월주가 바뀌면 위 해석도 함께 바뀝니다.");
  }

  return { ruleVersion: CROSS_READING_RULE_VERSION, findings, skipped };
}
