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

const STYLES: Record<number, Style> = {
  1: { label: l("주도형", "initiating"), strength: l("방향을 분명히 세움", "setting a clear direction"), need: l("자율성과 선택권", "autonomy and choice"), communication: l("결론과 요청을 직접 말함", "stating conclusions and requests directly"), shadow: l("협의 전에 결론을 밀어붙임", "pushing a conclusion before consultation"), repair: l("주도권과 공동결정의 경계를 다시 합의함", "renegotiating the boundary between initiative and shared decisions"), responsibility: l("담당과 결정권이 함께 있기를 원함", "wanting responsibility to come with decision rights") },
  2: { label: l("조율형", "harmonizing"), strength: l("상대의 신호와 분위기를 읽음", "reading signals and atmosphere"), need: l("안전한 대화와 상호 배려", "safe dialogue and mutual care"), communication: l("부드러운 확인 질문으로 조율함", "coordinating through gentle check-in questions"), shadow: l("갈등을 피하다 기준을 늦게 밝힘", "revealing criteria late to avoid conflict"), repair: l("숨긴 기대를 작은 문장으로 먼저 말함", "naming hidden expectations in small, direct statements"), responsibility: l("부담이 한쪽에 몰리지 않는지 살핌", "watching whether burdens collect on one side") },
  3: { label: l("표현형", "expressive"), strength: l("감정과 아이디어를 생생하게 공유함", "sharing feelings and ideas vividly"), need: l("반응과 창의적 교류", "response and creative exchange"), communication: l("이야기와 예시로 의미를 전달함", "conveying meaning through stories and examples"), shadow: l("핵심 합의보다 분위기에 머묾", "staying with atmosphere instead of core agreement"), repair: l("대화를 한 문장 합의와 다음 행동으로 마침", "ending dialogue with one agreed sentence and next action"), responsibility: l("유연성을 원하지만 반복 업무는 놓칠 수 있음", "wanting flexibility while risking missed routine work") },
  4: { label: l("구조형", "structuring"), strength: l("약속과 과정을 안정적으로 관리함", "managing commitments and process reliably"), need: l("예측 가능한 기준과 역할", "predictable standards and roles"), communication: l("사실·순서·책임을 구체적으로 말함", "speaking concretely about facts, sequence, and responsibility"), shadow: l("변경 요청을 무책임으로 해석함", "reading change requests as irresponsibility"), repair: l("변경 가능한 것과 지켜야 할 것을 구분함", "separating what can change from what must remain"), responsibility: l("기록과 분명한 분담을 선호함", "preferring records and explicit division of work") },
  5: { label: l("탐색형", "exploring"), strength: l("변화에 빠르게 적응하고 선택지를 넓힘", "adapting quickly and widening options"), need: l("움직일 여지와 새 경험", "room to move and new experience"), communication: l("가능성과 대안을 빠르게 제안함", "offering possibilities and alternatives quickly"), shadow: l("합의 전에 다음 선택지로 이동함", "moving to the next option before agreement"), repair: l("자유 범위와 최소 약속을 함께 정함", "setting both freedom boundaries and minimum commitments"), responsibility: l("고정 부담보다 선택 가능한 분담을 선호함", "preferring flexible contributions over fixed burdens") },
  6: { label: l("돌봄형", "stewarding"), strength: l("관계의 질과 일상 책임을 꾸준히 돌봄", "steadily caring for relationship quality and daily responsibility"), need: l("감사 표현과 공정한 돌봄", "appreciation and fair care"), communication: l("관계에 미치는 영향을 중심으로 말함", "speaking through the impact on the relationship"), shadow: l("상대의 몫까지 책임진 뒤 서운함이 쌓임", "taking over the other person's share and accumulating resentment"), repair: l("도움과 의무를 분리하고 거절 가능성을 열어둠", "separating help from obligation and allowing refusal"), responsibility: l("생활과 공동체 책임을 중요하게 여김", "valuing daily and shared responsibilities") },
  7: { label: l("탐구형", "investigating"), strength: l("상황을 깊게 보고 숨은 전제를 찾음", "looking deeply and finding hidden assumptions"), need: l("생각할 시간과 사생활", "thinking time and privacy"), communication: l("충분히 생각한 뒤 핵심을 말함", "speaking after enough private reflection"), shadow: l("침묵이 거리두기나 거절로 보일 수 있음", "letting silence appear as distance or rejection"), repair: l("생각할 시간과 다시 대화할 시점을 함께 알림", "naming both the need for time and when dialogue will resume"), responsibility: l("근거가 분명할 때 책임을 깊게 맡음", "taking deep responsibility when rationale is clear") },
  8: { label: l("실행형", "executing"), strength: l("목표·자원·결과를 현실적으로 연결함", "connecting goals, resources, and outcomes practically"), need: l("상호 존중과 분명한 성과 기준", "mutual respect and clear outcome standards"), communication: l("결정과 결과 중심으로 빠르게 정리함", "organizing dialogue quickly around decisions and outcomes"), shadow: l("효율이 감정과 합의보다 앞설 수 있음", "letting efficiency outrun emotion and agreement"), repair: l("결과뿐 아니라 과정의 영향과 권한을 함께 검토함", "reviewing impact and authority alongside results"), responsibility: l("자원과 결과 책임을 명확히 하고 싶어함", "wanting clear ownership of resources and outcomes") },
  9: { label: l("의미형", "meaning-oriented"), strength: l("서로 다른 입장을 큰 맥락에서 연결함", "connecting different positions in a wider context"), need: l("가치 일치와 인간적인 여유", "value alignment and humane room"), communication: l("의미와 장기 영향을 중심으로 말함", "speaking through meaning and long-term impact"), shadow: l("이상적인 기대가 현실 분담을 흐릴 수 있음", "letting ideal expectations blur practical division"), repair: l("큰 가치와 이번 주의 구체 행동을 연결함", "linking larger values to one concrete action this week"), responsibility: l("공정성과 더 넓은 영향을 고려함", "considering fairness and wider impact") },
  11: { label: l("통찰형", "insight-oriented"), strength: l("미묘한 긴장과 모순을 언어화함", "putting subtle tensions and contradictions into words"), need: l("정서적 정직성과 안정된 속도", "emotional honesty and a steady pace"), communication: l("느낌과 원칙을 함께 확인함", "checking feelings and principles together"), shadow: l("과민한 해석과 높은 기준으로 지침", "becoming tired through over-interpretation and high standards"), repair: l("추측과 관찰 사실을 분리해 확인함", "separating assumptions from observed facts"), responsibility: l("공정한 기준과 상호 책임을 중시함", "valuing fair standards and mutual accountability") },
  22: { label: l("구축형", "systems-building"), strength: l("장기 비전을 작동하는 구조로 바꿈", "turning long-term vision into working structure"), need: l("공동 목표와 지속 가능한 분담", "shared goals and sustainable division"), communication: l("큰 그림과 실행 단계를 함께 제시함", "presenting both the big picture and execution steps"), shadow: l("규모와 책임을 통제하려 할 수 있음", "trying to control scale and responsibility"), repair: l("결정권, 책임, 중단 기준을 문서로 재합의함", "re-agreeing in writing on authority, responsibility, and stop criteria"), responsibility: l("장기 자원 계획과 소유권을 중시함", "valuing long-range resource plans and ownership") },
  33: { label: l("성장지원형", "growth-stewarding"), strength: l("상대의 성장을 인내심 있게 지지함", "supporting the other's growth patiently"), need: l("돌봄의 상호성과 건강한 경계", "reciprocal care and healthy boundaries"), communication: l("감정과 성장 필요를 따뜻하게 다룸", "handling emotions and growth needs warmly"), shadow: l("도움이 자기희생이나 통제로 바뀜", "letting help become self-sacrifice or control"), repair: l("요청받은 도움과 스스로 떠맡은 도움을 구분함", "distinguishing requested help from assumed help"), responsibility: l("사람을 돌보는 책임을 크게 느낄 수 있음", "feeling a large responsibility for people's wellbeing") },
};

