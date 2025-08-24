# KamkmServe – Software Project Audit (2025-08-23)

## Executive Summary
KamkmServe is a Next.js 15 (App Router) + React 19 TypeScript application for selling services with an admin CMS, authentication via Clerk, database access via Drizzle ORM + PostgreSQL (Neon HTTP in middleware), and observability via Sentry. It shows strong security posture (security headers, HTTPS enforcement, role checks, basic rate limiting), clear structure, and good developer tooling (ESLint flat config, Prettier, Vitest). Documentation is thoughtful, including a production hardening checklist and a detailed README.

Main risks: overly permissive CSP for production (`'unsafe-inline'`/`'unsafe-eval'`), in-memory rate limiting (not distributed), Sentry `tracesSampleRate: 1` on server, and some schema choices using `text` for JSON. Testing exists, but coverage and CI enforcement can improve. Performance is reasonable with opportunities for bundle/caching improvements.

Overall: solid foundation; a few targeted fixes will significantly improve security, scalability, and operability.

## Strengths
- **Security headers & HTTPS**: `next.config.js` sets HSTS, XFO, X-CTO, Referrer-Policy, CSP. `src/middleware.ts` enforces HTTPS in prod.
- **AuthN/AuthZ**: Clerk integration with admin route protection; role checks via claims and DB fallback (Neon HTTP) in `src/middleware.ts`.
- **Observability**: Sentry configured (server, edge, client) with source maps via `withSentryConfig`; tunnel route enabled. Metrics helpers in `src/lib/middleware/metrics.ts`. Audit log table exists.
- **Schema quality**: Enums, unique constraints, indexes, timestamps with `$onUpdate`. Sensible FK policies.
- **Tooling**: ESLint flat config with TS, `eslint-plugin-drizzle` safeguards, Prettier, Vitest with jsdom and setup file. Path aliases in tests.
- **Documentation**: Comprehensive `README.md` and strong `ToDo.md` production checklist; docs for security.
- **Uploads safeguards**: AV scan hook in `src/lib/avscan.ts` (fail-closed option) and checklist for validation/limits.
- **Deployment readiness**: `vercel.json`, Sentry integration, `.gitignore` hygiene.

## Weaknesses
- **CSP looseness**: `next.config.js` CSP includes `script-src 'self' 'unsafe-inline' 'unsafe-eval'` (XSS risk).
- **In-memory rate limiting**: Uses `globalThis` Map in `src/middleware.ts`; ineffective across instances/serverless and resets on cold start.
- **Sentry sampling**: `sentry.server.config.ts` sets `tracesSampleRate: 1` (potentially high cost & noise in prod).
- **JSON stored as text**: Several fields (e.g., `orders.metadata/preferences/questions/suggestions`, image URLs) are `text` instead of `jsonb`.
- **Edge middleware DB lookup**: Adds latency for admin routes; requires `DATABASE_URL` at edge. Needs caching.
- **Testing rigor**: Vitest present, but no coverage thresholds or CI gating visible; no E2E suite.
- **3rd-party embedding**: `frame-ancestors 'self'` is safe-by-default but may need allowlists for integrations.
- **Install scripts**: `vercel.json` allows install scripts (default). Monitor supply-chain risk.
- **Performance hygiene**: No documented bundle analysis, image policy, or caching strategy.

## Detailed Findings

### Project Structure & Organization
- Next.js App Router in `src/app/`; components in `src/components/`; server code in `src/server/`; utilities in `src/lib/`.
- DB schema centralized at `src/server/db/schema.ts`; Drizzle artifacts in `drizzle/`.

### Code Quality
- Consistent TypeScript with strict lint rules (`eslint.config.js`).
- `src/contexts/ThemeContext.tsx`: SSR-safe theme init, localStorage persistence, simple API.
- `src/lib/middleware/metrics.ts`: reusable operation timing with dev-only debug headers.

### Architecture & Patterns
- Admin protection via middleware with robust claim-first then DB fallback role checks.
- Encapsulated AV scanning hook for easy provider switch.
- Metrics wrappers promote consistent instrumentation.

### Performance (Frontend + Backend)
- No clear blocking patterns in reviewed files.
- Edge middleware role lookups can add latency on admin paths; cache advisable.
- No bundle analysis, caching or ISR strategy explicitly set; Sentry logger disabled to reduce bundle size.

