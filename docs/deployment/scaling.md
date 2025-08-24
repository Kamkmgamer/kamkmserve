# Scaling Strategy (Horizontal and Vertical)

This document outlines how to scale the application horizontally and vertically across web, API, and database tiers.

## Overview
- Application: Next.js (App Router), deployed to Vercel.
- API: Route handlers under `src/app/**/route.ts`.
- Database: Postgres (Neon serverless via `@neondatabase/serverless` + Drizzle ORM).
- Observability: Health/readiness endpoints under `src/app/monitoring/*`.

## Principles
- Stateless app servers. Store no session state on instance. Use external storage/services.
- Scale reads via CDN, ISR, and server response caching. Writes invalidate caches.
- Prefer idempotent APIs and small blast radius releases (canary/blue-green).

## Horizontal Scaling
- Vercel automatically scales the app based on concurrent invocations.
- Ensure handlers are pure and side-effect free except for database/queue calls.
- Caching layers:
  - CDN: Long-lived immutable assets configured in `next.config.js` for `/_next/static/*` and `/_next/image`.
  - App cache: `unstable_cache` used in `src/server/services.ts` with `revalidate = 300`.
  - API cache: short-lived in-memory TTL cache in `src/server/cache.ts` with invalidation on POST in `src/app/api/admin/services/route.ts`.
- Health probes: `src/app/monitoring/health`, `ready`, and `metrics` endpoints support traffic shifting under load.

## Vertical Scaling
- App tier: Scaling up is managed by Vercel plan/limits (memory/CPU per region). Keep functions small, reduce cold start by pruning dependencies.
- Database tier: Use Neon serverless autoscaling. If using a dedicated instance, tune vCPU/RAM and enable connection pooling (PgBouncer-compatible pools) to handle bursts.

## Database Connection Pooling
- Neon serverless provides HTTP-based pooling. Keep connection counts low; reuse clients and avoid opening connections per request.
- Drizzle is configured in `~/server/db`. Ensure a singleton connection is used.

## Caching & Invalidation
- Static assets: immutable, cache-busted by build hash.
- ISR/Server cache: set `revalidate` windows based on business freshness (e.g., 5 minutes for services list).
- API cache: small TTL (e.g., 60s) and clear cache on mutations (see `memoryCache.clear()` in admin services POST).
- For multi-instance setups, prefer Redis for shared cache instead of in-memory. Upstash Redis is recommended on Vercel.

## Regions and Latency
- Prefer deploying close to users. Vercel regions can be configured per project. Co-locate DB and app where possible.
- Use `next.config.js` headers to leverage CDN and reduce TTFB for static assets.

## Auto-Scaling Policies (Guidance)
- Target P95 latency SLOs (web < 300ms TTFB, API < 200ms application time for common paths).
- Alert when error rate > 1% or latency P95 degrades by >50% over baseline.
- Scale read paths via caching; scale write throughput via DB plan upgrades and queues.

## Background Jobs / Queues
- For long-running tasks or spikes, offload to a queue (e.g., Vercel Cron + SQS/Upstash Q/Stadia). Ensure idempotency.

## Readiness & Drains
- The app already exposes readiness endpoints under `src/app/monitoring/ready`. Ensure traffic only reaches ready instances.
- Implement graceful shutdown hooks for DB and any persistent connections (Node handles HTTP gracefully on Vercel).

## IaC and Environments
- Manage infra via Terraform under `infra/terraform/`.
- Maintain parity between staging and production; use the same scaling policies and feature flags.

## Next Steps
- If traffic grows, adopt Redis:
  - Provide `REDIS_URL` and switch `src/server/cache.ts` to a Redis-backed implementation.
  - Add tag-based revalidation endpoints to invalidate server cache across regions.
- Consider per-route region selection and edge runtimes for latency-sensitive pages.
