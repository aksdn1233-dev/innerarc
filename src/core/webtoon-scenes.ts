import manifestJson from "@/data/gyeol-webtoon-manifest.json";
import type { NumerologyGuideId } from "@/core/numerology-guides";
import { withParticle } from "@/core/korean-particles";

export const WEBTOON_SCENE_VERSION = "gyeol-webtoon-scenes-1.0.0";
export const WEBTOON_ASSET_ROOT = "/assets/gyeol-webtoon";

type ManifestAsset = Readonly<{ file: string; pose: string; expression: string }>;
type ManifestCharacter = Readonly<{
  nameKo: string;
  role: string;
  theme: readonly string[];
  props: readonly string[];
  slug: NumerologyGuideId;
  assets: readonly ManifestAsset[];
}>;
type Manifest = Readonly<{
  version: number;
  characters: Record<NumerologyGuideId, ManifestCharacter>;
  shared: { propsEffects: readonly string[]; backgrounds: readonly string[] };
}>;

const manifest = manifestJson as Manifest;

export type WebtoonSectionType =
  | "summary"
  | "numbers"
  | "relationship"
  | "decision"
  | "warning"
  | "balance"
  | "encouragement";

export type WebtoonEmotion =
  | "neutral"
  | "calm"
  | "focused"
  | "serious"
  | "gentle"
  | "hopeful";

export type WebtoonSceneInput = Readonly<{
  seed: string;
  theme?: string;
  sectionType?: WebtoonSectionType;
  emotion?: WebtoonEmotion;
  emphasis?: "low" | "medium" | "high";
}>;

export type WebtoonScene = Readonly<{
  version: typeof WEBTOON_SCENE_VERSION;
  character: NumerologyGuideId;
  characterNameKo: string;
  role: string;
  pose: string;
  expression: string;
  assetPath: string;
  propPath?: string;
  backgroundPath: string;
  effectPath?: string;
  altText: string;
  objectPosition: "center bottom";
}>;

const THEME_CHARACTER: Record<string, NumerologyGuideId> = {
  core: "taeryeong",
  "life-path": "taeryeong",
  integrated: "taeryeong",
  relationship: "yeonhui",
  compatibility: "yeonhui",
  emotion: "yeonhui",
  analysis: "sahyeon",
  pattern: "sahyeon",
  decision: "sahyeon",
  timing: "hwayeon",
  change: "hwayeon",
  warning: "hwayeon",
  balance: "yundo",
  healing: "yundo",
  stability: "yundo",
  intuition: "hoyeon",
  possibility: "hoyeon",
  encouragement: "hoyeon",
};

const SECTION_CHARACTER: Record<WebtoonSectionType, NumerologyGuideId> = {
  summary: "taeryeong",
  numbers: "sahyeon",
  relationship: "yeonhui",
  decision: "sahyeon",
  warning: "hwayeon",
  balance: "yundo",
  encouragement: "hoyeon",
};

const EMOTION_CHARACTER: Record<WebtoonEmotion, NumerologyGuideId> = {
  neutral: "taeryeong",
  calm: "taeryeong",
  focused: "sahyeon",
  serious: "hwayeon",
  gentle: "yundo",
  hopeful: "hoyeon",
};

const SCENE_DECOR: Record<NumerologyGuideId, { background: string; prop: string; effect: string }> = {
  taeryeong: { background: "black-gold-study_01.png", prop: "numerology-card_01.png", effect: "gold-sparkle_01.png" },
  yeonhui: { background: "wisteria-garden_01.png", prop: "relationship-knot_01.png", effect: "purple-empathy-petals_01.png" },
  sahyeon: { background: "parchment-calculation-room_01.png", prop: "chart-scroll_01.png", effect: "reveal-rays_01.png" },
  hwayeon: { background: "crimson-fate-chamber_01.png", prop: "butterfly-fan_01.png", effect: "red-warning-aura_01.png" },
  yundo: { background: "blue-healing-observatory_01.png", prop: "blue-crystal-sphere_01.png", effect: "blue-healing-glow_01.png" },
  hoyeon: { background: "amber-intuitive-studio_01.png", prop: "sun-compass_01.png", effect: "closing-light-particles_01.png" },
};

const POSE_PREFERENCE: Record<NonNullable<WebtoonSceneInput["emphasis"]>, readonly string[]> = {
  low: ["smile", "comfort", "ponder", "explain", "three-quarter"],
  medium: ["explain", "analyze", "read-chart", "assure", "result-card"],
  high: ["emphasize", "warning", "result-reveal", "judge", "cheer"],
};

function stableHash(value: string): number {
  let hash = 2_166_136_261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function chooseCharacter(input: WebtoonSceneInput): NumerologyGuideId {
  if (input.theme && THEME_CHARACTER[input.theme]) return THEME_CHARACTER[input.theme];
  if (input.sectionType) return SECTION_CHARACTER[input.sectionType];
  if (input.emotion) return EMOTION_CHARACTER[input.emotion];
  return "taeryeong";
}

function orderedCandidates(character: ManifestCharacter, input: WebtoonSceneInput): ManifestAsset[] {
  const preferred = POSE_PREFERENCE[input.emphasis ?? "medium"];
  const ranked = [...character.assets].sort((left, right) => {
    const leftRank = preferred.indexOf(left.pose);
    const rightRank = preferred.indexOf(right.pose);
    return (leftRank < 0 ? 99 : leftRank) - (rightRank < 0 ? 99 : rightRank);
  });
  const preferredOnly = ranked.filter((asset) => preferred.includes(asset.pose));
  return preferredOnly.length > 0 ? preferredOnly : ranked;
}

export function selectWebtoonScene(
  input: WebtoonSceneInput,
  recent: readonly WebtoonScene[] = [],
): WebtoonScene {
  const characterId = chooseCharacter(input);
  const character = manifest.characters[characterId];
  const candidates = orderedCandidates(character, input);
  const recentKeys = new Set(recent.slice(-2).map((scene) => `${scene.character}:${scene.pose}:${scene.expression}`));
  const available = candidates.filter((asset) => !recentKeys.has(`${characterId}:${asset.pose}:${asset.expression}`));
  const pool = available.length > 0 ? available : candidates;
  const asset = pool[stableHash(`${input.seed}:${input.theme ?? ""}:${input.sectionType ?? ""}:${input.emotion ?? ""}`) % pool.length];
  const decor = SCENE_DECOR[characterId];

  return {
    version: WEBTOON_SCENE_VERSION,
    character: characterId,
    characterNameKo: character.nameKo,
    role: character.role,
    pose: asset.pose,
    expression: asset.expression,
    assetPath: `${WEBTOON_ASSET_ROOT}/characters/${characterId}/${asset.file}`,
    propPath: `${WEBTOON_ASSET_ROOT}/shared/props-effects/${decor.prop}`,
    backgroundPath: `${WEBTOON_ASSET_ROOT}/shared/backgrounds/${decor.background}`,
    effectPath: `${WEBTOON_ASSET_ROOT}/shared/props-effects/${decor.effect}`,
    altText: `${withParticle(character.nameKo, "subject")} 생년월일 패턴 결과를 설명하는 모습`,
    objectPosition: "center bottom",
  };
}

export function selectWebtoonSequence(inputs: readonly WebtoonSceneInput[]): WebtoonScene[] {
  const selected: WebtoonScene[] = [];
  for (const input of inputs) selected.push(selectWebtoonScene(input, selected));
  return selected;
}

export function getWebtoonManifest(): Manifest {
  return manifest;
}
