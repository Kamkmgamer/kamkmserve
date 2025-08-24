# Deployment Safety Checklist

Use this checklist before promoting to production.

- [ ] Feature flags toggled to safe defaults
- [ ] Database migrations applied (and backward-compatible)
- [ ] Env vars present (see `.env.example`)
- [ ] Rate limiting configured (Upstash) or acceptable fallback
- [ ] Admin auth bypass disabled in production (middleware guards)
- [ ] Sentry DSN configured, tunnel route reachable
- [ ] Cache headers verified for marketing routes
- [ ] ISR/revalidation configured per route (see `docs/deployment/revalidation.md`)
- [ ] Rollback plan prepared (see `docs/deployment/rollback.md`)
- [ ] Observability dashboards/alerts updated (LCP/CLS charts, error rate)
- [ ] Runbooks updated (see `docs/operations/runbooks.md`)