const TITLES: Record<CompatibilitySectionId, Localized> = {
  common_ground: l("공통점", "Common ground"),
  complement: l("보완점", "Complement"),
  friction: l("충돌점", "Friction"),
  communication: l("대화 방식", "Communication"),
  money_responsibility: l("돈과 책임", "Money & responsibility"),
  decision_authority: l("의사결정 권한", "Decision authority"),
  conflict_repair: l("갈등 해결", "Conflict repair"),
  maintenance: l("관계 유지 조건", "Maintenance conditions"),
};

const TYPE_COPY: Record<RelationshipType, {
  label: Localized;
  shared: Localized;
  responsibility: Localized;
  authority: Localized;
  maintenance: Localized;
  roleNote?: Localized;
}> = {
  romance: { label: l("연애", "Romance"), shared: l("호감뿐 아니라 속도와 경계를 함께 확인하는 관계", "a relationship that checks pace and boundaries alongside attraction"), responsibility: l("비용, 시간, 정서 노동을 암묵적으로 한쪽에 맡기지 않기", "do not leave cost, time, or emotional labor implicitly to one person"), authority: l("연락 빈도, 독점성, 신체적 경계는 상호 동의로 정하기", "set contact rhythm, exclusivity, and physical boundaries through mutual consent"), maintenance: l("호감의 강도보다 일관된 행동과 거절 존중을 보기", "observe consistent behavior and respect for refusal beyond intensity of attraction") },
  marriage: { label: l("결혼·장기 동반", "Marriage & long-term partnership"), shared: l("일상, 가치, 장기 계획을 공동 운영하는 관계", "a relationship that co-manages daily life, values, and long-range plans"), responsibility: l("소득·부채·돌봄·가사 범위를 정기적으로 공개하고 재조정하기", "regularly disclose and renegotiate income, debt, care, and household scope"), authority: l("공동재정과 큰 결정은 정보 접근과 거부권을 대등하게 두기", "keep equal information access and veto rights for shared finance and major decisions"), maintenance: l("사랑의 표현과 운영 회의를 모두 관계의 일부로 두기", "treat affection and practical operating conversations as equally relational") },
  friendship: { label: l("친구", "Friendship"), shared: l("선택한 관심과 신뢰를 자발적으로 나누는 관계", "a voluntary relationship built through chosen interests and trust"), responsibility: l("도움의 범위와 반복 비용을 당연하게 여기지 않기", "do not assume the scope or repeated cost of help"), authority: l("각자의 다른 관계와 시간을 통제하지 않기", "do not control each other's other relationships or time"), maintenance: l("연락 빈도보다 서로 합의한 기대와 회복 가능성을 보기", "prioritize agreed expectations and repair over contact frequency") },
  coworker: { label: l("동료", "Coworkers"), shared: l("공동 결과를 위해 역할과 정보를 연결하는 관계", "a relationship that connects roles and information for a shared outcome"), responsibility: l("업무 소유자, 마감, 인수인계를 기록으로 분명히 하기", "document owners, deadlines, and handoffs"), authority: l("직급과 실제 결정권의 차이를 명확히 확인하기", "clarify the difference between title and actual decision rights"), maintenance: l("성격 판단보다 관찰 가능한 행동과 업무 합의를 사용하기", "use observable behavior and work agreements rather than personality judgments") },
  cofounder: { label: l("공동창업자", "Cofounders"), shared: l("위험, 소유권, 장기 방향을 함께 감당하는 관계", "a relationship that shares risk, ownership, and long-term direction"), responsibility: l("지분, 급여, 비용 승인, 핵심 업무 소유권을 문서화하기", "document equity, pay, expense approval, and critical ownership"), authority: l("교착, 퇴사, 지분 이전의 결정 절차를 미리 합의하기", "pre-agree procedures for deadlock, departure, and equity transfer"), maintenance: l("친밀감과 기업 지배구조를 서로 대체하지 않게 하기", "do not let closeness substitute for governance") },
  manager_report: { label: l("상사·부하", "Manager & report"), shared: l("권한 차이 속에서 목표와 성장 조건을 조율하는 관계", "a relationship aligning goals and growth under unequal authority"), responsibility: l("업무 범위, 평가 기준, 지원 자원을 관리자가 명시하기", "the manager states scope, evaluation criteria, and support resources"), authority: l("첫 번째 사람이 관리자, 두 번째 사람이 보고자입니다. 동의가 어려운 권력 차이를 개인 궁합으로 정당화하지 않기", "The first person is the manager and the second is the report. Do not use compatibility to justify a power gap that constrains consent"), maintenance: l("심리적 안전, 문서화된 기대, 보복 없는 이견 제기를 보장하기", "protect psychological safety, documented expectations, and disagreement without retaliation"), roleNote: l("첫 번째 입력: 관리자 · 두 번째 입력: 보고자", "First input: manager · second input: report") },
  parent_child: { label: l("부모·자녀", "Parent & child"), shared: l("발달 단계와 보호 책임 속에서 신뢰를 키우는 관계", "a relationship growing trust within developmental needs and caregiving responsibility"), responsibility: l("보호 책임은 부모에게 있으며 자녀에게 정서적 부양을 요구하지 않기", "the parent holds caregiving responsibility and must not require emotional caretaking from the child"), authority: l("첫 번째 사람이 부모, 두 번째 사람이 자녀입니다. 나이와 안전에 맞게 자율성을 넓히기", "The first person is the parent and the second is the child. Expand autonomy in line with age and safety"), maintenance: l("순종보다 안전한 질문, 일관된 경계, 회복 가능한 실수를 허용하기", "prioritize safe questions, consistent boundaries, and repairable mistakes over obedience"), roleNote: l("첫 번째 입력: 부모 · 두 번째 입력: 자녀", "First input: parent · second input: child") },
  family: { label: l("가족", "Family"), shared: l("오래된 역할과 생활 책임을 함께 조정하는 관계", "a relationship that coordinates long-standing roles and everyday responsibilities"), responsibility: l("돌봄·연락·비용을 가족이라는 이유만으로 한 사람에게 고정하지 않기", "do not assign care, contact, or cost permanently to one person merely because they are family"), authority: l("나이와 서열보다 당사자의 안전·동의·현실 책임을 먼저 확인하기", "put each person's safety, consent, and real responsibility ahead of age or hierarchy"), maintenance: l("묵은 역할을 성격으로 단정하지 말고 지금 가능한 도움과 경계를 다시 합의하기", "do not treat inherited roles as personality; renegotiate feasible help and boundaries now") },
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
        ? `두 구조 모두 ${pick(lifeStyles[0].label, locale)}의 중심 주제를 공유해 ${withParticle(pick(lifeStyles[0].need, locale), "object")} 중요하게 볼 수 있습니다.`
        : `Both structures share the central ${pick(lifeStyles[0].label, locale)} theme and may value ${pick(lifeStyles[0].need, locale)}.`)
    : (ko
        ? `${withParticle(pick(lifeStyles[0].strength, locale), "with")} ${withParticle(pick(lifeStyles[1].strength, locale), "subject")} 공동 목적 안에서 만날 수 있습니다.`
        : `${pick(lifeStyles[0].strength, locale)} and ${pick(lifeStyles[1].strength, locale)} can meet inside a shared purpose.`);

  const sections: CompatibilitySection[] = [
    section("common_ground", locale, commonObservation, [pick(type.shared, locale)], ko ? "실제로 두 사람이 반복해서 중요하게 여긴 공동 기준은 무엇인가요?" : "What shared criterion have both people repeatedly valued in practice?", [lifeRef]),
    section("complement", locale, ko ? `한쪽의 ${withParticle(pick(lifeStyles[0].strength, locale), "with")} 다른 쪽의 ${withParticle(pick(lifeStyles[1].strength, locale), "topic")} 역할이 분명할 때 서로를 보완할 수 있습니다.` : `One person's ${pick(lifeStyles[0].strength, locale)} and the other's ${pick(lifeStyles[1].strength, locale)} can complement each other when roles are explicit.`, [ko ? "강점을 고정 역할로 만들지 말고 상황에 따라 바꾸어 맡기" : "Do not turn strengths into fixed roles; rotate them when the situation changes"], ko ? "최근 한 사람이 자연스럽게 보완한 실제 장면이 있었나요?" : "What recent situation shows one person genuinely complementing the other?", [lifeRef]),
    section("friction", locale, ko ? `${withParticle(pick(lifeStyles[0].shadow, locale), "with")} ${withParticle(pick(lifeStyles[1].shadow, locale), "subject")} 동시에 나타나면 의도를 확인하기 전에 방어가 커질 수 있습니다.` : `Defensiveness may grow before intent is checked when ${pick(lifeStyles[0].shadow, locale)} and ${pick(lifeStyles[1].shadow, locale)} appear together.`, [ko ? "행동, 해석, 요청을 각각 한 문장으로 나누기" : "Separate the observed behavior, interpretation, and request into one sentence each"], ko ? "갈등 때 반복된 관찰 가능한 행동은 무엇이었나요?" : "What observable behavior has repeated during conflict?", [lifeRef, attitudeRef]),
    section("communication", locale, ko ? `${pick(attitudeStyles[0].communication, locale)} 방식과 ${pick(attitudeStyles[1].communication, locale)} 방식 사이에 속도 차이가 생길 수 있습니다.` : `A pacing difference may appear between ${pick(attitudeStyles[0].communication, locale)} and ${pick(attitudeStyles[1].communication, locale)}.`, [ko ? "대화 시작 전에 지금 필요한 것이 공감, 정보, 결정 중 무엇인지 말하기" : "Before the conversation, name whether the need is empathy, information, or a decision"], ko ? "두 사람 모두 안전하게 말할 수 있었던 대화 조건은 무엇인가요?" : "What conditions have let both people speak safely?", [attitudeRef]),
    section("money_responsibility", locale, ko ? `${pick(attitudeStyles[0].responsibility, locale)} 경향과 ${pick(attitudeStyles[1].responsibility, locale)} 경향은 암묵적 기대가 생기면 충돌할 수 있습니다.` : `The tendencies of ${pick(attitudeStyles[0].responsibility, locale)} and ${pick(attitudeStyles[1].responsibility, locale)} can clash when expectations remain implicit.`, [pick(type.responsibility, locale)], ko ? "실제 비용·시간·돌봄 부담이 누구에게 얼마나 배분되어 있나요?" : "How are actual costs, time, and care burdens distributed?", [attitudeRef, birthdayRef]),
    section("decision_authority", locale, ko ? "숫자 상징은 결정권을 부여하지 않습니다. 관계 유형, 법적 책임, 역할, 상호 동의가 우선입니다." : "Number symbolism grants no decision authority. Relationship type, legal responsibility, role, and mutual consent come first.", [pick(type.authority, locale)], ko ? "누가 어떤 정보를 갖고 어떤 결정에 거부권을 갖나요?" : "Who has which information, and who has veto rights over which decisions?", [lifeRef]),
    section("conflict_repair", locale, ko ? `${withParticle(pick(lifeStyles[0].repair, locale), "with")} ${withParticle(pick(lifeStyles[1].repair, locale), "object")} 순서대로 시험해 볼 수 있습니다.` : `Try ${pick(lifeStyles[0].repair, locale)} and ${pick(lifeStyles[1].repair, locale)} in sequence.`, [ko ? "중단 신호, 재개 시간, 합의 기록을 미리 정하기" : "Pre-agree a pause signal, return time, and written agreement"], ko ? "사과 뒤 실제 행동이 달라졌는지 무엇으로 확인할 수 있나요?" : "What would show that behavior changed after an apology?", [lifeRef, attitudeRef]),
    section("maintenance", locale, ko ? "관계 유지는 상징적 조합보다 반복 행동, 안전, 동의, 책임의 질에 달려 있습니다." : "Relationship maintenance depends more on repeated behavior, safety, consent, and responsibility than symbolic combination.", [pick(type.maintenance, locale), ko ? "정기적으로 잘된 점·부담·바꿀 합의를 짧게 점검하기" : "Regularly review what worked, what burdened, and what agreement should change"], ko ? "이 관계가 지속 가능하다는 실제 증거와 반대 증거는 각각 무엇인가요?" : "What real evidence supports—and challenges—the sustainability of this relationship?", allRefs),
  ];

  return {
    ruleVersion: COMPATIBILITY_RULE_VERSION,
    relationshipType: input.relationshipType,
    relationshipLabel: pick(type.label, locale),
    summary: ko
      ? `${pick(type.label, locale)} 관계를 두 생년월일 패턴 구조의 공통점과 차이로 살펴보되, 실제 행동과 상호 동의를 판단 기준으로 두는 성찰 지도입니다.`
      : `A reflection map for ${pick(type.label, locale)} using shared and contrasting numerology structures while keeping real behavior and mutual consent as the decision criteria.`,
    roleOrderNote: type.roleNote ? pick(type.roleNote, locale) : undefined,
    sections,
    uncertainty: ko
      ? "이 결과는 관계 성공·실패, 충실성, 결혼 가능성 또는 상대의 속마음을 예측하지 않습니다. 중요한 판단은 직접 대화, 안전, 반복 행동, 현실 조건으로 확인하세요."
      : "This does not predict relationship success, loyalty, marriage, or another person's hidden intent. Check important decisions through direct dialogue, safety, repeated behavior, and real conditions.",
    privacyNote: ko
      ? "두 사람의 입력은 현재 브라우저 메모리에서만 계산되며 이 비교에서는 저장하지 않습니다."
      : "Both profiles are calculated only in current browser memory and are not saved by this comparison.",
  };
}
