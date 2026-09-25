import { withParticle } from "@/core/korean-particles";
import type { NumerologyProfile } from "@/core/numerology";
import type { Locale } from "@/i18n/config";
import {
  COMPATIBILITY_RULE_VERSION,
  relationshipTypes,
  type CompatibilityInsight,
  type CompatibilitySection,
  type CompatibilitySectionId,
  type RelationshipType,
} from "./types";

type Localized = { ko: string; en: string };
type Style = {
  label: Localized;
  strength: Localized;
  need: Localized;
  communication: Localized;
  shadow: Localized;
  repair: Localized;
  responsibility: Localized;
};

const l = (ko: string, en: string): Localized => ({ ko, en });

// Plain-language rewrite: short sentences, everyday words, no jargon.
const STYLES: Record<number, Style> = {
  1: { label: l("주도형", "leading"), strength: l("방향을 확실하게 정함", "picking a clear direction"), need: l("스스로 정할 수 있는 자유", "freedom to decide for themselves"), communication: l("결론부터 딱 부러지게 말함", "saying the conclusion straight, first"), shadow: l("먼저 상의하지 않고 밀어붙임", "pushing ahead without checking first"), repair: l("무엇을 혼자 정하고 무엇을 같이 정할지 다시 정하기", "agreeing again on what to decide alone versus together"), responsibility: l("맡은 일은 내 방식대로 하고 싶어함", "wanting to run their own tasks their own way") },
  2: { label: l("조율형", "harmonizing"), strength: l("분위기와 눈치를 잘 읽음", "reading the mood well"), need: l("편하게 말할 수 있는 분위기", "a comfortable space to talk"), communication: l("부드럽게 물어보며 맞춰감", "adjusting by asking gently"), shadow: l("부딪히기 싫어서 속마음을 늦게 말함", "saying what they really think too late, to avoid conflict"), repair: l("숨겨온 마음을 짧게라도 먼저 말하기", "saying the hidden feeling out loud, even briefly"), responsibility: l("한쪽에만 부담이 쏠리지 않는지 신경씀", "watching that the load doesn't fall on just one person") },
  3: { label: l("표현형", "expressive"), strength: l("감정과 생각을 생생하게 표현함", "expressing feelings and ideas vividly"), need: l("반응해주고 함께 만들어가는 관계", "someone who responds and creates together"), communication: l("이야기와 예를 들어 설명함", "explaining with stories and examples"), shadow: l("분위기만 즐기고 결론을 못 냄", "enjoying the mood but never landing on a decision"), repair: l("대화 끝에 한 문장으로 정리하고 다음 행동을 정하기", "closing with one clear sentence and a next step"), responsibility: l("자유롭게 하고 싶어서 반복되는 일을 놓치기 쉬움", "easily missing routine tasks while wanting freedom") },
  4: { label: l("구조형", "structuring"), strength: l("약속과 일정을 안정적으로 챙김", "keeping commitments and schedules steady"), need: l("예측 가능한 규칙과 역할", "clear, predictable rules and roles"), communication: l("사실과 순서, 담당을 구체적으로 말함", "spelling out facts, order, and who does what"), shadow: l("바꾸자는 말을 무책임하다고 받아들임", "hearing a request to change as irresponsible"), repair: l("바꿔도 되는 것과 지켜야 할 것을 나누기", "sorting what can change from what must stay"), responsibility: l("기록하고 확실히 나눠 맡는 걸 좋아함", "liking things written down and clearly divided") },
  5: { label: l("탐색형", "exploring"), strength: l("변화에 빠르게 적응하고 선택지를 늘림", "adapting fast and opening up options"), need: l("움직일 여유와 새로운 경험", "room to move and new experiences"), communication: l("가능한 대안을 빠르게 제안함", "quickly suggesting alternatives"), shadow: l("합의하기도 전에 다음으로 넘어감", "moving on before agreeing on anything"), repair: l("자유롭게 둘 부분과 꼭 지킬 약속을 같이 정하기", "setting both free room and one minimum promise"), responsibility: l("고정된 몫보다 그때그때 정하는 걸 좋아함", "preferring to decide the share each time, not fix it") },
  6: { label: l("돌봄형", "stewarding"), strength: l("관계와 일상을 꾸준히 챙김", "steadily taking care of the relationship and daily life"), need: l("고맙다는 말과 공평한 보살핌", "being thanked and cared for fairly"), communication: l("이게 관계에 어떤 영향을 주는지로 말함", "talking in terms of how it affects the relationship"), shadow: l("상대 몫까지 떠맡고 나서 서운해함", "taking over the other's share, then feeling hurt"), repair: l("도와주는 것과 당연히 해야 하는 일을 구분하고, 거절도 괜찮다고 하기", "separating help from duty, and allowing 'no'"), responsibility: l("생활과 공동의 책임을 중요하게 생각함", "valuing shared, everyday responsibilities") },
  7: { label: l("탐구형", "investigating"), strength: l("깊이 파고들어 숨은 전제를 찾아냄", "digging deep to find hidden assumptions"), need: l("생각할 시간과 혼자 있는 시간", "time to think, alone"), communication: l("충분히 생각한 뒤에 핵심만 말함", "speaking only after thinking it through"), shadow: l("조용히 있으면 거리를 두거나 거절하는 것처럼 보일 수 있음", "silence can look like distance or rejection"), repair: l("생각할 시간이 필요하다는 것과 언제 다시 얘기할지 같이 말하기", "saying both that they need time and when they'll come back"), responsibility: l("이유가 분명하면 책임을 깊이 짐", "taking deep responsibility once the reason makes sense") },
  8: { label: l("실행형", "executing"), strength: l("목표와 자원, 결과를 현실적으로 연결함", "connecting goals, resources, and results practically"), need: l("서로 존중하는 것과 분명한 성과 기준", "mutual respect and a clear bar for results"), communication: l("결정과 결과 위주로 빠르게 정리함", "wrapping up fast, focused on decisions and results"), shadow: l("효율을 감정이나 합의보다 앞세울 수 있음", "putting efficiency ahead of feelings or agreement"), repair: l("결과만이 아니라 과정에서 누가 어떤 영향과 권한을 가졌는지도 같이 보기", "reviewing who had what influence and say, not just the result"), responsibility: l("자원과 결과는 누구 책임인지 분명히 하고 싶어함", "wanting clear ownership of resources and outcomes") },
  9: { label: l("의미형", "meaning-oriented"), strength: l("서로 다른 입장을 큰 그림으로 연결함", "connecting different views into a bigger picture"), need: l("가치관이 맞고 여유 있는 관계", "matching values and room to breathe"), communication: l("의미와 장기적인 영향 중심으로 말함", "talking about meaning and the long run"), shadow: l("이상을 좇다가 현실적인 분담을 놓칠 수 있음", "chasing an ideal and missing the real division of work"), repair: l("큰 가치와 이번 주에 할 구체적인 행동을 연결하기", "connecting the big value to one concrete thing this week"), responsibility: l("공정함과 더 넓은 영향을 생각함", "thinking about fairness and the wider impact") },
  11: { label: l("통찰형", "insight-oriented"), strength: l("미묘한 긴장이나 모순을 말로 짚어냄", "putting subtle tension into words"), need: l("솔직한 감정 표현과 안정된 속도", "honest feelings and a steady pace"), communication: l("느낌과 원칙을 같이 확인함", "checking both feelings and principles"), shadow: l("너무 예민하게 해석하고 기준이 높아 쉽게 지침", "reading too much into things and wearing out from high standards"), repair: l("짐작과 실제로 본 것을 나눠서 확인하기", "separating what they assume from what they actually saw"), responsibility: l("공정한 기준과 서로의 책임을 중요하게 여김", "caring about fair standards and mutual responsibility") },
  22: { label: l("구축형", "systems-building"), strength: l("장기적인 비전을 실제로 돌아가는 구조로 만듦", "turning a long-term vision into something that actually works"), need: l("같은 목표와 오래 지속 가능한 분담", "a shared goal and a workload that can last"), communication: l("큰 그림과 실행 단계를 같이 제시함", "showing both the big picture and the steps"), shadow: l("규모와 책임을 혼자 통제하려 할 수 있음", "trying to control the scale and responsibility alone"), repair: l("누가 결정하고 누가 책임지고 언제 멈출지 글로 다시 정하기", "writing down again who decides, who's responsible, and when to stop"), responsibility: l("장기적인 자원 계획과 소유권을 중요하게 여김", "valuing long-term resource plans and ownership") },
  33: { label: l("성장지원형", "growth-stewarding"), strength: l("상대가 성장하도록 참을성 있게 도움", "patiently helping the other person grow"), need: l("서로 돌보는 것과 건강한 거리 두기", "mutual care and a healthy amount of space"), communication: l("감정과 성장에 대한 필요를 따뜻하게 다룸", "handling feelings and growing pains warmly"), shadow: l("돕는 게 희생이나 간섭으로 바뀔 수 있음", "help turning into self-sacrifice or control"), repair: l("부탁받은 도움과 스스로 나선 도움을 구분하기", "telling apart help that was asked for from help that wasn't"), responsibility: l("사람을 돌보는 책임을 크게 느낌", "feeling a big responsibility for taking care of people") },
};

