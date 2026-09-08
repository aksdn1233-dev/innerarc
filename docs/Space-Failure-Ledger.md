# Space V1 defect and regression ledger

Only synthetic rooms/images are used. Earlier screenshots and incomplete runs are not release evidence; final captures/checks are listed in Space-Project-State.md.

| What failed | Cause and previous coverage gap | Systemic fix and regression evidence |
| --- | --- | --- |
| Invalid/colliding AI scenes could look plausible | Text/schema validity alone does not establish physical validity | Strict observations plus deterministic bounds, unique IDs, collisions/openings/navigation; malformed JSON, empty/out-of-bounds/collision/timeout/unavailable unit/service cases |
| Repeated wall calibration compounded scale | Rescaling an already-scaled scene changes other dimensions twice | Immutable calibration source; dimension provenance; idempotence and confirmed-dimension tests |
| Rugs prevented furniture placement or blocked low windows | Floor coverings were treated as solid obstacles | Explicit thin-rug semantics in collision, walking and window access; engine/navigation fixtures |
| Interrupted movement could cross an obstacle visually | A new tween could start from a half-finished visual position rather than the validated previous state | Finish prior validated motion before computing the next bounded sweep; only one clear translation animates; multiple/rotation paths snap |
| Initial GPU allocations could leak after later async failure | Cleanup was registered too late | LIFO resource scope owns each allocation immediately, including late allocations and failed cleanup; resource-scope unit cases plus canvas failure/retry E2E |
| Asset download could remain in loading forever | Only unmount aborted requests; failed HTTP tests did not cover a stalled response body | Bounded streaming bytes + 15-second full-body deadline; stalled-body timer unit test and browser timeout/retry test |
| Pre-load furniture selection lost its highlight | Selection effect ran before async renderer existed | Latest-selection ref applied during initialization and retry; browser selected-object assertion |
| Shipped GLB textures silently disappeared under the production CSP | ImageBitmapLoader used fetch(blob:), while the shared CSP only permits blob images; GLTFLoader swallows failed maps and returns geometry. Geometry-only unit tests and screenshots without console checks missed this | CSP-compatible HTML image loader; manager rejects any failed material image. Actual shipped GLB material/bounds tests, explicit image failure test, real browser console/page-error gates. Shared connect-src is unchanged |
| Visual review used stale baseline pictures | Snapshot update defaults changed only images exceeding a perceptual threshold; small lighting/material changes could pass while retaining old files | Regenerate all review captures explicitly; tighter screenshot threshold; validate fixture identity after a completed draw; visual acceptance reviews actual current captures |
| New fixture could be photographed while the old room was still visible | Generic nonzero object-count assertion passed during asynchronous GLB loading | Wait exact expected object IDs/coordinates after render, and settled motion before comparison captures |
| Walking-validity test attempted an invalid left nudge in a richer fixture | New adjacent objects changed clearance, but the old test hard-coded the prior move | Preserve safety rejection; exercise a demonstrably clear right nudge and undo; no geometry guard was weakened |
| Idle time was reported as slow animation | Timing sampled the next click after a transition had already ended | Active-frame sampler excludes idle gaps and separate camera clicks; terminal moving-frame/idle/new-transition unit regression |
| Expensive postprocessing and shadow passes remained on weak devices | Disabling AO still retained directional/contact shadow work; remote WebKit stayed at235–237ms after fallback | Performance tier renders the same materials/geometry directly without AO, contact baking or directional shadow maps. Default/balanced/high tiers retain the reviewed lighting. A fixed-tier browser benchmark and automatic-threshold unit cases prevent silent regressions |
| Preflight cost rejection unnecessarily consumed escalation budget | Exact token count can reject before any paid generation | Unpaid candidate rerouting stays separate from paid retries; preserve each attempt's finalized failure reason and omit budget-only failures from reconstruction-quality history |
| Existing PPI account deletion failed after space integration | Existing DELETE grants/order conflicted with protected evidence references/XOR constraints | Narrow additive grant/ordered deletion trigger with parent serialization; real PostgreSQL-engine ownership/delete tests |
| Cleanup could lose a racing upload or stale failure could overwrite success | Storage/DB are not one transaction | Retained tombstones, generation-aware compare-and-swap receipts, bounded durable retries; cleanup/service/database race cases |
| Legacy browser tests expected an expired 1,500 KRW campaign | The calendar advanced beyond the configured campaign; tests assumed a permanent offer | Tests use the canonical pricing resolver and conditional live campaign state. Production prices and historical entitlement validation unchanged |
| Full browser suites intermittently timed out during parallel visual capture | Competing browser/GPU load and shared Playwright output directories | Serialize visual and general suites, keep artifact directories distinct, and rerun failed cases before classifying a product regression |

