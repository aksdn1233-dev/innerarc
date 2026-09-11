import { z } from "zod";
import { SceneSchema, SPACE_VERSION, estimatedMeasurements, type Action, type Scene } from "./schema";
import { OBJECT_KINDS } from "./catalog";

const Id = z.string().regex(/^[a-z0-9_-]{1,64}$/);
const RectangleSchema = z.object({ x: z.number().min(0).max(30), z: z.number().min(0).max(30), width: z.number().min(.2).max(30), depth: z.number().min(.2).max(30) }).strict();
const MobilitySchema = z.enum(["movable", "semi_fixed", "fixed"]);
const VariantSchema = z.enum(["standard", "mirrored", "balcony_expanded", "mirrored_balcony_expanded"]);
export const TemplateEvidenceStatusSchema = z.enum(["CONFIRMED", "LIKELY", "ESTIMATED", "CONFLICT", "UNKNOWN"]);
const StructuralObjectSchema = RectangleSchema.extend({ id: Id, kind: z.enum(OBJECT_KINDS), height: z.number().min(.01).max(4), rotation: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]), mobility: MobilitySchema }).strict();
const StructuralRoomSchema = RectangleSchema.extend({ id: Id, kind: z.enum(["living_kitchen", "bedroom", "bathroom", "utility", "entrance", "balcony"]), labelKo: z.string().min(1).max(30), labelEn: z.string().min(1).max(40) }).strict();
const StructuralOpeningSchema = z.object({ id: Id, roomId: Id, type: z.enum(["door", "window"]), wall: z.enum(["top", "right", "bottom", "left"]), offset: z.number().min(0).max(30), width: z.number().min(.4).max(10), height: z.number().min(.4).max(3), sill: z.number().min(0).max(2).optional() }).strict();
const PointSchema = z.object({ id: Id, kind: z.string().min(1).max(40), x: z.number().min(0).max(30), z: z.number().min(0).max(30) }).strict();
const WallSegmentSchema = z.object({ id: Id, x1:z.number().min(0).max(30),z1:z.number().min(0).max(30),x2:z.number().min(0).max(30),z2:z.number().min(0).max(30),structural:z.boolean() }).strict();
const FixtureSchema = RectangleSchema.extend({ id:Id, kind:z.enum(["sink_cabinet","sink_bowl","cooktop","range_hood","dishwasher","refrigerator","kimchi_refrigerator","pantry","tall_cabinet","island","utility_entrance","kitchen_window"]), height:z.number().min(.01).max(4),present:z.boolean(),mobility:MobilitySchema }).strict();
const BuiltInSchema = RectangleSchema.extend({id:Id,kind:z.enum(["wardrobe","shoe_cabinet","pantry","utility_cabinet","fixed_shelving","air_conditioner_point"]),height:z.number().min(.01).max(4),mobility:z.literal("fixed")}).strict();
const BathroomFixtureSchema = RectangleSchema.extend({id:Id,kind:z.enum(["vanity","shower_booth","bathtub","toilet"]),height:z.number().min(.01).max(4),mobility:z.literal("fixed")}).strict();
const DimensionEvidenceSchema=z.object({entityId:Id,dimension:z.enum(["width","depth","height","offset"]),value:z.number().positive().max(30),unit:z.literal("m"),source:z.enum(["template_estimate","public_plan","photo","user_measurement"]),confidence:z.number().min(0).max(1)}).strict();
const KitchenTemplateSchema = z.object({ layout: z.enum(["one_wall", "galley", "l_shape", "u_shape", "island"]), fixtures:z.array(FixtureSchema).length(12), sinkId: Id, sinkBowlId:Id,cooktopId: Id,rangeHoodId:Id,dishwasherId:Id,refrigeratorId: Id,kimchiRefrigeratorId:Id,pantryId:Id,tallCabinetId:Id,islandId:Id,utilityRoomEntranceId:Id,kitchenWindowId:Id, plumbingPointId: Id,drainagePointId:Id, ventilationPointId: Id,diningRelationship:z.enum(["open","adjacent","island_facing"]) }).strict();
const ProvenanceSchema = z.object({ sourceType: z.literal("project_owned_synthetic"), label: z.string().min(1).max(100), verificationLevel: z.number().int().min(0).max(4), realComplexClaim: z.literal(false) }).strict();
export const ResidentialTemplateSchema = z.object({
  id: Id, structuralId: Id, version: z.string().regex(/^\d+\.\d+\.\d+$/), residenceType: z.enum(["apartment", "villa", "officetel", "detached_house", "studio", "one_bedroom"]),
  country:z.literal("KR"),brand: z.null(), complex: z.null(), building: z.null(), unitType: z.string().min(1).max(40), areaClass: z.union([z.literal(39), z.literal(49), z.literal(59), z.literal(74), z.literal(84), z.literal(101), z.literal(114)]),
  bayCount: z.number().int().min(2).max(5), planShape: z.enum(["slab", "tower", "mixed", "duplex"]), ventilation: z.enum(["cross", "corner", "single_side", "unknown"]), floor: z.object({ width: z.number().min(3).max(30), depth: z.number().min(3).max(30), height: z.number().min(2).max(4) }).strict(),
  rooms: z.array(StructuralRoomSchema).min(1).max(20),walls:z.array(WallSegmentSchema).min(4).max(40), openings: z.array(StructuralOpeningSchema).min(1).max(30), objects: z.array(StructuralObjectSchema).min(1).max(40),builtIns:z.array(BuiltInSchema).max(20),bathroomFixtures:z.array(BathroomFixtureSchema).max(20), kitchen: KitchenTemplateSchema,
  plumbingPoints: z.array(PointSchema).min(2).max(10), utilityPoints: z.array(PointSchema).min(1).max(10),measurements:z.array(DimensionEvidenceSchema).min(3).max(60), balconies: z.array(RectangleSchema.extend({ id: Id }).strict()).max(4), supportedVariants: z.array(VariantSchema).min(2).max(4),
  orientation: z.object({ northDegrees: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]), source: z.literal("template_estimate") }).strict(), camera: z.object({ x: z.number(), y: z.number(), z: z.number(), targetX: z.number(), targetZ: z.number() }).strict(),
  provenance: ProvenanceSchema,
}).strict();

