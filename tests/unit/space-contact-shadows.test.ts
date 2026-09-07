import { expect, it, vi } from "vitest";
import * as T from "three";
import { createContactShadows } from "@/components/space/contact-shadows";
import { spaceExample } from "@/core/space/examples";
function harness() {
  let target: unknown = "previous", alpha = 1, color = new T.Color(0xeeeeee);
  const renderer = { autoClear: false, getRenderTarget: () => target, setRenderTarget: vi.fn(value => { target = value; }), getClearColor: (value: T.Color) => value.copy(color), getClearAlpha: () => alpha, setClearColor: vi.fn((value: T.Color | number, a: number) => { color = new T.Color(value); alpha = a; }), render: vi.fn((_scene: T.Scene, _camera: T.Camera) => { void _scene; void _camera; }) };
  const scene = spaceExample("small_bedroom"), world = new T.Scene(), group = new T.Group(), geometry = new T.BoxGeometry(1, 1, 1), material = new T.MeshStandardMaterial(); group.add(new T.Mesh(geometry, material));
  const shadow = createContactShadows(renderer as unknown as T.WebGLRenderer, world, 64);
  shadow.update(scene, new Map([[scene.objects[0].id, { group }]]));
  return { renderer, world, group, geometry, material, shadow };
}
it("camera-only frames reuse contact lighting and disposal preserves source meshes", () => {
  const { renderer, world, geometry, material, shadow } = harness(), disposeGeometry = vi.spyOn(geometry, "dispose"), disposeMaterial = vi.spyOn(material, "dispose");
  shadow.render(); expect(renderer.render).toHaveBeenCalledTimes(3);
  for (let i = 0; i < 30; i++) shadow.render(); expect(renderer.render).toHaveBeenCalledTimes(3);
  shadow.render(); shadow.render(); expect(renderer.render).toHaveBeenCalledTimes(3);
  shadow.render(); expect(renderer.render).toHaveBeenCalledTimes(3);
  expect(renderer.getRenderTarget()).toBe("previous"); expect(renderer.autoClear).toBe(false); expect(renderer.getClearAlpha()).toBe(1);
  shadow.dispose(); shadow.dispose(); expect(world.children).toHaveLength(0); expect(disposeGeometry).not.toHaveBeenCalled(); expect(disposeMaterial).not.toHaveBeenCalled();
});
it("failed contact rendering restores the caller's framebuffer and clear state", () => {
  const { renderer, shadow } = harness(); renderer.render.mockImplementationOnce(() => { throw new Error("synthetic GPU failure"); });
  expect(() => shadow.render()).toThrow("synthetic GPU failure"); expect(renderer.getRenderTarget()).toBe("previous"); expect(renderer.getClearAlpha()).toBe(1); expect(renderer.autoClear).toBe(false); shadow.dispose();
});
it("a rug's receiver follows the live intermediate position rather than jumping to its destination", () => {
  const { renderer, shadow, world, group } = harness(), scene = spaceExample("small_bedroom"), rug = scene.objects.find(o => o.kind === "rug")!;
  group.position.set(2, 0, rug.z); rug.x = 3;
  shadow.update(scene, new Map([[rug.id, { group }]])); shadow.render();
  const receiver = world.children[0].children[1]; expect(receiver.position.x).toBe(2);
  group.position.x = 2.5; shadow.render(); expect(receiver.position.x).toBe(2.5);
  group.position.x = 3; shadow.render(); expect(receiver.position.x).toBe(3); expect(renderer.render).toHaveBeenCalledTimes(3); shadow.dispose();
});
it("a moving object's cached contact follows its mesh without rerendering static furniture", () => {
  const { renderer, shadow, world, group } = harness(), scene = spaceExample("small_bedroom"), id = scene.objects[0].id;
  shadow.update(scene, new Map([[id, { group }]]), id); shadow.render(); expect(renderer.render).toHaveBeenCalledTimes(6);
  expect((renderer.render.mock.calls[0][0] as T.Scene).children).toHaveLength(0);
  group.position.x = 1.5; shadow.render(); expect(renderer.render).toHaveBeenCalledTimes(6);
  expect(world.children[0].children[1].position.x).toBe(1.5); shadow.dispose();
});
