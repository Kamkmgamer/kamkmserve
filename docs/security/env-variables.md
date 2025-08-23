# Secure Environment Variable Configuration

Treat environment variables as secrets. Validate at build time and avoid committing real values.

## Principles

- Do not commit real secrets. Only `.env.example` belongs in git.
- Use deployment-time secret managers or environment configuration (Vercel/Netlify/AWS SSM/Secrets Manager).
- Validate env via schema (`src/env.js`) and prefer optional vars to be explicitly marked.
- Avoid exposing server-only secrets to the client; only `NEXT_PUBLIC_*` variables are sent to the browser.

## Next.js + @t3-oss/env-nextjs

- Server variables: `server` schema in `src/env.js`.
- Client variables: `client` schema in `src/env.js` and must start with `NEXT_PUBLIC_`.
- Skip validation for Docker builds only via `SKIP_ENV_VALIDATION=1` in CI as needed.

## Operational Guidance

- Use separate envs per stage: development, staging, production.
- Rotate secrets periodically and on suspicion of compromise.
- Restrict read access to envs in CI/CD and runtime to the minimal set of roles.

## Example (Vercel)

- Configure Environment Variables in Vercel Project Settings per environment.
- Use `vercel env pull` for local development when appropriate; never commit the pulled file.
