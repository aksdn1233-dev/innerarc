# Product Requirements

Version: MVP 1.0 draft  
Status: Accepted baseline  
Date: 2026-07-18

## Product-wide acceptance criteria

1. Symbolic outputs never claim scientific diagnosis or certain prediction.
2. Numerology facts are generated only by a versioned deterministic engine.
3. Tarot draws are generated only by an auditable random/seeded engine.
4. Calculated fact, traditional interpretation, personalized inference, and uncertainty are distinguishable.
5. Korean and English produce identical calculated facts and non-contradictory core meanings.
6. Guest users see a useful first result before any paywall.
7. Sensitive data is optional where possible, purpose-labeled, masked in logs, exportable, and deletable.
8. Retried writes use idempotency keys to prevent duplicate records.
9. Primary guest flows remain keyboard operable, expose programmatic labels and status/error announcements, preserve a visible focus indicator, and honor reduced-motion preferences.
10. Production responses apply a restrictive same-origin security baseline. Install metadata must not imply that sensitive reflection data is available offline when no privacy-reviewed offline store exists.
11. Shared website links expose native Korean/English titles and descriptions plus one first-party brand image. Preview metadata contains no user inputs, tracking URL, prediction claim, or remote asset dependency.

## MVP requirements and acceptance

### Account and privacy

- Email account, future social-login adapters, and guest mode.
- Language, time zone, consent, export, and deletion controls.
- Every required privacy acknowledgement has an adjacent, keyboard-accessible link to the localized privacy information. Localized privacy and terms pages state their pre-release legal-review status, current device/server boundary, data categories, purpose, retention, third-party-data responsibility, safety limitations, and user controls without implying that disconnected providers are active.
- AI personalization, model training, raw journal retention, product analytics, and marketing are separate choices.
- Acceptance: declining optional consent does not block deterministic results.
- Owner export produces a versioned machine-readable bundle from owner-scoped records. Whole-data and third-party-only deletion use explicit scopes and opaque idempotency keys.
- A storage adapter returning another owner’s record fails closed. Reusing a request ID with different owner/scope is an idempotency conflict, not a replay; deletion returns collection counts without echoing deleted content.
- Account-identity removal is orchestrated only after owned-data deletion reaches a terminal state. Legally required audit/consent tombstones need a separately documented retention basis and are never silently mixed into the user-content export.
- Acceptance: empty exports, sensitive owned export, cross-owner leakage, third-party-only deletion, complete deletion, repeated requests, conflicting requests, malformed JSON payloads, and deletion counts are tested.
- Acceptance: Korean and English privacy/terms routes render without optional consent, are included in accessibility regression, cross-link each other, and identify unresolved controller/contact/jurisdiction fields as launch blockers rather than inventing them.

### Link sharing and discovery metadata

- The root product and each localized route expose a concise product title and description that position numerology and tarot as symbolic self-reflection connected to lived outcomes.
- Korean and English copy is native rather than literal translation and must not imply scientific validation, prediction accuracy, fate, diagnosis, or guaranteed results.
- One 1200×630 first-party social image uses the established ivory, sage, clay, number, and card-back visual language. It contains only public product branding and no generated user result, birth date, name, question, relationship data, or hidden tracking metadata.
- Next.js file-based Open Graph and X image routes resolve against a validated `NEXT_PUBLIC_APP_URL`. Local builds use an explicit loopback fallback; production accepts only a path-free HTTPS origin, so no public domain is guessed before hosting is approved.
- Acceptance: both localized home routes emit the expected native title/description, `summary_large_image`, image alt text, PNG content type, and 1200×630 dimensions; the resolved image is same-origin, under platform size limits, and contains no external request.
- Local release tooling must never reuse or terminate another project's server. It fails closed on an occupied default port and accepts only an explicit valid alternate port for repository-owned E2E or launch-capture processes.

### Three-minute onboarding

