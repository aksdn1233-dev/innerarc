import type { CelebrityMatch } from "@/core/celebrity";
import type { CompatibilityInsight } from "@/core/compatibility";
import { containsProhibitedOverclaim } from "@/core/ai/safety";
import type { RelationshipInsight } from "@/core/relationship";
import type { Locale } from "@/i18n/config";
import {
  SHARE_CARD_SCHEMA_VERSION,
  ShareCardPayloadSchema,
  UnsafeSharePayloadError,
  type ShareCardPayload,
} from "./types";

function clip(value: string, max: number): string {
  const compact = value.replace(/\s+/g, " ").trim();
  const chars = Array.from(compact);
  return chars.length <= max ? compact : `${chars.slice(0, max - 1).join("")}…`;
}

function base(locale: Locale) {
  return {
    schemaVersion: SHARE_CARD_SCHEMA_VERSION,
    locale,
    brand: "InnerArc" as const,
    contextLabel: locale === "ko"
      ? "과학적 진단이나 미래 예측이 아닌 자기성찰용 상징 구조"
      : "Symbolic structure for reflection—not diagnosis or future prediction",
    footer: locale === "ko"
      ? "실제 행동과 결과로 개인 관련성을 확인하세요."
      : "Check personal relevance against real behavior and outcomes.",
  };
}

export function assertSharePayloadSafe(candidate: unknown): ShareCardPayload {
  const payload = ShareCardPayloadSchema.parse(candidate);
  const text = [payload.eyebrow, payload.title, payload.subtitle, ...payload.highlights, payload.contextLabel, payload.footer].join(" ");
  if (/\b\d{4}-\d{2}-\d{2}\b/.test(text)) throw new UnsafeSharePayloadError("Exact dates are not allowed in share cards.");
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text)) throw new UnsafeSharePayloadError("Email addresses are not allowed in share cards.");
  if (/(?:\+?\d[\s().-]?){8,}/.test(text)) throw new UnsafeSharePayloadError("Phone-like contact data is not allowed in share cards.");
  if (containsProhibitedOverclaim(text)) throw new UnsafeSharePayloadError("Prohibited certainty is not allowed in share cards.");
  return payload;
}

export function buildCoreProfileShare(input: {
  locale: Locale;
  lifePath: number;
  archetype: string;
  summary: string;
  strengths: readonly string[];
}): ShareCardPayload {
  return assertSharePayloadSafe({
    ...base(input.locale),
    kind: "core_profile",
    eyebrow: input.locale === "ko" ? "나의 핵심 패턴" : "My core pattern",
    title: `Life Path ${input.lifePath} · ${clip(input.archetype, 50)}`,
    subtitle: clip(input.summary, 180),
    highlights: input.strengths.slice(0, 3).map((item) => clip(item, 140)),
  });
}

export function buildRomanticPatternShare(input: {
  locale: Locale;
  insight: RelationshipInsight;
}): ShareCardPayload {
  return assertSharePayloadSafe({
    ...base(input.locale),
    kind: "romantic_pattern",
    eyebrow: input.locale === "ko" ? "나의 관계 성찰 패턴" : "My relationship reflection pattern",
    title: input.locale === "ko" ? "연결이 자라기 좋은 조건" : "Conditions where connection may grow",
    subtitle: clip(input.insight.summary, 180),
    highlights: input.insight.energySources.slice(0, 3).map((item) => clip(item, 140)),
  });
}

export function buildCompatibilityShare(input: {
  locale: Locale;
  insight: CompatibilityInsight;
}): ShareCardPayload {
  const chosen = ["common_ground", "communication", "maintenance"].map((id) =>
    input.insight.sections.find((section) => section.id === id)!,
  );
  return assertSharePayloadSafe({
    ...base(input.locale),
    kind: "compatibility",
    eyebrow: input.locale === "ko" ? "관계 운영 성찰" : "Relationship operating reflection",
    title: clip(input.insight.relationshipLabel, 80),
    subtitle: input.locale === "ko"
      ? "두 사람의 생년월일이나 이름을 공개하지 않은 관계 요약"
      : "A relationship summary without either person's name or birth date",
    highlights: chosen.map((section) => clip(`${section.title}: ${section.observation}`, 170)),
  });
}

export function buildCelebrityMatchShare(input: {
  locale: Locale;
  match: CelebrityMatch;
}): ShareCardPayload {
  return assertSharePayloadSafe({
    ...base(input.locale),
    kind: "celebrity_match",
    eyebrow: input.locale === "ko" ? "공개 생년월일 구조 비교" : "Public birth-date structure comparison",
    title: clip(input.match.celebrity.displayName[input.locale], 80),
    subtitle: clip(input.match.tierLabel, 120),
    highlights: [clip(input.match.similarNote, 170), clip(input.match.differentNote, 170)],
  });
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrap(value: string, maxChars: number): string[] {
  const words = value.includes(" ") ? value.split(" ") : Array.from(value);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const separator = value.includes(" ") && line ? " " : "";
    if (Array.from(line + separator + word).length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line += separator + word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function textLines(lines: string[], x: number, y: number, size: number, gap: number, weight = 400): string {
  return `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="#263029">${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : gap}">${escapeXml(line)}</tspan>`).join("")}</text>`;
}

export function renderShareCardSvg(candidate: ShareCardPayload): string {
  const payload = assertSharePayloadSafe(candidate);
  const title = wrap(payload.title, payload.locale === "ko" ? 18 : 28).slice(0, 3);
  const subtitle = wrap(payload.subtitle, payload.locale === "ko" ? 28 : 42).slice(0, 4);
  const highlights = payload.highlights.map((item) => wrap(item, payload.locale === "ko" ? 31 : 46).slice(0, 3));
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">`,
    `<rect width="1080" height="1350" rx="44" fill="#F7F1E7"/>`,
    `<circle cx="904" cy="172" r="94" fill="#DDE5D7"/>`,
    `<text x="84" y="100" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#526453">InnerArc</text>`,
    textLines([payload.eyebrow.toUpperCase()], 84, 190, 22, 28, 700),
    textLines(title, 84, 270, 58, 68, 600),
    textLines(subtitle, 84, 500, 29, 40),
    ...highlights.map((lines, index) => {
      const top = 680 + index * 150;
      return `<g><rect x="84" y="${top - 52}" width="912" height="126" rx="20" fill="#FFFCF6" stroke="#D8D1C4"/><circle cx="124" cy="${top}" r="16" fill="#B7795D"/>${textLines(lines, 164, top - 10, 25, 32, 500)}</g>`;
    }),
    textLines(wrap(payload.contextLabel, payload.locale === "ko" ? 42 : 66).slice(0, 2), 84, 1190, 20, 28),
    textLines(wrap(payload.footer, payload.locale === "ko" ? 42 : 66).slice(0, 2), 84, 1264, 20, 28, 600),
    `</svg>`,
  ].join("");
}