export const ResidentialMatchInputSchema = z.object({
  residenceType: ResidentialTemplateSchema.shape.residenceType,
  areaClass: ResidentialTemplateSchema.shape.areaClass.optional(), unitType: z.string().trim().max(40).optional(), roomCount: z.number().int().min(1).max(8).optional(), bayCount: z.number().int().min(2).max(5).optional(),
  planShape: ResidentialTemplateSchema.shape.planShape.optional(), ventilation: ResidentialTemplateSchema.shape.ventilation.optional(), kitchenLayout: KitchenTemplateSchema.shape.layout.optional(), mirrored: z.boolean().optional(), expanded: z.boolean().optional(),
}).strict();
export const TemplateSelectionInputSchema = z.object({
  templateId: Id, templateVersion: z.string().regex(/^\d+\.\d+\.\d+$/), variant: VariantSchema,
  matchScore: z.number().int().min(0).max(100), evidenceStatus: TemplateEvidenceStatusSchema,
  privateResidence: z.object({ complexName: z.string().trim().max(60), buildingLabel: z.string().trim().max(20), unitType: z.string().trim().max(40) }).strict(),
}).strict();
export const TemplateCorrectionInputSchema = z.object({
  templateId: Id, templateVersion: z.string().regex(/^\d+\.\d+\.\d+$/), requestId: z.uuid(),
  correction: z.object({ field: z.enum(["mirror", "expansion", "room_count", "opening", "fixed_fixture", "measurement", "other"]), note: z.string().trim().min(1).max(500) }).strict(),
}).strict();
export type ResidentialTemplate = z.infer<typeof ResidentialTemplateSchema>;
export type ResidentialMatchInput = z.infer<typeof ResidentialMatchInputSchema>;
export type TemplateVariant = z.infer<typeof VariantSchema>;
export type TemplateEvidenceStatus = z.infer<typeof TemplateEvidenceStatusSchema>;
export type TemplateCandidate = { template: ResidentialTemplate; variant: TemplateVariant; matchScore: number; evidenceStatus: TemplateEvidenceStatus; matched: string[]; conflicts: string[] };
export type MatchQuestion = { id: "mirror" | "kitchen" | "expansion" | "utility"; ko: string; en: string; options: { value: string; ko: string; en: string }[] };

