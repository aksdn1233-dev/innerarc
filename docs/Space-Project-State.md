# Space V1 compact state — 2026-09-07 final local review

## Decisions

Source of truth: production main `ee4ae5038e34e0715456b837cbe7c7f2db5591c4`, verified against origin/main. Isolated branch `codex/space-intelligence-v1`. Original checkout HEAD `8ae2e0512840b73979d1d08908a616a904387987` and its four pre-existing protection/privacy edits remain untouched. Those edits are preserved in this worktree. No main merge, production migration or deployment. No new paid product/pricing/entitlement change.

## Implemented

- Independent ko/en intro/menu/private workspace, flag-controlled desktop/mobile entry, shared protection/legal footer and private noindex.
- Strict scene/observation/action schemas, dimension provenance/reference calibration, deterministic geometry/door/window/navigation and symbolic/practical/personal recommendations; owner report/canonical PPI reuse.
- Private sanitized server image transfer, owner/rate/quota/lease/CAS guards, expected-total-cost AI router/history/reuse/token preflight/caps/fallback; no default model ID or real model call.
- Seven additive tables: projects, rooms (scene contains orientation/objects), assets, analysis runs (immutable recommendations), applied changes, Reality Checks and cleanup queue. Private bucket and owner RLS. Narrow inherited PPI account-deletion fix. Export/deletion survive feature-off rollout.
- Three.js0.185.1;17 classes; licensed sofa/chair/plant GLBs and PBR/HDR; original remaining geometry; architecture/openings, camera fits/occlusion/fallback, touch/button controls, nudge/rotate/undo/current-recommended comparison.
- Cached contact lighting separates the moving object, with live rug receivers; area/window light, soft shadows/GTAO/tone mapping, adaptive tiers, bounded downloads and GPU-failure cleanup/retry. Real scene markers and active-only timings.
- Fixed existing pnpm11 audit command semantics; fast-uri dev-tool pin3.1.5→3.1.6. Existing two advisory exceptions unchanged. Draft CI adds a separate full-Chromium/WebKit space job; existing general/headless-shell regression and main deployment contracts preserved.

## Tested

Baseline794/90 unit tests passed. Latest full unit1013/110 passed; lint0 errors+same3 existing warnings; typecheck, Next build and Cloudflare build passed (`../final-verify13.log`). Final static check passed (`../final-static.log`).

Space full matrix57/57 passed with actual regenerated30 screenshots (`../space-final13.json`). Final no-update60/60 passed, including lazy-entry/bundle-transfer checks, with zero failures, skips or flaky results (`../space-verified-final.json`). General browser suite233 passed/9 intentional skips of242 (`../general-final13.json`); isolated fake checkout8/8 passed (`../payments-final13.log`). No live payments, production data or private user photographs used.

Final60-case active P90: desktop16.8ms, iPhone WebKit emulation17ms, Android Chromium emulation16.8ms. Host GPU is Apple M4/Metal (WebKit reports Apple GPU), not physical phones. Scene readiness434–1084ms locally,77–144 draw calls and102,689–346,377 triangles across all passes; known surface allocation estimate48,933,547 bytes, not total VRAM. Full Chromium uses the documented authentic headless channel; old headless shell remained slow and its failures are preserved separately. Do not substitute emulation results for physical-device approval.

Plain dependency audit exits0 with no non-exempt advisories after fast-uri patch; metadata still counts the existing two approved high-severity exceptions. CycloneDX1.6 SBOM has113 production components. No new broad ignores. Secret-pattern scan of staged text found0 matches; diff whitespace check passed.

## Failed / causes / prevention

`Space-Failure-Ledger.md` records malformed geometry, compound calibration, rug semantics, unsafe tweens, async allocation/HTTP/blob cleanup, CSP textures, stale captures, scene readiness, selection, timing/tier measurement, GPU draw failures, camera occlusion, account cleanup/exports and audit-command defects with regression evidence.

Premium visual acceptance remains **FAIL**. Current internal review is approximately8.0/10, below the owner's8.5 minimum, with bedding/material-lighting/premium impression still below8. Realistic licensed assets and contact lighting improved the result, but this is not approval to ship high-end archviz. A reviewed CC0 Bed Classic candidate requires a BlendSwap sign-in to download; no account was created and no unlicensed replacement was shipped.

## Pending / risks / next action

1. Final60-case screenshot/lazy-transfer verification passed. Home loads no space assets. Initial small-bedroom entry transfers about6.9MB of assets and0.37–0.59MB of compressed scripts (shared home scripts may be cached); further texture compression remains desirable.
2. Preserve review report/changed-file list and submit this branch as a draft PR; do not merge or deploy. Original checkout remains untouched. Manual in-app browser inspection confirmed the latest production-build scene and recommended camera control; authenticated upload remains unverified.
3. Continue visual art direction/bed asset/lighting refinement before declaring the feature complete.
4. Hosted staging migration/two-owner RLS/private storage/cleanup and real model access/current rates remain unverified. User has been asked for the test environment location; never request secret values in chat. No account-accessible service model is currently verified; OpenAI Responses adapter is implemented but unused. Manual fallback is available.
5. Physical iPhone/Android GPU/touch/memory and independent bilingual review remain release gates.

Rollback: disable SPACE_AI_ENABLED, then SPACE_ENABLED. Home entries/new writes stop; direct public demo and owner reads/export/delete/cleanup remain. Retain migration/private bucket/data-rights/cleanup until retained data is safely removed. Do not drop data or revert cleanup blindly. AR/LiDAR/irregular or whole-home scanning remain V2 candidates only.
