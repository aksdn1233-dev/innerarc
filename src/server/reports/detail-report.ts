import { assessQuestionSafety } from "@/core/ai/safety";
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
import { resolveConcernTopic, topicText } from "@/core/topics/concern-topics";
import type { ConcernTopic } from "@/core/topics/topic-types";
import { tierBadgeLabel } from "@/core/tiers";
import type { Locale } from "@/i18n/config";

export const DETAIL_REPORT_SERVICE_YEAR = 2026;
export const DETAIL_REPORT_CONTENT_VERSION = "detail-report-composer-2.0.0";

type DetailDomain =
  | "business"
  | "career"
  | "promotion"
  | "money"
  | "love"
  | "reconciliation"
  | "compatibility"
  | "child"
  | "education"
  | "study"
  | "health"
  | "housing"
  | "private_fact"
  | "growth";

type DomainPlan = Readonly<{
  label: string;
  verdict: string;
  analysis: string;
  supporting: string;
  phases: readonly string[];
  situations: readonly string[];
  actions: readonly string[];
  stops: readonly string[];
  final: string;
}>;

type ExactProfileContent = Readonly<{
  label: string;
  definition: string;
  character: string;
  temperament: string;
  contradiction: string;
  decision: string;
  ability: string;
  failures: string;
  work: string;
  money: string;
  teamwork: string;
  love: string;
  stress: string;
  year: string;
  phases: readonly string[];
  situations: readonly string[];
  actions: readonly string[];
  stops: readonly string[];
  conclusion: string;
  sharp: readonly string[];
}>;

function localized(locale: Locale, ko: string, en: string): string {
  return locale === "ko" ? ko : en;
}

function numberDisplay(value: number): string {
  if (value === 11) return "11/2";
  if (value === 22) return "22/4";
  if (value === 33) return "33/6";
  return String(value);
}

function combinationKey(profile: NumerologyProfile, birthYear: number): string {
  return [
    profile.lifePath.value,
    profile.birthday.value,
    profile.attitude.value,
    birthYear,
  ].join("-");
}

const EXACT_PROFILES: Readonly<Record<string, ExactProfileContent>> = {
  "11-4-6-5": {
    label: "판을 먼저 읽는 시스템 설계자",
    definition:
      "사람과 시장이 아직 말로 설명하지 못한 변화를 먼저 감지하고, 그것을 실제로 작동하는 구조로 바꿀 수 있는 사람입니다. 아이디어를 많이 내는 데서 끝나는 유형이 아니라 화면·절차·콘텐츠·운영 방식으로 구체화할 때 가장 강합니다. 다만 다음 가능성을 너무 빨리 보기 때문에 현재 결과를 끝까지 닫는 힘이 분산될 수 있습니다.",
    character:
      "판을 먼저 읽는 시스템 설계자. 생명수 11/2가 사람과 미래의 신호를 먼저 읽고, 생일수 4가 그 신호를 반복 가능한 체계로 바꿉니다. 태도수 6은 결과에 대한 책임을 떠맡게 하고, 출생연도수 5는 새 기술과 변화 쪽으로 계속 시선을 돌립니다.",
    temperament:
      "사람을 볼 때 말보다 분위기, 반응 속도, 말하지 않은 불편을 먼저 읽습니다. 처음 판단은 직감이 빠르고, 결정한 뒤에는 자료와 논리를 붙여 자신의 그림을 구체화합니다. 자신감이 있을 때는 복잡한 일을 한 번에 연결하지만, 확신이 흔들리면 더 많은 자료와 일을 직접 끌어안아 통제하려 합니다.\n\n위임할 때는 결과 기준보다 자신의 머릿속 전체 그림을 상대도 이해했을 것이라고 가정하기 쉽습니다. 상대가 기대만큼 움직이지 않으면 설명 부족보다 역량 부족으로 먼저 판단하고 일을 다시 가져옵니다. 오래 성과를 내는 조건은 모든 일을 직접 아는 것이 아니라, 완료 기준·검수 시점·책임 범위를 문서로 넘기는 것입니다.",
    contradiction:
      "11/2는 아직 오지 않은 변화를 먼저 읽고 싶어 하고, 4는 모든 결과가 정교하게 닫히기를 원합니다. 6은 사람과 결과를 책임지려 하고, 5는 자유와 새 가능성을 놓치고 싶어 하지 않습니다. 그래서 여러 프로젝트를 동시에 높은 기준으로 붙잡는 모순이 생깁니다.\n\n다른 사람보다 다음 장면을 빨리 보기 때문에 현재 장면의 반복 작업을 답답하게 느낄 수 있습니다. 자유롭게 확장하고 싶으면서도 결과는 완벽하게 통제하고 싶어 하므로, 일은 많아지고 결정권은 한 사람에게 몰리기 쉽습니다.",
    decision:
      "첫 단계에서는 사람의 반응과 시장의 미세한 변화를 직감으로 포착합니다. 둘째, 비슷한 사례나 숫자 몇 개가 직감을 뒷받침하면 빠르게 확신합니다. 셋째, 확신이 올라가면 반대 자료를 예외로 취급하고 실행 범위를 넓힐 수 있습니다. 넷째, 세부 완성 단계에서 새 가능성이 보이면 우선순위가 흔들립니다.\n\n직감이 자주 맞았던 경험이 쌓이면 아직 시험하지 않은 판단도 이미 확인된 사실처럼 다룰 수 있습니다. 그래서 사실, 해석, 기대, 아직 시험하지 않은 가정을 한 표에서 분리해야 합니다. 최종 결정은 ‘내 생각이 맞는가’가 아니라 ‘어떤 증거가 나오면 계속하고, 어떤 증거가 나오면 바꿀 것인가’로 내려야 안정적입니다.",
    ability:
      "가장 강한 능력은 사람의 필요를 기술·콘텐츠·사업 구조로 번역하는 힘입니다. AI, 웹서비스, 플랫폼, 마케팅, 콘텐츠, 자동화처럼 사람의 행동과 시스템을 연결하는 일이 잘 맞습니다. 이미 있는 기술을 설명하는 역할보다, 사용자가 실제로 반복해서 쓰는 흐름을 설계할 때 상업적 강점이 살아납니다.\n\n능력이 부족해서 결과가 늦는 것이 아니라 능력이 여러 방향으로 나뉘어 실제 실력보다 완성된 결과가 적게 남을 수 있습니다. 한 가지 결과를 결제·사용·지원·재구매까지 닫아본 경험이 쌓이면 아이디어의 가치가 바로 성과로 전환됩니다.",
    failures:
      "첫째, 현재 프로젝트가 마무리 단계에 들어가면 반복 작업이 지루해져 새 아이디어를 더 중요한 기회로 받아들입니다. 결과는 좋은 개념이 많이 남지만 완성 제품과 반복 매출이 적어집니다. 새 아이디어는 보류 목록에만 기록하고 현재 완료 기준을 통과하기 전에는 돈과 인력을 배정하지 않아야 합니다.\n\n둘째, 사람의 현재 실적보다 미래 가능성을 먼저 봅니다. 사람을 잘못 보는 것이 아니라 그 사람이 아직 증명하지 않은 미래까지 미리 믿어주는 것이 문제입니다. 협업은 말과 의지보다 세 번의 기한 준수, 완료 결과, 불편한 문제를 공개하는 태도로 판단해야 합니다.\n\n셋째, 위임이 흔들리면 일을 다시 가져와 속도를 회복하려 합니다. 단기적으로는 빨라지지만 모든 승인과 판단이 본인에게 몰려 확장이 멈춥니다. 업무를 되찾기 전에 기대 결과, 중간 검수, 실패 시 수정 범위를 먼저 다시 합의해야 합니다.",
    work:
      "직업과 사업에서는 사람의 문제를 읽고 복잡한 정보를 쉬운 흐름으로 바꾸는 자리가 맞습니다. AI·웹서비스·플랫폼·마케팅·콘텐츠·자동화·교육·운영 설계가 유력합니다. 권한 없이 책임만 큰 자리, 반복 보고만 요구하는 자리, 완성 기준이 계속 바뀌는 조직에서는 감각이 소모됩니다.\n\n사업 모델은 많은 사람을 한꺼번에 모으는 광고형보다 한 고객 문제를 정확히 해결하고 반복 사용을 만드는 구조가 우선입니다. 누가 실제로 돈을 내는지, 왜 다시 사용하는지, 무엇을 버려야 핵심 결과를 완성할 수 있는지가 세 가지 필수 질문입니다.",
    money:
      "돈을 만들 기회는 잘 찾지만 돈이 만들어지기 전에 다음 판을 준비해 계좌에 남는 금액이 적을 수 있습니다. 기능·외주·채용·새 프로젝트 비용이 검증보다 먼저 늘어나는 것이 핵심 누수입니다. 매출과 이익을 구분하고, 반복 매출이 확인되기 전에는 고정비와 인력 범위를 늘리지 않는 보존 규칙이 필요합니다.\n\n사람에 대한 기대가 비용 판단에도 영향을 줍니다. 좋은 의도나 장래성만으로 선지급·지분·장기 계약을 결정하지 말고, 완료 결과와 책임 범위를 계약 문서로 확인해야 합니다.",
    teamwork:
      "협업에서는 전체 그림을 빨리 이해하고 방향을 잡지만, 다른 사람이 같은 속도로 맥락을 따라오지 못하면 설명을 생략한 채 답답함을 느낄 수 있습니다. 상대는 목표보다 수정 지시만 많이 받는다고 느끼고, 본인은 결국 내가 해야 한다고 결론내리는 반복이 생깁니다.\n\n좋은 파트너는 아이디어에 동의하는 사람이 아니라 반대 근거를 제시하고도 약속한 결과를 끝내는 사람입니다. 역할, 결정권, 완료 기준, 비용 책임, 중단 조건을 문서로 합의해야 관계와 사업을 함께 지킬 수 있습니다.",
    love:
      "가까운 관계는 이미 안정적이라고 믿으면 새 일과 새로운 사람에게 더 많은 에너지를 줄 수 있습니다. 사랑이 식어서 소홀해지는 것이 아니라 상대가 계속 그 자리에 있을 것이라고 믿어 설명과 약속을 미루는 방식입니다. 상대에게는 중요도가 낮아진 것으로 보일 수 있습니다.\n\n관계의 안정은 마음의 크기보다 일정에 남겨둔 시간, 약속을 지킨 횟수, 갈등 뒤 먼저 설명한 행동에서 확인해야 합니다. 친밀함을 당연하게 여기지 않고 정기적으로 현재 상태를 확인할 때 가까운 관계가 오래 갑니다.",
    stress:
      "혼란이 커질수록 일을 줄여야 하는데 오히려 더 많은 일을 직접 붙잡아 안심하려 할 수 있습니다. 말은 짧아지고 설명 없이 수정 지시가 늘며, 수면과 식사 시간이 뒤로 밀립니다. 위임한 일을 회수하면서 자신만 바빠지고 팀은 판단을 멈추는 구조가 생깁니다.\n\n안정화 순서는 새 일을 받지 않기, 가장 큰 손실 하나 찾기, 필수 아닌 지출 동결하기, 다음 행동을 측정 가능한 결과 하나로 줄이기, 휴식과 근거가 회복될 때까지 되돌릴 수 없는 결정을 미루기입니다.",
    year:
      "2026년 개인년 7은 외부 확장보다 검증·전문성·구조 수정·완성이 중요한 흐름입니다. 기능과 인력을 늘리기보다 실제 유료고객, 반복 사용, 환불과 이탈, 지원 요청을 먼저 확인해야 합니다. 법률·개인정보·보안·기술 안정성처럼 뒤로 미뤘던 기반 검토도 올해 성과의 일부입니다.\n\n올해의 성과는 관심도나 방문자 수가 아니라 하나의 핵심 결과가 끝까지 작동하고 같은 고객이 다시 비용을 내는지로 판단해야 합니다. 크게 보이는 기회보다 검증 가능한 작은 완성이 다음 확장의 근거가 됩니다.",
    phases: [
      "1단계 · 핵심 선택 — 가장 중요한 프로젝트 하나를 공식 지정하고 나머지는 유지 또는 보류로 구분합니다.",
      "2단계 · 최소 완성 — 결제, 핵심 결과, 고객지원, 오류 대응이 한 흐름으로 실제 작동하게 만듭니다.",
      "3단계 · 고객 검증 — 실제 유료 전환, 반복 사용, 환불, 이탈, 문의 이유를 같은 기준으로 기록합니다.",
      "4단계 · 구조 검토 — 법률·개인정보·보안·기술 부채와 수동 운영 병목을 점검하고 핵심 오류부터 닫습니다.",
      "5단계 · 확장 결정 — 미리 정한 증거가 충족된 경우에만 기능, 인력, 광고비를 늘립니다.",
    ],
    situations: [
      "새 아이디어가 나타날 때 — 자동 반응은 바로 설계를 시작하는 것입니다. 현재 완료가 밀리는 위험이 있으므로 아이디어를 보류 목록에 적고 다음 검토일만 정하세요.",
      "협업자가 기한을 놓칠 때 — 자동 반응은 일을 회수하는 것입니다. 병목이 본인에게 몰리므로 결과 기준과 중간 검수일을 다시 합의한 뒤 한 번 더 맡기세요.",
      "매출이 늦어질 때 — 자동 반응은 기능이나 광고를 추가하는 것입니다. 문제 원인이 흐려질 수 있으므로 유료고객 정의, 첫 가치 경험, 재사용 이유부터 확인하세요.",
      "가까운 사람이 서운함을 말할 때 — 자동 반응은 바쁜 이유를 설명하는 것입니다. 감정이 반박된다고 느낄 수 있으므로 먼저 놓친 약속과 회복할 행동을 구체적으로 말하세요.",
      "확신과 데이터가 충돌할 때 — 자동 반응은 데이터가 아직 부족하다고 보는 것입니다. 반대 증거를 무시할 수 있으므로 중단 기준을 적용하고 작은 재검증으로 판단을 갱신하세요.",
    ],
    actions: [
      "핵심 프로젝트 하나를 공식 지정합니다. 완료 조건은 나머지 프로젝트가 보류 또는 유지 전용으로 표시되는 것입니다.",
      "유료고객 한 명의 문제를 한 장으로 정의합니다. 완료 조건은 고객, 문제, 가격, 약속할 결과가 한 문장씩 적히는 것입니다.",
      "최소 완성 흐름을 공개합니다. 완료 조건은 결제부터 결과 제공, 문의, 오류 처리까지 본인이 아닌 사용자도 끝낼 수 있는 것입니다.",
      "검증 데이터를 모읍니다. 완료 조건은 유료 전환, 반복 사용, 환불, 이탈, 지원 요청을 같은 표에서 확인하는 것입니다.",
      "확장 여부를 결정합니다. 완료 조건은 반복 결제와 운영 안정성이라는 사전 기준을 충족한 경우에만 비용을 늘리는 것입니다.",
    ],
    stops: [
      "정한 검증 기간이 끝나도 의미 있는 유료 전환이나 반복 사용이 없다면 현재 판매 방식을 중단하고 고객 문제부터 다시 정의합니다.",
      "고정비가 검증된 반복 매출보다 계속 빠르게 늘거나 대표가 모든 핵심 작업을 직접 해야 한다면 채용·기능 확장을 보류합니다.",
      "핵심 결과는 미완성인데 기능만 늘거나 개인정보·법률·보안 위험이 해결되지 않으면 공개 범위를 줄이고 재검토합니다.",
    ],
    conclusion:
      "이 사람의 방향은 새 가능성을 더 찾는 데 있지 않습니다. 이미 발견한 가능성 하나를 실제 고객이 돈을 내고 반복해서 사용할 구조로 완성하는 데 있습니다. 2026년에 한 가지를 끝까지 검증하고 법률·개인정보·기술 기반까지 닫는다면, 빠른 감각은 비로소 오래 남는 사업과 경력으로 바뀝니다.",
    sharp: [
      "능력이 부족해서 결과가 늦는 것이 아니라 능력이 여러 방향으로 나뉘어 실제 실력보다 완성된 결과가 적게 남을 수 있습니다.",
      "다른 사람보다 다음 장면을 빨리 보기 때문에 현재 장면의 반복 작업을 답답하게 느낄 수 있습니다.",
      "직감이 자주 맞았던 경험이 쌓이면 아직 시험하지 않은 판단도 이미 확인된 사실처럼 다룰 수 있습니다.",
      "사람을 잘못 보는 것이 아니라 그 사람이 아직 증명하지 않은 미래까지 미리 믿어주는 것이 문제입니다.",
      "혼란이 커질수록 일을 줄여야 하는데 오히려 더 많은 일을 직접 붙잡아 안심하려 할 수 있습니다.",
    ],
  },
};

