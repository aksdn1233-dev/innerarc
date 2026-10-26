import { questionTopics } from "@/core/question-topics";
export { questionTopics } from "@/core/question-topics";
import type { NameCalculation } from "@/core/numerology";

export const REPORT_QUESTION_POLICY = "report-questions:1.0.0";
export type QuestionLanguage = "ko" | "en" | "ja";
type Copy = Readonly<{ answer: string; information: string; action: string; reconsider: string }>;
type LocalizedCopy = Readonly<Record<QuestionLanguage, Copy>>;

// Practical decision aids, never conclusions derived from a person's birth numbers.
// Every match uses the current question, not the previous question or chosen focus.
const guidance = {
  safety: {
    ko: { answer: "지금은 풀이보다 본인과 주변 사람의 안전을 먼저 챙겨야 해요. 위험한 행동을 혼자 결정하지 말고, 가까운 믿을 만한 사람이나 공적인 긴급 도움을 바로 요청해 주세요.", information: "지금 안전한 장소에 있는지, 곁에서 도와줄 사람이 있는지부터 확인해 주세요.", action: "위험한 상황에서 벗어나 도움을 요청하세요. 혼자 대면하거나 위험한 물건을 다루지 마세요.", reconsider: "즉각적인 위험이 있으면 리포트를 읽는 것보다 긴급 도움을 받는 일이 먼저예요." },
    en: { answer: "Your safety and other people's safety come before a reading. Do not make a dangerous decision alone; contact someone you trust or local emergency help now.", information: "Check whether you are somewhere safe and whether someone can stay with you.", action: "Move away from immediate danger and ask for help. Avoid confronting someone alone or handling dangerous objects.", reconsider: "If danger is immediate, getting emergency help takes priority over continuing this report." },
    ja: { answer: "今は解釈より、ご自身と周囲の安全が最優先です。危険な判断を一人でせず、信頼できる人や公的な緊急支援に助けを求めてください。", information: "安全な場所にいるか、そばで助けてくれる人がいるかを確認してください。", action: "差し迫った危険から離れ、助けを求めてください。一人で相手と対面したり、危険な物を扱ったりしないでください。", reconsider: "緊急の危険がある場合は、レポートを読むより緊急支援を受けることを優先してください。" },
  },
  medical: {
    ko: { answer: "생년월일로 피로의 원인이나 질병을 진단할 수는 없어요. 실제 증상과 생활 변화를 따로 살펴야 해요.", information: "언제 시작됐는지, 수면 시간, 복용 중인 약, 함께 생긴 증상, 일상에 미치는 영향을 확인해 주세요.", action: "수면과 증상 변화를 짧게 기록해 보세요. 이유를 모르는 피로가 계속되거나 일상에 지장을 주면 의료진과 상담하세요. 약을 임의로 바꾸지는 마세요.", reconsider: "증상이 심해지거나 안전이 걱정되는 상태라면 기록을 다 채울 때까지 기다리지 말고 의료 도움을 먼저 받으세요." },
    en: { answer: "A birth date cannot diagnose illness or explain the cause of fatigue. Actual symptoms and changes in daily life need a separate assessment.", information: "Check when symptoms began, sleep, medicines, accompanying symptoms and effects on daily activities.", action: "Keep a brief sleep and symptom record. Consult a clinician if unexplained fatigue persists or affects daily life; do not change medicines on your own.", reconsider: "If symptoms worsen or safety is a concern, seek medical help rather than waiting to complete a record." },
    ja: { answer: "生年月日だけでは、疲労の原因や病気を診断できません。実際の症状と生活の変化を別に確認する必要があります。", information: "症状が始まった時期、睡眠、服薬、ほかの症状、日常生活への影響を確認してください。", action: "睡眠と症状の変化を短く記録しましょう。原因不明の疲労が続く、または日常生活に支障がある場合は医療機関に相談し、薬を自己判断で変えないでください。", reconsider: "症状が悪化したり安全が心配だったりする場合は、記録がそろうのを待たず医療の助けを受けてください。" },
  },
  money: {
    ko: { answer: "상환 가능 여부와 투자 여력은 생년월일로 판단할 수 없어요. 실제 소득·지출·대출 조건으로 현금 흐름부터 확인해야 해요.", information: "세후 월소득, 필수 생활비, 월 상환액, 대출 잔액과 금리, 비정기 지출, 비상자금을 확인해 주세요.", action: "개인 기록에 ‘월소득 − 생활비 − 상환액’을 적고 비정기 지출까지 비교해 보세요. 남는 돈이 있다는 이유만으로 투자 적합성이 입증되지는 않아요.", reconsider: "연체가 예상되거나 생활비가 부족하면 추가 투자를 결정하기 전에 금융기관이나 공인된 채무 상담 창구에서 실제 조건을 확인하세요." },
    en: { answer: "Birth numbers cannot establish repayment capacity or whether investing more is suitable. Check cash flow using real income, expenses and loan terms first.", information: "Check take-home income, essential expenses, monthly debt payments, balance, interest rate, irregular costs and emergency funds.", action: "In your own records, compare monthly income minus living costs minus debt payments, allowing for irregular expenses. A positive surplus alone does not establish investment suitability.", reconsider: "If payments may be missed or living costs are not covered, review the actual terms with the lender or an accredited debt counselor before deciding on additional investments." },
    ja: { answer: "返済能力や投資の余力は、生年月日では判断できません。実際の収入・支出・借入条件から資金繰りを確認しましょう。", information: "手取り収入、生活費、毎月の返済額、残高、金利、臨時支出、緊急時の資金を確認してください。", action: "ご自身の記録で『月収 − 生活費 − 返済額』を整理し、臨時支出も比べてください。黒字だけで投資の適合性が分かるわけではありません。", reconsider: "延滞や生活費不足が見込まれる場合は、追加投資を決める前に金融機関や公的・認定の債務相談窓口で条件を確認してください。" },
  },
  career: {
    ko: { answer: "이직은 현재 일의 불만과 새 자리의 실제 조건을 나눠 비교해 보세요. 생년월일만으로 성공 여부나 퇴사 시점을 정할 수는 없어요.", information: "새 역할의 업무 비중, 권한·책임, 평가 기준, 급여·근무 조건, 제안의 확정 여부와 소득 공백을 확인해 주세요.", action: "현재 자리와 새 자리의 업무 조건을 한 표에 적어보세요. 제안이 있다면 서면 조건과 실제 업무가 맞는지 먼저 확인해요.", reconsider: "조건이 말로만 전달됐거나 감당할 소득 공백이 확인되지 않았다면, 퇴사 확정보다 자료 확인을 먼저 해보세요." },
    en: { answer: "Compare dissatisfaction with the current job against the next role's actual conditions. A birth date cannot decide success or the right resignation date.", information: "Check duties, authority, responsibilities, evaluation criteria, pay, working conditions, a confirmed offer and any income gap.", action: "Compare the current and next role in a written table. Where an offer exists, check written terms against the actual work before making an irreversible decision.", reconsider: "If terms are only verbal or the income gap has not been assessed, verify those conditions before committing to resign." },
    ja: { answer: "転職は、現職への不満と新しい職場の実際の条件を分けて比べましょう。生年月日だけでは成功や退職時期を決められません。", information: "仕事内容、裁量と責任、評価基準、給与・勤務条件、内定の確定状況、収入が途切れる期間を確認してください。", action: "現職と転職先の勤務条件を表に整理しましょう。内定がある場合は、書面の条件と実際の仕事が一致するか確認してください。", reconsider: "口頭の説明しかない、または収入の空白期間を検討できていない場合は、退職の確定より条件確認を優先しましょう。" },
  },
  relationship: {
    ko: { answer: "상대의 마음이나 관계 회복 여부는 생년월일로 확정할 수 없어요. 상대 생년월일을 더 받아도 마음이 입증되는 것은 아니에요. 실제 의사와 행동을 살펴야 해요.", information: "대화 의사, 약속을 지키는 행동, 거절 존중, 갈등 뒤의 설명과 책임 분담을 확인해 주세요.", action: "서로 안전하게 대화할 수 있을 때, 필요한 것이 공감인지 결정인지 먼저 말하고 상대의 의사를 물어보세요. 추측과 직접 확인한 말을 따로 적어봐요.", reconsider: "분명한 거절은 존중해야 해요. 위협이나 폭력이 있다면 관계를 설득하려 하기보다 안전과 공적인 도움을 우선하세요." },
    en: { answer: "A birth date cannot establish another person's feelings or guarantee reconciliation, even with both birth dates. Look at their expressed wishes and actual behavior.", information: "Check willingness to talk, kept promises, respect for refusal, repair after conflict and shared responsibilities.", action: "When a conversation is safe, say whether you need empathy or a decision and ask what the other person wants. Separate what they said from what you inferred.", reconsider: "Respect a clear refusal. Where threats or violence are involved, prioritize safety and formal help rather than persuasion." },
    ja: { answer: "相手の気持ちや関係の回復は、生年月日では確定できません。二人分の生年月日があっても気持ちの証明にはならず、本人の意思と行動を確認する必要があります。", information: "対話の意思、約束を守る行動、拒否の尊重、衝突後の説明、責任の分担を確認してください。", action: "安全に話せるとき、共感がほしいのか決定が必要なのかを伝え、相手の意思を尋ねましょう。直接聞いた言葉と推測は分けて記録してください。", reconsider: "明確な拒否は尊重してください。脅しや暴力がある場合は説得より、安全と公的な支援を優先してください。" },
  },
  validity: {
    ko: { answer: "33 같은 마스터수도 특별한 능력이나 미래를 입증하지는 않아요. 숫자가 나오는 계산과 그 숫자에 붙이는 상징적 설명은 구분해야 해요.", information: "확인하려는 능력이 무엇인지, 실제 결과나 다른 사람의 평가처럼 숫자와 무관한 근거가 있는지 살펴보세요.", action: "해석과 맞는 경험 하나, 다른 경험 하나를 나란히 적어보세요. 관찰 결과가 다르면 숫자에 맞추기보다 설명을 수정해요.", reconsider: "증거가 없거나 반대 사례가 나오면 특별한 능력이 있다고 결론내리지 마세요." },
    en: { answer: "A master number such as 33 does not prove special abilities or future outcomes. A reproducible calculation is different from the symbolic meaning attached to it.", information: "Define the ability you want to assess and look for results or external feedback independent of the numbers.", action: "Record one experience that fits the interpretation and one that does not. Revise the explanation when observations disagree.", reconsider: "Do not conclude that special ability is established when evidence is missing or counterexamples appear." },
    ja: { answer: "33などのマスターナンバーも、特別な能力や未来を証明しません。規則による計算と、数字に付ける象徴的な意味は別です。", information: "確かめたい能力を具体的にし、実際の成果や他者の評価など、数字とは独立した根拠を確認してください。", action: "解釈に合う経験と合わない経験を一つずつ記録しましょう。観察と異なる場合は、数字に合わせず説明を見直してください。", reconsider: "根拠がない、または反例がある場合は、特別な能力が証明されたと結論づけないでください。" },
  },
  name: {
    ko: { answer: "이름으로 보는 수치에는 실제 이름의 지원 가능한 영문 표기가 필요해요. 이름이 없거나 지원 글자가 없으면 계산할 수 없고, 생년월일로 대신 추정하지 않아요.", information: "어떤 영문 표기를 사용할지와 어떤 글자가 계산에 포함되는지 확인해야 해요. 이름 입력은 선택 사항이에요.", action: "이름을 제공하고 싶지 않다면 생년월일 기반 값만 읽어도 돼요. 한글 이름을 임의로 영문 이름으로 바꾸지는 않아요.", reconsider: "철자나 표기를 바꾸면 이름 기반 값도 달라질 수 있어요. 이를 객관적인 성격 검사로 해석하지 마세요." },
    en: { answer: "Name-based numbers require an actual name in supported Latin letters. If no name or supported letters are available, they cannot be calculated or inferred from a birth date.", information: "Check the chosen spelling and which letters the calculation supports. Providing a name is optional.", action: "Use only birth-date values if you prefer not to provide a name. A missing name is never filled in with an invented spelling.", reconsider: "A different spelling can change name-based values; these values are not an objective personality assessment." },
    ja: { answer: "名前に基づく数値には、対応する英字表記の名前が必要です。名前や対応する文字がなければ計算できず、生年月日から推測することもしません。", information: "どの綴りを使い、どの文字が計算対象になるか確認してください。名前の入力は任意です。", action: "名前を提供したくなければ、生年月日から計算する値だけ読んでもかまいません。日本語の名前を勝手に英字に変換することはありません。", reconsider: "表記が変わると名前の数値も変わる場合があります。客観的な性格検査とは解釈しないでください。" },
  },
  legal: {
    ko: { answer: "계약이나 법적 결과는 생년월일로 판단할 수 없어요. 관련 문서와 적용되는 제도를 자격 있는 전문가나 공식 기관에서 먼저 확인해 주세요.", information: "관련 문서, 당사자, 실제 발생한 일, 기한과 관할을 확인해야 해요.", action: "문서와 날짜를 정리하고 해당 지역의 공식 상담 창구에 확인할 질문을 적어보세요. 해석을 근거로 서명이나 대응 기한을 결정하지 마세요.", reconsider: "권리나 기한에 영향을 주는 결정은 이 리포트만으로 진행하지 마세요." },
    en: { answer: "Birth numbers cannot determine a contract or legal outcome. Have the relevant documents and rules checked by a qualified professional or formal channel.", information: "Check documents, parties, what actually happened, deadlines and jurisdiction.", action: "Organize documents and dates and prepare questions for an appropriate official service. Do not use a reading to decide whether to sign or when to respond.", reconsider: "Do not rely on this report alone for a decision affecting rights or deadlines." },
    ja: { answer: "契約や法的な結果は生年月日では判断できません。関係する文書と制度を、資格のある専門家や公式窓口で確認してください。", information: "文書、当事者、実際に起きたこと、期限、管轄を確認する必要があります。", action: "文書と日付を整理して公式窓口への質問を準備しましょう。解釈を理由に署名や対応期限を決めないでください。", reconsider: "権利や期限に関わる決定を、このレポートだけで進めないでください。" },
  },
  unsupported: {
    ko: { answer: "지금 적어주신 내용만으로는 이 질문의 구체적인 답을 정하기 어려워요. 무엇을 확인하면 판단할 수 있을지부터 함께 정리해 볼게요.", information: "무엇을 결정하려는지, 이미 확인한 사실, 원하는 결과와 기한을 나눠보세요.", action: "이번 주에 확인할 사실 하나를 골라보세요. 확인 전 예상과 확인 뒤 실제 결과를 따로 적으면 다음 판단의 근거가 돼요.", reconsider: "질문에 필요한 사실이 없으면 결론을 보류해도 돼요. 기록과 해석이 다를 때는 실제 기록을 우선해 주세요." },
    en: { answer: "Your question needs more context before a specific conclusion is justified. Start by separating what you know from what still needs checking.", information: "Separate the decision, known facts, desired outcome and deadline.", action: "Choose one fact to verify this week. Record the expectation before checking and the actual result afterward.", reconsider: "Hold the conclusion when necessary facts are missing. Prioritize observed records when they disagree with the interpretation." },
    ja: { answer: "今の内容だけでは、この質問への具体的な答えを決めるのは難しそうです。何を確認すれば判断できるか、一緒に整理しましょう。", information: "決めたいこと、確認済みの事実、望む結果、期限を分けてください。", action: "今週確かめる事実を一つ選び、確認前の予想と確認後の結果を別々に記録しましょう。", reconsider: "必要な事実がなければ結論を保留してかまいません。解釈と異なる場合は実際の記録を優先してください。" },
  },
} as const satisfies Record<string, LocalizedCopy>;

