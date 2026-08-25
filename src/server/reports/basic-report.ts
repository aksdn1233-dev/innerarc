import { assessQuestionSafety } from "@/core/ai/safety";
import { withParticle } from "@/core/korean-particles";
import {
  calculateBirthYearNumber,
  calculateNumerologyProfile,
  type NumerologyProfile,
} from "@/core/numerology";
import { createOnboardingReflectionContext } from "@/core/onboarding";
import type { PaidReadingInput, PaidReport } from "@/core/paid-reading";
import { createIntegratedProfile, type IntegratedProfile } from "@/core/profile";
import { buildCharacterLabel } from "@/core/profile/character-label";
import { describePersonalYear } from "@/core/profile/personal-year-theme";
import { pickSharpInsights } from "@/core/profile/sharp-insights";
import type { ConcernTopic } from "@/core/topics/topic-types";
import { resolveConcernTopic, topicText } from "@/core/topics/concern-topics";
import { tierBadgeLabel } from "@/core/tiers";
import type { Locale } from "@/i18n/config";

export const BASIC_REPORT_SERVICE_YEAR = 2026;
export const BASIC_REPORT_CONTENT_VERSION = "basic-report-composer-2.0.0";

type Bilingual = Readonly<{ ko: string; en: string }>;
type BasicDomain =
  | "business"
  | "career"
  | "money"
  | "love"
  | "reconciliation"
  | "child"
  | "education"
  | "health"
  | "housing"
  | "private_fact"
  | "compatibility"
  | "growth";

type ExactCombinationContent = Readonly<{
  label: Bilingual;
  character: Bilingual;
  strengths: readonly Bilingual[];
  weaknesses: readonly Bilingual[];
  career: Bilingual;
  money: Bilingual;
  relationships: Bilingual;
  year: Bilingual;
  actions: readonly Bilingual[];
  conclusion: Bilingual;
}>;

function n(ko: string, en: string): Bilingual {
  return { ko, en };
}

function text(value: Bilingual, locale: Locale): string {
  return value[locale];
}

const NUMBER_MEANING: Readonly<Record<number, Bilingual>> = {
  1: n("독립적으로 방향을 정하고 먼저 움직이는 힘", "independent direction and first movement"),
  2: n("관계의 균형과 협력 조건을 읽는 힘", "reading balance and cooperation"),
  3: n("아이디어를 말과 표현으로 빠르게 펼치는 힘", "turning ideas into expression"),
  4: n("흩어진 일을 순서와 구조로 완성하는 힘", "turning scattered work into structure"),
  5: n("변화를 감지하고 새로운 가능성으로 이동하는 힘", "detecting change and new possibilities"),
  6: n("사람과 책임을 먼저 살피고 오래 돌보는 힘", "sustained care for people and responsibility"),
  7: n("겉보다 근거와 원인을 깊게 확인하는 힘", "checking causes and evidence deeply"),
  8: n("자원·권한·성과를 현실적으로 운영하는 힘", "operating resources and results"),
  9: n("멀리 보고 여러 사람의 의미를 연결하는 힘", "connecting people to a wider meaning"),
  11: n("미세한 신호와 가능성을 먼저 감지해 언어로 번역하는 힘", "translating subtle signals and possibility"),
  22: n("큰 비전을 실제로 작동하는 체계로 만드는 힘", "building a working system from a large vision"),
  33: n("사람의 성장을 오래 지지하고 이끄는 힘", "supporting growth over time"),
};

