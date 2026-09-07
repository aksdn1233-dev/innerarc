import * as T from "three";
import type { Scene } from "@/core/space/schema";
import { footprint } from "@/core/space/geometry";

/** Cached floor contact lighting, adapted from Three.js webgl_shadow_contact (MIT).
 * A moving object's contact map is baked separately and follows its live transform.
 * Orbit/translation frames do not redraw the entire furniture set into a shadow map.
 */
export function createContactShadows(renderer: T.WebGLRenderer, world: T.Scene, resolution = 512) {
  const depthScene = new T.Scene(), dynamicScene = new T.Scene(), blurScene = new T.Scene(), overlays = new T.Group();
  const shadowCamera = new T.OrthographicCamera(), dynamicCamera = new T.OrthographicCamera(), blurCamera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const target = new T.WebGLRenderTarget(resolution, resolution), scratch = new T.WebGLRenderTarget(resolution, resolution, { depthBuffer: false }), movingTarget = new T.WebGLRenderTarget(128, 128);
  const depth = new T.MeshDepthMaterial({ side: T.DoubleSide });
  depth.onBeforeCompile = shader => {
    const original = "gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );";
    if (!shader.fragmentShader.includes(original)) throw new Error("CONTACT_DEPTH_SHADER_CHANGED");
    shader.fragmentShader = shader.fragmentShader.replace(original, "gl_FragColor = vec4(0.0, 0.0, 0.0, pow(1.0 - fragCoordZ, 3.0) * 0.78);");
  };
  depthScene.overrideMaterial = dynamicScene.overrideMaterial = depth;
  const blur = new T.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { image: { value: target.texture }, step: { value: new T.Vector2() } },
    vertexShader: "varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}",
    fragmentShader: "uniform sampler2D image; uniform vec2 step; varying vec2 vUv; void main(){vec4 c=texture2D(image,vUv)*.227027; c+=(texture2D(image,vUv+step*1.384615)+texture2D(image,vUv-step*1.384615))*.316216; c+=(texture2D(image,vUv+step*3.230769)+texture2D(image,vUv-step*3.230769))*.070270; gl_FragColor=c;}" });
  const quad = new T.Mesh(new T.PlaneGeometry(2, 2), blur); blurScene.add(quad); world.add(overlays);
  const materials: T.ShaderMaterial[] = [];
  function material(texture: T.Texture, w: number, d: number, bounds: T.Vector4) {
    const value = new T.ShaderMaterial({ transparent: true, depthWrite: false, toneMapped: false,
      uniforms: { shadowImage: { value: texture }, mapSize: { value: new T.Vector2(w, d) }, offset: { value: new T.Vector2() }, bounds: { value: bounds } },
      vertexShader: "varying vec2 roomPoint; void main(){vec4 p=modelMatrix*vec4(position,1.);roomPoint=p.xz;gl_Position=projectionMatrix*viewMatrix*p;}",
      fragmentShader: "uniform sampler2D shadowImage; uniform vec2 mapSize; uniform vec2 offset; uniform vec4 bounds; varying vec2 roomPoint; void main(){if(roomPoint.x<bounds.x||roomPoint.y<bounds.y||roomPoint.x>bounds.z||roomPoint.y>bounds.w)discard;gl_FragColor=vec4(0.,0.,0.,texture2D(shadowImage,(roomPoint-offset)/mapSize).a);}" });
    materials.push(value); return value;
  }
  function plane(w: number, d: number, x: number, z: number, y: number, mat: T.ShaderMaterial, rotation = 0) {
    const mesh = new T.Mesh(new T.PlaneGeometry(w, d), mat), group = new T.Group(); mesh.rotation.x = -Math.PI / 2; group.add(mesh); group.position.set(x, y, z); group.rotation.y = -rotation * Math.PI / 180; overlays.add(group); return group;
  }
  function fit(camera: T.OrthographicCamera, w: number, d: number, x: number, z: number) {
    Object.assign(camera, { left: -w / 2, right: w / 2, top: d / 2, bottom: -d / 2, near: 0, far: 1.5 }); camera.position.set(x, .001, z); camera.rotation.set(Math.PI / 2, 0, 0); camera.updateProjectionMatrix();
  }
  function releasePlanes() { overlays.traverse(node => { if (node instanceof T.Mesh) node.geometry.dispose(); }); overlays.clear(); materials.forEach(value => value.dispose()); materials.length = 0; }
  let dirty = true, width = 1, depthMetres = 1, disposed = false;
  let dynamic: { source: T.Group; width: number; depth: number; planes: { group: T.Group; material: T.ShaderMaterial; height: number }[] } | null = null;
  const receivers: { source: T.Group; group: T.Group; height: number }[] = [];
  function bake(scene: T.Scene, camera: T.Camera, destination: T.WebGLRenderTarget, w: number, d: number) {
    renderer.setRenderTarget(destination); renderer.render(scene, camera);
    blur.uniforms.image.value = destination.texture; blur.uniforms.step.value.set(.022 / w, 0); renderer.setRenderTarget(scratch); renderer.render(blurScene, blurCamera);
    blur.uniforms.image.value = scratch.texture; blur.uniforms.step.value.set(0, .022 / d); renderer.setRenderTarget(destination); renderer.render(blurScene, blurCamera);
  }
  return {
    resolution(size: number) { if (disposed || target.width === size) return; target.setSize(size, size); scratch.setSize(size, size); dirty = true; },
    update(scene: Scene, objects: Map<string, { group: T.Group }>, movingId?: string) {
      if (disposed) return;
      depthScene.clear(); dynamicScene.clear(); dynamic = null; receivers.length = 0; releasePlanes();
      width = scene.room.width; depthMetres = scene.room.depth;
      const roomBounds = new T.Vector4(0, 0, width, depthMetres), floor = material(target.texture, width, depthMetres, roomBounds);
      fit(shadowCamera, width, depthMetres, width / 2, depthMetres / 2); plane(width, depthMetres, width / 2, depthMetres / 2, .002, floor);
      for (const object of scene.objects) {
        const source = objects.get(object.id)?.group; if (!source) continue;
        if (object.kind === "rug") { const group = plane(object.width * .98, object.depth * .98, object.x, object.z, object.height + .002, floor, object.rotation); receivers.push({ source, group, height: object.height + .002 }); continue; }
        const copy = source.clone(true); // Shared meshes belong to the asset library, not this cache.
        if (object.id !== movingId) { depthScene.add(copy); continue; }
        const box = footprint(object), w = box.right - box.left + .24, d = box.bottom - box.top + .24;
        copy.position.set(0, 0, 0); dynamicScene.add(copy); fit(dynamicCamera, w, d, 0, 0);
        dynamic = { source, width: w, depth: d, planes: [] };
        const addReceiver = (height: number, bounds: T.Vector4) => { const mat = material(movingTarget.texture, w, d, bounds), group = plane(w, d, source.position.x, source.position.z, height, mat); dynamic!.planes.push({ group, material: mat, height }); };
        addReceiver(.002, roomBounds);
        for (const rug of scene.objects.filter(o => o.kind === "rug")) { const r = footprint(rug); addReceiver(rug.height + .002, new T.Vector4(Math.max(0, r.left + .01), Math.max(0, r.top + .01), Math.min(width, r.right - .01), Math.min(depthMetres, r.bottom - .01))); }
      }
      dirty = true;
    },
    render() {
      if (disposed) return;
      for (const { source, group, height } of receivers) { group.position.copy(source.position); group.position.y = height; group.quaternion.copy(source.quaternion); }
      if (dynamic) for (const receiver of dynamic.planes) { receiver.group.position.set(dynamic.source.position.x, receiver.height, dynamic.source.position.z); receiver.material.uniforms.offset.value.set(dynamic.source.position.x - dynamic.width / 2, dynamic.source.position.z - dynamic.depth / 2); }
      if (!dirty) return;
      const previousTarget = renderer.getRenderTarget(), color = renderer.getClearColor(new T.Color()), alpha = renderer.getClearAlpha(), autoClear = renderer.autoClear;
      try {
        renderer.autoClear = true; renderer.setClearColor(0x000000, 0);
        bake(depthScene, shadowCamera, target, width, depthMetres);
        if (dynamic) bake(dynamicScene, dynamicCamera, movingTarget, dynamic.width, dynamic.depth);
        dirty = false;
      } finally { renderer.setRenderTarget(previousTarget); renderer.setClearColor(color, alpha); renderer.autoClear = autoClear; }
    },
    dispose() { if (disposed) return; disposed = true; releasePlanes(); overlays.removeFromParent(); depthScene.clear(); dynamicScene.clear(); dynamic = null; receivers.length = 0; quad.geometry.dispose(); depth.dispose(); blur.dispose(); target.dispose(); scratch.dispose(); movingTarget.dispose(); },
  };
}
