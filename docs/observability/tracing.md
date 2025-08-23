# Distributed Tracing

Capture performance data and trace requests across services.

## Sentry Tracing in Next.js

This project initializes Sentry in `sentry.server.config.ts` and `sentry.client.config.ts` with `tracesSampleRate` set. For production, tune sampling to control volume.

- Server: `sentry.server.config.ts` (`SENTRY_DSN`) — traces server and route handlers.
- Client: `sentry.client.config.ts` (`NEXT_PUBLIC_SENTRY_DSN`) — traces client navigations.

## Sampling Guidance

- Start with 0.1–0.2 in production and increase for targeted paths using `tracesSampler`.
- Use environment tags to segment by `development`/`staging`/`production`.

## Next Steps (Optional)

- Add custom spans around critical operations (DB calls, external API requests).
- Propagate trace headers to backend services to stitch cross-service traces.

## Validation

- Open the Sentry Performance view; verify transactions for key routes and APIs.
