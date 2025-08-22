import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { commissions, referrals, orders } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const PatchSchema = z.object({
  amount: z.number().int().nonnegative().optional(),
  status: z.enum(["UNPAID", "PENDING", "PAID", "FAILED"]).optional(),
});

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteCtx) {
  try {
    const { id } = await context.params;
    const [row] = await db
      .select({
        id: commissions.id,
        orderId: commissions.orderId,
        referralId: commissions.referralId,
        amount: commissions.amount,
        status: commissions.status,
        createdAt: commissions.createdAt,
        updatedAt: commissions.updatedAt,
        referralCode: referrals.code,
        orderTotal: orders.totalAmount,
      })
      .from(commissions)
      .leftJoin(referrals, eq(referrals.id, commissions.referralId))
      .leftJoin(orders, eq(orders.id, commissions.orderId))
      .where(eq(commissions.id, id))
      .limit(1);
    if (!row) return NextResponse.json({ error: "Commission not found" }, { status: 404 });

    const data = {
      id: row.id,
      orderId: row.orderId,
      referralId: row.referralId,
      referralCode: row.referralCode ?? "—",
      amount: row.amount,
      status: row.status,
      orderTotal: row.orderTotal ?? 0,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
    };
    return NextResponse.json({ data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch commission" }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: RouteCtx) {
  try {
    const { id } = await context.params;
    const body: unknown = await req.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const [row] = await db
      .update(commissions)
      .set({
        amount: parsed.data.amount,
        status: parsed.data.status,
      })
      .where(eq(commissions.id, id))
      .returning({ id: commissions.id });

    if (!row?.id) return NextResponse.json({ error: "Commission not found" }, { status: 404 });

    const [full] = await db
      .select({
        id: commissions.id,
        orderId: commissions.orderId,
        referralId: commissions.referralId,
        amount: commissions.amount,
        status: commissions.status,
        createdAt: commissions.createdAt,
        updatedAt: commissions.updatedAt,
        referralCode: referrals.code,
        orderTotal: orders.totalAmount,
      })
      .from(commissions)
      .leftJoin(referrals, eq(referrals.id, commissions.referralId))
      .leftJoin(orders, eq(orders.id, commissions.orderId))
      .where(eq(commissions.id, row.id))
      .limit(1);

    if (!full) return NextResponse.json({ error: "Failed to load updated commission" }, { status: 500 });

    const data = {
      id: full.id,
      orderId: full.orderId,
      referralId: full.referralId,
      referralCode: full.referralCode ?? "—",
      amount: full.amount,
      status: full.status,
      orderTotal: full.orderTotal ?? 0,
      createdAt: full.createdAt instanceof Date ? full.createdAt.toISOString() : String(full.createdAt),
      updatedAt: full.updatedAt instanceof Date ? full.updatedAt.toISOString() : String(full.updatedAt),
    };

    return NextResponse.json({ data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update commission" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteCtx) {
  try {
    const { id } = await context.params;
    const [row] = await db
      .delete(commissions)
      .where(eq(commissions.id, id))
      .returning({ id: commissions.id });
    if (!row?.id) return NextResponse.json({ error: "Commission not found" }, { status: 404 });
    return NextResponse.json({ data: { id: row.id } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete commission" }, { status: 500 });
  }
}
