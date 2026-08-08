import type { Locale } from "@/i18n/config";
import type { NumerologyProfile } from "@/core/numerology";
import {
  accessoryCategoryIds,
  musicLaneIds,
  type AccessoryCategoryId,
  type AccessoryRecommendation,
  type LifestyleEvidenceRef,
  type LifestyleRecommendations,
  type MusicLaneId,
  type MusicRecommendation,
  type ShopPreview,
} from "./types";

export const LIFESTYLE_RULE_VERSION = "lifestyle-symbolic-1.0.0";

type Localized = Readonly<{ ko: string; en: string }>;
type NumberTheme = Readonly<{
  label: Localized;
  form: Localized;
  palette: Localized;
  material: Localized;
  genre: Localized;
  sonic: Localized;
  cue: Localized;
}>;

const l = (ko: string, en: string): Localized => ({ ko, en });
const text = (value: Localized, locale: Locale): string => value[locale];

const themes: Readonly<Record<number, NumberTheme>> = {
  1: {
    label: l("선명한 시작", "clear initiative"),
    form: l("한 방향이 또렷한 직선과 작은 포인트", "clean directional lines with one restrained focal point"),
    palette: l("러스트·웜 레드·차콜", "rust, warm red, and charcoal"),
    material: l("브러시드 메탈과 단단한 무광 질감", "brushed metal and firm matte textures"),
    genre: l("리듬이 선명한 얼터너티브 팝·전자음악", "rhythm-forward alternative pop and electronic music"),
    sonic: l("분명한 킥, 짧은 도입, 과하지 않은 반복", "defined percussion, short intros, and controlled repetition"),
    cue: l("첫 30초 안에 몸이나 집중이 앞으로 움직이는 곡", "tracks that create forward motion within the first 30 seconds"),
  },
  2: {
    label: l("조율과 여백", "attuned spaciousness"),
    form: l("쌍을 이루는 곡선과 부드러운 겹침", "paired curves and gentle layering"),
    palette: l("소프트 블루·실버·크림", "soft blue, silver, and cream"),
    material: l("매끈한 직물과 진주빛 유리 질감", "smooth textiles and pearl-like glass textures"),
    genre: l("어쿠스틱 R&B·드림 팝·잔잔한 앰비언트", "acoustic R&B, dream pop, and gentle ambient"),
    sonic: l("가까운 보컬, 넓은 공간감, 유연한 템포", "close vocals, open space, and flexible tempo"),
    cue: l("다른 소리가 서로 밀지 않고 대화처럼 들리는 곡", "tracks whose parts feel conversational rather than crowded"),
  },
  3: {
    label: l("표현과 유희", "expressive play"),
    form: l("움직이는 모듈과 작은 색 대비", "moving modules and compact color contrast"),
    palette: l("코럴·시트러스·코발트", "coral, citrus, and cobalt"),
    material: l("에나멜 포인트와 가벼운 혼합 질감", "enamel accents and light mixed textures"),
    genre: l("인디 팝·펑크·밝은 재즈", "indie pop, funk, and bright jazz"),
    sonic: l("재치 있는 리듬 변화, 선명한 멜로디, 보컬 훅", "playful rhythmic shifts, vivid melody, and vocal hooks"),
    cue: l("표정이나 말의 리듬을 자연스럽게 바꾸는 곡", "tracks that naturally shift facial expression or speech rhythm"),
  },
  4: {
    label: l("구조와 지속성", "grounded structure"),
    form: l("격자·사각형·정돈된 반복", "grids, rectangles, and ordered repetition"),
    palette: l("포레스트·슬레이트·차콜", "forest, slate, and charcoal"),
    material: l("내구성 있는 스틸과 캔버스 질감", "durable steel and canvas textures"),
    genre: l("미니멀 전자음악·바로크·반복형 현대음악", "minimal electronic, baroque, and pattern-based contemporary music"),
    sonic: l("안정된 박자, 단계적 전개, 낮은 변동성", "steady pulse, incremental development, and low volatility"),
    cue: l("중간에 흐름을 방해하지 않고 오래 이어지는 곡", "tracks that sustain a task without interrupting its flow"),
  },
  5: {
    label: l("변화와 이동", "adaptive movement"),
    form: l("비대칭과 변형 가능한 구조", "asymmetry and transformable construction"),
    palette: l("앰버·코발트·청록", "amber, cobalt, and teal"),
    material: l("가벼운 재생 나일론과 대비 질감", "light recycled nylon and contrasting textures"),
    genre: l("브레이크비트·글로벌 전자음악·댄스", "breakbeat, global electronic, and dance"),
    sonic: l("예상 밖의 전환, 다양한 타악기, 빠른 장면 변화", "unexpected transitions, varied percussion, and quick scene changes"),
    cue: l("익숙함과 낯섦이 번갈아 나타나는 곡", "tracks that alternate familiarity with surprise"),
  },
  6: {
    label: l("돌봄과 조화", "warm stewardship"),
    form: l("손에 편안한 둥근 형태와 수공예 흔적", "hand-friendly curves and visible craft"),
    palette: l("올리브·로즈·웜 크림", "olive, rose, and warm cream"),
    material: l("따뜻한 톤의 금속·세라믹·직물", "warm-toned metal, ceramic, and textile"),
    genre: l("소울·어쿠스틱 포크·네오클래식", "soul, acoustic folk, and neoclassical"),
    sonic: l("따뜻한 중역, 사람 목소리, 유기적인 악기", "warm midrange, human voice, and organic instruments"),
    cue: l("돌봄이 의무가 아니라 회복으로 느껴지는 곡", "tracks that make care feel restorative rather than obligatory"),
  },
  7: {
    label: l("관찰과 깊이", "reflective depth"),
    form: l("절제된 선과 안쪽에 숨은 디테일", "restrained lines with details revealed up close"),
    palette: l("잉크 블루·바이올렛·스모크", "ink blue, violet, and smoke"),
    material: l("매트 메탈과 반투명 유리 질감", "matte metal and translucent glass textures"),
    genre: l("앰비언트·기악 재즈·다운템포", "ambient, instrumental jazz, and downtempo"),
    sonic: l("긴 잔향, 적은 요소, 미세한 변화", "long decay, sparse elements, and subtle variation"),
    cue: l("주의를 빼앗기보다 생각 사이 공간을 만드는 곡", "tracks that create space between thoughts instead of demanding attention"),
  },
  8: {
    label: l("영향력과 실행", "decisive scale"),
    form: l("무게감 있는 윤곽과 대칭적 중심", "substantial outlines and a balanced center"),
    palette: l("버건디·블랙·딥 골드", "burgundy, black, and deep gold"),
    material: l("폴리시드 메탈과 구조적인 비건 가죽 질감", "polished metal and structured vegan-leather textures"),
    genre: l("힙합·시네마틱 전자음악·대형 편성", "hip-hop, cinematic electronic, and large-scale arrangements"),
    sonic: l("단단한 저역, 명확한 빌드업, 넓은 다이내믹", "firm low end, clear build, and broad dynamics"),
    cue: l("과시보다 결정과 마무리에 힘을 주는 곡", "tracks that support decisions and completion rather than display"),
  },
  9: {
    label: l("확장과 통합", "expansive synthesis"),
    form: l("유동적인 곡선과 서로 다른 요소의 연결", "fluid curves that connect different elements"),
    palette: l("오션·테라코타·딥 그린", "ocean, terracotta, and deep green"),
    material: l("재생 유리와 직물의 혼합 질감", "recycled glass and layered textile textures"),
    genre: l("글로벌 소울·시네마틱·크로스오버", "global soul, cinematic, and crossover music"),
    sonic: l("넓은 편성, 서사적 전개, 문화적 층위", "wide ensembles, narrative development, and layered influences"),
    cue: l("한 장르로 고정되기보다 여러 관점을 잇는 곡", "tracks that connect perspectives instead of staying in one genre"),
  },
  11: {
    label: l("직관과 감응", "intuitive resonance"),
    form: l("가느다란 빛의 선과 반사되는 작은 면", "slender luminous lines and small reflective planes"),
    palette: l("미드나이트·오팔 화이트·라일락", "midnight, opal white, and lilac"),
    material: l("반사 유리와 저자극 금속 질감", "reflective glass and skin-conscious metal textures"),
    genre: l("드림 팝·앰비언트 전자음악·공간형 보컬", "dream pop, ambient electronic, and spatial vocal music"),
    sonic: l("겹친 보컬, 잔향, 섬세한 고역", "layered vocals, lingering reverb, and delicate upper tones"),
    cue: l("감각을 과열시키지 않으면서 이미지가 떠오르는 곡", "tracks that evoke imagery without overstimulating"),
  },
  22: {
    label: l("구상과 구현", "vision into form"),
    form: l("건축적인 모듈과 결합 가능한 부품", "architectural modules and connectable parts"),
    palette: l("슬레이트·코퍼·딥 네이비", "slate, copper, and deep navy"),
    material: l("내구성 있는 스틸과 책임 조달 목재 질감", "durable steel and responsibly sourced wood textures"),
    genre: l("포스트록·미니멀 전자음악·점층적 오케스트라", "post-rock, minimal electronic, and gradually building orchestral music"),
    sonic: l("긴 빌드, 반복 위의 층 추가, 큰 구조", "long builds, added layers over repetition, and large-form structure"),
    cue: l("작은 단계가 모여 큰 형태가 되는 곡", "tracks where small stages accumulate into a larger form"),
  },
  33: {
    label: l("환대와 확산", "generous expression"),
    form: l("열린 원형과 함께 쓰기 좋은 부드러운 형태", "open circles and soft forms suited to shared spaces"),
    palette: l("플럼·웜 크림·세이지", "plum, warm cream, and sage"),
    material: l("수공예 세라믹·직물·웜 메탈 질감", "crafted ceramic, textile, and warm-metal textures"),
    genre: l("소울 앙상블·어쿠스틱 합주·합창적 팝", "soul ensemble, acoustic collaboration, and choral pop"),
    sonic: l("여러 목소리, 주고받는 프레이즈, 포용적인 화음", "multiple voices, call-and-response phrases, and inclusive harmony"),
    cue: l("혼자 빛나기보다 함께 부를 여지를 남기는 곡", "tracks that leave room for participation rather than a single spotlight"),
  },
};

