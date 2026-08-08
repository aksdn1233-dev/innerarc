# Referral Program Design — Inactive Draft

Status: implemented foundation, not exposed, not applied to production.

## Customer promise

A referrer earns a 25% discount after one distinct new friend completes an eligible
first purchase. A claim is not verified merely because someone typed a contact value.

## Recommended operating rules

- Maximum two verified friends per order, for a 50% cap.
- One qualifying purchase can verify one pair only.
- Self-referral, repeated referrer/invitee pairs, refunded, cancelled, disputed, test,
  and already-existing-customer orders are ineligible.
- Verify only after the refund/chargeback qualification window.
- Use the larger of an active campaign or referral benefit; do not stack both by default.
- Prefer a generated public alias. A phone-number fallback must be handled only as a
  transient lookup value and never displayed as a shareable code.

## Privacy and security

`normalizeKoreanMobilePhone` accepts the supported Korean mobile format. The server
then creates a SHA-256 HMAC using a referral-only secret of at least 32 characters.
Only the 64-character hash reaches storage. The secret must remain separate from
payment and order secrets. Raw values are excluded from logs, URLs, analytics, exports,
and administrator lists.

Database constraints reject self-referral, duplicate pairs, duplicate qualifying
orders, invalid states, and reward values other than 25%. Row-level security and grants
leave the draft table service-role-only.

## Activation checklist

1. Approve cap, eligibility, refund window, stacking, expiry, and customer copy.
2. Prefer a generated alias; obtain a privacy/legal review if phone lookup remains.
3. Review and apply `20260801000100_referral_foundation.sql` to staging first.
4. Set a new `REFERRAL_PHONE_HASH_SECRET`; do not reuse another secret.
5. Add server-only claim/verification endpoints with rate limiting and audit events.
6. Add checkout integration with atomic reward consumption and idempotency.
7. Test self-referral, duplicates, refunds, concurrent redemption, enumeration, deletion,
   raw-number log leakage, event stacking, and payment amount verification.
8. Only then set `REFERRAL_DISCOUNT_ENABLED=true` and expose the form behind a rollout.
