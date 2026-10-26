import { z } from "zod";
import { onboardingFocusIds, type OnboardingFocusId } from "@/core/onboarding";
import { questionTopics } from "@/core/question-topics";
import { assessQuestionSafety } from "@/core/ai/safety";
import { getCrisisResourceCopy } from "@/core/ai/crisis-resources";

export const FREE_CONCERN_POLICY = "free-concern:1.0.0";
type Copy = Readonly<{ label: string; title: string; answer: string; information: string; action: string; reconsider: string }>;
const pair = (ko: Copy, en: Copy) => ({ ko, en });
const copies = {
  work: pair(
    { label: "일 · 사업", title: "일의 이름보다, 실제 조건을 봐요", answer: "하고 싶은 일과 오래 할 수 있는 조건을 나눠봐요. 역할이 좋아 보여도 맡을 일과 결정할 수 있는 범위가 맞는지 확인해야 해요.", information: "맡을 일, 필요한 역량, 일하는 시간과 보상을 비교해요.", action: "관심 있는 일 하나를 골라 실제 종사자에게 하루 일과를 물어보세요.", reconsider: "직함만 알고 실제 업무를 모른다면, 결정보다 확인이 먼저예요." },
    { label: "Work & business", title: "Look beyond the job title", answer: "Separate work you want from conditions you can sustain. An appealing role still needs clear duties and decision rights.", information: "Compare duties, skills, working hours and compensation.", action: "Choose one role and ask someone doing it about a typical day.", reconsider: "If only the title is clear, find out what the work involves before deciding." }),
  business: pair(
    { label: "사업", title: "사업을 시작하기 전, 먼저 확인해요", answer: "아이디어가 좋아 보이는 것과 고객이 실제로 필요로 하는 건 달라요. 큰돈을 쓰기 전에, 누구의 어떤 불편을 해결할지 하나부터 좁혀봐요.", information: "고객의 실제 불편, 시험해볼 비용과 감당할 손실을 확인해요.", action: "고객이 될 만한 사람에게 지금 그 문제를 어떻게 해결하는지 물어보세요.", reconsider: "좋다는 반응만 있고 실제 필요나 비용을 확인하지 못했다면, 확장을 서두르지 않아도 돼요." },
    { label: "Business", title: "Check the need before starting a business", answer: "An appealing idea is different from something customers actually need. Before committing substantial money, narrow it to one problem for one group of people.", information: "Check the real problem, test cost and downside you can afford.", action: "Ask a potential customer how they solve that problem today.", reconsider: "If there is praise but no evidence of need or workable costs, pause expansion." }),
  career: pair(
    { label: "이직 · 취업", title: "옮기기 전, 지금과 다음 조건을 비교해요", answer: "지금 힘든 이유와 다음 자리에서 달라질 조건을 나눠봐요. 현재의 불만만으로 새 자리가 더 나을 거라고 정하지는 않아요.", information: "업무, 권한, 급여, 근무 시간과 제안의 확정 여부를 확인해요.", action: "현재 자리와 다음 자리의 조건을 같은 항목으로 한 줄씩 적어보세요.", reconsider: "말로 들은 조건뿐이거나 수입이 비는 기간을 확인하지 못했다면, 퇴사 확정보다 확인이 먼저예요." },
    { label: "Career", title: "Compare the conditions before moving", answer: "Separate what is difficult now from what would change in the next role. Disliking the current job does not establish that another will be better.", information: "Check duties, authority, pay, hours and whether an offer is confirmed.", action: "Compare the current and possible next role using the same headings.", reconsider: "If terms are only verbal or an income gap is unresolved, check those before committing to resign." }),
  job_hunt: pair(
    { label: "취업 · 구직", title: "지원하기 전, 원하는 조건을 정해봐요", answer: "회사 이름보다 실제로 맡을 일과 필요한 경험을 먼저 봐요. 공고의 조건과 지금 보여줄 수 있는 경험을 나누면 준비할 부분이 선명해져요.", information: "업무 내용, 필수 조건, 전형 일정과 준비한 경험을 확인해요.", action: "관심 있는 공고 하나를 골라 충족하는 조건과 더 준비할 조건을 적어보세요.", reconsider: "채용 조건이 불분명하거나 먼저 돈을 요구한다면, 공식 채용 경로와 조건부터 확인해요." },
    { label: "Job search", title: "Define the conditions before applying", answer: "Look beyond the company name to the actual work and required experience. Compare the posting with evidence of what you can already do.", information: "Check duties, essential requirements, selection dates and relevant experience.", action: "Choose one posting and separate requirements you meet from those needing preparation.", reconsider: "If terms are unclear or money is requested upfront, verify the official hiring channel and conditions first." }),
  relationships: pair(
    { label: "사람 · 연애", title: "마음보다, 반복되는 행동을 봐요", answer: "상대의 속마음을 짐작하기보다 함께 있을 때 실제로 어떤 일이 반복되는지 봐요. 좋은 느낌과 편안하게 지낼 수 있는 조건은 다를 수 있어요.", information: "약속을 지키는지, 불편한 말을 들어주는지, 서로의 경계를 존중하는지 살펴봐요.", action: "최근 편안했던 장면과 불편했던 장면을 하나씩 적고 차이를 비교해보세요.", reconsider: "한쪽만 계속 참아야 하거나 경계가 무시된다면, 관계의 속도와 거리를 다시 살펴봐요." },
    { label: "Love & people", title: "Look at repeated actions, not guessed feelings", answer: "Rather than guessing another person's feelings, look at what actually repeats between you. Attraction and conditions that feel comfortable are not always the same.", information: "Look at kept promises, responses to discomfort and respect for boundaries.", action: "Compare one recent comfortable moment with one uncomfortable moment.", reconsider: "If one person must always give way or boundaries are ignored, reconsider the pace and distance." }),
  reunion: pair(
    { label: "재회", title: "다시 연락하기 전, 달라진 점을 봐요", answer: "재회할지는 상대의 동의와 실제 상황을 알아야 해요. 그리운 마음과 헤어질 때의 문제가 달라졌는지는 나눠서 봐요.", information: "이별의 이유, 달라진 행동, 상대가 말한 연락의 경계를 확인해요.", action: "다시 만나고 싶은 이유와 같은 문제가 반복되지 않을 근거를 각각 적어보세요.", reconsider: "연락을 원하지 않는다는 뜻을 들었다면, 그 경계를 먼저 존중해요." },
    { label: "Reconnection", title: "Look at what changed before reconnecting", answer: "Reconnecting depends on both people's consent and circumstances. Missing someone does not show that the original problem has changed.", information: "Review why it ended, changed behavior and any stated contact boundaries.", action: "Write why you want to reconnect and what evidence suggests the old problem would be different.", reconsider: "If the other person has asked for no contact, respect that boundary." }),
  money: pair(
    { label: "돈", title: "돈이 남는 곳과 새는 곳을 나눠봐요", answer: "돈이 모이는 시기를 정하기보다 지금 남길 수 있는 금액부터 확인해봐요. 수입이 적은 문제와 피하기 어려운 지출은 다른 방법으로 살펴야 해요.", information: "실제 수입, 고정 지출, 갚을 돈과 남겨둘 생활비를 나눠봐요.", action: "최근 한 달 지출에서 바꿀 수 있는 항목 하나와 꼭 필요한 항목 하나를 비교해보세요.", reconsider: "생활비나 상환이 버겁다면, 운의 문제로 돌리지 말고 실제 조건과 도움받을 곳부터 확인해요." },
    { label: "Money", title: "See what stays and what goes", answer: "Instead of predicting when money will accumulate, look at what can remain now. Low income and unavoidable costs need different responses.", information: "Separate actual income, fixed costs, repayments and essential living expenses.", action: "Compare one changeable expense with one essential expense from the past month.", reconsider: "If essentials or repayments are difficult, review real conditions and available support rather than attributing it to luck." }),
  debt: pair(
    { label: "빚 · 상환", title: "갚을 수 있을지, 실제 조건부터 봐요", answer: "상환 가능성은 생년월일보다 실제 수입과 지출, 대출 조건을 알아야 판단할 수 있어요. 막연히 버틸지 고민하기 전에 매달 필요한 금액부터 나눠봐요.", information: "대출 잔액, 금리, 월 상환액, 생활비와 실제 소득을 확인해요.", action: "월 상환액과 꼭 필요한 생활비를 같은 표에 적어 비교해보세요.", reconsider: "상환이 어렵다면 추가 대출이나 운에 기대기 전에, 해당 금융기관이나 자격 있는 상담기관에 가능한 지원을 확인해요." },
    { label: "Debt & repayment", title: "Check actual repayment conditions", answer: "Repayment capacity depends on real income, costs and loan terms, not a birth date. Start by separating the amounts needed each month.", information: "Check outstanding balances, interest, monthly payments, essentials and actual income.", action: "Compare monthly repayments with essential living costs in one table.", reconsider: "If repayment is difficult, ask the lender or a qualified counselor about available support before relying on further borrowing or luck." }),
  investment: pair(
    { label: "투자", title: "기대 수익보다, 손실과 조건부터 봐요", answer: "수익이나 매수 시점을 사주로 정할 수는 없어요. 필요한 생활비와 투자에 쓸 수 있는 자금을 구분하고, 실제 상품의 위험을 먼저 확인해요.", information: "상품의 위험, 수수료, 돈이 묶이는 기간과 감당 가능한 손실을 확인해요.", action: "공식 상품 설명에서 이해하지 못한 조건을 표시하고, 필요하면 자격 있는 전문가에게 물어보세요.", reconsider: "손실을 감당하기 어렵거나 조건을 이해하지 못했다면, 확신을 주는 풀이만으로 결정하지 않아요." },
    { label: "Investment", title: "Look at downside and terms before returns", answer: "Saju cannot determine returns or when to buy. Separate essential living money from funds you could commit, and check the actual product's risks.", information: "Check risks, fees, lock-up periods and losses you could afford.", action: "Mark unclear terms in the official product disclosure and ask a qualified professional if needed.", reconsider: "If you cannot absorb a loss or do not understand the terms, a reassuring interpretation is not enough to decide." }),
  health: pair(
    { label: "몸과 마음", title: "지친 이유부터 차근차근 살펴봐요", answer: "지친 이유를 생년월일로 정할 수는 없어요. 잠과 일정, 부담이 달랐던 날을 비교하며 실제로 무엇이 달라졌는지 살펴봐요.", information: "언제부터 힘들었는지, 수면과 일상에 어떤 변화가 있었는지 확인해요.", action: "힘들었던 날과 조금 괜찮았던 날의 일정·휴식 차이를 하나씩 적어보세요.", reconsider: "불편이 이어지거나 일상에 지장이 있다면, 이 풀이 대신 의료진과 상담해요." },
    { label: "Body & mind", title: "Start by looking at what changed", answer: "A birth date cannot establish why you feel exhausted. Compare days with different sleep, schedules and demands to see what actually changed.", information: "Note when the difficulty began and changes in sleep or daily functioning.", action: "Compare one difficult day with a better day, including schedule and rest.", reconsider: "If difficulties persist or affect daily life, speak with a qualified clinician rather than relying on this reading." }),
  growth: pair(
    { label: "나 자신", title: "큰 답보다, 지금의 선택 하나부터 봐요", answer: "맞는 길을 한 번에 정하려 하지 않아도 괜찮아요. 하고 싶은 방향과 실제로 시간을 쓰는 곳을 나누면 작은 선택부터 살펴볼 수 있어요.", information: "원하는 변화, 지금의 제약, 이미 해본 방법을 나눠봐요.", action: "이번 주에 부담 없이 시험할 행동 하나와 다시 살펴볼 날짜를 정해보세요.", reconsider: "계획과 실제 경험이 다르면 자신을 탓하기보다 목표의 크기나 방법을 바꿔봐요." },
    { label: "Myself", title: "Start with one choice, not a final answer", answer: "You do not have to settle your entire direction at once. Compare where you want to go with where your time actually goes.", information: "Separate the change you want, current constraints and things already tried.", action: "Choose one manageable action to try this week and a date to review it.", reconsider: "If experience differs from the plan, revise the scope or method rather than blaming yourself." }),
  leadership: pair(
    { label: "리더십", title: "맡은 책임과 결정권을 함께 봐요", answer: "혼자 잘하는 것과 함께 일이 돌아가게 하는 건 달라요. 누가 무엇을 정하고 책임지는지부터 맞춰봐요.", information: "책임자, 결정 권한, 공유할 정보와 완료 기준을 확인해요.", action: "현재 결정 하나에서 제안·결정·실행·검토를 맡을 사람을 나눠 적어보세요.", reconsider: "책임만 있고 권한이나 정보가 없다면, 역할 합의부터 다시 해봐요." },
    { label: "Leadership", title: "Match responsibility with decision rights", answer: "Doing something well alone differs from helping people work together. Start by agreeing who decides and who is responsible.", information: "Check ownership, authority, shared information and completion criteria.", action: "For one decision, identify who proposes, decides, acts and reviews.", reconsider: "If responsibility lacks authority or information, revisit the role agreement." }),
  study: pair(
    { label: "공부 · 시험", title: "목표 분량과 실제 집중 시간을 맞춰봐요", answer: "합격을 확답하기보다 지금 준비에서 바꿀 수 있는 부분을 찾아봐요. 계획한 양과 실제로 이해하고 푼 양을 나눠보세요.", information: "남은 기간, 실제 학습 시간, 자주 막히는 문제를 확인해요.", action: "최근 틀린 문제 하나를 다시 풀고 어디에서 막혔는지 적어보세요.", reconsider: "계획이 계속 밀린다면 시간을 무작정 늘리기보다 분량과 방법을 조정해봐요." },
    { label: "Study & exams", title: "Match the plan to actual focused work", answer: "Rather than promising a pass, identify what you can change in preparation. Separate planned volume from work actually understood and completed.", information: "Check remaining time, actual study hours and recurring difficulties.", action: "Retry one recent incorrect answer and note where you got stuck.", reconsider: "If the plan keeps slipping, adjust its scope or method instead of only adding hours." }),
};
type Key = keyof typeof copies;
const schema = z.object({ locale: z.enum(["ko", "en"]), focusId: z.enum(onboardingFocusIds), concern: z.string().max(2000).default("") }).strict();
const specificTopics: readonly Readonly<{ key: Key; pattern: RegExp }>[] = [
  { key: "business", pattern: /사업|창업|고객|동업|프리랜서|business|startup|start.up|freelanc|client/iu },
  { key: "career", pattern: /이직|퇴사|승진|직업|직장|직무|업무|경력|career|change jobs?|changing jobs?|resign|promotion/iu },
  { key: "job_hunt", pattern: /취업|구직|지원서|면접|job hunt|job search|apply(?:ing)? for (?:a |the )?job|job applicat|interview/iu },
  { key: "debt", pattern: /빚|채무|대출|상환|debt|loan|repay/iu },
  { key: "investment", pattern: /투자|주식|코인|invest|stocks?|crypto/iu },
  { key: "reunion", pattern: /재회|다시.{0,5}(연락|만나)|reconcil|reconnect|get back together/iu },
  { key: "study", pattern: /시험|공부|진학|전공|exam|stud(y|ies)|major/iu },
];
export type FreeConcernReading = Copy & Readonly<{
  policy: typeof FREE_CONCERN_POLICY; selectedFocusId: OnboardingFocusId; selectedLabel: string;
  focusId: OnboardingFocusId; topicId: string; question: string | null;
  scope: "category" | "question" | "unresolved" | "safety"; urgentSupport?: boolean; additionalTopics: readonly string[];
}>;

