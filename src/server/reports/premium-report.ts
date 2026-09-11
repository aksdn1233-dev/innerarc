import { assessQuestionSafety } from "@/core/ai/safety";
import {
  calculateBirthYearNumber,
  calculateNumerologyProfile,
} from "@/core/numerology";
import type { PaidReadingInput, PaidReport } from "@/core/paid-reading";
import { createIntegratedProfile, describeIntegratedNumber } from "@/core/profile";
import { withParticle } from "@/core/korean-particles";
import { describePersonalYear } from "@/core/profile/personal-year-theme";
import { pickSharpInsights } from "@/core/profile/sharp-insights";
import {
  auditTierComparison,
  DETAIL_COVERAGE_CATEGORIES,
  PREMIUM_ONLY_CATEGORIES,
  type DetailCoverageCategory,
  type EnrichmentAuditEntry,
  type PremiumOnlyCategory,
} from "@/core/tier-inheritance";
import { resolveConcernTopic, topicText } from "@/core/topics/concern-topics";
import { tierBadgeLabel } from "@/core/tiers";
import type { Locale } from "@/i18n/config";
import { createDetailPaidReport } from "@/server/reports/detail-report";

export const PREMIUM_REPORT_SERVICE_YEAR = 2026;
export const PREMIUM_REPORT_CONTENT_VERSION = "premium-report-composer-2.0.0";

type PremiumDomain =
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

