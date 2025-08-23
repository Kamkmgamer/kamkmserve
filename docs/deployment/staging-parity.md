# Staging Parity Checklist

Ensure staging mirrors production to catch issues pre-release.

## Parity Dimensions

- Environment variables: same keys; safe placeholder values where needed.
- Feature flags: identical defaults unless explicitly testing a flag rollout.
- Database: identical schema and migration history; anonymized data if needed.
- Services: same external integrations (sandbox endpoints as applicable).
- Build/runtime: same Node/Next versions, dependencies, and Docker base images.
- Config drift: periodic checks with IaC plans and diff tools.

## Verification Steps

1. `terraform plan` in staging should show no unexpected drift.
2. `npm run build` produces identical artifacts between staging and prod environments (modulo environment-embedded values).
3. Run smoke tests and golden-path e2e on staging before promotion.

## Promotion

- Prefer promoting a tested staging build to production (immutable artifact) over rebuilding.