- Input: ISO-normalized date of birth, optional name/romanization, interest, optional concern, depth.
- Output: core numbers, tarot archetype, three strengths, two risks, role families, relationship style, one-line summary, and an optional style-and-sound reflection.
- Interest and depth use stable, locale-independent IDs and produce a versioned rule-based context layer beside the calculated result. They never change a number, archetype, symbolic rule, or evidence reference.
- An optional concern is normalized, bounded to 1,000 Unicode code points, labelled as the user’s own untrusted text, and kept in current-page memory only. It is not placed in calculation evidence, share payloads, URLs, device storage, analytics, logs, or a provider request.
- Depth changes disclosure behavior rather than claim certainty: `light` emphasizes one prompt and action, `balanced` keeps the layered result collapsed, and `deep` opens the eight-domain profile for review.
- AI-personalization consent is represented honestly. With no approved provider connected, checking it does not trigger a request; the result states that it remained local and rule-based. Declining it also leaves deterministic results fully available.
- Acceptance: sample `1994-11-04` reaches Life Path 11 without payment.
- Acceptance: all five focus IDs and three depth IDs are deterministic; Korean/English preserve IDs, next-step type, and structural meaning; invalid/overlong/control-character concerns fail closed; raw concern remains absent from share and storage; optional AI consent causes zero network/provider activity.

### Lifestyle curation: accessories and music direction

- The deterministic recommendation layer uses only canonical numerology facts already calculated for the result. It never changes those facts and does not require shopping, listening-history, health, location, or biometric data.
- Accessory output contains three stable categories: wearable accent, everyday carry, and desk/home accent. Each suggestion includes a form, palette, material direction, symbolic rationale, practical try-on cue, safety/care note, canonical evidence references, and a `coming_later` shop state.
- Accessory language describes visual and tactile fit only. It must not claim luck, protection, healing, attraction, wealth, energetic treatment, or a guaranteed outcome. Material allergies, nickel content, fastening/fit, durability, budget, supplier provenance, returns, and accessibility outrank symbolism.
- Music output contains three use-oriented lanes: focus/momentum, reset/regulation, and exploration/social energy. Each lane includes a genre direction, sonic traits, a use context, a track-selection cue, a reality-check question, and canonical evidence references.
- Music suggestions are not therapy, diagnosis, mood control, or a promise of performance. Hearing safety, context, personal/cultural taste, and an easy opt-out are explicit.
- Korean and English must return identical category/lane IDs, rank order, and evidence references for the same canonical profile; native copy may differ without contradicting the same symbolic direction.
- Acceptance: missing or unsupported names still return a complete date-based result. Output contains no exact product, price, affiliate link, streaming-history request, health claim, prediction percentage, or personal data.

### Shop preview and future commerce

- The web product exposes a bilingual `/shop` preview with the three approved accessory categories and an unambiguous `coming later` state.
- Before launch approval there is no product catalog, stock claim, price, cart, checkout, payment collection, scarcity message, affiliate tracking, or recommendation presented as necessary for luck or safety.
- The paid-reading homepage keeps a clearly labelled first-party path to a deterministic free core numerology result. A guest can complete that result before creating an order, and the free route does not require a checkout draft, provider availability, or payment consent.
- Result cards may deep-link only to a category anchor. Birth dates, names, concerns, result numbers, or tracking identifiers are never placed in the URL.
- Future products require supplier identity/provenance, material and allergy disclosure, dimensions/fit, care, accessible media, regional price/tax, shipping, return/refund, inventory, moderation, and consumer-law review before the category can open.
- Personalized ranking and commercial placement remain separate. Payment or sponsorship must never silently change the symbolic recommendation order.
- Product-candidate contracts reject luck, protection, healing, attraction, guaranteed-outcome, insecure-link, hidden-sponsorship, and incomplete-disclosure records before curation. Sponsored candidates are returned in a separate collection and can never enter the organic recommendation list.
- Shop readiness is evaluated against twelve evidence-backed gates: suppliers, product disclosures, consumer law, returns/refunds, tax/pricing, inventory/fulfillment, payment security, privacy/DPA, support/incidents, accessibility, claim review, and demand evidence. A separate explicit owner authorization and a nonzero approved-product count are mandatory.
- Passing the readiness contract yields only `ready_for_authorized_deployment`; it never opens the shop or renders purchase controls. The emergency kill switch always wins.
- Acceptance: every purchase control is absent or disabled while the launch state is closed, category links carry no personal data, and direct shop access works without completing onboarding.

