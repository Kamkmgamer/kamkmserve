import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { payouts } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

// PATCH endpoint to update a payout
export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const body = await request.json();
    const { amount, status, payoutDate } = body;
    await db
      .update(payouts)
      .set({
        amount,
        status,
        payoutDate: payoutDate ? new Date(payoutDate) : undefined
      })
      .where(eq(payouts.id, params.id));

    const [updatedPayout] = await db.select().from(payouts).where(eq(payouts.id, params.id));
    if (!updatedPayout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }
    return NextResponse.json({ data: updatedPayout });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error updating payout' }, { status: 500 });
  }
}

// DELETE endpoint to remove a payout
export async function DELETE(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    await db.delete(payouts).where(eq(payouts.id, params.id));
    return NextResponse.json({ message: 'Payout deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error deleting payout' }, { status: 500 });
  }
}
