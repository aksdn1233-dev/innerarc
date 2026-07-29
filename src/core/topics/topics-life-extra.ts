import { n, type ConcernTopic } from "./topic-types";

export const MONEY_EXTRA_TOPICS: readonly ConcernTopic[] = [
  {
    id: "saving",
    focus: "money",
    label: n("저축·목돈 모으기", "Saving up"),
    verdict: n(
      "모을 수 있는 조건입니다. 의지가 아니라 순서 문제입니다. 월급날 다음 날 자동이체 하나면 대부분 해결됩니다.",
      "This is achievable. It is an ordering problem, not a willpower one; one automatic transfer the day after payday settles most of it.",
    ),
    framing: n(
      "저축은 의지보다 순서에서 갈립니다. 쓰고 남기면 대개 남지 않고, 먼저 떼면 대개 남습니다.",
      "Saving turns on order more than will. What is left after spending rarely remains; what is taken first usually does.",
    ),
    observe: n(
      "지난달 지출을 고정비와 변동비로 나눠 보세요. 줄일 수 있는 쪽은 거의 항상 고정비입니다.",
      "Split last month into fixed and variable costs. The room is almost always in the fixed side.",
    ),
    action: n(
      "월급날 다음 날 자동이체를 하나 걸어 두세요. 금액보다 자동인지가 결과를 정합니다.",
      "Set one automatic transfer for the day after payday. Automatic matters more than the amount.",
    ),
    caution: n(
      "높은 수익을 약속하는 저축성 상품은 대부분 저축이 아닙니다. 원금이 보장되는지 문서로 확인하세요.",
      "A savings product promising high returns is usually not savings. Check in writing whether principal is protected.",
    ),
    patterns: [/저축|모으고 싶|목돈을? 만들|적금|재테크/u, /save money|savings|build up funds/i],
  },
  {
    id: "insurance",
    focus: "money",
    label: n("보험", "Insurance"),
    verdict: n(
      "지금 구성은 손볼 여지가 있습니다. 보험은 수익이 아니라 감당 못 할 손실만 막으면 됩니다. 그 기준으로 보면 줄일 곳이 보입니다.",
      "There is room to adjust. Insurance only needs to cover what you could not absorb; judged that way, the excess shows.",
    ),
    framing: n(
      "보험은 수익이 아니라 감당 못 할 손실을 막는 도구입니다. 그 기준으로 보면 필요한 것이 훨씬 줄어듭니다.",
      "Insurance covers losses you could not absorb; it is not a return. Judged that way, far less is needed.",
    ),
    observe: n(
      "지금 내는 보험료를 모두 더해 월 소득의 몇 퍼센트인지 계산해 보세요. 중복 보장이 있는지도 함께 보세요.",
      "Add every premium and work out the share of monthly income, and check for duplicated cover.",
    ),
    action: n(
      "가입한 상품의 보장 내용을 하나만 골라 실제로 읽어보세요. 판매자 설명과 약관이 다른 경우가 있습니다.",
      "Read the actual terms of one policy. The seller's summary and the contract sometimes differ.",
    ),
    caution: n(
      "해지는 되돌리기 어렵습니다. 새 상품에 가입한 뒤에 기존 것을 정리하세요. 이 서비스는 보험 상담이 아닙니다.",
      "Cancelling is hard to undo — take the new cover first. This service is not insurance advice.",
    ),
    patterns: [/보험|실비|보장성|해지환급|암보험|연금보험/u, /insurance|policy cover/i],
  },
  {
    id: "inheritance",
    focus: "money",
    label: n("상속·증여", "Inheritance"),
    verdict: n(
      "정리 가능한 사안입니다. 다만 감정보다 기한이 먼저입니다. 채무까지 함께 확인하고 기한 안에 움직이면 문제되지 않습니다.",
      "This is resolvable, but deadlines come before feeling. Check debts alongside assets and move inside the window.",
    ),
    framing: n(
      "상속은 감정보다 법과 기한이 정합니다. 상의보다 확인이 먼저입니다.",
      "Inheritance is decided by law and deadlines rather than by feeling. Verification comes before discussion.",
    ),
    observe: n(
      "재산과 채무를 함께 확인하세요. 빚도 상속됩니다. 이 사실을 모르고 넘어가는 경우가 많습니다.",
      "Check debts alongside assets. Debt is inherited too, and that is often missed.",
    ),
    action: n(
      "상속 포기나 한정승인은 기한이 정해져 있습니다. 상황이 복잡하면 법률구조공단이나 변호사에게 먼저 확인하세요.",
      "Renouncing or limiting acceptance has a deadline. If it is complex, check with legal aid or a lawyer first.",
    ),
    caution: n(
      "가족 간 합의만으로 정리했다고 생각하면 나중에 분쟁이 됩니다. 서류로 남겨야 합니다.",
      "A family understanding without documents becomes a dispute later.",
    ),
    patterns: [/상속|증여|유산|재산 분할|상속세/u, /inheritance|estate|bequest/i],
  },
];

