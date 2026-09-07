import { describe, expect, it } from "vitest";
import { spatialChanges } from "@/core/space/comparison";
import { spaceExample } from "@/core/space/examples";

describe("space comparison presentation", () => {
  it("reports only exact moved or rotated objects without changing scene data", () => {
    const current = spaceExample("small_bedroom");
    const recommended = structuredClone(current);
    recommended.objects = recommended.objects.map((object) => object.id === "bed_1"
      ? { ...object, x: object.x + 0.4, z: object.z - 0.3, rotation: 90 }
      : object);

    expect(spatialChanges(current, recommended)).toEqual([{
      objectId: "bed_1",
      kind: "bed",
      from: { x: 1, z: 2, rotation: 0 },
      to: { x: 1.4, z: 1.7, rotation: 90 },
      distance: 0.5,
      rotationDelta: 90,
    }]);
    expect(current.objects.find((object) => object.id === "bed_1")?.x).toBe(1);
  });

  it("ignores sub-millimetre display noise", () => {
    const current = spaceExample("small_bedroom");
    const recommended = structuredClone(current);
    recommended.objects[0] = { ...recommended.objects[0], x: recommended.objects[0].x + 0.0005 };
    expect(spatialChanges(current, recommended)).toEqual([]);
  });
});
