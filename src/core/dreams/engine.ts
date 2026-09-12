import {
  DreamEventSchema,
  DreamInputSchema,
  DreamInterpretationSchema,
  type DreamEvent,
  type DreamInput,
  type DreamInterpretation,
} from "./schema";
import { assertAllowlistedDreamSourceIds } from "./sources";
import { extractDreamOntology, hasToken } from "./ontology";

type Locale = DreamInput["locale"];
export type DreamPersonalizationContext = Readonly<{
  symbolicPatterns: readonly Readonly<{ system: "saju" | "numerology"; summary: string; sourceReference: string }>[];
  recentRealityChecks?: readonly Readonly<{ response: "MATCH" | "PARTIAL" | "MISMATCH" | "CONTEXT_DEPENDENT" }>[];
}>;
export type DreamUnderstanding = Readonly<Pick<DreamInterpretation, "ontology" | "categories" | "followUpQuestions">>;
const koEn = <T>(locale: Locale, ko: T, en: T) => locale === "ko" ? ko : en;
function koreanSubject(value: string): string {
  const last = value.codePointAt(value.length - 1) ?? 0;
  const hasFinalConsonant = last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
  return `${value}${hasFinalConsonant ? "이" : "가"}`;
}

function dayAfter(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function relevantHistory(input: DreamInput, history: readonly DreamEvent[], ontology = extractDreamOntology(input)) {
  const codes = new Set(ontology.map((token) => `${token.kind}:${token.code}`));
  return history.filter((event) => event.initialInterpretation.ontology.some((token) => codes.has(`${token.kind}:${token.code}`)));
}

function categoriesFor(input: DreamInput, history: readonly DreamEvent[], tokens = extractDreamOntology(input)) {
  const categories = new Set<DreamInterpretation["categories"][number]>();
  if (input.context.recentExperience || hasToken(tokens, "context", "RECENT_MEDIA")) categories.add("DAILY_CONTINUITY");
  if (tokens.some((token) => token.kind === "emotion")) categories.add("EMOTIONAL_PROCESSING");
  if (input.context.recurring || relevantHistory(input, history, tokens).length >= 1) categories.add("REPEATING_PATTERN");
  if (tokens.some((token) => token.kind === "entity" || token.kind === "location")) categories.add("SYMBOLIC");
  if (hasToken(tokens, "emotion", "FEAR") || hasToken(tokens, "action", "CHASE")) categories.add("NIGHTMARE");
  if (input.context.bodyState || hasToken(tokens, "context", "BODY_STATE")) categories.add("BODY_STATE_RELATED");
  if (/트라우마|학대|폭행|사고|전쟁|trauma|abuse|assault|accident|war/i.test(input.rawText)) categories.add("TRAUMA_RELATED_POSSIBLE");
  if (tokens.some((token) => ["SNAKE", "PIG", "DECEASED_PERSON", "WATER", "TEETH", "BABY"].includes(token.code))) categories.add("TRADITIONAL_INTERPRETABLE");
  if (input.context.lucid || /자각몽|꿈인\s*줄\s*알|lucid|knew.*dream/i.test(input.rawText)) categories.add("LUCID_DREAM");
  if (!categories.size) categories.add("UNKNOWN");
  return [...categories];
}

function followUps(input: DreamInput, history: readonly DreamEvent[], tokens = extractDreamOntology(input)) {
  const questions: { id: string; question: string; reason: string }[] = [];
  const add = (id: string, koQ: string, enQ: string, koR: string, enR: string) => questions.push({ id, question: koEn(input.locale, koQ, enQ), reason: koEn(input.locale, koR, enR) });
  if (!tokens.some((token) => token.kind === "emotion")) add("followup:emotion", "꿈에서 가장 강했던 감정은 무엇이었나요?", "What was the strongest feeling in the dream?", "같은 장면도 감정에 따라 현재 상황과의 연결이 달라집니다.", "The same scene can connect differently to waking life depending on the emotion.");
  if ((hasToken(tokens, "entity", "SNAKE") || hasToken(tokens, "entity", "PIG")) && !tokens.some((token) => token.kind === "action")) add("followup:action", "그 대상은 무엇을 했고, 당신은 어떻게 반응했나요?", "What did it do, and how did you respond?", "대상을 본 것과 쫓기거나 잡은 것은 서로 다른 사건입니다.", "Seeing it, being chased, and catching it are different events.");
  if (!input.context.currentConcern && !input.context.recentExperience) add("followup:recent", "최근 가장 마음에 걸린 일과 닮은 점이 있었나요?", "Did it resemble anything that has been weighing on you lately?", "최근 경험과 이어지는지 확인하면 무리한 상징 해석을 줄일 수 있습니다.", "Checking recent experience reduces unsupported symbolic interpretation.");
  if (history.length > 0 && relevantHistory(input, history, tokens).length === 0 && questions.length < 3) add("followup:familiar", "이 장면이나 감정이 예전 꿈에도 나온 적이 있나요?", "Has this scene or feeling appeared in an earlier dream?", "개인 반복 근거는 일반 해몽과 별도로 확인합니다.", "Personal repetition is assessed separately from general tradition.");
  return questions.slice(0, 3);
}

function traditionLayer(input: DreamInput, tokens = extractDreamOntology(input)) {
  const entries: DreamInterpretation["layers"]["tradition"] = [];
  if (tokens.some((token) => ["SNAKE", "PIG", "WATER", "DECEASED_PERSON", "BABY", "TEETH"].includes(token.code))) {
    entries.push({
      evidenceType: "traditional",
      statement: koEn(input.locale,
        "한국 민속에서는 동물·물·가족·탄생 같은 장면을 길흉이나 삶의 전환과 연결해 전승해 왔습니다. 다만 대상이 무엇을 했는지와 꿈꾼 사람의 사정에 따라 읽는 법이 달라집니다.",
        "Korean folk traditions have connected animals, water, family, and birth scenes with fortune or life transitions. Readings vary with the action and the dreamer's circumstances."),
      sourceIds: ["dream-source:korean-folklore-encyclopedia"],
      confidence: "medium",
      limitation: koEn(input.locale, "문화적 전승을 정리한 것으로 실제 사건을 예고한다는 근거는 아닙니다.", "This records cultural tradition; it is not evidence that a real event will occur."),
    });
  }
  entries.push({
    evidenceType: "traditional",
    statement: koEn(input.locale,
      "아르테미도로스의 고대 해몽서는 같은 상징도 꿈꾼 사람의 직업·형편·상황을 함께 보아야 한다고 다뤘습니다. 그래서 이 분석도 단어 하나로 결론내리지 않습니다.",
      "Artemidorus treated the same image differently according to the dreamer's occupation and circumstances. This reading therefore does not decide from one keyword."),
    sourceIds: ["dream-source:artemidorus-oneirocritica"],
    confidence: "high",
    limitation: koEn(input.locale, "고대의 해석 원칙을 설명한 것이며 현대적 사실 검증이나 예측 도구는 아닙니다.", "This describes an ancient interpretive method, not modern validation or prediction."),
  });
  entries.push({
    evidenceType: "traditional",
    statement: koEn(input.locale,
      "중국 고대 꿈 기록은 서로 다른 필사본과 후대 해석을 함께 따져야 합니다. 현존 자료의 재검토가 오래된 통설을 바꾼 사례도 있어, 온라인 ‘주공해몽’ 목록을 원전처럼 쓰지 않습니다.",
      "Ancient Chinese dream records require comparison across manuscripts and later readings. Because manuscript study can overturn received interpretations, online ‘Duke of Zhou’ lists are not treated as primary texts."),
    sourceIds: ["dream-source:ancient-chinese-chengwu"], confidence: "medium",
    limitation: koEn(input.locale, "고대 문헌의 전승과 해석법을 설명하며, 이 꿈의 결과를 예고하지 않습니다.", "This describes textual transmission and historical interpretation, not the outcome of this dream."),
  });
  entries.push({
    evidenceType: "traditional",
    statement: koEn(input.locale,
      "이슬람 전통의 공신력 있는 초기 자료는 꿈의 경험을 한 종류로 단정하지 않고 서로 다른 유형으로 구분합니다. 그래서 후대의 상징 사전을 모든 꿈에 그대로 적용하지 않습니다.",
      "An established early Islamic source distinguishes different kinds of dream experience. Later symbol dictionaries are therefore not applied to every dream as a universal rule."),
    sourceIds: ["dream-source:islamic-three-dream-types"], confidence: "medium",
    limitation: koEn(input.locale, "후대에 이븐 시린의 이름으로 유통된 책들의 저자 귀속은 별도로 검토해야 합니다.", "Authorship of later books circulated under Ibn Sirin's name requires separate scrutiny."),
  });
  entries.push({
    evidenceType: "traditional",
    statement: koEn(input.locale,
      "남아시아의 역사 자료에도 꿈과 징조를 함께 다룬 체계가 남아 있습니다. 다만 번역본과 판본 차이가 있어 V1은 개별 상징의 뜻을 단정하지 않습니다.",
      "South Asian historical compendia also preserve systems connecting dreams and omens. Edition and translation differences mean V1 does not assign a fixed meaning to an individual symbol."),
    sourceIds: ["dream-source:brihat-samhita-dreams"], confidence: "low",
    limitation: koEn(input.locale, "판본 단위 검토 전에는 역사적 자료의 존재만 설명합니다.", "Until an edition-level review is complete, this establishes only the existence of the historical tradition."),
  });
  return entries;
}

function modernLayer(input: DreamInput) {
  const entries: DreamInterpretation["layers"]["modernResearch"] = [{
    evidenceType: "modern_research",
    statement: koEn(input.locale,
      "꿈 내용은 최근 생활과 이어질 수 있습니다. 특히 사건 자체보다 그때의 감정과 요즘 마음에 남은 일을 함께 비교하는 편이 더 신중합니다.",
      "Dream content can continue waking concerns. Comparing the feeling and recent concerns is more cautious than treating the scene itself as a prediction."),
    sourceIds: ["dream-source:continuity-schredl-2000", "dream-source:early-late-night-2020"],
    confidence: "high",
    limitation: koEn(input.locale, "연구는 집단 수준의 경향을 다루며 개인 꿈의 정답을 제공하지 않습니다.", "Research describes group-level tendencies and cannot provide a correct answer for one person's dream."),
  }];
  if (input.context.recentExperience || /최근|어제|영화|드라마|recent|yesterday|movie|show/i.test(input.rawText)) entries.push({
    evidenceType: "modern_research",
    statement: koEn(input.locale, "최근 경험이 바로 또는 며칠 뒤 꿈에 섞여 나타날 가능성을 먼저 살펴볼 수 있습니다.", "A recent experience may have been incorporated into the dream immediately or after several days."),
    sourceIds: ["dream-source:dream-lag-2011"], confidence: "medium",
    limitation: koEn(input.locale, "소규모 연구의 관찰이므로 모든 꿈에 같은 시간표를 적용할 수 없습니다.", "The study was small, so its timing cannot be applied to every dream."),
  });
  return entries;
}

function personalHistoryLayer(input: DreamInput, history: readonly DreamEvent[], tokens = extractDreamOntology(input)) {
  const similar = relevantHistory(input, history, tokens);
  const layers: DreamInterpretation["layers"]["personalHistory"] = [];
  if (!similar.length) layers.push({ evidenceType: "personal_history", statement: koEn(input.locale, "아직 비교할 만한 이전 꿈 기록이 없습니다.", "There is no earlier comparable dream yet."), sourceIds: [], confidence: "low", limitation: koEn(input.locale, "꿈이 3개 이상 쌓이기 전에는 개인 반복 패턴을 만들지 않습니다.", "A personal repeating pattern is not formed before at least three dreams are recorded.") });
  else {
    const outcomeCount = similar.flatMap((event) => event.followUps).filter((followUp) => followUp.completedAt && ["MATCH", "PARTIAL"].includes(followUp.fit ?? "")).length;
    layers.push({ evidenceType: "personal_history", statement: koEn(input.locale, `비슷한 상징·감정·행동이 담긴 이전 기록이 ${similar.length}개 있습니다.${outcomeCount ? ` 그중 사후 기록과 일부 연결된 확인은 ${outcomeCount}개입니다.` : " 아직 사후 확인은 충분하지 않습니다."}`, `${similar.length} earlier record(s) share a symbol, feeling, or action.${outcomeCount ? ` ${outcomeCount} later check(s) had some recorded connection.` : " Later checks are not yet sufficient."}`), sourceIds: [], confidence: similar.length >= 3 ? "high" : similar.length >= 2 ? "medium" : "low", limitation: koEn(input.locale, "개인 기록의 반복은 인과관계나 예측 정확도를 뜻하지 않습니다.", "Repetition in personal records does not establish causation or predictive accuracy.") });
  }
  return { similar, layers };
}

function safetyNotices(input: DreamInput, categories: DreamInterpretation["categories"]) {
  const notices = [koEn(input.locale, "꿈 분석은 성찰을 돕는 기록이며 미래예측, 진단, 치료 또는 결과 보장이 아닙니다.", "Dream analysis is a reflection aid, not prediction, diagnosis, treatment, or a guaranteed outcome.")];
  if (/암|질병|아프|건강|임신|죽|사고|복권|cancer|disease|health|pregnan|death|accident|lottery/i.test(input.rawText)) notices.push(koEn(input.locale, "꿈만으로 질병·임신·죽음·사고·당첨 여부를 판단할 수 없습니다.", "A dream cannot determine illness, pregnancy, death, accidents, or lottery outcomes."));
  if (categories.includes("NIGHTMARE") || categories.includes("TRAUMA_RELATED_POSSIBLE")) notices.push(koEn(input.locale, "반복 악몽 때문에 잠이나 일상이 힘들다면 수면·정신건강 전문가의 도움을 고려해보세요. 위급하면 지역 응급서비스에 연락하세요.", "If recurring nightmares disrupt sleep or daily life, consider a sleep or mental-health professional. Contact local emergency services if you are in immediate danger."));
  return notices;
}

export function interpretDream(candidate: unknown, history: readonly DreamEvent[] = [], personalization?: DreamPersonalizationContext, understanding?: DreamUnderstanding): DreamInterpretation {
  const input = DreamInputSchema.parse(candidate);
  const ontologyMap = new Map<string, DreamInterpretation["ontology"][number]>();
  for (const token of [...extractDreamOntology(input), ...(understanding?.ontology ?? [])]) ontologyMap.set(`${token.kind}:${token.code}`, token);
  const ontology = [...ontologyMap.values()].slice(0, 40);
  const categories = [...new Set([...categoriesFor(input, history, ontology), ...(understanding?.categories ?? [])])].filter((category, _index, all) => category !== "UNKNOWN" || all.length === 1).slice(0, 10);
  const personal = personalHistoryLayer(input, history, ontology);
  const personalContext: DreamInterpretation["layers"]["personalContext"] = [{
    evidenceType: "personal_context",
    statement: input.context.currentConcern
      ? koEn(input.locale, `“${input.context.currentConcern}”라는 현재 고민과 꿈속 감정·행동이 닮았는지 먼저 비교해볼 수 있습니다.`, `First compare the dream's feelings and actions with your recorded concern: “${input.context.currentConcern}.”`)
      : koEn(input.locale, "현재 고민이 함께 기록되지 않아 현실과의 연결은 아직 열어 둡니다.", "No current concern was recorded, so the waking-life connection remains open."),
    sourceIds: [], confidence: input.context.currentConcern ? "medium" : "low",
    limitation: koEn(input.locale, "사용자가 적은 현재 상황과의 유사성을 보는 층이며 외부 사실을 확인한 결론은 아닙니다.", "This layer compares user-provided context and is not an independently verified conclusion."),
  }];
  if (personalization?.recentRealityChecks?.length) personalContext.push({
    evidenceType: "personal_context",
    statement: koEn(input.locale, `계정의 최근 Reality Check ${personalization.recentRealityChecks.length}개가 있어, 꿈의 주제를 이후 현실 기록과 따로 비교할 수 있습니다.`, `${personalization.recentRealityChecks.length} recent Reality Check record(s) are available for a separate comparison with later real-life records.`),
    sourceIds: [], confidence: "medium",
    limitation: koEn(input.locale, "기존 확인 기록이 현재 꿈의 원인이나 미래 결과를 증명하지는 않습니다.", "Earlier checks do not prove the cause of this dream or a future outcome."),
  });
  const symbolicSystems: DreamInterpretation["layers"]["symbolicSystems"] = personalization?.symbolicPatterns.length ? [{
    evidenceType: "symbolic_system",
    statement: koEn(input.locale, `계정에 저장된 사주·생년월일 패턴 ${personalization.symbolicPatterns.length}개와 비교했습니다. 현재 꿈의 뜻을 맞추기 위해 계산값이나 기존 문장을 바꾸지 않았습니다.`, `Compared with ${personalization.symbolicPatterns.length} saved Four Pillars or birth-date pattern(s). Existing calculations and text were not changed to fit the dream.`),
    sourceIds: [], confidence: "medium", limitation: koEn(input.locale, "저장된 계산 결과와 주제가 겹치는지 보는 상징적 비교이며 과학적 근거나 예측은 아닙니다.", "This is a symbolic topic comparison with saved calculations, not scientific evidence or prediction."),
  }] : [{
    evidenceType: "symbolic_system",
    statement: koEn(input.locale, "사주·생년월일 패턴 정보는 계정에 저장된 계산 결과가 있을 때만 별도 비교합니다. 현재 꿈의 뜻을 맞추기 위해 계산값을 바꾸지 않습니다.", "Four Pillars and birth-date patterns are compared only when calculated account data exists. They are never changed to make a dream interpretation fit."),
    sourceIds: [], confidence: "low", limitation: koEn(input.locale, "이 체계들은 과학적 검증과 별개의 전통적·상징적 성찰 도구입니다.", "These are traditional symbolic reflection systems, separate from scientific validation."),
  }];
  const key = ontology.find((token) => token.kind === "action") ?? ontology.find((token) => token.kind === "emotion") ?? ontology[0];
  const headline = categories.includes("DAILY_CONTINUITY")
    ? koEn(input.locale, "이 꿈은 미래 사건보다 최근 경험과 마음의 흐름을 먼저 살펴볼 만합니다.", "This dream points first to recent experience and emotion, rather than a future event.")
    : categories.includes("REPEATING_PATTERN")
      ? koEn(input.locale, "반복되는 장면 자체보다 매번 함께 나타나는 감정과 현실 조건이 더 중요합니다.", "The feeling and waking conditions that repeat with the scene matter most.")
      : koEn(input.locale, "상징 하나로 결론내리기보다, 꿈속 행동과 감정을 함께 살펴봅니다.", "Look at the action and feeling together instead of deciding from one symbol.");
  const sourceIds = [...new Set([...traditionLayer(input, ontology), ...modernLayer(input)].flatMap((layer) => layer.sourceIds))];
  assertAllowlistedDreamSourceIds(sourceIds);
  const outcomeEvidence = personal.similar.flatMap((event) => event.followUps).filter((followUp) => followUp.completedAt).length;
  return DreamInterpretationSchema.parse({
    schemaVersion: "dream-intelligence-1.0.0", engineVersion: "dream-engine-1.0.0",
    title: koEn(input.locale, key ? `${koreanSubject(key.label.ko)} 선명한 꿈` : "기록한 꿈", key ? `A dream about ${key.label.en}` : "Recorded dream"),
    headline,
    normalizedSummary: ontology.length
      ? koEn(input.locale, `기록에서 ${ontology.slice(0, 7).map((token) => token.label.ko).join(" · ")} 장면과 감정을 확인했습니다.`, `The record contains ${ontology.slice(0, 7).map((token) => token.label.en).join(", ")}.`)
      : koEn(input.locale, "구체적인 장면을 단정하지 않고 현재 상황과 감정을 더 확인할 수 있는 기록으로 남겼습니다.", "The dream is kept open for more context rather than assigning a fixed scene or meaning."),
    ontology, categories,
    followUpQuestions: [...(understanding?.followUpQuestions ?? []), ...followUps(input, history, ontology)].filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index).slice(0, 3),
    layers: { tradition: traditionLayer(input, ontology), modernResearch: modernLayer(input), personalContext, symbolicSystems, personalHistory: personal.layers },
    watchAreas: [...new Set(ontology.filter((token) => ["emotion", "context", "action"].includes(token.kind)).map((token) => token.label[input.locale]))].slice(0, 5),
    confidence: {
      tradition: ontology.some((token) => ["SNAKE", "PIG", "WATER", "DECEASED_PERSON", "BABY", "TEETH"].includes(token.code)) ? "medium" : "low",
      modernResearch: input.context.recentExperience || input.context.currentConcern ? "high" : "medium",
      currentContext: input.context.currentConcern ? "medium" : "low",
      personalHistory: personal.similar.length >= 3 ? "repeated" : personal.similar.length ? "initial" : "none",
      outcomeEvidence: outcomeEvidence >= 3 ? "repeated" : outcomeEvidence ? "partial" : "unconfirmed",
      overall: personal.similar.length >= 3 && outcomeEvidence >= 2 ? "strong_personal_pattern" : personal.similar.length >= 2 ? "possible" : "reference",
    },
    safetyNotices: safetyNotices(input, categories), sourceIds,
  });
}