/** Category/question framing only. Accepts no birth data and never changes calculation facts. */
export function createFreeConcernReading(input: unknown): FreeConcernReading {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new Error("INVALID_FREE_CONCERN_CONTEXT");
  const { locale, focusId } = parsed.data;
  const q = parsed.data.concern.normalize("NFKC").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/gu, "").trim();
  const base = copies[focusId][locale];
  const topics = q ? questionTopics(q) : [];
  if (topics.includes("safety")) {
    const support = getCrisisResourceCopy(locale);
    const crime = assessQuestionSafety(q).category === "crime";
    return { ...base, policy: FREE_CONCERN_POLICY, selectedFocusId: focusId, selectedLabel: base.label,
      focusId, topicId: "safety", question: q, scope: "safety", urgentSupport: !crime, additionalTopics: [],
      label: locale === "ko" ? "안전 · 도움" : "Safety & support",
      title: locale === "ko" ? "지금은 안전과 도움을 먼저 챙겨요" : "Safety and support come first",
      answer: crime ? (locale === "ko" ? "범죄와 관련된 상황은 사주로 판단하지 않아요. 확인된 사실과 안전을 먼저 보고, 위험하거나 불법적인 방법은 안내하지 않아요." : "A crime-related situation needs facts and safety, not a symbolic verdict. I do not provide harmful or illegal methods; focus on safe and lawful options.") : support.emergency, information: crime ? (locale === "ko" ? "실제 상황과 안전하게 멈출 수 있는 방법을 나눠봐요." : "Separate the actual situation from safe ways to stop harm.") : support.locationCaution,
      action: crime ? (locale === "ko" ? "필요하면 관련 공식 기관에 안전하고 합법적인 해결 방법을 확인해요." : "If needed, ask the relevant formal channel about safe and lawful options.") : locale === "ko" ? "믿을 수 있는 사람에게 지금 상황을 알리고, 현재 있는 지역의 도움을 받아요." : "Tell someone you trust what is happening and seek support where you are now.",
      reconsider: locale === "ko" ? "상징 풀이로 위험을 판단하거나 도움을 미루지 않아요." : "Do not use symbolism to assess danger or delay seeking help." };
  }
  const keys: Key[] = specificTopics.filter(item => item.pattern.test(q)).map(item => item.key);
  if (topics.includes("medical")) keys.unshift("health");
  if (topics.includes("money") && !keys.includes("debt") && !keys.includes("investment")) keys.push("money");
  if (topics.includes("career") && !keys.some(key => ["business", "study", "career", "job_hunt"].includes(key))) keys.push("career");
  if (topics.includes("relationship") && !keys.includes("reunion")) keys.push("relationships");
  const categoryShorthand = focusId === "relationships" && /이\s*사람과|그\s*사람과|stay with (?:this|that) person/iu.test(q)
    || focusId === "money" && /돈.{0,8}(모|새|남)|money.{0,15}(settle|leak|sav)/iu.test(q)
    || focusId === "health" && /쉬는\s*법|지치|지칠|지쳐|how to rest/iu.test(q)
    || focusId === "growth" && /나에게.{0,4}(길|맞)|올해.{0,8}(붙잡|무엇)|path fits|hold on|direction/iu.test(q);
  if (!keys.length && categoryShorthand) keys.push(focusId);
  const uniqueKeys = [...new Set(keys)];
  const selectedKeys = uniqueKeys.slice(0, 2);
  const key = selectedKeys[0] ?? focusId;
  const focusFor = (key: Key): OnboardingFocusId => key === "business" || key === "career" || key === "job_hunt" || key === "study" ? "work" : key === "reunion" ? "relationships" : key === "debt" || key === "investment" ? "money" : key;
  const selectedCopies = (selectedKeys.length ? selectedKeys : [focusId]).map(id => copies[id][locale]);
  const copy = copies[key][locale];
  const unknown = Boolean(q) && !keys.length;
  const join = (field: "answer" | "information" | "action" | "reconsider") => selectedCopies.map(item => `${selectedCopies.length > 1 ? `${item.label}: ` : ""}${item[field]}`).join("\n\n");
  if (topics.includes("legal")) {
    return { ...base, policy: FREE_CONCERN_POLICY, selectedFocusId: focusId, selectedLabel: base.label, focusId,
      topicId: "legal", question: q, scope: "question", additionalTopics: [],
      label: locale === "ko" ? "법률 · 계약" : "Legal & contracts",
      title: locale === "ko" ? "문서와 공식 확인이 먼저예요" : "Documents and qualified review come first",
      answer: locale === "ko" ? "계약이나 법적 결과는 생년월일로 정할 수 없어요. 문서와 실제 상황을 확인해야 해요." : "A birth date cannot establish contractual or legal outcomes. Documents and actual circumstances need review.",
      information: locale === "ko" ? "관련 문서, 날짜와 아직 확인하지 못한 조건을 나눠봐요." : "Separate relevant documents, dates and unresolved terms.",
      action: locale === "ko" ? "되돌리기 어려운 결정을 하기 전, 자격 있는 전문가나 공식 기관에 확인해요." : "Before an irreversible decision, check with a qualified professional or formal channel.",
      reconsider: locale === "ko" ? "공식 확인 전에는 이 풀이로 법적 결과를 확정하지 않아요." : "Do not treat this reflection as a legal conclusion." };
  }
  return { ...copy, answer: join("answer"), information: join("information"), action: join("action"), reconsider: join("reconsider"),
    policy: FREE_CONCERN_POLICY, selectedFocusId: focusId, selectedLabel: base.label,
    focusId: focusFor(key), topicId: selectedKeys.length ? selectedKeys.join("+") : focusId, question: q || null,
    label: selectedCopies.map(item => item.label).join(" · "),
    additionalTopics: uniqueKeys.slice(2).map(id => copies[id][locale].label),
    scope: unknown ? "unresolved" : q ? "question" : "category",
    ...(selectedCopies.length > 1 ? { title: locale === "ko" ? "두 가지 고민을 나눠서 봐요" : "Look at these concerns separately" } : {}),
    ...(unknown ? { title: locale === "ko" ? "지금 상황을 조금 더 알려주세요" : "A little more context would help",
      answer: locale === "ko" ? `이 문장만으로는 어떤 상황인지 짚기 어려워요. 우선 선택한 ${base.label}에서 확인할 기준부터 볼게요. ${base.answer}` : `This wording does not give enough context to identify the situation. Start with the checks for your selected focus, ${base.label}. ${base.answer}` } : {}),
  };
}

/** Stable display order only; the underlying domains and scores stay untouched. */
export function freeDomainOrder(focusId: OnboardingFocusId): readonly string[] {
  return {
    work: ["career", "leadership", "action"], money: ["money", "action", "stress"],
    relationships: ["relationships", "thinking", "stress"], health: ["stress", "action", "thinking"],
    growth: ["thinking", "action", "relationships"], leadership: ["leadership", "action", "relationships"],
  }[focusId];
}
