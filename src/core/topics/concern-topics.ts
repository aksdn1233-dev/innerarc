import type { Locale } from "@/i18n/config";

// The buyer writes one sentence about what is actually on their mind — a debut
// audition, a reunion, a parent's illness, a first hire. Until now that sentence was
// stored and echoed back but never read, so an idol trainee and a factory worker who
// both picked "일·진로" received the same paragraphs. This maps the sentence onto a
// specific situation and answers that situation.
//
// Matching is deterministic keyword work, not inference: the same sentence always
// resolves to the same topic, and an unmatched sentence falls back to the area the
// buyer selected rather than guessing.
export const concernFocusIds = ["work", "relationships", "growth", "money"] as const;
export type ConcernFocusId = (typeof concernFocusIds)[number];

type Bilingual = Readonly<{ ko: string; en: string }>;

export type ConcernTopic = Readonly<{
  id: string;
  focus: ConcernFocusId;
  label: Bilingual;
  /** How to look at this particular situation. */
  framing: Bilingual;
  /** What to observe, phrased so the buyer can actually check it. */
  observe: Bilingual;
  /** One thing to do this week. */
  action: Bilingual;
  /** What tends to go wrong in this situation specifically. */
  caution: Bilingual;
  patterns: readonly RegExp[];
}>;

function n(ko: string, en: string): Bilingual {
  return { ko, en };
}