const EXACT_COMBINATIONS: Readonly<Record<string, ExactCombinationContent>> = {
  "11-4-6-5": {
    label: n("가능성을 구조로 만드는 설계자", "the possibility-to-system designer"),
    character: n(
      "사람과 시장의 미세한 변화를 먼저 느끼고, 아직 말로 정리되지 않은 필요를 아이디어로 잡아내는 편입니다. 생명수 11/2의 감지력에 생일수 4의 구조화가 붙어 있어, 떠오른 생각을 서비스·절차·콘텐츠처럼 반복 가능한 형태로 만드는 데 강점이 있습니다. 태도수 6은 그 결과가 실제 사람에게 도움이 되는지를 먼저 보게 하고, 출생연도수 5는 새로운 기술과 환경 변화를 빠르게 받아들이게 합니다.",
      "You notice subtle shifts in people and markets, then turn unspoken needs into ideas. Life Path 11/2 detects the signal, Birthday 4 gives it structure, Attitude 6 checks whether it helps real people, and Birth Year 5 adapts quickly to new tools and environments.",
    ),
    strengths: [
      n(
        "사람이 직접 설명하지 않아도 불편해하는 지점과 기대하는 방향을 빨리 알아차립니다. 이 감각은 고객 문제를 찾거나 콘텐츠의 반응을 읽을 때 특히 강하게 작동합니다.",
        "You often detect discomfort and expectation before people state it directly, which is useful for finding customer problems and reading content response.",
      ),
      n(
        "아이디어를 떠올리는 데서 끝나지 않고 화면, 절차, 서비스 흐름처럼 다른 사람이 사용할 수 있는 구조로 바꿀 수 있습니다. 자동화 기술·웹 서비스·플랫폼·콘텐츠·마케팅처럼 사람의 필요를 시스템으로 번역하는 일이 잘 맞습니다.",
        "You can turn an idea into a screen, process, or service flow that another person can use. Automation, web services, platforms, content, marketing, and system-based work are plausible directions.",
      ),
      n(
        "새로운 도구를 배우는 속도와 사람에게 설명하는 능력이 함께 있습니다. 기술만 아는 역할보다 기술과 사용자의 언어 사이를 연결할 때 장점이 더 분명해집니다.",
        "You combine fast tool learning with the ability to explain. The advantage becomes clearer when translating between technology and users.",
      ),
    ],
    weaknesses: [
      n(
        "능력이 부족해서 결과가 늦는 것이 아닙니다. 가능성을 여러 프로젝트로 동시에 펼치면서 한 가지를 끝까지 완성할 힘이 분산되는 것이 반복되는 원인입니다.",
        "Results are not delayed by a lack of ability. They are delayed when several possible projects divide the energy needed to finish one.",
      ),
      n(
        "시작을 못 하는 사람이 아닙니다. 하나가 완성되기 직전에 더 매력적인 새 구조를 발견해 다음 시작을 만들어내는 사람입니다.",
        "You do not struggle to start. The recurring problem is discovering a more attractive new structure just before the current one is complete.",
      ),
      n(
        "사람을 잘못 보는 것이 아니라 아직 증명되지 않은 가능성까지 실제 역량처럼 먼저 믿어주는 것이 문제입니다. 말과 의지보다 반복해서 끝낸 결과를 확인해야 동업·채용·협업의 손실이 줄어듭니다.",
        "The issue is not poor judgment of people, but treating unproven potential as demonstrated performance. Repeated completed work matters more than stated intent.",
      ),
    ],
    career: n(
      "직업과 사업에서는 자동화 기술, 웹 서비스, 플랫폼, 콘텐츠, 마케팅, 교육처럼 사람의 필요를 읽어 구조화하는 방향이 잘 맞습니다. 다만 여러 기능과 상품을 한꺼번에 넓히기보다 실제 고객 한 명이 돈을 내고 반복해서 사용할 한 가지 흐름을 먼저 완성해야 강점이 매출과 성과로 연결됩니다.",
      "Work that translates human needs into systems—automation, web services, platforms, content, marketing, or education—fits this combination. The strength turns into results only after one paying-customer use case is completed before expanding features.",
    ),
    money: n(
      "돈은 벌 기회보다 확장 시점에서 새기 쉽습니다. 가능성이 보이면 다음 기능·프로젝트·사람에게 자금을 미리 나누는 경향이 있어, 첫 흐름이 검증되기 전에 운영비가 분산될 수 있습니다. 매출이 반복되기 전에는 고정비와 외주 범위를 늘리지 않는 보존 규칙이 필요합니다.",
      "Money is more likely to leak at expansion than at earning. Funding new features, projects, or people before the first flow repeats can scatter operating cash. Keep fixed costs and outsourcing flat until revenue repeats.",
    ),
    relationships: n(
      "가까운 사람은 계속 곁에 있을 것이라고 가정한 채 새 일과 새 관계에 에너지를 먼저 줄 수 있습니다. 관계가 갑자기 멀어지는 것처럼 보여도 실제로는 설명과 약속이 미뤄진 시간이 쌓인 결과일 수 있습니다. 친밀함을 믿는 것과 상대의 자리가 실제 일정에 남아 있는지는 따로 확인해야 합니다.",
      "You may assume close people will remain while fresh work and connections receive the visible energy. Distance that looks sudden can be accumulated postponed explanation and time.",
    ),
    year: n(
      "2026년 개인년 7은 새 가능성을 더 벌이는 해라기보다 이미 가진 가능성을 검증하고 완성하는 해입니다. 기능 수나 관심도보다 실제 유료 고객, 반복 사용, 완성된 결과물로 판단해야 합니다. 올해의 성과는 많이 시작한 목록이 아니라 끝까지 작동시킨 한 가지에서 나옵니다.",
      "Personal Year 7 makes 2026 a year for validation and completion rather than adding possibilities. Judge by paying customers, repeat use, and finished output—not feature count or attention.",
    ),
    actions: [
      n("앞으로 3개월 동안 검증할 서비스나 프로젝트 하나만 정하고, 나머지는 보류 목록으로 옮기세요.", "Choose one service or project to validate for the next three months and move the rest to a hold list."),
      n("그 한 가지에서 실제로 돈을 낼 고객 한 명과 반복 사용 장면 하나를 정의하고, 이번 달 안에 끝까지 작동하게 만드세요.", "Define one paying customer and one repeat-use moment, then make that flow work end to end this month."),
      n("사람이나 기능에 비용을 추가하기 전, 이미 완료한 결과와 반복 매출이라는 두 가지 증거가 있는지 확인하세요.", "Before funding another person or feature, require two proofs: completed delivery and repeated revenue."),
    ],
    conclusion: n(
      "1994년 11월 4일생은 가능성을 빨리 발견하고 그것을 실제 구조로 만들 수 있는 사람입니다. 문제는 재능이 부족한 것이 아니라 하나가 완성되기 전에 다음 가능성으로 이동해 힘과 돈이 흩어지는 데 있습니다. 2026년에는 새로운 일을 더 추가하기보다 실제 고객이 돈을 내고 반복해서 사용할 한 가지를 완성해야 합니다. 이 사람의 성과는 더 많은 기회를 발견할 때가 아니라, 이미 발견한 기회 하나를 끝까지 현실로 만들 때 시작됩니다.",
      "This profile detects possibility quickly and can make it real. The repeated failure is not lack of talent but moving to the next possibility before the current one is complete. In 2026, finish one use case a real customer will pay for and repeat. Results begin when one discovered opportunity becomes real.",
    ),
  },
};

