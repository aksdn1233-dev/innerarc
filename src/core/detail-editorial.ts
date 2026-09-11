import { calculateNumerologyProfile } from "@/core/numerology";
import type { PaidReport } from "@/core/paid-reading";
import { describePersonalYear } from "@/core/profile/personal-year-theme";

type Locale = PaidReport["locale"];

export type EditorialTextBlock = Readonly<{
  title: string;
  lead: string;
  body: string;
}>;

export type EditorialPattern = EditorialTextBlock & Readonly<{
  why: string;
  realLife: string;
  trigger: string;
  risk: string;
  correction: string;
}>;

export type DetailEditorialModel = Readonly<{
  reportId: string;
  birthDate: string;
  birthTime?: string;
  genderLabel: string;
  generatedDate: string;
  symbol: Readonly<{ name: string; meaning: string }>;
  coreLine: string;
  numbers: readonly Readonly<{ label: string; value: string; meaning: string }>[];
  outerInner: readonly EditorialTextBlock[];
  strengths: readonly EditorialTextBlock[];
  shadows: readonly EditorialTextBlock[];
  recurringPatterns: readonly EditorialPattern[];
  relationships: EditorialTextBlock;
  money: EditorialTextBlock;
  career: EditorialTextBlock;
  love: EditorialTextBlock;
  family?: EditorialTextBlock;
  stress: EditorialTextBlock;
  currentFlow: EditorialTextBlock;
  years: readonly Readonly<{ year: number; number: string; keyword: string; reading: string; focus: readonly Readonly<{ label: string; text: string }>[]; action: string }>[];
  realityQuestions: readonly string[];
  actions: readonly string[];
  closing: string;
}>;

const KO_NUMBER_MEANINGS: Readonly<Record<number, string>> = {
  1: "스스로 방향을 정하고 시작하는 힘",
  2: "사람 사이의 온도와 균형을 읽는 힘",
  3: "생각을 말과 표현으로 살리는 힘",
  4: "흐트러진 일을 순서와 구조로 만드는 힘",
  5: "변화를 빠르게 익히고 방향을 바꾸는 힘",
  6: "사람과 결과를 끝까지 돌보는 힘",
  7: "겉보다 원리와 근거를 깊게 파는 힘",
  8: "자원과 목표를 현실의 성과로 잇는 힘",
  9: "흩어진 경험을 큰 이야기로 묶는 힘",
  11: "말보다 먼저 미세한 신호와 가능성을 읽는 힘",
  22: "큰 구상을 오래 작동하는 체계로 만드는 힘",
  33: "사람의 성장을 돕고 공동체를 돌보는 힘",
};

const EN_NUMBER_MEANINGS: Readonly<Record<number, string>> = {
  1: "Initiates and sets direction independently",
  2: "Reads balance and emotional temperature between people",
  3: "Turns thought into vivid expression",
  4: "Turns disorder into sequence and structure",
  5: "Learns change quickly and adapts direction",
  6: "Takes sustained care of people and outcomes",
  7: "Looks beneath appearances for principles and evidence",
  8: "Connects resources and goals to tangible outcomes",
  9: "Connects scattered experience into a larger story",
  11: "Notices subtle signals and possibility before words arrive",
  22: "Builds large ideas into durable systems",
  33: "Supports growth and cares for a wider community",
};

const SYMBOLS: Readonly<Record<number, Readonly<{ ko: string; koMeaning: string; en: string; enMeaning: string }>>> = {
  1: { ko: "첫 획", koMeaning: "남이 정하기 전에 방향을 긋는 상징", en: "The first stroke", enMeaning: "A mark that sets direction before others do" },
  2: { ko: "두 잔의 차", koMeaning: "사이의 온도와 균형을 읽는 상징", en: "Two cups of tea", enMeaning: "A symbol of balance and relational temperature" },
  3: { ko: "열린 창", koMeaning: "생각을 밖으로 살아 움직이게 하는 상징", en: "An open window", enMeaning: "A symbol of bringing ideas into the world" },
  4: { ko: "기초석", koMeaning: "흔들리는 일을 순서와 구조로 받치는 상징", en: "A foundation stone", enMeaning: "A symbol of structure that steadies moving parts" },
  5: { ko: "바람길", koMeaning: "변화의 틈을 먼저 찾아 움직이는 상징", en: "A wind path", enMeaning: "A symbol of finding movement inside change" },
  6: { ko: "켜진 등불", koMeaning: "사람과 결과를 끝까지 돌보는 상징", en: "A lit lamp", enMeaning: "A symbol of sustained care and responsibility" },
  7: { ko: "깊은 우물", koMeaning: "표면 아래의 원리와 근거를 찾는 상징", en: "A deep well", enMeaning: "A symbol of seeking principles below the surface" },
  8: { ko: "단단한 저울", koMeaning: "자원과 결과의 무게를 현실적으로 재는 상징", en: "A steady scale", enMeaning: "A symbol of weighing resources against outcomes" },
  9: { ko: "이어진 산맥", koMeaning: "흩어진 경험을 하나의 큰 이야기로 잇는 상징", en: "A mountain range", enMeaning: "A symbol of joining experiences into one story" },
  11: { ko: "안개 속 등대", koMeaning: "아직 선명하지 않은 신호를 먼저 읽고 현실의 길을 찾는 상징", en: "A lighthouse in mist", enMeaning: "A symbol of reading faint signals and finding a grounded route" },
  22: { ko: "큰 다리", koMeaning: "멀리 떨어진 구상과 현실을 오래 가는 구조로 잇는 상징", en: "A long bridge", enMeaning: "A symbol of connecting a large vision to durable reality" },
  33: { ko: "넓은 처마", koMeaning: "여러 사람의 성장과 회복을 품는 상징", en: "A wide eave", enMeaning: "A symbol of sheltering growth and recovery" },
};

