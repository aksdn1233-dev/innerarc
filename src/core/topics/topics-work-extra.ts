import { n, type ConcernTopic } from "./topic-types";

export const WORK_EXTRA_TOPICS: readonly ConcernTopic[] = [
  {
    id: "promotion",
    focus: "work",
    label: n("승진·평가", "Promotion and reviews"),
    verdict: n(
      "승진 가능성은 남아 있습니다. 성과가 부족한 것이 아니라 결정권자에게 도달하지 않았을 가능성이 큽니다. 전달 경로를 만드는 것이 다음 단계입니다.",
      "Promotion is still open. The likelier gap is that results have not reached the decision-maker, so building that path is the next step.",
    ),
    framing: n(
      "승진은 성과만이 아니라 그 성과가 보이는지에도 걸립니다. 잘하고 있는데 안 보이는 경우가 생각보다 많습니다. 분기 보고서나 주간 회의록에 이름이 언급된 횟수를 세어보면 그 격차가 숫자로 드러납니다.",
      "Promotion turns on whether the work is visible as much as on the work. Being good and being unseen is common. Counting how many times your name appears in quarterly reports or weekly meeting notes turns that gap into a number.",
    ),
    observe: n(
      "지난 6개월 성과 중 결정권자가 직접 알고 있는 것이 몇 개인지 세어 보세요. 아는 사람이 없다면 그건 성과 문제가 아니라 전달 문제입니다. 세 개 이상이 결정권자에게 닿지 않았다면, 주간 보고 형식부터 바꿔볼 시점입니다.",
      "Of the last six months of results, count how many the decision-maker knows directly. If none, that is a reporting problem, not a results problem. If three or more results never reached them, it is time to change the weekly report format.",
    ),
    action: n(
      "이번 달 안에 상사와 짧게 이야기해 다음 단계에 필요한 조건 한 가지만 명확히 물어보세요. 막연한 기대보다 기준이 낫습니다. 대화 후에는 들은 조건을 이메일이나 메모로 남겨 날짜와 함께 기록해두세요.",
      "Ask your manager for one concrete condition for the next step. A criterion beats a hope. After the conversation, save the condition you were given in an email or note along with the date.",
    ),
    caution: n(
      "동료와의 비교로 판단하면 지칩니다. 기준은 회사가 쓰는 것이지 옆자리가 쓰는 것이 아닙니다. 인사평가 시즌 직전 한두 달의 성과만 몰아서 어필하는 것은 오히려 부자연스럽게 보일 수 있습니다.",
      "Judging by a colleague exhausts you. The criteria belong to the company, not the next desk. Bunching visible effort into the one or two months right before review season can read as forced rather than helpful.",
    ),
    patterns: [/승진|진급|고과|인사평가|팀장 자리|직급/u, /promotion|performance review|raise/i],
  },
  {
    id: "freelance",
    focus: "work",
    label: n("프리랜서·독립", "Going independent"),
    verdict: n(
      "독립해도 되는 조건입니다. 다만 실력보다 일이 끊겼을 때 버틸 구조가 먼저입니다. 다시 찾을 고객이 세 명 이상이면 넘어가셔도 됩니다.",
      "Going independent is viable. What comes first is what holds when work stops; three returning clients is a workable threshold.",
    ),
    framing: n(
      "독립은 실력보다 일이 끊겼을 때 버티는 구조에서 갈립니다. 첫해는 대개 수입이 고르지 않습니다. 월별 수입 편차가 두세 배씩 나는 경우가 흔하므로, 평균이 아니라 가장 낮았던 달을 기준으로 생활비를 짜야 합니다.",
      "Independence turns on what holds when work stops, more than on skill. The first year is rarely even. Month-to-month income can swing two or three times over, so budget around the worst month, not the average.",
    ),
    observe: n(
      "지금 나를 다시 찾을 사람이 몇 명인지, 그중 실제로 돈을 지불한 사람이 몇 명인지 세어 보세요. 그 숫자가 세 명 미만이라면 아직 독립보다 부업으로 검증하는 단계에 가깝습니다.",
      "Count who would come back to you, and how many of those have actually paid before. If that number is under three, you are still at the stage of testing this as a side project, not a full move.",
    ),
    action: n(
      "그만두기 전에 지금 자리를 유지한 채로 한 건만 받아, 견적·계약·정산까지 실제로 겪어 보세요. 정산까지 걸린 기간과 실제로 손에 남은 금액을 기록해두면 이후 견적을 잡을 때 기준이 됩니다.",
      "Before leaving, take one job while still employed and go through quoting, contracting, and getting paid. Record how long payment took and what actually landed in your account; it becomes your baseline for future quotes.",
    ),
    caution: n(
      "계약서 없이 시작한 일은 대금에서 문제가 생깁니다. 금액·범위·수정 횟수·지급일을 반드시 문서로 남기세요. 선금 없이 전체 작업을 먼저 끝내달라는 요청은 대금 미지급으로 이어지는 경우가 많습니다.",
      "Work started without a contract goes wrong at payment. Put amount, scope, revisions, and due date in writing. A request to finish everything before any deposit is paid often ends in nonpayment.",
    ),
    patterns: [/프리랜서|독립할|1인 기업|외주|재택으로 일|N잡/u, /freelance|go independent|contractor/i],
  },
  {
    id: "career_gap",
    focus: "work",
    label: n("경력 단절·재취업", "Returning to work"),
    verdict: n(
      "재취업은 충분히 가능합니다. 공백 자체가 아니라 공백을 설명할 문장이 없는 상태가 발목을 잡습니다. 그 문장을 만들면 통과율이 달라집니다.",
      "Returning is very achievable. What holds it back is not the gap but the absence of a sentence explaining it.",
    ),
    framing: n(
      "공백은 설명할 수 있으면 약점이 아닙니다. 문제는 공백 자체가 아니라 그 기간을 어떻게 말할지 준비되지 않은 상태입니다. 1년 이상의 공백이라도 그 기간에 익힌 구체적인 기술이나 경험 하나만 짚을 수 있으면 면접관의 질문 방향이 달라집니다.",
      "A gap explained is not a weakness. The problem is usually not the gap but not having a way to say it. Even a gap over a year changes the interviewer's line of questioning once you can point to one concrete skill or experience gained in it.",
    ),
    observe: n(
      "공백 기간에 실제로 한 일과 유지한 기술을 사실대로 적어보세요. 육아나 간병도 관리·조율 경험입니다. 온라인 강의 수료나 자격증 취득처럼 날짜로 증명할 수 있는 것이 있다면 따로 표시해두세요.",
      "Write what you actually did and kept during the gap. Caring work is coordination experience. Mark anything you can date-stamp, like an online course completion or a certification earned.",
    ),
    action: n(
      "이번 주에 공백을 한 문장으로 설명하는 문장을 만들어 소리 내어 읽어보세요. 면접에서 가장 자주 묻는 질문입니다. 30초 안에 끝나는 길이로 다듬고, 마지막은 지금 왜 돌아오려는지로 맺으세요.",
      "Write one sentence explaining the gap and say it out loud. It is the most common interview question. Trim it to under thirty seconds, and close with why you are coming back now.",
    ),
    caution: n(
      "예전 직급과 조건을 그대로 기준 삼으면 시작이 늦어집니다. 다시 올리는 것이 처음 들어가는 것보다 빠릅니다. 공백 기간이 3년을 넘으면 같은 업계라도 사용 도구나 절차가 바뀌었을 가능성을 먼저 확인하세요.",
      "Holding out for the old title delays the restart. Climbing back is faster than getting back in. Past a three-year gap, check first whether the tools or processes in the same field have changed.",
    ),
    patterns: [/경력 ?단절|재취업|복직|다시 일을?|공백기|경단/u, /return to work|career gap|back to work/i],
  },
  {
    id: "side_job",
    focus: "work",
    label: n("부업·투잡", "A second income"),
    verdict: n(
      "부업은 시작해도 됩니다. 다만 수익보다 남는 시간이 기준입니다. 주당 확보 가능한 시간이 5시간 미만이면 규모를 더 줄이셔야 합니다.",
      "A side income is workable, judged on spare hours rather than revenue. Under five hours a week, shrink the scope.",
    ),
    framing: n(
      "부업의 성패는 수익보다 지속 가능한 시간에서 갈립니다. 본업이 흔들리면 둘 다 잃습니다. 본업 근무시간에 부업 연락을 처리하다 적발되면 징계 사유가 되는 경우도 있습니다.",
      "A side income turns on sustainable hours more than on revenue. If the main job wobbles, both go. Handling side-job messages during main-job hours, if noticed, can become grounds for discipline.",
    ),
    observe: n(
      "일주일에 실제로 남는 시간이 몇 시간인지 이번 주에 재보세요. 계획한 시간이 아니라 남은 시간입니다. 출퇴근, 수면, 이미 잡힌 약속을 뺀 뒤에 남는 시간만 셈에 넣어야 다음 주에도 지킬 수 있습니다.",
      "Measure the hours actually left over this week, not the hours you planned. Only count what is left after commute, sleep, and fixed commitments; that is the number you can actually keep next week.",
    ),
    action: n(
      "가장 적은 준비로 시작할 수 있는 것 하나를 골라 4주만 해보고, 그때 다시 판단하세요. 4주 동안 들어간 시간과 번 돈을 매주 적어두면 시급으로 환산해 계속할지 판단할 수 있습니다.",
      "Pick the option needing least setup, run it four weeks, then decide again. Log hours spent and money earned each week during those four weeks so you can convert it to an hourly rate before deciding.",
    ),
    caution: n(
      "회사 취업규칙에서 겸업이 금지되는 경우가 있습니다. 시작 전에 확인하세요. 초기 비용을 크게 요구하는 부업은 대개 부업이 아닙니다. 연 부수입이 일정 금액을 넘으면 종합소득세 신고 대상이 될 수 있으니 미리 확인해두세요.",
      "Some employment contracts forbid outside work. Check first. Anything demanding a large upfront payment usually is not a job. If annual side income passes a certain threshold it may need to be declared for income tax, so check in advance.",
    ),
    patterns: [/부업|투잡|사이드|추가 수입|퇴근 후 일|스마트스토어/u, /side job|second income|side hustle/i],
  },
  {
    id: "military",
    focus: "work",
    label: n("군 복무·전역", "Military service"),
    verdict: n(
      "복무 기간은 손해가 아닙니다. 나올 때 무엇을 들고 나오느냐로 갈립니다. 남은 개월 수에 맞는 목표 하나를 정하면 그 기간이 자산이 됩니다.",
      "The term is not lost time; what you carry out of it decides. One goal sized to the months remaining turns it into an asset.",
    ),
    framing: n(
      "복무 기간은 정해져 있고 바꿀 수 없습니다. 바꿀 수 있는 것은 그 기간을 무엇으로 채우고 나올지입니다. 이등병 때 세운 계획도 상병쯤 되면 현실에 맞게 한 번은 조정하게 되는 경우가 많습니다.",
      "The term is fixed. What is not fixed is what you come out holding. Plans made as a private often need one realistic adjustment by the time you are a corporal.",
    ),
    observe: n(
      "전역까지 남은 개월 수와, 그동안 현실적으로 끝낼 수 있는 자격증이나 공부를 하나만 적어보세요. 주말과 휴가를 뺀 순수 개인 정비 시간을 기준으로 계산해야 실제로 끝낼 수 있는 목표가 나옵니다.",
      "Write the months remaining and one qualification or study that realistically fits inside them. Calculate against actual personal free time, not weekends and leave included, to land on a goal you can really finish.",
    ),
    action: n(
      "전역 후 첫 3개월에 할 일을 지금 한 줄로 정해 두세요. 나와서 정하면 대개 몇 달이 흐릅니다. 전역 한 달 전에는 이력서나 지원 서류 초안을 미리 만들어 두면 나온 뒤 바로 지원할 수 있습니다.",
      "Decide now, in one line, what the first three months after discharge will be. Deciding later costs months. A month before discharge, draft your resume or application materials so you can apply immediately after.",
    ),
    caution: n(
      "부대 내 부조리나 폭력은 상징으로 다룰 일이 아닙니다. 국방헬프콜(1303)이나 병영생활 상담관을 이용하세요. 가족이나 외부에 알리는 것을 주저하게 만드는 분위기 자체가 이미 정상 범위를 벗어난 신호입니다.",
      "Abuse inside a unit is not a symbolic matter. Use the formal counselling and reporting line. An atmosphere that discourages telling family or anyone outside is itself already a sign the situation is not normal.",
    ),
    patterns: [/군대|입대|전역|복무|병역|훈련소/u, /military service|enlist|discharge/i],
  },
  {
    id: "work_abroad",
    focus: "work",
    label: n("해외 취업·이민", "Working abroad"),
    verdict: n(
      "해외 이동은 가능한 경로가 있습니다. 다만 직업보다 체류 자격이 먼저 막습니다. 비자 요건 하나를 정확히 확인하면 전체 일정이 잡힙니다.",
      "There is a workable route abroad, but residency blocks before the job does. Pinning one visa requirement sets the whole timeline.",
    ),
    framing: n(
      "해외 이동은 직업보다 체류 자격에서 먼저 막힙니다. 비자 조건이 사실상 선택지를 정합니다. 같은 직종이라도 나라마다 비자 종류와 처리 기간이 몇 주에서 1년 이상까지 차이가 납니다.",
      "A move abroad stops at residency before it stops at the job. The visa route decides the options. The same occupation can have visa types and processing times ranging from a few weeks to over a year depending on the country.",
    ),
    observe: n(
      "가고 싶은 나라의 비자 요건을 하나만 정확히 찾아, 지금 충족하는 것과 부족한 것을 나눠 적어보세요. 학력 증명이나 경력 증명서처럼 발급에 몇 주가 걸리는 서류가 있는지 먼저 확인하세요.",
      "Look up one country's visa requirement precisely and split it into what you meet and what you do not. Check first whether any required document, like a degree or employment certificate, takes weeks to issue.",
    ),
    action: n(
      "언어 시험이나 경력 요건 중 가장 오래 걸리는 것 하나를 이번 달에 시작하세요. 대개 그게 전체 일정을 정합니다. 시험 점수나 서류에는 유효기간이 있는 경우가 많으니 신청 시점을 역산해 일정을 짜세요.",
      "Start the longest-lead requirement this month. It usually sets the whole timeline. Test scores and documents often have expiry windows, so work backward from your planned application date.",
    ),
    caution: n(
      "취업을 보장한다며 수수료를 먼저 받는 업체를 조심하세요. 공식 이민 절차는 대행이 필수가 아닙니다. 계약서 없이 구두로만 약속받은 급여나 근로조건은 현지에 도착한 뒤 지켜지지 않는 사례가 있습니다.",
      "Be wary of agencies taking fees upfront on a promise of placement. Official routes rarely require one. Pay or terms promised only verbally, without a contract, have gone unhonored after arrival in some cases.",
    ),
    patterns: [/해외 취업|이민|워홀|워킹홀리데이|비자|해외로 나가/u, /work abroad|immigrate|visa|relocat/i],
  },
  {
    id: "retirement",
    focus: "work",
    label: n("은퇴·인생 2막", "Retirement and what follows"),
    verdict: n(
      "은퇴 이후 준비는 지금부터로 충분합니다. 돈보다 하루의 구조가 먼저 무너집니다. 지금 시작한 활동 하나가 그때 가장 큰 자산이 됩니다.",
      "Starting now is enough. The shape of the day collapses before the money does, so one activity begun now becomes the largest asset then.",
    ),
    framing: n(
      "은퇴 후의 어려움은 돈만이 아니라 하루의 구조가 사라지는 데서 옵니다. 둘을 따로 준비하는 편이 낫습니다. 출근이라는 틀이 사라지면 첫 몇 달 동안 무기력감을 느끼는 사람이 적지 않습니다.",
      "What is hard after retiring is not only money but the loss of a shaped day. Prepare the two separately. It is common to feel adrift in the first few months once the routine of going to work disappears.",
    ),
    observe: n(
      "은퇴 후 하루를 시간 단위로 한 번 적어보세요. 비어 있는 시간대가 어디인지가 드러납니다. 오전과 오후 중 유독 길게 느껴지는 시간대가 있다면 그곳부터 채울 계획이 필요합니다.",
      "Write one post-retirement day hour by hour. The empty stretches show themselves. If either morning or afternoon feels especially long, plan to fill that block first.",
    ),
    action: n(
      "돈과 무관하게 계속하고 싶은 활동 하나를 지금부터 주 1회 해보세요. 은퇴 후에 새로 만들기는 더 어렵습니다. 같은 요일, 같은 시간에 고정해두면 은퇴 후에도 하나의 약속처럼 이어가기 쉽습니다.",
      "Start one activity you would continue regardless of pay, once a week, now. It is harder to begin later. Fixing it to the same day and time makes it easier to keep going as a standing commitment after retiring.",
    ),
    caution: n(
      "퇴직금으로 처음 해보는 사업을 시작하는 것은 회복이 어려운 선택입니다. 원금을 잃어도 되는 범위인지 먼저 보세요. 프랜차이즈 창업의 경우 가맹비와 초기 인테리어 비용만으로 퇴직금 상당 부분이 소진되는 경우가 많습니다.",
      "Starting a first business with severance is hard to recover from. Check the loss you could absorb first. With franchise startups in particular, franchise fees and initial fit-out costs alone often consume a large share of severance pay.",
    ),
    patterns: [/은퇴|정년|퇴직 후|노후|제2의 인생/u, /retire|retirement|second act/i],
  },
  {
    id: "business_partner",
    focus: "work",
    label: n("동업·사업 파트너", "Business partnership"),
    verdict: n(
      "지금 동업 관계는 정리가 가능합니다. 다만 감정보다 지분과 역할을 적은 문서가 먼저입니다. 처음에 정하지 않았다면 지금이라도 문서로 만들어두는 쪽이 관계와 사업을 함께 지킵니다.",
      "This partnership is workable to sort out. Equity and role documentation come before feeling; putting it in writing now, even late, protects the relationship and the business together.",
    ),
    framing: n(
      "동업이 흔들리는 이유는 대개 성격 차이가 아니라 지분·역할·의사결정권이 말로만 정해지고 문서로 남지 않아서입니다. 다시 명확히 하는 편이 관계 회복보다 먼저 필요합니다.",
      "Partnerships usually wobble not from personality clashes but from equity, roles, and decision rights that were only ever spoken, never written. Clarifying them again comes before repairing the relationship.",
    ),
    observe: n(
      "지금 갈등이 되는 사안이 돈 문제인지, 역할 문제인지, 의사결정 문제인지 하나로 좁혀 적어보세요. 세 가지가 뒤섞이면 대화가 매번 제자리로 돌아옵니다.",
      "Narrow the current conflict to one of money, role, or decision-making. Mixing the three is why the conversation keeps circling back to the start.",
    ),
    action: n(
      "이번 주에 동업계약서가 있는지 확인하고, 없다면 지분·역할·이익 배분·탈퇴 조건 네 가지만이라도 문서로 만들어 함께 서명하세요.",
      "Check this week whether a partnership agreement exists. If not, draft and sign at least four terms together: equity, roles, profit split, and exit conditions.",
    ),
    caution: n(
      "동업 관계 청산은 감정이 아니라 지분 평가와 채무 정리부터 시작해야 분쟁이 줄어듭니다. 금액이 크면 변호사나 세무사를 함께 두고 정리하세요.",
      "Ending a partnership goes smoother started from equity valuation and debt settlement, not from feeling. If the amount is large, bring in a lawyer or accountant to close it out.",
    ),
    patterns: [/동업|공동창업|사업\s?파트너|지분\s?문제|동업자/u, /business partner|co-founder conflict/i],
  },
];
