# Runbook: Apply Database Roles and Grants

This runbook explains how to apply the least-privilege roles defined in `docs/security/db-roles.sql`.

## Prerequisites
- Admin access to the target Postgres instance.
- psql or a compatible SQL client.
- Outage window not required; changes are additive and non-breaking.

## Steps
1. Review `docs/security/db-roles.sql` and adjust schema names if different from `public`.
2. Connect to the target database as an admin/superuser:
   ```bash
   psql "$DATABASE_URL"
   ```
3. Apply roles and grants:
   ```sql
   \i docs/security/db-roles.sql
   ```
4. Create application users bound to roles (choose one per service):
   ```sql
   -- Read-only app user (optional for analytics/services without writes)
   CREATE USER app_user_ro WITH LOGIN PASSWORD 'REDACTED';
   GRANT app_readonly TO app_user_ro;

   -- Read-write app user (primary application user)
   CREATE USER app_user_rw WITH LOGIN PASSWORD 'REDACTED';
   GRANT app_readwrite TO app_user_rw;

   -- Migrations user (CI/CD migrations only)
   CREATE USER app_user_mig WITH LOGIN PASSWORD 'REDACTED';
   GRANT app_migrations TO app_user_mig;
   ```
5. Rotate application connection strings:
   - Update `DATABASE_URL` to use `app_user_rw`.
   - Update migration pipeline to use `app_user_mig`.
   - Keep `sslmode=require`.
6. Validate permissions:
   - From app host, attempt reads/writes according to expected access.
   - Ensure migrations run only under the migrations user.

## Ongoing Maintenance
- When adding tables/sequences, default privileges ensure future grants are applied.
- Re-run the `ALTER DEFAULT PRIVILEGES` block if you add new schemas.
- Audit roles quarterly; drop unused users.