function numberDisplay(value: number): string {
  if (value === 11) return "11/2";
  if (value === 22) return "22/4";
  if (value === 33) return "33/6";
  return String(value);
}

function sentences(text: string): string[] {
  return text
    .replace(/\n+/gu, " ")
    .split(/(?<=[.!?。])\s+/u)
    .map((item) => item.trim())
    .filter(Boolean);
}

function leadOf(text: string, fallback: string): string {
  return sentences(text)[0] ?? fallback;
}

function findSection(report: PaidReport, patterns: readonly RegExp[]): PaidReport["sections"][number] | undefined {
  return report.sections.find((section) => patterns.some((pattern) => pattern.test(section.title)));
}

function block(title: string, section: PaidReport["sections"][number] | undefined, fallback: string): EditorialTextBlock {
  const body = section?.body.trim() || fallback;
  return { title, lead: section?.keySentence?.trim() || leadOf(body, fallback), body };
}

function paragraphAt(text: string, index: number): string {
  const paragraphs = text.split(/\n{2,}/u).map((item) => item.trim()).filter(Boolean);
  return paragraphs[index] ?? paragraphs[0] ?? text;
}

function closingOf(text: string): string {
  const result = sentences(paragraphAt(text, 0)).slice(0, 3).join(" ");
  return result.length <= 320 ? result : `${result.slice(0, 317).trimEnd()}…`;
}

function strengthTitle(value: number, locale: Locale): string {
  const labels: Readonly<Record<number, readonly [string, string]>> = {
    1: ["방향을 여는 추진력", "Direction-setting drive"], 2: ["사이를 읽는 감각", "Relational awareness"],
    3: ["표현으로 살리는 힘", "Expressive force"], 4: ["0에서 1을 만드는 구조력", "Structure that makes ideas real"],
    5: ["변화에 적응하는 힘", "Adaptive range"], 6: ["책임을 완성하는 힘", "Responsible follow-through"],
    7: ["본질을 파고드는 힘", "Depth of inquiry"], 8: ["성과를 만드는 현실감", "Outcome-oriented realism"],
    9: ["전체를 잇는 통찰", "Integrative insight"], 11: ["새로운 연결을 보는 능력", "Seeing new connections"],
    22: ["큰 판을 세우는 힘", "Building at scale"], 33: ["사람을 성장시키는 힘", "Growing people"],
  };
  return labels[value]?.[locale === "ko" ? 0 : 1] ?? labels[9]![locale === "ko" ? 0 : 1];
}

/**
 * Converts the stored, backward-compatible PaidReport into a publication-style view.
 * It never invents biographical events. Every long reading comes from the stored
 * deterministic report; only labels, ordering and the next three personal-year
 * calculations are composed here.
 */