const accessoryCategories: Readonly<Record<AccessoryCategoryId, {
  label: Localized;
  tryOn: Localized;
}>> = {
  wearable_accent: {
    label: l("착용 포인트", "Wearable accent"),
    tryOn: l(
      "평소 옷 한 벌에 포인트 하나만 더해 30분 착용하고, 편안함과 손이 자주 가는지를 확인하세요.",
      "Add one accent to an ordinary outfit for 30 minutes, then check comfort and whether you naturally reach for it again.",
    ),
  },
  everyday_carry: {
    label: l("데일리 휴대품", "Everyday carry"),
    tryOn: l(
      "일주일 동안 가장 자주 쓰는 물건 하나에만 적용해 수납·무게·손질이 실제 생활에 맞는지 보세요.",
      "Apply the direction to one frequently used item for a week and test storage, weight, and care in real life.",
    ),
  },
  desk_home_accent: {
    label: l("책상·공간 포인트", "Desk and home accent"),
    tryOn: l(
      "작은 물건 하나를 작업·휴식 공간에 두고 집중이나 정돈에 실제 도움이 되는지 기록하세요.",
      "Place one small object in a work or rest area and record whether it genuinely supports focus or order.",
    ),
  },
};

const musicLanes: Readonly<Record<MusicLaneId, {
  label: Localized;
  use: Localized;
  check: Localized;
}>> = {
  focus_momentum: {
    label: l("집중·추진", "Focus and momentum"),
    use: l("시작을 미루는 짧은 업무나 운동 전 15–25분", "a 15–25 minute window before a delayed task or movement session"),
    check: l("이 방향이 실제로 시작 시간을 줄였나요, 아니면 주의를 더 빼앗았나요?", "Did this direction shorten the time to start, or did it compete for attention?"),
  },
  reset_regulation: {
    label: l("전환·회복", "Reset and regulation"),
    use: l("사람·업무 사이를 전환하거나 감각 자극을 낮추고 싶을 때", "between people or tasks, or when you want less sensory demand"),
    check: l("10분 뒤 몸의 긴장과 생각 속도가 어떻게 달라졌나요?", "After ten minutes, what changed in physical tension and thought speed?"),
  },
  exploration_social: {
    label: l("탐색·교류", "Exploration and social energy"),
    use: l("새 아이디어, 산책, 친구와의 공유 플레이리스트", "new ideas, walks, or a playlist shared with friends"),
    check: l("새로움이 호기심을 넓혔나요, 아니면 낯설기만 했나요?", "Did the novelty expand curiosity, or did it only feel unfamiliar?"),
  },
};

