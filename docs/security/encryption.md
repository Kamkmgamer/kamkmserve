# Encryption Strategy

This document outlines encryption practices for data in transit and at rest.

## Data in Transit
- All app traffic is served over HTTPS. HSTS and TLS settings are enforced via `next.config.js` headers `Strict-Transport-Security` and security headers.
- Database connections must use TLS by default:
  - See `.env.example` where `DATABASE_URL` includes `?sslmode=require`.
  - For Neon/Vercel Postgres, prefer the SSL-enabled connection string.

## Data at Rest
- Application code does not store secrets in the repository. Secrets are provided via environment variables or secret managers.
- Database encryption at rest:
  - On managed Postgres (e.g., Neon, RDS, Cloud SQL), enable storage-level encryption for the cluster/volumes and automated backups.
  - Verify KMS-backed encryption for database storage and snapshots where applicable.
- Object storage (if used for uploads): enable server-side encryption (SSE) and bucket policies to enforce TLS.

## Key Management
- Rotate credentials regularly and on role changes or incidents.
- Prefer managed KMS for key storage and rotation.

## Validation
- Add checks in CI to verify `DATABASE_URL` contains `sslmode=require` (for self-managed DBs) or that provider guarantees TLS.
- Pen tests should validate TLS ciphers and protocol versions.
