import type { Locale } from "@/i18n/config";

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

const l = (ko: string, en: string): Localized => ({ ko, en });

export const sajuAccessoryDirections: readonly AccessoryDirection[] = [
  { id: "saju-wood", source: "saju", keyLabel: l("목(木)", "Wood"), title: l("길게 뻗는 선의 착용 포인트", "Elongated wearable accent"), form: l("세로선·잎·가느다란 연결", "Vertical lines, leaves, and slender links"), palette: l("청록·솔잎색·옅은 나무색", "Teal, pine green, and pale wood"), material: l("매끈한 목재 질감·직물·안전 확인된 금속", "Smooth wood textures, textile, and safety-reviewed metal"), use: l("성장과 확장의 상징을 옷차림의 한 포인트로 시험", "Test growth symbolism as one accent in an ordinary outfit"), imageSrc: "/images/accessory-shop/saju-wood.jpg", imageAlt: l("솔잎색과 나무색의 펜던트·팔찌·키링 AI 콘셉트", "AI concept of pine and wood-tone pendant, bracelet, and key charm"), priceRange: l("29,000~59,000원", "KRW 29,000–59,000") },
  { id: "saju-fire", source: "saju", keyLabel: l("화(火)", "Fire"), title: l("따뜻한 빛의 작은 브로치·펜던트 방향", "Warm-light brooch or pendant direction"), form: l("방사형·작은 삼각·빛이 퍼지는 형태", "Radiating lines, small triangles, and spreading light"), palette: l("석류색·앰버·웜 골드", "Pomegranate, amber, and warm gold"), material: l("유리 질감·에나멜·안전 확인된 웜 메탈", "Glass textures, enamel, and safety-reviewed warm metal"), use: l("표현과 활력의 상징을 작은 면적으로 더해 실제 착용감을 확인", "Use a small area to test expression symbolism and real comfort"), imageSrc: "/images/accessory-shop/saju-fire.jpg", imageAlt: l("앰버와 석류색의 펜던트·브로치·참 AI 콘셉트", "AI concept of amber and pomegranate pendant, brooch, and charm"), priceRange: l("39,000~69,000원", "KRW 39,000–69,000") },
  { id: "saju-earth", source: "saju", keyLabel: l("토(土)", "Earth"), title: l("낮고 안정적인 링·트레이 방향", "Low, grounded ring or tray direction"), form: l("둥근 사각·넓은 면·낮은 중심", "Rounded squares, broad surfaces, and a low center"), palette: l("황토·샌드·크림 브라운", "Ochre, sand, and cream brown"), material: l("세라믹 질감·가죽 대체 소재·무광 금속", "Ceramic textures, leather alternatives, and matte metal"), use: l("안정과 정돈의 상징을 손이나 책상에서 반복 사용하며 확인", "Test grounding symbolism through repeated hand or desk use"), imageSrc: "/images/accessory-shop/saju-earth.jpg", imageAlt: l("샌드와 크림색의 펜던트·팔찌·트레이 AI 콘셉트", "AI concept of sand and cream pendant, bracelet, and tray"), priceRange: l("39,000~79,000원", "KRW 39,000–79,000") },
  { id: "saju-metal", source: "saju", keyLabel: l("금(金)", "Metal"), title: l("선명한 윤곽의 미니멀 장식 방향", "Clean-outline minimal accent"), form: l("원·직선·정교한 대칭", "Circles, straight lines, and precise symmetry"), palette: l("실버·오프화이트·차콜", "Silver, off-white, and charcoal"), material: l("니켈 고지된 금속·스테인리스·무광 아크릴", "Nickel-disclosed metal, stainless steel, and matte acrylic"), use: l("경계와 선택의 상징을 단정한 한 점으로 사용", "Use clarity symbolism as one restrained focal point"), imageSrc: "/images/accessory-shop/saju-metal.jpg", imageAlt: l("실버와 차콜색의 펜던트·팔찌·브로치 AI 콘셉트", "AI concept of silver and charcoal pendant, bracelet, and brooch"), priceRange: l("49,000~99,000원", "KRW 49,000–99,000") },
  { id: "saju-water", source: "saju", keyLabel: l("수(水)", "Water"), title: l("흐르는 곡선의 휴대 장식 방향", "Flowing-curve carry accent"), form: l("물결·타원·부드러운 연결", "Waves, ovals, and soft connections"), palette: l("남청·먹색·투명 블루", "Indigo, ink black, and translucent blue"), material: l("유리 질감·직물 코드·안전 확인된 수지", "Glass textures, textile cord, and safety-reviewed resin"), use: l("전환과 유연함의 상징을 키링이나 파우치 포인트로 시험", "Test transition symbolism as a key-ring or pouch accent"), imageSrc: "/images/accessory-shop/saju-water.jpg", imageAlt: l("남청과 투명 블루의 펜던트·팔찌·키링 AI 콘셉트", "AI concept of indigo and translucent-blue pendant, bracelet, and key charm"), priceRange: l("19,000~59,000원", "KRW 19,000–59,000") },
] as const;