const DOMAIN_LABELS: Readonly<Record<DetailDomain, string>> = {
  business: "사업·창업·웹서비스",
  career: "직업·이직",
  promotion: "승진·평가",
  money: "재물·현금흐름",
  love: "연애·관계",
  reconciliation: "재회·연락",
  compatibility: "궁합·두 사람의 관계",
  child: "자녀 성향·진로",
  education: "레슨·교육 사업",
  study: "학업·시험 준비",
  health: "건강 습관·생활 리듬",
  housing: "주거·대출·이사",
  private_fact: "확인할 수 없는 타인의 사실",
  growth: "성장·선택",
};

const ENGLISH_DOMAIN_LABELS: Readonly<Record<DetailDomain, string>> = {
  business: "business and digital services",
  career: "career and job change",
  promotion: "promotion and evaluation",
  money: "money and cash flow",
  love: "love and close relationships",
  reconciliation: "reconciliation and contact",
  compatibility: "two-person compatibility",
  child: "child temperament and direction",
  education: "study and teaching",
  study: "study and exam preparation",
  health: "health habits and daily rhythm",
  housing: "housing and relocation",
  private_fact: "another person's private facts",
  growth: "growth and choices",
};

function domainFor(topic: ConcernTopic, concern: string): DetailDomain {
  if (/CCTV|씨씨티비|다른 (여자|남자|사람)|누구와 여행|나를 생각|정확히 연락|감시/u.test(concern)) {
    return "private_fact";
  }
  if (/궁합|두 사람|상대 생년월일|두 분/u.test(concern)) return "compatibility";
  if (topic.id === "child_temperament" || topic.id === "children" || /우리 아이|아이 성향|자녀/u.test(concern)) {
    return "child";
  }
  if (/레슨|수강생|학생 모집|과외|학원생/u.test(concern)) return "education";
  if (/학업|공부|시험|입시|자격증|성적|합격/u.test(concern)) return "study";
  if (topic.id === "promotion" || /승진|진급|고과|인사평가/u.test(concern)) return "promotion";
  if (["reunion", "breakup", "staleness", "long_distance"].includes(topic.id) ||
      /재회|헤어진|다시 연락|연락이 올/u.test(concern)) return "reconciliation";
  if (["relocation", "moving_city"].includes(topic.id) ||
      /주택|아파트|보증금|전세|월세|주거|이사|입주/u.test(concern)) return "housing";
  if (["startup", "freelance", "side_job", "business_partner", "client_acquisition"].includes(topic.id) ||
      /사업|창업|웹 ?서비스|플랫폼|사업자/u.test(concern)) return "business";
  if (topic.focus === "health") return "health";
  if (topic.focus === "money") return "money";
  if (topic.focus === "relationships") return "love";
  if (topic.focus === "work") return "career";
  return "growth";
}

