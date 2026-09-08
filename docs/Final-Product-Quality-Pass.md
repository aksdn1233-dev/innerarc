# Final product quality pass — 2026-09-09

This report describes the additive pass after `52a70b80da6287693e09f17c9f8d3945c893c6be`. Test counts below are finalized only after the corresponding run finishes. No merge or production deployment is authorized in this pass.

## 1. FINAL COMMIT SHA

Use the PR22 head containing this report; the exact SHA is in the final handoff (avoids a self-referential commit hash).

## 2. PR #22 STATUS

Existing draft PR: https://github.com/aksdn1233-dev/innerarc/pull/22. Branch `codex/space-intelligence-v1`. No merge or deploy.

## 3. BASELINE VERIFIED

Clean starting SHA above. Fresh baseline: 113 unit files, 1,035 tests, Next build with 134 routes, typecheck passed, lint had 0 errors / 3 warnings. Old remote retry counts were inspected, not reused as fresh validation. Production is Cloudflare Worker `innerarc`; Next test build alone is insufficient. Both build targets and local Worker behavior are checked in this pass.

## 4. EVERY ISSUE FOUND

1. Global implicit smooth scrolling competed with control targeting; several browser tests bypassed pointer actionability.
2. Local personal forms had no pre-hydration submission protection.
3. Speech cancellation could leave Replay disabled; stale callbacks and synchronous device exceptions were unhandled.
4. Failed guide images had no readable named fallback.
5. Guide had object-ID metadata but no projected world marker, and its overlay covered the scene.
6. Projection before camera-matrix refresh initially hid the new marker; guide coordinates used the original scene even when Recommended was shown.
7. Lightweight mode enlarged a 0.7× buffer.
8. Capture timing could record an unloaded miniature.
9. CI retries could hide flaky interaction outcomes.
10. Mobile hero trust-note orphan and tiny generated-image label.
11. Three lint warnings and misleading fixed-birth-range / Worker-name documentation.
12. Compass text could fall to 3.92:1 contrast because its background was translucent.
13. Remote WebKit exposed a confirmation click failure: loading text moved the form, and checkbox updaters deferred reading mutable DOM state.
14. Queued result focus could interrupt a new edit; smooth result scrolling competed with mobile input. Two general-suite flakes exposed the remaining gap.

A dev-only hydration experiment was stopped because Next dev blocked cross-origin dev resources. Production checks were used; CSP stayed intact. See the failure ledger for causes and regression coverage.

## 5. EVERY ISSUE FIXED

Immediate implicit scrolling; grouped mobile trust phrases; real pointer checks; disabled SSR fieldsets until hydration with bilingual no-JavaScript guidance; speech lifecycle/error guards; named guide fallback; numbered world-position marker with explicit camera update and displayed-scene coordinates; opaque, high-contrast compass; explanation below canvas; minimum 1× lightweight render density; image-ready captures; failing CI on flakes; warning cleanup; phrase-grouped mobile hero note and readable 12px image provenance. Delayed result focus now yields to new input and return navigation, and form results scroll immediately. The 3D loader now occupies reserved canvas space, and confirmation handlers snapshot the click value before scheduling state updates. Fixed range policy and deterministic engines remain unchanged.

## 6. DESIGN CHANGES

The room stays visible while guidance appears below it. The numbered furniture marker moves with the current camera and layout. Mobile speech controls have 44px minimum height. Existing warm editorial home, dark workbench, source-backed success comparison and brand assets remain.

## 7. TYPOGRAPHY RESULT

Existing local Pretendard and Korean editorial headline face retained. Browser checks verify font load and no horizontal overflow; captures cover 390, 430, 768, 1024 and 1440px. These are emulated layouts, not physical-phone certification.

## 8. HOMEPAGE RESULT

Existing independent 3D 공간운 menu and narrative retained: personal pattern → people → relationships → space → real-life check. No fabricated audience/revenue metrics added. Existing comparison images remain proportionate and at least native display density.

## 9. SUCCESS STORY RESULT

