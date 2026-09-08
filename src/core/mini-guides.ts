export const MINI_GUIDE_ASSET_VERSION = "mini-guides-1.0.0" as const;

export const MINI_GUIDE_CHARACTER_IDS = ["taeryeong", "yeonhui", "sahyeon", "hwayeon", "yundo", "hoyeon"] as const;
export type MiniGuideCharacterId = (typeof MINI_GUIDE_CHARACTER_IDS)[number];

export const MINI_GUIDE_ASSETS = {
  taeryeongWelcome: {
    characterId: "taeryeong",
    role: "self_discovery_guide",
    pose: "welcome",
    expression: "calm",
    assetType: "2.5d-raster",
    path: "/assets/mini-guides/taeryeong/taeryeong_welcome_calm_01.png",
    width: 1254,
    height: 1254,
    alpha: true,
    safeCssWidth: 240,
  },
  yeonhuiRelationshipListen: {
    characterId: "yeonhui",
    role: "relationship_guide",
    pose: "relationship-listen",
    expression: "warm",
    assetType: "2.5d-raster",
    path: "/assets/mini-guides/yeonhui/yeonhui_relationship-listen_warm_01.png",
    width: 1254,
    height: 1254,
    alpha: true,
    safeCssWidth: 240,
  },
  sahyeonSuccessPresent: {
    characterId: "sahyeon",
    role: "success_evidence_guide",
    pose: "success-present",
    expression: "confident",
    assetType: "2.5d-raster",
    path: "/assets/mini-guides/sahyeon/sahyeon_success-present_confident_01.png",
    width: 1254,
    height: 1254,
    alpha: true,
    safeCssWidth: 240,
  },
  hwayeonTimingConsider: {
    characterId: "hwayeon",
    role: "timing_guide",
    pose: "timing-consider",
    expression: "alert",
    assetType: "2.5d-raster",
    path: "/assets/mini-guides/hwayeon/hwayeon_timing-consider_alert_01.png",
    width: 1254,
    height: 1254,
    alpha: true,
    safeCssWidth: 240,
  },
  yundoSpaceExplain: {
    characterId: "yundo",
    role: "space_guide",
    pose: "space-explain",
    expression: "focus",
    assetType: "2.5d-raster",
    path: "/assets/mini-guides/yundo/yundo_space-explain_focus_01.png",
    width: 1254,
    height: 1254,
    alpha: true,
    safeCssWidth: 240,
  },
  hoyeonDirectionPoint: {
    characterId: "hoyeon",
    role: "action_guide",
    pose: "direction-point",
    expression: "bright",
    assetType: "2.5d-raster",
    path: "/assets/mini-guides/hoyeon/hoyeon_direction-point_bright_01.png",
    width: 1254,
    height: 1254,
    alpha: true,
    safeCssWidth: 240,
  },
} as const;

export type MiniGuideAsset = (typeof MINI_GUIDE_ASSETS)[keyof typeof MINI_GUIDE_ASSETS];

const MINI_GUIDE_BY_CHARACTER = new Map<MiniGuideCharacterId, MiniGuideAsset>(
  Object.values(MINI_GUIDE_ASSETS).map(asset => [asset.characterId, asset]),
);

export function getMiniGuideAsset(characterId?: string): MiniGuideAsset {
  return MINI_GUIDE_BY_CHARACTER.get(characterId as MiniGuideCharacterId) ?? MINI_GUIDE_ASSETS.taeryeongWelcome;
}
