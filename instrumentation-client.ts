import * as Sentry from "@sentry/nextjs";

// Next.js 15: Client instrumentation entrypoint for Sentry.
// See: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
// and https://docs.sentry.io/platforms/javascript/guides/nextjs/
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Route browser traffic through our tunnel to avoid ad blockers
  tunnel: "/sentry-tunnel",
  // Capture Web Vitals (LCP/CLS/etc.) and navigation/interaction spans.
  integrations: [
    Sentry.browserTracingIntegration(),
    // Optional: Session Replay for client issues. Sampling is capped below.
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: true,
    }),
  ],
  // Sample 100% in non-prod; in prod, default to 0.1 and drop known noisy paths.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  tracesSampler: (samplingContext) => {
    const isProd = process.env.NODE_ENV === 'production'
    if (!isProd) return 1.0
    const url = samplingContext.location?.href || samplingContext.request?.url || ''
    // Drop static assets, health checks, and tunnel to avoid noise/cost.
    if (url.includes('/_next/') || url.includes('/monitoring/health') || url.includes('/sentry-tunnel')) return 0.0
    return 0.1
  },
  // Replay sampling caps: keep costs controlled in production.
  // Record 0% of all sessions by default in dev, and 0.01 (1%) in prod.
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.0,
  // Always capture replays for sessions with an error.
  replaysOnErrorSampleRate: 1.0,
  // Enable logs in dev only
  enableLogs: process.env.NODE_ENV !== 'production',
});
