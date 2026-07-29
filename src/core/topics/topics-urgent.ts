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
      "학교폭력은 참고 견딜 문제가 아니라 신고와 기록으로 다루는 문제입니다. 상징 풀이보다 절차가 훨씬 강력합니다.",
      "Bullying is handled by reporting and records, not by endurance. The formal process is far stronger than any reading.",
    ),
    observe: n(
      "날짜, 장소, 있었던 일, 목격자를 그때그때 적어 두세요. 나중에 이 기록이 가장 큰 힘이 됩니다.",
      "Write the date, place, what happened, and who saw it, each time. Those records carry the most weight later.",
    ),
    action: n(
      "학교 담임이나 상담교사, 학교폭력 신고센터(117)에 알리세요. 혼자 해결하려 하지 않으셔도 됩니다.",
      "Tell a teacher, the school counsellor, or the national report line. This does not have to be handled alone.",
    ),
    caution: n(
      "가해 학생과 단둘이 만나 해결하려 하지 마세요. 보호자와 학교가 함께 개입해야 안전합니다.",
      "Do not try to settle it alone with the other student. A guardian and the school need to be involved.",
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
      "중독은 의지의 문제가 아니라 치료의 영역입니다. 혼자 끊으려다 실패한 경험은 실패가 아니라 도움이 필요하다는 신호입니다.",
      "Addiction is treated, not out-willed. Failing alone is not a personal failure; it is a sign that help is needed.",
    ),
    observe: n(
      "언제부터, 얼마나 자주, 어떤 상황에서 늘어났는지 적어 두면 상담이나 진료에서 그대로 쓰입니다.",
      "Note when it began, how often, and what situations increase it. A clinician will use exactly that.",
    ),
    action: n(
      "도박문제관리센터, 중독관리통합지원센터, 정신건강복지센터(1577-0199) 같은 공적 창구에 먼저 연락하세요. 무료이고 비밀이 지켜집니다.",
      "Contact a public addiction or mental-health service first. These are free and confidential.",
    ),
    caution: n(
      "빚이 함께 있다면 돈 문제와 중독을 같이 다뤄야 합니다. 한쪽만 정리하면 대개 되돌아옵니다.",
      "If debt is involved, both have to be handled together. Fixing only one usually returns.",
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
      "상실에는 정해진 회복 기간이 없고, 지금 느끼는 것은 대부분 자연스러운 반응입니다. 앞날을 점치는 것보다 지금을 견디는 방법이 필요합니다.",
      "Grief has no schedule, and most of what you feel now is an ordinary response. Getting through today matters more than reading the future.",
    ),
    observe: n(
      "잠, 식사, 사람을 만나는 일 중 어떤 것이 가장 어려운지 하나만 살펴보세요. 전부를 한꺼번에 돌보지 않으셔도 됩니다.",
      "Notice which of sleep, eating, or seeing people is hardest. It does not all need attention at once.",
    ),
    action: n(
      "가까운 사람 한 명에게 지금 상태를 그대로 말해 보세요. 힘들면 정신건강 상담전화(1577-0199)에 연락하셔도 됩니다.",
      "Tell one close person how it actually is. A counselling line is there if that feels impossible.",
    ),
    caution: n(
      "떠난 사람의 뜻을 알려준다는 말에 비용을 쓰지 마세요. 회복이 늦어지고 돈만 남습니다.",
      "Do not pay anyone claiming to relay the wishes of someone who has died. It delays recovery and costs money.",
    ),
    patterns: [/사별|돌아가[셨신]|세상을? 떠|장례|상을? 당|먼저 보낸/u, /passed away|bereave|grief/i],
  },
];
