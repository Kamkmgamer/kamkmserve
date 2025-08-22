import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { payouts } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// PATCH endpoint to update a payout
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const { id } = await context.params;
    const PatchSchema = z.object({
      amount: z.number().optional(),
      status: z.enum(['PENDING','PAID','FAILED','UNPAID']).optional(),
      payoutDate: z.string().datetime().optional(),
    });
    const bodyUnknown: unknown = await request.json();
    const parsed = PatchSchema.safeParse(bodyUnknown);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { amount, status, payoutDate } = parsed.data;
    await db
      .update(payouts)
      .set({
        amount,
        status,
        payoutDate: payoutDate ? new Date(payoutDate) : undefined
      })
      .where(eq(payouts.id, id));

    const [updatedPayout] = await db.select().from(payouts).where(eq(payouts.id, id));
    if (!updatedPayout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }
    return NextResponse.json({ data: updatedPayout });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error updating payout' }, { status: 500 });
  }
}

// DELETE endpoint to remove a payout
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const { id } = await context.params;
    await db.delete(payouts).where(eq(payouts.id, id));
    return NextResponse.json({ message: 'Payout deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error deleting payout' }, { status: 500 });
  }
}