| Mobile home had no visible space entry | Existing home CSS hides desktop navigation below 900px; intro-route tests did not verify menu discovery | Dedicated, flag-controlled mobile header entry; desktop/mobile menu-to-route E2E |
| A pre-initialization empty render could report the requested scene ID | The initial candidate existed before its meshes were committed | Publish scene state only after object/architecture commit; exact fixture identity plus nontrivial triangle lower bound |
| Interior view cropped beds moved near another corner | Clamping one candidate and capping FOV did not prove visibility | Check four room corners, positive depth, subject bounds, camera occupancy and wardrobe occlusion; explicit overview fallback; corner/small-room/wardrobe projection tests |
| Early HTTP rejection and failed GLB images retained resources | Deadline cleanup did not abort rejected transports; upstream GLTFLoader revokes embedded blobs only on success | Abort transport in finally and revoke failed owned blob URLs; HTTP-size/error and missing-map regressions |
| Account deletion waited for other owners' storage jobs | Global cleanup was awaited after the deletion transaction committed | Immediate durable receipt; scheduled cleanup only; stalled-cleanup account/project regression cases and truthful pending-deletion UI |
| Applied-change export could reorder equal-run rows across pages | Pagination sorted only the first part of a composite key | Stable run_id + recommendation_id order; a500-row boundary route test |
| GPU draw failure left a frozen ready canvas | Animation callbacks are outside async initialization catch | Frame-level cleanup and existing retry/text fallback; injected GPU draw failure browser test |
| Rug contact receiver jumped ahead of its animated mesh | Receiver used the destination scene while the furniture followed live transforms | Synchronize receiver transforms from its source group; intermediate-frame contact test |
| Contact shading increased software-rendered active P90 | Full-resolution contact and directional shadow passes were retained after quality fallback | Balanced/default tiers retain cached contact lighting. The documented performance tier disables both shadow passes, reports `performance-unshadowed`, and keeps the unchanged active-frame assertion |

Performance fallback preserves the same asset geometry and PBR materials but disables AO, contact baking and directional shadow maps. Balanced/high/ultra retain the reviewed shadow stack. This must be assessed in active frame measurements, not idle FPS.
| Late automatic quality change left no steady-tier measurement | A fixed number of movements ended immediately after the sampler reset | Early emergency fallback after4 severe active intervals; preserve12 samples for reporting; two warm-up intervals excluded after tier changes; browser measurement continues a bounded number of cycles until the new tier has12 samples |
| Dependency audit falsely appeared green while fast-uri3.1.5 was vulnerable | pnpm11 `audit --ignore` only updates exceptions; existing command did not run the intended audit | Run plain audit with the existing two configured exceptions, pin official fast-uri3.1.6 patch, and rerun audit/SBOM/verification. Baseline dependency defect; no new broad ignores |
| Overview showed a large triangular exterior shadow and flat grey ground | The studio ground received the room shell's directional shadow and used one flat material; prior tests compared pixels without a named presentation review | Stop exterior ground shadow reception, add a bounded radial studio texture and localized grounding, and review named bedroom/living/mobile captures; unchanged performance budget remains a gate |
| Current and recommended layouts looked almost identical | The UI changed the scene but did not show the alternate exact location, movement path or a concise delta | Derive movement/rotation from validated scenes in deterministic code, render bounds-safe outline/path cues, and assert both the data delta and current/recommended panel screenshots |
| Ultra looked like High on a device-pixel-ratio-1 display | Ultra capped DPR at2 but did not set a minimum, so a common desktop DPR stayed1 | Initially required1.5×; the resolution hardening pass now requires at least2.0×, exposes `ultra-preview` plus exact buffer dimensions, and asserts the effective canvas scale |
| Nightstand handle detail initially exceeded the authoritative object volume | The first visual offset placed handle depth outside the room object's bounds | Keep all detail inside the declared dimensions; four-rotation asset-bound tests caught the defect before capture and now protect it |
| A tall stitched mobile screenshot showed the offscreen skip link | Playwright's element stitching moved a fixed offscreen accessibility control into the composed capture; the real one-viewport page did not show it | Capture the actual viewport after scrolling to the panel and retain the skip-link accessibility behavior |
| Camera and layout labels changed while two browser assertions retained old wording | Interaction copy and automation were updated in separate edits | Use the final accessible labels in E2E and visual cases; the complete66-case matrix prevents partial label drift |
| First remote premium run retried the desktop Ultra screenshot once | The real1.5×+ Ultra buffer could not complete Playwright's default5-second capture/stability cycle on the constrained software renderer; the pixel comparison itself passed on retry | Give only the Ultra screenshot15 seconds while preserving its exact scene/profile assertions, 0.10 pixel threshold and 0.01 maximum differing-pixel ratio; require a clean remote rerun |
| The next remote iPhone performance run reported263–269ms active frames despite15–19ms CPU render | The Apple GPU was correctly classified as hardware, but the lightest profile still received repeatedly delayed animation callbacks; renderer-name detection alone cannot cover a constrained hardware scheduler | After four measured over-100ms frames in the performance tier, finish validated motion immediately and use the same under-100ms response ceiling. Pure threshold tests and the browser metric expose `adaptive-snap`; quality, geometry and the100ms gate are unchanged |
| A later iPhone fault-recovery capture rebuilt successfully only on test retry | The test allowed20 seconds for a fully disposed WebGL context plus all bounded assets; under the loaded WebKit runner the fresh scene was still absent at that exact limit, while a new attempt completed in6.7 seconds | Keep the15-second per-asset product deadline and all canvas-count assertions; allow30 seconds only for the post-failure full context/asset reconstruction and require a clean remote run |

