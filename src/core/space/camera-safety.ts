import type { Scene } from "./schema";
import { footprint } from "./geometry";

export type CameraPoint = { x: number; y: number; z: number };

/** Keep an interior camera inside the verified room shell and out of furniture. */
export function safeInteriorCamera(scene: Scene, requested: CameraPoint, previous: CameraPoint): CameraPoint {
  const margin = Math.min(.2, Math.max(.08, Math.min(scene.room.width, scene.room.depth) * .04));
  const point = {
    x: Math.max(margin, Math.min(scene.room.width - margin, requested.x)),
    y: Math.max(.65, Math.min(scene.room.height - .12, requested.y)),
    z: Math.max(margin, Math.min(scene.room.depth - margin, requested.z)),
  };
  const blocked = scene.objects.some(object => {
    if (object.kind === "rug" || object.height < point.y - .12) return false;
    const box = footprint(object);
    return point.x > box.left - .12 && point.x < box.right + .12 && point.z > box.top - .12 && point.z < box.bottom + .12;
  });
  if (!blocked) return point;
  const fallback = {
    x: Math.max(margin, Math.min(scene.room.width - margin, previous.x)),
    y: Math.max(.65, Math.min(scene.room.height - .12, previous.y)),
    z: Math.max(margin, Math.min(scene.room.depth - margin, previous.z)),
  };
  return fallback;
}
