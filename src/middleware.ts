import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { logger } from '~/lib/logger'
import { NextResponse } from 'next/server'
// --- Admin role cache helpers (signed cookie) ---
const ROLE_COOKIE_NAME = 'kamkmserve.admin_role'
const ROLE_CACHE_TTL_SEC = Number.parseInt(process.env.ROLE_CACHE_TTL_SEC ?? '300') // default 5 min

// Base64url helpers compatible with Edge runtime (no Buffer)
const b64u = {
  enc(buf: ArrayBuffer): string {
    const bytes = new Uint8Array(buf)
    let bin = ''
    for (const b of bytes) bin += String.fromCharCode(b)
    const b64 = btoa(bin)
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  },
  encStr(str: string): string {
    const bytes = new TextEncoder().encode(str)
    let bin = ''
    for (const b of bytes) bin += String.fromCharCode(b)
    const b64 = btoa(bin)
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  },
  decStr(b64url: string): string {
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return new TextDecoder().decode(bytes)
  },
}

async function hmacSign(input: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(input))
  return b64u.enc(sig)
}

async function verifyAndParseRoleCookie(cookieVal: string | undefined, secret: string): Promise<{ role: string; exp: number } | undefined> {
  if (!cookieVal) return undefined
  const parts = cookieVal.split('.')
  if (parts.length !== 2) return undefined
  const payloadB64 = parts[0]!
  const sig = parts[1]!
  const expectedSig = await hmacSign(payloadB64, secret)
  if (sig !== expectedSig) return undefined
  try {
    const json = b64u.decStr(payloadB64)
    const data = JSON.parse(json) as { role?: unknown; exp?: unknown }
    const role = typeof data.role === 'string' ? data.role : undefined
    const exp = typeof data.exp === 'number' ? data.exp : undefined
    if (!role || !exp) return undefined
    if (Date.now() > exp) return undefined
    return { role, exp }
  } catch {
    return undefined
  }
}

async function createRoleCookie(role: string, secret: string): Promise<string> {
  const payload = { role, exp: Date.now() + ROLE_CACHE_TTL_SEC * 1000 }
  const payloadB64 = b64u.encStr(JSON.stringify(payload))
  const sig = await hmacSign(payloadB64, secret)
  return `${payloadB64}.${sig}`
}
// Types for Upstash limiter result to avoid any
type UpstashLimitResult = { success: boolean; limit: number; remaining: number; reset: number }
type UpstashLimiter = { limit: (key: string) => Promise<UpstashLimitResult> }