### Numerology

- Life Path, Birthday, Attitude, Expression/Destiny, Soul Urge, Personality, Personal Year.
- Pythagorean 1.0 rules and master 11/22/33 preservation.
- Acceptance: rules, expressions, reduction steps, and version are returned with each fact.
- Non-Latin names are never silently romanized.

### AI profile

- Schema fields: summary, facts, traditional interpretation, personalized inference, strengths, risks, actions, uncertainty, safety note, evidence references.
- Domain sections: thinking, action, relationships, leadership, career, money habits, stress response, and growth strategy. Every section separates calculated facts, symbolic tradition, contextual inference, an observable reality check, and uncertainty.
- The offline rule-based fallback covers every domain deterministically. Missing name numbers remove name-based evidence rather than fabricating it.
- Career output ranks role families symbolically without percentage claims and includes fit reasons, adverse conditions, a complementary skill, preferred environment, and avoid conditions.
- Acceptance: an AI calculation reference not present in canonical engine output is rejected.
- Provider failure returns a clearly limited rule-based response.
- Acceptance: Korean/English use the same domain IDs, career role IDs, rank order, and evidence IDs for an identical canonical profile.

### Tarot

- 78-card dataset, upright/reversed, 1/3-card and question spreads, user-entered physical draws, saved readings, seed/audit metadata.
- Manual entry requires the user to choose every card and orientation, validates deck membership/count/duplicates, and records `source: manual`; it never fabricates a seed or implies an app draw.
- Saved-reading snapshots keep the question, category, card IDs/orientations, source, event ID, deck/spread/algorithm versions, and creation time. Restoring validates the snapshot against canonical deck data.
- Guest saved readings are session-only by default. Explicit device storage, JSON export, and deletion follow the same shared-device warning as Reality Check.
- Acceptance: AI cannot select or replace cards.
- Acceptance: engine and manual readings remain visibly distinguishable after save/load; retries do not create duplicates; corrupt or version-incompatible stored readings fail closed.

#### Reflective reading-room experience

- The home hero must signal that the product combines numbers, cards, and lived outcomes without looking like a generic AI dashboard or a low-cost fortune site.
- The question flow uses a quiet, tactile reading-room metaphor: a restrained card-back arrangement before the draw and a recognizable portrait-format card face after the draw. It avoids neon, crystal balls, fear copy, prediction theatre, and decorative effects that obscure text.
- Card position, title, orientation, and keywords remain semantic text outside the decorative illustration. A reversed card may rotate only its decorative artwork; reading order and text never rotate.
- The first screen keeps one primary action. Draw provenance, event ID, deck version, algorithm version, and seed remain available in a collapsed disclosure instead of competing with the reflection.
- The treatment uses first-party CSS and canonical card data only. It introduces no remote art, tracking request, AI-selected visual, or change to the deterministic draw.
- Acceptance: Korean and English expose the same card order, orientation, meaning, audit fields, and safety boundary.
- Acceptance: 320px mobile through desktop layouts have no horizontal overflow, visible focus, reduced-motion support, WCAG AA text contrast, and a card face that remains legible without relying on color.
- Acceptance: initial route performance remains inside the existing decoded-JavaScript and request budgets; share-card code is deferred until the relationship result is explicitly produced.
- First-load typography must not fan out into per-glyph webfont downloads. Localized pages use a bounded first-party font strategy or a system stack and remain below the established resource and transfer budgets.

### Career

- Explain fit reasons, adverse conditions, complementary skills, preferred environment, and avoid conditions for role families.
- Acceptance: output is explanatory, never a definitive vocational test.

### Relationships

