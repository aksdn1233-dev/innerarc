import type { Locale } from "@/i18n/config";

const DOMAIN_LABELS = {
  business: { ko: "일·사업", en: "Work & business" },
  career: { ko: "직장·경력", en: "Career" },
  promotion: { ko: "승진·평가", en: "Promotion" },
  money: { ko: "금전", en: "Money" },
  love: { ko: "연애·관계", en: "Love & relationships" },
  reconciliation: { ko: "재회·관계", en: "Reconciliation" },
  compatibility: { ko: "궁합·관계", en: "Compatibility" },
  child: { ko: "자녀", en: "Children" },
  education: { ko: "교육", en: "Education" },
  study: { ko: "학업·시험", en: "Study" },
  health: { ko: "건강·안전", en: "Health & safety" },
  housing: { ko: "주거·계약", en: "Housing" },
  private_fact: { ko: "사실 확인", en: "Fact check" },
  growth: { ko: "성장·선택", en: "Growth & decisions" },
} as const;

export type AdviceDomain = keyof typeof DOMAIN_LABELS;

const ALREADY_LABELED = /^[^:：\n]{1,20}[:：]\s/u;

function inferredDomain(item: string, fallback: AdviceDomain): AdviceDomain {
  if (/폭력|위협|의료|의사|병원|안전|건강|과로|수면|피로|신체/u.test(item)) return "health";
  if (/보증금|등기|주택|주거|이사|입주|관리비|선순위/u.test(item)) return "housing";
  if (/시험|공부|학업|오답|학생|수업|등록|학원|성적/u.test(item)) return "study";
  if (/자녀|아이|부모/u.test(item)) return "child";
  if (/대출|금리|상환|현금|매출|입금|고정비|비용|수익|돈/u.test(item)) return "money";
  if (/승진|직급|평가|상사/u.test(item)) return "promotion";
  if (/이직|직장|경력|채용|면접|급여/u.test(item)) return "career";
  if (/재회|헤어진|다시 연락/u.test(item)) return "reconciliation";
  if (/궁합|상대 생년월일/u.test(item)) return "compatibility";
  if (/연애|관계|상대|연락|갈등|신뢰|약속|대화|경계/u.test(item)) return "love";
  if (/사업|고객|프로젝트|서비스|기능|유료|시장|운영/u.test(item)) return "business";
  if (/사실|증거|추측|확인|관찰/u.test(item) && fallback === "private_fact") return "private_fact";
  return fallback;
}

export function inferAdviceDomain(text: string): AdviceDomain {
  return inferredDomain(text, "growth");
}

export function labelAdviceItem(item: string, locale: Locale, fallback: AdviceDomain): string {
  const trimmed = item.trim();
  if (!trimmed || ALREADY_LABELED.test(trimmed)) return trimmed;
  const domain = inferredDomain(trimmed, fallback);
  return `${DOMAIN_LABELS[domain][locale]}: ${trimmed}`;
}

export function labelAdviceItems(
  items: readonly string[],
  locale: Locale,
  fallback: AdviceDomain,
): string[] {
  return items.map((item) => labelAdviceItem(item, locale, fallback));
}

export function labelFormattedAdviceBody(
  body: string,
  locale: Locale,
  fallback: AdviceDomain,
): string {
  return body
    .split(/\n{2,}/u)
    .map((paragraph) => {
      const match = paragraph.match(/^(\d+\.\s*)([\s\S]+)$/u);
      if (!match) return labelAdviceItem(paragraph, locale, fallback);
      return `${match[1]}${labelAdviceItem(match[2], locale, fallback)}`;
    })
    .join("\n\n");
}
