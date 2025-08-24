# Data and Log Retention Policies

This document defines retention for databases, logs, and backups.

## Database
- Production: retain PITR window 7–30 days, snapshots 30–90 days based on compliance.
- Staging/Dev: minimal retention (7–14 days) to control costs.
- Apply GDPR/PII minimization: purge obsolete personal data per product policy.

## Backups
- Encrypted backups retained per environment (Prod: 30–90d, Staging: 14–30d, Dev: 7–14d).
- Quarterly review of backup retention to align with regulatory needs.

## Logs and Metrics
- Application logs: retain 14–30 days online, then archive 3–6 months if needed.
- Metrics and traces: retain 14–30 days depending on cost/perf needs.
- Configure provider retention (e.g., Sentry, Vercel, CloudWatch) to these windows.

## Object Storage (if used)
- Enable bucket lifecycle rules:
  - Transition to infrequent access after 30–60 days.
  - Expire object versions after 90–180 days unless legal hold exists.

## Implementation Notes
- Track all retention in IaC (e.g., Terraform for buckets/log sinks).
- Document exceptions and legal holds.
- Review retention annually and after major product changes.
