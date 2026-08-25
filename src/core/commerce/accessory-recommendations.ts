import type { Locale } from "@/i18n/config";
import { isAcceptedBirthDate } from "@/core/birth-range";
import { calculateNumerologyProfile, NUMEROLOGY_RULE_VERSION } from "@/core/numerology";

type Localized = Readonly<{ ko: string; en: string }>;

export type AccessoryDirection = Readonly<{
  id: string;
  source: "saju" | "numerology";
  keyLabel: Localized;
  title: Localized;
  form: Localized;
  palette: Localized;
  material: Localized;
  use: Localized;
  imageSrc: `/images/accessory-shop/${string}.jpg`;
  imageAlt: Localized;
  priceRange: Localized;
}>;

export type AccessoryConceptProduct = Readonly<{
  id: string;
  directionId: AccessoryDirection["id"];
  source: AccessoryDirection["source"];
  slot: 0 | 1 | 2;
  name: Localized;
  kind: Localized;
  description: Localized;
  designDetails: Localized;
  useScene: Localized;
  careNote: Localized;
  priceRange: Localized;
}>;

export type AccessoryBirthRecommendation = Readonly<{
  fact: "lifePath" | "attitude" | "personalYear";
  value: number;
  product: AccessoryConceptProduct;
  ruleVersion: typeof NUMEROLOGY_RULE_VERSION;
}>;

export const accessoryDetailBoards: Readonly<Record<string, `/images/accessory-shop/details/${string}.jpg`>> = {
  "saju-wood": "/images/accessory-shop/details/saju-wood.jpg",
  "saju-fire": "/images/accessory-shop/details/saju-fire.jpg",
  "saju-earth": "/images/accessory-shop/details/saju-earth.jpg",
  "saju-metal": "/images/accessory-shop/details/saju-metal.jpg",
  "saju-water": "/images/accessory-shop/details/saju-water.jpg",
  "numerology-life-path": "/images/accessory-shop/details/numerology-life-path.jpg",
  "numerology-attitude": "/images/accessory-shop/details/numerology-attitude.jpg",
  "numerology-personal-year": "/images/accessory-shop/details/numerology-personal-year.jpg",
} as const;

const l = (ko: string, en: string): Localized => ({ ko, en });

