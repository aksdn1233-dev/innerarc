# Known issues — Saju workstream

| Severity | Issue | Current behavior | Exit condition |
|---|---|---|---|
| Blocker | Korean lunar conversion absent | Lunar/leap-month inputs reject with a typed error. | Two-source validated conversion and boundary corpus. |
| Blocker | New schema not staging-tested | Migration is additive and inactive; no runtime writes use it. | Migration, rollback, RLS, export, and deletion integration tests pass. |
| High | Validation corpus is small | Astronomical boundaries and regression anchors pass; broad external pillar parity is not established. | Large cross-source corpus with documented disagreements. |
| High | Historical time policy review incomplete | Known offsets and warnings are exposed; pre-1908 and some summer-time intervals remain uncertain. | Specialist-reviewed tables and fixtures. |
| Medium | Recalculation admin UI absent | Schema supports immutable versions/diffs/audit only. | Authorized select/recompute/diff/invalidate workflow and tests. |
| Medium | Saju paid report/chat not connected | Existing Saju page links to the current general plan; no Saju-specific generated content is sold. | Structured facts, validators, cost caps, job compensation, and QA pass. |
| Medium | Very old supported dates need stronger evidence | Core and UI accept 1100–2026, while pre-1908 results carry a historical-time warning. | Domain-review the commercial range and add historical fixtures before promoting old-date support. |
| Release | Full browser suite is not green in the current concurrent worktree | Saju E2E is 8/8 green; duplicate hero selectors fail twice and shared CSS is 4,207 bytes over budget on sixteen checks. | Reconcile the in-progress hero/CSS work, keep the payload gate, then rerun all 156 tests. |
| Release | Local runtime is Node 22.14.0 | Verification completed with an unsupported-engine warning; project contract requires Node 24. | Repeat clean install/verify/E2E on Node 24. |
