import * as Sentry from "@sentry/nextjs";

// Next.js 15: Client instrumentation entrypoint for Sentry.
// See: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
// and https://docs.sentry.io/platforms/javascript/guides/nextjs/
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Capture Web Vitals (LCP/CLS/etc.) and navigation/interaction spans.
  integrations: [Sentry.browserTracingIntegration()],
  // TODO: tune this in production or use tracesSampler.
  tracesSampleRate: 1.0,
});
