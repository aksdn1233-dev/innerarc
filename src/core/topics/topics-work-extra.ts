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
      "승진은 성과만이 아니라 그 성과가 보이는지에도 걸립니다. 잘하고 있는데 안 보이는 경우가 생각보다 많습니다.",
      "Promotion turns on whether the work is visible as much as on the work. Being good and being unseen is common.",
    ),
    observe: n(
      "지난 6개월 성과 중 결정권자가 직접 알고 있는 것이 몇 개인지 세어 보세요. 아는 사람이 없다면 그건 성과 문제가 아니라 전달 문제입니다.",
      "Of the last six months of results, count how many the decision-maker knows directly. If none, that is a reporting problem, not a results problem.",
    ),
    action: n(
      "이번 달 안에 상사와 짧게 이야기해 다음 단계에 필요한 조건 한 가지만 명확히 물어보세요. 막연한 기대보다 기준이 낫습니다.",
      "Ask your manager for one concrete condition for the next step. A criterion beats a hope.",
    ),
    caution: n(
      "동료와의 비교로 판단하면 지칩니다. 기준은 회사가 쓰는 것이지 옆자리가 쓰는 것이 아닙니다.",
      "Judging by a colleague exhausts you. The criteria belong to the company, not the next desk.",
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
      "독립은 실력보다 일이 끊겼을 때 버티는 구조에서 갈립니다. 첫해는 대개 수입이 고르지 않습니다.",
      "Independence turns on what holds when work stops, more than on skill. The first year is rarely even.",
    ),
    observe: n(
      "지금 나를 다시 찾을 사람이 몇 명인지, 그중 실제로 돈을 지불한 사람이 몇 명인지 세어 보세요.",
      "Count who would come back to you, and how many of those have actually paid before.",
    ),
    action: n(
      "그만두기 전에 지금 자리를 유지한 채로 한 건만 받아, 견적·계약·정산까지 실제로 겪어 보세요.",
      "Before leaving, take one job while still employed and go through quoting, contracting, and getting paid.",
    ),
    caution: n(
      "계약서 없이 시작한 일은 대금에서 문제가 생깁니다. 금액·범위·수정 횟수·지급일을 반드시 문서로 남기세요.",
      "Work started without a contract goes wrong at payment. Put amount, scope, revisions, and due date in writing.",
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
      "공백은 설명할 수 있으면 약점이 아닙니다. 문제는 공백 자체가 아니라 그 기간을 어떻게 말할지 준비되지 않은 상태입니다.",
      "A gap explained is not a weakness. The problem is usually not the gap but not having a way to say it.",
    ),
    observe: n(
      "공백 기간에 실제로 한 일과 유지한 기술을 사실대로 적어보세요. 육아나 간병도 관리·조율 경험입니다.",
      "Write what you actually did and kept during the gap. Caring work is coordination experience.",
    ),
    action: n(
      "이번 주에 공백을 한 문장으로 설명하는 문장을 만들어 소리 내어 읽어보세요. 면접에서 가장 자주 묻는 질문입니다.",
      "Write one sentence explaining the gap and say it out loud. It is the most common interview question.",
    ),
    caution: n(
      "예전 직급과 조건을 그대로 기준 삼으면 시작이 늦어집니다. 다시 올리는 것이 처음 들어가는 것보다 빠릅니다.",
      "Holding out for the old title delays the restart. Climbing back is faster than getting back in.",
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
      "부업의 성패는 수익보다 지속 가능한 시간에서 갈립니다. 본업이 흔들리면 둘 다 잃습니다.",
      "A side income turns on sustainable hours more than on revenue. If the main job wobbles, both go.",
    ),
    observe: n(
      "일주일에 실제로 남는 시간이 몇 시간인지 이번 주에 재보세요. 계획한 시간이 아니라 남은 시간입니다.",
      "Measure the hours actually left over this week, not the hours you planned.",
    ),
    action: n(
      "가장 적은 준비로 시작할 수 있는 것 하나를 골라 4주만 해보고, 그때 다시 판단하세요.",
      "Pick the option needing least setup, run it four weeks, then decide again.",
    ),
    caution: n(
      "회사 취업규칙에서 겸업이 금지되는 경우가 있습니다. 시작 전에 확인하세요. 초기 비용을 크게 요구하는 부업은 대개 부업이 아닙니다.",
      "Some employment contracts forbid outside work. Check first. Anything demanding a large upfront payment usually is not a job.",
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
      "복무 기간은 정해져 있고 바꿀 수 없습니다. 바꿀 수 있는 것은 그 기간을 무엇으로 채우고 나올지입니다.",
      "The term is fixed. What is not fixed is what you come out holding.",
    ),
    observe: n(
      "전역까지 남은 개월 수와, 그동안 현실적으로 끝낼 수 있는 자격증이나 공부를 하나만 적어보세요.",
      "Write the months remaining and one qualification or study that realistically fits inside them.",
    ),
    action: n(
      "전역 후 첫 3개월에 할 일을 지금 한 줄로 정해 두세요. 나와서 정하면 대개 몇 달이 흐릅니다.",
      "Decide now, in one line, what the first three months after discharge will be. Deciding later costs months.",
    ),
    caution: n(
      "부대 내 부조리나 폭력은 상징으로 다룰 일이 아닙니다. 국방헬프콜(1303)이나 병영생활 상담관을 이용하세요.",
      "Abuse inside a unit is not a symbolic matter. Use the formal counselling and reporting line.",
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
      "해외 이동은 직업보다 체류 자격에서 먼저 막힙니다. 비자 조건이 사실상 선택지를 정합니다.",
      "A move abroad stops at residency before it stops at the job. The visa route decides the options.",
    ),
    observe: n(
      "가고 싶은 나라의 비자 요건을 하나만 정확히 찾아, 지금 충족하는 것과 부족한 것을 나눠 적어보세요.",
      "Look up one country's visa requirement precisely and split it into what you meet and what you do not.",
    ),
    action: n(
      "언어 시험이나 경력 요건 중 가장 오래 걸리는 것 하나를 이번 달에 시작하세요. 대개 그게 전체 일정을 정합니다.",
      "Start the longest-lead requirement this month. It usually sets the whole timeline.",
    ),
    caution: n(
      "취업을 보장한다며 수수료를 먼저 받는 업체를 조심하세요. 공식 이민 절차는 대행이 필수가 아닙니다.",
      "Be wary of agencies taking fees upfront on a promise of placement. Official routes rarely require one.",
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
      "은퇴 후의 어려움은 돈만이 아니라 하루의 구조가 사라지는 데서 옵니다. 둘을 따로 준비하는 편이 낫습니다.",
      "What is hard after retiring is not only money but the loss of a shaped day. Prepare the two separately.",
    ),
    observe: n(
      "은퇴 후 하루를 시간 단위로 한 번 적어보세요. 비어 있는 시간대가 어디인지가 드러납니다.",
      "Write one post-retirement day hour by hour. The empty stretches show themselves.",
    ),
    action: n(
      "돈과 무관하게 계속하고 싶은 활동 하나를 지금부터 주 1회 해보세요. 은퇴 후에 새로 만들기는 더 어렵습니다.",
      "Start one activity you would continue regardless of pay, once a week, now. It is harder to begin later.",
    ),
    caution: n(
      "퇴직금으로 처음 해보는 사업을 시작하는 것은 회복이 어려운 선택입니다. 원금을 잃어도 되는 범위인지 먼저 보세요.",
      "Starting a first business with severance is hard to recover from. Check the loss you could absorb first.",
    ),
    patterns: [/은퇴|정년|퇴직 후|노후|제2의 인생/u, /retire|retirement|second act/i],
  },
];
