import { describe, it, expect } from 'vitest'

/**
 * This test validates that the Content-Security-Policy header in next.config.js
 * matches the expected directives. If next.config.js is changed, update the
 * expectedCsp string below consciously to avoid accidental drift.
 */
describe('Security headers - Content-Security-Policy', () => {
  it('matches the expected CSP directives', async () => {
    // Prevent env validation from failing during test import
    process.env.SKIP_ENV_VALIDATION = 'true'
    // Dynamically import after setting the flag
    const nextConfig = await import('../next.config.js')
    // nextConfig is the result of withSentryConfig(coreConfig, ...)
    const headersFn = (nextConfig as any).default.headers as () => Promise<any[]>
    expect(typeof headersFn).toBe('function')

    const headersArr = await headersFn()
    const allRoute = headersArr.find(h => h.source === '/:path*')
    expect(allRoute).toBeTruthy()

    const cspHeader = allRoute.headers.find((h: { key: string; value: string }) => h.key === 'Content-Security-Policy')
    expect(cspHeader).toBeTruthy()

    const expectedCsp = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      // Allow Next/React hydration and common patterns; tighten for prod as needed.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss:",
      "frame-ancestors 'self'",
    ].join('; ')

    expect(cspHeader.value).toBe(expectedCsp)
  }, 20000)
})