function koreanDomainPlan(domain: DetailDomain): DomainPlan {
  const common = {
    phases: [
      "1단계 — 현재 상태와 원하는 결과를 분리해 적습니다.",
      "2단계 — 가장 작은 검증 행동을 실행하고 실제 반응을 기록합니다.",
      "3단계 — 반복되는 증거와 예외를 나눠 판단을 갱신합니다.",
      "4단계 — 기준을 충족하면 확대하고, 충족하지 못하면 방법을 바꿉니다.",
    ],
  };
  const plans: Record<DetailDomain, DomainPlan> = {
    business: {
      label: DOMAIN_LABELS.business,
      verdict: "사업 방향 자체는 맞습니다. 사람의 필요를 기술과 서비스 구조로 연결하는 힘이 있기 때문입니다. 다만 2026년에는 기능 수와 관심도보다 실제 유료고객 한 명의 반복 사용을 먼저 증명해야 합니다.",
      analysis: "가장 맞는 운영 모델은 한 고객 문제를 좁게 해결하고 사용 과정에서 데이터를 쌓는 서비스입니다. 상업적 강점은 시장의 말하지 않은 불편을 먼저 발견하는 것이지만, 고객이 좋다고 말하는 것과 실제 결제·재사용은 구분해야 합니다. 매출이 생겨도 외주·인력·광고·서버비가 먼저 늘면 이익은 남지 않습니다.\n\n누가 실제로 돈을 내는가, 왜 반복해서 사용하는가, 무엇을 버려야 핵심 결과를 완성할 수 있는가를 문서로 답해야 합니다. 개인정보, 환불, 오류 대응, 고객지원이 빠진 상태는 최소 제품이 아니라 미완성 제품입니다.",
      supporting: "보조 요인은 돈과 협업입니다. 고정비는 반복 매출이 확인된 뒤 늘리고, 파트너는 아이디어 동의보다 완료 실적·기한 준수·문제 공개 태도로 고르세요. 권한과 책임, 비용 부담, 지식재산, 중단 조건을 문서로 남겨야 관계 손실이 사업 손실로 번지지 않습니다.",
      phases: ["1단계 · 핵심 프로젝트 선택", "2단계 · 결제와 결과가 연결된 최소 완성", "3단계 · 유료고객과 반복 사용 검증", "4단계 · 수익·이탈·환불·지원 데이터 확인", "5단계 · 근거가 있을 때만 확장"],
      situations: ["새 기능이 떠오를 때 — 바로 만들지 말고 현재 고객 문제 해결에 필요한지 한 문장으로 증명합니다.", "문의는 오지만 결제가 없을 때 — 광고를 늘리기 전에 고객, 문제, 가격, 약속 결과의 불일치를 찾습니다.", "협업자가 기한을 놓칠 때 — 일을 회수하기 전에 완료 기준과 중간 검수를 다시 합의합니다.", "매출은 있는데 돈이 남지 않을 때 — 매출이 아니라 건별 변동비와 월 고정비를 빼고 이익을 계산합니다.", "사용자는 들어오지만 돌아오지 않을 때 — 첫 가치 경험과 재사용 이유를 인터뷰와 행동 기록으로 확인합니다."],
      actions: ["핵심 프로젝트 하나만 공식 지정합니다. 완료 조건: 나머지는 보류 또는 유지 전용으로 표시합니다.", "한 명의 유료고객 문제를 정의합니다. 완료 조건: 고객·문제·가격·결과가 한 장에 적힙니다.", "최소 완성 버전을 엽니다. 완료 조건: 결제·핵심 결과·지원·오류 대응이 실제로 작동합니다.", "검증표를 운영합니다. 완료 조건: 유료 전환·반복 사용·환불·이탈·문의가 기록됩니다.", "확장 결정을 내립니다. 완료 조건: 사전에 정한 반복 매출과 운영 안정성 기준을 충족합니다."],
      stops: ["검증 기간 뒤에도 유료 전환이나 반복 사용이 없다면 판매 방식을 중단하고 고객 문제부터 다시 정의합니다.", "고정비가 검증 매출보다 빠르게 늘면 채용·광고·기능 확대를 보류합니다.", "대표가 모든 핵심 작업을 직접 해야 하거나 개인정보·법률·기술 위험이 남으면 공개 범위를 줄입니다."],
      final: "사업을 포기할 이유는 없습니다. 다만 검증되지 않은 확장 방식은 멈춰야 합니다. 한 고객이 돈을 내고 반복해서 쓰는 하나의 흐름을 완성한 뒤에만 다음 판으로 가는 것이 2026년의 정답입니다.",
    },
    career: {
      label: DOMAIN_LABELS.career,
      verdict: "이직 가능성은 있지만 현재 직장이 싫다는 이유만으로 움직이면 비슷한 구조를 다시 만날 수 있습니다. 새 자리에서는 급여만이 아니라 권한, 전문성, 평가 기준, 책임 범위를 먼저 확인해야 합니다.",
      analysis: "잘 맞는 자리는 사람과 정보를 연결하고 복잡한 일을 구조화할 권한이 있는 역할입니다. 전략기획, 서비스기획, 운영 설계, 데이터 기반 마케팅, 고객 문제를 기술로 번역하는 역할이 유리합니다. 반대로 결과 책임은 크지만 결정권이 없고 평가 기준이 자주 바뀌는 조직에서는 소진이 반복됩니다.\n\n현재 불만을 구조적 부적합, 일시적 피로, 관계 갈등, 실제 성장 정체로 나눠 보세요. 이직 근거는 감정이 아니라 완료한 결과물, 숫자로 설명되는 개선, 맡았던 책임, 다음 자리에서 필요한 권한으로 준비해야 합니다.",
      supporting: "돈은 연봉 총액보다 고정급·성과급 조건·통근·교육비·퇴직 조건까지 함께 봐야 합니다. 관계에서는 상사와의 친밀감보다 평가 기준이 서면으로 명확한지가 중요합니다. 구두 약속은 협상 결과가 아니라 확인 전 제안입니다.",
      ...common,
      situations: ["새 제안을 받을 때 — 직함에 끌리기보다 실제 결정권과 평가 기준을 질문합니다.", "현재 일이 너무 싫을 때 — 퇴사 결정보다 수면과 피로가 회복된 뒤 구조적 문제를 다시 확인합니다.", "연봉 협상 때 — 열심히 했다는 설명보다 만든 결과와 대체 비용을 제시합니다.", "면접에서 좋은 분위기를 느낄 때 — 호감과 실제 역할 조건을 분리해 서면으로 확인합니다."],
      actions: ["목표 역할 세 개를 고릅니다. 완료 조건: 공고에서 반복되는 책임과 기술이 표시됩니다.", "현재 경력 증거를 정리합니다. 완료 조건: 책임·행동·결과가 숫자나 사례로 연결됩니다.", "이동 기준표를 만듭니다. 완료 조건: 급여·권한·평가·통근·성장 조건이 비교됩니다.", "시장 반응을 확인합니다. 완료 조건: 지원 또는 인터뷰 세 건에서 반복 피드백을 얻습니다.", "최종 협상합니다. 완료 조건: 핵심 조건을 서면으로 확인한 뒤 결정합니다."],
      stops: ["새 자리의 책임은 크지만 결정권과 평가 기준이 불명확하면 이동을 보류합니다.", "현재 피로만 줄어도 퇴사 이유 대부분이 사라진다면 회복 후 다시 판단합니다.", "구두 약속을 서면으로 확인해 주지 않거나 역할 범위가 계속 바뀌면 제안을 재검토합니다."],
      final: "움직일 수는 있습니다. 하지만 탈출이 아니라 역할 구조를 바꾸는 이동이어야 합니다. 권한과 평가 기준이 분명하고 자신의 결과를 증명할 수 있는 자리로 갈 때 이번 변화가 반복이 아니라 성장으로 남습니다.",
    },
    promotion: {
      label: DOMAIN_LABELS.promotion,
      verdict: "승진 가능성을 높일 수 있습니다. 다만 이미 잘하고 있다는 인상만으로 기다리면 공로가 역할 확대로 연결되지 않을 수 있습니다. 다음 직급의 책임을 수행했다는 증거와 평가 기준을 먼저 확인해야 합니다.",
      analysis: "조직에서 문제를 미리 발견하고 빈틈을 메우는 힘은 강하지만, 보이지 않는 조율은 성과로 기록되지 않으면 당연한 지원 업무로 취급됩니다. 성과를 매출, 시간 절감, 오류 감소, 고객 유지, 팀 생산성 중 하나로 번역해야 합니다. 상사가 알아줄 것이라는 기대와 공식 평가 자료는 다릅니다.\n\n승진은 호감보다 역할 범위, 대체 난도, 다음 직급의 행동 증거, 조직의 자리 유무가 함께 맞아야 합니다. 원하는 시점과 필요한 증거를 직접 묻고, 답이 계속 모호하면 외부 기회도 동시에 확인하는 편이 안전합니다.",
      supporting: "보조 요인은 협상과 관계입니다. 동료 일을 대신해 주는 것보다 본인 책임의 성과를 먼저 닫고, 추가 역할은 권한·지원·보상과 묶어 합의해야 합니다. 관계를 지키기 위해 요구를 늦추면 평가 시점에는 증거가 남지 않습니다.",
      ...common,
      situations: ["승진 이야기가 나오지 않을 때 — 더 기다리기보다 기준과 시점을 직접 묻습니다.", "새 책임만 늘어날 때 — 역할 확대를 수락하기 전에 권한과 보상 검토일을 합의합니다.", "성과를 가로채였다고 느낄 때 — 감정 항의보다 기여 기록과 결과 자료를 정리해 공유합니다.", "평가가 모호할 때 — 잘하고 있다는 말 대신 다음 등급에 부족한 구체적 증거를 요청합니다."],
      actions: ["다음 직급 기준을 확보합니다. 완료 조건: 책임과 평가 항목을 문서로 받습니다.", "최근 성과 세 건을 정리합니다. 완료 조건: 문제·행동·수치 결과가 한 장에 보입니다.", "역할 격차를 채웁니다. 완료 조건: 다음 직급 책임 하나를 공식 권한 아래 수행합니다.", "평가 대화를 예약합니다. 완료 조건: 시점·부족 증거·결정권자가 확인됩니다.", "대안을 점검합니다. 완료 조건: 내부 일정이 불명확하면 외부 시장 반응도 비교합니다."],
      stops: ["기준과 결정 시점을 계속 공개하지 않으면 무기한 기다리지 않습니다.", "권한과 보상 없이 다음 직급 책임만 반복되면 추가 역할을 재협상합니다.", "성과 증거가 있어도 구조적으로 자리가 없다는 답이 확인되면 외부 이동을 준비합니다."],
      final: "승진을 기다리는 사람이 아니라 다음 역할의 증거를 만들고 기준을 묻는 사람이 되어야 합니다. 공로가 보이게 기록되고 권한·책임·보상이 함께 움직일 때 승진 가능성이 현실적인 선택이 됩니다.",
    },
    money: {
      label: DOMAIN_LABELS.money,
      verdict: "돈의 흐름은 벌 기회보다 보존 기준에서 갈립니다. 새 수익을 기대하기 전에 고정비, 사람에게 쓰는 돈, 회수되지 않은 비용을 먼저 정리해야 합니다.",
      analysis: "수익 기회를 빠르게 찾지만 가능성이 보이면 실제 현금이 들어오기 전에 비용을 앞서 배정할 수 있습니다. 매출, 입금, 이익, 사용할 수 있는 현금을 각각 구분해야 합니다. 특히 대출·할부·장기 계약은 낙관 시나리오가 아니라 수입이 줄었을 때 감당할 월 금액으로 판단해야 합니다.\n\n사람을 믿어 선지급하거나 계약 없이 비용을 부담하는 손실도 주의 대상입니다. 지급 일정, 지연 책임, 결과물 기준, 해지 조건을 서면으로 확인해야 관계와 돈을 함께 지킬 수 있습니다.",
      supporting: "직업과 사업에서 수입원을 너무 많이 벌리면 관리 비용이 커집니다. 한 가지 현금흐름의 반복성과 회수 속도를 먼저 확인하세요. 관계비용과 사업비용을 섞지 않고, 도움을 주는 돈과 돌려받을 돈을 명확히 구분해야 합니다.",
      ...common,
      situations: ["새 투자나 대출 제안을 받을 때 — 기대수익보다 최악의 월 부담과 현금 보유 기간을 계산합니다.", "입금이 늦어질 때 — 기다리기보다 계약 일정과 지연 책임에 따라 바로 확인합니다.", "사람이 급하게 돈을 요청할 때 — 호감과 상환 능력을 분리하고 잃어도 되는 범위만 판단합니다.", "매출이 늘었는데 잔고가 줄 때 — 매출이 아닌 실제 입금과 고정비·변동비를 다시 계산합니다."],
      actions: ["최근 3개월 현금흐름을 정리합니다. 완료 조건: 매출·입금·고정비·변동비가 분리됩니다.", "가장 큰 누수 하나를 막습니다. 완료 조건: 상한 또는 해지 조건이 실행됩니다.", "대출과 계약을 표로 만듭니다. 완료 조건: 금리·상환일·해지·지연 책임이 확인됩니다.", "현금 보존선을 정합니다. 완료 조건: 최소 생활·운영 기간이 숫자로 정해집니다.", "새 비용 승인 규칙을 적용합니다. 완료 조건: 반복 수익 증거 없이 고정비를 늘리지 않습니다."],
      stops: ["월 상환액이 보수적 수입에서 감당되지 않으면 대출이나 구매를 보류합니다.", "계약·지급·회수 조건을 서면으로 남기지 않는 거래는 진행하지 않습니다.", "고정비가 실제 입금보다 빠르게 늘거나 회수 지연이 반복되면 확장을 중단합니다."],
      final: "돈을 못 버는 흐름이 아니라 벌기 전에 다음 기회에 배분하는 흐름을 고쳐야 합니다. 2026년에는 더 큰 수익 약속보다 현금이 실제로 들어오고 남는 한 가지 구조를 지키는 것이 우선입니다.",
    },
    love: {
      label: DOMAIN_LABELS.love,
      verdict: "관계의 가능성은 감정의 크기보다 말과 행동이 반복해서 일치하는지에서 판단해야 합니다. 한 번의 연락이나 강한 표현보다 약속, 시간, 갈등 뒤 회복 행동을 보세요.",
      analysis: "상대의 미세한 반응을 잘 읽지만 빈칸이 생기면 그 의미를 너무 많이 해석할 수 있습니다. 관찰한 행동, 내가 붙인 해석, 두려움, 확인된 사실을 분리해야 합니다. 관계를 믿으면 설명을 미루는 경향도 있어 상대는 안정이 아니라 무관심으로 느낄 수 있습니다.\n\n신뢰는 연락 횟수보다 예고한 행동을 지키는지, 불편한 질문을 피하지 않는지, 갈등 뒤 책임 있게 돌아오는지로 쌓입니다. 상대 마음을 대신 결론내리지 말고 원하는 관계 상태와 필요한 행동을 한 번 분명히 물어야 합니다.",
      supporting: "일이 바쁠수록 가까운 관계를 이미 확보된 영역으로 취급할 수 있습니다. 관계 회복에는 긴 설명보다 약속한 시간을 실제 일정에 남기고 지키는 행동이 필요합니다. 돈이나 생활 책임이 연결돼 있다면 감정 대화와 현실 조건을 따로 합의하세요.",
      ...common,
      situations: ["연락이 줄어들 때 — 추측을 늘리기보다 현재 관계 의도와 가능한 연락 방식을 한 번 묻습니다.", "강한 애정 표현을 받을 때 — 말의 크기보다 이후 4주의 행동 일치를 봅니다.", "갈등이 반복될 때 — 누가 맞는지보다 같은 문제가 생기는 순서와 회복 행동을 기록합니다.", "상대가 정의를 피할 때 — 기다림의 기한과 내가 받아들일 최소 기준을 분명히 말합니다."],
      actions: ["원하는 관계 상태를 한 문장으로 정합니다. 완료 조건: 상대에게 직접 전달합니다.", "신뢰 기준 두 가지를 고릅니다. 완료 조건: 약속·연락·회복 행동 중 관찰 항목이 정해집니다.", "4주 동안 행동을 기록합니다. 완료 조건: 말과 행동의 반복 일치 여부가 보입니다.", "갈등 회복 규칙을 합의합니다. 완료 조건: 멈춤·재대화·사과 방식이 정해집니다.", "관계 결정을 내립니다. 완료 조건: 기대가 아니라 확인된 행동과 내 기준으로 선택합니다."],
      stops: ["관계 정의를 계속 피하고 약속 없는 연락만 반복되면 기다림을 멈춥니다.", "사과는 반복되지만 같은 행동이 바뀌지 않으면 말이 아닌 행동을 기준으로 재검토합니다.", "관계를 유지할수록 수면·일상·감정 안정이 계속 무너지면 거리를 두고 지원을 구합니다."],
      final: "이 관계의 답은 상대 마음을 추측하는 데 있지 않습니다. 말과 행동이 반복해서 맞고, 불편한 문제를 함께 다루며, 내 기준이 지켜지는지를 확인해야 합니다. 그 증거가 없다면 기다림보다 경계를 선택하는 것이 맞습니다.",
    },
    reconciliation: {
      label: DOMAIN_LABELS.reconciliation,
      verdict: "다시 연락이 이어질 여지는 있습니다. 다만 연락 한 번보다 헤어진 원인이 실제 행동에서 달라졌는지, 이후 꾸준함과 구체적인 만남 제안이 이어지는지를 봐야 합니다.",
      analysis: "그리움이 커지면 과거의 좋은 장면을 현재 가능성으로 해석하기 쉽습니다. 재회 가능성은 감정이 남았는지가 아니라 헤어진 직접 원인, 그 원인의 변화 증거, 다시 만날 때 달라질 운영 방식으로 판단해야 합니다. 연락은 시작일 뿐 관계 회복의 증거가 아닙니다.\n\n한 번 분명하게 의도를 묻고, 답이 모호하면 계속 의미를 해석하지 마세요. 다른 계정이나 지인을 통한 우회 연락은 중단하고, 상대의 자발적이고 일관된 행동을 볼 기간을 정하는 편이 안전합니다.",
      supporting: "가까운 관계를 당연하게 여겨 설명과 약속을 미뤘던 부분이 있다면 인정이 먼저입니다. 동시에 상대의 무응답이나 모호함까지 본인 책임으로 떠안을 필요는 없습니다. 회복은 두 사람이 각각 행동을 바꿀 때만 가능합니다.",
      phases: ["1단계 · 한 번의 명확한 연락", "2단계 · 일관성과 자발성 관찰", "3단계 · 헤어진 원인에 대한 직접 대화", "4단계 · 경계 또는 재연결 결정"],
      situations: ["연락이 다시 올 때 — 감정부터 쏟기보다 연락 목적과 현재 상황을 묻습니다.", "답장이 뜸할 때 — 빈칸을 해석하지 말고 합의한 연락 방식이 지켜지는지 봅니다.", "미안하다는 말을 들을 때 — 사과보다 원인이 달라졌다는 행동을 요청합니다.", "만남 제안이 모호할 때 — 날짜와 장소가 있는 구체적 제안인지 확인합니다."],
      actions: ["헤어진 직접 원인을 한 문장으로 적습니다. 완료 조건: 감정이 아닌 행동으로 표현됩니다.", "달라져야 할 행동 증거를 정합니다. 완료 조건: 서로 확인할 기준 두 가지가 생깁니다.", "의도를 한 번 묻습니다. 완료 조건: 재회를 원하는지 모호하지 않게 답을 받습니다.", "관찰 기간을 둡니다. 완료 조건: 연락·약속·회복 행동의 일관성을 확인합니다.", "결정합니다. 완료 조건: 증거가 있으면 천천히 재연결하고 없으면 기다림을 끝냅니다."],
      stops: ["거절이나 무응답 뒤 우회 연락을 해야만 관계가 이어진다면 멈춥니다.", "연락은 반복되지만 관계 정의와 구체적 만남을 계속 피하면 기다림을 끝냅니다.", "헤어진 원인에 대한 행동 변화 없이 그리움과 사과만 반복되면 재회를 보류합니다."],
      final: "재회는 연락이 오는 순간이 아니라 이전 문제를 다른 방식으로 다룰 수 있을 때 시작됩니다. 자발적 연락, 구체적 만남, 반복 행동의 변화가 함께 보이면 천천히 확인하고, 하나라도 계속 비어 있다면 기대보다 경계를 선택하세요.",
    },
    compatibility: {
      label: DOMAIN_LABELS.compatibility,
      verdict: "현재 입력만으로는 한 사람의 관계 방식까지는 상세히 볼 수 있습니다. 두 사람의 궁합 결론은 상대 생년월일을 함께 입력해 책임, 연락, 갈등 후 회복 방식을 같은 기준으로 비교해야 합니다.",
      analysis: "이 사람은 관계의 미세한 변화를 빨리 읽지만 상대가 설명하지 않은 부분까지 대신 해석할 수 있습니다. 가까워지면 안정감을 믿고 설명을 미루는 반대 흐름도 있습니다. 두 사람 비교에서는 감정 점수보다 결정 속도, 책임 분담, 연락 기대, 갈등 후 회복, 돈과 시간 운영 조건이 중요합니다.\n\n궁합은 운명을 판정하는 점수가 아닙니다. 잘 맞는 부분은 어디에서 노력이 적게 드는지, 충돌하는 부분은 어떤 규칙을 미리 합의해야 하는지를 찾는 분석입니다.",
      supporting: "상대 생년월일 없이 상대 성향을 만들어내지 않습니다. 현재 보고서에서는 고객 자신의 관계 반응과 확인할 조건만 다룹니다. 별도 궁합 화면에서 두 날짜를 입력하면 계산을 분리한 뒤 공통점과 충돌 조건을 비교할 수 있습니다.",
      ...common,
      situations: ["연락 기대가 다를 때 — 사랑의 크기로 해석하지 말고 가능한 빈도와 예외 상황을 합의합니다.", "결정 속도가 다를 때 — 느림을 거절로, 빠름을 압박으로 단정하지 말고 결정 기한을 정합니다.", "돈과 책임이 연결될 때 — 애정과 별개로 금액·기한·역할을 문서로 남깁니다.", "갈등 뒤 침묵이 길어질 때 — 회피라고 단정하기 전에 멈춤 시간과 재대화 시점을 합의합니다."],
      actions: ["상대 생년월일을 별도 궁합 화면에 입력합니다. 완료 조건: 두 계산이 독립적으로 생성됩니다.", "관계 운영 항목을 고릅니다. 완료 조건: 연락·책임·돈·갈등 회복 기준이 적힙니다.", "차이를 대화합니다. 완료 조건: 각자 필요한 조건과 양보 범위가 확인됩니다.", "작은 합의를 시험합니다. 완료 조건: 4주 동안 실제 유지 여부를 봅니다.", "관계 방향을 정합니다. 완료 조건: 운명 점수가 아니라 운영 가능성으로 판단합니다."],
      stops: ["상대 생년월일이나 실제 행동 없이 사적 사실을 단정하려는 해석은 중단합니다.", "합의가 반복해서 무시되고 책임을 한 사람만 떠안으면 관계 방식을 재검토합니다.", "갈등 뒤 회복 대화를 계속 거부하면 좋은 감정만으로 궁합이 맞다고 판단하지 않습니다."],
      final: "두 사람의 답은 한쪽의 숫자만으로 만들 수 없습니다. 상대 생년월일과 실제 행동을 함께 놓고, 서로 다른 속도와 책임 방식을 운영할 수 있는지를 확인해야 합니다. 맞춰갈 규칙을 지킬 수 있다면 차이는 약점이 아니라 역할 분담이 됩니다.",
    },
    child: {
      label: DOMAIN_LABELS.child,
      verdict: "아이의 방향은 직업 하나를 미리 고정하기보다 몰입이 생기는 조건과 압박 뒤 회복 방식을 관찰하는 데서 선명해집니다. 지금은 결과보다 자발적 반복과 회복 속도를 봐야 합니다.",
      analysis: "미세한 분위기와 기대를 빨리 읽는 아이는 설명보다 부모 표정과 비교 분위기에 먼저 반응할 수 있습니다. 흥미가 생기면 깊게 파지만 정답과 평가가 앞서면 틀릴 위험을 피하려고 시작을 늦출 수 있습니다. 동기는 통제보다 선택권, 작은 완성, 구체적 인정에서 살아납니다.\n\n진로는 기술·콘텐츠·설계·연구·교육처럼 감지한 것을 구조로 만드는 넓은 군으로 탐색하세요. 한 번의 성과보다 스스로 다시 하는 활동, 어려움 뒤 돌아오는 활동, 다른 사람에게 설명하고 싶은 활동이 더 좋은 단서입니다.",
      supporting: "부모의 책임감이 강할수록 아이의 시행착오를 대신 정리해 주려 할 수 있습니다. 해결책을 먼저 주기보다 아이가 본 문제와 다음 시도를 말하게 하세요. 생활 리듬과 수면이 무너지면 동기 부족으로 단정하지 않는 것이 중요합니다.",
      ...common,
      situations: ["공부를 거부할 때 — 게으름으로 단정하지 말고 어려운 지점과 평가 불안을 분리해 묻습니다.", "흥미가 자주 바뀔 때 — 바로 끊지 말고 짧은 체험 기간과 완성 결과 하나를 정합니다.", "비교에 예민할 때 — 다른 아이보다 노력 과정과 이전 자기 기록을 기준으로 말합니다.", "실패 뒤 포기할 때 — 정답을 주기보다 다음 시도를 아이가 한 문장으로 고르게 합니다."],
      actions: ["몰입 활동 세 가지를 기록합니다. 완료 조건: 자발적 반복 시간과 회복 속도가 보입니다.", "압박 조건 세 가지를 기록합니다. 완료 조건: 멈추는 상황과 몸의 반응이 확인됩니다.", "서로 다른 활동 두 가지를 체험합니다. 완료 조건: 결과보다 다시 하고 싶은지를 비교합니다.", "부모 대화 방식을 바꿉니다. 완료 조건: 지시보다 관찰 질문을 먼저 사용합니다.", "다음 경험을 선택합니다. 완료 조건: 아이가 이유와 원하는 도움을 직접 말합니다."],
      stops: ["아이가 수면·식사·일상 기능까지 무너지면 진로 실험을 줄이고 전문가 확인을 우선합니다.", "비교와 압박 뒤 불안·회피가 커지면 성과 목표를 보류합니다.", "부모가 원하는 직업만 남기고 아이의 자발적 반복이 사라지면 방향을 재검토합니다."],
      final: "아이에게 필요한 것은 빠른 직업 확정이 아니라 자신이 몰입하고 회복하는 조건을 아는 경험입니다. 선택권과 작은 완성을 반복하게 하고, 부모는 답을 주는 사람보다 관찰을 돕는 사람이 되어야 합니다.",
    },
    education: {
      label: DOMAIN_LABELS.education,
      verdict: "올해 개인레슨 학생이 생길 흐름은 있습니다. 다만 여러 명이 한꺼번에 들어오기보다 문의와 체험수업이 먼저 생기고, 그중 일부가 정규수업으로 이어진 뒤 소개가 붙는 방식이 현실적입니다.",
      analysis: "강점은 학생의 작은 막힘을 빨리 읽고 수업 흐름을 구조화하는 것입니다. 하지만 실력을 잘 설명하는 것만으로는 등록이 생기지 않습니다. 어떤 학생의 어떤 문제를 몇 회 안에 어떻게 바꿀지, 체험 후 정규 등록으로 어떻게 이어지는지가 보여야 합니다.\n\n문의 수, 체험 신청, 체험 참여, 정규 등록, 4주 유지, 소개를 단계별로 기록하세요. 학생이 없을 때 과목과 채널을 한꺼번에 늘리면 무엇이 작동했는지 알 수 없습니다.",
      supporting: "돈에서는 수강료보다 준비·이동·공간 비용을 뺀 실제 시간당 이익을 봐야 합니다. 관계에서는 학부모와 학생의 기대를 분리하고 결석·보강·환불·연습 책임을 미리 문서로 안내해야 갈등이 줄어듭니다.",
      phases: ["1단계 · 대상 학생과 변화 정의", "2단계 · 문의가 생기는 한 채널 운영", "3단계 · 체험수업 전환", "4단계 · 첫 학생의 변화 증거 만들기", "5단계 · 후기 조작 없이 실제 소개 확장"],
      situations: ["문의가 없을 때 — 실력을 더 설명하기보다 대상 학생과 해결 문제를 좁힙니다.", "체험 뒤 등록이 없을 때 — 할인보다 체험에서 느낀 변화와 다음 과정을 확인합니다.", "학부모 요구가 늘 때 — 즉시 수용하지 말고 수업 목표·보강·연락 범위를 다시 합의합니다.", "학생이 연습하지 않을 때 — 의지를 꾸짖기보다 최소 연습 단위와 확인 방식을 줄입니다."],
      actions: ["대상 학생 한 유형을 정합니다. 완료 조건: 수준·문제·원하는 변화가 한 문장으로 적힙니다.", "4주 제안을 만듭니다. 완료 조건: 수업 횟수·가격·결과·환불·보강 기준이 보입니다.", "문의 채널 하나를 운영합니다. 완료 조건: 같은 메시지를 정한 기간 반복 노출합니다.", "체험 전환을 측정합니다. 완료 조건: 문의·참여·등록 이유와 이탈 이유가 기록됩니다.", "첫 학생 증거를 만듭니다. 완료 조건: 동의받은 실제 변화와 재등록 여부가 확인됩니다."],
      stops: ["정한 기간 동안 문의가 전혀 없으면 실력보다 대상과 제안 문구를 바꿉니다.", "체험은 오지만 등록이 없으면 할인 확대 전에 수업 가치와 다음 과정 연결을 재검토합니다.", "준비·이동·공간 비용을 뺀 수익이 지속 불가능하면 가격이나 운영 방식을 바꿉니다."],
      final: "학생은 기다린다고 한꺼번에 들어오지 않습니다. 한 학생의 문제와 변화 과정을 선명하게 만들고, 문의에서 체험과 정규 등록으로 이어지는 한 흐름을 검증해야 합니다. 첫 학생의 실제 변화가 다음 학생을 부르는 가장 강한 증거입니다.",
    },
    study: {
      label: DOMAIN_LABELS.study,
      verdict: "이번 시험은 결과를 미리 단정하기보다 남은 기간에 점수를 바꿀 수 있는 오답 유형과 실전 회복력을 먼저 잡는 것이 맞습니다. 공부 시간을 무작정 늘리기보다 완료량·오답 감소·모의 점수 추세가 좋아지는지를 보세요.",
      analysis: "이해가 빠른 사람일수록 아는 내용을 다시 반복하는 시간을 답답하게 느낄 수 있지만 시험 결과는 새로운 자료의 양보다 회상과 적용의 반복에서 갈립니다. 불안할수록 강의·교재·계획을 더 붙이기 쉬운데, 그럴수록 오답 복습과 제한 시간 연습이 밀릴 수 있습니다.\n\n과목별 공부 시간이 아니라 실제 푼 문제, 오답 원인, 재시험 정답률, 제한 시간 안의 정확도를 기록하세요. 수면을 줄여 확보한 시간은 다음 날 회상과 판단을 떨어뜨릴 수 있으므로 공부량과 회복을 같은 계획에 넣어야 합니다.",
      supporting: "보조 요인은 생활 리듬과 불안 관리입니다. 목표 점수와 현재 점수의 차이를 단원별로 나누고, 이미 잘하는 영역보다 자주 틀리지만 고칠 수 있는 영역에 시간을 먼저 배분하세요. 컨디션 저하가 길어지면 의지 부족으로 몰지 말고 일정과 도움을 조정해야 합니다.",
      phases: ["1단계 · 현재 점수와 오답 유형 확인", "2단계 · 점수를 바꿀 핵심 단원 두 개 선택", "3단계 · 회상·오답·시간 제한 반복", "4단계 · 실전 모의와 컨디션 조정", "5단계 · 시험 직전 범위 축소와 회복"],
      situations: ["계획이 밀릴 때 — 전체 계획을 버리지 말고 오늘 점수에 직접 연결되는 문제 세트 하나를 끝냅니다.", "불안해서 자료를 늘리고 싶을 때 — 새 자료보다 기존 오답의 재시험 정답률을 먼저 확인합니다.", "모의 점수가 떨어질 때 — 실력 전체로 단정하지 말고 시간 배분·특정 단원·수면 중 원인을 나눕니다.", "시험 직전에 초조할 때 — 새 내용을 넓히지 말고 자주 틀리는 유형과 실전 순서만 점검합니다."],
      actions: ["최근 오답을 세 유형으로 나눕니다. 완료 조건: 개념·실수·시간 부족 비율이 보입니다.", "점수 변화가 큰 단원 두 개를 고릅니다. 완료 조건: 이번 주 범위와 문제 수가 정해집니다.", "오답 재시험을 합니다. 완료 조건: 48시간 뒤 같은 유형 정답률이 기록됩니다.", "제한 시간 모의를 두 번 합니다. 완료 조건: 점수·시간·마지막 10분 실수가 비교됩니다.", "시험 전 루틴을 고정합니다. 완료 조건: 수면·식사·이동·문제 푸는 순서가 정해집니다."],
      stops: ["수면·식사·일상 기능이 무너지면 공부량 확대를 멈추고 회복과 필요한 도움을 우선합니다.", "2주간 같은 방식으로 해도 오답률이 줄지 않으면 의지를 탓하지 말고 학습 방법이나 도움을 바꿉니다.", "불안을 줄이려고 새 교재와 강의만 계속 늘리면 신규 자료 구매를 중단합니다."],
      final: "시험의 답은 운을 단정하는 데 있지 않습니다. 남은 기간에 바꿀 수 있는 오답 유형을 좁히고, 제한 시간 안의 정확도와 회복 가능한 생활 리듬을 함께 만들 때 가장 현실적인 가능성이 커집니다.",
    },
    health: {
      label: DOMAIN_LABELS.health,
      verdict: "지금은 강한 계획보다 무너지는 생활 조건 하나를 찾고 작은 루틴을 고정하는 것이 먼저입니다. 건강 상태를 진단할 수는 없지만 수면·식사·활동·피로의 반복 패턴은 구체적으로 정리할 수 있습니다.",
      analysis: "압박이 커지면 해야 할 일을 더 붙잡고 수면과 식사를 뒤로 미룰 수 있습니다. 낮에는 통제로 버티지만 밤에는 생각이 계속 이어져 회복이 늦어지는 구조입니다. 의지가 부족한 것이 아니라 목표가 크고 쉬는 시간을 성과가 없는 시간으로 취급하는 것이 문제일 수 있습니다.\n\n2주 동안 수면, 식사, 활동, 피로를 같은 시간에 한 줄씩 기록하세요. 한꺼번에 바꾸지 말고 가장 자주 무너지는 시간과 조건 하나를 찾아 목표를 절반으로 낮추는 편이 유지에 유리합니다.",
      supporting: "일과 관계에서 책임을 많이 떠안을수록 몸의 신호를 나중 문제로 미룰 수 있습니다. 일정에 빈칸을 남기는 것과 요청을 거절하는 행동도 생활 관리에 포함됩니다. 통증·어지럼·의도하지 않은 급격한 변화나 일상 기능 저하는 해석보다 의료진 확인이 우선입니다.",
      ...common,
      situations: ["계획을 하루 놓쳤을 때 — 실패로 단정하지 말고 다음 고정 시간에 최소 행동부터 재개합니다.", "야근이 반복될 때 — 운동을 더 넣기보다 종료 시각과 수면 시작 조건을 먼저 지킵니다.", "피로한데 할 일이 많을 때 — 새 일을 추가하지 않고 가장 큰 손실 하나만 처리합니다.", "감정을 참다가 폭발할 때 — 결정을 미루고 몸의 긴장을 낮춘 뒤 필요한 경계를 한 문장으로 말합니다."],
      actions: ["2주 기록을 시작합니다. 완료 조건: 수면·식사·활동·피로가 하루 한 줄로 남습니다.", "무너지는 조건 하나를 찾습니다. 완료 조건: 반복 시간과 촉발 상황이 확인됩니다.", "목표를 절반으로 줄입니다. 완료 조건: 고정 시간에 7일 중 5일 실행합니다.", "과로 경계를 정합니다. 완료 조건: 종료 시각 또는 거절 기준 하나를 지킵니다.", "필요 시 확인받습니다. 완료 조건: 경고 신호가 있으면 의료진에게 상담합니다."],
      stops: ["통증·어지럼·의도하지 않은 급격한 변화나 일상 기능 저하가 있으면 자기관리 실험을 멈추고 의료진을 확인합니다.", "수면·식욕·의욕 저하가 2주 이상 이어지면 계획 강화보다 상담을 우선합니다.", "목표를 지키기 위해 극단적 제한이나 무리한 운동이 필요하면 방법을 중단합니다."],
      final: "건강 흐름의 핵심은 더 강하게 버티는 것이 아니라 무너지는 조건을 줄이고 회복 가능한 작은 리듬을 만드는 것입니다. 몸의 경고는 해석하지 말고 확인받고, 생활 습관은 한 번에 하나씩 반복 가능하게 고치세요.",
    },
    housing: {
      label: DOMAIN_LABELS.housing,
      verdict: "이사나 주거 계획은 진행 가능성을 검토할 수 있습니다. 다만 대출 승인이나 입주를 보장할 수는 없으며 계약 문서, 월 고정비, 잔금일 자금 공백, 일정 대안을 먼저 확인해야 합니다.",
      analysis: "큰 그림과 생활 변화를 빨리 상상하지만 실제 위험은 등기, 선순위, 특약, 승인 조건, 잔금 일정 같은 세부에서 생깁니다. 집의 인상보다 보증금·대출 상환·관리비·교통비를 합친 월 고정비와 비상 현금을 먼저 계산하세요. 승인 전 계약금이나 회수하기 어려운 비용을 크게 넣지 않는 편이 안전합니다.\n\n일정은 낙관 시나리오 하나가 아니라 승인 지연, 기존 집 정리 지연, 잔금일 변경이라는 세 가지 대안을 준비해야 합니다. 구두 약속은 계약 조건이 아니므로 기관이나 전문가에게 서면으로 확인하세요.",
      supporting: "돈과 일정 조율이 직접 연결되는 보조 요인입니다. 가족이 함께 움직이면 통근·학교·돌봄·생활비 변화도 같은 표에서 비교해야 합니다. 원하는 집을 놓치는 불안이 확인 절차를 줄이지 않게 해야 합니다.",
      ...common,
      situations: ["대출 한도가 바뀔 때 — 급히 다른 빚을 늘리기보다 계약 해지·잔금 조정·후보 변경 순서를 확인합니다.", "오늘 계약을 압박받을 때 — 할인보다 등기·선순위·특약·회수 조건을 먼저 봅니다.", "잔금 일정이 어긋날 때 — 낙관적으로 기다리지 말고 필요한 단기 자금과 최악의 비용을 계산합니다.", "가족 의견이 갈릴 때 — 취향보다 월 고정비·통근·돌봄 시간을 같은 기준으로 비교합니다."],
      actions: ["후보별 총비용표를 만듭니다. 완료 조건: 보증금·상환·관리·교통비가 월 기준으로 보입니다.", "권리와 계약을 확인합니다. 완료 조건: 등기·선순위·특약·해지 조건을 서면 확인합니다.", "대출 조건을 확인합니다. 완료 조건: 승인 전제·금리·월 상환·변동 위험이 적힙니다.", "자금 공백을 계산합니다. 완료 조건: 계약금·잔금·기존 보증금 회수일이 한 표에 있습니다.", "대안 계획을 준비합니다. 완료 조건: 승인 또는 일정 지연 시 선택지가 정해집니다."],
      stops: ["등기·선순위·특약을 확인하지 못하면 계약을 진행하지 않습니다.", "대출 미승인 시 잔금을 감당할 대안이 없거나 월 고정비가 보수적 수입을 넘으면 보류합니다.", "구두 약속만 있고 해지·환불·일정 책임을 서면으로 남기지 않으면 재검토합니다."],
      final: "좋은 집을 빨리 잡는 것보다 잘못된 계약을 피하는 것이 먼저입니다. 문서, 월 고정비, 자금 공백, 지연 대안을 모두 확인한 뒤 진행해야 이사가 생활 개선으로 남습니다.",
    },
    private_fact: {
      label: DOMAIN_LABELS.private_fact,
      verdict: "상대가 거리를 두고 상황을 살피는 행동은 있을 수 있습니다. 그러나 CCTV 열람, 다른 사람과의 만남, 현재 마음, 정확한 연락 시점 같은 사적 사실은 생년월일로 확인되지 않습니다. 답은 추측이 아니라 접근 권한과 반복 행동에서 찾아야 합니다.",
      analysis: "상대의 미세한 반응을 잘 읽는 사람일수록 빈칸을 그냥 두기 어렵습니다. 연락 간격이나 온라인 흔적을 연결해 하나의 설명을 만들 수 있지만, 그 설명은 관찰이 아니라 해석일 수 있습니다. 더 그럴듯한 해석은 상대가 복잡한 상황에서 설명보다 거리와 시간을 먼저 두는 성향일 수 있다는 정도입니다.\n\n확인할 것은 약속을 지키는지, 설명 없이 사라지는 일이 반복되는지, 질문했을 때 책임 있게 답하는지, 실제 접근 권한이 있는지입니다. 한 번 직접 묻고도 답이 없으면 감시를 늘리기보다 내가 받아들일 관계 기준을 정해야 합니다.",
      supporting: "두려움은 사실 확인보다 더 많은 흔적 검색을 요구할 수 있습니다. 검색이 늘수록 확신은 커지지만 증거가 늘어난 것은 아닐 수 있습니다. 범죄나 감시가 실제로 의심될 만한 접근 기록이나 장치 이상이 있다면 상징이 아니라 보안 점검과 공식 도움을 사용하세요.",
      phases: ["1단계 · 관찰한 사실만 기록", "2단계 · 해석과 두려움 분리", "3단계 · 한 번의 직접 질문", "4단계 · 접근 권한과 반복 행동 확인", "5단계 · 경계 또는 관계 결정"],
      situations: ["온라인 흔적을 발견할 때 — 바로 결론내리지 말고 언제 무엇을 직접 봤는지만 기록합니다.", "연락이 끊길 때 — 다른 계정으로 확인하지 말고 한 번의 명확한 질문 뒤 기다림 기한을 정합니다.", "CCTV나 계정 접근이 의심될 때 — 생년월일 해석이 아니라 로그인 기록·권한·기기 보안을 확인합니다.", "상대가 모호하게 답할 때 — 말을 해석하지 말고 이후 약속과 행동의 일치를 봅니다."],
      actions: ["관찰과 해석을 분리합니다. 완료 조건: 직접 확인한 사실만 별도 목록에 적힙니다.", "접근 권한을 확인합니다. 완료 조건: 계정·기기·CCTV 권한과 기록을 실제로 점검합니다.", "한 번 직접 질문합니다. 완료 조건: 비난 없이 확인할 사실과 관계 의도를 묻습니다.", "관찰 기한을 정합니다. 완료 조건: 약속·설명·연락 행동을 정한 기간 확인합니다.", "경계를 선택합니다. 완료 조건: 증거가 없으면 추측을 멈추고 행동이 불안정하면 거리를 둡니다."],
      stops: ["거절이나 무응답 뒤 다른 계정·지인·감시로 확인하려는 행동은 중단합니다.", "증거 없이 외도·감시·범죄를 사실로 단정하지 않습니다.", "확인 행동 때문에 수면과 일상이 계속 무너지면 관계 판단을 멈추고 신뢰할 사람이나 전문가의 도움을 받습니다."],
      final: "이 질문의 결론은 상대의 비밀을 맞히는 것이 아닙니다. 확인 가능한 접근 권한과 반복 행동을 보고, 직접 질문에도 책임 있는 답이 없다면 더 많은 추측 대신 분명한 경계를 선택해야 합니다.",
    },
    growth: {
      label: DOMAIN_LABELS.growth,
      verdict: "지금은 선택지를 더 늘리기보다 이미 고른 한 가지를 검증하고 끝내는 방향이 맞습니다. 결정의 질은 가능성의 수가 아니라 완료 기준과 중단 기준이 얼마나 분명한지에서 갈립니다.",
      analysis: "새 가능성을 빨리 알아보는 힘이 있지만 불확실할수록 더 많은 선택지를 모아 안심하려 할 수 있습니다. 그러면 비교는 늘고 실제 경험은 줄어듭니다. 원하는 결과, 이번 선택이 해결할 문제, 확인할 증거, 감당할 손실을 한 장에 정리해야 합니다.\n\n하나를 고르는 것은 다른 가능성을 영원히 포기하는 일이 아닙니다. 정한 기간 동안 한 가지를 충분히 시험하고 결과를 얻은 뒤 다음 선택으로 이동하는 운영 방식입니다.",
      supporting: "일·돈·관계 중 어느 영역이든 회복되지 않은 피로는 모든 선택을 나쁘게 보이게 할 수 있습니다. 수면과 일상이 무너진 상태에서는 되돌리기 어려운 결정을 늦추고, 작은 실험으로 실제 반응을 확인하세요.",
      ...common,
      situations: ["새 선택지가 생길 때 — 바로 바꾸지 말고 현재 실험의 종료일과 완료 기준을 확인합니다.", "결과가 늦을 때 — 방향 전체를 버리기보다 병목 하나를 찾아 방법만 바꿉니다.", "주변 의견이 갈릴 때 — 호감과 두려움을 빼고 직접 확인할 증거를 정합니다.", "피로할 때 모든 것이 싫어질 때 — 큰 결정을 미루고 회복 뒤 같은 질문을 다시 봅니다."],
      actions: ["핵심 선택 하나를 정합니다. 완료 조건: 다른 선택은 보류 목록으로 옮깁니다.", "완료 기준을 적습니다. 완료 조건: 무엇이 끝나면 성공인지 측정할 수 있습니다.", "검증 행동을 실행합니다. 완료 조건: 실제 사람·시장·환경의 반응을 얻습니다.", "중간 결과를 검토합니다. 완료 조건: 사실·해석·기대를 분리합니다.", "계속·수정·중단을 결정합니다. 완료 조건: 사전 기준에 따라 다음 행동이 정해집니다."],
      stops: ["정한 기간 동안 의미 있는 증거가 없으면 방법을 바꿉니다.", "피로와 불안 때문에 선택지만 계속 늘어난다면 새 결정을 보류합니다.", "현재 결과가 미완성인데 다음 시작에 돈과 시간을 배정하려 하면 중단합니다."],
      final: "더 많은 답을 찾는 것이 아니라 한 선택을 충분히 시험해 자기 답으로 만드는 시기입니다. 완료와 중단 기준을 먼저 정하고 실제 결과로 판단하면 가능성이 방향으로 바뀝니다.",
    },
  };
  return plans[domain];
}

