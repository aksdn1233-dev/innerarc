import { withParticle } from "../korean-particles";
import type { StrengthReading, StructureReading } from "./interpretation";
import { tenGod } from "./pillars";
import type { SajuChart, TenGod } from "./types";

export type SajuLifeNarrativeSection = Readonly<{
  id: "core" | "childhood" | "family" | "coping" | "social" | "relationship" | "work" | "money" | "environment" | "future" | "closing";
  title: string;
  keySentence: string;
  body: string;
  evidence: readonly string[];
}>;

type Locale = "ko" | "en";
type GodFamily = "peer" | "expression" | "resource" | "authority" | "learning";

function godFamily(god: TenGod): GodFamily {
  if (god === "비견" || god === "겁재") return "peer";
  if (god === "식신" || god === "상관") return "expression";
  if (god === "편재" || god === "정재") return "resource";
  if (god === "편관" || god === "정관") return "authority";
  return "learning";
}

const childhoodSurface: Readonly<Record<GodFamily, string>> = {
  peer: "‘내 몫은 내가 해내는 아이’",
  expression: "‘말과 행동으로 분위기를 바꾸는 아이’",
  resource: "‘눈치가 빠르고 현실적인 아이’",
  authority: "‘규칙을 잘 지키고 믿음직한 아이’",
  learning: "‘어른의 뜻을 빨리 이해하고 배우는 아이’",
};

const childhoodGround: Readonly<Record<GodFamily, string>> = {
  peer: "또래나 형제 사이에서 자기 자리를 지켜야 한다는 감각",
  expression: "재능이나 표현으로 인정받고 싶다는 마음",
  resource: "주변 상황을 정리하고 실제 도움이 되어야 한다는 역할",
  authority: "기준을 맞추고 실수하지 않아야 한다는 긴장",
  learning: "보호와 인정, 배움을 통해 안전을 확인하려는 마음",
};

const familyExpectation: Readonly<Record<GodFamily, string>> = {
  peer: "스스로 판단하고 자기 몫을 책임지는 사람",
  expression: "재능을 드러내고 눈에 보이는 결과를 만드는 사람",
  resource: "살림과 상황을 현실적으로 정리해 주는 사람",
  authority: "기준을 지키고 흐트러지지 않는 믿음직한 사람",
  learning: "잘 배우고 이해해서 어른의 기대를 알아주는 사람",
};

const familyPressure: Readonly<Record<GodFamily, string>> = {
  peer: "누구에게 기대기보다 자기 힘으로 버텨야 한다는 분위기",
  expression: "감정이나 생각을 분명히 보여줘야 인정받는 분위기",
  resource: "말보다 실제 성과와 책임으로 증명해야 하는 분위기",
  authority: "정해진 기준을 어기거나 실수하면 안 된다는 분위기",
  learning: "칭찬과 보호를 받으려면 먼저 잘 이해하고 맞춰야 하는 분위기",
};

const relationshipNeed: Readonly<Record<GodFamily, string>> = {
  peer: "서로를 동등하게 대하고 각자의 공간을 인정하는 관계",
  expression: "속마음을 숨기지 않고 말과 반응이 오가는 관계",
  resource: "말뿐 아니라 실제 행동과 생활의 신뢰가 보이는 관계",
  authority: "약속과 책임의 기준이 분명한 관계",
  learning: "마음을 이해받고 안전하게 기대어도 되는 관계",
};

const relationshipShadow: Readonly<Record<GodFamily, string>> = {
  peer: "상대의 간섭을 통제로 느끼거나 혼자 해결하려는 쪽으로 굳어질 수 있습니다",
  expression: "참아 둔 말을 한 번에 꺼내면 표현이 예상보다 날카롭게 들릴 수 있습니다",
  resource: "사랑을 챙김과 실무로만 증명하다가 정작 감정을 말하지 못할 수 있습니다",
  authority: "약속을 지키려는 마음이 커질수록 상대에게도 같은 기준을 요구할 수 있습니다",
  learning: "상대의 반응을 오래 살피다가 내 판단을 뒤로 미룰 수 있습니다",
};

const workMode: Readonly<Record<GodFamily, string>> = {
  peer: "주도권을 갖고 자기 방식으로 밀고 갈 때",
  expression: "아이디어를 말·기획·결과물로 밖에 꺼낼 때",
  resource: "사람·돈·일정을 현실적으로 배치하고 마무리할 때",
  authority: "기준과 책임을 세우고 흔들린 흐름을 바로잡을 때",
  learning: "정보를 깊이 이해하고 다른 사람이 쓸 수 있게 정리할 때",
};

const dayMasterMetaphor: Readonly<Record<SajuChart["dayMaster"], string>> = {
  甲: "큰 나무처럼 방향을 정하면 뿌리를 내리고 오래 자라려는 힘",
  乙: "덩굴과 풀처럼 주변을 살피며 유연하게 길을 찾아가는 힘",
  丙: "햇빛처럼 존재와 열정을 밖으로 드러내고 주변을 밝히는 힘",
  丁: "등불처럼 필요한 곳을 세심하게 비추고 온기를 오래 지키는 힘",
  戊: "큰 산과 대지처럼 쉽게 흔들리지 않고 중심을 지키는 힘",
  己: "밭과 흙처럼 사람과 자원을 보살피고 쓸모 있게 길러 내는 힘",
  庚: "단단한 쇠처럼 불필요한 것을 잘라 내고 결론을 만드는 힘",
  辛: "세공된 금속처럼 기준을 정교하게 다듬고 완성도를 높이는 힘",
  壬: "큰물처럼 넓은 가능성을 연결하고 경계를 넘어 흐르는 힘",
  癸: "비와 이슬처럼 작은 변화와 감정을 섬세하게 알아차리는 힘",
};

