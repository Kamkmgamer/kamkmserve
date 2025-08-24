# Credential Rotation Policy (Database)

This document defines how to rotate Postgres credentials safely and regularly.

## Scope
- Application read/write user (primary `DATABASE_URL`).
- Migrations user (CI/CD).
- Optional read-only user(s).

## Cadence
- Production: rotate every 90 days or immediately after suspected exposure.
- Staging/Dev: rotate every 180 days or with team changes.

## Prerequisites
- Admin access to Postgres.
- Access to deployment secrets (CI/CD, Vercel/hosted env vars).

## Procedure (Zero/Minimal Downtime)
1. Create a new password for the target user (or create a new user to allow overlap):
   ```sql
   -- Option A: rotate password
   ALTER USER app_user_rw WITH PASSWORD 'REDACTED_NEW';

   -- Option B: create new user to overlap rollout
   CREATE USER app_user_rw_v2 WITH LOGIN PASSWORD 'REDACTED_NEW';
   GRANT app_readwrite TO app_user_rw_v2;
   ```
2. Update secrets in all environments:
   - Update `DATABASE_URL` with the new credentials (keep `sslmode=require`).
   - Update CI secrets for migrations user if rotating that user.
3. Deploy application(s) so new connections use the updated secret.
4. Validate:
   - Health checks pass.
   - Admin flows (writes) succeed.
   - Migrations (in CI) succeed if rotated.
5. Revoke old access:
   - If using Option A (same user): nothing else needed.
   - If using Option B: after validation window (e.g., 24–48h), drop the old user:
     ```sql
     REASSIGN OWNED BY app_user_rw TO app_user_rw_v2;
     DROP OWNED BY app_user_rw;
     DROP USER app_user_rw;
     ```

## Emergency Rotation
- Immediately rotate the password or create a replacement user and update secrets.
- Invalidate any exposed connection strings.
- Audit logs for suspicious access.

## Audit & Evidence
- Keep a record of rotation date/time, who executed it, and links to PRs/CI runs.
- Alert if any credential age exceeds the cadence.