- Romantic, marriage, friend, coworker, cofounder, manager/report, parent/child.
- Inputs: two ISO birth dates, optional self-supplied romanized names, relationship type, and optional local labels. The second person's data is used only for this comparison unless the user separately chooses to save it.
- Output fields: common ground, complement, friction, communication, money/responsibility, decision authority, conflict repair, and maintenance conditions. Each output carries canonical evidence references and a reality-check question.
- The deterministic engine may describe shared or contrasting symbolic structures but never emits a success percentage, personality identity percentage, destined outcome, loyalty verdict, or instruction to stay/leave.
- Acceptance: common ground, complement, friction, communication, money/responsibility, authority, repair, and maintenance conditions are shown without fate claims.
- Acceptance: swapping people preserves symmetric structural observations; role-asymmetric relationship guidance states whose role is being described rather than treating power as destiny.
- Acceptance: missing names still produce a complete date-based comparison, and Korean/English keep the same field IDs and evidence structure.

### Romantic discovery and future-partner reflection

- Inputs: the user’s existing deterministic numerology profile only. A third person’s data is not required.
- Outputs: relationship energy sources, three real-world meeting-context hypotheses, qualities to explore in a future spouse/long-term partner, attraction pattern, friction pattern, green flags, current-cycle reflection, and reality checks.
- Meeting contexts are ranked by symbolic relevance and plausible exposure opportunity. They are never presented as a statistical probability, guaranteed location, date, or event.
- “Future spouse portrait” means a reflective hypothesis about qualities and relationship conditions that may complement the user. It never identifies a person, appearance, occupation, nationality, age, timing, or guaranteed marital outcome.
- Each meeting context explains why it appears, a small action that can create genuine social exposure, and a caution against forcing the symbol.
- Acceptance: the same canonical numerology profile returns the same versioned relationship insight in Korean and English; core meaning remains non-contradictory.
- Acceptance: outputs include evidence references, uncertainty, and explicit decision ownership; no prediction percentage or deterministic marriage claim is allowed.
- Acceptance: an omitted or unsupported name still produces a complete date-based result and clearly excludes name-number evidence.

### Celebrity comparison

- Public birth dates with source, access date, confidence, field filter, and structural similarity.
- MVP records contain a stable ID, bilingual display name, ISO birth date, role fields, source title/URL/publisher, access date, and confidence (`confirmed`, `reported`, or `uncertain`). Only sourced public facts are stored; no generated biography or private inference is added.
- Similarity uses date-only Life Path, Birthday, and Attitude structures. Internal weights rank results, but UI exposes ordinal overlap labels and matching/differing structures rather than a percentage.
- Name-number similarity is excluded because stage names, transliteration, and legal-name use are not consistently comparable across public figures.
- Acceptance: wording is “similarity based on the numerology structure of public birth dates,” never percent-identical personality.
- Acceptance: every visible record links directly to its source, uncertain dates remain labeled, invalid/duplicate records fail validation, filters are deterministic, and Korean/English retain identical rank and evidence IDs.

### Question reading and Reality Check

- Save question, state, interpretation, choice, action, review date, outcome, and five-level fit.
- Fit values are `accurate`, `mostly_relevant`, `partly_relevant`, `hard_to_tell`, and `not_relevant`; UI labels use Personal Relevance, Pattern Fit, Outcome Review, or Reflection Match rather than prediction accuracy.
- Guest records remain in the current session by default. Writing sensitive reflection text to browser storage requires a separate, explicit on-device-storage choice and includes delete/export controls.
- Create and review operations carry a client request ID. Retrying the same operation returns the existing record rather than duplicating it.
- A review preserves the original interpretation and action plan, records the actual outcome separately, and can be changed without rewriting the historical question.
- Monthly summaries group repeatedly relevant, uncertain, and not-relevant categories only after sufficient reviewed records; they do not claim that numerology or tarot learned scientific accuracy.
- Each new outcome review records both an absolute UTC `reviewedAt` audit timestamp and the browser-local `reviewedMonth` (`YYYY-MM`) observed at the review action. The local month is used only for calendar grouping; it is not a location or time-zone inference.
- The monthly report defaults to the current browser-local month and lets the user revisit every month represented by reviewed records. Months sort newest first, the current month remains available when empty, and changing the month performs no storage or network write.
- Existing version-1 records without `reviewedMonth` remain readable and use the UTC month from `reviewedAt` as a disclosed compatibility fallback. They are not silently rewritten.
- A derived review queue groups records as ready, planned, or reviewed, places the earliest ready review first, and exposes one “review next ready outcome” action. Planned items sort by the earliest review date; reviewed items sort by the newest review time.
- Queue filters and counts are in-memory views only. Opening the page never reads device storage automatically; device-saved records enter the queue only after the existing explicit load action. Queue navigation creates no storage, network, analytics, notification, or URL side effect.
- The queue supports at most the same 500 validated records as the local adapter, preserves source records without mutation, treats the local review date as ready on that date, and keeps early review available as a deliberate user action.
- Monthly report rules have their own version, separate from the immutable original Reality Check rule.
- Acceptance: monthly report separates repeatedly relevant, uncertain, and not-relevant patterns.
- Acceptance: local/UTC month boundaries, legacy fallback counts, invalid months, newest-first month options, past-month selection, empty current month, no-write navigation, queue ordering/counts/filters, same-day readiness, no source mutation, explicit device loading, empty filtered states, next-ready focus, empty or future-invalid review dates, overlong text, duplicate request IDs, deletion, export, corrupt browser data, and Korean/English labels are tested.

