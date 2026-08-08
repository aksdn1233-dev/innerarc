export type ReportLanguageAudit = Readonly<{
  passed: boolean;
  duplicateSentences: readonly string[];
  nearDuplicateParagraphs: readonly string[];
  repeatedOpenings: readonly string[];
  genericPhrases: readonly string[];
}>;

type ReportText = { summary: string; sections: readonly { title: string; body: string }[] };
const GENERIC = ["당신은 특별한 사람", "무한한 가능성", "새로운 여정", "trust the process", "unlock your potential"];
const SENTENCE_BOUNDARY = /(?<=[.!?。])\s+|(?<=다\.)\s*/u;

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function similarity(a: string, b: string): number {
  const left = new Set(normalize(a).split(" ").filter((token) => token.length > 1));
  const right = new Set(normalize(b).split(" ").filter((token) => token.length > 1));
  const union = new Set([...left, ...right]);
  if (!union.size) return 0;
  return [...left].filter((token) => right.has(token)).length / union.size;
}

export function deduplicateReportSections(
  _summary: string,
  sections: readonly { title: string; body: string }[],
): { title: string; body: string }[] {
  const seen = new Set<string>();
  const result = new Array<{ title: string; body: string }>(sections.length);
  for (let sectionIndex = sections.length - 1; sectionIndex >= 0; sectionIndex -= 1) {
    const section = sections[sectionIndex]!;
    const sentences = section.body.split(SENTENCE_BOUNDARY);
    const kept: string[] = [];
    for (let sentenceIndex = sentences.length - 1; sentenceIndex >= 0; sentenceIndex -= 1) {
      const sentence = sentences[sentenceIndex]!;
      const key = normalize(sentence);
      if (key.length >= 24 && seen.has(key)) continue;
      if (key.length >= 24) seen.add(key);
      kept.push(sentence);
    }
    result[sectionIndex] = { ...section, body: kept.reverse().join(" ").trim() };
  }
  return result;
}

export function auditReportLanguage(report: ReportText): ReportLanguageAudit {
  const bodies = [report.summary, ...report.sections.map((section) => section.body)];
  const sentences = report.sections.flatMap((section) => section.body.split(SENTENCE_BOUNDARY))
    .map(normalize).filter((sentence) => sentence.length >= 24);
  const counts = new Map<string, number>();
  sentences.forEach((sentence) => counts.set(sentence, (counts.get(sentence) ?? 0) + 1));
  const duplicateSentences = [...counts].filter(([, count]) => count > 1).map(([sentence]) => sentence);
  const nearDuplicateParagraphs: string[] = [];
  for (let i = 0; i < bodies.length; i += 1) {
    for (let j = i + 1; j < bodies.length; j += 1) {
      if (bodies[i]!.length >= 80 && bodies[j]!.length >= 80 && similarity(bodies[i]!, bodies[j]!) >= 0.72) {
        nearDuplicateParagraphs.push(`${i}:${j}`);
      }
    }
  }
  const openings = bodies.map((body) => normalize(body).split(" ").slice(0, 4).join(" ")).filter(Boolean);
  const openingCounts = new Map<string, number>();
  openings.forEach((opening) => openingCounts.set(opening, (openingCounts.get(opening) ?? 0) + 1));
  const repeatedOpenings = [...openingCounts].filter(([, count]) => count >= 3).map(([opening]) => opening);
  const entire = normalize(bodies.join(" "));
  const genericPhrases = GENERIC.filter((phrase) => entire.includes(normalize(phrase)));
  return {
    passed: duplicateSentences.length === 0 && nearDuplicateParagraphs.length === 0
      && repeatedOpenings.length === 0 && genericPhrases.length === 0,
    duplicateSentences,
    nearDuplicateParagraphs,
    repeatedOpenings,
    genericPhrases,
  };
}
