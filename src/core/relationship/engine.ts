import type { NumerologyProfile } from "@/core/numerology";
import {
  meetingContextIds,
  type MeetingContextId,
  type MeetingContextInsight,
  type PartnerQualityInsight,
  type PartnerQualityKey,
  type RelationshipEvidenceRef,
  type RelationshipInsight,
} from "./types";

export const RELATIONSHIP_INSIGHT_RULE_VERSION = "relationship-reflection-1.0.0";

type Locale = "ko" | "en";
type Text = { readonly ko: string; readonly en: string };

type NumberPattern = {
  readonly contexts: readonly [MeetingContextId, MeetingContextId];
  readonly energy: Text;
  readonly qualities: readonly [PartnerQualityKey, PartnerQualityKey];
  readonly attraction: Text;
  readonly friction: Text;
  readonly greenFlag: Text;
};

const CONTEXT_ORDER: readonly MeetingContextId[] = meetingContextIds;

const NUMBER_PATTERNS: Record<number, NumberPattern> = {
  1: {
    contexts: ["leadership_networks", "movement_exploration"],
    energy: { ko: "서로의 독립성을 존중하면서 함께 도전할 때", en: "shared challenge with room for independence" },
    qualities: ["respects_independence", "ethically_ambitious"],
    attraction: { ko: "자기 방향이 분명하고 먼저 행동하는 사람에게 시선이 갈 수 있습니다.", en: "You may notice people who have direction and act with initiative." },
    friction: { ko: "속도 경쟁이나 주도권 다툼이 대화를 밀어낼 수 있습니다.", en: "Competing pace or control can crowd out conversation." },
    greenFlag: { ko: "서로의 목표를 지지하면서도 거절을 존중하는 태도", en: "support for each other's goals alongside respect for no" },
  },
  2: {
    contexts: ["trusted_circles", "purpose_service"],
    energy: { ko: "정서적으로 안전하고 서로 세심하게 반응할 때", en: "emotional safety and attentive reciprocity" },
    qualities: ["emotionally_attuned", "kind_with_boundaries"],
    attraction: { ko: "섬세하게 듣고 관계의 온도를 살피는 사람에게 끌릴 수 있습니다.", en: "You may be drawn to someone who listens closely and notices relational tone." },
    friction: { ko: "갈등을 피하려다 필요한 요구까지 숨길 수 있습니다.", en: "Avoiding conflict can also hide legitimate needs." },
    greenFlag: { ko: "작은 약속을 지키고 감정을 추측 대신 질문하는 태도", en: "keeping small promises and asking rather than assuming feelings" },
  },
  3: {
    contexts: ["creative_social", "learning_community"],
    energy: { ko: "표현과 유머, 창작을 편안하게 주고받을 때", en: "easy exchange of expression, humor, and creativity" },
    qualities: ["expressive_warmth", "emotionally_attuned"],
    attraction: { ko: "대화가 살아 있고 감정을 말로 표현하는 사람에게 매력을 느낄 수 있습니다.", en: "Lively conversation and emotional expression may feel attractive." },
    friction: { ko: "재미를 유지하려다 불편한 사실을 가볍게 넘길 수 있습니다.", en: "Keeping things light can postpone uncomfortable facts." },
    greenFlag: { ko: "즐거움과 진지한 대화를 모두 감당하는 태도", en: "capacity for both play and serious conversation" },
  },
  4: {
    contexts: ["structured_projects", "trusted_circles"],
    energy: { ko: "예측 가능한 행동과 꾸준한 신뢰가 쌓일 때", en: "steady trust built through predictable behavior" },
    qualities: ["reliable", "long_term_builder"],
    attraction: { ko: "말보다 행동이 일관되고 생활 기반이 안정된 사람에게 마음이 갈 수 있습니다.", en: "Consistency in action and grounded daily life may stand out." },
    friction: { ko: "안정을 지키려다 변화나 감정의 복잡성을 통제하려 할 수 있습니다.", en: "Protecting stability can turn into controlling change or emotional complexity." },
    greenFlag: { ko: "계획 변경을 함께 조정하고 책임을 투명하게 나누는 태도", en: "adjusting plans together and sharing responsibility transparently" },
  },
  5: {
    contexts: ["movement_exploration", "creative_social"],
    energy: { ko: "새로운 경험과 선택의 자유를 함께 누릴 때", en: "new experiences combined with freedom of choice" },
    qualities: ["adaptable", "respects_independence"],
    attraction: { ko: "호기심이 많고 변화에 유연한 사람과 빠르게 연결감을 느낄 수 있습니다.", en: "Curious, flexible people may create a quick sense of connection." },
    friction: { ko: "새로움이 줄면 관계의 깊이를 충분히 확인하기 전에 움직일 수 있습니다.", en: "When novelty fades, movement can replace checking for depth." },
    greenFlag: { ko: "자유를 원하면서도 합의와 후속 행동을 지키는 태도", en: "valuing freedom while honoring agreements and follow-through" },
  },
  6: {
    contexts: ["purpose_service", "trusted_circles"],
    energy: { ko: "돌봄과 책임이 한쪽에 치우치지 않고 오갈 때", en: "care and responsibility moving in both directions" },
    qualities: ["responsible_care", "kind_with_boundaries"],
    attraction: { ko: "주변을 챙기고 관계에 책임을 지는 사람에게 신뢰를 느낄 수 있습니다.", en: "Care for others and relational responsibility may build trust." },
    friction: { ko: "필요 이상으로 돌보다가 상대의 몫까지 떠안을 수 있습니다.", en: "Care can become carrying responsibilities that belong to the other person." },
    greenFlag: { ko: "돌봄을 당연시하지 않고 감사와 경계를 함께 표현하는 태도", en: "expressing gratitude and boundaries rather than taking care for granted" },
  },
  7: {
    contexts: ["quiet_depth", "learning_community"],
    energy: { ko: "깊은 대화와 충분한 혼자만의 시간이 함께 보장될 때", en: "deep conversation with protected private time" },
    qualities: ["intellectually_deep", "respects_independence"],
    attraction: { ko: "생각이 깊고 모르는 것을 정직하게 인정하는 사람에게 관심이 갈 수 있습니다.", en: "Depth of thought and honesty about uncertainty may attract you." },
    friction: { ko: "확신이 생길 때까지 마음을 닫아 상대가 거리를 오해할 수 있습니다.", en: "Closing off until certainty arrives can make distance easy to misread." },
    greenFlag: { ko: "침묵을 벌로 쓰지 않고 생각할 시간을 명확히 요청하는 태도", en: "asking clearly for thinking time rather than using silence as punishment" },
  },
  8: {
    contexts: ["leadership_networks", "structured_projects"],
    energy: { ko: "서로의 역량과 목표를 존중하며 현실적인 성취를 만들 때", en: "mutual respect for capability while building tangible outcomes" },
    qualities: ["ethically_ambitious", "reliable"],
    attraction: { ko: "결정력이 있고 책임과 자원을 현실적으로 다루는 사람에게 끌릴 수 있습니다.", en: "Decisiveness and responsible handling of resources may feel attractive." },
    friction: { ko: "성과나 효율이 감정의 속도보다 앞설 수 있습니다.", en: "Performance or efficiency can outrun emotional pace." },
    greenFlag: { ko: "권한과 돈, 책임을 투명하게 이야기하는 태도", en: "transparent conversation about power, money, and responsibility" },
  },
  9: {
    contexts: ["purpose_service", "creative_social"],
    energy: { ko: "가치와 공감, 넓은 관점을 함께 나눌 때", en: "shared values, compassion, and a wider perspective" },
    qualities: ["compassionate", "kind_with_boundaries"],
    attraction: { ko: "타인을 이해하려 하고 세상을 넓게 보는 사람에게 마음이 갈 수 있습니다.", en: "Compassion and a broad view of the world may draw your attention." },
    friction: { ko: "가능성을 크게 보다가 현재의 행동 불일치를 늦게 볼 수 있습니다.", en: "Seeing broad potential can delay noticing inconsistent present behavior." },
    greenFlag: { ko: "공감과 책임을 함께 보여주고 구원자 역할을 요구하지 않는 태도", en: "combining compassion with accountability and not demanding rescue" },
  },
  11: {
    contexts: ["learning_community", "creative_social"],
    energy: { ko: "직관적인 교감이 현실적인 대화와 연결될 때", en: "intuitive resonance grounded in practical conversation" },
    qualities: ["grounded_intuition", "emotionally_attuned"],
    attraction: { ko: "말하지 않은 분위기를 읽으면서도 생각을 표현하는 사람에게 강한 인상을 받을 수 있습니다.", en: "Someone who senses nuance and still speaks clearly may leave a strong impression." },
    friction: { ko: "강한 첫 느낌을 충분한 관찰 없이 의미화할 수 있습니다.", en: "A strong first impression can gain meaning before enough observation." },
    greenFlag: { ko: "직감과 실제 행동이 일치하는지 함께 확인하는 태도", en: "checking whether intuition and observable behavior agree" },
  },
  22: {
    contexts: ["structured_projects", "purpose_service"],
    energy: { ko: "장기 비전을 실제 생활과 책임으로 함께 만들어갈 때", en: "building a long-term vision through practical shared responsibility" },
    qualities: ["long_term_builder", "ethically_ambitious"],
    attraction: { ko: "큰 그림을 말하면서도 작은 실행을 이어가는 사람에게 신뢰가 생길 수 있습니다.", en: "Big-picture thinking backed by small repeated actions may build trust." },
    friction: { ko: "관계를 프로젝트처럼 관리하거나 기준을 지나치게 높일 수 있습니다.", en: "The relationship can become a project or carry excessively high standards." },
    greenFlag: { ko: "장기 계획을 말하되 현재의 감정과 한계를 함께 다루는 태도", en: "holding long plans alongside present feelings and limits" },
  },
  33: {
    contexts: ["purpose_service", "trusted_circles"],
    energy: { ko: "따뜻한 돌봄과 명확한 경계가 동시에 있을 때", en: "warm care paired with clear boundaries" },
    qualities: ["responsible_care", "kind_with_boundaries"],
    attraction: { ko: "사람의 성장을 응원하고 공동체를 돌보는 사람에게 마음이 갈 수 있습니다.", en: "Support for growth and care for community may feel attractive." },
    friction: { ko: "상대의 성장을 책임지려 하거나 희생을 사랑으로 오해할 수 있습니다.", en: "Taking responsibility for another's growth can make sacrifice look like love." },
    greenFlag: { ko: "도움을 주고받되 각자의 선택과 결과를 존중하는 태도", en: "exchanging support while respecting each person's choices and outcomes" },
  },
};

