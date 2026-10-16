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
  welcome: "어서 오세요. 요즘 어떤 일이 가장 마음에 걸리세요?",
  birthDate: "태어난 날을 알려주세요. 그날의 사주부터 같이 볼게요.",
  freeIntro: "우선 익숙하게 느껴지는 부분부터 하나씩 살펴봐요.",
  fee: "여기부터는 유료 풀이예요. 더 보는 내용과 가격을 먼저 확인해 주세요.",
  share: "이야기를 나누고 싶은 사람이 있다면, 이 페이지를 알려주세요.",
  farewell: "오늘은 여기까지 볼게요. 다음 고민이 생기면 또 들러주세요.",
} as const;