export type QuestionTopic = keyof typeof guidance;
export type ReportQuestionAnswer = Readonly<Copy & { question: string; topics: readonly QuestionTopic[] }>;


export function buildQuestionAnswer(question: string, language: QuestionLanguage, name?: NameCalculation): ReportQuestionAnswer {
  const topics = questionTopics(question);
  const copies: Copy[] = topics.map(topic => {
    const copy: Copy = guidance[topic][language];
    if (topic !== "name" || name?.status !== "calculated") return copy;
    const values = [name.destiny?.value, name.soulUrge?.value, name.personality?.value];
    if (values.some(value => value === undefined)) return copy;
    const answer = language === "ko" ? `입력된 지원 영문 글자로 계산한 표현수·내면수·인격수는 각각 ${values.join(" · ")}예요. 지원하지 않는 글자는 계산에 포함되지 않으며, 임의의 로마자 표기를 만들지 않아요.`
      : language === "ja" ? `入力された対応英字による表現数・内面数・人格数は、順に ${values.join("・")} です。非対応の文字は含めず、ローマ字表記を勝手に作りません。`
        : `From the supported Latin letters supplied, expression, soul urge and personality numbers are ${values.join(" / ")} respectively. Unsupported characters are excluded; no transliteration is invented.`;
    return { ...copy, answer };
  });
  const join = (key: keyof Copy) => copies.map(copy => copy[key]).join("\n");
  return { question: question.trim(), topics, answer: join("answer"), information: join("information"), action: join("action"), reconsider: join("reconsider") };
}

export function selectReportQuestions(questions: readonly string[] | undefined, concern: string): string[] {
  return (questions?.length ? questions : [concern]).map(q => q.trim()).filter(Boolean).slice(0, 2);
}

export function formatQuestionAnswer(answer: ReportQuestionAnswer, index: number, language: QuestionLanguage): string {
  const labels = language === "ko" ? [`개인 질문 ${index + 1} 직접 답변`, "질문", "답변", "확인할 정보", "확인할 행동", "다시 판단할 때"]
    : language === "ja" ? [`個別の質問 ${index + 1}`, "質問", "回答", "確認する情報", "次の行動", "見直すとき"]
      : [`Personal question ${index + 1}`, "Question", "Answer", "Information to check", "Next step", "Reconsider when"];
  return `${labels[0]}\n${labels[1]}: ${answer.question}\n\n${labels[2]}: ${answer.answer}\n\n${labels[3]}: ${answer.information}\n\n${labels[4]}: ${answer.action}\n\n${labels[5]}: ${answer.reconsider}`;
}
