import type { Scene, SpatialObject } from "./schema";

export type SpatialChange = {
  objectId: string;
  kind: SpatialObject["kind"];
  from: Pick<SpatialObject, "x" | "z" | "rotation">;
  to: Pick<SpatialObject, "x" | "z" | "rotation">;
  distance: number;
  rotationDelta: number;
};

/** Exact scene differences used by both the text summary and 3D comparison guides. */
export function spatialChanges(current: Scene, recommended: Scene): SpatialChange[] {
  const next = new Map(recommended.objects.map((object) => [object.id, object]));
  return current.objects.flatMap((object) => {
    const target = next.get(object.id);
    if (!target) return [];
    const distance = Math.round(Math.hypot(target.x - object.x, target.z - object.z) * 1_000_000) / 1_000_000;
    const rotationDelta = (target.rotation - object.rotation + 360) % 360;
    if (distance <= 0.001 && rotationDelta === 0) return [];
    return [{
      objectId: object.id,
      kind: object.kind,
      from: { x: object.x, z: object.z, rotation: object.rotation },
      to: { x: target.x, z: target.z, rotation: target.rotation },
      distance,
      rotationDelta,
    }];
  });
}
