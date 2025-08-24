# KamkmServe

Admin-enabled Next.js app for selling services with referrals, commissions, and payouts. Includes a marketing site, protected admin CMS, Clerk auth, Drizzle ORM with PostgreSQL, and Sentry monitoring.

## Architecture

```mermaid
flowchart TD
  A[Client Browser] -->|HTTP/HTTPS| B[Next.js App Router]\n(Edge/Middleware)
  B -->|Middleware auth + rate limit| C[Route Handlers / Pages]
  C -->|DB Queries (HTTP)| D[(Neon Postgres + Drizzle)]
  C -->|Auth| E[Clerk]
  B -->|Security Events| F[Sentry]
  C -->|Perf + Web Vitals| F
  C -->|Uploads| G[(Object Storage / CDN)]

  subgraph Next.js
    B
    C
  end
```

Key paths
- `src/middleware.ts` — auth gate for admin routes, rate limiting, role cache.
- `src/app/` — routes, pages, API handlers.
- `src/server/` — database, services, utilities.
- `next.config.js` — headers, security, Sentry integration, caching.

## Where to add features

- UI pages/components
  - Marketing pages: `src/app/<page>/page.tsx` and components under `src/components/`
  - Admin views: `src/app/admin/<feature>/*`
- API endpoints
  - App Router route handlers: `src/app/api/<feature>/route.ts` (index) and nested routes for item ops
  - Admin APIs: `src/app/api/admin/<resource>/...`
- Data access
  - Schema and queries: `src/server/db/schema.ts` and driven through Drizzle in route handlers or service modules
- Authz and roles
  - Middleware role checks: `src/middleware.ts`
  - Clerk claims mapping or DB lookup paths for ADMIN/SUPERADMIN
- Observability
  - Sentry client/perf: `instrumentation-client.ts`
  - Server/edge Sentry: `sentry.*.config.ts`

## Tech Stack

- Next.js App Router (`src/app/`)
- React 19, TypeScript
- Tailwind CSS 4
- Drizzle ORM + PostgreSQL (`src/server/db/schema.ts`)
- Clerk for authentication/roles
- Sentry for error and performance monitoring

## Features

- Marketing homepage (`src/app/page.tsx`) with sections like `Hero`, `CaseStudies`, `PricingTeaser`, `FAQ`.
- Admin CMS (`/admin`) with role protection (ADMIN, SUPERADMIN):
  - Services CRUD
  - Blogs CRUD
  - Coupons CRUD
  - Orders management & status updates
  - Referrals & commission rates
  - Commissions tracking
  - Payouts (work in progress)
- API routes under `app/api/admin/*` for CRUD operations.

See `ToDo.md` for the full roadmap and completion status.

## Getting Started

Prerequisites
- Node.js 20+
- pnpm (project uses `packageManager: pnpm`)
- PostgreSQL (local Docker helper provided)

Install
```bash
pnpm install
```

### Postinstall scripts policy

- By default we do not force package lifecycle scripts during Vercel installs.
- `vercel.json` uses `"installCommand": "pnpm install"` (no `--config.ignore-scripts=false`).
- If any package requires lifecycle scripts, document it here with justification and review security implications before enabling scripts in CI/deploy.

## Environment
1) Copy `.env.example` to `.env` and fill values (aligns with `src/env.js`):
```
DATABASE_URL=postgres://postgres:password@localhost:5432/kamkmserve
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
# Optional admin basic auth fallback (for /admin and /api/admin when not signed in)
ADMIN_BASIC_USER=admin
ADMIN_BASIC_PASS=change_me
```
Note: If your `.env.example` contains legacy `STACK_*` keys, replace them with the Clerk keys above.

2) Env validation is loaded via `src/env.js` from `next.config.js`. You can set `SKIP_ENV_VALIDATION=1` for CI/Docker builds.

3) Canonical env validation source of truth

- The canonical env schema lives in `src/env.js` using `@t3-oss/env-nextjs`.
- `next.config.js` imports `./src/env.js` to validate at build time.
- `drizzle.config.ts` imports `~/env` (aliased to `src/env.js`) for DB credentials, keeping a single source of truth.

3) Sentry DSNs

- Use `SENTRY_DSN` for server and edge runtime reporting (used in `sentry.server.config.ts` and `sentry.edge.config.ts`).
- Use `NEXT_PUBLIC_SENTRY_DSN` for client/browser reporting (used in `instrumentation-client.ts`).
- Both keys are optional for local development, but recommended in staging/production.