type DomainStrategy = Readonly<{
  subject: string;
  proof: string;
  positive: string;
  warning: string;
  contradiction: string;
  threshold: string;
  longTerm: string;
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

function digitSum(value: string): number {
  return [...value].reduce((sum, digit) => sum + Number(digit), 0);
}

function compoundDisplay(compound: number, reduced: number): string {
  return compound === reduced ? numberDisplay(reduced) : `${compound}/${numberDisplay(reduced)}`;
}

function domainFrom(report: PaidReport): PremiumDomain {
  const reference = report.contentReferences?.find((item) => item.startsWith("domain:"));
  const value = reference?.slice("domain:".length);
  const supported: readonly PremiumDomain[] = [
    "business", "career", "promotion", "money", "love", "reconciliation",
    "compatibility", "child", "education", "study", "health", "housing", "private_fact", "growth",
  ];
  return supported.includes(value as PremiumDomain) ? value as PremiumDomain : "growth";
}

function strategyFor(domain: PremiumDomain, locale: Locale): DomainStrategy {
  if (locale === "en") {
    return {
      subject: domain.replace("_", " "),
      proof: "repeatable behavior, written terms, and completed outcomes",
      positive: "the other side responds consistently and the next step is documented",
      warning: "promises increase while dates, ownership, or evidence stay vague",
      contradiction: "new facts repeatedly conflict with the explanation you were given",
      threshold: "two missed commitments or one irreversible-risk event",
      longTerm: "build a repeatable decision record and review it every quarter",
    };
  }
  const common = {
    growth: {
      subject: "생활과 성장 방향",
      proof: "기록 가능한 반복 행동과 실제 완료 결과",
      positive: "한 번의 의욕이 아니라 같은 행동이 3주 이상 이어짐",
      warning: "계획은 늘어나지만 수면·일정·완료율이 동시에 무너짐",
      contradiction: "원하는 방향과 매주 실제로 쓰는 시간이 계속 다름",
      threshold: "3주 연속 핵심 행동 미완료 또는 일상 기능의 뚜렷한 저하",
      longTerm: "분기마다 버릴 목표 하나와 지킬 습관 하나를 정해 집중력을 보존하세요.",
    },
    business: {
      subject: "사업과 시장 선택",
      proof: "유료 전환, 반복 사용, 환불·이탈, 기술 안정성",
      positive: "실제 결제와 재사용이 함께 늘고 고객 문의가 더 구체적으로 바뀜",
      warning: "관심 수치는 오르지만 결제·재사용·추천이 따라오지 않음",
      contradiction: "고객이 말한 필요와 실제로 돈을 쓰는 기능이 다름",
      threshold: "두 번의 검증 주기에서 유료 전환 개선 없음 또는 환불·장애 급증",
      longTerm: "큰 확장보다 한 고객군의 반복 구매가 확인된 뒤 채널과 상품을 넓히세요.",
    },
    career: {
      subject: "직업 선택과 역할 적합성",
      proof: "권한, 평가 기준, 실제 업무 비중, 성장 가능한 기술",
      positive: "맡은 책임과 결정권이 맞고 성과 기준을 문서로 합의함",
      warning: "직함은 좋아지지만 권한 없이 책임과 긴급 업무만 늘어남",
      contradiction: "채용 설명과 실제 주간 업무가 절반 이상 다름",
      threshold: "두 차례 조정 요청 뒤에도 권한·업무 범위가 바뀌지 않음",
      longTerm: "직함보다 2년 뒤 남을 역량·의사결정권·성과 기록을 기준으로 이동하세요.",
    },
    promotion: {
      subject: "승진과 역할 확대",
      proof: "평가 기준, 권한 범위, 보상, 후임·지원 자원",
      positive: "기대 성과와 보상·권한이 같은 문서에 적힘",
      warning: "책임은 즉시 늘지만 보상과 결정권은 나중으로 미뤄짐",
      contradiction: "공식 평가와 실제 피드백이 서로 다름",
      threshold: "보상·권한 확정일이 두 번 밀리거나 책임만 먼저 부과됨",
      longTerm: "승진 자체보다 새 역할에서 쌓을 증거와 다음 협상 시점을 먼저 설계하세요.",
    },
    money: {
      subject: "재물과 자원 배분",
      proof: "현금흐름, 손실 한도, 계약 조건, 회수 가능성",
      positive: "수입·지출·부채·비상자금이 숫자로 보이고 손실 한도가 정해짐",
      warning: "수익 기대만 선명하고 최악의 손실과 회수 시점은 설명하지 못함",
      contradiction: "말한 위험 수준보다 실제 투입 금액과 부채 비율이 큼",
      threshold: "비상자금 훼손, 고금리 부채 사용, 계약 핵심 조건 미확인 중 하나",
      longTerm: "기회마다 새로 판단하지 말고 투입 한도·검토 기간·철회 기준을 고정하세요.",
    },
    housing: {
      subject: "주거·대출과 장기 지출",
      proof: "승인 가능액이 아닌 실제 상환액, 비상자금, 계약 해지 비용",
      positive: "금리 상승과 소득 감소를 넣어도 생활비와 비상자금이 유지됨",
      warning: "승인 여부만 보고 관리비·세금·수리비·이사 비용을 빼놓음",
      contradiction: "원하는 생활과 감당 가능한 월 고정비가 맞지 않음",
      threshold: "비상자금 6개월 미만 또는 월 상환액이 안전 한도를 넘음",
      longTerm: "집의 상징성보다 3년간의 현금흐름과 이동 가능성을 함께 보세요.",
    },
    love: {
      subject: "연애와 가까운 관계",
      proof: "연락의 일관성, 약속 이행, 갈등 뒤 회복 행동, 경계 존중",
      positive: "좋은 말보다 약속·시간·갈등 수습 행동이 반복됨",
      warning: "확신을 요구하면서 정작 관계의 책임과 계획은 피함",
      contradiction: "말로는 가까워진다면서 행동은 계속 비공개·회피 쪽으로 감",
      threshold: "경계를 두 번 무시하거나 모욕·통제·위협이 한 번이라도 나타남",
      longTerm: "감정의 강도보다 서로의 생활과 경계가 안정되는지를 관계의 기준으로 삼으세요.",
    },
    reconciliation: {
      subject: "재회와 관계 회복",
      proof: "이별 원인에 대한 구체적 변화, 책임 인정, 재발 방지 행동",
      positive: "그리움 표현보다 이전 문제를 바꾼 증거와 새 합의가 있음",
      warning: "외로울 때만 연락하고 같은 문제의 책임은 계속 피함",
      contradiction: "바뀌었다고 말하지만 이전 갈등 조건이 그대로 남아 있음",
      threshold: "같은 경계 침해 재발 또는 변화 증거 없는 세 번째 반복",
      longTerm: "재회 여부보다 다시 만나도 같은 일이 반복되지 않을 구조부터 확인하세요.",
    },
    compatibility: {
      subject: "두 사람의 궁합과 협업",
      proof: "갈등 방식, 돈·시간 기준, 책임 분담, 회복 속도",
      positive: "차이를 없애려 하지 않고 역할과 대화 규칙으로 조정함",
      warning: "한 사람만 계속 설명·양보·수습을 담당함",
      contradiction: "합의한 규칙이 불편한 순간마다 무효가 됨",
      threshold: "같은 핵심 합의를 두 번 깨고 수습 행동도 없음",
      longTerm: "잘 맞는 감정보다 다를 때 안전하게 조정할 수 있는지를 보세요.",
    },
    child: {
      subject: "아이의 기질과 양육",
      proof: "연령에 맞는 반복 행동, 환경별 차이, 교사·보호자 관찰",
      positive: "아이에게 맞는 설명과 환경에서 회복·집중 시간이 좋아짐",
      warning: "한 번의 행동을 성격 전체로 단정하거나 비교로 교정하려 함",
      contradiction: "집과 학교 관찰이 크게 다른데 한쪽 설명만 사실로 취급함",
      threshold: "수면·식사·등교·또래 관계의 저하가 2주 이상 이어짐",
      longTerm: "성격을 고치는 대신 강점이 안전하게 쓰일 환경과 도움 요청 통로를 만드세요.",
    },
    education: {
      subject: "학업과 시험 준비",
      proof: "주간 학습량, 오답 감소, 모의 점수 추세, 수면과 집중",
      positive: "계획량보다 완료량이 늘고 같은 유형의 실수가 줄어듦",
      warning: "불안을 줄이려고 자료와 강의만 늘리고 복습·시험 연습은 미룸",
      contradiction: "공부 시간은 늘지만 수면 저하로 정확도와 회상이 떨어짐",
      threshold: "2주간 오답률 개선 없음 또는 수면·식사·일상 기능의 뚜렷한 악화",
      longTerm: "의지보다 회독·오답·모의시험의 주기를 고정해 실력을 증거로 남기세요.",
    },
    study: {
      subject: "학업과 시험 준비",
      proof: "완료한 문제 수, 오답 재시험 정답률, 모의 점수 추세, 수면과 집중",
      positive: "계획량보다 완료량이 늘고 같은 유형의 실수가 두 번 연속 줄어듦",
      warning: "불안을 줄이려고 자료와 강의만 늘리고 오답·실전 연습은 미룸",
      contradiction: "공부 시간은 늘지만 수면 저하로 정확도와 회상이 계속 떨어짐",
      threshold: "2주간 오답률 개선 없음 또는 수면·식사·일상 기능의 뚜렷한 악화",
      longTerm: "의지보다 회상·오답·모의시험의 주기를 고정해 실력을 증거로 남기세요.",
    },
    health: {
      subject: "건강 습관과 회복 관리",
      proof: "증상 기록, 수면·식사·활동 변화, 의료진의 확인",
      positive: "전문가의 안내와 생활 기록이 함께 쌓이며 기능이 안정됨",
      warning: "해석만으로 진단·약·검사를 대신하거나 심한 증상을 기다림",
      contradiction: "괜찮다는 기대와 실제 증상 빈도·강도가 계속 다름",
      threshold: "급격한 악화·위험 신호는 즉시 진료, 지속 증상은 의료진과 재평가",
      longTerm: "예언이 아니라 진료와 기록을 중심에 두고 회복 가능한 생활 구조를 만드세요.",
    },
    private_fact: {
      subject: "타인의 마음과 확인되지 않은 사실",
      proof: "직접 대화, 합의된 행동, 확인 가능한 기록",
      positive: "추측 대신 질문할 수 있고 답과 행동이 일치함",
      warning: "빈칸을 상상으로 채우며 상대의 사생활을 사실처럼 단정함",
      contradiction: "확인 가능한 행동이 원하는 해석과 계속 다름",
      threshold: "대화 거부가 반복되거나 경계 침해·감시 행동으로 넘어감",
      longTerm: "알 수 없는 마음을 맞히려 하기보다 내가 허용할 행동의 기준을 분명히 하세요.",
    },
  } satisfies Record<PremiumDomain, DomainStrategy>;
  return common[domain];
}

function unique(items: readonly string[], limit: number): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const key = item.trim().replace(/\s+/gu, " ");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item.trim());
    if (result.length === limit) break;
  }
  return result;
}

