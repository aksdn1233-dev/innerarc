# Decision Log

## D-001 — New Next.js foundation

- Date: 2026-07-18
- Decision: Use Next.js 16, React 19, strict TypeScript, mobile-first responsive App Router.
- Alternatives: Vite SPA; Expo-first; separate API service.
- Reason: One deployable full-stack boundary, mature server/client separation, future PWA and API routes, lower MVP overhead.
- Impact: React Native remains a later shared-domain expansion, not shared UI.
- Revisit when: Native store capabilities become critical or server scale requires service separation.
- Status: Decided.

## D-002 — Guest-first, browser-memory preview

- Date: 2026-07-18
- Decision: First analysis works without account; current Phase 1 stores no guest input.
- Alternatives: Mandatory signup; localStorage persistence.
- Reason: Proves value before friction and minimizes sensitive-data retention.
- Impact: Refresh clears the preview; saving waits for authenticated persistence.
- Revisit when: Account/database adapter is configured.
- Status: Decided.

## D-003 — Pythagorean rule version 1

- Date: 2026-07-18
- Decision: Sum all ISO date digits; preserve 11/22/33; A–Z mapping; A/E/I/O/U vowels; Y consonant; no automatic non-Latin romanization.
- Alternatives: Component reduction; Y context rules; automatic transliteration; Chaldean.
- Reason: Auditable, reproducible, culturally safer than invented transliteration, and matches the required example.
- Impact: Korean/Japanese names require optional user-supplied romanization for name numbers.
- Revisit when: Expert editorial review and locale-specific transliteration research justify a new version.
- Status: Decided.

## D-004 — AI cannot author calculated facts

- Date: 2026-07-18
- Decision: AI output references canonical fact IDs; unknown calculation references fail validation.
- Alternatives: Prompt-only instructions; free-form response.
- Reason: Prevents silent calculation drift and makes regressions auditable.
- Impact: Provider adapters must emit structured JSON.
- Revisit when: Never; only validation implementation may evolve.
- Status: Decided.

## D-005 — Working name InnerArc

- Date: 2026-07-18
- Decision: Use InnerArc as a development codename.
- Alternatives: No visible name; numerology-led names.
- Reason: Expresses personal development without cheap fortune-telling or generic AI imagery.
- Impact: UI and documentation need rebranding if unavailable.
- Revisit when: Trademark/domain/app-store search is authorized.
- Status: Provisional.

## D-006 — Consent separation

- Date: 2026-07-18
- Decision: Required privacy acknowledgement is separate from AI personalization, model training, marketing, and raw journal retention.
- Alternatives: Bundled blanket consent.
- Reason: Data minimization, clearer user control, and jurisdiction-ready design.
- Impact: Features must work with optional consents off where technically possible.
- Revisit when: Legal review requires more granular controls.
- Status: Decided.

## D-007 — TypeScript compatibility pin

- Date: 2026-07-19
- Decision: Pin TypeScript 6.0.3 instead of 7.0.2.
- Alternatives: Keep TypeScript 7 and override peer ranges; downgrade Next.js; remove Next.js ESLint TypeScript rules.
- Reason: Next.js 16.2.10 resolves typescript-eslint 8.64.0, whose supported TypeScript range ends below 6.1. A supported compiler/linter combination is required for deterministic CI.
- Impact: TypeScript 7 features are unavailable until the Next.js lint toolchain officially supports them.
- Revisit when: The installed Next.js/typescript-eslint release declares TypeScript 7 support and the full clean-install verification passes.
- Status: Decided.

## D-008 — pnpm package manager

- Date: 2026-07-19
- Decision: Standardize local and CI installs on pnpm 11.9.0 with a committed pnpm lockfile.
- Alternatives: Continue npm 11; maintain both npm and pnpm locks.
- Reason: Four npm install/clean-install variants repeatedly stalled for 10–15 minutes while materializing dependencies and left partial packages. pnpm completed the same dependency graph by using its content-addressed store.
- Impact: Contributors use `pnpm install --frozen-lockfile`; CI caches pnpm. A single lockfile prevents dependency drift.
- Revisit when: A supported package-manager migration is proposed with clean-install evidence on Windows and Linux.
- Status: Decided.

## D-009 — Auditable tarot replay seed

- Date: 2026-07-19
- Decision: Shuffle the canonical 78-card deck with a versioned seeded PRNG and Fisher–Yates; generate the ordinary seed from the platform cryptographic random source and retain it with the reading audit.
- Alternatives: AI selection; unrecorded `Math.random`; server-only opaque draw ID; seed commitment without replay material.
- Reason: AI selection would be deceptive, `Math.random` is not an auditable random source, and an explicit seed gives exact regression and dispute replay.
- Impact: Anyone with a stored seed can reproduce card order; the seed is audit data, not a secret. Persistence must return the original draw for a repeated idempotency key.
- Revisit when: A cryptographic commitment/reveal protocol is required for public or adversarial draws.
- Status: Decided.

