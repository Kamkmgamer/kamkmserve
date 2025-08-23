# Incident Response Runbooks

These runbooks outline steps to investigate, mitigate, and recover from common incidents.

Last updated: 2025-08-23 21:14:03+03:00

## 1. Elevated Error Rate (5xx)
- Identify
  - Check Sentry issues dashboard and `http_request_count` vs errors in `/api/monitoring/metrics`.
  - Review logs around spikes using `logger.error` entries.
- Contain
  - Enable maintenance mode for affected endpoints if needed.
  - Roll back the last deployment if correlated.
- Investigate
  - Inspect recent code changes and feature flags.
  - Trace failing requests via correlation in logs (request method/path, duration).
- Remediate
  - Ship hotfix, add tests, and monitor.
- Recover
  - Verify error rate returns to baseline; close incident with postmortem.

## 2. High Latency / Slow Requests
- Identify
  - Review `http_request_duration` metrics; check average and p95.
  - Inspect `Slow request detected` warnings in logs.
- Contain
  - Temporarily scale up (if applicable) or reduce load.
- Investigate
  - Profile hot endpoints; examine DB logs and `db_operation_duration` metrics.
  - Check external dependency timeouts.
- Remediate
  - Optimize queries, add indexes, cache responses, or increase timeouts safely.
- Recover
  - Monitor latency and error rate for 1–2 hours.

## 3. Database Performance/Errors
- Identify
  - Look at `DB <OP> failed` errors and `db_operation_*` metrics.
- Contain
  - Reduce heavy jobs; pause background tasks.
- Investigate
  - Determine offending tables/operations from logs; inspect locks/index usage.
- Remediate
  - Add/adjust indexes, fix N+1s, batch writes, or rollback schema change.
- Recover
  - Re-run load tests; confirm normal operation.

## 4. Suspicious Upload / Malware Detection
- Identify
  - Upload validation failures with `upload.validation_failed` and AV scan results.
- Contain
  - Block user/session/IP; tighten allowlists.
- Investigate
  - Review audit entries in `audit_log` and associated request metadata.
- Remediate
  - Update AV signatures or integrate external AV; add further content filtering.
- Recover
  - Verify uploads succeed for legitimate files.

## 5. Authentication/Authorization Issues
- Identify
  - Access denied spikes (`accessControl` logs) or auth provider errors.
- Contain
  - Disable affected admin features; communicate to users.
- Investigate
  - Validate Clerk configuration and ABAC policies.
- Remediate
  - Fix misconfigurations or policy evaluations; add tests.
- Recover
  - Confirm normal login/access patterns.

## 6. Graceful Shutdown and Restarts
- When receiving SIGTERM/SIGINT:
  - Our app flushes Sentry (`instrumentation.ts`). Ensure any background workers also flush and close DB connections.
- Rolling restarts:
  - Drain traffic, wait for metrics to stabilize, then restart.

## Playbook Links
- Metrics: `GET /api/monitoring/metrics`
- Logs: Sentry, platform logs, and `logger` outputs
- Audit DB: `kamkmserve_audit_log`

## Communications
- Severity definitions and escalation: keep in your team wiki.
- User comms: prepare status page updates and incident summaries.
