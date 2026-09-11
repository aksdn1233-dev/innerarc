import type { Scene, SpatialObject, Opening } from "./schema";
const EPS = 0.0001;
export function footprint(object: SpatialObject) {
  const swapped = object.rotation === 90 || object.rotation === 270;
  const w = swapped ? object.depth : object.width, d = swapped ? object.width : object.depth;
  return { left: object.x - w / 2, right: object.x + w / 2, top: object.z - d / 2, bottom: object.z + d / 2 };
}
type Box = ReturnType<typeof footprint>;
export function overlaps(a: Box, b: Box, gap = 0) {
  return a.left < b.right + gap - EPS && a.right > b.left - gap + EPS && a.top < b.bottom + gap - EPS && a.bottom > b.top - gap + EPS;
}
export function doorClearance(scene: Scene, opening: Opening): Box {
  const { offset: s, width: w, wall } = opening;
  const { width, depth } = scene.room;
  if (wall === "top") return { left: s, right: s + w, top: 0, bottom: Math.max(0.8, w) };
  if (wall === "bottom") return { left: s, right: s + w, top: depth - Math.max(0.8, w), bottom: depth };
  if (wall === "left") return { left: 0, right: Math.max(0.8, w), top: s, bottom: s + w };
  return { left: width - Math.max(0.8, w), right: width, top: s, bottom: s + w };
}

// Thin flexible floor coverings do not obstruct walking or furniture footprints.
// Rug-on-rug overlap is still rejected; rugs remain bounded and below 3 cm thick.
export const isObstacle = (object: SpatialObject) => object.kind !== "rug" && object.kind !== "ceiling_beam";
export const solidPair = (a: SpatialObject, b: SpatialObject) => a.kind === "rug" && b.kind === "rug" || isObstacle(a) && isObstacle(b);