const CONTEXTS: Record<MeetingContextId, {
  title: Text;
  why: Text;
  tryThis: Text;
  caution: Text;
}> = {
  creative_social: {
    title: { ko: "창작·문화·가벼운 소셜 모임", en: "Creative, cultural, and light social gatherings" },
    why: { ko: "표현과 취향이 자연스럽게 드러나 대화의 시작점이 많습니다.", en: "Expression and taste are visible, creating natural conversation openings." },
    tryThis: { ko: "작은 공연, 전시 모임, 글쓰기·콘텐츠 커뮤니티를 한 달에 두 번 경험해 보세요.", en: "Try a small performance, gallery group, or writing/content community twice this month." },
    caution: { ko: "분위기의 설렘을 실제 가치관 일치로 바로 해석하지 마세요.", en: "Do not equate an exciting atmosphere with aligned values." },
  },
  learning_community: {
    title: { ko: "수업·스터디·전문 관심 커뮤니티", en: "Classes, study groups, and specialist communities" },
    why: { ko: "반복해서 만나며 생각하는 방식과 협업 태도를 관찰할 수 있습니다.", en: "Repeated contact lets you observe thinking style and collaboration." },
    tryThis: { ko: "관심 분야의 4주 이상 과정이나 정기 모임 하나를 선택해 꾸준히 참여해 보세요.", en: "Choose one course or recurring group lasting at least four weeks and attend consistently." },
    caution: { ko: "지적 공감만으로 정서적 준비나 상호 관심을 가정하지 마세요.", en: "Intellectual rapport does not prove emotional readiness or mutual interest." },
  },
  purpose_service: {
    title: { ko: "봉사·사회적 가치·돌봄 활동", en: "Service, social-impact, and care-oriented activities" },
    why: { ko: "말보다 실제 행동에서 가치와 책임감을 확인하기 쉽습니다.", en: "Values and responsibility are easier to see through action than claims." },
    tryThis: { ko: "일회성 이벤트보다 역할과 경계가 분명한 정기 활동을 찾아보세요.", en: "Prefer recurring activities with clear roles and boundaries over one-off events." },
    caution: { ko: "도움을 주는 관계를 연애 신호로 오해하거나 취약한 사람에게 접근하지 마세요.", en: "Do not treat helping as romantic interest or pursue someone in a vulnerable position." },
  },
  movement_exploration: {
    title: { ko: "여행·운동·새로운 경험 모임", en: "Travel, movement, and new-experience groups" },
    why: { ko: "함께 움직이며 유연성, 속도, 문제 대응 방식을 볼 수 있습니다.", en: "Shared movement reveals flexibility, pace, and response to small problems." },
    tryThis: { ko: "안전한 공개 그룹의 하이킹, 러닝, 지역 탐방처럼 반복 가능한 활동을 선택해 보세요.", en: "Choose a repeatable public activity such as hiking, running, or local exploration." },
    caution: { ko: "낯선 환경의 강한 감정을 장기 호환성으로 확대하지 마세요.", en: "Do not inflate the intensity of a novel setting into long-term compatibility." },
  },
  structured_projects: {
    title: { ko: "협업 프로젝트·직무 확장·실무 커뮤니티", en: "Collaborative projects and professional communities" },
    why: { ko: "책임, 일정, 갈등을 다루는 실제 방식을 관찰할 기회가 많습니다.", en: "You can observe how someone handles responsibility, schedules, and friction." },
    tryThis: { ko: "직장 내 직접 이해관계가 적은 외부 프로젝트나 업계 커뮤니티부터 넓혀 보세요.", en: "Start with external projects or professional groups without a direct workplace power tie." },
    caution: { ko: "직장 규정, 권력 차이, 평가 관계가 있으면 접근보다 경계를 우선하세요.", en: "Prioritize policy and boundaries where power, evaluation, or reporting lines exist." },
  },
  quiet_depth: {
    title: { ko: "소규모 독서·대화·사색형 모임", en: "Small reading, dialogue, and reflective groups" },
    why: { ko: "속도를 늦추고 질문, 경청, 침묵을 다루는 방식을 볼 수 있습니다.", en: "Slower settings reveal how people handle questions, listening, and silence." },
    tryThis: { ko: "참여 인원이 적고 정기성이 있는 독서회나 주제 대화 모임을 선택해 보세요.", en: "Try a small recurring book or topic-discussion group." },
    caution: { ko: "깊은 대화를 곧바로 친밀감이나 독점적 관계로 해석하지 마세요.", en: "Deep conversation is not automatic intimacy or exclusivity." },
  },
  leadership_networks: {
    title: { ko: "리더십·창업·문제 해결 네트워크", en: "Leadership, founder, and problem-solving networks" },
    why: { ko: "목표, 판단, 책임을 대하는 태도가 비교적 빠르게 드러납니다.", en: "Approaches to goals, judgment, and accountability become visible quickly." },
    tryThis: { ko: "피칭보다 동료 피드백과 실제 협업이 있는 모임을 선택해 보세요.", en: "Choose groups with peer feedback and real collaboration, not only pitching." },
    caution: { ko: "지위, 자신감, 성취를 정서적 성숙과 동일시하지 마세요.", en: "Do not equate status, confidence, or achievement with emotional maturity." },
  },
  trusted_circles: {
    title: { ko: "친구 소개·생활권·신뢰 기반 소모임", en: "Friend introductions and trust-based local circles" },
    why: { ko: "공통 지인과 반복되는 생활 맥락에서 행동의 일관성을 보기 쉽습니다.", en: "Shared contacts and recurring everyday context make consistency easier to observe." },
    tryThis: { ko: "친구에게 조건 목록보다 함께 편안히 할 활동을 말하고 작은 모임에 참여해 보세요.", en: "Tell friends what activity feels comfortable rather than giving a checklist, then join a small gathering." },
    caution: { ko: "지인의 보증이 상호 관심, 안전, 호환성을 대신하지는 않습니다.", en: "A friend's endorsement does not replace mutual interest, safety, or compatibility." },
  },
};