export const sajuAccessoryDirections: readonly AccessoryDirection[] = [
  { id: "saju-wood", source: "saju", keyLabel: l("목(木)", "Wood"), title: l("길게 뻗는 선의 착용 포인트", "Elongated wearable accent"), form: l("세로선·잎·가느다란 연결", "Vertical lines, leaves, and slender links"), palette: l("청록·솔잎색·옅은 나무색", "Teal, pine green, and pale wood"), material: l("매끈한 목재 질감·직물·안전 확인된 금속", "Smooth wood textures, textile, and safety-reviewed metal"), use: l("성장과 확장의 상징을 옷차림의 한 포인트로 시험", "Test growth symbolism as one accent in an ordinary outfit"), imageSrc: "/images/accessory-shop/saju-wood.jpg", imageAlt: l("솔잎색과 나무색의 펜던트·팔찌·키링 자동 생성 콘셉트", "Generated concept of pine and wood-tone pendant, bracelet, and key charm"), priceRange: l("29,000~59,000원", "KRW 29,000–59,000") },
  { id: "saju-fire", source: "saju", keyLabel: l("화(火)", "Fire"), title: l("따뜻한 빛의 작은 브로치·펜던트 방향", "Warm-light brooch or pendant direction"), form: l("방사형·작은 삼각·빛이 퍼지는 형태", "Radiating lines, small triangles, and spreading light"), palette: l("석류색·앰버·웜 골드", "Pomegranate, amber, and warm gold"), material: l("유리 질감·에나멜·안전 확인된 웜 메탈", "Glass textures, enamel, and safety-reviewed warm metal"), use: l("표현과 활력의 상징을 작은 면적으로 더해 실제 착용감을 확인", "Use a small area to test expression symbolism and real comfort"), imageSrc: "/images/accessory-shop/saju-fire.jpg", imageAlt: l("앰버와 석류색의 펜던트·브로치·참 자동 생성 콘셉트", "Generated concept of amber and pomegranate pendant, brooch, and charm"), priceRange: l("39,000~69,000원", "KRW 39,000–69,000") },
  { id: "saju-earth", source: "saju", keyLabel: l("토(土)", "Earth"), title: l("낮고 안정적인 링·트레이 방향", "Low, grounded ring or tray direction"), form: l("둥근 사각·넓은 면·낮은 중심", "Rounded squares, broad surfaces, and a low center"), palette: l("황토·샌드·크림 브라운", "Ochre, sand, and cream brown"), material: l("세라믹 질감·가죽 대체 소재·무광 금속", "Ceramic textures, leather alternatives, and matte metal"), use: l("안정과 정돈의 상징을 손이나 책상에서 반복 사용하며 확인", "Test grounding symbolism through repeated hand or desk use"), imageSrc: "/images/accessory-shop/saju-earth.jpg", imageAlt: l("샌드와 크림색의 펜던트·팔찌·트레이 자동 생성 콘셉트", "Generated concept of sand and cream pendant, bracelet, and tray"), priceRange: l("39,000~79,000원", "KRW 39,000–79,000") },
  { id: "saju-metal", source: "saju", keyLabel: l("금(金)", "Metal"), title: l("선명한 윤곽의 미니멀 장식 방향", "Clean-outline minimal accent"), form: l("원·직선·정교한 대칭", "Circles, straight lines, and precise symmetry"), palette: l("실버·오프화이트·차콜", "Silver, off-white, and charcoal"), material: l("니켈 고지된 금속·스테인리스·무광 아크릴", "Nickel-disclosed metal, stainless steel, and matte acrylic"), use: l("경계와 선택의 상징을 단정한 한 점으로 사용", "Use clarity symbolism as one restrained focal point"), imageSrc: "/images/accessory-shop/saju-metal.jpg", imageAlt: l("실버와 차콜색의 펜던트·팔찌·브로치 자동 생성 콘셉트", "Generated concept of silver and charcoal pendant, bracelet, and brooch"), priceRange: l("49,000~99,000원", "KRW 49,000–99,000") },
  { id: "saju-water", source: "saju", keyLabel: l("수(水)", "Water"), title: l("흐르는 곡선의 휴대 장식 방향", "Flowing-curve carry accent"), form: l("물결·타원·부드러운 연결", "Waves, ovals, and soft connections"), palette: l("남청·먹색·투명 블루", "Indigo, ink black, and translucent blue"), material: l("유리 질감·직물 코드·안전 확인된 수지", "Glass textures, textile cord, and safety-reviewed resin"), use: l("전환과 유연함의 상징을 키링이나 파우치 포인트로 시험", "Test transition symbolism as a key-ring or pouch accent"), imageSrc: "/images/accessory-shop/saju-water.jpg", imageAlt: l("남청과 투명 블루의 펜던트·팔찌·키링 자동 생성 콘셉트", "Generated concept of indigo and translucent-blue pendant, bracelet, and key charm"), priceRange: l("19,000~59,000원", "KRW 19,000–59,000") },
] as const;

export const numerologyAccessoryDirections: readonly AccessoryDirection[] = [
  { id: "numerology-life-path", source: "numerology", keyLabel: l("라이프 패스", "Life Path"), title: l("나를 대표하는 착용 포인트", "Signature wearable accent"), form: l("결과 숫자의 형태·리듬을 한 점에 반영", "Translate the result number's form and rhythm into one accent"), palette: l("결과 리포트의 1순위 색 방향", "The report's first-ranked palette direction"), material: l("피부 안전·무게·잠금장치를 확인한 소재", "Materials checked for skin safety, weight, and closures"), use: l("평소 옷에 30분 착용해 편안함과 손이 가는지 확인", "Wear with an ordinary outfit for 30 minutes and check comfort"), imageSrc: "/images/accessory-shop/numerology-life-path.jpg", imageAlt: l("플럼과 골드색의 펜던트·팔찌·브로치 자동 생성 콘셉트", "Generated concept of plum and gold pendant, bracelet, and brooch"), priceRange: l("39,000~69,000원", "KRW 39,000–69,000") },
  { id: "numerology-attitude", source: "numerology", keyLabel: l("태도 수", "Attitude"), title: l("매일 손에 닿는 휴대품 포인트", "Everyday-carry accent"), form: l("키링·카드 홀더·파우치에 작은 리듬 추가", "Add a small rhythm to a key ring, card holder, or pouch"), palette: l("결과 리포트의 2순위 색 방향", "The report's second-ranked palette direction"), material: l("마찰·세척·반복 사용을 견디는 소재", "Materials suited to friction, cleaning, and repeated use"), use: l("일주일 사용해 무게와 관리가 실제 생활에 맞는지 확인", "Use for a week and check weight and care in real life"), imageSrc: "/images/accessory-shop/numerology-attitude.jpg", imageAlt: l("세이지와 아쿠아색의 키링·스트랩·카드 케이스 자동 생성 콘셉트", "Generated concept of sage and aqua key charm, strap, and card case"), priceRange: l("19,000~35,000원", "KRW 19,000–35,000") },
  { id: "numerology-personal-year", source: "numerology", keyLabel: l("개인 연도", "Personal Year"), title: l("지금의 흐름을 기록하는 공간 포인트", "Current-cycle desk accent"), form: l("작은 트레이·저널 장식·정돈 오브제", "Small tray, journal accent, or organizing object"), palette: l("결과 리포트의 3순위 색 방향", "The report's third-ranked palette direction"), material: l("모서리·표면 마감·세척법이 분명한 소재", "Materials with clear edge, finish, and care information"), use: l("책상에 두고 실제 집중·정돈에 도움이 되는지 기록", "Place it on a desk and record whether it supports real organization"), imageSrc: "/images/accessory-shop/numerology-personal-year.jpg", imageAlt: l("네이비와 골드색의 트레이·저널 참·북마크 자동 생성 콘셉트", "Generated concept of navy and gold tray, journal charm, and bookmark"), priceRange: l("29,000~59,000원", "KRW 29,000–59,000") },
] as const;

