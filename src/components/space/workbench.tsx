"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { z } from "zod";
import { addObjectAtOpenPosition, analyzeSpace, applyAction, geometryIssues } from "@/core/space/engine";
import { AnalysisSchema, manualScene, SceneSchema, estimatedMeasurements, type Analysis, type Goal, type Scene, type SpatialObject } from "@/core/space/schema";
import { SPACE_EXAMPLES, spaceExample, type SpaceExample } from "@/core/space/examples";
import { movementSummary } from "@/core/space/presentation";
import { spatialChanges } from "@/core/space/comparison";
import { calibrateScene } from "@/core/space/measurement";
import { assessPhotoPixels, usablePhotoSet, type PhotoIssue, type PhotoQuality } from "@/core/space/photo-quality";
import styles from "./space.module.css";
import { ELECTRONIC_KINDS, FURNITURE_CATALOG, OBJECT_KINDS, type ObjectKind } from "@/core/space/catalog";
import { buildSpaceGuideNarration } from "@/core/space/narration";
import { withParticle } from "@/core/korean-particles";
import { CardinalDirectionPicker, SpaceOnboardingTour } from "./onboarding-tour";

const RoomView = dynamic(() => import("./room-view"), { ssr: false, loading: () => <p role="status">3D…</p> });
const ProjectSchema = z.object({ id: z.uuid(), title: z.string(), goal: z.enum(["rest", "focus", "balance"]), locale: z.enum(["ko", "en"]) });
type Project = z.infer<typeof ProjectSchema>;
const DetailSchema = z.object({
  project: ProjectSchema, scene: SceneSchema.nullable(), assets: z.array(z.object({ id: z.uuid(), status: z.string(), expires_at: z.string(), pixel_width: z.number().nullable().optional(), pixel_height: z.number().nullable().optional(), quality: z.unknown().optional() })),
  runs: z.array(z.object({ id: z.uuid(), kind: z.string(), status: z.string(), result: z.unknown(), created_at: z.string() })),
  changes: z.array(z.object({ run_id: z.uuid(), recommendation_id: z.string(), applied: z.boolean() })),
  checks: z.array(z.object({ id: z.uuid(), run_id: z.uuid(), outcome: z.string(), note: z.string(), days: z.number(), created_at: z.string() })),
  reports: z.array(z.object({ id: z.string(), title: z.string() })),
});
type Photo = { name: string; blob: Blob; assetId: string | null; quality: PhotoQuality };
const errorCopy: Record<string, [string, string]> = {
  AUTH_REQUIRED: ["로그인이 필요합니다. 내 계정에서 로그인한 뒤 다시 시도하세요.", "Sign in through My account, then retry."],
  SPACE_DISABLED: ["새 분석이 일시 중지되어 있습니다. 저장된 방은 확인·삭제할 수 있습니다.", "New analysis is paused. You can still read or delete saved rooms."],
  RATE_LIMIT_UNAVAILABLE: ["사진 보호 설정을 준비하고 있습니다. 잠시 후 다시 시도하세요.", "Secure processing is not ready. Please try later."],
  TOO_MANY_REQUESTS: ["요청이 많습니다. 사진 분석은 시간당 3회까지입니다. 잠시 후 다시 시도하세요.", "Too many requests. Photo analysis is limited to 3 per hour. Try later."],
  TWO_TO_SIX_IMAGES_REQUIRED: ["사진을 2~6장 선택하세요. 기한이 지난 사진은 다시 올려 주세요.", "Choose 2–6 images. Re-upload expired images."],
  ANALYSIS_IN_PROGRESS: ["분석이 진행 중입니다. 저장된 방을 다시 열어 결과를 확인하세요.", "Analysis is running. Reopen the saved room to check its result."],
  CHECK_NOT_DUE: ["선택한 30일 또는 90일이 지난 뒤 기록할 수 있습니다.", "Return after the selected 30 or 90 days to record a check."],
  PHOTO_QUALITY_UNUSABLE: ["이 사진은 너무 작거나, 거의 비어 있거나, 너무 어둡거나 밝습니다. 원본 카메라 사진을 다시 선택하세요.", "This photo is too small, nearly blank, too dark or too bright. Choose the original camera photo."],
  PHOTO_SET_QUALITY_LOW: ["서로 확인할 수 있는 선명한 사진이 부족합니다. 밝은 전체 사진을 포함해 두 방향 이상 다시 찍어 주세요.", "There are not enough clear cross-checkable photos. Add a bright overview from at least two directions."],
  PHOTO_VIEWS_DUPLICATED: ["같은 사진을 반복해서 올릴 수 없습니다. 방의 반대쪽에서 찍은 사진을 추가해 주세요.", "Duplicate photos cannot establish geometry. Add a photo from the opposite side of the room."],
  NO_CLEAR_PLACEMENT: ["이 방에는 새 물건을 안전하게 놓을 빈자리를 찾지 못했습니다. 가구를 옮기거나 크기를 직접 조정해 주세요.", "No clear place was found for this object. Move furniture or adjust its size manually."],
};
async function api(path: string, body?: unknown, method?: string): Promise<unknown> {
  const response = await fetch(`/api/space/projects${path}`, { method: method ?? (body ? "POST" : "GET"), ...(body ? { headers: { "Content-Type": body instanceof Blob ? "image/jpeg" : "application/json" }, body: body instanceof Blob ? body : JSON.stringify(body) } : {}), cache: "no-store", signal: AbortSignal.timeout(120_000) });
  const result: unknown = await response.json();
  if (!response.ok) throw new Error(z.object({ error: z.string() }).safeParse(result).data?.error ?? "FAILED");
  return result;
}
async function normalizePhoto(file: File): Promise<Photo> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8_000_000 || file.size === 0) throw new Error("PHOTO_FORMAT");
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas"); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d"); if (!context) throw new Error("PHOTO_FORMAT");
    context.fillStyle = "white"; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const quality = assessPhotoPixels(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("PHOTO_FORMAT")), "image/jpeg", 0.86));
    if (blob.size > 3_500_000) throw new Error("PHOTO_FORMAT");
    return { name: file.name, blob, assetId: null, quality };
  } finally { bitmap.close(); }
}
export function SpaceWorkbench({ locale, demo = false, enabled = true, aiReady = false }: { locale: "ko" | "en"; demo?: boolean; enabled?: boolean; aiReady?: boolean }) {
  const ko = locale === "ko";
  const [scene, setScene] = useState<Scene>(() => demo ? spaceExample("small_bedroom") : manualScene());
  const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [selectedId, setSelectedId] = useState<string | null>(null), [undo, setUndo] = useState<Scene[]>([]);
  const originalScene = useRef<Scene>(demo ? spaceExample("small_bedroom") : manualScene());
  const [referenceAxis, setReferenceAxis] = useState<"width" | "depth">("width"), [referenceLength, setReferenceLength] = useState(4);
  const [source, setSource] = useState<"example" | "manual" | "photo" | "saved">("example");
  const [goal, setGoal] = useState<Goal>("balance"), [title, setTitle] = useState(ko ? "나의 방" : "My room");
  const [photos, setPhotos] = useState<Photo[]>([]), [remoteAssets, setRemoteAssets] = useState(0);
  const [consent, setConsent] = useState(false), [captureConfirmed, setCaptureConfirmed] = useState(false), [patternConsent, setPatternConsent] = useState(false), [reportId, setReportId] = useState("");
  const [reports, setReports] = useState<{ id: string; title: string }[]>([]);
  const [projects, setProjects] = useState<Project[]>([]), [projectId, setProjectId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null), [runId, setRunId] = useState<string | null>(null), [runDate, setRunDate] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState<"current" | "compare" | "recommended">("current"), [applied, setApplied] = useState<Record<string, boolean>>({});
  const [activeRecommendation, setActiveRecommendation] = useState(0);
  const [checks, setChecks] = useState<z.infer<typeof DetailSchema>["checks"]>([]);
  const [note, setNote] = useState(""), [days, setDays] = useState<30 | 90>(30), [outcome, setOutcome] = useState("unchanged");
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [error, setError] = useState("");
  const [tourOpen, setTourOpen] = useState(true), [tourPage, setTourPage] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const problems = geometryIssues(scene);
  const requiresReference = scene.measurements?.origin === "photo" && !scene.measurements.reference;
  const validScene = SceneSchema.safeParse(scene).success;
  const words = (a: string, b: string) => ko ? a : b;
  const photoIssueCopy = (issue: PhotoIssue) => ({
    too_small: words("해상도 부족", "resolution too low"), underexposed: words("너무 어두움", "too dark"), overexposed: words("너무 밝음", "too bright"),
    low_contrast: words("대비 부족", "low contrast"), likely_blur: words("흐림 가능성", "possible blur"), low_information: words("공간 정보 부족", "insufficient visual information"),
  })[issue];
  async function task(work: () => Promise<void>) {
    setBusy(true); setError(""); setNow(Date.now());
    try { await work(); } catch (e) {
      const code = e instanceof Error ? e.message : "FAILED";
      setError(errorCopy[code]?.[ko ? 0 : 1] ?? (code === "PHOTO_FORMAT" ? words("JPEG·PNG·WebP 사진만 가능하며, 한 장은 8MB 이하여야 합니다. HEIC는 JPEG로 변환해 주세요.", "Use JPEG, PNG or WebP up to 8 MB each. Convert HEIC to JPEG.") : words("처리하지 못했습니다. 입력을 확인하고 다시 시도하세요. 저장 중이었다면 방을 다시 열어 결과를 확인하세요.", "Could not finish. Check the input and retry. Reopen your room to check whether a save completed.")));
    } finally { setBusy(false); }
  }
  useEffect(() => {
    if (demo) return;
    let disposed = false;
    api("").then(value => { const list = z.object({ projects: z.array(ProjectSchema) }).parse(value); if (!disposed) setProjects(list.projects); }).catch(() => { if (!disposed) setError(ko ? "저장된 방을 불러오지 못했습니다. 다시 불러오기를 눌러 주세요." : "Could not load saved rooms. Use Reload."); });
    return () => { disposed = true; };
  }, [demo, ko]);
  function edit(next: Scene) { if (!geometryIssues(scene).length) setUndo(items => [...items, scene].slice(-20)); setScene({ ...next, calibrationSource: undefined, confirmed: false }); setAnalysis(null); setComparisonMode("current"); setRunId(null); setSource("manual"); }
  function pickNorth(northDegrees: 0 | 90 | 180 | 270) {
    setScene(current => ({ ...current, orientation: { northDegrees, source: "manual", confirmed: true }, confirmed: false }));
    setAnalysis(null); setComparisonMode("current"); setRunId(null);
  }
  function addElectronic(kind: (typeof ELECTRONIC_KINDS)[number]) {
    const id = `${kind}_${crypto.randomUUID().slice(0, 8)}`, item = FURNITURE_CATALOG[kind];
    const next = addObjectAtOpenPosition(scene, { id, kind, x: 0, z: 0, width: item.width, depth: item.depth, height: item.height, rotation: 0, confidence: 1, movable: true });
    edit(next); setSelectedId(id); setMessage(words(`${withParticle(item.ko, "object")} 빈자리에 추가했습니다. 3D에서 위치를 확인해 주세요.`, `${item.en} added to an open area. Check its position in 3D.`));
  }
  function clearPrivateDraft() { setUndo([]); setSelectedId(null); originalScene.current = manualScene(); setNote(""); setOutcome("unchanged"); setDays(30); setReportId(""); setPatternConsent(false); setConsent(false); setCaptureConfirmed(false); setRunDate(null); }
  function editObject(id: string, patch: Partial<SpatialObject>) { if (patch.width !== undefined || patch.depth !== undefined || patch.height !== undefined) patch.dimensionSource = "user_corrected"; edit({ ...scene, objects: scene.objects.map(o => o.id === id ? { ...o, ...patch } : o) }); }
  async function ensureProject() {
    if (projectId) return projectId;
    const result = z.object({ project: ProjectSchema }).parse(await api("", { title, goal, locale }));
    setProjectId(result.project.id); setProjects(current => [result.project, ...current]);
    const detail = DetailSchema.parse(await api(`/${result.project.id}`)); setReports(detail.reports);
    return result.project.id;
  }
  async function load(id: string) {
    const detail = DetailSchema.parse(await api(`/${id}`));
    clearPrivateDraft();
    setProjectId(id); setTitle(detail.project.title); setGoal(detail.project.goal); setPhotos([]); setRemoteAssets(detail.assets.filter(a => a.status === "ready").length); setReports(detail.reports); setChecks(detail.checks);
    const extraction = detail.runs.find(r => r.kind === "extract" && r.status === "complete");
    const savedAnalysis = detail.runs.find(r => r.kind === "analyze" && r.status === "complete");
    const extractionNewer = !!extraction && (!savedAnalysis || extraction.created_at > savedAnalysis.created_at);
    const latest = extractionNewer ? undefined : savedAnalysis;
    const parsed = AnalysisSchema.safeParse(latest?.result);
    setAnalysis(parsed.success ? parsed.data : null); setRunId(parsed.success ? latest!.id : null); setRunDate(parsed.success ? latest!.created_at : null); setComparisonMode("current");
    const extracted = z.object({ scene: SceneSchema }).safeParse(extraction?.result);
    const restored = extractionNewer && extracted.success ? extracted.data.scene : detail.scene ?? manualScene(); originalScene.current = restored; setScene(restored); setSource(detail.scene || extracted.success ? "saved" : "example");
    setApplied(Object.fromEntries(detail.changes.filter(c => c.run_id === latest?.id).map(c => [c.recommendation_id, c.applied])));
    setMessage(words("저장된 방을 불러왔습니다.", "Saved room loaded."));
  }
  async function extract() {
    if (!scene.orientation.confirmed) throw new Error("CONFIRM_NORTH");
    if (!captureConfirmed) throw new Error("PHOTO_SET_QUALITY_LOW");
    if (photos.length >= 2 && !usablePhotoSet(photos.map(photo => photo.quality))) throw new Error("PHOTO_SET_QUALITY_LOW");
    const count = remoteAssets + photos.filter(p => !p.assetId).length;
    if (count < 2 || count > 6) throw new Error("TWO_TO_SIX_IMAGES_REQUIRED");
    const id = await ensureProject();
    for (let index = 0; index < photos.length; index++) {
      const photo = photos[index]; if (photo.assetId) continue;
      setMessage(words(`사진 ${index + 1}/${photos.length} 보호 처리 중…`, `Securing photo ${index + 1}/${photos.length}…`));
      const uploaded = z.object({ asset: z.object({ id: z.uuid(), quality: z.unknown() }) }).parse(await api(`/${id}/uploads`, photo.blob));
      setPhotos(current => current.map((p, i) => i === index ? { ...p, assetId: uploaded.asset.id } : p));
      setRemoteAssets(current => current + 1);
    }
    setMessage(words("사진에서 방 구조를 읽는 중입니다. 잠시 기다려 주세요.", "Reading the room structure from your photos…"));
    const response = z.object({ result: z.object({ scene: SceneSchema.nullable(), reason: z.string().nullable() }) }).parse(await api(`/${id}/extract`, { requestId: crypto.randomUUID(), orientation: scene.orientation, aiConsent: true, captureConfirmed: true }));
    if (!response.result.scene) {
      setScene(current => ({ ...current, confirmed: false }));
      setSource("manual"); setMessage(words("사진을 신뢰할 수 있는 구조로 읽지 못했습니다. 아래 예시를 실제 방에 맞게 수정해 주세요. 사진 분석 결과로 표시하지 않습니다.", "The photos could not be read reliably. Edit the example to match your room; it is not a photo reconstruction."));
    } else { originalScene.current = response.result.scene; setScene(response.result.scene); setUndo([]); setSource("photo"); setMessage(words("사진에서 읽은 초안입니다. 크기·문·가구 위치를 확인하고 잘못된 부분을 수정해 주세요.", "This is a draft from your photos. Verify measurements, doors and furniture before proceeding.")); }
    setAnalysis(null); setRunId(null); setComparisonMode("current");
  }
  async function analyze() {
    const local = analyzeSpace(scene, goal, locale);
    if (demo) { setAnalysis(local); setRunId(null); setApplied({}); setMessage(words("예시 분석입니다. 계정에 저장되지 않습니다.", "Demo analysis; nothing is saved to an account.")); return; }
    const id = await ensureProject();
    const response = z.object({ runId: z.uuid(), result: AnalysisSchema }).parse(await api(`/${id}/analyze`, { scene, requestId: crypto.randomUUID(), reportId: reportId || null, usePatterns: patternConsent }));
    setAnalysis(response.result); setRunId(response.runId); setRunDate(new Date().toISOString()); setApplied({}); setMessage(words("분석과 방 구조를 내 계정에 저장했습니다.", "Analysis and room structure saved to your account."));
  }
  const kindName = (kind: string) => FURNITURE_CATALOG[kind as ObjectKind]?.[ko ? "ko" : "en"] ?? kind;
  const comparisonChanges = analysis ? spatialChanges(analysis.current, analysis.recommended) : [];
  const activeGuide = analysis?.recommendations[activeRecommendation]
    ? buildSpaceGuideNarration(
      analysis.recommendations[activeRecommendation],
      comparisonMode === "recommended" ? analysis.recommended : analysis.current,
      kindName(analysis.current.objects.find(object => object.id === analysis.recommendations[activeRecommendation].action.objectId)?.kind ?? ""),
      locale,
    )
    : null;
  const comparisonSummary = (change: (typeof comparisonChanges)[number]) => {
    const parts: string[] = [];
    if (change.distance > .001) parts.push(movementSummary(analysis!.current, { type: "move", objectId: change.objectId, x: change.to.x, z: change.to.z, rotation: null }, locale));
    if (change.rotationDelta) parts.push(`${words("회전", "rotate")} ${change.rotationDelta}°`);
    return parts.join(" · ");
  };
  const tutorialStep = analysis
    ? 3
    : (!demo && photos.length + remoteAssets < 2)
      ? 0
      : !scene.orientation.confirmed
        ? 1
        : !scene.confirmed
          ? 2
          : 3;
  return <fieldset className={styles.workbench} disabled={busy || !hydrated} data-ready={hydrated}>
    {tourOpen && <SpaceOnboardingTour locale={locale} step={tourPage} northDegrees={scene.orientation.northDegrees} northConfirmed={scene.orientation.confirmed} onStep={setTourPage} onPickNorth={pickNorth} onClose={() => setTourOpen(false)} onStart={() => { setTourOpen(false); requestAnimationFrame(() => document.getElementById("space-guide-photos")?.scrollIntoView({ behavior: "smooth", block: "start" })); }} />}
    <div className={styles.tourLauncher}><p><b>{words("처음이신가요?", "First time?")}</b> {words("사진부터 결과까지 화면을 보며 따라 해보세요.", "Follow the real screens from photos to results.")}</p><button type="button" onClick={() => { setTourPage(0); setTourOpen(true); }}>{words("처음부터 안내 보기 →", "Open guided start →")}</button></div>
    {demo && <label>{words("예시 공간", "Example space")}<select defaultValue="small_bedroom" onChange={e => { if (e.target.value === "irregular_room") { setError(words("비정형 방은 아직 지원하지 않습니다. 직사각형 구역 하나의 치수를 직접 입력하세요. 자동으로 직사각형으로 바꾸지 않습니다.", "Irregular rooms are not supported yet. Enter one measured rectangular zone; we will not silently reshape your room.")); return; } const next = spaceExample(e.target.value as SpaceExample); edit(next); setSource("example"); originalScene.current = next; setUndo([]); setSelectedId(null); setError(""); }}>{SPACE_EXAMPLES.map(name => <option key={name} value={name}>{({ small_bedroom: words("작은 침실", "Small bedroom"), large_bedroom: words("넓은 침실", "Large bedroom"), living_room: words("거실", "Living room"), living_kitchen: words("거실과 주방", "Living room and kitchen"), difficult_window: words("창이 많은 침실", "Bedroom with difficult windows"), narrow_room: words("긴 방", "Narrow room"), dense_room: words("가구가 많은 방", "Dense furniture"), sparse_room: words("가구가 적은 방", "Sparse furniture") })[name]}</option>)}<option value="irregular_room">{words("비정형 방 · 지원 범위 확인", "Irregular room · check support")}</option></select></label>}
    {!demo && <section className={styles.panel} aria-label={words("저장된 방", "Saved rooms")}>
      <div className={styles.actions}><label>{words("저장된 방", "Saved rooms")}<select value={projectId ?? ""} disabled={busy} onChange={e => { if (e.target.value) void task(() => load(e.target.value)); }}><option value="">{words("방 선택", "Choose a room")}</option>{projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
        <button disabled={busy} onClick={() => void task(async () => { const result = z.object({ projects: z.array(ProjectSchema) }).parse(await api("")); setProjects(result.projects); if (projectId) await load(projectId); })}>{words("다시 불러오기", "Reload")}</button>
        <button disabled={busy || !enabled} onClick={() => { clearPrivateDraft(); setProjectId(null); setScene(manualScene()); setAnalysis(null); setPhotos([]); setRemoteAssets(0); setSource("example"); setRunId(null); setReports([]); setReportId(""); setApplied({}); setChecks([]); setComparisonMode("current"); }}>{words("새 방", "New room")}</button>
        {projectId && <button disabled={busy} onClick={() => void task(async () => { const result = z.object({ imageDeletionPending: z.boolean() }).parse(await api(`/${projectId}`, undefined, "DELETE")); setProjects(current => current.filter(p => p.id !== projectId)); clearPrivateDraft(); setProjectId(null); setPhotos([]); setRemoteAssets(0); setScene(manualScene()); setAnalysis(null); setRunId(null); setChecks([]); setMessage(result.imageDeletionPending ? words("방을 삭제했습니다. 비공개 사진의 삭제 확인 작업이 진행 중입니다.", "Room deleted. Private image deletion verification is pending.") : words("방과 사진을 삭제했습니다.", "Room and photos deleted.")); })}>{words("이 방·사진 삭제", "Delete room & photos")}</button>}
        <Link href="/api/account/export" prefetch={false}>{words("내 기록 내보내기", "Export my records")}</Link>
      </div>
    </section>}
    {!enabled && !demo && <p className={styles.status}>{words("새 분석은 일시 중지되어 있습니다. 기존 기록 확인과 삭제는 가능합니다.", "New analysis is paused. Existing records can still be viewed or deleted.")}</p>}
    <div className={styles.layout}>
      <div>
        <section className={styles.panel} data-tour-current={tutorialStep === 2 || (tutorialStep === 3 && !analysis)} id="space-guide-room">
          {(tutorialStep === 2 || (tutorialStep === 3 && !analysis)) && <p className={styles.stepPointer}><b aria-hidden="true">↓</b>{tutorialStep === 2 ? words("지금은 3D와 실제 방을 비교하세요.", "Now compare the 3D draft with your room.") : words("확인이 끝났어요. 아래 분석 버튼을 누르세요.", "Checks are complete. Use the analysis button below.")}</p>}
          <div className={styles.actions}><span className={styles.badge}>{source === "example" ? words("연습용 방", "Example room") : source === "photo" ? words("사진으로 만든 방", "Room from photos") : source === "saved" ? words("저장한 방", "Saved room") : words("직접 만든 방", "Manual room")}</span>
            {analysis && <div className={styles.compareSwitch} aria-label={words("현재와 추천 배치 비교", "Compare current and suggested layouts")}><button aria-pressed={comparisonMode === "current"} onClick={() => setComparisonMode("current")}>{words("현재", "Current")}</button><button aria-pressed={comparisonMode === "compare"} onClick={() => setComparisonMode("compare")}>{words("한눈에 비교", "Compare")}</button><button aria-pressed={comparisonMode === "recommended"} onClick={() => setComparisonMode("recommended")}>{words("추천", "Suggested")}</button></div>}
          </div>
          {analysis && <div className={styles.comparisonSummary} data-comparison-mode={comparisonMode}>
            <div><strong>{comparisonMode === "current" ? words("현재 배치", "Current layout") : comparisonMode === "recommended" ? words("추천 배치", "Suggested layout") : words("현재와 추천을 한눈에", "Current and suggested together")}</strong><span>{comparisonMode === "recommended" ? words("청록 윤곽은 원래 위치입니다.", "Teal outlines mark original positions.") : words("금색 윤곽은 추천 위치입니다.", "Gold outlines mark suggested positions.")}</span></div>
            {comparisonChanges.length ? <ol>{comparisonChanges.map(change => <li key={change.objectId}><span>{kindName(change.kind)}</span><b>{comparisonSummary(change)}</b></li>)}</ol> : <p>{words("좌표나 방향이 바뀐 가구가 없습니다.", "No furniture coordinates or rotations changed.")}</p>}
          </div>}
          {validScene ? <RoomView locale={locale} scene={comparisonMode === "recommended" && analysis ? analysis.recommended : scene} comparisonScene={analysis ? comparisonMode === "recommended" ? analysis.current : analysis.recommended : undefined} comparisonMode={analysis ? comparisonMode : undefined} selectedId={selectedId} onSelect={setSelectedId} guide={activeGuide} /> : <p role="status">{words("크기와 좌표를 올바르게 입력하면 3D가 표시됩니다.", "Enter valid dimensions and coordinates to display 3D.")}</p>}
          <label>{words("가구 선택", "Select furniture")}<select value={selectedId ?? ""} onChange={e => setSelectedId(e.target.value || null)}><option value="">{words("가구를 누르거나 선택하세요", "Tap furniture or choose here")}</option>{scene.objects.map(o => <option key={o.id} value={o.id}>{kindName(o.kind)} · {o.id}</option>)}</select></label>
          <div className={styles.electronicsQuick}>
            <div><h3>{words("빠진 전자기기가 있나요?", "Any electronics missing?")}</h3><p>{words("사진에서 빠진 기기를 골라 3D 방에 바로 추가하세요.", "Add a device the photo draft missed, then check it in 3D.")}</p></div>
            <label><span>{words("전자기기 추가", "Add electronics")}</span><select aria-label={words("전자기기 추가", "Add electronics")} disabled={scene.objects.length >= 20} value="" onChange={e => { const kind = e.target.value as (typeof ELECTRONIC_KINDS)[number]; if (kind) void task(async () => addElectronic(kind)); }}><option value="">{words("기기 선택", "Choose device")}</option>{ELECTRONIC_KINDS.map(kind => <option key={kind} value={kind}>{kindName(kind)}</option>)}</select></label>
          </div>
          {selectedId && <div className={styles.toolbar} aria-label={words("선택한 가구 조정", "Adjust selected furniture")}>
            {([["←", -.1, 0], ["→", .1, 0], ["↑", 0, -.1], ["↓", 0, .1]] as const).map(([label, dx, dz]) => <button key={label} disabled={comparisonMode !== "current" || !scene.objects.find(o => o.id === selectedId)?.movable} aria-label={words(`가구 ${label} 10cm`, `Move furniture ${label} 10cm`)} onClick={() => void task(async () => { const object = scene.objects.find(o => o.id === selectedId)!; edit(applyAction(scene, { type: "move", objectId: selectedId, x: Math.round((object.x + dx) * 1000) / 1000, z: Math.round((object.z + dz) * 1000) / 1000, rotation: null })); })}>{label} 10cm</button>)}
            <button disabled={comparisonMode !== "current" || !scene.objects.find(o => o.id === selectedId)?.movable} onClick={() => void task(async () => { const object = scene.objects.find(o => o.id === selectedId)!; edit(applyAction(scene, { type: "rotate", objectId: selectedId, x: null, z: null, rotation: (object.rotation + 90) % 360 })); })}>{words("가구 90° 회전", "Rotate furniture 90°")}</button>
          </div>}
          <div className={styles.toolbar}><button disabled={!undo.length} onClick={() => { const prior = undo.at(-1)!; setUndo(undo.slice(0, -1)); setScene({ ...prior, confirmed: false }); setAnalysis(null); setComparisonMode("current"); setRunId(null); }}>{words("한 단계 되돌리기", "Undo edit")}</button><button onClick={() => edit(originalScene.current)}>{words("불러온 배치로 복원", "Reset loaded layout")}</button></div>
          <p className={styles.hint}>{words("직사각형 방 한 개의 대략적인 배치입니다. 실제 치수와 문 여는 방향을 확인하세요.", "An approximate layout of one rectangular room. Verify actual measurements and door swing.")}</p>
          {!!problems.length && <p className={styles.error} role="status">{words("크기·위치 또는 겹침을 확인하세요: ", "Check dimensions, positions or overlaps: ")}{problems.join(", ")}</p>}
          <label className={styles.sceneConfirm}><input type="checkbox" checked={scene.confirmed} disabled={!!problems.length || !scene.orientation.confirmed} onChange={e => { const checked = e.currentTarget.checked; setScene(current => ({ ...current, confirmed: checked })); }} />{words(demo ? "3D가 실제 방과 비슷한지 확인했어요" : "3D의 방·문·창·가구와 전자기기가 실제 공간과 비슷한지 확인했어요", demo ? "I checked that the 3D draft resembles the room" : "I checked that the 3D room, openings, furniture and electronics resemble the actual space")}</label>
          {!demo && reports.length > 0 && <label>{words("내 기록 연결 (본인 리포트만 선택)", "Link my own report (optional)")}<select value={reportId} onChange={e => setReportId(e.target.value)}><option value="">{words("연결하지 않음", "None")}</option>{reports.map(report => <option key={report.id} value={report.id}>{report.title}</option>)}</select></label>}
          {!demo && <label><input type="checkbox" checked={patternConsent} onChange={e => setPatternConsent(e.target.checked)} />{words("내 기존 Reality Check 기록을 함께 참고합니다. 이 기록은 외부 제공자에 보내지 않습니다.", "Use my existing Reality Check history. It is not sent to the external provider.")}</label>}
          {requiresReference && <p className={styles.error}>{words("사진 초안을 분석하려면 벽 하나의 실제 길이를 먼저 입력하세요.", "Enter one actual wall measurement before analyzing this photo draft.")}</p>}
          <button className={styles.primary} disabled={busy || !enabled || !scene.confirmed || !!problems.length || requiresReference} onClick={() => void task(analyze)}>{busy ? words("처리 중…", "Working…") : words(demo ? "추천 배치 보기" : "분석하고 저장", demo ? "See suggested layout" : "Analyze & save")}</button>
        </section>
        {analysis && <section className={styles.panel} data-tour-current="true" id="space-guide-results" aria-label={words("공간 분석 결과", "Space analysis results")}>
          <p className={styles.stepPointer}><b aria-hidden="true">↓</b>{words("완료됐어요. 현재와 추천을 번갈아 확인하세요.", "Done. Switch between current and suggested layouts.")}</p>
          <h2>{words("생활에서 확인할 개선안", "Changes to try in everyday life")}</h2>
          {analysis.warnings.map(w => <p className={styles.error} key={w}>{w}</p>)}
          {analysis.recommendations.map((rec, index) => <article className={styles.recommendation} key={rec.id} data-active={index === activeRecommendation}>
            <span className={styles.badge}>{rec.evidence_type === "traditional" ? words("전통 풍수 해석", "Traditional feng shui") : rec.evidence_type === "practical" ? words("공간·생활 분석", "Space & daily life") : words("개인 패턴 기반 추천", "Personal pattern context")}</span>
            <dl className={styles.recommendationFacts}>
              <div><dt>{words("무엇을", "What")}</dt><dd>{rec.action.objectId ? kindName(analysis.current.objects.find(o => o.id === rec.action.objectId)?.kind ?? "") : words("방 전체", "The room")}</dd></div>
              <div><dt>{words("어디로", "Where")}</dt><dd>{rec.action.type === "move" ? movementSummary(analysis.current, rec.action, locale) : rec.action.type === "rotate" ? `${rec.action.rotation}°` : words("현재 배치에서 직접 확인", "Check in the current layout")}</dd></div>
              <div><dt>{words("왜", "Why")}</dt><dd>{rec.rationale}</dd></div>
              <div><dt>{words("확신도", "Confidence")}</dt><dd>{Math.round(rec.confidence * 100)}% · {rec.confidence >= .8 ? words("확인된 공간 규칙", "Verified spatial rule") : words("참고 제안", "Reference suggestion")}</dd></div>
            </dl>
            <div className={styles.actions}><button type="button" aria-pressed={index === activeRecommendation} onClick={() => { setActiveRecommendation(index); setSelectedId(rec.action.objectId); if (rec.action.type === "move" || rec.action.type === "rotate") setComparisonMode("compare"); }}>{words("3D에서 안내 보기", "Show guide in 3D")}</button><button disabled={busy} aria-pressed={applied[rec.id] === true} onClick={() => void task(async () => { if (!demo && projectId && runId) await api(`/${projectId}/changes`, { runId, recommendationId: rec.id, applied: true }); setApplied(current => ({ ...current, [rec.id]: true })); setMessage(words(demo ? "연습 표시입니다. 저장하지 않습니다." : "실제로 적용했다고 기록했습니다.", demo ? "Demo selection; not saved." : "Recorded as applied in your room.")); })}>{words("실제로 적용했어요", "I applied this")}</button>
              <button disabled={busy} aria-pressed={applied[rec.id] === false} onClick={() => void task(async () => { if (!demo && projectId && runId) await api(`/${projectId}/changes`, { runId, recommendationId: rec.id, applied: false }); setApplied(current => ({ ...current, [rec.id]: false })); })}>{words("적용하지 않았어요", "Not applied")}</button></div>
          </article>)}
          <p className={styles.hint}>{words("전통 해석은 문화적 참고입니다. 건강·재물·관계의 변화나 과학적 효과를 보장하지 않습니다.", "Traditional interpretations are cultural references, with no guaranteed health, financial, relationship or scientific effects.")}</p>
        </section>}
        {!demo && analysis && runId && <section className={styles.panel}>
          <h2>Reality Check</h2><p>{words("배치를 바꾼 뒤 실제 생활이 어땠는지 30일·90일 뒤 기록하세요. 알림은 자동 발송하지 않습니다.", "Return in 30 or 90 days to record your experience. No automatic reminders are sent.")}</p>
          <label>{words("확인 시점", "Review point")}<select value={days} onChange={e => setDays(Number(e.target.value) as 30 | 90)}><option value={30}>30{words("일", " days")}</option><option value={90}>90{words("일", " days")}</option></select></label>
          <label>{words("실제 경험", "Your experience")}<select value={outcome} onChange={e => setOutcome(e.target.value)}><option value="helpful">{words("도움이 됐어요", "Helpful")}</option><option value="unchanged">{words("달라지지 않았어요", "Unchanged")}</option><option value="unhelpful">{words("불편해졌어요", "Unhelpful")}</option></select></label>
          <label>{words("짧은 기록 (선택, 500자)", "Short note (optional, 500 characters)")}<textarea maxLength={500} value={note} onChange={e => setNote(e.target.value)} /></label>
          {runDate && <p>{words("기록 가능일: ", "Review opens: ")}{new Date(Date.parse(runDate) + days * 86400_000).toISOString().slice(0, 10)}</p>}
          <button disabled={busy || !enabled || !runDate || now < Date.parse(runDate) + days * 86400_000} onClick={() => void task(async () => { await api(`/${projectId}/checks`, { runId, requestId: crypto.randomUUID(), days, outcome, note }); await load(projectId!); setMessage(words("경험을 저장했습니다.", "Experience saved.")); })}>{words("경험 저장", "Save experience")}</button>
          {checks.filter(c => c.run_id === runId).map(c => <p key={c.id}>{c.days}{words("일", " days")}: {c.outcome} {c.note}</p>)}
        </section>}
      </div>
      <div>
        <section className={styles.panel} data-tour-current={tutorialStep === 0} id="space-guide-photos">
          {tutorialStep === 0 && <p className={styles.stepPointer}><b aria-hidden="true">↓</b>{words(demo ? "연습에서는 예시 방을 바로 확인할 수 있어요." : "여기서 같은 방 사진을 2장 이상 골라주세요.", demo ? "The example room is ready to explore." : "Start here by choosing at least two photos of the same room.")}</p>}
          <h2>{words(demo ? "예시 방" : "1. 방과 사진 준비", demo ? "Example room" : "1. Room & photos")}</h2>
          <label>{words("방 이름", "Room name")}<input maxLength={60} value={title} disabled={!!projectId || busy} onChange={e => setTitle(e.target.value)} /></label>
          {!demo && !projectId && <button disabled={busy || !enabled || !title.trim()} onClick={() => void task(async () => { await ensureProject(); setMessage(words("방을 만들었습니다. 사진을 올리거나 직접 구조를 입력하세요.", "Room created. Add photos or enter its structure manually.")); })}>{words("이 이름으로 방 만들기", "Create this room")}</button>}
          <label>{words("이 방에서 중요한 것", "Your goal for this room")}<select value={goal} disabled={!!projectId || busy} onChange={e => { setGoal(e.target.value as Goal); setAnalysis(null); }}><option value="balance">{words("일상 균형", "Daily balance")}</option><option value="rest">{words("휴식", "Rest")}</option><option value="focus">{words("집중", "Focus")}</option></select></label>
          {!demo ? <><p className={styles.hint}>{words("같은 방의 원본 사진·평면도 2~6장. JPEG·PNG·WebP, 한 장 8MB 이하입니다. 긴 변은 최대 2,048픽셀로 보존하고 위치 정보는 제거합니다. 얼굴·주소·문서는 사진 안에서 직접 가려 주세요. 비공개 사진은 24시간 뒤 접근을 막고 삭제를 예약합니다.", "Use 2–6 original photos or plans of the same room, JPEG/PNG/WebP up to 8 MB. The long edge is preserved up to 2,048 pixels and metadata is removed. Hide faces, addresses and documents visible in the pixels. Private photos expire after 24 hours and are scheduled for deletion.")}</p>
            <div className={styles.captureGuide} aria-label={words("정확도를 높이는 촬영 순서", "Capture sequence for better accuracy")}>
              <div><b>01</b><span>{words("방 전체와 네 모서리", "Whole room and all corners")}</span></div>
              <div><b>02</b><span>{words("반대쪽에서 한 장", "One opposite view")}</span></div>
              <div><b>03</b><span>{words("문·창·바닥 경계", "Doors, windows, floor edges")}</span></div>
              <div><b>04</b><span>{words("실제 길이를 잰 벽", "One measured wall")}</span></div>
            </div>
            <p className={styles.captureTruth}>{words("어두움·역광·흔들림·가림을 자동 점검합니다. 사진만으로 가려진 곳이나 절대 길이를 확정하지 않으며, 서로 다른 시점이 일치하지 않으면 3D 초안 생성을 중단합니다.", "Darkness, backlight, blur and occlusion are checked. Photos cannot prove hidden areas or absolute dimensions; reconstruction stops when distinct views do not agree.")}</p>
            <label>{words("사진 선택", "Choose photos")}<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || !enabled} onChange={e => { const files = Array.from(e.target.files ?? []); setCaptureConfirmed(false); void task(async () => { if (files.length < 2 || files.length + remoteAssets > 6) throw new Error("TWO_TO_SIX_IMAGES_REQUIRED"); const selected: Photo[] = []; for (const file of files) selected.push(await normalizePhoto(file)); setPhotos(selected); setMessage(words("사진별 해상도·밝기·대비·흐림을 점검했습니다. 경고가 있으면 다시 촬영해 주세요.", "Checked each photo for resolution, exposure, contrast and blur. Retake photos with warnings.")); }); }} /></label>
            <div className={styles.photoList}>{photos.map((photo, index) => <div key={index} data-photo-quality={photo.quality.status}><strong>{index + 1}. {photo.name}</strong><span>{photo.quality.width}×{photo.quality.height} · {photo.quality.megapixels.toFixed(2)}MP · {photo.quality.status === "good" ? words("사용 가능", "ready") : photo.quality.status === "review" ? words("재촬영 권장", "retake advised") : words("사용 불가", "unusable")}</span>{photo.quality.issues.length > 0 && <small>{photo.quality.issues.map(photoIssueCopy).join(" · ")}</small>}</div>)}{remoteAssets > 0 && <div><strong>{words("비공개 저장 사진", "Stored private photos")}</strong><span>{remoteAssets}{words("장 · 서버에서 다시 품질 확인", " · rechecked by server")}</span></div>}</div>
            <label className={styles.captureConfirm}><input type="checkbox" checked={captureConfirmed} onChange={e => setCaptureConfirmed(e.target.checked)} />{words("같은 방을 서로 다른 두 방향 이상에서 찍었고, 문·창·바닥 경계가 보이는지 확인했어요", "I captured the same room from at least two directions and checked that doors, windows and floor edges are visible")}</label>
            <label><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />{words("사진을 비공개 저장하고 OpenAI에 보내 방 구조를 읽는 데 동의합니다. 메타데이터 제거는 사진 속 얼굴·주소를 가리지 않습니다.", "I agree to private storage and sending the photos to OpenAI to read room structure. Metadata removal does not hide faces or addresses visible in pixels.")}</label>
            <p className={styles.hint}>{words("제공자 응답 저장을 끄지만 제공자 자체 보존 정책은 적용될 수 있습니다. 동의하지 않아도 아래에서 직접 입력할 수 있습니다.", "Response storage is disabled, but the provider's own retention policy may apply. Manual input remains available without consent.")}</p>
          </> : <p>{words("개인정보 없이 먼저 써보는 연습용 방이에요.", "Try this example room without sharing personal data.")}</p>}
        </section>
        <section className={styles.panel} data-tour-current={tutorialStep === 1} id="space-guide-north">
          {tutorialStep === 1 && <p className={styles.stepPointer}><b aria-hidden="true">↓</b>{words("휴대폰 나침반을 보고 북쪽이 있는 쪽을 누르세요.", "Use your phone compass and tap the side where north is.")}</p>}
          <h2>{words(demo ? "추천 배치 보기" : "2. 방향과 구조 확인", demo ? "See a suggested layout" : "2. Check direction & structure")}</h2>
          <p className={styles.hint}>{words("숫자를 입력할 필요가 없습니다. 방 한가운데에서 나침반을 켜고 북쪽이 있는 쪽만 고르세요.", "No number entry is needed. Stand near the middle of the room, open the compass and choose the side where north is.")}</p>
          <CardinalDirectionPicker locale={locale} northDegrees={scene.orientation.northDegrees} confirmed={scene.orientation.confirmed} onPick={pickNorth} />
          {scene.orientation.confirmed && <p className={styles.directionConfirmed}>✓ {words("북쪽을 표시했습니다. 3D에는 동·서·남·북이 함께 보입니다.", "North is set. The 3D view shows all four cardinal directions.")}</p>}
          {!demo && <><button className={styles.primary} disabled={busy || !enabled || !aiReady || !consent || !captureConfirmed || !scene.orientation.confirmed || (photos.length >= 2 && !usablePhotoSet(photos.map(photo => photo.quality)))} onClick={() => void task(extract)}>{words("사진 교차 확인 후 3D 초안 만들기", "Cross-check photos and build 3D draft")}</button>{!aiReady && <p className={styles.hint}>{words("사진 자동 읽기 연결을 준비 중입니다. 직접 입력으로 계속할 수 있습니다.", "Photo reading is not connected. Continue with manual input.")}</p>}</>}
          <details className={styles.advancedEditor}>
          <summary>{words("방 크기와 가구 직접 고치기 (선택)", "Edit room and furniture (optional)")}</summary>
          <div className={styles.fields}>{(["width", "depth", "height"] as const).map(key => <label key={key}>{key === "width" ? words("방 가로 (m)", "Room width (m)") : key === "depth" ? words("방 세로 (m)", "Room depth (m)") : words("방 높이 (m)", "Room height (m)")}<input type="number" min={2} max={key === "height" ? 4 : 20} step={0.1} value={scene.room[key]} onChange={e => edit({ ...scene, room: { ...scene.room, [key]: Number(e.target.value) }, measurements: { ...(scene.measurements ?? estimatedMeasurements("manual")), [key]: { status: "user_corrected", confidence: 1 } } })} /></label>)}</div>
          <p className={styles.hint}>{words("치수 상태: ", "Measurement status: ")}{(["width", "depth", "height"] as const).map(key => `${ko ? {width:"가로",depth:"세로",height:"높이"}[key] : key}: ${scene.measurements?.[key].status === "user_corrected" ? words("사용자 수정", "user-corrected") : scene.measurements?.[key].status === "confirmed" ? words("실측 확인", "confirmed") : words("추정", "estimated")}`).join(" · ")}</p>
          <p className={styles.hint}>{words("사진만으로 정확한 길이를 알 수 없습니다. 한 벽의 실제 길이를 입력하면 비율을 다시 맞춥니다. 다른 치수는 추정으로 남으며 직접 수정할 수 있습니다.", "Photos alone cannot establish exact dimensions. Enter one measured wall length to recalibrate proportions. Other dimensions remain estimated until corrected.")}</p>
          <div className={styles.fields}><label>{words("기준 벽", "Reference wall")}<select value={referenceAxis} onChange={e => setReferenceAxis(e.target.value as "width" | "depth")}><option value="width">{words("가로 벽", "Width wall")}</option><option value="depth">{words("세로 벽", "Depth wall")}</option></select></label><label>{words("이 벽의 실제 길이 (m)", "Measured wall length (m)")}<input type="number" min={2} max={20} step={0.01} value={referenceLength} onChange={e => setReferenceLength(Number(e.target.value))} /></label></div>
          <button onClick={() => void task(async () => { const calibrated = calibrateScene(scene, referenceAxis, referenceLength); edit(calibrated); setScene(calibrated); setMessage(words("입력한 벽 길이를 기준으로 비율을 맞췄습니다. 다른 치수와 가구 크기도 실측해 확인하세요.", "Recalibrated against your wall measurement. Measure and verify the remaining dimensions and furniture.")); })}>{words("실제 길이로 비율 맞추기", "Calibrate to measurement")}</button>
          {(["doors", "windows"] as const).map(category => <details className={styles.object} key={category}><summary>{category === "doors" ? words("문", "Doors") : words("창문", "Windows")} ({scene[category].length})</summary>
            {scene[category].map((opening, index) => <div key={opening.id} className={styles.fields}>
              <label>{words("벽", "Wall")} {index + 1}<select value={opening.wall} onChange={e => edit({ ...scene, [category]: scene[category].map((o, i) => i === index ? { ...o, wall: e.target.value } : o) })}>{["top", "right", "bottom", "left"].map((wall, i) => <option value={wall} key={wall}>{ko ? ["위쪽", "오른쪽", "아래쪽", "왼쪽"][i] : wall}</option>)}</select></label>
              <label>{words("시작점 (m)", "Offset (m)")}<input type="number" min={0} step={0.1} value={opening.offset} onChange={e => edit({ ...scene, [category]: scene[category].map((o, i) => i === index ? { ...o, offset: Number(e.target.value) } : o) })} /></label>
              <label>{words("폭 (m)", "Width (m)")}<input type="number" min={0.4} step={0.1} value={opening.width} onChange={e => edit({ ...scene, [category]: scene[category].map((o, i) => i === index ? { ...o, width: Number(e.target.value) } : o) })} /></label>
              <label>{words("개구부 높이 (m, 기본값은 추정)", "Opening height (m; default estimated)")}<input type="number" min={.4} max={3} step={.05} value={opening.height ?? (category === "doors" ? Math.min(scene.room.height, 2.1) : 1.2)} onChange={e => edit({ ...scene, [category]: scene[category].map((o, i) => i === index ? { ...o, height: Number(e.target.value) } : o) })} /></label>
              {category === "windows" && <label>{words("창턱 높이 (m, 기본값은 추정)", "Window sill (m; default estimated)")}<input type="number" min={0} max={2} step={.05} value={opening.sill ?? .85} onChange={e => edit({ ...scene, windows: scene.windows.map((o, i) => i === index ? { ...o, sill: Number(e.target.value) } : o) })} /></label>}
              <button disabled={category === "doors" && scene.doors.length === 1} onClick={() => edit({ ...scene, [category]: scene[category].filter(o => o.id !== opening.id) })}>{words("삭제", "Remove")}</button>
            </div>)}<button disabled={scene[category].length >= (category === "doors" ? 4 : 8)} onClick={() => edit({ ...scene, [category]: [...scene[category], { id: `${category}_${crypto.randomUUID().slice(0, 8)}`, wall: "top", offset: 0, width: 0.9 }] })}>{words("추가", "Add")}</button>
          </details>)}
          {scene.objects.map(object => <details className={styles.object} key={object.id}><summary>{kindName(object.kind)} · x {object.x} / z {object.z}m · {object.rotation}°</summary>
            <div className={styles.fields}>{(["x", "z", "width", "depth", "height"] as const).map(key => <label key={key}>{({ x: "x (m)", z: "z (m)", width: words("가로 (m)", "Width (m)"), depth: words("세로 (m)", "Depth (m)"), height: words("높이 (m)", "Height (m)") })[key]}<input type="number" min={0} max={20} step={0.1} value={object[key]} onChange={e => editObject(object.id, { [key]: Number(e.target.value) })} /></label>)}
              <label>{words("가구 방향", "Rotation")}<select value={object.rotation} onChange={e => editObject(object.id, { rotation: Number(e.target.value) as SpatialObject["rotation"] })}>{[0, 90, 180, 270].map(angle => <option key={angle} value={angle}>{angle}°</option>)}</select></label>
            </div><label><input type="checkbox" checked={object.movable} onChange={e => editObject(object.id, { movable: e.target.checked })} />{words("옮길 수 있어요", "Movable")}</label>
            <button disabled={scene.objects.length <= 1} onClick={() => edit({ ...scene, objects: scene.objects.filter(o => o.id !== object.id) })}>{words("가구 삭제", "Remove object")}</button>
          </details>)}
          <label>{words("가구 추가", "Add furniture")}<select value="" disabled={scene.objects.length >= 20} onChange={e => { if (e.target.value) edit({ ...scene, objects: [...scene.objects, { id: `object_${crypto.randomUUID().slice(0, 8)}`, kind: e.target.value as SpatialObject["kind"], x: scene.room.width / 2, z: scene.room.depth / 2, ...(({ width, depth, height }) => ({ width, depth, height }))(FURNITURE_CATALOG[e.target.value as ObjectKind]), rotation: 0, confidence: 1, movable: true }] }); }}><option value="">{words("종류 선택", "Choose type")}</option>{OBJECT_KINDS.map(kind => <option key={kind} value={kind}>{kindName(kind)}</option>)}</select></label>
          </details>
        </section>
      </div>
    </div>
    {message && <p role="status" className={styles.status}>{message}</p>}{error && <p role="alert" className={styles.error}>{error}</p>}
  </fieldset>;
}
