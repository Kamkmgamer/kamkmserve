import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { carts, cartItems, orders, orderLineItems, services as servicesTable } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserRole } from "~/server/auth/roles";

async function getOrCreateCart(userId: string): Promise<typeof carts.$inferSelect> {
  const existing = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  if (existing[0]) return existing[0];
  const [created] = await db.insert(carts).values({ userId }).returning();
  return created!;
}

export async function POST() {
  try {
    const auth = await getCurrentUserRole();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const cart = await getOrCreateCart(auth.userId);

    const rows = await db
      .select({ ci: cartItems, s: servicesTable })
      .from(cartItems)
      .innerJoin(servicesTable, eq(servicesTable.id, cartItems.serviceId))
      .where(eq(cartItems.cartId, cart.id));

    if (!rows.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    // Build amounts in cents
    const lineItems = rows.map((r) => {
      const unitPriceCents = Math.round(Number(r.s.price) * 100);
      const quantity = r.ci.quantity;
      const totalPriceCents = unitPriceCents * quantity;
      return {
        serviceId: r.s.id,
        unitPrice: unitPriceCents,
        quantity,
        totalPrice: totalPriceCents,
      };
    });

    const totalAmount = lineItems.reduce((acc, li) => acc + li.totalPrice, 0);

    const [order] = await db
      .insert(orders)
      .values({
        userId: cart.userId,
        totalAmount,
        currency: "USD",
        requirements: "", // will be filled later by the user
      })
      .returning();

    if (!order?.id) return NextResponse.json({ error: "Failed to create order" }, { status: 500 });

    await db.insert(orderLineItems).values(
      lineItems.map((li) => ({
        orderId: order.id,
        serviceId: li.serviceId,
        unitPrice: li.unitPrice,
        quantity: li.quantity,
        totalPrice: li.totalPrice,
      })),
    );

    // Clear cart
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    return NextResponse.json({ data: { orderId: order.id, totalAmount } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to checkout" }, { status: 500 });
  }
}