export const numerologyAccessoryDirections: readonly AccessoryDirection[] = [
  { id: "numerology-life-path", source: "numerology", keyLabel: l("라이프 패스", "Life Path"), title: l("나를 대표하는 착용 포인트", "Signature wearable accent"), form: l("결과 숫자의 형태·리듬을 한 점에 반영", "Translate the result number's form and rhythm into one accent"), palette: l("결과 리포트의 1순위 색 방향", "The report's first-ranked palette direction"), material: l("피부 안전·무게·잠금장치를 확인한 소재", "Materials checked for skin safety, weight, and closures"), use: l("평소 옷에 30분 착용해 편안함과 손이 가는지 확인", "Wear with an ordinary outfit for 30 minutes and check comfort"), imageSrc: "/images/accessory-shop/numerology-life-path.jpg", imageAlt: l("플럼과 골드색의 펜던트·팔찌·브로치 AI 콘셉트", "AI concept of plum and gold pendant, bracelet, and brooch"), priceRange: l("39,000~69,000원", "KRW 39,000–69,000") },
  { id: "numerology-attitude", source: "numerology", keyLabel: l("태도 수", "Attitude"), title: l("매일 손에 닿는 휴대품 포인트", "Everyday-carry accent"), form: l("키링·카드 홀더·파우치에 작은 리듬 추가", "Add a small rhythm to a key ring, card holder, or pouch"), palette: l("결과 리포트의 2순위 색 방향", "The report's second-ranked palette direction"), material: l("마찰·세척·반복 사용을 견디는 소재", "Materials suited to friction, cleaning, and repeated use"), use: l("일주일 사용해 무게와 관리가 실제 생활에 맞는지 확인", "Use for a week and check weight and care in real life"), imageSrc: "/images/accessory-shop/numerology-attitude.jpg", imageAlt: l("세이지와 아쿠아색의 키링·스트랩·카드 케이스 AI 콘셉트", "AI concept of sage and aqua key charm, strap, and card case"), priceRange: l("19,000~35,000원", "KRW 19,000–35,000") },
  { id: "numerology-personal-year", source: "numerology", keyLabel: l("개인 연도", "Personal Year"), title: l("지금의 흐름을 기록하는 공간 포인트", "Current-cycle desk accent"), form: l("작은 트레이·저널 장식·정돈 오브제", "Small tray, journal accent, or organizing object"), palette: l("결과 리포트의 3순위 색 방향", "The report's third-ranked palette direction"), material: l("모서리·표면 마감·세척법이 분명한 소재", "Materials with clear edge, finish, and care information"), use: l("책상에 두고 실제 집중·정돈에 도움이 되는지 기록", "Place it on a desk and record whether it supports real organization"), imageSrc: "/images/accessory-shop/numerology-personal-year.jpg", imageAlt: l("네이비와 골드색의 트레이·저널 참·북마크 AI 콘셉트", "AI concept of navy and gold tray, journal charm, and bookmark"), priceRange: l("29,000~59,000원", "KRW 29,000–59,000") },
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
