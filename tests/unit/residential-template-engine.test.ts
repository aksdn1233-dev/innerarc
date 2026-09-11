import { describe, expect, it } from "vitest";
import { analyzeSpace, applyAction, geometryIssues } from "@/core/space/engine";
import { calibrateScene } from "@/core/space/measurement";
import {
  RESIDENTIAL_TEMPLATE_LIBRARY, expandBalconyTemplate, matchResidentialTemplates, mirrorAction,
  mirrorResidentialTemplate, residentialTemplateCoverage, residentialTemplateIssues, templateToScene, templateVariant, verifyTemplateAgainstObservation,
} from "@/core/space/residential-template";

describe("Korean residential template engine", () => {
  it("loads 25 synthetic apartment DNA samples and five generic fallbacks without real-complex claims", () => {
    const coverage = residentialTemplateCoverage();
    expect(coverage).toMatchObject({ total: 30, apartments: 25, genericFallbacks: 5, verifiedRealComplexes: 0 });
    expect(coverage.areaClasses).toEqual([39, 49, 59, 74, 84, 101, 114]);
    expect(RESIDENTIAL_TEMPLATE_LIBRARY.every(t => t.brand === null && t.complex === null && !t.provenance.realComplexClaim)).toBe(true);
    expect(RESIDENTIAL_TEMPLATE_LIBRARY.flatMap(residentialTemplateIssues)).toEqual([]);
  });

  it("ranks candidates deterministically and labels MATCH_SCORE as a non-probability", () => {
    const input = { residenceType: "apartment" as const, areaClass: 84 as const, bayCount: 4, kitchenLayout: "island" as const };
    const a = matchResidentialTemplates(input), b = matchResidentialTemplates(input);
    expect(a.candidates.map(c => [c.template.id, c.matchScore])).toEqual(b.candidates.map(c => [c.template.id, c.matchScore]));
    expect(a.candidates[0].template.areaClass).toBe(84);
    expect(a.candidates[0].matchScore).toBeGreaterThan(a.candidates.at(-1)!.matchScore);
    expect(a.note).toContain("not a probability");
    expect(a.questions.length).toBeGreaterThanOrEqual(1); expect(a.questions.length).toBeLessThanOrEqual(3);
  });

  it("returns conflict evidence instead of hiding contradictory room information", () => {
    const result = matchResidentialTemplates({ residenceType: "apartment", areaClass: 39, roomCount: 8, bayCount: 5, kitchenLayout: "island" });
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates.every(c => c.evidenceStatus === "CONFLICT" && c.conflicts.length > 0)).toBe(true);
  });

  it("mirrors rooms, openings, fixed kitchen, orientation, camera and actions twice without drift", () => {
    const source = RESIDENTIAL_TEMPLATE_LIBRARY.find(t => t.areaClass === 84)!;
    const once = mirrorResidentialTemplate(source), twice = mirrorResidentialTemplate(once);
    expect(twice).toEqual(source);
    expect(once.kitchen.fixtures.find(o => o.id === source.kitchen.sinkId)?.x).toBeCloseTo(source.floor.width - source.kitchen.fixtures.find(o => o.id === source.kitchen.sinkId)!.x);
    expect(once.camera.x).toBeCloseTo(source.floor.width - source.camera.x);
    expect(mirrorAction({ type: "move", objectId: "sofa_1", x: 2, z: 3, rotation: 90 }, source.floor.width)).toEqual({ type: "move", objectId: "sofa_1", x: source.floor.width - 2, z: 3, rotation: 270 });
  });

  it("applies expansion overrides to floor, living room, openings and balcony", () => {
    const source = RESIDENTIAL_TEMPLATE_LIBRARY[0], expanded = expandBalconyTemplate(source);
    expect(expanded.floor.width).toBeCloseTo(source.floor.width + .6);
    expect(expanded.rooms.find(r => r.id === "living_kitchen")!.width).toBeCloseTo(source.rooms.find(r => r.id === "living_kitchen")!.width + .6);
    expect(expanded.balconies).toHaveLength(0);
    expect(templateVariant(source, "mirrored_balcony_expanded").floor.width).toEqual(expanded.floor.width);
  });

  it("converts every candidate variant into bounded existing renderer scenes", () => {
    for (const template of RESIDENTIAL_TEMPLATE_LIBRARY) for (const variant of template.supportedVariants) {
      const scene = templateToScene(template, variant, 60, "ESTIMATED", "2026-09-12T00:00:00.000Z");
      expect(geometryIssues(scene), `${template.id}/${variant}`).toEqual([]);
      expect(scene.residentialTemplate).toMatchObject({ templateId: template.id, templateVersion: "1.0.0", variant });
    }
  });

  it("keeps kitchen fixtures fixed and rejects impossible move commands", () => {
    const scene = templateToScene(RESIDENTIAL_TEMPLATE_LIBRARY[0], "standard", 50, "ESTIMATED", "2026-09-12T00:00:00.000Z");
    const sink = scene.objects.find(o => o.kind === "sink")!;
    expect(sink).toMatchObject({ mobility: "fixed", movable: false });
    expect(() => applyAction(scene, { type: "move", objectId: sink.id, x: sink.x + 1, z: sink.z, rotation: null })).toThrow("INVALID_ACTION_TARGET");
  });

  it("preserves the pinned template context through measurement calibration and analysis", () => {
    let scene = templateToScene(RESIDENTIAL_TEMPLATE_LIBRARY[10], "mirrored", 82, "LIKELY", "2026-09-12T00:00:00.000Z");
    scene = calibrateScene(scene, "width", scene.room.width + .2);
    expect(scene.residentialTemplate).toMatchObject({ templateId: RESIDENTIAL_TEMPLATE_LIBRARY[10].id, variant: "mirrored" });
    scene.confirmed = true; scene.orientation.confirmed = true;
    const result = analyzeSpace(scene, "balance", "ko");
    expect(result.current.residentialTemplate).toEqual(scene.residentialTemplate);
    expect(result.recommendations.length).toBeLessThanOrEqual(5);
    expect(result.recommendations.every(r => r.action.objectId !== "sink_bowl" && r.action.objectId !== "cooktop")).toBe(true);
  });

  it("models the complete kitchen fixture set as fixed/semi-fixed structural data", () => {
    const kitchen=RESIDENTIAL_TEMPLATE_LIBRARY.find(t=>t.areaClass===84&&t.kitchen.layout==="island")!.kitchen;
    expect(kitchen.fixtures.map(f=>f.kind)).toEqual(["sink_cabinet","sink_bowl","cooktop","range_hood","dishwasher","refrigerator","kimchi_refrigerator","pantry","tall_cabinet","island","utility_entrance","kitchen_window"]);
    expect(kitchen.fixtures.find(f=>f.id===kitchen.sinkId)).toMatchObject({mobility:"fixed",present:true});
    expect(kitchen.fixtures.find(f=>f.id===kitchen.refrigeratorId)?.mobility).toBe("semi_fixed");
    expect(kitchen.plumbingPointId).not.toBe(kitchen.drainagePointId);
  });

  it("tests the mirrored variant before declaring photo evidence a conflict", () => {
    const base=RESIDENTIAL_TEMPLATE_LIBRARY.find(t=>t.areaClass===84&&t.bayCount===4)!;
    const selected=templateToScene(base,"standard",75,"ESTIMATED","2026-09-12T00:00:00.000Z");
    const observed=templateToScene(base,"mirrored",75,"ESTIMATED","2026-09-12T00:00:00.000Z"); delete observed.residentialTemplate;
    const result=verifyTemplateAgainstObservation(selected,observed);
    expect(result.variant).toBe("mirrored"); expect(result.fallbackRecommended).toBe(false);
  });

  it("opens custom fallback when photos materially conflict with every variant", () => {
    const base=RESIDENTIAL_TEMPLATE_LIBRARY.find(t=>t.areaClass===59)!;
    const selected=templateToScene(base,"standard",60,"ESTIMATED","2026-09-12T00:00:00.000Z");
    const observed=structuredClone(selected); observed.room.width=12; observed.room.depth=12; observed.doors=[{id:"different_door",wall:"left",offset:8,width:.9}]; observed.windows=[]; observed.objects=[{...observed.objects.find(o=>o.kind==="sofa")!,x:2,z:2}]; delete observed.residentialTemplate;
    expect(geometryIssues(observed)).toEqual([]);
    const result=verifyTemplateAgainstObservation(selected,observed);
    expect(result.evidenceStatus).toBe("CONFLICT"); expect(result.fallbackRecommended).toBe(true);
  });

  it("keeps old saved geometry stable when a future template object changes", () => {
    const base=RESIDENTIAL_TEMPLATE_LIBRARY[0], saved=templateToScene(base,"standard",50,"ESTIMATED","2026-09-12T00:00:00.000Z");
    const future=structuredClone(base); future.version="2.0.0"; future.objects[0].x+=.4;
    expect(saved.residentialTemplate?.templateVersion).toBe("1.0.0");
    expect(saved.objects).not.toEqual(templateToScene(future,"standard",50,"ESTIMATED","2026-09-12T00:00:00.000Z").objects);
  });
});