const BUSINESS_IDS = new Set([
  "startup", "freelance", "side_job", "business_partner", "client_acquisition",
]);
const HOUSING_IDS = new Set(["relocation", "moving_city"]);
const CHILD_IDS = new Set(["child_temperament", "children"]);
const RECONCILIATION_IDS = new Set(["reunion", "breakup", "staleness", "long_distance"]);

const DOMAIN_LABEL: Readonly<Record<BasicDomain, Bilingual>> = {
  business: n("사업·웹서비스", "Business & web service"),
  career: n("직업·진로", "Career"),
  money: n("돈·현금흐름", "Money & cash flow"),
  love: n("연애·관계", "Love & relationships"),
  reconciliation: n("재회·연락", "Reconnection"),
  child: n("자녀 성향·진로", "Child temperament & direction"),
  education: n("레슨·교육 사업", "Lesson & education business"),
  health: n("건강·생활 리듬", "Health & daily rhythm"),
  housing: n("주거·대출·이사", "Housing, loan & moving"),
  private_fact: n("확인할 수 없는 타인의 사실", "Unverifiable private facts"),
  compatibility: n("두 사람의 관계 방식", "Two-person relationship"),
  growth: n("성장·선택", "Growth & direction"),
};

const DOMAIN_YEAR_DIRECTION: Readonly<Record<BasicDomain, Bilingual>> = {
  business: n("2026년에는 기능과 상품을 더 늘리기보다 한 명의 유료 고객이 반복해서 쓰는 한 가지 흐름을 검증해야 합니다.", "In 2026, validate one repeat use by one paying customer before adding products or features."),
  career: n("2026년에는 직함보다 실제로 끝낸 결과물과 확인 가능한 업무 증거가 이동의 기준이 됩니다.", "In 2026, completed evidence matters more than title when judging a career move."),
  money: n("2026년에는 수익을 크게 예상하기보다 새는 고정비를 줄이고 한 가지 현금흐름을 확인하는 쪽이 맞습니다.", "In 2026, protect one verified cash flow and reduce leakage before projecting growth."),
  love: n("2026년에는 감정의 크기보다 말과 행동이 반복해서 일치하는지를 확인해야 관계의 방향이 선명해집니다.", "In 2026, repeated consistency between words and actions clarifies the relationship."),
  reconciliation: n("2026년에는 기다림보다 헤어진 원인이 실제 행동에서 달라졌는지를 한 번 분명히 확인하는 것이 중요합니다.", "In 2026, check once whether the cause of separation changed in behavior rather than waiting on hope."),
  child: n("2026년에는 진로를 하나로 고정하기보다 아이가 몰입하고 회복하는 조건을 기록해 다음 경험을 고르는 편이 좋습니다.", "In 2026, record the conditions for focus and recovery before fixing one career path."),
  education: n("2026년에는 수강생 수를 예상하기보다 체험 문의가 정규 등록으로 이어지는 한 가지 과정을 검증해야 합니다.", "In 2026, validate one path from trial inquiry to regular enrollment rather than predicting student count."),
  health: n("2026년에는 강한 계획보다 수면·식사·활동이 유지되는 시간과 조건 하나를 고정하는 데 집중하세요.", "In 2026, anchor one repeatable condition for sleep, meals, or activity rather than intensifying the plan."),
  housing: n("2026년에는 승인이나 가격을 낙관하기보다 계약 문서, 월 고정비, 자금 공백을 숫자로 확인해야 합니다.", "In 2026, check documents, monthly fixed costs, and the cash gap rather than assuming approval or price."),
  private_fact: n("2026년에는 추측을 늘리기보다 접근 권한, 반복 행동, 직접 확인할 수 있는 사실만으로 판단해야 합니다.", "In 2026, decide from access, repeated behavior, and verifiable facts rather than adding speculation."),
  compatibility: n("2026년에는 관계의 이름보다 책임·연락·갈등 후 회복 방식이 실제로 맞는지 확인해야 합니다.", "In 2026, examine responsibility, contact, and repair after conflict rather than the relationship label."),
  growth: n("2026년에는 새 선택지를 더 찾기보다 이미 고른 한 가지를 끝까지 검증하는 일이 우선입니다.", "In 2026, finish validating one chosen direction before seeking another option."),
};

