# Runbooks

A collection of operational guides for common scenarios.

## Admin role lookup fallback

- Context: Admin access is enforced in `src/middleware.ts`.
- Primary path: role from Clerk session claims (direct/public/private metadata).
- Fallback path: DB lookup via Clerk user id; if missing, try email.
- Cache: short-lived signed cookie when `ROLE_CACHE_SECRET` is set.
- Fail-closed: any errors during role resolution result in 403 and a `logger.security` event.

Checklist for issues:
- Verify the user is signed in (Clerk session present).
- Inspect session claims for `role`.
- Ensure DB row in `kamkmserve_user` has `role` set to `ADMIN` or `SUPERADMIN`.
- If email-based match is expected, ensure the email in claims matches DB.
- Confirm `ROLE_CACHE_SECRET` is configured for cookie caching; clear cookies if debugging.

## Rate limiting

- API routes are rate limited via Upstash Redis when configured, with in-memory fallback.
- Headers emitted: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, and `Retry-After` on 429.
- If rate limiting malfunctions, middleware continues to allow traffic rather than blocking.

## Incident response

- Use Sentry to review security events and performance anomalies.
- Correlate `logger.security` messages with request metadata.
- Consider temporarily tightening WAF/CDN rules if abuse is detected.

## Uploads

- Per-IP quotas guard against abuse; Upstash-backed when configured.
- Optional malware scanning can be integrated at the route handler (not enabled by default).