const areaSpecs: [number, number, "slab" | "tower" | "mixed", "one_wall" | "galley" | "l_shape" | "u_shape" | "island", number][] = [
  [39,2,"tower","one_wall",2],[39,2,"slab","galley",2],
  [49,2,"tower","one_wall",2],[49,3,"slab","galley",2],[49,3,"mixed","l_shape",2],
  [59,3,"slab","galley",3],[59,3,"slab","l_shape",3],[59,3,"tower","one_wall",3],[59,3,"mixed","l_shape",3],[59,4,"slab","galley",3],
  [74,3,"slab","l_shape",3],[74,4,"slab","galley",3],[74,3,"tower","u_shape",3],[74,4,"mixed","l_shape",3],
  [84,3,"slab","l_shape",3],[84,4,"slab","galley",3],[84,4,"slab","island",3],[84,3,"tower","u_shape",3],[84,4,"mixed","l_shape",3],[84,5,"slab","galley",4],
  [101,4,"slab","island",4],[101,4,"tower","u_shape",4],[101,5,"mixed","l_shape",4],
  [114,4,"slab","island",4],[114,5,"tower","u_shape",4],
] as const;

function q(value: number) { return Math.round(value * 1000) / 1000; }
function createTemplate(index: number, area: number, bayCount: number, planShape: "slab" | "tower" | "mixed" | "duplex", kitchenLayout: "one_wall" | "galley" | "l_shape" | "u_shape" | "island", roomCount: number, residenceType: ResidentialTemplate["residenceType"] = "apartment"): ResidentialTemplate {
  const width = q(Math.max(4.8, Math.sqrt(area) * .82));
  const depth = q(Math.max(5.4, area / width));
  const livingDepth = q(Math.min(depth, Math.max(5.2, depth * .62)));
  const livingWidth = width;
  const label = `${area}㎡ ${bayCount}Bay ${planShape}`;
  const objects: ResidentialTemplate["objects"] = [
    { id:"sofa_1",kind:"sofa",x:q(width*.32),z:q(livingDepth*.55),width:2.2,depth:.95,height:.85,rotation:90,mobility:"movable" },
    { id:"coffee_1",kind:"coffee_table",x:q(width*.53),z:q(livingDepth*.55),width:1.05,depth:.55,height:.4,rotation:90,mobility:"movable" },
    { id:"tv_1",kind:"tv",x:q(width-.35),z:q(livingDepth*.55),width:1.2,depth:.3,height:1.05,rotation:270,mobility:"semi_fixed" },
    { id:"dining_1",kind:"dining_table",x:q(width-.9),z:1.5,width:1.45,depth:.8,height:.76,rotation:90,mobility:"movable" },
    { id:"plant_1",kind:"plant",x:q(width-.45),z:q(livingDepth-.5),width:.5,depth:.5,height:1.1,rotation:0,mobility:"movable" },
    { id:"lighting_1",kind:"lighting",x:.45,z:q(livingDepth-.45),width:.4,depth:.4,height:1.55,rotation:0,mobility:"movable" },
  ];
  const otherRoomDepth = Math.max(.8, depth - livingDepth);
  const bedroomWidth = width / Math.max(1, roomCount);
  const rooms: ResidentialTemplate["rooms"] = [{ id:"living_kitchen",kind:"living_kitchen",labelKo:"거실·주방",labelEn:"Living room & kitchen",x:0,z:0,width:livingWidth,depth:livingDepth }];
  for (let i=0;i<roomCount;i++) { const x=q(i*bedroomWidth); rooms.push({ id:`bedroom_${i+1}`,kind:"bedroom",labelKo:`방 ${i+1}`,labelEn:`Bedroom ${i+1}`,x,z:livingDepth,width:i===roomCount-1?q(width-x):q(bedroomWidth),depth:q(otherRoomDepth) }); }
  const fixture=(id:ResidentialTemplate["kitchen"]["fixtures"][number]["id"],kind:ResidentialTemplate["kitchen"]["fixtures"][number]["kind"],x:number,z:number,w:number,d:number,h:number,present=true,mobility:"fixed"|"semi_fixed"="fixed")=>({id,kind,x,z,width:w,depth:d,height:h,present,mobility});
  const fixtures:ResidentialTemplate["kitchen"]["fixtures"]=[fixture("sink_cabinet","sink_cabinet",.7,.42,.8,.65,.9),fixture("sink_bowl","sink_bowl",.7,.38,.48,.42,.15),fixture("cooktop","cooktop",1.65,.42,.7,.65,.9),fixture("range_hood","range_hood",1.65,.2,.7,.25,.6),fixture("dishwasher","dishwasher",3.55,.42,.6,.65,.9,kitchenLayout!=="one_wall"),fixture("refrigerator","refrigerator",2.65,.48,.9,.75,1.85,true,"semi_fixed"),fixture("kimchi_refrigerator","kimchi_refrigerator",3.75,.48,.75,.75,1.4,area>=74,"semi_fixed"),fixture("pantry","pantry",4.45,.35,.65,.5,2.2,area>=74),fixture("tall_cabinet","tall_cabinet",q(Math.max(.4,width-.55)),.32,.6,.55,2.2),fixture("island","island",q(width*.48),1.45,1.65,.8,.92,kitchenLayout==="island"),fixture("utility_entrance","utility_entrance",q(width-.1),1.5,.2,.8,2.1,true),fixture("kitchen_window","kitchen_window",q(width-.1),.9,.2,1.2,1.4,true)];
  return ResidentialTemplateSchema.parse({
    id:`kr_internal_${String(index+1).padStart(2,"0")}`, structuralId:`kr_dna_${area}_${bayCount}_${planShape}_${index+1}`, version:"1.0.0",country:"KR", residenceType, brand:null, complex:null, building:null, unitType:`${area}${String.fromCharCode(65+(index%3))}`, areaClass:area, bayCount, planShape,
    ventilation: planShape === "slab" ? "cross" : planShape === "tower" ? "corner" : "single_side", floor:{width,depth,height:2.4}, rooms,
    walls:[{id:"wall_top",x1:0,z1:0,x2:width,z2:0,structural:true},{id:"wall_right",x1:width,z1:0,x2:width,z2:depth,structural:true},{id:"wall_bottom",x1:width,z1:depth,x2:0,z2:depth,structural:true},{id:"wall_left",x1:0,z1:depth,x2:0,z2:0,structural:true}],openings:[{id:"entrance_door",roomId:"living_kitchen",type:"door",wall:"bottom",offset:.25,width:.9,height:2.1},{id:"utility_door",roomId:"living_kitchen",type:"door",wall:"right",offset:1.1,width:.8,height:2.1},{id:"living_window",roomId:"living_kitchen",type:"window",wall:"top",offset:q(Math.max(3.3,width-2)),width:1.6,height:1.35,sill:.75}], objects,builtIns:[{id:"shoe_builtin",kind:"shoe_cabinet",x:.55,z:q(livingDepth-.55),width:.9,depth:.4,height:2.1,mobility:"fixed"},{id:"pantry_builtin",kind:"pantry",x:q(width-.45),z:.35,width:.7,depth:.45,height:2.2,mobility:"fixed"}],bathroomFixtures:[{id:"bath_toilet",kind:"toilet",x:.7,z:q(Math.min(depth-.6,livingDepth+.6)),width:.65,depth:.8,height:.8,mobility:"fixed"},{id:"bath_vanity",kind:"vanity",x:1.6,z:q(Math.min(depth-.4,livingDepth+.4)),width:.8,depth:.5,height:.9,mobility:"fixed"}],
    kitchen:{layout:kitchenLayout,fixtures,sinkId:"sink_cabinet",sinkBowlId:"sink_bowl",cooktopId:"cooktop",rangeHoodId:"range_hood",dishwasherId:"dishwasher",refrigeratorId:"refrigerator",kimchiRefrigeratorId:"kimchi_refrigerator",pantryId:"pantry",tallCabinetId:"tall_cabinet",islandId:"island",utilityRoomEntranceId:"utility_entrance",kitchenWindowId:"kitchen_window",plumbingPointId:"kitchen_water",drainagePointId:"kitchen_drain",ventilationPointId:"hood_vent",diningRelationship:kitchenLayout==="island"?"island_facing":"open"}, plumbingPoints:[{id:"kitchen_water",kind:"water_supply",x:.7,z:.15},{id:"kitchen_drain",kind:"drainage",x:.75,z:.15}], utilityPoints:[{id:"hood_vent",kind:"ventilation",x:1.65,z:.15},{id:"fridge_power",kind:"power",x:2.65,z:.15}],measurements:[{entityId:"living_kitchen",dimension:"width",value:livingWidth,unit:"m",source:"template_estimate",confidence:.35},{entityId:"living_kitchen",dimension:"depth",value:livingDepth,unit:"m",source:"template_estimate",confidence:.35},{entityId:"living_kitchen",dimension:"height",value:2.4,unit:"m",source:"template_estimate",confidence:.35}], balconies:[{id:"front_balcony",x:0,z:0,width,depth:.8}], supportedVariants:["standard","mirrored","balcony_expanded","mirrored_balcony_expanded"],
    orientation:{northDegrees:0,source:"template_estimate"},camera:{x:q(width*.92),y:q(Math.max(5.5,width*.82)),z:q(livingDepth*1.12),targetX:q(width*.5),targetZ:q(livingDepth*.45)}, provenance:{sourceType:"project_owned_synthetic",label:`Internal structural sample ${label}`,verificationLevel:0,realComplexClaim:false},
  });
}