const DOMAIN_ACTIONS: Readonly<Record<BasicDomain, readonly Bilingual[]>> = {
  business: [
    n("이번 달에 실제 고객 한 명이 돈을 낼 최소 서비스를 정하고, 결제부터 사용까지 직접 완료해 보세요.", "Define the smallest service one real customer can pay for and complete the flow end to end this month."),
    n("새 기능과 아이디어는 바로 시작하지 말고 보류 목록에 적은 뒤, 현재 흐름의 반복 사용이 확인될 때만 꺼내세요.", "Put new features on a hold list and revisit only after repeat use is proven."),
  ],
  career: [
    n("원하는 역할의 채용 공고 세 개에서 반복되는 책임과 증거를 표시하고, 현재 경력에서 대응되는 결과를 적으세요.", "Mark recurring responsibilities in three target postings and map each to evidence from your current work."),
    n("이동 전에 연봉·권한·업무 범위·통근 시간을 한 표에서 비교하고 구두 조건은 서면으로 확인하세요.", "Compare pay, authority, scope, and commute in one table and confirm verbal terms in writing."),
  ],
  money: [
    n("최근 3개월 지출을 생활비·관계비·확장비로 나누고 반복해서 새는 한 항목에 상한을 정하세요.", "Split three months of spending into living, relationship, and expansion costs, then cap one recurring leak."),
    n("새 투자나 대출을 결정하기 전에 최악의 경우 감당할 월 상환액과 현금 보유 기간을 적으세요.", "Before a new investment or loan, write the monthly downside and how long cash can cover it."),
  ],
  love: [
    n("원하는 관계 상태를 한 번 분명하게 묻고, 답보다 이후 4주의 행동이 일치하는지 기록하세요.", "Ask clearly for the relationship state once, then track whether four weeks of behavior matches the answer."),
    n("연락 빈도·약속·갈등 후 회복 중 반드시 필요한 기준 두 가지를 정하고 실제 반복 여부를 확인하세요.", "Choose two required standards across contact, commitments, or repair and check whether they repeat."),
  ],
  reconciliation: [
    n("헤어진 직접 원인 한 가지와 그것이 달라졌다는 행동 증거를 각각 한 문장으로 적으세요.", "Write the direct cause of separation and one behavioral proof that it changed."),
    n("상태를 한 번만 분명히 묻고, 거절이나 무응답이 이어지면 다른 계정이나 우회 연락은 중단하세요.", "Ask clearly once; if refusal or silence continues, stop alternate-account or indirect contact."),
  ],
  child: [
    n("아이가 스스로 오래 몰입한 활동 세 가지와 압박을 받을 때 멈춘 조건 세 가지를 기록하세요.", "Record three activities the child sustained and three conditions that stopped them under pressure."),
    n("직업 하나를 정하기보다 서로 다른 활동 두 가지를 짧게 경험하게 하고 회복 속도와 자발적 반복을 비교하세요.", "Offer two short, different experiences and compare recovery and voluntary repetition instead of fixing one job."),
  ],
  education: [
    n("체험 문의부터 정규 등록까지 단계를 적고, 가장 많이 이탈하는 한 단계만 이번 달에 고치세요.", "Map trial inquiry to regular enrollment and fix the single stage with the most drop-off this month."),
    n("수업 실력 설명보다 수강 전후 변화를 보여주는 사례 하나를 만들어 같은 고객층에 반복해서 제시하세요.", "Create one before-and-after proof and show it repeatedly to the same target group."),
  ],
  health: [
    n("2주 동안 수면·식사·활동·피로를 한 줄씩 기록해 무너지는 시간과 조건 하나를 찾으세요.", "Log sleep, meals, activity, and fatigue for two weeks and identify one recurring break point."),
    n("목표 강도를 절반으로 낮추고 기상 직후나 퇴근 직후처럼 흔들리지 않는 시간에 고정하세요.", "Halve the target and anchor it to a stable point such as waking or arriving home."),
  ],
  housing: [
    n("후보별 보증금·대출 상환·관리비·교통비를 합친 월 고정비와 잔금일의 자금 공백을 계산하세요.", "Calculate total monthly fixed cost and any closing-day cash gap for each option."),
    n("계약이나 대출 신청 전에 등기·선순위·특약·승인 조건을 해당 기관이나 전문가에게 서면으로 확인하세요.", "Before signing or applying, verify registration, prior claims, clauses, and approval conditions in writing with the proper institution or professional."),
  ],
  private_fact: [
    n("추측하려는 사실에 실제 접근 권한이 있는지와 직접 확인할 수 있는 증거가 무엇인지 먼저 구분하세요.", "Separate what you have lawful access to from what can actually be verified."),
    n("상대에게 한 번 직접 묻고, 답이 없으면 감시나 우회 확인 대신 자신의 경계와 다음 행동을 정하세요.", "Ask once directly; without an answer, set your own boundary instead of surveillance or indirect checking."),
  ],
  compatibility: [
    n("두 사람의 생년월일을 모두 준비해 별도 궁합 흐름에서 책임·소통·갈등 회복 방식을 비교하세요.", "Use both birth dates in the separate compatibility flow to compare responsibility, communication, and repair."),
    n("상징 해석과 별개로 최근 갈등 한 건에서 말과 행동, 사과와 수정 행동이 실제로 일치했는지 확인하세요.", "Independently check whether words, apology, and corrective behavior matched in one recent conflict."),
  ],
  growth: [
    n("앞으로 4주 동안 검증할 선택 하나와 성공·중단 기준을 숫자로 정하세요.", "Choose one direction to test for four weeks and define numeric success and stop criteria."),
    n("새 선택지가 생기면 바로 바꾸지 말고 48시간 뒤 현재 실험의 기록과 나란히 비교하세요.", "When a new option appears, wait 48 hours and compare it against the current experiment record."),
  ],
};

