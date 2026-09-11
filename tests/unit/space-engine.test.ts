import { spatialAccessIssues } from "@/core/space/navigation";
import { describe, expect, it } from "vitest";
import { addObjectAtOpenPosition, analyzeSpace, applyAction, blockedDoors, footprint, geometryIssues, headGap, MAX_PLACEMENT_GRID } from "@/core/space/engine";
import { manualScene, SceneSchema, type Scene } from "@/core/space/schema";
import { FENG_SHUI_DETAIL_KINDS, FURNITURE_CATALOG } from "@/core/space/catalog";
function room(): Scene { const scene = manualScene(); scene.confirmed = true; scene.orientation.confirmed = true; return scene; }
describe("space deterministic geometry and interpretation", () => {
  it("replays a normal room without mutating source", () => { const scene = room(), snapshot = JSON.stringify(scene); expect(analyzeSpace(scene, "balance", "ko")).toEqual(analyzeSpace(scene, "balance", "ko")); expect(JSON.stringify(scene)).toBe(snapshot); });
  it.each([-1, 360, NaN, Infinity])("rejects invalid north %s", angle => { const s = room(); s.orientation.northDegrees = angle; expect(SceneSchema.safeParse(s).success).toBe(false); });
  it("requires explicit orientation and scene confirmation", () => { expect(() => analyzeSpace(manualScene(), "rest", "ko")).toThrow(); const s = room(); s.orientation.confirmed = false; expect(() => analyzeSpace(s, "rest", "ko")).toThrow(); });
  it.each(["objects", "doors"] as const)("refuses empty %s", key => { const s = room(); s[key] = []; expect(geometryIssues(s)).toContain("INVALID_SCENE"); });
  it("rejects duplicate identities across objects and openings", () => { const s = room(); s.objects[0].id = s.doors[0].id; expect(geometryIssues(s)).toContain("DUPLICATE_ID"); });
  it("rejects bounds after rotation", () => { const s = room(); s.objects[0].x = 0.8; s.objects[0].rotation = 90; expect(geometryIssues(s)).toContain("OUT_OF_BOUNDS:bed_1"); });
  it("detects overlapping rotated objects", () => { const s = room(); s.objects[1].x = 1.2; s.objects[1].z = 1.2; s.objects[1].rotation = 90; expect(geometryIssues(s).some(i => i.startsWith("COLLISION:"))).toBe(true); });
  it("checks opening bounds and overlap", () => { const s = room(); s.windows[0] = { id: "w", wall: "bottom", offset: 0.5, width: 4 }; expect(geometryIssues(s)).toEqual(expect.arrayContaining(["OPENING_BOUNDS:w", "OPENING_OVERLAP:door_1"])); });
  it("checks all four unique walls", () => { const s = room(); s.walls[0] = "bottom"; expect(geometryIssues(s)).toContain("INVALID_WALLS"); });
  it("rejects out-of-room and missing-target actions", () => { const s = room(); expect(() => applyAction(s, { type: "move", objectId: "missing", x: 1, z: 1, rotation: null })).toThrow("INVALID_ACTION_TARGET"); expect(() => applyAction(s, { type: "move", objectId: "bed_1", x: 0, z: 0, rotation: null })).toThrow("UNSAFE_ACTION"); });
  it("refuses a new blocked doorway", () => { const s = room(); expect(() => applyAction(s, { type: "move", objectId: "desk_1", x: 0.8, z: 4.5, rotation: null })).toThrow("UNSAFE_ACTION"); });
  it("does not execute remove/add suggestions", () => { for (const type of ["remove_suggestion", "add_suggestion"]) expect(applyAction(room(), { type, objectId: null, x: null, z: null, rotation: null })).toEqual(room()); });
  it.each([0, 90, 180, 270] as const)("bed support actually reduces head-wall gap at %s°", rotation => {
    const s = room(); s.objects = [{ ...s.objects[0], x: 2, z: 2.5, rotation }];
    const result = analyzeSpace(s, "rest", "en");
    expect(result.recommendations.some(r => r.ruleId === "bed_wall_support_v1")).toBe(true);
    expect(headGap(result.recommended, result.recommended.objects[0])).toBeLessThanOrEqual(0.4);
    expect(geometryIssues(result.recommended)).toEqual([]); expect(blockedDoors(result.recommended)).toEqual([]);
  });
  it("warns every blocked object when five recommendations cannot resolve all", () => {
    const s = room(); s.doors = [{ id: "door", wall: "bottom", offset: 0, width: 4 }];
    s.objects = Array.from({ length: 6 }, (_, i) => ({ ...s.objects[1], id: `obj_${i}`, kind: "plant", x: 0.3 + i * 0.6, z: 4.5, width: 0.3, depth: 0.3, height: 0.3 }));
    const result = analyzeSpace(s, "balance", "en"); expect(result.recommendations.length).toBeLessThanOrEqual(5);
    for (const id of blockedDoors(result.recommended)) expect(result.warnings.some(w => w.startsWith(id))).toBe(true);
  });
  it("bounds placement search for maximum valid adversarial room", () => {
    const s = room(); s.room = { width: 20, depth: 20, height: 3 }; s.windows = [];
    s.doors = ["top", "right", "bottom", "left"].map((wall, i) => ({ id: `door_${i}`, wall: wall as Scene["doors"][number]["wall"], offset: 0, width: 10 }));
    s.objects = Array.from({ length: 20 }, (_, i) => ({ ...s.objects[1], id: `obj_${i}`, kind: "storage", x: 2 + i % 5 * 4, z: 2.5 + Math.floor(i / 5) * 5, width: 4, depth: 5 }));
    expect(geometryIssues(s)).toEqual([]); expect(MAX_PLACEMENT_GRID).toBe(24); expect(analyzeSpace(s, "balance", "en").warnings.length).toBeGreaterThan(0);
  });
  it("uses explicit personal outcomes conservatively without changing geometry", () => {
    const personal = { sources: ["report:synthetic"], systems: ["numerology"] as const, confirmedChecks: 3, mismatchCount: 2, symbolicBasis: ["Life Path 7"] };
    const result = analyzeSpace(room(), "focus", "en", { ...personal, systems: [...personal.systems] });
    const rec = result.recommendations.find(r => r.evidence_type === "personal")!;
    expect(rec.ruleId).toBe("personal_context_uncertain_v1"); expect(rec.rationale).toContain("Life Path 7"); expect(rec.rationale).toContain("2 were mismatched"); expect(rec.confidence).toBe(0.3);
  });
  it("adds an electronic device only in a bounded, clear position", () => {
    const s = room();
    const next = addObjectAtOpenPosition(s, { id: "monitor_1", kind: "monitor", x: 0, z: 0, width: .7, depth: .28, height: .72, rotation: 0, confidence: 1, movable: true });
    expect(next.objects).toHaveLength(s.objects.length + 1);
    expect(next.objects.at(-1)?.kind).toBe("monitor");
    expect(next.confirmed).toBe(false);
    expect(geometryIssues(next)).toEqual([]);
    expect(blockedDoors(next)).toEqual([]);
  });
  it("rejects an electronic device when no safe position exists", () => {
    const s = room();
    s.room = { width: 2, depth: 2, height: 2.5 };
    s.doors = [{ id: "door", wall: "bottom", offset: 0, width: 2 }];
    s.windows = [];
    s.objects = [{ ...s.objects[0], x: 1, z: 1, width: 1.8, depth: 1.8 }];
    expect(() => addObjectAtOpenPosition(s, { id: "tv_1", kind: "tv", x: 0, z: 0, width: 1.25, depth: .35, height: 1.1, rotation: 0, confidence: 1, movable: true })).toThrow("NO_CLEAR_PLACEMENT");
  });
  it("describes cardinal direction without exposing degree input and checks electronics for rest", () => {
    const s = room();
    s.orientation.northDegrees = 90;
    s.objects.push({ id: "speaker_1", kind: "speaker", x: 3.5, z: 3.5, width: .28, depth: .3, height: .85, rotation: 0, confidence: 1, movable: true });
    const result = analyzeSpace(s, "rest", "ko");
    expect(result.recommendations.find(item => item.ruleId === "orientation_context_v1")?.rationale).toContain("북쪽은 오른쪽");
    expect(result.recommendations.find(item => item.ruleId === "orientation_context_v1")?.rationale).not.toMatch(/\d+°/u);
    expect(result.recommendations.find(item => item.ruleId === "electronics_rest_check_v1")?.rationale).toContain("화면·표시등·작동 소리");
  });
  it.each(FENG_SHUI_DETAIL_KINDS)("safely adds the Feng Shui detail %s", kind => {
    const s = room(), item = FURNITURE_CATALOG[kind];
    const next = addObjectAtOpenPosition(s, { id: `${kind}_1`, kind, x: 0, z: 0, width: item.width, depth: item.depth, height: item.height, ...(item.elevation === undefined ? {} : { elevation: item.elevation }), rotation: 0, confidence: 1, movable: true });
    expect(next.objects.at(-1)?.kind).toBe(kind);
    expect(geometryIssues(next)).toEqual([]);
  });
  it("checks mirrors, nearby stove and sink, and overhead beams without inventing outcomes", () => {
    const s = room();
    s.objects.push(
      { id: "mirror_1", kind: "mirror", x: 1, z: .6, width: .75, depth: .18, height: 1.7, rotation: 0, confidence: 1, movable: true },
      { id: "stove_1", kind: "stove", x: 2.2, z: 1, width: .7, depth: .65, height: .9, rotation: 0, confidence: 1, movable: true },
      { id: "sink_1", kind: "sink", x: 3, z: 1, width: .8, depth: .65, height: .9, rotation: 0, confidence: 1, movable: true },
      { id: "beam_1", kind: "ceiling_beam", x: 1, z: 2, width: 1.8, depth: .3, height: .25, elevation: 2.25, rotation: 0, confidence: 1, movable: false },
    );
    expect(geometryIssues(s)).toEqual([]);
    const result = analyzeSpace(s, "rest", "ko");
    expect(result.recommendations.map(item => item.ruleId)).toEqual(expect.arrayContaining(["mirror_bed_reflection_v1", "stove_sink_separation_v1", "ceiling_beam_position_v1"]));
    expect(result.recommendations).toHaveLength(5);
    expect(result.recommendations.map(item => item.rationale).join(" ")).toContain("보장하지 않습니다");
  });
  it("rejects a ceiling detail above the room height", () => {
    const s = room();
    s.objects.push({ id: "beam_1", kind: "ceiling_beam", x: 2, z: 2, width: 2, depth: .3, height: .3, elevation: 2.3, rotation: 0, confidence: 1, movable: false });
    expect(geometryIssues(s)).toContain("OUT_OF_BOUNDS:beam_1");
  });
  it.each([
    ["aquarium", "aquarium_support_check_v1"],
    ["clock", "clock_rest_check_v1"],
    ["curtain", "curtain_light_check_v1"],
    ["waste_bin", "waste_bin_route_v1"],
    ["shoe_rack", "shoe_rack_entrance_v1"],
    ["artwork", "artwork_rest_reflection_v1"],
    ["room_divider", "rest_work_zone_v1"],
  ] as const)("applies the bounded %s check", (kind, ruleId) => {
    const s = room(), item = FURNITURE_CATALOG[kind];
    const next = addObjectAtOpenPosition(s, { id: `${kind}_1`, kind, x: 0, z: 0, width: item.width, depth: item.depth, height: item.height, rotation: 0, confidence: 1, movable: true });
    next.confirmed = true;
    expect(analyzeSpace(next, "rest", "en").recommendations.some(item => item.ruleId === ruleId)).toBe(true);
  });
  it("checks a nearby structural column while preserving clear geometry", () => {
    const s = room();
    s.objects.push({ id: "column_1", kind: "column", x: 1.9, z: 2, width: .35, depth: .35, height: 2.5, rotation: 0, confidence: 1, movable: false });
    expect(geometryIssues(s)).toEqual([]);
    expect(analyzeSpace(s, "balance", "en").recommendations.some(item => item.ruleId === "column_clearance_v1")).toBe(true);
  });
  it("uses exact quarter-turn footprints", () => { const obj = room().objects[1]; expect(footprint({ ...obj, rotation: 90 }).right - footprint({ ...obj, rotation: 90 }).left).toBeCloseTo(obj.depth); });
});

it("treats a thin rug as floor covering without hiding solid furniture or window obstructions", () => {
  const scene = manualScene(); const without = spatialAccessIssues(scene);
  scene.objects.push({ id: "rug", kind: "rug", x: 1, z: 2, width: 1.8, depth: 2.5, height: .015, rotation: 0, movable: true, confidence: 1 });
  expect(geometryIssues(scene)).toEqual([]); expect(spatialAccessIssues(scene)).toEqual(without);
  scene.objects.at(-1)!.height = .05; expect(geometryIssues(scene)).toContain("INVALID_OBJECT_HEIGHT:rug");
  scene.objects.at(-1)!.height = .015; scene.objects.at(-1)!.x = .1; expect(geometryIssues(scene)).toContain("OUT_OF_BOUNDS:rug");
});
