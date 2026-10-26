import { assessQuestionSafety } from "@/core/ai/safety";

// Shared lightweight classifier. Paid answer prose must not enter the free-page bundle.
export type QuestionTopic = "safety" | "medical" | "money" | "career" | "relationship" | "validity" | "name" | "legal" | "unsupported";

export function questionTopics(question: string): QuestionTopic[] {
  const q = question.normalize("NFKC").slice(0, 2_000);
  const safety = assessQuestionSafety(q);
  if (safety.requiresUrgentSafetyResponse || safety.category === "crime" || /自殺|死にたい|自傷|殺したい|脅迫|暴力/u.test(q)) return ["safety"];
  const result: QuestionTopic[] = [];
  if ((/(이름|영문명|로마자|\bname\b|名前|氏名)/iu.test(q) && /(수치|숫자|계산|보는|numbers?|calculat|expression|soul|数|計算)/iu.test(q)) || /표현수|내면수|인격수|soul urge|expression number|personality number|表現数|人格数/iu.test(q)) result.push("name");
  const symbolicContext = /생명수|수비학|생년월일|마스터|\b(?:11|22|33)\b|numerolog|birth.?date|life path|master number|数秘|生年月日/iu.test(q);
  if (/특별한\s*능력|초능력|special\s+abilit|psychic|特別な能力/iu.test(q) || (symbolicContext && /입증|과학적|증명|scientific|\bprov(e|en|es)\b|証明|科学/iu.test(q))) result.push("validity");
  if (safety.category === "medical" || /피곤|피로|통증|질병|병을|병의|병이|병원|수면|잠이|잠을|건강|fatigue|tired|symptom|illness|health|medicat|疲れ|疲労|病気|診断|睡眠|服薬|健康/iu.test(q)) result.push("medical");
  if (safety.category === "financial" || /대출|상환|채무|빚|투자|돈\s*관리|loan|repay|debt|invest|借金|返済|投資|家計/iu.test(q)) result.push("money");
  if (safety.category === "legal" || /소송|법률|계약서|lawsuit|legal|court|訴訟|法律|契約/iu.test(q)) result.push("legal");
  if (/이직|퇴사|취업|일을?\s*바꾸|직장|평가\s*기준|커리어|경력|업무|직무|(?:^|\s)일(?:의|과|에서|을)|career|job|resign|転職|退職|就職|勤務/iu.test(q)) result.push("career");
  if (/상대|파트너|재회|연애|관계(?!없)|궁합|다툼|갈등|마음.{0,8}열|partner|relationship|reconcil|argument|相手|恋愛|復縁|関係|仲直り/iu.test(q)) result.push("relationship");
  return result.length ? result : ["unsupported"];
}