const apartmentTemplates = areaSpecs.map((spec,index) => createTemplate(index, spec[0], spec[1], spec[2], spec[3], spec[4]));
const genericSpecs: [ResidentialTemplate["residenceType"],number,number,"slab"|"tower"|"mixed"|"duplex",ResidentialTemplate["kitchen"]["layout"],number][] = [
  ["villa",59,3,"slab","galley",3],["officetel",39,2,"tower","one_wall",1],["detached_house",101,3,"duplex","l_shape",4],["studio",39,2,"mixed","one_wall",1],["one_bedroom",49,2,"mixed","l_shape",1],
];
export const RESIDENTIAL_TEMPLATE_LIBRARY: readonly ResidentialTemplate[] = Object.freeze([...apartmentTemplates, ...genericSpecs.map((spec,i)=>createTemplate(25+i,spec[1],spec[2],spec[3],spec[4],spec[5],spec[0]))]);

function mirrorRotation(rotation: 0|90|180|270): 0|90|180|270 { return rotation === 90 ? 270 : rotation === 270 ? 90 : rotation; }
function mirrorWall(wall: "top"|"right"|"bottom"|"left") { return wall === "left" ? "right" as const : wall === "right" ? "left" as const : wall; }
export function mirrorResidentialTemplate(source: ResidentialTemplate): ResidentialTemplate {
  const template = structuredClone(ResidentialTemplateSchema.parse(source)), w=template.floor.width;
  template.rooms = template.rooms.map(r=>({...r,x:q(w-r.x-r.width)}));
  template.objects = template.objects.map(o=>({...o,x:q(w-o.x),rotation:mirrorRotation(o.rotation)}));
  template.walls=template.walls.map(wall=>({...wall,x1:q(w-wall.x1),x2:q(w-wall.x2)}));
  template.kitchen.fixtures=template.kitchen.fixtures.map(f=>({...f,x:q(w-f.x)})); template.builtIns=template.builtIns.map(f=>({...f,x:q(w-f.x)})); template.bathroomFixtures=template.bathroomFixtures.map(f=>({...f,x:q(w-f.x)}));
  template.openings = template.openings.map(o=>({...o,wall:mirrorWall(o.wall),offset:(o.wall==="top"||o.wall==="bottom")?q(w-o.offset-o.width):o.offset}));
  template.plumbingPoints=template.plumbingPoints.map(p=>({...p,x:q(w-p.x)})); template.utilityPoints=template.utilityPoints.map(p=>({...p,x:q(w-p.x)})); template.balconies=template.balconies.map(b=>({...b,x:q(w-b.x-b.width)}));
  template.orientation.northDegrees=((360-template.orientation.northDegrees)%360) as 0|90|180|270; template.camera.x=q(w-template.camera.x); template.camera.targetX=q(w-template.camera.targetX);
  return ResidentialTemplateSchema.parse(template);
}
export function expandBalconyTemplate(source: ResidentialTemplate): ResidentialTemplate {
  const template=structuredClone(ResidentialTemplateSchema.parse(source)), extra=.6, oldWidth=template.floor.width;
  template.floor.width=q(oldWidth+extra); template.rooms=template.rooms.map(r=>r.id==="living_kitchen"?{...r,width:q(r.width+extra)}:{...r,x:r.x>oldWidth/2?q(r.x+extra):r.x});
  template.objects=template.objects.map(o=>({...o,x:o.x>oldWidth/2?q(o.x+extra):o.x}));
  template.walls=template.walls.map(w=>({...w,x1:w.x1>oldWidth/2?q(w.x1+extra):w.x1,x2:w.x2>oldWidth/2?q(w.x2+extra):w.x2})); template.kitchen.fixtures=template.kitchen.fixtures.map(f=>({...f,x:f.x>oldWidth/2?q(f.x+extra):f.x})); template.builtIns=template.builtIns.map(f=>({...f,x:f.x>oldWidth/2?q(f.x+extra):f.x})); template.bathroomFixtures=template.bathroomFixtures.map(f=>({...f,x:f.x>oldWidth/2?q(f.x+extra):f.x}));
  template.openings=template.openings.map(o=>({...o,offset:(o.wall==="top"||o.wall==="bottom")&&o.offset>oldWidth/2?q(o.offset+extra):o.offset}));
  template.plumbingPoints=template.plumbingPoints.map(p=>({...p,x:p.x>oldWidth/2?q(p.x+extra):p.x})); template.utilityPoints=template.utilityPoints.map(p=>({...p,x:p.x>oldWidth/2?q(p.x+extra):p.x}));
  template.balconies=[]; template.camera.x=q(template.camera.x+extra); template.camera.targetX=q(template.camera.targetX+extra/2); return ResidentialTemplateSchema.parse(template);
}
export function templateVariant(source: ResidentialTemplate, variant: TemplateVariant): ResidentialTemplate {
  if(!source.supportedVariants.includes(variant)) throw new Error("UNSUPPORTED_TEMPLATE_VARIANT");
  if(variant==="mirrored") return mirrorResidentialTemplate(source); if(variant==="balcony_expanded") return expandBalconyTemplate(source); if(variant==="mirrored_balcony_expanded") return mirrorResidentialTemplate(expandBalconyTemplate(source)); return ResidentialTemplateSchema.parse(source);
}
export function residentialTemplateIssues(candidate:ResidentialTemplate){const template=ResidentialTemplateSchema.parse(candidate),issues:string[]=[];
  for(const room of template.rooms)if(room.x+room.width>template.floor.width+.001||room.z+room.depth>template.floor.depth+.001)issues.push(`ROOM_BOUNDS:${room.id}`);
  for(const item of template.objects){const rotated=item.rotation===90||item.rotation===270,w=rotated?item.depth:item.width,d=rotated?item.width:item.depth;if(item.x-w/2<-.001||item.z-d/2<-.001||item.x+w/2>template.floor.width+.001||item.z+d/2>template.floor.depth+.001)issues.push(`ELEMENT_BOUNDS:${item.id}`);}
  for(const item of [...template.builtIns,...template.bathroomFixtures,...template.kitchen.fixtures])if(item.x-item.width/2<-.001||item.z-item.depth/2<-.001||item.x+item.width/2>template.floor.width+.001||item.z+item.depth/2>template.floor.depth+.001)issues.push(`ELEMENT_BOUNDS:${item.id}`);
  for(const point of [...template.plumbingPoints,...template.utilityPoints])if(point.x<0||point.z<0||point.x>template.floor.width||point.z>template.floor.depth)issues.push(`POINT_BOUNDS:${point.id}`);
  for(const opening of template.openings){const room=template.rooms.find(r=>r.id===opening.roomId);if(!room||opening.offset+opening.width>(opening.wall==="top"||opening.wall==="bottom"?room.width:room.depth)+.001)issues.push(`OPENING_BOUNDS:${opening.id}`);}
  return issues;}