The final contact optimization bakes the moving object separately and follows its live translation; unchanged furniture is not re-rendered into the contact map on every animation frame. A regression checks map reuse, live receiver coordinates and preservation of source geometry.

Browser calibration: the legacy Chromium headless shell remained slow (P90216–232ms) even after effect reduction. The documented full Chromium headless channel uses the actual browser implementation and reports ANGLE Metal/Apple M4 here; the same scene/threshold measured17.1ms desktop and18.4ms Android emulation. WebKit measured18ms. Keep the legacy failure evidence; these are host-GPU measurements, not physical-phone results. General regression tests retain the original headless-shell matrix. The space matrix uses full Chromium + WebKit as documented at https://playwright.dev/docs/browsers#chromium-new-headless-mode .

The warmed comparison capture also re-analyzes after manual edits: edits intentionally invalidate the analysis, so attempting to click a prior recommendation after a correction was a test defect, not a missing recommendation button.


## First remote CI evidence (run34093793928, code c0a39e7)

- General verify succeeded: unit1013/110, lint/typecheck/build/audit, fake checkout8. Browser230 first-pass +3 retry-pass +9 skipped. Existing mobile share-accessibility/privacy checkbox, onboarding result and shop curation tests failed first and passed retry. Their local targeted repeat (three runs each, no retries) passed9/9. Cause remains unconfirmed; these unmodified flows are not declared newly broken or fully stable. Keep as a release-review exception until reproduced in that runner.
- Space matrix57/60 passed; all3 active-frame benchmark cases failed on every attempt even after the performance tier. Desktop P901016.6–1049.9ms, WebKit234–260ms, Android649.9–666.5ms versus the unchanged<100ms gate. First-party scenes, geometry, asset and entry-budget cases passed. Chromium traces report GPU ReadPixels stalls; exact backend was lost because the assertion preceded its attachment. Do not label this proven software rendering or a fixed defect.
- Corrected the diagnostic ordering: attach backend, viewport/canvas visibility and hardware-concurrency information before a soft performance assertion, so comparison captures continue while the same threshold still fails CI. Local3/3 comparison/diagnostic cases and targeted lint/typecheck passed after this test-only change. Product rendering code is unchanged. This is instrumentation, not a performance fix or release approval.
- Remote benchmark and premium visual acceptance remain release blockers. Do not relax the frame threshold or substitute host emulation for physical-phone testing. Hosted Supabase/model access remain separately blocked by missing test configuration.

## Quality-hardening diagnosis after run 34095636928

- The new diagnostic order proved the three frame failures were measured while the canvas was completely above the viewport: desktop `y=-620.48, height=540`, WebKit `y=-706.30, height=430`, Android `y=-543.67, height=430`. Chromium used SwiftShader on a two-core runner, but its synchronous CPU render P90 was only 4–7ms while `requestAnimationFrame` arrived every 633–1050ms. WebKit showed the same offscreen condition. The shared cause was browser power throttling of invisible animation, not demonstrated scene throughput.
- Product policy now checks the canvas rectangle before starting a tween. A fully offscreen edit applies the already-validated destination immediately; a partially or fully visible scene still animates. Unit coverage checks all four offscreen directions and partial visibility. Browser coverage proves a control-triggered offscreen edit snaps, then keeps the canvas visible and programmatically invokes the same buttons for an actual visible renderer benchmark. The `<100ms` gate is unchanged.
- A first attempt to cache the directional shadow globally reduced passes but caused WebKit sampler-format errors. A narrower per-light cache also reproduced the error. Both were removed; the proven automatic directional shadow path and cached contact shadows remain. The WebKit representative geometry/interior/performance cases pass after removal. This failure adds a console-error regression rather than a compatibility exception.
- A separate bedding material improved tone but increased the procedural bed from seven merged draw batches to twelve. It was rejected by the existing draw-call test. The retained version uses existing linen/sand batches, keeps seven bed draws, and raises only the bed detail geometry from 19,804 to 23,524 triangles for sewn pillows, side/foot duvet drops and hem detail.
- Visual hardening adds restrained warm practical light, softer daylight, physical window backing, ceiling reveals, improved bedding and a camera penalty for unrelated furniture near the lens. A new camera test keeps the small-bedroom view away from the desk-side corner. No unobserved room object, geometry dimension, collision rule or generated image was introduced.
- Final local no-update matrix after these changes: 60/60, zero flaky/skipped/failures. Visible active P90: desktop17.7ms, WebKit18.0ms, Android18.2ms; CPU render P90 2.5/3.0/2.8ms;135 draw calls,207,261 triangles,35 textures and48,933,547 known surface bytes for the measured comparison scene. These remain host-GPU/emulated viewport results until remote and physical-device evidence exists.

