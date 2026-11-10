import type { EarthlyBranch, HeavenlyStem, SajuChart } from "./types";

/** Explicit, versioned traditions; other schools use different criteria. */
export const SINSAL_RULE_VERSION = "sinsal:1.1.0";
const BAEKHO_DAY = new Set(["甲辰", "乙未", "丙戌", "丁丑", "戊辰", "壬戌", "癸丑"]);
const GOEGANG_DAY = new Set(["庚辰", "庚戌", "壬辰", "壬戌"]);
const CHEONEUL: Record<HeavenlyStem, readonly EarthlyBranch[]> = {
  甲: ["丑", "未"], 乙: ["子", "申"], 丙: ["亥", "酉"], 丁: ["亥", "酉"],
  戊: ["丑", "未"], 己: ["子", "申"], 庚: ["丑", "未"], 辛: ["寅", "午"],
  壬: ["卯", "巳"], 癸: ["卯", "巳"],
};
const HONGYEOM: Record<HeavenlyStem, EarthlyBranch> = {
  甲: "午", 乙: "午", 丙: "寅", 丁: "未", 戊: "辰", 己: "辰",
  庚: "戌", 辛: "酉", 壬: "子", 癸: "申",
};

export function identifySinsal(chart: Pick<SajuChart, "year" | "month" | "day" | "hour" | "dayMaster">) {
  const positions = (["year", "month", "day", "hour"] as const)
    .filter(position => chart[position]?.branch === HONGYEOM[chart.dayMaster]);
  return {
    ruleVersion: SINSAL_RULE_VERSION,
    baekho: { matched: BAEKHO_DAY.has(chart.day.stem + chart.day.branch), basis: "day-pillar" as const },
    hongyeom: { positions, basis: "day-stem-to-four-branches" as const },
    goegang: { matched: GOEGANG_DAY.has(chart.day.stem + chart.day.branch), basis: "day-pillar" as const },
    cheoneul: { positions: (["year", "month", "day", "hour"] as const).filter(position => {
      const pillar = chart[position];
      return pillar ? CHEONEUL[chart.dayMaster].includes(pillar.branch) : false;
    }), basis: "day-stem-to-four-branches" as const },
    hourUnknown: chart.hour === null,
  };
}

const GROUPS: readonly { branches: string; dohwa: EarthlyBranch; yeokma: EarthlyBranch; hwagae: EarthlyBranch }[] = [
  { branches: "申子辰", dohwa: "酉", yeokma: "寅", hwagae: "辰" },
  { branches: "寅午戌", dohwa: "卯", yeokma: "申", hwagae: "戌" },
  { branches: "巳酉丑", dohwa: "午", yeokma: "亥", hwagae: "丑" },
  { branches: "亥卯未", dohwa: "子", yeokma: "巳", hwagae: "未" },
];

/** Day-branch convention. Do not conflate year-branch and day-branch schools. */
export function identifyBranchSinsal(chart: Pick<SajuChart, "year" | "month" | "day" | "hour">) {
  const group = GROUPS.find(entry => entry.branches.includes(chart.day.branch))!;
  const find = (target: EarthlyBranch) => (["year", "month", "day", "hour"] as const)
    .filter(position => chart[position]?.branch === target);
  return { dohwa: find(group.dohwa), yeokma: find(group.yeokma), hwagae: find(group.hwagae) };
}

