// Shared closed catalog: AI selects classes only; every placement is still validated.
export const OBJECT_KINDS = ["bed", "nightstand", "desk", "office_chair", "sofa", "coffee_table", "dining_table", "dining_chair", "wardrobe", "cabinet", "bookshelf", "tv", "monitor", "computer", "air_purifier", "refrigerator", "speaker", "lighting", "plant", "lounge_chair", "rug", "storage"] as const;
export type ObjectKind = typeof OBJECT_KINDS[number];
export const ELECTRONIC_KINDS = ["tv", "monitor", "computer", "air_purifier", "refrigerator", "speaker"] as const satisfies readonly ObjectKind[];
export const FURNITURE_CATALOG: Record<ObjectKind, { ko: string; en: string; width: number; depth: number; height: number }> = {
  bed: { ko: "침대", en: "Bed", width: 1.5, depth: 2.1, height: 1.05 },
  nightstand: { ko: "협탁", en: "Nightstand", width: .5, depth: .4, height: .55 },
  desk: { ko: "책상", en: "Desk", width: 1.3, depth: .65, height: .76 },
  office_chair: { ko: "사무용 의자", en: "Office chair", width: .65, depth: .65, height: 1.05 },
  sofa: { ko: "소파", en: "Sofa", width: 2.3, depth: 1, height: .85 },
  coffee_table: { ko: "거실 테이블", en: "Coffee table", width: 1.1, depth: .6, height: .4 },
  dining_table: { ko: "식탁", en: "Dining table", width: 1.8, depth: .9, height: .76 },
  dining_chair: { ko: "식탁 의자", en: "Dining chair", width: .48, depth: .53, height: .83 },
  wardrobe: { ko: "옷장", en: "Wardrobe", width: 1.6, depth: .6, height: 2.1 },
  cabinet: { ko: "수납장", en: "Cabinet", width: 1.4, depth: .4, height: .85 },
  bookshelf: { ko: "책장", en: "Bookshelf", width: .9, depth: .32, height: 1.8 },
  tv: { ko: "스탠드형 TV", en: "Freestanding TV", width: 1.25, depth: .35, height: 1.1 },
  monitor: { ko: "모니터", en: "Monitor", width: .7, depth: .28, height: .72 },
  computer: { ko: "컴퓨터 본체", en: "Computer tower", width: .28, depth: .48, height: .55 },
  air_purifier: { ko: "공기청정기", en: "Air purifier", width: .42, depth: .42, height: .75 },
  refrigerator: { ko: "냉장고", en: "Refrigerator", width: .9, depth: .75, height: 1.85 },
  speaker: { ko: "스피커", en: "Speaker", width: .28, depth: .3, height: .85 },
  lighting: { ko: "플로어 조명", en: "Floor lamp", width: .45, depth: .45, height: 1.6 },
  plant: { ko: "식물", en: "Plant", width: .55, depth: .55, height: 1.2 },
  lounge_chair: { ko: "라운지 체어", en: "Lounge chair", width: .827, depth: .57, height: .686 },
  rug: { ko: "러그", en: "Rug", width: 2, depth: 1.5, height: .012 },
  storage: { ko: "수납장", en: "Storage", width: 1.2, depth: .4, height: 1.3 },
};