const QUALITIES: Record<PartnerQualityKey, { label: Text; why: Text }> = {
  respects_independence: { label: { ko: "독립성을 존중함", en: "Respects independence" }, why: { ko: "가까움과 개인의 선택을 동시에 지킬 수 있습니다.", en: "Can hold closeness and individual choice at the same time." } },
  emotionally_attuned: { label: { ko: "감정을 묻고 듣는 섬세함", en: "Emotionally attentive" }, why: { ko: "추측보다 대화로 관계의 온도를 확인합니다.", en: "Checks relational tone through conversation rather than assumption." } },
  expressive_warmth: { label: { ko: "따뜻하고 분명한 표현", en: "Warm, clear expression" }, why: { ko: "호감과 불편함을 모두 말로 다룰 수 있습니다.", en: "Can put both affection and discomfort into words." } },
  reliable: { label: { ko: "행동의 일관성", en: "Reliable follow-through" }, why: { ko: "작은 약속과 일상 행동이 신뢰를 만듭니다.", en: "Small promises and daily behavior build trust." } },
  adaptable: { label: { ko: "변화에 유연함", en: "Adaptable" }, why: { ko: "새로운 상황에서도 합의를 다시 만들 수 있습니다.", en: "Can renegotiate agreements as circumstances change." } },
  responsible_care: { label: { ko: "책임 있는 돌봄", en: "Responsible care" }, why: { ko: "돌봄을 말뿐 아니라 지속 가능한 행동으로 보여줍니다.", en: "Shows care through sustainable action, not words alone." } },
  intellectually_deep: { label: { ko: "깊이와 지적 정직함", en: "Depth and intellectual honesty" }, why: { ko: "모르는 것과 다른 관점을 방어 없이 다룰 수 있습니다.", en: "Can face uncertainty and different views without defensiveness." } },
  ethically_ambitious: { label: { ko: "윤리적인 목표의식", en: "Ethical ambition" }, why: { ko: "성취와 관계의 책임을 함께 고려합니다.", en: "Considers achievement alongside relational responsibility." } },
  compassionate: { label: { ko: "공감과 책임의 균형", en: "Compassion with accountability" }, why: { ko: "이해하면서도 해로운 행동을 합리화하지 않습니다.", en: "Understands without excusing harmful behavior." } },
  grounded_intuition: { label: { ko: "직감과 사실을 함께 봄", en: "Grounded intuition" }, why: { ko: "느낌을 존중하되 행동과 증거로 다시 확인합니다.", en: "Respects feelings and checks them against action and evidence." } },
  long_term_builder: { label: { ko: "장기 관계를 만드는 실행력", en: "Builds for the long term" }, why: { ko: "미래 이야기를 현재의 작은 책임으로 연결합니다.", en: "Connects future talk to small responsibilities now." } },
  kind_with_boundaries: { label: { ko: "경계가 있는 친절", en: "Kindness with boundaries" }, why: { ko: "배려와 동의, 거절을 동시에 존중합니다.", en: "Respects care, consent, and refusal together." } },
};

