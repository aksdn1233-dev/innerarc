import { withParticle } from "@/core/korean-particles";
import type { NumerologyProfile } from "@/core/numerology";
import type { Locale } from "@/i18n/config";

export const INTEGRATED_PROFILE_RULE_VERSION = "integrated-profile-1.0.0";

export const profileDomainIds = [
  "thinking",
  "action",
  "relationships",
  "leadership",
  "career",
  "money",
  "stress",
  "growth",
] as const;

export type ProfileDomainId = (typeof profileDomainIds)[number];

export const careerRoleIds = [
  "entrepreneurship",
  "strategy",
  "sales",
  "marketing_content",
  "research_data",
  "public_admin",
  "arts_entertainment",
  "education_counseling",
  "operations_finance",
] as const;

export type CareerRoleId = (typeof careerRoleIds)[number];

export interface ProfileDomainInsight {
  id: ProfileDomainId;
  title: string;
  calculatedFacts: string[];
  traditionalInterpretation: string;
  personalizedInference: string;
  realityCheck: string;
  uncertainty: string;
  evidenceRefs: string[];
}

export interface CareerRecommendation {
  roleId: CareerRoleId;
  title: string;
  rank: number;
  fitReason: string;
  adverseCondition: string;
  complementarySkill: string;
  preferredEnvironment: string;
  avoidCondition: string;
  evidenceRefs: string[];
}

export interface IntegratedProfile {
  ruleVersion: typeof INTEGRATED_PROFILE_RULE_VERSION;
  summary: string;
  domains: ProfileDomainInsight[];
  careerRecommendations: CareerRecommendation[];
  strengths: string[];
  risks: string[];
  practicalActions: string[];
  uncertainty: string;
}

type NumberTheme = {
  label: { ko: string; en: string };
  drive: { ko: string; en: string };
  strength: { ko: string; en: string };
  shadow: { ko: string; en: string };
  roles: readonly CareerRoleId[];
};

const n = (ko: string, en: string) => ({ ko, en });

