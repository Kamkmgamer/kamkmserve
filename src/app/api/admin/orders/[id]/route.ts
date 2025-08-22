import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { coupons, orders, users } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";

const PatchSchema = z.object({
  status: z.enum([
    "PENDING",
    "PAID",
    "IN_TECHNICAL_REVIEW",
    "APPROVED",
    "FAILED",
    "REFUNDED",
    "CANCELED",
  ]).optional(),
});

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteCtx) {
  try {
    const { id } = await context.params;
    const body: unknown = await req.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    if (!parsed.data.status) {
      return NextResponse.json({ error: "No patchable fields provided" }, { status: 400 });
    }

    const [row] = await db
      .update(orders)
      .set({ status: parsed.data.status })
      .where(eq(orders.id, id))
      .returning({ id: orders.id });

    if (!row?.id) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const [r] = await db
      .select({
        id: orders.id,
        userEmail: users.email,
        totalAmount: orders.totalAmount,
        status: orders.status,
        couponCode: coupons.code,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.userId))
      .leftJoin(coupons, eq(coupons.id, orders.couponId))
      .where(eq(orders.id, row.id))
      .orderBy(desc(orders.createdAt))
      .limit(1);

    if (!r) return NextResponse.json({ error: "Failed to load updated order" }, { status: 500 });

    const data = {
      id: r.id,
      userEmail: r.userEmail ?? "—",
      totalAmount: r.totalAmount,
      status: r.status,
      couponCode: r.couponCode ?? null,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
    };

    return NextResponse.json({ data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
