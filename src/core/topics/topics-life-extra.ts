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
      "저축은 의지보다 순서에서 갈립니다. 쓰고 남기면 대개 남지 않고, 먼저 떼면 대개 남습니다. 예를 들어 월급의 10%를 먼저 떼어 놓는 사람과 남는 돈을 모으려는 사람은 1년 뒤 잔액 차이가 뚜렷합니다.",
      "Saving turns on order more than will. What is left after spending rarely remains; what is taken first usually does. For example, someone who sets aside 10% of pay first and someone who tries to save whatever is left show a clear gap in balance after a year.",
    ),
    observe: n(
      "지난달 지출을 고정비와 변동비로 나눠 보세요. 줄일 수 있는 쪽은 거의 항상 고정비입니다. 구독 서비스, 보험료, 통신비처럼 매달 자동으로 빠져나가는 항목부터 하나씩 점검하면 월 5만원 이상 줄어드는 경우가 흔합니다.",
      "Split last month into fixed and variable costs. The room is almost always in the fixed side. Start by checking items that go out automatically each month, like subscriptions, insurance, or phone plans — cutting these often frees up more than 50,000 won a month.",
    ),
    action: n(
      "월급날 다음 날 자동이체를 하나 걸어 두세요. 금액보다 자동인지가 결과를 정합니다. 처음에는 월급의 10% 정도로 시작해, 3개월 뒤 생활에 무리가 없으면 비율을 조금씩 올려보세요.",
      "Set one automatic transfer for the day after payday. Automatic matters more than the amount. Start around 10% of your pay, and after three months, if it has not strained your budget, raise the share a little.",
    ),
    caution: n(
      "높은 수익을 약속하는 저축성 상품은 대부분 저축이 아닙니다. 원금이 보장되는지 문서로 확인하세요. 연 수익률이 은행 정기예금의 두 배를 넘는다고 광고하는 상품은 특히 약관의 위험 고지 부분을 꼼꼼히 읽어보세요.",
      "A savings product promising high returns is usually not savings. Check in writing whether principal is protected. If a product advertises a return more than twice a standard bank deposit rate, read the risk disclosure section of the terms especially closely.",
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
      "보험은 수익이 아니라 감당 못 할 손실을 막는 도구입니다. 그 기준으로 보면 필요한 것이 훨씬 줄어듭니다. 예를 들어 몇 만원짜리 손해까지 보장하는 특약은 보험료만 올릴 뿐 실질적인 방어 효과는 크지 않습니다.",
      "Insurance covers losses you could not absorb; it is not a return. Judged that way, far less is needed. For example, a rider that covers losses of only a few tens of thousands of won mainly raises the premium without adding much real protection.",
    ),
    observe: n(
      "지금 내는 보험료를 모두 더해 월 소득의 몇 퍼센트인지 계산해 보세요. 중복 보장이 있는지도 함께 보세요. 보통 소득의 8~10%를 넘어가면 과도한 편이니, 그 기준을 넘는지 먼저 확인하세요.",
      "Add every premium and work out the share of monthly income, and check for duplicated cover. As a rough benchmark, more than 8-10% of income is generally excessive, so check whether you are over that line first.",
    ),
    action: n(
      "가입한 상품의 보장 내용을 하나만 골라 실제로 읽어보세요. 판매자 설명과 약관이 다른 경우가 있습니다. 특히 면책 조항과 감액 지급 조건이 있는 항목을 표시해두면 나중에 청구할 때 도움이 됩니다.",
      "Read the actual terms of one policy. The seller's summary and the contract sometimes differ. Mark the exclusion clauses and any reduced-payout conditions in particular — it helps later when you file a claim.",
    ),
    caution: n(
      "해지는 되돌리기 어렵습니다. 새 상품에 가입한 뒤에 기존 것을 정리하세요. 이 서비스는 보험 상담이 아닙니다. 특히 나이나 건강 상태에 따라 재가입이 거절되거나 보험료가 오를 수 있으니, 순서를 반드시 지키세요.",
      "Cancelling is hard to undo — take the new cover first. This service is not insurance advice. Depending on age or health, re-applying can be refused or cost more, so keep the order without skipping steps.",
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
      "상속은 감정보다 법과 기한이 정합니다. 상의보다 확인이 먼저입니다. 상속 개시를 안 날로부터 3개월 안에 승인이나 포기를 정해야 하므로, 가족회의보다 서류 확인이 먼저입니다.",
      "Inheritance is decided by law and deadlines rather than by feeling. Verification comes before discussion. You must decide to accept or renounce within three months of learning the inheritance began, so checking documents comes before a family meeting.",
    ),
    observe: n(
      "재산과 채무를 함께 확인하세요. 빚도 상속됩니다. 이 사실을 모르고 넘어가는 경우가 많습니다. 금융감독원 상속인 조회 서비스를 이용하면 고인 명의의 예금, 대출, 보험을 한 번에 확인할 수 있습니다.",
      "Check debts alongside assets. Debt is inherited too, and that is often missed. The Financial Supervisory Service's heir inquiry service lets you check the deceased's deposits, loans, and insurance in one search.",
    ),
    action: n(
      "상속 포기나 한정승인은 기한이 정해져 있습니다. 상황이 복잡하면 법률구조공단이나 변호사에게 먼저 확인하세요. 기한을 넘기면 빚까지 단순승인한 것으로 처리되니, 서류 준비에 시간이 걸린다면 기한 연장을 법원에 신청하는 방법도 있습니다.",
      "Renouncing or limiting acceptance has a deadline. If it is complex, check with legal aid or a lawyer first. Missing the deadline is treated as accepting the debt along with the estate; if paperwork needs more time, you can also ask the court to extend the deadline.",
    ),
    caution: n(
      "가족 간 합의만으로 정리했다고 생각하면 나중에 분쟁이 됩니다. 서류로 남겨야 합니다. 상속재산분할협의서를 작성하고 상속인 전원이 서명 날인해야 나중에 등기나 명의 이전에서 문제가 생기지 않습니다.",
      "A family understanding without documents becomes a dispute later. Draft an estate division agreement and have every heir sign and seal it, or registration and title transfer can run into problems later.",
    ),
    patterns: [/상속|증여|유산|재산 분할|상속세/u, /inheritance|estate|bequest/i],
  },
];

