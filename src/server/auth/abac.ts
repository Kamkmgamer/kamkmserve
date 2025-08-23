import type { AppRole } from "~/server/auth/roles";
import { getCurrentUserRole } from "~/server/auth/roles";

export type Action =
  | "read"
  | "list"
  | "create"
  | "update"
  | "delete"
  | "export";

export type ResourceKind = "order" | "payout" | "commission" | "service" | "user";

export type Resource = {
  kind: ResourceKind;
  ownerId?: string; // user.id of resource owner if applicable
  orgId?: string; // reserved for future org-based policies
  plan?: string; // reserved for plan-based policies
  features?: string[]; // reserved for feature-flag based policies
};

export type UserCtx = { userId: string; role: AppRole };

export async function getUserCtx(): Promise<UserCtx | null> {
  const res = await getCurrentUserRole();
  if (!res.ok) return null;
  return { userId: res.userId, role: res.role };
}

export function can(user: UserCtx, action: Action, resource: Resource): boolean {
  // Superadmins can do everything
  if (user.role === "SUPERADMIN") return true;

  // Admins can manage sensitive resources but we can narrow per action
  if (user.role === "ADMIN") {
    if (resource.kind === "order" || resource.kind === "payout" || resource.kind === "commission") {
      // Allow listing/reading/exporting; updates/deletes could be constrained further later
      if (action === "list" || action === "read" || action === "export" || action === "update") {
        return true;
      }
    }
    if (resource.kind === "service") {
      // Admins manage catalog
      return action === "list" || action === "read" || action === "create" || action === "update" || action === "delete";
    }
  }

  // Default USER: only owner can read their own resources
  if (resource.ownerId && resource.ownerId === user.userId) {
    return action === "read" || action === "list";
  }

  return false;
}
