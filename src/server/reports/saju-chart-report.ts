import type { PaidReadingInput, PaidReport } from "@/core/paid-reading";
import { buildSajuChart, buildSajuLifeNarrative, readViewpoints } from "@/core/saju";

function joinPillar(stem: string, branch: string): string {
  return `${stem}${branch}`;
}

export function createSajuChartReport(
  orderId: string,
  input: PaidReadingInput,
): PaidReport {
  const ko = input.locale === "ko";
  const chart = buildSajuChart({
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    sex: input.gender === "male" ? "male" : "female",
    midnightConvention: input.midnightConvention ?? "야자시",
  });
  const views = readViewpoints(chart);
  const lifeNarrative = buildSajuLifeNarrative(
    chart,
    views.strength,
    views.structure,
    input.locale,
    input.name,
  );
  const pillars = [
    chart.hour ? joinPillar(chart.hour.stem, chart.hour.branch) : (ko ? "시주 미입력" : "Hour not provided"),
    joinPillar(chart.day.stem, chart.day.branch),
    joinPillar(chart.month.stem, chart.month.branch),
    joinPillar(chart.year.stem, chart.year.branch),
  ];
  const phases = Object.entries(chart.phaseBalance)
    .map(([phase, count]) => `${phase} ${count}`)
    .join(" · ");

  return {
    version: 1,
    orderId,
    productCode: input.productCode,
    locale: input.locale,
    title: ko ? "나의 사주 원국" : "My Four Pillars chart",
    customerName: input.name.trim() || null,
    createdAt: input.createdAt,
    concern: "",
    summary: ko
      ? `${pillars.join(" · ")}로 세운 원국입니다. 웹툰 장면을 따라 어린 시절의 역할, 가족의 기대, 관계와 일의 반복 패턴을 실제 기억과 대조해 보세요.`
      : `This chart is built as ${pillars.join(" · ")}. Follow the webtoon scenes through early roles, family expectations, relationships, and work patterns, then compare them with lived experience.`,
    sections: [
      ...lifeNarrative.map(({ title, body }) => ({ title, body })),
      {
        title: ko ? "원국 네 기둥" : "The four pillars",
        body: ko
          ? `시주 · 일주 · 월주 · 연주 순서: ${pillars.join(" · ")}\n일간: ${chart.dayMaster} · ${chart.dayMasterPhase} · ${chart.dayMasterPolarity}\n십신: 시주 ${chart.tenGods.hourStem ?? "—"} · 일주 일간(나) · 월주 ${chart.tenGods.monthStem} · 연주 ${chart.tenGods.yearStem}`
          : `Hour · day · month · year: ${pillars.join(" · ")}\nDay master: ${chart.dayMaster} · ${chart.dayMasterPhase} · ${chart.dayMasterPolarity}\nTen gods: hour ${chart.tenGods.hourStem ?? "—"} · day master · month ${chart.tenGods.monthStem} · year ${chart.tenGods.yearStem}`,
      },
      {
        title: ko ? "오행과 절기" : "Phases and solar terms",
        body: ko
          ? `오행 분포: ${phases}\n월을 연 절기: ${chart.monthTerm.name} → 다음 절기 ${chart.nextTerm.name}\n공망: ${chart.voidBranches.join(" · ")}`
          : `Phase balance: ${phases}\nTerm opening the month: ${chart.monthTerm.name} → next ${chart.nextTerm.name}\nVoid branches: ${chart.voidBranches.join(" · ")}`,
      },
      {
        title: ko ? "계산·보정 근거" : "Calculation and corrections",
        body: chart.time.wallClock
          ? (ko
              ? `입력 시각: ${chart.time.wallClock}\n진태양시 보정: ${chart.time.longitudeCorrectionMinutes}분\n보정 시각: ${chart.time.correctedLocalTime}\n자시 기준: ${chart.time.midnightConvention}\n규칙 버전: ${chart.ruleVersion}`
              : `Entered time: ${chart.time.wallClock}\nTrue-solar correction: ${chart.time.longitudeCorrectionMinutes} min\nCorrected time: ${chart.time.correctedLocalTime}\nMidnight convention: ${chart.time.midnightConvention}\nRule version: ${chart.ruleVersion}`)
          : (ko
              ? `입력 시각: 입력 없음\n시주: 산출하지 않음\n시간 보정: 출생 시각이 없어 표시하지 않음\n규칙 버전: ${chart.ruleVersion}`
              : `Entered time: not given\nHour pillar: not calculated\nTime correction: hidden because no birth time was supplied\nRule version: ${chart.ruleVersion}`),
      },
      {
        title: ko ? "억부 관점" : "Strength viewpoint",
        body: `${views.strength.label} · ${views.strength.score > 0 ? "+" : ""}${views.strength.score}`,
      },
      {
        title: ko ? "조후 관점" : "Climate viewpoint",
        body: `${views.climate.season} · ${views.climate.need}\n${views.climate.note}`,
      },
      {
        title: ko ? "격국 관점" : "Structure viewpoint",
        body: `${views.structure.name}\n${views.structure.derivedFrom}`,
      },
    ],
    actions: ko
      ? ["원국의 네 기둥을 저장해 다른 만세력과 대조하기", "출생 시각이 불확실하면 시주를 확정 사실로 사용하지 않기", "세 관점이 엇갈리면 실제 경험과 반복 행동을 우선 확인하기"]
      : ["Save the four pillars and compare them with another almanac", "If birth time is uncertain, do not treat the hour pillar as established fact", "When viewpoints conflict, check lived experience and repeated behavior first"],
    cautions: chart.hour === null
      ? [ko ? "출생 시각이 없어 시주는 비워 두었습니다." : "The hour pillar is omitted because no birth time was provided."]
      : [],
    disclaimer: ko
      ? "사주는 전통 상징에 따른 자기 성찰 도구입니다. 미래를 보장하거나 의료·법률·투자 판단을 대신하지 않습니다."
      : "Four Pillars is a traditional symbolic reflection tool. It does not guarantee the future or replace medical, legal, or investment judgment.",
    tierLabel: ko ? "사주 원국 · 5,500원 · 1회" : "Four Pillars chart · ₩5,500 · one time",
    characterLabel: ko ? "결 사주 원국" : "GYEOL Four Pillars",
    contentVersion: "saju-chart-report-1.1.0",
    contentReferences: [
      `saju-rule:${chart.ruleVersion}`,
      `saju-midnight:${chart.time.midnightConvention}`,
      "saju-life-narrative:1.0.0",
      "product:SAJU_5500",
    ],
  };
}
