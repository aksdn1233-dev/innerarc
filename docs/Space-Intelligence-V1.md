# 3D 공간운 V1 — implementation and release contract

## Source and preserved baseline

Existing production repository `aksdn1233-dev/innerarc`, main `ee4ae5038e34e0715456b837cbe7c7f2db5591c4`, is authoritative. Development is isolated on `codex/space-intelligence-v1`. Four pre-existing privacy/protection edits were carried into this worktree; the original checkout is untouched. Baseline on Node 24.20.0: **794 tests / 90 files passed**, typecheck and Next build passed, lint 0 errors / 3 existing warnings.

Production `mygyeol.kr` uses the existing Cloudflare Worker. Main automatically deploys after CI. This work remains a draft branch until staging verifies database/storage/auth/cleanup and the visual release gate. Existing prices, entitlement validation, checkout, reports, canonical Saju/Numerology and deployment contracts are preserved. Current list prices are 5,500 / 39,000 / 79,000 KRW after campaign expiry; historical discounted and legacy entitlements remain valid. Space V1 introduces no new product or checkout.

## Acceptance and user flow

1. Independent `/ko/space` and `/en/space` introduction/demo, reached through the existing menu. Private workbenches are `/ko/space/workspace` and `/en/space/workspace`, authenticated and noindex. Shared protection and legal footer applies; third-party asset licenses explicitly retain their rights.
2. Upload 2–6 JPEG/PNG/WebP images, choose north manually, review the candidate scene, enter a measured reference wall and correct estimated dimensions. Images cannot establish accurate measurements or true compass north. Each dimension retains estimated/confirmed/user-corrected provenance. Recalibration uses the original observation rather than compounding prior scales.
3. One rectangular room, metre coordinates, four walls, doors/windows and 17 furniture categories. Irregular/multiple rooms are explicitly unsupported. Current obstructions are shown for correction; proposed changes cannot introduce collisions, out-of-bounds positions, doorway blockage, loss of walking access or blocked window access.
4. Deterministic, versioned rules produce at most five recommendations, separately labelled traditional Feng Shui / spatial-life analysis / personal patterns. Traditional interpretation is not scientific evidence or a promise of health, wealth or causation.
5. Compare current and suggested layouts with the same room/camera/assets. Movement distance and plan-relative direction are computed in code. Select, move 10 cm, rotate 90°, undo and restore. Only a single verified clear translation is animated; unsafe/crossing paths and reduced-motion mode switch directly to the validated state.
6. Save owner projects, analysis runs, recommendations, applied/declined choices and 30/90-day Reality Check records. Existing owned reports and confirmed PPI evidence are read explicitly and calculated using canonical engines. No AI replaces those calculations.

## AI and cost boundary

Official documentation rechecked on 2026-09-08 documents `gpt-6-astra`, image input, structured output and the Responses API: https://developers.openai.com/api/docs/models/gpt-6-astra . This is **documentation evidence only**. No account key/model availability or live model call has been verified in this environment. No model ID is defaulted. A configured approved model must pass `GET /v1/models/{id}` and exact `/v1/responses/input_tokens` preflight before `/v1/responses` generation. Existing AI adapters remain unchanged.

AI only extracts a candidate room and object classes. It cannot directly operate the scene, generate rules, score, perform coordinate arithmetic or change user data. Strict Zod/JSON Schema and deterministic geometry checks reject malformed, empty, nonfinite, overlapping, out-of-bounds and unsupported scenes. Missing information, timeout and unavailable providers lead to a labelled manual path, never a fabricated photo reconstruction.

The router accepts at most two operator-verified model IDs with ordinary/cached/cache-write/output rates and capability evidence for optional reasoning/cache controls. It minimizes expected total cost using measured validation outcomes/latency plus clearly labelled cold-start priors; this is not measured reconstruction accuracy. Same-project immutable sanitized-image fingerprints can reuse a validated observation. Raw account/birth/report fields are not sent to the provider. **Consented image pixels are sent, and visible faces/addresses/documents are not automatically redacted.** Re-encoding removes metadata, not visible content. `store:false` is not a promise of immediate provider-side deletion.

Defaults: 16,000 input-token ceiling, 4,096 output-token reservation, 500,000 micro-USD request ceiling ($0.50), 40-second shared provider deadline, at most two generation attempts. All attempts share the cost reservation. Exact preflight rejection incurs no paid retry; ambiguous generation timeouts do not blindly retry. Telemetry records model/task/usage/cost/latency/validation/fallback metadata, without image bytes or report text. Rendering, scoring, edits, comparison, save and simple copy cost no model tokens.

## Renderer and asset pipeline

Real WebGL/Three.js 0.185.1, lazily loaded; no generated screenshot substitutes for 3D. First-party licensed GLBs provide sofa, lounge chair and indoor plant. Project-owned detailed geometry provides the remaining classes, including draped bedding, joinery, furniture legs, drawers, frames and textile details. Authoritative dimensions/rotation apply once to every asset. Actual GLB bounds and all procedural classes have rotation/floor-contact tests.

`public/space/assets/manifest.json` records all categories, original source/license, dimensions, triangle counts, texture sizes, compression and LOD status. Khronos/Wayfair CC-BY/CC0 assets and Poly Haven CC0 PBR/HDR assets retain attribution. Sofa/chair GLBs use quantized meshes and WebP maps without geometry simplification; the plant uses a reviewed13,652-triangle simplified mesh; GPU KTX2/Draco were deferred because they require additional decoders/CSP work. No unverified asset or remote runtime CDN is used.

