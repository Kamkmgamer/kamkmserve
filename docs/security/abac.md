# Attribute-Based Access Control (ABAC)

This document describes the Attribute-Based Access Control (ABAC) system implemented in the application, which provides fine-grained access control based on user attributes, resource properties, and contextual information.

## Overview

ABAC extends traditional Role-Based Access Control (RBAC) by considering additional attributes such as:
- User attributes (role, plan, features, organization)
- Resource attributes (type, owner, status, amount, metadata)
- Environmental context (time, location, etc.)

## Core Concepts

### Actions
The system supports the following actions:
- `read` - View a resource
- `list` - List multiple resources
- `create` - Create a new resource
- `update` - Modify an existing resource
- `delete` - Remove a resource
- `export` - Export resource data
- `approve` - Approve a resource (e.g., order approval)
- `reject` - Reject a resource
- `mark-paid` - Mark a resource as paid
- `process` - Process a resource

### Resource Kinds
Supported resource types:
- `order` - Customer orders
- `payout` - Payment disbursements
- `commission` - Referral commissions
- `service` - Service catalog items
- `user` - User accounts
- `blog` - Blog posts
- `coupon` - Discount coupons
- `referral` - Referral codes

### User Context
Each user has a context containing:
- `userId` - Unique user identifier
- `role` - User role (USER, ADMIN, SUPERADMIN)
- `plan` - Subscription plan (basic, premium, enterprise)
- `features` - Array of enabled features
- `orgId` - Organization identifier (future use)

### Resource Context
Resources can have various attributes:
- `kind` - Resource type (required)
- `ownerId` - User who owns the resource
- `status` - Current status (e.g., PENDING, APPROVED)
- `amount` - Monetary value
- `metadata` - Additional contextual information

## Policy System

### Policy Structure
Each policy consists of:
- `name` - Unique identifier
- `description` - Human-readable explanation
- `condition` - Function that evaluates access

### Policy Evaluation
Policies are evaluated in order until one matches. The first matching policy determines access. If no policies match, the default action (deny) is applied.

## Core Policies

### 1. Superadmin Universal Access
```typescript
{
  name: "superadmin-universal-access",
  description: "Superadmins have universal access to all resources",
  condition: (user) => user.role === "SUPERADMIN"
}
```
**Effect**: Superadmins can perform any action on any resource.

### 2. Admin Resource Management
```typescript
{
  name: "admin-order-management",
  description: "Admins can manage orders with full access",
  condition: (user, action, resource) => 
    user.role === "ADMIN" && 
    resource.kind === "order" &&
    ["read", "list", "create", "update", "delete", "export", "approve", "reject"].includes(action)
}
```
**Effect**: Admins have full access to manage orders, including approval and rejection.

### 3. Owner-Based Access
```typescript
{
  name: "owner-read-access",
  description: "Users can read their own resources",
  condition: (user, action, resource) => 
    resource.ownerId === user.userId && 
    ["read", "list"].includes(action)
}
```
**Effect**: Users can read and list resources they own.

### 4. Feature-Based Access
```typescript
{
  name: "feature-export-access",
  description: "Users with export feature can export data",
  condition: (user, action, resource) => 
    action === "export" && 
    user.features?.includes("export")
}
```
**Effect**: Only users with the "export" feature can export data.

### 5. Plan-Based Access
```typescript
{
  name: "premium-order-approval",
  description: "Premium users can approve low-value orders",
  condition: (user, action, resource) => 
    action === "approve" && 
    resource.kind === "order" &&
    user.plan === "premium" &&
    (resource.amount || 0) <= 1000
}
```
**Effect**: Premium users can approve orders worth $1000 or less.

### 6. Amount-Based Access
```typescript
{
  name: "high-value-order-approval",
  description: "High-value orders require admin approval",
  condition: (user, action, resource) => 
    action === "approve" && 
    resource.kind === "order" &&
    (resource.amount || 0) > 1000 &&
    user.role === "ADMIN"
}
```
**Effect**: Only admins can approve orders worth more than $1000.