Seven public figures retained. Source-supported career events, symbolic comparison, context, unknowns and user experiments stay separate. No causal claim that birth caused success. Public-source refresh reached Obama, WTA, Spurs and Mandela directly. Direct requests to some Nobel/BIGHIT/Malala pages were blocked; indexed primary Nobel pages confirmed Curie/Malala birth and prize facts, and BIGHIT’s Korean profile confirmed the 2013 BTS debut. This does not establish private training habits, causal success formulas or every unknown factor. Existing source provenance remains visible. Real search, result and Reality Check handoff are exercised.

## 10. SPACE INTELLIGENCE RESULT

`/ko/space` and `/en/space` remain independent public demos. Private `/space/workspace` requires login and is noindex. User photography requires evidence checks and confirmation; arbitrary photographs cannot guarantee exact geometry. Missing measurements and unclear views stay uncertain and recoverable. No private images are used as fixtures.

## 11. 3D RESULT

WebGL with existing measured geometry, PBR assets, deterministic collision/rotation and current/recommended layouts. No image generation substitutes for geometry. Minimum lightweight buffer density increased from 0.7× to 1×; higher tiers retain their actual render-resolution display. World marker projection is tested after camera changes.

## 12. MINIATURE RESULT

Six existing dedicated 1254×1254 RGBA assets retained. File inspection confirmed alpha transparency; no concept-sheet crops or upscaling added. Guide captions and name remain usable after an image failure. Screenshots wait for image decode before visual acceptance.

## 13. NARRATION RESULT

Muted by default; explicit unmute/replay; captions on by default. Caption changes cancel prior speech, return-to-prior-caption does not lock replay, old callbacks cannot mutate the current playback state, synchronous errors preserve readable captions. Short spoken captions name the furniture/action; exact validated coordinates remain in the expandable explanation. No paid TTS or LLM call. Physical device voice quality remains unverified.

## 14. MOBILE RESULT

Five viewport widths plus iPhone WebKit / Android Chromium emulation. Pointer, keyboard, camera and reduced-motion behavior are exercised. Actual iPhone/Android GPU, touch hardware and installed voices require physical devices.

## 15. REALITY CHECK RESULT

Success comparison continues into an explicit local action, outcome and confidence reflection. Existing storage/export/deletion boundaries remain. Space demo applied-change clicks explicitly say they are practice and not saved; private persistence needs authenticated hosted validation.

## 16. MARKETING READINESS

Product demonstrations and source/claim boundaries are usable. This pass creates no demand evidence or conversion results and changes no 9,600/39,000 KRW payment products. Launch claims about photo reconstruction must wait for representative opt-in real-world capture testing. No guaranteed scientific, financial or medical outcomes.

## 17. ACCESSIBILITY

Semantic controls, readable text analysis, reduced motion, 44px guide buttons and no-JavaScript explanation. Automated axe and overflow checks are reported with final test counts. Emulation is not a substitute for physical assistive-technology review.

## 18. PERFORMANCE

3D remains excluded from the home asset path; browser render metrics, draw/triangle budgets and lightweight response timing are checked. The 1× minimum eliminates deliberate undersampling, while lightweight effects remain disabled. Field performance and thermals are not inferred from this machine's synthetic measurements.

## 19. PRIVACY / SECURITY

No payment/auth/schema/provider secrets changed. Private storage, signed paths, MIME/count/size limits, EXIF sanitization, retention/deletion, account isolation and deterministic validation retain existing tests. Pre-hydration personal GET submission is newly prevented. Two image-size toolchain advisories remain documented exceptions: no patched release exists; the inspected vinext usage reads repository-controlled static image metadata at build time. Neither is represented as an audit score of zero.

## 20. HOSTED RLS RESULT

Local PGlite executes migrations and RLS/ownership tests. Hosted two-account Supabase/storage checks were not run: no configured credentials in this worktree. No migration applied to production.

## 21. MODEL ACCESS RESULT

No actual model ID is verified or configured in this worktree. `OPENAI_API_KEY` and `SPACE_AI_MODELS_JSON` are absent. Existing abstraction uses OpenAI `/v1/models` access checks and `/v1/responses`; unconfigured/unavailable models fall back to manual confirmed geometry and deterministic analysis. Astra availability is unverified, not asserted unavailable. Paid model calls in this pass: **0**.

## 22. PHYSICAL DEVICE RESULT

Not performed: no physical test devices available to this task. Browser emulation is labeled throughout.

## 23. EXACT TEST COUNTS

