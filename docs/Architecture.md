# Architecture

## System shape

```text
Next.js UI
  ├─ consent + locale boundary
  ├─ deterministic numerology core
  ├─ auditable tarot core
  ├─ deterministic relationship-reflection core
  ├─ deterministic lifestyle-curation core
  ├─ source-bound public-figure comparison
  ├─ privacy-safe local share rendering
  ├─ rule-based symbol mapping
  └─ application services
       ├─ user-context retrieval
       ├─ AI provider adapter
       ├─ output schema + fact validator
       ├─ safety gate
       ├─ consent-gated analytics + AI cost meter
       ├─ versioned entitlement evaluator
       ├─ payment provider boundary
       └─ persistence adapter
            └─ PostgreSQL/Supabase (external)
```

## Current modules

- `src/core/numerology`: pure date/name calculations and versioned evidence.
- `src/core/onboarding`: strict locale-independent focus/depth input, bounded session-only concern normalization, a versioned contextual-reflection layer, and an explicit disabled-provider consent notice. It has no calculation, persistence, network, analytics, or share side effects.
- `src/core/profile`: deterministic bilingual onboarding and eight-domain integrated profile, including evidence-bound explanatory career role ranking.
- `src/core/ai`: provider-neutral request/output contracts, fallback, canonical-fact validation, safety classification, and a versioned region-labelled official crisis-resource registry.
- `src/core/ai/context`: owner-scoped consent gate, journal-retention gate, bounded context records, and an explicitly untrusted provider envelope.
- `src/core/tarot`: 78-card bilingual deck, nine spread definitions, seeded/secure draws, manual-card validation, audit metadata, structural combination rules, canonical reading snapshots, idempotent history, export/delete, and safe device storage.
- `src/core/relationship`: versioned ranking of meeting-context hypotheses, relationship energy sources, complementary partner qualities, cycle lenses, evidence references, and reality checks. It never emits odds or a predicted person.
- `src/core/lifestyle`: versioned accessory and music-direction curation from canonical numerology facts. It returns stable bilingual category/lane IDs, evidence references, reality checks, and safety notes; it contains no product ranking, price, medical claim, or commerce side effect.
- `src/core/commerce`: future product-disclosure schema, prohibited-claim validation, tracking-free public links, strict separation of organic and sponsored collections, and an evidence-backed twelve-gate launch assessment. Even a passing assessment cannot render purchase controls or perform deployment.
- `src/core/compatibility`: versioned two-profile relationship reflection for seven relationship types, eight required operating domains, pair evidence, symmetric observations, and explicit power-role cautions.
- `src/core/celebrity`: source-bound public birth-date records, date-only structural comparison, field filters, uncertainty, and non-identity match labels.
- `src/core/share`: purpose-specific allowlisted payload builders, sensitive-pattern/overclaim validation, XML escaping, and self-contained local SVG rendering without remote assets. The client share adapter converts only that validated SVG to an in-memory 1080×1350 PNG, uses explicit native file sharing when supported, and otherwise downloads locally.
- `src/core/reality-check`: versioned reflection records, five-level relevance reviews, idempotent repository contracts, a pure action-first review-queue derivation, UTC audit time plus bounded browser-local review month, newest-first read-only prior-month navigation with disclosed legacy fallback, evidence-preserving monthly pattern summaries, and a pure category-scoped next-analysis derivation. Derived queue and outcome layers cannot mutate calculation, card, or symbolic outputs and do not read storage themselves.
- `src/core/privacy`: consent schema, log masking, IANA time-zone preference validation, fail-closed device inspection, aggregate export, and complete local deletion.
- `src/core/analytics`: strict allowlisted product/AI cost events, consent gating, idempotent sink contract, and no free-text payloads.
- `src/core/billing`: versioned Free/Plus/Pro capability policies, quota evaluation, provider-neutral checkout/cancel contracts, and idempotent/stale-safe subscription state.
- `src/core/operations`: typed feature-flag evaluation with deterministic anonymous rollout plus retry-safe named rate-limit policies. Production adapters must use atomic shared storage.
- `src/core/account`: owner-scoped JSON export, all-data/third-party deletion scopes, cross-owner fail-closed validation, and request-id conflict protection. Auth identity removal remains an external adapter step.
- `src/i18n`: locale routing, native Korean/English product copy, and non-predictive localized discovery metadata.
- `src/i18n/legal-copy.ts` and localized `/privacy` and `/terms` routes: pre-release disclosures that keep unresolved controller, contact, jurisdiction, age, retention, and vendor fields visible until qualified review.
- `src/components`: onboarding, tarot, relationship, compatibility, celebrity, lifestyle/shop preview, Reality Check, and share interactions only; no authoritative calculation, card-selection, ranking, curation, or share-safety logic.
- `public/og.png`, `src/app/social-image.ts`, and the Open Graph/X image routes: one public 1200×630 brand asset, explicit accessible metadata, immutable first-party responses, and no user-derived or remote content.
- `scripts/generate-sbom.mjs`, `scripts/run-launch-capture.mjs`, and `scripts/capture-launch-assets.mjs`: deterministic release-evidence generation for a validated CycloneDX SBOM and fifteen synthetic-only, first-party mobile screenshots. The capture runner refuses an occupied port, supports a validated explicit alternative, starts only this repository's production server with AI disabled, and terminates only that exact child process.
- `scripts/serve-production.mjs` and `scripts/run-e2e.mjs`: an exact-process, fail-closed production-server lifecycle for cross-platform browser regression. The runner refuses an occupied port instead of attaching to an unknown project and supports a validated explicit alternative through `E2E_PORT`.

