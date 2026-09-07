import { assetBytes } from "./asset-fetch";
import * as T from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import type { InteriorMaterials } from "./interior-assets";
// Bundled CC0 textures: first-party requests only. No private images become textures.
export async function loadPbrSurfaces(materials: InteriorMaterials, renderer: T.WebGLRenderer, signal: AbortSignal) {
  const owned: T.Texture[] = []; let disposed = false;
  const dispose = () => { if (disposed) return; disposed = true; for (const texture of owned) { texture.dispose(); const bitmap = texture.image as { close?: () => void } | undefined; bitmap?.close?.(); } };
  const bytes = (path: string) => assetBytes(`/space/assets/${path}`, signal, 4_000_000);
  try {
    const [colorData, normalData, armData, veneerColor, veneerNormal, veneerArm, fabricNormal, fabricArm, hdrData] = await Promise.all([bytes("oak-floor-color.jpg"), bytes("oak-floor-normal.jpg"), bytes("oak-floor-arm.jpg"), bytes("veneer-color.jpg"), bytes("veneer-normal.jpg"), bytes("veneer-arm.jpg"), bytes("fabric-normal.jpg"), bytes("fabric-arm.jpg"), bytes("studio-environment.hdr")]);
    for (const data of [colorData, normalData, armData, veneerColor, veneerNormal, veneerArm, fabricNormal, fabricArm]) {
      const bitmap = await createImageBitmap(new Blob([data]), { imageOrientation: "flipY", premultiplyAlpha: "none", colorSpaceConversion: "none" });
      const texture = new T.Texture(bitmap); texture.needsUpdate = true; texture.flipY = false; texture.wrapS = texture.wrapT = T.RepeatWrapping; texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); owned.push(texture);
    }
    if (signal.aborted) throw new Error("MATERIAL_LOAD_CANCELLED");
    const [color, normal, arm, woodColor, woodNormal, woodArm, clothNormal, clothArm] = owned; color.colorSpace = T.SRGBColorSpace;
    materials.floor.color.setHex(0xffffff); materials.floor.map = color; materials.floor.bumpMap = null; materials.floor.normalMap = normal; materials.floor.normalScale.set(.45, .45); materials.floor.roughnessMap = arm; materials.floor.aoMap = arm; materials.floor.aoMapIntensity = .65; materials.floor.metalnessMap = arm; materials.floor.roughness = 1; materials.floor.metalness = 0; materials.floor.needsUpdate = true;
    woodColor.colorSpace = T.SRGBColorSpace;
    for (const material of [materials.oak, materials.walnut]) { material.map = woodColor; material.bumpMap = null; material.normalMap = woodNormal; material.normalScale.set(.25, .25); material.roughnessMap = woodArm; material.aoMap = woodArm; material.aoMapIntensity = .4; material.roughness = .9; material.needsUpdate = true; }
    clothNormal.repeat.set(1, 1); clothArm.repeat.set(1, 1);
    for (const material of [materials.linen, materials.sand, materials.sage, materials.rug, materials.lampshade]) { material.bumpMap = null; material.normalMap = clothNormal; material.normalScale.set(.28, .28); material.roughnessMap = clothArm; material.aoMap = clothArm; material.aoMapIntensity = .20; material.needsUpdate = true; }
    const hdr = new RGBELoader().parse(hdrData), source = new T.DataTexture(hdr.data, hdr.width, hdr.height, T.RGBAFormat, hdr.type); source.mapping = T.EquirectangularReflectionMapping; source.needsUpdate = true; owned.push(source);
    const pmrem = new T.PMREMGenerator(renderer); let environment: T.WebGLRenderTarget;
    try { environment = pmrem.fromEquirectangular(source); } finally { pmrem.dispose(); }
    return { environment, textureBytesEstimate: 8 * 1024 * 1024 * 4 * 4 / 3 + 1024 * 512 * 8, dispose() { dispose(); environment.dispose(); } };
  } catch (error) { dispose(); throw error; }
}
