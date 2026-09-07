import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { InteriorMaterials } from "./interior-assets";
import type { SpatialObject } from "@/core/space/schema";
// Original joinery and furniture geometry, normalized to a one-metre bounding envelope.
export function supplementaryFurniture(g: T.Group, object: SpatialObject, m: InteriorMaterials) {
  function add(geometry: T.BufferGeometry, material: T.Material, x: number, y: number, z: number) { const item = new T.Mesh(geometry, material); item.position.set(x, y, z); g.add(item); return item; }
  function box(material: T.Material, w: number, h: number, d: number, x: number, y: number, z: number, r = .01) { return add(r ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 3, h / 3, d / 3)) : new T.BoxGeometry(w, h, d), material, x, y, z); }
  function tube(material: T.Material, points: number[][], radius: number) { return add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p as [number, number, number]))), 20, radius, 8, false), material, 0, 0, 0); }
  function cylinder(material: T.Material, top: number, bottom: number, h: number, x: number, y: number, z: number) { return add(new T.CylinderGeometry(top, bottom, h, 32), material, x, y, z); }
  const kind = object.kind;
  if (kind === "nightstand" || kind === "cabinet" || kind === "wardrobe" || kind === "bookshelf") {
    const tall = kind === "wardrobe" || kind === "bookshelf", base = tall ? .035 : .14;
    for (const x of [-.42, .42]) for (const z of [-.40, .40]) cylinder(m.walnut, .025, .019, base, x, base / 2, z);
    box(m.oak, 1, .035, 1, 0, .9825, 0); box(m.walnut, .96, .03, .94, 0, base + .015, 0);
    for (const x of [-.4775, .4775]) box(m.oak, .045, .95 - base, .98, x, (1 + base) / 2 - .025, 0);
    box(m.walnut, .96, .94 - base, .025, 0, (1 + base) / 2 - .025, -.4725);
    if (kind === "bookshelf") {
      for (let row = 1; row <= 4; row++) {
        const y = base + row * .18; box(m.oak, .92, .024, .92, 0, y, 0);
        for (let i = 0; i < 4; i++) {
          const height = .105 + ((i + row) % 3) * .018, x = -.35 + i * .145;
          box(i % 3 === 0 ? m.sage : i % 3 === 1 ? m.sand : m.linen, .075 + i * .004, height, .50, x, y + .013 + height / 2, -.10, .003);
        }
      }
    } else {
      const doors = kind === "nightstand" ? 1 : kind === "cabinet" ? 3 : 2;
      for (let i = 0; i < doors; i++) {
        const w = .92 / doors, x = -.46 + w * (i + .5);
        box(m.oak, w - .012, .93 - base, .03, x, (1 + base) / 2 - .025, .465, .003);
        // Recessed center panel and slim brass pulls break up the door plane.
        box(m.oak, w - .07, .81 - base, .011, x, (1 + base) / 2 - .025, .485, .003);
        box(m.bronze, .012, tall ? .12 : .045, .025, x + w * .27, .60, .48, .004);
      }
    }
  } else if (kind === "coffee_table" || kind === "dining_table") {
    const stone = kind === "coffee_table";
    if (stone) add(new T.LatheGeometry([new T.Vector2(0, .945), new T.Vector2(.48, .945), new T.Vector2(.497, .952), new T.Vector2(.5, .963), new T.Vector2(.5, .984), new T.Vector2(.495, .996), new T.Vector2(.48, 1), new T.Vector2(0, 1)], 64), m.stone, 0, 0, 0);
    else box(m.oak, 1, .055, 1, 0, .9725, 0, .08);
    if (stone) {
      for (const x of [-.31, .31]) { const leg = cylinder(m.walnut, .11, .14, .94, x, .47, 0); leg.scale.z = 1.7; }
    } else {
      for (const x of [-.40, .40]) for (const z of [-.35, .35]) box(m.walnut, .065, .945, .09, x, .4725, z, .02);
      for (const z of [-.34, .34]) box(m.oak, .80, .11, .035, 0, .86, z);
    }
  } else if (kind === "dining_chair" || kind === "office_chair") {
    const office = kind === "office_chair";
    box(m.sand, .78, .11, .74, 0, .50, .04, .055);
    const back = box(m.sand, .77, .44, .15, 0, .765, -.315, .065); back.rotation.x = -.10;
    if (office) {
      cylinder(m.bronze, .045, .055, .36, 0, .30, 0);
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5, x = Math.sin(a) * .38, z = Math.cos(a) * .38;
        tube(m.dark, [[0, .15, 0], [x * .65, .12, z * .65], [x, .075, z]], .022);
        const wheel = cylinder(m.dark, .043, .043, .06, x, .043, z); wheel.rotation.x = Math.PI / 2;
      }
      for (const x of [-.43, .43]) { tube(m.dark, [[x, .45, -.20], [x, .65, -.13], [x, .65, .22], [x, .48, .22]], .025); box(m.walnut, .08, .04, .40, x, .675, .03, .017); }
    } else {
      for (const x of [-.34, .34]) for (const z of [-.30, .30]) box(m.walnut, .06, .455, .065, x, .2275, z, .015);
      for (const x of [-.35, .35]) tube(m.walnut, [[x, .45, -.30], [x, .70, -.38], [x, .94, -.38]], .024);
    }
  } else if (kind === "tv") {
    box(m.dark, 1, .61, .045, 0, .69, -.10, .012);
    box(m.screen, .965, .568, .008, 0, .693, -.072, .005);
    cylinder(m.dark, .035, .045, .39, 0, .205, -.10);
    box(m.dark, .65, .035, .94, 0, .0175, 0, .015);
    box(m.bronze, .03, .008, .008, 0, .397, -.072, .003);
  } else if (kind === "lighting") {
    cylinder(m.bronze, .22, .26, .035, 0, .0175, 0);
    cylinder(m.bronze, .017, .022, .80, 0, .425, 0);
    const profile = [new T.Vector2(.49, .70), new T.Vector2(.48, .72), new T.Vector2(.27, .98), new T.Vector2(.26, 1)];
    add(new T.LatheGeometry(profile, 48), m.lampshade, 0, 0, 0);
    cylinder(m.lampshade, .255, .255, .012, 0, .994, 0);
    tube(m.bronze, [[-.3, .76, 0], [0, .80, 0], [.3, .76, 0]], .006);
  } else if (kind === "rug") {
    box(m.rug, .98, .96, .98, 0, .48, 0, .005);
    for (const z of [-.492, .492]) for (let i = 0; i < 74; i++) box(m.linen, .0028, .22, .016, -.47 + i * .0128, .20, z, 0);
    for (const z of [-.471, .471]) box(m.sand, .96, .025, .006, 0, .977, z, 0);
    for (const x of [-.471, .471]) box(m.sand, .006, .025, .96, x, .977, 0, 0);
  } else throw new Error(`MISSING_REVIEWED_ASSET:${kind}`);
}
