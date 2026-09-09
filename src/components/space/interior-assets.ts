import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { supplementaryFurniture } from "./supplementary-assets";
import type { Scene, SpatialObject, Opening } from "@/core/space/schema";

// Project-owned procedural assets; licensed GLB classes are provided by asset-library.
// All furniture occupies a unit box, floor contact y=0. Dimensions are applied once.
export function interiorMaterials(anisotropy: number) {
  const textures: T.Texture[] = [];
  function surface(kind: "oak" | "linen" | "plaster" | "floor" | "marble") {
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = kind === "floor" ? 1024 : 512;
    const ctx = canvas.getContext("2d")!; const n = canvas.width;
    let seed = 319; const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    ctx.fillStyle = kind === "oak" || kind === "floor" ? "#b5a18a" : "#e3dfd4"; ctx.fillRect(0, 0, n, n);
    if (kind === "oak" || kind === "floor") {
      for (let y = 0; y < n; y++) {
        ctx.strokeStyle = `rgba(${random() > .4 ? "68,58,45" : "242,234,215"},${.015 + random() * .07})`;
        ctx.beginPath(); for (let x = 0; x <= n; x += 12) { const py = y + Math.sin(x / 75 + y / 51) * 2.5; if (!x) ctx.moveTo(x, py); else ctx.lineTo(x, py); } ctx.stroke();
      }
      if (kind === "floor") for (let row = 0; row < 12; row++) {
        const y = row * n / 12; ctx.fillStyle = "rgba(62,52,38,.27)"; ctx.fillRect(0, y, n, 1.5);
        const x = ((row % 3) * .31 + .12) * n; ctx.fillRect(x, y, 1.5, n / 12);
        ctx.fillStyle = `rgba(248,242,229,${random() * .14})`; ctx.fillRect(0, y + 2, n, n / 12 - 2);
      }
    } else {
      for (let i = 0; i < n * 25; i++) { ctx.fillStyle = `rgba(65,52,37,${random() * .09})`; ctx.fillRect(random() * n, random() * n, kind === "linen" ? 1 : 2, kind === "linen" ? 3 : 2); }
      if (kind === "linen") { ctx.fillStyle = "rgba(255,255,255,.3)"; for (let x = 0; x < n; x += 3) ctx.fillRect(x, 0, 1, n); }
    }
    if (kind === "marble") {
      ctx.fillStyle = "#eeeae0"; ctx.fillRect(0, 0, n, n);
      for (let vein = 0; vein < 7; vein++) {
        const start = (vein / 5 - .2) * n;
        for (const width of [9, 3, .8]) {
          ctx.strokeStyle = `rgba(115,111,101,${width === 9 ? .025 : width === 3 ? .08 : .18})`; ctx.lineWidth = width;
          ctx.beginPath(); ctx.moveTo(start, -10); ctx.bezierCurveTo(start + n * .13, n * .27, start - n * .2, n * .38, start + n * .12, n * .58); ctx.bezierCurveTo(start + n * .22, n * .75, start + n * .05, n * .84, start + n * .32, n + 10); ctx.stroke();
        }
      }
    }
    const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace; texture.wrapS = texture.wrapT = T.RepeatWrapping; texture.anisotropy = Math.min(anisotropy, 8); texture.minFilter = T.LinearMipmapLinearFilter; textures.push(texture); return texture;
  }
  const oak = surface("oak"), linen = surface("linen"), plaster = surface("plaster"), floor = surface("floor"), marble = surface("marble");
  const daylightCanvas = document.createElement("canvas"); daylightCanvas.width = 256; daylightCanvas.height = 512;
  const daylightContext = daylightCanvas.getContext("2d")!; const daylight = daylightContext.createLinearGradient(0, 0, 0, 512);
  daylight.addColorStop(0, "#b9ced8"); daylight.addColorStop(.58, "#d8e1e1"); daylight.addColorStop(1, "#e8dfcf"); daylightContext.fillStyle = daylight; daylightContext.fillRect(0, 0, 256, 512);
  const daylightTexture = new T.CanvasTexture(daylightCanvas); daylightTexture.colorSpace = T.SRGBColorSpace; daylightTexture.anisotropy = Math.min(anisotropy, 4); textures.push(daylightTexture);
  // Bump maps carry scalar data, never sRGB colour transforms.
  const bump = (texture: T.Texture) => { const copy = texture.clone(); copy.colorSpace = T.NoColorSpace; copy.needsUpdate = true; textures.push(copy); return copy; };
  const oakBump = bump(oak), linenBump = bump(linen), plasterBump = bump(plaster), floorBump = bump(floor), marbleRoughness = bump(marble);
  const materials = {
    oak: new T.MeshStandardMaterial({ color: 0xe0d0b4, map: oak, bumpMap: oakBump, bumpScale: .004, roughness: .48 }),
    walnut: new T.MeshStandardMaterial({ color: 0x594331, map: oak, bumpMap: oakBump, bumpScale: .003, roughness: .45 }),
    linen: new T.MeshPhysicalMaterial({ side: T.DoubleSide, sheen: .7, sheenRoughness: .8, sheenColor: new T.Color(0xf3eee3), color: 0xf8f4e8, map: linen, bumpMap: linenBump, bumpScale: .003, roughness: .96 }),
    sage: new T.MeshPhysicalMaterial({ side: T.DoubleSide, sheen: .5, sheenRoughness: .85, sheenColor: new T.Color(0xa7b0a1), color: 0x9aab95, map: linen, bumpMap: linenBump, bumpScale: .004, roughness: .95 }),
    sand: new T.MeshPhysicalMaterial({ sheen: .65, sheenRoughness: .85, sheenColor: new T.Color(0xd9c7ad), color: 0xc8b69e, map: linen, bumpMap: linenBump, bumpScale: .003, roughness: .92 }),
    wall: new T.MeshStandardMaterial({ color: 0xf7f3ea, map: plaster, bumpMap: plasterBump, bumpScale: .0035, roughness: .86 }),
    floor: new T.MeshStandardMaterial({ color: 0xf2e9d9, map: floor, roughness: .68, bumpMap: floorBump, bumpScale: .004 }),
    bronze: new T.MeshStandardMaterial({ color: 0x837052, metalness: .7, roughness: .33 }),
    dark: new T.MeshStandardMaterial({ color: 0x292e2c, metalness: .3, roughness: .48 }),
    ceramic: new T.MeshStandardMaterial({ color: 0xddd0b7, roughness: .65 }),
    leaf: new T.MeshStandardMaterial({ color: 0x426647, roughness: .8 }),
    stone: new T.MeshStandardMaterial({ color: 0xffffff, map: marble, roughnessMap: marbleRoughness, bumpMap: plasterBump, bumpScale: .0003, roughness: .32 }),
    screen: new T.MeshPhysicalMaterial({ color: 0x293638, emissive: 0x142024, emissiveIntensity: .14, metalness: .12, roughness: .18, clearcoat: .8, clearcoatRoughness: .08 }),
    lampshade: new T.MeshStandardMaterial({ color: 0xf1e5ce, map: linen, roughness: .9, side: T.DoubleSide }),
    bulb: new T.MeshStandardMaterial({ color: 0xffe6bd, emissive: 0xffc77d, emissiveIntensity: 1.8, roughness: .35 }),
    rug: new T.MeshStandardMaterial({ color: 0xcbc4b5, map: linen, bumpMap: linenBump, bumpScale: .002, roughness: 1 }),
    glass: new T.MeshPhysicalMaterial({ color: 0xd7e8eb, metalness: 0, roughness: .10, clearcoat: 1, clearcoatRoughness: .04, envMapIntensity: 1.8, transparent: true, opacity: .22, side: T.DoubleSide, depthWrite: false }),
    exterior: new T.MeshBasicMaterial({ color: 0xffffff, map: daylightTexture, toneMapped: false }),
  };
  return { ...materials, dispose() { Object.values(materials).forEach(m => m.dispose()); textures.forEach(t => t.dispose()); } };
}
export type InteriorMaterials = ReturnType<typeof interiorMaterials>;
function mesh(group: T.Group, geometry: T.BufferGeometry, material: T.Material, x: number, y: number, z: number) {
  const item = new T.Mesh(geometry, material); item.position.set(x, y, z); item.castShadow = item.receiveShadow = true; group.add(item); return item;
}
function block(g: T.Group, m: T.Material, w: number, h: number, d: number, x = 0, y = h / 2, z = 0, radius = .012) {
  return mesh(g, radius ? new RoundedBoxGeometry(w, h, d, 2, Math.min(radius, w / 3, h / 3, d / 3)) : new T.BoxGeometry(w, h, d), m, x, y, z);
}
// Two continuous fabric surfaces meet at a thin sewn edge, with a soft domed fill.
function cushion(g: T.Group, m: T.Material, w: number, h: number, d: number, x: number, y: number, z: number) {
  const result = new T.Group(); g.add(result); result.position.set(x, y, z);
  for (const sign of [1, -1]) {
    const geometry = new T.PlaneGeometry(2, 2, 40, 28), p = geometry.getAttribute("position");
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i), v = p.getY(i), fill = Math.pow(Math.max(0, (1 - u * u) * (1 - v * v)), .58);
      const fold = .012 * h * Math.sin(u * 29 + v * 13) * (1 - fill) * fill;
      p.setXYZ(i, u * w / 2 * (1 - .07 * Math.pow(Math.abs(v), 8)), sign * h * (.035 + .465 * fill) + fold, v * d / 2 * (1 - .07 * Math.pow(Math.abs(u), 8)));
    }
    geometry.computeVertexNormals(); const item = mesh(result, geometry, m, 0, 0, 0); item.userData.clothUv = { width: w, depth: d };
  }
  const edge: T.Vector3[] = [];
  for (let side = 0; side < 4; side++) for (let i = 0; i < 24; i++) {
    const t = -1 + i / 12, u = side === 0 ? t : side === 1 ? 1 : side === 2 ? -t : -1, v = side === 0 ? -1 : side === 1 ? t : side === 2 ? 1 : -t;
    edge.push(new T.Vector3(u * w / 2 * (1 - .07 * Math.pow(Math.abs(v), 8)), 0, v * d / 2 * (1 - .07 * Math.pow(Math.abs(u), 8))));
  }
  mesh(result, new T.TubeGeometry(new T.CatmullRomCurve3(edge, true), 96, h * .036, 4, true), m, 0, 0, 0);
  return result;
}
function cylinder(g: T.Group, m: T.Material, rt: number, rb: number, h: number, x: number, y: number, z: number) { return mesh(g, new T.CylinderGeometry(rt, rb, h, 16), m, x, y, z); }
function optimize(group: T.Group, object: SpatialObject, materials: InteriorMaterials) {
  group.updateMatrixWorld(true);
  const batches = new Map<T.Material, T.BufferGeometry[]>();
  group.traverse(item => { if (!(item instanceof T.Mesh)) return; const material = item.material as T.Material; const geometry = item.geometry.index ? item.geometry.toNonIndexed() : item.geometry.clone(); geometry.applyMatrix4(item.matrixWorld);
    const position = geometry.getAttribute("position"), normal = geometry.getAttribute("normal"), uv = geometry.getAttribute("uv");
    const fabric = [materials.linen, materials.sand, materials.sage, materials.rug, materials.lampshade].includes(material as T.MeshPhysicalMaterial), tile = fabric ? .4 : 1;
    const clothUv = item.userData.clothUv as { width: number; depth: number } | undefined;
    for (let i = 0; i < position.count; i++) { if (clothUv) { uv.setXY(i, uv.getX(i) * clothUv.width * object.width / tile, uv.getY(i) * clothUv.depth * object.depth / tile); continue; } const x = position.getX(i) * object.width, y = position.getY(i) * object.height, z = position.getZ(i) * object.depth, nx = Math.abs(normal.getX(i)), ny = Math.abs(normal.getY(i)), nz = Math.abs(normal.getZ(i)); if (ny >= nx && ny >= nz) uv.setXY(i, x / tile, z / tile); else if (nx >= nz) uv.setXY(i, z / tile, y / tile); else uv.setXY(i, x / tile, y / tile); }
    const list = batches.get(material) ?? []; list.push(geometry); batches.set(material, list); item.geometry.dispose(); });
  group.clear();
  for (const [material, geometries] of batches) { const merged = mergeGeometries(geometries); geometries.forEach(g => g.dispose()); if (merged) mesh(group, merged, material, 0, 0, 0); }
  return group;
}
export function furnitureAsset(object: SpatialObject, m: InteriorMaterials) {
  const g = new T.Group();
  if (object.kind === "bed") {
    for (const x of [-.42, .42]) for (const z of [-.4, .4]) cylinder(g, m.walnut, .028, .022, .1, x, .05, z);
    block(g, m.oak, .98, .15, .98, 0, .17, 0, .03);
    block(g, m.sand, .94, .20, .89, 0, .335, .025, .055);
    // Upholstered twin panels with a narrow reveal and rounded timber surround.
    block(g, m.walnut, 1, .82, .065, 0, .59, -.4675, .025);
    for (const x of [-.241, .241]) block(g, m.sand, .475, .77, .10, x, .608, -.429, .047);
    const duvet = new T.PlaneGeometry(.98, .70, 48, 36), cloth = duvet.getAttribute("position");
    for (let i = 0; i < cloth.count; i++) {
      const x = cloth.getX(i), z = cloth.getY(i) + .14, edge = Math.max(0, (Math.abs(x) - .41) / .08), foot = Math.max(0, (z - .43) / .06);
      const fold = .004 * Math.sin(x * 19 + z * 9) * Math.cos(z * 15) + .002 * Math.sin(x * 43 - z * 27);
      cloth.setXYZ(i, x, .47 - .14 * edge * edge - .05 * foot * foot + fold, z);
    }
    duvet.computeVertexNormals(); const sheet = mesh(g, duvet, m.linen, 0, 0, 0); sheet.userData.clothUv = { width: .98, depth: .70 };

    // A top-only plane reads as paper-thin at an interior camera angle. These
    // stitched side and foot drops share the top's weave and follow restrained
    // gravity folds without changing the bed's authoritative dimensions.
    for (const sign of [-1, 1]) {
      const side = new T.PlaneGeometry(.70, .17, 36, 12), p = side.getAttribute("position");
      for (let i = 0; i < p.count; i++) {
        const z = p.getX(i) + .14, v = p.getY(i) + .5;
        const x = sign * (.475 + .008 * Math.sin(z * 31) * v);
        const y = .47 - v * .155 + .006 * Math.sin(z * 24 + sign) * Math.sin(v * Math.PI);
        p.setXYZ(i, x, y, z);
      }
      side.computeVertexNormals(); const panel = mesh(g, side, m.linen, 0, 0, 0); panel.userData.clothUv = { width: .70, depth: .17 };
    }
    const footDrop = new T.PlaneGeometry(.95, .16, 48, 12), footPositions = footDrop.getAttribute("position");
    for (let i = 0; i < footPositions.count; i++) {
      const x = footPositions.getX(i), v = footPositions.getY(i) + .5;
      footPositions.setXYZ(i, x, .465 - v * .145 + .005 * Math.sin(x * 27) * Math.sin(v * Math.PI), .487 + .008 * Math.cos(x * 18) * v);
    }
    footDrop.computeVertexNormals(); const footPanel = mesh(g, footDrop, m.linen, 0, 0, 0); footPanel.userData.clothUv = { width: .95, depth: .16 };
    const duvetHem = [
      ...Array.from({ length: 49 }, (_, i) => new T.Vector3(-.475 + i * .95 / 48, .32 + .005 * Math.sin(i * .7), .492)),
      ...Array.from({ length: 36 }, (_, i) => new T.Vector3(.483, .32 + .005 * Math.cos(i * .8), .49 - i * .70 / 35)),
    ];
    mesh(g, new T.TubeGeometry(new T.CatmullRomCurve3(duvetHem), 84, .0028, 5, false), m.linen, 0, 0, 0);

    for (const x of [-.225, .225]) {
      const pillow = cushion(g, m.linen, .43, .13, .29, x, .49 + (x > 0 ? .008 : 0), -.255 + (x > 0 ? .012 : 0)); pillow.rotation.set(.16, x > 0 ? -.045 : .035, 0);
    }
    // Continuous draped weave: no rigid ribs, with natural curved folds and a sewn hem.
    const throwGeometry = new T.PlaneGeometry(.98, .31, 64, 28), throwPositions = throwGeometry.getAttribute("position");
    const throwHeight = (x: number, z: number) => {
      const side = Math.max(0, (Math.abs(x) - .405) / .085);
      return .49 - .14 * side * side + .005 * Math.sin(x * 15 + z * 8) * Math.sin(z * 13 + .5) + .002 * Math.sin(x * 37 - z * 19);
    };
    for (let i = 0; i < throwPositions.count; i++) { const x = throwPositions.getX(i), z = throwPositions.getY(i) + .285; throwPositions.setXYZ(i, x, throwHeight(x, z), z); }
    throwGeometry.computeVertexNormals();
    const throwMesh = mesh(g, throwGeometry, m.sage, 0, 0, 0); throwMesh.userData.clothUv = { width: .98, depth: .31 };
    const hemPoints = Array.from({ length: 65 }, (_, i) => { const x = -.49 + i * .98 / 64, z = .438; return new T.Vector3(x, throwHeight(x, z) + .001, z); });
    mesh(g, new T.TubeGeometry(new T.CatmullRomCurve3(hemPoints), 64, .002, 4, false), m.sage, 0, 0, 0);
  } else if (object.kind === "desk") {
    block(g, m.oak, 1, .065, 1, 0, .925, 0, .028);
    for (const x of [-.435, .435]) for (const z of [-.40, .40]) { const leg = block(g, m.walnut, .055, .885, .075, x, .4425, z, .01); leg.rotation.z = 0; }
    block(g, m.walnut, .87, .085, .035, 0, .84, .38);
    block(g, m.oak, .31, .23, .73, .29, .76, 0, .013);
    for (let i = 0; i < 2; i++) { block(g, m.oak, .29, .098, .025, .29, .715 + i * .108, .38, .007); block(g, m.bronze, .09, .012, .035, .29, .725 + i * .108, .405, .005); }
    block(g, m.dark, .24, .014, .25, -.21, .964, -.02, .004);
    block(g, m.linen, .225, .012, .24, -.21, .978, -.02, .003);
    block(g, m.bronze, .008, .006, .18, -.04, .965, .13, .002);
  } else if (object.kind === "storage") {
    for (const x of [-.40, .40]) for (const z of [-.38, .38]) block(g, m.walnut, .055, .10, .055, x, .05, z);
    block(g, m.oak, 1, .88, 1, 0, .54, 0, .014);
    for (let i = 0; i < 3; i++) {
      block(g, m.oak, .318, .825, .035, -.333 + i * .333, .535, .472, .004);
      block(g, m.bronze, .016, .09, .025, -.22 + i * .333, .60, .486, .004);
    }
    block(g, m.walnut, .99, .018, .98, 0, .982, 0, .004);
  } else if (object.kind === "plant") {
    cylinder(g, m.ceramic, .24, .17, .30, 0, .15, 0);
    cylinder(g, m.walnut, .213, .213, .02, 0, .305, 0);
    for (let i = 0; i < 9; i++) {
      const angle = i * 2.39996, h = .42 + (i % 4) * .12;
      const tip = new T.Vector3(Math.sin(angle) * .29, h, Math.cos(angle) * .29);
      const stem = new T.CatmullRomCurve3([new T.Vector3(0, .30, 0), new T.Vector3(tip.x * .2, h * .83, tip.z * .2), tip]);
      mesh(g, new T.TubeGeometry(stem, 6, .006, 4, false), m.leaf, 0, 0, 0);
      const leaf = mesh(g, new T.SphereGeometry(1, 12, 8), m.leaf, tip.x, tip.y, tip.z); leaf.scale.set(.085, .18, .025); leaf.rotation.set(.4 * Math.sin(angle), -angle, .4 * Math.cos(angle));
    }
  }
  if (!["bed", "desk", "storage", "plant"].includes(object.kind)) supplementaryFurniture(g, object, m);
  optimize(g, object, m); g.name = object.id; g.userData.objectId = object.id;
  g.scale.set(object.width, object.height, object.depth); g.position.set(object.x, 0, object.z); g.rotation.y = -object.rotation * Math.PI / 180;
  return g;
}
function mergeWallParts(group: T.Group) {
  const batches = new Map<T.Material, T.BufferGeometry[]>();
  for (const child of group.children) if (child instanceof T.Mesh) {
    child.updateMatrix(); const geometry = child.geometry.index ? child.geometry.toNonIndexed() : child.geometry.clone(); geometry.applyMatrix4(child.matrix); child.geometry.dispose();
    const list = batches.get(child.material as T.Material) ?? []; list.push(geometry); batches.set(child.material as T.Material, list);
  }
  group.clear();
  for (const [material, parts] of batches) { const geometry = mergeGeometries(parts); parts.forEach(part => part.dispose()); if (geometry) { const item = mesh(group, geometry, material, 0, 0, 0); if (material.transparent) item.castShadow = false; } }
}
export function architecture(scene: Scene, m: InteriorMaterials) {
  const group = new T.Group(), walls = new Map<string, T.Group>();
  const { width: w, depth: d, height: h } = scene.room;
  block(group, m.floor, w, .15, d, w / 2, -.075, d / 2, .006); // top exactly0
  const ceiling = block(group, m.wall, w + .24, .10, d + .24, w / 2, h + .05, d / 2); ceiling.visible = false;
  function wallOpening(opening: Opening, isDoor: boolean) { return { ...opening, bottom: isDoor ? 0 : opening.sill ?? .85, top: Math.min(h, (isDoor ? 0 : opening.sill ?? .85) + (opening.height ?? (isDoor ? 2.1 : 1.2))) }; }
  for (const wall of scene.walls) {
    const horizontal = wall === "top" || wall === "bottom", length = horizontal ? w : d;
    const g = new T.Group(); walls.set(wall, g); group.add(g);
    // Wall frame has local x along the wall; z outside the clear interior dimensions.
    g.position.set(wall === "right" ? w + .06 : wall === "left" ? -.06 : 0, 0, wall === "bottom" ? d + .06 : wall === "top" ? -.06 : 0);
    if (!horizontal) g.rotation.y = -Math.PI / 2;
    const openings = [...scene.doors.filter(o => o.wall === wall).map(o => wallOpening(o, true)), ...scene.windows.filter(o => o.wall === wall).map(o => wallOpening(o, false))].sort((a, b) => a.offset - b.offset);
    // One continuous wall surface: real door notches and window holes, continuous UVs.
    const shape = new T.Shape(); shape.moveTo(0, 0);
    for (const o of openings.filter(o => o.bottom === 0)) { shape.lineTo(o.offset, 0); shape.lineTo(o.offset, o.top); shape.lineTo(o.offset + o.width, o.top); shape.lineTo(o.offset + o.width, 0); }
    shape.lineTo(length, 0); shape.lineTo(length, h); shape.lineTo(0, h); shape.closePath();
    for (const o of openings.filter(o => o.bottom > 0)) { const hole = new T.Path(); hole.moveTo(o.offset, o.bottom); hole.lineTo(o.offset, o.top); hole.lineTo(o.offset + o.width, o.top); hole.lineTo(o.offset + o.width, o.bottom); hole.closePath(); shape.holes.push(hole); }
    const shell = new T.ExtrudeGeometry(shape, { depth: .12, bevelEnabled: false }); shell.translate(0, 0, -.06); mesh(g, shell, m.wall, 0, 0, 0);
    for (const o of openings) {
      for (const x of [o.offset + .018, o.offset + o.width - .018]) block(g, m.oak, .035, o.top - o.bottom, .12, x, (o.bottom + o.top) / 2, 0, .004);
      block(g, m.oak, o.width, .035, .12, o.offset + o.width / 2, o.top - .0175, 0, .004);
      if (o.bottom > 0) {
        const inward = wall === "bottom" || wall === "left" ? -1 : 1;
        block(g, m.wall, o.width + .06, .045, .22, o.offset + o.width / 2, o.bottom + .0225, inward * .045, .005);
        // A recessed frame and clear reveal produce depth without inventing a sash
        // division that was not observed in the source room.
        for (const x of [o.offset + .05, o.offset + o.width - .05]) block(g, m.dark, .025, o.top - o.bottom - .06, .04, x, (o.bottom + o.top) / 2, -.025 * inward, .003);
        block(g, m.exterior, o.width - .09, o.top - o.bottom - .09, .006, o.offset + o.width / 2, (o.top + o.bottom) / 2, .035 * inward, 0);
        block(g, m.glass, o.width - .07, o.top - o.bottom - .07, .008, o.offset + o.width / 2, (o.top + o.bottom) / 2, 0, 0);
        // Curtains are a presentation treatment, not an inferred spatial object.
        // Their soft folds make the verified opening read at human scale while
        // staying outside collision and recommendation calculations.
        const curtainZ = inward * .13, curtainTop = Math.min(h - .08, o.top + .18);
        cylinder(g, m.bronze, .012, .012, o.width + .38, o.offset + o.width / 2, curtainTop, curtainZ).rotation.z = Math.PI / 2;
        for (const side of [-1, 1]) {
          const panelWidth = Math.min(.46, o.width * .28), panelHeight = curtainTop - .12;
          const geometry = new T.PlaneGeometry(panelWidth, panelHeight, 14, 28), positions = geometry.getAttribute("position");
          for (let i = 0; i < positions.count; i++) {
            const localX = positions.getX(i), localY = positions.getY(i), u = localX / panelWidth + .5;
            const gather = .014 * Math.sin(u * Math.PI * 8) + .006 * Math.sin(u * Math.PI * 15);
            positions.setXYZ(i, localX, localY, gather * inward);
          }
          geometry.computeVertexNormals();
          const panel = mesh(g, geometry, m.linen, o.offset + o.width / 2 + side * (o.width / 2 + .04), panelHeight / 2, curtainZ);
          panel.userData.clothUv = { width: panelWidth, depth: panelHeight };
        }
      } else {
        // A closed reference door sits in the opening plane; swing is not inferred.
        block(g, m.oak, o.width - .06, o.top - .04, .036, o.offset + o.width / 2, (o.top - .04) / 2, wall === "bottom" || wall === "left" ? -.03 : .03, .006);
      }
      if (o.bottom === 0) {
        // Threshold stays visible when its parent wall is cut away. No swing is invented.
        g.updateMatrixWorld(true);
        const at = g.localToWorld(new T.Vector3(o.offset + o.width / 2, .008, 0));
        const threshold = block(group, m.bronze, o.width, .016, .16, at.x, at.y, at.z, .002);
        threshold.rotation.y = g.rotation.y; threshold.userData.openingId = o.id;
      }
    }
    // Baseboard split around door openings.
    const doors = scene.doors.filter(o => o.wall === wall).sort((a, b) => a.offset - b.offset); let start = 0;
    for (const door of [...doors, { offset: length, width: 0 }]) { if (door.offset > start) block(g, m.oak, door.offset - start, .07, .035, (start + door.offset) / 2, .035, (wall === "bottom" || wall === "left" ? -1 : 1) * .068, .003); start = door.offset + door.width; }
    // A shallow ceiling reveal gives the room a real wall/ceiling junction while
    // remaining part of the same merged architectural draw batch.
    block(g, m.wall, length, .055, .055, length / 2, h - .055, (wall === "bottom" || wall === "left" ? -1 : 1) * .067, .004);
    mergeWallParts(g);
  }
  return { group, walls, ceiling };
}
export function disposeGeometry(group: T.Object3D) { group.traverse(item => { if (item instanceof T.Mesh || item instanceof T.Line) item.geometry.dispose(); }); }
