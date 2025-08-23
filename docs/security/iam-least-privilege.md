# Least Privilege IAM

Grant only the minimal permissions required for components to function.

## Principles

- Separate roles per service/function (app server, CI, database migrations, monitoring).
- Deny-by-default; add explicit allows needed for a task.
- Scope permissions to specific resources (ARNs), not wildcards.
- Rotate credentials; prefer short-lived tokens (OIDC, IRSA) over static keys.

## Examples

- CI/CD deploy role: can deploy to hosting provider and write to artifact storage; cannot read production secrets.
- App runtime role: read-only access to necessary secrets and write-only to app logs/metrics.
- Migration job role: temporary elevated DB permissions restricted to the migration window.

## Auditing

- Enable CloudTrail/audit logs for IAM changes.
- Review policies periodically and remove unused permissions.

## Tooling

- Use policy linters (e.g., `cfn-nag`, `terraform-compliance`) and access advisor reports.