## D-010 — Relationship likelihood is exposure guidance, not prediction

- Date: 2026-07-22
- Decision: Represent “where I am more likely to meet someone” as ranked meeting-context hypotheses with concrete exposure actions, not numeric odds. Represent “future spouse” as complementary qualities and relationship conditions to examine.
- Alternatives: Probability percentages; a predicted place/date; a generated spouse biography or appearance; omit the requested feature.
- Reason: There is no empirical probability model in the product, while practical context suggestions can still help users create authentic opportunities and reflect on preferences.
- Impact: UI must show uncertainty, reciprocal-consent/behavior checks, and the facts used. Internal relevance weights are not displayed as real-world probabilities.
- Revisit when: A separately validated, consented empirical recommendation model exists and legal/ethical review approves its claims.
- Status: Decided.

## D-011 — Reality Check retention is explicit and relevance is not accuracy

- Date: 2026-07-22
- Decision: Keep guest Reality Check records in session memory by default. Allow versioned browser-device persistence only after an explicit choice, with immediate export and deletion. Summaries use personal relevance groupings rather than prediction-accuracy scores.
- Alternatives: Always persist in localStorage; require account creation; keep session-only with no cross-session prototype; publish an accuracy percentage.
- Reason: Outcome follow-up benefits from persistence, but questions, decisions, and results are sensitive and shared-device storage is not equivalent to secure account storage. Relevance language matches the product's non-scientific positioning.
- Impact: The browser adapter must validate stored data, handle corruption, prevent duplicate retries, and disclose shared-device risk. Production reminders and durable reports still require authenticated server persistence.
- Revisit when: Encrypted authenticated persistence, retention controls, and legal review are available.
- Status: Decided.

## D-012 — Complete offline profile before paid AI connection

- Date: 2026-07-22
- Decision: Provide all eight profile domains and explanatory career role ranking through a deterministic bilingual fallback before connecting a paid model. AI remains an optional contextual expansion behind the canonical schema and fact guard.
- Alternatives: Show only a thin fallback; block deep results until an AI provider is selected; let AI create role scores and calculated facts.
- Reason: Guest users need useful first value during provider failure or declined consent, and deterministic output enables parity, safety, and cost-free regression testing.
- Impact: Domain and career ranking rule versions are stored separately from numerology rules. The UI labels outputs as symbolic hypotheses and includes observable reality checks.
- Revisit when: A provider passes bilingual quality, safety, latency, and cost gates; the deterministic fallback remains mandatory.
- Status: Decided.

## D-013 — Manual tarot provenance is immutable

- Date: 2026-07-22
- Decision: Persist tarot history as canonical card-ID/orientation snapshots with immutable `engine` or `manual` provenance. Engine readings require their replay seed; manual readings must not carry one.
- Alternatives: Store rendered text only; restore manual cards as an app draw; generate a synthetic seed for every history item.
- Reason: Users must be able to verify whether the app drew cards or merely recorded their physical draw. Canonical snapshots also prevent stale or fabricated card content from loading silently.
- Impact: Version-incompatible, duplicate-card, missing-seed, and fake-seed snapshots fail closed. Device storage remains explicit and separate from Reality Check storage.
- Revisit when: Snapshot migration tooling supports a new canonical deck or spread version without weakening provenance.
- Status: Decided.

## D-014 — Compatibility explains relationship operations, not fate

- Date: 2026-07-22
- Decision: Compare two canonical profiles through eight relationship-operating domains and relationship-type overlays. Do not produce a compatibility percentage, destined outcome, loyalty judgment, or stay/leave instruction.
- Alternatives: Single numeric score; free-form AI verdict; omit asymmetric power relationships; persist both profiles by default.
- Reason: Users need actionable language about communication, responsibility, authority, and repair, while a score would imply empirical validity the product does not have.
- Impact: Symmetric observations are invariant when people are swapped. Manager/report and parent/child flows state role order and prevent symbolism from legitimizing unequal consent or misplaced responsibility. Guest input is not stored.
- Revisit when: A separately validated relationship model and legal/ethical review support additional claims; symbolic compatibility remains non-predictive.
- Status: Decided.

## D-015 — Celebrity comparison is source-bound and date-structure-only