### Outcome-informed next analysis

- A completed Reality Check may inform a later analysis only as a separate `outcome_review` layer. It never changes canonical numerology facts, tarot cards, symbolic rules, or the deterministic ranking of meeting environments and partner qualities.
- In the guest website, a later relationship result reads device-saved Reality Checks only after the user selects an explicit “use saved outcome reviews” action. Merely opening the page or calculating a relationship result performs no device-history read.
- The first supported bridge is category-scoped: only reviewed `relationship` records can inform the romantic-pattern result. Other categories are ignored rather than generalized into relationship advice.
- The derived signal is versioned and uses at least two reviewed outcomes. `accurate` and `mostly_relevant` count as relevant, `not_relevant` remains a miss, and the other ratings remain uncertain. A two-thirds threshold produces repeatedly relevant or repeatedly not relevant; otherwise the signal is mixed. Zero or one review cannot personalize the result.
- The contextual layer may display at most three recent, unique user-authored learning notes, bounded to 280 Unicode characters each. They remain labelled untrusted user data, are rendered as text, and cannot become instructions or override safety.
- Repeated relevance means “retain as a hypothesis to test,” not “increase prediction accuracy.” Repeated non-relevance means “de-emphasize this prior inference and prioritize observed conditions,” not “recalculate numerology.”
- The UI displays reviewed/relevant/uncertain/not-relevant counts, the applied treatment, uncertainty, privacy boundary, and context-rule version. Korean and English use identical category, signal, treatment, counts, and evidence-reference structure.
- No raw question, state, interpretation, choice, action plan, outcome, birth date, name, or third-party data enters the derived layer. No context is sent to an AI provider in the local website.
- Acceptance: explicit-use, no-history, one-review, relevant-majority, non-relevant-majority, mixed, category isolation, corrupt device data, very long learning text, injection-shaped learning text, deterministic ordering, Korean/English parity, and no-calculation-mutation cases are tested.

### Relationship-to-Reality-Check handoff

- Each ranked meeting-context card offers an explicit action to continue that selected environment as a Reality Check experiment. Nothing is transferred merely because the relationship result was calculated or viewed.
- The handoff contains only a generated reflective question, generated current-state framing, the selected symbolic hypothesis, a non-predictive choice, the context’s small action, locale, public context ID, source rule version, and short-lived audit timestamps.
- Birth date, name, raw form input, number values, partner identity, third-party data, contact data, exact location, and full relationship result are structurally absent. The destination URL contains no query string, fragment, tracking ID, or personal data.
- The handoff is written to `sessionStorage`, scoped to the current browser tab, only after the user presses the context action. It expires after 30 minutes and is consumed and removed after the Reality Check page reads it once.
- Locale, source, context ID, rule version, opaque handoff ID, strict object shape, text limits, created time, expiry order, and maximum lifetime are validated. Corrupt, stale, future-inconsistent, wrong-locale, or extra-field payloads fail closed and are cleared.
- The Reality Check form shows that a relationship experiment was loaded, pre-fills editable fields, and still requires the user to choose a review date and explicitly submit. Handoff creation never creates a Reality Check record by itself.
- If session storage is unavailable, the user remains on the relationship page and receives an accessible error; no sensitive fallback is placed in the URL or persistent storage.
- Acceptance: no read/write before click, one tab-scoped write, clean destination URL, one-time consume, 30-minute expiry, locale mismatch, corrupt/extra fields, unavailable storage, editable prefill, source disclosure, no automatic record creation, no raw date/name/number/third-party fields, keyboard focus, mobile layout, and Korean/English parity are tested.

