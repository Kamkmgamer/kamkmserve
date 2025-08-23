import type { AppRole } from "~/server/auth/roles";
import { getCurrentUserRole } from "~/server/auth/roles";

export type Action =
  | "read"
  | "list"
  | "create"
  | "update"
  | "delete"
  | "export"
  | "approve"
  | "reject"
  | "mark-paid"
  | "process";

export type ResourceKind = 
  | "order" 
  | "payout" 
  | "commission" 
  | "service" 
  | "user"
  | "blog"
  | "coupon"
  | "referral";

export type Resource = {
  kind: ResourceKind;
  ownerId?: string; // user.id of resource owner if applicable
  orgId?: string; // reserved for org-based policies
  plan?: string; // reserved for plan-based policies
  features?: string[]; // reserved for feature-flag based policies
  status?: string; // resource status (e.g., order status, payout status)
  amount?: number; // monetary amount for financial resources
  metadata?: Record<string, unknown>; // additional context
};

export type UserCtx = { 
  userId: string; 
  role: AppRole;
  plan?: string; // user's subscription plan
  features?: string[]; // user's enabled features
  orgId?: string; // user's organization
};

export type Policy = {
  name: string;
  description: string;
  condition: (user: UserCtx, action: Action, resource: Resource) => boolean;
};

export type PolicySet = {
  policies: Policy[];
  defaultAction: "allow" | "deny";
};

// Core ABAC policies
const corePolicies: Policy[] = [
  // Superadmin policy - can do everything
  {
    name: "superadmin-universal-access",
    description: "Superadmins have universal access to all resources",
    condition: (user) => user.role === "SUPERADMIN"
  },

  // Admin policies for sensitive resources
  {
    name: "admin-order-management",
    description: "Admins can manage orders with full access",
    condition: (user, action, resource) => 
      user.role === "ADMIN" && 
      resource.kind === "order" &&
      ["read", "list", "create", "update", "delete", "export", "approve", "reject"].includes(action)
  },

  {
    name: "admin-payout-management",
    description: "Admins can manage payouts with full access",
    condition: (user, action, resource) => 
      user.role === "ADMIN" && 
      resource.kind === "payout" &&
      ["read", "list", "create", "update", "delete", "export", "mark-paid", "process"].includes(action)
  },

  {
    name: "admin-commission-management",
    description: "Admins can manage commissions with full access",
    condition: (user, action, resource) => 
      user.role === "ADMIN" && 
      resource.kind === "commission" &&
      ["read", "list", "create", "update", "delete", "export"].includes(action)
  },

  // Service management policies
  {
    name: "admin-service-catalog",
    description: "Admins can manage service catalog",
    condition: (user, action, resource) => 
      user.role === "ADMIN" && 
      resource.kind === "service" &&
      ["read", "list", "create", "update", "delete"].includes(action)
  },

  // User management policies
  {
    name: "admin-user-management",
    description: "Admins can manage users",
    condition: (user, action, resource) => 
      user.role === "ADMIN" && 
      resource.kind === "user" &&
      ["read", "list", "update"].includes(action)
  },

  // Blog management policies
  {
    name: "admin-blog-management",
    description: "Admins can manage blog posts",
    condition: (user, action, resource) => 
      user.role === "ADMIN" && 
      resource.kind === "blog" &&
      ["read", "list", "create", "update", "delete"].includes(action)
  },

  // Coupon management policies
  {
    name: "admin-coupon-management",
    description: "Admins can manage coupons",
    condition: (user, action, resource) => 
      user.role === "ADMIN" && 
      resource.kind === "coupon" &&
      ["read", "list", "create", "update", "delete"].includes(action)
  },

  // Referral management policies
  {
    name: "admin-referral-management",
    description: "Admins can manage referrals",
    condition: (user, action, resource) => 
      user.role === "ADMIN" && 
      resource.kind === "referral" &&
      ["read", "list", "create", "update", "delete"].includes(action)
  },

  // Owner-based policies
  {
    name: "owner-read-access",
    description: "Users can read their own resources",
    condition: (user, action, resource) => 
      resource.ownerId === user.userId && 
      ["read", "list"].includes(action)
  },

  {
    name: "owner-order-create",
    description: "Users can create their own orders",
    condition: (user, action, resource) => 
      action === "create" && 
      resource.kind === "order" &&
      resource.ownerId === user.userId
  },

  // Feature-based policies
  {
    name: "feature-export-access",
    description: "Users with export feature can export data",
    condition: (user, action, _resource) => 
      action === "export" && 
      (user.features?.includes("export") ?? false)
  },

  // Plan-based policies
  {
    name: "premium-order-approval",
    description: "Premium users can approve low-value orders",
    condition: (user, action, resource) => 
      action === "approve" && 
      resource.kind === "order" &&
      user.plan === "premium" &&
      (resource.amount ?? 0) <= 1000
  },

  // Amount-based policies
  {
    name: "high-value-order-approval",
    description: "High-value orders require admin approval",
    condition: (user, action, resource) => 
      action === "approve" && 
      resource.kind === "order" &&
      (resource.amount ?? 0) > 1000 &&
      user.role === "ADMIN"
  }
];

export const defaultPolicySet: PolicySet = {
  policies: corePolicies,
  defaultAction: "deny"
};

export async function getUserCtx(): Promise<UserCtx | null> {
  const res = await getCurrentUserRole();
  if (!res.ok) return null;
  
  // TODO: In the future, fetch additional user context like plan, features, org
  return { 
    userId: res.userId, 
    role: res.role,
    plan: "basic", // placeholder
    features: [], // placeholder
    orgId: undefined // placeholder
  };
}

export function can(user: UserCtx, action: Action, resource: Resource): boolean {
  // Check each policy in order
  for (const policy of defaultPolicySet.policies) {
    if (policy.condition(user, action, resource)) {
      return true;
    }
  }

  // Return default action if no policies match
  return defaultPolicySet.defaultAction === "allow";
}

// Helper function to check if user can perform action on resource
export async function canUser(
  action: Action, 
  resource: Resource
): Promise<boolean> {
  const userCtx = await getUserCtx();
  if (!userCtx) return false;
  return can(userCtx, action, resource);
}

// Helper function to get allowed actions for a user on a resource
export async function getAllowedActions(
  resource: Resource
): Promise<Action[]> {
  const userCtx = await getUserCtx();
  if (!userCtx) return [];

  const allActions: Action[] = [
    "read", "list", "create", "update", "delete", "export", 
    "approve", "reject", "mark-paid", "process"
  ];

  return allActions.filter(action => can(userCtx, action, resource));
}

// Helper function to create a resource context
export function createResource(
  kind: ResourceKind,
  options: Partial<Omit<Resource, 'kind'>> = {}
): Resource {
  return {
    kind,
    ...options
  };
}
