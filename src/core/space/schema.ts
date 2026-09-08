import { z } from "zod";
import { OBJECT_KINDS } from "./catalog";

export const SPACE_VERSION = "space-1.0.0" as const;
export const ID = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
const metre = z.number().finite().min(0.1).max(20);
export const WallSchema = z.enum(["top", "right", "bottom", "left"]);
export const OrientationSchema = z.object({ northDegrees: z.number().min(0).lt(360), source: z.enum(["manual", "sensor"]), confirmed: z.boolean() }).strict();
export const SpatialObjectSchema = z.object({
  id: ID, kind: z.enum(OBJECT_KINDS),
  x: z.number().finite().min(0).max(20), z: z.number().finite().min(0).max(20),
  width: metre, depth: metre, height: z.number().min(0.005).max(4),
  rotation: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]),
  dimensionSource: z.enum(["estimated", "confirmed", "user_corrected"]).optional(),
  movable: z.boolean(), confidence: z.number().min(0).max(1),
}).strict();
export const OpeningSchema = z.object({ id: ID, wall: WallSchema, offset: z.number().min(0).max(20), width: z.number().min(0.4).max(10), height: z.number().min(0.4).max(3).optional(), sill: z.number().min(0).max(2).optional() }).strict();
export const RoomSchema = z.object({ width: z.number().min(2).max(20), depth: z.number().min(2).max(20), height: z.number().min(2).max(4) }).strict();
const MeasurementSchema = z.object({ status: z.enum(["estimated", "confirmed", "user_corrected"]), confidence: z.number().min(0).max(1) }).strict();
export const MeasurementsSchema = z.object({ origin: z.enum(["example", "photo", "manual"]), width: MeasurementSchema, depth: MeasurementSchema, height: MeasurementSchema, reference: z.object({ axis: z.enum(["width", "depth"]), metres: z.number().min(2).max(20) }).strict().nullable() }).strict();
export const CalibrationSourceSchema = z.object({ room: RoomSchema, objects: z.array(SpatialObjectSchema).max(20), doors: z.array(OpeningSchema).max(4), windows: z.array(OpeningSchema).max(8) }).strict();
export const ImageEvidenceSchema = z.object({
  imageIndex: z.number().int().min(0).max(5),
  usable: z.boolean(),
  view: z.enum(["overview", "opposite", "doorway", "window", "floor_wall", "plan", "unknown"]),
  observesRoomBoundary: z.boolean(),
  observedObjectIds: z.array(ID).max(20),
}).strict();
export const CrossViewEvidenceSchema = z.object({
  matchedViews: z.number().int().min(0).max(6),
  geometryConsistency: z.number().min(0).max(1),
  lightingRisk: z.number().min(0).max(1),
  perspectiveRisk: z.number().min(0).max(1),
  occlusionRisk: z.number().min(0).max(1),
  scaleEvidence: z.enum(["none", "visual", "measured_reference", "plan"]),
}).strict();
export const SceneSchema = z.object({
  version: z.literal(SPACE_VERSION), room: RoomSchema, measurements: MeasurementsSchema.optional(), calibrationSource: CalibrationSourceSchema.optional(),
  walls: z.array(WallSchema).length(4), doors: z.array(OpeningSchema).min(1).max(4), windows: z.array(OpeningSchema).max(8),
  objects: z.array(SpatialObjectSchema).min(1).max(20), orientation: OrientationSchema,
  confirmed: z.boolean(),
}).strict();
// No actions or arbitrary text enter this provider contract. Geometry is checked separately.
export const ObservationSchema = z.object({
  room: RoomSchema.nullable(), doors: z.array(OpeningSchema.omit({ height: true, sill: true })).max(4), windows: z.array(OpeningSchema.omit({ height: true, sill: true })).max(8),
  objects: z.array(SpatialObjectSchema.omit({ dimensionSource: true })).max(20), confidence: z.number().min(0).max(1),
  imageEvidence: z.array(ImageEvidenceSchema).min(2).max(6),
  crossView: CrossViewEvidenceSchema,
  missing: z.array(z.enum(["dimensions", "door", "window", "objects", "multiple_rooms", "irregular_room", "cross_view", "low_light", "blur", "occlusion", "perspective", "scale_reference"])).max(8),
}).strict();
export const EvidenceTypeSchema = z.enum(["traditional", "practical", "personal"]);
export const ActionSchema = z.object({
  type: z.enum(["move", "rotate", "remove_suggestion", "add_suggestion", "observe"]),
  objectId: ID.nullable(), x: z.number().min(0).max(20).nullable(), z: z.number().min(0).max(20).nullable(),
  rotation: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]).nullable(),
}).strict();
export const RecommendationSchema = z.object({
  id: ID, ruleId: ID, evidence_type: EvidenceTypeSchema, confidence: z.number().min(0).max(1),
  rationale: z.string().min(1).max(800), action: ActionSchema,
}).strict();
export const AnalysisSchema = z.object({
  version: z.literal(SPACE_VERSION), current: SceneSchema, recommended: SceneSchema,
  recommendations: z.array(RecommendationSchema).max(5), warnings: z.array(z.string().max(200)).max(20),
  personalSources: z.array(z.string().max(160)).max(5),
}).strict();
export const ProjectInputSchema = z.object({ title: z.string().trim().min(1).max(60), goal: z.enum(["rest", "focus", "balance"]), locale: z.enum(["ko", "en"]) }).strict();
export const AnalyzeInputSchema = z.object({ scene: SceneSchema, requestId: z.uuid(), reportId: z.string().max(120).nullable(), usePatterns: z.boolean() }).strict();
export const ExtractInputSchema = z.object({ requestId: z.uuid(), orientation: OrientationSchema, aiConsent: z.literal(true), captureConfirmed: z.literal(true) }).strict();
export const ChangeInputSchema = z.object({ runId: z.uuid(), recommendationId: ID, applied: z.boolean() }).strict();
export const CheckInputSchema = z.object({ runId: z.uuid(), requestId: z.uuid(), outcome: z.enum(["helpful", "unchanged", "unhelpful"]), note: z.string().trim().max(500), days: z.union([z.literal(30), z.literal(90)]) }).strict();
export type Scene = z.infer<typeof SceneSchema>;
export type SpatialObject = z.infer<typeof SpatialObjectSchema>;
export type Opening = z.infer<typeof OpeningSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type Analysis = z.infer<typeof AnalysisSchema>;
export type Goal = z.infer<typeof ProjectInputSchema>["goal"];

export function manualScene(): Scene {
  return { version: SPACE_VERSION, measurements: estimatedMeasurements("example"), room: { width: 4, depth: 5, height: 2.5 }, walls: ["top", "right", "bottom", "left"],
    doors: [{ id: "door_1", wall: "bottom", offset: 0.3, width: 0.9 }], windows: [{ id: "window_1", wall: "top", offset: 2, width: 1.2 }],
    objects: [{ id: "bed_1", kind: "bed", x: 1, z: 2, width: 1.4, depth: 2, height: 1.05, rotation: 0, movable: true, confidence: 1 },
      { id: "desk_1", kind: "desk", x: 3, z: 3, width: 1.2, depth: 0.6, height: 0.75, rotation: 0, movable: true, confidence: 1 }],
    orientation: { northDegrees: 0, source: "manual", confirmed: false }, confirmed: false };
}

export function estimatedMeasurements(origin: "example" | "photo" | "manual", confidence = 0) {
  return MeasurementsSchema.parse({ origin, width: { status: "estimated", confidence }, depth: { status: "estimated", confidence }, height: { status: "estimated", confidence }, reference: null });
}