function enrichBody(
  category: DetailCoverageCategory,
  body: string,
  addition: string,
): string {
  void category;
  return `${body}\n\n${addition}`;
}

function categoryForTitle(title: string, index: number): DetailCoverageCategory {
  if (/직접 결론|Direct answer|직접적인 인물/.test(title)) return "direct_answer";
  if (/핵심 숫자|Core numbers/.test(title)) return "core_numbers";
  if (/캐릭터|Character/.test(title)) return "character";
  if (/기질|temperament/i.test(title)) return "temperament";
  if (/모순|contradiction/i.test(title)) return "contradiction";
  if (/결정|Decision pattern/.test(title)) return "decision_pattern";
  if (/강한 능력|Strongest ability/.test(title)) return "strongest_ability";
  if (/실패|failure/i.test(title)) return "failure_mechanisms";
  if (/질문 분야|먼저 확인|domain analysis|Confirm first/.test(title)) return "main_domain";
  if (/직업·사업|Work and business/.test(title)) return "work_business";
  if (/재물|Money flow/.test(title)) return "money_resources";
  if (/인간관계와 협업|People and collaboration/.test(title)) return "people_collaboration";
  if (/연애와 가까운|Close relationships/.test(title)) return "close_relationships";
  if (/보조 요인|supporting factors/i.test(title)) return "main_domain";
  if (/압박|Under pressure/.test(title)) return "stress_response";
  if (/2026|direction/.test(title)) return "current_year";
  if (/단계별|Phased/.test(title)) return "phased_direction";
  if (/상황별|Situation-specific/.test(title)) return "situational_response";
  if (/보류|Stop, hold/.test(title)) return "stop_hold_boundary";
  if (/최종 결론|Final conclusion/.test(title)) return "strong_conclusion";
  return DETAIL_COVERAGE_CATEGORIES[index % DETAIL_COVERAGE_CATEGORIES.length];
}

function dimensionsFor(category: DetailCoverageCategory): readonly PremiumOnlyCategory[] {
  const map: Partial<Record<DetailCoverageCategory, readonly PremiumOnlyCategory[]>> = {
    core_numbers: ["cross_number_synthesis"],
    character: ["cross_number_synthesis", "hidden_motivation"],
    temperament: ["hidden_motivation", "defense_mechanism"],
    contradiction: ["strength_failure_paradox", "root_cause"],
    decision_pattern: ["decision_framework"],
    strongest_ability: ["strength_failure_paradox"],
    failure_mechanisms: ["root_cause", "observable_signals"],
    main_domain: ["detailed_strategy"],
    stress_response: ["defense_mechanism"],
    current_year: ["three_scenarios"],
    phased_direction: ["expanded_manual"],
    situational_response: ["observable_signals"],
    prioritized_action: ["expanded_manual", "detailed_strategy"],
    stop_hold_boundary: ["five_stop_conditions", "risk_checklist"],
    strong_conclusion: ["consultant_verdict"],
    grounded_advice: ["long_term_strategy"],
  };
  return map[category] ?? ["detailed_strategy"];
}

