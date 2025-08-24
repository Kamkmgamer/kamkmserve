# Two-Factor Authentication (2FA)

Requirements and rollout plan to enforce 2FA across critical systems.

---

## Scope
- Source control (e.g., GitHub/GitLab)
- CI/CD provider
- Cloud provider & admin consoles
- Secret manager and database admin tools

## Methods
- Preferred: TOTP (authenticator app)
- Allowed: WebAuthn (FIDO2 keys)
- Avoid: SMS (fallback only where no alternatives exist)

## Enforcement
- Require 2FA for all org members and external collaborators
- Enforce at org/policy level where supported
- Block access for non-compliant accounts after grace period

## Rollout Plan
1. Announce policy with instructions and deadline (2 weeks)
2. Provide setup guides and backup code guidance
3. Enable org-wide enforcement and monitor adoption
4. Disable exceptions after grace period

## Recovery
- Break-glass accounts stored in secure vault with hardware key
- Document recovery flow and approvals

## Verification
- Quarterly audit of 2FA compliance
- Automated checks where APIs allow

## References
- `docs/people/peer-review.md`
- `docs/security/least-privilege.md`