function joinEvidence(items: readonly string[], locale: Locale): string {
  return locale === "ko" ? `읽은 근거: ${items.join(" · ")}` : `Basis: ${items.join(" · ")}`;
}

function koreanSections(
  chart: SajuChart,
  strength: StrengthReading,
  structure: StructureReading,
  displayName?: string | null,
): readonly SajuLifeNarrativeSection[] {
  const reader = displayName?.trim() ? `${displayName.trim()}님` : "당신";
  const yearSurface = godFamily(chart.tenGods.yearStem);
  const yearGround = godFamily(chart.tenGods.yearBranch);
  const monthSurface = godFamily(chart.tenGods.monthStem);
  const monthGround = godFamily(chart.tenGods.monthBranch);
  const dayGround = godFamily(chart.tenGods.dayBranch);
  const workFamily = godFamily(structure.god);
  const childhoodEvidence = [`연간 ${chart.tenGods.yearStem}`, `연지 ${chart.tenGods.yearBranch}`];
  const familyEvidence = [`월간 ${chart.tenGods.monthStem}`, `월지 ${chart.tenGods.monthBranch}`];
  const relationshipEvidence = [`일지 ${chart.tenGods.dayBranch}`, `일간 ${chart.dayMaster}`];
  const peerCount = [
    chart.tenGods.yearStem,
    chart.tenGods.monthStem,
    chart.tenGods.hourStem,
    chart.tenGods.yearBranch,
    chart.tenGods.monthBranch,
    chart.tenGods.dayBranch,
    chart.tenGods.hourBranch,
  ].filter((god) => god === "비견" || god === "겁재").length;
  const wealthCount = [
    chart.tenGods.yearStem,
    chart.tenGods.monthStem,
    chart.tenGods.hourStem,
    chart.tenGods.yearBranch,
    chart.tenGods.monthBranch,
    chart.tenGods.dayBranch,
    chart.tenGods.hourBranch,
  ].filter((god) => god === "편재" || god === "정재").length;
  const hiddenWealthCount = Object.values(chart.hiddenStems)
    .flatMap((stems) => stems ?? [])
    .map(({ stem }) => tenGod(chart.dayMaster, stem))
    .filter((god) => god === "편재" || god === "정재").length;
  const dominantPhase = Object.entries(chart.elements)
    .sort((left, right) => right[1] - left[1])[0]![0];
  const lightPhase = Object.entries(chart.elements)
    .sort((left, right) => left[1] - right[1])[0]![0];

  const coping = strength.label === "신약"
    ? "겉으로는 맡은 일을 해내려 하지만, 속에서는 주변의 기준과 요구를 먼저 살피느라 에너지가 빨리 소진됐을 수 있습니다. 그래서 ‘도움을 청하기 전에 더 준비해야 한다’는 습관이 생겼는지 돌아볼 필요가 있습니다. 약함을 뜻하는 판정이 아니라, 혼자 버티는 방식보다 도움과 자원을 연결할 때 균형이 좋아진다는 해석입니다."
    : strength.label === "신강"
      ? "자기 기준이 분명하고 스스로 방향을 잡는 힘이 일찍 발달했을 수 있습니다. 대신 다른 사람의 조언을 간섭처럼 느끼거나, 쉬어야 할 때도 주도권을 놓지 못했는지 살펴볼 대목입니다. 강함을 뜻하는 훈장이 아니라, 힘을 나누고 조절할 때 균형이 좋아진다는 해석입니다."
      : "자기 판단과 주변의 요구 사이를 비교적 유연하게 오갔을 수 있습니다. 상황에 잘 맞추는 능력 뒤에서 정작 ‘나는 무엇을 원하는가’를 늦게 확인한 적은 없었는지 돌아볼 대목입니다. 중화는 완벽하다는 뜻이 아니라, 어느 한쪽으로 오래 치우치지 않는다는 구조적 표현입니다.";

  const futureEvidence = chart.hour
    ? [`시간 ${chart.tenGods.hourStem}`, `시지 ${chart.tenGods.hourBranch}`]
    : ["출생 시각 미입력", "시주 미산출"];
  const futureBody = chart.hour && chart.tenGods.hourStem && chart.tenGods.hourBranch
    ? `시간이 지나며 ${withParticle(reader, "topic")} ${familyExpectation[godFamily(chart.tenGods.hourStem)]}의 모습을 더 의식할 수 있습니다. 겉으로 선택하는 방향은 ${workMode[godFamily(chart.tenGods.hourStem)]} 힘을 얻고, 마음 깊은 곳에서는 ${withParticle(relationshipNeed[godFamily(chart.tenGods.hourBranch)], "object")} 원할 수 있습니다. 이것은 미래 사건의 예고가 아니라, 시주가 상징하는 장기적인 지향을 지금의 선택과 대조해 보라는 안내입니다.`
    : "출생 시각이 없어 시주를 만들지 않았습니다. 따라서 말년, 자녀, 장기적 지향처럼 시주에 기대는 이야기도 지어내지 않습니다. 출생 시각을 확인한 뒤에만 이 장면을 이어갈 수 있습니다.";

  return [
    {
      id: "core",
      title: "원국이 먼저 보여주는 당신의 중심",
      keySentence: `${reader}의 강점은 더 오래 버티는 데 있지 않고, 필요한 곳에 온기를 집중한 뒤에도 스스로 소진되지 않는 기준을 세우는 데 있습니다.`,
      body: `${reader}의 일간 ${chart.dayMaster} 중심에는 ${withParticle(dayMasterMetaphor[chart.dayMaster], "subject")} 있습니다. 한 번 납득한 방향은 쉽게 버리지 않고, 시간이 걸리더라도 자기 방식으로 완성하려는 마음이 살아 있을 수 있습니다. 반대로 기준이 선명한 만큼 다른 사람에게는 단단함이 고집처럼 보였던 순간도 있었을 겁니다. 이 원국에서 중요한 것은 강한 모습만 유지하는 일이 아니라, 힘이 빠졌을 때도 자신을 몰아붙이지 않고 다시 자랄 여백을 만드는 일입니다. 이것은 성격을 확정하는 진단이 아니라, 실제 선택에서 반복되는지 확인해 볼 첫 번째 문장입니다. 이 장면은 일간 ${chart.dayMaster}·${chart.dayMasterPhase}·${chart.dayMasterPolarity}에서 읽었습니다.\n\n일간의 상징은 혼자 떼어 읽지 않습니다. 연주와 월주는 어떤 기준을 먼저 배웠는지, 일지는 가까운 관계에서 무엇을 지키려 하는지, 시주는 시간이 흐르며 무엇을 더 중요하게 여길 수 있는지를 보태 줍니다. 그래서 이 원국의 중심을 단순히 ‘따뜻한 사람’이나 ‘강한 사람’으로 줄이기보다, 누구에게 어느 정도까지 힘을 쓰고 언제 멈추는지를 스스로 정해야 하는 구조로 읽는 편이 더 구체적입니다.\n\n최근 중요한 선택 세 가지를 떠올려 보세요. 시작할 때 무엇을 지키려 했는지, 중간에 누구의 기대를 떠안았는지, 끝난 뒤 에너지가 남았는지를 적으면 이 중심 문장이 실제 생활에서 맞는지 확인할 수 있습니다.`,
      evidence: [`일간 ${chart.dayMaster}`, `오행 ${chart.dayMasterPhase}`, `음양 ${chart.dayMasterPolarity}`],
    },
    {
      id: "childhood",
      title: "어릴 때, 먼저 맡았던 역할",
      keySentence: "빨리 이해하는 능력이 ‘도움을 청하지 않아도 되는 아이’의 역할로 굳지 않았는지 확인해야 합니다.",
      body: `${withParticle(reader, "topic")} 어릴 때 ${childhoodSurface[yearSurface]}로 보였을 수 있습니다. 겉으로 드러난 모습 아래에는 ${withParticle(childhoodGround[yearGround], "subject")} 함께 놓여 있습니다. 그래서 힘들어도 먼저 도움을 청하기보다 괜찮은 척하며 자기 몫을 챙겼거나, 또래보다 조금 일찍 철든 모습을 보여주려 했는지 모릅니다. 주변이 알아서 잘하는 아이라고 생각할수록 정작 위로나 보호가 필요하다는 말은 꺼내기 어려웠을 수 있습니다. 지금도 누군가에게 기대기 전에 스스로 해결책부터 찾는다면, 그 습관이 언제 처음 필요해졌는지 떠올려 보세요. 이 장면은 ${childhoodEvidence.join("과 ")}의 조합에서 읽었습니다.\n\n연주는 어린 시절의 사실을 증명하지는 않지만, 바깥에서 보인 역할과 안쪽에서 느꼈을 수 있는 긴장을 나란히 비교하게 합니다. ‘잘 알아듣는 아이’라는 칭찬을 받았을 때 편안했는지, 아니면 틀리거나 실망시키면 안 된다는 부담이 함께 생겼는지에 따라 같은 상징도 전혀 다르게 경험될 수 있습니다.\n\n기억을 확인할 때는 막연히 어린 시절 전체를 판단하지 말고, 도움을 요청했다가 받아들여졌던 장면과 혼자 해결해야 했던 장면을 각각 하나씩 적어 보세요. 지금의 독립성이 자유로운 선택인지, 예전에 필요했던 방어가 계속되는 것인지 구분하는 데 도움이 됩니다.`,
      evidence: childhoodEvidence,
    },
    {
      id: "family",
      title: "가족이 기대했을 수 있는 모습",
      keySentence: "가족의 기준을 잘 이해하는 것과 그 기준을 내 삶의 의무로 떠안는 것은 서로 다른 일입니다.",
      body: `가족은 ${withParticle(reader, "subject")} ${withParticle(familyExpectation[monthSurface], "subject")}기를 기대했을 수 있습니다. 생활 안에서는 ${withParticle(familyPressure[monthGround], "subject")} 말보다 먼저 전달됐을 가능성도 있습니다. 칭찬을 받았더라도 그 안에 ‘다음에도 잘해야 한다’는 압박이 함께 남았거나, 집안의 실질적인 문제를 먼저 알아채고 정리하는 역할을 맡았을 수 있습니다. 그 기대가 든든한 추진력이 되었는지, 실망시키면 안 된다는 부담으로 남았는지는 원국만으로 확정할 수 없습니다. 다만 지금도 중요한 선택 앞에서 내 마음보다 가족의 기준을 먼저 떠올리는지, 책임을 내려놓으면 죄책감이 생기는지 대조해 볼 수 있습니다. 이 장면은 ${familyEvidence.join("과 ")}에서 읽었습니다.\n\n월주는 가족만이 아니라 성장 과정에서 반복해서 접한 규칙과 생활 기준을 함께 비춥니다. 책임감을 배운 경험이 안정감과 신뢰를 주었을 수도 있고, 반대로 실수를 허용하지 않는 자기검열로 남았을 수도 있습니다. 어느 쪽인지는 원국이 아니라 실제 가족 대화와 현재의 반응으로 확인해야 합니다.\n\n중요한 결정을 앞두고 머릿속에 가장 먼저 떠오르는 가족의 문장을 적어 보세요. 그 문장이 지금도 유효한 조언인지, 과거에는 필요했지만 현재의 조건에는 맞지 않는 기준인지 구분하면 책임감은 유지하면서도 불필요한 죄책감을 줄일 수 있습니다.`,
      evidence: familyEvidence,
    },
    {
      id: "coping",
      title: "그 과정에서 익힌 대응 방식",
      keySentence: "버티는 능력보다 더 필요한 보완은, 한계가 오기 전에 부담의 크기와 필요한 도움을 말하는 능력입니다.",
      body: `${withParticle(reader, "subject")} 기대에 대응하는 방식에는 이런 흐름이 보입니다. ${coping} 혼자 감당하는 시간이 길어지면 설명할 힘까지 아껴 두느라 말수가 줄거나, 반대로 한계가 온 뒤에야 단호하게 선을 그었을 수 있습니다. 중요한 것은 더 강해지는 일이 아니라, 부담이 커지는 초기에 도움을 나누고 내 상태를 먼저 말하는 연습입니다. 이 장면은 억부 ${strength.label}, 점수 ${strength.score > 0 ? "+" : ""}${strength.score}, ${strength.hasSeasonalSupport ? "득령 있음" : "득령 없음"}의 구조에서 읽었습니다.\n\n억부의 강약은 의지력이나 사람의 가치를 매기는 점수가 아닙니다. 압박을 받을 때 어떤 자원을 이미 가지고 있고, 무엇을 더 쓰면 오히려 과해질 수 있는지를 보는 구조적 언어입니다. 같은 신강 판정도 충분히 쉬고 역할을 나눌 수 있다면 추진력으로 나타나지만, 모든 통제권을 혼자 쥐면 피로와 관계 단절로 나타날 수 있습니다.\n\n보완은 추상적인 오행 처방보다 관찰 가능한 행동으로 잡는 편이 안전합니다. 일이 커질 때 혼자 해결할 항목, 요청할 항목, 포기할 항목을 세 칸으로 나누고, 도움을 요청할 시점을 ‘완전히 지친 뒤’가 아니라 일정이나 수면이 흔들리기 시작할 때로 앞당겨 보세요.`,
      evidence: [`억부 ${strength.label}`, `억부 점수 ${strength.score}`],
    },
    {
      id: "social",
      title: "친구와 사람들 사이에서 보이는 모습",
      keySentence: "관계가 오래가려면 많이 챙기는 것보다, 내 수고의 한계와 공정성의 기준을 초기에 말하는 것이 중요합니다.",
      body: `${withParticle(reader, "topic")} 사람들 사이에서 자기 몫을 분명히 하고, 필요한 순간에는 흐름을 이끄는 사람으로 보일 수 있습니다. ${peerCount > 1 ? "비견·겁재의 반복이 있어 독립적인 사람과도 빠르게 동료 의식을 만들지만, 주도권이나 공정성의 기준이 부딪히면 경쟁처럼 느껴질 수 있습니다." : "비견·겁재가 과도하게 반복되지는 않아 무리의 중심만 고집하기보다 필요한 역할을 골라 맡는 편일 수 있습니다."} 가까운 친구에게는 말보다 행동으로 챙기면서도, 상대가 내 수고를 당연하게 여기면 갑자기 거리를 둘 가능성이 있습니다. 오래 가는 관계는 모든 일을 함께하는 사람보다 서로의 영역을 존중하고, 불편한 이야기도 거래처럼 계산하지 않는 사람과 만들어질 수 있습니다. 친구 사이의 돈거래나 동업은 좋고 나쁨을 사주로 결정하지 말고 역할·금액·종료 조건을 문서로 확인하세요. 이 장면은 원국 안의 비견·겁재 ${peerCount}자리와 연주·월주의 배치에서 읽었습니다.\n\n비견·겁재가 반복된다는 것은 사람을 경쟁자로 본다는 진단이 아닙니다. 동등함과 자율성을 중요하게 여길 가능성을 살피는 상징입니다. 역할과 기여가 분명한 모임에서는 리더십과 연대감으로 작동할 수 있지만, 책임이 모호한 관계에서는 ‘왜 나만 더 하고 있지’라는 감정으로 바뀔 수 있습니다.\n\n최근 편했던 관계와 소진됐던 관계를 하나씩 비교해 보세요. 연락 빈도보다 역할의 명확성, 부탁을 거절할 수 있었는지, 고마움과 불편함을 바로 말할 수 있었는지를 살피면 어떤 관계 조건에서 오래 편안한지가 더 분명해집니다.`,
      evidence: [`비견·겁재 ${peerCount}자리`, ...familyEvidence],
    },
    {
      id: "relationship",
      title: "가까운 관계에서 반복되는 장면",
      keySentence: "가까운 관계의 핵심은 상대가 내 마음을 추측하게 만드는 것이 아니라, 필요한 거리와 원하는 돌봄을 말로 합의하는 것입니다.",
      body: `연애와 가까운 관계에서 ${reader}에게 중요한 것은 ${relationshipNeed[dayGround]}입니다. 처음에는 단단하고 자기 관리가 철저해 보여도, 마음을 열면 상대의 생활까지 세심하게 챙기려는 면이 나타날 수 있습니다. 다만 그 필요가 충분히 표현되지 않으면 ${relationshipShadow[dayGround]}. ‘말하지 않아도 알아주길 바라는 마음’과 ‘내 기준을 따라주길 바라는 마음’이 섞이지 않았는지 살펴보세요. 잘 맞는 사람을 원국 하나로 정할 수는 없지만, 고마움과 서운함을 작을 때 말하고 서로의 속도를 존중하는 관계가 오래 가는 조건은 분명히 확인할 수 있습니다. 이 장면은 ${relationshipEvidence.join("와 ")}의 관계에서 읽었습니다.\n\n일지는 가까운 관계 안에서 반복될 수 있는 반응을 비추지만, 상대의 성격이나 관계의 결말을 정하지 않습니다. 독립성을 존중받을 때는 서로의 삶을 응원하는 관계가 될 수 있고, 경계가 침범됐다고 느끼면 설명보다 거리 두기가 먼저 나올 수 있습니다. 같은 반응이 실제로 반복되는지는 과거 관계의 구체적인 대화에서 확인해야 합니다.\n\n서운함이 생겼을 때 바로 요구를 말했는지, 상대가 알아주기를 기다렸는지, 이미 지친 뒤 관계 전체를 판단했는지를 돌아보세요. 다음 관계 대화에서는 ‘하지 않았으면 하는 것’ 하나와 ‘해주었으면 하는 것’ 하나를 분리해 말하는 방식이 현실적인 보완이 됩니다.`,
      evidence: relationshipEvidence,
    },
    {
      id: "work",
      title: "일과 책임에서 힘이 살아나는 순간",
      keySentence: "직함보다 중요한 것은, 스스로 판단할 범위와 책임의 기준이 분명한 환경에서 경험을 실력으로 축적하는 것입니다.",
      body: `${withParticle(reader, "topic")} 시키는 일을 기계적으로 반복하기보다, 자기 판단이 들어가는 영역에서 힘이 살아날 수 있습니다. ${structure.name}의 관점에서는 ${workMode[workFamily]} 장점이 두드러집니다. ${structure.revealed ? "이 구조가 천간에도 드러나 있어 주변에서 비교적 빨리 알아보기 쉬운 편입니다." : "이 구조가 천간에 바로 드러나지 않아 처음부터 직함으로 보이기보다 경험이 쌓인 뒤 실력으로 확인될 수 있습니다."} 정답이 이미 정해진 자리보다 문제를 정리하고 기준을 만들 수 있는 일이 맞을 수 있지만, 이것을 특정 직업이나 성공의 보장으로 받아들이면 안 됩니다. 실제로 몰입했던 일 세 가지를 적고, 그때 자율성·전문성·책임 범위가 어땠는지 비교하면 이 해석을 현실에서 검증할 수 있습니다. 이 장면은 ${structure.derivedFrom}, ${structure.revealed ? "투간 있음" : "투간 없음"}에서 읽었습니다.\n\n격국이 천간에 드러나지 않았다는 판정은 능력이 숨겨져 있으니 언젠가 성공한다는 예언이 아닙니다. 역할 이름보다 실제 작업 과정에서 기준을 만들고 문제를 정리하는 능력이 확인되는지를 보라는 뜻입니다. 권한 없이 책임만 커지는 환경에서는 이 장점이 과로와 불만으로 바뀔 수 있으므로, 책임과 결정권이 함께 주어지는지가 중요합니다.\n\n새로운 일을 고를 때는 ‘잘할 수 있는가’만 묻지 말고 결정권, 평가 기준, 반복해서 배울 수 있는 전문성, 문제가 생겼을 때 조정할 권한을 각각 확인해 보세요. 네 조건 중 두 가지도 분명하지 않다면 직함이나 기대감만으로 선택하지 않는 것이 안전합니다.`,
      evidence: [structure.derivedFrom],
    },
    {
      id: "money",
      title: "돈과 자원을 다루는 습관",
      keySentence: "돈의 운을 예측하기보다, 확신이 커질수록 현금흐름·손실 한도·종료 조건을 먼저 적는 습관이 핵심입니다.",
      body: `${reader}의 원국에는 표면과 지지의 정기를 기준으로 재성을 읽는 자리가 ${wealthCount}곳 보이고, 지장간에는 재성 상징이 ${hiddenWealthCount}자리 놓여 있습니다. ${wealthCount >= 2 ? "돈 자체보다 사람·시간·기회를 묶어 실제 결과로 바꾸는 감각을 자주 사용할 수 있고, 여러 책임을 동시에 잡으려는 경향도 생길 수 있습니다." : hiddenWealthCount > 0 ? "재성이 앞에 바로 드러나기보다 실제 업무와 생활의 관리 과정에서 사용되는지 살펴볼 수 있습니다. 이것을 숨은 재물이나 미래 수익으로 해석해서는 안 됩니다." : "재성만으로 삶의 중심이 정해지는 구조는 아니어서, 돈의 크기보다 관리 방식과 우선순위가 더 중요할 수 있습니다."} 한 번 확신하면 지출이나 선택의 속도가 빨라질 수 있으므로, 큰 금액은 마음이 뜨거울 때 바로 결정하지 말고 하루를 두고 손실 한도와 현금흐름을 먼저 확인하는 편이 안전합니다. 부동산·주식·동업의 수익을 사주로 예측할 수는 없으며, 계약과 투자는 자격 있는 전문가의 검토와 실제 자료가 우선입니다. 이 장면은 표면 편재·정재 ${wealthCount}자리, 지장간 편재·정재 ${hiddenWealthCount}자리와 오행 분포에서 읽었습니다.\n\n재성의 수는 부의 크기나 사업 성공률을 뜻하지 않습니다. 돈을 벌고 지키는 결과는 수입 구조, 비용, 계약, 세금, 시장 조건과 실제 행동에 달려 있습니다. 이 상징은 돈을 다룰 때 감정과 관리 체계 중 무엇이 먼저 움직이는지를 점검하는 질문으로만 사용하는 편이 안전합니다.\n\n큰 지출이나 투자 전에는 기대 수익보다 먼저 최악의 손실, 현금이 묶이는 기간, 중간에 그만둘 기준을 적어 보세요. 동업이라면 역할·금액·의사결정권·종료 절차를 문서로 남기는 것이 어떤 사주 해석보다 우선합니다.`,
      evidence: [`편재·정재 ${wealthCount}자리`, `오행 ${Object.entries(chart.elements).map(([phase, value]) => `${phase} ${value}`).join(" · ")}`],
    },
    {
      id: "environment",
      title: "마음이 메마를 때 회복하는 환경",
      keySentence: "회복은 부족한 오행을 물건으로 채우는 일이 아니라, 과열 신호를 알아차리고 몸과 일정의 속도를 실제로 낮추는 일입니다.",
      body: `오행의 분포에서는 ${dominantPhase} 기운이 상대적으로 두드러지고 ${lightPhase} 기운이 가볍게 놓여 있습니다. 이것을 특정 도시나 방향이 운명을 바꾼다는 뜻으로 쓰지는 않습니다. 대신 ${withParticle(reader, "subject")} 과열되거나 메마른 느낌이 들 때, 부족하다고 읽힌 ${lightPhase}의 상징을 일상적인 회복 신호로 사용할 수 있습니다. 물을 충분히 마시고, 바깥 공기를 쐬고, 화면과 업무에서 잠시 떨어져 몸의 속도를 낮추는 것처럼 실제로 확인 가능한 행동이 먼저입니다. 색이나 소품은 기분을 환기하는 취향의 장치일 뿐 행운·치유·재물을 보장하지 않습니다. 이 장면은 오행 분포 ${Object.entries(chart.elements).map(([phase, value]) => `${phase} ${value}`).join(" · ")}에서 읽었습니다.\n\n오행 분포는 몸의 질병이나 영양 결핍을 진단하지 않습니다. 다만 어떤 상징이 상대적으로 강하거나 가볍게 계산됐는지를 보고, 생활 리듬을 점검하는 계기로 삼을 수 있습니다. 실제 피로·수면·불안·통증이 지속된다면 사주가 아니라 의료적 평가와 생활 기록이 우선입니다.\n\n일주일 동안 에너지가 떨어지는 시간, 직전에 하던 일, 회복에 실제로 도움이 된 행동을 기록해 보세요. 반복되는 과열 조건이 확인되면 일정 사이의 빈 시간, 알림을 끄는 시간, 혼자 있는 시간을 먼저 확보하는 것이 색이나 소품을 고르는 것보다 직접적인 보완입니다.`,
      evidence: [`강한 오행 ${dominantPhase}`, `가벼운 오행 ${lightPhase}`],
    },
    {
      id: "future",
      title: chart.hour ? "시간이 흐르며 더 중요해질 방향" : "출생 시각이 없어 비워 둔 장면",
      keySentence: chart.hour
        ? "앞으로의 방향은 정해진 사건이 아니라, 시간이 갈수록 어떤 능력과 관계 조건을 의식적으로 선택할 것인가에 달려 있습니다."
        : "출생 시각이 확인되기 전에는 시주에 기대는 미래 이야기를 확정하지 않는 것이 정확합니다.",
      body: `${futureBody} 이 장면은 ${futureEvidence.join("과 ")}에서 읽었습니다.\n\n시주는 특정 나이에 일어날 사건을 예언하는 자리가 아닙니다. 시간이 흐르며 더 자주 사용하게 될 수 있는 태도와 장기적인 관심을 상징적으로 비교하는 자리입니다. 현재 이미 그 방향을 사용하고 있는지, 주변의 기대 때문에 선택하고 있는지, 스스로 중요하다고 느껴 선택하는지를 구분해야 합니다.\n\n앞으로 몇 년 안에 더 깊게 익히고 싶은 능력 하나와 오래 유지하고 싶은 관계 조건 하나를 적어 보세요. 둘을 현재 일정과 선택에 얼마나 반영하고 있는지를 확인하면 막연한 미래 해석보다 구체적인 방향을 잡을 수 있습니다.`,
      evidence: futureEvidence,
    },
    {
      id: "closing",
      title: "이 원국을 읽고 남겨야 할 한 문장",
      keySentence: "책임을 나누는 것은 약해지는 일이 아니라, 내 온기와 기준을 오래 지키기 위한 선택입니다.",
      body: `${reader}의 원국에서 반복되는 주제는 ‘강한 모습을 더 증명하는 일’보다 ‘책임을 나눠도 내 가치가 줄지 않는다는 것을 배우는 일’에 가깝습니다. 지금까지 혼자 해낸 일이 많았다면 그 힘은 이미 충분히 확인되었습니다. 앞으로는 모든 사람을 만족시키는 선택보다, 내 에너지가 오래 유지되는 선택을 기준으로 삼아 보세요. 다음 한 달 동안 부담을 혼자 떠안는 순간을 한 번만 알아차리고, 도움을 요청하거나 조건을 다시 협의하는 행동을 해보는 것이 좋습니다. 이 문장이 실제 경험과 다르다면 원국보다 당신의 경험을 우선하세요. 사주는 미래를 고정하는 답이 아니라, 반복되는 삶의 문장을 다시 읽어 보는 상징적 도구입니다.\n\n이 리포트에서 맞는 문장만 남기고 맞지 않는 문장은 버려도 됩니다. 원국은 삶을 대신 설명하는 판결문이 아니라, 반복되는 선택을 관찰하기 위한 하나의 틀입니다. 실제 경험, 관계에서 들은 피드백, 몸의 상태, 재정과 일의 객관적인 자료가 언제나 우선합니다.\n\n마지막으로 이번 달에 바꿀 행동을 하나만 정해 보세요. 부탁을 거절하기, 도움을 한 번 요청하기, 책임 범위를 문서로 확인하기처럼 실행 여부를 확인할 수 있는 행동이어야 합니다. 한 달 뒤 결과를 돌아보고 도움이 되지 않았다면 해석이 아니라 행동 조건을 수정하세요.`,
      evidence: [`일간 ${chart.dayMaster}`, `억부 ${strength.label}`, `월지 ${chart.tenGods.monthBranch}`],
    },
  ];
}