Database (Drizzle)
- Configure schema: `src/server/db/schema.ts`
- Drizzle config: `drizzle.config.ts`
```bash
pnpm db:generate   # generate SQL from schema
pnpm db:migrate    # run migrations
pnpm db:push       # push schema directly (alternative to generate/migrate)
pnpm db:studio     # open Drizzle Studio
```

Local DB via Docker/Podman (optional)
```bash
# On Windows: run in WSL (see comments in script)
./start-database.sh
```

Run
```bash
pnpm dev          # start next dev server
pnpm preview      # build and start locally
```

Lint, Typecheck, Format
```bash
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
pnpm format:write # Prettier
```

## API Overview

Admin endpoints live under `src/app/api/admin/*` (App Router route handlers). Typical resources:
- `services`: list/create/update/delete services
- `blogs`: list/create/update/delete posts
- `coupons`: list/create/update/delete, toggle active
- `orders`: list, update status, refund/cancel
- `referrals`: list/create/update
- `commissions`: list/create/update
- `payouts`: list/create/update, mark paid (WIP)

Each handler should verify Clerk auth and role before mutating. See `ToDo.md` for status.

## Authentication & Authorization

- Clerk is used for auth; roles are stored in DB (`role` enum: USER, ADMIN, SUPERADMIN) and enforced in middleware/routes (see admin area and API handlers).
- Optional HTTP Basic Auth gate for admin routes via `ADMIN_BASIC_USER/ADMIN_BASIC_PASS` when Clerk is not signed in.

Role management
- Roles live in `kamkmserve_user.role` (see `src/server/db/schema.ts`).
- Promote a user manually (example SQL):
```sql
-- Replace with the actual Clerk user id
UPDATE kamkmserve_user SET role = 'ADMIN' WHERE clerk_user_id = 'user_XXXXXXXX';
```

Admin area
- `/admin` is a protected area. Ensure your middleware and route handlers verify role `ADMIN` or `SUPERADMIN` before access.

## Observability (Sentry)

- Manual Next.js setup in `sentry.server.config.ts` and `sentry.edge.config.ts`.
- Source maps/upload configured in `next.config.js` via `withSentryConfig`.
- Client tunnel route: `/sentry-tunnel` to avoid ad-blockers.

Environment variables

- Server/Edge: `SENTRY_DSN`
- Client: `NEXT_PUBLIC_SENTRY_DSN`

Sampling

- Non-production: 100% sampling for easier debugging.
- Production: default `tracesSampleRate` 0.1 with a `tracesSampler` that drops noisy routes like `/_next/`, `/monitoring/health`, and `/sentry-tunnel`.

## Project Structure

- `src/app/` — App Router pages, layouts, API routes, sentry tunnel
- `src/components/` — UI components (home, layout, secret, etc.)
- `src/contexts/` — React providers (e.g., theme)
- `src/server/db/schema.ts` — Drizzle schema and enums
- `drizzle/` — generated SQL/migrations and metadata

## Deployment

- Recommended: Vercel. Ensure required env vars are set.
- Sentry org/project configured in `next.config.js` (update as needed).

Vercel checklist
- Set `DATABASE_URL`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- Set Sentry DSNs if you use Sentry: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`.
- Optionally set `SKIP_ENV_VALIDATION=1` for build containers.
- If using Sentry source map upload, keep org/project in `next.config.js` or set via env in CI.

### Postinstall scripts policy

- By default we do not force package lifecycle scripts during Vercel installs.
- `vercel.json` uses `"installCommand": "pnpm install"` (no `--config.ignore-scripts=false`).
- If any package requires lifecycle scripts, document it here with justification and review security implications before enabling scripts in CI/deploy.

## Scripts (package.json)

Common scripts
- `dev` — Next dev server
- `build` — Next build
- `start` — Next start
- `preview` — Build then start
- `lint`, `lint:fix`, `typecheck`
- `format:check`, `format:write`
- `db:*` — Drizzle helpers

## Security

- Keep all secrets in environment variables; never commit them.
- Limit admin access using Clerk org/roles and DB `role` checks.
- Review API handlers for authorization on every mutating action.

## Troubleshooting

- Env validation fails on dev/build: verify keys in `.env` match `src/env.js`.
- DB connection errors: confirm `DATABASE_URL`, that the container/instance is running, and network access is allowed.
- Sentry upload warnings: ensure CI has auth to upload source maps and org/project are correct in `next.config.js`.

## License

Proprietary. All rights reserved unless otherwise specified.
