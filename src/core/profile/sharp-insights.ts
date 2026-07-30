import type { Locale } from "@/i18n/config";

// Short, specific observations about a behavioral contradiction — how a life-path
// number's own strength quietly produces its recurring problem. Deterministic and
// number-derived, the same way every other piece of this profile is: no live model
// call, same birth date always surfaces the same ordered set.
//
// Each number carries exactly eight, ordered so a lower tier's slice is always a
// prefix of a higher tier's — "more of the same well-chosen sentences," not a
// different, disconnected set per price point.
type Bilingual = Readonly<{ ko: string; en: string }>;

function n(ko: string, en: string): Bilingual {
  return { ko, en };
}

const SHARP_INSIGHTS: Record<number, readonly Bilingual[]> = {
  1: [
    n("도와달라는 말은 하지 않고 혼자 다 처리한 뒤, 왜 아무도 자신을 돕지 않았느냐고 서운해집니다.", "They handle everything alone without ever asking for help, then feel hurt that no one offered any."),
    n("동료를 믿지 못해서 일을 넘기지 않는 것이 아니라, 방향을 정하는 역할에 익숙해져 나누는 법을 놓친 것에 가깝습니다.", "It is not that they distrust colleagues and withhold tasks — being so used to setting the direction themselves, they simply lose track of how to hand pieces off."),
    n("돈 문제를 감당할 능력이 없어서가 아니라, 스스로 해결해야 한다는 확신이 강해 도움을 구할 타이밍을 놓칩니다.", "It is not that they lack the ability to handle a money problem — their conviction that they must solve it alone runs so strong that they miss the moment to ask for help."),
    n("혼자서도 괜찮아 보이는 모습이 상대를 안심시키는 게 아니라, 정작 필요할 때 손을 내밀 타이밍을 상대가 놓치게 만듭니다.", "Looking fine on their own does not reassure a partner so much as make the partner miss the exact moment help is actually needed."),
    n("가족을 지키려는 마음이 아니라, 정작 자신이 기댈 자리는 스스로 남겨두지 않는 습관에 가깝습니다.", "It is less about protecting the family than a habit of never leaving themselves a place to lean on in return."),
    n("약한 모습을 감추는 성격이 아니라, 방향을 정하는 사람은 흔들리면 안 된다는 스스로의 기준이 도움 요청을 막습니다.", "It is not simply hiding weakness — their own standard that whoever sets the direction should never waver is what blocks them from asking for help."),
    n("결정이 빨라서 독단적으로 보이는 것이 아니라, 결정을 남과 나누는 순간 방향이 흔들릴까 봐 혼자 정하는 쪽을 택합니다.", "Decisions do not look unilateral simply because they are fast — they are made alone because sharing the choice feels like it could shake the direction itself."),
    n("쉬지 않는 성실함이 아니라, 멈추면 방향을 놓친 사람처럼 보일까 봐 계속 움직이는 쪽을 택하는 것에 가깝습니다.", "It is not simply tireless diligence — they keep moving mainly because stopping might make them look like someone who has lost their direction."),
  ],
  2: [
    n("참는 동안 관계를 지키는 것이 아니라, 속으로 이미 상대의 자리를 하나씩 지우고 있을 수 있습니다.", "Staying quiet does not preserve the relationship — inside, they may already be erasing the other person's place in it, one piece at a time."),
    n("회의에서 조용히 맞춰주는 것이 배려가 아니라, 미리 분위기를 읽고 반대 의견을 낼 타이밍을 스스로 접어버린 것에 가깝습니다.", "Going quietly along in a meeting is not really consideration — sensing the mood early, they fold away the moment to voice disagreement before it arrives."),
    n("돈 이야기를 먼저 꺼내지 않는 배려심이 아니라, 자리의 분위기가 불편해지는 것을 못 견뎌 손해를 감수하는 쪽에 가깝습니다.", "Not being the one to bring up money first is not really thoughtfulness — it is closer to swallowing a loss rather than let the mood turn uncomfortable."),
    n("가족 사이 갈등을 피하는 게 지혜로운 것이 아니라, 분위기가 무거워지는 순간을 못 견뎌 하고 싶은 말을 계속 다음으로 미루는 것입니다.", "Avoiding conflict within the family is not wisdom so much as an inability to sit with a heavy mood, which keeps pushing what they want to say to some later day."),
    n("성격이 둥글어서 맞춰주는 것이 아니라, 분위기를 깨는 사람으로 보이는 게 싫어서 자기 기준을 조용히 접습니다.", "It is not a naturally easygoing nature that makes them accommodate others — a dislike of being seen as the one who breaks the mood quietly folds up their own standards."),
    n("다수의 의견을 존중하는 태도가 아니라, 분위기를 거스르는 결정을 내렸을 때의 어색함을 피하려는 쪽에 가깝습니다.", "It is not respect for the majority opinion — it is closer to avoiding the awkwardness that would follow a decision that goes against the room."),
    n("상대를 잘 이해해서 맞춰주는 것이 아니라, 서운함을 말로 꺼내면 분위기가 깨질까 봐 마음속으로만 정리하는 것일 수 있습니다.", "It is not deep understanding that makes them go along with a partner — they may just be sorting out their hurt silently, afraid that saying it aloud would break the mood."),
    n("친구 사이에서 손해를 잘 보는 성격이 아니라, 눈치 빠르게 분위기를 읽어 먼저 양보해버리는 쪽을 택하는 것에 가깝습니다.", "It is not that they are simply someone who loses out among friends — it is closer to reading the room so quickly that they give way before anyone even asks."),
  ],
  3: [
    n("능력이 부족해서 결과가 늦는 게 아니라, 능력이 여러 방향으로 흩어져 결과가 늦어집니다.", "It is not a lack of ability that delays results — it is ability spread across too many directions at once."),
    n("일을 벌이기만 하고 마무리를 안 하는 게 게을러서가 아니라, 새 아이디어가 떠오르는 순간 이전 일의 흥이 먼저 식어버리기 때문입니다.", "Starting projects without finishing them is not laziness — the excitement for the earlier one simply cools the moment a new idea appears."),
    n("돈 관리가 서툴러서가 아니라, 새로운 것에 마음이 쏠릴 때마다 계획했던 지출의 우선순위가 자꾸 뒤바뀌기 때문입니다.", "It is not that they are bad with money — every time something new catches their attention, the priorities in their spending plan simply reshuffle themselves."),
    n("여러 사람과 잘 어울리는 것이 가벼워서가 아니라, 대화마다 새로운 흥을 불어넣다 보니 한 사람에게 깊이 머무는 시간이 짧아지는 것입니다.", "Getting along easily with many people is not shallowness — pouring fresh energy into every conversation just leaves less time to stay deeply with any one person."),
    n("가족과 함께하는 시간을 소홀히 하는 것이 아니라, 관심이 다른 곳으로 흘러가는 사이 정작 곁에 있는 사람에게는 말을 아끼게 됩니다.", "It is not that they neglect time with family — as attention keeps drifting elsewhere, they end up saying less to the very people right beside them."),
    n("생각이 많아서 산만해 보이는 것이 아니라, 떠오르는 생각마다 말로 살려내다 보니 한 가지에 집중하는 모습이 잘 드러나지 않는 것입니다.", "It is not that too many thoughts make them look scattered — bringing every idea to life in words just makes it hard for their focus on any single one to show."),
    n("결정을 못 내려서 미루는 것이 아니라, 새로운 선택지가 계속 떠올라 먼저 정한 방향의 흥미가 금세 옅어지는 것입니다.", "Delaying a decision is not indecision — new options keep occurring to them, and the appeal of whatever they already chose fades quickly."),
    n("아이디어가 부족해서 결과물이 적은 것이 아니라, 하나를 완성하기 전에 다음 아이디어에 이미 말과 생기를 입히고 있기 때문입니다.", "It is not a shortage of ideas that leaves few finished works — before one piece is done, they are already giving the next idea its own words and spark."),
  ],
  4: [
    n("새로운 방식을 몰라서 거부하는 것이 아니라, 이미 짜놓은 절차가 무너질까 봐 몸이 먼저 굳습니다.", "It is not that they reject a new way because they do not understand it — the moment an already-built process seems at risk of breaking, they freeze up first."),
    n("돈이 없어서 망설이는 것이 아니라, 정해둔 계획을 벗어나는 지출 앞에서 유독 결정이 느려집니다.", "It is not that money worries make them hesitate — decisions slow down specifically in front of spending that falls outside the plan they set."),
    n("상대에게 무심해서가 아니라, 관계가 늘 해오던 방식에서 벗어나면 그 자체를 위협으로 느껴 거리를 둘 수 있습니다.", "It is not indifference toward the other person — any sign that a familiar way of relating is about to change can feel like a threat, so they pull back first."),
    n("가족 일에 무관심해서 반대하는 게 아니라, 오랫동안 지켜온 집안의 방식이 흔들리는 게 두려워 반대부터 하게 됩니다.", "It is not indifference to family matters that makes them object — fear that a long-kept family way of doing things is shifting is what triggers the objection first."),
    n("고집이 세서 바뀌지 않는 게 아니라, 스스로 만든 순서가 흐트러지면 자신이 무너진다고 느낄 수 있습니다.", "It is not stubbornness that keeps them from changing — when the order they built themselves comes apart, it can feel like they themselves are coming apart."),
    n("결단력이 없어서 미루는 게 아니라, 검증되지 않은 새로운 선택지 앞에서는 익숙한 절차부터 다시 확인하려 합니다.", "It is not a lack of decisiveness that causes delay — faced with an unverified new option, they go back to double-checking the familiar procedure first."),
    n("기회를 못 알아봐서 놓치는 게 아니라, 기존 틀에 없는 기회일수록 위험 신호부터 먼저 읽습니다.", "It is not that they fail to spot opportunities — the more an opportunity falls outside their existing framework, the more they read it first as a warning sign."),
    n("몸이 약해서 루틴을 못 바꾸는 게 아니라, 익숙한 순서를 깨는 변화가 생기면 그 자체가 스트레스로 쌓일 수 있습니다.", "It is not physical weakness that keeps a routine fixed — any change that breaks a familiar order can pile up as stress in itself."),
  ],
  5: [
    n("방향을 바꿀 줄 아는 것과, 버텨야 할 순간에도 방향을 바꾸는 것을 혼동할 수 있습니다.", "Knowing how to change direction gets confused with changing direction even in the moment that called for holding steady."),
    n("일을 끝맺지 못해서가 아니라, 새로운 자리가 눈에 들어오는 순간 하던 일의 우선순위가 조용히 뒤로 밀립니다.", "It is not that they fail to finish work — the moment something new catches their eye, what they were doing quietly slips down the priority list."),
    n("돈을 헤프게 써서가 아니라, 새로운 인맥이나 기회 앞에서 먼저 지갑이 열려 원래 계획했던 지출이 흔들립니다.", "It is not that they spend carelessly — faced with a new connection or opportunity, the wallet opens first and the original spending plan comes apart."),
    n("정이 얕아서가 아니라, 새로 만난 사람과의 대화가 즐거운 순간 오래 만난 사람과의 약속이 뒷전으로 밀릴 수 있습니다.", "It is not shallow affection — when a conversation with someone new turns enjoyable, a plan with someone they have known for years can slide to the back burner."),
    n("가족에게 무심해서가 아니라, 낯선 자리에서 사람을 잇는 감각이 발동할 때마다 집으로 돌아오는 걸음이 자꾸 늦어집니다.", "It is not indifference to family — every time their gift for connecting with strangers kicks in, the walk back home keeps getting later."),
    n("변덕스러운 사람이라서가 아니라, 새로운 것을 익히는 속도가 빨라 얼마 전 몰입했던 일이 벌써 낡게 느껴질 수 있습니다.", "It is not fickleness — they learn new things so fast that something they were absorbed in not long ago can already feel stale."),
    n("끈기가 없어서가 아니라, 어느 정도 손에 익고 나면 낯선 자극을 찾아 다음 자리부터 눈에 들어옵니다.", "It is not a lack of persistence — once something is more or less mastered, their eyes are already drawn to the next unfamiliar challenge."),
    n("발이 넓어서 가볍다는 말을 듣는 게 아니라, 새 사람을 잇는 감각이 강해질수록 오래된 관계를 다지는 시간이 뒤로 밀립니다.", "It is not that a wide circle makes their relationships shallow — the stronger their gift for connecting with new people grows, the more time spent deepening old relationships gets pushed back."),
  ],
  6: [
    n("돈을 못 버는 사람이 아니라, 남의 문제까지 자기 돈으로 정리해 남는 돈이 적습니다.", "It is not that they cannot earn — it is that other people's problems get settled with their own money, so little is left."),
    n("일을 못 미더워해서 다 떠안는 게 아니라, 곁을 살피는 눈이 밝아 남의 몫까지 먼저 눈에 들어와 손이 갑니다.", "It is not that they cannot trust others with the work — their sharp eye for watching over people means someone else's share catches their attention first, and their hands move before they decide to."),
    n("가족에게 집착이 심해서가 아니라, 자리를 꾸준히 살피는 습관 때문에 남들이 놓친 부분까지 혼자 챙기다 지칠 수 있습니다.", "It is not that they are overly attached to family — the habit of steadily watching over their people means they end up alone covering what everyone else missed, until they wear out."),
    n("곁을 안 주는 사람이 아니라, 상대의 부족한 부분까지 먼저 채워주다 보니 정작 자신의 자리는 비어 있는 경우가 많습니다.", "It is not that they keep people at a distance — they fill in what the other person lacks so consistently that their own place is often left empty."),
    n("희생을 즐기는 사람이라서가 아니라, 누군가의 몫이 비어 보이면 그냥 지나치지 못해 스스로 채워 넣습니다.", "It is not that they enjoy sacrifice — when someone's share looks unfilled, they cannot simply walk past it and end up filling it in themselves."),
    n("결정을 못 내려서 미루는 게 아니라, 내 선택이 곁에 있는 사람에게 미칠 영향부터 먼저 헤아리느라 늦어질 수 있습니다.", "It is not indecisiveness that delays them — they weigh how their choice will affect the people close to them first, and that can slow things down."),
    n("체력이 약해서 쉽게 지치는 게 아니라, 남의 몫까지 꾸준히 떠안다 보니 정작 자신을 돌볼 힘이 남지 않을 수 있습니다.", "It is not physical weakness that tires them out — steadily carrying other people's share on top of their own can leave nothing left for taking care of themselves."),
    n("성장이 느린 사람이 아니라, 곁에 있는 사람들 자리를 챙기느라 정작 자기 앞길을 준비할 시간이 뒤로 밀립니다.", "It is not that they grow slowly — time to prepare their own path keeps getting pushed back because they are busy tending to the people around them."),
  ],
  7: [
    n("준비가 부족해서 움직이지 않는 것이 아니라, 부족한 모습을 남에게 들키는 것이 싫어 출발을 늦춥니다.", "It is not that the preparation is lacking — the start gets delayed because being seen underprepared is what they cannot stand."),
    n("일을 못 해서 늦게 시작하는 것이 아니라, 겉핥기로 알고 넘어가는 것을 스스로 용납하지 못해 검토가 길어집니다.", "The start is not slow because the work is beyond them — the review drags on because they cannot let themselves settle for a surface-level understanding."),
    n("우유부단해서 결정을 미루는 것이 아니라, 근거가 완전히 맞아떨어질 때까지 확인하려는 습관 때문입니다.", "The decision is not delayed by indecision — it is a habit of confirming the reasoning until every piece lines up."),
    n("사람을 믿지 못해서가 아니라, 말과 행동 뒤의 진짜 이유를 알기 전까지는 마음을 다 열지 않습니다.", "It is not distrust of people — the heart does not fully open until the real reason behind their words and actions is understood."),
    n("돈에 무관심해서 투자를 미루는 것이 아니라, 구조를 완전히 이해하기 전에는 손대지 않으려는 신중함 때문입니다.", "Investing is not delayed by indifference to money — it is caution that refuses to touch anything until the structure is fully understood."),
    n("가족에게 곁을 안 주는 것이 아니라, 아직 정리되지 않은 생각을 보여주기 싫어 말을 아낍니다.", "It is not withholding closeness from family — words are held back because showing thoughts that are not yet settled feels uncomfortable."),
    n("자신감이 없어서 조용한 것이 아니라, 스스로도 납득하지 못한 답을 밖으로 내놓는 것을 견디지 못합니다.", "The quiet is not a lack of confidence — they cannot bear putting out an answer that has not even convinced themselves yet."),
    n("고집이 세서 의견을 안 바꾸는 것이 아니라, 원리를 이해하지 못한 채 따르라는 요구에는 동의할 수 없습니다.", "It is not stubbornness that keeps the opinion fixed — they simply cannot agree to follow along without understanding the principle behind it."),
  ],
  8: [
    n("일에 지쳐 무너지는 것이 아니라, 목표를 결과로 만들어내는 감각이 있어 스스로 더 큰 목표를 계속 얹습니다.", "The exhaustion is not from failing at work — because they can actually turn goals into results, they keep loading bigger goals onto themselves."),
    n("곁에 사람이 없어서 외로운 것이 아니라, 성과를 좇는 동안 옆에 있던 사람을 뒤로 미뤄둔 결과일 수 있습니다.", "The loneliness is not for lack of people nearby — it can come from having set the people who were there aside while chasing results."),
    n("쉴 줄 몰라서 못 쉬는 것이 아니라, 멈추는 순간 손에 쥔 결과가 사라질까 봐 스스로 멈추지 못합니다.", "It is not that they do not know how to rest — they cannot stop because stopping feels like the result in hand might slip away."),
    n("돈을 밝혀서 무리하는 것이 아니라, 목표를 숫자로 확인해야 안심이 되어 다음 목표를 계속 세웁니다.", "The overreach is not greed for money — needing to confirm goals as numbers to feel at ease, they keep setting the next one."),
    n("가족을 소홀히 하려는 것이 아니라, 지금의 성과가 가족을 위한 것이라 믿어 뒤로 미뤄도 된다고 생각합니다.", "It is not neglect of family on purpose — believing today's results are for them, postponing time together feels acceptable for now."),
    n("신중해서 결정이 늦는 것이 아니라, 결과로 이어지지 않을 선택에는 자원을 안 쓰려다 타이밍을 놓칩니다.", "The slow decision is not caution — refusing to spend resources on a choice that will not pay off, they end up missing the timing."),
    n("여유가 없어 보이는 것이 아니라, 손에 쥔 목표가 없는 자신의 모습을 스스로 견디기 힘들어합니다.", "It is not that they seem to lack ease — they themselves find it hard to bear the image of having no goal in hand."),
    n("주변 사람을 이용하려는 것이 아니라, 자원을 결과로 잇는 감각이 있어 사람도 그 계산 안에 들어가게 됩니다.", "It is not that they try to use people around them — with a sense for linking resources to results, people end up inside that same calculation."),
  ],
  9: [
    n("사람을 잘못 보는 것이 아니라, 아직 보여주지 않은 능력까지 미리 믿어주는 것이 문제입니다.", "It is not misjudging people — it is believing in ability someone has not shown yet, before they have shown it."),
    n("경험이 부족해서 헤매는 것이 아니라, 흩어진 경험들을 하나의 이야기로 엮으려다 결정이 늦어질 수 있습니다.", "The hesitation is not from lacking experience — the decision can slow down while they try to weave scattered experiences into one coherent story."),
    n("지금의 자신에게 만족 못 해서가 아니라, 그리는 모습과 지금 사이의 거리를 의식할 때마다 지칠 수 있습니다.", "The exhaustion is not dissatisfaction with who they are now — it comes each time they notice the distance between the picture they envision and where they stand."),
    n("정이 많아서 잘 챙기는 것이 아니라, 상대의 이야기를 자신의 서사 안에 이미 들여놓아 쉽게 놓지 못합니다.", "The care is not simply warmth — having already folded the other person's story into their own narrative, letting go does not come easily."),
    n("돈 관리를 못해서 새는 것이 아니라, 큰 그림을 그리는 데 마음이 가 있어 눈앞의 숫자를 놓칠 때가 있습니다.", "The money that slips away is not poor management — with the mind set on the big picture, the numbers right in front can go unnoticed."),
    n("가족에게 무심해서가 아니라, 가족 각자의 이야기를 다 짊어지려다 정작 자기 몫은 뒤로 미룹니다.", "It is not indifference toward family — trying to carry every family member's story, their own share ends up postponed."),
    n("우유부단해서 결정을 못 내리는 것이 아니라, 전체 이야기가 맞아떨어지는 그림이 보일 때까지 손을 놓지 못합니다.", "The stalled decision is not indecision — they cannot let go until they can see a picture where the whole story fits together."),
    n("목표가 없어서 방황하는 것이 아니라, 그리는 이상이 커서 지금의 걸음이 작게만 느껴질 수 있습니다.", "The wandering is not a lack of goals — with such a large ideal in mind, the step they are on now can simply feel too small."),
  ],
  11: [
    n("갈등을 진정시키는 재주가 있어 평온해 보이는 것이 아니라, 부드럽게 말하는 동안 스스로는 그 긴장을 고스란히 떠안고 있는 경우가 많습니다.", "It is not that a talent for calming conflict makes them look at peace — often, while they soften everyone else's tension into gentle words, they are quietly absorbing all of it themselves."),
    n("기준이 낮아서 만족을 못 하는 게 아니라, 남들보다 미세한 균열까지 먼저 느껴서 칭찬 앞에서도 마음이 편치 않습니다.", "It is not that their standards are impossibly low — they simply sense the smallest cracks before anyone else does, so even praise fails to put them at ease."),
    n("갈등에 둔감해서 중재를 잘하는 것이 아니라, 누구보다 예민하게 감지하기 때문에 먼저 나서서 말을 고르게 됩니다.", "Being good at mediating is not a sign they are numb to conflict — it is because they pick up on tension faster than anyone that they step in first to choose their words carefully."),
    n("우유부단해서 결정을 미루는 것이 아니라, 모든 선택지의 아픔까지 미리 느껴버려서 마지막 순간까지 저울질하게 됩니다.", "Delaying a decision is not indecisiveness — feeling out the pain of every option in advance keeps them weighing things until the last possible moment."),
    n("가족 안에서 다툼이 줄어드는 것은 저절로 그런 게 아니라, 매번 먼저 말을 부드럽게 바꿔주는 사람이 있기 때문일 수 있습니다.", "Fewer arguments in the family are not simply how things naturally are — there is usually someone quietly softening the words each time before they land."),
    n("자신의 감정에는 무심한 사람처럼 보이지만, 실은 기준이 너무 높아 스스로의 서운함조차 검열한 뒤에야 꺼내놓습니다.", "They can look indifferent to their own feelings, but the truth is their standards are so high that they edit even their own hurt before they let it show."),
    n("협상에서 손해를 보는 것은 계산이 서툴러서가 아니라, 상대의 곤란함까지 느껴버려 요구를 먼저 낮추는 경우가 많습니다.", "Coming out behind in a negotiation is rarely poor calculation — feeling the other side's difficulty too keenly often makes them lower their own ask first."),
    n("관계가 갑자기 멀어지는 것처럼 보이는 순간은 사실 갑작스러운 게 아니라, 너무 오래 혼자 버텨온 예민함이 한계에 닿은 때입니다.", "A relationship that seems to cool off suddenly usually is not sudden at all — it is the moment sensitivity they carried alone for too long finally reaches its limit."),
  ],
  22: [
    n("계획이 커서 위태로운 것이 아니라, 그 계획을 끝까지 혼자 끌고 가려다 무너질 지점을 스스로 만드는 경우가 많습니다.", "A plan is not shaky because it is large — it is often the insistence on carrying it through alone that creates the point where it breaks."),
    n("사람을 믿지 못해 일을 나누지 않는 것이 아니라, 완성된 그림이 자기 머릿속에만 있어 나누는 방법을 찾지 못하는 경우가 많습니다.", "Not delegating is rarely about distrust — often the finished picture exists only in their own head, so there is no clear way to hand any piece of it off."),
    n("무리하게 투자하는 성향이 있어서가 아니라, 큰 구조를 실제로 돌아가게 하려다 보니 결국 자기 돈과 시간부터 먼저 밀어 넣게 됩니다.", "It is not a taste for reckless investment — making a large structure actually run tends to mean their own money and time go in first."),
    n("가족과 멀어지는 것은 일을 더 중요하게 여겨서가 아니라, 지금 짓고 있는 것이 무너지면 모두가 피해를 본다는 책임감 때문일 수 있습니다.", "Drifting from family is not about valuing work more — it can come from a sense that if what they are building collapses, everyone connected to it pays for it."),
    n("지쳤다는 말을 하지 않는 것은 강해서가 아니라, 이 규모를 감당할 사람이 자기 말고 없다고 믿기 때문일 수 있습니다.", "Not admitting exhaustion is not really strength — it can be the belief that no one else is positioned to carry something this size."),
    n("작은 일도 크게 설계하려는 것은 욕심이 아니라, 나중에 감당해야 할 규모를 이미 눈앞에 그려버렸기 때문입니다.", "Over-engineering even a small task is not greed — it is because they have already pictured the full scale it will grow into later."),
    n("팀을 이끄는 능력이 뛰어난 것과, 팀 없이도 끝까지 버틸 수 있다고 믿는 것은 다른 문제일 수 있습니다.", "Being excellent at leading a team and believing they could finish just as well without one are two different things that can get confused."),
    n("도움을 요청하지 않는 것은 자존심 때문이 아니라, 자신이 그린 그림을 남에게 설명하는 시간조차 아깝게 느껴지기 때문일 수 있습니다.", "Not asking for help is not really pride — even the time it would take to explain the vision to someone else can feel like a cost they would rather not pay."),
  ],
  33: [
    n("남이 자라는 모습을 오래 지켜볼 줄 아는 사람이라, 정작 자기 자신이 자라는 시간표는 계속 뒤로 미뤄두는 경우가 많습니다.", "Someone able to watch another person grow for years at a time often keeps pushing back their own timeline for growth in the process."),
    n("돈 관리가 서툴러서가 아니라, 누군가의 성장에 필요한 순간마다 먼저 자기 몫을 내어주다 보니 남는 돈이 적어질 수 있습니다.", "It is not poor money management — giving up their own share whenever it might help someone else grow is often what leaves so little left over."),
    n("경력이 더뎌지는 것은 실력이 부족해서가 아니라, 옆 사람을 키우는 데 시간과 기회를 먼저 내어주기 때문일 수 있습니다.", "A career moving slowly is not usually about lacking skill — it can come from handing their own time and openings to whoever they are helping grow."),
    n("오래 참아주는 것이 관계를 지키는 힘처럼 보이지만, 실은 상대의 성장을 기다리는 동안 자신은 조금씩 깎여나가고 있을 수 있습니다.", "Long patience can look like what holds a relationship together, when really, waiting for the other person to grow may be quietly wearing them down."),
    n("가족을 끝까지 챙기는 것은 애정이 넘쳐서만이 아니라, 누군가는 계속 버텨줘야 한다는 생각에 자신의 필요를 뒤로 미루기 때문일 수 있습니다.", "Staying devoted to family to the end is not only about abundant affection — it can be the belief that someone has to keep holding on, which pushes their own needs aside."),
    n("관계를 쉽게 정리하지 못하는 것은 미련이 많아서가 아니라, 상대가 자라는 모습을 조금 더 지켜보고 싶은 마음 때문인 경우가 많습니다.", "Struggling to walk away from a relationship is often not lingering attachment — it is wanting to see just a little more of the other person's growth first."),
    n("헌신적인 사람으로 보이는 것과, 자신을 돌보는 법을 잊어버린 것은 한 끗 차이일 수 있습니다.", "Looking devoted and having quietly forgotten how to take care of themselves can be separated by only a thin line."),
    n("부탁을 잘 거절하지 못하는 것은 마음이 약해서가 아니라, 자신의 도움이 누군가의 성장에 꼭 필요하다고 믿기 때문일 수 있습니다.", "Trouble saying no to requests is not really softness — it can come from believing their help is genuinely necessary for someone else's growth."),
  ],
};

const FALLBACK_NUMBER = 9;

/** Sliced deterministically: the same lifePath always returns the same ordered prefix. */
export function pickSharpInsights(lifePath: number, count: number, locale: Locale): readonly string[] {
  const pool = SHARP_INSIGHTS[lifePath] ?? SHARP_INSIGHTS[FALLBACK_NUMBER];
  return pool.slice(0, Math.max(0, count)).map((entry) => entry[locale]);
}