function englishDomainPlan(domain: DetailDomain, topic: ConcernTopic): DomainPlan {
  const label = ENGLISH_DOMAIN_LABELS[domain];
  const realityBoundary = domain === "private_fact"
    ? "A birth date cannot establish another person's location, contact, loyalty, surveillance status, or private intentions. Separate observed facts from inference and use a direct, lawful verification route."
    : `Treat ${label} as a decision problem, not a promised outcome. Separate what is known, what is inferred, what you hope for, and what still needs a real-world test.`;

  return {
    label,
    verdict: topicText(topic.verdict, "en"),
    analysis: `${topicText(topic.framing, "en")} ${topicText(topic.observe, "en")}\n\n${realityBoundary}`,
    supporting: "Check the material factors that can change the answer: available time, cash, authority, repeated behavior, documented commitments, and the cost of reversing the decision. A strong impression is useful as a hypothesis, but it is not yet evidence.",
    phases: [
      "Define the present state and the specific result you want.",
      "Run the smallest safe test and record the actual response.",
      "Separate repeated evidence from one-off exceptions.",
      "Expand only after the agreed evidence threshold is met.",
    ],
    situations: [
      "When urgency rises — delay irreversible spending or commitments until the missing fact is checked.",
      "When words and behavior conflict — use repeated behavior and documented commitments as the decision basis.",
      "When a new possibility appears — compare it with the completion cost of the current priority.",
      "When responsibility returns to you — clarify ownership, deadline, review point, and correction authority before taking the work back.",
    ],
    actions: [
      "Write the decision in one sentence. Completion condition: the desired result and deadline are explicit.",
      "List facts, inferences, expectations, and untested assumptions separately. Completion condition: every claim is in one column.",
      "Choose one low-risk validation step. Completion condition: it produces observable evidence rather than another opinion.",
      "Set a review date and threshold. Completion condition: continue, revise, and stop conditions are written in advance.",
      "Make the decision from the recorded evidence. Completion condition: the next action and owner are clear.",
    ],
    stops: [
      "Pause when a critical fact, legal condition, health issue, privacy issue, or financial obligation has not been verified through the appropriate channel.",
      "Reconsider when words and repeated behavior continue to conflict after the review date.",
      "Stop expanding when cost, workload, or emotional strain rises faster than validated benefit.",
    ],
    final: `Your strongest move in ${label} is not a larger prediction. It is a smaller, observable test followed by a clear decision rule. Use the 2026 cycle to validate, document, and complete before expanding.`,
  };
}