- Date: 2026-07-22
- Decision: Compare only Life Path, Birthday, and Attitude structures calculated from publicly sourced birth dates. Store the source URL, access date, and confidence with every record; show uncertainty and never infer private traits or identity percentages.
- Alternatives: Free-form celebrity biographies; AI-selected lookalikes; unsourced scraped dates; “83% same personality” scoring.
- Reason: Public-date structure can be audited, while personality identity and unsourced biographical inference would overstate what the symbolic model supports and increase defamation/privacy risk.
- Impact: The initial dataset is intentionally small and editorially source-bound. Results link directly to authoritative sources and disclose that structural similarity does not imply the same personality or life outcome.
- Revisit when: A licensed dataset and source-refresh workflow pass editorial, legal, and provenance review.
- Status: Decided.

## D-016 — Share cards use an allowlisted local renderer

- Date: 2026-07-22
- Decision: Build each share-card purpose through a typed allowlist and render a self-contained SVG in the browser. Reject exact dates, email addresses, phone-like strings, prohibited certainty claims, and unsafe markup; do not accept names, questions, journals, or raw profile objects.
- Alternatives: Screenshot the result page; upload data to an image service; use one generic object serializer; include birth dates for personalization.
- Reason: Purpose limitation and data minimization are stronger than post-hoc redaction. Local rendering avoids a new third-party disclosure and produces an auditable, portable artifact.
- Impact: The first version supports core profile, romantic pattern, compatibility, and celebrity match cards. It deliberately contains no tracking image, remote font, external asset, or hidden metadata.
- Revisit when: Server-side branded rendering is required and a privacy-reviewed upload, retention, and deletion design exists.
- Status: Decided.

## D-017 - Sensitive offline caching and HTTPS enforcement are explicit

- Date: 2026-07-22
- Decision: Ship a standards-based web-app manifest and installable metadata, but no service worker yet. Enable HSTS and `upgrade-insecure-requests` only when `APP_HTTPS_ONLY=true` in a real HTTPS environment.
- Alternatives: Cache the full application and user flows offline immediately; force HTTPS-upgrade CSP in every environment; omit PWA metadata.
- Reason: Guest questions and outcome records can be sensitive, and an unreviewed offline cache broadens retention. Unconditional request upgrading also breaks local HTTP production-bundle verification in WebKit.
- Impact: The application remains installable in supported browsers but does not promise offline access. Deployment configuration must explicitly enable HTTPS-only behavior after TLS is confirmed.
- Revisit when: Offline storage, purge, update, shared-device, and breach behavior pass privacy and security review.
- Status: Decided.

## D-018 - Paid providers remain behind consented, metered contracts

- Date: 2026-07-22
- Decision: Implement provider-neutral AI, analytics, payment, entitlement, and personalization contracts before selecting vendors. Analytics default to no-op, AI context is owner-scoped and consent-gated, and billing failure preserves Free access.
- Alternatives: Bind the MVP directly to one vendor; send raw text to analytics; optimistically grant paid state before confirmed provider events.
- Reason: Contracts allow safety, privacy, cost, idempotency, and failure behavior to be verified locally without external accounts or irreversible vendor commitments.
- Impact: The local MVP is complete at the adapter boundary; production capabilities remain unavailable until services pass privacy, quality, cost, and staging gates.
- Revisit when: Providers are selected and contract tests are run against staging adapters.
- Status: Decided.

## D-019 - Security-patched dependency graph uses temporary overrides

- Date: 2026-07-24
- Decision: Keep Next.js and `eslint-config-next` at 16.2.11, override `next>sharp` to 0.35.3, and move `next>postcss` from 8.5.10 to patched 8.5.19 after GHSA-6g55-p6wh-862q disclosed arbitrary local-file reading through attacker-controlled CSS source-map comments.
- Alternatives: Accept known high-severity advisories; wait for a later Next.js bundle; replace the framework immediately.
- Reason: PostCSS 8.5.12 is the first patched release; the existing 8.5.19 package is compatible with both Next.js and the test toolchain and collapses the graph to one safe version. The updated graph passes production build and audit with zero known vulnerabilities.
- Impact: `pnpm-workspace.yaml` owns two temporary transitive pins. Each framework upgrade must test whether they can be removed without reintroducing advisories or regressions.
- Revisit when: A newer Next.js graph resolves fixed compatible Sharp and PostCSS versions without overrides.
- Status: Decided.

## D-020 - Guest data rights are available before account connection

- Date: 2026-07-22
- Decision: Expose a bilingual `Me` privacy center before external identity is connected. It stores preferences only after an explicit save, validates IANA time zones, keeps optional consents independent, exports only validated local records, and deletes all InnerArc device keys in one confirmed action.
- Alternatives: Hide data controls until sign-in exists; rely on per-feature deletion only; persist guest preferences automatically.
- Reason: Guest users already control optional tarot and Reality Check storage, so aggregate inspection, portability, and deletion should not depend on creating an account.
- Impact: The navigation's `Me` tab is functional in the provider-neutral MVP. The page clearly distinguishes device-only data from future server/account data and does not imply that external providers are active.
- Revisit when: Authenticated persistence is connected; device and server scopes must remain separately visible and independently actionable.
- Status: Decided.

