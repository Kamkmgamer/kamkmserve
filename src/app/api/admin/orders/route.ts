import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { coupons, orders, users } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
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
      .orderBy(desc(orders.createdAt));

    const data = rows.map((r) => ({
      id: r.id,
      userEmail: r.userEmail ?? "—",
      totalAmount: r.totalAmount,
      status: r.status,
      couponCode: r.couponCode ?? null,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
    }));

    return NextResponse.json({ data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to list orders" }, { status: 500 });
  }
}
