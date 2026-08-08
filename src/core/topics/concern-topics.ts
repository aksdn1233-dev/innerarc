import { n, type ConcernFocusId, type ConcernTopic } from "./topic-types";
import { URGENT_TOPICS } from "./topics-urgent";
import { WORK_EXTRA_TOPICS } from "./topics-work-extra";
import { RELATIONSHIP_EXTRA_TOPICS } from "./topics-relationship-extra";
import { LIFE_EXTRA_TOPICS, MONEY_EXTRA_TOPICS } from "./topics-life-extra";

export { concernFocusIds, topicText } from "./topic-types";
export type { Bilingual, ConcernFocusId, ConcernTopic } from "./topic-types";

// The buyer writes one sentence about what is actually on their mind. This maps that
// sentence onto a concrete situation and answers it. Matching is deterministic keyword
// work, not inference: the same sentence always resolves the same way.
//
// Order is load-bearing, so the groups are assembled explicitly rather than left to
// where a topic happens to sit in a file. Situations that must win outright come
// first, then narrower groups before the broader ones that would swallow them —
// family before generic conflict, specific work situations before feeling stuck.
// Broadest of all, so it is appended last and only catches what nothing else did.
const CATCH_ALL_TOPICS: readonly ConcernTopic[] = [
  {
    id: "direction",
    focus: "growth",
    label: n("방향 잃음", "Feeling stuck"),
    verdict: n(
      "지금 막막한 것은 방향이 없어서가 아니라 확인할 것이 너무 많아서입니다. 이번 달에 확인할 것 하나만 고르면 풀립니다.",
      "The block is too many things to settle at once, not the absence of a direction. Choose one thing to check this month.",
    ),
    framing: n(
      "무엇을 해야 할지 모를 때는 큰 방향보다 확인 가능한 작은 실험 하나가 더 빨리 답을 줍니다. 2주 안에 결과를 확인할 수 있는 크기로 실험을 잡으면 방향을 바꿀지 계속할지 그 안에서 판단할 수 있습니다.",
      "When the direction is unclear, one checkable experiment answers faster than a grand plan. Sizing the experiment so results show within two weeks lets you judge whether to continue or pivot inside that window.",
    ),
    observe: n(
      "최근 1년 중 시간이 빨리 갔던 순간 세 가지를 적고, 그때 하고 있던 활동의 공통점을 찾아보세요. 혼자 했는지 여럿이 했는지, 결과물이 눈에 보였는지도 함께 표시하면 공통점이 더 뚜렷해집니다.",
      "List three moments this year when time passed quickly and find what the activity had in common. Note also whether you were alone or with others, and whether the result was visible, since that sharpens the pattern.",
    ),
    action: n(
      "그 공통점과 닿는 일 하나를 이번 주에 20분만 해보고, 끝난 뒤 기분을 한 줄로 기록하세요. 같은 실험을 3주 동안 반복해 기록이 쌓이면 우연인지 패턴인지 구분할 수 있습니다.",
      "Spend twenty minutes on something touching that overlap and write one line about how it felt. Repeat the same experiment for three weeks so the notes build up enough to tell coincidence from pattern.",
    ),
    caution: n(
      "지금 결정하지 않아도 되는 일까지 한꺼번에 정하려 하면 더 막힙니다. 이번 달에 확인할 것 하나만 고르세요. 직업, 거주지, 관계를 동시에 바꾸는 결정은 서로 얽혀 원인을 알아보기 어렵게 만듭니다.",
      "Trying to settle everything at once blocks further. Choose one thing to check this month. Changing career, home, and relationship at the same time tangles the variables so you cannot tell which one caused what.",
    ),
    patterns: [/제자리|방향|뭘 해야|막막|길을? 잃|의미를? 모르/u, /stuck|no direction|lost/i],
  },
];

