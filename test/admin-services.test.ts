import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock role guard
vi.mock('../src/server/auth/roles', () => ({ requireRole: vi.fn() }))

// Mock DB layer for insert/update/delete/select
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()

vi.mock('../src/server/db', () => ({
  db: {
    insert: () => ({ values: (...args: any[]) => ({ returning: () => mockInsert(...args) }) }),
    update: () => ({ set: (...args: any[]) => ({ where: () => ({ returning: () => mockUpdate(...args) }) }) }),
    delete: () => ({ where: () => ({ returning: () => mockDelete() }) }),
  },
}))

// Handlers under test
import { POST as SERVICES_POST, GET as SERVICES_GET } from '../src/app/api/admin/services/route'
import { PATCH as SERVICE_PATCH, DELETE as SERVICE_DELETE } from '../src/app/api/admin/services/[id]/route'
import { requireRole } from '../src/server/auth/roles'

function req(url: string, init?: RequestInit) {
  return new Request(url, init)
}

describe('Admin API - services mutations', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    ;(requireRole as any).mockResolvedValue({ ok: true })
  })

  it('POST returns 403 when role check fails', async () => {
    ;(requireRole as any).mockResolvedValue({ ok: false, res: new Response('Forbidden', { status: 403 }) })
    const res = await SERVICES_POST(req('https://example.com/api/admin/services', {
      method: 'POST',
      body: JSON.stringify({}),
    }))
    expect(res.status).toBe(403)
  })

  it('POST validates body and returns 400 on invalid data', async () => {
    const res = await SERVICES_POST(req('https://example.com/api/admin/services', {
      method: 'POST',
      body: JSON.stringify({ name: '' }), // invalid per schema
    }))
    expect(res.status).toBe(400)
  })

  it('POST creates a service and returns 201', async () => {
    mockInsert.mockResolvedValueOnce([{ id: 'svc_1', name: 'Pro', price: 10 }])
    const res = await SERVICES_POST(req('https://example.com/api/admin/services', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Pro',
        description: 'desc',
        price: 10,
        features: 'feat',
        category: 'cat',
        thumbnailUrl: '', // allowed as empty -> undefined
        imageUrls: 'img1',
      }),
    }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data.id).toBe('svc_1')
  })

  it('PATCH updates a service and returns 200', async () => {
    mockUpdate.mockResolvedValueOnce([{ id: 'svc_1', name: 'Pro+', price: 12 }])
    const context = { params: Promise.resolve({ id: 'svc_1' }) }
    const res = await SERVICE_PATCH(
      req('https://example.com/api/admin/services/svc_1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Pro+' }),
      }) as any,
      context as any,
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.name).toBe('Pro+')
  })

  it('PATCH validates body and returns 400 on invalid data', async () => {
    const context = { params: Promise.resolve({ id: 'svc_1' }) }
    const res = await SERVICE_PATCH(
      req('https://example.com/api/admin/services/svc_1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ price: -1 }), // invalid nonnegative
      }) as any,
      context as any,
    )
    expect(res.status).toBe(400)
  })

  it('DELETE removes a service and returns 200', async () => {
    mockDelete.mockResolvedValueOnce([{ id: 'svc_1' }])
    const context = { params: Promise.resolve({ id: 'svc_1' }) }
    const res = await SERVICE_DELETE(
      req('https://example.com/api/admin/services/svc_1', { method: 'DELETE' }) as any,
      context as any,
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.id).toBe('svc_1')
  })

  it('GET returns list when authorized (smoke)', async () => {
    // We only need to verify handler is callable; underlying select is memoized via cache util.
    const res = await SERVICES_GET(req('https://example.com/api/admin/services'))
    expect(res.status).toBe(200)
  })
})
