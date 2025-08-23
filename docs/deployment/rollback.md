# Rollback Strategy

Ensure safe and fast rollback in case of issues after deployment.

## Principles

- Prefer immutable deployments with ability to promote/rollback specific build artifacts.
- Keep database migrations backward-compatible or guarded behind feature flags.
- Practice rollbacks regularly in staging.

## Application Rollback

- Maintain N previous releases; switch traffic via platform controls (e.g., Vercel deployments, canary percentage).
- Use feature flags to disable risky features instantly without redeploys.

## Database Migrations

- Follow expand/contract pattern:
  - Expand: additive changes (new columns/tables, backfill) deployed first.
  - Switch: application writes to new schema while reading both.
  - Contract: remove old paths after verification.
- Always provide down migrations where possible.
- Backups/restores verified for irreversible changes.

## Verification

- Health checks pass post-rollback.
- Error rates and latency return to baseline.
- Run smoke/e2e tests against rolled-back version.

## Runbooks

- Document exact steps for your platform (Vercel/AWS/etc.).
- Include contacts, pager info, and decision points for rollback vs. fix-forward.