function domainPlan(locale: Locale, domain: DetailDomain, topic: ConcernTopic): DomainPlan {
  return locale === "ko"
    ? koreanDomainPlan(domain)
    : englishDomainPlan(domain, topic);
}

function genericProfileContent(
  locale: Locale,
  integrated: IntegratedProfile,
  profile: NumerologyProfile,
  birthYear: number,
  characterLabel: string,
  sharp: readonly string[],
): ExactProfileContent {
  const domainBody = (id: string) => {
    const item = integrated.domains.find((candidate) => candidate.id === id);
    return item ? `${item.personalizedInference} ${item.realityCheck}` : integrated.summary;
  };
  const ko = locale === "ko";
  const numberedSharp = sharp.length >= 5 ? sharp : [...sharp, ...integrated.risks].slice(0, 5);
  return {
    label: characterLabel,
    definition: ko
      ? `${integrated.summary} 강점은 ${integrated.strengths.join(", ")}에 있고, 실제 성과는 이 강점을 한 가지 완료 결과로 연결할 때 남습니다.`
      : integrated.summary,
    character: ko
      ? `${characterLabel}. 생명수 ${numberDisplay(profile.lifePath.value)}, 생일수 ${numberDisplay(profile.birthday.value)}, 태도수 ${numberDisplay(profile.attitude.value)}, 출생연도수 ${numberDisplay(birthYear)}의 조합을 행동 기준으로 풀어낸 이름입니다.`
      : `${characterLabel}. This label comes from the calculated combination.`,
    temperament: [domainBody("thinking"), domainBody("action"), domainBody("relationships")].join("\n\n"),
    contradiction: ko
      ? `중심 성향은 ${domainBody("thinking")} 반면 행동과 책임의 방식에서는 ${domainBody("action")} 이 두 흐름이 동시에 강해지면 속도와 완성 기준 사이에 긴장이 생깁니다.`
      : `${domainBody("thinking")} In action, ${domainBody("action")}`,
    decision: ko
      ? `처음 눈에 들어오는 신호, 확신을 만드는 근거, 확신이 커질 때 놓치는 반대 증거를 순서대로 확인해야 합니다. 사실·해석·기대·아직 시험하지 않은 가정을 나누고, 계속할 조건과 바꿀 조건을 결정 전에 적으세요. ${numberedSharp[0] ?? ""}`
      : `Separate fact, inference, expectation, and untested assumption. ${numberedSharp[0] ?? ""}`,
    ability: ko
      ? `${integrated.strengths.join(", ")}. ${domainBody("career")} ${numberedSharp[1] ?? ""}`
      : `${integrated.strengths.join(", ")}. ${domainBody("career")}`,
    failures: ko
      ? `${numberedSharp[2] ?? integrated.risks[0] ?? ""} 행동이 나타나는 상황, 그 행동을 만드는 내부 이유, 현실 결과, 수정 기준을 함께 봐야 합니다.\n\n${numberedSharp[3] ?? integrated.risks[1] ?? ""} 반복을 막으려면 새 선택보다 현재 결과의 완료 조건을 먼저 지켜야 합니다.`
      : `${numberedSharp[2] ?? ""}\n\n${numberedSharp[3] ?? ""}`,
    work: domainBody("career"),
    money: domainBody("money"),
    teamwork: `${domainBody("leadership")}\n\n${domainBody("relationships")}`,
    love: domainBody("relationships"),
    stress: `${domainBody("stress")}\n\n${numberedSharp[4] ?? ""}`,
    year: ko
      ? `2026년 개인년 ${numberDisplay(profile.personalYear.value)} 흐름은 현재 질문에서 검증과 완료 기준으로 적용됩니다. 외부 관심보다 반복 가능한 실제 결과를 우선하세요.`
      : `2026 Personal Year ${numberDisplay(profile.personalYear.value)} prioritizes validation and completion.`,
    phases: ko
      ? ["1. 기준 정리", "2. 작은 검증", "3. 실제 반응 확인", "4. 계속·수정·중단 결정"]
      : ["1. Define the criteria", "2. Run a small test", "3. Record the response", "4. Continue, revise, or stop"],
    situations: integrated.practicalActions.slice(0, 4),
    actions: integrated.practicalActions.slice(0, 5),
    stops: integrated.risks.slice(0, 3).map((risk) => ko ? `${risk} 상황이 반복되면 현재 방법을 보류하고 기준을 다시 확인합니다.` : `Reconsider when ${risk} repeats.`),
    conclusion: ko
      ? `${characterLabel}의 강점은 가능성을 실제 결과로 연결할 때 완성됩니다. 2026년에는 선택지를 늘리기보다 한 가지를 검증하고 끝내는 방향이 맞습니다.`
      : `${characterLabel} becomes useful when one possibility is validated and completed.`,
    sharp: numberedSharp.slice(0, 5),
  };
}