export function createPremiumPaidReport(
  orderId: string,
  input: PaidReadingInput,
): PaidReport {
  const locale = input.locale;
  const concern = input.concern.trim();
  const hasQuestion = concern.length > 0;
  const detail = createDetailPaidReport(orderId, { ...input, productCode: "pro_30d" });
  const profile = calculateNumerologyProfile({
    birthDate: input.birthDate,
    name: input.name,
    personalYear: PREMIUM_REPORT_SERVICE_YEAR,
  });
  const birthYear = calculateBirthYearNumber(input.birthDate).value;
  const integrated = createIntegratedProfile(profile, locale);
  const personalYear = describePersonalYear(profile.personalYear.value, locale);
  const domain = domainFrom(detail);
  const strategy = strategyFor(domain, locale);
  const { topic } = resolveConcernTopic(concern, input.focusId);
  const safety = assessQuestionSafety(concern);
  const [, month, day] = input.birthDate.split("-");
  const dayCompound = Number(day);
  const attitudeCompound = Number(month) + Number(day);
  const yearCompound = digitSum(input.birthDate.slice(0, 4));
  const sharp = unique(
    [...(detail.sharpInsights ?? []), ...pickSharpInsights(profile.lifePath.value, 8, locale)],
    8,
  );
  const life = numberDisplay(profile.lifePath.value);
  const birthday = compoundDisplay(dayCompound, profile.birthday.value);
  const attitude = compoundDisplay(attitudeCompound, profile.attitude.value);
  const year = compoundDisplay(yearCompound, birthYear);
  const lifeTheme = describeIntegratedNumber(profile.lifePath.value, locale);
  const birthdayTheme = describeIntegratedNumber(profile.birthday.value, locale);
  const attitudeTheme = describeIntegratedNumber(profile.attitude.value, locale);
  const yearTheme = describeIntegratedNumber(birthYear, locale);
  const synthesis = localized(
    locale,
    `네 축은 생명수 ${life}의 ${lifeTheme.drive}, 생일수 ${birthday}의 ${birthdayTheme.drive}, 태도수 ${attitude}의 ${attitudeTheme.drive}, 출생연도수 ${year}의 ${yearTheme.drive}입니다. 중심 동력: ${lifeTheme.strength}. 실행 강점: ${birthdayTheme.strength}. 첫인상과 접근 방식: ${attitudeTheme.strength}. 오래 반복되는 바탕: ${yearTheme.strength}. 네 숫자는 서로의 역할을 바꾸어 설명하지 않고 각자의 위치에서 함께 읽습니다.`,
    `Life Path ${life} (${lifeTheme.drive}), Birthday ${birthday} (${birthdayTheme.drive}), Attitude ${attitude} (${attitudeTheme.drive}), and Birth Year ${year} (${yearTheme.drive}) work together without swapping their roles.`,
  );
  const hidden = localized(
    locale,
    `겉으로는 결과와 해결을 중시하지만 숨은 동기는 단순한 승부욕이 아니라 '내가 책임진 판이 무너지지 않아야 한다'는 보호 욕구에 가깝습니다. 압박이 커지면 도움을 청하기보다 정보·일정·사람을 직접 통제하는 방어가 나타날 수 있습니다. 이 방어는 단기 위기를 넘기게 하지만 장기적으로는 위임 실패와 관계 피로를 만듭니다.`,
    "The hidden motive is not status alone but keeping the system you carry from failing. Under pressure this can become control rather than delegation.",
  );
  const paradox = localized(
    locale,
    `가장 큰 강점인 속도·책임감·결과 집착이 바로 실패의 원인이 되기도 합니다. 남보다 먼저 빈틈을 보고 직접 메우면 초반 성과는 빠르지만, 기준이 공유되지 않아 결국 본인만 모든 일을 아는 구조가 됩니다. 뿌리 원인은 능력 부족이 아니라 '설명하고 기다리는 시간보다 내가 하는 편이 빠르다'는 반복 선택입니다.`,
    "The same speed and responsibility that create early results can produce a system only you can operate. The root cause is repeatedly choosing control over explicit handoff.",
  );
  const directExtension = safety.requiresRealityFirstGuidance
    ? localized(
        locale,
        `우선순위는 해석이 아니라 해당 분야 전문가의 사실 확인입니다. 확인 전에는 큰 비용·약 변경·계약·관계 단절처럼 되돌리기 어려운 행동을 보류하세요.`,
        "Professional or formal fact-checking comes before interpretation; delay irreversible action until it is complete.",
      )
    : localized(
        locale,
        `${topicText(topic.verdict, locale)} 프리미엄 판단의 핵심 조건은 ${strategy.proof}입니다. 이 증거가 쌓이면 진행하고, 말과 기대만 커지면 속도를 낮추세요.`,
        `${topicText(topic.verdict, locale)} The deciding evidence is ${strategy.proof}.`,
      );

  const addedByCategory: Record<DetailCoverageCategory, string> = {
    direct_answer: directExtension,
    core_numbers: synthesis,
    character: localized(locale, `${detail.characterLabel}. 이 이름은 강함만 뜻하지 않습니다. 성과를 만들 힘과 사람·책임을 지키려는 감각이 동시에 작동한다는 뜻입니다.`, `${detail.characterLabel}. This label names both execution and responsibility.`),
    temperament: hidden,
    contradiction: paradox,
    decision_pattern: localized(locale, `판단할 때는 사실·해석·가정을 세 칸으로 나누세요. 사실은 ${strategy.proof}, 해석은 현재 가장 가능성 높은 설명, 가정은 아직 확인하지 못한 기대입니다. 사실 두 개가 모이기 전에는 되돌리기 어려운 결정을 확정하지 않는 것이 좋습니다.`, `Separate facts, interpretation, and assumptions. Require two independent facts before an irreversible decision.`),
    strongest_ability: localized(locale, `이 능력을 오래 쓰려면 '내가 해결한 결과'보다 '다른 사람도 반복할 수 있는 기준'을 남겨야 합니다. 규모가 커질수록 직접 처리량보다 의사결정 기준의 전달력이 성과를 결정합니다.`, "Make the strength repeatable by leaving criteria other people can use."),
    failure_mechanisms: localized(locale, `관찰 가능한 경고 신호는 일정이 계속 밀리고, 설명 없이 일을 다시 가져오고, 휴식 중에도 확인을 멈추지 못하는 것입니다. 세 신호 중 두 개가 2주 이어지면 의지 문제가 아니라 구조 문제로 보고 범위를 줄이세요.`, "Treat two persistent warning signs as a structural problem, not a willpower problem."),
    main_domain: localized(locale, `${strategy.subject}에서는 ${withParticle(strategy.proof, "object")} 판단표의 맨 위에 두세요. 유리한 해석을 고르는 대신 매주 같은 항목을 확인해야 실제 변화와 희망 섞인 기대를 구분할 수 있습니다.`, `In ${strategy.subject}, place ${strategy.proof} at the top of the decision record.`),
    work_business: localized(locale, `직업·사업에서는 직함이나 가능성보다 책임과 권한의 균형, 반복 수익 또는 완료 증거를 보세요. 혼자 메운 성과가 늘수록 시스템은 강해진 것이 아니라 본인 의존도가 커진 것일 수 있습니다.`, "In work and business, compare responsibility with authority and repeatable outcomes."),
    money_resources: localized(locale, `돈은 낙관·불안을 잠재우는 수단이 아니라 선택의 여유를 지키는 자원입니다. 투입 전 최대 손실, 회수 시점, 중단 조건을 한 문장씩 적고 생활 안전자금과 분리하세요.`, "Set maximum loss, recovery timing, and exit conditions before committing resources."),
    people_collaboration: localized(locale, `협업에서는 상대의 성의보다 완료 기준·책임자·검수일을 보세요. 설명하지 않은 기대를 능력 평가로 바꾸지 말고, 기준을 문서로 넘긴 뒤 결과를 판단해야 합니다.`, "Use written completion criteria, ownership, and review dates instead of unspoken expectations."),
    close_relationships: localized(locale, `가까운 관계에서는 마음을 추측하기보다 약속 이행, 경계 존중, 갈등 뒤 수습 행동을 보세요. 한 사람이 계속 이해하고 수습해야만 유지되는 평화는 안정이 아니라 부담의 편중입니다.`, "Judge close relationships by kept commitments, respected boundaries, and repair after conflict."),
    stress_response: localized(locale, `압박 시 통제 욕구가 올라오면 24시간 동안 결정 범위를 줄이고, 지금 직접 해야 할 일 하나·위임할 일 하나·확인만 할 일 하나로 나누세요. 수면과 식사가 흔들리면 판단보다 회복을 먼저 둡니다.`, "Under pressure, separate one task to own, one to delegate, and one merely to monitor."),
    current_year: localized(locale, `2026 개인년 ${profile.personalYear.value}(${personalYear.phase})에서는 ${personalYear.timing} 올해의 흐름은 결과를 보장하지 않으며, 실제 증거가 방향을 수정할 때 그 수정이 우선입니다.`, `In 2026 Personal Year ${profile.personalYear.value} (${personalYear.phase}), actual evidence overrides the cycle narrative.`),
    phased_direction: localized(locale, `각 단계는 날짜보다 통과 조건으로 움직이세요. 이전 단계의 완료 증거가 없으면 다음 단계의 비용·범위·관계 약속을 키우지 않는 것이 핵심입니다.`, "Advance by completion gates rather than dates alone."),
    situational_response: localized(locale, `상황이 바뀌면 처음 결론을 지키려 애쓰지 말고 긍정·경고·반증 신호를 다시 분류하세요. 반증이 두 번 누적되면 결론보다 방법과 가정을 먼저 수정합니다.`, "Reclassify positive, warning, and contradictory signals as circumstances change."),
    prioritized_action: localized(locale, `실행은 6단계로 제한하고 각 단계마다 완료 기준과 다음 관문을 붙였습니다.`, "Execution is limited to six gated steps."),
    stop_hold_boundary: localized(locale, `중단은 목표를 포기하는 일이 아니라 현재 방법이 증거를 만들지 못한다는 판단입니다. 목표는 유지하되 방법·범위·시점을 바꿀 수 있습니다.`, "Stopping a method is not abandoning the goal; it is responding to evidence."),
    strong_conclusion: localized(locale, `최종 판단은 가능성보다 조건에 근거합니다. ${strategy.positive}이면 진행 가치가 높고, ${strategy.warning}이면 보류·축소가 더 유리합니다.`, `Proceed when ${strategy.positive}; reduce or hold when ${strategy.warning}.`),
    grounded_advice: localized(locale, strategy.longTerm, strategy.longTerm),
  };

  const seenCategories = new Set<DetailCoverageCategory>();
  const inheritedSections = detail.sections.map((section, index) => {
    const category = categoryForTitle(section.title, index);
    seenCategories.add(category);
    const renamed = /최종 결론|Final conclusion/.test(section.title)
      ? localized(locale, "상세 리딩 기반 결론", "Detailed-tier conclusion")
      : section.title;
    return {
      title: renamed,
      body: enrichBody(category, section.body, addedByCategory[category]),
    };
  });

  const careerSection = domain === "child"
    ? {
        title: localized(locale, "아이의 학습·활동 환경", "The child's learning and activity environment"),
        body: enrichBody(
          "work_business",
          localized(
            locale,
            "성인 직업명을 미리 정하기보다 아이가 오래 몰입하는 활동, 설명을 이해하는 방식, 압박 뒤 회복 속도를 관찰하세요. 강점은 다양한 경험에서 확인하고 진로 선택은 발달 단계에 맞춰 열어 두어야 합니다.",
            "Keep future occupations open. Observe sustained interests, learning style, and recovery under pressure across age-appropriate experiences.",
          ),
          localized(
            locale,
            "보호자의 기대보다 집·학교·활동 환경에서 반복되는 행동을 함께 기록하고, 일상 기능 저하가 이어지면 교사나 적절한 전문가와 확인하세요.",
            "Compare repeated behavior across home, school, and activities, and seek appropriate professional help when daily function declines.",
          ),
        ),
      }
    : {
        title: localized(locale, "잘 맞는 일과 역할 · 직업·사업", "Fitting work and roles · career and business"),
        body: enrichBody(
          "work_business",
          [
            integrated.domains.find((item) => item.id === "career")?.personalizedInference ?? integrated.summary,
            ...integrated.careerRecommendations.slice(0, 3).map((role) => localized(
              locale,
              `• ${role.title}\n  잘 맞는 자리 — ${role.fitReason}\n  피할 자리 — ${role.avoidCondition}`,
              `• ${role.title}\n  Fits — ${role.fitReason}\n  Avoid — ${role.avoidCondition}`,
            )),
          ].join("\n\n"),
          addedByCategory.work_business,
        ),
      };
  const domainFoundation = hasQuestion
    ? [
        careerSection,
        { title: localized(locale, "재물과 자원 흐름", "Money and resources"), body: enrichBody("money_resources", integrated.domains.find((item) => item.id === "money")?.personalizedInference ?? integrated.summary, addedByCategory.money_resources) },
        { title: localized(locale, "인간관계와 협업", "People and collaboration"), body: enrichBody("people_collaboration", integrated.domains.find((item) => item.id === "relationships")?.personalizedInference ?? integrated.summary, addedByCategory.people_collaboration) },
        { title: localized(locale, "연애·가족 등 가까운 관계", "Love, family, and close relationships"), body: enrichBody("close_relationships", integrated.domains.find((item) => item.id === "relationships")?.realityCheck ?? integrated.uncertainty, addedByCategory.close_relationships) },
      ]
    : [
        {
          title: localized(locale, "잘 맞는 일과 역할 · 직업·사업 심층", "Fitting work and roles · career and business"),
          body: enrichBody(
            "work_business",
            [
              integrated.domains.find((item) => item.id === "career")?.personalizedInference ?? integrated.summary,
              ...integrated.careerRecommendations.slice(0, 3).map((role) => localized(
                locale,
                `• ${role.title}\n  잘 맞는 자리 — ${role.fitReason}\n  피할 자리 — ${role.avoidCondition}`,
                `• ${role.title}\n  Fits — ${role.fitReason}\n  Avoid — ${role.avoidCondition}`,
              )),
            ].join("\n\n"),
            addedByCategory.work_business,
          ),
        },
      ];

  const scenarioBody = localized(
    locale,
    [
      `1. 최선 시나리오\n촉발 조건: ${strategy.positive}.\n예상 행동: 범위를 한 단계만 넓히고 합의와 수치를 기록합니다.\n가능한 결과: 성과와 관계 안정이 함께 커집니다.\n확인 신호: ${withParticle(strategy.proof, "subject")} 2회 이상 좋아집니다.\n대응: 다음 단계에 자원의 20%만 추가합니다.\n전환 기준: 긍정 신호가 두 검토 주기 연속 유지될 때만 확대합니다.`,
      `2. 가장 현실적인 시나리오\n촉발 조건: 좋은 신호와 ${withParticle(strategy.warning, "subject")} 함께 보입니다.\n예상 행동: 진행은 하되 기간·비용·약속 범위를 절반으로 줄입니다.\n가능한 결과: 큰 손실 없이 실제 적합성을 확인합니다.\n확인 신호: 말보다 완료 행동이 조금씩 늘어납니다.\n대응: 한 번에 하나의 가설만 검증합니다.\n전환 기준: 2주 또는 한 계약 주기 뒤 증거표를 다시 평가합니다.`,
      `3. 위험 시나리오\n촉발 조건: ${strategy.contradiction}.\n예상 행동: 불안을 덮으려고 더 많은 돈·시간·설명을 투입합니다.\n가능한 결과: 손실과 피로가 커지고 철회가 어려워집니다.\n확인 신호: ${strategy.warning}.\n대응: 신규 투입과 되돌리기 어려운 약속을 즉시 멈춥니다.\n전환 기준: ${strategy.threshold}이면 현재 방법을 중단하고 사실 확인부터 다시 시작합니다.`,
    ].join("\n\n"),
    [
      `1. Best case — Trigger: ${strategy.positive}. Behavior: expand only one step. Outcome: stronger results with stability. Signs: ${strategy.proof} improves twice. Response: add only 20% more resources. Threshold: expand after two positive review cycles.`,
      `2. Most likely — Trigger: mixed evidence. Behavior: halve scope and test one assumption. Outcome: useful evidence with limited downside. Signs: completed behavior rises. Response: review after one cycle. Threshold: continue only if evidence improves.`,
      `3. Risk case — Trigger: ${strategy.contradiction}. Behavior: overcommit. Outcome: cost and fatigue rise. Signs: ${strategy.warning}. Response: freeze irreversible commitments. Threshold: ${strategy.threshold}.`,
    ].join("\n\n"),
  );
  const signals = localized(
    locale,
    `긍정 신호: ${strategy.positive}.\n\n경고 신호: ${strategy.warning}.\n\n현재 해석을 반박하는 신호: ${strategy.contradiction}.\n\n재평가 시점: 2주, 한 시험 주기, 한 계약 주기 중 먼저 오는 때에 ${withParticle(strategy.proof, "object")} 같은 기준으로 다시 확인합니다.`,
    `Positive: ${strategy.positive}.\n\nWarning: ${strategy.warning}.\n\nContradiction: ${strategy.contradiction}.\n\nReassess after two weeks or one natural decision cycle.`,
  );
  const decisionFramework = localized(
    locale,
    `① 확인된 사실은 무엇인가: ${withParticle(strategy.proof, "object")} 숫자·날짜·행동으로 적습니다.\n\n② 아직 추측인 것은 무엇인가: 상대의 마음, 미래 결과, 승인 여부처럼 확인 전인 내용을 분리합니다.\n\n③ 내가 감당할 수 있는 최대 손실은 얼마인가: 돈·시간·관계 비용을 각각 정합니다.\n\n④ 되돌릴 수 있는가: 되돌릴 수 없을수록 증거를 두 배 요구합니다.\n\n⑤ 다음 검토일은 언제인가: 그날 전에는 불안 때문에 기준을 바꾸지 않습니다.`,
    "1) Record facts. 2) Separate assumptions. 3) Set maximum downside. 4) Demand more evidence for irreversible choices. 5) Set a review date.",
  );
  const actions = localized(
    locale,
    [
      `1. 목표: 질문을 검증 가능한 한 문장으로 바꾸기 · 행동: '${strategy.subject}에서 2주 안에 확인할 한 가지'를 씁니다. · 완료 기준: 예/아니오로 답할 문장이 생김 · 위험: 목표를 너무 크게 잡음 · 다음 관문: 측정 항목 선택`,
      `2. 목표: 기준선 확보 · 행동: 현재 ${withParticle(strategy.proof, "object")} 숫자·날짜·행동으로 기록합니다. · 완료 기준: 최소 3개 사실 확보 · 위험: 느낌을 사실로 적음 · 다음 관문: 가설 분리`,
      `3. 목표: 작은 검증 실행 · 행동: 비용과 범위를 절반으로 줄인 시험을 한 번 합니다. · 완료 기준: 시작·종료일과 결과가 남음 · 위험: 여러 가설을 동시에 바꿈 · 다음 관문: 신호 판정`,
      `4. 목표: 결과 판정 · 행동: 긍정·경고·반증 신호로 나눠 적습니다. · 완료 기준: 각 칸에 최소 1개 증거 · 위험: 원하는 결과만 고름 · 다음 관문: 유지·수정·중단 선택`,
      `5. 목표: 경계 설정 · 행동: ${withParticle(strategy.threshold, "object")} 중단 조건으로 일정과 관련자에게 명시합니다. · 완료 기준: 조건과 책임자가 기록됨 · 위험: 정 때문에 기준을 미룸 · 다음 관문: 두 번째 검증`,
      `6. 목표: 다음 선택 확정 · 행동: 같은 기준으로 한 번 더 검토해 확대·유지·축소 중 하나를 고릅니다. · 완료 기준: 이유와 다음 검토일을 한 문장으로 기록 · 위험: 결론 없이 계속 분석 · 다음 관문: 실행 또는 종료`,
    ].join("\n\n"),
    "1. Rewrite the goal as one testable sentence.\n\n2. Record three baseline facts.\n\n3. Run one half-sized test.\n\n4. Classify positive, warning, and contradictory signs.\n\n5. Record the stop threshold and owner.\n\n6. Choose expand, maintain, or stop and set the next review date.",
  );
  const checklist = localized(
    locale,
    `□ 이 질문에서 확인된 사실과 바라는 해석을 분리했는가?\n□ ${withParticle(strategy.proof, "object")} 같은 방식으로 두 번 이상 확인했는가?\n□ 최대 손실과 철회 비용을 적었는가?\n□ 상대의 마음·진단·승인·수익을 사실처럼 단정하지 않았는가?\n□ 수면 부족이나 공포·흥분 상태에서 큰 결정을 확정하지 않았는가?\n□ 계약·의료·법률·대출 문제는 자격 있는 전문가나 공식 문서로 확인했는가?\n□ 중단 조건과 다음 검토일이 정해졌는가?`,
    "□ Facts and hopes are separated.\n□ Evidence is checked twice.\n□ Maximum downside is written.\n□ Private facts or outcomes are not assumed.\n□ No major decision is made under acute pressure.\n□ Professional matters are formally checked.\n□ Stop condition and review date are set.",
  );
  const stops = localized(
    locale,
    [
      `1. ${strategy.threshold}이면 현재 방법을 즉시 중단합니다.`,
      `2. ${strategy.contradiction}이면 기존 결론을 고집하지 않고 가정을 다시 씁니다.`,
      `3. 되돌릴 수 없는 비용·계약·관계 약속의 핵심 조건이 문서로 확인되지 않으면 보류합니다.`,
      `4. 수면·식사·업무·학업 같은 일상 기능이 2주 이상 뚜렷하게 나빠지면 속도를 낮추고 필요한 도움을 받습니다.`,
      `5. 모욕·위협·강요·감시·경계 침해가 나타나면 해석보다 안전 확보와 공식 지원을 우선합니다.`,
      `6. 두 번의 검토 주기에도 ${withParticle(strategy.proof, "subject")} 개선되지 않으면 목표를 버리기 전에 방법·범위·시점을 바꿉니다.`,
    ].join("\n\n"),
    `1. Stop at this threshold: ${strategy.threshold}.\n\n2. Rewrite the assumption when evidence contradicts it.\n\n3. Hold irreversible commitments without written terms.\n\n4. Reduce pace when daily function worsens for two weeks.\n\n5. Prioritize safety when boundaries are violated.\n\n6. Pivot the method after two cycles without evidence.`,
  );
  const premiumSections = [
    {
      title: localized(locale, "네 숫자를 하나로 읽는 종합 해석", "Cross-number synthesis"),
      body: `${synthesis}\n\n${hidden}`,
    },
    {
      title: localized(locale, "강점이 실패를 만드는 역설", "When strength creates failure"),
      body: `${paradox}${sharp[5] ? `\n\n${sharp[5]}` : ""}`,
    },
    {
      title: localized(locale, "최선·현실·위험 시나리오", "Best, likely, and risk scenarios"),
      body: `${scenarioBody}${sharp[6] ? `\n\n${sharp[6]}` : ""}`,
    },
    {
      title: localized(locale, "시나리오 확인 신호", "Signals that confirm or contradict"),
      body: signals,
    },
    {
      title: localized(locale, "고객별 의사결정 기준", "Personal decision framework"),
      body: decisionFramework,
    },
    {
      title: localized(locale, "6단계 실행 매뉴얼", "Six-step execution manual"),
      body: actions,
    },
    {
      title: localized(locale, "이 질문의 위험 방지 체크리스트", "Risk-prevention checklist"),
      body: checklist,
    },
    {
      title: localized(locale, "보류·중단·전환 기준 6가지", "Six hold, stop, or pivot conditions"),
      body: stops,
    },
    {
      title: localized(locale, "장기 전략", "Long-term strategy"),
      body: `${strategy.longTerm}\n\n${addedByCategory.grounded_advice}`,
    },
    {
      title: localized(locale, "최종 종합 판단", "Consultant verdict"),
      body: `${addedByCategory.strong_conclusion}${sharp[7] ? `\n\n${sharp[7]}` : ""}`,
    },
    {
      title: localized(locale, "현실적인 조언과 마무리", "Grounded closing advice"),
      body: localized(
        locale,
        `당신에게 필요한 것은 더 강한 확신이 아니라, 이미 가진 통찰과 실행력을 안전한 검증 구조에 올리는 일입니다. 오늘은 모든 답을 정하려 하지 말고 첫 번째 확인 항목 하나만 끝내세요. 계산은 방향을 생각하게 돕지만 실제 선택은 관찰된 사실, 대화, 전문적 확인을 따라 수정할 수 있어야 합니다.`,
        "You do not need stronger certainty; you need a safer structure for testing the insight and execution you already have. Complete one verification step today and let observed facts revise the interpretation.",
      ),
    },
  ];

  const stopIndex = inheritedSections.findIndex((section) => /보류·중단|Stop, hold/.test(section.title));
  const insertionIndex = stopIndex >= 0 ? stopIndex : inheritedSections.length;
  const sections = [
    ...inheritedSections.slice(0, insertionIndex),
    ...domainFoundation,
    ...inheritedSections.slice(insertionIndex),
    ...premiumSections,
  ];
  const enrichmentAudit: EnrichmentAuditEntry[] = DETAIL_COVERAGE_CATEGORIES.map(
    (detailCategory) => ({
      detailCategory,
      premiumStatus: dimensionsFor(detailCategory).length > 1 ? "synthesized" : "deepened",
      addedDimensions: dimensionsFor(detailCategory),
    }),
  );
  const draft: PaidReport = {
    ...detail,
    productCode: "premium_pdf",
    title: localized(locale, "프리미엄 심층 리딩", "Premium in-depth reading"),
    summary: hasQuestion
      ? localized(locale, "질문의 직접 결론부터 세 가지 시나리오, 검증 신호, 실행·중단 기준까지 한 흐름으로 정리했습니다.", "A direct answer followed by scenarios, signals, action, and stop criteria.")
      : localized(locale, "질문 없이도 인물·일·돈·관계·2026년 흐름과 장기 전략이 완결되도록 구성했습니다.", "A complete profile, work, money, relationship, 2026, and long-term strategy report without requiring a question."),
    sections,
    actions: locale === "ko"
      ? [
        `오늘 ${strategy.proof} 중 확인 가능한 사실 하나를 기록하세요.`,
        "되돌리기 어려운 결정은 사실 두 개와 다음 검토일이 생길 때까지 보류하세요.",
        "이번 주에 작은 검증 하나를 끝내고 긍정·경고·반증 신호로 나누세요.",
        "직접 할 일·위임할 일·확인만 할 일을 각각 하나로 제한하세요.",
        `중단 기준 '${strategy.threshold}'을 일정이나 메모에 남기세요.`,
        "두 번째 검토에서 확대·유지·축소 중 하나를 반드시 고르세요.",
      ]
      : [
        "Record one checkable fact today.",
        "Hold irreversible decisions until two facts and a review date exist.",
        "Complete one small test this week.",
        "Separate ownership, delegation, and monitoring.",
        "Write the stop threshold.",
        "Choose expand, maintain, or reduce at the second review.",
      ],
    cautions: unique([
      ...detail.cautions,
      localized(locale, `${strategy.warning}. 이 신호가 보이면 낙관이나 불안으로 추가 투입하지 마세요.`, `Do not add resources when this warning appears: ${strategy.warning}.`),
      localized(locale, "건강·법률·재무·대출·안전 문제는 이 리포트가 아니라 자격 있는 전문가와 공식 문서의 판단을 우선하세요.", "Professional and formal evidence takes priority for health, legal, financial, lending, and safety matters."),
    ], 4),
    disclaimer: localized(
      locale,
      "이 리포트는 자기이해와 선택 정리를 위한 참고 자료입니다. 미래, 건강 상태, 투자 수익, 대출 승인, 시험 합격 또는 타인의 마음과 사적 사실을 보장하지 않으며 실제 사실과 전문가 판단이 해석보다 우선합니다.",
      "This report supports reflection and decisions. It does not guarantee future events, health, returns, approvals, exam outcomes, or another person's private facts; observed facts and qualified advice take priority.",
    ),
    tierLabel: tierBadgeLabel("premium_pdf", locale),
    sharpInsights: sharp,
    contentVersion: PREMIUM_REPORT_CONTENT_VERSION,
    sectionPlan: "premium-79000-v2",
    calculationBasis: {
      birthDate: input.birthDate,
      serviceYear: PREMIUM_REPORT_SERVICE_YEAR,
      lifePath: profile.lifePath.value,
      birthday: profile.birthday.value,
      attitude: profile.attitude.value,
      birthYear,
      personalYear: profile.personalYear.value,
    },
    contentReferences: [
      ...(detail.contentReferences ?? []),
      `premium-domain:${domain}`,
      "tier-inheritance:BASIC_19000>DETAIL_39000>PREMIUM_79000",
      "tier:PREMIUM_79000",
    ],
    coverageCategories: [...DETAIL_COVERAGE_CATEGORIES, ...PREMIUM_ONLY_CATEGORIES],
    enrichmentAudit,
  };
  const tierComparisonAudit = auditTierComparison(
    { ...detail, coverageCategories: DETAIL_COVERAGE_CATEGORIES },
    draft,
  );
  if (Object.values(tierComparisonAudit).some((items) => items.length > 0)) {
    throw new Error(`PREMIUM_TIER_INHERITANCE_FAILED:${JSON.stringify(tierComparisonAudit)}`);
  }
  return { ...draft, tierComparisonAudit };
}
