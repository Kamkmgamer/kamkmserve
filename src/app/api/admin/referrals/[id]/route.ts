import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { referrals, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const PatchSchema = z.object({
  commissionRate: z.number().min(0).max(1).optional(),
  code: z.string().min(3).max(64).optional(),
});

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteCtx) {
  try {
    const { id } = await context.params;
    const [row] = await db
      .select({
        id: referrals.id,
        userId: referrals.userId,
        code: referrals.code,
        commissionRate: referrals.commissionRate,
        createdAt: referrals.createdAt,
        updatedAt: referrals.updatedAt,
        userEmail: users.email,
      })
      .from(referrals)
      .leftJoin(users, eq(users.id, referrals.userId))
      .where(eq(referrals.id, id))
      .limit(1);
    if (!row) return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    const data = {
      id: row.id,
      userId: row.userId,
      userEmail: row.userEmail ?? "—",
      code: row.code,
      commissionRate: row.commissionRate,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
    };
    return NextResponse.json({ data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch referral" }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: RouteCtx) {
  try {
    const { id } = await context.params;
    const body: unknown = await req.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const [row] = await db
      .update(referrals)
      .set({
        commissionRate: parsed.data.commissionRate,
        code: parsed.data.code,
      })
      .where(eq(referrals.id, id))
      .returning({ id: referrals.id });

    if (!row?.id) return NextResponse.json({ error: "Referral not found" }, { status: 404 });

    const [full] = await db
      .select({
        id: referrals.id,
        userId: referrals.userId,
        code: referrals.code,
        commissionRate: referrals.commissionRate,
        createdAt: referrals.createdAt,
        updatedAt: referrals.updatedAt,
        userEmail: users.email,
      })
      .from(referrals)
      .leftJoin(users, eq(users.id, referrals.userId))
      .where(eq(referrals.id, row.id))
      .limit(1);

    if (!full) return NextResponse.json({ error: "Failed to load updated referral" }, { status: 500 });

    const data = {
      id: full.id,
      userId: full.userId,
      userEmail: full.userEmail ?? "—",
      code: full.code,
      commissionRate: full.commissionRate,
      createdAt: full.createdAt instanceof Date ? full.createdAt.toISOString() : String(full.createdAt),
      updatedAt: full.updatedAt instanceof Date ? full.updatedAt.toISOString() : String(full.updatedAt),
    };

    return NextResponse.json({ data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update referral" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteCtx) {
  try {
    const { id } = await context.params;
    const [row] = await db
      .delete(referrals)
      .where(eq(referrals.id, id))
      .returning({ id: referrals.id });
    if (!row?.id) return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    return NextResponse.json({ data: { id: row.id } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete referral" }, { status: 500 });
  }
}
