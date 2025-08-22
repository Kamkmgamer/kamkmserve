import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { payouts, commissions } from '~/server/db/schema';

// This PATCH endpoint marks a payout as PAID and updates linked commissions as PAID as well.
export async function PATCH(request: Request, context: any): Promise<Response> {
  const { params } = context;
  try {
    // Mark the payout as PAID and update payoutDate to now
    const updatedPayouts = await db
      .update(payouts)
      .set({ status: 'PAID', payoutDate: new Date() })
      .where(eq(payouts.id, params.id));

    // Update linked commissions: assuming there is a payoutId field linking commissions and payouts
    const updatedCommissions = await db
      .update(commissions)
      .set({ status: 'PAID' })
      .where(eq(commissions.payoutId, params.id));

    // Retrieve the updated payout record
    const [updatedPayout] = await db
      .select()
      .from(payouts)
      .where(eq(payouts.id, params.id));

    if (!updatedPayout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    return NextResponse.json({ data: updatedPayout });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal error' }, { status: 500 });
  }
}