const BASE_TOPICS: readonly ConcernTopic[] = [
  // ── 일·진로 ────────────────────────────────────────────────────────────────
  {
    id: "debut",
    focus: "work",
    label: n("데뷔·오디션", "Debut and auditions"),
    verdict: n(
      "데뷔는 지금 상태로도 가능성이 있습니다. 다만 실력보다 노출 횟수에서 갈립니다. 준비를 더 다듬는 쪽보다 지금 수준으로 지원 건수를 늘리는 쪽이 결과를 앞당깁니다.",
      "A debut is realistic from where you are, but it turns on how often you are seen rather than on more polish. Raising the number of attempts at your current level moves it faster.",
    ),
    framing: n(
      "데뷔 여부는 실력만으로 정해지지 않고, 준비된 상태와 기회가 만나는 시점에 갈립니다. 그래서 '되느냐'보다 '지금 어느 쪽이 부족한가'를 보는 편이 실제로 도움이 됩니다. 같은 실력이라도 지원 횟수가 두 배 많은 쪽이 기회를 먼저 만나는 경우가 대부분입니다.",
      "A debut turns on preparation meeting an opening, not on skill alone, so which of the two is short right now is the more useful question. At the same skill level, the person applying twice as often is usually the one who meets the opening first.",
    ),
    observe: n(
      "최근 3개월 동안 실제로 제출하거나 참가한 오디션·데모의 수, 그중 피드백을 받은 비율, 같은 지적이 반복해서 나온 항목을 적어보세요. 월평균 지원 건수가 2건 미만이면 실력보다 노출 부족이 더 큰 원인일 수 있습니다.",
      "Count the auditions or submissions actually made in the last three months, how many drew feedback, and which note keeps repeating. If the monthly average is fewer than two applications, low exposure may outweigh skill as the cause.",
    ),
    action: n(
      "이번 주에 지원 가능한 자리 하나를 정해 마감일과 제출물을 달력에 적고, 같은 길을 먼저 간 사람 한 명에게 지금 준비물의 부족한 점 하나만 물어보세요. 다음 한 달 동안 최소 세 곳에 지원하는 것을 목표로 잡으면 한 곳의 결과에 덜 흔들립니다.",
      "Pick one opening this week, put its deadline and deliverable on a calendar, and ask one person already on that path what is missing. Set a goal of applying to at least three places over the next month so one result matters less on its own.",
    ),
    caution: n(
      "합격 여부를 알려줄 수 있는 곳은 없습니다. 특정 회사·시기를 단정하는 말에는 비용을 쓰지 마시고, 계약서를 받으면 서명 전에 반드시 다른 사람에게 보여주세요. 연습생 계약이라면 정산 방식과 위약금 조항을 특히 꼼꼼히 확인해야 합니다.",
      "No one can tell you whether you will pass. Do not pay for certainty about a company or date, and never sign a contract without a second reader. For a trainee contract, check the settlement terms and penalty clauses especially closely.",
    ),
    patterns: [/데뷔|오디션|연습생|아이돌|배우|가수|모델|엔터|소속사|기획사/u, /debut|audition|trainee|idol/i],
  },
  {
    id: "exam",
    focus: "work",
    label: n("시험·자격", "Exams and qualifications"),
    verdict: n(
      "남은 기간이 있다면 합격권에 들어갈 수 있는 준비입니다. 관건은 총 공부량이 아니라 실제 착석 시간의 규칙성입니다. 매일 같은 시각에 앉는 쪽이 확실합니다.",
      "With time remaining this is a workable plan. What decides it is the regularity of hours actually seated, not the total planned.",
    ),
    framing: n(
      "시험은 남은 기간과 실제 공부 시간으로 거의 정해집니다. 상징은 합격 여부가 아니라 어떤 조건에서 집중이 유지되는지를 보는 데만 쓰세요. 같은 시간을 공부해도 오전과 밤 중 어느 쪽에서 오래 집중되는지에 따라 하루 배치가 달라집니다.",
      "An exam is mostly time remaining multiplied by hours actually studied. Use symbolism only to see which conditions keep your focus. Even with the same total hours, whether morning or night holds your focus longer should decide how the day is arranged.",
    ),
    observe: n(
      "지난 2주 동안 하루에 실제로 앉아 있던 시간과, 집중이 끊긴 시각·상황을 각각 기록해 비교해 보세요. 하루 목표 시간과 실제 앉은 시간의 차이가 1시간 넘게 반복된다면 계획 자체를 줄이는 편이 낫습니다.",
      "For the last two weeks, log hours actually seated and the times and situations where focus broke. If the gap between planned and actual hours repeatedly exceeds one hour, shrinking the plan itself works better than pushing harder.",
    ),
    action: n(
      "가장 약한 과목 하나를 골라 이번 주에 기출 한 회분만 시간을 재고 풀어 현재 점수를 확인하세요. 점수를 확인한 뒤에는 틀린 문제를 유형별로 나눠 같은 유형이 3개 이상 겹치는지 확인하세요.",
      "Take one timed past paper in your weakest subject this week to see the current score rather than the imagined one. After scoring it, sort the mistakes by type and check whether three or more fall into the same category.",
    ),
    caution: n(
      "합격을 보장한다는 말은 어디서든 사실이 아닙니다. 남은 기간이 짧을수록 새 교재보다 이미 본 것의 반복이 유리합니다. 시험 한 달 전부터는 새 단원을 시작하기보다 이미 푼 문제집을 다시 도는 쪽이 점수 방어에 유리합니다.",
      "No guarantee of passing is true anywhere. The less time remains, the more repetition beats new material. In the final month, revisiting problems already solved protects your score better than starting a new chapter.",
    ),
    patterns: [/시험|자격증|공무원|고시|수능|편입|자격시험|합격/u, /exam|certification|licence|license test/i],
  },
  {
    id: "job_change",
    focus: "work",
    label: n("이직", "Changing jobs"),
    verdict: n(
      "옮기는 방향 자체는 맞습니다. 다만 지금 자리가 힘들어서 옮기면 같은 문제가 따라옵니다. 갈 곳의 조건을 확인한 뒤 움직이면 이번 이동은 성과가 됩니다.",
      "The direction is right, but moving because this seat is hard carries the problem along. Verify the next role first and this move pays off.",
    ),
    framing: n(
      "이직은 지금 자리가 나쁜지가 아니라, 옮길 자리가 지금보다 나은지로 결정하는 편이 안전합니다. 두 질문은 다릅니다. 연봉, 통근 시간, 업무 범위 세 가지를 지금 자리와 나란히 표로 비교하면 감정과 조건이 분리됩니다.",
      "A move is safer decided on whether the next seat is better, not on whether this one is bad. They are different questions. Laying salary, commute, and scope side by side against the current job separates feeling from fact.",
    ),
    observe: n(
      "지금 자리에서 견디기 어려운 것 세 가지를 적고, 그중 옮기면 실제로 사라지는 것과 어디를 가도 따라오는 것을 나눠 보세요. 예를 들어 상사와의 관계는 회사를 옮기면 사라지지만, 야근이 많은 업종 특성은 비슷한 회사로 옮겨도 반복될 수 있습니다.",
      "List three things that are hard here, then split them into what a move removes and what follows you anywhere. A difficult manager disappears with a move, for instance, but an industry-wide habit of long hours can follow into a similar company.",
    ),
    action: n(
      "가고 싶은 회사에 다니는 사람 한 명에게 하루 일과와 가장 자주 하는 일을 물어, 상상과 실제를 맞춰 보세요. 가능하면 링크드인이나 지인을 통해 최근 1년 안에 그 회사를 나간 사람의 이야기도 함께 들어보세요.",
      "Ask someone inside the target company what their day actually contains, and compare it with what you imagine. If possible, also hear from someone who left that company within the last year, via LinkedIn or a mutual contact.",
    ),
    caution: n(
      "연봉만 보고 옮기면 업무 조건에서 되돌아옵니다. 최종 제안은 서면으로 받고, 지금 직장은 그 뒤에 정리하세요. 구두로 합의한 연봉과 최종 근로계약서상 금액이 다른 경우가 있으니 서명 전에 숫자를 다시 대조하세요.",
      "Moving on salary alone returns as working conditions. Get the offer in writing before ending the current job. Verbally agreed pay sometimes differs from the figure in the final contract, so check the number again before signing.",
    ),
    patterns: [/이직|옮길까|옮기는|퇴사하고|회사를? 나와|전직/u, /change jobs|new job|quit and move/i],
  },
  {
    id: "job_hunt",
    focus: "work",
    label: n("취업 준비", "Job hunting"),
    verdict: n(
      "지금 방식으로도 결과는 나옵니다. 다만 어느 단계에서 막히는지 모른 채 지원 수만 늘리면 시간이 길어집니다. 막히는 지점을 특정하는 순간 속도가 붙습니다.",
      "This will land, but raising volume without knowing where it stalls stretches it out. Pinpointing the stage that stops you is what accelerates it.",
    ),
    framing: n(
      "취업은 지원 수와 서류의 질이 결과를 대부분 설명합니다. 상징은 어떤 일에서 힘이 덜 빠지는지 좁히는 데 쓰세요. 같은 자기소개서를 여러 곳에 그대로 보내는 것보다 공고별로 세 문장만 바꿔도 서류 통과율이 달라집니다.",
      "Applications sent and their quality explain most of the outcome. Use symbolism to narrow which work drains you least. Changing just three sentences per posting, rather than sending the same cover letter everywhere, already shifts the pass rate.",
    ),
    observe: n(
      "최근 지원한 곳을 서류 탈락·면접 탈락·무응답으로 나눠 보세요. 어느 단계에서 막히는지에 따라 고칠 것이 완전히 달라집니다. 예를 들어 서류는 자주 통과하는데 면접에서 반복해 떨어진다면 답변 내용보다 전달 방식을 먼저 점검해야 합니다.",
      "Sort recent applications into rejected on paper, rejected at interview, and no reply. What to fix depends entirely on where it stops. If résumés keep passing but interviews keep failing, for example, delivery needs checking before content does.",
    ),
    action: n(
      "이력서에서 '했다'로 끝나는 문장 세 개를 골라, 숫자나 결과가 들어간 문장으로 이번 주에 바꿔 보세요. 고친 이력서로 이번 주에 최소 다섯 곳에 지원해, 이전 버전과 서류 통과율을 비교해 보세요.",
      "Rewrite three résumé lines that end in a duty so they end in a number or an outcome. Send the revised résumé to at least five postings this week and compare the pass rate against the earlier version.",
    ),
    caution: n(
      "돈을 먼저 요구하는 채용, 계약서 없는 근무, 지나치게 좋은 조건은 확인 전에는 응하지 마세요. 교육비나 장비비 명목으로 먼저 입금을 요구하면 채용이 아니라 사기일 가능성이 큽니다.",
      "Do not proceed with hiring that asks for money first, work without a contract, or terms that look too good. A request for upfront payment framed as training or equipment fees is more likely fraud than an actual job offer.",
    ),
    // Neither 재취업 nor 해외 취업 belongs here; both have their own situation.
    patterns: [/(?<!재)(?<!해외 )취업|취준|입사|채용|면접|이력서|자소서/u, /job hunt|resume|interview/i],
  },
  {
    id: "startup",
    focus: "work",
    label: n("창업·사업", "Starting a business"),
    verdict: n(
      "사업 자체는 해볼 만합니다. 성패는 아이디어가 아니라 매출 0원으로 버틸 수 있는 개월 수에서 갈립니다. 그 숫자가 6개월 이상이면 시작해도 되는 조건입니다.",
      "The venture is worth attempting. It turns on how many months you can continue at zero revenue; six or more is a workable starting condition.",
    ),
    framing: n(
      "창업의 성패는 아이디어보다 얼마를 얼마 동안 버틸 수 있는지에 더 크게 걸립니다. 상징으로 수익을 예측하지는 않습니다. 초기 자본을 다 쓰기 전에 첫 매출이 발생하는 업종일수록 생존 확률이 올라갑니다.",
      "Survival depends more on how long you can fund the attempt than on the idea. Symbolism does not forecast revenue. Businesses that see their first sale before the starting capital runs out tend to survive at a higher rate.",
    ),
    observe: n(
      "매출이 0원이어도 버틸 수 있는 개월 수를 계산해 적어보세요. 그 숫자가 결정의 대부분을 정합니다. 생활비, 이미 낸 임대료나 보증금, 남은 대출 상환금까지 더해야 실제 숫자가 나옵니다.",
      "Write down how many months you could continue at zero revenue. That number decides most of it. Living costs, rent or deposits already paid, and remaining loan payments all need to be added in to get the real number.",
    ),
    action: n(
      "가장 작은 형태로 이번 달에 한 명에게 실제로 팔아 보고, 그 사람이 왜 샀는지 또는 왜 안 샀는지 물어보세요. 한 명에게 판 뒤에는 같은 방식으로 열 명에게 더 시도해, 우연인지 반복되는 패턴인지 확인하세요.",
      "Sell the smallest version to one real person this month and ask why they did or did not buy. After the first sale, try the same approach with ten more people to see if it was a fluke or a repeatable pattern.",
    ),
    caution: n(
      "수익을 보장하는 조언은 없습니다. 동업은 지분·역할·나가는 방법을 처음에 문서로 정하세요. 사업자 등록 전에 필요한 인허가나 자격 요건을 놓치면 개업 이후 영업정지로 이어질 수 있습니다.",
      "No advice guarantees returns. With a partner, put equity, roles, and the exit in writing at the start. Missing a required license or permit before registering the business can lead to a forced shutdown after opening.",
    ),
    patterns: [/창업|사업을?|자영업|가게를?|장사|개업|프랜차이즈/u, /start a business|startup|open a shop/i],
  },
  {
    id: "workplace_people",
    focus: "work",
    label: n("직장 인간관계", "People at work"),
    verdict: n(
      "관계 자체는 회복 가능합니다. 다만 성격 문제로 접근하면 풀리지 않습니다. 누가 무엇을 결정하는지를 명확히 하는 순간 대부분 정리됩니다.",
      "This is recoverable, but not by treating it as a personality problem. Most of it settles once who decides what is made explicit.",
    ),
    framing: n(
      "직장 관계는 감정보다 역할과 권한에서 어긋나는 경우가 많습니다. 사람 성격으로 설명하기 전에 구조를 먼저 보세요. 같은 사람과의 마찰이 특정 업무에서만 반복된다면 그 업무의 담당 범위가 불명확할 가능성이 큽니다.",
      "Friction at work usually starts in roles and authority rather than personality. Look at the structure first. If friction with the same person repeats only around one task, the scope of that task is likely undefined.",
    ),
    observe: n(
      "최근 부딪힌 장면 하나에서 누가 결정 권한을 갖고 누가 결과를 책임졌는지 적어보세요. 어긋난 지점이 대개 거기입니다. 지난 한 달 동안 비슷한 상황이 몇 번 반복됐는지도 세어보면 일회성인지 구조적 문제인지 구분됩니다.",
      "For one recent clash, write who held the decision and who carried the result. The gap is usually there. Counting how many times a similar situation repeated in the past month tells you whether it is one-off or structural.",
    ),
    action: n(
      "다음 회의 전에 '내가 정할 것'과 '확인만 받을 것'을 한 줄씩 적어 상대와 먼저 맞춰 보세요. 합의한 내용은 회의 뒤 메일 한 줄로 남겨 두면 나중에 말이 달라지는 것을 막을 수 있습니다.",
      "Before the next meeting, write one line each for what you decide and what you only need signed off. Sending a one-line email after the meeting to confirm what was agreed prevents the account from shifting later.",
    ),
    caution: n(
      "괴롭힘이나 임금 문제는 상징으로 다룰 일이 아닙니다. 기록을 남기고 노동청이나 사내 절차를 이용하세요. 날짜, 발언 내용, 목격자를 그때그때 메모해 두면 나중에 절차를 밟을 때 근거로 쓸 수 있습니다.",
      "Harassment or unpaid wages are not symbolic matters. Keep records and use the formal channel. Noting the date, what was said, and any witnesses at the time gives you evidence if you need it for a formal process later.",
    ),
    patterns: [/상사|직장 상사|팀장|동료|사수|회사 사람|텃세|따돌림|직장 내/u, /boss|coworker|manager conflict/i],
  },
  {
    id: "study_major",
    focus: "work",
    label: n("전공·진학", "Study and majors"),
    verdict: n(
      "선택하신 방향은 무리가 없습니다. 다만 전공 이름이 아니라 그 안에서 매일 하는 작업이 맞아야 오래갑니다. 그 작업을 한 번 해보면 답이 나옵니다.",
      "The direction is sound. What sustains it is the daily task inside the field rather than its name; trying that task once answers it.",
    ),
    framing: n(
      "전공은 이름보다 그 안에서 매일 하게 되는 활동으로 고르는 편이 오래갑니다. 예를 들어 같은 컴퓨터공학이라도 학교마다 코딩 중심인지 이론 중심인지 커리큘럼이 크게 다릅니다.",
      "A field lasts longer when chosen by the daily activity inside it rather than the name on it. Even within the same computer science label, curricula differ sharply between coding-heavy and theory-heavy programs across schools.",
    ),
    observe: n(
      "고민 중인 전공에서 실제로 하루 대부분을 차지하는 작업이 무엇인지 찾아, 지금까지 그 작업을 즐겼던 경험이 있는지 대조해 보세요. 그 학과 재학생이나 졸업생 커뮤니티에서 실제 시간표와 과제량을 한 번 찾아 확인해 보세요.",
      "Find what actually fills most of the day in that field, and check whether you have ever enjoyed that task. Look up an actual timetable and workload from a current student or alumni community in that department.",
    ),
    action: n(
      "그 분야의 입문 강의 한 편이나 과제 하나를 이번 주에 끝까지 해보고, 지루했던 구간을 표시하세요. 온라인 공개강좌(MOOC)에는 대학 1학년 수준의 입문 강의가 무료로 많이 올라와 있습니다.",
      "Finish one introductory lecture or assignment this week and mark where it became dull. Many free introductory courses at a first-year university level are available on open online course platforms.",
    ),
    caution: n(
      "유망하다는 말은 시기마다 바뀝니다. 남이 유망하다고 한 이유보다 내가 오래 앉아 있을 수 있는지를 기준으로 보세요. 10년 전 유망 직종 목록과 지금의 목록을 비교해 보면 얼마나 자주 바뀌는지 알 수 있습니다.",
      "What counts as promising changes by the year. Weigh how long you can sit with it over what others call promising. Comparing a list of promising fields from ten years ago with today's list shows how often the ranking turns over.",
    ),
    patterns: [/전공|학과|진학|유학|대학원|편입할|자퇴/u, /major|graduate school|study abroad/i],
  },
  // ── 연애·관계 ──────────────────────────────────────────────────────────────
  {
    id: "reunion",
    focus: "relationships",
    label: n("재회", "Getting back together"),
    verdict: n(
      "재회 가능성은 남아 있습니다. 다만 상대의 마음보다 헤어진 이유가 달라졌는지가 결정합니다. 그 조건이 그대로면 다시 만나도 같은 지점에서 끝납니다.",
      "There is room for this to work again, decided by whether the reason it ended has changed rather than by their feelings.",
    ),
    framing: n(
      "재회 가능성은 상대의 마음보다, 헤어진 이유가 실제로 달라졌는지에 더 크게 걸립니다. 그 조건이 그대로면 같은 결말이 반복되기 쉽습니다. 예를 들어 연락 빈도 때문에 헤어졌다면, 다시 만나기 전에 그 빈도에 대한 합의가 실제로 있었는지 확인해야 합니다.",
      "Whether it works again depends less on their feelings than on whether the reason it ended actually changed. If contact frequency was the breaking point, for instance, check whether an actual agreement on it exists before meeting again.",
    ),
    observe: n(
      "헤어진 직접적인 이유를 한 문장으로 적고, 그 이유가 지금 사라졌다는 증거가 행동으로 있는지 확인해 보세요. 말이 아니라 행동이어야 합니다. 최근 한 달 동안 상대가 그 문제와 관련해 먼저 바뀐 행동을 보인 적이 있는지 구체적으로 떠올려 보세요.",
      "Write the direct reason it ended in one sentence, then look for behaviour — not words — showing it is gone. Recall specifically whether they have shown a changed behaviour related to that issue, unprompted, in the last month.",
    ),
    action: n(
      "연락하기 전에, 다시 만난다면 무엇이 달라져야 하는지 두 가지를 적어 두세요. 그게 없으면 연락은 미루셔도 됩니다. 헤어진 지 한 달이 채 안 됐다면 감정이 정리되기 전이라 연락을 서두르지 않는 편이 낫습니다.",
      "Before reaching out, write two things that would have to be different. Without them, the message can wait. If less than a month has passed, feelings are usually still unsettled, so it is better not to rush the message.",
    ),
    caution: n(
      "상대의 마음을 확신시켜 준다는 말은 사실이 아닙니다. 상대가 명확히 거절했다면 그 의사를 존중하는 것이 우선입니다. 차단이나 연락 거부 이후에 다른 계정으로 계속 연락을 시도하는 것은 관계 회복에 도움이 되지 않습니다.",
      "No one can confirm another person's feelings. If they have clearly declined, that answer comes first. Continuing to reach out through another account after being blocked or told to stop does not help the relationship recover.",
    ),
    patterns: [/재회|다시 만날|다시 잘될|돌아올까|헤어진 (사람|남자|여자)|다시 연락/u, /get back together|reunion|ex/i],
  },
  {
    id: "crush",
    focus: "relationships",
    label: n("짝사랑·고백", "Unspoken feelings"),
    verdict: n(
      "표현해도 되는 상황입니다. 다만 상대의 마음을 확인하려 기다릴수록 판단이 흐려집니다. 거절당해도 유지하고 싶은 관계인지가 기준입니다.",
      "Speaking is workable. Waiting for certainty only clouds it; the test is whether you want this relationship even after a no.",
    ),
    framing: n(
      "상대의 마음은 알 수 없지만, 나에게 편한 거리와 감당할 수 있는 결과는 미리 정할 수 있습니다. 예를 들어 거절당해도 계속 같은 모임에 나갈 수 있는지를 미리 생각해 두면 고백 이후가 덜 두렵습니다.",
      "Their feelings are unknowable, but the distance you are comfortable with and the outcome you can carry are decidable now. Thinking in advance about whether you could keep attending the same gatherings after a no makes the aftermath less daunting.",
    ),
    observe: n(
      "먼저 연락한 비율, 약속을 잡을 때 누가 제안했는지, 답장 속도를 최근 2주 기준으로 세어 보세요. 감정보다 이쪽이 정확합니다. 먼저 연락한 비율이 8대 2에 가깝게 나만 높다면, 지금은 호감보다 배려로 유지되는 관계일 수 있습니다.",
      "Over two weeks, count who reached out first, who proposed plans, and reply speed. That reads truer than feeling. If the split is close to eight-to-two with you initiating, the relationship may be running on courtesy rather than interest right now.",
    ),
    action: n(
      "고백할지 정하기 전에, 거절당해도 유지하고 싶은 관계인지 스스로 한 문장으로 답해 보세요. 고백은 둘만 있는 조용한 자리에서, 상대가 바로 대답을 서두르지 않아도 된다고 먼저 말해주는 편이 부담을 줄입니다.",
      "Before deciding to speak, answer in one sentence whether you want this relationship even after a no. Speaking somewhere quiet and private, and telling them upfront they do not need to answer immediately, lowers the pressure.",
    ),
    caution: n(
      "반복된 거절 신호를 확인 전에 호감으로 해석하지 마세요. 상대의 일상이나 일정에 개입하는 방식은 피하는 것이 안전합니다. 같은 사람에게 세 번 이상 고백하거나 거절 후에도 계속 다가가는 것은 상대에게 부담이나 두려움을 줄 수 있습니다.",
      "Do not read repeated declines as interest, and avoid approaches that intrude on their routine. Confessing to the same person three or more times, or continuing to approach after a decline, can make them feel pressured or unsafe.",
    ),
    patterns: [/짝사랑|고백|좋아하는 사람|마음을? 표현|썸|호감/u, /crush|confess|feelings for someone/i],
  },
  {
    id: "breakup",
    focus: "relationships",
    label: n("이별", "A breakup"),
    verdict: n(
      "지금 내리는 결정은 회복 상태에 좌우됩니다. 관계 자체보다 지금 몸과 잠이 어떤지가 판단을 정합니다. 기간을 정해두고 그 안에는 결정하지 않는 편이 낫습니다.",
      "What you decide now tracks how recovered you are. Set a period in which you will not decide.",
    ),
    framing: n(
      "이별 직후의 판단은 대개 회복 상태에 좌우됩니다. 결정을 서두르기보다 지금 상태를 아는 편이 낫습니다. 이별 후 2~4주는 감정 기복이 가장 크게 나타나는 시기이므로 이 기간의 판단은 특히 조심하는 것이 좋습니다.",
      "Judgment right after a breakup mostly tracks how recovered you are. Knowing that beats deciding fast. The two to four weeks after a breakup tend to bring the widest emotional swings, so judgment made in that window deserves extra caution.",
    ),
    observe: n(
      "지난 일주일 중 잠·식사·연락 빈도가 평소와 달랐던 날을 세어 보세요. 회복 정도를 감정보다 정확히 알려줍니다. 평소와 다른 날이 7일 중 5일을 넘는다면 아직 결정을 내리기엔 이른 시점일 수 있습니다.",
      "Count the days last week where sleep, meals, or contact differed from usual. It reads recovery better than mood does. If more than five of the seven days differ from your baseline, it may still be too early to make a decision.",
    ),
    action: n(
      "당분간 연락 여부를 매번 고민하지 않도록, 기간을 하나 정해 두고 그 기간에는 결정하지 않기로 해보세요. 2주에서 한 달 정도로 기간을 잡고, 그 안에는 SNS나 연락처를 일부러 확인하지 않는 규칙을 함께 정해 보세요.",
      "Set one period during which you will not decide, so contact is not re-litigated every day. Set the period at two weeks to a month, and pair it with a rule not to deliberately check their social media or messages during that time.",
    ),
    caution: n(
      "상대의 근황을 계속 확인하는 행동은 회복을 늦춥니다. 힘들면 주변 사람이나 상담 창구를 먼저 찾으세요. 잠이나 식사가 2주 넘게 심하게 무너져 있다면 상담이나 진료를 통해 상태를 확인하는 것이 안전합니다.",
      "Monitoring their updates slows recovery. If it is heavy, reach a person or a counselling line first. If sleep or appetite has been seriously disrupted for more than two weeks, checking in with counselling or a clinic is the safer route.",
    ),
    // "정리해야" on its own also fits tidying a policy or a debt, so it only counts
    // here alongside something that marks a relationship.
    patterns: [
      /이별|헤어졌|헤어질|(관계|만남|연애|이 사람)[^.。]{0,10}(정리|끝내)/u,
      /breakup|broke up|should I end (it|this relationship)/i,
    ],
  },
  {
    id: "marriage",
    focus: "relationships",
    label: n("결혼", "Marriage"),
    verdict: n(
      "결혼해도 되는 관계입니다. 다만 감정보다 생활 조건에서 갈립니다. 돈·가족·집안일 세 가지를 말로 확인했다면 넘어가셔도 됩니다.",
      "This is a workable marriage, decided by living conditions rather than feeling. If money, family, and housework have been talked through, proceed.",
    ),
    framing: n(
      "결혼은 감정보다 생활 조건이 오래 남습니다. 돈, 시간, 가족, 거주지에 대한 합의가 실제로 있는지를 보세요. 결혼 전 상담에서 가장 자주 다시 불거지는 주제가 돈 관리 방식과 양가 부모님과의 거리감입니다.",
      "Living conditions outlast feeling. Look for actual agreement on money, time, family, and where you live. In pre-marriage counselling, money management and distance from each set of parents are the two topics that resurface most often.",
    ),
    observe: n(
      "돈 관리, 명절과 양가 방문, 자녀 계획, 집안일 분담 네 가지에 대해 서로 말로 확인한 적이 있는지 하나씩 확인해 보세요. 네 가지 중 세 개 이상이 아직 대화된 적 없다면, 날짜를 잡고 상견례 전에 먼저 이야기하는 편이 안전합니다.",
      "Check whether money, family visits, children, and housework have each been talked through out loud. If three or more of the four have never been discussed, setting a date to talk them through before meeting the families is the safer order.",
    ),
    action: n(
      "네 가지 중 아직 이야기하지 않은 것 하나를 골라 이번 주에 물어보세요. 답이 아니라 대화가 되는지가 중요합니다. 대화 중 한쪽이 계속 화제를 돌리거나 즉답을 피한다면, 그 주제부터 먼저 시간을 들여 풀어야 합니다.",
      "Raise one of those four this week. Whether it becomes a conversation matters more than the answer. If either of you keeps changing the subject or avoiding a direct answer, that topic is the one to work through first.",
    ),
    caution: n(
      "궁합이 결혼 여부를 정해주지 않습니다. 상대의 빚, 폭력, 중독 같은 사안은 상징이 아니라 사실 확인의 영역입니다. 혼인신고 전에 상대 명의의 채무나 신용 상태를 서로 공유했는지 확인하는 것도 실질적으로 도움이 됩니다.",
      "Compatibility does not decide a marriage. Debt, violence, or addiction are matters of fact, not symbolism. Confirming beforehand that debts and credit standing under each other's names have actually been shared also helps in practice.",
    ),
    patterns: [/결혼|혼인|프러포즈|상견례|웨딩/u, /marriage|marry|engaged|wedding/i],
  },
  {
    id: "meeting",
    focus: "relationships",
    label: n("새로운 만남", "Meeting someone"),
    verdict: n(
      "만남은 충분히 생깁니다. 다만 사람을 찾기보다 편했던 자리의 조건을 반복하는 쪽이 확률이 높습니다. 그 조건을 한 번 만들어 보시면 달라집니다.",
      "Meetings will happen. Repeating the setting that felt easy works better than searching for a person.",
    ),
    framing: n(
      "언제 누구를 만날지는 알 수 없지만, 어떤 자리에서 편했는지는 이미 데이터가 있습니다. 낯선 사람이 많은 자리보다 아는 사람을 통해 소개받는 자리에서 더 오래가는 관계가 시작되는 경우가 많습니다.",
      "When or whom you meet is unknowable, but which settings felt easy is already recorded in your past. Relationships that last tend to start more often through an introduction by someone you know than in a room full of strangers.",
    ),
    observe: n(
      "최근 1년 중 사람을 편하게 만났던 자리 세 곳을 적고, 공통점이 무엇이었는지 찾아보세요. 정기적으로 나가는 모임인지, 일회성 자리인지도 함께 표시하면 반복 가능한 조건이 드러납니다.",
      "List three settings where meeting people felt easy this year and find what they had in common. Mark whether each was a recurring group or a one-off event, since that reveals which condition can be repeated.",
    ),
    action: n(
      "그 공통점에 맞는 자리 하나를 이번 달에 한 번 만들어 보세요. 사람을 찾기보다 조건을 반복하는 쪽이 확률이 높습니다. 한 번으로 끝내지 말고 다음 달에도 비슷한 자리를 한 번 더 만들어, 빈도 자체를 늘려보세요.",
      "Recreate that setting once this month. Repeating the condition works better than searching for a person. Do not stop at one; create a similar setting again next month so the frequency itself increases.",
    ),
    caution: n(
      "만날 시기를 특정해 주는 말은 근거가 없습니다. 온라인에서 만난 상대에게 금전 요구를 받으면 즉시 중단하세요. 투자나 사업을 함께 하자는 제안이 만난 지 한 달도 안 돼 나온다면 특히 의심해야 합니다.",
      "No one can name a date. If someone met online asks for money, stop there. A proposal to invest together or start a business less than a month after meeting deserves particular suspicion.",
    ),
    patterns: [/소개팅|새로운 사람|만남|연애하고 싶|애인이 생길|인연/u, /meet someone|dating app|new relationship/i],
  },
  // ── 가족 ──────────────────────────────────────────────────────────────────
  {
    id: "parents",
    focus: "relationships",
    label: n("부모와의 관계", "Parents"),
    verdict: n(
      "이 관계는 나아집니다. 다만 옳고 그름을 가리려 하면 반복됩니다. 거리와 역할을 다시 정하는 쪽이 실제로 작동합니다.",
      "This improves, but not by settling who is right. Renegotiating distance and role is what actually works.",
    ),
    framing: n(
      "부모와의 문제는 대개 옳고 그름이 아니라 거리와 역할에서 생깁니다. 설득보다 경계가 효과적인 경우가 많습니다. 예를 들어 매일 걸려오는 전화가 부담이라면, 통화 자체를 줄이기보다 요일과 시간을 정해 놓는 쪽이 갈등을 줄입니다.",
      "Trouble with parents usually sits in distance and role rather than who is right. A boundary often works where persuasion does not. If a daily phone call feels like a burden, for instance, fixing a day and time reduces friction more than cutting calls outright.",
    ),
    observe: n(
      "최근 부담을 느낀 요구 세 가지를 적고, 그중 실제로 내가 결정할 수 있는 것과 아닌 것을 나눠 보세요. 돈이 얽힌 요구는 특히 구분이 필요합니다. 빌려주는 것인지 드리는 것인지를 먼저 정해야 나중에 오해가 없습니다.",
      "List three recent demands and split them into what is actually yours to decide and what is not. Requests involving money need special separation. Deciding upfront whether it is a loan or a gift prevents disputes later.",
    ),
    action: n(
      "이번 주에 한 가지에 대해서만 할 수 있는 범위를 구체적으로 말해 보세요. 전부를 한 번에 정리하려 하지 않아도 됩니다. 말할 때는 상대를 비난하는 문장보다 내가 할 수 있는 것과 할 수 없는 것을 나누는 문장으로 시작하는 편이 받아들여지기 쉽습니다.",
      "State the limit on exactly one thing this week. It does not have to be settled all at once. Framing it as what you can and cannot do, rather than as a criticism, tends to land better than the alternative.",
    ),
    caution: n(
      "돈 문제는 감정과 분리해 문서로 남기세요. 건강 문제는 상징이 아니라 진료로 확인해야 합니다. 정기적으로 드리는 생활비라도 금액과 날짜를 계좌 이체 기록으로 남겨두면 나중에 분쟁을 줄일 수 있습니다.",
      "Keep money matters written and separate from feeling. Health belongs to a clinic, not to symbolism. Even regular living expenses are worth keeping as bank transfer records with amount and date, to reduce disputes later.",
    ),
    patterns: [/부모|엄마|아빠|어머니|아버지|친정|본가/u, /parents|mother|father/i],
  },
  {
    id: "child_temperament",
    focus: "relationships",
    label: n("자녀 성향·진로", "Child's temperament and direction"),
    verdict: n(
      "아이의 진로를 지금 하나로 정할 필요는 없습니다. 지금 나이에서 뚜렷한 것은 직업이 아니라 배우는 방식과 힘을 내는 조건입니다. 그 조건에 맞는 활동을 넓게 경험시키는 쪽이 지금은 맞습니다.",
      "There is no need to fix the child's future occupation now. What is actually visible at this age is how they learn and what conditions bring out their effort, not a job title. Broad exposure to activities that fit those conditions is the right move for now.",
    ),
    framing: n(
      "이 나이의 아이는 재능보다 학습 방식과 압박에 반응하는 방식이 먼저 드러납니다. 어떤 직업이 맞는지보다, 어떤 상황에서 아이가 스스로 몰입하는지를 보는 편이 지금은 더 정확합니다.",
      "At this age, how a child learns and reacts to pressure shows up before any specific talent does. Watching what situation makes the child absorbed on their own is more accurate right now than asking which career fits.",
    ),
    observe: n(
      "아이가 스스로 오래 붙잡고 있는 활동과, 시키면 금방 지루해하는 활동을 각각 세 가지 적어보세요. 잘하는 것보다 스스로 이어가는 것이 지금은 더 중요한 신호입니다.",
      "Write down three activities the child sticks with on their own and three they tire of quickly when assigned. What they continue unprompted is a more important signal right now than what they are good at.",
    ),
    action: n(
      "이번 달에는 아이가 관심을 보인 활동과 가까운 다른 종류를 하나 더 경험시켜 보세요. 넓게 겪어보게 하는 편이 하나를 깊게 시키는 것보다 지금 시기에는 낫습니다. 잘했다는 칭찬보다 무엇을 어떻게 했는지 구체적으로 물어보는 대화가 동기를 더 오래 지속시킵니다.",
      "This month, let the child try one more activity adjacent to something they already showed interest in. Broad exposure beats deep specialization at this age. Asking specifically what they did and how, rather than just praising the result, sustains motivation longer than praise alone.",
    ),
    caution: n(
      "지금 나타나는 성향으로 직업을 단정하지 마세요. 압박에 유난히 예민하게 반응하거나 또래 관계를 계속 피한다면, 그건 진로 문제가 아니라 소아과나 아동상담 전문가가 봐야 할 신호일 수 있습니다.",
      "Do not lock in an occupation from what shows up now. If the child reacts unusually sharply to pressure or keeps avoiding peers, that is not a career question — it may be a sign for a pediatrician or a child counsellor to look at.",
    ),
    // Needs 아이/자녀 near 성향/진로/적성/재능/기질 in either order, so a generic
    // worry about a child (which belongs to "children" below) does not match here.
    patterns: [
      /(아이|자녀|아들|딸)[^.。]{0,10}(성향|진로|적성|재능|기질)|(성향|진로|적성|재능|기질)[^.。]{0,10}(아이|자녀|아들|딸)/u,
      /child('s)? (temperament|personality|career|aptitude|talent)/i,
    ],
  },
  {
    id: "children",
    focus: "relationships",
    label: n("자녀·육아", "Children"),
    verdict: n(
      "걱정하시는 만큼 나쁜 상황은 아닙니다. 아이의 미래보다 지금의 조건에서 확인할 수 있는 것이 많습니다. 함께 보내는 시간이 가장 크게 작용합니다.",
      "This is less bad than it feels. More is visible in today's conditions than in the child's future, and time together weighs most.",
    ),
    framing: n(
      "아이에 대한 걱정은 대개 미래에 있고, 확인할 수 있는 것은 대개 오늘의 조건에 있습니다. 예를 들어 성적보다 잠자는 시간과 식사 시간이 일정한지가 지금 상태를 더 정확히 보여주는 경우가 많습니다.",
      "Worry about a child lives in the future; what can be checked lives in today's conditions. Whether sleep and meal times stay regular, for instance, often shows current state more accurately than grades do.",
    ),
    observe: n(
      "최근 걱정되는 행동이 어떤 시간대와 상황에서 자주 나오는지 일주일만 기록해 보세요. 학교에서 있었던 날과 없었던 날, 특정 사람을 만난 뒤인지도 함께 표시하면 계기가 드러납니다.",
      "For one week, note when and where the behaviour you worry about tends to appear. Marking whether it was a school day and whether it followed contact with a particular person helps reveal the trigger.",
    ),
    action: n(
      "아이의 미래를 묻기보다, 이번 주에 아이와 단둘이 방해 없이 보내는 시간을 한 번 만들어 보세요. 이 시간에는 휴대폰을 치우고 30분이라도 아이가 정하는 활동을 따라가 보는 편이 효과가 큽니다.",
      "Rather than asking about their future, make one uninterrupted stretch of time together this week. Putting the phone away and following an activity the child chooses, even for just thirty minutes, tends to matter more than the length.",
    ),
    caution: n(
      "발달이나 정서에 대한 판단은 상징으로 하지 마세요. 걱정되면 소아과나 상담 기관에서 확인하는 것이 맞습니다. 수면, 식사, 또래 관계 중 두 가지 이상에서 두 달 넘게 변화가 이어진다면 전문가 상담을 미루지 않는 편이 좋습니다.",
      "Do not judge development or emotional health symbolically. A clinic or counsellor is the right place. If two or more of sleep, eating, or peer relationships stay changed for more than two months, it is worth not delaying a professional opinion.",
    ),
    patterns: [/아이|자녀|아들|딸|육아|사춘기|입시/u, /my child|son|daughter|parenting/i],
  },
  {
    id: "inlaws",
    focus: "relationships",
    label: n("시댁·처가", "In-laws"),
    verdict: n(
      "조정 가능한 문제입니다. 다만 상대 가족을 바꾸려 하면 지칩니다. 배우자와 먼저 합의하는 순서로 가면 대부분 정리됩니다.",
      "This is adjustable, but aiming to change their family exhausts you. Agreeing with your partner first settles most of it.",
    ),
    framing: n(
      "이 문제는 대부분 배우자와의 합의가 먼저이고, 상대 가족과의 대화는 그다음입니다. 순서가 바뀌면 같은 일이 반복됩니다. 예를 들어 명절 방문 일정은 배우자가 먼저 부모님께 전달하는 쪽이, 내가 직접 말하는 쪽보다 갈등이 적습니다.",
      "This is usually settled with your partner first and their family second. Reversed, it repeats. For holiday visit schedules, for instance, it causes less friction when your partner relays it to their parents than when you say it directly.",
    ),
    observe: n(
      "부담을 느낀 상황에서 배우자가 어느 쪽에 서 있었는지 최근 세 번을 적어보세요. 배우자가 그 자리에서 바로 편을 들었는지, 나중에 따로 이야기했는지도 구분해서 적으면 패턴이 보입니다.",
      "For the last three difficult moments, write where your partner stood. Also note whether your partner sided with you on the spot or only talked it through afterward, since that split shows the pattern.",
    ),
    action: n(
      "다음 명절이나 방문 전에 배우자와 둘이서 시간·비용·역할을 먼저 정해 두세요. 정한 내용은 방문 당일 기준으로 몇 시에 도착해서 몇 시에 나올지까지 구체적인 시각으로 정해두면 흔들리지 않습니다.",
      "Before the next visit, agree time, cost, and roles with your partner alone. Pin the agreement down to specific arrival and departure times on the day itself so it does not get renegotiated in the moment.",
    ),
    caution: n(
      "상대 가족을 바꾸는 것을 목표로 삼으면 대개 지칩니다. 조정 가능한 것은 우리 쪽의 기준입니다. 금전적인 요구가 반복된다면 감정과 별개로 부부가 감당 가능한 상한선을 먼저 정해두는 것이 좋습니다.",
      "Aiming to change their family usually exhausts you. What is adjustable is your own standard. If financial requests keep recurring, setting a ceiling the couple can actually afford, separate from the emotion of it, comes first.",
    ),
    patterns: [/시댁|처가|시어머니|장모|며느리|사위|명절/u, /in-laws|mother-in-law/i],
  },
  {
    id: "conflict",
    focus: "relationships",
    label: n("다툼·갈등", "A recurring argument"),
    verdict: n(
      "이 갈등은 풀립니다. 다만 주제를 바꾼다고 해결되지 않습니다. 다툼이 시작되는 시간대와 상태를 바꾸면 대부분 줄어듭니다.",
      "This resolves, but not by changing the subject. Changing when and in what state it starts reduces most of it.",
    ),
    framing: n(
      "반복되는 다툼은 주제가 아니라 방식에서 되풀이되는 경우가 많습니다. 무엇으로 싸웠는지보다 어떻게 시작됐는지를 보세요. 예를 들어 목소리가 커지는 시점이 항상 같다면, 그 시점 직전에 무슨 말이 나왔는지가 실제 발화점입니다.",
      "A repeating argument usually repeats in its method, not its topic. Look at how it starts. If voices always rise at the same point, for instance, what was said just before that moment is the real trigger.",
    ),
    observe: n(
      "최근 다툼 세 번의 시작 30분 전에 각자 무엇을 하고 있었는지 적어보세요. 피로·시간대·장소가 자주 겹칩니다. 세 번 중 두 번 이상 같은 시간대(예: 늦은 밤, 퇴근 직후)에 시작됐다면 그 시간대를 피하는 것만으로도 빈도가 줄어듭니다.",
      "Write what each of you was doing thirty minutes before the last three arguments. Fatigue, time, and place often repeat. If two or more of the three started in the same window — late at night or right after work, say — avoiding that window alone can cut the frequency.",
    ),
    action: n(
      "다음 대화에서는 지금 필요한 것이 공감인지, 정보인지, 결정인지를 먼저 말하고 시작해 보세요. 대화가 다시 커지려 하면 그 자리에서 끝내려 하지 말고, 10분 뒤나 다음 날 다시 이야기하자고 먼저 제안해 보세요.",
      "Open the next conversation by naming whether you need empathy, information, or a decision. If it starts escalating again, propose picking it up in ten minutes or the next day rather than forcing it to finish then and there.",
    ),
    caution: n(
      "폭력이나 위협이 있었다면 관계 조언의 영역이 아닙니다. 안전을 먼저 확보하고 공적인 도움을 받으세요. 물건을 던지거나 문을 세게 닫는 행동이 반복된다면 이미 언어적 다툼의 범위를 넘어선 신호일 수 있습니다.",
      "If there has been violence or threat, this is not relationship advice. Secure safety and get formal help. Repeated throwing of objects or slamming doors can already be a sign this has moved past verbal disagreement.",
    ),
    patterns: [/싸움|다툼|싸워|갈등|자꾸 부딪|말다툼/u, /argument|fight|conflict with/i],
  },
  // ── 돈 ────────────────────────────────────────────────────────────────────
  {
    id: "big_spend",
    focus: "money",
    label: n("목돈 지출", "A large purchase"),
    verdict: n(
      "지출해도 되는지는 금액이 아니라 회복 가능성으로 정해집니다. 이 지출 뒤에도 3개월을 버틸 수 있다면 진행하셔도 됩니다.",
      "This is decided by recoverability rather than size. If three months would still be covered afterwards, proceed.",
    ),
    framing: n(
      "큰 지출은 감당 가능한 손실 범위 안에 있는지로 판단하는 편이 안전합니다. 좋은 선택인지보다 회복 가능한 선택인지를 보세요. 예를 들어 전체 자산의 10퍼센트를 넘는 지출이라면 실행 전에 하루 이상 시간을 두고 다시 검토하는 편이 좋습니다.",
      "A large spend is safer judged by whether the loss is survivable than by whether it is a good idea. If the spend exceeds about ten percent of total assets, for instance, it is worth revisiting after at least a day before committing.",
    ),
    observe: n(
      "이 지출을 하고 나서도 3개월을 버틸 수 있는지 계산해 보세요. 그 답이 대부분을 정합니다. 월 고정비에 이 지출로 늘어나는 할부금이나 유지비까지 더해서 계산해야 실제 숫자가 나옵니다.",
      "Work out whether three months would still be covered afterwards. That answer decides most of it. Add in any new installment payments or upkeep costs the purchase creates to your monthly fixed costs to get the real number.",
    ),
    action: n(
      "결정을 하루만 미루고, 같은 돈으로 할 수 있는 다른 선택 두 가지를 적어 나란히 비교해 보세요. 매장이나 판매자가 오늘만 할인이라고 압박한다면, 그 조건 자체가 하루 미루기 어렵게 만드는 장치일 수 있습니다.",
      "Delay one day and write two other things the same money could do, side by side. If a seller pressures you with a today-only discount, that condition itself may be designed to make the one-day delay feel harder.",
    ),
    caution: n(
      "수익이나 시세를 알려줄 수는 없습니다. 원금을 잃어도 되는 돈이 아니면 확신을 주는 말을 특히 조심하세요. 계약서나 견적서 없이 구두로만 진행되는 큰 거래는 금액과 무관하게 서면으로 먼저 남겨달라고 요청하세요.",
      "No return or price can be told to you. If the money cannot be lost, be most careful with certainty. For any large deal proceeding only by word of mouth, ask for it in writing first, regardless of the amount involved.",
    ),
    // Saving up is the opposite situation and has its own topic.
    // Saving up is the opposite situation and has its own topic, so a sentence about
    // accumulating a sum must not be read as one about spending it.
    patterns: [
      /목돈(?!\s*을?\s*(모|저축|만들))|큰돈|지출|살까|구매|차를?\s*살|명품/u,
      /large purchase|should I buy/i,
    ],
  },
  {
    id: "debt",
    focus: "money",
    label: n("빚·상환", "Debt"),
    verdict: n(
      "정리 가능한 규모입니다. 다만 전부를 한 번에 갚으려 하면 오래 갑니다. 금리가 가장 높은 것 하나부터 잡으면 순서가 잡힙니다.",
      "This is a manageable shape. Paying everything at once drags; taking the highest rate first sets the order.",
    ),
    framing: n(
      "빚은 순서 문제입니다. 금리가 높은 것부터인지, 금액이 작은 것부터인지만 정해도 대부분 정리됩니다. 금리가 연 15퍼센트를 넘는 항목이 있다면, 금액이 작더라도 그것부터 우선 처리하는 편이 이자 부담을 줄입니다.",
      "Debt is an ordering problem. Choosing highest rate first or smallest balance first settles most of it. If any balance carries an annual rate above roughly fifteen percent, tackling it first — even if small — cuts the interest burden faster.",
    ),
    observe: n(
      "가진 채무를 금액·금리·상환일 세 열로 한 장에 적어보세요. 흩어져 있을 때보다 결정이 쉬워집니다. 카드 리볼빙이나 현금서비스처럼 금리가 잘 드러나지 않는 항목은 실제 연이율을 따로 계산해 넣어야 합니다.",
      "Put every balance on one page with amount, rate, and due date. For revolving credit or cash advances, where the rate is not obvious at a glance, calculate the actual annual rate separately and add it in.",
    ),
    action: n(
      "이번 주에 금리가 가장 높은 것 하나만 골라 상환 방법을 알아보세요. 전부를 한 번에 해결하려 하지 않아도 됩니다. 다른 채무는 최소 상환액만 유지하고, 남는 돈은 전부 그 하나에 몰아 갚는 방식이 총 이자를 줄입니다.",
      "Look into just the highest-rate balance this week. It does not all have to move at once. Keeping the rest at minimum payments and funneling any spare money into that single balance reduces total interest paid.",
    ),
    caution: n(
      "연체가 시작됐다면 상징이 아니라 신용회복위원회 같은 공적 창구를 먼저 이용하세요. 대출을 권하는 곳을 조심하세요. 연체가 90일을 넘기면 신용도에 미치는 영향이 커지므로, 그 전에 채권자와 상환 조정을 먼저 상의하는 것이 좋습니다.",
      "If payments are already late, use a formal debt counselling body, not symbolism. Be wary of anyone offering more credit. Once a delinquency passes ninety days its effect on credit standing grows sharply, so raising a repayment adjustment with the creditor before that point is better.",
    ),
    patterns: [/빚|대출|카드값|연체|상환|파산|신용/u, /debt|loan|repay|overdue/i],
  },
  {
    id: "investment",
    focus: "money",
    label: n("투자", "Investing"),
    verdict: n(
      "지금 판단은 종목이 아니라 결정 방식에서 갈립니다. 파는 기준을 미리 적어두면 결과가 달라집니다. 수익 자체는 알려드릴 수 없습니다.",
      "What decides this is how you decide, not what you hold. Writing the exit condition in advance changes the outcome.",
    ),
    framing: n(
      "투자 결과는 알려드릴 수 없습니다. 대신 결정 방식과 감당 범위는 지금 점검할 수 있습니다. 예를 들어 전체 투자금 중 한 종목에 얼마의 비중을 넘기지 않을지 미리 정해두면 충동 매수를 줄일 수 있습니다.",
      "Investment outcomes cannot be told. How you decide and what you can absorb can be checked now. Deciding in advance what share of total funds any single position may take, for instance, curbs impulsive buying.",
    ),
    observe: n(
      "최근 매수·매도 결정 세 번이 어떤 계기로 시작됐는지 적어보세요. 정보였는지, 불안이었는지, 남의 말이었는지가 드러납니다. 세 번 중 두 번 이상이 불안이나 남의 말에서 시작됐다면, 다음 결정 전에 하루를 두고 다시 보는 규칙이 도움이 됩니다.",
      "Write what triggered your last three buy or sell decisions: information, anxiety, or someone else's word. If two or more of the three started from anxiety or a tip, adding a one-day pause before the next decision helps.",
    ),
    action: n(
      "지금 보유 중인 것 하나에 대해 '얼마가 되면 판다'는 기준을 미리 적어 두세요. 손실 기준과 이익 기준을 각각 숫자로 정해 두면, 그 순간의 감정에 따라 기준이 흔들리는 것을 막을 수 있습니다.",
      "For one holding, write the exit condition in advance. Setting both a loss limit and a profit target as specific numbers keeps the rule from bending under in-the-moment emotion.",
    ),
    caution: n(
      "이 서비스는 투자 조언이 아니며 수익을 예측하지 않습니다. 원금 보장이나 확정 수익을 말하는 곳은 대부분 사기입니다. 월 몇 퍼센트의 확정 수익을 제시하며 지인을 통해 가입을 권유하는 방식은 특히 의심해야 합니다.",
      "This is not investment advice and forecasts no return. Guaranteed principal or fixed returns are almost always fraud. Be especially wary of pitches offering a fixed monthly percentage return and recruiting through personal contacts.",
    ),
    patterns: [/투자|주식|코인|비트|부동산 투자|펀드|수익률/u, /invest|stock|crypto|fund return/i],
  },
  {
    id: "relocation",
    focus: "money",
    label: n("이사·거주", "Moving house"),
    verdict: n(
      "이사는 진행하셔도 됩니다. 다만 집보다 이동 시간과 고정비가 일상을 더 크게 바꿉니다. 그 두 숫자를 재보시면 답이 나옵니다.",
      "The move is workable. Commute and fixed costs change daily life more than the home does; measure those two.",
    ),
    framing: n(
      "이사는 집보다 이동 시간과 고정비가 일상을 더 크게 바꿉니다. 편도 통근 시간이 20분 늘어나면 한 해로 환산했을 때 100시간 넘게 이동에 쓰는 셈이 됩니다.",
      "A move changes daily life through commute and fixed costs more than through the home itself. A twenty-minute increase in one-way commute time adds up to more than a hundred hours spent traveling over a year.",
    ),
    observe: n(
      "후보지에서 자주 가는 곳까지 걸리는 시간을 실제로 한 번 재보고, 월 고정비 차이를 계산해 보세요. 관리비, 주차비, 대중교통비까지 포함해야 월세 차이만 봤을 때와 실제 부담이 달라집니다.",
      "Time the actual trip to the places you go often, and calculate the monthly difference. Including management fees, parking, and transit costs shows a different real burden than comparing rent alone.",
    ),
    action: n(
      "계약 전에 그 동네를 평일 저녁과 주말에 각각 한 번씩 다녀오세요. 낮에만 본 인상과 다를 수 있습니다. 가능하면 밤 10시 이후 소음 수준과 가로등 상태도 한 번 확인해 두면 계약 후 후회를 줄일 수 있습니다.",
      "Visit once on a weekday evening and once at the weekend before signing. Checking noise levels and street lighting after 10pm as well, if possible, reduces regret after signing.",
    ),
    caution: n(
      "전세·보증금은 등기부등본과 선순위 확인이 먼저입니다. 이 부분은 상징으로 대신할 수 없습니다. 전입신고와 확정일자를 계약 당일 바로 받아두면 이후 문제가 생겼을 때 보증금을 지키는 데 도움이 됩니다.",
      "Deposits require checking the register and prior claims. Symbolism cannot stand in for that. Registering your residence and getting a fixed date stamp on the day of the contract helps protect the deposit if a problem arises later.",
    ),
    patterns: [/이사|이주|전세|월세|자취|독립할|집을? 구/u, /move house|relocate|lease|rent/i],
  },
  // ── 성장·자기 ─────────────────────────────────────────────────────────────
  {
    id: "burnout",
    focus: "growth",
    label: n("번아웃·소진", "Burnout"),
    verdict: n(
      "회복됩니다. 다만 지금 상태에서 큰 결정을 내리면 후회가 남습니다. 회복이 먼저이고 방향은 그 다음입니다.",
      "This recovers. Large decisions made from here tend to be regretted; recovery first, direction after.",
    ),
    framing: n(
      "지친 상태에서는 큰 결정을 미루는 편이 대체로 낫습니다. 회복이 먼저이고 방향은 그다음입니다. 지친 상태에서 내린 퇴사나 이별 같은 큰 결정은 두 달 뒤 다시 봤을 때 후회로 이어지는 경우가 적지 않습니다.",
      "When depleted, large decisions are usually better postponed. Recovery first, direction after. Major decisions like quitting or ending a relationship made while depleted are not uncommonly regretted when revisited two months later.",
    ),
    observe: n(
      "지난 2주 동안 잠든 시각, 깬 시각, 쉬었다고 느낀 시간을 적어보세요. 느낌보다 정확합니다. 쉬었다고 느낀 시간이 하루 1시간이 채 안 된다면 지금은 새로운 일을 벌이기보다 줄이는 시기입니다.",
      "Log sleep, waking, and the hours that actually felt like rest for two weeks. If time that actually felt like rest comes to under an hour a day, this is a period for cutting back rather than starting new things.",
    ),
    action: n(
      "이번 주에 줄일 수 있는 일 하나를 정해 실제로 빼보세요. 더하는 것보다 빼는 쪽이 회복에 빠릅니다. 뺀 자리에 새 일정을 바로 채우지 말고, 최소 일주일은 비워 둔 채로 몸이 어떻게 반응하는지 지켜보세요.",
      "Remove one commitment this week. Subtracting recovers faster than adding. Do not refill the freed slot right away; leave it empty for at least a week and watch how your body responds.",
    ),
    caution: n(
      "2주 이상 잠·식욕·의욕이 계속 무너져 있다면 상징이 아니라 진료나 상담이 필요한 신호입니다. 가슴 두근거림이나 이유 없는 눈물처럼 몸에서 나타나는 증상이 겹친다면 더 미루지 않는 편이 좋습니다.",
      "If sleep, appetite, and drive have been down for more than two weeks, that is a signal for a clinician. If physical symptoms such as heart palpitations or unexplained tearfulness appear alongside it, it is better not to wait longer.",
    ),
    patterns: [/번아웃|지친|지쳐|지쳤|무기력|소진|다 놓고 싶|의욕이 없/u, /burnout|exhausted|no motivation/i],
  },
  {
    id: "habit",
    focus: "growth",
    label: n("습관·꾸준함", "Habits"),
    verdict: n(
      "만들 수 있습니다. 의지가 부족한 것이 아니라 목표가 큰 것입니다. 절반으로 줄이고 시각을 고정하면 유지됩니다.",
      "This is buildable. The target is too large rather than the will too small; halve it and fix the time.",
    ),
    framing: n(
      "습관은 의지보다 조건에서 갈립니다. 하려는 일을 작게 만들고 방해물을 치우는 쪽이 효과적입니다. 예를 들어 운동복을 전날 미리 꺼내 놓는 것만으로도 다음 날 실행 확률이 눈에 띄게 올라갑니다.",
      "Habits turn on conditions more than will. Make the action smaller and remove what blocks it. Laying out workout clothes the night before, for instance, measurably raises the odds of following through the next day.",
    ),
    observe: n(
      "최근 그만둔 시도를 하나 떠올려, 며칠째에 어떤 상황에서 끊겼는지 적어보세요. 대개 같은 지점에서 끊깁니다. 대개 3일째나 일주일째, 또는 처음으로 하루를 빠뜨린 다음 날에 완전히 끊기는 경우가 많습니다.",
      "Recall one attempt you dropped and note which day and situation ended it. It usually repeats. It often breaks entirely on day three, day seven, or the day right after the first missed day.",
    ),
    action: n(
      "이번 주에는 목표를 절반 이하로 줄이고, 중단 기준도 함께 정해 두세요. 목표를 지킨 날에는 달력에 표시만 남겨도, 그 표시가 이어지는 것 자체가 다음 날의 동기가 됩니다.",
      "Halve the target this week and set the stopping rule alongside it. Simply marking a calendar on days you keep the habit turns the unbroken streak itself into the next day's motivation.",
    ),
    caution: n(
      "한 번에 여러 습관을 바꾸려 하면 대부분 무너집니다. 하나가 자리 잡은 뒤 다음으로 넘어가세요. 한 습관이 별다른 저항 없이 3주 이상 이어졌을 때가 다음 습관을 더할 적절한 시점입니다.",
      "Changing several at once usually collapses. Let one settle before the next. The right time to add another habit is once the first has continued for three weeks or more without much resistance.",
    ),
    patterns: [/습관|꾸준|작심삼일|루틴|운동을? 시작|공부 습관/u, /habit|routine|consistency/i],
  },

];

export const concernTopics: readonly ConcernTopic[] = [
  ...URGENT_TOPICS,
  // Evaluated before the base set: caring for a parent and money inside the family are
  // narrower than the general parent and argument topics that would otherwise take them.
  ...RELATIONSHIP_EXTRA_TOPICS,
  ...WORK_EXTRA_TOPICS,
  ...MONEY_EXTRA_TOPICS,
  ...LIFE_EXTRA_TOPICS,
  ...BASE_TOPICS,
  ...CATCH_ALL_TOPICS,
];


const TOPIC_BY_ID = new Map(concernTopics.map((topic) => [topic.id, topic]));

// Used when the sentence matches nothing: answer the area the buyer chose rather than
// guessing at a situation they did not describe.
const FOCUS_FALLBACK: Record<ConcernFocusId, string> = {
  work: "direction",
  relationships: "conflict",
  health: "health_habit",
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
