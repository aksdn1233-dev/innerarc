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
      "의심은 확인되기 전까지 관계를 계속 깎습니다. 상징으로 사실을 판정할 수는 없고, 확인할지 말지는 정할 수 있습니다.",
      "Suspicion erodes the relationship until it is settled. Symbolism cannot rule on fact, but you can decide whether to settle it.",
    ),
    observe: n(
      "의심이 시작된 시점과 그 뒤 실제로 달라진 행동을 사실만 적어보세요. 감정과 사실을 나눠 적는 것만으로도 판단이 선명해집니다.",
      "Write when the suspicion began and what behaviour actually changed, as fact only. Separating fact from feeling clears the view.",
    ),
    action: n(
      "추적하거나 몰래 확인하기 전에, 무엇을 알게 되면 어떻게 할 것인지 스스로 먼저 답해 보세요. 그 답이 없으면 확인은 고통만 남깁니다.",
      "Before checking anything covertly, answer what you would do with the answer. Without that, confirming only adds pain.",
    ),
    caution: n(
      "상대의 휴대폰이나 위치를 몰래 확인하는 것은 법적 문제가 될 수 있습니다. 증거가 필요하다면 변호사와 먼저 상의하세요.",
      "Covertly accessing a phone or location can be unlawful. If evidence matters, speak to a lawyer first.",
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
      "반대는 상대에 대한 평가일 때도 있지만, 부모 자신의 불안일 때가 더 많습니다. 어느 쪽인지에 따라 대응이 완전히 달라집니다.",
      "Objection is sometimes about the person and more often about the parent's own anxiety. Which it is changes everything.",
    ),
    observe: n(
      "반대 이유로 실제로 들은 말을 그대로 적어보세요. 조건 이야기인지, 안전 이야기인지, 체면 이야기인지가 구분됩니다.",
      "Write the stated reasons verbatim. Conditions, safety, and appearances separate quickly on paper.",
    ),
    action: n(
      "설득을 반복하기보다, 둘이 먼저 시간표를 정하세요. 언제까지 어떻게 할지가 정해지면 대화의 성격이 달라집니다.",
      "Rather than persuading again, agree a timeline between the two of you first. It changes the conversation.",
    ),
    caution: n(
      "반대를 이유로 관계를 숨기면 나중에 더 큰 문제가 됩니다. 폭력이나 협박이 있다면 그건 반대가 아니라 안전 문제입니다.",
      "Hiding the relationship makes it worse later. If there is violence or threat, that is safety, not objection.",
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
      "장거리는 마음보다 일정과 비용에서 무너지는 경우가 많습니다. 언제 만날 수 있는지가 실제로 관계를 지탱합니다.",
      "Distance usually breaks on schedule and cost before it breaks on feeling. When you can next meet is what holds it.",
    ),
    observe: n(
      "최근 3개월 동안 실제로 만난 횟수와, 그때마다 든 시간·비용을 적어보세요. 지속 가능한지가 숫자로 보입니다.",
      "Count meetings in the last three months and what each cost in time and money. Sustainability shows in the numbers.",
    ),
    action: n(
      "다음 만남 날짜를 지금 하나 정해 두세요. 다음이 정해져 있는지 여부가 장거리에서는 크게 작용합니다.",
      "Fix the next date now. Having a next one matters more at distance than anywhere else.",
    ),
    caution: n(
      "언제까지 떨어져 있을지 정하지 않으면 대개 지칩니다. 끝나는 시점이 없는 장거리는 계획이 아니라 상태입니다.",
      "Without an end date it usually wears out. Distance with no horizon is a condition, not a plan.",
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
      "설렘이 줄어드는 것 자체는 문제가 아닙니다. 문제가 되는 것은 대화와 존중까지 함께 줄었을 때입니다.",
      "Excitement fading is not the problem. It becomes one when conversation and respect fade with it.",
    ),
    observe: n(
      "최근 한 달 중 둘이 웃었던 순간과 서로 고마웠던 일을 각각 세 개씩 떠올려 보세요. 잘 떠오르지 않는 쪽이 지금 부족한 것입니다.",
      "Recall three moments of laughter and three of gratitude this month. The one that is hard to fill is what is short.",
    ),
    action: n(
      "이번 주에 평소와 다른 일 하나를 함께 해보세요. 대화 주제를 바꾸는 것보다 상황을 바꾸는 편이 쉽습니다.",
      "Do one unfamiliar thing together this week. Changing the setting is easier than changing the subject.",
    ),
    caution: n(
      "권태를 이유로 성급하게 결론 내리기 전에, 최근 각자의 피로도와 일 상황을 먼저 보세요. 관계 문제로 보이는 것이 소진일 때가 많습니다.",
      "Before concluding, look at how tired each of you is. What looks like the relationship is often depletion.",
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
      "함께 살면 성격보다 생활 습관이 훨씬 크게 드러납니다. 청소, 소음, 돈, 손님이 실제 쟁점입니다.",
      "Living together exposes habits far more than character. Cleaning, noise, money, and guests are the real subjects.",
    ),
    observe: n(
      "각자 절대 양보하기 어려운 생활 습관을 두 가지씩 적어 서로 보여주세요. 대개 예상과 다릅니다.",
      "Each write two habits you cannot compromise on and swap the lists. They are rarely what the other expected.",
    ),
    action: n(
      "생활비 분담과 집안일 분담을 시작 전에 숫자로 정해 두세요. 시작한 뒤 정하면 감정이 섞입니다.",
      "Set the money and chore split in numbers before moving in. Settling it afterwards mixes in feeling.",
    ),
    caution: n(
      "계약 명의와 보증금 부담을 한쪽만 지면 헤어질 때 분쟁이 됩니다. 부담 비율을 문서로 남기세요.",
      "If one name and one deposit carry it all, ending it becomes a dispute. Put the shares in writing.",
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
      "재혼은 두 사람만의 문제가 아니라 아이와 양가까지 포함된 조정입니다. 속도를 늦추는 것이 거의 항상 유리합니다.",
      "Remarriage adjusts more than two people. Going slower almost always helps.",
    ),
    observe: n(
      "아이가 있다면 아이가 지금 상황을 어떻게 이해하고 있는지 확인해 보세요. 어른의 결정보다 아이의 이해가 늦습니다.",
      "If there are children, check what they currently understand. Their understanding lags the adults' decision.",
    ),
    action: n(
      "새로운 역할을 서두르지 말고, 아이와는 부모 역할이 아니라 편한 어른으로 시작하는 시간을 충분히 두세요.",
      "Do not rush the new role. Start as a trusted adult rather than a parent and allow that time.",
    ),
    caution: n(
      "양육비, 재산, 상속은 감정과 분리해 법적으로 확인하세요. 나중에 가장 자주 분쟁이 되는 지점입니다.",
      "Support payments, property, and inheritance need legal clarity apart from feeling. That is where disputes land.",
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
      "형제 문제는 대개 어린 시절의 역할이 어른이 되어서도 유지되는 데서 옵니다. 지금의 관계를 다시 정하는 편이 낫습니다.",
      "Trouble between siblings usually comes from childhood roles that never got renegotiated.",
    ),
    observe: n(
      "최근 부담을 느낀 일에서 누가 결정하고 누가 실행했는지 적어보세요. 어릴 때 구도가 그대로 남아 있는 경우가 많습니다.",
      "For a recent burden, write who decided and who did it. The old arrangement is often still running.",
    ),
    action: n(
      "부모 관련한 일이라면 형제끼리 먼저 역할과 비용을 나눠 정하세요. 부모를 사이에 두면 대개 갈등이 커집니다.",
      "If it concerns a parent, split roles and costs between siblings first. Routing it through the parent enlarges it.",
    ),
    caution: n(
      "돈이 오간 일은 액수와 조건을 기록해 두세요. 가족 사이일수록 기록이 관계를 지킵니다.",
      "Record any money that moves, with amounts and terms. Records protect family relationships specifically.",
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
      "가족 간 돈은 액수보다 조건이 없다는 점에서 문제가 됩니다. 빌려준 것인지 준 것인지부터 정해야 합니다.",
      "Money inside a family goes wrong for lack of terms rather than size. Decide first whether it is a loan or a gift.",
    ),
    observe: n(
      "지금까지 오간 돈을 날짜와 금액으로 적어보세요. 기억으로 다투면 관계가 먼저 상합니다.",
      "List what has moved, with dates and amounts. Arguing from memory damages the relationship first.",
    ),
    action: n(
      "앞으로 오갈 돈은 금액·상환 여부·기한을 문자로라도 남기세요. 차용증이 부담스러우면 메시지 한 줄이라도 낫습니다.",
      "For anything ahead, put amount, repayment, and date in writing — even a message beats nothing.",
    ),
    caution: n(
      "보증은 빌려주는 것보다 위험합니다. 갚을 수 없는 금액의 보증은 서지 마세요.",
      "Guaranteeing a loan is riskier than lending. Do not guarantee what you could not repay yourself.",
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
      "간병은 오래 가는 일이라 혼자 감당하는 구조가 되면 대부분 무너집니다. 분담과 제도를 먼저 보세요.",
      "Care lasts, so any arrangement resting on one person usually collapses. Look at sharing and at services first.",
    ),
    observe: n(
      "일주일 동안 간병에 쓰는 시간과, 그중 다른 사람이나 서비스가 대신할 수 있는 부분을 나눠 적어보세요.",
      "Log a week of care hours and mark which parts someone else or a service could take.",
    ),
    action: n(
      "장기요양보험 등급 신청이나 지역 노인복지센터 상담을 알아보세요. 쓸 수 있는 제도를 모르고 버티는 경우가 많습니다.",
      "Look into long-term care assessment and local services. Many carry it alone simply not knowing what exists.",
    ),
    caution: n(
      "치료나 투약 판단은 의료진의 영역입니다. 그리고 돌보는 사람의 건강이 무너지면 돌봄도 함께 멈춥니다.",
      "Treatment decisions belong to clinicians. And when the carer's health goes, the care stops with it.",
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
      "반려동물 문제는 대개 사람의 일정과 비용에서 시작됩니다. 동물의 마음을 읽기보다 조건을 보는 편이 실제로 도움이 됩니다.",
      "Questions about a pet usually start in the person's schedule and budget. Conditions help more than reading an animal's mind.",
    ),
    observe: n(
      "하루 중 혼자 있는 시간, 산책이나 돌봄에 실제로 쓰는 시간, 월 고정비를 적어보세요.",
      "Write the hours alone, the hours actually spent on care, and the monthly cost.",
    ),
    action: n(
      "행동 문제가 있다면 이번 달에 수의사 진료를 먼저 받으세요. 통증이 원인인 경우가 생각보다 많습니다.",
      "If behaviour is the issue, see a vet first this month. Pain is a more common cause than people expect.",
    ),
    caution: n(
      "동물의 수명이나 병세를 예측해 드릴 수는 없습니다. 건강 문제는 수의사에게 확인하세요.",
      "No lifespan or prognosis can be told here. Health belongs to a vet.",
    ),
    patterns: [/반려동물|강아지|고양이|반려견|반려묘|입양할까/u, /my dog|my cat|pet/i],
  },
];