const product = (
  id: string,
  directionId: string,
  source: AccessoryDirection["source"],
  slot: 0 | 1 | 2,
  name: Localized,
  kind: Localized,
  description: Localized,
  designDetails: Localized,
  useScene: Localized,
  careNote: Localized,
  priceRange: Localized,
): AccessoryConceptProduct => ({ id, directionId, source, slot, name, kind, description, designDetails, useScene, careNote, priceRange });

export const accessoryConceptProducts: readonly AccessoryConceptProduct[] = [
  product("wood-leaf-pendant", "saju-wood", "saju", 0, l("솔잎 결 펜던트", "Pine Grain Pendant"), l("펜던트", "Pendant"), l("길게 뻗은 두 겹의 잎 선을 가슴 중앙에 두는 세로형 장식입니다.", "A vertical accent that places two elongated leaf lines at the center of the chest."), l("솔잎색과 나무색 면을 앤티크 골드 윤곽으로 나눈 디자인. 목재·수지·금속 조합은 실물 샘플 후 확정합니다.", "Pine and wood-tone surfaces divided by an antique-gold outline. Wood, resin, and metal combinations remain subject to physical sampling."), l("무채색 상의 위에 단독으로 착용하는 방향", "Wear alone over a neutral top"), l("물·향수 접촉을 피하고 금속 알레르기·무게를 주문 전 확인", "Avoid water and perfume; confirm metal allergy and weight before ordering"), l("49,000~59,000원", "KRW 49,000–59,000")),
  product("wood-arc-bracelet", "saju-wood", "saju", 1, l("숲결 아크 팔찌", "Forest Arc Bracelet"), l("팔찌", "Bracelet"), l("손목을 따라 완만하게 휘는 나무색 중심 조각과 짙은 녹색 코드의 조합입니다.", "A warm wood-tone center arc paired with deep-green cord that follows the wrist."), l("둥근 코드·곡면 중심 조각·작은 금속 연결부로 구성. 잠금 방식과 손목 둘레는 주문 사양으로 확인합니다.", "Rounded cord, a curved center piece, and small metal findings. Closure and wrist size are confirmed per order."), l("셔츠 소매나 시계 반대편에 가볍게 착용", "Wear lightly beside a shirt cuff or opposite a watch"), l("코드 마찰과 땀 변색 가능성을 확인하고 마른 천으로 관리", "Check cord abrasion and sweat discoloration; clean with a dry cloth"), l("39,000~49,000원", "KRW 39,000–49,000")),
  product("wood-growth-key-charm", "saju-wood", "saju", 2, l("새결 키 참", "New Grain Key Charm"), l("키링", "Key charm"), l("작은 원형 잎과 매듭을 결합해 가방이나 열쇠에 다는 휴대 장식입니다.", "A portable accent combining a small round leaf and knot for a bag or keys."), l("나무색 잎 조각·녹색 매듭·골드 링을 한 점에 모은 형태. 링 강도와 표면 코팅은 제작 전에 확인합니다.", "A wood-tone leaf, green knot, and gold ring gathered into one piece. Ring strength and coating require pre-production review."), l("매일 사용하는 파우치나 가방 손잡이에 부착", "Attach to an everyday pouch or bag handle"), l("강하게 당기거나 차량 키의 고열 환경에 오래 두지 않기", "Avoid hard pulling and prolonged heat around vehicle keys"), l("29,000~39,000원", "KRW 29,000–39,000")),

  product("fire-halo-pendant", "saju-fire", "saju", 0, l("앰버 헤일로 펜던트", "Amber Halo Pendant"), l("펜던트", "Pendant"), l("앰버색 중심을 짧은 방사선이 둘러싸는 작은 원형 펜던트입니다.", "A small round pendant with short rays surrounding an amber-colored center."), l("석류색 삼각 포인트와 얇은 체인을 더한 구조. 유리·에나멜·금속의 실제 색 안정성은 샘플로 검토합니다.", "A pomegranate triangle accent on a fine chain. Actual glass, enamel, and metal color stability requires sampling."), l("재킷 안쪽이나 단색 니트의 작은 포인트", "A small accent inside a jacket or over a solid knit"), l("충격과 스크래치에 주의하고 체인 도금 정보를 주문 전 확인", "Avoid impact and scratches; confirm chain plating before ordering"), l("49,000~59,000원", "KRW 49,000–59,000")),
  product("fire-flame-brooch", "saju-fire", "saju", 1, l("불빛 곡선 브로치", "Flame Curve Brooch"), l("브로치", "Brooch"), l("두 개의 길게 휘어진 불빛 선이 앰버색 중심을 감싸는 조형 브로치입니다.", "A sculptural brooch with two elongated flame-like curves around an amber center."), l("붉은 에나멜 면과 골드 선을 넓게 쓰는 디자인. 핀 잠금력·무게·의류 손상 가능성을 실물로 확인합니다.", "Broad red enamel and gold lines. Pin strength, weight, and possible fabric damage must be checked on the physical sample."), l("두꺼운 재킷·숄·가방 전면에 한 점으로 사용", "Use as one focal point on a thick jacket, shawl, or bag"), l("얇은 원단에는 사용하지 말고 보관 시 핀을 잠가 두기", "Do not use on delicate fabric; close the pin during storage"), l("59,000~69,000원", "KRW 59,000–69,000")),
  product("fire-ember-drop-charm", "saju-fire", "saju", 2, l("불씨 드롭 참", "Ember Drop Charm"), l("팔찌·가방 참", "Bracelet or bag charm"), l("작은 삼각 프레임과 두 개의 앰버 드롭을 세로로 연결한 가벼운 참입니다.", "A light charm connecting a small triangular frame and two amber drops vertically."), l("작은 체인과 흔들리는 장식으로 움직임을 강조. 연결 고리의 내구성과 장식 길이는 제작 사양에서 조정합니다.", "Small chain and moving drops add motion. Link durability and drop length are adjusted in production specifications."), l("기존 팔찌나 작은 가방 고리에 추가", "Add to an existing bracelet or small bag ring"), l("걸림이 많은 니트·반려동물 주변에서는 사용 주의", "Use cautiously around snag-prone knits and pets"), l("39,000~49,000원", "KRW 39,000–49,000")),

  product("earth-strata-pendant", "saju-earth", "saju", 0, l("모래층 펜던트", "Sand Strata Pendant"), l("펜던트", "Pendant"), l("둥근 사각 안에 크림색과 모래색 층을 나눈 차분한 펜던트입니다.", "A calm rounded-square pendant divided into cream and sand-colored layers."), l("낮은 채도의 표면과 가는 황동색 선을 사용. 세라믹·수지·금속 중 실제 무게와 파손성을 비교해 확정합니다.", "Low-saturation surfaces with a fine brass-tone line. Ceramic, resin, or metal is chosen after comparing weight and breakage risk."), l("린넨·면 소재의 일상복과 조합", "Pair with everyday linen or cotton clothing"), l("낙하 충격을 피하고 표면 세척법을 소재 확정 후 안내", "Avoid drops; care instructions follow final material approval"), l("49,000~59,000원", "KRW 49,000–59,000")),
  product("earth-ground-bracelet", "saju-earth", "saju", 1, l("그라운드 라인 팔찌", "Ground Line Bracelet"), l("팔찌", "Bracelet"), l("매듭 두 곳과 낮은 금속 곡선을 연결한 얇고 담백한 팔찌입니다.", "A restrained slim bracelet connecting two knots with a low metal curve."), l("샌드색 코드와 무광 금속을 중심으로 구성. 손목 둘레와 피부 접촉 부위를 1:1 사양으로 확인합니다.", "Built around sand-colored cord and matte metal. Wrist size and skin-contact areas are confirmed one-to-one."), l("시계와 겹치지 않게 단독으로 착용", "Wear alone without stacking against a watch"), l("물에 젖으면 바로 건조하고 매듭 풀림을 정기적으로 확인", "Dry immediately if wet and check knots regularly"), l("39,000~49,000원", "KRW 39,000–49,000")),
  product("earth-low-tray", "saju-earth", "saju", 2, l("낮은 결 트레이", "Low Grain Tray"), l("악세서리 트레이", "Accessory tray"), l("귀걸이·반지·열쇠처럼 작은 물건을 한곳에 두는 낮은 곡면 트레이입니다.", "A low curved tray for keeping earrings, rings, or keys in one place."), l("모래색 표면과 비대칭 골드 선을 사용. 모서리 마감·바닥 미끄럼·세척 방식을 실물 제작에서 확인합니다.", "Sand surface with an asymmetric gold line. Edge finish, base grip, and cleaning method require physical review."), l("현관·침대 옆·책상 위의 작은 정리 공간", "A small organizing spot by the entry, bed, or desk"), l("식기 용도로 사용하지 말고 물 고임과 강한 세제를 피하기", "Not for food use; avoid standing water and harsh detergent"), l("59,000~79,000원", "KRW 59,000–79,000")),

  product("metal-axis-pendant", "saju-metal", "saju", 0, l("축 원형 펜던트", "Axis Circle Pendant"), l("펜던트", "Pendant"), l("겹친 원과 한 줄의 세로축을 결합한 선명한 대형 펜던트입니다.", "A clear statement pendant combining concentric circles with one vertical axis."), l("브러시드 실버 면과 가는 골드선을 조합. 금속 종류·니켈 고지·총중량은 실물 견적에서 확정합니다.", "Brushed silver surfaces with a fine gold line. Metal type, nickel disclosure, and total weight are finalized with the physical quote."), l("단순한 셔츠나 터틀넥 위에 단독 착용", "Wear alone over a simple shirt or turtleneck"), l("무게 민감도와 금속 알레르기를 확인하고 개별 파우치 보관", "Confirm weight tolerance and metal allergy; store in a separate pouch"), l("69,000~89,000원", "KRW 69,000–89,000")),
  product("metal-boundary-bracelet", "saju-metal", "saju", 1, l("바운더리 바 팔찌", "Boundary Bar Bracelet"), l("팔찌", "Bracelet"), l("차콜 밴드 위에 직선형 실버 바를 세운 미니멀 팔찌입니다.", "A minimal bracelet with a straight silver bar set over a charcoal band."), l("직선 바·슬림 골드 포인트·검정 밴드의 세 요소로 구성. 밴드 소재와 잠금장치는 반복 착용 테스트 후 선택합니다.", "Three elements: straight bar, slim gold accent, and black band. Band material and closure follow wear testing."), l("업무복·정장 소매 아래에 단정하게 착용", "Wear neatly under business or formal cuffs"), l("단단한 모서리와 노트북 표면의 마찰에 주의", "Watch for hard edges rubbing against laptop surfaces"), l("49,000~69,000원", "KRW 49,000–69,000")),
  product("metal-precision-brooch", "saju-metal", "saju", 2, l("프리시전 스퀘어 브로치", "Precision Square Brooch"), l("브로치", "Brooch"), l("기울어진 사각 프레임을 여러 층 겹친 정밀한 기하 브로치입니다.", "A precise geometric brooch made of several layered, tilted square frames."), l("실버 표면의 결 방향을 달리하고 작은 골드 연결점을 둔 구조. 핀 위치와 날카로운 모서리를 실물에서 검수합니다.", "Silver grain directions vary across layers with a small gold joint. Pin placement and sharp edges require physical inspection."), l("두꺼운 코트 깃이나 구조적인 가방에 사용", "Use on a thick coat lapel or structured bag"), l("얇은 의류를 피하고 모서리가 다른 물건을 긁지 않게 분리 보관", "Avoid delicate garments and store separately to prevent scratches"), l("79,000~99,000원", "KRW 79,000–99,000")),

  product("water-ink-flow-pendant", "saju-water", "saju", 0, l("먹빛 흐름 펜던트", "Ink Flow Pendant"), l("펜던트", "Pendant"), l("먹빛과 남청색이 한 방향으로 흐르는 긴 물방울형 펜던트입니다.", "An elongated drop pendant with ink and indigo tones flowing in one direction."), l("반투명 수지 또는 유리 질감과 실버 윤곽을 조합. 기포·표면 스크래치·무게 기준을 샘플에서 확인합니다.", "Translucent resin or glass texture with a silver outline. Bubbles, scratches, and weight are checked in sampling."), l("흰 셔츠·짙은 니트 위에 대비되는 한 점", "A contrasting focal point over a white shirt or dark knit"), l("낙하·고열·직사광선을 피하고 부드러운 천으로 닦기", "Avoid drops, high heat, and direct sun; wipe with a soft cloth"), l("49,000~59,000원", "KRW 49,000–59,000")),
  product("water-clear-current-bracelet", "saju-water", "saju", 1, l("맑은 물결 팔찌", "Clear Current Bracelet"), l("팔찌", "Bracelet"), l("투명한 아쿠아 곡선이 손목을 한 바퀴 도는 조형 팔찌입니다.", "A sculptural bracelet with a transparent aqua curve wrapping the wrist."), l("투명 소재의 굴곡과 작은 실버 연결부가 중심. 착용구 폭·탄성·기포 기준을 실물 테스트로 정합니다.", "Curved transparent material with a small silver connector. Opening width, flex, and bubble tolerance require physical testing."), l("소매가 짧은 계절에 단독 착용", "Wear alone with shorter sleeves"), l("충격·압착·화장품 접촉을 피하고 작은 손목은 흘러내림 확인", "Avoid impact, pressure, and cosmetics; check slipping on smaller wrists"), l("39,000~59,000원", "KRW 39,000–59,000")),
  product("water-crescent-key-charm", "saju-water", "saju", 2, l("초승 물결 키 참", "Crescent Wave Key Charm"), l("키링", "Key charm"), l("짙은 남청색 초승 곡선 안에 흰 물결 결을 넣은 작은 키 참입니다.", "A small key charm with white wave grain inside a deep-indigo crescent curve."), l("실버 링·짧은 체인·곡선 장식으로 구성. 체인 길이와 수지 표면 코팅은 주문 제작 전에 확정합니다.", "Silver ring, short chain, and curved accent. Chain length and resin coating are finalized before production."), l("열쇠·파우치·작은 크로스백에 부착", "Attach to keys, a pouch, or a small crossbody bag"), l("무거운 열쇠 뭉치와 함께 사용하면 연결부 마모를 자주 확인", "Check link wear often when used with a heavy key set"), l("19,000~29,000원", "KRW 19,000–29,000")),

  product("life-rhythm-pendant", "numerology-life-path", "numerology", 0, l("리듬 스택 펜던트", "Rhythm Stack Pendant"), l("펜던트", "Pendant"), l("원·반원·사각을 세로로 쌓아 개인 숫자의 반복 리듬을 반영하는 펜던트 방향입니다.", "A pendant direction stacking circles, half-circles, and squares to reflect the repetition rhythm of a personal number."), l("플럼·크림·골드 모듈의 순서와 개수를 결과 숫자에 맞춰 조정. 실제 크기와 무게는 주문 확인 후 결정합니다.", "Plum, cream, and gold module order and count adapt to the result number. Final size and weight follow order review."), l("평소 자주 입는 단색 상의에 대표 장식으로 착용", "Wear as a signature accent over a frequently worn solid top"), l("모듈 연결부와 체인 도금·알레르기 정보를 결제 전 확인", "Confirm module joints, chain plating, and allergy information before purchase"), l("59,000~69,000원", "KRW 59,000–69,000")),
  product("life-modular-bracelet", "numerology-life-path", "numerology", 1, l("시그니처 모듈 팔찌", "Signature Module Bracelet"), l("팔찌", "Bracelet"), l("서로 다른 작은 도형 모듈을 한 줄로 연결해 계산값의 박자를 표현하는 팔찌입니다.", "A bracelet linking small geometric modules to express the cadence of a calculated value."), l("직물 코드 위 모듈 배치를 숫자별로 달리하는 구조. 잠금장치·손목 둘레·모듈 간격을 1:1로 확인합니다.", "Module placement varies by number over a textile cord. Closure, wrist size, and spacing are confirmed one-to-one."), l("평일에도 부담 없이 한 점만 착용", "Wear as a single easy everyday accent"), l("매듭과 모듈 사이 마찰을 확인하고 물에 오래 담그지 않기", "Check friction between knots and modules; do not soak"), l("39,000~59,000원", "KRW 39,000–59,000")),
  product("life-balance-brooch", "numerology-life-path", "numerology", 2, l("밸런스 서클 브로치", "Balance Circle Brooch"), l("브로치", "Brooch"), l("원형 안을 여러 크기의 면으로 나눠 서로 다른 역할의 균형을 보여주는 브로치입니다.", "A circular brooch divided into surfaces of different sizes to suggest balanced roles."), l("플럼·크림·골드 면의 비율을 결과값에 맞춰 조정. 핀 위치와 전체 무게는 의류 손상을 기준으로 검토합니다.", "Plum, cream, and gold proportions adapt to the result. Pin position and total weight are reviewed against fabric damage."), l("재킷·가방의 넓고 단단한 면에 사용", "Use on a broad, firm jacket or bag surface"), l("얇은 원단을 피하고 핀 끝과 모서리를 잠가 보관", "Avoid delicate fabric and secure the pin during storage"), l("49,000~69,000원", "KRW 49,000–69,000")),

  product("attitude-day-leaf-keyring", "numerology-attitude", "numerology", 0, l("데이 리프 키링", "Day Leaf Keyring"), l("키링", "Key ring"), l("세이지·크림색 잎과 짧은 태슬을 묶어 매일 손에 닿게 만든 키링입니다.", "An everyday key ring combining sage and cream leaves with a short tassel."), l("결과 숫자에 따라 잎 조각 수와 색 순서를 조정. 링 회전력·태슬 길이·표면 내구성을 확인합니다.", "Leaf count and color order adapt to the result number. Ring swivel, tassel length, and surface durability require review."), l("집 열쇠나 자주 쓰는 가방 손잡이에 부착", "Attach to house keys or an often-used bag handle"), l("태슬 오염과 링 풀림을 주기적으로 확인", "Check tassel soiling and ring loosening regularly"), l("19,000~29,000원", "KRW 19,000–29,000")),
  product("attitude-daily-strap", "numerology-attitude", "numerology", 1, l("데일리 플로우 스트랩", "Daily Flow Strap"), l("가방 스트랩", "Bag strap"), l("세이지와 아쿠아색 곡선을 겹친 짧은 손목형 가방 스트랩입니다.", "A short wrist-style bag strap layering sage and aqua curves."), l("곡선 패치의 반복 간격을 숫자에 맞춰 조절. 봉제 강도·고리 하중·손목 폭은 실제 사용 테스트로 검토합니다.", "Curve patch spacing adapts to the number. Stitch strength, hook load, and wrist width require use testing."), l("파우치·카메라·작은 가방의 보조 손잡이", "An auxiliary handle for a pouch, camera, or small bag"), l("무거운 가방의 주 손잡이로 사용하지 말고 봉제 풀림 확인", "Not a primary handle for heavy bags; check stitching"), l("25,000~35,000원", "KRW 25,000–35,000")),
  product("attitude-color-card-charm", "numerology-attitude", "numerology", 2, l("컬러 블록 카드 참", "Color Block Card Charm"), l("카드 케이스 참", "Card-case charm"), l("카드 케이스 크기의 작은 색면 오브제에 고리와 태슬을 더한 휴대 장식입니다.", "A portable card-case-sized color-block object with a hook and tassel."), l("세이지·아쿠아·크림 면적을 결과 숫자의 비율로 조정. 카드 수납 기능 여부와 잠금 방식은 실물 설계 후 확정합니다.", "Sage, aqua, and cream proportions adapt to the result number. Card storage and closure remain subject to physical design."), l("교통카드 파우치나 가방 안쪽 포인트", "A transit-card pouch or inner-bag accent"), l("개인정보가 있는 카드를 외부에 노출하지 않고 지퍼·스냅 내구성 확인", "Do not expose personal cards; confirm zipper or snap durability"), l("29,000~35,000원", "KRW 29,000–35,000")),

  product("year-cycle-tray", "numerology-personal-year", "numerology", 0, l("사이클 라인 트레이", "Cycle Line Tray"), l("데스크 트레이", "Desk tray"), l("한 해의 순환을 겹친 곡선으로 나눈 네이비색 정리 트레이입니다.", "A navy organizing tray divided by layered curves representing an annual cycle."), l("크림·바이올렛·골드 선의 배치를 개인 연도값에 맞춰 변형. 바닥 미끄럼과 표면 내구성은 샘플로 확인합니다.", "Cream, violet, and gold line placement adapts to Personal Year. Base grip and surface durability require sampling."), l("책상 위 열쇠·이어폰·반지 정리", "Organize keys, earbuds, or rings on a desk"), l("식품용이 아니며 물 고임·뜨거운 물건·강한 세제를 피하기", "Not food-safe; avoid standing water, hot items, and harsh detergent"), l("49,000~59,000원", "KRW 49,000–59,000")),
  product("year-journal-charm", "numerology-personal-year", "numerology", 1, l("기록 리듬 저널 참", "Record Rhythm Journal Charm"), l("저널 참", "Journal charm"), l("작은 가죽 대체 소재 태그에 원과 곡선을 겹쳐 노트에 거는 기록용 장식입니다.", "A notebook accent layering circles and curves on a small leather-alternative tag."), l("개인 연도 숫자에 따라 원형 패치 수와 위치를 변경. 고리 규격과 표면 소재는 노트 손상을 기준으로 선택합니다.", "Circular patch count and position vary by Personal Year. Hook and surface material are chosen to avoid notebook damage."), l("다이어리 고리·필통·북 파우치에 부착", "Attach to a planner ring, pencil case, or book pouch"), l("종이 가장자리를 긁지 않게 고리 마감과 태슬 길이 확인", "Confirm hook finish and tassel length to avoid scratching paper"), l("29,000~39,000원", "KRW 29,000–39,000")),
  product("year-arc-bookmark", "numerology-personal-year", "numerology", 2, l("이어 아크 북마크", "Year Arc Bookmark"), l("북마크", "Bookmark"), l("길고 얇은 판 위에 겹친 연도 곡선과 짧은 태슬을 배치한 북마크입니다.", "A long slim bookmark with layered annual arcs and a short tassel."), l("네이비·크림·골드 면과 원형 포인트를 결과값에 맞춰 배치. 두께·모서리·도서 눌림은 실물 샘플로 검토합니다.", "Navy, cream, gold, and circular accents adapt to the result. Thickness, corners, and page pressure require physical review."), l("책·다이어리의 현재 기록 위치를 표시", "Mark the current place in a book or journal"), l("얇은 종이에 장시간 끼우기 전 두께를 확인하고 습기를 피하기", "Check thickness before long use in thin pages and avoid moisture"), l("29,000~39,000원", "KRW 29,000–39,000")),
] as const;

