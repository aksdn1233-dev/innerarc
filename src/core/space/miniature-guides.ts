export const SPACE_MINIATURE_ASSET_VERSION = "space-miniatures-1.0.0" as const;

type LocalizedText = Readonly<{ ko: string; en: string }>;

export type SpaceMiniatureGuide = Readonly<{
  characterId: "yundo" | "hoyeon" | "sahyeon" | "taeryeong";
  name: LocalizedText;
  scene: "photo" | "direction" | "objects" | "compare";
  path: string;
  sourcePath: string;
  alt: LocalizedText;
  line: LocalizedText;
  width: 1254;
  height: 1254;
  alpha: true;
}>;

export const SPACE_MINIATURE_GUIDES = {
  photo: {
    characterId: "yundo",
    name: { ko: "윤도", en: "Yundo" },
    scene: "photo",
    path: "/assets/space-miniatures/yundo-photo-guide-v1-runtime.webp",
    sourcePath: "/assets/space-miniatures/yundo-photo-guide-v1.png",
    alt: { ko: "카메라를 들고 촬영 위치를 안내하는 윤도 미니어처", en: "Yundo miniature holding a camera and pointing to the next photo position" },
    line: { ko: "방 전체가 보이게 두 방향에서 찍어요.", en: "Take two wide photos from opposite sides." },
    width: 1254,
    height: 1254,
    alpha: true,
  },
  direction: {
    characterId: "hoyeon",
    name: { ko: "호연", en: "Hoyeon" },
    scene: "direction",
    path: "/assets/space-miniatures/hoyeon-direction-guide-v1-runtime.webp",
    sourcePath: "/assets/space-miniatures/hoyeon-direction-guide-v1.png",
    alt: { ko: "나침반을 들고 북쪽을 가리키는 호연 미니어처", en: "Hoyeon miniature holding a compass and pointing north" },
    line: { ko: "북쪽이 있는 쪽만 누르면 돼요.", en: "Just tap the side where north is." },
    width: 1254,
    height: 1254,
    alpha: true,
  },
  objects: {
    characterId: "sahyeon",
    name: { ko: "사현", en: "Sahyeon" },
    scene: "objects",
    path: "/assets/space-miniatures/sahyeon-object-guide-v1-runtime.webp",
    sourcePath: "/assets/space-miniatures/sahyeon-object-guide-v1.png",
    alt: { ko: "공간 구조표를 펼쳐 빠진 물건을 확인하는 사현 미니어처", en: "Sahyeon miniature reviewing a room chart for missing objects" },
    line: { ko: "빠진 물건이 없는지 같이 볼게요.", en: "Let’s check whether anything is missing." },
    width: 1254,
    height: 1254,
    alpha: true,
  },
  compare: {
    characterId: "taeryeong",
    name: { ko: "태령", en: "Taeryeong" },
    scene: "compare",
    path: "/assets/space-miniatures/taeryeong-compare-guide-v1-runtime.webp",
    sourcePath: "/assets/space-miniatures/taeryeong-compare-guide-v1.png",
    alt: { ko: "현재와 추천 배치 카드를 나란히 보여주는 태령 미니어처", en: "Taeryeong miniature presenting current and suggested room cards" },
    line: { ko: "하나씩 바꿔 보고 비교해요.", en: "Try one change at a time and compare." },
    width: 1254,
    height: 1254,
    alpha: true,
  },
} as const satisfies Record<string, SpaceMiniatureGuide>;

export function roomMiniatureGuide(mode: "current" | "compare" | "recommended" | undefined): SpaceMiniatureGuide {
  if (mode === "recommended") return SPACE_MINIATURE_GUIDES.compare;
  if (mode === "compare") return SPACE_MINIATURE_GUIDES.objects;
  return SPACE_MINIATURE_GUIDES.photo;
}