## D-021 - Crisis resources are explicit regional options, not locale inference

- Date: 2026-07-23
- Decision: Maintain a versioned registry of official crisis resources and show each option with its applicable region and source. Korean or English UI selection never determines the user's physical location.
- Alternatives: Infer Korea from Korean copy and the United States from English; show one global-looking number; omit source and verification metadata.
- Reason: Language is an unreliable location signal and an incorrect crisis contact can delay urgent help. Region labels and official sources preserve user agency and auditability.
- Impact: The current baseline includes Korea 109 and US/territories 988, generic immediate local-emergency guidance, a verification date, and a scheduled source-refresh protocol. The registry must expand only through reviewed official sources.
- Revisit when: Production location settings, additional launch regions, or qualified crisis-safety review require a broader explicitly selected registry.
- Status: Decided.

## D-022 - Pre-release legal pages expose unresolved launch fields

- Date: 2026-07-23
- Decision: Publish bilingual pre-release privacy information and terms inside the local product while clearly labelling them as pending legal review and listing unresolved controller, contact, jurisdiction, age, retention, vendor, and rights-response fields.
- Alternatives: Hide legal pages until every provider is selected; present draft text as final; put all unresolved items only in an internal document.
- Reason: Users need an honest description of the current local data boundary, and reviewers need missing launch decisions to remain visible rather than being filled with guesses.
- Impact: Consent surfaces link directly to the disclosures. No draft is represented as launch-ready, and qualified approval remains a release blocker tracked in the legal review packet.
- Revisit when: The operating entity, launch regions, providers, retention schedule, age policy, and rights channels are approved.
- Status: Decided.

## D-023 - Release evidence is reproducible and synthetic by default

- Date: 2026-07-23
- Decision: Generate a CycloneDX 1.6 production SBOM from the frozen pnpm lockfile and capture store screenshots through a deterministic browser script using synthetic inputs only. Validate the SBOM graph, reject screenshot external origins, and verify PNG dimensions from file headers.
- Alternatives: Manually list dependencies; capture ad hoc personal sessions; trust configured screenshot dimensions without reading the output file; defer evidence until deployment.
- Reason: Reproducible evidence reduces privacy leakage and release drift, while machine checks catch malformed supply-chain artifacts and misleading store assets before human review.
- Impact: CI archives the SBOM; current output contains 97 production components. Fifteen Korean/English 1242x2688 draft screenshots and a manifest are generated locally and remain subject to legal, brand, native-language, and platform approval.
- Revisit when: Store specifications, branding, dependency tooling, or distribution targets change.
- Status: Decided.

## D-024 - OpenAI is a disabled-by-default candidate adapter

- Date: 2026-07-24
- Decision: Implement a server-only candidate adapter against the official Responses API contract using strict Structured Outputs, `store: false`, minimized canonical facts, explicit cost configuration, metering, refusal/incomplete handling, abort propagation, fixed endpoint/no redirects, and fail-closed startup validation. Keep `AI_PROVIDER=disabled` as the default.
- Alternatives: No provider implementation; install a provider SDK immediately; expose a browser key; enable an unpinned model in production.
- Reason: A local adapter proves the privacy, safety, cost, schema, and failure boundary without external credentials. Direct HTTPS avoids adding a new supply-chain dependency after the SDK installation could not complete reliably in this environment.
- Impact: Production requires a date-pinned model alias, server-only secret, reviewed rates, staging quality/cost tests, provider terms/DPA review, and explicit authorization. No client bundle contains the endpoint or secret names.
- Revisit when: An approved provider account is available or an SDK materially improves contract safety and passes dependency review.
- Status: Decided.

## D-025 - Website and PWA precede native apps

- Date: 2026-07-24
- Decision: Treat the responsive Next.js website and installable PWA as the canonical first product. Do not begin a native iOS/Android client until web activation, Reality Check return behavior, accessibility, safety, data deletion, and unit economics meet approved targets.
- Alternatives: Build web and native in parallel; package a native shell immediately; prioritize app-store distribution before web proof.
- Reason: Web-first delivery shortens feedback cycles, avoids duplicating calculation and safety rules, and matches the user’s explicit priority.
- Impact: Architecture and documents distinguish web release readiness from later native packaging. Future clients must reuse the same versioned domain contracts.
- Revisit when: Web cohort evidence and distribution economics justify native-specific capability.
- Status: Decided.

