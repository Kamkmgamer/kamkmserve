# Backup Strategy

This document defines how we back up data and verify restorability.

## Scope
- Postgres database (primary data store).
- Object storage (if/when used for uploads).
- Configuration/state: Terraform state, environment variables (managed securely outside repo).

## Postgres Backups
- Managed providers (e.g., Neon/RDS/Cloud SQL) should enable automated daily backups with point-in-time recovery (PITR) where available.
- Retain backups for at least 14–30 days depending on compliance needs.
- Encrypt snapshots/backups at rest with provider-managed keys (or KMS where available).

### Verification (Restore Tests)
Perform at least monthly:
1. Provision a temporary database instance (staging).
2. Restore from a chosen snapshot/time.
3. Run schema migrations (if required) and integrity checks.
4. Run a smoke test suite that hits read paths.
5. Destroy the temporary instance after validation.

### Runbook
- Initiate restore via provider console/CLI.
- Switch application `DATABASE_URL` for staging to the restored instance.
- Run `drizzle-kit` migration check to ensure schema aligns with expectations.

## Object Storage Backups (if applicable)
- Enable versioning on the bucket and object-lock if required.
- Cross-region replication for disaster recovery.
- Lifecycle policies to transition older versions to cheaper storage classes.

## Terraform State
- Store remote state in a secure backend (e.g., S3 with encryption + DynamoDB lock table, or Terraform Cloud/Enterprise).
- Enable bucket encryption and versioning; protect access via IAM and MFA delete where possible.

## Schedules & Alerting
- Daily automated backups with retention set per environment (prod > staging > dev).
- Alerts for backup failures and when restore tests are overdue.

## Responsibilities
- SRE/Infra owner: ensure backups enabled, review retention, monitor alerts.
- App owner: provide data criticality changes and recovery point/time objectives (RPO/RTO).

## RPO/RTO Targets
- RPO: <= 15 minutes for production (with PITR where feasible).
- RTO: <= 2 hours for critical services.