Continuous thick walls include real door/window holes, frames, glazing, thresholds, skirting and optional ceiling cutaway. PBR color/normal/roughness/AO maps use physical UV scale. HDR is prefiltered once. Illustrative window daylight, soft shadow maps, cached contact shadows, window area fill, GTAO, ACES tone mapping and restrained multisample antialiasing give depth. Lighting/design finishes are illustrative, not a reconstruction of actual sun/time/materials. Static architecture and loaded assets are reused; rendering runs on demand. Moving-object contact is precomputed separately and follows its mesh, while unchanged furniture reuses a cached map. Ultra/high/balanced/performance retain identical geometry. Low performance reduces effects, never swaps in crude furniture.

Desktop and portrait cameras fit actual bounding corners. Subject views separately fit the main furniture group; room overview and top view remain available. Download deadlines, bounded sizes, stale-update guards and explicit GPU/texture/bitmap/geometry cleanup cover failures, retry, unmount and lost context. Active timing excludes idle reading time; statistics include all rendering passes. Texture-byte estimates cover known bundled surface allocations, not total GPU memory. Desktop browser emulation is not physical iPhone/Android performance evidence.

## Data, security and lifecycle

Migration `20260907000100_space_intelligence_v1.sql` adds space projects/rooms/objects/orientation/analysis/recommendations/changes/Reality Check records through repository-native storage, owner RLS, composite owner/project references, private bucket, leased/idempotent operations, atomic quota and durable cleanup. It depends on existing PPI P0/account-deletion/security-rate-limit migrations. It also narrowly repairs existing PPI deletion grants and deletion ordering; this cross-cutting privacy repair is covered by real PostgreSQL-engine tests.

Client inputs: maximum 8 MB each, bounded count and supported MIME. Client derives a metadata-free JPEG with a maximum 2048-pixel edge and 3.5 MB size; the server enforces JPEG MIME/magic, a 2048×2048 / 4.3 MP decode ceiling, a 96 MB decode-memory ceiling, deterministic pixel-quality checks, and then decodes/re-encodes again. Originals are not stored. Derivatives use private storage and owner checks. No public photo URL is exposed. Uploads/downloads use authenticated server byte transfer, not signed URLs; test fixtures contain no real personal information. Extraction also requires two distinct usable views, stored-content hash diversity, provider-reported room-boundary evidence and cross-view consistency. These checks do not prove hidden geometry or absolute scale, so the user must still measure one wall and confirm the room.

Photo access expires after 24 hours. Hourly cleanup handles 100 jobs, four concurrent removals, bounded backoff and durable generation-aware receipts; deletion revokes access immediately and queues physical removal. Successful removals retain tombstones for the race window. Storage outages can delay physical deletion; count-only warnings after 48 hours expose backlog. Account export/delete remains available when feature writes are disabled. Export is paginated and bounded; it excludes object paths and image bytes.

## Enablement, release blockers and rollback

1. Verify the additive migration in staging with two real owners: no cross-account access, private upload/download, quota, lease expiry, export, project/account deletion and cleanup races. Local PGlite tests do not replace hosted Supabase verification.
2. Configure existing Supabase URL, public key and service-role key together. Require `ABUSE_HASH_SECRET` at least 32 characters, trusted Cloudflare client-IP handling and the shared rate-limit RPC. New writes fail closed without these.
3. Preserve the existing daily cron and deploy the added hourly `15 * * * *` cleanup trigger. Observe retry/backlog metrics. Preserve Worker runtime variables via the existing deployment's `--keep-vars` behavior.
4. Start saved/manual operation with `SPACE_ENABLED=true`, `SPACE_AI_ENABLED=false`. Enable AI only after an account-accessible model, current price/capability entries in `SPACE_AI_MODELS_JSON`, `OPENAI_API_KEY`, exact token counting and configured caps are verified.
5. Require regression checks and the owner's visual gate: every scored category at least 8/10 and overall at least 8.5/10. Representative desktop/mobile bedroom/living/current/recommended captures and real interaction measurements are evidence, not proof of all physical devices.

**Rollback:** disable `SPACE_AI_ENABLED` first, then `SPACE_ENABLED` to stop new writes. The home menu hides; the public demo remains directly reachable and existing read/export/delete and cleanup continue. Retain the additive migration, private bucket and cleanup/account-rights code until all retained data is removed according to policy. Do not drop tables/bucket or revert the entire feature blindly. No production migration/deploy has been performed by this task.

External release blockers: hosted staging credentials/two-account verification, actual model access/current rates, real mobile GPU trials, and final visual acceptance. See `Space-Project-State.md` for current evidence and next actions.

## V2 candidates only

AR, LiDAR, calibrated sensor capture, irregular/multi-room reconstruction, whole-house scanning and learned causal outcomes are not implemented in V1.

## Demand, operating cost and reversal

This implementation introduces no price, SKU, checkout or upsell. Owner demand is a feature request, not validated market demand. Existing9600/39000-KRW legacy entitlement economics and current canonical catalogue prices are preserved; no invented conversion or revenue estimate justifies launch. Distribution is the independent menu behind a flag. Before enabling it, measure consented workspace completion, valid extraction rate, manual fallback rate, cost per validated extraction, deletion backlog and device interaction latency. Stop AI on excess cost/validation failure; stop new writes on privacy/ownership failures. Paid extraction remains bounded by configured micro-USD caps; storage/egress and fulfilment costs require actual provider invoices before any pricing proposal.

Plant preparation uses the licensed Khronos DiffuseTransmissionPlant source, retains only pot/leaves/dirt, removes animated fireflies/lights/cameras, and applies glTF Transform4.5.0 quantization/WebP1K/meshoptimizer ratio0.2 error0.01. Runtime uses the model's standard PBR fallback; the diffuse-transmission extension is not claimed as supported. The shipped13,652-triangle model is checked at all four spatial rotations. Source credits and modifications ship with the model.