function score(template: ResidentialTemplate,input:ResidentialMatchInput){ let value=template.residenceType===input.residenceType?38:-100; const matched:string[]=["residenceType"],conflicts:string[]=[];
  const compare=(name:string, actual:unknown, wanted:unknown, points:number)=>{if(wanted===undefined)return;if(actual===wanted){value+=points;matched.push(name);}else{value-=Math.ceil(points*.45);conflicts.push(name);}};
  compare("areaClass",template.areaClass,input.areaClass,24); compare("unitType",template.unitType.toLowerCase(),input.unitType?.toLowerCase(),10); compare("roomCount",template.rooms.filter(r=>r.kind==="bedroom").length,input.roomCount,8); compare("bayCount",template.bayCount,input.bayCount,8); compare("planShape",template.planShape,input.planShape,6); compare("ventilation",template.ventilation,input.ventilation,4); compare("kitchenLayout",template.kitchen.layout,input.kitchenLayout,6);
  const answered=[input.areaClass,input.unitType,input.roomCount,input.bayCount,input.planShape,input.ventilation,input.kitchenLayout].filter(v=>v!==undefined).length; return {value:Math.max(0,Math.min(100,Math.round(value))),matched,conflicts,answered}; }
export function matchResidentialTemplates(candidate: unknown): { candidates: TemplateCandidate[]; questions: MatchQuestion[]; note: string } {
  const input=ResidentialMatchInputSchema.parse(candidate); const ranked=RESIDENTIAL_TEMPLATE_LIBRARY.map(template=>({template,...score(template,input)})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value||a.template.id.localeCompare(b.template.id)).slice(0,3);
  const candidates=ranked.map(item=>({template:item.template,variant:(input.mirrored&&input.expanded?"mirrored_balcony_expanded":input.mirrored?"mirrored":input.expanded?"balcony_expanded":"standard") as TemplateVariant,matchScore:item.value,evidenceStatus:(item.conflicts.length?"CONFLICT":item.answered>=4?"LIKELY":item.answered>=2?"ESTIMATED":"UNKNOWN") as TemplateEvidenceStatus,matched:item.matched,conflicts:item.conflicts}));
  const questions:MatchQuestion[]=[]; const top=candidates.map(c=>c.template);
  if(input.mirrored===undefined)questions.push({id:"mirror",ko:"현관에서 거실을 봤을 때 주방은 어느 쪽인가요?",en:"Facing the living room from the entrance, which side is the kitchen?",options:[{value:"left",ko:"왼쪽",en:"Left"},{value:"right",ko:"오른쪽",en:"Right"},{value:"unknown",ko:"모름",en:"Not sure"}]});
  if(input.kitchenLayout===undefined&&new Set(top.map(t=>t.kitchen.layout)).size>1)questions.push({id:"kitchen",ko:"싱크대와 조리대 모양은 어느 쪽인가요?",en:"Which kitchen shape matches?",options:[{value:"one_wall",ko:"한 줄",en:"One wall"},{value:"galley",ko:"마주 보는 두 줄",en:"Galley"},{value:"l_shape",ko:"ㄱ자",en:"L-shape"},{value:"u_shape",ko:"ㄷ자",en:"U-shape"},{value:"island",ko:"아일랜드",en:"Island"}]});
  if(input.expanded===undefined)questions.push({id:"expansion",ko:"거실 발코니를 확장했나요?",en:"Is the living-room balcony expanded?",options:[{value:"yes",ko:"확장함",en:"Expanded"},{value:"no",ko:"확장 안 함",en:"Not expanded"},{value:"unknown",ko:"모름",en:"Not sure"}]});
  if(input.roomCount===undefined&&new Set(top.map(t=>t.rooms.filter(r=>r.kind==="bedroom").length)).size>1)questions.push({id:"utility",ko:"침실은 몇 개인가요?",en:"How many bedrooms are there?",options:[1,2,3,4].map(n=>({value:String(n),ko:`${n}개`,en:String(n)}))});
  return {candidates,questions:questions.slice(0,3),note:"MATCH_SCORE is a deterministic field-match score, not a probability or confidence calibration."};
}
export function templateToScene(source: ResidentialTemplate, variant: TemplateVariant, matchScore:number, evidenceStatus:TemplateEvidenceStatus, selectedAt=new Date().toISOString()): Scene {
  const template=templateVariant(source,variant),issues=residentialTemplateIssues(template), room=template.rooms.find(r=>r.kind==="living_kitchen"); if(issues.length)throw new Error(issues[0]);if(!room)throw new Error("PRIMARY_ROOM_MISSING");
  const visibleFixtures=template.kitchen.fixtures.filter(f=>f.present&&["sink_bowl","cooktop","refrigerator"].includes(f.kind)).map(f=>({id:f.id,kind:(f.kind==="sink_bowl"?"sink":f.kind==="cooktop"?"stove":"refrigerator") as "sink"|"stove"|"refrigerator",x:f.x,z:f.z,width:f.width,depth:f.depth,height:f.height,rotation:0 as const,mobility:f.mobility}));
  const localObjects=[...template.objects,...visibleFixtures].filter(o=>o.x>=room.x&&o.x<=room.x+room.width&&o.z>=room.z&&o.z<=room.z+room.depth).slice(0,20).map(o=>({id:o.id,kind:o.kind,x:q(o.x-room.x),z:q(o.z-room.z),width:o.width,depth:o.depth,height:o.height,rotation:o.rotation,movable:o.mobility!=="fixed",mobility:o.mobility,confidence:template.provenance.verificationLevel>=3?1:.55,dimensionSource:"estimated" as const}));
  const openings=template.openings.filter(o=>o.roomId===room.id).map(o=>({id:o.id,wall:o.wall,offset:o.offset,width:o.width,height:o.height,...(o.type==="window"?{sill:o.sill??.75}:{})}));
  const doors=openings.filter(o=>template.openings.find(sourceOpening=>sourceOpening.id===o.id)?.type==="door"),windows=openings.filter(o=>template.openings.find(sourceOpening=>sourceOpening.id===o.id)?.type==="window");
  return SceneSchema.parse({version:SPACE_VERSION,room:{width:room.width,depth:room.depth,height:template.floor.height},measurements:estimatedMeasurements("manual",.35),walls:["top","right","bottom","left"],doors,windows,objects:localObjects,orientation:{northDegrees:template.orientation.northDegrees,source:"manual",confirmed:false},confirmed:false,residentialTemplate:{templateId:template.id,templateVersion:template.version,variant,matchScore,evidenceStatus,selectedAt}});
}
export function mirrorAction(action: Action, roomWidth:number): Action { return {...action,x:action.x===null?null:q(roomWidth-action.x),rotation:action.rotation===null?null:mirrorRotation(action.rotation)}; }
function sceneDifference(expected:Scene,observed:Scene){
  let score=Math.abs(expected.room.width-observed.room.width)/expected.room.width+Math.abs(expected.room.depth-observed.room.depth)/expected.room.depth;
  const openingDifference=(kind:"doors"|"windows")=>{const actual=observed[kind];if(!actual.length)return .25;return expected[kind].reduce((sum,item)=>sum+(actual.some(a=>a.wall===item.wall)?0:.35),0);}; score+=openingDifference("doors")+openingDifference("windows");
  for(const kind of ["sink","stove","refrigerator"] as const){const a=expected.objects.find(o=>o.kind===kind),b=observed.objects.find(o=>o.kind===kind);if(a&&b)score+=Math.min(1,Math.abs(a.x/expected.room.width-b.x/observed.room.width));}
  return q(score);
}
export function verifyTemplateAgainstObservation(templateScene:Scene,observation:Scene){
  const context=templateScene.residentialTemplate;if(!context)throw new Error("TEMPLATE_CONTEXT_REQUIRED");const base=RESIDENTIAL_TEMPLATE_LIBRARY.find(t=>t.id===context.templateId&&t.version===context.templateVersion);if(!base)throw new Error("PINNED_TEMPLATE_UNAVAILABLE");
  const alternate:TemplateVariant=context.variant==="standard"?"mirrored":context.variant==="mirrored"?"standard":context.variant==="balcony_expanded"?"mirrored_balcony_expanded":"balcony_expanded";
  const expected=templateToScene(base,context.variant,context.matchScore,context.evidenceStatus,context.selectedAt),mirrored=templateToScene(base,alternate,context.matchScore,context.evidenceStatus,context.selectedAt); const selectedDifference=sceneDifference(expected,observation),alternateDifference=sceneDifference(mirrored,observation);
  const variant=alternateDifference+.2<selectedDifference?alternate:context.variant; const difference=Math.min(selectedDifference,alternateDifference); const calibrated=observation.measurements?.reference!==null&&observation.measurements?.reference!==undefined;
  const evidenceStatus:TemplateEvidenceStatus=difference>.9?"CONFLICT":calibrated&&difference<.3?"CONFIRMED":difference<.65?"LIKELY":"ESTIMATED";
  const components={room:Math.abs(expected.room.width-observation.room.width)/expected.room.width<.15?"LIKELY":"CONFLICT",doors:observation.doors.some(d=>expected.doors.some(e=>e.wall===d.wall))?"LIKELY":"CONFLICT",windows:observation.windows.length?"LIKELY":"UNKNOWN",kitchen:observation.objects.some(o=>["sink","stove","refrigerator"].includes(o.kind))?(difference<.9?"LIKELY":"CONFLICT"):"UNKNOWN"} as const;
  return {scene:SceneSchema.parse({...observation,residentialTemplate:{...context,variant,evidenceStatus}}),variant,evidenceStatus,selectedDifference,alternateDifference,components,fallbackRecommended:evidenceStatus==="CONFLICT"};
}
export function residentialTemplateCoverage(){return {libraryVersion:"1.0.0",total:RESIDENTIAL_TEMPLATE_LIBRARY.length,apartments:RESIDENTIAL_TEMPLATE_LIBRARY.filter(t=>t.residenceType==="apartment").length,genericFallbacks:RESIDENTIAL_TEMPLATE_LIBRARY.filter(t=>t.residenceType!=="apartment").length,areaClasses:[...new Set(RESIDENTIAL_TEMPLATE_LIBRARY.map(t=>t.areaClass))],verifiedRealComplexes:0,verificationLevels:RESIDENTIAL_TEMPLATE_LIBRARY.reduce<Record<number,number>>((a,t)=>(a[t.provenance.verificationLevel]=(a[t.provenance.verificationLevel]??0)+1,a),{})};}
