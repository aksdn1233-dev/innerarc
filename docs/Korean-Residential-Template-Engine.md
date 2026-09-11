# Korean Residential Template Engine V1

Status: reviewable additive implementation; production migration and deployment are not authorized.

## What ships in this branch

- A versioned, deterministic `ResidentialTemplate` domain separated from the existing renderer.
- 25 project-owned synthetic apartment structure samples across 39/49/59/74/84/101/114㎡ plus five generic fallbacks for villa, officetel, detached house, studio, and one-bedroom homes.
- Candidate matching by explicit field equality. `MATCH_SCORE` is a 0–100 field-match score, not a probability, model confidence, or claim that a sample is the user's actual home.
- Deterministic standard, left/right mirrored, balcony-expanded, and mirrored-expanded variants. Mirroring updates rooms, openings, objects, kitchen fixtures, service points, orientation, camera, and action coordinates.
- Fixed, semi-fixed, and movable classifications. Sink and cooktop coordinates stay fixed; deterministic recommendations cannot move fixed fixtures.
- A converter from the selected full-home structure to the existing single-room `Scene` contract. V1 renders the living-room/kitchen work area. Full-home Dollhouse, CAD/PDF ingestion, public complex datasets, LiDAR, RoomPlan, and AR remain future work.
- Private, owner-isolated selection and correction persistence. User corrections do not edit global revisions. Internal candidate aggregation is review-only and reads configurable thresholds from data.

## Truth and provenance

Every bundled sample has verification level 0 and `project_owned_synthetic` provenance. It has no brand, complex, or building identity and must never be presented as a real complex plan. Real-complex support remains blocked until a licensed dataset, source-refresh owner, verification procedure, and takedown path exist.

Verification levels are: 0 internal structural example, 1 single unverified reference, 2 cross-checked source, 3 measured/confirmed plan, 4 reviewed production template. Photos can raise or lower evidence status for a private project but never silently promote a global template.

`CONFIRMED`, `LIKELY`, `ESTIMATED`, `CONFLICT`, and `UNKNOWN` describe the evidence state. A conflict routes the user to a discriminating question, a mirror/variant choice, or the existing photo/manual fallback. Photos do not prove hidden geometry or absolute scale; one real measurement is still required for photo-derived geometry.

## Data and privacy

Public structural identity is independent of apartment brand. Optional complex, building, and unit-type text is stored only in the owner's project selection, protected by owner RLS, included in account export, and deleted with the project/account. Exact unit numbers, public map coordinates, and public address indexes are not collected by this flow.

Selections pin `template_id + version + variant`, so future revisions cannot rewrite saved projects. Private corrections are idempotent by owner/request and can only become an internal revision candidate through a separate reviewed process. No user correction automatically mutates a shared template.

## Operations and cost

Template matching, variants, geometry conversion, score calculation, questions, and rendering are local deterministic code. They add no model tokens or provider cost. Existing photo extraction remains the only optional high-cost path and retains its consent, rate, token, cost, retry, and fallback limits. Prices and entitlements remain unchanged at 9,600/39,000 KRW where applicable.

Run migration `20260912000100_korean_residential_template_engine.sql` after the existing Space migration in staging. Keep `SPACE_ENABLED` off until migration, owner-RLS, export/delete, browser, hosted storage, and physical-device gates pass. Roll back UI writes by disabling the existing flag; retain the additive tables for historical export and deletion. Do not drop pinned versions during an incident.

## Acceptance and limits

The unit suite covers library count/provenance, deterministic ranking, explicit conflicts, double mirroring without drift, expansion overrides, every template/variant conversion, fixed-fixture rejection, calibration/version retention, RLS isolation, and no global overwrite. Release also requires the existing Space browser matrix, mobile overflow checks, production build, and hosted migration evidence.

Observed demand should be counted as distinct private projects by residence type/area with consented aggregate telemetry only. Revision and coverage thresholds live in `residential_template_engine_settings`; no application constant promotes templates. Reversal triggers are increased manual correction/conflict rates, misleading real-complex interpretation, fixed-fixture movement, loss of account export/delete, or regression in current Space completion.
