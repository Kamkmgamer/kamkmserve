# 🛡️ Production Hardening Checklist

A comprehensive checklist to ensure your application is production-ready, secure, and resilient.

---

## Security

- [x] Enforce HTTPS everywhere (redirect HTTP → HTTPS).
- [x] Enable HSTS (HTTP Strict Transport Security).
- [x] Configure TLS with strong ciphers only.
- [x] Rotate and secure secrets, API keys, and credentials.
- [x] Store secrets in environment variables or secret managers (not in code).
- [x] Ensure JWT/session tokens have short expiration times and refresh tokens are secure.
- [x] Sanitize and validate all user input (prevent SQLi, XSS, etc.).
- [x] Apply security headers:
  - [x] `Content-Security-Policy`
  - [x] `X-Frame-Options`
  - [x] `X-Content-Type-Options`
  - [x] `Referrer-Policy`
  - [x] `Strict-Transport-Security`
- [x] Limit file upload types, validate size, and scan for malware.
  - [x] Integrate `validateUpload()` from `src/lib/uploads.ts` in any upload endpoints
  - [x] Enforce size limits per route (default 10MB)
  - [x] Restrict to allowlisted MIME/ext (images, optional PDF)
  - [x] Add optional AV scan hook before persistence
  - [x] Add unit tests for allowed/blocked files
  - [x] Document endpoints to use `docs/security/uploads.md` guidance
- [x] Disable directory listing and unnecessary server signatures.
- [x] Verify access controls (RBAC).
- [x] Verify access controls (ABAC).
  - [x] Define attributes (resource owner, org, plan, feature flags)
  - [x] Implement a small `can(user, action, resource)` policy helper
  - [x] Apply ABAC checks to sensitive routes (orders, payouts)
  - [x] Add tests for representative policies
  - [x] Add `docs/security/abac.md` with examples
- [x] Run automated dependency vulnerability scans.

---

## Infrastructure & Configuration

- [x] Use Infrastructure as Code (IaC) for reproducibility.
- [x] Restrict inbound/outbound network access with firewall/security groups.
- [x] Lock down SSH: 
  - [x] Disable root login
  - [x] Use SSH keys, not passwords
- [x] Disable unused ports and services.
- [x] Configure automatic security updates for OS packages.
- [x] Set file permissions and ownership correctly.
- [x] Run services under non-root users.
- [x] Ensure container images are minimal and scanned for vulnerabilities.
- [x] Configure environment variables securely.
- [x] Apply least privilege principle to IAM roles and services.

---

## Observability

- [x] Centralized logging (structured JSON logs preferred).
- [x] Collect application metrics (CPU, memory, request latency, errors).
- [x] Set up health checks (liveness/readiness probes).
- [x] Implement alerting for anomalies and downtime.
- [x] Enable distributed tracing if applicable.
- [x] Audit logs enabled and stored securely.

---

## Testing & Validation

- [x] Run full integration and e2e tests before deployment.
- [x] Validate staging is identical to production.
- [x] Perform load testing and stress testing.
- [x] Perform penetration testing or security audits.
- [x] Ensure rollback strategy is tested and documented.

---

## Deployment & Availability

- [x] Use blue-green or canary deployments when possible.
- [x] Automate deployments with CI/CD pipelines.
- [x] Database migrations are safe and tested.
- [x] Apply rate limiting and request throttling.
- [x] Use CDN for static assets.
- [x] Enable caching layers (Redis, CDN, etc.).
- [x] Configure graceful shutdown for services.
- [x] Ensure horizontal/vertical scaling strategy is in place.

---

## Data & Storage

- [x] Encrypt data at rest (databases, volumes, backups).
- [x] Encrypt data in transit (TLS everywhere).
- [ ] Set database access controls and roles.
- [ ] Rotate database credentials regularly.
- [x] Enable database query logging (sanitized).
- [ ] Backup strategy tested and verified.
- [ ] Retention policies applied to logs and backups.

---

## People & Processes

- [x] Document runbooks for incident response.
- [ ] Define on-call escalation procedures.
- [ ] Ensure monitoring dashboards are up to date.
- [ ] Review code and infrastructure changes via peer review.
- [ ] Regularly train team on security and operations best practices.
- [ ] Apply principle of least privilege to all accounts.
- [ ] Enforce 2FA for all critical systems.

---

 Use this checklist before every production release to minimize risks and maximize reliability.