const THEMES: Record<number, NumberTheme> = {
  1: { label: n("시작하는 사람", "Initiator"), drive: n("자율성과 시작", "autonomy and initiation"), strength: n("스스로 방향을 세우는 힘", "setting an independent direction"), shadow: n("혼자 밀어붙이거나 도움을 늦게 청함", "pushing alone or asking for help late"), roles: ["entrepreneurship", "sales", "strategy"] },
  2: { label: n("조율하는 사람", "Harmonizer"), drive: n("협력과 세심한 조율", "cooperation and careful coordination"), strength: n("미묘한 관계 신호를 읽는 감각", "noticing subtle relational signals"), shadow: n("갈등을 피하다 자기 기준을 놓침", "losing personal criteria while avoiding conflict"), roles: ["education_counseling", "public_admin", "operations_finance"] },
  3: { label: n("표현하는 사람", "Communicator"), drive: n("표현과 창조", "expression and creation"), strength: n("아이디어에 언어와 생기를 주는 힘", "giving ideas language and vitality"), shadow: n("흥미가 흩어져 마무리가 약해짐", "scattering attention and weakening follow-through"), roles: ["marketing_content", "arts_entertainment", "sales"] },
  4: { label: n("구조를 세우는 사람", "Builder"), drive: n("질서와 신뢰 가능한 구조", "order and dependable structure"), strength: n("복잡한 일을 반복 가능한 과정으로 만듦", "turning complexity into repeatable process"), shadow: n("변화를 위험으로만 보고 경직됨", "treating change only as risk and becoming rigid"), roles: ["operations_finance", "public_admin", "research_data"] },
  5: { label: n("탐색하는 사람", "Explorer"), drive: n("변화와 경험", "change and experience"), strength: n("새 환경에서 빠르게 배우고 연결함", "learning and connecting quickly in new settings"), shadow: n("새로움 때문에 지속성을 놓침", "losing continuity in pursuit of novelty"), roles: ["sales", "marketing_content", "entrepreneurship"] },
  6: { label: n("돌보는 사람", "Steward"), drive: n("책임과 돌봄", "responsibility and care"), strength: n("사람과 환경의 질을 꾸준히 높임", "steadily improving the quality of people and environments"), shadow: n("타인의 몫까지 책임지며 지침", "over-carrying others' responsibilities"), roles: ["education_counseling", "public_admin", "arts_entertainment"] },
  7: { label: n("탐구하는 사람", "Investigator"), drive: n("깊이와 검증", "depth and verification"), strength: n("표면 아래의 원리와 패턴을 찾음", "finding principles and patterns beneath the surface"), shadow: n("확신이 생길 때까지 행동을 미룸", "delaying action until certainty arrives"), roles: ["research_data", "strategy", "education_counseling"] },
  8: { label: n("실행을 조직하는 사람", "Executive"), drive: n("성과와 자원 운영", "outcomes and resource stewardship"), strength: n("목표와 자원을 현실적 결과로 연결함", "connecting goals and resources to practical outcomes"), shadow: n("성과 압박으로 관계와 회복을 후순위로 둠", "putting relationships and recovery behind performance pressure"), roles: ["entrepreneurship", "operations_finance", "strategy"] },
  9: { label: n("의미를 잇는 사람", "Humanitarian"), drive: n("의미와 더 넓은 관점", "meaning and a wider perspective"), strength: n("다른 경험을 하나의 큰 맥락으로 연결함", "connecting different experiences into a larger context"), shadow: n("이상과 현실의 간극에서 소진됨", "burning out in the gap between ideals and reality"), roles: ["arts_entertainment", "education_counseling", "marketing_content"] },
  11: { label: n("통찰을 번역하는 사람", "Insight Translator"), drive: n("직관과 균형 감각", "intuition and balance"), strength: n("긴장되는 관점을 섬세한 언어로 연결함", "connecting tensions through nuanced language"), shadow: n("높은 민감도와 기준으로 과부하됨", "becoming overloaded by sensitivity and high standards"), roles: ["strategy", "education_counseling", "marketing_content"] },
  22: { label: n("비전을 구현하는 사람", "Systems Builder"), drive: n("큰 비전과 현실적 구축", "large vision and practical construction"), strength: n("장기 비전을 작동하는 시스템으로 바꿈", "turning long-range vision into working systems"), shadow: n("규모와 책임을 혼자 감당하려 함", "trying to carry scale and responsibility alone"), roles: ["strategy", "operations_finance", "entrepreneurship"] },
  33: { label: n("성장을 돕는 사람", "Growth Steward"), drive: n("돌봄과 공동 성장", "care and shared growth"), strength: n("사람의 성장을 장기적으로 지지함", "supporting people's growth over time"), shadow: n("도움이 자기희생으로 바뀜", "letting support turn into self-sacrifice"), roles: ["education_counseling", "arts_entertainment", "public_admin"] },
};

