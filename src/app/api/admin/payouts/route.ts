import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { payouts } from '~/server/db/schema';
import { desc } from 'drizzle-orm';

// GET: Return a list of payouts
export async function GET(request: Request) {
  try {
    const rows = await db.select().from(payouts).orderBy(desc(payouts.createdAt));
    return NextResponse.json({ data: rows });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error fetching payouts' }, { status: 500 });
  }
}

// POST: Create a new payout
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { referralId, amount, status, payoutDate } = body;
    // Insert a new payout; cast to any to bypass type issues with null values and unexpected property errors
    const [result] = await db.insert(payouts).values({
      referralId,
      amount,
      status,
      payoutDate: payoutDate ? new Date(payoutDate) : undefined
    } as any).returning();

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error creating payout' }, { status: 500 });
  }
}
