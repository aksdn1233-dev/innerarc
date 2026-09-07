# Space premium visual audit — PR #22 additive pass

This audit uses the current application screenshots, not generated concept art. Scores are internal review aids; the owner decides visual acceptance. Geometry and recommendations remain authoritative, while furniture finish, lighting and the neutral studio backdrop remain labelled visualization styles.

## Baseline audit before this pass

The expanded 14-category baseline is 8.53/10, consistent with the earlier 8.51/10 ten-category review. Performance is already at 9.0 and is held as a guardrail. Every category below 9.0 has three visible weaknesses recorded below.

| Category | Baseline | Top three visible weaknesses |
|---|---:|---|
| Geometry accuracy | 8.7 | hard-edged cutaway foundation; thin visual separation at floor perimeter; no spatial guide for a changed object |
| Furniture assets | 8.4 | licensed sofa/chair are more organic than procedural casegoods; nightstand reads boxy at distance; desk/lamp silhouettes share simple profiles |
| Materials | 8.5 | window reads as an opaque blue panel; studio ground is a flat colour; wall/fabric roughness separates weakly in overview |
| Lighting | 8.4 | practical light makes a local wall hotspot; large overview areas feel flat; high and Ultra used nearly the same light budget |
| Shadows | 8.3 | exterior directional shadow is too dark and triangular; Ultra had no higher contact resolution; overview shadow competes with the room |
| Depth / grounding | 8.5 | window lacks layered daylight depth; flat exterior ground makes the room float; comparison positions have no depth cue |
| Architectural detail | 8.6 | unobserved centre mullion was fabricated; glazing depth is understated; ceiling/floor edge details disappear in overview |
| Camera | 8.8 | portrait margin is conservative; controls do not expose a distinct Perspective state; Reset and perspective intent are conflated |
| Composition | 8.4 | current/recommended pictures look almost identical; mobile leaves too much neutral space; changed furniture has no focal cue |
| Visual consistency | 8.6 | procedural and licensed furniture detail density differs; flat window conflicts with PBR furniture; comparison UI is less refined than the scene |
| Premium impression | 8.3 | Ultra is mostly a label; flat backdrop resembles a modeller viewport; comparison lacks an intentional result presentation |
| Interaction presentation | 8.5 | active camera mode is not announced; change path is invisible; exact movement is separated from the scene |
| Mobile quality | 8.4 | room is smaller than necessary; comparison labels do not summarize motion; controls have weak mode hierarchy |
| Performance | 9.0 | remote 100ms gate is green; preserve it while improving higher tiers |

## Gain / implementation cost / performance cost ranking

Scores use 1–5, where visual gain 5 is best and each cost 1 is cheapest. Priority is gain divided by both costs.

| Priority | Change | Gain | Build cost | GPU cost | Expected result |
|---:|---|---:|---:|---:|---|
| 1 | exact current/recommended summary plus validated ghost outline/path | 5 | 2 | 1 | the user sees what moved, where, how far and in which state |
| 2 | soften directional shadow and add a radial studio ground | 4 | 1 | 1 | room remains grounded without the large dark viewport-like wedge |
| 3 | remove unobserved mullion and layer daylight gradient + clearer glass | 4 | 1 | 1 | truthful opening with stronger depth and material separation |
| 4 | reduce proven portrait optical margin | 3 | 1 | 1 | larger mobile room while the corner projection proof prevents cropping |
| 5 | make Ultra a real preview tier: 4K directional, 1024 contact, 24-sample AO | 4 | 2 | 4 | visibly cleaner still-image inspection on capable desktop hardware only |
| 6 | expose Perspective / Top / Recommended / Reset states | 3 | 1 | 1 | clearer camera intent and keyboard/screen-reader state |
| 7 | wholesale replacement of all procedural furniture | 5 | 5 | 4 | deferred until a coherent, licensed pack beats current measured assets without load regression |

The first six changes are in this pass. Asset replacement is not justified by unknown licenses or style inconsistency; the existing manifest remains authoritative and the bed polygon count is corrected to its shipped 23,524-triangle geometry. No new user-room object is invented.

## Acceptance method

1. Run targeted unit/type/lint checks.
2. Build with the repository Node 24 contract.
3. Regenerate all representative desktop/iPhone/Android captures from the actual app.
4. Inspect bedroom, living room, mobile, current, recommended and Ultra Preview captures.
5. Run the no-update visual matrix, general regression and fake checkout.
6. Record remote performance evidence before asking the owner to accept any score between 8.7 and 9.0.

The pass is not complete until the owner reviews the actual captures. A new internal score cannot grant release approval.

## Post-change internal review

These scores were assigned after inspecting the regenerated application captures for the representative bedroom, living room, current/recommended comparison, mobile and Ultra Preview states. They are provisional until the owner inspects the same files.

| Category | Post-change | Evidence in the application |
|---|---:|---|
| Geometry accuracy | 8.8 | validated alternate-position outlines and paths use the exact scene bounds; camera corner proof remains green |
| Furniture assets | 8.6 | the nightstand now has recessed drawers and bounded handles; licensed organic seating remains stronger than procedural casegoods |
| Materials | 8.8 | clearer layered glazing, daylight gradient and radial studio surface improve separation without inventing room geometry |
| Lighting | 8.7 | softened directional balance removes the hard exterior wedge; restrained practical and window lighting remain |
| Shadows | 8.9 | the overview ground no longer receives the oversized shell shadow; higher tiers retain grounded contact and Ultra raises shadow resolution |
| Depth / grounding | 8.8 | localized grounding and window depth reduce the floating-model effect |
| Architectural detail | 8.8 | the unsupported centre mullion is removed while the measured frame and reveal remain |
| Camera | 9.0 | Perspective, Top, Recommended and Reset are explicit states; proven margins make portrait scenes larger without cropping |
| Composition | 9.0 | segmented state control, exact movement summary and scene cue give the recommendation a visible focal point |
| Visual consistency | 8.8 | backdrop, glazing and comparison presentation now match the existing PBR scene more closely |
| Premium impression | 8.8 | the studio presentation is cleaner and Ultra is a measured render profile; some procedural furniture still limits the ceiling |
| Interaction presentation | 9.2 | active camera and layout states are announced; the exact movement and rotation are available visually and as text |
| Mobile quality | 8.9 | the room occupies more of the portrait canvas and comparison information fits in one viewport |
| Performance | 9.0 | the unchanged three-browser budget matrix passes; Ultra cost is isolated from the default and performance tiers |

**Internal overall: 8.86/10. Lowest category: 8.6/10.** This clears the command's 8.7 minimum overall and 8.5 critical-category floor, but it does not reach the preferred 9.0. The owner must explicitly accept the actual captures at this minimum bar before the visual gate can be marked complete. Test success does not provide that acceptance.

No concept image or external unverified asset is part of this score. The pass added two 256×256 generated-at-runtime neutral textures (524,288 estimated bytes), one background grounding draw, and comparison-only guides. The performance tier remains at 0.7 render scale without shadow passes; Ultra now supersamples at least 1.5× and is a user-selected desktop inspection tier.
