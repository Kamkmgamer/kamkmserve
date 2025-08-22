import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Matchers for admin routes (pages and APIs)
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  const a = await auth()

  // Enforce ADMIN/SUPERADMIN role for admin routes
  if (isAdminRoute(req)) {
    // 0) Optional: Allow Basic Auth specifically for admin routes (separate from Clerk)
    //    Set ADMIN_BASIC_USER and ADMIN_BASIC_PASS in your environment to enable this.
    let basicAuthed = false
    let haveBasicConfig = false
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
          // Successful Basic Auth — bypass Clerk for admin route
          basicAuthed = true
        }
      }
    } catch {
      // Ignore Basic Auth errors and continue to Clerk checks
    }

    if (basicAuthed) {
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

    // Edge-safe role check using Neon HTTP + Drizzle without importing server-only dotenv code
    try {
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
        return
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
        return new Response('Forbidden', { status: 403 })
      }
    } catch {
      // Fail closed if role cannot be determined
      return new Response('Forbidden', { status: 403 })
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|monitoring|sentry-tunnel|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}