- Node **24.19.0**: lint 0 errors / 0 warnings, typecheck passed, **114 files / 1,039 unit tests passed**. Next production build emitted **134 routes**; actual Cloudflare/vinext deployment build passed.
- General browser suite: **238 passed / 1 failed / 9 skipped / 0 retries**. The one failure found real compass contrast and was fixed; the exact affected gate is rerun below rather than rewriting this run as green.
- Full three-engine Space matrix: **81 passed / 1 failed / 20 duplicate skips / 0 retries**. The failure was integer-vs-fractional pixel measurement; corrected isolated performance rerun: **3/3 passed**.
- Subsequent changed-scope three-engine/5-width gate: **34 passed / 20 duplicate skips / 0 retries** (speech, world-coordinate consistency, forms, Before/After, home and success/Reality Check captures).
- Mock checkout: **8/8 passed** (two disjoint four-test runs); no real charges.
- Local Worker: **5/5 route responses**, plus hydrated Space controls and five-card success comparison, zero page exceptions. No hosted-account claim.
- Final correction reruns: **40 visual/interaction checks passed / 20 duplicate skips**, **6 accessibility checks passed**, **0 retries / 0 failures**. All 114 screenshots were refreshed. These validate the compass and phrase-wrapping fixes after the failed general run. Remote PR status is linked in the final PR handoff, independently from these local results.

- Follow-up after remote run `34241014728`: **27/27 three-engine Space input tests + 10/10 repeated iPhone checks passed**, without retries. A delayed-material test verifies less than one pixel of form movement and repeated real pointer checks. Lint, typecheck, Next and Cloudflare builds passed again. The old remote run passed general/desktop/Android gates but correctly failed one flaky iPhone check; final-head CI is reported separately in the PR.

- Run `34243058630` passed all **85 Space checks / 20 duplicate skips / 0 retries**, but correctly failed two mobile general-suite flakes (239 other tests passed, 9 skipped). A subsequent focus/scroll correction and four deterministic regression cases address the discovered input race; the corrected two flows passed **20/20 repeated desktop/mobile checks** without retries. Lint, types, all 1,039 units and both production build targets passed. Final-head CI counts are linked in the PR handoff.

## 24. SCREENSHOT LOCATIONS

**114 current screenshots**: 75 five-width product/home captures and 39 three-engine room/camera captures.

`tests/visual/snapshots/desktop-space/`: five-width home/product evidence, guide, success result, Reality Check and Before/After.
`tests/visual/snapshots/{desktop,iphone,android}-space/`: six representative geometry fixtures and camera/comparison views.
`artifacts/final-quality/`: baseline and targeted local inspection screenshots (ignored local evidence).
Authenticated upload screenshots are not fabricated; the login gate is captured instead.

## 25. REMAINING EXTERNAL BLOCKERS

Hosted account/storage/RLS credentials; actual provider model entitlement; physical phone/GPU/voice testing; representative consented real capture validation and first-time customer feedback. Upstream image-size has no patched release, with the build-only exception documented. User explicitly prohibited merge/deploy.

## 26. BEFORE SCORE

8.57/10, from the category deductions below, reviewed against the starting build. This is not the previous report’s copied 8.9. Scores are subjective review judgments, not correctness probabilities or measured demand.

## 27. AFTER SCORE

9.15/10 under the stated local evidence boundary. Each category starts at 10; the remaining deduction is listed below. A missing external verification is not labeled a passed test.

