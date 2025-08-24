# Principle of Least Privilege (PoLP)

Guidelines to ensure all identities, services, and components have only the minimum permissions required.

---

## Core Principles
- Default deny: start with no access and add narrowly scoped permissions as needed.
- Separation of duties: split sensitive capabilities across roles.
- Just-in-time (JIT) access: grant temporary elevated access with approval.
- Auditability: log all access grants and usage; review regularly.

## Identities & Access
- Human accounts: no standing admin. Use break-glass with MFA and approvals.
- Service accounts: scoped to a single app/service with narrow policies.
- Rotate credentials automatically; prefer short-lived tokens.

## IAM Policy Design
- Use resource-level permissions and condition keys where available.
- Avoid wildcards in actions/resources; enumerate required operations.
- Use tags and environment constraints (e.g., prod vs stg) in policies.

## Database & Storage
- App roles: read/write only to app-owned schemas/tables/buckets.
- Admin/maintenance roles separate from runtime app roles.
- Enforce row/column-level security if supported.

## Network Boundaries
- Restrict ingress/egress by security groups/firewall rules.
- Deny public access unless explicitly required.

## CI/CD & Secrets
- CI runners have minimal cloud permissions required for deploy.
- Secrets injected per-environment via secret manager; no repo secrets.

## Reviews & Audits
- Quarterly access review with removals for unused permissions.
- Track changes via IaC in `infra/terraform/` and peer review.

## Runbooks & References
- `docs/people/peer-review.md`
- `docs/people/on-call-escalation.md`
- `docs/observability/dashboards.md`