export function createDreamEvent(candidate: unknown, meta: { id: string; recordedAt: string; userId?: string | null; interpretation?: DreamInterpretation }, history: readonly DreamEvent[] = []): DreamEvent {
  const input = DreamInputSchema.parse(candidate);
  const interpretation = meta.interpretation ? DreamInterpretationSchema.parse(meta.interpretation) : interpretDream(input, history);
  const followUps = ([3, 7, 30] as const).map((days) => ({ id: `${meta.id}:followup:${days}`, dueDays: days, dueDate: dayAfter(input.dreamDate, days), completedAt: null, outcome: null, note: "", fit: null }));
  return DreamEventSchema.parse({ schemaVersion: "dream-intelligence-1.0.0", id: meta.id, userId: meta.userId ?? null, dreamDate: input.dreamDate, recordedAt: meta.recordedAt, rawText: input.retainRawText ? input.rawText : null, rawTextRetained: input.retainRawText, currentConcern: input.context.currentConcern, initialInterpretation: interpretation, initialTimestamp: meta.recordedAt, revisions: [], followUps, updatedAt: meta.recordedAt });
}

export function completeDreamFollowUp(event: DreamEvent, input: { dueDays: 3 | 7 | 30; outcome: "none" | "money" | "work" | "new_person" | "relationship" | "family" | "health" | "exam" | "business" | "move" | "other"; note: string; fit: "MATCH" | "PARTIAL" | "MISMATCH" | "CONTEXT_DEPENDENT"; completedAt: string }): DreamEvent {
  const original = structuredClone(event.initialInterpretation);
  const scheduled = event.followUps.find((followUp) => followUp.dueDays === input.dueDays);
  if (!scheduled || input.completedAt.slice(0, 10) < scheduled.dueDate) throw new Error("DREAM_FOLLOWUP_NOT_DUE");
  const followUps = event.followUps.map((followUp) => followUp.dueDays === input.dueDays ? { ...followUp, outcome: input.outcome, note: input.note.trim().slice(0, 1_000), fit: input.fit, completedAt: input.completedAt } : followUp);
  const revised = structuredClone(event.revisions.at(-1)?.interpretation ?? event.initialInterpretation);
  revised.confidence.outcomeEvidence = followUps.filter((item) => item.completedAt && ["MATCH", "PARTIAL"].includes(item.fit ?? "")).length >= 2 ? "repeated" : "partial";
  const next = DreamEventSchema.parse({ ...event, initialInterpretation: original, followUps, revisions: [...event.revisions, { revision: event.revisions.length + 1, createdAt: input.completedAt, reason: `Reality Check +${input.dueDays}d: ${input.fit}`, interpretation: revised }], updatedAt: input.completedAt });
  if (JSON.stringify(next.initialInterpretation) !== JSON.stringify(event.initialInterpretation) || next.initialTimestamp !== event.initialTimestamp) throw new Error("INITIAL_INTERPRETATION_MUTATED");
  return next;
}