function theme(value: number): NumberTheme {
  const selected = themes[value];
  if (!selected) throw new TypeError(`Unsupported symbolic number: ${value}`);
  return selected;
}

function accessory(
  rank: 1 | 2 | 3,
  categoryId: AccessoryCategoryId,
  value: number,
  evidenceRef: LifestyleEvidenceRef,
  locale: Locale,
): AccessoryRecommendation {
  const selected = theme(value);
  const category = accessoryCategories[categoryId];
  const categoryLabel = text(category.label, locale);
  const label = text(selected.label, locale);
  return {
    rank,
    categoryId,
    categoryLabel,
    title: `${categoryLabel} · ${label}`,
    form: text(selected.form, locale),
    palette: text(selected.palette, locale),
    materialDirection: text(selected.material, locale),
    symbolicRationale: locale === "ko"
      ? `${evidenceRef.replace(":", " ")}의 전통적 상징을 ${label}이라는 시각·촉각 가설로 번역했습니다.`
      : `The traditional symbolism of ${evidenceRef.replace(":", " ")} is translated into the visual and tactile hypothesis “${label}.”`,
    tryOnCue: text(category.tryOn, locale),
    safetyAndCare: locale === "ko"
      ? "피부 민감도·니켈 함량·모서리와 잠금장치·무게·세척법·예산을 먼저 확인하세요."
      : "Check skin sensitivity, nickel content, edges and closures, weight, care instructions, and budget first.",
    shopState: "coming_later",
    shopAnchor: `#${categoryId}`,
    evidenceRefs: [evidenceRef],
  };
}

