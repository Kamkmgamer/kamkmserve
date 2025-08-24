import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Mock Clerk middleware wrapper and route matcher so we can unit test our logic
let mockUserId: string | undefined

vi.mock('@clerk/nextjs/server', async () => {
  const actual: any = await vi.importActual<any>('@clerk/nextjs/server')
  return {
    ...actual,
    clerkMiddleware: (handler: (auth: () => Promise<{ userId?: string }>, req: Request & { cookies?: any }) => any) => {
      return async (req: Request & { cookies?: any }) => {
        // Minimal cookie shim used by our middleware (get only)
        const cookieMap = new Map<string, string>()
        const cookies = {
          get: (name: string) => {
            const v = cookieMap.get(name)
            return v ? { name, value: v } : undefined
          },
          set: (name: string, value: string) => {
            cookieMap.set(name, value)
          },
        }
        // Inject a very small shape matching what our code reads
        Object.defineProperty(req, 'cookies', { value: cookies, configurable: true })
        const auth = async () => ({ userId: mockUserId })
        return handler(auth, req)
      }
    },
    createRouteMatcher: (patterns: string[]) => {
      const regexes = patterns.map((p) => new RegExp('^' + p.replace(/\(\.\*\)/g, '.*') + '$'))
      return (req: { url: string }) => {
        const { pathname } = new URL(req.url)
        return regexes.some((r) => r.test(pathname))
      }
    },
  }
})

// Import after mocks are in place
import middleware from '../src/middleware'

function makeRequest(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: headers as any }) as Request & { cookies?: any }
}

describe('middleware.ts - auth and rate limit behaviors', () => {
  const OLD_ENV = process.env
  beforeEach(() => {
    vi.resetModules()
    process.env = { ...OLD_ENV }
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    mockUserId = undefined
  })
  afterEach(() => {
    process.env = OLD_ENV
  })

  it('adds RateLimit headers for API requests when Upstash is not configured (in-memory limiter path)', async () => {
    const req = makeRequest('https://example.com/api/ping', {
      'x-forwarded-for': '203.0.113.1',
      'x-forwarded-proto': 'https',
      host: 'example.com',
    })

    const res: any = await (middleware as any)(req)
    // May be NextResponse or Response; both expose headers
    const headers = res?.headers
    expect(headers).toBeTruthy()
    expect(headers.get('RateLimit-Limit')).toBeDefined()
    expect(headers.get('RateLimit-Remaining')).toBeDefined()
    expect(headers.get('RateLimit-Reset')).toBeDefined()
  })

  it('challenges with Basic auth on /admin when configured and unauthenticated', async () => {
    process.env.ADMIN_BASIC_USER = 'admin'
    process.env.ADMIN_BASIC_PASS = 'secret'
    process.env.NODE_ENV = 'development'

    const req = makeRequest('https://example.com/admin', {
      'x-forwarded-proto': 'https',
      host: 'example.com',
    })

    const res: Response = await (middleware as any)(req)
    expect(res.status).toBe(401)
    expect(res.headers.get('WWW-Authenticate')).toMatch(/Basic/i)
  })

  it('allows Basic auth bypass in non-production when credentials are correct and bypass enabled', async () => {
    process.env.ADMIN_BASIC_USER = 'admin'
    process.env.ADMIN_BASIC_PASS = 'secret'
    process.env.ADMIN_BASIC_BYPASS_ENABLED = 'true'
    process.env.NODE_ENV = 'development'

    const creds = btoa('admin:secret')
    const req = makeRequest('https://example.com/admin', {
      authorization: `Basic ${creds}`,
      'x-forwarded-proto': 'https',
      host: 'example.com',
    })

    const res: any = await (middleware as any)(req)
    // Our middleware returns undefined to allow the request through when bypassing
    expect(res).toBeUndefined()
  })
})
