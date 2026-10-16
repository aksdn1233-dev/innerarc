export const MINI_GUIDE_ASSET_VERSION = "mini-guides-2.0.0" as const;
export const MINI_GUIDE_CHARACTER_IDS = ["harang"] as const;
export type MiniGuideCharacterId = (typeof MINI_GUIDE_CHARACTER_IDS)[number];
export const MINI_GUIDE_ASSETS = {
  harangWelcome: {
    characterId: "harang", role: "self_discovery_guide", pose: "welcome", expression: "calm",
    assetType: "2.5d-raster", path: "/assets/mini-guides/harang/harang_welcome_calm_01.png",
    width: 1254, height: 1254, alpha: true, safeCssWidth: 240,
  },
} as const;
export type MiniGuideAsset = (typeof MINI_GUIDE_ASSETS)[keyof typeof MINI_GUIDE_ASSETS];
/** Resolve old optional guide IDs without reviving retired character art. */
export function getMiniGuideAsset(characterId?: string): MiniGuideAsset {
  return Object.values(MINI_GUIDE_ASSETS).find(asset => asset.characterId === characterId) ?? MINI_GUIDE_ASSETS.harangWelcome;
}