const ROLE_COPY: Record<CareerRoleId, {
  title: { ko: string; en: string };
  reason: { ko: string; en: string };
  adverse: { ko: string; en: string };
  skill: { ko: string; en: string };
  environment: { ko: string; en: string };
  avoid: { ko: string; en: string };
}> = {
  entrepreneurship: { title: n("창업·사업개발", "Entrepreneurship & business development"), reason: n("불확실한 기회를 정의하고 움직이는 역할", "Work that defines and advances uncertain opportunities"), adverse: n("권한 없이 위험만 떠안는 구조", "A structure that assigns risk without authority"), skill: n("재무 가설과 실행 우선순위", "financial hypotheses and execution priorities"), environment: n("짧은 피드백 주기와 분명한 결정권", "short feedback cycles and clear decision rights"), avoid: n("근거 없는 낙관만 보상하는 문화", "cultures that reward unsupported optimism") },
  strategy: { title: n("전략기획", "Strategy"), reason: n("복잡한 신호를 기준과 방향으로 정리하는 역할", "Work that turns complex signals into criteria and direction"), adverse: n("분석이 실행과 연결되지 않는 조직", "organizations where analysis never reaches execution"), skill: n("이해관계자 설득과 실험 설계", "stakeholder alignment and experiment design"), environment: n("문제 정의 권한과 검증 가능한 목표", "room to frame problems and testable goals"), avoid: n("정치적 결론을 꾸미기만 하는 역할", "roles that merely decorate political conclusions") },
  sales: { title: n("영업", "Sales"), reason: n("사람의 필요를 듣고 행동 가능한 제안으로 연결하는 역할", "Work that hears needs and connects them to actionable offers"), adverse: n("기만적 압박과 단기 실적만 강요", "deceptive pressure and short-term-only targets"), skill: n("CRM 규율과 거절 이후 회복", "CRM discipline and recovery after rejection"), environment: n("명확한 가치 제안과 건강한 성과 기준", "clear value propositions and healthy performance criteria"), avoid: n("고객 적합성보다 계약만 중시", "contract-first cultures that ignore customer fit") },
  marketing_content: { title: n("마케팅·콘텐츠", "Marketing & content"), reason: n("관점과 메시지를 사람의 언어로 전달하는 역할", "Work that translates perspective and messages into human language"), adverse: n("반응 수치만 좇아 의미가 사라지는 환경", "environments where reaction metrics erase meaning"), skill: n("측정 설계와 편집 루틴", "measurement design and editorial routine"), environment: n("창작 자율성과 실제 사용자 피드백", "creative autonomy with real user feedback"), avoid: n("항상 즉흥 대응만 요구하는 운영", "operations built entirely on reactive requests") },
  research_data: { title: n("연구·데이터", "Research & data"), reason: n("가설을 검증하고 숨은 구조를 찾는 역할", "Work that tests hypotheses and finds hidden structure"), adverse: n("근거보다 결론이 먼저 정해진 과제", "assignments where conclusions precede evidence"), skill: n("결과 전달과 충분한 시점의 의사결정", "communicating results and deciding with sufficient evidence"), environment: n("집중 시간, 데이터 접근, 동료 검토", "focus time, data access, and peer review"), avoid: n("정확성과 속도 모두를 무제한 요구", "unbounded demands for both speed and precision") },
  public_admin: { title: n("행정·공공", "Public service & administration"), reason: n("기준과 책임을 여러 사람에게 일관되게 적용하는 역할", "Work that applies standards and responsibility consistently across people"), adverse: n("책임은 크지만 개선 권한이 없는 자리", "high-accountability roles without improvement authority"), skill: n("정책 커뮤니케이션과 변화 관리", "policy communication and change management"), environment: n("명확한 공익 목적과 절차 개선 여지", "a clear public purpose and room to improve process"), avoid: n("형식 준수만 성과로 보는 문화", "cultures that treat formal compliance as the only outcome") },
  arts_entertainment: { title: n("예술·엔터테인먼트", "Arts & entertainment"), reason: n("감정과 의미를 경험 가능한 형태로 만드는 역할", "Work that makes emotion and meaning experiential"), adverse: n("무보수 헌신과 경계 없는 가용성을 정상화", "normalizing unpaid devotion and boundaryless availability"), skill: n("작업 일정과 계약·권리 이해", "production scheduling and contract or rights literacy"), environment: n("분명한 피드백과 창작 안전", "clear feedback and creative safety"), avoid: n("공포와 비교로 창작을 통제", "controlling creative work through fear and comparison") },
  education_counseling: { title: n("교육·상담", "Education & counseling"), reason: n("사람의 이해와 성장을 구조적으로 돕는 역할", "Work that supports understanding and growth in a structured way"), adverse: n("정서 노동의 범위와 회복 시간이 불분명", "unclear emotional-labor boundaries and recovery time"), skill: n("전문 경계와 근거 기반 방법", "professional boundaries and evidence-based methods"), environment: n("감독·동료 지원과 현실적인 사례량", "supervision, peer support, and realistic caseloads"), avoid: n("도움을 자기희생으로 평가하는 문화", "cultures that equate helping with self-sacrifice") },
  operations_finance: { title: n("운영·재무", "Operations & finance"), reason: n("자원과 과정의 신뢰도를 높이는 역할", "Work that improves the reliability of resources and process"), adverse: n("오류 책임만 있고 시스템 개선권은 없음", "error accountability without system-improvement authority"), skill: n("예외 판단과 변화 커뮤니케이션", "exception judgment and change communication"), environment: n("명확한 소유권과 개선 가능한 프로세스", "clear ownership and improvable processes"), avoid: n("상시 긴급 대응을 정상 운영으로 취급", "treating constant emergencies as normal operations") },
};

const DOMAIN_TITLE: Record<ProfileDomainId, { ko: string; en: string }> = {
  thinking: n("사고방식", "Thinking"), action: n("행동방식", "Action"), relationships: n("인간관계", "Relationships"), leadership: n("리더십", "Leadership"), career: n("직업", "Career"), money: n("돈과 책임", "Money & responsibility"), stress: n("스트레스", "Stress"), growth: n("성장 전략", "Growth strategy"),
};