// Ordered: the first topic whose pattern matches wins, so narrower situations are
// listed before the broader ones they would otherwise be swallowed by.
export const concernTopics: readonly ConcernTopic[] = [
  // ── 일·진로 ────────────────────────────────────────────────────────────────
  {
    id: "debut",
    focus: "work",
    label: n("데뷔·오디션", "Debut and auditions"),
    framing: n(
      "데뷔 여부는 실력만으로 정해지지 않고, 준비된 상태와 기회가 만나는 시점에 갈립니다. 그래서 '되느냐'보다 '지금 어느 쪽이 부족한가'를 보는 편이 실제로 도움이 됩니다.",
      "A debut turns on preparation meeting an opening, not on skill alone, so which of the two is short right now is the more useful question.",
    ),
    observe: n(
      "최근 3개월 동안 실제로 제출하거나 참가한 오디션·데모의 수, 그중 피드백을 받은 비율, 같은 지적이 반복해서 나온 항목을 적어보세요.",
      "Count the auditions or submissions actually made in the last three months, how many drew feedback, and which note keeps repeating.",
    ),
    action: n(
      "이번 주에 지원 가능한 자리 하나를 정해 마감일과 제출물을 달력에 적고, 같은 길을 먼저 간 사람 한 명에게 지금 준비물의 부족한 점 하나만 물어보세요.",
      "Pick one opening this week, put its deadline and deliverable on a calendar, and ask one person already on that path what is missing.",
    ),
    caution: n(
      "합격 여부를 알려줄 수 있는 곳은 없습니다. 특정 회사·시기를 단정하는 말에는 비용을 쓰지 마시고, 계약서를 받으면 서명 전에 반드시 다른 사람에게 보여주세요.",
      "No one can tell you whether you will pass. Do not pay for certainty about a company or date, and never sign a contract without a second reader.",
    ),
    patterns: [/데뷔|오디션|연습생|아이돌|배우|가수|모델|엔터|소속사|기획사/u, /debut|audition|trainee|idol/i],
  },
  {
    id: "exam",
    focus: "work",
    label: n("시험·자격", "Exams and qualifications"),
    framing: n(
      "시험은 남은 기간과 실제 공부 시간으로 거의 정해집니다. 상징은 합격 여부가 아니라 어떤 조건에서 집중이 유지되는지를 보는 데만 쓰세요.",
      "An exam is mostly time remaining multiplied by hours actually studied. Use symbolism only to see which conditions keep your focus.",
    ),
    observe: n(
      "지난 2주 동안 하루에 실제로 앉아 있던 시간과, 집중이 끊긴 시각·상황을 각각 기록해 비교해 보세요.",
      "For the last two weeks, log hours actually seated and the times and situations where focus broke.",
    ),
    action: n(
      "가장 약한 과목 하나를 골라 이번 주에 기출 한 회분만 시간을 재고 풀어 현재 점수를 확인하세요.",
      "Take one timed past paper in your weakest subject this week to see the current score rather than the imagined one.",
    ),
    caution: n(
      "합격을 보장한다는 말은 어디서든 사실이 아닙니다. 남은 기간이 짧을수록 새 교재보다 이미 본 것의 반복이 유리합니다.",
      "No guarantee of passing is true anywhere. The less time remains, the more repetition beats new material.",
    ),
    patterns: [/시험|자격증|공무원|고시|수능|편입|자격시험|합격/u, /exam|certification|licence|license test/i],
  },
  {
    id: "job_change",
    focus: "work",
    label: n("이직", "Changing jobs"),
    framing: n(
      "이직은 지금 자리가 나쁜지가 아니라, 옮길 자리가 지금보다 나은지로 결정하는 편이 안전합니다. 두 질문은 다릅니다.",
      "A move is safer decided on whether the next seat is better, not on whether this one is bad. They are different questions.",
    ),
    observe: n(
      "지금 자리에서 견디기 어려운 것 세 가지를 적고, 그중 옮기면 실제로 사라지는 것과 어디를 가도 따라오는 것을 나눠 보세요.",
      "List three things that are hard here, then split them into what a move removes and what follows you anywhere.",
    ),
    action: n(
      "가고 싶은 회사에 다니는 사람 한 명에게 하루 일과와 가장 자주 하는 일을 물어, 상상과 실제를 맞춰 보세요.",
      "Ask someone inside the target company what their day actually contains, and compare it with what you imagine.",
    ),
    caution: n(
      "연봉만 보고 옮기면 업무 조건에서 되돌아옵니다. 최종 제안은 서면으로 받고, 지금 직장은 그 뒤에 정리하세요.",
      "Moving on salary alone returns as working conditions. Get the offer in writing before ending the current job.",
    ),
    patterns: [/이직|옮길까|옮기는|퇴사하고|회사를? 나와|전직/u, /change jobs|new job|quit and move/i],
  },
  {
    id: "job_hunt",
    focus: "work",
    label: n("취업 준비", "Job hunting"),
    framing: n(
      "취업은 지원 수와 서류의 질이 결과를 대부분 설명합니다. 상징은 어떤 일에서 힘이 덜 빠지는지 좁히는 데 쓰세요.",
      "Applications sent and their quality explain most of the outcome. Use symbolism to narrow which work drains you least.",
    ),
    observe: n(
      "최근 지원한 곳을 서류 탈락·면접 탈락·무응답으로 나눠 보세요. 어느 단계에서 막히는지에 따라 고칠 것이 완전히 달라집니다.",
      "Sort recent applications into rejected on paper, rejected at interview, and no reply. What to fix depends entirely on where it stops.",
    ),
    action: n(
      "이력서에서 '했다'로 끝나는 문장 세 개를 골라, 숫자나 결과가 들어간 문장으로 이번 주에 바꿔 보세요.",
      "Rewrite three résumé lines that end in a duty so they end in a number or an outcome.",
    ),
    caution: n(
      "돈을 먼저 요구하는 채용, 계약서 없는 근무, 지나치게 좋은 조건은 확인 전에는 응하지 마세요.",
      "Do not proceed with hiring that asks for money first, work without a contract, or terms that look too good.",
    ),
    patterns: [/취업|취준|입사|채용|면접|이력서|자소서/u, /job hunt|resume|interview/i],
  },
  {
    id: "startup",
    focus: "work",
    label: n("창업·사업", "Starting a business"),
    framing: n(
      "창업의 성패는 아이디어보다 얼마를 얼마 동안 버틸 수 있는지에 더 크게 걸립니다. 상징으로 수익을 예측하지는 않습니다.",
      "Survival depends more on how long you can fund the attempt than on the idea. Symbolism does not forecast revenue.",
    ),
    observe: n(
      "매출이 0원이어도 버틸 수 있는 개월 수를 계산해 적어보세요. 그 숫자가 결정의 대부분을 정합니다.",
      "Write down how many months you could continue at zero revenue. That number decides most of it.",
    ),
    action: n(
      "가장 작은 형태로 이번 달에 한 명에게 실제로 팔아 보고, 그 사람이 왜 샀는지 또는 왜 안 샀는지 물어보세요.",
      "Sell the smallest version to one real person this month and ask why they did or did not buy.",
    ),
    caution: n(
      "수익을 보장하는 조언은 없습니다. 동업은 지분·역할·나가는 방법을 처음에 문서로 정하세요.",
      "No advice guarantees returns. With a partner, put equity, roles, and the exit in writing at the start.",
    ),
    patterns: [/창업|사업을?|자영업|가게를?|장사|개업|프랜차이즈/u, /start a business|startup|open a shop/i],
  },
  {
    id: "workplace_people",
    focus: "work",
    label: n("직장 인간관계", "People at work"),
    framing: n(
      "직장 관계는 감정보다 역할과 권한에서 어긋나는 경우가 많습니다. 사람 성격으로 설명하기 전에 구조를 먼저 보세요.",
      "Friction at work usually starts in roles and authority rather than personality. Look at the structure first.",
    ),
    observe: n(
      "최근 부딪힌 장면 하나에서 누가 결정 권한을 갖고 누가 결과를 책임졌는지 적어보세요. 어긋난 지점이 대개 거기입니다.",
      "For one recent clash, write who held the decision and who carried the result. The gap is usually there.",
    ),
    action: n(
      "다음 회의 전에 '내가 정할 것'과 '확인만 받을 것'을 한 줄씩 적어 상대와 먼저 맞춰 보세요.",
      "Before the next meeting, write one line each for what you decide and what you only need signed off.",
    ),
    caution: n(
      "괴롭힘이나 임금 문제는 상징으로 다룰 일이 아닙니다. 기록을 남기고 노동청이나 사내 절차를 이용하세요.",
      "Harassment or unpaid wages are not symbolic matters. Keep records and use the formal channel.",
    ),
    patterns: [/상사|직장 상사|팀장|동료|사수|회사 사람|텃세|따돌림|직장 내/u, /boss|coworker|manager conflict/i],
  },
  {
    id: "study_major",
    focus: "work",
    label: n("전공·진학", "Study and majors"),
    framing: n(
      "전공은 이름보다 그 안에서 매일 하게 되는 활동으로 고르는 편이 오래갑니다.",
      "A field lasts longer when chosen by the daily activity inside it rather than the name on it.",
    ),
    observe: n(
      "고민 중인 전공에서 실제로 하루 대부분을 차지하는 작업이 무엇인지 찾아, 지금까지 그 작업을 즐겼던 경험이 있는지 대조해 보세요.",
      "Find what actually fills most of the day in that field, and check whether you have ever enjoyed that task.",
    ),
    action: n(
      "그 분야의 입문 강의 한 편이나 과제 하나를 이번 주에 끝까지 해보고, 지루했던 구간을 표시하세요.",
      "Finish one introductory lecture or assignment this week and mark where it became dull.",
    ),
    caution: n(
      "유망하다는 말은 시기마다 바뀝니다. 남이 유망하다고 한 이유보다 내가 오래 앉아 있을 수 있는지를 기준으로 보세요.",
      "What counts as promising changes by the year. Weigh how long you can sit with it over what others call promising.",
    ),
    patterns: [/전공|학과|진학|유학|대학원|편입할|자퇴/u, /major|graduate school|study abroad/i],
  },
  // ── 연애·관계 ──────────────────────────────────────────────────────────────
  {
    id: "reunion",
    focus: "relationships",
    label: n("재회", "Getting back together"),
    framing: n(
      "재회 가능성은 상대의 마음보다, 헤어진 이유가 실제로 달라졌는지에 더 크게 걸립니다. 그 조건이 그대로면 같은 결말이 반복되기 쉽습니다.",
      "Whether it works again depends less on their feelings than on whether the reason it ended actually changed.",
    ),
    observe: n(
      "헤어진 직접적인 이유를 한 문장으로 적고, 그 이유가 지금 사라졌다는 증거가 행동으로 있는지 확인해 보세요. 말이 아니라 행동이어야 합니다.",
      "Write the direct reason it ended in one sentence, then look for behaviour — not words — showing it is gone.",
    ),
    action: n(
      "연락하기 전에, 다시 만난다면 무엇이 달라져야 하는지 두 가지를 적어 두세요. 그게 없으면 연락은 미루셔도 됩니다.",
      "Before reaching out, write two things that would have to be different. Without them, the message can wait.",
    ),
    caution: n(
      "상대의 마음을 확신시켜 준다는 말은 사실이 아닙니다. 상대가 명확히 거절했다면 그 의사를 존중하는 것이 우선입니다.",
      "No one can confirm another person's feelings. If they have clearly declined, that answer comes first.",
    ),
    patterns: [/재회|다시 만날|다시 잘될|돌아올까|헤어진 (사람|남자|여자)|다시 연락/u, /get back together|reunion|ex/i],
  },
  {
    id: "crush",
    focus: "relationships",
    label: n("짝사랑·고백", "Unspoken feelings"),
    framing: n(
      "상대의 마음은 알 수 없지만, 나에게 편한 거리와 감당할 수 있는 결과는 미리 정할 수 있습니다.",
      "Their feelings are unknowable, but the distance you are comfortable with and the outcome you can carry are decidable now.",
    ),
    observe: n(
      "먼저 연락한 비율, 약속을 잡을 때 누가 제안했는지, 답장 속도를 최근 2주 기준으로 세어 보세요. 감정보다 이쪽이 정확합니다.",
      "Over two weeks, count who reached out first, who proposed plans, and reply speed. That reads truer than feeling.",
    ),
    action: n(
      "고백할지 정하기 전에, 거절당해도 유지하고 싶은 관계인지 스스로 한 문장으로 답해 보세요.",
      "Before deciding to speak, answer in one sentence whether you want this relationship even after a no.",
    ),
    caution: n(
      "반복된 거절 신호를 확인 전에 호감으로 해석하지 마세요. 상대의 일상이나 일정에 개입하는 방식은 피하는 것이 안전합니다.",
      "Do not read repeated declines as interest, and avoid approaches that intrude on their routine.",
    ),
    patterns: [/짝사랑|고백|좋아하는 사람|마음을? 표현|썸|호감/u, /crush|confess|feelings for someone/i],
  },
  {
    id: "breakup",
    focus: "relationships",
    label: n("이별", "A breakup"),
    framing: n(
      "이별 직후의 판단은 대개 회복 상태에 좌우됩니다. 결정을 서두르기보다 지금 상태를 아는 편이 낫습니다.",
      "Judgment right after a breakup mostly tracks how recovered you are. Knowing that beats deciding fast.",
    ),
    observe: n(
      "지난 일주일 중 잠·식사·연락 빈도가 평소와 달랐던 날을 세어 보세요. 회복 정도를 감정보다 정확히 알려줍니다.",
      "Count the days last week where sleep, meals, or contact differed from usual. It reads recovery better than mood does.",
    ),
    action: n(
      "당분간 연락 여부를 매번 고민하지 않도록, 기간을 하나 정해 두고 그 기간에는 결정하지 않기로 해보세요.",
      "Set one period during which you will not decide, so contact is not re-litigated every day.",
    ),
    caution: n(
      "상대의 근황을 계속 확인하는 행동은 회복을 늦춥니다. 힘들면 주변 사람이나 상담 창구를 먼저 찾으세요.",
      "Monitoring their updates slows recovery. If it is heavy, reach a person or a counselling line first.",
    ),
    patterns: [/이별|헤어졌|헤어질|정리해야|끝내야 할까/u, /breakup|broke up|should I end it/i],
  },
  {
    id: "marriage",
    focus: "relationships",
    label: n("결혼", "Marriage"),
    framing: n(
      "결혼은 감정보다 생활 조건이 오래 남습니다. 돈, 시간, 가족, 거주지에 대한 합의가 실제로 있는지를 보세요.",
      "Living conditions outlast feeling. Look for actual agreement on money, time, family, and where you live.",
    ),
    observe: n(
      "돈 관리, 명절과 양가 방문, 자녀 계획, 집안일 분담 네 가지에 대해 서로 말로 확인한 적이 있는지 하나씩 확인해 보세요.",
      "Check whether money, family visits, children, and housework have each been talked through out loud.",
    ),
    action: n(
      "네 가지 중 아직 이야기하지 않은 것 하나를 골라 이번 주에 물어보세요. 답이 아니라 대화가 되는지가 중요합니다.",
      "Raise one of those four this week. Whether it becomes a conversation matters more than the answer.",
    ),
    caution: n(
      "궁합이 결혼 여부를 정해주지 않습니다. 상대의 빚, 폭력, 중독 같은 사안은 상징이 아니라 사실 확인의 영역입니다.",
      "Compatibility does not decide a marriage. Debt, violence, or addiction are matters of fact, not symbolism.",
    ),
    patterns: [/결혼|혼인|프러포즈|상견례|웨딩/u, /marriage|marry|engaged|wedding/i],
  },
  {
    id: "meeting",
    focus: "relationships",
    label: n("새로운 만남", "Meeting someone"),
    framing: n(
      "언제 누구를 만날지는 알 수 없지만, 어떤 자리에서 편했는지는 이미 데이터가 있습니다.",
      "When or whom you meet is unknowable, but which settings felt easy is already recorded in your past.",
    ),
    observe: n(
      "최근 1년 중 사람을 편하게 만났던 자리 세 곳을 적고, 공통점이 무엇이었는지 찾아보세요.",
      "List three settings where meeting people felt easy this year and find what they had in common.",
    ),
    action: n(
      "그 공통점에 맞는 자리 하나를 이번 달에 한 번 만들어 보세요. 사람을 찾기보다 조건을 반복하는 쪽이 확률이 높습니다.",
      "Recreate that setting once this month. Repeating the condition works better than searching for a person.",
    ),
    caution: n(
      "만날 시기를 특정해 주는 말은 근거가 없습니다. 온라인에서 만난 상대에게 금전 요구를 받으면 즉시 중단하세요.",
      "No one can name a date. If someone met online asks for money, stop there.",
    ),
    patterns: [/소개팅|새로운 사람|만남|연애하고 싶|애인이 생길|인연/u, /meet someone|dating app|new relationship/i],
  },
  // ── 가족 ──────────────────────────────────────────────────────────────────
  {
    id: "parents",
    focus: "relationships",
    label: n("부모와의 관계", "Parents"),
    framing: n(
      "부모와의 문제는 대개 옳고 그름이 아니라 거리와 역할에서 생깁니다. 설득보다 경계가 효과적인 경우가 많습니다.",
      "Trouble with parents usually sits in distance and role rather than who is right. A boundary often works where persuasion does not.",
    ),
    observe: n(
      "최근 부담을 느낀 요구 세 가지를 적고, 그중 실제로 내가 결정할 수 있는 것과 아닌 것을 나눠 보세요.",
      "List three recent demands and split them into what is actually yours to decide and what is not.",
    ),
    action: n(
      "이번 주에 한 가지에 대해서만 할 수 있는 범위를 구체적으로 말해 보세요. 전부를 한 번에 정리하려 하지 않아도 됩니다.",
      "State the limit on exactly one thing this week. It does not have to be settled all at once.",
    ),
    caution: n(
      "돈 문제는 감정과 분리해 문서로 남기세요. 건강 문제는 상징이 아니라 진료로 확인해야 합니다.",
      "Keep money matters written and separate from feeling. Health belongs to a clinic, not to symbolism.",
    ),
    patterns: [/부모|엄마|아빠|어머니|아버지|친정|본가/u, /parents|mother|father/i],
  },
  {
    id: "children",
    focus: "relationships",
    label: n("자녀·육아", "Children"),
    framing: n(
      "아이에 대한 걱정은 대개 미래에 있고, 확인할 수 있는 것은 대개 오늘의 조건에 있습니다.",
      "Worry about a child lives in the future; what can be checked lives in today's conditions.",
    ),
    observe: n(
      "최근 걱정되는 행동이 어떤 시간대와 상황에서 자주 나오는지 일주일만 기록해 보세요.",
      "For one week, note when and where the behaviour you worry about tends to appear.",
    ),
    action: n(
      "아이의 미래를 묻기보다, 이번 주에 아이와 단둘이 방해 없이 보내는 시간을 한 번 만들어 보세요.",
      "Rather than asking about their future, make one uninterrupted stretch of time together this week.",
    ),
    caution: n(
      "발달이나 정서에 대한 판단은 상징으로 하지 마세요. 걱정되면 소아과나 상담 기관에서 확인하는 것이 맞습니다.",
      "Do not judge development or emotional health symbolically. A clinic or counsellor is the right place.",
    ),
    patterns: [/아이|자녀|아들|딸|육아|사춘기|입시/u, /my child|son|daughter|parenting/i],
  },
  {
    id: "inlaws",
    focus: "relationships",
    label: n("시댁·처가", "In-laws"),
    framing: n(
      "이 문제는 대부분 배우자와의 합의가 먼저이고, 상대 가족과의 대화는 그다음입니다. 순서가 바뀌면 같은 일이 반복됩니다.",
      "This is usually settled with your partner first and their family second. Reversed, it repeats.",
    ),
    observe: n(
      "부담을 느낀 상황에서 배우자가 어느 쪽에 서 있었는지 최근 세 번을 적어보세요.",
      "For the last three difficult moments, write where your partner stood.",
    ),
    action: n(
      "다음 명절이나 방문 전에 배우자와 둘이서 시간·비용·역할을 먼저 정해 두세요.",
      "Before the next visit, agree time, cost, and roles with your partner alone.",
    ),
    caution: n(
      "상대 가족을 바꾸는 것을 목표로 삼으면 대개 지칩니다. 조정 가능한 것은 우리 쪽의 기준입니다.",
      "Aiming to change their family usually exhausts you. What is adjustable is your own standard.",
    ),
    patterns: [/시댁|처가|시어머니|장모|며느리|사위|명절/u, /in-laws|mother-in-law/i],
  },
  {
    id: "conflict",
    focus: "relationships",
    label: n("다툼·갈등", "A recurring argument"),
    framing: n(
      "반복되는 다툼은 주제가 아니라 방식에서 되풀이되는 경우가 많습니다. 무엇으로 싸웠는지보다 어떻게 시작됐는지를 보세요.",
      "A repeating argument usually repeats in its method, not its topic. Look at how it starts.",
    ),
    observe: n(
      "최근 다툼 세 번의 시작 30분 전에 각자 무엇을 하고 있었는지 적어보세요. 피로·시간대·장소가 자주 겹칩니다.",
      "Write what each of you was doing thirty minutes before the last three arguments. Fatigue, time, and place often repeat.",
    ),
    action: n(
      "다음 대화에서는 지금 필요한 것이 공감인지, 정보인지, 결정인지를 먼저 말하고 시작해 보세요.",
      "Open the next conversation by naming whether you need empathy, information, or a decision.",
    ),
    caution: n(
      "폭력이나 위협이 있었다면 관계 조언의 영역이 아닙니다. 안전을 먼저 확보하고 공적인 도움을 받으세요.",
      "If there has been violence or threat, this is not relationship advice. Secure safety and get formal help.",
    ),
    patterns: [/싸움|다툼|싸워|갈등|자꾸 부딪|말다툼/u, /argument|fight|conflict with/i],
  },
  // ── 돈 ────────────────────────────────────────────────────────────────────
  {
    id: "big_spend",
    focus: "money",
    label: n("목돈 지출", "A large purchase"),
    framing: n(
      "큰 지출은 감당 가능한 손실 범위 안에 있는지로 판단하는 편이 안전합니다. 좋은 선택인지보다 회복 가능한 선택인지를 보세요.",
      "A large spend is safer judged by whether the loss is survivable than by whether it is a good idea.",
    ),
    observe: n(
      "이 지출을 하고 나서도 3개월을 버틸 수 있는지 계산해 보세요. 그 답이 대부분을 정합니다.",
      "Work out whether three months would still be covered afterwards. That answer decides most of it.",
    ),
    action: n(
      "결정을 하루만 미루고, 같은 돈으로 할 수 있는 다른 선택 두 가지를 적어 나란히 비교해 보세요.",
      "Delay one day and write two other things the same money could do, side by side.",
    ),
    caution: n(
      "수익이나 시세를 알려줄 수는 없습니다. 원금을 잃어도 되는 돈이 아니면 확신을 주는 말을 특히 조심하세요.",
      "No return or price can be told to you. If the money cannot be lost, be most careful with certainty.",
    ),
    patterns: [/목돈|큰돈|지출|살까|구매|차를? 살|명품/u, /large purchase|should I buy/i],
  },
  {
    id: "debt",
    focus: "money",
    label: n("빚·상환", "Debt"),
    framing: n(
      "빚은 순서 문제입니다. 금리가 높은 것부터인지, 금액이 작은 것부터인지만 정해도 대부분 정리됩니다.",
      "Debt is an ordering problem. Choosing highest rate first or smallest balance first settles most of it.",
    ),
    observe: n(
      "가진 채무를 금액·금리·상환일 세 열로 한 장에 적어보세요. 흩어져 있을 때보다 결정이 쉬워집니다.",
      "Put every balance on one page with amount, rate, and due date.",
    ),
    action: n(
      "이번 주에 금리가 가장 높은 것 하나만 골라 상환 방법을 알아보세요. 전부를 한 번에 해결하려 하지 않아도 됩니다.",
      "Look into just the highest-rate balance this week. It does not all have to move at once.",
    ),
    caution: n(
      "연체가 시작됐다면 상징이 아니라 신용회복위원회 같은 공적 창구를 먼저 이용하세요. 대출을 권하는 곳을 조심하세요.",
      "If payments are already late, use a formal debt counselling body, not symbolism. Be wary of anyone offering more credit.",
    ),
    patterns: [/빚|대출|카드값|연체|상환|파산|신용/u, /debt|loan|repay|overdue/i],
  },
  {
    id: "investment",
    focus: "money",
    label: n("투자", "Investing"),
    framing: n(
      "투자 결과는 알려드릴 수 없습니다. 대신 결정 방식과 감당 범위는 지금 점검할 수 있습니다.",
      "Investment outcomes cannot be told. How you decide and what you can absorb can be checked now.",
    ),
    observe: n(
      "최근 매수·매도 결정 세 번이 어떤 계기로 시작됐는지 적어보세요. 정보였는지, 불안이었는지, 남의 말이었는지가 드러납니다.",
      "Write what triggered your last three buy or sell decisions: information, anxiety, or someone else's word.",
    ),
    action: n(
      "지금 보유 중인 것 하나에 대해 '얼마가 되면 판다'는 기준을 미리 적어 두세요.",
      "For one holding, write the exit condition in advance.",
    ),
    caution: n(
      "이 서비스는 투자 조언이 아니며 수익을 예측하지 않습니다. 원금 보장이나 확정 수익을 말하는 곳은 대부분 사기입니다.",
      "This is not investment advice and forecasts no return. Guaranteed principal or fixed returns are almost always fraud.",
    ),
    patterns: [/투자|주식|코인|비트|부동산 투자|펀드|수익률/u, /invest|stock|crypto|fund return/i],
  },
  {
    id: "relocation",
    focus: "money",
    label: n("이사·거주", "Moving house"),
    framing: n(
      "이사는 집보다 이동 시간과 고정비가 일상을 더 크게 바꿉니다.",
      "A move changes daily life through commute and fixed costs more than through the home itself.",
    ),
    observe: n(
      "후보지에서 자주 가는 곳까지 걸리는 시간을 실제로 한 번 재보고, 월 고정비 차이를 계산해 보세요.",
      "Time the actual trip to the places you go often, and calculate the monthly difference.",
    ),
    action: n(
      "계약 전에 그 동네를 평일 저녁과 주말에 각각 한 번씩 다녀오세요. 낮에만 본 인상과 다를 수 있습니다.",
      "Visit once on a weekday evening and once at the weekend before signing.",
    ),
    caution: n(
      "전세·보증금은 등기부등본과 선순위 확인이 먼저입니다. 이 부분은 상징으로 대신할 수 없습니다.",
      "Deposits require checking the register and prior claims. Symbolism cannot stand in for that.",
    ),
    patterns: [/이사|이주|전세|월세|자취|독립할|집을? 구/u, /move house|relocate|lease|rent/i],
  },
  // ── 성장·자기 ─────────────────────────────────────────────────────────────
  {
    id: "burnout",
    focus: "growth",
    label: n("번아웃·소진", "Burnout"),
    framing: n(
      "지친 상태에서는 큰 결정을 미루는 편이 대체로 낫습니다. 회복이 먼저이고 방향은 그다음입니다.",
      "When depleted, large decisions are usually better postponed. Recovery first, direction after.",
    ),
    observe: n(
      "지난 2주 동안 잠든 시각, 깬 시각, 쉬었다고 느낀 시간을 적어보세요. 느낌보다 정확합니다.",
      "Log sleep, waking, and the hours that actually felt like rest for two weeks.",
    ),
    action: n(
      "이번 주에 줄일 수 있는 일 하나를 정해 실제로 빼보세요. 더하는 것보다 빼는 쪽이 회복에 빠릅니다.",
      "Remove one commitment this week. Subtracting recovers faster than adding.",
    ),
    caution: n(
      "2주 이상 잠·식욕·의욕이 계속 무너져 있다면 상징이 아니라 진료나 상담이 필요한 신호입니다.",
      "If sleep, appetite, and drive have been down for more than two weeks, that is a signal for a clinician.",
    ),
    patterns: [/번아웃|지친|무기력|소진|다 놓고 싶|의욕이 없/u, /burnout|exhausted|no motivation/i],
  },
  {
    id: "habit",
    focus: "growth",
    label: n("습관·꾸준함", "Habits"),
    framing: n(
      "습관은 의지보다 조건에서 갈립니다. 하려는 일을 작게 만들고 방해물을 치우는 쪽이 효과적입니다.",
      "Habits turn on conditions more than will. Make the action smaller and remove what blocks it.",
    ),
    observe: n(
      "최근 그만둔 시도를 하나 떠올려, 며칠째에 어떤 상황에서 끊겼는지 적어보세요. 대개 같은 지점에서 끊깁니다.",
      "Recall one attempt you dropped and note which day and situation ended it. It usually repeats.",
    ),
    action: n(
      "이번 주에는 목표를 절반 이하로 줄이고, 중단 기준도 함께 정해 두세요.",
      "Halve the target this week and set the stopping rule alongside it.",
    ),
    caution: n(
      "한 번에 여러 습관을 바꾸려 하면 대부분 무너집니다. 하나가 자리 잡은 뒤 다음으로 넘어가세요.",
      "Changing several at once usually collapses. Let one settle before the next.",
    ),
    patterns: [/습관|꾸준|작심삼일|루틴|운동을? 시작|공부 습관/u, /habit|routine|consistency/i],
  },
  {
    id: "direction",
    focus: "growth",
    label: n("방향 잃음", "Feeling stuck"),
    framing: n(
      "무엇을 해야 할지 모를 때는 큰 방향보다 확인 가능한 작은 실험 하나가 더 빨리 답을 줍니다.",
      "When the direction is unclear, one checkable experiment answers faster than a grand plan.",
    ),
    observe: n(
      "최근 1년 중 시간이 빨리 갔던 순간 세 가지를 적고, 그때 하고 있던 활동의 공통점을 찾아보세요.",
      "List three moments this year when time passed quickly and find what the activity had in common.",
    ),
    action: n(
      "그 공통점과 닿는 일 하나를 이번 주에 20분만 해보고, 끝난 뒤 기분을 한 줄로 기록하세요.",
      "Spend twenty minutes on something touching that overlap and write one line about how it felt.",
    ),
    caution: n(
      "지금 결정하지 않아도 되는 일까지 한꺼번에 정하려 하면 더 막힙니다. 이번 달에 확인할 것 하나만 고르세요.",
      "Trying to settle everything at once blocks further. Choose one thing to check this month.",
    ),
    patterns: [/제자리|방향|뭘 해야|막막|길을? 잃|의미를? 모르/u, /stuck|no direction|lost/i],
  },
];

const TOPIC_BY_ID = new Map(concernTopics.map((topic) => [topic.id, topic]));

// Used when the sentence matches nothing: answer the area the buyer chose rather than
// guessing at a situation they did not describe.
const FOCUS_FALLBACK: Record<ConcernFocusId, string> = {
  work: "direction",
  relationships: "conflict",
  growth: "direction",
  money: "big_spend",
};

export type ConcernResolution = Readonly<{
  topic: ConcernTopic;
  /** False when nothing matched and the buyer's selected area was used instead. */
  matched: boolean;
}>;

export function resolveConcernTopic(
  concern: string,
  focusId: ConcernFocusId,
): ConcernResolution {
  const normalized = concern.normalize("NFKC").slice(0, 2_000);
  for (const topic of concernTopics) {
    if (topic.patterns.some((pattern) => pattern.test(normalized))) {
      return { topic, matched: true };
    }
  }
  const fallback = TOPIC_BY_ID.get(FOCUS_FALLBACK[focusId]);
  if (!fallback) throw new Error(`No fallback topic for focus ${focusId}`);
  return { topic: fallback, matched: false };
}

export function topicText(value: Bilingual, locale: Locale): string {
  return value[locale];
}
