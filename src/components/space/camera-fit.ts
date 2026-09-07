import type { Scene } from "@/core/space/schema";
import { footprint } from "@/core/space/geometry";
import { Box3, Ray, Vector3 } from "three";

/** Fit every architectural corner in both screen axes, including portrait screens. */
export function roomCameraFit(room: { width: number; depth: number; height: number }, aspect: number, top = false) {
  const { width: w, depth: d, height: h } = room;
  const target = new Vector3(w / 2, top ? 0 : h * .40, d / 2);
  const direction = (top ? new Vector3(0, 1, .0001) : aspect < 1 ? new Vector3(.35, 1.55, 1.65) : new Vector3(1.03, 1.06, 1.32)).normalize();
  const right = new Vector3().crossVectors(new Vector3(0, 1, 0), direction).normalize();
  const up = new Vector3().crossVectors(direction, right).normalize();
  const tanV = Math.tan(38 * Math.PI / 360), tanH = tanV * Math.max(.1, aspect);
  let distance = 1;
  for (const x of [-.22, w + .22]) for (const y of [0, h + .12]) for (const z of [-.22, d + .22]) {
    const point = new Vector3(x, y, z).sub(target), depth = point.dot(direction);
    distance = Math.max(distance, Math.abs(point.dot(right)) / tanH + depth, Math.abs(point.dot(up)) / tanV + depth);
  }
  return { target, position: direction.multiplyScalar(distance * 1.08).add(target) };
}

/** Choose an unobstructed room corner and prove the subject fits before offering an inside view. */
export function interiorCameraFit(scene: Scene, aspect: number) {
  const primary = scene.objects.find(o => o.kind === "bed" || o.kind === "sofa") ?? scene.objects[0];
  const related = primary.kind === "bed" ? ["bed", "nightstand"] : primary.kind === "sofa" ? (aspect < 1 ? ["sofa", "coffee_table"] : ["sofa", "coffee_table", "lounge_chair"]) : [primary.kind];
  const objects = scene.objects.filter(o => related.includes(o.kind));
  let left = Infinity, right = -Infinity, back = Infinity, front = -Infinity, height = 0;
  for (const object of objects) { const box = footprint(object); left = Math.min(left, box.left); right = Math.max(right, box.right); back = Math.min(back, box.top); front = Math.max(front, box.bottom); height = Math.max(height, object.height); }
  const bounds = { left, right, back, front, height };
  const target = new Vector3((left + right) / 2, height * .46, (back + front) / 2);
  const minimumFov = 42, eyeHeight = Math.min(scene.room.height - .2, 1.45);
  const facing = new Vector3(0, 0, 1).applyAxisAngle(new Vector3(0, 1, 0), -primary.rotation * Math.PI / 180);
  const candidates: { position: Vector3; fov: number; score: number }[] = [];
  for (const x of [scene.room.width - .18, .18]) for (const z of [scene.room.depth - .18, .18]) {
    const position = new Vector3(x, eyeHeight, z);
    if (scene.objects.some(object => { const box = footprint(object); return object.height > eyeHeight - .1 && x > box.left - .12 && x < box.right + .12 && z > box.top - .12 && z < box.bottom + .12; })) continue;
    const sight = new Ray(position, target.clone().sub(position).normalize());
    const obscured = scene.objects.filter(object => !objects.includes(object) && object.kind !== "rug").some(object => {
      const box = footprint(object), hit = sight.intersectBox(new Box3(new Vector3(box.left, 0, box.top), new Vector3(box.right, object.height, box.bottom)), new Vector3());
      return hit !== null && hit.distanceTo(position) < position.distanceTo(target);
    });
    if (obscured) continue;
    const direction = position.clone().sub(target).normalize(), viewRight = new Vector3().crossVectors(new Vector3(0, 1, 0), direction).normalize(), viewUp = new Vector3().crossVectors(direction, viewRight).normalize(), distance = position.distanceTo(target);
    let requiredTan = Math.tan(minimumFov * Math.PI / 360), valid = true;
    for (const bx of [left, right]) for (const by of [0, height]) for (const bz of [back, front]) {
      const p = new Vector3(bx, by, bz).sub(target), depth = distance - p.dot(direction);
      if (depth <= .1) { valid = false; continue; }
      requiredTan = Math.max(requiredTan, Math.abs(p.dot(viewRight)) / (depth * Math.max(.1, aspect)) * 1.1, Math.abs(p.dot(viewUp)) / depth * 1.1);
    }
    const fov = Math.atan(requiredTan) * 360 / Math.PI;
    // A fisheye lens is not an acceptable way to conceal an impossible interior view.
    if (valid && fov <= 100) candidates.push({ position, fov, score: fov + (1 - direction.dot(facing)) * 18 });
  }
  candidates.sort((a, b) => a.score - b.score);
  const best = candidates[0];
  if (best) return { target, position: best.position, fov: best.fov, bounds, mode: "interior" as const };
  return { ...roomCameraFit(scene.room, aspect), fov: 38, bounds, mode: "overview_fallback" as const };
}
