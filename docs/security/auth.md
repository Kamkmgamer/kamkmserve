# Authentication Session & Token Policy

This app uses Clerk for authentication. Configure session and token lifetimes in the Clerk Dashboard.

Recommended settings (production):
- Session max duration: 7 days or less
- Idle timeout: 30–60 minutes
- Refresh token rotation: enabled
- Refresh token reuse detection: enabled (revoke on suspected compromise)
- Require MFA for admin roles

Implementation notes:
- No session/token secrets are hardcoded. All keys are in environment variables (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
- Middleware enforces admin access and fails closed on role ambiguity.
- Consider short-lived JWTs for API calls and rely on Clerk refresh for continuity.
