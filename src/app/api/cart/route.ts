import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { carts, cartItems, services as servicesTable } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserRole } from "~/server/auth/roles";

async function getOrCreateCart(userId: string): Promise<typeof carts.$inferSelect> {
  const existing = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  if (existing[0]) return existing[0];
  const [created] = await db.insert(carts).values({ userId }).returning();
  return created!;
}

function formatCartResponse(rows: Array<{ ci: typeof cartItems.$inferSelect; s: typeof servicesTable.$inferSelect }>) {
  const items = rows.map((r) => {
    const price = Number(r.s.price);
    const subtotal = price * r.ci.quantity;
    return {
      id: r.ci.id,
      serviceId: r.s.id,
      name: r.s.name,
      price,
      quantity: r.ci.quantity,
      subtotal,
      thumbnailUrl: r.s.thumbnailUrl ?? null,
      imageUrls: r.s.imageUrls,
      category: r.s.category,
      description: r.s.description,
    };
  });
  const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
  const tax = 0; // No tax model yet; adjust when available
  const total = subtotal + tax;
  return { items, totals: { subtotal, tax, total } };
}

export async function GET() {
  try {
    const auth = await getCurrentUserRole();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const cart = await getOrCreateCart(auth.userId);

    const rows = await db
      .select({ ci: cartItems, s: servicesTable })
      .from(cartItems)
      .innerJoin(servicesTable, eq(servicesTable.id, cartItems.serviceId))
      .where(eq(cartItems.cartId, cart.id));

    return NextResponse.json({ data: formatCartResponse(rows) }, {
      headers: { "Cache-Control": "private, max-age=0, no-store" },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load cart" }, { status: 500 });
  }
}

// Optionally allow clearing cart via DELETE (not used by UI yet)
export async function DELETE() {
  try {
    const auth = await getCurrentUserRole();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const cart = await getOrCreateCart(auth.userId);
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