### Sharing

- Share core number, archetype, one-line pattern, celebrity comparison, and relationship summary.
- Share-card builders accept only purpose-specific public fields; they have no birth-date, concern, journal, question, third-party name, or contact field. Core profile, romantic pattern, compatibility summary, and celebrity match use separate typed builders.
- The guest MVP renders a self-contained local preview plus 1080×1350 PNG and SVG files without uploading data or loading remote images. The card includes a non-predictive context label and product brand, not hidden tracking parameters.
- `Share image` is always an explicit user action. The browser converts the already validated SVG to a PNG in memory. If the device supports file sharing, InnerArc opens the native share surface with exactly one generic-titled `image/png` file and no URL or free-text message. If file sharing is unavailable or fails technically, the same click downloads the PNG and announces the fallback. A user cancellation does not trigger a download.
- PNG, SVG, native-share, fallback, and cancellation paths create no application record, browser-storage entry, analytics event, provider request, remote asset request, or automatic recipient. A selected operating-system/app share target is outside InnerArc and is disclosed next to the action.
- Acceptance: full birth date and sensitive concern are absent by default.
- Acceptance: ISO dates, emails, phone-like contact strings, prohibited certainty, unescaped SVG markup, oversized copy, and accidental third-party identifiers are rejected; Korean/English layouts use the same safe schema.
- Acceptance: downloaded PNGs have a valid PNG header and exact 1080×1350 dimensions; native sharing receives one PNG file with no `text` or `url`; unsupported sharing downloads once; cancellation downloads nothing; busy/error/status states are accessible and duplicate clicks cannot create duplicate share actions.

### Accessibility, security, and installability

- Every localized experience exposes one discoverable main landmark, a bilingual skip link, language scope, labeled controls, keyboard-visible focus, and at least 44×44 CSS-pixel primary touch targets.
- Newly generated results receive programmatic focus without trapping the user. Smooth scrolling is disabled when `prefers-reduced-motion: reduce` is active.
- Automated browser audits cover the home, tarot, relationship, compatibility, celebrity, and Reality Check routes at desktop and mobile widths. Critical/serious accessibility violations fail the release gate.
- Production pages send CSP, frame-ancestor/clickjacking, MIME-sniffing, referrer, browser-capability, opener, and resource-isolation headers. CSP permits only resources required by the current first-party app and blocks plugins, frames, and unexpected form targets.
- A web app manifest may support installation, but the MVP does not register a service worker or cache questions, dates, names, outcomes, or relationship data for offline use.
- Acceptance: security-header values are unit-tested and observed on a production server; the manifest is localized-neutral, starts at the Korean guest entry, and declares no background sync, share target, or sensitive offline capability.

### Measurement and entitlement boundary

