import { manualScene, type Scene, type SpatialObject } from "./schema";
export const SPACE_EXAMPLES = ["small_bedroom", "large_bedroom", "living_room", "living_kitchen", "difficult_window", "narrow_room", "dense_room", "sparse_room"] as const;
export type SpaceExample = typeof SPACE_EXAMPLES[number];
export function spaceExample(name: SpaceExample): Scene {
  const scene = manualScene();
  const object = (id: string, kind: SpatialObject["kind"], x: number, z: number, width: number, depth: number, height: number): SpatialObject => ({ id, kind, x, z, width, depth, height, rotation: 0, movable: true, confidence: 1, dimensionSource: "confirmed" });
  if (name === "small_bedroom") {
    scene.room = { width: 5.4, depth: 6.2, height: 2.75 };
    scene.objects = [
      object("bed_1", "bed", 1.8, 2.1, 1.65, 2.15, 1.08),
      object("nightstand_1", "nightstand", 2.92, 1.4, .5, .42, .58),
      object("desk_1", "desk", 1.1, 4.9, 1.35, .68, .76),
      { ...object("chair_1", "office_chair", 1.1, 4.0, .65, .65, 1.05), rotation: 180 },
      object("wardrobe_1", "wardrobe", 4.68, 1.62, 1.3, .55, 2.05),
      object("plant_1", "plant", 4.05, .62, .62, .62, 1.3),
      object("rug_1", "rug", 2.0, 2.6, 3.35, 3.4, .012),
      object("lamp_1", "lighting", 3.45, .72, .45, .45, 1.6),
    ];
    scene.windows[0] = { id: "window_1", wall: "top", offset: 2.9, width: 1.75, sill: .78, height: 1.45 };
  }
  if (name === "large_bedroom") { scene.room = { width: 6, depth: 7, height: 2.8 }; scene.objects = [object("bed_1", "bed", 2, 2, 1.7, 2.15, 1.1), object("desk_1", "desk", 4.9, 4.8, 1.4, .7, .76), object("sofa_1", "sofa", 3.2, 5.8, 2.2, .9, .85), object("plant_1", "plant", 5.2, 1, .65, .65, 1.3)]; scene.windows[0] = { id: "window_1", wall: "top", offset: 3.5, width: 1.6, sill: .8, height: 1.4 }; }
  if (name === "living_room") { scene.room = { width: 6.6, depth: 5.6, height: 2.75 }; scene.objects = [object("sofa_1", "sofa", 2.05, 1.25, 2.55, 1.02, .9), object("table_1", "coffee_table", 2.55, 3.0, 1.3, .68, .43), object("storage_1", "cabinet", 5.86, .52, 1.3, .42, .88), object("tv_1", "tv", 5.88, 1.22, 1.05, .3, .92), object("plant_1", "plant", 4.55, .72, .65, .65, 1.3), object("rug_1", "rug", 2.75, 2.75, 3.9, 3.45, .012), { ...object("chair_1", "lounge_chair", 4.15, 2.15, .827, .570, .686), rotation: 90 }, object("lamp_1", "lighting", .45, 2.15, .42, .42, 1.6), object("bookshelf_1", "bookshelf", 1.3, .4, .9, .34, 1.85)]; scene.windows[0] = { id: "window_1", wall: "top", offset: 3.8, width: 1.8, sill: .8, height: 1.45 }; }
  if (name === "living_kitchen") { scene.room = { width: 7.2, depth: 5.4, height: 2.7 }; scene.objects = [object("sofa_1", "sofa", 1.7, 1.35, 2.4, 1, .9), object("table_1", "coffee_table", 2.1, 2.8, 1.2, .65, .42), object("rug_1", "rug", 2.1, 2.35, 3.3, 2.8, .012), object("dining_1", "dining_table", 5.55, 3.3, 1.8, .9, .76), { ...object("chair_1", "dining_chair", 5.55, 2.55, .48, .53, .83), rotation: 180 }, object("chair_2", "dining_chair", 5.55, 4.05, .48, .53, .83), object("cabinet_1", "cabinet", 6.5, .55, 1.1, .4, .85), object("plant_1", "plant", .5, 4.65, .55, .55, 1.2)]; scene.windows = [{ id: "window_1", wall: "top", offset: .8, width: 2.2, sill: .75, height: 1.45 }]; }
  if (name === "difficult_window") { scene.room = { width: 4.2, depth: 5.8, height: 2.6 }; scene.objects = [object("bed_1", "bed", 1.15, 2, 1.5, 2.1, 1.05), { ...object("desk_1", "desk", 3.42, 1.1, 1.25, .62, .76), rotation: 90 }, object("wardrobe_1", "wardrobe", 3.25, 4.85, 1.5, .58, 2.1), object("nightstand_1", "nightstand", 2.15, 1.15, .45, .4, .55), object("lamp_1", "lighting", .45, 4.9, .42, .42, 1.6)]; scene.windows = [{ id: "window_1", wall: "right", offset: .55, width: 1.8, sill: .62, height: 1.55 }, { id: "window_2", wall: "top", offset: 2.65, width: 1.1, sill: 1.05, height: 1 }]; }
  if (name === "narrow_room") { scene.room = { width: 2.7, depth: 5.5, height: 2.5 }; scene.objects = [object("bed_1", "bed", 1, 1.5, 1, 2, 1.05), object("desk_1", "desk", 2.1, 4.3, .9, .45, .76)]; scene.windows[0] = { id: "window_1", wall: "top", offset: 1.5, width: .9, sill: .9, height: 1.1 }; }
  if (name === "dense_room") { scene.room = { width: 5, depth: 6, height: 2.6 }; scene.objects = [object("bed_1", "bed", 1.1, 1.4, 1.4, 2, 1.05), object("desk_1", "desk", 3.8, 1.6, 1.2, .6, .76), object("storage_1", "storage", 4.4, 4, 1, .4, 1.3), object("sofa_1", "sofa", 2.6, 4.8, 2.2, .9, .85), object("plant_1", "plant", 4.4, .6, .6, .6, 1.2)]; scene.windows[0] = { id: "window_1", wall: "top", offset: 2.5, width: 1.5, sill: .9, height: 1.2 }; }
  if (name === "sparse_room") { scene.room = { width: 4.5, depth: 5, height: 2.7 }; scene.objects = [object("desk_1", "desk", 2.2, 2.4, 1.5, .75, .76), object("plant_1", "plant", 3.8, 1, .6, .6, 1.3)]; }
  return scene;
}
