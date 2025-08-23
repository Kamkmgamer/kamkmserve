# Container Image Hardening and Vulnerability Scanning

Build smaller, safer images and continuously scan for vulnerabilities.

## Recommendations

- Use minimal base images (e.g., `gcr.io/distroless/nodejs`, `alpine`, or `ubi9-minimal`).
- Multi-stage builds: compile/deps in builder stage; copy only runtime artifacts to final stage.
- Pin versions and verify checksums for downloaded assets.
- Run as non-root (`USER` directive) and drop capabilities.
- Read-only root filesystem where possible; mount only necessary write paths.
- Avoid shell and package managers in final image.

## Example (Node/Next.js, multi-stage)

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm fetch

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm install --offline && pnpm build

FROM gcr.io/distroless/nodejs22-debian12 AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
USER 10001:10001
EXPOSE 3000
CMD ["/nodejs/bin/node","./.next/standalone/server.js"]
```

Adjust to your deployment target (e.g., `next start` vs. standalone output).

## Scanning Tools

- CI scanners: Trivy, Grype, Snyk.
- Registry scans: Enable native vulnerability scanning where supported.

## Policies

- Fail builds on High/Critical findings or with exceptions reviewed and documented.
