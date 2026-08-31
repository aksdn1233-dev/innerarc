import { brand, brandNameKo } from "./brand";

export const OFFICIAL_NAVER_BLOG_URL = "https://blog.naver.com/qkrehgus5886" as const;

export const BRAND_SEARCH_ALIASES = [
  brandNameKo,
  ...brand.legacySearchAliases,
] as const;