function text<T extends { ko: string; en: string }>(value: T, locale: Locale): string {
  return value[locale];
}

function theme(value: number): NumberTheme {
  return THEMES[value] ?? THEMES[9];
}

function evidence(id: string, value: number): string {
  return `${id}:${value}`;
}

function fact(id: string, value: number, locale: Locale): string {
  const names: Record<string, { ko: string; en: string }> = {
    lifePath: n("라이프 패스", "Life Path"), birthday: n("생일 수", "Birthday"), attitude: n("태도 수", "Attitude"), personalYear: n("개인 연도", "Personal Year"), destiny: n("운명·표현 수", "Destiny / Expression"), soulUrge: n("소울 얼지", "Soul Urge"), personality: n("성격 수", "Personality"),
  };
  return `${text(names[id], locale)} ${value}`;
}

function domain(
  id: ProfileDomainId,
  values: Array<{ id: string; value: number }>,
  locale: Locale,
): ProfileDomainInsight {
  const ko = locale === "ko";
  const primary = theme(values[0].value);
  const secondary = theme(values[1]?.value ?? values[0].value);
  const checks: Record<ProfileDomainId, { ko: string; en: string }> = {
    thinking: n("최근 결정 하나에서 처음 떠오른 판단과 실제로 확인한 근거를 나눠 적어보세요.", "For one recent decision, separate your first judgment from the evidence you actually checked."),
    action: n("이번 주에 시작한 일과 끝낸 일을 각각 기록해 에너지의 시작·지속 패턴을 확인하세요.", "Track what you started and finished this week to observe initiation and follow-through."),
    relationships: n("안전하다고 느낀 관계에서 반복된 대화 방식과 경계를 한 가지씩 찾으세요.", "Identify one repeated communication habit and boundary in a relationship that felt safe."),
    leadership: n("의견 충돌 때 직접 정한 것과 위임한 것을 구분해 결과를 비교하세요.", "In a disagreement, compare what you decided directly with what you delegated."),
    career: n("흥미보다 오래 유지된 업무 활동 세 가지와 소진을 만든 조건 세 가지를 적으세요.", "List three work activities you sustained and three conditions that reliably drained you."),
    money: n("최근 지출 하나를 필요·감정·관계 책임으로 나눠 결정 과정을 돌아보세요.", "Review one recent expense through need, emotion, and relational responsibility."),
    stress: n("압박을 느낀 순간의 신체 신호, 자동 행동, 회복에 도움 된 조건을 기록하세요.", "Record the body signal, automatic behavior, and recovery condition from one pressured moment."),
    growth: n("이번 달에 반복할 작은 실험 하나와 중단 기준 하나를 함께 정하세요.", "Choose one small experiment to repeat this month and one criterion for stopping it."),
  };
  return {
    id,
    title: text(DOMAIN_TITLE[id], locale),
    calculatedFacts: values.map((item) => fact(item.id, item.value, locale)),
    traditionalInterpretation: ko
      ? `${text(primary.label, locale)}의 ${withParticle(text(primary.drive, locale), "with")} ${text(secondary.label, locale)}의 ${withParticle(text(secondary.drive, locale), "object")} 함께 보는 상징적 관점입니다.`
      : `This symbolic lens combines the ${text(primary.drive, locale)} of the ${text(primary.label, locale)} with the ${text(secondary.drive, locale)} of the ${text(secondary.label, locale)}.`,
    personalizedInference: ko
      ? `${withParticle(text(primary.strength, locale), "subject")} 도움이 될 수 있지만, ${withParticle(text(secondary.shadow, locale), "subject")} 나타나는 조건에서는 다른 전략이 필요할 수 있습니다.`
      : `${text(primary.strength, locale)} may help, while conditions involving ${text(secondary.shadow, locale)} may call for a different strategy.`,
    realityCheck: text(checks[id], locale),
    uncertainty: ko
      ? "이 해석은 일반화된 상징 가설입니다. 실제 행동 기록과 주변의 구체적 피드백으로 개인 관련성을 확인하세요."
      : "This is a generalized symbolic hypothesis. Check personal relevance against behavior records and specific outside feedback.",
    evidenceRefs: values.map((item) => evidence(item.id, item.value)),
  };
}

