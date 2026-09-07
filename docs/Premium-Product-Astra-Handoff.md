# Premium Product / Astra review handoff

Date: 2026-09-08  
Branch: `codex/space-intelligence-v1`  
Draft PR: https://github.com/aksdn1233-dev/innerarc/pull/22  
Production base / rollback reference: `ee4ae5038e34e0715456b837cbe7c7f2db5591c4`

## A. Architecture summary

This is an additive pass on the existing Next.js/Supabase/Three.js product. It keeps auth, payment, reports, Saju, Numerology, Personal Pattern and Reality Check contracts intact. Space uses private owner assets, strict Zod boundaries, a deterministic geometry/Feng Shui engine, optional validated provider extraction, and a browser Three.js renderer. Success comparison extends the existing deterministic public-figure Numerology route with sourced career facts and explicit contextual unknowns.

## B. Routes changed

- `/[locale]/space`: premium product story plus the existing interactive public demo.
- `/[locale]/space/workspace`: existing private, noindex, account-gated workspace; capture-quality guidance appears for an authenticated user.
- `/[locale]/celebrity`: existing public comparison upgraded in place as Success Pattern Comparison.
- Existing payment, reading, report, account and Reality Check routes were not replaced.

## C. Files changed

Primary product files are `src/app/[locale]/space/page.tsx`, `src/components/space/{workbench,room-view,space.module.css}.tsx/css`, `src/core/space/{schema,photo-quality}.ts`, `src/server/space/{io,provider,service,config}.ts`, `src/components/celebrity-experience.tsx`, `src/core/celebrity/{types,data,engine}.ts`, `src/i18n/celebrity-copy.ts`, and `src/app/globals.css`. The existing unmerged Space migration receives bounded diagnostic columns/checks. Tests and operating documents are updated alongside them.

## D. Design system changes

Space now uses a restrained ink/gold system, cinematic product-first hero, meaning-sized Korean line breaks, one-message story sections, smaller evidence pills, and responsive 390/430/768/1024/1440 compositions. Success comparison has a single reveal stage, one sourced event, then context/practical boundaries before the full ranked evidence list. Controls, focus, reduced-motion and text fallbacks remain.

## E. Fonts used

The CSS stack is `Pretendard Variable`, `Pretendard`, `SUIT Variable`, `SUIT`, then system UI. No font file was downloaded, copied or redistributed. Availability therefore depends on installed/project-runtime fonts; the system Korean fallback was also visually captured. This is a known consistency limit until a licensed self-hosted Korean font is approved.

## F. 3D architecture

Three.js r185 renders PBR surfaces, licensed GLB furniture where available, procedural fallbacks, HDR environment, lights, shadows, AO, contact grounding, orbit/touch controls, collision-safe actions and same-camera current/recommended comparison. Actual drawing-buffer pixels are visible in the lower-right meter. Auto desktop/high is 1.5–2.0x, balanced is 1.25–1.5x, Ultra is 2.0–2.5x, and constrained performance remains 0.7x. The asset package is lazy and approximately 8.4 MB; the page hero uses a 348 KB first-party product capture through Next Image optimization.

## G. Success-comparison architecture

The existing seven-record official-source dataset remains the selection source. Each record now carries profession and at least one dated official career milestone. Ranking still uses only deterministic Life Path, Birthday and Attitude overlap with ordinal labels and no invented percentage. Real career facts are displayed as facts with source links; environmental factors and unknowns are displayed separately.

## H. Deterministic calculation boundaries

Provider output can propose only a strict observation: room, openings, objects, per-image evidence, cross-view risk/consistency and missing fields. It cannot supply actions. Zod validation, bounds, collision, coordinate, rotation, rule score, recommendation and applied-layout calculations stay in code. Saju and Numerology engines are unchanged. Symbolic overlap and Feng Shui are reflection tools, not causal or scientific claims.

## I. Privacy boundaries

The browser re-encodes selected photos and the server decodes/re-encodes again, removing EXIF. Server diagnostics store only dimensions and bounded image-quality numbers. Assets are private and owner-scoped with expiry, deletion queue, export/deletion rights and provider consent. No public image URL, ordinary-person search database, raw EXIF or user photo fixture is added.

## J. Screenshots

Committed evidence is in `tests/visual/snapshots/desktop-space/`:

- `premium-{390,430,768,1024,1440}-space-landing.png`
- `premium-{390,430,768,1024,1440}-space-workspace.png`
- `premium-{390,430,768,1024,1440}-space-analysis.png`
- `premium-{390,430,768,1024,1440}-space-before.png`
- `premium-{390,430,768,1024,1440}-space-after.png`
- `premium-{390,430,768,1024,1440}-success-landing.png`
- `premium-{390,430,768,1024,1440}-success-result.png`