function englishSections(
  chart: SajuChart,
  strength: StrengthReading,
  structure: StructureReading,
  displayName?: string | null,
): readonly SajuLifeNarrativeSection[] {
  const reader = displayName?.trim() ? `${displayName.trim()},` : "You";
  const common = `These are symbolic prompts to compare with lived experience, not verified memories or fixed outcomes.`;
  const gods = [
    chart.tenGods.yearStem,
    chart.tenGods.monthStem,
    chart.tenGods.hourStem,
    chart.tenGods.yearBranch,
    chart.tenGods.monthBranch,
    chart.tenGods.dayBranch,
    chart.tenGods.hourBranch,
  ];
  const peerCount = gods.filter((god) => god === "비견" || god === "겁재").length;
  const wealthCount = gods.filter((god) => god === "편재" || god === "정재").length;
  const phases = Object.entries(chart.elements);
  const dominantPhase = [...phases].sort((left, right) => right[1] - left[1])[0]![0];
  const lightPhase = [...phases].sort((left, right) => left[1] - right[1])[0]![0];
  const futureEvidence = chart.hour
    ? [`hour stem ${chart.tenGods.hourStem}`, `hour branch ${chart.tenGods.hourBranch}`]
    : ["birth time not provided", "hour pillar omitted"];
  return [
    {
      id: "core",
      title: "The center this chart shows first",
      keySentence: "The point is not to prove more strength, but to direct your energy without using yourself up.",
      body: `${reader} the day master is ${chart.dayMaster}, ${chart.dayMasterPhase}, and ${chart.dayMasterPolarity}. It can be used as a metaphor for the way you choose a direction and recover after pressure. Check it against repeated choices rather than treating it as a personality diagnosis.\n\nRead the day master together with the other pillars: what standards were learned, what needs protection in close relationships, and what may matter more over time. Compare three recent decisions by what you tried to protect, whose expectations you carried, and how much energy remained afterward.\n\n${joinEvidence([`day master ${chart.dayMaster}`, `phase ${chart.dayMasterPhase}`, `polarity ${chart.dayMasterPolarity}`], "en")}`,
      evidence: [`day master ${chart.dayMaster}`],
    },
    {
      id: "childhood",
      title: "The role you may have learned early",
      keySentence: "Check whether learning quickly became a role in which you were no longer expected to need help.",
      body: `The year pillar suggests that you may have learned to show ${chart.tenGods.yearStem} qualities while carrying ${chart.tenGods.yearBranch} underneath. You may have tried to look capable before asking for help. ${common}\n\nCompare one childhood memory in which help was available with one in which you handled the situation alone. That contrast is more useful than treating the whole of childhood as confirmed by a chart.\n\n${joinEvidence([`year stem ${chart.tenGods.yearStem}`, `year branch ${chart.tenGods.yearBranch}`], "en")}`,
      evidence: [`year stem ${chart.tenGods.yearStem}`, `year branch ${chart.tenGods.yearBranch}`],
    },
    {
      id: "family",
      title: "What family may have expected",
      keySentence: "Understanding a family standard is different from carrying it as a lifelong obligation.",
      body: `The month pillar can be read as a family atmosphere that valued ${chart.tenGods.monthStem} on the surface and ${chart.tenGods.monthBranch} in daily life. Check whether you still hear those standards when making an important choice. ${common}\n\nWrite down the family sentence that appears first before a major decision. Ask whether it remains useful under present conditions or belongs to an earlier stage of life.\n\n${joinEvidence([`month stem ${chart.tenGods.monthStem}`, `month branch ${chart.tenGods.monthBranch}`], "en")}`,
      evidence: [`month stem ${chart.tenGods.monthStem}`, `month branch ${chart.tenGods.monthBranch}`],
    },
    {
      id: "coping",
      title: "The response pattern you may have learned",
      keySentence: "The practical correction is to name the load and ask for help before reaching the limit.",
      body: `The strength view is ${strength.label} (${strength.score > 0 ? "+" : ""}${strength.score}). Use it to ask whether you tend to carry a situation alone, scan other people's expectations first, or move between the two. It is a structural label, not a diagnosis.\n\nSeparate a growing task into what you will own, request, and stop. Move the help point earlier than exhaustion, especially when sleep, schedule, or communication begins to deteriorate.\n\n${joinEvidence([`strength ${strength.label}`, `score ${strength.score}`], "en")}`,
      evidence: [`strength ${strength.label}`, `score ${strength.score}`],
    },
    {
      id: "social",
      title: "How you may appear among friends",
      keySentence: "Long relationships need early clarity about effort, fairness, and boundaries more than silent caretaking.",
      body: `${reader} may be seen as someone who knows their role and can carry a group when needed. With ${peerCount} peer-symbol positions, compare whether fairness, independence, or unspoken competition tends to shape friendships. Never use Saju alone to decide lending or partnership; write down roles, money, and exit terms.\n\nCompare one relationship that felt sustainable with one that felt draining. Look at whether roles were explicit, refusal was safe, and discomfort could be discussed before resentment accumulated.\n\n${joinEvidence([`peer-symbol positions ${peerCount}`, `year stem ${chart.tenGods.yearStem}`, `month stem ${chart.tenGods.monthStem}`], "en")}`,
      evidence: [`peer-symbol positions ${peerCount}`],
    },
    {
      id: "relationship",
      title: "A scene that may repeat in close relationships",
      keySentence: "State the space and care you need instead of making the other person guess.",
      body: `The day branch is read as ${chart.tenGods.dayBranch}. Compare that symbol with how you ask for closeness, space, reliability, expression, or reassurance. It does not decide a relationship.\n\nWhen disappointment appears, notice whether you state the request, wait to be understood, or judge the whole relationship after becoming exhausted. Name one boundary and one desired form of support separately.\n\n${joinEvidence([`day branch ${chart.tenGods.dayBranch}`, `day master ${chart.dayMaster}`], "en")}`,
      evidence: [`day branch ${chart.tenGods.dayBranch}`, `day master ${chart.dayMaster}`],
    },
    {
      id: "work",
      title: "Where responsibility may become usable strength",
      keySentence: "Choose work where decision authority, standards, and responsibility are aligned.",
      body: `${structure.name} is derived from ${structure.derivedFrom}. Use this as a check on the working conditions in which focus and repeatable results actually appear, not as a career prediction.\n\nBefore accepting a role, check decision authority, evaluation criteria, repeatable learning, and the ability to adjust a failing process. Responsibility without authority can turn a useful pattern into exhaustion.\n\n${joinEvidence([structure.derivedFrom, structure.revealed ? "revealed" : "not revealed"], "en")}`,
      evidence: [structure.derivedFrom],
    },
    {
      id: "money",
      title: "How you may handle money and resources",
      keySentence: "When conviction rises, write the cash-flow, loss limit, and exit condition before committing money.",
      body: `${reader} has ${wealthCount} visible wealth-symbol positions in this chart. Read them as prompts about managing time, people, and resources, not as a promise of wealth. Saju cannot forecast returns on property, stocks, or a business; actual cash flow, loss limits, contracts, and qualified advice come first.\n\nFor a major expense or investment, write the worst acceptable loss, the period funds remain tied up, and the condition for stopping. For a partnership, document roles, money, authority, and exit procedure.\n\n${joinEvidence([`wealth-symbol positions ${wealthCount}`, ...phases.map(([phase, value]) => `${phase} ${value}`)], "en")}`,
      evidence: [`wealth-symbol positions ${wealthCount}`],
    },
    {
      id: "environment",
      title: "An environment that may help you reset",
      keySentence: "Recovery means changing the body's pace and the schedule, not purchasing a missing phase.",
      body: `${dominantPhase} is relatively prominent and ${lightPhase} is relatively light in the phase balance. This does not mean a city, direction, color, or object changes fate. Use the contrast only as a practical cue to slow down, step away from the screen, hydrate, move, or seek a setting that genuinely helps your body settle.\n\nTrack when energy drops, what happened just before it, and what measurably helps. Persistent sleep, pain, anxiety, or health symptoms require appropriate professional assessment rather than a phase interpretation.\n\n${joinEvidence(phases.map(([phase, value]) => `${phase} ${value}`), "en")}`,
      evidence: [`prominent ${dominantPhase}`, `light ${lightPhase}`],
    },
    {
      id: "future",
      title: chart.hour ? "A direction that may matter more over time" : "A scene left open without a birth time",
      keySentence: chart.hour
        ? "Long-term direction is shaped by the abilities and relationship conditions you repeatedly choose, not by a predicted event."
        : "Without a verified birth time, any future narrative dependent on the hour pillar stays open.",
      body: chart.hour
        ? `The hour pillar carries ${chart.tenGods.hourStem} above ${chart.tenGods.hourBranch}. Read it as a long-term orientation to compare with present choices, not a forecast of future events.\n\nName one ability you want to deepen and one relationship condition you want to preserve. Check how much space each receives in the present schedule.\n\n${joinEvidence(futureEvidence, "en")}`
        : `No birth time was provided, so the hour pillar and any story dependent on it remain open. The report does not invent that missing chapter.\n\n${joinEvidence(futureEvidence, "en")}`,
      evidence: futureEvidence,
    },
    {
      id: "closing",
      title: "One sentence to carry from this chart",
      keySentence: "Sharing responsibility is not weakness; it is how you keep your standards and energy sustainable.",
      body: `${reader} may need less proof of being strong and more practice sharing responsibility before exhaustion. Try one observable action this month: name the pressure early, ask for help, or renegotiate one condition. If this reading conflicts with lived experience, your experience takes priority. Four Pillars is a symbolic reflection tool, not a fixed future.\n\nKeep only the sentences that match observed experience. Choose one action that can be reviewed in a month, then change the condition if it does not help rather than forcing the interpretation to be true.`,
      evidence: [`day master ${chart.dayMaster}`, `strength ${strength.label}`, `month branch ${chart.tenGods.monthBranch}`],
    },
  ];
}

/**
 * Turns calculated chart facts into bounded life-context prompts. The report may say
 * “this may have felt familiar”; it may never claim that an unobserved childhood event
 * actually happened. Every paragraph carries the exact chart positions that prompted it.
 */
export function buildSajuLifeNarrative(
  chart: SajuChart,
  strength: StrengthReading,
  structure: StructureReading,
  locale: Locale,
  displayName?: string | null,
): readonly SajuLifeNarrativeSection[] {
  return locale === "ko"
    ? koreanSections(chart, strength, structure, displayName)
    : englishSections(chart, strength, structure, displayName);
}