function combinationKey(profile: NumerologyProfile, birthYear: number): string {
  return [
    profile.lifePath.value,
    profile.birthday.value,
    profile.attitude.value,
    birthYear,
  ].join("-");
}

function numberDisplay(value: number): string {
  if (value === 11) return "11/2";
  if (value === 22) return "22/4";
  if (value === 33) return "33/6";
  return String(value);
}

function domainFor(topic: ConcernTopic, concern: string): BasicDomain {
  if (/궁합|두 사람|상대.*생년월일|compatib/i.test(concern)) return "compatibility";
  if (/CCTV|씨씨티비|나를 생각|다른 (여자|남자|사람)|바람.*피|누구와.*여행|언제 연락/i.test(concern)) {
    return "private_fact";
  }
  if (topic.id === "client_acquisition" || /레슨|수강생|학생 모집|과외/i.test(concern)) {
    return "education";
  }
  if (CHILD_IDS.has(topic.id)) return "child";
  if (RECONCILIATION_IDS.has(topic.id)) return "reconciliation";
  if (HOUSING_IDS.has(topic.id) || /주택|아파트|보증금|전세|월세|주거|이사|대출 승인/i.test(concern)) {
    return "housing";
  }
  if (BUSINESS_IDS.has(topic.id) || /웹 ?서비스|플랫폼|사업|창업/i.test(concern)) {
    return "business";
  }
  if (topic.focus === "health") return "health";
  if (topic.focus === "money") return "money";
  if (topic.focus === "relationships") return "love";
  if (topic.focus === "work") return "career";
  return "growth";
}

function domainInsight(integrated: IntegratedProfile, domain: BasicDomain): string {
  const id = domain === "money" || domain === "housing"
    ? "money"
    : domain === "love" || domain === "reconciliation" || domain === "private_fact" ||
        domain === "compatibility" || domain === "child"
      ? "relationships"
      : domain === "health"
        ? "stress"
        : domain === "growth"
          ? "growth"
          : "career";
  const item = integrated.domains.find((candidate) => candidate.id === id);
  return item ? `${item.personalizedInference} ${item.realityCheck}` : integrated.summary;
}

function uniqueActions(candidates: readonly string[], fallback: readonly string[]): string[] {
  const result: string[] = [];
  for (const item of [...candidates, ...fallback]) {
    const normalized = item.trim().replace(/\s+/g, " ");
    if (!normalized || result.some((existing) => existing.replace(/\s+/g, " ") === normalized)) continue;
    result.push(item.trim());
    if (result.length === 3) break;
  }
  return result;
}

function privateFactAnalysis(locale: Locale, integrated: IntegratedProfile): string {
  const relationship = domainInsight(integrated, "private_fact");
  return locale === "ko"
    ? `${relationship}\n\n상대는 마음이 복잡할수록 바로 설명하기보다 거리와 시간을 먼저 두는 방식일 가능성이 있습니다. 그래서 연락 간격이나 온라인 흔적을 확인하려는 행동이 생길 수는 있습니다. 다만 실제 CCTV 열람, 다른 사람과의 만남, 현재 마음처럼 본인만 아는 사실은 생년월일로 확인할 수 없습니다.\n\n확인할 것은 추측의 양이 아니라 반복 행동입니다. 약속을 지키는지, 설명 없이 사라지는 일이 반복되는지, 질문했을 때 책임 있게 답하는지를 보세요. 한 번 직접 묻고도 답이 없다면 감시를 늘리기보다 내가 받아들일 수 있는 관계의 기준을 정하는 것이 현실적인 대응입니다.`
    : `${relationship}\n\nWhen overwhelmed, the other person may be more likely to create distance before explaining, which can invite checking contact gaps or online traces. A birth date cannot confirm private facts such as CCTV access, another relationship, or their current thoughts.\n\nObserve repeated behavior: kept commitments, unexplained absence, and accountable answers when asked. Ask once directly; without an answer, set your own boundary rather than expanding surveillance.`;
}

function compatibilityAnalysis(locale: Locale, integrated: IntegratedProfile): string {
  const relationship = domainInsight(integrated, "compatibility");
  return locale === "ko"
    ? `${relationship}\n\n현재 입력에는 한 사람의 생년월일만 있어 이 사람의 관계 방식까지만 읽을 수 있습니다. 두 사람의 궁합을 보려면 상대 생년월일을 별도 궁합 화면에 입력해야 같은 계산 기준으로 책임, 연락, 갈등 후 회복 방식을 비교할 수 있습니다. 궁합은 관계의 운명을 판정하는 점수가 아니라 실제로 맞춰야 할 운영 조건을 찾는 분석입니다.`
    : `${relationship}\n\nOnly one birth date is present, so this report can describe that person's relationship pattern but not a two-person comparison. Use both birth dates in the separate compatibility flow to compare responsibility, contact, and repair. Compatibility is a set of operating conditions, not a fate score.`;
}

