import {
  calculateAttitudeNumber,
  calculateBirthdayNumber,
  calculateLifePath,
  parseBirthDate,
  type NumerologyProfile,
} from "@/core/numerology";
import type { Locale } from "@/i18n/config";
import { CELEBRITIES } from "./data";
import {
  CELEBRITY_COMPARISON_RULE_VERSION,
  celebrityFields,
  CelebrityDataError,
  type CelebrityComparisonResult,
  type CelebrityField,
  type CelebrityMatch,
  type CelebrityRecord,
  type CelebrityStructureItem,
  type DateStructureId,
  type StructuralOverlapTier,
} from "./types";

const STRUCTURES: readonly { id: DateStructureId; weight: number }[] = [
  { id: "lifePath", weight: 5 },
  { id: "birthday", weight: 3 },
  { id: "attitude", weight: 2 },
];

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function validateCelebrityDataset(records: readonly CelebrityRecord[]): void {
  const ids = new Set<string>();
  for (const record of records) {
    if (!record.id || ids.has(record.id)) throw new CelebrityDataError(`Duplicate or empty celebrity ID: ${record.id}`);
    ids.add(record.id);
    if (!record.displayName.ko.trim() || !record.displayName.en.trim()) throw new CelebrityDataError(`Missing display name: ${record.id}`);
    if (!datePattern.test(record.birthDate)) throw new CelebrityDataError(`Invalid ISO birth date: ${record.id}`);
    parseBirthDate(record.birthDate);
    if (!record.fields.length || record.fields.some((field) => !celebrityFields.includes(field))) {
      throw new CelebrityDataError(`Invalid role field: ${record.id}`);
    }
    if (!record.source.url.startsWith("https://")) throw new CelebrityDataError(`Source must use HTTPS: ${record.id}`);
    if (!datePattern.test(record.source.accessedAt)) throw new CelebrityDataError(`Invalid access date: ${record.id}`);
    parseBirthDate(record.source.accessedAt);
    if (!record.source.title.trim() || !record.source.publisher.trim()) throw new CelebrityDataError(`Incomplete source: ${record.id}`);
  }
}

validateCelebrityDataset(CELEBRITIES);

function celebrityStructures(record: CelebrityRecord): Record<DateStructureId, number> {
  return {
    lifePath: calculateLifePath(record.birthDate).value,
    birthday: calculateBirthdayNumber(record.birthDate).value,
    attitude: calculateAttitudeNumber(record.birthDate).value,
  };
}

function userStructures(profile: NumerologyProfile): Record<DateStructureId, number> {
  return {
    lifePath: profile.lifePath.value,
    birthday: profile.birthday.value,
    attitude: profile.attitude.value,
  };
}

function tier(score: number): StructuralOverlapTier {
  if (score >= 5) return "strong_overlap";
  if (score >= 2) return "some_overlap";
  return "contrast_forward";
}

function tierLabel(value: StructuralOverlapTier, locale: Locale): string {
  const labels: Record<StructuralOverlapTier, { ko: string; en: string }> = {
    strong_overlap: { ko: "두드러진 구조 겹침", en: "Notable structural overlap" },
    some_overlap: { ko: "일부 구조 겹침", en: "Some structural overlap" },
    contrast_forward: { ko: "차이 중심 비교", en: "Contrast-forward comparison" },
  };
  return labels[value][locale];
}

function itemLabel(item: CelebrityStructureItem, locale: Locale): string {
  const labels: Record<DateStructureId, { ko: string; en: string }> = {
    lifePath: { ko: "라이프 패스", en: "Life Path" },
    birthday: { ko: "생일 수", en: "Birthday" },
    attitude: { ko: "태도 수", en: "Attitude" },
  };
  return `${labels[item.id][locale]} ${item.userValue}${item.userValue === item.celebrityValue ? "" : ` ↔ ${item.celebrityValue}`}`;
}

export function findCelebrityMatches(input: {
  profile: NumerologyProfile;
  locale: Locale;
  field?: CelebrityField | "all";
  limit?: number;
  records?: readonly CelebrityRecord[];
}): CelebrityComparisonResult {
  const records = input.records ?? CELEBRITIES;
  validateCelebrityDataset(records);
  const field = input.field ?? "all";
  const limit = Math.min(Math.max(input.limit ?? 5, 1), 20);
  const user = userStructures(input.profile);
  const candidates = records.filter((record) => field === "all" || record.fields.includes(field));
  const scored = candidates.map((celebrity) => {
    const publicPattern = celebrityStructures(celebrity);
    const allItems = STRUCTURES.map(({ id }) => ({ id, userValue: user[id], celebrityValue: publicPattern[id] }));
    const sharedStructures = allItems.filter((item) => item.userValue === item.celebrityValue);
    const differentStructures = allItems.filter((item) => item.userValue !== item.celebrityValue);
    const score = STRUCTURES.reduce((total, structure) => total + (user[structure.id] === publicPattern[structure.id] ? structure.weight : 0), 0);
    return { celebrity, sharedStructures, differentStructures, score, tier: tier(score) };
  });
  scored.sort((a, b) => b.score - a.score || b.sharedStructures.length - a.sharedStructures.length || a.celebrity.id.localeCompare(b.celebrity.id));

  const matches: CelebrityMatch[] = scored.slice(0, limit).map((entry, index) => {
    const shared = entry.sharedStructures.map((item) => itemLabel(item, input.locale));
    const different = entry.differentStructures.map((item) => itemLabel(item, input.locale));
    return {
      rank: index + 1,
      celebrity: entry.celebrity,
      tier: entry.tier,
      tierLabel: tierLabel(entry.tier, input.locale),
      sharedStructures: entry.sharedStructures,
      differentStructures: entry.differentStructures,
      similarNote: input.locale === "ko"
        ? (shared.length ? `같은 날짜 구조: ${shared.join(" · ")}` : "세 핵심 날짜 구조에서 정확히 같은 값은 없습니다.")
        : (shared.length ? `Shared date structures: ${shared.join(" · ")}` : "No exact match across the three core date structures."),
      differentNote: input.locale === "ko"
        ? `다르게 볼 구조: ${different.join(" · ")}`
        : `Structures to contrast: ${different.join(" · ")}`,
      evidenceRefs: [
        ...STRUCTURES.map(({ id }) => `user.${id}:${user[id]}`),
        ...STRUCTURES.map(({ id }) => `celebrity.${entry.celebrity.id}.${id}:${celebrityStructures(entry.celebrity)[id]}`),
        `source:${entry.celebrity.id}`,
      ],
    };
  });

  return {
    ruleVersion: CELEBRITY_COMPARISON_RULE_VERSION,
    scopeLabel: input.locale === "ko"
      ? "공개된 생년월일의 수비학 구조 기준 유사도"
      : "Similarity based on the numerology structure of public birth dates",
    matches,
    uncertainty: input.locale === "ko"
      ? "이 순서는 성격 동일성, 능력, 성취 가능성 또는 운명을 뜻하지 않습니다. 공개 생년월일에서 계산한 세 구조의 겹침만 정렬합니다."
      : "This ordering does not imply identical personality, ability, achievement potential, or destiny. It ranks overlap in three structures calculated from public birth dates only.",
  };
}