export function localizeAccessoryDirection(direction: AccessoryDirection, locale: Locale) {
  return {
    ...direction,
    keyLabel: direction.keyLabel[locale],
    title: direction.title[locale],
    form: direction.form[locale],
    palette: direction.palette[locale],
    material: direction.material[locale],
    use: direction.use[locale],
    imageAlt: direction.imageAlt[locale],
    priceRange: direction.priceRange[locale],
  };
}

export function localizeAccessoryProduct(item: AccessoryConceptProduct, locale: Locale) {
  return {
    ...item,
    name: item.name[locale],
    kind: item.kind[locale],
    description: item.description[locale],
    designDetails: item.designDetails[locale],
    useScene: item.useScene[locale],
    careNote: item.careNote[locale],
    priceRange: item.priceRange[locale],
  };
}

export function getAccessoryConceptProduct(productId: string) {
  return accessoryConceptProducts.find(({ id }) => id === productId);
}

export function getAccessoryDirection(directionId: string) {
  return [...sajuAccessoryDirections, ...numerologyAccessoryDirections]
    .find(({ id }) => id === directionId);
}

export function recommendAccessoryProductsByBirthDate(
  birthDate: string,
  calendarYear: number,
): readonly AccessoryBirthRecommendation[] {
  if (!isAcceptedBirthDate(birthDate)) throw new Error("UNSUPPORTED_BIRTH_DATE");
  const profile = calculateNumerologyProfile({ birthDate, personalYear: calendarYear });
  const facts = [
    { fact: "lifePath" as const, value: profile.lifePath.value, directionId: "numerology-life-path" },
    { fact: "attitude" as const, value: profile.attitude.value, directionId: "numerology-attitude" },
    { fact: "personalYear" as const, value: profile.personalYear.value, directionId: "numerology-personal-year" },
  ];

  return facts.map(({ fact, value, directionId }) => {
    const candidates = accessoryConceptProducts.filter((product) => product.directionId === directionId);
    const product = candidates[(Math.max(1, value) - 1) % candidates.length];
    if (!product) throw new Error(`ACCESSORY_RECOMMENDATION_MISSING:${directionId}`);
    return { fact, value, product, ruleVersion: NUMEROLOGY_RULE_VERSION };
  });
}