function buildCalculationBody(args: {
  locale: Locale;
  profile: NumerologyProfile;
  birthYear: number;
  personalYearPhase: string;
}): string {
  const { locale, profile, birthYear, personalYearPhase } = args;
  const meaning = (value: number) => text(NUMBER_MEANING[value] ?? NUMBER_MEANING[9], locale);
  if (locale === "ko") {
    return [
      `생명수 ${numberDisplay(profile.lifePath.value)} — ${withParticle(meaning(profile.lifePath.value), "subject")} 중심 성향입니다.`,
      `생일수 ${numberDisplay(profile.birthday.value)} — 실제 행동과 일을 마무리하는 방식에 ${withParticle(meaning(profile.birthday.value), "subject")} 나타납니다.`,
      `태도수 ${numberDisplay(profile.attitude.value)} — 처음 상황을 보고 판단할 때 ${withParticle(meaning(profile.attitude.value), "subject")} 먼저 드러납니다.`,
      `출생연도수 ${numberDisplay(birthYear)} — 익숙한 환경 밖에서 반응하는 배경 리듬에는 ${withParticle(meaning(birthYear), "subject")} 깔려 있습니다.`,
      `2026 개인년 ${numberDisplay(profile.personalYear.value)} · ${personalYearPhase} — 올해의 방향과 우선순위를 정하는 흐름입니다.`,
      "같은 생년월일에는 같은 숫자가 나오며, 가격은 숫자를 바꾸지 않고 해석의 범위와 깊이만 바꿉니다.",
    ].join("\n\n");
  }
  return [
    `Life Path ${numberDisplay(profile.lifePath.value)} — ${meaning(profile.lifePath.value)} is the central tendency.`,
    `Birthday ${numberDisplay(profile.birthday.value)} — ${meaning(profile.birthday.value)} shapes execution and completion.`,
    `Attitude ${numberDisplay(profile.attitude.value)} — ${meaning(profile.attitude.value)} is the first visible approach.`,
    `Birth Year ${numberDisplay(birthYear)} — ${meaning(birthYear)} forms the background rhythm.`,
    `2026 Personal Year ${numberDisplay(profile.personalYear.value)} · ${personalYearPhase} — the current-year priority.`,
    "The same birth date always produces the same numbers; price changes depth, not calculated facts.",
  ].join("\n\n");
}

function buildTemperamentBody(
  locale: Locale,
  integrated: IntegratedProfile,
  exact: ExactCombinationContent | undefined,
): string {
  const ids = ["thinking", "action", "relationships", "stress", "growth"] as const;
  const selected = ids
    .map((id) => integrated.domains.find((domain) => domain.id === id))
    .filter((domain): domain is IntegratedProfile["domains"][number] => Boolean(domain));
  const labels = locale === "ko"
    ? ["생각", "결정과 행동", "사람", "압박", "성과 조건"]
    : ["Thinking", "Decision and action", "People", "Under pressure", "Success condition"];
  const paragraphs = selected.map((domain, index) =>
    `${labels[index]} — ${domain.personalizedInference} ${domain.realityCheck}`);
  if (exact) {
    paragraphs.push(
      locale === "ko"
        ? "이 조합은 직감만 따를 때보다 감지한 가능성을 작은 구조로 만들고 실제 반응을 확인할 때 가장 강합니다. 반대로 여러 사람과 여러 계획을 동시에 책임지면 감각은 예민해지지만 완성 속도는 급격히 떨어집니다."
        : "This combination is strongest when sensed possibility becomes a small structure and meets real feedback. Carrying several people and plans at once keeps sensitivity high but completion low.",
    );
  }
  return paragraphs.join("\n\n");
}

