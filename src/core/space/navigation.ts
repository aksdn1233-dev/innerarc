import type { Scene, SpatialObject } from "./schema";
import { footprint, overlaps, doorClearance, isObstacle, solidPair } from "./geometry";

// Bounded conservative walking approximation, not building-code certification.
// 60cm person width; <=128 cells per axis, 10cm cells in ordinary bedrooms.
export function spatialAccessIssues(scene: Scene): string[] {
  const radius = .3, step = Math.max(.1, Math.max(scene.room.width, scene.room.depth) / 128);
  const nx = Math.floor(scene.room.width / step), nz = Math.floor(scene.room.depth / step), count = nx * nz;
  const free = new Uint8Array(count), reached = new Uint8Array(count), queue = new Int32Array(count);
  const boxes = scene.objects.filter(isObstacle).map(footprint);
  for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) {
    const px = (x + .5) * step, pz = (z + .5) * step;
    if (px < radius || pz < radius || px > scene.room.width - radius || pz > scene.room.depth - radius) continue;
    if (!boxes.some(b => px > b.left - radius && px < b.right + radius && pz > b.top - radius && pz < b.bottom + radius)) free[z * nx + x] = 1;
  }
  const index = (x: number, z: number) => { const ix = Math.floor(x / step), iz = Math.floor(z / step); return ix < 0 || iz < 0 || ix >= nx || iz >= nz ? -1 : iz * nx + ix; };
  const doors = scene.doors.map(door => { const b = doorClearance(scene, door); return { id: door.id, index: index((b.left + b.right) / 2, (b.top + b.bottom) / 2) }; });
  const start = doors.find(door => door.index >= 0 && free[door.index]); let head = 0, tail = 0;
  if (start) { queue[tail++] = start.index; reached[start.index] = 1; }
  while (head < tail) {
    const at = queue[head++], x = at % nx, z = Math.floor(at / nx);
    for (const next of [x > 0 ? at - 1 : -1, x + 1 < nx ? at + 1 : -1, z > 0 ? at - nx : -1, z + 1 < nz ? at + nx : -1]) if (next >= 0 && free[next] && !reached[next]) { reached[next] = 1; queue[tail++] = next; }
  }
  const issues = doors.filter(door => door.index < 0 || !reached[door.index]).map(door => `DOOR_ROUTE:${door.id}`);
  for (const object of scene.objects) {
    if (["plant", "rug", "lighting"].includes(object.kind)) continue;
    const b = footprint(object), gap = radius + step;
    const candidates = [[object.x, b.bottom + gap], [b.left - gap, object.z], [object.x, b.top - gap], [b.right + gap, object.z]];
    const approaches = object.kind === "bed" ? candidates : [candidates[object.rotation / 90]];
    if (!approaches.some(([x, z]) => { const i = index(x, z); return i >= 0 && reached[i]; })) issues.push(`FURNITURE_ROUTE:${object.id}`);
  }
  for (const window of scene.windows) {
    const isHorizontal = window.wall === "top" || window.wall === "bottom";
    const strip = isHorizontal ? { left: window.offset, right: window.offset + window.width, top: window.wall === "top" ? 0 : scene.room.depth - .3, bottom: window.wall === "top" ? .3 : scene.room.depth } : { left: window.wall === "left" ? 0 : scene.room.width - .3, right: window.wall === "left" ? .3 : scene.room.width, top: window.offset, bottom: window.offset + window.width };
    const obstruction = scene.objects.some(o => isObstacle(o) && overlaps(footprint(o), strip) && o.height > (window.sill ?? .85));
    if (obstruction) issues.push(`${window.sill === undefined ? "MEASURE_WINDOW" : "WINDOW_OBSTRUCTED"}:${window.id}`);
  }
  return issues;
}

/** Exact swept AABB test for a translation; conservative continuous animation validation. */
export function clearTranslation(scene: Scene, object: SpatialObject, x: number, z: number): boolean {
  const box = footprint(object), halfX = (box.right - box.left) / 2, halfZ = (box.bottom - box.top) / 2;
  const dx = x - object.x, dz = z - object.z;
  for (const other of scene.objects) {
    if (other.id === object.id || !solidPair(object, other)) continue;
    const b = footprint(other); const min = [b.left - halfX - .01, b.top - halfZ - .01], max = [b.right + halfX + .01, b.bottom + halfZ + .01];
    let enter = 0, exit = 1;
    for (let axis = 0; axis < 2; axis++) {
      const origin = axis ? object.z : object.x, delta = axis ? dz : dx;
      if (Math.abs(delta) < 1e-9) { if (origin <= min[axis] || origin >= max[axis]) { enter = 2; break; } }
      else { const a = (min[axis] - origin) / delta, c = (max[axis] - origin) / delta; enter = Math.max(enter, Math.min(a, c)); exit = Math.min(exit, Math.max(a, c)); }
    }
    if (enter < exit && exit > 0 && enter < 1) return false;
  }
  return true;
}
