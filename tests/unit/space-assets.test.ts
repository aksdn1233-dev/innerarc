import { describe, expect, it } from "vitest";
import * as T from "three";
import { furnitureAsset, architecture, disposeGeometry, type InteriorMaterials } from "@/components/space/interior-assets";
import { OBJECT_KINDS } from "@/core/space/catalog";
import { footprint } from "@/core/space/engine";
import { manualScene, type SpatialObject } from "@/core/space/schema";
const material = new T.MeshStandardMaterial();
const materials = Object.fromEntries(["oak", "walnut", "linen", "sage", "sand", "wall", "floor", "bronze", "dark", "ceramic", "leaf", "glass", "stone", "screen", "lampshade", "rug"].map(key => [key, material])) as unknown as InteriorMaterials;
describe("procedural furniture stays inside authoritative dimensions", () => {
  for (const kind of OBJECT_KINDS.filter(kind => kind !== "sofa" && kind !== "lounge_chair")) for (const rotation of [0, 90, 180, 270] as const) it(`${kind} at ${rotation}° has floor contact, bounded scale and merged draw calls`, () => {
    const object: SpatialObject = { id: "synthetic", kind, rotation, x: 3, z: 3, width: 1.7, depth: .9, height: kind === "rug" ? .015 : 1.2, confidence: 1, movable: true };
    const asset = furnitureAsset(object, materials), bounds = new T.Box3().setFromObject(asset), box = footprint(object);
    expect(bounds.min.y).toBeGreaterThanOrEqual(-.001); expect(bounds.min.y).toBeLessThan(.003); expect(bounds.max.y).toBeLessThanOrEqual(object.height + .001);
    expect(bounds.min.x).toBeGreaterThanOrEqual(box.left - .001); expect(bounds.max.x).toBeLessThanOrEqual(box.right + .001); expect(bounds.min.z).toBeGreaterThanOrEqual(box.top - .001); expect(bounds.max.z).toBeLessThanOrEqual(box.bottom + .001);
    expect(asset.children.length).toBeLessThanOrEqual(7); expect(asset.children[0]).toBeInstanceOf(T.Mesh); disposeGeometry(asset);
  });
});

it("cutaway keeps door thresholds, continuous opening walls and true floor contact", () => {
  const scene = manualScene(), room = architecture(scene, materials);
  const wall = room.walls.get("bottom")!; wall.visible = false;
  const thresholds = room.group.children.filter(child => child.userData.openingId);
  expect(thresholds).toHaveLength(1); expect(thresholds[0].visible).toBe(true);
  expect(thresholds[0].parent).toBe(room.group);
  for (const wall of room.walls.values()) {
    const surfaces = wall.children.filter(child => child instanceof T.Mesh);
    expect(surfaces.length).toBeLessThanOrEqual(4);
    expect((surfaces[0] as T.Mesh).geometry.getAttribute("position").array.every(Number.isFinite)).toBe(true);
  }
  disposeGeometry(room.group);
});

it("records the actual optimized procedural geometry budget", () => {
  const counts = Object.fromEntries(OBJECT_KINDS.filter(k => !["sofa", "lounge_chair"].includes(k)).map(kind => {
    const asset = furnitureAsset({ id: kind, kind, width: 1, depth: 1, height: 1, x: 0, z: 0, rotation: 0, confidence: 1, movable: true }, materials);
    let triangles = 0; asset.traverse(child => { if (child instanceof T.Mesh) triangles += (child.geometry.index?.count ?? child.geometry.getAttribute("position").count) / 3; });
    disposeGeometry(asset); return [kind, triangles];
  }));
  expect(counts).toMatchSnapshot();
});
