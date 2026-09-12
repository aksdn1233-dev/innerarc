# Dream Intelligence V1 — research and source register

Status: implementation source register, 2026-09-13. This is not a claim that dreams predict events. It records what a source can support, what it cannot support, and the exact ID the product may cite.

## Source tiers

- **A:** primary text with established provenance, scholarly edition, peer-reviewed research, clinical guideline, museum/university/national institution.
- **B:** credible scholarly secondary work or a historical translation with material edition limits.
- **C:** traceable regional or transmitted folklore. It can describe a tradition, never establish an outcome.
- **D:** modern popular dream material. It cannot be core evidence.
- **X:** untraceable pages, SEO content, community claims, or likely generated text. The engine rejects it.

| source_id | source | period / culture | type | tier | what V1 may say | limitation |
| --- | --- | --- | --- | --- | --- | --- |
| `dream-source:artemidorus-oneirocritica` | *Oneirocritica*, Artemidorus; Oxford scholarly study/edition | 2nd c. CE, Graeco-Roman | primary text / scholarly edition | A | The preserved ancient manual treats dreamer identity, occupation and circumstances as material to interpretation. | Historical method, not scientific validation. Do not transplant an isolated symbol as a universal rule. |
| `dream-source:korean-folklore-encyclopedia` | National Folk Museum of Korea, Encyclopedia of Korean Folk Culture | Korean traditions, institutional record | museum | A | Taemong, ancestor-dream and symbolic traditions are cultural records with different local usages. | NFM text is attribution-controlled and non-commercial by default. Store metadata and paraphrase only; commercial excerpt use requires separate review. |
| `dream-source:ancient-chinese-chengwu` | Shaughnessy, “Of Trees, a Son, and Kingship” | 2018 study of a Warring States manuscript tradition | peer-reviewed secondary study | A | Ancient Chinese dream interpretation has a traceable manuscript history, and philological review can challenge later received readings. | Supports textual history, not a universal symbol dictionary or a prediction claim. |
| `dream-source:brihat-samhita-dreams` | *Brihat Samhita*, Varahamihira | 6th c. CE, South Asia | primary compendium | B | Dreams and omens formed part of a historical South Asian interpretive system. | Translation/edition quality varies. V1 does not make symbol-level claims without an edition review. |
| `dream-source:islamic-three-dream-types` | *Sahih Muslim*, Book of Dreams | 9th c. compilation, Islamic | primary religious text | A | The tradition distinguishes different kinds and origins of dream experience. | Later dream manuals popularly attributed to Ibn Sirin have contested attribution; V1 does not present them as securely authored primary works. |
| `dream-source:continuity-schredl-2000` | Schredl, continuity between waking life and dreaming | 2000, modern research | peer reviewed | A | Waking concerns and dream content can be compared cautiously. | Group tendency, not a personal prediction or a symbol dictionary. |
| `dream-source:dream-lag-2011` | Blagrove et al., memory incorporation time course | 2011, modern research | peer reviewed primary study | A | Recent experience may be incorporated immediately or after a delay. | Small sample; V1 never applies a fixed seven-day rule to an individual. |
| `dream-source:early-late-night-2020` | Malinowski et al., early/late-night dream content | 2020, modern research | peer reviewed primary study | A | Early-night reports were more continuous with waking life; late-night reports were more emotional and associative in the study. | 68 participants; sleep stage/time and dream recall do not reveal one correct meaning. |
| `dream-source:aasm-nightmare-position-2018` | American Academy of Sleep Medicine nightmare treatment position paper | 2018, clinical sleep medicine | clinical guidance | A | Recurring nightmares that disrupt sleep or daily life can warrant professional support. | The product does not diagnose nightmare disorder, PTSD or trauma. |

## Evidence architecture

Published tradition and modern research are immutable global records. User context, dream history and later events are owner-scoped personal records. The engine never merges these stores. A published-evidence sentence requires one or more allowlisted `source_id` values; personal context and AI inference are forbidden from carrying a published source ID.

The UI always presents cultural tradition, modern dream research, the user’s stated current context, existing deterministic Saju/birth-date results, and prior dreams/later checks as five separate layers. Confidence labels describe evidence availability only; V1 exposes no prediction percentage.

## Research and cultural boundaries

Continuity, memory incorporation and emotion processing are plausible research lenses. REM/NREM differences, dream recall and the function of dreaming remain active research areas. V1 uses “may connect” language and never says a mechanism has been proven for an individual. Universal symbol claims are excluded; action, emotion and recent context come before comparison.

The product compares traditions rather than collapsing them into one truth. Korean folklore, Graeco-Roman manuals, South Asian compendia and Islamic religious material keep their own labels. Missing or contested authorship stays visible. Tier X never enters retrieval. Tier C/D content can only be added after editorial review and cannot raise modern-research confidence.

## Business and operating evidence

Demand evidence is the owner’s direct request for a long-term dream journal tied to Reality Check. Distribution is the existing home navigation behind `DREAM_INTELLIGENCE_ENABLED`; personal pages remain `noindex`. Existing 9,600/39,000/79,000 KRW products, payment verification and entitlements do not change in V1. There is no paid-dream SKU or conversion claim.

Extraction, ontology, source retrieval, repetition counts, temporal clusters, confidence labels and follow-up scheduling run locally. `DREAM_AI_ENABLED=false` is the default. No provider or model name is guessed. The optional OpenAI Responses adapter runs only after the user opts into remote structuring and operations set an explicit account-accessible `DREAM_AI_MODEL`, privacy approval, current rates and request cost cap. It verifies `/v1/models/{id}`, counts the exact input, reserves the configured worst-case output cost before generation, sends `store:false`, accepts strict structured extraction only, retries once, caps output at 1,800 tokens and falls back deterministically. Official documentation reviewed 2026-09-13 lists `gpt-6-astra`, Responses and Structured Outputs, but account access is unverified and no model call was made here.

Success signals are repeat recording, +3/+7/+30 follow-up completion, seven/thirty-day return and useful personal-pattern confirmations. Guardrails are deletion/export success, source-ID validity, no retrofitting, no unsafe prediction language, bounded storage, owner isolation and cost caps. Disable the dream flag if these fail; retain owner data for export and deletion.

## Links reviewed

- Oxford Academic, Artemidorus study: https://academic.oup.com/book/40085
- National Folk Museum of Korea: https://folkency.nfm.go.kr/kr/
- Shaughnessy, ancient Chinese dream manuscript study: https://doi.org/10.1017/S0021911818000517
- Schredl, 2000: https://journals.sagepub.com/doi/10.2466/pms.2000.90.3.844
- Blagrove et al., 2011: https://pubmed.ncbi.nlm.nih.gov/22046336/
- Malinowski et al., 2020: https://pubmed.ncbi.nlm.nih.gov/33360822/
- AASM nightmare paper: https://pmc.ncbi.nlm.nih.gov/articles/PMC5991964/
- OpenAI GPT-6 Astra model page: https://developers.openai.com/api/docs/models/gpt-6-astra
- OpenAI Responses API: https://developers.openai.com/api/reference/cli/resources/responses/methods/create
