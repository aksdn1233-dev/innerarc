import { n, type ConcernTopic } from "./topic-types";

// Ordered before the generic argument topic, which would otherwise swallow anything
// mentioning friction with a specific person.
export const RELATIONSHIP_EXTRA_TOPICS: readonly ConcernTopic[] = [
  {
    id: "infidelity",
    focus: "relationships",
    label: n("외도 의심", "Suspecting an affair"),
    verdict: n(
      "의심을 안고 유지하는 상태가 관계를 가장 빨리 깎습니다. 확인할지 말지를 먼저 정하셔야 합니다. 알게 된 뒤 어떻게 할지 답이 없다면 지금은 확인하지 않는 편이 낫습니다.",
      "Holding the suspicion erodes it fastest. Decide whether to settle it; without an answer for what you would do, not now.",
    ),
    framing: n(
      "의심은 확인되기 전까지 관계를 계속 깎습니다. 상징으로 사실을 판정할 수는 없고, 확인할지 말지는 정할 수 있습니다. 확인을 미루는 기간이 두세 달을 넘기면 불안이 신뢰보다 관계의 기본값으로 자리 잡는 경우가 많습니다.",
      "Suspicion erodes the relationship until it is settled. Symbolism cannot rule on fact, but you can decide whether to settle it. If confirming it is put off past two or three months, anxiety often settles in as the relationship's default instead of trust.",
    ),
    observe: n(
      "의심이 시작된 시점과 그 뒤 실제로 달라진 행동을 사실만 적어보세요. 감정과 사실을 나눠 적는 것만으로도 판단이 선명해집니다. 휴대폰을 뒤집어 두는 빈도, 야근이나 외근이 늘어난 횟수, 연락 텀이 길어진 정도처럼 구체적인 항목으로 나눠 기록하세요.",
      "Write when the suspicion began and what behaviour actually changed, as fact only. Separating fact from feeling clears the view. Break it into concrete items: how often the phone gets turned face down, how many more late nights or off-site trips there have been, how much longer the gaps between messages have grown.",
    ),
    action: n(
      "추적하거나 몰래 확인하기 전에, 무엇을 알게 되면 어떻게 할 것인지 스스로 먼저 답해 보세요. 그 답이 없으면 확인은 고통만 남깁니다. 직접 물어보는 방법과 몰래 확인하는 방법 중 어느 쪽이 관계를 덜 해치는지, 그리고 각각 실패했을 때 되돌릴 수 있는지도 함께 따져보세요.",
      "Before checking anything covertly, answer what you would do with the answer. Without that, confirming only adds pain. Also weigh which does less damage, asking directly or checking covertly, and whether each option is reversible if it goes wrong.",
    ),
    caution: n(
      "상대의 휴대폰이나 위치를 몰래 확인하는 것은 법적 문제가 될 수 있습니다. 증거가 필요하다면 변호사와 먼저 상의하세요. 동의 없는 위치추적 앱 설치나 문자 도청은 형법상 처벌 대상이 될 수 있으므로 그 방법은 피하세요.",
      "Covertly accessing a phone or location can be unlawful. If evidence matters, speak to a lawyer first. Installing a location-tracking app or intercepting messages without consent can be a criminal offense, so avoid those methods.",
    ),
    patterns: [/외도|바람을?|불륜|의심이 되|다른 사람이 생긴/u, /affair|cheating|unfaithful/i],
  },
  {
    id: "family_objection",
    focus: "relationships",
    label: n("집안 반대", "Family objection"),
    verdict: n(
      "반대가 있어도 진행 가능한 관계입니다. 다만 설득을 반복하면 길어집니다. 둘이 먼저 시기를 정하면 대화의 성격이 바뀝니다.",
      "This can proceed despite objection. Repeating the persuasion prolongs it; agreeing a timeline between you changes the conversation.",
    ),
    framing: n(
      "반대는 상대에 대한 평가일 때도 있지만, 부모 자신의 불안일 때가 더 많습니다. 어느 쪽인지에 따라 대응이 완전히 달라집니다. 예를 들어 경제적 조건을 문제 삼는다면 평가에 가깝고, 학력이나 집안을 반복해서 언급한다면 체면이나 불안에 가깝습니다.",
      "Objection is sometimes about the person and more often about the parent's own anxiety. Which it is changes everything. For example, objecting to financial conditions leans toward a judgment of the person, while repeatedly citing education or family background leans toward the parent's own anxiety or sense of appearance.",
    ),
    observe: n(
      "반대 이유로 실제로 들은 말을 그대로 적어보세요. 조건 이야기인지, 안전 이야기인지, 체면 이야기인지가 구분됩니다. 같은 이유를 세 번 이상 반복해서 듣고 있다면, 그 이유가 진짜 핵심이 아닐 가능성이 큽니다.",
      "Write the stated reasons verbatim. Conditions, safety, and appearances separate quickly on paper. If you have heard the same reason three or more times, it is likely not the real core issue.",
    ),
    action: n(
      "설득을 반복하기보다, 둘이 먼저 시간표를 정하세요. 언제까지 어떻게 할지가 정해지면 대화의 성격이 달라집니다. 예를 들어 상견례나 인사 자리를 6개월 안에 잡는 식으로 구체적인 날짜를 먼저 정하고 부모님께 알리세요.",
      "Rather than persuading again, agree a timeline between the two of you first. It changes the conversation. For example, set a concrete date first, such as arranging the formal family meeting within six months, and then tell your parents.",
    ),
    caution: n(
      "반대를 이유로 관계를 숨기면 나중에 더 큰 문제가 됩니다. 폭력이나 협박이 있다면 그건 반대가 아니라 안전 문제입니다. 숨기는 기간이 길어질수록 나중에 알려졌을 때 반대의 강도는 더 세지는 경향이 있습니다.",
      "Hiding the relationship makes it worse later. If there is violence or threat, that is safety, not objection. The longer it stays hidden, the stronger the objection tends to be once it is finally discovered.",
    ),
    patterns: [/집안 반대|부모님이 반대|결혼을? 반대|허락을? 안/u, /family objects|parents disapprove/i],
  },
  {
    id: "long_distance",
    focus: "relationships",
    label: n("장거리", "Long distance"),
    verdict: n(
      "장거리는 유지 가능합니다. 다만 마음보다 다음 만날 날짜가 관계를 지탱합니다. 언제까지 떨어져 있을지 정해두면 훨씬 안정됩니다.",
      "Distance is sustainable, held by the next date rather than by feeling. Naming an end to it steadies things.",
    ),
    framing: n(
      "장거리는 마음보다 일정과 비용에서 무너지는 경우가 많습니다. 언제 만날 수 있는지가 실제로 관계를 지탱합니다. 월 1회 이상 만남이 유지되는지가 하나의 기준이 될 수 있고, 그 아래로 떨어지면 관계가 급격히 흔들리는 경우가 많습니다.",
      "Distance usually breaks on schedule and cost before it breaks on feeling. When you can next meet is what holds it. Meeting at least once a month can serve as one benchmark, and falling below that often shakes the relationship sharply.",
    ),
    observe: n(
      "최근 3개월 동안 실제로 만난 횟수와, 그때마다 든 시간·비용을 적어보세요. 지속 가능한지가 숫자로 보입니다. 이동 시간이 편도 3시간을 넘는다면 월 교통비와 체력 소모까지 함께 계산해야 실제 부담이 드러납니다.",
      "Count meetings in the last three months and what each cost in time and money. Sustainability shows in the numbers. If travel takes more than three hours one way, factor in the monthly transport cost and physical toll to see the real burden.",
    ),
    action: n(
      "다음 만남 날짜를 지금 하나 정해 두세요. 다음이 정해져 있는지 여부가 장거리에서는 크게 작용합니다. 매주 정해진 요일과 시간에 통화나 영상통화를 하는 규칙을 만들면 만남 사이의 공백이 줄어듭니다.",
      "Fix the next date now. Having a next one matters more at distance than anywhere else. Set a fixed day and time each week for a call or video chat; that shrinks the gap between visits.",
    ),
    caution: n(
      "언제까지 떨어져 있을지 정하지 않으면 대개 지칩니다. 끝나는 시점이 없는 장거리는 계획이 아니라 상태입니다. 1년 넘게 끝나는 시점을 계속 미루고 있다면, 지금이 그 기한을 다시 논의할 때입니다.",
      "Without an end date it usually wears out. Distance with no horizon is a condition, not a plan. If the end date has been pushed back repeatedly for over a year, now is the time to renegotiate it directly.",
    ),
    patterns: [/장거리|멀리 있|주말 부부|떨어져 지내|유학 간 남자|군대 간 남자/u, /long distance/i],
  },
  {
    id: "staleness",
    focus: "relationships",
    label: n("권태기", "A flat stretch"),
    verdict: n(
      "관계가 끝난 신호는 아닙니다. 설렘이 주는 것은 자연스럽고, 대화와 존중이 함께 줄었는지가 실제 기준입니다. 상황을 바꾸면 회복됩니다.",
      "This is not the end signal. Excitement fading is ordinary; whether conversation and respect faded with it is the real test.",
    ),
    framing: n(
      "설렘이 줄어드는 것 자체는 문제가 아닙니다. 문제가 되는 것은 대화와 존중까지 함께 줄었을 때입니다. 예를 들어 하루 대화 시간이 10분 미만으로 줄었거나 서로의 하루를 묻지 않게 되었다면 그것이 실제 신호입니다.",
      "Excitement fading is not the problem. It becomes one when conversation and respect fade with it. For example, if daily conversation has dropped below ten minutes or you have stopped asking about each other's day, that is the real signal.",
    ),
    observe: n(
      "최근 한 달 중 둘이 웃었던 순간과 서로 고마웠던 일을 각각 세 개씩 떠올려 보세요. 잘 떠오르지 않는 쪽이 지금 부족한 것입니다. 두 목록 모두 30초 안에 채우기 어렵다면, 권태보다 더 깊은 피로나 무관심이 쌓였을 가능성을 봐야 합니다.",
      "Recall three moments of laughter and three of gratitude this month. The one that is hard to fill is what is short. If neither list fills within thirty seconds, consider that something deeper than staleness, like fatigue or disengagement, may have built up.",
    ),
    action: n(
      "이번 주에 평소와 다른 일 하나를 함께 해보세요. 대화 주제를 바꾸는 것보다 상황을 바꾸는 편이 쉽습니다. 새로운 취미보다는 예전에 둘이 함께 좋아했던 활동을 하나 다시 해보는 편이 재현하기 쉽습니다.",
      "Do one unfamiliar thing together this week. Changing the setting is easier than changing the subject. Reviving one activity you both used to enjoy together tends to be easier to recreate than starting a brand-new hobby.",
    ),
    caution: n(
      "권태를 이유로 성급하게 결론 내리기 전에, 최근 각자의 피로도와 일 상황을 먼저 보세요. 관계 문제로 보이는 것이 소진일 때가 많습니다. 최근 두세 달 사이 야근이나 이직, 가족 문제 같은 외부 스트레스가 늘었는지부터 점검하세요.",
      "Before concluding, look at how tired each of you is. What looks like the relationship is often depletion. First check whether outside stress, like overtime, a job change, or family issues, has increased over the last two or three months.",
    ),
    patterns: [/권태|설렘이 없|무덤덤|익숙해져서|지루해졌/u, /stale|lost the spark|boring relationship/i],
  },
  {
    id: "cohabitation",
    focus: "relationships",
    label: n("동거", "Living together"),
    verdict: n(
      "같이 살아도 되는 관계입니다. 다만 성격보다 생활 습관에서 부딪힙니다. 생활비와 집안일을 숫자로 정해두면 대부분 예방됩니다.",
      "Living together is workable. Habits clash before character does; settling money and chores in numbers prevents most of it.",
    ),
    framing: n(
      "함께 살면 성격보다 생활 습관이 훨씬 크게 드러납니다. 청소, 소음, 돈, 손님이 실제 쟁점입니다. 동거 첫 3개월 안에 겪는 마찰의 대부분이 이 네 가지 중 하나에서 시작됩니다.",
      "Living together exposes habits far more than character. Cleaning, noise, money, and guests are the real subjects. Most friction in the first three months of living together starts from one of these four things.",
    ),
    observe: n(
      "각자 절대 양보하기 어려운 생활 습관을 두 가지씩 적어 서로 보여주세요. 대개 예상과 다릅니다. 기상 시간, 청소 주기, 손님 초대 빈도처럼 구체적인 항목으로 나눠 적으면 차이가 더 분명해집니다.",
      "Each write two habits you cannot compromise on and swap the lists. They are rarely what the other expected. Breaking it into concrete items, wake-up time, cleaning frequency, how often guests come over, makes the gap clearer.",
    ),
    action: n(
      "생활비 분담과 집안일 분담을 시작 전에 숫자로 정해 두세요. 시작한 뒤 정하면 감정이 섞입니다. 예를 들어 월세와 공과금을 소득 비율로 나눌지 반반으로 나눌지부터 먼저 합의하세요.",
      "Set the money and chore split in numbers before moving in. Settling it afterwards mixes in feeling. For example, first agree whether rent and utilities split by income ratio or evenly down the middle.",
    ),
    caution: n(
      "계약 명의와 보증금 부담을 한쪽만 지면 헤어질 때 분쟁이 됩니다. 부담 비율을 문서로 남기세요. 보증금을 한쪽이 전액 냈다면, 헤어질 때 돌려받을 금액과 방식을 미리 문자로라도 정해 두세요.",
      "If one name and one deposit carry it all, ending it becomes a dispute. Put the shares in writing. If one person paid the entire deposit, settle in advance, even just in a text message, how much comes back and how if you separate.",
    ),
    patterns: [/동거|같이 살|합칠까|살림을? 합/u, /move in together|cohabit/i],
  },
  {
    id: "remarriage",
    focus: "relationships",
    label: n("재혼·재혼가정", "Remarriage"),
    verdict: n(
      "재혼은 가능한 조건입니다. 다만 두 사람만의 문제가 아니라 아이와 양가까지 포함된 조정입니다. 속도를 늦추는 쪽이 거의 항상 유리합니다.",
      "Remarriage is workable, but it adjusts more than two people. Going slower almost always helps.",
    ),
    framing: n(
      "재혼은 두 사람만의 문제가 아니라 아이와 양가까지 포함된 조정입니다. 속도를 늦추는 것이 거의 항상 유리합니다. 아이가 있다면 최소 6개월에서 1년 정도 함께 지내는 시간을 가진 뒤 결정하는 편이 안정적입니다.",
      "Remarriage adjusts more than two people. Going slower almost always helps. If there are children, having at least six months to a year of time together before deciding tends to be more stable.",
    ),
    observe: n(
      "아이가 있다면 아이가 지금 상황을 어떻게 이해하고 있는지 확인해 보세요. 어른의 결정보다 아이의 이해가 늦습니다. 아이가 새로운 사람을 어떻게 부르고 싶어 하는지, 함께 있는 시간을 편하게 느끼는지 직접 물어서 확인하세요.",
      "If there are children, check what they currently understand. Their understanding lags the adults' decision. Ask directly what the child wants to call the new person and whether they feel comfortable in shared time together.",
    ),
    action: n(
      "새로운 역할을 서두르지 말고, 아이와는 부모 역할이 아니라 편한 어른으로 시작하는 시간을 충분히 두세요. 훈육이나 규칙을 정하는 역할은 친부모가 맡고, 새 배우자는 관계가 안정된 뒤에 서서히 나눠 맡는 순서가 낫습니다.",
      "Do not rush the new role. Start as a trusted adult rather than a parent and allow that time. Let the biological parent keep discipline and rules at first, and have the new spouse take on that role gradually once the relationship is stable.",
    ),
    caution: n(
      "양육비, 재산, 상속은 감정과 분리해 법적으로 확인하세요. 나중에 가장 자주 분쟁이 되는 지점입니다. 재혼 전 각자 명의의 재산과 빚을 목록으로 정리해두면 이후 분쟁 소지가 크게 줄어듭니다.",
      "Support payments, property, and inheritance need legal clarity apart from feeling. That is where disputes land. Listing each person's assets and debts by name before remarrying substantially reduces the chance of later disputes.",
    ),
    patterns: [/재혼|새아빠|새엄마|의붓|전 배우자|양육비/u, /remarriage|stepfamily|stepchild/i],
  },
  {
    id: "siblings",
    focus: "relationships",
    label: n("형제자매", "Siblings"),
    verdict: n(
      "형제 관계는 다시 정할 수 있습니다. 어린 시절의 역할이 그대로 남아 있는 것이 원인인 경우가 많습니다. 역할과 비용을 나누면 달라집니다.",
      "This can be renegotiated. Childhood roles still running is the usual cause; splitting roles and costs changes it.",
    ),
    framing: n(
      "형제 문제는 대개 어린 시절의 역할이 어른이 되어서도 유지되는 데서 옵니다. 지금의 관계를 다시 정하는 편이 낫습니다. 맏이가 계속 결정을 도맡거나 막내가 계속 열외로 빠지는 구도가 그대로라면, 부담이 한쪽으로 쏠릴 수밖에 없습니다.",
      "Trouble between siblings usually comes from childhood roles that never got renegotiated. If the oldest still makes every decision or the youngest is still left out by default, the burden inevitably tilts to one side.",
    ),
    observe: n(
      "최근 부담을 느낀 일에서 누가 결정하고 누가 실행했는지 적어보세요. 어릴 때 구도가 그대로 남아 있는 경우가 많습니다. 지난 1년간 부모님 관련 지출이나 방문을 누가 몇 번 맡았는지 세어보면 불균형이 숫자로 드러납니다.",
      "For a recent burden, write who decided and who did it. The old arrangement is often still running. Counting who handled parent-related costs or visits, and how many times, over the past year makes the imbalance visible in numbers.",
    ),
    action: n(
      "부모 관련한 일이라면 형제끼리 먼저 역할과 비용을 나눠 정하세요. 부모를 사이에 두면 대개 갈등이 커집니다. 예를 들어 병원 동행은 한 명, 생활비 지원은 나머지가 나눠 맡는 식으로 역할을 구체적으로 쪼개세요.",
      "If it concerns a parent, split roles and costs between siblings first. Routing it through the parent enlarges it. For example, split roles concretely, one sibling handling hospital visits while the others share living-cost support.",
    ),
    caution: n(
      "돈이 오간 일은 액수와 조건을 기록해 두세요. 가족 사이일수록 기록이 관계를 지킵니다. 구두 약속만으로 큰 금액이 오가면 나중에 기억이 서로 달라 다툼으로 번지기 쉽습니다.",
      "Record any money that moves, with amounts and terms. Records protect family relationships specifically. When a large amount changes hands on a verbal promise alone, differing memories later can easily turn into a dispute.",
    ),
    patterns: [/형제|자매|남동생|여동생|오빠|누나|언니|형이랑/u, /sibling|brother|sister/i],
  },
  {
    id: "family_money",
    focus: "money",
    label: n("가족 간 돈", "Money inside the family"),
    verdict: n(
      "회복 가능한 관계입니다. 다만 액수보다 조건이 없다는 점이 문제를 만듭니다. 빌려준 것인지 준 것인지부터 정하면 정리됩니다.",
      "The relationship is recoverable. The absence of terms causes this, not the amount; deciding loan or gift settles it.",
    ),
    framing: n(
      "가족 간 돈은 액수보다 조건이 없다는 점에서 문제가 됩니다. 빌려준 것인지 준 것인지부터 정해야 합니다. 상환 기한을 정하지 않은 채 몇 년이 지나면, 빌려준 쪽과 받은 쪽의 기억이 서로 달라지는 경우가 흔합니다.",
      "Money inside a family goes wrong for lack of terms rather than size. Decide first whether it is a loan or a gift. When years pass without a set repayment date, the lender's and the borrower's memories of the deal commonly diverge.",
    ),
    observe: n(
      "지금까지 오간 돈을 날짜와 금액으로 적어보세요. 기억으로 다투면 관계가 먼저 상합니다. 문자나 계좌이체 내역처럼 남아 있는 기록부터 먼저 모아두면 이후 대화에서 근거로 쓸 수 있습니다.",
      "List what has moved, with dates and amounts. Arguing from memory damages the relationship first. Gather what records already exist, like texts or bank transfer history, first so you have something to work from in the conversation.",
    ),
    action: n(
      "앞으로 오갈 돈은 금액·상환 여부·기한을 문자로라도 남기세요. 차용증이 부담스러우면 메시지 한 줄이라도 낫습니다. 금액이 500만원을 넘는다면 간단한 차용증이라도 작성해 서명을 받아두는 편이 분쟁을 줄입니다.",
      "For anything ahead, put amount, repayment, and date in writing — even a message beats nothing. For amounts over roughly five million won, drafting even a simple loan note with a signature reduces the risk of later disputes.",
    ),
    caution: n(
      "보증은 빌려주는 것보다 위험합니다. 갚을 수 없는 금액의 보증은 서지 마세요. 보증을 선 뒤 상대가 갚지 못하면 보증인이 전액을 대신 갚아야 하고, 신용에도 함께 영향이 갑니다.",
      "Guaranteeing a loan is riskier than lending. Do not guarantee what you could not repay yourself. If you guarantee a loan and the borrower cannot repay, you owe the full amount yourself, and it affects your own credit too.",
    ),
    // The person and the money can sit several words apart — "가족한테 돈을 빌려줬는데"
    // — so the two are matched near each other rather than adjacent.
    patterns: [
      /(가족|부모님|형제|자매|누나|언니|동생|오빠|형)[^.。]{0,12}(돈|빌려|빌린)/u,
      /보증을? 서|가족 간 돈/u,
      /lend to family|family loan/i,
    ],
  },
  {
    id: "caregiving",
    focus: "relationships",
    label: n("부모 간병", "Caring for a parent"),
    verdict: n(
      "지금 방식으로는 오래 못 갑니다. 간병은 혼자 감당하는 구조에서 대부분 무너집니다. 쓸 수 있는 제도를 확인하는 것이 가장 빠른 해결입니다.",
      "The current arrangement will not last. Care collapses when it rests on one person; checking available services is the fastest fix.",
    ),
    framing: n(
      "간병은 오래 가는 일이라 혼자 감당하는 구조가 되면 대부분 무너집니다. 분담과 제도를 먼저 보세요. 평균 간병 기간이 수년 단위로 이어지는 경우가 많아, 초반의 각오만으로는 끝까지 버티기 어렵습니다.",
      "Care lasts, so any arrangement resting on one person usually collapses. Look at sharing and at services first. Care often continues for years, not months, so early determination alone is usually not enough to sustain it to the end.",
    ),
    observe: n(
      "일주일 동안 간병에 쓰는 시간과, 그중 다른 사람이나 서비스가 대신할 수 있는 부분을 나눠 적어보세요. 하루 중 수면이 끊기는 시간대와 횟수도 함께 기록하면, 본인의 소진 정도를 더 정확히 볼 수 있습니다.",
      "Log a week of care hours and mark which parts someone else or a service could take. Also log when and how often sleep gets interrupted during the day; it gives a clearer picture of your own depletion.",
    ),
    action: n(
      "장기요양보험 등급 신청이나 지역 노인복지센터 상담을 알아보세요. 쓸 수 있는 제도를 모르고 버티는 경우가 많습니다. 국민건강보험공단에 장기요양등급 신청을 하면 방문요양이나 주야간보호 같은 서비스를 이용할 수 있습니다.",
      "Look into long-term care assessment and local services. Many carry it alone simply not knowing what exists. Applying for long-term care grading through the National Health Insurance Service opens access to services like home visits or day care.",
    ),
    caution: n(
      "치료나 투약 판단은 의료진의 영역입니다. 그리고 돌보는 사람의 건강이 무너지면 돌봄도 함께 멈춥니다. 간병 스트레스로 인한 우울이나 번아웃 증상이 2주 이상 지속되면 본인도 상담이나 진료를 받아야 합니다.",
      "Treatment decisions belong to clinicians. And when the carer's health goes, the care stops with it. If caregiver stress brings on depression or burnout symptoms lasting more than two weeks, you need counseling or care yourself too.",
    ),
    patterns: [/간병|요양|부모님이 편찮|치매|돌봄|병간호/u, /caregiving|nursing a parent|dementia/i],
  },
  {
    id: "pet",
    focus: "relationships",
    label: n("반려동물", "A pet"),
    verdict: n(
      "함께 지내는 데 무리는 없습니다. 다만 동물의 마음보다 사람의 일정과 비용이 실제 변수입니다. 혼자 두는 시간이 기준이 됩니다.",
      "This is workable. Your schedule and budget are the real variables, and hours left alone is the measure.",
    ),
    framing: n(
      "반려동물 문제는 대개 사람의 일정과 비용에서 시작됩니다. 동물의 마음을 읽기보다 조건을 보는 편이 실제로 도움이 됩니다. 예를 들어 하루 8시간 이상 혼자 두는 날이 잦다면, 마음보다 그 조건 자체를 먼저 바꿔야 합니다.",
      "Questions about a pet usually start in the person's schedule and budget. Conditions help more than reading an animal's mind. For example, if the animal is left alone eight or more hours a day on most days, that condition itself needs to change before anything else.",
    ),
    observe: n(
      "하루 중 혼자 있는 시간, 산책이나 돌봄에 실제로 쓰는 시간, 월 고정비를 적어보세요. 사료비, 병원비, 미용비를 따로 나눠 적으면 예상보다 큰 항목이 어디인지 드러납니다.",
      "Write the hours alone, the hours actually spent on care, and the monthly cost. Break out food, vet, and grooming costs separately; it reveals which item runs bigger than expected.",
    ),
    action: n(
      "행동 문제가 있다면 이번 달에 수의사 진료를 먼저 받으세요. 통증이 원인인 경우가 생각보다 많습니다. 입양이나 분양을 고민 중이라면, 최소 10년 이상 책임질 수 있는 상황인지 먼저 따져보세요.",
      "If behaviour is the issue, see a vet first this month. Pain is a more common cause than people expect. If you are considering adopting, first check whether you can realistically commit for at least ten years or more.",
    ),
    caution: n(
      "동물의 수명이나 병세를 예측해 드릴 수는 없습니다. 건강 문제는 수의사에게 확인하세요. 식욕이나 배변 습관이 갑자기 바뀌었다면 미루지 말고 빠르게 병원 진료를 받아야 합니다.",
      "No lifespan or prognosis can be told here. Health belongs to a vet. If appetite or bathroom habits change suddenly, do not delay — get a vet exam promptly.",
    ),
    patterns: [/반려동물|강아지|고양이|반려견|반려묘|입양할까/u, /my dog|my cat|pet/i],
  },
  {
    id: "divorce",
    focus: "relationships",
    label: n("이혼", "Divorce"),
    verdict: n(
      "이혼은 실패가 아니라 하나의 결정입니다. 감정보다 재산·양육·거주가 정리 순서를 정하고, 그 순서대로 밟으면 관계보다 절차가 먼저 안정됩니다.",
      "Divorce is a decision, not a failure. Property, custody, and housing set the order this settles in, and following that order steadies the process before it steadies the feeling.",
    ),
    framing: n(
      "이혼은 감정이 정리된 뒤에 절차를 밟는 게 아니라, 절차를 밟는 동안 감정이 정리되는 경우가 더 많습니다. 순서를 먼저 정하는 편이 낫습니다.",
      "Divorce rarely waits for feeling to settle before the process starts — more often the process is what settles the feeling. Deciding the order first helps.",
    ),
    observe: n(
      "재산, 양육권, 거주지, 생활비 네 가지 중 아직 말로 확인하지 않은 것이 무엇인지 짚어보세요. 감정 문제로 보이는 갈등이 실은 이 네 가지 중 하나인 경우가 많습니다.",
      "Check which of property, custody, housing, and living costs has not yet been discussed out loud. What looks like an emotional conflict is often one of these four.",
    ),
    action: n(
      "협의가 어렵다면 법률구조공단이나 가정법률상담소에서 이혼 절차 상담을 먼저 받아보세요. 무료이고, 감정적 대화 전에 기준을 알면 대화가 쉬워집니다.",
      "If agreement is hard, get a procedural consultation from legal aid or a family-law counselling service first. It is free, and knowing the framework beforehand makes the conversation easier.",
    ),
    caution: n(
      "아이가 있다면 아이 앞에서 상대를 비난하는 것이 아이에게 가장 큰 상처로 남습니다. 재산분할과 양육비는 감정과 분리해 서면으로 확정하세요.",
      "If there are children, criticizing the other parent in front of them leaves the deepest damage. Settle property division and support payments in writing, apart from feeling.",
    ),
    patterns: [/이혼|이혼하고 싶|이혼\s?소송|이혼\s?절차|황혼이혼|졸혼/u, /divorce|divorcing/i],
  },
  {
    id: "pregnancy_fertility",
    focus: "relationships",
    label: n("임신·난임", "Pregnancy and fertility"),
    verdict: n(
      "지금 시도를 이어갈 이유는 있습니다. 다만 나이나 마음가짐보다 실제 검사 수치가 다음 단계를 정합니다. 병원에서 수치를 확인한 뒤 방법을 정하는 순서가 맞습니다.",
      "There is reason to continue trying. What decides the next step is the actual test results, not age or mindset alone — get the numbers from a clinic before choosing a method.",
    ),
    framing: n(
      "난임은 마음가짐의 문제가 아니라 대부분 신체적 조건의 문제입니다. 자책하기보다 검사로 원인을 좁히는 쪽이 실제로 다음 단계를 정해줍니다.",
      "Fertility difficulty is mostly a physical matter, not a mindset one. Narrowing the cause through testing, rather than self-blame, is what actually sets the next step.",
    ),
    observe: n(
      "지금까지 받은 검사와 아직 받지 않은 검사를 각각 적어보세요. 두 사람 모두의 검사가 끝나지 않았다면, 다음 단계를 정하기엔 아직 이릅니다.",
      "List the tests already done and the ones not yet done. If both partners' testing is not complete, it is too early to decide the next step.",
    ),
    action: n(
      "다음 진료에서 지금 방법을 계속할지 다음 단계로 넘어갈지, 의사에게 예상 기간과 비용을 구체적으로 물어보세요.",
      "At the next appointment, ask the doctor directly for the expected timeline and cost of continuing versus moving to the next stage of treatment.",
    ),
    caution: n(
      "임신 가능 여부나 시기를 알려드릴 수는 없습니다. 이 시기에는 결과보다 서로를 살피는 대화를 더 챙겨야 그 스트레스가 관계 자체를 갉아먹지 않습니다.",
      "This cannot tell you whether or when conception will happen. Prioritizing conversations that check on each other over the outcome, during this stretch, keeps the stress from eroding the relationship itself.",
    ),
    patterns: [
      /임신|난임|시험관|불임|가임력|아이를? 가지려|아기가 생기지/u,
      /pregnan|fertility|trying to conceive|IVF/i,
    ],
  },
];