### Security
- Strong default headers (HSTS, XFO, X-CTO, Referrer-Policy, CSP) in `next.config.js`.
- HTTPS enforced in `src/middleware.ts` for production.
- CSP permissive for scripts (`unsafe-*`); tighten for production.
- Admin Basic Auth fallback is optional and gated via env; includes proper `WWW-Authenticate` challenge.
- Rate limiting present but not distributed; at risk under load.
- Env validation via `@t3-oss/env-nextjs` in `src/env.js`.
- Drizzle schema with unique indices and enums; dedicated `audit_log` table.

### Documentation & Comments
- `README.md` covers setup, ENV, DB, scripts, deployment, and troubleshooting.
- `ToDo.md` provides a comprehensive production hardening checklist.
- Clear inline comments in middleware and security-related utilities.

### Testing & Reliability
- Vitest configured with jsdom and setup (`vitest.config.ts`, `test/setup.tsx`).
- Unit tests exist (`test/abac.test.ts`, `test/uploads.test.ts`, `test/logger.test.ts`).
- Missing coverage enforcement and CI pipelines; no E2E tests.

### UI/UX
- Theme context implemented; defaults to light and persists.
- Component structure suggests modularity; not fully evaluated without pages.

### Tooling, Dependencies, Build
- Modern stack: Next 15.2.3, React 19, Tailwind 4, Drizzle ORM.
- ESLint + Prettier + Vitest + TS typechecks; Sentry with source maps via `withSentryConfig`.
- `vercel.json` for deployment; `pnpm` lockfile versioned.

### Scalability & Future-Proofing
- Middleware-based security scales; rate limiting must move to distributed store.
- Schema is extensible; `jsonb` recommended for structured metadata.
- Observability prepared; add alerting and tuned sampling.
- ENV validation is in place; extend for optional admin basic auth keys if used.

## Recommendations

### High Impact / Low Effort
- **Tighten CSP for production**: Replace `script-src` with nonce/hash-based policy; remove `'unsafe-eval'`. Consider separate dev vs prod CSP.
- **Use distributed rate limiting**: Replace `globalThis` Map with Redis/Upstash/Vercel KV sliding window or token bucket. Preserve rate limit headers.
- **Tune Sentry sampling**: Lower `tracesSampleRate` in prod (e.g., 0.1) or implement `tracesSampler`. Optionally configure `profilesSampleRate` cautiously.
- **Add coverage + CI gates**: Enable Vitest coverage (c8/v8). Add GitHub Actions to run `lint`, `typecheck`, `test`, `format:check`; enforce thresholds.

### High Impact / Medium Effort
- **Migrate text JSON to jsonb**: Convert `orders` metadata/preferences/questions/suggestions and media URL arrays to `jsonb`. Create migrations and update accessors.
- **Cache admin roles**: Cache role from DB in Clerk session claims or edge KV with short TTL to reduce latency in `src/middleware.ts`.
- **Add E2E tests**: Use Playwright/Cypress for admin flows (auth, CRUD, role checks) and run in CI.

### Medium Impact / Low Effort
- **Environment-specific CSP**: Relaxed CSP in dev, strict in prod; document in `docs/security/`.
- **Harden Basic Auth fallback**: Only enable outside local dev if absolutely required, enforce strong credentials, pair with distributed rate limit.
- **Alerts & dashboards**: Add alerting for error spikes, 5xx rates, latency, DB failures. Link dashboards in `docs/runbooks.md`.

### Medium Impact / Medium Effort
- **Performance hygiene**: Add bundle analyzer; adopt `next/image`; consider dynamic imports for heavy admin pages.
- **Caching strategy**: Add HTTP caching for static/marketing pages and API responses. Consider ISR for content.

### Lower Impact / Low Effort
- **Document rate limiting & admin policy**: Clarify in `README.md` or `docs/security/`.
- **Automated security header tests**: Unit tests to assert header presence/values.

## Overall Rating
**Score: 8.2/10**

Justification: Modern, secure-by-default foundation with strong tooling and documentation. Main detractors: permissive CSP, non-distributed rate limiting, high Sentry trace sampling, and `text` JSON fields. Address the high-impact items to reach production-grade hardening suitable for scale.

## Next Steps
- Implement nonce/hash-based production CSP and remove `'unsafe-eval'`.
- Introduce Redis/Upstash rate limiting in `src/middleware.ts`.
- Reduce Sentry traces in production via sampling.
- Migrate JSON text fields to `jsonb` with Drizzle migrations.
- Add CI coverage gates and start an E2E suite.
- Add caching (edge/KV) for admin role lookups and adopt performance tweaks.