export const LIFE_EXTRA_TOPICS: readonly ConcernTopic[] = [
  {
    id: "health_habit",
    focus: "health",
    label: n("건강 습관", "Health habits"),
    verdict: n(
      "유지 가능합니다. 강도보다 시각이 결과를 정합니다. 목표를 절반으로 줄이고 정해진 시간에 붙이면 이어집니다.",
      "This holds. When beats how hard; halve the target and attach it to a fixed time.",
    ),
    framing: n(
      "이 리포트는 몸 상태를 판단하지 않습니다. 다만 습관이 유지되는 조건은 함께 볼 수 있습니다. 새 습관은 보통 2~3주가 고비이므로, 그 시기를 넘기기 전까지는 결과보다 지속 여부에 집중하는 편이 낫습니다.",
      "This report does not judge your body. It can look at the conditions under which a habit holds. A new habit usually hits its hardest point around two to three weeks in, so until then, focus on sticking with it rather than on results.",
    ),
    observe: n(
      "운동이나 식사 계획이 끊긴 날의 공통점을 2주만 기록해 보세요. 시간대나 피로도가 자주 겹칩니다. 야근한 날이나 약속이 늦게 끝난 날처럼 특정 요일에 몰려있는지도 함께 확인해 보세요.",
      "For two weeks, note what the days you dropped it had in common. Time of day and fatigue repeat often. Also check whether the drop-off clusters on specific days, like ones with overtime or a late evening plan.",
    ),
    action: n(
      "목표를 지금의 절반으로 줄이고, 정해진 시간에 붙이세요. 강도보다 시각이 유지에 더 크게 작용합니다. 예를 들어 하루 30분 운동이 부담스럽다면 15분으로 줄이고, 아침 기상 직후처럼 흔들리지 않는 시간에 고정하세요.",
      "Halve the target and attach it to a fixed time. When beats how hard for staying with it. For example, if 30 minutes a day feels heavy, cut it to 15 and anchor it to a fixed point like right after waking, which rarely shifts.",
    ),
    caution: n(
      "통증·어지럼, 의도하지 않은 급격한 체중 변화, 식사를 계속 거르게 되는 상태나 일상 기능 저하가 있다면 습관 해석보다 의료진 확인이 우선입니다. 극단적인 식이 제한은 권하지 않습니다.",
      "Pain, dizziness, unintentional rapid weight change, repeatedly missed meals, or difficulty functioning call for a clinician before habit interpretation. Extreme restriction is not advised.",
    ),
    patterns: [
      /운동을?|다이어트|식습관|건강 관리|건강 습관|생활 리듬|체력|살을? 빼/u,
      /exercise|diet habit|health habit|daily rhythm|get fit/i,
    ],
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
      "잠은 의지로 조절되지 않고 조건으로 조절됩니다. 자는 시간보다 깨는 시간을 고정하는 편이 효과적입니다. 예를 들어 주말에도 기상 시각을 평일과 한 시간 이내로 맞추면 월요일 아침의 피로가 눈에 띄게 줄어듭니다.",
      "Sleep answers to conditions, not will. Fixing the waking time works better than fixing the bedtime. For example, keeping your weekend wake time within an hour of weekdays noticeably reduces Monday morning fatigue.",
    ),
    observe: n(
      "일주일 동안 잠든 시각, 깬 시각, 자기 전 마지막으로 한 일을 적어보세요. 세 번째 항목에서 원인이 자주 나옵니다. 특히 잠들기 한 시간 안에 스마트폰을 봤는지, 카페인을 늦게 마셨는지를 따로 표시해두면 패턴이 더 잘 보입니다.",
      "For a week, log when you slept, when you woke, and the last thing you did before bed. The cause is often in the third. Mark separately whether you used your phone within an hour of bed or had caffeine late — the pattern shows up more clearly that way.",
    ),
    action: n(
      "기상 시각을 하나로 고정하고 일주일만 유지해 보세요. 취침 시각은 대개 따라옵니다. 알람을 하나만 맞추고 스누즈 기능은 끄면, 몸이 기상 시각을 훨씬 빠르게 받아들입니다.",
      "Fix one waking time for a week. The bedtime usually follows. Set a single alarm and turn off snooze — the body adapts to the wake time much faster that way.",
    ),
    caution: n(
      "두 주 이상 잠이 계속 무너져 있거나 낮 생활이 어렵다면 수면 문제만이 아닐 수 있습니다. 진료로 확인하세요. 코를 심하게 골거나 자다가 숨이 막히는 느낌이 있다면 수면무호흡 검사도 함께 고려해 보세요.",
      "If sleep has been broken for more than two weeks, or days are hard, that may not be only sleep. See a clinician. If there is heavy snoring or a choking sensation during sleep, consider a sleep apnea screening as well.",
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
      "사람 만나는 일이 어려운 것은 성격 결함이 아니라 대개 회복 비용의 문제입니다. 만남 뒤 얼마나 지치는지가 핵심입니다. 예를 들어 4명 이하의 소모임에서는 괜찮다가 10명 넘는 자리에서 유독 지친다면, 문제는 성향이 아니라 규모입니다.",
      "Finding people hard is usually about recovery cost rather than a defect. How drained you are afterwards is the point. For example, if you are fine in groups of four or fewer but especially drained past ten people, the issue is scale, not your character.",
    ),
    observe: n(
      "최근 만남 중 덜 지쳤던 자리 두 곳의 인원수, 시간, 장소를 적어 공통점을 찾아보세요. 만난 시간이 2시간을 넘었는지, 처음 보는 사람이 섞여 있었는지도 함께 표시해두면 조건이 더 선명해집니다.",
      "For two gatherings that drained you less, note the size, length, and place, and find the overlap. Also note whether the meeting ran past two hours or included strangers — that sharpens the pattern further.",
    ),
    action: n(
      "이번 달에는 그 조건에 맞는 만남 한 번만 잡아 보세요. 횟수를 늘리는 것보다 조건을 맞추는 편이 낫습니다. 예를 들어 인원이 핵심이었다면 3명 이하로, 시간이 핵심이었다면 1시간 안에 끝나는 자리로 잡아보세요.",
      "Arrange one meeting matching those conditions this month. Matching conditions beats increasing frequency. If headcount mattered most, keep it to three or fewer; if duration mattered most, cap the meeting at an hour.",
    ),
    caution: n(
      "사람을 피하는 정도가 일상이나 일에 지장을 준다면 상담으로 확인해 보는 편이 낫습니다. 성격 탓으로만 두지 마세요. 회피가 몇 달째 이어지며 출근이나 등교, 약속 자체를 계속 취소하게 만든다면 더 미루지 말고 상담을 받아보세요.",
      "If avoidance is affecting work or daily life, a counsellor is worth seeing rather than filing it under personality. If the avoidance has continued for months and keeps causing you to cancel work, school, or plans outright, seek counselling without delaying further.",
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
      "외로움은 사람 수보다 연결의 깊이에서 옵니다. 많이 만나도 남는 경우가 흔합니다. 예를 들어 매주 여러 약속이 있어도 속마음을 말한 적이 한 번도 없다면 외로움은 그대로 남습니다.",
      "Loneliness tracks depth rather than headcount. It survives a full calendar. For example, even with several plans a week, loneliness can remain untouched if none of them involved saying what you actually feel.",
    ),
    observe: n(
      "최근 마음을 있는 그대로 말할 수 있었던 상대가 있었는지, 있었다면 언제였는지 떠올려 보세요. 그 대화가 한 달 안이었는지 그보다 오래전이었는지도 함께 확인해 보세요. 간격이 넓을수록 체감은 더 큽니다.",
      "Recall whether there was anyone you could say it plainly to, and when. Check whether that conversation was within the last month or longer ago — the wider the gap, the heavier it tends to feel.",
    ),
    action: n(
      "이번 주에 한 사람에게 안부가 아니라 근황을 조금 더 구체적으로 전해 보세요. 깊이는 대개 이렇게 시작됩니다. 예를 들어 요즘 무슨 생각을 하며 지내는지 한두 문장만 덧붙여도 대화의 결이 달라집니다.",
      "Tell one person something slightly more specific than how you are. Depth usually starts there. For example, adding just one or two sentences about what has been on your mind lately changes the texture of the conversation.",
    ),
    caution: n(
      "혼자 있는 시간이 힘들어 견디기 어렵다면 정신건강 상담전화(1577-0199)에 연락해 보셔도 됩니다. 무료이고 익명입니다. 특히 그런 시간이 2주 넘게 이어지거나 아무것도 하고 싶지 않은 상태까지 간다면 더 미루지 말고 연락해 보세요.",
      "If being alone has become hard to bear, a counselling line is available, free and anonymous. In particular, if that state has lasted more than two weeks or has moved into not wanting to do anything at all, reach out without waiting longer.",
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
      "외모에 대한 고민은 대개 외모 자체보다 비교하는 환경에서 커집니다. 무엇을 보고 있는지가 크게 작용합니다. 예를 들어 특정 SNS 앱을 하루 한 시간 넘게 보는 날일수록 이 생각이 더 심해지는 경우가 흔합니다.",
      "Worry about appearance usually grows in the comparison environment more than in the mirror. For example, the thought often intensifies most on days you spend more than an hour on a particular social app.",
    ),
    observe: n(
      "이 생각이 심해지는 시간대와 상황을 일주일만 적어보세요. 특정 앱이나 자리와 겹치는 경우가 많습니다. 잠들기 전이나 사진을 찍은 직후처럼 반복되는 시점이 있는지도 표시해두면 패턴이 더 뚜렷해집니다.",
      "For a week, note when the thought intensifies. It often overlaps with a specific app or setting. Also mark recurring moments, like right before sleep or right after taking photos — the pattern gets clearer that way.",
    ),
    action: n(
      "그 상황 하나만 이번 주에 줄여 보고 차이를 확인하세요. 외모를 바꾸기 전에 환경을 바꾸는 편이 빠릅니다. 예를 들어 그 앱 사용 시간을 하루 30분으로 제한해보고, 일주일 뒤 생각의 빈도가 줄었는지 비교해 보세요.",
      "Reduce that one setting this week and check the difference. Changing the environment is faster. For example, cap that app to 30 minutes a day and compare, a week later, whether the thought comes up less often.",
    ),
    caution: n(
      "시술이나 수술은 되돌리기 어렵습니다. 급하게 결정하지 마시고, 식사나 체중에 대한 생각이 일상을 지배한다면 전문 상담을 받으시는 편이 안전합니다. 특히 하루 대부분의 시간을 외모 생각으로 보내거나 먹는 것을 두려워하게 되었다면, 이는 습관이 아니라 진료가 필요한 신호일 수 있습니다.",
      "Procedures are hard to reverse — do not decide in a rush. If thoughts about eating or weight dominate the day, seek specialist help. In particular, spending most of the day preoccupied with appearance, or becoming afraid of eating, can be a sign needing clinical care rather than a habit issue.",
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
      "믿음의 옳고 그름은 이 리포트가 판단할 일이 아닙니다. 다만 그 선택이 지금 생활에 어떻게 작용하는지는 볼 수 있습니다. 예를 들어 그 활동에 쓰는 시간이나 비용이 한 달 전보다 크게 늘었는지를 보면 작용 방향을 가늠할 수 있습니다.",
      "This report does not rule on belief. It can look at how the choice is working in your daily life. For example, checking whether the time or money spent on it has grown sharply compared with a month ago gives a sense of the direction.",
    ),
    observe: n(
      "그 활동 뒤에 마음이 가벼워지는지, 부담이 늘어나는지를 몇 주간 기록해 보세요. 가족이나 가까운 사람과의 관계가 그 활동 이후로 더 편해졌는지 불편해졌는지도 함께 살펴보세요.",
      "For a few weeks, note whether you feel lighter or more burdened afterwards. Also note whether your relationships with family or close people have grown easier or more strained since starting.",
    ),
    action: n(
      "지금 참여 정도를 그대로 두고 한 달만 관찰해 보세요. 늘리거나 줄이는 결정은 그 뒤가 낫습니다. 그 사이 참여 시간과 지출을 간단히 적어두면 한 달 뒤 결정할 때 감정이 아니라 기록으로 판단할 수 있습니다.",
      "Hold the current level for a month and observe. Increasing or decreasing is better decided after. Jot down the time and spending involved during that month, so the decision afterward rests on a record rather than a feeling.",
    ),
    caution: n(
      "헌금이나 재산을 요구하거나, 가족·직장과 끊으라고 하거나, 나가지 못하게 하는 곳은 위험 신호입니다. 그런 경우 외부에 알리세요. 탈퇴 의사를 밝혔을 때 위협하거나 개인정보를 공개하겠다고 압박한다면 즉시 경찰이나 관련 상담 기관에 알리세요.",
      "Demands for money or property, cutting you off from family or work, or preventing you from leaving are warning signs. Tell someone outside. If expressing an intent to leave is met with threats or pressure to expose personal information, report it to the police or a relevant counselling body right away.",
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
      "지역 선택은 집값이나 인프라보다 그곳에서 아는 사람이 있는지가 만족도를 더 크게 좌우합니다. 예를 들어 집값이 비슷한 두 지역이라도 아는 사람이 있는 쪽의 정착 만족도가 훨씬 높게 나타납니다.",
      "Satisfaction with a place depends on knowing people there more than on prices or amenities. For example, between two areas with similar housing costs, the one where you already know people tends to show much higher settling satisfaction.",
    ),
    observe: n(
      "후보 지역에 아는 사람이 몇 명인지, 없다면 사람을 만날 수 있는 장소가 있는지 확인해 보세요. 직장이나 동호회, 지역 커뮤니티 모임처럼 정기적으로 갈 수 있는 곳이 있는지도 함께 확인해 보세요.",
      "Count who you know there, and if nobody, whether there is any place to meet people. Also check whether there is somewhere to go regularly, like work, a club, or a local community group.",
    ),
    action: n(
      "결정 전에 그 지역에서 평범한 주말을 한 번 보내 보세요. 여행이 아니라 생활 동선으로요. 마트에서 장을 보거나 대중교통으로 출퇴근 동선을 걸어보는 식으로, 실제 살 때의 하루를 그대로 재현해보세요.",
      "Spend one ordinary weekend there before deciding — as living, not as a trip. Try grocery shopping at a local store or walking the commute route by transit — recreate an actual day of living there, not sightseeing.",
    ),
    caution: n(
      "직장이 함께 정해지지 않은 이주는 생활비 계산이 특히 중요합니다. 최소 6개월치 여유를 두세요. 이사, 보증금, 초기 정착 비용까지 더하면 생각보다 큰 금액이 나오므로 이주 전에 총액을 미리 뽑아보세요.",
      "Moving without work settled makes the cost calculation critical. Keep six months of room. Add moving costs, a deposit, and initial settling expenses, and the total often comes out larger than expected, so calculate it before you move.",
    ),
    patterns: [/지방으로|서울로|고향으로|귀농|귀촌|정착|이 지역/u, /move to another city|settle down where/i],
  },
];