const TITLES: Record<CompatibilitySectionId, Localized> = {
  common_ground: l("공통점", "Common ground"),
  complement: l("서로 채워주는 점", "How you complement each other"),
  friction: l("부딪히는 점", "Where you clash"),
  communication: l("대화 방식", "How you talk"),
  money_responsibility: l("돈과 책임", "Money & responsibility"),
  decision_authority: l("결정은 누가?", "Who decides"),
  conflict_repair: l("갈등 풀기", "Making up after conflict"),
  maintenance: l("관계를 지키는 법", "Keeping the relationship going"),
};

const TYPE_COPY: Record<RelationshipType, {
  label: Localized;
  shared: Localized;
  responsibility: Localized;
  authority: Localized;
  maintenance: Localized;
  roleNote?: Localized;
}> = {
  romance: { label: l("연애", "Romance"), shared: l("설레는 마음과 함께 속도와 선을 맞춰가는 관계", "a relationship where attraction meets pace and boundaries"), responsibility: l("돈, 시간, 마음 쓰는 일을 한쪽에만 맡기지 않기", "don't leave money, time, or emotional effort to just one person"), authority: l("연락 빈도, 다른 사람을 안 만나는 것, 스킨십의 선은 둘이 같이 정하기", "decide contact frequency, exclusivity, and physical boundaries together"), maintenance: l("설렘의 크기보다 한결같은 행동과 거절을 존중하는지를 보기", "look at consistent behavior and respect for 'no', more than the spark") },
  marriage: { label: l("결혼·오랜 동반자", "Marriage & long-term partnership"), shared: l("일상, 가치관, 앞으로의 계획을 함께 꾸려가는 관계", "a relationship that runs daily life, values, and long-term plans together"), responsibility: l("소득, 빚, 돌봄, 집안일 몫을 주기적으로 터놓고 다시 나누기", "openly share and re-divide income, debt, care, and housework regularly"), authority: l("공동 재정과 큰 결정은 둘 다 똑같이 알고 똑같이 거부할 수 있게 하기", "give equal access to information and an equal veto on shared money and big decisions"), maintenance: l("애정 표현도, 살림을 상의하는 것도 둘 다 관계의 일부로 두기", "treat both affection and practical talks about running the household as part of the relationship") },
  friendship: { label: l("친구", "Friendship"), shared: l("좋아하는 것과 믿음을 자연스럽게 나누는 관계", "a relationship built on shared interest and trust, freely chosen"), responsibility: l("도와주는 일과 그게 반복되는 부담을 당연하게 여기지 않기", "don't treat help — or its repeated cost — as owed"), authority: l("서로 다른 인간관계와 시간을 간섭하지 않기", "don't try to control each other's time or other relationships"), maintenance: l("얼마나 자주 연락하는지보다 서로 정한 기대와 다시 회복할 수 있는지를 보기", "look at agreed expectations and whether you can repair, more than how often you talk") },
  coworker: { label: l("동료", "Coworkers"), shared: l("공동의 결과를 위해 역할과 정보를 주고받는 관계", "a relationship that connects roles and information toward a shared result"), responsibility: l("누가 맡았는지, 마감은 언제인지, 인수인계는 어떻게 할지 기록으로 남기기", "write down who owns what, deadlines, and handoffs"), authority: l("직급과 실제 결정권이 다를 수 있다는 걸 분명히 확인하기", "check clearly whether title and real decision-making power actually match"), maintenance: l("성격 판단보다 실제로 관찰한 행동과 업무 합의를 기준으로 삼기", "go by observed behavior and work agreements, not personality judgments") },
  cofounder: { label: l("공동창업자", "Cofounders"), shared: l("위험과 소유권, 방향을 함께 짊어지는 관계", "a relationship that shares risk, ownership, and direction"), responsibility: l("지분, 급여, 지출 승인, 핵심 업무는 누구 몫인지 문서로 남기기", "put equity, pay, expense approval, and core ownership in writing"), authority: l("의견이 갈릴 때, 한쪽이 나갈 때, 지분을 넘길 때의 절차를 미리 정해두기", "agree in advance on what happens at a deadlock, a departure, or a transfer of equity"), maintenance: l("친하다는 이유로 회사의 규칙과 절차를 대신하지 않기", "don't let closeness stand in for real governance") },
  manager_report: { label: l("상사·부하", "Manager & report"), shared: l("권한 차이 속에서 목표와 성장을 맞춰가는 관계", "a relationship that aligns goals and growth despite unequal power"), responsibility: l("업무 범위, 평가 기준, 지원해줄 자원은 관리자가 먼저 분명히 말하기", "the manager states scope, evaluation criteria, and support up front"), authority: l("첫 번째 사람이 관리자, 두 번째 사람이 보고자입니다. 잘 맞는다는 이유로, 동의하기 어려운 권한 차이를 정당화하지 않기", "The first person is the manager and the second is the report. Don't use a good match to justify a power gap that limits real consent"), maintenance: l("심리적으로 안전한지, 기대치가 문서로 남아있는지, 다른 의견을 말해도 불이익이 없는지를 지키기", "protect psychological safety, written expectations, and speaking up without payback"), roleNote: l("첫 번째 입력: 관리자 · 두 번째 입력: 보고자", "First input: manager · second input: report") },
  parent_child: { label: l("부모·자녀", "Parent & child"), shared: l("자라나는 단계와 돌봐야 할 책임 속에서 믿음을 키우는 관계", "a relationship that builds trust while a child grows and a parent cares for them"), responsibility: l("돌보는 책임은 부모에게 있고, 자녀에게 부모의 감정까지 챙기라고 하지 않기", "caregiving is the parent's job — don't ask the child to take care of the parent's feelings"), authority: l("첫 번째 사람이 부모, 두 번째 사람이 자녀입니다. 나이와 안전에 맞게 스스로 정할 수 있는 부분을 늘려주기", "The first person is the parent and the second is the child. Give more autonomy as age and safety allow"), maintenance: l("말을 잘 듣는지보다 안전하게 물어볼 수 있는지, 일관된 기준이 있는지, 실수해도 다시 괜찮아질 수 있는지를 보기", "value safe questions, consistent limits, and mistakes that can be repaired, more than obedience"), roleNote: l("첫 번째 입력: 부모 · 두 번째 입력: 자녀", "First input: parent · second input: child") },
  family: { label: l("가족", "Family"), shared: l("오래된 역할과 생활의 책임을 함께 맞춰가는 관계", "a relationship that adjusts long-standing roles and everyday responsibilities together"), responsibility: l("돌봄, 연락, 비용을 가족이라는 이유만으로 한 사람에게만 계속 맡기지 않기", "don't keep assigning care, contact, or cost to one person just because they're family"), authority: l("나이나 서열보다 각자의 안전, 동의, 지금의 현실적인 책임을 먼저 보기", "put each person's safety, consent, and real responsibility ahead of age or birth order"), maintenance: l("오래된 역할을 성격 탓으로 돌리지 말고, 지금 가능한 도움과 선을 다시 정하기", "don't blame old roles on personality — renegotiate what help and boundaries make sense now") },
};

