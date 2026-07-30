import { n, type ConcernTopic } from "./topic-types";

// Matched before everything else. These situations have a formal channel that works,
// and a reading offered in its place would delay the thing that actually helps.
export const URGENT_TOPICS: readonly ConcernTopic[] = [
  {
    id: "school_violence",
    focus: "relationships",
    label: n("학교폭력", "Bullying at school"),
    escalate: true,
    verdict: n(
      "이건 참아서 끝나는 일이 아니고, 신고하면 실제로 멈출 수 있는 일입니다. 기록을 남기고 알리는 것이 가장 확실한 방법입니다.",
      "This does not end by enduring it, and reporting does stop it. Keeping records and telling someone is the surest route.",
    ),
    framing: n(
      "학교폭력은 참고 견딜 문제가 아니라 신고와 기록으로 다루는 문제입니다. 상징 풀이보다 절차가 훨씬 강력합니다. 신고 접수 후에는 학교폭력대책심의위원회가 열려 사안을 공식적으로 심의하며, 이는 학생 개인이 가해자와 직접 협상하는 것과는 다른 결과를 만듭니다.",
      "Bullying is handled by reporting and records, not by endurance. The formal process is far stronger than any reading. Once a report is filed, a school violence review committee formally examines the case, producing a different outcome than a student negotiating directly with the person responsible.",
    ),
    observe: n(
      "날짜, 장소, 있었던 일, 목격자를 그때그때 적어 두세요. 나중에 이 기록이 가장 큰 힘이 됩니다. 문자, 메신저 대화, 상처나 손상된 물건 사진처럼 남길 수 있는 증거는 날짜가 보이게 캡처해 따로 저장해 두세요.",
      "Write the date, place, what happened, and who saw it, each time. Those records carry the most weight later. Save anything that can be kept as evidence — texts, chat logs, photos of injuries or damaged belongings — with the date visible, stored separately.",
    ),
    action: n(
      "학교 담임이나 상담교사, 학교폭력 신고센터(117)에 알리세요. 혼자 해결하려 하지 않으셔도 됩니다. 117은 문자와 온라인 신고도 가능하며 24시간 운영되므로, 전화가 어려운 상황이면 그쪽을 이용해도 됩니다.",
      "Tell a teacher, the school counsellor, or the national report line. This does not have to be handled alone. The 117 line also takes text and online reports and runs 24 hours a day, so use those channels if calling is not possible.",
    ),
    caution: n(
      "가해 학생과 단둘이 만나 해결하려 하지 마세요. 보호자와 학교가 함께 개입해야 안전합니다. 가해 학생이나 그 보호자가 직접 합의를 요구해 와도 학교나 법률 조력 없이 그 자리에서 서명하거나 약속하지 마세요.",
      "Do not try to settle it alone with the other student. A guardian and the school need to be involved. If the other student or their guardian pushes for a direct settlement, do not sign or promise anything on the spot without the school or legal advice involved.",
    ),
    patterns: [/학교폭력|학폭|왕따|따돌림|괴롭힘을? 당|일진/u, /bullying|bullied at school/i],
  },
  {
    id: "addiction",
    focus: "growth",
    label: n("중독", "Addiction"),
    escalate: true,
    verdict: n(
      "혼자 끊으려다 실패한 것은 의지의 문제가 아닙니다. 치료로 다뤄지는 영역이고, 도움을 받으면 실제로 달라집니다.",
      "Failing to stop alone is not a matter of will. This is treated, and help does change it.",
    ),
    framing: n(
      "중독은 의지의 문제가 아니라 치료의 영역입니다. 혼자 끊으려다 실패한 경험은 실패가 아니라 도움이 필요하다는 신호입니다. 재발은 치료 과정에서 흔히 나타나는 단계이며, 여러 번의 시도 끝에 회복 경로를 찾는 경우가 많습니다.",
      "Addiction is treated, not out-willed. Failing alone is not a personal failure; it is a sign that help is needed. Relapse is a common part of the treatment process, and many people find a path to recovery only after several attempts.",
    ),
    observe: n(
      "언제부터, 얼마나 자주, 어떤 상황에서 늘어났는지 적어 두면 상담이나 진료에서 그대로 쓰입니다. 하루 중 충동이 가장 강해지는 시간대와 그 직전에 있었던 일(스트레스, 혼자 있음, 특정 장소)도 함께 적어 두면 도움이 됩니다.",
      "Note when it began, how often, and what situations increase it. A clinician will use exactly that. Also note the time of day the urge is strongest and what preceded it — stress, being alone, or a specific place — as this helps too.",
    ),
    action: n(
      "도박문제관리센터, 중독관리통합지원센터, 정신건강복지센터(1577-0199) 같은 공적 창구에 먼저 연락하세요. 무료이고 비밀이 지켜집니다. 센터마다 개인 상담 외에 가족 상담이나 집단 프로그램도 운영하므로, 첫 상담에서 어떤 프로그램이 있는지 물어보세요.",
      "Contact a public addiction or mental-health service first. These are free and confidential. Most centers offer family counselling or group programs alongside individual sessions, so ask what is available at the first consultation.",
    ),
    caution: n(
      "빚이 함께 있다면 돈 문제와 중독을 같이 다뤄야 합니다. 한쪽만 정리하면 대개 되돌아옵니다. 빚을 대신 갚아주겠다거나 한 번에 끊게 해주겠다는 사설 업체 광고는 비용만 커지는 경우가 많으니 공공기관 창구를 통해 확인한 뒤 이용하세요.",
      "If debt is involved, both have to be handled together. Fixing only one usually returns. Private services advertising to pay off the debt or promise an instant fix often just add cost, so verify through a public agency before using one.",
    ),
    patterns: [/중독|도박|알코올 의존|술을? 끊|끊지 못|의존증|스마트폰 중독/u, /addiction|gambling|alcoholic/i],
  },
  {
    id: "grief",
    focus: "growth",
    label: n("사별·상실", "Loss and grief"),
    escalate: true,
    verdict: n(
      "지금 느끼는 것은 대부분 자연스러운 반응이고, 회복에 정해진 기간은 없습니다. 앞날을 점치는 것보다 오늘을 넘기는 방법이 필요합니다.",
      "Most of what you feel is an ordinary response, and there is no schedule. Getting through today matters more than reading ahead.",
    ),
    framing: n(
      "상실에는 정해진 회복 기간이 없고, 지금 느끼는 것은 대부분 자연스러운 반응입니다. 앞날을 점치는 것보다 지금을 견디는 방법이 필요합니다. 분노, 무감각, 죄책감처럼 서로 다른 감정이 번갈아 나타나는 것도 흔한 과정 중 하나입니다.",
      "Grief has no schedule, and most of what you feel now is an ordinary response. Getting through today matters more than reading the future. Feelings like anger, numbness, and guilt taking turns is also a common part of the process.",
    ),
    observe: n(
      "잠, 식사, 사람을 만나는 일 중 어떤 것이 가장 어려운지 하나만 살펴보세요. 전부를 한꺼번에 돌보지 않으셔도 됩니다. 두 달이 지나도 잠들기 어렵거나 식사량이 눈에 띄게 줄어든 상태가 이어진다면, 그 변화만 따로 기록해 두세요.",
      "Notice which of sleep, eating, or seeing people is hardest. It does not all need attention at once. If trouble sleeping or a noticeable drop in eating continues past about two months, note that change on its own.",
    ),
    action: n(
      "가까운 사람 한 명에게 지금 상태를 그대로 말해 보세요. 힘들면 정신건강 상담전화(1577-0199)에 연락하셔도 됩니다. 장례 이후 행정 절차(사망신고, 상속, 유족연금 등)는 시간이 걸리므로 한 번에 처리하려 하지 말고 목록을 만들어 하나씩 진행하세요.",
      "Tell one close person how it actually is. A counselling line is there if that feels impossible. Post-funeral paperwork — death registration, inheritance, survivor benefits — takes time, so make a list and work through it one item at a time rather than all at once.",
    ),
    caution: n(
      "떠난 사람의 뜻을 알려준다는 말에 비용을 쓰지 마세요. 회복이 늦어지고 돈만 남습니다. 특히 상실 직후 몇 주 안에 접근해 오는 고가의 상담이나 굿, 부적 권유는 애도 감정을 이용하는 경우가 많으니 더 주의하세요.",
      "Do not pay anyone claiming to relay the wishes of someone who has died. It delays recovery and costs money. Be especially cautious of costly counselling, rituals, or charms offered in the first few weeks after the loss, since these often target grief specifically.",
    ),
    patterns: [/사별|돌아가[셨신]|세상을? 떠|장례|상을? 당|먼저 보낸/u, /passed away|bereave|grief/i],
  },
  {
    id: "lawsuit",
    focus: "growth",
    label: n("소송·법적 분쟁", "Legal disputes"),
    escalate: true,
    verdict: n(
      "이 문제는 감정으로 풀리지 않고, 법적 절차로 풀립니다. 지금 필요한 것은 확신이 아니라 증거를 정리하는 일이고, 그 작업부터 시작하면 나머지는 절차가 대신합니다.",
      "This is settled by legal process, not by feeling. What is needed now is organizing evidence rather than certainty, and the process carries the rest once that starts.",
    ),
    framing: n(
      "소송이나 법적 분쟁은 상징으로 승패를 알려드릴 수 있는 영역이 아닙니다. 지금 할 수 있는 일은 증거를 놓치지 않고 제때 법률 조력을 구하는 것입니다.",
      "Litigation is not something symbolism can call the outcome of. What helps now is keeping evidence intact and getting legal help on time.",
    ),
    observe: n(
      "지금 가진 증거(문자, 계약서, 녹취, 이체 내역)를 날짜순으로 한 번 정리해 보세요. 상담을 받을 때 이 정리 여부가 첫 질문이 됩니다.",
      "Organize what evidence you have — messages, contracts, recordings, transfer records — by date. This is the first thing any consultation will ask about.",
    ),
    action: n(
      "대한법률구조공단(132) 또는 지역 법률홈닥터에서 무료 법률상담을 먼저 받아보세요. 금액이 크거나 복잡하면 변호사 선임을 검토하세요.",
      "Get a free consultation from legal aid or a local legal clinic first. If the amount is large or the matter complex, consider retaining a lawyer.",
    ),
    caution: n(
      "소송 시효가 있는 사안은 시간이 지나면 아예 청구할 수 없게 됩니다. 감정적으로 대응하기 전에 기한부터 확인하세요.",
      "Some claims carry a statute of limitations and become entirely unavailable once it passes. Check the deadline before responding emotionally.",
    ),
    // 이혼 소송 belongs to the divorce topic; 고소 alone is ambiguous with 고소공포증
    // (fear of heights) and the unrelated adjective 고소하다, so it is left out.
    patterns: [
      /(?<!이혼\s?)소송|고소장|형사\s?고발|손해배상|법적\s?분쟁|계약\s?위반/u,
      /lawsuit|sue someone|legal dispute|breach of contract/i,
    ],
  },
];
