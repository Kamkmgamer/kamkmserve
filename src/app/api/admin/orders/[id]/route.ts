import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { coupons, orders, users, orderLineItems, services, referrals } from "~/server/db/schema";
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

export async function GET(_req: Request, context: RouteCtx) {
  try {
    const { id } = await context.params;

    const [orderRow] = await db
      .select({
        id: orders.id,
        userEmail: users.email,
        totalAmount: orders.totalAmount,
        status: orders.status,
        couponCode: coupons.code,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        requirements: orders.requirements,
        suggestions: orders.suggestions,
        preferences: orders.preferences,
        questions: orders.questions,
        currency: orders.currency,
        referralCode: referrals.code,
      })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.userId))
      .leftJoin(coupons, eq(coupons.id, orders.couponId))
      .leftJoin(referrals, eq(referrals.id, orders.referralId))
      .where(eq(orders.id, id))
      .limit(1);

    if (!orderRow) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const lineItems = await db
      .select({
        id: orderLineItems.id,
        serviceId: orderLineItems.serviceId,
        serviceName: services.name,
        unitPrice: orderLineItems.unitPrice,
        quantity: orderLineItems.quantity,
        totalPrice: orderLineItems.totalPrice,
      })
      .from(orderLineItems)
      .leftJoin(services, eq(services.id, orderLineItems.serviceId))
      .where(eq(orderLineItems.orderId, id));

    const data = {
      id: orderRow.id,
      userEmail: orderRow.userEmail ?? "—",
      totalAmount: orderRow.totalAmount,
      status: orderRow.status,
      couponCode: orderRow.couponCode ?? null,
      createdAt: orderRow.createdAt instanceof Date ? orderRow.createdAt.toISOString() : String(orderRow.createdAt),
      updatedAt: orderRow.updatedAt instanceof Date ? orderRow.updatedAt.toISOString() : String(orderRow.updatedAt),
      requirements: orderRow.requirements,
      suggestions: orderRow.suggestions ?? null,
      preferences: orderRow.preferences ?? null,
      questions: orderRow.questions ?? null,
      currency: orderRow.currency,
      referralCode: orderRow.referralCode ?? null,
      lineItems: lineItems.map((li) => ({
        id: li.id,
        serviceId: li.serviceId,
        serviceName: li.serviceName ?? "—",
        unitPrice: li.unitPrice,
        quantity: li.quantity,
        totalPrice: li.totalPrice,
      })),
    };

    return NextResponse.json({ data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
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
