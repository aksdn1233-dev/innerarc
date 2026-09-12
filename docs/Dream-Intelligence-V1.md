# Dream Intelligence V1 acceptance contract

Natural-language dream → deterministic ontology and classifier → five separate evidence layers → optional device/account record → searchable timeline → +3/+7/+30 Reality Check → append-only interpretation revision → personal signature after enough samples.

## Accepted V1

- Independent `/{ko|en}/dreams` route, hidden unless `DREAM_INTELLIGENCE_ENABLED=true`, with `noindex` metadata.
- Natural-language input, a maximum of three useful follow-up questions, action-aware ontology and multi-label classification.
- Allowlisted source catalogue with quality tier and attribution limitations.
- Original dream text retained only by explicit choice; otherwise the result is stored without the submitted wording.
- Initial interpretation and timestamp immutable. Later checks append a revision.
- Personal signature remains hidden for one or two samples, becomes initial at three, and established only at five or more.
- Device export/delete and additive owner-scoped database export/delete.
- Existing Saju, birth-date calculations, payment prices, entitlements, reports and Reality Check remain authoritative and unchanged.
- Provider and model unset by default. Remote structuring requires the user checkbox plus `DREAM_AI_ENABLED=true`, `DREAM_AI_PRIVACY_APPROVED=true`, an account-accessible `DREAM_AI_MODEL`, explicit current input/output rates and a request cost cap. The adapter checks `/v1/models/{id}`, counts input and reserves worst-case output cost before generation, uses the Responses API with strict Structured Outputs and `store:false`, and falls back to deterministic analysis on any failure.

## Not in V1

No dream prediction product, voice recording, push notification delivery, public dream sharing, clinician workflow, universal symbol meaning, new price, entitlement rewrite, or production rollout. The screen prepares due dates; notification delivery needs later opt-in and review.

## Rollback

Set `DREAM_INTELLIGENCE_ENABLED=false` to remove the route and home link. Set `DREAM_AI_ENABLED=false` independently. Do not drop dream tables during a rollback: owners must retain export and deletion rights. Revert the app commit only after preserving the migration and data-rights path.

Official OpenAI documentation reviewed 2026-09-13 lists `gpt-6-astra` with the Responses API and Structured Outputs, and documents `store:false` on Responses. This is documentation evidence only; this environment has no deployment-account model-access result or configured Dream AI credentials, so V1 names no active model and made zero paid model calls.
