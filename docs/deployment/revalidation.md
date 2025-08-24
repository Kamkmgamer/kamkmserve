# Per-route revalidation & caching strategy

This document captures a lightweight, actionable caching strategy for KamkmServe. It focuses on Next.js features (ISR, fetch cache, route tags) and operational guidance so developers can apply consistent caching across marketing, product, and admin surfaces.

Principles
- Read-heavy, low-change pages -> long cache / CDN-first (marketing pages).
- Dynamic, user-specific content -> no CDN caching; use short server-side cache or client-side caching.
- Admin and sensitive routes -> never cache publicly; use short-lived server-side caches only when safe.

Suggested per-route policies

- Marketing pages (/, /pricing, /about, /blog/*)
  - Revalidate: 1h (3600s) or use ISR with `revalidate: 3600`.
  - CDN: cache TTL = 1h (can be longer for static pages with manual purge for releases).
  - Sentry/analytics: capture LCP/CLS in Sentry; avoid stale snapshots for A/B tests.

- Product catalog and service pages (`/services`, `/services/[id]`)
  - Revalidate: 5m (300s) for list pages; 15m (900s) for detail pages.
  - Use `tags` on fetch (Next 14+) to selectively invalidate when data changes.
  - Example (server component):

  ```ts
  // fetch with tags
  const res = await fetch(`${API_BASE}/services`, { next: { tags: ['services:list'], revalidate: 300 } })
  ```

- Admin pages and APIs (`/admin/*`, `/api/admin/*`)
  - Never CDN-cache HTML or API responses that contain PII or admin-only data.
  - Use short server-side caches for expensive queries (e.g., 30s-60s) behind auth.
  - Prefer caching at the application level (signed cookies, Clerk claims) rather than CDN.

- Uploads and transactional APIs (`/api/uploads`, `/api/orders`)
  - No caching by default. Use CDN caching only for idempotent GET exports (CSV) with careful headers.

Cache invalidation patterns
- Tag-based invalidation: Use `next` fetch `tags` and call app router revalidate APIs when data changes.
- Webhook-driven purge: Use CDN provider APIs (Vercel, Cloudflare) to purge by path when significant content changes.

Operational notes
- Monitor cache hit ratio via edge logs and Sentry traces. Set alerts for high origin load.
- For releases that touch many static pages, trigger a targeted cache purge or increase revalidation windows for stability.

Examples and helper snippets
- Server component fetch with revalidate and tags:

```tsx
export default async function ServicesPage() {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/services', { next: { revalidate: 300, tags: ['services:list'] } })
  const services = await res.json()
  return <ServicesList services={services} />
}
```

Add this doc as the canonical guidance for small teams working on KamkmServe. It's intentionally brief; teams can expand it into a runbook later.