export function describeSinsal(chart: SajuChart, language: "ko" | "en" | "ja", detailed = false) {
  const result = identifySinsal(chart);
  const branch = identifyBranchSinsal(chart);
  const labels = language === "ko" ? { year: "연지", month: "월지", day: "일지", hour: "시지" }
    : language === "ja" ? { year: "年支", month: "月支", day: "日支", hour: "時支" }
    : { year: "year branch", month: "month branch", day: "day branch", hour: "hour branch" };
  const positions = (items: readonly (keyof typeof labels)[]) => items.map(item => labels[item]).join(", ");
  const data = [
    { ko: "백호살", ja: "白虎殺", en: "Baekho", found: result.baekho.matched ? (language === "ko" ? "일주" : language === "ja" ? "日柱" : "day pillar") : "", koMeaning: "힘과 책임을 어떻게 다루는지 돌아보는 상징이에요.", enMeaning: "A traditional prompt to reflect on strength and responsibility.", jaMeaning: "力と責任の扱い方を振り返る象徴です。" },
    { ko: "홍염살", ja: "紅艶殺", en: "Hongyeom", found: positions(result.hongyeom.positions), koMeaning: "표현과 관계에서의 모습을 살펴보는 상징이에요.", enMeaning: "A symbolic prompt about expression and relationships.", jaMeaning: "表現や人との関わりを見つめる象徴です。" },
    { ko: "도화살", ja: "桃花殺", en: "Dohwa", found: positions(branch.dohwa), koMeaning: "사람들과의 소통을 돌아보는 상징이에요.", enMeaning: "A symbolic prompt about communication with others.", jaMeaning: "人とのコミュニケーションを振り返る象徴です。" },
    { ko: "역마살", ja: "駅馬殺", en: "Yeokma", found: positions(branch.yeokma), koMeaning: "변화와 이동에 대한 태도를 살펴보는 상징이에요.", enMeaning: "A symbolic prompt about change and movement.", jaMeaning: "変化や移動への向き合い方を見つめる象徴です。" },
    { ko: "화개살", ja: "華蓋殺", en: "Hwagae", found: positions(branch.hwagae), koMeaning: "혼자 집중하거나 생각을 정리하는 시간을 돌아보는 상징이에요.", enMeaning: "A symbolic prompt about reflection and focused time.", jaMeaning: "思索や集中の時間を振り返る象徴です。" },
    { ko: "괴강살", ja: "魁罡殺", en: "Goegang", found: result.goegang.matched ? (language === "ko" ? "일주" : language === "ja" ? "日柱" : "day pillar") : "", koMeaning: "결정과 책임을 다루는 방식을 살펴보는 상징이에요.", enMeaning: "A symbolic prompt about decisions and responsibility.", jaMeaning: "決断と責任の扱い方を見つめる象徴です。" },
    { ko: "천을귀인", ja: "天乙貴人", en: "Cheoneul benefactor", found: positions(result.cheoneul.positions), koMeaning: "도움을 주고받은 경험을 살펴보는 상징이에요.", enMeaning: "A symbolic prompt about giving and receiving support.", jaMeaning: "助け合いの経験を振り返る象徴です。" },
  ];
  const lines = data.map(item => {
    const name = item[language];
    const value = item.found || (language === "ko" ? "확인된 기둥에 없음" : language === "ja" ? "確認できた柱にはありません" : "Not found in known pillars");
    const meaning = language === "ko" ? item.koMeaning : language === "ja" ? item.jaMeaning : item.enMeaning;
    return `${name}: ${value}${detailed && item.found ? ` — ${meaning}` : ""}`;
  });
  const basis = language === "ko" ? `판정 기준: 백호는 일주 ${chart.day.label}, 홍염은 일간 ${chart.dayMaster} 기준으로 각 지지, 도화·역마·화개는 일지 ${chart.day.branch} 기준으로 각 지지를 대조해요. 괴강은 경진·경술·임진·임술 일주, 천을귀인은 일간과 각 지지를 대조해요. 유파에 따라 기준이 다를 수 있어요.`
    : language === "ja" ? `基準: 白虎は日柱 ${chart.day.label}、紅艶は日干 ${chart.dayMaster}、桃花・駅馬・華蓋は日支 ${chart.day.branch}、魁罡は日柱、天乙貴人は日干で照合します。流派によって異なります。`
    : `Method: Baekho uses day pillar ${chart.day.label}; Hongyeom uses day stem ${chart.dayMaster}; Dohwa, Yeokma and Hwagae use day branch ${chart.day.branch}; Goegang uses the day pillar and Cheoneul the day stem. Schools differ.`;
  const missing = result.hourUnknown ? (language === "ko" ? "태어난 시간을 몰라 시지는 확인하지 못했어요." : language === "ja" ? "出生時刻が不明のため時支は確認できません。" : "The hour branch was not checked because birth time is unknown.") : "";
  const boundary = language === "ko" ? "신살은 전통적인 상징 풀이로, 사건이나 성격을 확정하지 않아요. 실제 경험과 다르면 경험을 우선해 주세요." : language === "ja" ? "神殺は伝統的な象徴解釈であり、出来事や性格を確定するものではありません。実際の経験を優先してください。" : "These are traditional symbolic interpretations, not predictions or established personality traits. Give priority to lived experience.";
  return [...lines, basis, missing, boundary].filter(Boolean).join("\n\n");
}
