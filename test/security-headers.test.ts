import { describe, it, expect } from 'vitest'

// Import the Next.js config to inspect headers without starting the server
import nextConfig from '../next.config.js'

type HeaderItem = { key: string; value: string }
type RouteHeaders = { source: string; headers: HeaderItem[] }

describe('Security headers (CSP and related)', () => {
  it('includes CSP and core security headers on all routes', async () => {
    const headersFn = (nextConfig as { headers?: () => Promise<RouteHeaders[]> }).headers
    expect(typeof headersFn).toBe('function')
    if (typeof headersFn !== 'function') return

    const routes: RouteHeaders[] = await headersFn()

    // Find the catch-all route that applies to all paths
    const catchAll = routes.find((r) => r.source === '/:path*')
    expect(catchAll).toBeDefined()

    const headers = new Map(catchAll!.headers.map((h) => [h.key.toLowerCase(), h.value]))

    // Core security headers present
    expect(headers.has('strict-transport-security')).toBe(true)
    expect(headers.has('x-frame-options')).toBe(true)
    expect(headers.has('x-content-type-options')).toBe(true)
    expect(headers.has('referrer-policy')).toBe(true)

    // CSP present and contains key directives
    const csp = headers.get('content-security-policy')
    expect(csp).toBeTruthy()
    const directives = (csp ?? '').split(';').map((s) => s.trim())

    const required = [
      'default-src',
      'base-uri',
      'form-action',
      'script-src',
      'style-src',
      'img-src',
      'font-src',
      'connect-src',
      'frame-ancestors',
    ]

    for (const d of required) {
      expect(directives.some((line) => line.startsWith(d + ' '))).toBe(true)
    }
  })
})
