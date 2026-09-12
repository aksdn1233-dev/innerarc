# Korean Residential Template Engine V1

Status: production release completed on 2026-09-12 with the owner's authorization. Physical iPhone/Android validation and real-complex coverage remain out of scope.

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

Production received `20260912000100_korean_residential_template_engine.sql` after its daily-acquisition, PPI, and Space V1 prerequisites. Hosted schema lint and bounded owner/service policy probes passed. Roll back new UI writes by disabling `SPACE_ENABLED`; disable `SPACE_AI_ENABLED` separately for a provider or cost incident. Retain the additive tables for historical export and deletion, and do not drop pinned versions during an incident. The immediate application rollback source is `6e918f73096bc3d802fc39324ae05106c0d1f489`.

## Acceptance and limits

The unit suite covers library count/provenance, deterministic ranking, explicit conflicts, double mirroring without drift, expansion overrides, every template/variant conversion, fixed-fixture rejection, calibration/version retention, RLS isolation, and no global overwrite. Release also requires the existing Space browser matrix, mobile overflow checks, production build, and hosted migration evidence.

Observed demand should be counted as distinct private projects by residence type/area with consented aggregate telemetry only. Revision and coverage thresholds live in `residential_template_engine_settings`; no application constant promotes templates. Reversal triggers are increased manual correction/conflict rates, misleading real-complex interpretation, fixed-fixture movement, loss of account export/delete, or regression in current Space completion.

## Production release evidence — 2026-09-12

- Source: PR #64 merge `e8593380b594d55b85d2756840500ab487191766`.
- Database: `20260825000100`, `20260830000100`, `20260907000100`, and `20260912000100` applied to the linked production project. Schema lint returned no errors. Space storage remains private with a 3.5 MB JPEG limit; anonymous access and authenticated writes to service-only template tables/functions were denied in the release probes.
- Validation: Node 24 lint completed with zero errors, typecheck passed, 1,175 unit tests across 120 files passed, the 134-route production build passed, and the dedicated Space behavior run passed 23 cases with four intentional device skips.
- Runtime: Cloudflare Worker version `9b70b0e4-bb61-4258-99b7-473dbeddea93`; public Sites version 106. Both origins returned 200 for health and representative Korean, English, and Japanese routes. The health endpoint reported site/database OK and payments open.
- Rollback: restore Worker version `69ff79b4-2120-4934-b191-be24fdd9e606` and Sites version 105, or revert application code to `6e918f73096bc3d802fc39324ae05106c0d1f489`. Preserve owner reads, export, deletion, image expiry, cleanup, and all migrated rows.
- Remaining evidence: GitHub-hosted checks could not start because of the account payment/spending limit. Physical iPhone/Android camera, touch, memory, and GPU checks were not performed and must not be inferred from emulated browser projects.