The original cross-browser Three.js fixture captures remain in the desktop, iPhone and Android snapshot directories.

## K. Known weaknesses

- Arbitrary dark, occluded or repeated photos cannot guarantee accurate reconstruction. The product now refuses them and asks for recapture/manual measurement.
- Photo-only absolute dimensions remain estimates until one wall is measured and the user confirms the scene.
- The public workspace capture is the honest logged-out gate; authenticated staging capture still requires hosted owner-session evidence.
- The first-party hero is an actual product screenshot, so it is truthful but less cinematic than bespoke photography.
- Installed-font fallback can vary until a licensed Korean webfont is approved.
- PBR furniture is commercial-quality for the bounded catalog, but it does not reconstruct every real furniture shape or material.

## L. Performance measurements

- Full three-browser Space matrix keeps the active performance interaction ceiling under 100 ms or switches to the already-tested synchronous fallback policy.
- Performance render scale remains <=0.71; Ultra is asserted >=1.99 with buffer dimensions at least 1.99 times CSS dimensions.
- Each geometry fixture remains below 180 draw calls and 400,000 triangles and above 1,000 triangles.
- Home still excludes 3D assets. Heavy assets load only when the interactive Space demo/workbench mounts.

## M. Failing or skipped tests

Latest local evidence at handoff: 1,030/1,030 unit/integration tests passed; production build passed with 134 generated route outputs; the complete general browser matrix passed 233 with 9 intentional skips; and the focused Space matrix passed 71 with 10 intentional skips. The Space skips are duplicate premium-capture executions on iPhone/Android projects; those exact captures run once in deterministic Chromium, while the existing 3D behavior/visual matrix still runs on all three browser projects. Lint has zero errors and three pre-existing warnings outside this change. Two inherited mobile checks first failed under five-worker contention, passed three serialized repetitions each, then passed in the complete rerun after deterministic action/wait hardening. Hosted model/storage and physical-device tests remain release gates.

## N. Remaining TODOs

- Run Node 24 GitHub CI on the pushed commit.
- Perform hosted two-account Supabase RLS/private-storage/cleanup/rollback verification.
- Official documentation currently identifies `gpt-6-astra`; verify that exact model is accessible to the configured account and recheck current rates with a consented synthetic room before adding it to the approved model list. Do not turn documentation existence into an account-access claim.
- Capture an authenticated workspace in staging.
- Test camera intake, touch, GPU memory and thermal behavior on physical iPhone and Android.
- Obtain owner visual acceptance before merge or deployment.
- V2 candidates only: AR placement, LiDAR/depth capture and whole-home scanning.

## O. Areas Astra should visually challenge

Challenge Korean headline rhythm at every width, the balance between the hero copy and product frame at 1024/1440, whether the logged-out workspace feels too sparse, success-result source density, dark-surface contrast, 3D material realism, before/after discoverability, touch-control density, and whether every viewport communicates one main idea. Reject decorative complexity that hides product truth. Flag any statement that reads as guaranteed geometry, scientific Feng Shui, success causality or model capability not proven in the repository/environment.

> The final benchmark is not whether the feature works.  
> The benchmark is whether the product feels comparable to a top-tier commercial Korean AI product such as the provided NAVER AI Tab reference, while remaining original.

## Hostile self-review and score

The experience no longer starts as an internal workbench, and the product itself is visible enough for screen recording. The capture flow is more credible because it refuses bad evidence. It can still be reproduced conceptually by a strong competitor; the defensible part is the existing deterministic/PPI/Reality Check integration and accumulated verified outcomes, not the landing-page styling.

| Category | Score / 10 | Evidence / remaining gap |
|---|---:|---|
| Typography | 8.9 | deliberate Korean breaks; licensed self-hosted font still absent |
| Hierarchy | 9.1 | one primary hero and numbered story stages |
| Spacing | 8.9 | five breakpoint captures; workspace gate is intentionally sparse |
| Visual polish | 8.8 | real product frame, refined chrome; furniture coverage remains bounded |
| Clarity | 9.2 | capture refusal and symbolic/practical boundaries are explicit |
| Motion | 8.6 | restrained 3D transitions and reduced-motion; no added cinematic page motion |
| Mobile quality | 9.0 | 390/430 no-overflow and actual buffer evidence |
| Product storytelling | 9.1 | photo → validation → 3D → comparison → Reality Check |
| Premium perception | 8.8 | materially improved, still below the strongest bespoke Korean campaign production |
| **Overall** | **8.9** | reviewable and above the 8.0 critical floor; below the preferred 9.0 owner-acceptance gate |
