# Secrets Management

This project uses environment variables and external secret managers for all sensitive values.

## Principles
- Rotate secrets regularly (quarterly or on incident) and after personnel changes.
- Never commit secrets to git. Prefer `.env` locally and a secret manager in cloud.
- Scope credentials with least privilege and separate dev/stage/prod.
- Monitor usage and revoke unused credentials.

## Where to store secrets
- Local/dev: `.env` (not committed). See `.env.example` for keys.
- CI/CD: Store secrets in the platform’s encrypted secret store (e.g., GitHub Actions secrets).
- Cloud/runtime: Use the provider’s secret manager (e.g., Vercel env vars, AWS Secrets Manager, GCP Secret Manager, 1Password).

## Secrets used by this app
- Database: `DATABASE_URL` (and optional `DATABASE_URL_UNPOOLED`)
- Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- Sentry: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` (CI only)
- Optional admin basic auth: `ADMIN_BASIC_USER`, `ADMIN_BASIC_PASS`

See `src/env.js` for validation schema. Do not add secrets directly to code—add them to the schema and read via `process.env`.

## Rotation playbook
1. Create new secret in the secret manager (do not overwrite the old yet).
2. Update the environment configuration (CI/CD, hosting) with the new secret.
3. Redeploy application.
4. Verify functionality.
5. Revoke the old secret and document the rotation in the runbook.

## Detection & prevention
- Enable repository secret scanning in your VCS (e.g., GitHub secret scanning).
- Consider adding a pre-commit hook or CI job to run a secret scanner (e.g., `gitleaks`).
- Review logs and Sentry breadcrumbs for accidental secret leakage.
