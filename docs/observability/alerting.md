# Alerting for Anomalies and Downtime

Set up alerting to detect errors, latency spikes, and outages.

## Application Alerts (Sentry)

- Define alert rules in Sentry:
  - Error spikes (e.g., issue frequency, new issues)
  - Performance regressions (e.g., p95 latency, throughput anomalies)
  - Release health (crash-free users/sessions)
- Delivery channels: Slack, Email, PagerDuty, Opsgenie.
- Tag events with environment (`NODE_ENV`) and release to scope alerts.

## Uptime/Availability

- External monitors (e.g., UptimeRobot, Better Stack, Pingdom) pointing to public health endpoint.
- Recommended health endpoint: `/api/health` or App Router equivalent.
- Configure alert thresholds and escalation (multiple failures -> page).

## On-call & Escalation

- Define on-call rotation and escalation paths.
- Suppress alerts during maintenance windows with announcements or monitor pause.

## Runbooks

- Link Sentry issues and uptime monitors to runbooks in `docs/` for rapid response.