## Usage Examples

### Basic Permission Check
```typescript
import { canUser, createResource } from '~/server/auth/abac'

// Check if user can read an order
const order = createResource('order', { 
  ownerId: 'user-123',
  status: 'PENDING',
  amount: 500
})

const canRead = await canUser('read', order)
```

### Resource Creation Helper
```typescript
import { createResource } from '~/server/auth/abac'

// Create a resource with minimal properties
const service = createResource('service')

// Create a resource with full context
const order = createResource('order', {
  ownerId: 'user-123',
  status: 'PENDING',
  amount: 1000,
  metadata: { source: 'web' }
})
```

### Getting Allowed Actions
```typescript
import { getAllowedActions } from '~/server/auth/abac'

// Get all actions a user can perform on a resource
const allowedActions = await getAllowedActions(order)
// Returns: ['read', 'list', 'create', 'update', 'delete', 'export', 'approve', 'reject']
```

## Policy Customization

### Adding New Policies
```typescript
const customPolicy: Policy = {
  name: "time-based-access",
  description: "Allow access only during business hours",
  condition: (user, action, resource) => {
    const hour = new Date().getHours()
    return hour >= 9 && hour <= 17
  }
}

// Add to policy set
defaultPolicySet.policies.push(customPolicy)
```

### Modifying Existing Policies
```typescript
// Find and modify a policy
const policy = defaultPolicySet.policies.find(p => p.name === "admin-order-management")
if (policy) {
  policy.condition = (user, action, resource) => 
    user.role === "ADMIN" && 
    resource.kind === "order" &&
    action !== "delete" // Remove delete permission
}
```

## Best Practices

### 1. Policy Ordering
- Place most restrictive policies first
- General policies should come after specific ones
- Default deny policies should be last

### 2. Policy Naming
- Use descriptive names that indicate the policy's purpose
- Follow a consistent naming convention
- Include the resource type in the name

### 3. Policy Testing
- Test each policy individually
- Test policy interactions and conflicts
- Verify edge cases and boundary conditions

### 4. Performance Considerations
- Keep policy conditions simple and efficient
- Avoid complex calculations in policy conditions
- Consider caching policy results for frequently accessed resources

## Security Considerations

### 1. Policy Validation
- Ensure all policies are reviewed and tested
- Validate policy conditions for security implications
- Test policy bypass scenarios

### 2. Default Deny
- The system defaults to denying access
- Only explicitly allowed actions are permitted
- This follows the principle of least privilege

### 3. Audit Logging
- Log all access decisions for audit purposes
- Include policy information in audit logs
- Monitor for unusual access patterns

## Troubleshooting

### Common Issues

#### Policy Not Working as Expected
1. Check policy order - earlier policies take precedence
2. Verify policy conditions are correct
3. Ensure resource attributes are properly set
4. Check user context values

#### Access Denied Unexpectedly
1. Verify user has the required role
2. Check if resource has required attributes
3. Ensure policy conditions match the scenario
4. Review policy evaluation order

#### Performance Issues
1. Simplify complex policy conditions
2. Consider caching frequently accessed policies
3. Optimize resource attribute access
4. Review policy evaluation frequency

### Debugging Tips
```typescript
// Enable debug logging
console.log('User context:', userCtx)
console.log('Resource:', resource)
console.log('Action:', action)

// Test individual policies
for (const policy of defaultPolicySet.policies) {
  const result = policy.condition(userCtx, action, resource)
  console.log(`Policy ${policy.name}: ${result}`)
}
```

## Future Enhancements

### Planned Features
- Organization-based policies
- Time-based access control
- Location-based restrictions
- Dynamic policy loading
- Policy versioning and rollback

### Integration Points
- User management system
- Subscription/billing system
- Feature flag system
- Audit and monitoring systems

## Related Documentation

- [Authentication & Authorization](./auth.md)
- [Security Headers](./tls.md)
- [File Upload Security](./uploads.md)
- [API Security Guidelines](../api-security.md)