## D-026 - Lifestyle recommendations are claim-free experiments

- Date: 2026-07-24
- Decision: Add deterministic accessory and music directions from canonical numerology facts. Accessory output covers form, palette, material, practical use, and safety; music output covers genre direction, sonic traits, use context, and a reality check. Neither uses purchase/listening history or makes luck, healing, therapy, prediction, or performance claims.
- Alternatives: AI-selected products and songs; gemstone efficacy; streaming-account ingestion; omit the requested feature.
- Reason: Style and sound can make an abstract result experiential at low data cost, but only if personal taste and observable fit outrank symbolism.
- Impact: Recommendations have bilingual stable IDs and evidence references. They remain secondary experiments subject to comprehension and usefulness testing.
- Revisit when: User evidence supports deeper personalization or an approved streaming/catalog integration.
- Status: Decided.

## D-027 - The shop is a closed category preview

- Date: 2026-07-24
- Decision: Create a bilingual shop route and category architecture with a clear `coming later` state, but no products, prices, stock, cart, checkout, affiliate links, or purchase claims.
- Alternatives: Open a placeholder checkout; hide commerce planning entirely; list unreviewed third-party products.
- Reason: The user requested future in-product purchasing, while suppliers, materials, consumer law, inventory, fulfillment, returns, payments, and demand are not approved.
- Impact: Category links carry no personal facts. Organic symbolic ranking is kept separate from any future sponsorship or commercial placement.
- Revisit when: Supplier, product-safety, legal, tax/refund, fulfillment, payment, accessibility, privacy, and demand gates pass.
- Status: Decided.

## D-028 - Commerce readiness cannot open the shop

- Date: 2026-07-26
- Decision: Add a pure future-catalog contract and twelve evidence-backed commerce gates. Product records require supplier, material/allergy, dimensions, care, origin, accessible media, price, inventory, return, and disclosure fields; reject symbolic outcome claims and tracking-bearing public links. Keep sponsored candidates outside the organic recommendation collection. A successful assessment can return only `ready_for_authorized_deployment`, never render purchase controls or deploy.
- Alternatives: Add products directly to the closed preview; let payment readiness imply launch; mix sponsored products into relevance ranking; defer all safeguards until a supplier is selected.
- Reason: The requested future store needs useful preparation now without creating a misleading open shop, a commercial bias in personal results, or an accidental external side effect.
- Impact: Thirteen deterministic tests now cover disclosure, claim, sponsorship, ordering, duplicate, evidence, authorization, approved-product, and kill-switch boundaries. Products, checkout, fulfillment, and live commerce remain absent.
- Revisit when: Qualified product, supplier, legal, privacy, tax, fulfillment, payment, accessibility, support, and demand evidence exists and the owner explicitly requests opening.
- Status: Decided.

## D-029 - Outcome reviews form a separate next-analysis layer

- Date: 2026-07-26
- Decision: Allow a relationship result to read already saved `relationship` Reality Checks only after an explicit user action. Derive a versioned context with a two-review minimum and a two-thirds threshold for repeatedly relevant or repeatedly not relevant signals. Keep mixed results uncertain, bound up to three recent unique learning notes, label them untrusted user data, and exclude raw questions, states, interpretations, choices, actions, outcomes, birth dates, and names.
- Alternatives: Automatically read all browser history on page load; alter numerology or meeting-context rankings; count only positive feedback; send saved text directly to an AI provider; wait for authenticated storage before connecting any feedback.
- Reason: The product promise requires later analysis to reflect lived outcomes, but doing so must preserve misses, user control, calculation integrity, and the local privacy boundary.
- Impact: The romantic result now has an auditable `outcome_review` layer with relevant/uncertain/not-relevant counts and explicit guidance. No provider transfer occurs, and zero or one review produces no personalization.
- Revisit when: Authenticated cross-device history and an approved AI provider exist; provider use still requires separate AI-personalization consent and the existing untrusted-context envelope.
- Status: Decided.

## D-030 - Relationship contexts cross into Reality Check as one-time drafts

- Date: 2026-07-26
- Decision: Let the user explicitly continue one displayed relationship-environment hypothesis into an editable Reality Check draft. Use a strict versioned `sessionStorage` item in the current tab, expire it after at most 30 minutes, consume it once, and navigate with a clean locale-only URL. Permit only generated reflection text, locale, public context ID, rule version, and audit timestamps.
- Alternatives: Put the result in URL parameters; copy the complete profile; save a Reality Check automatically; persist the draft in local storage; require manual retyping.
- Reason: A direct action closes the gap between symbolic reflection and observable behavior while explicit selection, field minimization, expiry, and edit-before-save preserve user agency and privacy.
- Impact: Birth date, name, number values, partner identity, third-party data, contact data, and exact location are structurally absent. Invalid, expired, wrong-locale, future-inconsistent, overlong, or extra-field payloads fail closed; unavailable session storage leaves the user on the relationship page without a fallback.
- Revisit when: Authenticated cross-device drafts are proposed; they require a new consent, retention, deletion, and owner-authorization review rather than extending this guest transport.
- Status: Decided.

