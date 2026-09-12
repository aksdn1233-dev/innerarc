import { DreamSignatureSchema, type DreamEvent, type DreamSignature } from "./schema";

const MINIMUM = 3;
function counts(events: readonly DreamEvent[], kind: "entity" | "emotion" | "action", locale: "ko" | "en") {
  const values = new Map<string, { label: string; dates: string[] }>();
  for (const event of events) for (const token of event.initialInterpretation.ontology.filter((item) => item.kind === kind)) {
    const current = values.get(token.code) ?? { label: token.label[locale], dates: [] };
    current.dates.push(event.dreamDate); values.set(token.code, current);
  }
  return [...values.entries()].map(([code, value]) => ({ code, label: value.label, count: value.dates.length })).filter((item) => item.count >= 2).sort((a, b) => b.count - a.count || a.code.localeCompare(b.code)).slice(0, 10);
}

export function buildDreamSignature(events: readonly DreamEvent[], locale: "ko" | "en"): DreamSignature {
  const valid = events.slice(0, 500);
  const datesByCode = new Map<string, number[]>();
  for (const event of valid) for (const token of event.initialInterpretation.ontology) {
    if (!["entity", "emotion", "action", "relation", "location"].includes(token.kind)) continue;
    const dates = datesByCode.get(token.code) ?? []; dates.push(Date.parse(`${event.dreamDate}T12:00:00Z`)); datesByCode.set(token.code, dates);
  }
  const temporalClusters: { code: string; occurrences: number; windowDays: 30 | 90 }[] = [];
  for (const [code, timestamps] of datesByCode) {
    const sorted = [...timestamps].sort((a, b) => a - b);
    for (const windowDays of [30, 90] as const) {
      let maximum = 0;
      for (let left = 0, right = 0; right < sorted.length; right += 1) {
        while (sorted[right]! - sorted[left]! > windowDays * 86_400_000) left += 1;
        maximum = Math.max(maximum, right - left + 1);
      }
      if (maximum >= 2) temporalClusters.push({ code, occurrences: maximum, windowDays });
    }
  }
  const status = valid.length < MINIMUM ? "insufficient" : valid.length < 5 ? "initial" : "established";
  return DreamSignatureSchema.parse({ status, sampleSize: valid.length, minimumRequired: MINIMUM, recurringEntities: status === "insufficient" ? [] : counts(valid, "entity", locale), recurringEmotions: status === "insufficient" ? [] : counts(valid, "emotion", locale), recurringActions: status === "insufficient" ? [] : counts(valid, "action", locale), temporalClusters: status === "insufficient" ? [] : temporalClusters.slice(0, 20), note: locale === "ko" ? status === "insufficient" ? `꿈이 ${MINIMUM}개 모이면 조심스럽게 반복을 비교합니다.` : "반복은 개인 기록에서 관찰된 경향이며 원인이나 미래 예측을 뜻하지 않습니다." : status === "insufficient" ? `Record ${MINIMUM} dreams before a cautious pattern comparison.` : "Repetition is an observed tendency in personal records, not a cause or prediction." });
}