export const LIFE_EXTRA_TOPICS: readonly ConcernTopic[] = [
  {
    id: "health_habit",
    focus: "growth",
    label: n("건강 습관", "Health habits"),
    verdict: n(
      "유지 가능합니다. 강도보다 시각이 결과를 정합니다. 목표를 절반으로 줄이고 정해진 시간에 붙이면 이어집니다.",
      "This holds. When beats how hard; halve the target and attach it to a fixed time.",
    ),
    framing: n(
      "이 리포트는 몸 상태를 판단하지 않습니다. 다만 습관이 유지되는 조건은 함께 볼 수 있습니다.",
      "This report does not judge your body. It can look at the conditions under which a habit holds.",
    ),
    observe: n(
      "운동이나 식사 계획이 끊긴 날의 공통점을 2주만 기록해 보세요. 시간대나 피로도가 자주 겹칩니다.",
      "For two weeks, note what the days you dropped it had in common. Time of day and fatigue repeat often.",
    ),
    action: n(
      "목표를 지금의 절반으로 줄이고, 정해진 시간에 붙이세요. 강도보다 시각이 유지에 더 크게 작용합니다.",
      "Halve the target and attach it to a fixed time. When beats how hard for staying with it.",
    ),
    caution: n(
      "통증, 어지럼, 체중의 급격한 변화는 습관 문제가 아니라 진료가 필요한 신호입니다. 극단적인 식이 제한은 권하지 않습니다.",
      "Pain, dizziness, or rapid weight change call for a clinician, not a habit change. Extreme restriction is not advised.",
    ),
    patterns: [/운동을?|다이어트|식습관|건강 관리|체력|살을? 빼/u, /exercise|diet habit|get fit/i],
  },
  {
    id: "sleep",
    focus: "growth",
    label: n("수면", "Sleep"),
    verdict: n(
      "회복 가능한 패턴입니다. 자는 시간을 맞추려 하면 어렵고, 깨는 시간을 고정하면 대부분 따라옵니다.",
      "This pattern recovers. Fixing the waking time works where fixing the bedtime does not.",
    ),
    framing: n(
      "잠은 의지로 조절되지 않고 조건으로 조절됩니다. 자는 시간보다 깨는 시간을 고정하는 편이 효과적입니다.",
      "Sleep answers to conditions, not will. Fixing the waking time works better than fixing the bedtime.",
    ),
    observe: n(
      "일주일 동안 잠든 시각, 깬 시각, 자기 전 마지막으로 한 일을 적어보세요. 세 번째 항목에서 원인이 자주 나옵니다.",
      "For a week, log when you slept, when you woke, and the last thing you did before bed. The cause is often in the third.",
    ),
    action: n(
      "기상 시각을 하나로 고정하고 일주일만 유지해 보세요. 취침 시각은 대개 따라옵니다.",
      "Fix one waking time for a week. The bedtime usually follows.",
    ),
    caution: n(
      "두 주 이상 잠이 계속 무너져 있거나 낮 생활이 어렵다면 수면 문제만이 아닐 수 있습니다. 진료로 확인하세요.",
      "If sleep has been broken for more than two weeks, or days are hard, that may not be only sleep. See a clinician.",
    ),
    patterns: [/불면|잠이 안|수면|새벽에 깨|잠을? 못/u, /insomnia|cannot sleep|sleep problem/i],
  },
  {
    id: "social_difficulty",
    focus: "growth",
    label: n("사람 만나기 어려움", "Finding people hard"),
    verdict: n(
      "성격 문제가 아닙니다. 만남 뒤 얼마나 지치는지가 핵심이고, 덜 지쳤던 자리의 조건을 반복하면 훨씬 수월해집니다.",
      "This is not a defect. Recovery cost is the point; repeating the conditions that drained you less makes it far easier.",
    ),
    framing: n(
      "사람 만나는 일이 어려운 것은 성격 결함이 아니라 대개 회복 비용의 문제입니다. 만남 뒤 얼마나 지치는지가 핵심입니다.",
      "Finding people hard is usually about recovery cost rather than a defect. How drained you are afterwards is the point.",
    ),
    observe: n(
      "최근 만남 중 덜 지쳤던 자리 두 곳의 인원수, 시간, 장소를 적어 공통점을 찾아보세요.",
      "For two gatherings that drained you less, note the size, length, and place, and find the overlap.",
    ),
    action: n(
      "이번 달에는 그 조건에 맞는 만남 한 번만 잡아 보세요. 횟수를 늘리는 것보다 조건을 맞추는 편이 낫습니다.",
      "Arrange one meeting matching those conditions this month. Matching conditions beats increasing frequency.",
    ),
    caution: n(
      "사람을 피하는 정도가 일상이나 일에 지장을 준다면 상담으로 확인해 보는 편이 낫습니다. 성격 탓으로만 두지 마세요.",
      "If avoidance is affecting work or daily life, a counsellor is worth seeing rather than filing it under personality.",
    ),
    patterns: [/사람 만나기|낯을? 가|사회생활이 힘|모임이 부담|대인관계가 어/u, /social anxiety|meeting people is hard/i],
  },
  {
    id: "loneliness",
    focus: "growth",
    label: n("외로움", "Loneliness"),
    verdict: n(
      "해소 가능합니다. 사람 수를 늘리는 것보다 한 사람에게 조금 더 구체적으로 말하는 쪽이 훨씬 빠릅니다.",
      "This eases. Saying something more specific to one person works faster than adding people.",
    ),
    framing: n(
      "외로움은 사람 수보다 연결의 깊이에서 옵니다. 많이 만나도 남는 경우가 흔합니다.",
      "Loneliness tracks depth rather than headcount. It survives a full calendar.",
    ),
    observe: n(
      "최근 마음을 있는 그대로 말할 수 있었던 상대가 있었는지, 있었다면 언제였는지 떠올려 보세요.",
      "Recall whether there was anyone you could say it plainly to, and when.",
    ),
    action: n(
      "이번 주에 한 사람에게 안부가 아니라 근황을 조금 더 구체적으로 전해 보세요. 깊이는 대개 이렇게 시작됩니다.",
      "Tell one person something slightly more specific than how you are. Depth usually starts there.",
    ),
    caution: n(
      "혼자 있는 시간이 힘들어 견디기 어렵다면 정신건강 상담전화(1577-0199)에 연락해 보셔도 됩니다. 무료이고 익명입니다.",
      "If being alone has become hard to bear, a counselling line is available, free and anonymous.",
    ),
    // Korean stems change shape: 외로움 and 외롭습니다 share no substring, so both forms
    // are listed. Same reason for the other conjugations below.
    patterns: [/외로|외롭|혼자인 것 같|고립|친구가 없|기댈 곳이/u, /lonely|isolated|no one to talk/i],
  },
  {
    id: "appearance",
    focus: "growth",
    label: n("외모·자신감", "Appearance and confidence"),
    verdict: n(
      "지금 느끼는 부담은 외모 자체보다 비교하는 환경에서 커진 쪽에 가깝습니다. 그 환경을 하나 줄이면 체감이 달라집니다.",
      "The weight of this grows in the comparison environment more than in the mirror. Removing one such setting shifts it.",
    ),
    framing: n(
      "외모에 대한 고민은 대개 외모 자체보다 비교하는 환경에서 커집니다. 무엇을 보고 있는지가 크게 작용합니다.",
      "Worry about appearance usually grows in the comparison environment more than in the mirror.",
    ),
    observe: n(
      "이 생각이 심해지는 시간대와 상황을 일주일만 적어보세요. 특정 앱이나 자리와 겹치는 경우가 많습니다.",
      "For a week, note when the thought intensifies. It often overlaps with a specific app or setting.",
    ),
    action: n(
      "그 상황 하나만 이번 주에 줄여 보고 차이를 확인하세요. 외모를 바꾸기 전에 환경을 바꾸는 편이 빠릅니다.",
      "Reduce that one setting this week and check the difference. Changing the environment is faster.",
    ),
    caution: n(
      "시술이나 수술은 되돌리기 어렵습니다. 급하게 결정하지 마시고, 식사나 체중에 대한 생각이 일상을 지배한다면 전문 상담을 받으시는 편이 안전합니다.",
      "Procedures are hard to reverse — do not decide in a rush. If thoughts about eating or weight dominate the day, seek specialist help.",
    ),
    patterns: [/외모|성형|자신감이 없|못생|살이 쪄서|콤플렉스/u, /appearance|plastic surgery|self-confidence/i],
  },
  {
    id: "faith",
    focus: "growth",
    label: n("신앙·마음공부", "Faith and practice"),
    verdict: n(
      "지금 선택을 바꾸지 않아도 됩니다. 옳고 그름보다 그 활동 뒤에 마음이 가벼워지는지가 기준입니다.",
      "You do not have to change this. Whether you feel lighter afterwards is the measure, not whether it is right.",
    ),
    framing: n(
      "믿음의 옳고 그름은 이 리포트가 판단할 일이 아닙니다. 다만 그 선택이 지금 생활에 어떻게 작용하는지는 볼 수 있습니다.",
      "This report does not rule on belief. It can look at how the choice is working in your daily life.",
    ),
    observe: n(
      "그 활동 뒤에 마음이 가벼워지는지, 부담이 늘어나는지를 몇 주간 기록해 보세요.",
      "For a few weeks, note whether you feel lighter or more burdened afterwards.",
    ),
    action: n(
      "지금 참여 정도를 그대로 두고 한 달만 관찰해 보세요. 늘리거나 줄이는 결정은 그 뒤가 낫습니다.",
      "Hold the current level for a month and observe. Increasing or decreasing is better decided after.",
    ),
    caution: n(
      "헌금이나 재산을 요구하거나, 가족·직장과 끊으라고 하거나, 나가지 못하게 하는 곳은 위험 신호입니다. 그런 경우 외부에 알리세요.",
      "Demands for money or property, cutting you off from family or work, or preventing you from leaving are warning signs. Tell someone outside.",
    ),
    patterns: [/신앙|종교|기도|절에|교회|성당|수행|명상/u, /faith|religion|prayer|meditation practice/i],
  },
  {
    id: "moving_city",
    focus: "growth",
    label: n("지역 이동·정착", "Where to settle"),
    verdict: n(
      "옮기셔도 됩니다. 다만 집값이나 인프라보다 그곳에 아는 사람이 있는지가 만족도를 정합니다. 평범한 주말을 한 번 보내보시면 답이 나옵니다.",
      "The move is workable. Knowing people there decides satisfaction more than prices; spend one ordinary weekend to find out.",
    ),
    framing: n(
      "지역 선택은 집값이나 인프라보다 그곳에서 아는 사람이 있는지가 만족도를 더 크게 좌우합니다.",
      "Satisfaction with a place depends on knowing people there more than on prices or amenities.",
    ),
    observe: n(
      "후보 지역에 아는 사람이 몇 명인지, 없다면 사람을 만날 수 있는 장소가 있는지 확인해 보세요.",
      "Count who you know there, and if nobody, whether there is any place to meet people.",
    ),
    action: n(
      "결정 전에 그 지역에서 평범한 주말을 한 번 보내 보세요. 여행이 아니라 생활 동선으로요.",
      "Spend one ordinary weekend there before deciding — as living, not as a trip.",
    ),
    caution: n(
      "직장이 함께 정해지지 않은 이주는 생활비 계산이 특히 중요합니다. 최소 6개월치 여유를 두세요.",
      "Moving without work settled makes the cost calculation critical. Keep six months of room.",
    ),
    patterns: [/지방으로|서울로|고향으로|귀농|귀촌|정착|이 지역/u, /move to another city|settle down where/i],
  },
];
