import type { Locale } from "@/i18n/config";

export const brandNameKo = "태령당" as const;
export const brandInternalId = "TAERYEONGDANG_INTERNAL" as const;
export const brandProductDescriptor = "Personal Pattern Intelligence" as const;

export const brand = Object.freeze({
  nameKo: brandNameKo,
  internalId: brandInternalId,
  productDescriptor: brandProductDescriptor,
  currentProductionOrigin: "https://mygyeol.kr",
  legacySearchAliases: ["결 GYEOL", "MY GYEOL", "My Gyeol", "마이결"] as const,
});

/**
 * The Korean name is the only approved public mark. English pages intentionally use
 * the Korean mark with a descriptive subtitle until an English trademark decision is
 * made; the internal identifier must never be rendered to a customer.
 */
export function brandNameForLocale(locale: Locale): typeof brandNameKo {
  const localizedName: Readonly<Record<Locale, typeof brandNameKo>> = {
    ko: brandNameKo,
    en: brandNameKo,
  };
  return localizedName[locale];
}
