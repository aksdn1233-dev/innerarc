/**
 * 하랑 법사 — the character who hosts the home page and the 사주 funnel.
 *
 * Every picture here is a crop or resize of the owner-approved Canva originals kept
 * beside them in `public/characters/harang/` (base, hero, angle sheet, expression
 * sheet). No drawn or emoji stand-ins: if a cut is missing, it is made from these.
 */
const DIR = "/characters/harang";

export const HARANG_IMAGES = {
  hero: `${DIR}/hero-1680.webp`,
  heroSmall: `${DIR}/hero-960.webp`,
  heroMobile: `${DIR}/hero-mobile-640.webp`,
  base: `${DIR}/base-720.webp`,
  baseLarge: `${DIR}/base-1088.webp`,
  bust: `${DIR}/bust-640.webp`,
  face: `${DIR}/face-256.webp`,
  smile: `${DIR}/expr-smile-480.webp`,
  laugh: `${DIR}/expr-laugh-480.webp`,
  read: `${DIR}/expr-read-480.webp`,
  wink: `${DIR}/expr-wink-480.webp`,
  soft: `${DIR}/expr-soft-480.webp`,
  smirk: `${DIR}/expr-smirk-480.webp`,
  front: `${DIR}/angle-front-480.webp`,
  threeQuarter: `${DIR}/angle-three-quarter-480.webp`,
  side: `${DIR}/angle-side-480.webp`,
  sigh: `${DIR}/sigh-640.webp`,
  ahem: `${DIR}/ahem-640.webp`,
  loading: `${DIR}/loading-640.webp`,
  result: `${DIR}/result-720.webp`,
  fee: `${DIR}/fee-720.webp`,
} as const;

export const HARANG_NAME = { ko: "하랑 법사", en: "Harang" } as const;
export const SITE_NAME = { ko: "결 GYEOL", en: "GYEOL" } as const;

/** Screen lines fixed by the owner's voice guide (2026-10-16 handoff, §4). */
export const HARANG_LINES = {
  welcome: "어서 오세요. 오늘은 어떤 사람이 마음에 걸려서 오셨습니까.",
  birthDate: "태어난 날을 알려주시면, 제가 그날의 하늘부터 찾아보겠습니다.",
  freeIntro: "일단 가볍게 하나 짚어드리죠. 이건 본인도 눈치채고 계셨을 겁니다.",
  fee: "여기서부터는 복채가 필요합니다. 제 시간도 귀하고, 님의 이야기도 귀하니까요.",
  share: "이 얘기, 떠오르는 사람 있으시죠. 그분께도 한 번 보여주세요.",
  farewell: "오늘은 여기까지 하죠. 달이 아직 높으니, 다음엔 먼저 찾아오세요.",
} as const;
