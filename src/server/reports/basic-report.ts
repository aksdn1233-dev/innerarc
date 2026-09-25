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
  33: n("사람의 성장을 오래 곁에서 돕고 이끄는 힘", "guiding people's growth for a long time"),
};

const EXACT_COMBINATIONS: Readonly<Record<string, ExactCombinationContent>> = {
  "11-4-6-5": {
    label: n("가능성을 구조로 만드는 설계자", "the possibility-to-system designer"),
    character: n(
      "사람과 시장에서 일어나는 작은 변화를 남들보다 먼저 느끼고, 아직 말로 정리되지 않은 필요를 아이디어로 잡아냅니다. 생명수 11/2가 이런 신호를 먼저 알아채게 해주고, 생일수 4는 그 아이디어를 서비스나 순서, 콘텐츠처럼 여러 번 쓸 수 있는 구조로 바꾸는 힘을 줍니다. 태도수 6은 그 결과가 진짜 사람에게 도움이 되는지를 먼저 살피게 하고, 출생연도수 5는 새로운 기술이나 환경 변화를 빠르게 받아들이게 합니다.",
      "You notice small shifts in people and markets before others do, and turn unspoken needs into ideas. Life Path 11/2 helps you sense the signal first, Birthday 4 turns the idea into something reusable, like a service, a process, or content. Attitude 6 makes you check whether it really helps people, and Birth Year 5 helps you pick up new tools and changes fast.",
    ),
    strengths: [
      n(
        "사람이 말로 설명하지 않아도 불편해하는 지점과 바라는 방향을 빨리 알아차립니다. 이 감각은 고객이 겪는 문제를 찾거나 콘텐츠 반응을 읽을 때 특히 잘 통합니다.",
        "You often notice discomfort and hopes before people say them out loud, which helps you find customer problems and read how content lands.",
      ),
      n(
        "아이디어를 떠올리는 데서 끝내지 않고, 화면이나 순서, 서비스 흐름처럼 다른 사람이 실제로 쓸 수 있는 형태로 바꿀 수 있습니다. 자동화 기술, 웹 서비스, 플랫폼, 콘텐츠, 마케팅처럼 사람이 필요로 하는 걸 시스템으로 옮기는 일이 잘 맞습니다.",
        "You don't stop at having an idea — you turn it into a screen, a process, or a service flow other people can use. Work that turns human needs into systems, like automation, web services, platforms, content, or marketing, suits you well.",
      ),
      n(
        "새 도구를 배우는 속도와 그걸 다른 사람에게 쉽게 설명하는 능력을 함께 갖고 있습니다. 기술만 아는 사람보다, 기술과 그걸 쓰는 사람 사이를 이어줄 때 이 장점이 더 잘 드러납니다.",
        "You learn new tools fast and can explain them just as fast. The advantage shows most clearly when you connect technology and the people who use it.",
      ),
    ],
    weaknesses: [
      n(
        "능력이 모자라서 결과가 늦는 게 아닙니다. 가능성을 여러 프로젝트로 동시에 벌리다 보니, 한 가지를 끝까지 마칠 힘이 나뉘어 버리는 게 자꾸 반복되는 진짜 이유입니다.",
        "Results are not late because ability is lacking. They are late because chasing several possible projects at once splits the energy needed to finish one.",
      ),
      n(
        "시작을 못 하는 사람이 아닙니다. 하나가 완성되기 직전에 더 끌리는 새 아이디어를 발견해서 또 새로 시작해버리는 사람입니다.",
        "Starting is not the problem. The problem is finding a more exciting new idea right before the current one is done, and starting over again.",
      ),
      n(
        "사람을 잘못 보는 게 아니라, 아직 증명되지 않은 가능성을 실제 역량처럼 먼저 믿어버리는 게 문제입니다. 말이나 의지보다 실제로 반복해서 끝낸 결과를 봐야 동업, 채용, 협업에서 손해를 줄일 수 있습니다.",
        "The issue is not poor judgment of people. The issue is treating unproven potential as if it were already demonstrated skill. What matters is work finished more than once, not words or intent.",
      ),
    ],
    career: n(
      "일이나 사업에서는 자동화 기술, 웹 서비스, 플랫폼, 콘텐츠, 마케팅, 교육처럼 사람이 필요로 하는 걸 읽어서 정리하는 방향이 잘 맞습니다. 다만 기능과 상품을 한꺼번에 늘리기보다, 진짜 고객 한 명이 돈을 내고 계속 쓰는 흐름 하나를 먼저 완성해야 이 강점이 매출과 성과로 이어집니다.",
      "Work that turns human needs into systems — automation, web services, platforms, content, marketing, or education — fits this combination well. But the strength only turns into real results once one paying customer's use case is finished, before adding more features.",
    ),
    money: n(
      "돈은 버는 순간보다 확장하는 순간에 새기 쉽습니다. 가능성이 보이면 다음 기능이나 프로젝트, 사람에게 미리 자금을 나눠주는 버릇이 있어서, 첫 흐름이 검증되기도 전에 쓰는 돈이 흩어질 수 있습니다. 매출이 반복해서 들어오기 전까지는 매달 나가는 돈과 외주 범위를 늘리지 않는 규칙이 필요합니다.",
      "Money is more likely to leak when you expand than when you earn. You tend to fund the next feature, project, or person before the first flow is even proven, which scatters your spending. Keep fixed costs and outsourcing flat until revenue actually repeats.",
    ),
    relationships: n(
      "가까운 사람은 늘 곁에 있을 거라고 믿고, 새로운 일이나 새로운 관계에 에너지를 먼저 쓰기 쉽습니다. 관계가 갑자기 멀어진 것처럼 보여도 사실은 설명과 약속이 자꾸 미뤄지면서 쌓인 결과일 수 있습니다. 마음으로 믿는 것과, 실제 일정에 그 사람의 자리가 남아 있는지는 따로 확인해야 합니다.",
      "You tend to assume close people will just stay while your energy goes to new work and new connections. Distance that looks sudden is often the result of explanations and promises being put off again and again. Trusting someone is different from checking whether they still have a real place in your schedule.",
    ),
    year: n(
      "2026년 개인년 7은 새로운 가능성을 더 벌이는 해가 아니라, 이미 가진 가능성을 검증하고 완성하는 해입니다. 기능 개수나 관심도보다 실제 유료 고객, 반복 사용, 완성된 결과물로 판단해야 합니다. 올해의 성과는 많이 시작한 목록이 아니라 끝까지 돌아가게 만든 한 가지에서 나옵니다.",
      "Personal Year 7 makes 2026 a year to test and finish what you already have, not to add more possibilities. Judge yourself by paying customers, repeat use, and finished work — not by how many features you have or how much attention you get.",
    ),
    actions: [
      n("앞으로 3개월 동안 시험해 볼 서비스나 프로젝트 하나만 고르고, 나머지는 나중에 할 목록으로 옮겨두세요.", "Choose one service or project to test for the next three months, and move the rest to a later list."),
      n("그 한 가지에서 돈을 낼 고객 한 명과, 그 사람이 다시 쓰는 장면 하나를 정하고, 이번 달 안에 끝까지 돌아가게 만드세요.", "Define one paying customer and one moment they come back to use it again, then make that whole flow work this month."),
      n("사람이나 기능에 돈을 더 쓰기 전에, 이미 끝낸 결과와 반복되는 매출이라는 두 가지 증거부터 확인하세요.", "Before spending more on people or features, check for two things first: work you already finished, and revenue that repeats."),
    ],
    conclusion: n(
      "1994년 11월 4일생은 가능성을 빨리 알아채고, 그걸 진짜 구조로 만들 수 있는 사람입니다. 문제는 재능이 모자라서가 아니라, 하나가 끝나기 전에 다음 가능성으로 옮겨가면서 힘과 돈이 흩어진다는 데 있습니다. 2026년에는 새 일을 더 벌이기보다, 진짜 고객이 돈을 내고 계속 쓰는 한 가지를 완성해야 합니다. 이 사람의 성과는 더 많은 기회를 발견할 때가 아니라, 이미 발견한 기회 하나를 끝까지 현실로 만들 때 시작됩니다.",
      "This person spots possibility fast and can turn it into something real. The repeated problem is not a lack of talent — it's moving to the next possibility before the current one is done, which scatters both energy and money. In 2026, finish one thing a real customer keeps paying for, instead of starting new work. Results begin not when you find more chances, but when you turn one chance you already found into something real, all the way through.",
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
  business: n("2026년에는 기능과 상품을 더 늘리기보다, 돈을 낸 고객 한 명이 계속 쓰는 흐름 하나를 먼저 확인해야 합니다.", "In 2026, check that one paying customer keeps using one thing before adding more products or features."),
  career: n("2026년에는 직함보다, 실제로 끝낸 결과물과 눈으로 확인할 수 있는 증거가 이직의 기준이 됩니다.", "In 2026, finished work and proof you can show matter more than a job title when deciding to move."),
  money: n("2026년에는 수익을 크게 기대하기보다, 새어 나가는 고정 지출을 줄이고 돈이 들어오는 흐름 하나를 확인하는 쪽이 맞습니다.", "In 2026, reduce leaking fixed costs and confirm one real money flow before expecting big growth."),
  love: n("2026년에는 마음의 크기보다, 말과 행동이 계속 같은지를 확인해야 관계의 방향이 분명해집니다.", "In 2026, check whether words and actions keep matching. That makes the relationship's direction clearer than the size of feelings."),
  reconciliation: n("2026년에는 그냥 기다리기보다, 헤어진 이유가 실제 행동에서 정말 달라졌는지 한 번 분명히 확인하는 게 중요합니다.", "In 2026, check once, clearly, whether the reason you broke up actually changed in behavior, instead of just waiting."),
  child: n("2026년에는 진로 하나를 미리 정하기보다, 아이가 몰입하고 다시 힘을 내는 상황을 기록해서 다음 경험을 고르는 게 좋습니다.", "In 2026, note when the child focuses and bounces back, and use that to choose the next experience, rather than fixing one career path now."),
  education: n("2026년에는 학생 수를 예상하기보다, 체험 문의가 정식 등록으로 이어지는 과정 하나를 확실히 만들어야 합니다.", "In 2026, build one clear path from trial inquiry to full enrollment, rather than guessing student numbers."),
  health: n("2026년에는 무리한 계획보다, 잠·식사·활동을 계속 지킬 수 있는 시간과 조건 하나를 고정하는 데 집중하세요.", "In 2026, focus on locking in one time and condition for sleep, meals, or activity that you can keep, instead of a tougher plan."),
  housing: n("2026년에는 승인이나 가격을 낙관하기보다, 계약서, 매달 나가는 돈, 부족한 자금을 숫자로 직접 확인해야 합니다.", "In 2026, check the contract, monthly costs, and any cash shortfall in real numbers, instead of assuming approval or price will work out."),
  private_fact: n("2026년에는 추측을 늘리기보다, 실제로 확인할 권한이 있는지와 반복되는 행동, 직접 확인 가능한 사실만으로 판단해야 합니다.", "In 2026, decide only from what you can actually check, repeated behavior, and verifiable facts — not from guessing."),
  compatibility: n("2026년에는 관계의 이름표보다, 책임지는 방식과 연락, 다툰 뒤 화해하는 방식이 실제로 잘 맞는지 확인해야 합니다.", "In 2026, check whether responsibility, contact, and making up after conflict actually work well, rather than what you call the relationship."),
  growth: n("2026년에는 새로운 선택지를 더 찾기보다, 이미 고른 한 가지를 끝까지 확인해 보는 게 우선입니다.", "In 2026, finish testing the one direction you already chose before looking for another option."),
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
    n("최근 3개월 동안 쓴 돈을 생활비, 관계비, 확장비로 나누고, 자꾸 새는 항목 하나에 쓸 수 있는 최대 금액을 정하세요.", "Split three months of spending into living, relationship, and expansion costs, then set a spending cap on the one that keeps leaking."),
    n("새로운 투자나 대출을 결정하기 전에, 가장 나쁜 경우에 매달 갚을 수 있는 돈과 그 돈으로 버틸 수 있는 기간을 적어보세요.", "Before a new investment or loan, write down the worst-case monthly payment and how long your cash can cover it."),
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
    n("후보지마다 보증금, 대출 갚을 돈, 관리비, 교통비를 다 더한 매달 고정 지출과, 잔금 치르는 날 모자란 돈이 얼마인지 계산하세요.", "For each option, add up the deposit, loan payment, fees, and transport cost, and work out any cash shortfall on the closing day."),
    n("계약하거나 대출을 신청하기 전에, 등기 내용, 먼저 갚아야 하는 빚, 특별 조건, 승인 조건을 담당 기관이나 전문가에게 서면으로 확인하세요.", "Before signing or applying, get written confirmation from the right institution or professional on the registration, any prior debts, special clauses, and approval conditions."),
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
    ? `${relationship}\n\n상대는 마음이 복잡할수록 바로 설명하기보다, 거리와 시간을 먼저 두는 사람일 수 있습니다. 그래서 연락이 뜸해지거나 온라인 흔적을 확인하고 싶은 마음이 생길 수 있습니다. 다만 실제로 CCTV를 봤는지, 다른 사람을 만났는지, 지금 무슨 생각을 하는지처럼 그 사람만 아는 사실은 생년월일로 확인할 수 없습니다.\n\n확인해야 할 것은 추측의 양이 아니라 반복되는 행동입니다. 약속을 지키는지, 설명도 없이 자꾸 사라지는지, 물어봤을 때 제대로 답하는지를 보세요. 한 번 직접 물어보고도 답이 없다면, 감시를 늘리기보다 내가 받아들일 수 있는 관계의 선을 정하는 게 현실적인 방법입니다.`
    : `${relationship}\n\nWhen overwhelmed, the other person may be more likely to create distance before explaining, which can invite checking contact gaps or online traces. A birth date cannot confirm private facts such as CCTV access, another relationship, or their current thoughts.\n\nObserve repeated behavior: kept commitments, unexplained absence, and accountable answers when asked. Ask once directly; without an answer, set your own boundary rather than expanding surveillance.`;
}

function compatibilityAnalysis(locale: Locale, integrated: IntegratedProfile): string {
  const relationship = domainInsight(integrated, "compatibility");
  return locale === "ko"
    ? `${relationship}\n\n지금은 한 사람의 생년월일만 있어서, 이 사람이 관계에서 어떤 방식으로 행동하는지까지만 읽을 수 있습니다. 두 사람의 궁합을 보려면 상대의 생년월일도 별도 궁합 화면에 입력해야, 같은 기준으로 책임지는 방식, 연락, 다툰 뒤 화해하는 방식을 비교할 수 있습니다. 궁합은 관계의 운명을 점수로 매기는 게 아니라, 실제로 서로 맞춰야 할 부분을 찾는 분석입니다.`
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
      `생명수 ${numberDisplay(profile.lifePath.value)} — ${withParticle(meaning(profile.lifePath.value), "subject")} 가장 중심에 있는 성향입니다.`,
      `생일수 ${numberDisplay(profile.birthday.value)} — 실제로 행동하고 일을 마무리하는 방식에 ${withParticle(meaning(profile.birthday.value), "subject")} 그대로 나타납니다.`,
      `태도수 ${numberDisplay(profile.attitude.value)} — 처음 상황을 보고 판단할 때 ${withParticle(meaning(profile.attitude.value), "subject")} 제일 먼저 드러납니다.`,
      `출생연도수 ${numberDisplay(birthYear)} — 낯선 환경에 놓였을 때 몸에 배어 나오는 반응에는 ${withParticle(meaning(birthYear), "subject")} 깔려 있습니다.`,
      `2026 개인년 ${numberDisplay(profile.personalYear.value)} · ${personalYearPhase} — 올해 방향과 우선순위를 정하는 흐름입니다.`,
      "같은 생년월일이면 언제나 같은 숫자가 나옵니다. 가격이 달라져도 이 숫자는 바뀌지 않고, 얼마나 자세히 풀어 설명하는지만 달라집니다.",
    ].join("\n\n");
  }
  return [
    `Life Path ${numberDisplay(profile.lifePath.value)} — ${meaning(profile.lifePath.value)} sits at the center of who you are.`,
    `Birthday ${numberDisplay(profile.birthday.value)} — ${meaning(profile.birthday.value)} shows up in how you act and finish things.`,
    `Attitude ${numberDisplay(profile.attitude.value)} — ${meaning(profile.attitude.value)} is what people see first.`,
    `Birth Year ${numberDisplay(birthYear)} — ${meaning(birthYear)} is the rhythm running underneath, in unfamiliar situations.`,
    `2026 Personal Year ${numberDisplay(profile.personalYear.value)} · ${personalYearPhase} — this sets your direction and priority for the year.`,
    "The same birth date always gives the same numbers. A higher price does not change the numbers, only how much detail you get.",
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
    ? ["생각하는 방식", "결정하고 움직이는 방식", "사람을 대하는 방식", "힘들 때 반응", "잘 풀리는 조건"]
    : ["How you think", "How you decide and act", "How you treat people", "Under pressure", "What helps you succeed"];
  const paragraphs = selected.map((domain, index) =>
    `${labels[index]} — ${domain.personalizedInference} ${domain.realityCheck}`);
  if (exact) {
    paragraphs.push(
      locale === "ko"
        ? "이 조합은 그냥 감으로 밀어붙일 때보다, 알아챈 가능성을 작게 만들어보고 진짜 반응을 확인할 때 가장 힘을 발휘합니다. 반대로 여러 사람과 여러 계획을 한꺼번에 떠맡으면, 감은 예민해지지만 끝까지 해내는 속도는 크게 떨어집니다."
        : "This combination works best when you turn a sensed possibility into something small and check the real reaction. Carrying several people and plans at once keeps your instincts sharp but slows down how fast you finish things.",
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
        ? "이 질문은 먼저 그 분야의 전문가나 공식 기관에 확인해야 하는 문제입니다. 이 리포트가 그 확인을 대신할 수는 없지만, 지금 자꾸 반복되는 판단 습관과 생활 조건을 정리하는 데는 쓸 수 있습니다."
        : "This question needs to be checked with the right professional or official source first. This report can't replace that check, but it can help you sort out the decision habits and daily conditions around it.")
    : domain === "private_fact"
      ? (ko
          ? "상대는 바로 설명하기보다, 거리를 두고 상황을 지켜보는 편일 수 있습니다. 다만 CCTV를 봤는지, 다른 사람을 만났는지, 지금 무슨 마음인지처럼 그 사람만 아는 사실은 생년월일로 확인할 수 없습니다. 대신 반복 행동과 실제로 확인 가능한 접근 권한을 봐야 합니다."
          : "The person may watch quietly and keep distance rather than explain right away. But private facts, such as CCTV access, another relationship, or their current feelings, cannot be confirmed from a birth date. What you can check is repeated behavior and real, verifiable access.")
      : domain === "compatibility"
        ? (ko
            ? "지금 입력한 정보만으로는 이 사람이 관계에서 어떻게 행동하는지까지는 분명히 볼 수 있습니다. 두 사람의 궁합을 결론 내리려면 상대 생년월일이 필요하고, 그때도 운명 점수가 아니라 책임지는 방식, 소통, 화해하는 방식을 비교하게 됩니다."
            : "What you entered can clearly describe how this one person acts in relationships. A two-person conclusion needs the other person's birth date, and even then it compares responsibility, communication, and repair rather than fate.")
        : topicText(topic.verdict, locale);

  const numericContext = ko
    ? `이 결론은 생명수 ${numberDisplay(profile.lifePath.value)}, 생일수 ${numberDisplay(profile.birthday.value)}, 태도수 ${numberDisplay(profile.attitude.value)}, 출생연도수 ${numberDisplay(birthYear)}, ${withParticle(`2026 개인년 ${numberDisplay(profile.personalYear.value)}`, "object")} 모두 합쳐서 나온 것입니다.`
    : `This comes from putting Life Path ${numberDisplay(profile.lifePath.value)}, Birthday ${numberDisplay(profile.birthday.value)}, Attitude ${numberDisplay(profile.attitude.value)}, Birth Year ${numberDisplay(birthYear)}, and 2026 Personal Year ${numberDisplay(profile.personalYear.value)} together.`;

  const characterBody = exact
    ? `${text(exact.character, locale)}\n\n${text(exact.strengths[0], locale)}`
    : ko
      ? `${characterLabel}. ${integrated.summary} ${withParticle(integrated.strengths.join(", "), "subject")} 진짜 강점으로 나타납니다. 이 강점이 어떤 선택에서 자꾸 반복됐는지 확인할수록, 이 해석은 더 또렷해집니다.`
      : `${characterLabel}. ${integrated.summary} These strengths keep showing up: ${integrated.strengths.join(", ")}. The more you check where they repeated in real choices, the clearer this reading gets.`;

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
    ? `${characterLabel} — 이 해석이 이번 질문의 중심입니다. ${specificWeaknesses[0]} 지금 필요한 건 ${conclusionDirection} 2026년에 필요한 건 가능성을 더 찾는 게 아니라, 이미 확인한 한 가지를 끝까지 돌아가게 만드는 일입니다.`
    : `${characterLabel} — this reading centers on that. ${specificWeaknesses[0]} What you need now: ${conclusionDirection} In 2026, the work is not finding more possibilities, but making the one thing you already checked work all the way through.`;

  const sections = hasQuestion
    ? [
        {
          title: ko ? "질문에 대한 직접 결론" : "Direct answer",
          keySentence: ko ? "질문에 대한 답부터 먼저 말합니다." : "Here is the direct answer to your question, first.",
          body: `${directAnswer}\n\n${numericContext}`,
        },
        {
          title: ko ? "핵심 숫자" : "Core numbers",
          keySentence: ko
            ? "이 리딩은 생년월일에서 나온 다섯 개 숫자에서 시작합니다."
            : "This reading starts from five numbers taken from your birth date.",
          body: buildCalculationBody({
            locale,
            profile,
            birthYear,
            personalYearPhase: personalYear.phase,
          }),
        },
        {
          title: ko ? "캐릭터 한 문장" : "Character in one line",
          keySentence: ko
            ? `"${characterLabel}" — 이 한 줄이 이 사람을 요약합니다.`
            : `"${characterLabel}" sums up who this person is in one line.`,
          body: `${characterLabel}\n\n${characterBody}`,
        },
        {
          title: ko ? "핵심 성향" : "Core temperament",
          keySentence: ko
            ? "생각, 행동, 관계, 압박, 성공 조건까지 다섯 가지 모습을 한 번에 보여줍니다."
            : "This shows five sides at once: thinking, acting, relating, handling pressure, and what helps you succeed.",
          body: buildTemperamentBody(locale, integrated, exact),
        },
        {
          title: ko ? "반복되는 약점" : "Repeated weakness",
          keySentence: ko
            ? "이 사람에게서 자꾸 반복되는 진짜 문제 하나를 짚어냅니다."
            : "This points to the one problem that keeps repeating for this person.",
          body: weaknessBody,
        },
        {
          title: ko
            ? `질문 분야 분석 · ${text(DOMAIN_LABEL[domain], locale)}`
            : `Focused analysis · ${text(DOMAIN_LABEL[domain], locale)}`,
          keySentence: ko
            ? "지금 물어본 문제에만 집중해서 답합니다."
            : "This section focuses only on the question you actually asked.",
          body: focusedAnalysis,
        },
        {
          title: ko ? "2026년 흐름" : "2026 direction",
          keySentence: ko
            ? "2026년에 뭘 조심하고 뭘 밀어붙일지 알려줍니다."
            : "This tells you what to watch for and what to push forward in 2026.",
          body: yearBody,
        },
        {
          title: ko ? "최종 결론" : "Final conclusion",
          keySentence: ko
            ? "지금 당장 무엇을 해야 하는지 한 문장으로 정리합니다."
            : "This sums up, in one line, what to actually do next.",
          body: questionConclusion,
        },
      ]
    : [
        {
          title: ko ? "핵심 숫자" : "Core numbers",
          keySentence: ko
            ? "이 리딩은 생년월일에서 나온 다섯 개 숫자에서 시작합니다."
            : "This reading starts from five numbers taken from your birth date.",
          body: buildCalculationBody({
            locale,
            profile,
            birthYear,
            personalYearPhase: personalYear.phase,
          }),
        },
        {
          title: ko ? "캐릭터 한 문장" : "Character in one line",
          keySentence: ko
            ? `"${characterLabel}" — 이 한 줄이 이 사람을 요약합니다.`
            : `"${characterLabel}" sums up who this person is in one line.`,
          body: `${characterLabel}\n\n${characterBody}`,
        },
        {
          title: ko ? "핵심 성향" : "Core temperament",
          keySentence: ko
            ? "생각, 행동, 관계, 압박, 성공 조건까지 다섯 가지 모습을 한 번에 보여줍니다."
            : "This shows five sides at once: thinking, acting, relating, handling pressure, and what helps you succeed.",
          body: buildTemperamentBody(locale, integrated, exact),
        },
        {
          title: ko ? "주요 강점" : "Key strengths",
          keySentence: ko
            ? "이 사람이 가장 잘하는 것들을 한자리에 모아 보여줍니다."
            : "This gathers the things this person is genuinely good at, in one place.",
          body: exact
            ? exact.strengths.map((item) => text(item, locale)).join("\n\n")
            : integrated.strengths.map((item) => `${item}.`).join("\n\n"),
        },
        {
          title: ko ? "반복되는 약점" : "Repeated weakness",
          keySentence: ko
            ? "이 사람에게서 자꾸 반복되는 진짜 문제 하나를 짚어냅니다."
            : "This points to the one problem that keeps repeating for this person.",
          body: weaknessBody,
        },
        {
          title: ko ? "직업·사업 방향" : "Work & business direction",
          keySentence: ko
            ? "어떤 일, 어떤 사업이 이 사람과 잘 맞는지 짚어줍니다."
            : "This points to the kind of work or business that fits this person.",
          body: exact
            ? text(exact.career, locale)
            : `${domainInsight(integrated, "career")}\n\n${integrated.careerRecommendations.slice(0, 2).map((item) => `${item.title} — ${item.fitReason}`).join("\n")}`,
        },
        {
          title: ko ? "돈의 흐름" : "Money flow",
          keySentence: ko
            ? "돈이 어디서 새고 어디서 모이는지 보여줍니다."
            : "This shows where money tends to leak and where it tends to gather.",
          body: exact ? text(exact.money, locale) : domainInsight(integrated, "money"),
        },
        {
          title: ko ? "관계 성향" : "Relationship pattern",
          keySentence: ko
            ? "관계에서 이 사람이 자주 반복하는 습관을 보여줍니다."
            : "This shows the habit this person keeps repeating in relationships.",
          body: exact ? text(exact.relationships, locale) : domainInsight(integrated, "love"),
        },
        {
          title: ko ? "2026년 흐름" : "2026 direction",
          keySentence: ko
            ? "2026년에 뭘 조심하고 뭘 밀어붙일지 알려줍니다."
            : "This tells you what to watch for and what to push forward in 2026.",
          body: [
            ko
              ? `2026년은 개인년 ${numberDisplay(profile.personalYear.value)}의 ${personalYear.phase} 흐름입니다. ${personalYear.timing}`
              : `2026 is Personal Year ${numberDisplay(profile.personalYear.value)}, ${personalYear.phase}. ${personalYear.timing}`,
            exact ? text(exact.year, locale) : text(DOMAIN_YEAR_DIRECTION.growth, locale),
          ].join("\n\n"),
        },
        {
          title: ko ? "최종 결론" : "Final conclusion",
          keySentence: ko
            ? "올해 진짜 해야 할 일 한 가지로 마무리합니다."
            : "This closes with the one real thing to do this year.",
          body: exact
            ? text(exact.conclusion, locale)
            : (ko
                ? `${characterLabel} — 이건 분명한 강점입니다. 자꾸 반복되는 실패 원인은 ${specificWeaknesses[0]} 올해는 새 방향을 더 찾기보다, 이미 고른 한 가지를 확인하고 끝까지 완성하세요. 가능성을 현실로 만드는 마지막 한 걸음은 발견이 아니라 완료입니다.`
                : `${characterLabel} is a clear strength. The repeated failure is: ${specificWeaknesses[0]} This year, test and finish the one direction you already chose, instead of looking for another. Possibility becomes real when you finish, not when you discover.`),
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
      ? (ko ? "질문에 답하면서 핵심 성향과 2026년 방향을 이어서 보여줍니다." : "Your question, your core temperament, and your 2026 direction, together.")
      : (ko ? "생년월일만으로 알 수 있는 핵심 성향과 2026년 방향입니다." : "Core temperament and 2026 direction, from the birth date alone."),
    sections,
    actions,
    cautions: [
      ...(safety.requiresRealityFirstGuidance ? [] : [topicText(topic.caution, locale)]),
      context.realityCheck,
      ...integrated.risks.slice(0, 2),
    ],
    disclaimer: ko
      ? "이 리포트는 나를 이해하고 선택을 정리하는 데 도움을 주는 참고 자료입니다. 미래, 건강, 투자 수익, 다른 사람의 사적인 일을 보장하지는 않습니다."
      : "This report is meant to help you understand yourself and sort out choices. It does not guarantee the future, health outcomes, investment returns, or another person's private facts.",
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
