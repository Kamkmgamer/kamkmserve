# Monitoring Dashboards

A reference for our monitoring dashboards to ensure visibility into system health and performance.

---

## Tools
- Grafana (primary)
- Provider-native dashboards (e.g., Vercel / Cloud provider)
- Sentry (Application errors & performance)

## Core Dashboards
1. Service Overview
   - Requests per second, error rate (4xx/5xx), p50/p95/p99 latency
   - Uptime (availability) and active incidents
2. API Performance
   - Route-level throughput and latency
   - Top slow endpoints and error hotspots
3. Infrastructure
   - CPU, memory, disk, network I/O per service/node
   - Container restarts, OOM kills
4. Database
   - Connections, locks, slow queries, cache hit rate
   - Replication lag (if applicable)
5. Frontend Web Vitals
   - LCP, FID/INP, CLS
   - Next.js route transitions and hydration timing
6. Errors & Traces
   - Sentry issues by frequency & impact
   - Trace waterfall for slow transactions

## Ownership & Review
- Each dashboard must list an owner/team and on-call contact.
- Review monthly for relevance, accuracy, and missing panels.

## Data Sources & Tags
- Standard labels: service, env (prod/stg), version, region.
- Break down by env/stage using templating variables.

## Alerts Coupling
- Each critical panel should have an alert with defined thresholds.
- Link corresponding runbooks in panel descriptions.

## Action Items Checklist
- Verify all services and critical routes are represented.
- Ensure time ranges/templating work across prod and staging.
- Confirm SLO panels are present with current targets.
- Add links to runbooks:
  - `docs/observability/alerting.md`
  - `docs/observability/tracing.md`
  - `docs/people/on-call-escalation.md`

## Change Management
- Store dashboard JSON in IaC or export snapshots quarterly.
- Record significant dashboard changes in CHANGELOG or runbook updates.
