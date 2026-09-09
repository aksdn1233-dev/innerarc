import { describe, expect, it } from "vitest";
import { safeInteriorCamera } from "@/core/space/camera-safety";
import { spaceExample } from "@/core/space/examples";

describe("interior camera safety", () => {
  it("clamps the camera to the room shell", () => {
    const scene = spaceExample("small_bedroom");
    expect(safeInteriorCamera(scene, { x: -2, y: -1, z: 12 }, { x: .2, y: 1.45, z: .2 })).toEqual({ x: .2, y: .65, z: scene.room.depth - .2 });
  });
  it("returns the last safe point instead of entering tall furniture", () => {
    const scene = spaceExample("small_bedroom"), bed = scene.objects.find(object => object.kind === "bed")!;
    expect(safeInteriorCamera(scene, { x: bed.x, y: .8, z: bed.z }, { x: .2, y: 1.45, z: .2 })).toEqual({ x: .2, y: 1.45, z: .2 });
  });
  it("may pass over a rug", () => {
    const scene = spaceExample("small_bedroom"), rug = scene.objects.find(object => object.kind === "rug")!;
    expect(safeInteriorCamera(scene, { x: rug.x, y: 1.45, z: rug.z }, { x: .2, y: 1.45, z: .2 })).toEqual({ x: rug.x, y: 1.45, z: rug.z });
  });
});
