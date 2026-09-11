import { ActionSchema, AnalysisSchema, SceneSchema, SpatialObjectSchema, SPACE_VERSION, type Action, type Analysis, type Goal, type Scene, type SpatialObject } from "./schema";
import { ELECTRONIC_KINDS } from "./catalog";

import { footprint, overlaps, doorClearance, isObstacle, solidPair } from "./geometry";
import { spatialAccessIssues } from "./navigation";
export { footprint, overlaps, doorClearance } from "./geometry";
const EPS = 0.0001;
export function geometryIssues(candidate: unknown): string[] {
  const parsed = SceneSchema.safeParse(candidate);
  if (!parsed.success) return ["INVALID_SCENE"];
  const scene = parsed.data, issues: string[] = [];
  const ids = [...scene.objects, ...scene.doors, ...scene.windows].map(o => o.id);
  if (new Set(ids).size !== ids.length) issues.push("DUPLICATE_ID");
  if (new Set(scene.walls).size !== 4) issues.push("INVALID_WALLS");
  const openings = [...scene.doors, ...scene.windows];
  for (const opening of openings) {
    const length = opening.wall === "top" || opening.wall === "bottom" ? scene.room.width : scene.room.depth;
    if ((opening.sill ?? 0) + (opening.height ?? 0) > scene.room.height + EPS) issues.push(`OPENING_HEIGHT:${opening.id}`);
    if (opening.offset + opening.width > length + EPS) issues.push(`OPENING_BOUNDS:${opening.id}`);
  }
  for (let i = 0; i < openings.length; i++) for (let j = i + 1; j < openings.length; j++) {
    const a = openings[i], b = openings[j];
    if (a.wall === b.wall && a.offset < b.offset + b.width - EPS && a.offset + a.width > b.offset + EPS) issues.push(`OPENING_OVERLAP:${a.id}`);
  }
  for (let i = 0; i < scene.objects.length; i++) {
    const obj = scene.objects[i], box = footprint(obj);
    if (obj.kind === "rug" ? obj.height > .03 : obj.height < .1) issues.push(`INVALID_OBJECT_HEIGHT:${obj.id}`);
    if (box.left < -EPS || box.top < -EPS || box.right > scene.room.width + EPS || box.bottom > scene.room.depth + EPS || (obj.elevation ?? 0) + obj.height > scene.room.height + EPS) issues.push(`OUT_OF_BOUNDS:${obj.id}`);
    for (let j = i + 1; j < scene.objects.length; j++) if (solidPair(obj, scene.objects[j]) && overlaps(box, footprint(scene.objects[j]))) issues.push(`COLLISION:${obj.id}:${scene.objects[j].id}`);
  }
  return issues;
}
export function blockedDoors(scene: Scene): string[] {
  return scene.objects.filter(obj => isObstacle(obj) && scene.doors.some(door => overlaps(footprint(obj), doorClearance(scene, door)))).map(obj => obj.id);
}
export function applyAction(scene: Scene, candidate: unknown): Scene {
  const action = ActionSchema.parse(candidate);
  if (geometryIssues(scene).length) throw new Error("INVALID_SCENE");
  if (action.type !== "move" && action.type !== "rotate") return structuredClone(scene);
  const object = scene.objects.find(obj => obj.id === action.objectId);
  if (!object || !object.movable) throw new Error("INVALID_ACTION_TARGET");
  if (action.type === "move" && (action.x === null || action.z === null)) throw new Error("MISSING_COORDINATES");
  if (action.type === "rotate" && action.rotation === null) throw new Error("MISSING_ROTATION");
  const next = structuredClone(scene);
  const target = next.objects.find(obj => obj.id === object.id)!;
  if (action.type === "move") { target.x = action.x!; target.z = action.z!; }
  if (action.rotation !== null) target.rotation = action.rotation;
  if (geometryIssues(next).length || blockedDoors(next).some(id => id === object.id || !blockedDoors(scene).includes(id))) throw new Error("UNSAFE_ACTION");
  // Maintain a 10 cm placement margin from other furniture. This is not a full accessibility certification.
  if (next.objects.some(o => o.id !== target.id && solidPair(o, target) && overlaps(footprint(o), footprint(target), 0.1))) throw new Error("INSUFFICIENT_CLEARANCE");
  const priorAccess = new Set(spatialAccessIssues(scene));
  if (spatialAccessIssues(next).some(issue => !priorAccess.has(issue))) throw new Error("BLOCKED_WALKING_OR_WINDOW_ACCESS");
  return next;
}
export function headGap(scene: Scene, object: SpatialObject): number {
  const b = footprint(object);
  return object.rotation === 0 ? b.top : object.rotation === 90 ? scene.room.width - b.right : object.rotation === 180 ? scene.room.depth - b.bottom : b.left;
}

