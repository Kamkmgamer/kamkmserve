# 🛡️ Production Hardening Checklist

A comprehensive checklist to ensure your application is production-ready, secure, and resilient.


## KamkmServe TODO Roadmap

A concise, actionable roadmap aligned with the 2025-08-24 audit. Use this as the living source of truth for near-term work.

---

### Quick Wins (High Impact, Low Effort)
- [x] Fix `getServiceById` cache key in `src/server/services.ts` to include `id` (use `["services:by-id", id]`).
- [x] Add production guard to disable Admin Basic Auth bypass in `src/middleware.ts` and log with `logger.security` when enabled.
- [x] Add CSP validation test to prevent drift in `next.config.js` security headers.

### Security & Middleware
- [x] Replace in-memory rate limiter in `src/middleware.ts` with Redis (Upstash) and emit `RateLimit-*` headers.
- [x] Cache admin role determination (short-lived signed cookie or Clerk custom claim) to avoid DB lookup on every admin request.
- [x] Add security event logging for auth bypass attempts and role check failures. (implemented in src/middleware.ts)

### API & Testing
- [x] Add integration tests for representative admin routes in `src/app/api/admin/*` (orders, payouts, commissions). (added Vitest-based integration tests)
- [x] Add e2e smoke tests (Playwright): sign-in, add to cart, submit order, mark payout paid. (scaffold added: `playwright.config.ts` and `tests/e2e/smoke.spec.ts`)
- [x] Uploads: add quotas/abuse controls and optional malware scan integration on the upload endpoint. (per-IP quota implemented with Upstash + in-memory fallback)

### Performance & Caching
- [x] Define per-route revalidation and caching strategy (ISR, tags) and document it. (see `docs/deployment/revalidation.md`)
- [x] Consider edge caching for read-heavy marketing pages. (added Cache-Control headers in `next.config.js`)
- [x] Add bundle analyzer checks and perf budgets in CI; track CLS/LCP in Sentry dashboards. (added `scripts/check-budgets.mjs`, CI step in `.github/workflows/ci.yml`, Sentry browser tracing in `instrumentation-client.ts`)

### DX, Docs & Operations
- [x] Add architectural diagram and “where to add features” guide to `README.md`. (see `README.md` Architecture + Where to add features)
- [x] Add runbooks and deployment safety checklist; document role-lookup fallback behavior. (added `docs/operations/runbooks.md`, `docs/deployment/safety-checklist.md`)
- [ ] Enable Dependabot/Renovate for dependency updates.
- [x] Add a11y checks (axe) to CI and fix contrast/focus regressions. (added `test/a11y.home.test.tsx`, registered matchers in `test/setup.tsx`, CI step in `.github/workflows/ci.yml`)

---

Ownership: Assign each item to an owner and milestone. Review weekly in triage. Update statuses as work progresses.