export function buildDetailEditorialModel(report: PaidReport): DetailEditorialModel | null {
  const basis = report.calculationBasis;
  if (!basis || report.productCode !== "pro_30d") return null;
  const ko = report.locale === "ko";
  const meanings = ko ? KO_NUMBER_MEANINGS : EN_NUMBER_MEANINGS;
  const symbol = SYMBOLS[basis.lifePath] ?? SYMBOLS[9]!;
  const temperament = findSection(report, [/핵심 성향과 기질/u, /Core temperament/u]);
  const contradiction = findSection(report, [/숫자 조합 안의 모순/u, /Internal contradiction/u]);
  const decision = findSection(report, [/생각하고 결정하는 방식/u, /Decision pattern/u]);
  const ability = findSection(report, [/가장 강한 능력/u, /Strongest ability/u]);
  const failures = findSection(report, [/반복되는 실패 패턴/u, /Repeated failure/u]);
  const work = findSection(report, [/직업·사업 방향/u, /질문 분야 상세 분석/u, /Work and business/u, /Detailed domain analysis/u]);
  const money = findSection(report, [/재물 흐름/u, /Money flow/u]);
  const teamwork = findSection(report, [/인간관계와 협업/u, /People and collaboration/u]);
  const love = findSection(report, [/연애와 가까운 관계/u, /Close relationships/u]);
  const family = findSection(report, [/가족|자녀|아이/u, /Family|child/u]);
  const stress = findSection(report, [/압박을 받을 때/u, /Under pressure/u]);
  const current = findSection(report, [/\d{4}년 핵심 흐름/u, /\d{4} direction/u]);
  const closing = findSection(report, [/최종 결론/u, /Final conclusion/u]);
  const definition = findSection(report, [/직접적인 인물 정의/u, /질문에 대한 직접 결론/u, /Direct person definition/u, /Direct answer/u]);

  const numberInputs = [
    [ko ? "운명수" : "Life path", basis.lifePath],
    [ko ? "생일수" : "Birthday", basis.birthday],
    [ko ? "태도수" : "Attitude", basis.attitude],
    [ko ? "출생연도수" : "Birth year", basis.birthYear],
  ] as const;
  const numbers = numberInputs.map(([label, value]) => ({ label, value: numberDisplay(value), meaning: meanings[value] ?? meanings[9]! }));
  const strengthValues = [basis.lifePath, basis.birthday, basis.attitude, basis.birthYear];
  const strengthBodies = [
    ability?.body ?? meanings[basis.lifePath]!,
    temperament?.body ?? meanings[basis.birthday]!,
    decision?.body ?? meanings[basis.attitude]!,
    work?.body ?? meanings[basis.birthYear]!,
  ];
  const strengths: EditorialTextBlock[] = strengthValues.map((value, index) => ({
    title: strengthTitle(value, report.locale),
    lead: meanings[value] ?? meanings[9]!,
    body: paragraphAt(strengthBodies[index]!, 0),
  }));
  strengths.push({
    title: ko ? "직감과 현실성을 같이 쓰는 능력" : "Using intuition with realism",
    lead: ko ? `${numberDisplay(basis.lifePath)}의 감각을 ${numberDisplay(basis.birthday)}의 실행 기준으로 옮깁니다.` : `Moves the signal of ${numberDisplay(basis.lifePath)} into the execution standard of ${numberDisplay(basis.birthday)}.`,
    body: paragraphAt(contradiction?.body ?? decision?.body ?? report.summary, 0),
  });

  const sharp = (report.sharpInsights ?? []).slice(0, 5);
  const shadows = Array.from({ length: 5 }, (_, index) => {
    const text = sharp[index] ?? paragraphAt(failures?.body ?? contradiction?.body ?? report.summary, index);
    return {
      title: ko ? `강점이 과해질 때 ${String(index + 1).padStart(2, "0")}` : `When a strength runs long ${String(index + 1).padStart(2, "0")}`,
      lead: text,
      body: ko ? `이 모습이 반복되는 조건을 기록해보세요. 손실이 커지기 전에 멈출 기준 하나를 정하면 강점은 다시 제자리로 돌아옵니다.` : "Record the condition that makes this repeat. One clear stop rule helps return the strength to useful range.",
    };
  });

  const patternSources = [decision, failures, contradiction].filter(Boolean) as PaidReport["sections"][number][];
  const recurringPatterns = patternSources.map((section, index) => ({
    title: ko ? ["결정이 커질 때", "끝내기 직전에", "두 마음이 충돌할 때"][index]! : ["When a decision grows", "Just before completion", "When two motives collide"][index]!,
    lead: leadOf(section.body, section.title),
    body: section.body,
    why: sentences(paragraphAt(section.body, 0))[0] ?? section.title,
    realLife: paragraphAt(section.body, 0),
    trigger: sentences(paragraphAt(section.body, 0))[1] ?? leadOf(section.body, section.title),
    risk: paragraphAt(section.body, 1),
    correction: report.actions[index] ?? report.actions[0] ?? (ko ? "다음 선택 전에 사실과 기대를 한 줄씩 나눠 적습니다." : "Before the next choice, write one observed fact and one expectation separately."),
  }));

  const years = [basis.serviceYear, basis.serviceYear + 1, basis.serviceYear + 2].map((year) => {
    const profile = calculateNumerologyProfile({ birthDate: basis.birthDate, name: "", personalYear: year });
    const theme = describePersonalYear(profile.personalYear.value, report.locale);
    return {
      year,
      number: numberDisplay(profile.personalYear.value),
      keyword: theme.phase,
      reading: theme.timing,
      focus: ko ? [
        { label: "돈", text: profile.personalYear.value >= 8 ? "성과와 보존 기준을 함께 세웁니다." : "먼저 지킬 금액과 쓸 범위를 나눕니다." },
        { label: "일", text: `${theme.phase}에 맞는 완료 기준 하나를 정합니다.` },
        { label: "관계", text: profile.personalYear.value === 2 || profile.personalYear.value === 6 ? "말보다 약속과 돌봄의 균형을 봅니다." : "기대와 책임을 짧게 확인합니다." },
        { label: "변화", text: profile.personalYear.value === 1 || profile.personalYear.value === 5 ? "작게 시작해 실제 반응을 확인합니다." : "되돌릴 수 있는 범위에서 조정합니다." },
      ] : [
        { label: "Money", text: profile.personalYear.value >= 8 ? "Set outcome and preservation rules together." : "Separate protected cash from planned spending." },
        { label: "Work", text: `Choose one completion standard for a ${theme.phase} cycle.` },
        { label: "Relationships", text: profile.personalYear.value === 2 || profile.personalYear.value === 6 ? "Check the balance between promises and care." : "Clarify expectations and responsibility." },
        { label: "Change", text: profile.personalYear.value === 1 || profile.personalYear.value === 5 ? "Start small and watch the real response." : "Adjust within a reversible range." },
      ],
      action: ko ? "이 흐름을 확정된 미래로 보지 말고, 실제 일정과 결과를 함께 확인하세요." : "Treat this as a reflection prompt, then check it against real schedules and outcomes.",
    };
  });

  const gender = report.profileFacts?.gender;
  const genderLabel = gender === "male" ? (ko ? "남성" : "Male") : gender === "female" ? (ko ? "여성" : "Female") : (ko ? "미기재" : "Not provided");
  const coreLine = leadOf(definition?.body ?? report.summary, report.summary);

  return {
    reportId: report.orderId,
    birthDate: report.profileFacts?.birthDate ?? basis.birthDate,
    ...(report.profileFacts?.birthTime ? { birthTime: report.profileFacts.birthTime } : {}),
    genderLabel,
    generatedDate: report.createdAt,
    symbol: { name: ko ? symbol.ko : symbol.en, meaning: ko ? symbol.koMeaning : symbol.enMeaning },
    coreLine,
    numbers,
    outerInner: [
      block(ko ? "겉으로 보이는 나" : "How I appear", temperament, report.summary),
      block(ko ? "실제 안쪽의 나" : "What happens inside", contradiction, report.summary),
    ],
    strengths,
    shadows,
    recurringPatterns,
    relationships: block(ko ? "사람을 볼 때 반복되는 기준" : "The pattern in reading people", teamwork, paragraphAt(temperament?.body ?? report.summary, 1)),
    money: block(ko ? "돈이 붙는 방식과 빠지는 방식" : "How money stays and leaks", money, paragraphAt(work?.body ?? report.summary, 0)),
    career: block(ko ? "일에서 맞는 역할과 피할 구조" : "Work roles that fit and structures to avoid", work, ability?.body ?? report.summary),
    love: block(ko ? "끌리는 사람과 오래 맞는 사람" : "Attraction and long-term fit", love, teamwork?.body ?? report.summary),
    ...(family ? { family: block(ko ? "가족 관계에서 확인할 것" : "What to check in family relationships", family, family.body) } : {}),
    stress: block(ko ? "평소의 나와 압박받을 때의 나" : "My usual pattern and stress loop", stress, failures?.body ?? report.summary),
    currentFlow: block(ko ? "타고난 성향과 지금의 흐름은 다릅니다" : "Innate traits and the current cycle are different", current, report.summary),
    years,
    realityQuestions: [
      leadOf(decision?.body ?? report.summary, report.summary),
      leadOf(failures?.body ?? contradiction?.body ?? report.summary, report.summary),
      leadOf(contradiction?.body ?? temperament?.body ?? report.summary, report.summary),
      leadOf(teamwork?.body ?? work?.body ?? report.summary, report.summary),
      leadOf(money?.body ?? work?.body ?? report.summary, report.summary),
      leadOf(stress?.body ?? failures?.body ?? report.summary, report.summary),
    ].map((statement) => ko
      ? `“${statement}” 이 모습이 실제 선택에서 반복되었나요?`
      : `Has “${statement}” repeated in your real choices?`),
    actions: report.actions.slice(0, 3),
    closing: closingOf(closing?.body ?? report.summary),
  };
}
