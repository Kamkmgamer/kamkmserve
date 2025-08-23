import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { coupons, orders, users } from "~/server/db/schema";
import { and, desc, eq, like, or } from "drizzle-orm";
import { z } from "zod";
import { requireRole } from "~/server/auth/roles";

export async function GET(req: Request) {
  try {
    const auth = await requireRole("ADMIN");
    if (!auth.ok) return auth.res;
    const { searchParams } = new URL(req.url);
    const qp = Object.fromEntries(searchParams.entries());
    const QuerySchema = z.object({
      q: z.string().trim().max(200).optional(),
      status: z.string().trim().max(50).optional(),
    });
    const parsed = QuerySchema.safeParse(qp);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const q = parsed.data.q;
    const status = parsed.data.status;
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
      .where(
        q || status
          ? and(
              status ? eq(orders.status, status as typeof orders.$inferSelect.status) : undefined,
              q
                ? or(
                    like(users.email, `%${q}%`),
                    like(coupons.code, `%${q}%`),
                    like(orders.id, `%${q}%`)
                  )
                : undefined,
            )
          : undefined,
      )
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