function pick(value: Localized, locale: Locale): string { return value[locale]; }
function style(value: number): Style { return STYLES[value] ?? STYLES[9]; }
function pairRef(id: string, a: number, b: number): string {
  return `pair.${id}:${[a, b].sort((x, y) => x - y).join("|")}`;
}

function section(
  id: CompatibilitySectionId,
  locale: Locale,
  observation: string,
  practicalConditions: string[],
  realityCheck: string,
  evidenceRefs: string[],
): CompatibilitySection {
  return { id, title: pick(TITLES[id], locale), observation, practicalConditions, realityCheck, evidenceRefs };
}

export function createCompatibilityInsight(input: {
  personA: NumerologyProfile;
  personB: NumerologyProfile;
  relationshipType: RelationshipType;
  locale: Locale;
}): CompatibilityInsight {
  if (!relationshipTypes.includes(input.relationshipType)) throw new Error("Unsupported relationship type.");
  const { personA, personB, locale } = input;
  const ko = locale === "ko";
  const type = TYPE_COPY[input.relationshipType];
  const lifeValues = [personA.lifePath.value, personB.lifePath.value].sort((a, b) => a - b);
  const attitudeValues = [personA.attitude.value, personB.attitude.value].sort((a, b) => a - b);
  const lifeStyles = lifeValues.map(style);
  const attitudeStyles = attitudeValues.map(style);
  const sameLifePath = lifeValues[0] === lifeValues[1];
  const lifeRef = pairRef("lifePath", personA.lifePath.value, personB.lifePath.value);
  const attitudeRef = pairRef("attitude", personA.attitude.value, personB.attitude.value);
  const birthdayRef = pairRef("birthday", personA.birthday.value, personB.birthday.value);
  const nameRef = personA.name.status === "calculated" && personB.name.status === "calculated" && personA.name.soulUrge && personB.name.soulUrge
    ? pairRef("soulUrge", personA.name.soulUrge.value, personB.name.soulUrge.value)
    : undefined;
  const allRefs = [lifeRef, attitudeRef, birthdayRef, ...(nameRef ? [nameRef] : [])];

  const commonObservation = sameLifePath
    ? (ko
        ? `두 사람 모두 ${pick(lifeStyles[0].label, locale)} 쪽에 가까워서, ${withParticle(pick(lifeStyles[0].need, locale), "object")} 똑같이 중요하게 볼 수 있습니다.`
        : `Both of you lean toward ${pick(lifeStyles[0].label, locale)}, so you may both value ${pick(lifeStyles[0].need, locale)}.`)
    : (ko
        ? `${withParticle(pick(lifeStyles[0].strength, locale), "with")} ${withParticle(pick(lifeStyles[1].strength, locale), "subject")} 공동의 목표 안에서 만날 수 있습니다.`
        : `${pick(lifeStyles[0].strength, locale)} and ${pick(lifeStyles[1].strength, locale)} can meet inside a shared goal.`);

  const sections: CompatibilitySection[] = [
    section(
      "common_ground",
      locale,
      commonObservation,
      [pick(type.shared, locale)],
      ko ? "두 사람이 실제로 반복해서 중요하게 여긴 기준이 있다면 무엇인가요?" : "What shared standard have both of you repeatedly cared about in real life?",
      [lifeRef],
    ),
    section(
      "complement",
      locale,
      ko
        ? `한 사람은 ${withParticle(pick(lifeStyles[0].strength, locale), "with")}, 다른 사람은 ${withParticle(pick(lifeStyles[1].strength, locale), "topic")}, 역할이 분명하면 서로 잘 채워줄 수 있습니다.`
        : `One person's ${pick(lifeStyles[0].strength, locale)} and the other's ${pick(lifeStyles[1].strength, locale)} can complement each other when roles are clear.`,
      [ko ? "강점을 고정된 역할로 굳히지 말고 상황에 따라 바꿔서 맡기" : "Don't turn strengths into fixed roles — swap them as the situation changes"],
      ko ? "최근에 한 사람이 자연스럽게 채워준 실제 장면이 있었나요?" : "What recent moment shows one person genuinely covering for the other?",
      [lifeRef],
    ),
    section(
      "friction",
      locale,
      ko
        ? `${withParticle(pick(lifeStyles[0].shadow, locale), "with")} ${withParticle(pick(lifeStyles[1].shadow, locale), "subject")} 같이 나타나면, 무슨 뜻인지 물어보기도 전에 방어부터 하게 될 수 있습니다.`
        : `When ${pick(lifeStyles[0].shadow, locale)} and ${pick(lifeStyles[1].shadow, locale)} show up together, you may get defensive before checking what was actually meant.`,
      [ko ? "실제 행동, 내가 해석한 것, 원하는 것을 한 문장씩 나눠서 말하기" : "Say the actual behavior, your interpretation, and your request as three separate sentences"],
      ko ? "다툴 때 반복해서 보였던 행동은 구체적으로 무엇이었나요?" : "What specific behavior has repeated during past conflicts?",
      [lifeRef, attitudeRef],
    ),
    section(
      "communication",
      locale,
      ko
        ? `${withParticle(pick(attitudeStyles[0].communication, locale), "with")} ${pick(attitudeStyles[1].communication, locale)} 사이에는 속도 차이가 있을 수 있습니다.`
        : `You may notice a pacing gap between ${pick(attitudeStyles[0].communication, locale)} and ${pick(attitudeStyles[1].communication, locale)}.`,
      [ko ? "대화를 시작하기 전에, 지금 필요한 게 공감인지 정보인지 결정인지 먼저 말하기" : "Before you start talking, say whether you need empathy, information, or a decision"],
      ko ? "두 사람 모두 편하게 말할 수 있었던 순간은 어떤 조건이었나요?" : "What conditions have let both of you speak comfortably?",
      [attitudeRef],
    ),
    section(
      "money_responsibility",
      locale,
      ko
        ? `${withParticle(pick(attitudeStyles[0].responsibility, locale), "with")} ${withParticle(pick(attitudeStyles[1].responsibility, locale), "topic")}, 말하지 않은 기대가 쌓이면 부딪힐 수 있습니다.`
        : `${pick(attitudeStyles[0].responsibility, locale)} and ${pick(attitudeStyles[1].responsibility, locale)} can clash once unspoken expectations pile up.`,
      [pick(type.responsibility, locale)],
      ko ? "실제로 돈, 시간, 돌봄의 부담은 지금 누구에게 얼마나 나눠져 있나요?" : "How are the real costs, time, and care actually split between you right now?",
      [attitudeRef, birthdayRef],
    ),
    section(
      "decision_authority",
      locale,
      ko
        ? "숫자로 나온 특징이 결정권을 주는 건 아닙니다. 관계의 종류, 법적 책임, 역할, 서로의 동의가 더 중요합니다."
        : "Numbers don't decide who's in charge. What matters more is the type of relationship, legal responsibility, roles, and mutual consent.",
      [pick(type.authority, locale)],
      ko ? "누가 어떤 정보를 알고 있고, 어떤 결정에 거부권이 있나요?" : "Who has which information, and who can veto which decisions?",
      [lifeRef],
    ),
    section(
      "conflict_repair",
      locale,
      ko
        ? `${withParticle(pick(lifeStyles[0].repair, locale), "with")} ${withParticle(pick(lifeStyles[1].repair, locale), "object")} 순서대로 한번 시도해볼 수 있습니다.`
        : `Try ${pick(lifeStyles[0].repair, locale)} and then ${pick(lifeStyles[1].repair, locale)}, in that order.`,
      [ko ? "잠깐 멈추자는 신호, 다시 얘기할 시간, 합의한 내용을 미리 정해두기" : "Decide ahead of time on a pause signal, a time to return, and how you'll record what you agreed"],
      ko ? "사과한 뒤 실제로 행동이 달라졌는지는 무엇을 보면 알 수 있나요?" : "What would actually show that behavior changed after an apology?",
      [lifeRef, attitudeRef],
    ),
    section(
      "maintenance",
      locale,
      ko
        ? "관계가 오래가는지는 숫자 궁합보다, 실제로 반복되는 행동과 안전, 동의, 책임감에 달려 있습니다."
        : "Whether a relationship lasts depends more on repeated behavior, safety, consent, and responsibility than on any number match.",
      [pick(type.maintenance, locale), ko ? "가끔씩 잘된 점, 힘들었던 점, 바꿀 것을 짧게 같이 점검하기" : "Regularly take a short look together at what worked, what was hard, and what to change"],
      ko ? "이 관계가 앞으로도 괜찮을 거라는 실제 증거와, 반대로 걸리는 점은 각각 무엇인가요?" : "What real evidence says this relationship is holding up — and what evidence says otherwise?",
      allRefs,
    ),
  ];

  return {
    ruleVersion: COMPATIBILITY_RULE_VERSION,
    relationshipType: input.relationshipType,
    relationshipLabel: pick(type.label, locale),
    summary: ko
      ? `두 사람의 생년월일 패턴이 어디서 비슷하고 어디서 다른지를 보면서 ${pick(type.label, locale)} 관계를 돌아보는 자료입니다. 판단할 때는 숫자보다 실제 행동과 서로의 동의를 기준으로 삼으세요.`
      : `A guide for thinking through a ${pick(type.label, locale)} relationship, using where your birth-date patterns match and differ. When it matters, real behavior and mutual consent should decide — not the numbers.`,
    roleOrderNote: type.roleNote ? pick(type.roleNote, locale) : undefined,
    sections,
    uncertainty: ko
      ? "이 결과는 관계가 잘 될지, 상대가 바람을 피울지, 결혼할 수 있을지, 상대의 진짜 속마음이 무엇인지를 알려주지 않습니다. 중요한 판단은 직접 대화, 안전, 반복되는 행동, 실제 상황으로 확인하세요."
      : "This doesn't predict whether the relationship will work out, whether someone will stay faithful, whether you'll get married, or what the other person really feels. For anything that matters, check with direct conversation, safety, repeated behavior, and the real situation."
    ,
    privacyNote: ko
      ? "두 사람이 입력한 정보는 지금 보고 있는 화면에서만 계산되고, 따로 저장되지 않습니다."
      : "Both people's info is used only in this browser session and isn't saved anywhere.",
  };
}
