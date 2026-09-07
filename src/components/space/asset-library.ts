import { assetBytes } from "./asset-fetch";
import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { SpatialObject } from "@/core/space/schema";
import { furnitureAsset, disposeGeometry, type InteriorMaterials } from "./interior-assets";
const external = { plant: "/space/assets/indoor-plant.glb", sofa: "/space/assets/velvet-sofa.glb", lounge_chair: "/space/assets/upholstered-chair.glb" } as const;
export function createAssetLibrary(signal: AbortSignal) {
  const templates = new Map<string, T.Group>(), pending = new Map<string, Promise<void>>(); let disposed = false;
  function disposeTemplate(group: T.Group) {
    const materials = new Set<T.Material>(), textures = new Set<T.Texture>();
    group.traverse(child => { if (child instanceof T.Mesh) { child.geometry.dispose(); for (const material of Array.isArray(child.material) ? child.material : [child.material]) { materials.add(material); for (const value of Object.values(material)) if (value instanceof T.Texture) textures.add(value); } } });
    for (const texture of textures) { texture.dispose(); const bitmap = texture.image as { close?: () => void } | undefined; bitmap?.close?.(); } materials.forEach(m => m.dispose());
  }
  async function ensure(objects: SpatialObject[]) {
    await Promise.all([...new Set(objects.map(o => o.kind))].map(async kind => {
      const url = external[kind as keyof typeof external]; if (!url || templates.has(kind)) return;
      if (!pending.has(kind)) pending.set(kind, (async () => {
        const bytes = await assetBytes(url, signal, 8_000_000);
        const manager = new T.LoadingManager(); let textureFailed = false;
        manager.onError = url => { textureFailed = true; if (url.startsWith("blob:")) URL.revokeObjectURL(url); };
        const loader = new GLTFLoader(manager);
        // Embedded GLB images are image resources. ImageBitmapLoader fetch(blob:) violates
        // the existing connect-src policy; HTMLImageElement uses the allowed img-src path.
        // Keep the shared CSP unchanged and do not silently accept missing material maps.
        loader.register(parser => { parser.textureLoader = new T.TextureLoader(manager); return { name: "SPACE_CSP_IMAGE_LOADER" }; });
        const gltf = await loader.parseAsync(bytes, "/space/assets/");
        if (textureFailed) { disposeTemplate(gltf.scene); throw new Error("ASSET_TEXTURE_UNAVAILABLE"); }
        if (disposed || signal.aborted) { disposeTemplate(gltf.scene); throw new Error("ASSET_LOAD_CANCELLED"); }
        // Imported presentation lights/cameras must never alter the user's room.
        const remove: T.Object3D[] = [];
        gltf.scene.traverse(node => { if (node instanceof T.Light || node instanceof T.Camera) remove.push(node); }); remove.forEach(node => node.removeFromParent());
        templates.set(kind, gltf.scene);
      })().finally(() => pending.delete(kind)));
      await pending.get(kind);
    }));
  }
  return { ensure,
    make(object: SpatialObject, materials: InteriorMaterials) {
      if (!(object.kind in external)) return furnitureAsset(object, materials);
      const template = templates.get(object.kind); if (!template || disposed) throw new Error("REVIEWED_ASSET_NOT_READY");
      const model = template.clone(true), bounds = new T.Box3().setFromObject(model), size = bounds.getSize(new T.Vector3()), center = bounds.getCenter(new T.Vector3());
      model.traverse(node => { if (node instanceof T.Mesh) { node.geometry = node.geometry.clone(); node.castShadow = node.receiveShadow = true; } });
      model.position.set(-center.x, -bounds.min.y, -center.z);
      const unit = new T.Group(); unit.add(model); unit.scale.set(1 / size.x, 1 / size.y, 1 / size.z);
      const group = new T.Group(); group.add(unit); group.name = object.id; group.userData.objectId = object.id;
      group.scale.set(object.width, object.height, object.depth); group.position.set(object.x, 0, object.z); group.rotation.y = -object.rotation * Math.PI / 180;
      return group;
    },
    dispose() { if (disposed) return; disposed = true; for (const template of templates.values()) disposeTemplate(template); templates.clear(); },
    disposeInstance: disposeGeometry,
  };
}
