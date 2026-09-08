import { readFileSync } from "node:fs";
import { afterEach, expect, it, vi } from "vitest";
import * as T from "three";
import { createAssetLibrary } from "@/components/space/asset-library";
import { footprint } from "@/core/space/geometry";
import type { InteriorMaterials } from "@/components/space/interior-assets";
import type { SpatialObject } from "@/core/space/schema";
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
for (const kind of ["sofa", "lounge_chair", "plant"] as const) it(`the shipped ${kind} GLB keeps real bounds, floor contact and materials in four rotations`, async () => {
  const file = kind === "sofa" ? "velvet-sofa.glb" : kind === "plant" ? "indoor-plant.glb" : "upholstered-chair.glb";
  const bytes = readFileSync(`public/space/assets/${file}`);
  vi.stubGlobal("self", { URL });
  // Only image decoding is replaced in Node; the actual shipped mesh/transforms/materials are parsed.
  vi.spyOn(T.TextureLoader.prototype, "load").mockImplementation((_url, onLoad) => { const texture = new T.Texture<HTMLImageElement>(); queueMicrotask(() => onLoad?.(texture)); return texture; });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(bytes)));
  const library = createAssetLibrary(new AbortController().signal);
  const object: SpatialObject = { id: "fixture", kind, x: 3, z: 4, width: 2.1, depth: .9, height: 1, rotation: 0, movable: true, confidence: 1 };
  await library.ensure([object]);
  for (const rotation of [0,90,180,270] as const) {
    const rotated = { ...object, rotation }, model = library.make(rotated, {} as InteriorMaterials), bounds = new T.Box3().setFromObject(model), expected = footprint(rotated);
    expect(bounds.min.x).toBeCloseTo(expected.left, 4); expect(bounds.max.x).toBeCloseTo(expected.right, 4); expect(bounds.min.z).toBeCloseTo(expected.top, 4); expect(bounds.max.z).toBeCloseTo(expected.bottom, 4); expect(bounds.min.y).toBeCloseTo(0, 4); expect(bounds.max.y).toBeCloseTo(1, 4);
    let meshes = 0, mappedMaterials = 0; model.traverse(node => { expect(node).not.toBeInstanceOf(T.Light); expect(node).not.toBeInstanceOf(T.Camera); if (node instanceof T.Mesh) { meshes++; if (node.material.normalMap || node.material.roughnessMap || node.material.map) mappedMaterials++; expect(node.material).toBeInstanceOf(T.MeshStandardMaterial); expect(node.geometry.getAttribute("position").count).toBeGreaterThan(10); } }); expect(meshes).toBeGreaterThan(0); expect(mappedMaterials).toBeGreaterThan(0);
    library.disposeInstance(model);
  }
  library.dispose();
});
it("rejects missing material images and releases every failed embedded blob", async () => {
  const created = vi.spyOn(URL, "createObjectURL"), revoked = vi.spyOn(URL, "revokeObjectURL");
  vi.stubGlobal("self", { URL });
  vi.spyOn(T.TextureLoader.prototype, "load").mockImplementation(function (this: T.TextureLoader, _url, _onLoad, _onProgress, onError) {
    const texture = new T.Texture<HTMLImageElement>();
    queueMicrotask(() => { this.manager.itemError(_url); onError?.(new Error("synthetic image failure")); }); return texture;
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(readFileSync("public/space/assets/velvet-sofa.glb"))));
  const library = createAssetLibrary(new AbortController().signal);
  await expect(library.ensure([{ id: "sofa", kind: "sofa", x: 2, z: 2, width: 2, depth: 1, height: 1, rotation: 0, movable: true, confidence: 1 }])).rejects.toThrow("ASSET_TEXTURE_UNAVAILABLE");
  library.dispose();
  expect(created.mock.results.length).toBeGreaterThan(0);
  for (const result of created.mock.results) expect(revoked).toHaveBeenCalledWith(result.value);
});