function calculationBody(
  locale: Locale,
  profile: NumerologyProfile,
  birthYear: number,
  phase: string,
): string {
  return localized(
    locale,
    [
      `생명수 ${numberDisplay(profile.lifePath.value)} — 삶 전체에서 반복되는 중심 동기와 사람·상황을 해석하는 기본 방식입니다.`,
      `생일수 ${numberDisplay(profile.birthday.value)} — 실제 행동, 일의 처리, 결과를 마무리하는 방식에 직접 나타납니다.`,
      `태도수 ${numberDisplay(profile.attitude.value)} — 새로운 상황을 처음 보고 반응하며 책임을 받아들이는 방식입니다.`,
      `출생연도수 ${numberDisplay(birthYear)} — 변화와 외부 환경에 적응할 때 드러나는 배경 리듬입니다.`,
      `2026 개인년 ${numberDisplay(profile.personalYear.value)} · ${phase} — 올해 질문에서 우선 확인할 방향과 속도입니다.`,
      "같은 생년월일에는 같은 계산 결과가 적용됩니다. 상품 가격은 숫자를 바꾸지 않고 분석 범위와 의사결정 구조의 깊이만 바꿉니다.",
    ].join("\n\n"),
    `Life Path ${numberDisplay(profile.lifePath.value)}, Birthday ${numberDisplay(profile.birthday.value)}, Attitude ${numberDisplay(profile.attitude.value)}, Birth Year ${numberDisplay(birthYear)}, and 2026 Personal Year ${numberDisplay(profile.personalYear.value)} (${phase}). The same birth date always produces the same facts.`,
  );
}