function careerRecommendations(profile: NumerologyProfile, locale: Locale): CareerRecommendation[] {
  const sources = [
    { id: "lifePath", value: profile.lifePath.value, weight: 4 },
    { id: "attitude", value: profile.attitude.value, weight: 1 },
    { id: "birthday", value: profile.birthday.value, weight: 1 },
    ...(profile.name.status === "calculated" && profile.name.destiny
      ? [{ id: "destiny", value: profile.name.destiny.value, weight: 3 }]
      : []),
    ...(profile.name.status === "calculated" && profile.name.soulUrge
      ? [{ id: "soulUrge", value: profile.name.soulUrge.value, weight: 1 }]
      : []),
  ];
  const scores = new Map<CareerRoleId, { score: number; refs: string[] }>(
    careerRoleIds.map((id) => [id, { score: 0, refs: [] }]),
  );
  for (const source of sources) {
    theme(source.value).roles.forEach((roleId, index) => {
      const current = scores.get(roleId)!;
      current.score += source.weight * (3 - index);
      current.refs.push(evidence(source.id, source.value));
    });
  }
  return careerRoleIds
    .map((roleId, order) => ({ roleId, order, ...scores.get(roleId)! }))
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, 3)
    .map((item, index) => {
      const copy = ROLE_COPY[item.roleId];
      return {
        roleId: item.roleId,
        title: text(copy.title, locale),
        rank: index + 1,
        fitReason: text(copy.reason, locale),
        adverseCondition: text(copy.adverse, locale),
        complementarySkill: text(copy.skill, locale),
        preferredEnvironment: text(copy.environment, locale),
        avoidCondition: text(copy.avoid, locale),
        evidenceRefs: [...new Set(item.refs)],
      };
    });
}

export function createIntegratedProfile(profile: NumerologyProfile, locale: Locale): IntegratedProfile {
  const lp = { id: "lifePath", value: profile.lifePath.value };
  const bd = { id: "birthday", value: profile.birthday.value };
  const at = { id: "attitude", value: profile.attitude.value };
  const py = { id: "personalYear", value: profile.personalYear.value };
  const destiny = profile.name.status === "calculated" && profile.name.destiny
    ? { id: "destiny", value: profile.name.destiny.value }
    : lp;
  const soul = profile.name.status === "calculated" && profile.name.soulUrge
    ? { id: "soulUrge", value: profile.name.soulUrge.value }
    : at;
  const personality = profile.name.status === "calculated" && profile.name.personality
    ? { id: "personality", value: profile.name.personality.value }
    : bd;
  const domains = [
    domain("thinking", [lp, at], locale),
    domain("action", [bd, at], locale),
    domain("relationships", [lp, soul], locale),
    domain("leadership", [lp, personality], locale),
    domain("career", [lp, destiny], locale),
    domain("money", [at, bd], locale),
    domain("stress", [lp, at], locale),
    domain("growth", [py, lp], locale),
  ];
  const selectedThemes = [theme(lp.value), theme(at.value), theme(bd.value)];
  const ko = locale === "ko";
  return {
    ruleVersion: INTEGRATED_PROFILE_RULE_VERSION,
    summary: ko
      ? `${text(theme(lp.value).label, locale)}의 관점에서 ${withParticle(text(theme(lp.value).drive, locale), "object")} 중심축으로 삼되, 실제 선택 기록으로 적합성을 확인하는 프로필입니다.`
      : `A profile centered on ${text(theme(lp.value).drive, locale)} through the lens of the ${text(theme(lp.value).label, locale)}, with personal fit checked against recorded choices.`,
    domains,
    careerRecommendations: careerRecommendations(profile, locale),
    strengths: [...new Set(selectedThemes.map((item) => text(item.strength, locale)))],
    risks: [...new Set(selectedThemes.map((item) => text(item.shadow, locale)))],
    practicalActions: domains.slice(0, 3).map((item) => item.realityCheck),
    uncertainty: ko
      ? "직무 순위와 영역별 문장은 전통 상징을 구조화한 탐색 가설이며 심리검사, 채용 평가, 투자 조언 또는 미래 예측이 아닙니다."
      : "Role ranking and domain statements are structured exploration hypotheses from traditional symbolism—not psychometrics, hiring assessment, investment advice, or future prediction.",
  };
}
