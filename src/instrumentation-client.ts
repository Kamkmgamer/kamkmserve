// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Route browser traffic through our tunnel to avoid ad blockers
  tunnel: "/sentry-tunnel",

  // Add optional integrations for additional features
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  tracesSampler: (samplingContext) => {
    const isProd = process.env.NODE_ENV === 'production'
    if (!isProd) return 1.0
    const url = samplingContext.location?.href || samplingContext.request?.url || ''
    if (url.includes('/_next/') || url.includes('/monitoring/health') || url.includes('/sentry-tunnel')) return 0.0
    return 0.1
  },

  // Enable logs in dev only
  enableLogs: process.env.NODE_ENV !== 'production',

  // Replay sampling caps: keep costs controlled in production.
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.0,
  // Always capture replays for sessions with an error.
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;