function facesPoint(source: SpatialObject, x: number, z: number, maximumDistance = 4): boolean {
  const dx = x - source.x, dz = z - source.z, distance = Math.hypot(dx, dz);
  if (distance < .1 || distance > maximumDistance) return false;
  const [fx, fz] = source.rotation === 0 ? [0, 1] : source.rotation === 90 ? [-1, 0] : source.rotation === 180 ? [0, -1] : [1, 0];
  return (dx * fx + dz * fz) / distance >= .82;
}
function facesObject(source: SpatialObject, target: SpatialObject, maximumDistance = 4): boolean {
  return facesPoint(source, target.x, target.z, maximumDistance);
}
export const MAX_PLACEMENT_GRID = 24;

export function addObjectAtOpenPosition(candidate: unknown, nextObject: unknown): Scene {
  const scene = SceneSchema.parse(candidate), object = SpatialObjectSchema.parse(nextObject);
  if (scene.objects.some(item => item.id === object.id)) throw new Error("DUPLICATE_ID");
  const zero = footprint({ ...object, x: 0, z: 0 });
  const minX = -zero.left + .1, minZ = -zero.top + .1;
  const maxX = scene.room.width - minX, maxZ = scene.room.depth - minZ;
  if (minX > maxX || minZ > maxZ) throw new Error("NO_CLEAR_PLACEMENT");
  const priorAccess = new Set(spatialAccessIssues(scene));
  for (let iz = 0; iz <= MAX_PLACEMENT_GRID; iz++) for (let ix = 0; ix <= MAX_PLACEMENT_GRID; ix++) {
    const placed = { ...object, x: Math.round((minX + (maxX - minX) * ix / MAX_PLACEMENT_GRID) * 1000) / 1000, z: Math.round((minZ + (maxZ - minZ) * iz / MAX_PLACEMENT_GRID) * 1000) / 1000 };
    const box = footprint(placed);
    if (scene.objects.some(other => solidPair(other, placed) && overlaps(footprint(other), box, .1))) continue;
    if (scene.doors.some(door => overlaps(box, doorClearance(scene, door)))) continue;
    const result = { ...scene, objects: [...scene.objects, placed], confirmed: false };
    if (geometryIssues(result).length) continue;
    if (spatialAccessIssues(result).some(issue => !priorAccess.has(issue))) continue;
    return SceneSchema.parse(result);
  }
  throw new Error("NO_CLEAR_PLACEMENT");
}
function findSafeMove(scene: Scene, object: SpatialObject, wallPreferred: boolean): Action | null {
  const candidates: { x: number; z: number; rank: number }[] = [];
  const footprintAtZero = footprint({ ...object, x: 0, z: 0 });
  const minX = -footprintAtZero.left + 0.1, minZ = -footprintAtZero.top + 0.1;
  const maxX = scene.room.width - minX, maxZ = scene.room.depth - minZ;
  if (minX > maxX || minZ > maxZ) return null;
  const boxes = scene.objects.filter(o => o.id !== object.id && solidPair(o, object)).map(footprint);
  const doors = scene.doors.map(o => doorClearance(scene, o));
  // At most 25² candidates/object, regardless of room dimensions. Validate cheap boxes
  // before a single final schema/action check; never parse the whole scene per candidate.
  for (let ix = 0; ix <= MAX_PLACEMENT_GRID; ix++) for (let iz = 0; iz <= MAX_PLACEMENT_GRID; iz++) {
    const x = Math.round((minX + (maxX - minX) * ix / MAX_PLACEMENT_GRID) * 1000) / 1000;
    const z = Math.round((minZ + (maxZ - minZ) * iz / MAX_PLACEMENT_GRID) * 1000) / 1000;
    const moved = { ...object, x, z }, b = footprint(moved);
    const gap = headGap(scene, moved);
    if (wallPreferred && gap > 0.4) continue;
    if (boxes.some(other => overlaps(b, other, 0.1)) || doors.some(door => overlaps(b, door))) continue;
    candidates.push({ x, z, rank: (wallPreferred ? gap * 10 : 0) + Math.hypot(x - object.x, z - object.z) });
  }
  candidates.sort((a, b) => a.rank - b.rank || a.x - b.x || a.z - b.z);
  for (const p of candidates) {
    if (Math.hypot(p.x - object.x, p.z - object.z) < 0.2) continue;
    const action: Action = { type: "move", objectId: object.id, x: p.x, z: p.z, rotation: null };
    try { applyAction(scene, action); return action; } catch { /* deterministic candidate rejected */ }
  }
  return null;
}
export type PersonalContext = { sources: string[]; systems: ("saju" | "numerology" | "behavioral")[]; confirmedChecks: number; mismatchCount?: number; symbolicBasis?: string[] };
export function analyzeSpace(candidate: unknown, goal: Goal, locale: "ko" | "en", personal?: PersonalContext): Analysis {
  const current = SceneSchema.parse(candidate);
  if (!current.confirmed || !current.orientation.confirmed) throw new Error("CONFIRM_SCENE_AND_NORTH");
  if (geometryIssues(current).length) throw new Error("INVALID_GEOMETRY");
  if (current.measurements?.origin === "photo" && !current.measurements.reference) throw new Error("REFERENCE_MEASUREMENT_REQUIRED");
  const ko = locale === "ko";
  const accessWarnings = spatialAccessIssues(current).slice(0, 8);
  const result: Analysis = { version: SPACE_VERSION, current, recommended: structuredClone(current), recommendations: [], warnings: accessWarnings.map(issue => ko ? `통행·창 접근 확인: ${issue}` : `Check walking/window access: ${issue}`), personalSources: personal?.sources.slice(0, 5) ?? [] };
  const observe: Action = { type: "observe", objectId: null, x: null, z: null, rotation: null };
  if (!current.measurements || [current.measurements.width, current.measurements.depth, current.measurements.height].some(m => m.status === "estimated")) result.warnings.push(ko ? "추정 치수가 있습니다. 표시된 좌표는 이 모형의 값이며, 실제 이동 전 치수와 통로를 실측해 확인하세요." : "Some dimensions are estimated. Coordinates describe this model; measure real clearances before moving furniture.");
  const add = (ruleId: string, evidence_type: "traditional" | "practical" | "personal", rationale: string, action: Action, confidence: number) => {
    if (result.recommendations.length >= 5) return;
    if (action.type === "move" || action.type === "rotate") result.recommended = applyAction(result.recommended, action);
    result.recommendations.push({ id: `rec_${result.recommendations.length + 1}`, ruleId, evidence_type, rationale, action, confidence });
  };
  for (const id of blockedDoors(current)) {
    if (result.recommendations.length >= 2) break;
    const object = result.recommended.objects.find(o => o.id === id)!;
    const action = object.movable ? findSafeMove(result.recommended, object, false) : null;
    if (action) add("door_clearance_v1", "practical", ko ? "문 앞 여유 공간과 가구가 겹칩니다. 문을 열고 지나갈 공간을 비우는 배치입니다. 실제 문 여는 방향과 통로는 현장에서 확인하세요." : "Furniture occupies the doorway clearance. This placement frees that area; verify the door swing and walking route in the actual room.", action, 1);
    else result.warnings.push(ko ? `${id}: 문 앞 공간을 비우는 배치를 찾지 못했습니다. 직접 조정하세요.` : `${id}: No safe doorway placement found. Adjust manually.`);
  }
  const bed = result.recommended.objects.find(o => o.kind === "bed" && o.movable);
  if (bed && result.recommendations.length < 4) {
    if (headGap(result.recommended, bed) > 0.4) {
      const move = findSafeMove(result.recommended, bed, true);
      if (move) add("bed_wall_support_v1", "traditional", ko ? "전통 풍수에서는 침대 주변 벽의 지지를 중시합니다. 벽 가까운 배치를 비교해 보세요. 운이나 수면 개선을 보장하지 않습니다." : "Traditional feng shui values wall support around the bed. Compare this near-wall arrangement; it does not guarantee luck or better sleep.", move, 0.5);
    }
  }
  const mirror = current.objects.find(object => object.kind === "mirror");
  const originalBed = current.objects.find(object => object.kind === "bed");
  if (mirror && originalBed && facesObject(mirror, originalBed)) add("mirror_bed_reflection_v1", "traditional", ko ? "거울이 침대를 정면으로 비추는 배치입니다. 전통 풍수에서는 이 구도를 피하기도 합니다. 실제로 거울 반사와 빛이 거슬리는지 먼저 확인하고, 필요하면 거울 방향만 바꿔 비교해 보세요. 수면 효과를 보장하지 않습니다." : "The mirror faces the bed. Traditional feng shui sometimes avoids this arrangement. First check whether reflections or light bother you, then compare a turned mirror if needed. This does not guarantee a sleep effect.", observe, .5);
  else if (mirror) {
    const facingDoor = current.doors.some(door => {
      const horizontal = door.wall === "top" || door.wall === "bottom";
      const x = horizontal ? door.offset + door.width / 2 : door.wall === "left" ? 0 : current.room.width;
      const z = horizontal ? door.wall === "top" ? 0 : current.room.depth : door.offset + door.width / 2;
      return facesPoint(mirror, x, z);
    });
    if (facingDoor) add("mirror_door_reflection_v1", "traditional", ko ? "거울이 출입문 쪽을 향합니다. 전통 풍수에서 확인하는 구도지만 길흉이나 효과를 뜻하지 않습니다. 문을 열었을 때 눈부심·놀람·동선 불편이 있는지만 직접 확인하세요." : "The mirror faces an entrance. This is a traditional feng shui checkpoint, not evidence of luck or an effect. Check only for glare, surprise or access problems when the door opens.", observe, .5);
  }
  const stove = current.objects.find(object => object.kind === "stove");
  const sink = current.objects.find(object => object.kind === "sink");
  if (stove && sink && Math.hypot(stove.x - sink.x, stove.z - sink.z) < .9) add("stove_sink_separation_v1", "traditional", ko ? "화구와 싱크대가 가까이 있습니다. 전통 풍수에서는 불과 물의 간격을 살펴봅니다. 배관·전기·환기와 실제 주방 안전 기준을 먼저 확인하고, 사이 작업 공간이 불편한지만 비교하세요." : "The stove and sink are close. Traditional feng shui considers spacing between fire and water. Check plumbing, electrical, ventilation and kitchen-safety requirements first, then compare whether the work gap is inconvenient.", observe, .5);
  const aquarium = current.objects.find(object => object.kind === "aquarium");
  if (aquarium) add("aquarium_support_check_v1", "practical", ko ? `${aquarium.id}: 어항은 물의 상징으로 해석되기도 하지만 재물운 효과를 보장하지 않습니다. 바닥 하중·전기선·누수 위험과 관리 동선을 먼저 확인하세요.` : `${aquarium.id}: An aquarium may be interpreted as a water symbol, but it does not guarantee financial luck. Check floor load, power cables, spill risk and maintenance access first.`, observe, 1);
  const clock = current.objects.find(object => object.kind === "clock");
  if (clock && goal === "rest") add("clock_rest_check_v1", "practical", ko ? `${clock.id}: 잠들기 전 시계의 빛과 초침 소리가 실제로 거슬리는지 확인해 보세요. 가리거나 위치를 바꾼 날과 평소를 기록해 비교할 수 있습니다.` : `${clock.id}: Check whether the clock light or ticking actually bothers you at bedtime. Compare a day with it covered or moved against your usual routine.`, observe, 1);
  const curtain = current.objects.find(object => object.kind === "curtain");
  if (curtain && goal === "rest") add("curtain_light_check_v1", "practical", ko ? `${curtain.id}: 커튼을 닫았을 때와 열었을 때 아침 빛·사생활·환기가 어떻게 달라지는지 확인하세요. 빛 차단이 필요한지는 생활 기록으로 비교합니다.` : `${curtain.id}: Compare morning light, privacy and ventilation with the curtain open and closed. Use your own routine record to decide whether light blocking helps.`, observe, 1);
  const wasteBin = current.objects.find(object => object.kind === "waste_bin");
  if (wasteBin) add("waste_bin_route_v1", "practical", ko ? `${wasteBin.id}: 쓰레기통이 문·침대·책상 사용을 방해하지 않는지 확인하고, 쉽게 비울 수 있는 위치인지 살펴보세요. 청결과 동선에 대한 생활 점검입니다.` : `${wasteBin.id}: Check that the bin does not interfere with the door, bed or desk and remains easy to empty. This is a practical cleanliness and access check.`, observe, 1);
  const shoeRack = current.objects.find(object => object.kind === "shoe_rack");
  if (shoeRack) add("shoe_rack_entrance_v1", "practical", ko ? `${shoeRack.id}: 신발장이 문을 여는 공간과 첫 통로를 좁히지 않는지 확인하세요. 신발을 넣고 꺼낼 때 막히지 않는 위치가 우선입니다.` : `${shoeRack.id}: Check that the shoe rack does not narrow the door swing or first walking route. Easy access when putting shoes away comes first.`, observe, 1);
  const artwork = current.objects.find(object => object.kind === "artwork");
  if (artwork && goal === "rest") add("artwork_rest_reflection_v1", "practical", ko ? `${artwork.id}: 침대에서 그림을 봤을 때 편안한지, 시선이 자꾸 머무는지 직접 확인하세요. 그림의 길흉을 정하는 대신 실제 느낌을 기록합니다.` : `${artwork.id}: From the bed, notice whether the artwork feels calm or repeatedly draws your attention. Record your actual response instead of assigning luck to the image.`, observe, 1);
  const divider = current.objects.find(object => object.kind === "room_divider");
  if (divider && originalBed && current.objects.some(object => object.kind === "desk")) add("rest_work_zone_v1", "practical", ko ? `${divider.id}: 가림막이 휴식 공간과 작업 공간을 구분하면서 통로와 채광을 막지 않는지 확인하세요.` : `${divider.id}: Check whether the divider separates rest and work areas without blocking the walking route or daylight.`, observe, 1);
  const beam = current.objects.find(object => object.kind === "ceiling_beam");
  const underBeam = beam && current.objects.find(object => ["bed", "desk", "dining_table"].includes(object.kind) && overlaps(footprint(beam), footprint(object)));
  if (beam && underBeam) add("ceiling_beam_position_v1", "traditional", ko ? `${underBeam.id}: 침대나 책상 위의 천장 보는 전통 풍수에서 확인하는 요소입니다. 불안감이나 답답함을 느끼는지 직접 살펴보고, 구조 안전은 전문가에게 확인하세요. 운이나 건강 영향을 확정하지 않습니다.` : `${underBeam.id}: A ceiling beam above a bed or table is a traditional feng shui checkpoint. Notice whether it feels uncomfortable and use a qualified professional for structural concerns. It does not establish luck or health effects.`, observe, .5);
  const column = current.objects.find(object => object.kind === "column");
  if (column && current.objects.some(object => ["bed", "desk", "dining_table"].includes(object.kind) && Math.hypot(column.x - object.x, column.z - object.z) < 1.2)) add("column_clearance_v1", "practical", ko ? `${column.id}: 자주 앉거나 눕는 자리 가까이에 기둥이 있습니다. 모서리에 부딪히지 않는지와 의자·침대 사용 공간을 직접 확인하세요.` : `${column.id}: A column is close to a place used for sitting or sleeping. Check bump risk and usable chair or bed clearance in the actual room.`, observe, 1);
  for (const id of blockedDoors(result.recommended)) {
    const warning = ko ? `${id}: 문 앞 공간을 직접 확인하고 비워 주세요.` : `${id}: Check and clear the doorway in the actual room.`;
    if (result.warnings.length < 20) result.warnings.push(warning);
  }
  const compassSides = ko
    ? ["위쪽", "오른쪽 위", "오른쪽", "오른쪽 아래", "아래쪽", "왼쪽 아래", "왼쪽", "왼쪽 위"]
    : ["top", "upper right", "right", "lower right", "bottom", "lower left", "left", "upper left"];
  const northSide = compassSides[Math.round(current.orientation.northDegrees / 45) % 8];
  if (!personal?.sources.length) add("orientation_context_v1", "traditional", ko ? `이 도면에서 북쪽은 ${northSide}입니다. 동·서·남·북 방향은 전통 해석을 위한 참고이며 길흉 점수나 효과의 증거가 아닙니다.` : `North is at the ${northSide} of this plan. Cardinal directions are traditional reference points, not luck scores or evidence of an effect.`, observe, 0.5);
  const electronics = current.objects.filter(object => (ELECTRONIC_KINDS as readonly string[]).includes(object.kind));
  if (electronics.length && goal === "rest") add("electronics_rest_check_v1", "practical", ko ? `${electronics.map(item => item.id).join(", ")}: 잠들기 전 화면·표시등·작동 소리가 휴식을 방해하는지 직접 확인해 보세요. 전원을 끄거나 가린 날과 평소를 기록해 비교하는 생활 제안입니다.` : `${electronics.map(item => item.id).join(", ")}: Check whether screens, indicator lights or operating noise disturb rest. Compare a day with them off or covered against your usual routine.`, observe, 1);
  add(`goal_${goal}_v1`, "practical", ko ? (goal === "focus" ? "책상에 앉아 창의 눈부심과 출입 동선을 확인하세요. 작업에 필요 없는 물건은 옮길 후보로 표시해 보세요." : goal === "rest" ? "휴식할 때 빛·소음과 출입 동선을 직접 살펴보세요. 가구를 옮긴 뒤 생활의 변화를 기록할 수 있습니다." : "일어나기·앉기·수납하기를 실제로 해 보며 동선을 확인하세요. 이 도면은 실측이나 안전 진단을 대신하지 않습니다.") : "Check glare, noise, storage and walking routes in the actual room for your selected goal. The plan is not a measured survey or safety inspection.", observe, 1);
  if (personal?.sources.length) {
    const cautious = (personal.mismatchCount ?? 0) > 0;
    const basis = personal.symbolicBasis?.join(" · ") ?? "";
    add(cautious ? "personal_context_uncertain_v1" : "personal_context_experiment_v1", "personal",
      (ko ? `${basis} · 참고 기록 ${personal.confirmedChecks}개. ${cautious ? `이전 기록 중 ${personal.mismatchCount}개가 맞지 않거나 상황에 따라 달랐습니다. 여러 가구를 한꺼번에 옮기지 말고 하나만 바꿔 경험을 비교하세요.` : "기존 상징 해석을 정답으로 삼지 말고, 선택한 생활 목표와 맞는지 한 가지 변화부터 기록해 보세요."} 방향·배치의 효과를 계산한 값이 아니며 기존 계산은 보존합니다.`
        : `${basis} · ${personal.confirmedChecks} prior checks. ${cautious ? `${personal.mismatchCount} were mismatched or context-dependent: change one item at a time to compare experience.` : "Treat the existing symbolic interpretation as a reflection, and record one change against your selected goal."} These are not calculated spatial effects; existing calculations are preserved.`).slice(0, 800), observe, cautious ? 0.3 : 0.5);
  }
  const uniqueWarnings = [...new Set(result.warnings)];
  result.warnings = uniqueWarnings.length > 20 ? [...uniqueWarnings.slice(0, 19), ko ? "추가 확인 항목이 있습니다. 모든 문·가구·통로를 직접 확인하세요." : "More checks remain. Inspect every door, object and walking route."] : uniqueWarnings;
  return AnalysisSchema.parse(result);
}
