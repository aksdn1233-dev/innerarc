import { SceneSchema, estimatedMeasurements, type Scene } from "./schema";
import { geometryIssues } from "./engine";

export function calibrateScene(candidate: Scene, axis: "width" | "depth", metres: number): Scene {
  const scene = SceneSchema.parse(candidate);
  if (!Number.isFinite(metres) || metres < 2 || metres > 20) throw new Error("INVALID_REFERENCE_LENGTH");
  const base = scene.calibrationSource ?? { room: scene.room, objects: scene.objects, doors: scene.doors, windows: scene.windows };
  const measurements = structuredClone(scene.measurements ?? estimatedMeasurements("manual"));
  const factor = metres / base.room[axis], other = axis === "width" ? "depth" : "width";
  const next = structuredClone(scene); next.calibrationSource = structuredClone(base);
  next.room[axis] = metres;
  next.room[other] = measurements[other].status === "estimated" ? base.room[other] * factor : scene.room[other];
  const sx = next.room.width / base.room.width, sz = next.room.depth / base.room.depth;
  next.objects = base.objects.map(o => {
    const corrected = scene.objects.find(current => current.id === o.id);
    const dimensional = corrected?.dimensionSource === "user_corrected" || corrected?.dimensionSource === "confirmed";
    const rotated = o.rotation === 90 || o.rotation === 270;
    return { ...o, x: o.x * sx, z: o.z * sz, width: dimensional ? corrected.width : o.width * (rotated ? sz : sx), depth: dimensional ? corrected.depth : o.depth * (rotated ? sx : sz), height: corrected?.height ?? o.height, dimensionSource: corrected?.dimensionSource };
  });
  for (const key of ["doors", "windows"] as const) next[key] = base[key].map(o => { const scale = o.wall === "top" || o.wall === "bottom" ? sx : sz; return { ...o, offset: o.offset * scale, width: o.width * scale }; });
  measurements[axis] = { status: "user_corrected", confidence: 1 }; measurements.reference = { axis, metres };
  next.measurements = measurements; next.confirmed = false;
  if (geometryIssues(next).length) throw new Error("CALIBRATION_NEEDS_MANUAL_CORRECTION");
  return SceneSchema.parse(next);
}
