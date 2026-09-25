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
      proof: "actions you can repeat, things in writing, and work that actually got finished",
      positive: "the other side keeps acting the same way and writes down the next step",
      warning: "promises keep growing while dates, ownership, or proof stay fuzzy",
      contradiction: "new facts keep clashing with the story you were told",
      threshold: "two broken promises, or one mistake you cannot undo",
      longTerm: "keep a simple record of what you decided and check it every few months",
    };
  }
  const common = {
    growth: {
      subject: "생활과 성장 방향",
      proof: "적어 둘 수 있는 행동과 끝까지 해낸 일",
      positive: "잠깐의 의욕이 아니라 같은 행동을 3주 넘게 계속함",
      warning: "계획만 늘고 잠, 일정, 끝맺음이 같이 무너짐",
      contradiction: "원하는 방향과 매주 실제로 쓰는 시간이 자꾸 어긋남",
      threshold: "중요한 행동을 3주 내내 못 하거나 일상생활이 눈에 띄게 나빠짐",
      longTerm: "석 달마다 버릴 목표 하나, 지킬 습관 하나를 정해서 집중력을 아끼세요.",
    },
    business: {
      subject: "사업과 시장 고르기",
      proof: "돈을 내고 쓰는 사람 수, 다시 쓰는 사람 수, 환불과 이탈, 서비스가 안 멈추는지",
      positive: "결제와 재사용이 함께 늘고 고객 질문이 더 구체적으로 바뀜",
      warning: "관심은 느는데 결제, 재사용, 추천은 늘지 않음",
      contradiction: "고객이 필요하다고 말한 것과 실제로 돈을 쓰는 기능이 다름",
      threshold: "두 번 테스트해도 결제가 늘지 않거나 환불과 오류가 갑자기 늘어남",
      longTerm: "크게 키우기 전에 한 그룹이 계속 사는 걸 확인한 다음 채널과 상품을 넓히세요.",
    },
    career: {
      subject: "직업 고르기와 역할이 맞는지",
      proof: "내가 가진 권한, 평가 기준, 실제로 하는 일, 배울 수 있는 기술",
      positive: "맡은 책임과 결정할 수 있는 힘이 맞고, 성과 기준을 문서로 정함",
      warning: "직함만 좋아지고 권한 없이 책임과 급한 일만 늘어남",
      contradiction: "채용할 때 들은 설명과 실제 매주 하는 일이 절반 넘게 다름",
      threshold: "두 번이나 바꿔 달라고 했는데도 권한과 업무 범위가 그대로임",
      longTerm: "직함보다 2년 뒤에도 남을 실력, 결정권, 성과 기록을 기준으로 옮기세요.",
    },
    promotion: {
      subject: "승진과 더 큰 역할",
      proof: "평가 기준, 권한 범위, 보상, 도와줄 사람과 자원",
      positive: "기대하는 성과와 보상, 권한이 같은 문서에 적혀 있음",
      warning: "책임은 바로 늘고 보상과 결정권은 나중으로 미뤄짐",
      contradiction: "공식 평가와 실제로 듣는 말이 서로 다름",
      threshold: "보상과 권한을 정하는 날이 두 번 미뤄지거나 책임만 먼저 맡겨짐",
      longTerm: "승진 자체보다 새 역할에서 쌓을 증거와 다음에 협상할 시점을 먼저 정하세요.",
    },
    money: {
      subject: "돈 쓰는 법",
      proof: "들어오고 나가는 돈, 잃어도 되는 한도, 계약 조건, 돈을 돌려받을 가능성",
      positive: "수입, 지출, 빚, 비상금이 숫자로 보이고 잃어도 되는 한도가 정해짐",
      warning: "벌 생각만 뚜렷하고 최악의 손실과 돌려받을 시점은 설명하지 못함",
      contradiction: "말한 위험보다 실제로 넣은 돈과 빚 비율이 더 큼",
      threshold: "비상금을 건드리거나, 이자 높은 빚을 쓰거나, 계약의 중요한 조건을 확인 안 한 경우",
      longTerm: "기회가 올 때마다 새로 고민하지 말고, 넣을 돈의 한도와 검토 기간, 그만둘 기준을 미리 정해 두세요.",
    },
    housing: {
      subject: "집과 대출, 오래 나가는 돈",
      proof: "빌릴 수 있는 돈이 아니라 실제로 갚을 돈, 비상금, 계약 해지 비용",
      positive: "이자가 오르고 소득이 줄어도 생활비와 비상금이 남음",
      warning: "대출이 되는지만 보고 관리비, 세금, 수리비, 이사 비용은 빼놓음",
      contradiction: "원하는 생활과 매달 감당할 수 있는 고정비가 맞지 않음",
      threshold: "비상금이 6개월 치가 안 되거나 매달 갚을 돈이 안전한 한도를 넘음",
      longTerm: "집이 주는 의미보다 앞으로 3년 동안의 현금 흐름과 이사 가능성을 같이 보세요.",
    },
    love: {
      subject: "연애와 가까운 관계",
      proof: "꾸준한 연락, 지키는 약속, 다툰 뒤 화해하는 행동, 경계를 지켜 주는 것",
      positive: "좋은 말보다 약속, 시간, 화해하는 행동이 반복됨",
      warning: "믿어 달라고 하면서 정작 관계에 대한 책임과 계획은 피함",
      contradiction: "말로는 가까워진다면서 행동은 계속 숨기고 피하는 쪽으로 감",
      threshold: "경계를 두 번 무시하거나, 모욕·통제·위협이 한 번이라도 있음",
      longTerm: "감정이 얼마나 뜨거운지보다, 서로의 생활과 경계가 안정적인지를 기준으로 삼으세요.",
    },
    reconciliation: {
      subject: "재회와 관계 회복",
      proof: "헤어진 이유가 실제로 바뀌었는지, 잘못을 인정했는지, 다시 안 그러려는 행동",
      positive: "그립다는 말보다 예전 문제를 바꾼 증거와 새로운 약속이 있음",
      warning: "외로울 때만 연락하고 같은 문제의 책임은 계속 피함",
      contradiction: "바뀌었다고 말하지만 예전에 싸우던 이유가 그대로 남아 있음",
      threshold: "같은 잘못을 또 하거나, 바뀐 증거 없이 세 번째로 같은 일이 반복됨",
      longTerm: "다시 만날지보다, 다시 만나도 같은 일이 반복되지 않을지부터 확인하세요.",
    },
    compatibility: {
      subject: "두 사람의 궁합과 협업",
      proof: "싸우는 방식, 돈과 시간 쓰는 기준, 책임을 나누는 법, 화해하는 속도",
      positive: "다른 점을 없애려 하지 않고, 역할과 대화 규칙으로 맞춰 감",
      warning: "한 사람만 계속 설명하고, 양보하고, 뒷수습함",
      contradiction: "정해 둔 규칙이 불편한 순간마다 없던 일이 됨",
      threshold: "중요한 약속을 두 번 어기고 되돌리려는 행동도 없음",
      longTerm: "잘 맞는 느낌보다, 서로 다를 때 안전하게 맞춰 갈 수 있는지를 보세요.",
    },
    child: {
      subject: "아이의 기질과 양육",
      proof: "나이에 맞게 반복되는 행동, 장소마다 다른 모습, 선생님과 보호자가 본 것",
      positive: "아이에게 맞는 설명과 환경에서 마음을 추스르고 집중하는 시간이 늘어남",
      warning: "한 번의 행동으로 성격 전체를 단정하거나, 다른 아이와 비교해서 고치려 함",
      contradiction: "집과 학교에서 보는 모습이 많이 다른데 한쪽 말만 사실로 여김",
      threshold: "잠, 밥, 등교, 친구 관계가 2주 넘게 나빠짐",
      longTerm: "성격을 고치려 하기보다, 강점을 안전하게 쓸 환경과 도움을 청할 통로를 만들어 주세요.",
    },
    education: {
      subject: "학업과 시험 준비",
      proof: "매주 공부한 양, 틀린 문제가 줄었는지, 모의고사 점수 흐름, 잠과 집중력",
      positive: "계획한 양보다 끝낸 양이 늘고, 같은 실수가 줄어듦",
      warning: "불안하다고 자료와 강의만 늘리고 복습과 실전 연습은 미룸",
      contradiction: "공부 시간은 늘지만 잠이 부족해서 정확도와 기억력이 떨어짐",
      threshold: "2주 동안 틀리는 비율이 그대로거나, 잠·밥·일상생활이 눈에 띄게 나빠짐",
      longTerm: "의지보다 복습, 오답 정리, 모의고사를 정해진 주기로 반복해서 실력을 증거로 남기세요.",
    },
    study: {
      subject: "학업과 시험 준비",
      proof: "푼 문제 수, 틀린 문제 다시 풀 때 정답률, 모의고사 점수 흐름, 잠과 집중력",
      positive: "계획한 양보다 끝낸 양이 늘고, 같은 실수가 두 번 연속 줄어듦",
      warning: "불안하다고 자료와 강의만 늘리고 오답 정리와 실전 연습은 미룸",
      contradiction: "공부 시간은 늘지만 잠이 부족해서 정확도와 기억력이 계속 떨어짐",
      threshold: "2주 동안 틀리는 비율이 그대로거나, 잠·밥·일상생활이 눈에 띄게 나빠짐",
      longTerm: "의지보다 기억 확인, 오답 정리, 모의고사를 정해진 주기로 반복해서 실력을 증거로 남기세요.",
    },
    health: {
      subject: "건강 습관과 회복",
      proof: "증상을 적어 둔 기록, 잠·밥·활동의 변화, 의사의 확인",
      positive: "전문가의 안내와 생활 기록이 함께 쌓이면서 몸 상태가 안정됨",
      warning: "이 해석만 믿고 진단, 약, 검사를 미루거나 심한 증상을 그냥 참고 기다림",
      contradiction: "괜찮을 거라는 기대와 실제 증상이 나타나는 횟수·정도가 계속 다름",
      threshold: "갑자기 심해지거나 위험 신호가 있으면 바로 병원, 증상이 계속되면 의사와 다시 확인",
      longTerm: "점괘가 아니라 진료와 기록을 중심에 두고, 나을 수 있는 생활 습관을 만드세요.",
    },
    private_fact: {
      subject: "다른 사람의 마음과 아직 확인 안 된 일",
      proof: "직접 나눈 대화, 서로 약속한 행동, 확인할 수 있는 기록",
      positive: "짐작하는 대신 물어볼 수 있고, 대답과 행동이 같음",
      warning: "모르는 부분을 상상으로 채우고, 상대의 사생활을 사실처럼 단정함",
      contradiction: "확인할 수 있는 행동이 내가 바라는 해석과 계속 다름",
      threshold: "대화를 계속 거부하거나, 경계를 넘어 감시하는 행동으로 이어짐",
      longTerm: "알 수 없는 마음을 맞히려 하기보다, 내가 받아들일 행동의 기준을 분명히 하세요.",
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
    `네 숫자는 생명수 ${life}의 ${lifeTheme.drive}, 생일수 ${birthday}의 ${birthdayTheme.drive}, 태도수 ${attitude}의 ${attitudeTheme.drive}, 출생연도수 ${year}의 ${yearTheme.drive}로 이어져 있습니다. 가장 큰 힘: ${lifeTheme.strength}. 잘하는 실행: ${birthdayTheme.strength}. 첫인상과 다가가는 방식: ${attitudeTheme.strength}. 오래전부터 반복된 바탕: ${yearTheme.strength}. 이 네 숫자는 서로 자리를 바꾸지 않고, 각자 자기 자리에서 함께 당신을 설명합니다.`,
    `Life Path ${life} (${lifeTheme.drive}), Birthday ${birthday} (${birthdayTheme.drive}), Attitude ${attitude} (${attitudeTheme.drive}), and Birth Year ${year} (${yearTheme.drive}) work together without swapping their roles.`,
  );
  const hidden = localized(
    locale,
    `겉으로는 결과와 해결을 중요하게 여기지만, 속마음은 단순히 이기고 싶은 마음이 아니라 '내가 맡은 일이 무너지면 안 된다'는 보호 본능에 더 가깝습니다. 압박이 심해지면 도움을 청하기보다 정보·일정·사람을 혼자서 다 챙기려는 모습이 나올 수 있습니다. 그러면 눈앞의 위기는 넘기지만, 나중에는 다른 사람에게 일을 못 맡기고 관계도 지치게 됩니다.`,
    "On the outside you care about results and fixing things. Underneath, it is less about winning and more about not letting what you carry fall apart. Under pressure this can turn into controlling everything yourself instead of asking for help or handing tasks off.",
  );
  const paradox = localized(
    locale,
    `당신의 가장 큰 힘인 속도, 책임감, 끝까지 해내려는 마음이 오히려 실패의 원인이 되기도 합니다. 남보다 먼저 빈틈을 보고 직접 메우면 처음에는 결과가 빨리 나오지만, 방법을 다른 사람과 나누지 않아서 결국 나만 모든 일을 아는 상태가 됩니다. 진짜 이유는 능력이 부족해서가 아니라 '설명하고 기다리느니 내가 하는 게 빠르다'는 선택을 계속 반복하기 때문입니다.`,
    "The same speed, responsibility, and drive to finish things that make you strong can also cause you to fail. Spotting gaps first and filling them yourself gets fast early results, but no one else learns how you did it, so eventually you are the only one who understands the whole thing. The real reason is not a lack of skill — it is choosing, over and over, that doing it yourself is faster than explaining and waiting.",
  );
  const directExtension = safety.requiresRealityFirstGuidance
    ? localized(
        locale,
        `가장 먼저 할 일은 해석이 아니라 그 분야 전문가에게 사실을 확인하는 것입니다. 확인하기 전까지는 큰돈을 쓰거나, 약을 바꾸거나, 계약을 하거나, 관계를 끊는 것처럼 되돌리기 힘든 행동은 잠시 멈추세요.`,
        "Professional or formal fact-checking comes before interpretation; delay irreversible action until it is complete.",
      )
    : localized(
        locale,
        `${topicText(topic.verdict, locale)} 이 판단에서 가장 중요하게 볼 것은 ${strategy.proof}입니다. 이런 증거가 쌓이면 계속 진행하고, 말과 기대만 커지면 속도를 늦추세요.`,
        `${topicText(topic.verdict, locale)} The deciding evidence is ${strategy.proof}.`,
      );

  const addedByCategory: Record<DetailCoverageCategory, string> = {
    direct_answer: directExtension,
    core_numbers: synthesis,
    character: localized(locale, `${detail.characterLabel}. 이 이름은 힘이 세다는 뜻만이 아닙니다. 성과를 만드는 힘과 사람·책임을 지키려는 마음이 함께 있다는 뜻입니다.`, `${detail.characterLabel}. This label names both execution and responsibility.`),
    temperament: hidden,
    contradiction: paradox,
    decision_pattern: localized(locale, `판단할 때는 '사실', '내 해석', '아직 모르는 것'을 세 칸으로 나눠 적어 보세요. 사실은 ${strategy.proof}, 해석은 지금 가장 그럴듯한 설명, 아직 모르는 것은 확인 전인 기대입니다. 사실이 두 개는 모일 때까지 되돌리기 어려운 결정은 내리지 않는 게 좋습니다.`, `Separate facts, interpretation, and assumptions. Require two independent facts before an irreversible decision.`),
    strongest_ability: localized(locale, `이 능력을 오래 쓰려면 '내가 해결했다'는 결과보다 '다른 사람도 따라 할 수 있는 방법'을 남겨야 합니다. 일이 커질수록 혼자 처리하는 양보다 방법을 얼마나 잘 알려 주는지가 성과를 결정합니다.`, "Make the strength repeatable by leaving criteria other people can use."),
    failure_mechanisms: localized(locale, `눈에 보이는 경고 신호는 일정이 계속 밀리는 것, 말없이 남의 일을 다시 가져오는 것, 쉬는 중에도 계속 확인하는 것입니다. 이 중 두 가지가 2주 넘게 이어지면 의지 문제가 아니라 방식 문제로 보고 일의 범위를 줄이세요.`, "Treat two persistent warning signs as a structural problem, not a willpower problem."),
    main_domain: localized(locale, `${strategy.subject}에서는 ${withParticle(strategy.proof, "object")} 판단 목록의 맨 위에 두세요. 마음에 드는 해석을 고르지 말고 매주 같은 항목을 확인해야 진짜 변화와 그냥 바라는 마음을 구분할 수 있습니다.`, `In ${strategy.subject}, place ${strategy.proof} at the top of the decision record.`),
    work_business: localized(locale, `직업과 사업에서는 직함이나 가능성보다 책임과 권한이 맞는지, 계속 들어오는 수입이나 끝낸 증거를 보세요. 혼자 메운 일이 늘수록 방식이 강해진 게 아니라 나에게만 기대는 정도가 커진 것일 수 있습니다.`, "In work and business, compare responsibility with authority and repeatable outcomes."),
    money_resources: localized(locale, `돈은 마음을 편하게 하는 수단이 아니라 선택의 여유를 지켜 주는 자원입니다. 쓰기 전에 최대로 잃을 금액, 돌려받을 시점, 그만둘 조건을 한 문장씩 적고 생활비와는 따로 관리하세요.`, "Set maximum loss, recovery timing, and exit conditions before committing resources."),
    people_collaboration: localized(locale, `함께 일할 때는 상대의 태도보다 언제 끝내는지, 누가 책임지는지, 언제 확인하는지를 보세요. 말하지 않은 기대로 상대의 실력을 판단하지 말고, 기준을 글로 남긴 다음에 결과를 판단해야 합니다.`, "Use written completion criteria, ownership, and review dates instead of unspoken expectations."),
    close_relationships: localized(locale, `가까운 관계에서는 마음을 짐작하기보다 약속을 지키는지, 경계를 존중하는지, 다툰 뒤에 화해하는지를 보세요. 한 사람만 계속 이해하고 뒷수습해야 유지되는 평화는 안정이 아니라 한쪽으로 쏠린 부담입니다.`, "Judge close relationships by kept commitments, respected boundaries, and repair after conflict."),
    stress_response: localized(locale, `압박이 심해져서 뭐든 다 통제하고 싶어지면, 하루 동안 결정할 범위를 줄이고 지금 할 일을 세 가지로 나누세요. 내가 직접 할 일 하나, 남에게 맡길 일 하나, 지켜보기만 할 일 하나입니다. 잠이나 밥이 흔들리면 판단보다 쉬는 것을 먼저 챙기세요.`, "Under pressure, separate one task to own, one to delegate, and one merely to monitor."),
    current_year: localized(locale, `2026년 개인년 ${profile.personalYear.value}(${personalYear.phase})에서는 ${personalYear.timing} 올해 흐름이 결과를 보장하지는 않으니, 실제로 확인된 사실이 이 흐름과 다르면 사실 쪽을 따르세요.`, `In 2026 Personal Year ${profile.personalYear.value} (${personalYear.phase}), actual evidence overrides the cycle narrative.`),
    phased_direction: localized(locale, `각 단계는 날짜보다 '이걸 끝냈는가'로 넘어가세요. 앞 단계를 끝냈다는 증거가 없으면 다음 단계에서 돈, 범위, 관계 약속을 더 키우지 않는 것이 핵심입니다.`, "Advance by completion gates rather than dates alone."),
    situational_response: localized(locale, `상황이 바뀌면 처음 내린 결론을 억지로 지키지 말고 좋은 신호, 나쁜 신호, 반대되는 신호를 다시 나눠 보세요. 반대되는 신호가 두 번 쌓이면 결론보다 방법과 가정을 먼저 바꾸세요.`, "Reclassify positive, warning, and contradictory signals as circumstances change."),
    prioritized_action: localized(locale, `실행은 6단계로만 제한하고, 각 단계마다 끝났다고 볼 기준과 다음으로 넘어갈 문을 붙였습니다.`, "Execution is limited to six gated steps."),
    stop_hold_boundary: localized(locale, `멈추는 것은 목표를 포기하는 게 아니라 지금 방법으로는 증거가 안 나온다는 뜻입니다. 목표는 그대로 두고 방법, 범위, 시점만 바꿀 수 있습니다.`, "Stopping a method is not abandoning the goal; it is responding to evidence."),
    strong_conclusion: localized(locale, `마지막 판단은 느낌이 아니라 조건으로 정합니다. ${strategy.positive}이면 계속할 가치가 있고, ${strategy.warning}이면 잠시 멈추거나 줄이는 게 낫습니다.`, `Proceed when ${strategy.positive}; reduce or hold when ${strategy.warning}.`),
    grounded_advice: localized(locale, strategy.longTerm, strategy.longTerm),
  };

  const keySentenceByCategory: Record<DetailCoverageCategory, string> = {
    direct_answer: localized(locale, "마음보다 확인된 사실을 먼저 보세요.", "Check the facts before you trust a feeling."),
    core_numbers: localized(locale, "네 숫자를 따로 보지 말고 하나로 겹쳐서 읽으세요.", "Read all four numbers together, not one at a time."),
    character: localized(locale, "이 별명은 강함과 책임감을 동시에 뜻해요.", "This label means strength and responsibility together."),
    temperament: localized(locale, "무너뜨리지 않으려는 마음이 통제로 바뀔 수 있어요.", "Protecting the system can turn into controlling everything."),
    contradiction: localized(locale, "혼자 다 해내는 습관이 결국 발목을 잡아요.", "Doing everything yourself eventually holds you back."),
    decision_pattern: localized(locale, "확인 안 된 건 사실처럼 다루지 마세요.", "Never treat a guess as if it were a fact."),
    strongest_ability: localized(locale, "남도 따라 할 수 있게 남겨야 오래가요.", "A strength lasts longer when others can copy it."),
    failure_mechanisms: localized(locale, "경고 신호가 겹치면 의지가 아니라 방식을 바꾸세요.", "Two repeated warning signs mean change the method, not try harder."),
    main_domain: localized(locale, "느낌이 아니라 매주 같은 기준으로 확인하세요.", "Check the same measure every week, not just your gut feeling."),
    work_business: localized(locale, "직함보다 책임과 권한이 맞는지를 보세요.", "A fair title matters less than matching duty and power."),
    money_resources: localized(locale, "쓰기 전에 얼마까지 잃어도 되는지부터 정하세요.", "Decide your maximum loss before you spend anything."),
    people_collaboration: localized(locale, "말하지 않은 기대는 지키기 힘든 약속이에요.", "An unspoken expectation is a promise no one can keep."),
    close_relationships: localized(locale, "혼자만 참는 평화는 안정이 아니에요.", "Peace kept up by only one person is not real stability."),
    stress_response: localized(locale, "급할수록 할 일을 세 가지로만 나누세요.", "Under pressure, sort tasks into just three simple piles."),
    current_year: localized(locale, "올해 흐름보다 실제 사실이 먼저예요.", "Real evidence always beats this year's general trend."),
    phased_direction: localized(locale, "앞 단계를 끝냈다는 증거 없이 더 키우지 마세요.", "Do not grow the next step without proof the last one worked."),
    situational_response: localized(locale, "상황이 바뀌면 결론도 다시 확인하세요.", "When circumstances change, re-check your conclusion too."),
    prioritized_action: localized(locale, "순서대로 여섯 단계만 밟아도 충분해요.", "Following the six steps in order is enough."),
    stop_hold_boundary: localized(locale, "멈추는 건 포기가 아니라 방법을 바꾸는 거예요.", "Stopping a method is not giving up on the goal."),
    strong_conclusion: localized(locale, "좋은 신호면 계속, 나쁜 신호면 잠깐 멈추세요.", "Keep going on good signs, pause on warning signs."),
    grounded_advice: localized(locale, "오래 갈 습관 하나가 큰 결심보다 힘이 세요.", "One lasting habit beats one big burst of motivation."),
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
      keySentence: keySentenceByCategory[category],
    };
  });

  const careerSection = domain === "child"
    ? {
        title: localized(locale, "아이의 학습·활동 환경", "The child's learning and activity environment"),
        body: enrichBody(
          "work_business",
          localized(
            locale,
            "어른이 되었을 때의 직업을 미리 정하기보다, 아이가 오래 빠져드는 활동, 설명을 이해하는 방식, 힘든 일 뒤에 다시 기운 차리는 속도를 지켜보세요. 강점은 여러 경험을 시켜 보면서 확인하고, 진로는 아이의 나이와 발달에 맞게 열어 두세요.",
            "Keep future occupations open. Observe sustained interests, learning style, and recovery under pressure across age-appropriate experiences.",
          ),
          localized(
            locale,
            "보호자가 바라는 모습보다 집, 학교, 활동에서 반복되는 행동을 함께 적어 보고, 일상생활이 계속 나빠지면 선생님이나 전문가와 상담하세요.",
            "Compare repeated behavior across home, school, and activities, and seek appropriate professional help when daily function declines.",
          ),
        ),
        keySentence: localized(locale, "직업을 정하기보다 아이가 오래 몰입하는 걸 먼저 지켜보세요.", "Watch what holds your child's attention before naming a career."),
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
        keySentence: localized(locale, "직함보다 실제로 맡는 일과 권한이 맞는 자리를 고르세요.", "Pick a role where the real work matches the real authority."),
      };
  const domainFoundation = hasQuestion
    ? [
        careerSection,
        {
          title: localized(locale, "재물과 자원 흐름", "Money and resources"),
          body: enrichBody("money_resources", integrated.domains.find((item) => item.id === "money")?.personalizedInference ?? integrated.summary, addedByCategory.money_resources),
          keySentence: localized(locale, "쓰기 전에 최대로 잃을 금액부터 정해 두세요.", "Set your maximum loss before you spend."),
        },
        {
          title: localized(locale, "인간관계와 협업", "People and collaboration"),
          body: enrichBody("people_collaboration", integrated.domains.find((item) => item.id === "relationships")?.personalizedInference ?? integrated.summary, addedByCategory.people_collaboration),
          keySentence: localized(locale, "기준을 글로 남겨야 나중에 억울해지지 않아요.", "Write the criteria down so no one feels blindsided later."),
        },
        {
          title: localized(locale, "연애·가족 등 가까운 관계", "Love, family, and close relationships"),
          body: enrichBody("close_relationships", integrated.domains.find((item) => item.id === "relationships")?.realityCheck ?? integrated.uncertainty, addedByCategory.close_relationships),
          keySentence: localized(locale, "말보다 반복되는 행동으로 관계를 판단하세요.", "Judge a relationship by repeated actions, not by words."),
        },
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
          keySentence: localized(locale, "잘 맞는 자리와 피할 자리를 먼저 구분해 보세요.", "Sort the roles that fit you from the ones that don't, first."),
        },
      ];

  const scenarioBody = localized(
    locale,
    [
      `1. 최선 시나리오 — 가장 좋은 경우\n촉발 조건: ${strategy.positive}.\n예상 행동: 범위를 딱 한 단계만 넓히고, 약속과 숫자를 적어 둡니다.\n가능한 결과: 성과도 좋아지고 관계도 안정됩니다.\n확인 신호: ${withParticle(strategy.proof, "subject")} 두 번 이상 좋아집니다.\n대응: 다음 단계에는 가진 자원의 20%만 더 씁니다.\n전환 기준: 좋은 신호가 두 번 연속 이어질 때만 더 키웁니다.`,
      `2. 가장 현실적인 시나리오 — 가장 흔히 일어날 경우\n촉발 조건: 좋은 신호와 ${withParticle(strategy.warning, "subject")} 같이 보입니다.\n예상 행동: 계속하되 기간, 비용, 약속하는 범위를 반으로 줄입니다.\n가능한 결과: 크게 잃지 않으면서 정말 맞는지 확인합니다.\n확인 신호: 말보다 끝낸 일이 조금씩 늘어납니다.\n대응: 한 번에 하나만 시험해 봅니다.\n전환 기준: 2주 또는 한 계약 기간이 지나면 증거를 다시 살펴봅니다.`,
      `3. 위험 시나리오 — 위험한 경우\n촉발 조건: ${strategy.contradiction}.\n예상 행동: 불안을 감추려고 돈, 시간, 설명을 더 많이 쏟아붓습니다.\n가능한 결과: 손해와 피로만 커지고 그만두기도 어려워집니다.\n확인 신호: ${strategy.warning}.\n대응: 새로 돈이나 시간을 쓰는 것과 되돌릴 수 없는 약속을 바로 멈춥니다.\n전환 기준: ${strategy.threshold}이면 지금 방법을 멈추고 사실 확인부터 다시 시작합니다.`,
    ].join("\n\n"),
    [
      `1. Best case — Trigger: ${strategy.positive}. What happens: you expand just one step at a time. Outcome: results and stability both grow. Signs: ${strategy.proof} improves twice. What to do: add only 20% more resources. Threshold: only expand after two good check-ins in a row.`,
      `2. Most likely case — Trigger: good and mixed signs show up together. What happens: you keep going but cut the time, cost, and promises in half. Outcome: you learn a lot without losing much. Signs: finished actions slowly increase, not just words. What to do: test one idea at a time. Threshold: check the evidence again after two weeks or one full round.`,
      `3. Risk case — Trigger: ${strategy.contradiction}. What happens: you throw in more money, time, and explanations to cover the worry. Outcome: losses and tiredness grow and it gets hard to back out. Signs: ${strategy.warning}. What to do: stop spending more right away and freeze any promise you cannot undo. Threshold: ${strategy.threshold}.`,
    ].join("\n\n"),
  );
  const signals = localized(
    locale,
    `좋은 신호: ${strategy.positive}.\n\n경고 신호: ${strategy.warning}.\n\n지금 생각이 틀렸을 수 있다는 신호: ${strategy.contradiction}.\n\n다시 확인할 때: 2주, 한 번의 시험 기간, 한 번의 계약 기간 중 가장 먼저 오는 때에 ${withParticle(strategy.proof, "object")} 같은 방법으로 다시 살펴봅니다.`,
    `Positive: ${strategy.positive}.\n\nWarning: ${strategy.warning}.\n\nContradiction: ${strategy.contradiction}.\n\nReassess after two weeks or one natural decision cycle.`,
  );
  const decisionFramework = localized(
    locale,
    `① 확인된 사실은 무엇인가: ${withParticle(strategy.proof, "object")} 숫자, 날짜, 행동으로 적어 봅니다.\n\n② 아직 짐작일 뿐인 것은 무엇인가: 상대의 마음, 미래 결과, 승인 여부처럼 아직 확인 못 한 내용을 따로 빼 둡니다.\n\n③ 내가 견딜 수 있는 최대 손해는 얼마인가: 돈, 시간, 관계에서 각각 정해 둡니다.\n\n④ 되돌릴 수 있는 일인가: 되돌리기 어려울수록 증거를 두 배로 요구합니다.\n\n⑤ 다음에 다시 확인할 날은 언제인가: 그날이 오기 전에는 불안하다고 기준을 바꾸지 않습니다.`,
    "1) Record facts. 2) Separate assumptions. 3) Set maximum downside. 4) Demand more evidence for irreversible choices. 5) Set a review date.",
  );
  const actions = localized(
    locale,
    [
      `1. 목표: 질문을 확인 가능한 한 문장으로 바꾸기 · 행동: '${strategy.subject}에서 2주 안에 확인할 한 가지'를 문장으로 씁니다. · 완료 기준: 예/아니오로 답할 수 있는 문장이 생김 · 위험: 목표를 너무 크게 잡음 · 다음 관문: 무엇을 잴지 정하기`,
      `2. 목표: 지금 상황부터 확실히 알아 두기 · 행동: 지금 ${withParticle(strategy.proof, "object")} 숫자, 날짜, 행동으로 적습니다. · 완료 기준: 사실을 3개 이상 모음 · 위험: 느낌을 사실인 것처럼 적음 · 다음 관문: 짐작과 사실 나누기`,
      `3. 목표: 작게 한번 시험해 보기 · 행동: 돈과 범위를 반으로 줄인 시험을 한 번 해 봅니다. · 완료 기준: 시작일, 끝나는 날, 결과가 남음 · 위험: 여러 가지를 한꺼번에 바꿈 · 다음 관문: 신호 나누기`,
      `4. 목표: 결과 나누어 보기 · 행동: 좋은 신호, 경고 신호, 틀렸다는 신호로 나눠 적습니다. · 완료 기준: 각 칸에 증거가 1개 이상 있음 · 위험: 원하는 결과만 골라 봄 · 다음 관문: 계속할지 바꿀지 멈출지 정하기`,
      `5. 목표: 멈출 기준 정해 두기 · 행동: ${withParticle(strategy.threshold, "object")} 멈추는 조건으로 정하고 일정이나 주변 사람에게 알립니다. · 완료 기준: 조건과 누가 책임질지가 적혀 있음 · 위험: 정 때문에 기준을 자꾸 미룸 · 다음 관문: 두 번째로 확인하기`,
      `6. 목표: 다음에 할 일 정하기 · 행동: 같은 기준으로 다시 살펴보고 키울지, 유지할지, 줄일지 하나를 고릅니다. · 완료 기준: 이유와 다음 확인 날짜를 한 문장으로 적음 · 위험: 결론 없이 계속 고민만 함 · 다음 관문: 실행하거나 끝내기`,
    ].join("\n\n"),
    "1. Rewrite the goal as one testable sentence.\n\n2. Record three baseline facts.\n\n3. Run one half-sized test.\n\n4. Classify positive, warning, and contradictory signs.\n\n5. Record the stop threshold and owner.\n\n6. Choose expand, maintain, or stop and set the next review date.",
  );
  const checklist = localized(
    locale,
    `□ 이 질문에서 확인된 사실과 내가 바라는 해석을 나누어 보았는가?\n□ ${withParticle(strategy.proof, "object")} 같은 방법으로 두 번 이상 확인했는가?\n□ 최대 손실과 그만둘 때 드는 비용을 적었는가?\n□ 상대의 마음, 진단, 승인, 수익을 사실처럼 단정하지 않았는가?\n□ 잠이 부족하거나 두렵고 흥분된 상태에서 큰 결정을 확정하지 않았는가?\n□ 계약, 의료, 법률, 대출 문제는 자격 있는 전문가나 공식 문서로 확인했는가?\n□ 멈출 조건과 다음에 확인할 날짜를 정했는가?`,
    "□ Facts and hopes are separated.\n□ Evidence is checked twice.\n□ Maximum downside is written.\n□ Private facts or outcomes are not assumed.\n□ No major decision is made under acute pressure.\n□ Professional matters are formally checked.\n□ Stop condition and review date are set.",
  );
  const stops = localized(
    locale,
    [
      `1. ${strategy.threshold}이면 지금 하는 방법을 바로 중단합니다.`,
      `2. ${strategy.contradiction}이면 처음 생각을 고집하지 말고 가정을 다시 씁니다.`,
      `3. 되돌릴 수 없는 비용, 계약, 관계 약속의 중요한 조건이 문서로 확인되지 않으면 잠시 멈춥니다.`,
      `4. 잠, 밥, 일, 공부 같은 일상생활이 2주 넘게 눈에 띄게 나빠지면 속도를 늦추고 도움을 받으세요.`,
      `5. 모욕, 위협, 강요, 감시, 경계 침해가 나타나면 해석보다 안전을 지키고 공식적인 도움을 먼저 구하세요.`,
      `6. 두 번을 다시 확인해도 ${withParticle(strategy.proof, "subject")} 나아지지 않으면, 목표를 버리기 전에 방법이나 범위, 시점을 먼저 바꿔 보세요.`,
    ].join("\n\n"),
    `1. Stop at this threshold: ${strategy.threshold}.\n\n2. Rewrite the assumption when evidence contradicts it.\n\n3. Hold irreversible commitments without written terms.\n\n4. Reduce pace when daily function worsens for two weeks.\n\n5. Prioritize safety when boundaries are violated.\n\n6. Pivot the method after two cycles without evidence.`,
  );
  const premiumSections = [
    {
      title: localized(locale, "네 숫자를 하나로 읽는 종합 해석", "Cross-number synthesis"),
      body: `${synthesis}\n\n${hidden}`,
      keySentence: localized(locale, "네 숫자가 함께 만드는 그림을 봐야 진짜 당신이 보여요.", "The real picture only shows up when all four numbers are read together."),
    },
    {
      title: localized(locale, "강점이 실패를 만드는 역설", "When strength creates failure"),
      body: `${paradox}${sharp[5] ? `\n\n${sharp[5]}` : ""}`,
      keySentence: localized(locale, "잘하는 것도 나눠 쓰지 않으면 약점이 돼요.", "Even a strength turns into a weakness if you never share it."),
    },
    {
      title: localized(locale, "최선·현실·위험 시나리오", "Best, likely, and risk scenarios"),
      body: `${scenarioBody}${sharp[6] ? `\n\n${sharp[6]}` : ""}`,
      keySentence: localized(locale, "세 가지 상황 중 어디에 있는지부터 확인하세요.", "First figure out which of the three situations you're actually in."),
    },
    {
      title: localized(locale, "시나리오 확인 신호", "Signals that confirm or contradict"),
      body: signals,
      keySentence: localized(locale, "신호는 정해진 날짜에 같은 방법으로 확인하세요.", "Check the same signs the same way, on a set date."),
    },
    {
      title: localized(locale, "고객별 의사결정 기준", "Personal decision framework"),
      body: decisionFramework,
      keySentence: localized(locale, "사실과 짐작을 나누는 순간 결정이 쉬워져요.", "Deciding gets easier the moment you split facts from guesses."),
    },
    {
      title: localized(locale, "6단계 실행 매뉴얼", "Six-step execution manual"),
      body: actions,
      keySentence: localized(locale, "한 번에 한 단계씩만 밟아 나가세요.", "Take the six steps one at a time, not all at once."),
    },
    {
      title: localized(locale, "이 질문의 위험 방지 체크리스트", "Risk-prevention checklist"),
      body: checklist,
      keySentence: localized(locale, "체크박스 하나라도 비어 있으면 아직 결정할 때가 아니에요.", "If even one box is unchecked, it's not time to decide yet."),
    },
    {
      title: localized(locale, "보류·중단·전환 기준 6가지", "Six hold, stop, or pivot conditions"),
      body: stops,
      keySentence: localized(locale, "이 조건에 걸리면 미루지 말고 바로 멈추세요.", "The moment one of these conditions hits, stop right away."),
    },
    {
      title: localized(locale, "장기 전략", "Long-term strategy"),
      body: `${strategy.longTerm}\n\n${addedByCategory.grounded_advice}`,
      keySentence: localized(locale, "매번 새로 고민하지 말고 한번 정한 기준을 계속 쓰세요.", "Set the rule once and reuse it instead of deciding from scratch every time."),
    },
    {
      title: localized(locale, "최종 종합 판단", "Consultant verdict"),
      body: `${addedByCategory.strong_conclusion}${sharp[7] ? `\n\n${sharp[7]}` : ""}`,
      keySentence: localized(locale, "가능성이 아니라 조건으로 마지막 판단을 내리세요.", "Make the final call based on conditions, not on possibility alone."),
    },
    {
      title: localized(locale, "현실적인 조언과 마무리", "Grounded closing advice"),
      body: localized(
        locale,
        `당신에게 필요한 건 더 강한 확신이 아니라, 이미 가진 통찰과 실행력을 안전하게 확인해 볼 방법입니다. 오늘 모든 답을 다 정하려 하지 말고 첫 번째 확인 항목 하나만 끝내 보세요. 숫자 계산은 방향을 생각하는 데 도움을 줄 뿐, 실제 선택은 눈으로 본 사실, 대화, 전문가의 확인에 따라 언제든 바뀔 수 있어야 합니다.`,
        "You do not need stronger certainty; you need a safer structure for testing the insight and execution you already have. Complete one verification step today and let observed facts revise the interpretation.",
      ),
      keySentence: localized(locale, "오늘은 첫 번째 확인 하나만 끝내면 충분해요.", "Today, finishing just the first check is enough."),
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
      ? localized(locale, "질문에 바로 답한 다음, 세 가지 상황, 확인할 신호, 실행 방법과 멈출 기준까지 한 번에 정리했습니다.", "A direct answer followed by scenarios, signals, action, and stop criteria.")
      : localized(locale, "질문 없이도 성격, 일, 돈, 관계, 2026년 흐름, 오래 쓸 전략까지 빠짐없이 담았습니다.", "A complete profile, work, money, relationship, 2026, and long-term strategy report without requiring a question."),
    sections,
    actions: locale === "ko"
      ? [
        `오늘 ${strategy.proof} 중에서 확인할 수 있는 사실 하나를 적어 보세요.`,
        "되돌리기 어려운 결정은 사실 두 개와 다음에 확인할 날짜가 생길 때까지 미루세요.",
        "이번 주에 작은 시험 하나를 끝내고, 좋은 신호·경고 신호·틀렸다는 신호로 나눠 보세요.",
        "내가 할 일, 남에게 맡길 일, 지켜보기만 할 일을 각각 하나씩만 정하세요.",
        `멈출 기준인 '${strategy.threshold}'을 일정이나 메모에 적어 두세요.`,
        "두 번째로 다시 확인할 때 키울지, 그대로 둘지, 줄일지 하나를 골라 보세요.",
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
      localized(locale, `${strategy.warning}. 이 신호가 보이면 기대나 불안 때문에 돈이나 시간을 더 쓰지 마세요.`, `Do not add resources when this warning appears: ${strategy.warning}.`),
      localized(locale, "건강, 법률, 돈, 대출, 안전 문제는 이 리포트보다 자격 있는 전문가와 공식 문서를 먼저 믿으세요.", "Professional and formal evidence takes priority for health, legal, financial, lending, and safety matters."),
    ], 4),
    disclaimer: localized(
      locale,
      "이 리포트는 나를 더 잘 이해하고 선택을 정리하는 데 도움을 주는 참고 자료입니다. 미래, 건강 상태, 투자 수익, 대출 승인, 시험 합격, 다른 사람의 마음이나 사적인 일을 알려 주거나 보장하지 않습니다. 실제로 확인된 사실과 전문가의 판단이 이 해석보다 항상 먼저입니다.",
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
