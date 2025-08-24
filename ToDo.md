# 🛡️ Production Hardening Checklist

A comprehensive checklist to ensure your application is production-ready, secure, and resilient.


## KamkmServe TODO Roadmap

A concise, actionable roadmap aligned with the 2025-08-24 audit. Use this as the living source of truth for near-term work.

---

### Quick Wins (High Impact, Low Effort)
- [x] Fix `getServiceById` cache key in `src/server/services.ts` to include `id` (use `["services:by-id", id]`).
- [ ] Add production guard to disable Admin Basic Auth bypass in `src/middleware.ts` and log with `logger.security` when enabled.
- [ ] Add CSP validation test to prevent drift in `next.config.js` security headers.

### Security & Middleware
- [ ] Replace in-memory rate limiter in `src/middleware.ts` with Redis (Upstash) and emit `RateLimit-*` headers.
- [ ] Cache admin role determination (short-lived signed cookie or Clerk custom claim) to avoid DB lookup on every admin request.
- [ ] Add security event logging for auth bypass attempts and role check failures.

### API & Testing
- [ ] Add integration tests for representative admin routes in `src/app/api/admin/*` (orders, payouts, commissions).
- [ ] Add e2e smoke tests (Playwright): sign-in, add to cart, submit order, mark payout paid.
- [ ] Uploads: add quotas/abuse controls and optional malware scan integration on the upload endpoint.

### Performance & Caching
- [ ] Define per-route revalidation and caching strategy (ISR, tags) and document it.
- [ ] Consider edge caching for read-heavy marketing pages.
- [ ] Add bundle analyzer checks and perf budgets in CI; track CLS/LCP in Sentry dashboards.

### DX, Docs & Operations
- [ ] Add architectural diagram and “where to add features” guide to `README.md`.
- [ ] Add runbooks and deployment safety checklist; document role-lookup fallback behavior.
- [ ] Enable Dependabot/Renovate for dependency updates.
- [ ] Add a11y checks (axe) to CI and fix contrast/focus regressions.

---

Ownership: Assign each item to an owner and milestone. Review weekly in triage. Update statuses as work progresses.
