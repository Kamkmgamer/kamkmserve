# Penetration Testing and Security Audits

Plan and execute periodic security assessments to uncover vulnerabilities.

## Scope

- Web application (Next.js app routes, API handlers)
- Authentication/authorization flows (Clerk integration, RBAC/ABAC)
- Data inputs (file uploads, forms, query params)
- Infrastructure perimeter (WAF/CDN rules if any)

## Tools & Methods

- Automated: OWASP ZAP, Nuclei, Nikto (safe profiles in staging)
- SAST/dep checks: ESLint security rules, `npm audit`, dependency scanners
- Manual: business logic abuse, IDOR, privilege escalation attempts

## Guidelines

- Test against staging with production-like data anonymized
- Rate-limit scanners to avoid DOS
- Coordinate with on-call; define stop conditions

## Reporting

- Document findings with severity, reproduction steps, and remediation
- Track issues to closure; retest to verify fixes