function music(
  rank: 1 | 2 | 3,
  laneId: MusicLaneId,
  value: number,
  evidenceRef: LifestyleEvidenceRef,
  locale: Locale,
): MusicRecommendation {
  const selected = theme(value);
  const lane = musicLanes[laneId];
  const laneLabel = text(lane.label, locale);
  const label = text(selected.label, locale);
  return {
    rank,
    laneId,
    laneLabel,
    title: `${laneLabel} · ${label}`,
    genreDirection: text(selected.genre, locale),
    sonicTraits: text(selected.sonic, locale),
    useContext: text(lane.use, locale),
    selectionCue: text(selected.cue, locale),
    realityCheck: text(lane.check, locale),
    evidenceRefs: [evidenceRef],
  };
}

export function createLifestyleRecommendations(
  profile: NumerologyProfile,
  locale: Locale,
): LifestyleRecommendations {
  const sources = [
    { value: profile.lifePath.value, ref: `lifePath:${profile.lifePath.value}` as const },
    { value: profile.attitude.value, ref: `attitude:${profile.attitude.value}` as const },
    { value: profile.personalYear.value, ref: `personalYear:${profile.personalYear.value}` as const },
  ] as const;

  return {
    locale,
    ruleVersion: LIFESTYLE_RULE_VERSION,
    sourceRuleVersion: profile.ruleVersion,
    accessories: accessoryCategoryIds.map((categoryId, index) =>
      accessory((index + 1) as 1 | 2 | 3, categoryId, sources[index].value, sources[index].ref, locale)),
    music: musicLaneIds.map((laneId, index) =>
      music((index + 1) as 1 | 2 | 3, laneId, sources[index].value, sources[index].ref, locale)),
    uncertainty: locale === "ko"
      ? "이 제안은 수비학 상징을 취향 실험으로 바꾼 것이며 실제 선호·문화·상황을 예측하지 않습니다. 맞지 않으면 버리는 것이 올바른 사용입니다."
      : "These suggestions translate numerology symbolism into taste experiments; they do not predict your actual preferences, culture, or circumstances. Discarding a poor fit is correct use.",
    accessorySafetyNote: locale === "ko"
      ? "액세서리는 행운·보호·치유·연애·재정 효과를 주지 않습니다. 재료 안전, 편안함, 예산, 공급자 정보와 반품 조건을 상징보다 우선하세요."
      : "Accessories do not provide luck, protection, healing, romantic, or financial effects. Prioritize material safety, comfort, budget, supplier information, and returns over symbolism.",
    musicSafetyNote: locale === "ko"
      ? "음악 방향은 치료나 기분·성과 통제가 아닙니다. 안전한 음량을 지키고 불편하거나 집중을 방해하면 즉시 바꾸세요."
      : "Music directions are not treatment or mood/performance control. Use safe volume and switch immediately if a direction feels uncomfortable or distracting.",
  };
}

export function createShopPreview(locale: Locale): ShopPreview {
  const descriptions: Readonly<Record<AccessoryCategoryId, Localized>> = {
    wearable_accent: l(
      "형태·색·재료를 실제 착용감과 함께 비교하는 작은 포인트",
      "Small accents evaluated through form, color, material, and real wear comfort",
    ),
    everyday_carry: l(
      "지갑·카드 홀더·키링·파우치처럼 반복 사용성과 관리가 중요한 휴대품",
      "Frequently used carry goods—such as wallets, card holders, key rings, and pouches—where function and care matter",
    ),
    desk_home_accent: l(
      "저널 커버·트레이·작은 오브제처럼 공간의 정돈과 사용성을 확인할 물건",
      "Journal covers, trays, and small objects tested for order, usability, and fit with a space",
    ),
  };
  const disclosure = locale === "ko"
    ? "상품·가격·재고·구매 기능은 아직 제공하지 않습니다."
    : "Products, prices, inventory, and purchasing are not available yet.";
  return {
    locale,
    launchState: "coming_later",
    categories: accessoryCategoryIds.map((id) => ({
      id,
      anchor: id,
      title: text(accessoryCategories[id].label, locale),
      description: text(descriptions[id], locale),
      disclosure,
      launchState: "coming_later",
    })),
    unavailableCapabilities: [
      "products",
      "prices",
      "inventory",
      "cart",
      "checkout",
      "affiliate_links",
    ],
  };
}