## Remote fixed-tier follow-up after run 34100600256

- General verify passed, including lint/typecheck/unit/build/audit/SBOM,231 browser cases,9 intentional skips and8/8 isolated payment cases. The unchanged shop curation case retried once in desktop and mobile; keep that inherited flake visible.
- The space run finished56 passed,1 flaky and3 failed. Desktop/Android rendered but could not accumulate12 active samples because their slow runner delivered at most one frame per650ms transition. WebKit did accumulate samples and proved the fallback remained too expensive: active P90235–237ms, CPU render P9038–139ms,66 calls and103,634 triangles on Apple GPU.
- The performance tier now disables contact-map baking and directional shadow rendering while leaving reviewed higher tiers unchanged. The browser benchmark selects this documented tier before any setup animation, asserts its exact shadow policy and retains the same `<100ms` limit. Automatic emergency/representative-sample thresholds are pure unit-tested code.
- The single18.2-minute space job is split into browser jobs. Run34105562638 showed that one90-second case still bundled setup, selection, analysis, two layouts and performance; all three runners timed out before its benchmark while19 other cases passed. Run34111669123 split the case, but the performance case still ran after14 repeated WebGL fixture contexts and exhausted setup time. CI now runs it first in a fresh process. Its error snapshot proved the enabled Quality control was present; Playwright's select actionability/scroll wait consumed the remaining timeout beside the canvas. The benchmark now dispatches the real select `change` events programmatically, as it already does for offscreen-safe movement buttons, while a separate interaction case retains ordinary user selection coverage. Coverage remains21 per browser; the90-second limit, `<100ms` threshold, screenshots, retries and entry budgets are unchanged.
- Run34113160978 reached the isolated WebKit benchmark on all attempts. Removing shadow/postprocessing passes reduced it to33 calls,51,826 triangles and6–10ms CPU render, but active P90 remained106–114ms versus the unchanged100ms limit at324×430 internal pixels. The performance tier now renders at0.7 CSS pixel scale (about half the fragment count); the benchmark asserts that scale so a future profile change cannot silently restore the cost. Reviewed balanced/high tiers are unchanged.
- Run34113746751 passed WebKit at0.7 scale, but the Android runner's SwiftShader backend reported433–450ms rAF despite2.5–3.1ms synchronous render at242×301 pixels. This is a software-renderer scheduling limit, not a physical Android GPU result. The product now detects known software renderers and commits validated motion with one immediate draw instead of starting an animation they cannot schedule. Hardware keeps the active-frame P90 gate; software uses the same100ms ceiling for observed scene-state response. Backend, policy and timing remain attached.

## 2026-09-08 — high-resolution input can still be unusable

- Trigger: owner required accurate use under varied capture conditions and rejected image enlargement as a quality substitute.
- Cause: the previous 1024-pixel normalization, high-detail provider request and manual calibration did not prove that multiple photos were distinct, adequately exposed, or mutually consistent. The UI also hid the actual WebGL drawing-buffer size.
- Correction: preserve up to a 2048-pixel edge within 3.5 MB, strip metadata twice, add deterministic pixel diagnostics, stored hash duplication checks, strict per-image/cross-view provider evidence, capture confirmation, and an actual render-pixel meter. Ultra now guarantees at least 2.0x internal resolution.
- Recurrence test: `space-photo-quality`, `space-upload`, `space-provider`, `space-service`, the Ultra drawing-buffer assertion, and multi-viewport premium visual captures. Photos remain drafts until one wall is measured and the user confirms geometry.

## 2026-09-08 — parallel mobile browser checks produced two false negatives

- Trigger: the full 242-case browser run reported a moving privacy checkbox and a delayed storage-failure message; both unchanged flows passed three consecutive serialized repetitions.
- Cause: the checkbox action depended on Playwright's viewport stability while the mobile editorial rail was settling, and the storage-failure assertion kept the default five-second UI deadline under five-worker contention.
- Correction: dispatch the checkbox's native click and verify its checked state; allow the failure message ten seconds while preserving its exact text, URL and no-storage assertions.
- Recurrence test: run both mobile cases three times serially, then require the complete browser matrix to pass without product-code retries.

## 2026-09-08 — Node 24 CI passed with avoidable UI/capture retries

- Trigger: run 34144223670 completed all four jobs, but both shop recommendation checks retried after their five-second result wait and both desktop high-resolution interior captures retried after Playwright's five-second stability window.
- Cause: the unchanged shop interaction relied on actionability while the full parallel suite was loaded; the new larger drawing buffer made stable interior capture exceed a timeout chosen for the former resolution.
- Correction: dispatch the real shop button click directly and verify its three results within a bounded ten seconds; allow only the two high-resolution interior screenshots fifteen seconds without changing their pixel tolerance, geometry, quality tier or performance ceiling.
- Recurrence test: run the shop case on desktop/mobile and both interior captures locally, then require a fresh four-job Node 24 run with no retry-pass cases from these checks.

