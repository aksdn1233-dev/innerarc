export const SPACE_MINIATURE_ASSET_VERSION = "space-miniatures-2.0.0" as const;
type LocalizedText = Readonly<{ ko: string; en: string }>;
export type SpaceMiniatureGuide = Readonly<{
  characterId: "harang"; name: LocalizedText; scene: "photo" | "direction" | "objects" | "compare";
  path: string; sourcePath: string; alt: LocalizedText; line: LocalizedText;
  width: 1254; height: 1254; alpha: true;
}>;
const art = {
  characterId: "harang", name: { ko: "하랑 법사", en: "Harang" },
  path: "/assets/space-miniatures/harang-compare-guide-v1-runtime.webp",
  sourcePath: "/assets/space-miniatures/harang-compare-guide-v1.png",
  alt: { ko: "현재와 추천 배치 카드를 보여주는 하랑 법사 미니어처", en: "Harang miniature presenting current and suggested room layouts" },
  width: 1254, height: 1254, alpha: true,
} as const;
export const SPACE_MINIATURE_GUIDES = {
  photo: { ...art, scene: "photo", line: { ko: "방 전체가 보이게 두 방향에서 찍어요.", en: "Take two wide photos from opposite sides." } },
  direction: { ...art, scene: "direction", line: { ko: "북쪽이 있는 쪽만 누르면 돼요.", en: "Tap the side where north is." } },
  objects: { ...art, scene: "objects", line: { ko: "빠진 물건이 없는지 같이 볼게요.", en: "Let’s check whether anything is missing." } },
  compare: { ...art, scene: "compare", line: { ko: "하나씩 바꿔 보고 비교해요.", en: "Try one change at a time and compare." } },
} as const satisfies Record<string, SpaceMiniatureGuide>;
export function roomMiniatureGuide(mode: "current" | "compare" | "recommended" | undefined): SpaceMiniatureGuide {
  return mode === "recommended" ? SPACE_MINIATURE_GUIDES.compare : mode === "compare" ? SPACE_MINIATURE_GUIDES.objects : SPACE_MINIATURE_GUIDES.photo;
}
