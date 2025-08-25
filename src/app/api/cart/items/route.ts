import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { carts, cartItems, services as servicesTable } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
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
  const tax = 0;
  const total = subtotal + tax;
  return { items, totals: { subtotal, tax, total } };
}

const AddSchema = z.object({
  serviceId: z.string().min(1),
  quantity: z.number().int().min(1).max(999).default(1),
});

export async function POST(req: Request) {
  try {
    const auth = await getCurrentUserRole();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const body: unknown = await req.json();
    const parsed = AddSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const cart = await getOrCreateCart(auth.userId);

    // Ensure service exists
    const service = await db.select().from(servicesTable).where(eq(servicesTable.id, parsed.data.serviceId)).limit(1);
    if (!service[0]) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    // Check if item exists in cart
    const existing = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.serviceId, parsed.data.serviceId)))
      .limit(1);

    if (existing[0]) {
      await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + parsed.data.quantity })
        .where(eq(cartItems.id, existing[0].id));
    } else {
      await db
        .insert(cartItems)
        .values({ cartId: cart.id, serviceId: parsed.data.serviceId, quantity: parsed.data.quantity });
    }

    const rows = await db
      .select({ ci: cartItems, s: servicesTable })
      .from(cartItems)
      .innerJoin(servicesTable, eq(servicesTable.id, cartItems.serviceId))
      .where(eq(cartItems.cartId, cart.id));

    return NextResponse.json({ data: formatCartResponse(rows) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}