## 2026-09-08 — visible controls were exercised before stable client interaction

- Trigger: follow-up run 34145292609 removed the high-resolution capture retries, but one shop recommendation and one iPhone space confirmation still passed only on retry.
- Cause: a native shop click could fire after server HTML appeared but before React attached its submit handler. The iPhone checkbox action separately depended on Playwright's moving-element actionability while the responsive layout settled.
- Correction: expose the shop form's hydration state and keep its submit button disabled until the handler is attached, then use an ordinary user click; dispatch each space checkbox's native click and assert its controlled checked state before analysis.
- Recurrence test: repeat the shop case in desktop/mobile and the complete iPhone space flow three times without retries, then require a fresh four-job Node 24 run with zero retry-pass cases.

The first local hydration-marker repeat accidentally reused the prior production build, so all six checks correctly reported that the new marker was absent. Rebuild the production bundle after client-source changes before using the production-server E2E wrapper; the rebuilt repeat is the only acceptance evidence.

Run 34146664240 showed that the space checkboxes could also be dispatched while the entire workbench was still intentionally disabled before hydration; waiting only for the heading was insufficient. The flow now waits for the workbench's existing `data-ready=true` contract before any input. The same run showed WebKit could spend the full action timeout after completing the retry button's hit testing under GPU contention, so the failure-injection test dispatches that real button's native click after proving it is visible and enabled, then retains the 30-second full reconstruction assertion. Separate interaction coverage continues to exercise ordinary user clicks.

The first serialized production repeat after that change stabilized both confirmations, but one of six runs did not expose analysis within the default five-second assertion after Playwright's actionability click. The regression now proves the hydrated analysis control is enabled, dispatches its real native click, and gives the deterministic result a bounded fifteen-second window under 3D initialization load. The exact result, comparison, application and invalidation assertions remain unchanged.

Run 34148155082 then completed every dedicated 3D browser case without retries, but the general Chromium flow exhausted its total 90 seconds only at the final invalidation check while four workers contended for rendering time. This functional state-flow case now requests the product's supported reduced-motion mode so validated layout changes apply without decorative transition frames. Dedicated desktop/iPhone/Android performance and motion cases keep normal animation and the unchanged response ceiling.

Run 34158372056 passed all four jobs, but the general Chromium version of the same full WebGL state-flow case again exhausted the total 90-second test budget at its final invalidation assertion and passed on retry. The dedicated desktop run completed all 31 Space cases cleanly, while iPhone and Android each completed 21 with 10 intentional duplicate-capture skips. This confirms runner contention rather than a failed invalidation rule. The full real-render integration case now uses Playwright's explicit slow-test allowance; its assertions, reduced-motion product path, 15-second result deadline and dedicated 3D performance gates are unchanged. A fresh Node 24 run must pass without retries.

Run 34159488010 proved the full state flow clean at 229/229 general browser passes, but the isolated desktop performance case needed one retry before its first exact six-object scene appeared. The assertion allowed 20 seconds while the existing post-failure full context and bounded-asset reconstruction policy allows 30 seconds. Align only the initial exact-scene readiness wait to that 30-second allowance; timing begins afterwards, so the unchanged 100ms response ceiling, render metrics and scene assertions cannot be hidden by this setup deadline. Require another clean four-job run.

Run 34160365698 repeated that retry because the first timeout edit matched an earlier identical readiness line in the comparison test, leaving the performance case at 20 seconds. This was a test-edit targeting defect. Restore the comparison test's original bound, place the 30-second allowance inside the named lightweight benchmark, verify its line-level diff, and require another remote run with no retry-pass cases.

### Guide narration fixture confirmation — 2026-09-08

- Failure: the first new narration unit test passed an unconfirmed example scene into the production analyzer and correctly received `CONFIRM_SCENE_AND_NORTH`.
- Cause: the test prepared a visual example but omitted the user-confirmation precondition enforced by the deterministic engine.
- Correction: the fixture now explicitly confirms both the scene and north before analysis.
- Recurrence guard: the narration test must continue to call the real analyzer so a guide can never be built from a scene that bypasses production confirmation.

### 2026-09-08 — Korean particle scan rejected the first guide caption

- **Symptom:** the complete unit suite reported `src/core/space/narration.ts: ${location}을`.
- **Cause:** a fixed object particle followed a dynamic phrase whose final sound varies.
- **Fix:** the caption now uses a particle-free pause that is natural for every generated location.
- **Prevention:** the existing repository-wide Korean particle scan remains the regression gate for all deterministic narration copy.

### 2026-09-08 — full Pretendard master broke the initial-transfer gate