- Product analytics is opt-in and disabled when no approved sink is configured. Event contracts contain only enumerated operational properties; they have no free-text, name, birth-date, question, outcome, account-email, or third-party-data field.
- Outcome-review events may include only the five-level relevance label required for aggregate quality measurement. AI run events may include provider/model aliases, token counts, latency, fallback state, and estimated micro-cost, never prompts or responses.
- Free/Plus/Pro access decisions are deterministic from a versioned entitlement policy and measured usage window. A denial explains the limit and upgrade tier without fear, urgency, or safety-content withholding.
- The local deterministic basic routes for question tarot, romantic reflection, compatibility summary, celebrity comparison, and Reality Check remain available to guests. Payment gates apply to purchased reports and genuinely paid depth, not to the existing Free tier or safety/data-rights controls.
- Checkout, customer portal, cancellation, and subscription updates cross a provider-neutral server interface. Requests and webhook events are idempotent; stale events cannot overwrite newer state.
- Failed/incomplete/canceled billing always resolves to at least Free access. `past_due` may retain the prior paid tier only through an explicit current-period grace boundary.
- A buyer may change the selected reading depth on the plan page before order creation. The chosen product code must update both the server-priced order request and the stored report input together; a prior page selection must not produce a false payment-window failure.
- Checkout validation distinguishes missing reading input, invalid depositor name, invalid mobile number, temporarily paused/unavailable sales, rate limiting, order creation failure, payment-widget preparation failure, and provider payment failure. Buyer-facing copy remains actionable without exposing internal credentials or provider responses.
- Production payment readiness additionally requires the explicit server-only `PAYMENTS_LAUNCH_APPROVED=true` gate. Provider credentials and prices alone cannot open checkout; the gate is set only after seller identity, legal notices, domain/callback, refund/support, merchant-method, and live payment-path approvals are recorded.
- Acceptance: unknown analytics properties fail closed; analytics consent off produces no write; repeated event/request IDs produce one record/result; payment failure never mutates subscription state; duplicate/stale subscription events are harmless; plan switching produces a matched product/input request; invalid local checkout fields make no order request; provider readiness and rate-limit errors remain distinguishable; private-storage refusal cannot block a hosted-payment redirect.
- Acceptance: the Korean and English paid-reading homepages expose the free core-result path; the same fixed birth-date vector produces Life Path 11 and the same archetype in both languages without an order request.

### Consented personalization context

- Personalization retrieval is owner-scoped and disabled when AI-personalization consent is off. It returns versioned structured items rather than concatenating database text into instructions.
- Allowed context kinds are user preference, pattern observation, outcome summary, and optional journal excerpt. Journal excerpts require both AI-personalization and raw-journal-retention consent.
- Each item keeps an opaque source reference and bounded text. The provider envelope labels all item text as untrusted user data and states that it cannot override system or safety rules.
- A storage adapter returning another owner’s row fails closed. Maximum item count and per-item length are enforced before provider use, and raw context never enters operational logs or AI cost audit callbacks.
- Acceptance: consent-off performs no store read; journal consent gating, owner mismatch, invalid records, deterministic newest-first limits, and injection-shaped text are tested.

### Operational controls

- High-cost and abuse-sensitive actions use named versioned rate-limit policies. A client retry with the same opaque request ID returns the original decision without consuming quota twice; exact window rollover is deterministic.
- Feature flags are typed, default-deny for invalid input, tier-aware, and support a global kill switch. Percentage rollout uses a stable opaque subject reference and basis-point buckets, not email, device fingerprint, or sensitive profile data.
- Free safety guidance, deletion, and account access are never hidden behind experimental flags or commercial quota. Production rate-limit storage must be shared/atomic; the in-memory adapter is test and single-process preview infrastructure only.
- Acceptance: quota boundary, denial retry, allowed retry, exact reset, policy separation, stable rollout, tier exclusion, 0/100% rollout, and kill-switch precedence are tested.

## Out of MVP

Live human readers, palm/face/dream analysis, full Four Pillars or natal astrology, voice sessions, public community, ads, tokens, open commerce/checkout and marketplace fulfillment, medical/mental-health diagnosis, investment picks, and legal determinations.

## Current implementation boundary

The current guest preview uses browser-memory state. Deterministic numerology, the 78-card tarot engine, safety-gated question flow, personal romantic-discovery reflection, two-person compatibility, sourced celebrity comparison, local share cards, and the Reality Check outcome loop are connected. A relationship result can explicitly load already saved relationship outcome reviews into a separate, local-only next-analysis layer; it does not alter calculation or symbolic ranking. A deterministic accessory/music curation layer and closed shop preview are part of the web-first MVP; real products and purchase controls remain unavailable until the commerce gates pass. Reality Check and tarot device persistence are explicit and local-only. Account, server persistence/reminders, approved live AI, payment, analytics, and native apps remain specified but unconnected.
