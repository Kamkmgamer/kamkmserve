# On-Call Escalation Procedures

A standardized, low-latency escalation flow to ensure incidents are triaged and resolved quickly.

---

## Roles
- Primary On-Call (P1): First responder, 24/7 within rotation window.
- Secondary On-Call (P2): Backup for P1, engaged if P1 is unreachable or overloaded.
- Duty Manager (DM): Executive/operations contact for major incidents (SEV-1).
- Incident Commander (IC): Coordinates response during SEV-1/SEV-2.

## Severity Levels
- SEV-1: Critical outage or data loss. Broad customer impact or security incident.
- SEV-2: Major degradation or limited impact, workarounds exist.
- SEV-3: Minor impact or intermittent issue; normal business hours.
- SEV-4: Low impact, informational; backlog item.

## Escalation Flow
1. Alert fires in monitoring and pages P1 via Pager/Phone/Chat.
2. P1 must acknowledge within:
   - SEV-1: 5 minutes
   - SEV-2: 10 minutes
   - SEV-3+: 30 minutes (business hours)
3. If P1 does not acknowledge within the SLA, auto-escalate to P2.
4. If P2 does not acknowledge within the same SLA, escalate to DM and create an incident bridge.
5. For SEV-1/SEV-2, assign IC immediately (P1 or P2 may assume until relieved).
6. IC coordinates mitigation, comms, and status updates at agreed intervals (e.g., every 15–30 minutes for SEV‑1).

## Communications
- Incident channel: #incidents-<date>-<id>
- Status page/customer comms for SEV-1/SEV-2 via communications lead.
- Stakeholder updates cadence:
  - SEV-1: 15–30 min
  - SEV-2: 30–60 min

## Handoffs
- If nearing end of on-call shift, no handoff during active SEV-1 unless mutually agreed. Otherwise, perform structured handoff with: incident context, mitigations tried, owners, next steps.

## Post-Incident
- Timeline and root cause analysis within:
  - SEV-1: draft within 24h, final within 3 business days
  - SEV-2: final within 5 business days
- Action items with owners and due dates. Track to completion.

## Rotations & Coverage
- Maintain an on-call rotation schedule with at least two overlapping engineers.
- Blackout dates and PTO must be covered by swaps; P1 remains responsible to secure coverage.

## Tooling & Runbooks
- Ensure alerts map to runbooks under `docs/observability/` and `docs/security/`.
- Keep contact methods updated quarterly (phone, email, Slack, PagerDuty/Opsgenie).

## SLAs & SLOs
- Response SLAs as above. Resolution SLOs set per service and severity; report monthly.

## Review
- Quarterly review of escalation efficacy and paging thresholds to reduce noise while preserving coverage.