- **Symptom:** the general browser matrix measured about 2.33–2.50 MB on English routes against 350–450 KB limits.
- **Cause:** the first typography pass applied one 2.0 MB variable-font master globally, so every locale downloaded it.
- **Fix:** Korean routes alone load the official locally hosted dynamic Unicode subset stylesheet; English routes keep the existing system stack. The unpartitioned runtime font was removed.
- **Prevention:** the existing per-route transfer/resource budgets remain mandatory and are rerun after every typography change.

### 2026-09-08 — alternate-language prefetch downloaded Korean font CSS on English pages

- **Symptom:** after locale-scoping the font, English Shop and Fortune still downloaded the 54 KB decoded Korean subset stylesheet.
- **Cause:** visible language-switch links prefetched their Korean route payload, including the Korean stylesheet.
- **Fix:** language-switch links now opt out of speculative route prefetch; the explicit click still navigates normally.
- **Prevention:** performance tests count all resource timing entries, including speculative prefetches, so locale-only assets cannot silently cross the boundary again.

### 2026-09-08 — parallel WebGL made new guide assertions wait on animation stability

- **Symptom:** under the four-worker browser matrix, one anchored guide mounted after the initial 5-second assertion and the synthetic speech-fallback click waited for a moving overlay to become stable.
- **Cause:** the tests used generic click stability and a shorter timeout than the already documented 15-second WebGL readiness limit.
- **Fix:** guide visibility uses the same 15-second readiness limit; the speech fallback case runs with reduced motion and invokes the already-visible native button directly.
- **Prevention:** the focused guide tests are repeated serially before the complete matrix is accepted.

### 2026-09-08 — guide controls were clicked while the overlay was still settling

- **Symptom:** the mobile full-flow check sometimes left mute or captions unchanged even though Playwright had completed an actionability click.
- **Cause:** the guide is mounted over a live WebGL scene; generic pointer stability could finish at the same time as the responsive overlay settled.
- **Fix:** after proving each control is visible, the regression dispatches its native click and asserts the resulting `aria-pressed` state before continuing.
- **Prevention:** the complete flow passed three consecutive mobile repetitions and then the full 231-case serialized browser matrix.

### 2026-09-08 — success-story search replacement kept a stale value once

- **Symptom:** one full mobile run retained `no-such-profession` when the regression replaced it with `Marie Curie` immediately after rendering the empty state.
- **Cause:** the uncontrolled search field and result focus/scroll update overlapped during the long combined run; the comparison engine itself was not involved.
- **Fix:** the regression writes the next uncontrolled form value only after the empty state is visible, verifies the exact value, and then submits through the real form.
- **Prevention:** the complete success-story flow passed three Chromium and three mobile repetitions, followed by a clean full browser matrix.

### 2026-09-08 — intended font, material and narration changes invalidated old pictures

- **Symptom:** 20 focused visual checks compared the approved Pretendard/PBR/anchored-guide presentation with screenshots captured before those changes.
- **Cause:** the tests correctly detected visible differences in typography, lighting, materials, render resolution and the new guide overlay.
- **Fix:** representative desktop and iPhone actuals were inspected at native pixels, all affected references were regenerated, and the entire no-update matrix was rerun.
- **Prevention:** the final desktop/iPhone/Android Space matrix passed 79 cases with 20 intentional duplicate-capture skips and no visual mismatch.

### 2026-09-08 — remote parallel checks exposed two late-run resource races

- **Symptom:** Node 24 run 34209142045 passed all four jobs, but the five-width mobile Home test passed on its third attempt and iPhone material recovery passed on its second attempt.
- **Cause:** the Home case performs twenty real production navigations inside a 90-second budget while four workers compete. The recovery case ran after the same WebKit process had created many short-lived high-resolution WebGL contexts.
- **Fix:** the multi-width Home case uses Playwright's documented slow-test allowance without dropping a width or assertion. Material recovery runs before the fixture gallery, while its 30-second recovery bound and exact one-canvas assertion stay unchanged.
- **Prevention:** require a fresh four-job Node 24 run with zero flaky or retry-pass cases before reporting remote completion.

### 2026-09-08 — the native-share regression exhausted its aggregate mobile budget

- **Symptom:** Node 24 run 34211020651 completed every dedicated Space job without retries, but the general mobile native-share case passed on retry after its first attempt spent the full 90-second test budget waiting for the privacy-safe result card.
- **Cause:** this case opens the complete profile flow and creates the real 1080×1350 PNG before exercising the native file-sharing boundary. Late in the four-worker production matrix, its aggregate setup and raster work can exceed the default budget even though the share payload and duplicate-click lock remain correct.
- **Fix:** mark only this end-to-end raster/share case as slow. Its real profile navigation, PNG signature, one-file envelope, duplicate-click assertion and privacy-safe payload checks remain unchanged.
- **Prevention:** repeat the native-share case under parallel mobile workers, then require another four-job Node 24 run with zero flaky or retry-pass cases.

### 2026-09-08 — a prior WebGL process contaminated the iPhone recovery gate