## Planned data model

- `users`, `profiles`, `identities`, `consents`
- `numerology_snapshots` with rule version and evidence JSON
- `tarot_draws`, `tarot_cards`, `readings`
- `questions`, `decisions`, `action_plans`, `outcome_reviews`
- `pattern_observations`, `monthly_reports`
- `relationships` with subject-owned visibility and third-party deletion
- `ai_runs` with provider/model/prompt-policy versions, cost metadata, masked logs
- `catalog_categories`, `catalog_products`, `supplier_reviews`, `recommendation_snapshots`
- `commerce_disclosures`, `carts`, `orders`, `refunds` only after the shop launch gate
- `audit_events`, `idempotency_keys`, `feature_flags`

Every user-owned row carries `owner_user_id`, timestamps, deletion state, and environment. Third-party identity data is scoped to the collector and is never made searchable.

## Trust boundaries

1. Browser input is untrusted and schema-validated.
2. The numerology core accepts explicit ISO dates and an explicit personal year; it never reads server time.
3. AI receives canonical facts as immutable data and user text as delimited untrusted context.
4. AI output is parsed, checked for canonical fact references, screened for safety language, then rendered.
5. Secrets remain server-only. Browser environment variables are public by definition.
6. Logs receive identifiers, categories, latency, and masked error details—not raw journal or birth data.
7. Share payloads cross a separate allowlist boundary and are rendered on-device; raw inputs and third-party identifiers are never accepted by the renderer. The native share envelope contains one PNG and a generic title only—no product URL, result text, analytics event, storage write, or automatic recipient.
8. Safety resources are selected by explicit region labels, never inferred from locale. Legal pages describe the current local boundary and do not imply that unavailable production providers are active.
9. Lifestyle curation receives a canonical profile, not raw form data. The closed shop accepts only public category IDs; personalized facts are not encoded in shop URLs or sent to suppliers.
10. Commercial ranking is a separate future boundary. Sponsorship, margin, inventory, or affiliate data cannot rewrite the deterministic symbolic ordering.
11. Commerce readiness is a pure assessment. It cannot open the store, connect payments, or deploy; an emergency kill switch and explicit owner authorization are independent controls.
12. Outcome-informed analysis has two gates: the user explicitly requests a read of already opted-in device history, then a pure category-scoped derivation produces an `outcome_review` layer. The relationship engine remains unchanged and derived user text is never treated as an instruction.
13. Relationship-to-Reality-Check handoff is a separate, purpose-limited session boundary. A context-card click creates a strict 30-minute payload in the current tab; the destination validates, consumes, and clears it once. URL state carries no handoff or personal data, and prefill never equals record creation.
14. Onboarding context is separate from numerology evidence. Stable focus/depth IDs may change copy, disclosure, and the next suggested action, but raw concern text remains labelled user input and cannot enter calculations, sharing, persistence, logging, analytics, or provider calls in the guest website.
15. Public link-preview metadata is a static first-party boundary. It contains only native product copy and an abstract brand image; the production origin must be an explicitly configured path-free HTTPS URL and no user field can enter the tags or asset.

## Reliability

- Writes use client request IDs plus server idempotency keys.
- AI, network, and payment adapters expose typed failures and safe retries.
- Product analytics defaults to no-op unless separate consent and an approved sink are both present. Billing failures preserve Free access and never rewrite entitlement state optimistically.
- Generated content stores policy/model/rule versions for audit and regression.
- Guest Reality Check records are session-only by default; an explicit device-storage choice may use a versioned local adapter until authenticated persistence is connected.
- Review-queue status, counts, filtering, and stable ordering derive only from records already held in component memory. The queue owns no persistence, reminder, network, analytics, notification, or URL state and cannot trigger a device-history read.
- Export/deletion jobs are resumable and independently auditable.
- Release evidence is reproducible from the frozen lockfile: CI archives the validated production SBOM, while screenshot capture rejects external origins and unexpected pixel dimensions.

## Delivery order

1. Finish and validate the responsive Next.js website and installable PWA as the canonical product.
2. Connect approved server identity, persistence, AI, telemetry, and commerce adapters to the same contracts.
3. Prove web activation, Reality Check return rate, accessibility, safety, deletion, and unit economics in production.
4. Only then package native mobile clients through a shared TypeScript/domain layer or a thin web-backed shell. Native work must not fork calculation rules, safety policy, or data-rights behavior.

The initial deployment remains PWA-first Next.js plus managed PostgreSQL/Auth. Regions, retention, analytics, AI provider, monitoring, catalog, fulfillment, and payment services are chosen only after privacy/DPA, legal, safety, supplier, and cost review.
