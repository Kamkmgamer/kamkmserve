import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../src/server/auth/roles', () => ({ requireRole: vi.fn() }))
vi.mock('../src/server/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        // list flow: .from(...).leftJoin(...).where(...).orderBy(...)
        leftJoin: () => ({
          where: () => ({
            orderBy: () => Promise.resolve([
              {
                id: 'payout_1',
                userEmail: 'payee@example.com',
                amount: 200,
                status: 'PENDING',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ]),
          }),
        }),
        // single-item flow used by PATCH: .from(...).where(...)
        where: () => Promise.resolve([
          {
            id: 'payout_1',
            userEmail: 'payee@example.com',
            amount: 200,
            status: 'PAID',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve({ rows: [{ affected: 1 }] }),
      }),
    }),
    execute: () => Promise.resolve({ rows: [{ affected: 1 }] }),
  },
}))

import { GET } from '../src/app/api/admin/payouts/route'
import { PATCH as MARK_PAID } from '../src/app/api/admin/payouts/[id]/mark-paid/route'
import { requireRole } from '../src/server/auth/roles'

describe('Admin API - payouts', () => {
  beforeEach(() => vi.resetAllMocks())

  it('returns 403 when role check fails for list', async () => {
    ;(requireRole as any).mockResolvedValue({ ok: false, res: new Response('Forbidden', { status: 403 }) })
    const req = new Request('https://example.com/api/admin/payouts')
    const res = await GET(req)
    expect((res as Response).status).toBe(403)
  })

  it('returns payouts when role check passes', async () => {
    ;(requireRole as any).mockResolvedValue({ ok: true })
    const req = new Request('https://example.com/api/admin/payouts')
    const res = await GET(req)
    expect((res as Response).status).toBe(200)
    const body = await (res as Response).json()
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data[0].id).toBe('payout_1')
  })

  it('mark-paid returns 200 when authorized', async () => {
    ;(requireRole as any).mockResolvedValue({ ok: true })
    const req = new Request('https://example.com/api/admin/payouts/1/mark-paid', { method: 'PATCH' })
    // The PATCH handler expects a context with params promise
    const ctx = { params: Promise.resolve({ id: 'payout_1' }) }
    const res = await MARK_PAID(req as any, ctx as any)
    // mark-paid handler should return 200 or 204; accept either
    expect([200, 204, 201].includes((res as Response).status)).toBe(true)
  })
})