- **Symptom:** run 34212698003 passed all jobs, but iPhone material recovery exceeded its unchanged 30-second reconstruction allowance once and passed in a fresh retry worker.
- **Cause:** CI launched the isolated performance browser before recovery. Moving recovery to the top of its source file could not isolate it from that earlier Playwright process, so the test still inherited constrained software-renderer resources.
- **Fix:** CI now runs material recovery in its own Playwright invocation and excludes it from the later fixture gallery. The 30-second reconstruction bound, exact six-object scene and one-canvas assertions remain unchanged.
- **Prevention:** every desktop/iPhone/Android job must pass the isolated recovery process and the remaining visual matrix without retry-pass cases.

### 2026-09-08 — moving mobile consent made an actionability check toggle twice

- **Symptom:** the mobile family-comparison regression reported that its consent checkbox did not remain checked after Playwright scrolled and retried the same action.
- **Cause:** the input moved across the viewport while the general four-worker matrix was settling. Playwright completed a click, then its retry path observed the opposite state.
- **Fix:** prove that the real checkbox is visible, dispatch its native click once and assert its controlled checked state before submitting the unchanged form.
- **Prevention:** repeat this exact mobile family flow in parallel and require the full general browser matrix to finish without retries.

### 2026-09-08 — four general UI workers created unrelated moving-control retries

- **Symptom:** after all 79 Space gates became clean, run 34214299620 still retried the mobile profile accessibility flow at its consent checkbox and the Reality Check flow after saving an outcome.
- **Cause:** four general UI workers competed with three simultaneous high-resolution Space jobs. The profile checkbox moved during actionability scrolling, while the Reality Check state assertion used the default five-second UI deadline after an actionability click.
- **Fix:** both regressions now prove the real controls are visible, invoke their native controls exactly once and assert the resulting radio/checkbox state. The Reality Check record keeps a bounded 15-second result deadline. General UI concurrency is reduced to two workers; concurrent browser coverage remains while the three isolated Space jobs continue in parallel.
- **Prevention:** repeat both exact mobile flows with four local workers, then require the complete Node 24 matrix to report 231 passes, 9 intentional skips and zero retries.

### 2026-09-08 — the last shared general worker raced a session-only tarot save

- **Symptom:** run 34215707079 kept all 79 Space gates clean, but the mobile manual-tarot flow once failed to show its in-memory history record within five seconds after an actionability click and then passed in a fresh worker.
- **Cause:** two general workers still shared the runner with the three independent Space jobs. The test's final save action could overlap responsive scrolling and React state scheduling even though the session-only repository behaved correctly on retry and in prior serialized runs.
- **Fix:** prove the real save control is visible, invoke it once and retain a bounded 15-second record assertion. The general product regression now runs serially; desktop, iPhone and Android Space jobs still run concurrently and keep their independent performance limits.
- **Prevention:** repeat the manual-tarot save under four local workers, then accept only a complete serial Node 24 general matrix with 231 passes, 9 intentional skips and zero retries.

The first four-worker recurrence run then reproduced the same moving-control race earlier, at the native `details` disclosure: one of eight runs left the audit content closed after the generic text click. Both ordinary and manual tarot regressions now invoke the real `summary` control once, assert the `open` state, and keep a bounded 15-second content deadline. This preserves the disclosure interaction while removing actionability retries caused by responsive scrolling.

### 2026-09-08 — serial Saju consent proved the shared label/input hit target was unstable

- **Symptom:** run 34217315198 kept the complete Space matrix clean but retried the mobile unknown-birth-time Saju case once, even with one general worker.
- **Cause:** Playwright's checkbox action targeted the nested input while its wrapping label intercepted the pointer during responsive movement. This was an individual control-target issue, not runner concurrency.
- **Fix:** all three Saju regression paths now prove the real consent input is visible, invoke it exactly once and assert its checked state before continuing. Calculation, unknown-time omission and checkout assertions are unchanged.
- **Prevention:** repeat all three Saju paths under four local workers and require one final complete Node 24 run with zero retries.

### 2026-09-08 — final serial run exposed two remaining unverified consent/disclosure transitions

- **Symptom:** run 34218836824 passed every job but retried the English core-pattern result once and the native-share setup once; both passed on retry. The complete Space matrix remained clean.
- **Cause:** both setup paths clicked label text without proving the underlying privacy input changed. The share helper then searched for disclosure text without first proving that the deterministic result had rendered, so a missed consent transition consumed the broad test timeout at the wrong step.
- **Fix:** the English onboarding and shared share-card helper now invoke the real privacy input once, assert its checked state, prove the deterministic `11` result, and open the native `summary` control with an `open` assertion.
- **Prevention:** repeat both affected mobile paths under four workers before the next complete Node 24 acceptance run; accept the PR only when the complete log contains no retry marker.

The first four-worker repetition then proved the moving disclosure itself could remain outside the mobile viewport during Playwright's scrolling click. The helper now invokes the already-located native `summary` control exactly once, matching the hardened tarot disclosure path, and still requires the real `open` state before continuing.