// Matchers for admin routes (pages and APIs)
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  const a = await auth()

  // Enforce HTTPS in production (skip localhost and when already https)
  try {
    const host = req.headers.get('host') ?? ''
    const proto = req.headers.get('x-forwarded-proto') ?? ''
    const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.endsWith('.local')
    if (process.env.NODE_ENV === 'production' && !isLocalhost && proto !== 'https') {
      const url = new URL(req.url)
      url.protocol = 'https:'
      return Response.redirect(url, 301)
    }
  } catch {
    // If redirect logic fails, continue request handling
  }

  // Rate limiting for API routes with Upstash Redis; fallback to in-memory map if not configured
  try {
    const { pathname } = new URL(req.url)
    if (pathname.startsWith('/api')) {
      const xff = req.headers.get('x-forwarded-for')
      const xri = req.headers.get('x-real-ip')
      const ip = (xff?.split(',')[0]?.trim() ?? xri ?? 'unknown')
      const WINDOW_MS = 60_000 // 1 minute window
      const MAX_REQS = 100 // per IP per window

      const hasUpstash = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

      if (hasUpstash) {
        // Use Upstash Redis-backed limiter
        const g = globalThis as typeof globalThis & { __upstashLimiter?: UpstashLimiter }
        let limiter = g.__upstashLimiter
        if (!limiter) {
          // Lazy init to avoid edge cold start overhead on non-API requests
          // Dynamic imports are edge-compatible
          const { Ratelimit } = await import('@upstash/ratelimit')
          const { Redis } = await import('@upstash/redis')
          const redis = Redis.fromEnv()
          const rl = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(MAX_REQS, '1 m'),
            analytics: true,
            prefix: 'rl:api',
          })
          // Store a minimal, typed wrapper to avoid reliance on library types
          g.__upstashLimiter = { limit: (key: string) => rl.limit(key) }
          limiter = g.__upstashLimiter
        }
        // Narrow: ensure limiter is defined before use (helps TS control flow)
        if (!limiter) {
          // Should not happen, but gracefully continue
          return NextResponse.next()
        }
        const res = await limiter.limit(`ip:${ip}`)

        const headers = new Headers()
        headers.set('RateLimit-Limit', String(res.limit))
        headers.set('RateLimit-Remaining', String(Math.max(res.remaining, 0)))
        headers.set('RateLimit-Reset', String(Math.ceil(res.reset / 1000)))

        if (!res.success) {
          const retryAfter = Math.max(Math.ceil((res.reset - Date.now()) / 1000), 1)
          headers.set('Retry-After', String(retryAfter))
          return new Response('Too Many Requests', { status: 429, headers })
        }

        // Propagate headers to downstream response
        const next = NextResponse.next()
        headers.forEach((v, k) => next.headers.set(k, v))
        return next
      } else {
        // Fallback to in-memory limiter (best-effort)
        type RateRecord = { count: number; resetAt: number }
        type RateStore = Map<string, RateRecord>
        const g = globalThis as typeof globalThis & { __rateLimitStore?: RateStore }
        const getStore = (): RateStore => {
          g.__rateLimitStore ??= new Map<string, RateRecord>()
          return g.__rateLimitStore
        }
        const store = getStore()
        const now = Date.now()
        const rec = store.get(ip)
        if (!rec || now > rec.resetAt) {
          store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
        } else {
          const updated: RateRecord = { count: rec.count + 1, resetAt: rec.resetAt }
          store.set(ip, updated)
          if (updated.count > MAX_REQS) {
            const retryAfter = Math.ceil((updated.resetAt - now) / 1000)
            const headers = new Headers({
              'Retry-After': String(Math.max(retryAfter, 1)),
              'RateLimit-Limit': String(MAX_REQS),
              'RateLimit-Remaining': '0',
              'RateLimit-Reset': String(Math.floor(updated.resetAt / 1000)),
            })
            return new Response('Too Many Requests', { status: 429, headers })
          }
        }
        const rec2 = store.get(ip)!
        const remaining = Math.max(MAX_REQS - rec2.count, 0)
        const headers = new Headers({
          'RateLimit-Limit': String(MAX_REQS),
          'RateLimit-Remaining': String(remaining),
          'RateLimit-Reset': String(Math.floor(rec2.resetAt / 1000)),
        })
        const next = NextResponse.next()
        headers.forEach((v, k) => next.headers.set(k, v))
        return next
      }
    }
  } catch {
    // If rate limit logic fails, continue request handling
  }

  // Enforce ADMIN/SUPERADMIN role for admin routes
  if (isAdminRoute(req)) {
    // 0) Optional: Allow Basic Auth specifically for admin routes (separate from Clerk)
    //    Set ADMIN_BASIC_USER and ADMIN_BASIC_PASS in your environment to enable this.
    //    Additionally, set ADMIN_BASIC_BYPASS_ENABLED="true" to allow bypass, but never in production.
    let basicAuthed = false
    let haveBasicConfig = false
    const bypassEnabled = process.env.NODE_ENV !== 'production' && process.env.ADMIN_BASIC_BYPASS_ENABLED === 'true'
    try {
      const envUser = process.env.ADMIN_BASIC_USER
      const envPass = process.env.ADMIN_BASIC_PASS
      haveBasicConfig = Boolean(envUser && envPass)
      const authz = req.headers.get('authorization') ?? ''
      if (authz.startsWith('Basic ')) {
        const decoded = atob(authz.slice(6))
        const sepIdx = decoded.indexOf(':')
        const user = sepIdx >= 0 ? decoded.slice(0, sepIdx) : decoded
        const pass = sepIdx >= 0 ? decoded.slice(sepIdx + 1) : ''
        if (envUser && envPass && user === envUser && pass === envPass) {
          // Successful Basic Auth — only bypass Clerk when bypass is explicitly enabled and not in production
          if (bypassEnabled) {
            basicAuthed = true
            logger.security('Admin Basic Auth bypass ENABLED', { feature: 'admin_basic_bypass', enabled: true, user }, req)
          } else if (process.env.NODE_ENV === 'production') {
            // In production, never allow bypass; log the attempt
            logger.security('Admin Basic Auth bypass attempt blocked in production', { feature: 'admin_basic_bypass', enabled: false, user }, req)
          } else {
            // Credentials presented but bypass not enabled (non-production)
            logger.security('Admin Basic Auth credentials presented but bypass disabled', { feature: 'admin_basic_bypass', enabled: false, user, bypassEnabled }, req)
          }
        } else {
          logger.security('Admin Basic Auth attempt failed', { feature: 'admin_basic_bypass', enabled: false, user }, req)
        }
      }
    } catch {
      // Ignore Basic Auth errors and continue to Clerk checks
    }

    if (basicAuthed) {
      // Allow through (no caching in bypass mode)
      return
    }

    if (!a.userId) {
      // If basic auth is configured, challenge the browser for credentials.
      if (haveBasicConfig) {
        return new Response('Unauthorized', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Admin", charset="UTF-8"' },
        })
      }
      return a.redirectToSignIn({ returnBackUrl: req.url })
    }

    // Edge-safe role check (+ short-lived signed cookie cache) using Neon HTTP + Drizzle without importing server-only dotenv code
    try {
      // 0) If we have a signed role cookie and secret, trust it to avoid DB lookups
      const roleSecret = process.env.ROLE_CACHE_SECRET
      const hasRoleSecret = typeof roleSecret === 'string' && roleSecret.length > 0
      if (hasRoleSecret) {
        const secret = roleSecret
        try {
          const cached = await verifyAndParseRoleCookie(req.cookies.get(ROLE_COOKIE_NAME)?.value, secret)
          const cachedRole = cached?.role
          if (!cached) {
            logger.security('Role cache miss or invalid', { feature: 'role_cache', cookiePresent: Boolean(req.cookies.get(ROLE_COOKIE_NAME)?.value) }, req)
          }
          if (cachedRole === 'ADMIN' || cachedRole === 'SUPERADMIN') {
            const res = NextResponse.next()
            // Refresh cookie TTL on each valid hit
            const newVal = await createRoleCookie(cachedRole, secret)
            res.cookies.set(ROLE_COOKIE_NAME, newVal, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: ROLE_CACHE_TTL_SEC,
            })
            return res
          }
        } catch {
          // Ignore cache errors; fall through to claims/DB
        }
      }

      // 1) Prefer role from Clerk session claims
      const claims = (a as { sessionClaims?: Record<string, unknown> }).sessionClaims ?? {}

      const directRole = typeof claims.role === 'string' ? claims.role : undefined
      const publicRole = typeof (claims as { publicMetadata?: { role?: unknown } }).publicMetadata?.role === 'string'
        ? ((claims as { publicMetadata?: { role?: unknown } }).publicMetadata!.role as string)
        : undefined
      const privateRole = typeof (claims as { privateMetadata?: { role?: unknown } }).privateMetadata?.role === 'string'
        ? ((claims as { privateMetadata?: { role?: unknown } }).privateMetadata!.role as string)
        : undefined

      const claimRole = directRole ?? publicRole ?? privateRole
      if (claimRole === 'ADMIN' || claimRole === 'SUPERADMIN') {
        // Cache role if secret provided
        if (hasRoleSecret) {
          const secret = roleSecret
          try {
            const res = NextResponse.next()
            const cookieVal = await createRoleCookie(claimRole, secret)
            res.cookies.set(ROLE_COOKIE_NAME, cookieVal, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: ROLE_CACHE_TTL_SEC,
            })
            return res
          } catch {
            // If cookie set fails, still allow
            return
          }
        }
        return
      }
      // If claims exist but are not admin, emit a security event for observability
      if (claimRole) {
        logger.security('Non-admin claim used for admin route', { feature: 'admin_role_check', claimRole }, req)
      }

      // 2) Fallback to DB lookup by Clerk user id if claim is missing/not admin
      const { neon } = await import('@neondatabase/serverless')
      const { drizzle } = await import('drizzle-orm/neon-http')
      const { sql } = await import('drizzle-orm')

      const sqlClient = neon(process.env.DATABASE_URL!)
      const db = drizzle(sqlClient)

      // Query user role by Clerk user id
      let role: string | undefined
      {
        const rows = await db.execute(
          sql`select role from kamkmserve_user where clerk_user_id = ${a.userId} limit 1`
        )
        role = rows.rows?.[0]?.role as string | undefined
      }

      // Fallback: if no role found, try matching by email from claims
      if (!role) {
        const emailClaim = typeof (claims as { email?: unknown }).email === 'string'
          ? ((claims as { email?: unknown }).email as string)
          : undefined
        const primaryEmailClaim = typeof (claims as { primaryEmailAddress?: unknown }).primaryEmailAddress === 'string'
          ? ((claims as { primaryEmailAddress?: unknown }).primaryEmailAddress as string)
          : undefined
        const email = emailClaim ?? primaryEmailClaim
        if (email) {
          const rowsByEmail = await db.execute(
            sql`select role from kamkmserve_user where email = ${email} limit 1`
          )
          role = rowsByEmail.rows?.[0]?.role as string | undefined
        }
      }

      if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
        logger.security('Admin role check failed', { feature: 'admin_role_check', userId: a.userId, role }, req);
        return new Response('Forbidden', { status: 403 });
      }
      // Success from DB path — set cache cookie if secret is present
      if (hasRoleSecret) {
        const secret = roleSecret
        try {
          const res = NextResponse.next()
          const cookieVal = await createRoleCookie(role, secret)
          res.cookies.set(ROLE_COOKIE_NAME, cookieVal, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: ROLE_CACHE_TTL_SEC,
          })
          return res
        } catch {
          // If cookie set fails, still allow
          return
        }
      }
      return
    } catch (err) {
      // Fail closed if role cannot be determined
      const error = err instanceof Error ? err : new Error(String(err));
      logger.security('Admin role check errored', { feature: 'admin_role_check', userId: a.userId, error: { message: error.message, stack: error.stack } }, req);
      return new Response('Forbidden', { status: 403 });
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|monitoring|sentry-tunnel|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};