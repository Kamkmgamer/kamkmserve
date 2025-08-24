# 🛡️ Production Hardening Checklist

A comprehensive checklist to ensure your application is production-ready, secure, and resilient.


## KamkmServe TODO Roadmap

A concise, actionable roadmap aligned with the 2025-08-24 audit. Use this as the living source of truth for near-term work.

---
### High Impact / Low Effort (Weeks 0–1)
- [x] Harden CSP in `next.config.js`
  - [x] Remove `'unsafe-eval'`; minimize `'unsafe-inline'` for `script-src`/`style-src`
  - [x] Add nonces/hashes where inlining is required (no longer needed after removing inline script; moved to `/public/theme-init.js`)
  - [x] Add regression test to assert headers (`tests` or `vitest` server harness)
- [x] Reduce Sentry tracing in production
  - [x] Gate `tracesSampleRate` via `NODE_ENV` in `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` (target 0.05–0.2)
  - [x] Optionally implement `tracesSampler`
- [x] Align Sentry DSN envs and docs
  - [x] Use `SENTRY_DSN` (server/edge) and `NEXT_PUBLIC_SENTRY_DSN` (client) consistently
  - [x] Update `.env.example`, `README.md`, Vercel envs
- [x] Configure Next Image remote sources
  - [x] Add `images.remotePatterns` for ImageKit and any CDN domains in `next.config.js`

### High Impact / Medium Effort (Weeks 1–3)
- [ ] Expand tests and run Playwright in CI
  - [ ] Middleware/auth tests: role checks, rate-limit behavior (`src/middleware.ts`)
  - [ ] Admin API mutations: create/update/delete with positive/negative cases (`src/app/api/admin/*`)
  - [ ] Security headers regression test (CSP, HSTS, XFO, no-sniff, referrer policy)
  - [x] Enable Playwright job in CI; add flows: sign-in, add to cart, place order, mark payout paid
- [ ] Enforce dependency security posture
  - [x] Update `security.yml` to pnpm `10.13.1`
  - [x] Consider failing builds on high/critical vulns (remove `|| true` or gate with approvals)
  - [x] Add Renovate or Dependabot for automated updates

### Medium Impact / Low Effort (Weeks 0–2)
- [ ] Review postinstall script policy
  - [x] Revisit `vercel.json` `installCommand` (avoid `--config.ignore-scripts=false` if possible)
  - [ ] Document any packages that require lifecycle scripts
- [ ] Ensure `pgcrypto` availability for `gen_random_uuid()` across Postgres providers
  - [x] Add conditional migration or setup documentation
- [ ] Consolidate env validation as single source of truth
  - [x] Confirm `@t3-oss/env-nextjs` is canonical; align `next.config.js` import `./src/env.js` and `~/env`

### Medium Impact / Medium Effort (Weeks 2–4)
- [ ] Observability improvements
  - [ ] Consider Sentry Replay with sampling caps
  - [ ] Create dashboards/alerts for LCP/CLS/API latency
- [ ] Performance tooling
  - [ ] Add optional Next bundle analyzer script and PR artifact/reporting for large diffs

### Nice to Have (Backlog)
- [ ] Terraform IaC: enable backend and minimal resources; codify secrets access policies
- [ ] Multi-region strategy note: CDN, DB read replicas, and routing plans
- [ ] Document DB connection strategy and pool tuning (Neon serverless)

---

Ownership: Assign each item to an owner and milestone. Review weekly in triage. Update statuses as work progresses.