## D-031 - Onboarding context remains separate from canonical calculations

- Date: 2026-07-26
- Decision: Use stable focus and depth IDs plus optional bounded concern text to create a versioned local context layer after the deterministic first result. Treat concern text as untrusted, page-memory-only input; do not place it in calculation evidence, storage, URLs, share cards, analytics, logs, or provider requests. An AI-personalization checkbox reports consent intent but cannot imply a provider request while the provider is disconnected.
- Alternatives: Ignore the collected onboarding choices; alter numerology output from the concern; persist the concern by default; send it to the candidate AI adapter; use localized display strings as data identifiers.
- Reason: The first result should respond to what the user asked without weakening calculation integrity or collecting sensitive concern text beyond what is necessary for the current page.
- Impact: Five focus IDs, three depth IDs, bounded Unicode normalization, contextual guidance, and deterministic next actions have Korean/English structural parity. Deep mode opens the existing eight-domain profile. The context layer has no network, persistence, analytics, sharing, or calculation side effect.
- Revisit when: An approved provider and authenticated storage exist; any provider or persistence use still requires explicit purpose, consent, minimization, retention, deletion, and staging evidence.
- Status: Decided.

## D-032 - Monthly outcome reports use the recorded local calendar month

- Date: 2026-07-26
- Decision: Record a `YYYY-MM` browser-local month when a new outcome review is saved, retain the UTC timestamp for audit/order, and group monthly reports by the recorded local month. Let the user select the current or any reviewed month without writing state. Keep old records readable by using their UTC timestamp month as a disclosed compatibility fallback.
- Alternatives: Continue grouping only by UTC; recompute every historical month from the device's current time zone; store a full time-zone/location value; silently migrate old records; show only the current month.
- Reason: A review completed shortly after local midnight can belong to a different UTC month, and users need to revisit prior monthly reports. Capturing only the month needed at the event preserves calendar meaning with less data than storing location or time zone.
- Impact: New reviews gain one bounded derived field, old version-1 records remain valid, the report exposes a legacy-fallback count, and month selection has no persistence, analytics, network, or URL side effect. The original interpretation and audit timestamp remain immutable.
- Revisit when: Authenticated cross-device reports exist and an approved server time-zone policy can be tested against travel, user preference changes, imports, and deletion.
- Status: Decided.

## D-033 - Relationship share UI loads after the initial route

- Date: 2026-07-26
- Decision: Load the relationship share-card panel through React `lazy` and `Suspense` after a relationship result exists, while keeping the allowlisted share payload and local SVG renderer unchanged.
- Alternatives: Raise the 1.05 MB decoded-JavaScript budget; remove sharing; rewrite the renderer; accept the 285-byte regression.
- Reason: The panel is not needed for the initial relationship route, and release budgets must remain fixed. Deferring it restores the budget without changing calculations, privacy filtering, external-request behavior, or the user's share action.
- Impact: All seven performance routes pass the unchanged budget. Relationship share preview remains functional and excludes the entered name and birth date in Chromium and mobile WebKit.
- Revisit when: Share usage evidence justifies a different interaction or a smaller common share runtime.
- Status: Decided.

## D-034 - Tarot presentation uses a restrained reflective reading-room metaphor

- Date: 2026-07-26
- Decision: Give the home and question flow a clearer tarot presence through first-party card-back geometry, portrait-format drawn-card faces, tactile paper/ink contrast, and progressive disclosure. Keep the product positioned as premium self-reflection: no neon mysticism, crystal-ball imagery, fear, certainty, or theatrical prediction language.
- Alternatives: Keep the current generic wellness-card treatment; imitate a traditional fortune shop; add externally sourced Rider-Waite artwork; redesign every product route before receiving more specific direction.
- Reason: The current interface is calm and readable but the card experience is too abstract to feel like a tarot reading. A bounded visual layer can make the ritual legible without changing calculations, safety, privacy, or the user’s decision authority.
- Impact: Decorative artwork is derived only from canonical card metadata and CSS. Card names, positions, orientations, keywords, and audit facts stay accessible text. The initial relationship share feature is deferred from the route bundle to recover the existing 285-byte decoded-JavaScript budget overage.
- Revisit when: Brand testing, licensed original card art, or specific owner art direction is available.
- Status: Decided.

