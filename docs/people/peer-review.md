# Peer Review Process

A lightweight, consistent process to review code and infrastructure changes before merge/deploy.

---

## Scope
- Application code (frontend/backend)
- Infrastructure as Code (Terraform, pipelines)
- Database schema/migrations

## Goals
- Improve quality and correctness
- Share knowledge and reduce single points of failure
- Ensure security, privacy, and reliability best practices

## Checklist for Authors
- PR is small and focused; clear title and description
- Linked issue/ticket and screenshots for UI changes
- Tests added/updated; CI is green
- Security/privacy considerations noted (secrets, PII, authz)
- Rollback plan if risky; migration safety verified

## Checklist for Reviewers
- Correctness: logic, edge cases, error handling
- Security: input validation, authn/z, secret handling
- Reliability: timeouts, retries, idempotency, rate limits
- Observability: logs, metrics, traces
- Performance: complexity, hotspots, N+1, payload sizes
- Documentation: code comments, README/runbooks updated

## Infra Review Addendum
- Changes are least-privileged (IAM/policies)
- Blast radius understood; tags and cost implications noted
- Aligns with standards in `infra/terraform/` and docs

## Process
1. Draft PR with description and checklists.
2. Request at least 1 reviewer (2 for high risk/SEV-1-related code).
3. Reviewer uses checklists; discuss via PR comments.
4. Approve when criteria met; squash merge preferred.
5. Post-merge: ensure deployment success; create follow-ups if needed.

## SLAs
- Normal priority: first review within 1 business day.
- High priority: within 2 working hours during business hours.

## Anti-patterns
- Drive-by approvals without context
- Large, multi-purpose PRs
- Ignoring failing CI or missing tests

## References
- `docs/people/on-call-escalation.md`
- `docs/observability/dashboards.md`
- `docs/deployment/rollback.md`