const CYCLE_LENS: Record<number, Text> = {
  1: { ko: "새 기준을 세우고 관계에서 원하는 주도성을 점검하는 해로 활용해 보세요.", en: "Use this year to clarify new standards and the initiative you want in relationships." },
  2: { ko: "속도를 늦추고 상호성과 감정의 미세한 신호를 관찰하는 해로 활용해 보세요.", en: "Use this year to slow down and observe reciprocity and emotional nuance." },
  3: { ko: "표현과 사회적 접점을 넓히되 깊이도 함께 확인하는 해로 활용해 보세요.", en: "Use this year to widen expression and social contact while still checking for depth." },
  4: { ko: "생활 호환성과 신뢰의 기반을 점검하는 해로 활용해 보세요.", en: "Use this year to examine everyday compatibility and foundations of trust." },
  5: { ko: "새로운 환경을 시험하되 합의와 후속 행동을 놓치지 않는 해로 활용해 보세요.", en: "Use this year to try new settings without losing agreements and follow-through." },
  6: { ko: "돌봄, 책임, 장기 관계의 기대를 구체화하는 해로 활용해 보세요.", en: "Use this year to clarify care, responsibility, and long-term expectations." },
  7: { ko: "혼자만의 기준과 친밀감의 속도를 깊이 검토하는 해로 활용해 보세요.", en: "Use this year to examine private standards and the pace of intimacy." },
  8: { ko: "권한, 돈, 목표, 책임을 투명하게 대화하는 해로 활용해 보세요.", en: "Use this year for transparent conversation about power, money, goals, and responsibility." },
  9: { ko: "끝난 패턴을 정리하고 다음 관계에 가져가지 않을 것을 선택하는 해로 활용해 보세요.", en: "Use this year to close old patterns and choose what not to carry forward." },
  11: { ko: "강한 느낌을 존중하되 실제 행동과 일치하는지 확인하는 해로 활용해 보세요.", en: "Use this year to respect strong impressions while checking them against behavior." },
  22: { ko: "장기 비전을 현실적인 관계 습관으로 바꾸는 해로 활용해 보세요.", en: "Use this year to turn long-term vision into practical relationship habits." },
  33: { ko: "따뜻한 돌봄과 자기 경계를 함께 연습하는 해로 활용해 보세요.", en: "Use this year to practice warm care and self-boundaries together." },
};