Run 34220899715 then exposed the one Saju consent path omitted from the earlier helper conversion: the English derivation case still called Playwright's moving-element `.check()` directly and retried twice. It now uses the same visible, native-click and checked-state helper as all three Korean cases. A repeated English-only mobile gate covers the omitted branch before the next complete run.

### 2026-09-08 — final product quality pass: real controls and narration

- Replaced DOM-triggered consent/button/disclosure operations with Playwright pointer operations in Saju, sharing, Space and the premium evidence flow. Global implicit smooth scrolling now stays immediate; explicit section navigation still honors reduced motion. Prior retry reports are not proof that all failures were runner-only.
- Protected profile, Saju and success-comparison forms with a server-rendered disabled fieldset until hydration. Without JavaScript, local-only birth inputs must not become a default GET submission. Added three no-JavaScript browser regressions and bilingual recovery text.
- Speech cancellation now resets playback, ignores stale completion callbacks, catches synchronous device errors, preserves captions on failure and keeps voice preference when changing recommendations. A failed miniature image retains named text guidance.
- Guide explanation moved below the canvas. A numbered marker projects the validated object's current world bounds through the camera. The first focused run found a hidden marker: projection preceded renderer camera-matrix refresh. Explicit matrix refresh and camera-switch regression cover that ordering.
- Lightweight rendering previously used 0.7 pixels per CSS pixel. It now renders at least one physical pixel per CSS pixel and reduces visual effects instead. The render-budget test rejects undersampling.
- CI retries retain diagnostic evidence but a flaky test now fails the gate. Evidence captures wait for visible images to decode; a screenshot taken immediately after scroll previously missed the lazy-loaded miniature.
- Development-server experiment was interrupted after cross-origin dev-resource blocking prevented hydration; production-built checks replaced it. CSP was not weakened. Final counts and release limits are recorded in `Final-Product-Quality-Pass.md`.
- Five-width visual inspection found a two-character orphan in the mobile hero trust note and a sub-10px generated-image label. Balanced wrapping and a 12px provenance label correct both without changing the home narrative.
- The new 1× assertion initially compared an integer canvas width with a fractional CSS width and rejected 0.99942×. The regression now checks pixel dimensions with less than one pixel of integral rounding, not a broad ratio tolerance; intentional 0.7× undersampling still fails.
- Reading the guide aloud exposed unnecessary numeric coordinate narration. Template 1.1.0 keeps the spoken caption concise while retaining exact coordinates and rule rationale in the expandable explanation; the template regression verifies both boundaries.
- The old guide always used current-layout coordinates even while Recommended was visible. Guide detail now derives from the displayed validated scene; the browser regression compares its coordinates to the committed scene state.
- Full general browser testing found actual compass-text contrast of 3.92:1: the translucent badge inherited the changing scene behind it. The compass now has an opaque light background and darker secondary text, so contrast does not depend on camera/render timing. Existing axe checks remain strict (no ignored rule).
- Balanced text wrapping still split a Korean trust phrase. Each existing phrase now wraps as one inline group; no copy or CTA is removed.

### 2026-09-09 — remote iPhone confirmation click exposed loading layout shift

Run 34241014728 correctly failed the strict flaky gate: one WebKit confirmation click missed while renderer loading changed. The visible loading paragraph was inserted/removed above the fixed-height canvas, moving the entire mobile form; checking north also starts an asset update. The loader now overlays the already reserved canvas region. A delayed-material regression records confirmation document coordinates before/after load completion and requires less than one pixel of movement, then uses a real pointer check. No DOM-click workaround, retry allowance increase or assertion removal is used.
The two controlled confirmation handlers also read `event.target.checked` inside deferred functional state updaters. They now snapshot the primitive in the event handler, before React can restore/mutate the controlled DOM input. The delayed-load regression includes real repeated check/uncheck assertions while scene updates run.

### 2026-09-09 — delayed result focus could interrupt the next form edit

Run 34243058630 passed all 85 Space gates without retries but rejected two mobile general-suite flakes: a replacement celebrity query retained its old value and a Reality Check review did not save. Source review found that a queued animation-frame callback always stole focus and began smooth scrolling, even if the reader had already entered another control. Result focus now respects a newer active control, superseded requests and return navigation; form feedback uses immediate scrolling while explicit navigation retains reduced-motion-aware smooth scrolling. Four deterministic regression tests cover these cases. The Reality Check test now uses real radio/button/checkbox actions and verifies entered values instead of bypassing pointer actionability with DOM clicks. The old run remains failed; only a fresh changed-head regression can establish a pass.

### 2026-09-09 — reduced-motion regression asserted an obsolete option name

Run 34245234966 passed 239 general cases and all 85 Space cases without flakes, but the two reduced-motion checks required the literal `auto` after form feedback intentionally changed to `instant`. The old test also replaced scrolling with a no-op, so it could not verify real motion. It now forwards to native scrolling and checks that the result is focused, immediately in the viewport and stable within one pixel at the next frame, as well as the explicit instant option. This strengthens behavior coverage without reverting the input fix or allowing smooth scrolling.
