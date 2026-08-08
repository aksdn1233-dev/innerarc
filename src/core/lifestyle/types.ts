import type { Locale } from "@/i18n/config";

export const accessoryCategoryIds = [
  "wearable_accent",
  "everyday_carry",
  "desk_home_accent",
] as const;
export type AccessoryCategoryId = (typeof accessoryCategoryIds)[number];

export const musicLaneIds = [
  "focus_momentum",
  "reset_regulation",
  "exploration_social",
] as const;
export type MusicLaneId = (typeof musicLaneIds)[number];

export const shopLaunchStates = ["coming_later"] as const;
export type ShopLaunchState = (typeof shopLaunchStates)[number];

export type LifestyleEvidenceRef =
  | `lifePath:${number}`
  | `attitude:${number}`
  | `personalYear:${number}`;

export type AccessoryRecommendation = Readonly<{
  rank: 1 | 2 | 3;
  categoryId: AccessoryCategoryId;
  categoryLabel: string;
  title: string;
  form: string;
  palette: string;
  materialDirection: string;
  symbolicRationale: string;
  tryOnCue: string;
  safetyAndCare: string;
  shopState: ShopLaunchState;
  shopAnchor: `#${AccessoryCategoryId}`;
  evidenceRefs: readonly LifestyleEvidenceRef[];
}>;

export type MusicRecommendation = Readonly<{
  rank: 1 | 2 | 3;
  laneId: MusicLaneId;
  laneLabel: string;
  title: string;
  genreDirection: string;
  sonicTraits: string;
  useContext: string;
  selectionCue: string;
  realityCheck: string;
  evidenceRefs: readonly LifestyleEvidenceRef[];
}>;

export type LifestyleRecommendations = Readonly<{
  locale: Locale;
  ruleVersion: string;
  sourceRuleVersion: string;
  accessories: readonly AccessoryRecommendation[];
  music: readonly MusicRecommendation[];
  uncertainty: string;
  accessorySafetyNote: string;
  musicSafetyNote: string;
}>;

export type ShopCategory = Readonly<{
  id: AccessoryCategoryId;
  anchor: AccessoryCategoryId;
  title: string;
  description: string;
  disclosure: string;
  launchState: ShopLaunchState;
}>;

export type ShopPreview = Readonly<{
  locale: Locale;
  launchState: ShopLaunchState;
  categories: readonly ShopCategory[];
  unavailableCapabilities: readonly [
    "products",
    "prices",
    "inventory",
    "cart",
    "checkout",
    "affiliate_links",
  ];
}>;