function patternFor(value: number): NumberPattern {
  return NUMBER_PATTERNS[value] ?? NUMBER_PATTERNS[((value - 1) % 9) + 1];
}

function evidence(profile: NumerologyProfile, locale: Locale): RelationshipEvidenceRef[] {
  const refs: RelationshipEvidenceRef[] = [
    {
      id: `lifePath:${profile.lifePath.value}`,
      label: locale === "ko" ? `라이프 패스 ${profile.lifePath.value}` : `Life Path ${profile.lifePath.value}`,
    },
    {
      id: `attitude:${profile.attitude.value}`,
      label: locale === "ko" ? `태도 수 ${profile.attitude.value}` : `Attitude ${profile.attitude.value}`,
    },
    {
      id: `birthday:${profile.birthday.value}`,
      label: locale === "ko" ? `생일 수 ${profile.birthday.value}` : `Birthday ${profile.birthday.value}`,
    },
    {
      id: `personalYear:${profile.personalYear.value}`,
      label: locale === "ko" ? `개인 연도 ${profile.personalYear.value}` : `Personal Year ${profile.personalYear.value}`,
    },
  ];
  if (profile.name.status === "calculated") {
    refs.push(
      {
        id: `soulUrge:${profile.name.soulUrge?.value}`,
        label: locale === "ko" ? `소울 어지 ${profile.name.soulUrge?.value}` : `Soul Urge ${profile.name.soulUrge?.value}`,
      },
      {
        id: `destiny:${profile.name.destiny?.value}`,
        label: locale === "ko" ? `운명/표현 수 ${profile.name.destiny?.value}` : `Expression/Destiny ${profile.name.destiny?.value}`,
      },
    );
  }
  return refs;
}