## D-035 - Development dependency advisories block release evidence

- Date: 2026-07-27
- Decision: Resolve all `brace-expansion` paths to patched 5.0.8 for GHSA-mh99-v99m-4gvg, add a narrow import-compatibility patch for the legacy `minimatch` 3 consumer, and run the full `pnpm audit` in CI.
- Alternatives: Ignore the alert because it is development-only; keep the vulnerable legacy branch; force the incompatible package without a consumer patch; upgrade the complete lint stack in an unrelated major-version change.
- Reason: A crafted brace pattern can exhaust Node memory, and launch evidence must include the development/CI supply chain. The first global override cleared the advisory but broke ESLint because `minimatch` 3 expected a callable CommonJS export, so compatibility must be proven rather than assumed.
- Impact: The lockfile contains one `brace-expansion` version, 5.0.8. Full audit, ESLint, TypeScript, and 251 tests pass; the patch changes only how `minimatch` 3 obtains the same expansion function.
- Revisit when: The lint dependency graph no longer contains `minimatch` 3 or natively supports `brace-expansion` 5, at which point remove the compatibility patch and re-run the full gate.
- Status: Decided.

## D-036 - CI actions use current Node 24 runtimes

- Date: 2026-07-27
- Decision: Upgrade the official GitHub workflow actions to `actions/checkout@v7`, `actions/setup-node@v7`, `actions/upload-artifact@v7`, and `pnpm/action-setup@v6` while retaining the pinned project toolchain (`node 24`, `pnpm 11.9.0`).
- Alternatives: Ignore the Node 20 deprecation annotations; pin obsolete action majors; change the application runtime together with the workflow actions.
- Reason: The previous action majors completed the release gate but emitted deprecation annotations because their bundled runtime was Node 20. Updating the actions removes a future CI failure risk without changing application code or package resolution.
- Impact: Repository checkout, pnpm installation, dependency caching, SBOM upload, and the complete release gate must be re-proven on the current GitHub-hosted runner.
- Revisit when: GitHub announces a runner-runtime deprecation, the selected action majors stop receiving fixes, or supply-chain policy moves from major tags to reviewed commit-SHA pins.
- Status: Decided.

## D-037 - Launch capture owns and isolates its production server

- Date: 2026-07-27
- Decision: Run launch-asset capture through a repository script that refuses an already occupied port 3000, starts the local production server with AI disabled, and stops only the exact child process it created.
- Alternatives: Reuse any server found on port 3000; ask the operator to start and stop a server manually; terminate every local Node process after capture.
- Reason: Repeatable capture should not depend on an unknown server build and must not interfere with another project when several Codex workspaces are active on the same Windows PC.
- Impact: `pnpm capture:launch` now has the same exact-process isolation boundary as the E2E runner. A port collision fails closed instead of reusing or terminating another process.
- Revisit when: Capture moves into a containerized CI job or the production-server lifecycle is consolidated into a shared tested runner.
- Status: Decided.

## D-038 - CI does not bootstrap through an advisory-affected pnpm release

- Date: 2026-07-27
- Decision: Remove `pnpm/action-setup` from CI and use the Corepack distributed with the pinned Node 24 runtime to activate the exact `pnpm@11.9.0` declared in `package.json`.
- Alternatives: Accept the action's transient audit warning; use its standalone executable mode; install pnpm globally with npm; wait for another action release.
- Reason: `pnpm/action-setup@v6.0.9` first installs its committed pnpm 11.7.0 bootstrap package, which reports one high-severity vulnerability, before self-updating to the project's patched 11.9.0. Release evidence should not normalize or hide an advisory-affected bootstrap stage.
- Impact: CI loses the convenience action and its pnpm-store cache integration, but removes the affected transient package. The frozen lockfile, full audit, tool version, build, SBOM, and browser gates remain unchanged and must pass again.
- Revisit when: The action bootstrap is patched beyond the relevant advisory and a measured CI-duration benefit justifies reintroducing it.
- Status: Decided.

## D-039 - Public link previews use one static first-party brand asset

- Date: 2026-07-27
- Decision: Add one 1200×630 InnerArc social card, native Korean/English titles and descriptions, and explicit Open Graph/X metadata. Serve the same raster through first-party static image routes with accessible alt, type, and dimension fields.
- Alternatives: Share raw result cards; use a remote image CDN; omit preview imagery; guess an unapproved production domain; generate a personalized preview per user.
- Reason: Shared links need recognizable premium product identity without exposing a birth date, name, question, relationship context, or generated result. One static asset keeps previews consistent, cacheable, and independent of external tracking or storage.
- Impact: The image contains only the public brand, number 11, and abstract card backs. `NEXT_PUBLIC_APP_URL` accepts loopback locally and requires a path-free HTTPS origin for production. Two localized browser cases verify the complete preview response in both Chromium and mobile.
- Revisit when: The final brand name/domain is cleared or a qualified native-language/brand review requests localized image variants.
- Status: Decided.

