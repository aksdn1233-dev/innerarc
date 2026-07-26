# Phase 0 Baseline

Date: 2026-07-18

## Finding

The workspace was empty and was not a Git repository. There was no existing application, documentation, environment file, dependency lockfile, secret, reusable code, build command, or test baseline.

## Chosen baseline

- New Next.js 16 App Router project with React 19 and strict TypeScript.
- Mobile-first responsive web app, structured for PWA expansion.
- Pure domain modules under `src/core`; UI under `src/app` and `src/components`.
- Vitest for domain tests, Playwright for user flows, ESLint and TypeScript for static checks.
- Guest-first behavior requires no account or external service.
- Environment template contains names only; no real credentials.

## Initial risks

- External auth/database configuration requires a future Supabase or equivalent project.
- Provider-backed AI quality and cost cannot be validated without a provider key.
- Payments, reminders, monitoring, analytics, and deployment require external services.
- Celebrity birth-date data needs source licensing/provenance review before ingestion.
- The working name “InnerArc” has not received trademark clearance.

## Reusable assets

None.
