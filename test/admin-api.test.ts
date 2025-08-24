import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock requireRole to simulate auth path
vi.mock('../src/server/auth/roles', () => ({
  requireRole: vi.fn(),
}))

// Mock the DB to return predictable rows
vi.mock('../src/server/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        leftJoin: () => ({
          leftJoin: () => ({
            where: () => ({
              orderBy: () => Promise.resolve([
                {
                  id: 'ord_1',
                  userEmail: 'user@example.com',
                  totalAmount: 123,
                  status: 'PENDING',
                  couponCode: null,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ]),
            }),
          }),
        }),
      }),
    }),
  },
}))

import { GET } from '../src/app/api/admin/orders/route'
import { requireRole } from '../src/server/auth/roles'

describe('Admin API - orders GET', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns 403 when role check fails', async () => {
    ;(requireRole as any).mockResolvedValue({ ok: false, res: new Response('Forbidden', { status: 403 }) })
    const req = new Request('https://example.com/api/admin/orders')
    const res = await GET(req)
    expect(res instanceof Response).toBe(true)
    expect((res as Response).status).toBe(403)
  })

  it('returns data when role check passes', async () => {
    ;(requireRole as any).mockResolvedValue({ ok: true })
    const req = new Request('https://example.com/api/admin/orders')
    const res = await GET(req)
    expect(res instanceof Response).toBe(true)
    expect((res as Response).status).toBe(200)
    const body = await (res as Response).json()
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data[0].id).toBe('ord_1')
  })
})
