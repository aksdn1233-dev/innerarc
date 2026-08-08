# Feature Audit and Keep/Improve/Hold Decisions

Last reviewed: 2026-07-27
Scope: Current web-first product state. Ratings are readiness judgments, not user-review scores.

## Strict scoring method

Each feature receives a weighted score:

- User value: 30%
- Differentiation: 20%
- Trust and safety: 20%
- Verified implementation readiness: 20%
- Cost and operational fit: 10%

The weighted score is converted to stars out of five. A feature cannot score above 4.0 if its critical path is untested, above 3.0 if it is only a static concept, or above 2.0 if it requires an unapproved external provider to function.

Decision bands:

- 4.0–5.0: **Keep** — core or release-worthy.
- 3.0–3.9: **Improve / experiment** — retain only with named gates.
- 2.0–2.9: **Hold** — do not foreground or monetize yet.
- Below 2.0: **Remove from current roadmap** unless new evidence appears.

## Current audit

| Feature | Stars | Decision | Evidence and strict finding |
| --- | ---: | --- | --- |
| Deterministic numerology + evidence | 4.7/5 | Keep | Complete MVP values, Unicode/name limits, master numbers, bilingual parity, fixed vectors, and no AI-authored facts. Independent editorial review is still required. |
| Auditable tarot + manual cards | 4.6/5 | Keep | Full deck, spread rules, secure/fixed seed, reversals, immutable manual/engine provenance, history, export/delete, safety gate, and a restrained portrait-card reading room now pass the combined desktop/mobile release gate. Independent editorial and moderated comprehension review still cap the score below top-tier readiness. |
| Reality Check Loop | 4.8/5 | Keep and lead | Strongest differentiation; immutable choice/action/outcome review, five relevance values, misses preserved, browser-local monthly grouping, read-only prior-month navigation, disclosed legacy fallback, idempotency, and an explicit-use next-analysis bridge are implemented. Authenticated reminders and cross-device continuity are still external. |
| Context-aware guest onboarding | 4.3/5 | Keep | Focus, depth, and optional concern now shape a clearly separate first-result context without changing calculated facts or causing storage/provider requests. The privacy boundary and bilingual structure are tested; moderated comprehension and completion-rate evidence are still required. |
| Eight-domain profile and career | 4.2/5 | Keep | Full deterministic fallback and canonical evidence are ready. Live AI expansion must not launch until bilingual quality, privacy, latency, safety, and cost gates pass. |
| Romantic discovery / future-partner reflection | 4.6/5 | Keep | Replaces fake location odds and spouse prediction with exposure contexts, qualities, consent, and reality checks. Each context can now become an editable one-time experiment without transferring profile data; the separately labelled outcome-review layer preserves misses without changing symbolic facts. User comprehension evidence is still required. |
| Two-person compatibility | 4.1/5 | Keep | Seven relationship types and eight operating domains are safer and more useful than a fate score. Authenticated invitation/privacy workflow remains. |
| Guest privacy center and data rights | 4.4/5 | Keep | Explicit local consent, inspection, export, and deletion are implemented. Server/account proof awaits provider selection. |
| Celebrity comparison | 2.9/5 | Hold / improve | Source-bound and safe, but the dataset is intentionally small and the retention value is unproven. Do not foreground until licensed data and user evidence exist. |
| Share cards | 3.8/5 | Improve / experiment | Allowlisted local PNG/SVG rendering, generic one-file native sharing, unsupported/error fallback, cancellation, accessibility, and no-request/no-storage behavior are browser-tested. Real share completion, trust, and brand-response evidence are still absent, so keep this secondary and below release-core status. |
| Accessory direction | 3.0/5 | Improve / experiment | Useful tangible extension if it stays claim-free. Must pass comprehension, material-safety, supplier, and non-manipulative-commerce gates before monetization. |
| Music direction | 3.2/5 | Improve / experiment | Low-cost experiential extension with no listening data required. Must prove it avoids stereotypes and adds repeat value. No streaming integration yet. |
| Closed shop preview and launch gate | 2.4/5 | Hold closed | Category architecture, product-disclosure contracts, claim screening, sponsorship separation, and a twelve-gate readiness assessment are implemented. Products, suppliers, consumer-law approval, fulfillment, payments, and demand proof are still absent, so it must not appear open. |
| Live paid AI | 1.8/5 | Hold disabled | A server-only candidate adapter and failure controls exist, but no approved account, pinned production model, DPA/privacy review, staging quality, or budget evidence exists. |
| Native iOS/Android app | 1.0/5 | Remove from current build | User explicitly prioritized web first. Native duplication before web activation and retention evidence would add cost and rule drift without proving value. Revisit after web gates. |
| Live readers/community/diagnostic features | 0.5/5 | Remove | High moderation, privacy, safety, and operational burden; explicitly outside MVP and not needed for the differentiated loop. |

## Release focus

Lead with numerology evidence, auditable tarot, relationship reflection, and Reality Check. Keep career/profile and privacy controls as trust infrastructure. Treat lifestyle cards as measurable secondary experiments. Keep celebrity and sharing visually subordinate. Keep the shop visibly closed, live AI disabled, and native apps unstarted until their evidence gates are met.

## Re-rating triggers

- Moderated comprehension and trust testing.
- At least one cohort of Reality Check outcome returns.
- Bilingual editorial and accessibility review.
- Production provider staging evidence.
- Accessory/music save, revisit, dismiss, and trust signals.
- Supplier/product/legal readiness for commerce.
- Web activation, D7/D30 retention, and unit economics sufficient to justify native development.