export function createRelationshipInsight(
  profile: NumerologyProfile,
  locale: Locale,
): RelationshipInsight {
  const sources = [
    { id: `lifePath:${profile.lifePath.value}`, value: profile.lifePath.value, weight: 4 },
    { id: `attitude:${profile.attitude.value}`, value: profile.attitude.value, weight: 3 },
    { id: `birthday:${profile.birthday.value}`, value: profile.birthday.value, weight: 2 },
    ...(profile.name.status === "calculated" && profile.name.soulUrge
      ? [{ id: `soulUrge:${profile.name.soulUrge.value}`, value: profile.name.soulUrge.value, weight: 2 }]
      : []),
  ];
  const contextScores = new Map<MeetingContextId, number>(
    CONTEXT_ORDER.map((context) => [context, 0]),
  );
  const contextRefs = new Map<MeetingContextId, Set<string>>(
    CONTEXT_ORDER.map((context) => [context, new Set<string>()]),
  );
  for (const source of sources) {
    const [primary, secondary] = patternFor(source.value).contexts;
    contextScores.set(primary, (contextScores.get(primary) ?? 0) + source.weight * 2);
    contextScores.set(secondary, (contextScores.get(secondary) ?? 0) + source.weight);
    contextRefs.get(primary)?.add(source.id);
    contextRefs.get(secondary)?.add(source.id);
  }
  const meetingContexts: MeetingContextInsight[] = [...contextScores.entries()]
    .sort((left, right) => {
      const scoreDifference = right[1] - left[1];
      return scoreDifference || CONTEXT_ORDER.indexOf(left[0]) - CONTEXT_ORDER.indexOf(right[0]);
    })
    .slice(0, 3)
    .map(([id]) => ({
      id,
      title: CONTEXTS[id].title[locale],
      why: CONTEXTS[id].why[locale],
      tryThis: CONTEXTS[id].tryThis[locale],
      caution: CONTEXTS[id].caution[locale],
      evidenceRefs: [...(contextRefs.get(id) ?? [])],
    }));

  const qualitySources = [
    { id: sources[0].id, qualities: patternFor(sources[0].value).qualities },
    { id: sources[1].id, qualities: patternFor(sources[1].value).qualities },
    ...(sources[3]
      ? [{ id: sources[3].id, qualities: patternFor(sources[3].value).qualities }]
      : []),
  ];
  const qualityRefs = new Map<PartnerQualityKey, Set<string>>();
  for (const source of qualitySources) {
    for (const key of source.qualities) {
      if (!qualityRefs.has(key)) qualityRefs.set(key, new Set());
      qualityRefs.get(key)?.add(source.id);
    }
  }
  const qualities: PartnerQualityInsight[] = [...qualityRefs.entries()]
    .slice(0, 4)
    .map(([key, refs]) => ({
      key,
      label: QUALITIES[key].label[locale],
      why: QUALITIES[key].why[locale],
      evidenceRefs: [...refs],
    }));
  const lifePattern = patternFor(profile.lifePath.value);
  const attitudePattern = patternFor(profile.attitude.value);
  const energySources = [
    lifePattern.energy[locale],
    attitudePattern.energy[locale],
    ...(profile.name.status === "calculated" && profile.name.soulUrge
      ? [patternFor(profile.name.soulUrge.value).energy[locale]]
      : []),
  ].filter((value, index, values) => values.indexOf(value) === index);
  const greenFlags = [
    lifePattern.greenFlag[locale],
    attitudePattern.greenFlag[locale],
  ].filter((value, index, values) => values.indexOf(value) === index);
  const topQualityLabels = qualities.slice(0, 2).map((quality) => quality.label).join(
    locale === "ko" ? "·" : " and ",
  );
  const topContext = meetingContexts[0].title;
  const allEvidence = evidence(profile, locale);

  return {
    ruleVersion: RELATIONSHIP_INSIGHT_RULE_VERSION,
    summary:
      locale === "ko"
        ? `${topQualityLabels}의 특성을 실제 행동에서 확인하고, ${topContext}처럼 반복 접점이 생기는 환경에서 천천히 관찰하는 방식이 잘 맞을 수 있습니다.`
        : `You may benefit from looking for ${topQualityLabels} in observable behavior and allowing connection to develop through recurring contact in settings such as ${topContext}.`,
    energySources,
    meetingContexts,
    futurePartnerPortrait: {
      label:
        locale === "ko"
          ? "미래 배우자상 — 성찰 가설"
          : "Future spouse portrait — reflection hypothesis",
      description:
        locale === "ko"
          ? "특정 인물을 예언하는 설명이 아니라, 장기 관계에서 확인할 만한 상호 보완적 특성입니다."
          : "This does not predict a person; it lists complementary qualities worth checking in a long-term relationship.",
      qualities,
    },
    attractionPattern: lifePattern.attraction[locale],
    frictionPattern: `${lifePattern.friction[locale]} ${attitudePattern.friction[locale]}`,
    greenFlags,
    currentCycleLens:
      CYCLE_LENS[profile.personalYear.value]?.[locale] ??
      (locale === "ko"
        ? "현재의 선택 기준을 실제 관계 경험과 함께 점검하는 해로 활용해 보세요."
        : "Use the current year to review your choice criteria against real relationship experience."),
    realityChecks:
      locale === "ko"
        ? [
            "호감이 상호적이고 명확한가?",
            "말과 행동이 여러 상황에서 일관적인가?",
            "거절과 경계, 속도를 서로 존중하는가?",
            "돈·책임·갈등을 현실적으로 대화할 수 있는가?",
            "한 달 뒤 어떤 실제 행동으로 적합성을 다시 확인할 것인가?",
          ]
        : [
            "Is interest mutual and clear?",
            "Are words and actions consistent across situations?",
            "Do both people respect refusal, boundaries, and pace?",
            "Can money, responsibility, and conflict be discussed realistically?",
            "What behavior will you review in one month to reassess fit?",
          ],
    uncertainty:
      locale === "ko"
        ? "이 결과는 수비학 상징을 현실 행동 아이디어로 번역한 가설입니다. 실제 만남 가능성은 노출 빈도, 지역, 생활 방식, 상호 동의와 행동에 달려 있으며 장소·시기·결혼을 예측하지 않습니다."
        : "This translates numerology symbolism into real-world reflection hypotheses. Actual opportunities depend on exposure, location, lifestyle, mutual consent, and behavior; it does not predict a place, time, or marriage.",
    evidenceRefs: allEvidence,
  };
}
