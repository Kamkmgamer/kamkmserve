import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export type AppRole = "USER" | "ADMIN" | "SUPERADMIN";

const roleRank: Record<AppRole, number> = {
  USER: 0,
  ADMIN: 1,
  SUPERADMIN: 2,
};

export async function requireRole(minRole: AppRole) {
  try {
    const clerk = await currentUser();
    if (!clerk) {
      return { ok: false as const, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    const clerkId = clerk.id;
    const [row] = await db.select().from(users).where(eq(users.clerkUserId, clerkId)).limit(1);
    const role = (row?.role ?? "USER") as AppRole;

    if (roleRank[role] < roleRank[minRole]) {
      return { ok: false as const, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }

    return { ok: true as const };
  } catch (e) {
    console.error(e);
    return { ok: false as const, res: NextResponse.json({ error: "Auth check failed" }, { status: 500 }) };
  }
}

export async function getCurrentUserRole(): Promise<
  | { ok: true; role: AppRole; userId: string }
  | { ok: false; status: number; error: string }
> {
  try {
    const clerk = await currentUser();
    if (!clerk) return { ok: false, status: 401, error: "Unauthorized" };
    const clerkId = clerk.id;
    const [row] = await db.select().from(users).where(eq(users.clerkUserId, clerkId)).limit(1);
    const role = (row?.role ?? "USER") as AppRole;
    return { ok: true, role, userId: row?.id ?? "" };
  } catch {
    return { ok: false, status: 500, error: "Auth lookup failed" };
  }
}