## D-040 - Release tooling supports explicit alternative ports without process reuse

- Date: 2026-07-27
- Decision: Keep port 3000 as the default, fail closed when it is occupied, and allow an explicit validated `E2E_PORT` or `CAPTURE_PORT` for a repository-owned server. Forward the exact E2E origin into Playwright.
- Alternatives: Stop the occupying process; attach to whatever responds on 3000; scan automatically for a free port; block all validation until the other project stops.
- Reason: Another active workspace can legitimately own the default port. Automatic reuse, termination, or silent port scanning would weaken isolation, while an explicit alternative preserves operator intent and deterministic metadata origin testing.
- Impact: Invalid or occupied alternatives still fail. The runner continues to terminate only its own direct server child; every E2E origin assertion reads the exact forwarded base URL instead of hardcoding port 3000, and no file, process, or configuration in the other workspace changes.
- Revisit when: Test execution moves into isolated containers with allocated ephemeral ports and equivalent ownership evidence.
- Status: Decided.

## D-041 - Share cards use an explicit local PNG and native file-share boundary

- Date: 2026-07-27
- Decision: Keep the existing allowlisted share payload and SVG renderer authoritative, derive a 1080×1350 PNG only in browser memory after a click, and pass exactly one generic-titled PNG to the native share surface when file sharing is supported. Retain explicit PNG/SVG downloads; use PNG download as the unsupported or technical-failure fallback, but never after user cancellation.
- Alternatives: Keep SVG download only; upload cards to a share service; encode the result in a public URL; share free text; silently copy to the clipboard; add a third-party rasterization dependency.
- Reason: Mobile users need a direct path from a safe result card to their chosen app, while public URLs, uploads, clipboard mutation, remote rasterizers, and text envelopes would expand privacy and tracking risk. The existing renderer already enforces the product's strongest allowlist boundary.
- Impact: The browser creates no new record or remote request. The operating-system share surface opens only from a user gesture, receives one PNG with no `text` or `url`, and has a clearly disclosed external-app boundary. Unsupported browsers still receive a portable PNG without losing the editable SVG option.
- Revisit when: Real share completion and trust evidence exists, a native app has an approved share-sheet implementation, or brand review changes the card format.
- Status: Decided.

## D-042 - Reality Check return work starts with a local action-first queue

- Date: 2026-07-27
- Decision: Derive one in-memory review queue from records already available to the Reality Check page. Put ready outcomes first by earliest review date, retain planned and reviewed filters, and expose a single next-ready action. Do not add background reminders or read device storage until the user invokes the existing load control.
- Alternatives: Automatically inspect browser storage on page open; request notification permission; add email reminders before identity and delivery infrastructure; keep creation-order cards with no return priority.
- Reason: Outcome return is the product’s primary differentiator, but a useful first improvement can be delivered without a new sensitive field, permission prompt, server, analytics event, or hidden device-history access.
- Impact: Queue state and filters are memory-only, source records remain unchanged, and the existing session/device-opt-in retention boundary remains authoritative. Authenticated cross-device reminders are still blocked on approved identity, retention, delivery, and consent infrastructure.
- Revisit when: Production return-rate evidence supports reminders and the account/privacy/notification gates have passed.
- Status: Decided.

## D-043 - Valid PayApp configuration opens checkout without a second approval gate

- Date: 2026-08-01
- Decision: Remove the environment/database launch-approval toggle and its administrator endpoint. Treat valid provider credentials, reachable persistence, valid HTTPS callbacks, and the code-owned product catalog as payment readiness. Retain the independent incident sales-pause control and always accept provider callbacks for payments already in progress.
- Alternatives: Keep the typed administrator approval; keep an environment flag; force-open checkout with an emergency override; fall back to manual bank transfer.
- Reason: The redundant approval state repeatedly left a correctly configured live merchant unable to take payment and made recovery depend on a hidden setting. The user explicitly requires immediate normal PayApp checkout. Configuration validation, server-owned amounts, callback signature checks, idempotency, rate limits, administrator allowlisting, and refunds remain intact.
- Impact: The retired 19,000 KRW offer remains unavailable; new orders use 9,600 KRW and 39,000 KRW. Checkout does not depend on a deployment toggle, while malformed credentials, stale declared prices, an unavailable database, invalid requests, and provider rejection still fail safely.
- Revisit when: The payment provider, legal entity, or checkout risk model materially changes and a separate auditable release control has a demonstrated operational owner.
- Status: Decided.
