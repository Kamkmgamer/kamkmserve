# Security & Operations Training Plan

A recurring program to keep the team current on security, reliability, and operational best practices.

---

## Objectives
- Reduce incident frequency and impact
- Maintain a security-first culture
- Ensure readiness for on-call and incident response

## Cadence
- Monthly 60–90 minute session
- Quarterly deep-dive workshop or tabletop exercise

## Core Topics (Rotating)
- Secure coding basics: input validation, authn/z, secrets
- OWASP Top 10 refresher with app examples
- Data protection: PII handling, encryption, backups & retention
- Operational excellence: SLOs, error budgets, rollbacks
- Observability: effective logs/metrics/traces and dashboards
- Incident response: roles, comms, and postmortems
- Cloud/IaC security: least privilege, network boundaries

## Exercises
- Tabletop: SEV-1 outage or security incident simulation
- Hands-on: add missing logs/metrics to a service
- Attack-and-defend: identify and fix an injected vulnerability

## Requirements
- Keep runbooks current: `docs/people/on-call-escalation.md`
- Review and use dashboards: `docs/observability/dashboards.md`
- Apply peer review: `docs/people/peer-review.md`

## Tracking & Accountability
- Attendance recorded; materials stored in internal wiki/repo
- Action items with owners; follow-up within 2 weeks
- Annual security training compliance for all team members

## Resources
- `docs/security/abac.md`
- `docs/security/uploads.md`
- `docs/deployment/rollback.md`
