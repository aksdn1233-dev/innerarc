"use client";
import { useEffect, useRef, useState } from "react";
import type { Scene } from "@/core/space/schema";
import { clearTranslation } from "@/core/space/navigation";
import { geometryIssues } from "@/core/space/engine";
import { SpaceAssetCredits } from "./asset-credits";
import { activeFrameTiming } from "./frame-timing";
import { resourceScope } from "./resource-scope";
import { roomCameraFit, interiorCameraFit } from "./camera-fit";
import styles from "./space.module.css";

type Runtime = { update(scene: Scene): void; select(id: string | null): void; top(): void; reset(): void; zoom(n: number): void; turn(): void; interior(): void; recommended(): void; profile(value: string): void; dispose(): void };
export default function RoomView({ scene, locale, selectedId = null, onSelect }: { scene: Scene; locale: "ko" | "en"; selectedId?: string | null; onSelect?: (id: string) => void }) {
  const host = useRef<HTMLDivElement>(null), runtime = useRef<Runtime | null>(null), latest = useRef(scene), selectCallback = useRef(onSelect), latestSelected = useRef(selectedId);
  const [failed, setFailed] = useState(false), [ready, setReady] = useState(false), [attempt, setAttempt] = useState(0), [quality, setQuality] = useState("auto"), [assetLoading, setAssetLoading] = useState(false), [viewFallback, setViewFallback] = useState(false);
  const ko = locale === "ko";
  useEffect(() => { latest.current = scene; runtime.current?.update(scene); }, [scene]);
  useEffect(() => { selectCallback.current = onSelect; latestSelected.current = selectedId; runtime.current?.select(selectedId); }, [onSelect, selectedId]);
  useEffect(() => {
    let stopped = false, partialCleanup = () => {};
    const container = host.current;
    if (!container) return;
    async function mount() {
      const [T, { OrbitControls }, assets, { createAssetLibrary }, { loadPbrSurfaces }, { EffectComposer }, { RenderPass }, { GTAOPass }, { OutputPass }, { createContactShadows }, { RectAreaLightUniformsLib }] = await Promise.all([import("three"), import("three/addons/controls/OrbitControls.js"), import("./interior-assets"), import("./asset-library"), import("./pbr-surfaces"), import("three/addons/postprocessing/EffectComposer.js"), import("three/addons/postprocessing/RenderPass.js"), import("three/addons/postprocessing/GTAOPass.js"), import("three/addons/postprocessing/OutputPass.js"), import("./contact-shadows"), import("three/addons/lights/RectAreaLightUniformsLib.js")]);
      if (stopped || !container) return;
      const resources = resourceScope(); partialCleanup = resources.dispose; const own = resources.add;
      const abort = new AbortController(); own(() => abort.abort());
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "default" });
      own(() => { renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); for (const key of ["sceneState", "objectCount", "drawCalls", "triangles", "camera", "motion", "frameP90", "sampledFrames"]) delete container.dataset[key]; });
      const mobile = matchMedia("(pointer: coarse)").matches, reduced = matchMedia("(prefers-reduced-motion: reduce)");
      let pixelRatio = Math.min(devicePixelRatio, mobile ? 1.35 : 1.8), qualityReduced = false;
      renderer.setPixelRatio(pixelRatio); renderer.setClearColor(0xe4e1d9);
      renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.16;
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
      renderer.domElement.setAttribute("aria-label", ko ? "선택하고 돌려볼 수 있는 방의 3D 모형" : "Interactive 3D room with selectable furniture"); renderer.domElement.setAttribute("role", "img"); container.appendChild(renderer.domElement);
      const world = new T.Scene(); world.background = new T.Color(0xe4e1d9);
      own(() => assets.disposeGeometry(world));
      const materials = assets.interiorMaterials(renderer.capabilities.getMaxAnisotropy()); own(materials.dispose);
      const surfaces = await loadPbrSurfaces(materials, renderer, abort.signal); own(surfaces.dispose);
      if (stopped) return;
      world.environment = surfaces.environment.texture; world.environmentIntensity = .32;
      const library = createAssetLibrary(abort.signal); own(library.dispose);
      const contact = createContactShadows(renderer, world, 512); own(contact.dispose);
      const camera = new T.PerspectiveCamera(38, 1, .05, 200), orbit = new OrbitControls(camera, renderer.domElement);
      own(() => orbit.dispose());
      orbit.enableDamping = false; orbit.screenSpacePanning = true; orbit.minDistance = 1; orbit.maxDistance = 65; orbit.maxPolarAngle = Math.PI / 2 - .01;
      const sun = new T.DirectionalLight(0xffefd5, 3.2); sun.castShadow = true; sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048); sun.shadow.bias = -.00003; sun.shadow.normalBias = .001; sun.shadow.radius = 3; sun.shadow.blurSamples = 8; world.add(sun, sun.target);
      RectAreaLightUniformsLib.init(); const windowFill = new T.RectAreaLight(0xe6eeff, 8, 1, 1); world.add(windowFill);
      world.add(new T.HemisphereLight(0xe5efff, 0x8d765a, .30));
      const ground = new T.Mesh(new T.PlaneGeometry(200, 200), new T.MeshStandardMaterial({ color: 0xe4e1d9, roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -.17; ground.receiveShadow = true; world.add(ground); own(() => (ground.material as import("three").Material).dispose());
      const selection = new T.Box3Helper(new T.Box3(), 0x99703a); selection.visible = false; world.add(selection); own(() => (selection.material as import("three").Material).dispose());
      const renderTarget = new T.WebGLRenderTarget(1, 1, { type: T.HalfFloatType, samples: mobile ? 2 : 4 });
      const composer = new EffectComposer(renderer, renderTarget); own(() => composer.dispose());
      const basePass = new RenderPass(world, camera), ao = new GTAOPass(world, camera, 256, 256), output = new OutputPass();
      own(() => { basePass.dispose(); ao.dispose(); output.dispose(); });
      ao.blendIntensity = .82; ao.updateGtaoMaterial({ radius: .38, distanceExponent: 1.5, thickness: .3, scale: 1, samples: mobile ? 8 : 12 }); ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 4, samples: 8 });
      let aoScale = mobile ? .55 : .8;
      const resizeAo = ao.setSize.bind(ao); ao.setSize = (w: number, h: number) => resizeAo(Math.max(1, Math.floor(w * aoScale)), Math.max(1, Math.floor(h * aoScale)));
      composer.addPass(basePass); composer.addPass(ao); composer.addPass(output);
      // Count all geometry/shadow/postprocessing passes, not only the final fullscreen pass.
      renderer.info.autoReset = false;
      let contextLost = false, updateVersion = 0;
      let committed = false, current = latest.current, arch: ReturnType<typeof assets.architecture> | null = null, archKey = "", selected: string | null = latestSelected.current, interiorView = false;
      const objects = new Map<string, { group: import("three").Group; key: string }>();
      let frame = 0, renderedFrames = 0, tierWarmSamples = 0; const sampleFrame = activeFrameTiming(); const intervals: number[] = [], renderTimes: number[] = [];
      type Motion = { start: number; duration: number; moves: { group: import("three").Group; from: import("three").Vector3; to: import("three").Vector3; fromRotation: number; toRotation: number }[] };
      let transition: Motion | null = null;
      function cutaway() {
        if (!arch) return;
        const { width: w, depth: d } = current.room;
        arch.walls.get("top")!.visible = interiorView || camera.position.z >= 0;
        arch.walls.get("bottom")!.visible = interiorView || camera.position.z <= d;
        arch.walls.get("left")!.visible = interiorView || camera.position.x >= 0;
        arch.walls.get("right")!.visible = interiorView || camera.position.x <= w;
        arch.ceiling.visible = interiorView;
      }
      function draw(now: number) {
        frame = 0; if (stopped || contextLost) return;
        try { renderFrame(now); } catch {
          contextLost = true; resources.dispose(); runtime.current = null;
          if (!stopped) { setReady(false); setFailed(true); }
        }
      }
      function renderFrame(now: number) {
        if (transition) {
          const p = Math.min(1, (now - transition.start) / transition.duration), eased = p * p * (3 - 2 * p);
          for (const move of transition.moves) { move.group.position.lerpVectors(move.from, move.to, eased); move.group.rotation.y = move.fromRotation + (move.toRotation - move.fromRotation) * eased; }
          if (p === 1) transition = null;
        }
        const interval = sampleFrame(now, !!transition); if (interval !== null) { if (tierWarmSamples > 0) tierWarmSamples--; else { intervals.push(interval); if (intervals.length > 60) intervals.shift(); } }
        container!.dataset.selectedObject = selected ?? "";
        if (selected && objects.has(selected)) { selection.box.setFromObject(objects.get(selected)!.group); selection.visible = true; } else selection.visible = false;
        cutaway(); renderer.info.reset(); const renderStarted = performance.now(); contact.render(); if (ao.enabled) composer.render(); else renderer.render(world, camera); const cpuMs = performance.now() - renderStarted; renderedFrames++; if (renderedFrames === 1) container!.dataset.firstRenderMs = cpuMs.toFixed(2); if (renderedFrames > 4) renderTimes.push(cpuMs); if (renderTimes.length > 60) renderTimes.shift();
        const renderP90 = [...renderTimes].sort((a,b) => a-b)[Math.floor(renderTimes.length * .9)] ?? 0; container!.dataset.renderMsP90 = renderP90.toFixed(2); container!.dataset.motion = transition ? "moving" : "settled";
        container!.dataset.textureCount = String(renderer.info.memory.textures); container!.dataset.geometryCount = String(renderer.info.memory.geometries); container!.dataset.textureBytesEstimate = String(Math.round(surfaces.textureBytesEstimate));
        container!.dataset.drawCalls = String(renderer.info.render.calls); container!.dataset.triangles = String(renderer.info.render.triangles); container!.dataset.camera = camera.position.toArray().map(n => n.toFixed(3)).join(",");
        if (committed) { container!.dataset.objectCount = String(objects.size); container!.dataset.sceneState = JSON.stringify(current.objects.map(o => ({ id: o.id, x: o.x, z: o.z, rotation: o.rotation }))); }
        if (intervals.length >= 4) {
          const sorted = [...intervals].sort((a, b) => a - b), p90 = sorted[Math.floor(sorted.length * .9)]; if (intervals.length >= 12) { container!.dataset.frameP90 = p90.toFixed(1); container!.dataset.sampledFrames = String(intervals.length); }
          if (!qualityReduced && (p90 > 100 || (intervals.length >= 12 && (p90 > 38 || renderP90 > 24)))) { qualityReduced = true; container!.dataset.beforeFallbackFrameP90 = p90.toFixed(1); container!.dataset.beforeFallbackRenderP90 = renderP90.toFixed(2); profile("performance"); setQuality("performance"); }
        }
        if (transition) schedule();
      }
      function schedule() { if (!frame && !contextLost) frame = requestAnimationFrame(draw); }
      function fit(top = false) { interiorView = false; setViewFallback(false); container!.dataset.cameraMode = top ? "top" : "perspective"; camera.fov = 38; camera.updateProjectionMatrix(); const fitted = roomCameraFit(current.room, camera.aspect, top); camera.position.copy(fitted.position); orbit.target.copy(fitted.target); orbit.update(); schedule(); }
      function reset() { fit(); }
      function profile(value: string) {
        const tier = value === "auto" ? mobile ? "balanced" : "high" : value;
        tierWarmSamples = 2; intervals.length = 0; renderTimes.length = 0; delete container!.dataset.frameP90; delete container!.dataset.sampledFrames;
        pixelRatio = Math.min(devicePixelRatio, tier === "ultra" ? 2 : tier === "high" ? 1.8 : tier === "balanced" ? 1.35 : 1);
        windowFill.visible = current.windows.length > 0 && tier !== "performance"; world.environmentIntensity = tier === "performance" ? .50 : .32;
        contact.resolution(tier === "performance" ? 128 : tier === "balanced" ? 256 : 512);
        ao.enabled = tier !== "performance"; aoScale = tier === "ultra" ? 1 : tier === "high" ? .8 : .55;
        ao.updateGtaoMaterial({ samples: tier === "ultra" ? 16 : tier === "high" ? 12 : 8 });
        renderer.setPixelRatio(pixelRatio); composer.setPixelRatio(pixelRatio); const shadowSize = tier === "ultra" || tier === "high" ? 2048 : tier === "performance" ? 512 : 1024; sun.shadow.mapSize.set(shadowSize, shadowSize); sun.shadow.map?.dispose(); sun.shadow.map = null;
        container!.dataset.effectiveQuality = tier; schedule();
      }
      function update(next: Scene) {
        if (geometryIssues(next).length) return; // Last valid geometry stays visible; no invalid input reaches WebGL.
        if (transition) { for (const move of transition.moves) { move.group.position.copy(move.to); move.group.rotation.y = move.toRotation; } transition = null; }
        const previous = current; current = next;
        const key = JSON.stringify([next.room, next.walls, next.doors, next.windows]);
        if (key !== archKey) {
          if (arch) { world.remove(arch.group); assets.disposeGeometry(arch.group); }
          arch = assets.architecture(next, materials); world.add(arch.group); archKey = key;
          const { width: w, depth: d, height: h } = next.room, span = Math.max(w, d);
          // Directional daylight enters the first observed window. It is illustrative light, not a sun-path claim.
          const opening = next.windows[0];
          const windowX = opening ? opening.wall === "left" ? 0 : opening.wall === "right" ? w : opening.offset + opening.width / 2 : w * .6;
          const windowZ = opening ? opening.wall === "top" ? 0 : opening.wall === "bottom" ? d : opening.offset + opening.width / 2 : 0;
          const windowY = opening ? (opening.sill ?? .85) + (opening.height ?? 1.2) * .65 : h * .75;
          const focalObject = next.objects.find(object => object.kind === "bed" || object.kind === "sofa");
          sun.target.position.set(focalObject?.x ?? w / 2, 0, focalObject?.z ?? d / 2);
          const through = new T.Vector3(windowX, windowY, windowZ).sub(sun.target.position);
          sun.position.copy(sun.target.position).addScaledVector(through, 3);
          windowFill.visible = !!opening && container!.dataset.effectiveQuality !== "performance";
          if (opening) { windowFill.width = opening.width; windowFill.height = opening.height ?? 1.2; windowFill.position.set(windowX, windowY, windowZ); windowFill.lookAt(w / 2, h * .45, d / 2); }
          Object.assign(sun.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: .1, far: span * 5 + h }); sun.shadow.camera.updateProjectionMatrix();
          for (const map of [materials.floor.map, materials.floor.normalMap, materials.floor.aoMap, materials.floor.roughnessMap, materials.floor.metalnessMap]) map?.repeat.set(w / 2.1, d / 2.1);
          if (JSON.stringify(previous.room) !== JSON.stringify(next.room)) reset();
        }
        const moves: Motion["moves"] = [];
        for (const [id, value] of objects) if (!next.objects.some(o => o.id === id)) { world.remove(value.group); assets.disposeGeometry(value.group); objects.delete(id); }
        for (const object of next.objects) {
          const signature = JSON.stringify([object.kind, object.width, object.depth, object.height]); let entry = objects.get(object.id);
          if (!entry || entry.key !== signature) {
            if (entry) { world.remove(entry.group); assets.disposeGeometry(entry.group); }
            const group = library.make(object, materials); world.add(group); entry = { group, key: signature }; objects.set(object.id, entry);
          } else {
            const from = entry.group.position.clone(), to = new T.Vector3(object.x, 0, object.z), fromRotation = entry.group.rotation.y, toRotation = -object.rotation * Math.PI / 180;
            // Only tween a verified clear straight translation; rotations and blocked paths snap.
            const source = previous.objects.find(o => o.id === object.id);
            const clear = !!source && source.rotation === object.rotation && !reduced.matches && clearTranslation(previous, source, object.x, object.z);
            if (clear && from.distanceTo(to) > .001) moves.push({ group: entry.group, from, to, fromRotation, toRotation });
            else { entry.group.position.copy(to); entry.group.rotation.y = toRotation; }
          }
        }
        // Simultaneous independent sweeps could cross: animate only one movement at a time.
        if (moves.length === 1) transition = { moves, start: performance.now(), duration: 650 };
        else { transition = null; for (const move of moves) { move.group.position.copy(move.to); move.group.rotation.y = move.toRotation; } }
        contact.update(next, objects, transition?.moves[0]?.group.userData.objectId); committed = true; schedule();
      }
      const ray = new T.Raycaster(), pointer = new T.Vector2(); let down: { x: number; y: number } | null = null;
      const onDown = (event: PointerEvent) => { down = { x: event.clientX, y: event.clientY }; };
      const onUp = (event: PointerEvent) => {
        if (!down || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5) return; down = null;
        const rect = renderer.domElement.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1); ray.setFromCamera(pointer, camera);
        const hit = ray.intersectObjects([...objects.values()].map(v => v.group), true)[0]; if (!hit) return;
        let root = hit.object; while (root.parent && !root.userData.objectId) root = root.parent;
        if (root.userData.objectId) { selected = root.userData.objectId as string; selectCallback.current?.(selected); schedule(); }
      };
      const onLoss = (event: Event) => { event.preventDefault(); contextLost = true; resources.dispose(); if (!stopped) { runtime.current = null; setFailed(true); } };
      renderer.domElement.addEventListener("pointerdown", onDown); renderer.domElement.addEventListener("pointerup", onUp); renderer.domElement.addEventListener("webglcontextlost", onLoss); const onOrbit = () => { camera.position.y = Math.max(.18, camera.position.y); orbit.target.y = Math.max(0, Math.min(current.room.height, orbit.target.y)); schedule(); }; orbit.addEventListener("change", onOrbit);
      let readyAtLeastOnce = false;
      const resize = new ResizeObserver(() => { const w = container.clientWidth, h = container.clientHeight; if (!w || !h) return; const changed = Math.abs(camera.aspect - w / h) > .1; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); composer.setSize(w, h); if (changed || !readyAtLeastOnce) reset(); else schedule(); }); resize.observe(container);
      own(() => { if (frame) cancelAnimationFrame(frame); resize.disconnect(); orbit.removeEventListener("change", onOrbit); renderer.domElement.removeEventListener("pointerdown", onDown); renderer.domElement.removeEventListener("pointerup", onUp); renderer.domElement.removeEventListener("webglcontextlost", onLoss); sun.shadow.map?.dispose(); });
      async function requestUpdate(next: Scene) {
        const version = ++updateVersion; setAssetLoading(true);
        try { await library.ensure(next.objects); if (!stopped && !contextLost && version === updateVersion) update(next); }
        catch { if (!stopped && !contextLost && version === updateVersion) { resources.dispose(); runtime.current = null; setFailed(true); } }
        finally { if (!stopped && version === updateVersion) setAssetLoading(false); }
      }
      function inside() {
        const fitted = interiorCameraFit(current, camera.aspect); camera.fov = fitted.fov; camera.updateProjectionMatrix(); camera.position.copy(fitted.position); orbit.target.copy(fitted.target);
        interiorView = fitted.mode === "interior"; setViewFallback(!interiorView); container!.dataset.cameraMode = fitted.mode; orbit.update(); schedule();
      }
      runtime.current = { update(next) { void requestUpdate(next); }, profile, select(id) { selected = id; schedule(); }, reset,
        top() { fit(true); },
        recommended: inside,
        interior: inside,
        zoom(n) { camera.position.sub(orbit.target).multiplyScalar(n).add(orbit.target); orbit.update(); schedule(); },
        turn() { camera.position.sub(orbit.target).applyAxisAngle(new T.Vector3(0, 1, 0), Math.PI / 8).add(orbit.target); orbit.update(); schedule(); },
        dispose: resources.dispose,
      };
      await requestUpdate(latest.current); if (stopped || contextLost || !runtime.current) return;
      profile("auto");
      const w = container.clientWidth, h = container.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); composer.setSize(w, h); reset(); readyAtLeastOnce = true; setReady(true);
    }
    mount().catch(() => { partialCleanup(); if (!stopped) { runtime.current = null; setFailed(true); } });
    return () => { stopped = true; partialCleanup(); runtime.current = null; };
  }, [ko, attempt]);
  return <div>
    {(!ready || assetLoading) && !failed && <p role="status">{ko ? "방의 재질과 3D 가구를 불러오고 있습니다…" : "Loading room materials and 3D furniture…"}</p>}
    {failed && <><p role="status">{ko ? "이 기기에서는 3D를 표시하지 못했습니다. 아래 객체 목록과 분석 결과로 계속 이용하세요." : "3D is unavailable on this device. Continue with the object list and text analysis below."}</p><button onClick={() => { setFailed(false); setReady(false); setQuality("auto"); setAttempt(value => value + 1); }}>{ko ? "3D 다시 시도" : "Retry 3D"}</button></>}
    <div className={styles.sceneFrame}>
      <div ref={host} className={styles.canvas} hidden={failed} data-quality={quality} />
      {!failed && <div className={styles.compass} aria-label={`${ko ? "평면도 기준 북쪽" : "North relative to plan"}: ${scene.orientation.northDegrees}°`}><span style={{ transform: `rotate(${scene.orientation.northDegrees}deg)` }}>↑</span>{ko ? "북" : "N"}<small>{scene.orientation.northDegrees}° · {ko ? "평면도 기준" : "plan"}</small></div>}
    </div>
    <div className={styles.toolbar} aria-label={ko ? "3D 보기 조작" : "3D view controls"}>
      <label className={styles.qualityChoice}>{ko ? "화질" : "Quality"}<select value={quality} onChange={e => { setQuality(e.target.value); runtime.current?.profile(e.target.value); }}>{["auto", "ultra", "high", "balanced", "performance"].map(value => <option key={value} value={value}>{({auto:ko?"자동":"Auto",ultra:"Ultra",high:"High",balanced:"Balanced",performance:ko?"가벼운 효과":"Performance"})[value]}</option>)}</select></label>
      <button type="button" disabled={failed} onClick={() => runtime.current?.reset()}>{ko ? "기본 시점" : "Reset view"}</button>
      <button type="button" disabled={failed} onClick={() => runtime.current?.top()}>{ko ? "위에서" : "Top view"}</button>
      <button type="button" disabled={failed} onClick={() => runtime.current?.recommended()}>{ko ? "추천 시점" : "Recommended view"}</button>
      <button type="button" disabled={failed} onClick={() => runtime.current?.interior()}>{ko ? "방 안에서" : "Inside room"}</button>
      <button type="button" disabled={failed} onClick={() => runtime.current?.turn()}>{ko ? "회전" : "Rotate view"}</button>
      <button type="button" disabled={failed} aria-label={ko ? "확대" : "Zoom in"} onClick={() => runtime.current?.zoom(.85)}>＋</button>
      <button type="button" disabled={failed} aria-label={ko ? "축소" : "Zoom out"} onClick={() => runtime.current?.zoom(1.15)}>−</button>
    </div>
    {viewFallback && <p role="status" className={styles.hint}>{ko ? "이 배치를 방 안에서 한눈에 담기 어려워 전체 보기로 전환했습니다." : "This layout cannot fit in a clear inside view. Showing the full room instead."}</p>}
    <p className={styles.hint}>{ko ? "가구를 누르면 선택 · 한 손가락 회전 · 두 손가락 확대·이동. 문·창 높이를 입력하지 않으면 표준 크기로 표현합니다." : "Tap furniture to select · One finger orbit · Two fingers zoom/pan. Unmeasured door/window heights use labelled standard estimates."}</p>
    <p className={styles.hint}>{ko ? "가구 디자인·마감·조명은 시각화용 스타일입니다. 실제 방에 있는 객체와 확인한 크기·위치만 공간 분석에 사용합니다." : "Furniture design, finishes and lighting are visualization styles. Spatial analysis uses the objects present and the dimensions/positions you verify."}</p>
    <SpaceAssetCredits locale={locale} />
  </div>;
}