export function createBasicPaidReport(
  orderId: string,
  input: PaidReadingInput,
): PaidReport {
  const locale = input.locale;
  const ko = locale === "ko";
  const concern = input.concern.trim();
  const hasQuestion = concern.length > 0;
  const profile = calculateNumerologyProfile({
    birthDate: input.birthDate,
    name: input.name,
    personalYear: BASIC_REPORT_SERVICE_YEAR,
  });
  const birthYear = calculateBirthYearNumber(input.birthDate).value;
  const integrated = createIntegratedProfile(profile, locale);
  const personalYear = describePersonalYear(profile.personalYear.value, locale);
  const defaultCharacter = buildCharacterLabel(
    profile.lifePath.value,
    profile.attitude.value,
    locale,
  );
  const exact = EXACT_COMBINATIONS[combinationKey(profile, birthYear)];
  const characterLabel = exact ? text(exact.label, locale) : defaultCharacter.label;
  const { topic } = resolveConcernTopic(concern, input.focusId);
  const domain = domainFor(topic, concern);
  const safety = assessQuestionSafety(concern);
  const context = createOnboardingReflectionContext({
    locale,
    focusId: input.focusId,
    depth: "light",
    concern: concern.slice(0, 1_000),
    aiPersonalizationConsent: false,
  });
  const sharpInsights = pickSharpInsights(profile.lifePath.value, 2, locale);
  const specificWeaknesses = exact
    ? exact.weaknesses.slice(0, 3).map((item) => text(item, locale))
    : sharpInsights;

  const directAnswer = safety.requiresRealityFirstGuidance
    ? (ko
        ? "이 질문은 먼저 해당 분야의 전문가나 공식 기관에서 확인해야 합니다. 그 확인을 대신할 수는 없지만, 지금 반복되는 판단 습관과 생활 조건을 정리하는 데에는 이 리포트를 사용할 수 있습니다."
        : "This question first belongs with the relevant professional or formal channel. This report cannot replace that check, but it can organize the repeated decision and daily pattern around it.")
    : domain === "private_fact"
      ? (ko
          ? "상대가 바로 설명하기보다 거리를 두고 상황을 살피는 흐름은 있을 수 있습니다. 다만 CCTV 열람, 다른 사람과의 만남, 현재 마음 같은 사적 사실은 생년월일로 확인할 수 없으며 반복 행동과 실제 접근 권한을 봐야 합니다."
          : "The person may create distance before explaining, but a birth date cannot confirm private facts such as CCTV access, another relationship, or current thoughts. Repeated behavior and actual access are what can be checked.")
      : domain === "compatibility"
        ? (ko
            ? "현재 입력만으로는 이 사람의 관계 방식까지는 분명히 볼 수 있습니다. 두 사람의 궁합 결론을 내려면 상대 생년월일이 필요하며, 그때도 운명 점수가 아니라 책임·소통·회복 조건을 비교하게 됩니다."
            : "This input can clearly describe one person's relationship pattern. A two-person conclusion needs the other birth date and compares operating conditions rather than fate.")
        : topicText(topic.verdict, locale);

  const numericContext = ko
    ? `이 결론은 생명수 ${numberDisplay(profile.lifePath.value)}, 생일수 ${numberDisplay(profile.birthday.value)}, 태도수 ${numberDisplay(profile.attitude.value)}, 출생연도수 ${numberDisplay(birthYear)}, ${withParticle(`2026 개인년 ${numberDisplay(profile.personalYear.value)}`, "object")} 함께 적용한 결과입니다.`
    : `This conclusion applies Life Path ${numberDisplay(profile.lifePath.value)}, Birthday ${numberDisplay(profile.birthday.value)}, Attitude ${numberDisplay(profile.attitude.value)}, Birth Year ${numberDisplay(birthYear)}, and 2026 Personal Year ${numberDisplay(profile.personalYear.value)}.`;

  const characterBody = exact
    ? `${text(exact.character, locale)}\n\n${text(exact.strengths[0], locale)}`
    : ko
      ? `${characterLabel}. ${integrated.summary} ${withParticle(integrated.strengths.join(", "), "subject")} 실제 강점으로 나타나며, 이 강점이 어떤 선택에서 반복됐는지를 확인할수록 해석이 선명해집니다.`
      : `${characterLabel}. ${integrated.summary} The repeatable strengths are ${integrated.strengths.join(", ")}; compare them with actual choices.`;

  const weaknessBody = [
    ...specificWeaknesses,
    exact ? text(exact.weaknesses[2], locale) : domainInsight(integrated, "growth"),
  ].filter((item, index, values) => values.indexOf(item) === index).join("\n\n");

  const focusedAnalysis = domain === "private_fact"
    ? privateFactAnalysis(locale, integrated)
    : domain === "compatibility"
      ? compatibilityAnalysis(locale, integrated)
      : [
          topicText(topic.framing, locale),
          domainInsight(integrated, domain),
          topicText(topic.observe, locale),
          topicText(topic.caution, locale),
        ].join("\n\n");

  const yearBody = [
    ko
      ? `2026년은 개인년 ${numberDisplay(profile.personalYear.value)}의 ${personalYear.phase} 흐름입니다. ${personalYear.timing}`
      : `2026 is Personal Year ${numberDisplay(profile.personalYear.value)}, ${personalYear.phase}. ${personalYear.timing}`,
    text(DOMAIN_YEAR_DIRECTION[domain], locale),
    exact ? text(exact.year, locale) : "",
  ].filter(Boolean).join("\n\n");

  const conclusionDirection = domain === "private_fact" || domain === "compatibility" ||
      safety.requiresRealityFirstGuidance
    ? text(DOMAIN_ACTIONS[domain][0], locale)
    : topicText(topic.action, locale);
  const questionConclusion = ko
    ? `${characterLabel}라는 해석이 이번 질문의 중심입니다. ${specificWeaknesses[0]} 지금 필요한 방향은 ${conclusionDirection} 2026년에 필요한 것은 가능성을 더 찾는 일이 아니라, 확인한 한 가지를 끝까지 작동시키는 일입니다.`
    : `${characterLabel} is the center of this reading. ${specificWeaknesses[0]} The practical direction is: ${conclusionDirection} In 2026, the work is not to find more possibilities but to make one verified direction work.`;

  const sections = hasQuestion
    ? [
        {
          title: ko ? "질문에 대한 직접 결론" : "Direct answer",
          body: `${directAnswer}\n\n${numericContext}`,
        },
        {
          title: ko ? "핵심 숫자" : "Core numbers",
          body: buildCalculationBody({
            locale,
            profile,
            birthYear,
            personalYearPhase: personalYear.phase,
          }),
        },
        {
          title: ko ? "캐릭터 한 문장" : "Character in one line",
          body: `${characterLabel}\n\n${characterBody}`,
        },
        {
          title: ko ? "핵심 성향" : "Core temperament",
          body: buildTemperamentBody(locale, integrated, exact),
        },
        {
          title: ko ? "반복되는 약점" : "Repeated weakness",
          body: weaknessBody,
        },
        {
          title: ko
            ? `질문 분야 분석 · ${text(DOMAIN_LABEL[domain], locale)}`
            : `Focused analysis · ${text(DOMAIN_LABEL[domain], locale)}`,
          body: focusedAnalysis,
        },
        {
          title: ko ? "2026년 흐름" : "2026 direction",
          body: yearBody,
        },
        {
          title: ko ? "최종 결론" : "Final conclusion",
          body: questionConclusion,
        },
      ]
    : [
        {
          title: ko ? "핵심 숫자" : "Core numbers",
          body: buildCalculationBody({
            locale,
            profile,
            birthYear,
            personalYearPhase: personalYear.phase,
          }),
        },
        {
          title: ko ? "캐릭터 한 문장" : "Character in one line",
          body: `${characterLabel}\n\n${characterBody}`,
        },
        {
          title: ko ? "핵심 성향" : "Core temperament",
          body: buildTemperamentBody(locale, integrated, exact),
        },
        {
          title: ko ? "주요 강점" : "Key strengths",
          body: exact
            ? exact.strengths.map((item) => text(item, locale)).join("\n\n")
            : integrated.strengths.map((item) => `${item}.`).join("\n\n"),
        },
        {
          title: ko ? "반복되는 약점" : "Repeated weakness",
          body: weaknessBody,
        },
        {
          title: ko ? "직업·사업 방향" : "Work & business direction",
          body: exact
            ? text(exact.career, locale)
            : `${domainInsight(integrated, "career")}\n\n${integrated.careerRecommendations.slice(0, 2).map((item) => `${item.title} — ${item.fitReason}`).join("\n")}`,
        },
        {
          title: ko ? "돈의 흐름" : "Money flow",
          body: exact ? text(exact.money, locale) : domainInsight(integrated, "money"),
        },
        {
          title: ko ? "관계 성향" : "Relationship pattern",
          body: exact ? text(exact.relationships, locale) : domainInsight(integrated, "love"),
        },
        {
          title: ko ? "2026년 흐름" : "2026 direction",
          body: [
            ko
              ? `2026년은 개인년 ${numberDisplay(profile.personalYear.value)}의 ${personalYear.phase} 흐름입니다. ${personalYear.timing}`
              : `2026 is Personal Year ${numberDisplay(profile.personalYear.value)}, ${personalYear.phase}. ${personalYear.timing}`,
            exact ? text(exact.year, locale) : text(DOMAIN_YEAR_DIRECTION.growth, locale),
          ].join("\n\n"),
        },
        {
          title: ko ? "최종 결론" : "Final conclusion",
          body: exact
            ? text(exact.conclusion, locale)
            : (ko
                ? `${characterLabel}라는 중심 성향은 분명한 강점입니다. 반복되는 실패 원인은 ${specificWeaknesses[0]} 올해는 새 방향을 더 찾기보다 이미 고른 한 가지를 검증하고 완성하세요. 가능성을 현실로 만드는 마지막 단계는 발견이 아니라 완료입니다.`
                : `${characterLabel} is a clear strength. The repeated failure is: ${specificWeaknesses[0]} This year, validate and complete one chosen direction. Possibility becomes real at completion, not discovery.`),
        },
      ];

  const exactActions = exact?.actions.map((item) => text(item, locale)) ?? [];
  const domainActions = DOMAIN_ACTIONS[domain].map((item) => text(item, locale));
  const actions = !hasQuestion && exact
    ? exactActions
    : uniqueActions(
        [
          ...(safety.requiresRealityFirstGuidance ? [] : [topicText(topic.action, locale)]),
          ...domainActions,
        ],
        [context.practicalAction, ...integrated.practicalActions],
      );

  return {
    version: 1,
    orderId,
    productCode: input.productCode,
    locale,
    title: ko ? "나의 핵심 리딩" : "Core reading",
    customerName: input.name || null,
    createdAt: new Date().toISOString(),
    concern,
    summary: hasQuestion
      ? (ko ? "고객 질문에 답하고 핵심 성향과 2026년 방향을 연결했습니다." : "Your question, core temperament, and 2026 direction.")
      : (ko ? "생년월일만으로 구성한 핵심 성향과 2026년 방향입니다." : "Core temperament and 2026 direction from the birth date."),
    sections,
    actions,
    cautions: [
      ...(safety.requiresRealityFirstGuidance ? [] : [topicText(topic.caution, locale)]),
      context.realityCheck,
      ...integrated.risks.slice(0, 2),
    ],
    disclaimer: ko
      ? "이 리포트는 자기이해와 선택 정리를 위한 참고 자료이며 미래, 건강, 투자 수익 또는 타인의 사적 사실을 보장하지 않습니다."
      : "This report supports reflection and decision-making. It does not guarantee the future, health outcomes, investment returns, or another person's private facts.",
    tierLabel: tierBadgeLabel("plus_30d", locale),
    characterLabel,
    sharpInsights,
    contentVersion: BASIC_REPORT_CONTENT_VERSION,
    sectionPlan: "basic-19000-v2",
    calculationBasis: {
      birthDate: input.birthDate,
      serviceYear: BASIC_REPORT_SERVICE_YEAR,
      lifePath: profile.lifePath.value,
      birthday: profile.birthday.value,
      attitude: profile.attitude.value,
      birthYear,
      personalYear: profile.personalYear.value,
    },
  };
}