| Category | Before | After | Remaining deduction |
|---|---:|---:|---|
| Typography | 9.0 | 9.5 | Physical OS font rendering not certified |
| Korean readability | 9.0 | 9.5 | Physical-device and first-reader review absent |
| Visual hierarchy | 9.0 | 9.5 | Final owner/customer visual acceptance absent |
| Whitespace | 9.5 | 9.5 | Reviewed emulated layouts; real device confirmation absent |
| Layout | 9.0 | 9.5 | Emulation only |
| Brand identity | 9.0 | 9.0 | Owner/customer visual acceptance absent |
| Homepage | 9.0 | 9.5 | Real first-visit comprehension/conversion evidence absent |
| Personal Pattern UX | 8.5 | 9.5 | Pre-hydration risk fixed; field usability evidence absent |
| Success Story UX | 8.5 | 9.0 | Private habits and causal contribution remain unknown |
| Relationship UX | 9.0 | 9.0 | No new field study |
| Space Intelligence | 8.0 | 8.5 | Hosted reconstruction and representative real photos unverified |
| 3D rendering | 8.0 | 8.5 | No physical mobile GPU/thermal verification |
| Character quality | 9.0 | 9.0 | Dedicated native assets retained; final owner acceptance absent |
| Character integration | 7.0 | 9.5 | Projection/scene obstruction fixed; physical-phone review absent |
| Narration | 7.0 | 8.5 | Lifecycle fixed; installed native voices not audited |
| Before / After | 9.0 | 9.5 | Deterministic scenes verified; physical mobile experience unverified |
| Reality Check | 9.0 | 9.5 | Local handoff tested; hosted account behavior unverified |
| Mobile | 8.0 | 9.0 | Device emulation only |
| Tablet | 9.0 | 9.5 | Viewport emulation only |
| Desktop | 9.0 | 9.5 | Local/CI coverage, no multi-hardware field trial |
| Accessibility | 8.5 | 9.0 | Automated checks do not certify physical assistive technology |
| Performance | 8.5 | 9.0 | Synthetic budgets, no field/device telemetry |
| Privacy | 8.0 | 8.5 | Hydration fixed; hosted two-account storage proof absent |
| Trust / claims | 9.0 | 9.0 | Private context/causality remain unknown; symbolic claims bounded |
| Marketing readiness | 8.5 | 8.5 | No newly collected demand/conversion evidence |
| Error / empty / loading | 8.0 | 9.5 | Fault injection tested; real provider integration unavailable |
| Overall commercial polish | 8.5 | 9.0 | External launch evidence incomplete |

## 28. LOWEST-SCORING CATEGORY

End-to-end Space/3D field readiness: actual hosted reconstruction and physical-phone results are missing. A local demo cannot certify arbitrary real photographs.

## 29. WHY IT IS OR IS NOT A TRUE 10/10 RELEASE CANDIDATE

It is not a proven 10/10 commercial release. Repository tests and visual evidence establish a bounded candidate; unavailable hosted/provider/hardware/customer evidence cannot be replaced by invented successes. No merger or production rollout is performed.

## Change scope and rollback

Additive UI/lifecycle/test/documentation changes only; no new migration. Disable `SPACE_ENABLED` to hide Space entry points; disable `SPACE_AI_ENABLED` to prevent model calls while preserving manual analysis. Revert the quality-pass commits in reverse order for their UI changes; the preserved baseline is `52a70b80da6287693e09f17c9f8d3945c893c6be`. Never roll back existing billing or delete historical entitlements.

V2 only: AR, LiDAR, full-home scanning. Not implemented here.

## Sources checked in this pass

- [ICNS advisory](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr), [JXL/HEIF advisory](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq): no patched version listed.
- [Obama office biography](https://barackobama.com/about/), [WTA Serena biography](https://www.wtatennis.com/news/4487583/legend-bio-serena-williams), [Spurs Son profile](https://www.tottenhamhotspur.com/the-club/history/legends/heung-min-son), [Mandela Foundation biography](https://www.nelsonmandela.org/biography): provenance cross-checks, not proof of symbolic causality.

- [Curie Nobel facts](https://www.nobelprize.org/prizes/physics/1903/marie-curie/), [Malala Nobel facts](https://www.nobelprize.org/prizes/peace/2014/yousafzai/), [BIGHIT Korean profile](https://ibighit.com/bts/kor/profile/index.html): indexed primary-source cross-check when direct retrieval was blocked.

## Changed implementation files

- `src/components/hydration-gate.tsx`, `src/components/accessibility.ts`; profile/onboarding, Saju and celebrity forms; four focus regression tests.
- `src/components/space/{room-view,guide-narration,workbench}.tsx`, `space.module.css`, `src/core/space/narration.ts`.
- `src/components/taeryeong-landing.tsx`, `src/app/{globals,taeryeong-landing}.css`; intentional-video-poster lint annotations.
- `src/core/birth-range.ts`, `vite.config.ts`: documentation/warning cleanup only; policy values and Worker configuration preserved.
- `playwright.config.ts`, focused E2E/visual tests, miniature template regression, 114 screenshot baselines; failure ledger/checklist/runbook and this report.