function formatted(items: readonly string[]): string {
  return items.map((item, index) => `${index + 1}. ${item.replace(/^\d+(?:단계)?\s*[·.—-]?\s*/u, "")}`).join("\n\n");
}

function unique(items: readonly string[], limit: number): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const normalized = item.trim().replace(/\s+/g, " ");
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(item.trim());
    if (result.length === limit) break;
  }
  return result;
}

export function createDetailPaidReport(
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
    personalYear: DETAIL_REPORT_SERVICE_YEAR,
  });
  const birthYear = calculateBirthYearNumber(input.birthDate).value;
  const integrated = createIntegratedProfile(profile, locale);
  const personalYear = describePersonalYear(profile.personalYear.value, locale);
  const { topic, matched } = resolveConcernTopic(concern, input.focusId);
  const domain = domainFor(topic, concern);
  const plan = domainPlan(locale, domain, topic);
  const character = buildCharacterLabel(profile.lifePath.value, profile.attitude.value, locale);
  const baseSharp = pickSharpInsights(profile.lifePath.value, 5, locale);
  const exact = locale === "ko" ? EXACT_PROFILES[combinationKey(profile, birthYear)] : undefined;
  const profileContent = exact ?? genericProfileContent(
    locale,
    integrated,
    profile,
    birthYear,
    character.label,
    baseSharp,
  );
  const safety = assessQuestionSafety(concern);
  const context = createOnboardingReflectionContext({
    locale,
    focusId: input.focusId,
    depth: "deep",
    concern: concern.slice(0, 1_000),
    aiPersonalizationConsent: false,
  });

  const safetyVerdict = localized(
    locale,
    "이 질문은 지금 진행 여부를 단정하기보다 해당 분야의 자격을 갖춘 전문가나 공식 기관에서 사실을 먼저 확인해야 합니다. 아래 분석은 그 확인을 대신하지 않으며, 반복되는 판단 방식과 준비 조건을 정리하는 용도로만 사용하세요.",
    "This requires factual confirmation from the relevant qualified professional or formal channel first. The analysis below organizes decision patterns but does not replace that check.",
  );
  const direct = safety.requiresRealityFirstGuidance
    ? safetyVerdict
    : localized(locale, plan.verdict, topicText(topic.verdict, locale));
  const topicAnalysis = safety.requiresRealityFirstGuidance
    ? localized(
        locale,
        `${plan.analysis}\n\n자격을 갖춘 전문가나 공식 기관에서 확인할 사실은 해석과 분리하세요. 확인 전에는 되돌리기 어려운 결정이나 비용 지출을 미루고, 공식 답변과 문서를 받은 뒤 다음 단계를 정하는 편이 안전합니다.`,
        `${plan.analysis}\n\nKeep facts requiring a qualified professional or formal channel separate from interpretation. Delay irreversible action until that check is complete.`,
      )
    : localized(
        locale,
        `${plan.analysis}\n\n${topicText(topic.framing, locale)} ${topicText(topic.observe, locale)} ${topicText(topic.caution, locale)}${topic.escalate ? ` ${topicText(topic.action, locale)}` : ""}${matched ? "" : " 질문의 구체적 상황이 짧아 선택한 관심 영역의 검증 기준을 중심으로 구성했습니다."}`,
        `${plan.analysis}\n\n${topicText(topic.caution, locale)}${topic.escalate ? ` ${topicText(topic.action, locale)}` : ""}`,
      );
  const resolvedTopicLabel = topicText(topic.label, locale);
  const domainSectionTitle = safety.requiresRealityFirstGuidance
    ? localized(locale, `먼저 확인해야 할 것 · ${resolvedTopicLabel}`, `Confirm first · ${resolvedTopicLabel}`)
    : localized(
        locale,
        `질문 분야 상세 분석 · ${resolvedTopicLabel}${resolvedTopicLabel === plan.label ? "" : ` · ${plan.label}`}`,
        `Detailed domain analysis · ${resolvedTopicLabel}${resolvedTopicLabel === plan.label ? "" : ` · ${plan.label}`}`,
      );
  const directBody = localized(
    locale,
    `${direct}\n\n이 결론은 생명수 ${numberDisplay(profile.lifePath.value)}, 생일수 ${numberDisplay(profile.birthday.value)}, 태도수 ${numberDisplay(profile.attitude.value)}, 출생연도수 ${numberDisplay(birthYear)}, 2026 개인년 ${numberDisplay(profile.personalYear.value)}의 조합과 질문 분야를 함께 적용한 결과입니다.`,
    `${direct}\n\nThis applies the calculated profile and 2026 Personal Year to the selected domain.`,
  );
  const yearBody = localized(
    locale,
    `${profileContent.year}\n\n현재 개인년은 ${personalYear.phase} 흐름입니다. ${personalYear.timing} ${domain === "business" ? "외부 관심보다 유료 전환·반복 사용·환불·이탈·기술 안정성을 같은 표에서 확인하세요." : `${plan.label} 질문에서는 기대보다 반복 행동과 완료 증거를 우선해야 합니다.`}`,
    `2026 is a ${personalYear.phase} phase. ${personalYear.timing}`,
  );
  const sections = hasQuestion
    ? [
        { title: ko ? "질문에 대한 직접 결론" : "Direct answer", body: directBody },
        { title: ko ? "핵심 숫자" : "Core numbers", body: calculationBody(locale, profile, birthYear, personalYear.phase) },
        { title: ko ? "캐릭터 한 줄" : "Character in one line", body: profileContent.character },
        { title: ko ? "핵심 성향과 기질" : "Core temperament", body: profileContent.temperament },
        { title: ko ? "숫자 조합 안의 모순" : "Internal contradiction", body: profileContent.contradiction },
        { title: ko ? "생각하고 결정하는 방식" : "Decision pattern", body: profileContent.decision },
        { title: ko ? "가장 강한 능력" : "Strongest ability", body: profileContent.ability },
        { title: ko ? "반복되는 실패 패턴" : "Repeated failure mechanisms", body: profileContent.failures },
        { title: domainSectionTitle, body: topicAnalysis },
        { title: ko ? "직접 연결되는 보조 요인" : "Material supporting factors", body: localized(locale, plan.supporting, plan.supporting) },
        { title: ko ? "압박을 받을 때 나타나는 모습" : "Under pressure", body: profileContent.stress },
        { title: ko ? "2026년 핵심 흐름" : "2026 direction", body: yearBody },
        { title: ko ? "단계별 방향" : "Phased direction", body: formatted(plan.phases) },
        { title: ko ? "상황별 대처" : "Situation-specific responses", body: formatted(plan.situations) },
        { title: ko ? "보류·중단·재검토 기준" : "Stop, hold, or reconsider", body: formatted(plan.stops) },
        { title: ko ? "최종 결론" : "Final conclusion", body: localized(locale, plan.final, plan.final) },
      ]
    : [
        { title: ko ? "핵심 숫자" : "Core numbers", body: calculationBody(locale, profile, birthYear, personalYear.phase) },
        { title: ko ? "직접적인 인물 정의" : "Direct person definition", body: profileContent.definition },
        { title: ko ? "캐릭터 한 줄" : "Character in one line", body: profileContent.character },
        { title: ko ? "핵심 성향과 기질" : "Core temperament", body: profileContent.temperament },
        { title: ko ? "숫자 조합 안의 모순" : "Internal contradiction", body: profileContent.contradiction },
        { title: ko ? "생각하고 결정하는 방식" : "Decision pattern", body: profileContent.decision },
        { title: ko ? "가장 강한 능력" : "Strongest ability", body: profileContent.ability },
        { title: ko ? "반복되는 실패 패턴" : "Repeated failure mechanisms", body: profileContent.failures },
        { title: ko ? "직업·사업 방향" : "Work and business", body: profileContent.work },
        { title: ko ? "재물 흐름" : "Money flow", body: profileContent.money },
        { title: ko ? "인간관계와 협업" : "People and collaboration", body: profileContent.teamwork },
        { title: ko ? "연애와 가까운 관계" : "Close relationships", body: profileContent.love },
        { title: ko ? "압박을 받을 때 나타나는 모습" : "Under pressure", body: profileContent.stress },
        { title: ko ? "2026년 핵심 흐름" : "2026 direction", body: yearBody },
        { title: ko ? "단계별 방향" : "Phased direction", body: formatted(profileContent.phases) },
        { title: ko ? "상황별 대처" : "Situation-specific responses", body: formatted(profileContent.situations) },
        { title: ko ? "보류·중단·재검토 기준" : "Stop, hold, or reconsider", body: formatted(profileContent.stops) },
        { title: ko ? "최종 결론" : "Final conclusion", body: profileContent.conclusion },
      ];

  const actions = unique(
    [
      ...(hasQuestion && !safety.requiresRealityFirstGuidance ? [topicText(topic.action, locale)] : []),
      ...(hasQuestion ? plan.actions : profileContent.actions),
      ...plan.actions,
      context.practicalAction,
      ...integrated.practicalActions,
    ],
    5,
  );
  const cautions = safety.requiresRealityFirstGuidance
    ? [safetyVerdict, context.realityCheck]
    : topic.escalate
      ? [topicText(topic.caution, locale)]
      : [];

  return {
    version: 1,
    orderId,
    productCode: input.productCode,
    locale,
    title: ko ? "나의 상세 리딩" : "My detailed reading",
    customerName: input.name || null,
    createdAt: new Date().toISOString(),
    concern,
    summary: hasQuestion
      ? localized(locale, "질문의 결론부터 판단 구조와 실행 기준까지 상세히 정리했습니다.", "A detailed answer, decision structure, and execution criteria.")
      : localized(locale, "생년월일만으로 구성한 상세 인물·직업·재물·관계·2026년 리포트입니다.", "A detailed profile and 2026 report from the birth date."),
    sections,
    actions,
    cautions,
    disclaimer: localized(
      locale,
      "이 리포트는 자기이해와 선택 정리를 위한 참고 자료이며 미래, 건강, 투자 수익, 대출 승인 또는 타인의 사적 사실을 보장하지 않습니다.",
      "This report supports reflection and decision-making. It does not guarantee the future, health outcomes, investment returns, loan approval, or another person's private facts.",
    ),
    tierLabel: tierBadgeLabel("pro_30d", locale),
    characterLabel: profileContent.label,
    sharpInsights: profileContent.sharp.slice(0, 5),
    contentVersion: DETAIL_REPORT_CONTENT_VERSION,
    sectionPlan: "detail-39000-v2",
    calculationBasis: {
      birthDate: input.birthDate,
      serviceYear: DETAIL_REPORT_SERVICE_YEAR,
      lifePath: profile.lifePath.value,
      birthday: profile.birthday.value,
      attitude: profile.attitude.value,
      birthYear,
      personalYear: profile.personalYear.value,
    },
    contentReferences: [
      exact ? `detail-exact:${combinationKey(profile, birthYear)}` : "detail-profile:fallback",
      `topic:${topic.id}`,
      `domain:${domain}`,
      `personal-year:${profile.personalYear.value}`,
      "tier:DETAIL_39000",
    ],
  };
}
