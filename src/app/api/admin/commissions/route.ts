import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { commissions, referrals, orders } from "~/server/db/schema";
import { desc, eq, like, or } from "drizzle-orm";

const CreateSchema = z.object({
  orderId: z.string().min(1),
  referralId: z.string().min(1),
  amount: z.number().int().nonnegative(),
  status: z.enum(["UNPAID", "PENDING", "PAID", "FAILED"]).optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    const rows = await db
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
      .where(
        q ? or(like(referrals.code, `%${q}%`), like(commissions.orderId, `%${q}%`)) : undefined
      )
      .orderBy(desc(commissions.createdAt));

    const data = rows.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      referralId: r.referralId,
      referralCode: r.referralCode ?? "—",
      amount: r.amount,
      status: r.status,
      orderTotal: r.orderTotal ?? 0,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
    }));

    return NextResponse.json({ data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to list commissions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const [row] = await db
      .insert(commissions)
      .values({
        orderId: parsed.data.orderId,
        referralId: parsed.data.referralId,
        amount: parsed.data.amount,
        status: parsed.data.status ?? "UNPAID",
      })
      .returning({ id: commissions.id });

    if (!row?.id) return NextResponse.json({ error: "Failed to create commission" }, { status: 500 });

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

    if (!full) return NextResponse.json({ error: "Failed to load created commission" }, { status: 500 });

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

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create commission" }, { status: 500 });
  }
}
