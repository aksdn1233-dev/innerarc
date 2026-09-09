import { describe, expect, it } from "vitest";
import * as T from "three";
import { roomCameraFit, interiorCameraFit, wideRoomCameraFit } from "@/components/space/camera-fit";
import { SPACE_EXAMPLES, spaceExample } from "@/core/space/examples";
import { geometryIssues } from "@/core/space/engine";
describe("architectural framing and representative geometry", () => {
  for (const name of SPACE_EXAMPLES) it(`${name} fits desktop and portrait without cropping`, () => {
    const scene = spaceExample(name); expect(geometryIssues(scene)).toEqual([]);
    const { width: w, depth: d, height: h } = scene.room;
    for (const aspect of [.72, 1, 1.8]) for (const top of [false, true]) {
      const fit = roomCameraFit(scene.room, aspect, top), camera = new T.PerspectiveCamera(38, aspect, .05, 200);
      camera.position.copy(fit.position); camera.lookAt(fit.target); camera.updateMatrixWorld();
      for (const x of [-.2, w + .2]) for (const y of [0, h + .1]) for (const z of [-.2, d + .2]) {
        const p = new T.Vector3(x, y, z).project(camera);
        expect(Math.abs(p.x)).toBeLessThan(.99); expect(Math.abs(p.y)).toBeLessThan(.99);
      }
    }
  });
});

for (const name of ["small_bedroom", "living_room"] as const) it(`${name} interior keeps the entire furniture group visible on phones`, () => {
  for (const aspect of [.65, .72, 1.8]) {
    const fitted = interiorCameraFit(spaceExample(name), aspect), camera = new T.PerspectiveCamera(fitted.fov, aspect, .05, 200);
    camera.position.copy(fitted.position); camera.lookAt(fitted.target); camera.updateMatrixWorld();
    const b = fitted.bounds;
    for (const x of [b.left, b.right]) for (const y of [0, b.height]) for (const z of [b.back, b.front]) {
      const p = new T.Vector3(x, y, z).project(camera); expect(Math.abs(p.x)).toBeLessThan(.95); expect(Math.abs(p.y)).toBeLessThan(.95);
    }
    expect(camera.position.y).toBeGreaterThan(.18); expect(camera.position.x).toBeGreaterThan(0); expect(camera.position.x).toBeLessThan(spaceExample(name).room.width); expect(camera.position.z).toBeGreaterThan(0); expect(camera.position.z).toBeLessThan(spaceExample(name).room.depth);
  }
});

it("a bed moved to the far corner is reframed from another corner without clipping", () => {
  const scene = spaceExample("small_bedroom");
  scene.objects = [{ ...scene.objects[0], x: 3, z: 4, width: 1.8, depth: 1.8, height: 1.05 }];
  for (const aspect of [.65, 1.8]) {
    const fit = interiorCameraFit(scene, aspect), camera = new T.PerspectiveCamera(fit.fov, aspect, .05, 200);
    expect(fit.mode).toBe("interior"); camera.position.copy(fit.position); camera.lookAt(fit.target); camera.updateMatrixWorld();
    for (const x of [2.1, 3.9]) for (const y of [0, 1.05]) for (const z of [3.1, 4.9]) {
      const p = new T.Vector3(x, y, z).project(camera); expect(Math.abs(p.x)).toBeLessThan(.95); expect(Math.abs(p.y)).toBeLessThan(.95); expect(p.z).toBeLessThan(1); expect(p.z).toBeGreaterThan(-1);
    }
  }
});
it("an impossible inside view explicitly falls back instead of using a clipped fisheye", () => {
  const scene = spaceExample("small_bedroom"); scene.room = { ...scene.room, width: 2, depth: 2 };
  scene.objects = [{ ...scene.objects[0], x: 1, z: 1, width: 1.8, depth: 1.8, height: 1.05 }];
  expect(interiorCameraFit(scene, .65).mode).toBe("overview_fallback");
});
it("a tall wardrobe between the corner and bed forces another unobstructed viewpoint", () => {
  const scene = spaceExample("small_bedroom"); scene.objects = [{ ...scene.objects[0], x: 1, z: 2 }, { ...scene.objects[0], id: "wardrobe", kind: "wardrobe", x: 2.6, z: 3.6, width: .9, depth: .6, height: 2.3 }];
  const fitted = interiorCameraFit(scene, 1.8), blocker = new T.Box3(new T.Vector3(2.15, 0, 3.3), new T.Vector3(3.05, 2.3, 3.9));
  const oldCorner = new T.Vector3(3.82, 1.45, 4.82);
  expect(new T.Ray(oldCorner, fitted.target.clone().sub(oldCorner).normalize()).intersectBox(blocker, new T.Vector3())).not.toBeNull();
  expect(fitted.mode).toBe("interior");
  expect(new T.Ray(fitted.position, fitted.target.clone().sub(fitted.position).normalize()).intersectBox(blocker, new T.Vector3())).toBeNull();
});

it("the small-bedroom subject camera chooses the room half opposite the desk", () => {
  const scene = spaceExample("small_bedroom"), fitted = interiorCameraFit(scene, 1.25);
  expect(fitted.mode).toBe("interior");
  const desk = scene.objects.find(object => object.kind === "desk")!;
  expect((fitted.position.x - scene.room.width / 2) * (desk.x - scene.room.width / 2)).toBeLessThan(0);
  expect(fitted.position.distanceTo(new T.Vector3(desk.x, fitted.position.y, desk.z))).toBeGreaterThan(2);
});

it("the combined living and dining room uses a lower wide composition without cropping", () => {
  const scene = spaceExample("living_kitchen"), fitted = wideRoomCameraFit(scene.room, 1.25), camera = new T.PerspectiveCamera(fitted.fov, 1.25, .05, 200);
  camera.position.copy(fitted.position); camera.lookAt(fitted.target); camera.updateMatrixWorld();
  for (const x of [0, scene.room.width]) for (const y of [0, scene.room.height]) for (const z of [0, scene.room.depth]) {
    const p = new T.Vector3(x, y, z).project(camera); expect(Math.abs(p.x)).toBeLessThan(.99); expect(Math.abs(p.y)).toBeLessThan(.99);
  }
  expect(fitted.position.y - fitted.target.y).toBeLessThan(Math.max(scene.room.width, scene.room.depth));
});
