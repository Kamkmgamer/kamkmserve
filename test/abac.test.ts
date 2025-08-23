import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  can, 
  canUser, 
  getAllowedActions, 
  createResource,
  type UserCtx, 
  type Action, 
  type Resource,
  type ResourceKind,
  defaultPolicySet
} from '../src/server/auth/abac'

// Mock the getCurrentUserRole function
vi.mock('../src/server/auth/roles', () => ({
  getCurrentUserRole: vi.fn()
}))

describe('ABAC System', () => {
  let mockUserCtx: UserCtx
  let mockAdminCtx: UserCtx
  let mockSuperadminCtx: UserCtx
  let mockPremiumUserCtx: UserCtx

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Create test user contexts
    mockUserCtx = {
      userId: 'user-123',
      role: 'USER',
      plan: 'basic',
      features: []
    }

    mockAdminCtx = {
      userId: 'admin-456',
      role: 'ADMIN',
      plan: 'pro',
      features: ['export']
    }

    mockSuperadminCtx = {
      userId: 'super-789',
      role: 'SUPERADMIN',
      plan: 'enterprise',
      features: ['export', 'advanced']
    }

    mockPremiumUserCtx = {
      userId: 'premium-101',
      role: 'USER',
      plan: 'premium',
      features: ['export']
    }
  })

  describe('Policy Evaluation', () => {
    it('should have the correct number of policies', () => {
      expect(defaultPolicySet.policies).toHaveLength(14)
      expect(defaultPolicySet.defaultAction).toBe('deny')
    })

    it('should evaluate policies in order', () => {
      // First policy should be superadmin universal access
      const firstPolicy = defaultPolicySet.policies[0]
      expect(firstPolicy.name).toBe('superadmin-universal-access')
      expect(firstPolicy.condition(mockSuperadminCtx, 'delete', createResource('order'))).toBe(true)
    })
  })

  describe('Superadmin Access', () => {
    it('should allow superadmin to perform any action on any resource', () => {
      const actions: Action[] = ['read', 'list', 'create', 'update', 'delete', 'export', 'approve', 'reject', 'mark-paid', 'process']
      const resources: ResourceKind[] = ['order', 'payout', 'commission', 'service', 'user', 'blog', 'coupon', 'referral']

      for (const action of actions) {
        for (const resourceKind of resources) {
          const resource = createResource(resourceKind)
          expect(can(mockSuperadminCtx, action, resource)).toBe(true)
        }
      }
    })
  })

  describe('Admin Access', () => {
    it('should allow admin to manage orders', () => {
      const orderResource = createResource('order')
      const allowedActions: Action[] = ['read', 'list', 'create', 'update', 'delete', 'export', 'approve', 'reject']
      
      for (const action of allowedActions) {
        expect(can(mockAdminCtx, action, orderResource)).toBe(true)
      }
    })

    it('should allow admin to manage payouts', () => {
      const payoutResource = createResource('payout')
      const allowedActions: Action[] = ['read', 'list', 'create', 'update', 'delete', 'export', 'mark-paid', 'process']
      
      for (const action of allowedActions) {
        expect(can(mockAdminCtx, action, payoutResource)).toBe(true)
      }
    })

    it('should allow admin to manage commissions', () => {
      const commissionResource = createResource('commission')
      const allowedActions: Action[] = ['read', 'list', 'create', 'update', 'delete', 'export']
      
      for (const action of allowedActions) {
        expect(can(mockAdminCtx, action, commissionResource)).toBe(true)
      }
    })

    it('should allow admin to manage services', () => {
      const serviceResource = createResource('service')
      const allowedActions: Action[] = ['read', 'list', 'create', 'update', 'delete']
      
      for (const action of allowedActions) {
        expect(can(mockAdminCtx, action, serviceResource)).toBe(true)
      }
    })

    it('should allow admin to manage users', () => {
      const userResource = createResource('user')
      const allowedActions: Action[] = ['read', 'list', 'update']
      
      for (const action of allowedActions) {
        expect(can(mockAdminCtx, action, userResource)).toBe(true)
      }
    })

    it('should not allow admin to delete users', () => {
      const userResource = createResource('user')
      expect(can(mockAdminCtx, 'delete', userResource)).toBe(false)
    })
  })

  describe('User Access', () => {
    it('should allow users to read their own resources', () => {
      const ownOrder = createResource('order', { ownerId: 'user-123' })
      expect(can(mockUserCtx, 'read', ownOrder)).toBe(true)
      expect(can(mockUserCtx, 'list', ownOrder)).toBe(true)
    })

    it('should not allow users to read others resources', () => {
      const otherOrder = createResource('order', { ownerId: 'other-user' })
      expect(can(mockUserCtx, 'read', otherOrder)).toBe(false)
    })

    it('should allow users to manage their own orders', () => {
      const ownOrder = createResource('order', { ownerId: 'user-123' })
      const allowedActions: Action[] = ['read', 'list', 'create']
      
      for (const action of allowedActions) {
        expect(can(mockUserCtx, action, ownOrder)).toBe(true)
      }
    })

    it('should not allow users to delete their own orders', () => {
      const ownOrder = createResource('order', { ownerId: 'user-123' })
      expect(can(mockUserCtx, 'delete', ownOrder)).toBe(false)
    })
  })

  describe('Feature-Based Policies', () => {
    it('should allow users with export feature to export data', () => {
      const orderResource = createResource('order')
      expect(can(mockAdminCtx, 'export', orderResource)).toBe(true)
    })

    it('should not allow users without export feature to export data', () => {
      const orderResource = createResource('order')
      expect(can(mockUserCtx, 'export', orderResource)).toBe(false)
    })
  })

  describe('Plan-Based Policies', () => {
    it('should allow premium users to approve orders', () => {
      const orderResource = createResource('order', { amount: 500 })
      expect(can(mockPremiumUserCtx, 'approve', orderResource)).toBe(true)
    })

    it('should not allow basic users to approve orders', () => {
      const orderResource = createResource('order')
      expect(can(mockUserCtx, 'approve', orderResource)).toBe(false)
    })
  })

  describe('Status-Based Policies', () => {
    it('should allow updating pending orders', () => {
      const pendingOrder = createResource('order', { status: 'PENDING' })
      expect(can(mockUserCtx, 'update', pendingOrder)).toBe(false) // User can't update orders by default
      
      // But admin can
      expect(can(mockAdminCtx, 'update', pendingOrder)).toBe(true)
    })

    it('should allow admins to update orders regardless of status', () => {
      const approvedOrder = createResource('order', { status: 'APPROVED' })
      expect(can(mockAdminCtx, 'update', approvedOrder)).toBe(true)
    })
  })

  describe('Amount-Based Policies', () => {
    it('should require admin approval for high-value orders', () => {
      const highValueOrder = createResource('order', { amount: 1500 })
      expect(can(mockAdminCtx, 'approve', highValueOrder)).toBe(true)
      expect(can(mockUserCtx, 'approve', highValueOrder)).toBe(false)
    })

    it('should allow regular approval for low-value orders', () => {
      const lowValueOrder = createResource('order', { amount: 500 })
      expect(can(mockPremiumUserCtx, 'approve', lowValueOrder)).toBe(true)
    })
  })

  describe('Resource Creation', () => {
    it('should create resources with correct properties', () => {
      const order = createResource('order', {
        ownerId: 'user-123',
        status: 'PENDING',
        amount: 1000
      })

      expect(order).toEqual({
        kind: 'order',
        ownerId: 'user-123',
        status: 'PENDING',
        amount: 1000
      })
    })

    it('should create resources with minimal properties', () => {
      const service = createResource('service')
      expect(service).toEqual({
        kind: 'service'
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle resources without owner', () => {
      const publicService = createResource('service')
      expect(can(mockUserCtx, 'read', publicService)).toBe(false)
      expect(can(mockAdminCtx, 'read', publicService)).toBe(true)
    })

    it('should handle undefined resource properties', () => {
      const order = createResource('order', { amount: undefined })
      expect(can(mockAdminCtx, 'approve', order)).toBe(true) // admins can approve any order
    })

    it('should handle empty features array', () => {
      const userWithoutFeatures: UserCtx = { ...mockUserCtx, features: [] }
      const orderResource = createResource('order')
      expect(can(userWithoutFeatures, 'export', orderResource)).toBe(false)
    })
  })

  describe('Policy Coverage', () => {
    it('should have policies for all resource kinds', () => {
      const resourceKinds: ResourceKind[] = ['order', 'payout', 'commission', 'service', 'user', 'blog', 'coupon', 'referral']
      
      for (const kind of resourceKinds) {
        const resource = createResource(kind)
        // At least superadmin should have access
        expect(can(mockSuperadminCtx, 'read', resource)).toBe(true)
      }
    })

    it('should have policies for all actions', () => {
      const actions: Action[] = ['read', 'list', 'create', 'update', 'delete', 'export', 'approve', 'reject', 'mark-paid', 'process']
      
      for (const action of actions) {
        const orderResource = createResource('order')
        // At least superadmin should have access to all actions
        expect(can(mockSuperadminCtx, action, orderResource)).toBe(true)
      }
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complex order workflow', () => {
      const order = createResource('order', {
        ownerId: 'user-123',
        status: 'PENDING',
        amount: 500
      })

      // User can read and update their own pending order
      expect(can(mockUserCtx, 'read', order)).toBe(true)
      expect(can(mockUserCtx, 'update', order)).toBe(false) // Users can't update orders by default
      expect(can(mockUserCtx, 'approve', order)).toBe(false) // Basic users can't approve

      // Premium user can approve low-value orders
      expect(can(mockPremiumUserCtx, 'approve', order)).toBe(true)

      // Admin can do everything
      expect(can(mockAdminCtx, 'read', order)).toBe(true)
      expect(can(mockAdminCtx, 'update', order)).toBe(true)
      expect(can(mockAdminCtx, 'approve', order)).toBe(true)
      expect(can(mockAdminCtx, 'export', order)).toBe(true)
    })

    it('should handle payout processing workflow', () => {
      const payout = createResource('payout', {
        status: 'PENDING',
        amount: 100
      })

      // Regular users can't access payouts
      expect(can(mockUserCtx, 'read', payout)).toBe(false)
      expect(can(mockUserCtx, 'mark-paid', payout)).toBe(false)

      // Admins can process payouts
      expect(can(mockAdminCtx, 'read', payout)).toBe(true)
      expect(can(mockAdminCtx, 'mark-paid', payout)).toBe(true)
      expect(can(mockAdminCtx, 'process', payout)).toBe(true)
    })
  })
})
