import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../src/server/auth/roles', () => ({ requireRole: vi.fn() }))
vi.mock('../src/server/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        leftJoin: () => ({
          leftJoin: () => ({
            where: () => ({
              orderBy: () => Promise.resolve([
                {
                  id: 'comm_1',
                  amount: 50,
                  status: 'OPEN',
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

import { GET } from '../src/app/api/admin/commissions/route'
import { requireRole } from '../src/server/auth/roles'

describe('Admin API - commissions GET', () => {
  beforeEach(() => vi.resetAllMocks())

  it('forbids when role check fails', async () => {
    ;(requireRole as any).mockResolvedValue({ ok: false, res: new Response('Forbidden', { status: 403 }) })
    const req = new Request('https://example.com/api/admin/commissions')
    const res = await GET(req)
    expect((res as Response).status).toBe(403)
  })

  it('returns commissions when authorized', async () => {
    ;(requireRole as any).mockResolvedValue({ ok: true })
    const req = new Request('https://example.com/api/admin/commissions')
    const res = await GET(req)
    expect((res as Response).status).toBe(200)
    const body = await (res as Response).json()
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data[0].id).toBe('comm_1')
  })
})
